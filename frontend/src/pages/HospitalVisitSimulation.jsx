import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const HospitalVisitSimulation = () => {
  const [step, setStep] = useState(1);
  const [allSteps, setAllSteps] = useState([]);
  const [loadedStepsContent, setLoadedStepsContent] = useState({});
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const symptomData = location.state?.symptomData || null;
  
  // Use a ref to track which steps are being loaded to prevent duplicate requests
  const loadingStepsRef = useRef(new Set());
  
  // Fetch basic step structure (without content) only once
  useEffect(() => {
    const fetchStepStructure = async () => {
      try {
        // Skip if we already have steps
        if (allSteps.length > 0) return;
        
        setInitialLoading(true);
        const response = await axios.get('/api/simulation/steps');
        setAllSteps(response.data);
        
        // Only load the first step content
        if (response.data.length > 0) {
          const firstStepId = response.data[0].id;
          await loadStepContent([firstStepId]);
        }
        
        setInitialLoading(false);
      } catch (err) {
        console.error("Failed to fetch simulation steps:", err);
        setError("Failed to load simulation structure. Please try again later.");
        setInitialLoading(false);
      }
    };
    
    fetchStepStructure();
  }, []); // Empty dependency array ensures this only runs once
  
  // Function to load content for specific steps
  const loadStepContent = useCallback(async (stepIds) => {
    try {
      // Filter out steps that are already loaded or currently loading
      const stepsToLoad = stepIds.filter(id => {
        // Skip if already loaded
        if (loadedStepsContent[id]) return false;
        
        // Skip if currently being loaded
        if (loadingStepsRef.current.has(id)) return false;
        
        // Mark as loading and include
        loadingStepsRef.current.add(id);
        return true;
      });
      
      // Skip if nothing to load
      if (stepsToLoad.length === 0) {
        return;
      }
      
      setLoading(true);
      console.log("Loading content for steps:", stepsToLoad);
      
      const response = await axios.post('/api/simulation/generate-batch', {
        step_ids: stepsToLoad,
        symptom_data: symptomData
      });
      
      // Update our loaded steps content
      const newLoadedContent = { ...loadedStepsContent };
      response.data.forEach(stepWithContent => {
        newLoadedContent[stepWithContent.id] = {
          dialogPairs: stepWithContent.dialog_pairs || [],
          tips: stepWithContent.tips || []
        };
        
        // Remove from loading set
        loadingStepsRef.current.delete(stepWithContent.id);
      });
      
      setLoadedStepsContent(newLoadedContent);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch step content:", err);
      setError("Failed to load content for the next step. Please try again.");
      setLoading(false);
      
      // Clear loading flags in case of error
      stepIds.forEach(id => loadingStepsRef.current.delete(id));
    }
  }, [loadedStepsContent, symptomData]);
  
  // Load content for current step if needed
  useEffect(() => {
    const loadCurrentStepIfNeeded = async () => {
      // Skip if no steps or still initializing
      if (allSteps.length === 0 || initialLoading) return;
      
      // Get the ID of the current step
      const currentStepId = allSteps[step - 1]?.id;
      if (!currentStepId) return;
      
      // Only load if not already loaded
      if (!loadedStepsContent[currentStepId] && !loadingStepsRef.current.has(currentStepId)) {
        await loadStepContent([currentStepId]);
      }
    };
    
    loadCurrentStepIfNeeded();
  }, [step, allSteps, loadedStepsContent, loadStepContent, initialLoading]);
  
  const totalSteps = allSteps.length;
  
  // Dialog navigation functions
  const nextDialog = () => {
    const currentStepContent = getCurrentStepContent();
    if (currentDialogIndex < currentStepContent.dialogPairs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1);
    }
  };
  
  const prevDialog = () => {
    if (currentDialogIndex > 0) {
      setCurrentDialogIndex(currentDialogIndex - 1);
    }
  };
  
  // Updated goToNextStep to only handle step transitions
  const goToNextStep = () => {
    const currentStepContent = getCurrentStepContent();
    if (step < totalSteps) {
      // Always move to the next step and reset dialog index
      setStep(step + 1);
      setCurrentDialogIndex(0);
    } else {
      navigate('/feedback');
    }
  };
  
  // Updated goToPrevStep to only handle step transitions
  const goToPrevStep = () => {
    if (step > 1) {
      // Move to the previous step and set dialog index to 0
      setStep(step - 1);
      setCurrentDialogIndex(0);
    } else {
      navigate('/summary');
    }
  };
  
  const getStepContent = (stepIndex) => {
    const stepId = allSteps[stepIndex]?.id;
    if (!stepId || !loadedStepsContent[stepId]) {
      return {
        dialogPairs: [{ doctor_dialog: "", user_guidance: "" }],
        tips: []
      };
    }
    return loadedStepsContent[stepId];
  };
  
  const getCurrentStepContent = () => {
    return getStepContent(step - 1);
  };
  
  const currentStepData = allSteps[step - 1] || { 
    title: "Loading...",
    description: "" 
  };
  
  const currentContent = {
    title: currentStepData.title,
    introduction: currentStepData.description,
    illustration: currentStepData.illustration || "default.svg",
    ...getCurrentStepContent()
  };
  
  const currentDialog = currentContent.dialogPairs[currentDialogIndex] || {
    doctor_dialog: "",
    user_guidance: ""
  };

  if (initialLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        <p className="mt-4 text-lg text-gray-700">Loading simulation...</p>
      </div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">{error}</div>;
  }

  return (
    <div className="px-4 py-8 page-transition">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Hospital Visit Simulation
      </motion.h1>
      
      {/* Progress bar and steps */}
      <motion.div 
        className="relative mb-8 max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <motion.div 
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index + 1 === step 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold' 
                  : index + 1 < step 
                    ? 'bg-purple-200 text-purple-700' 
                    : 'bg-gray-200 text-gray-400'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {index + 1}
            </motion.div>
          ))}
        </div>
        
        <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="text-right text-sm text-gray-500 mt-1">
          Step {step} of {totalSteps} • Dialog {currentDialogIndex + 1} of {currentContent.dialogPairs.length}
        </div>
      </motion.div>
      
      {/* Main content - with dialog navigation arrows */}
      {loading && step > 1 ? (
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p className="ml-3 text-purple-700">Loading next step...</p>
        </div>
      ) : (
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 mb-8 max-w-[1800px] mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 py-4 px-8">
            <h2 className="text-2xl font-semibold text-white">{currentContent.title}</h2>
          </div>
          
          <div className="p-8">
            <p className="text-lg text-gray-700 mb-8 max-w-4xl mx-auto">{currentContent.introduction}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">
              <div className="lg:col-span-6 relative h-[550px] bg-gradient-to-b from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100">
                {/* Add dialog navigation indicators and controls */}
                {currentContent.dialogPairs && currentContent.dialogPairs.length > 1 && (
                  <div className="absolute top-4 right-4 z-30 flex items-center bg-white px-3 py-1 rounded-full shadow-md">
                    <span className="text-sm text-gray-600 mr-2">
                      Dialog {currentDialogIndex + 1} of {currentContent.dialogPairs.length}
                    </span>
                  </div>
                )}
                
                {/* Left arrow navigation */}
                {currentContent.dialogPairs && currentContent.dialogPairs.length > 1 && currentDialogIndex > 0 && (
                  <motion.button
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center border border-gray-200 text-indigo-600 hover:bg-indigo-50"
                    onClick={prevDialog}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.button>
                )}
                
                {/* Right arrow navigation */}
                {currentContent.dialogPairs && currentContent.dialogPairs.length > 1 && 
                 currentDialogIndex < currentContent.dialogPairs.length - 1 && (
                  <motion.button
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center border border-gray-200 text-indigo-600 hover:bg-indigo-50"
                    onClick={nextDialog}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                )}

                <motion.div 
                  className="absolute left-6 top-12 z-10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="w-28 h-40 bg-white rounded-xl shadow-lg border-2 border-indigo-200 flex items-center justify-center overflow-hidden">
                    <div className="text-5xl">👩‍⚕️</div>
                  </div>
                  
                  <div className="bg-indigo-500 text-white text-center py-1 px-3 rounded-md mt-2 text-sm font-medium shadow-sm">
                    Dr. Sarah
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute left-36 right-36 top-12 z-20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  layout
                  key={`doctor-dialog-${step}`}
                >
                  <div className="bg-white p-5 rounded-xl shadow-md border-2 border-indigo-200 text-indigo-800 text-base relative">
                    {currentDialog.doctor_dialog}
                    <div className="absolute w-5 h-5 bg-white border-b-2 border-l-2 border-indigo-200 transform rotate-45 -left-3 top-6"></div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute right-6 top-[40%] z-10"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <div className="w-28 h-40 bg-white rounded-xl shadow-lg border-2 border-purple-200 flex items-center justify-center overflow-hidden">
                    <div className="text-5xl">👩</div>
                  </div>
                  
                  <div className="bg-purple-500 text-white text-center py-1 px-3 rounded-md mt-2 text-sm font-medium shadow-sm">
                    You
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute left-36 right-36 top-[40%] z-20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                  layout
                  key={`user-guidance-${step}`}
                >
                  <div className="bg-white p-5 rounded-xl shadow-md border-2 border-purple-200 text-purple-800 text-base relative">
                    <div className="font-medium text-sm text-purple-600 mb-2 uppercase tracking-wide">YOUR RESPONSE:</div>
                    {currentDialog.user_guidance}
                    <div className="absolute w-5 h-5 bg-white border-t-2 border-r-2 border-purple-200 transform rotate-45 -right-3 top-6"></div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute left-8 right-8 bottom-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  layout
                  key={`tips-${step}`}
                >
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-yellow-100 p-2 rounded-full mr-3 mt-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm uppercase tracking-wide text-yellow-800">Pro Tip</h3>
                        <ul className="text-yellow-700">
                          {currentContent.tips.map((tip, index) => (
                            <li key={index} className="mb-1">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="lg:col-span-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl overflow-hidden border border-indigo-100 h-[550px] flex items-center justify-center p-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="w-full h-full bg-white rounded-lg shadow-inner flex items-center justify-center overflow-hidden">
                  {currentStepData.image_url ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                      className="w-full h-full flex flex-col items-center justify-center"
                    >
                      <img 
                        src={currentStepData.image_url} 
                        alt={currentStepData.title}
                        className="max-w-full max-h-[80%] object-contain mb-4"
                      />
                      <p className="text-xl text-gray-500">Scene: {currentContent.title}</p>
                    </motion.div>
                  ) : currentStepData.video_url ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                      className="w-full h-full flex flex-col items-center justify-center"
                    >
                      <video 
                        src={currentStepData.video_url}
                        autoPlay
                        loop
                        muted
                        className="max-w-full max-h-[80%] object-contain mb-4"
                      />
                      <p className="text-xl text-gray-500">Scene: {currentContent.title}</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                      className="text-center"
                    >
                      <div className="text-8xl mb-6">🏥</div>
                      <p className="text-xl text-gray-500">Scene: {currentContent.title}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Update the navigation buttons to only navigate between steps */}
      <div className="flex justify-between max-w-5xl mx-auto">
        <motion.button 
          onClick={goToPrevStep}
          className={`py-3 px-6 rounded-lg flex items-center ${
            step === 1 
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
          }`}
          whileHover={step !== 1 ? { scale: 1.03 } : {}}
          whileTap={step !== 1 ? { scale: 0.98 } : {}}
          disabled={step === 1 || loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous Step
        </motion.button>
        
        <motion.button 
          onClick={goToNextStep}
          className={`py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-lg shadow-md flex items-center ${loading ? 'opacity-50 cursor-wait' : ''}`}
          whileHover={!loading ? { scale: 1.03 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          disabled={loading}
        >
          {step === totalSteps ? 'Finish' : 'Next Step'}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default HospitalVisitSimulation; 