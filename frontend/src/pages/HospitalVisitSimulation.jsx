import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../contexts/AppContext';

const HospitalVisitSimulation = () => {
  const { symptoms, visualization } = useAppContext();
  const [step, setStep] = useState(1);
  const [allSteps, setAllSteps] = useState([]);
  const [loadedStepsContent, setLoadedStepsContent] = useState({});
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const symptomData = {
    selectedSymptoms: symptoms.mainSymptoms || location.state?.symptomData?.selectedSymptoms || [],
    painLevel: visualization.intensity || location.state?.symptomData?.painLevel || null,
    painLocation: symptoms.painAreas || location.state?.symptomData?.painLocation || null,
    duration: symptoms.duration || location.state?.symptomData?.duration || null,
    additionalNotes: location.state?.symptomData?.additionalNotes || null
  };
  
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
  
  // First, let's add debugging to see what data we're receiving
  useEffect(() => {
    console.log("Using symptom data in hospital simulation:", symptomData);
  }, [symptomData]);
  
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
      
      // Format the symptom data properly for the backend
      const formattedSymptomData = {
        symptoms: symptomData.selectedSymptoms.map(symptom => 
          typeof symptom === 'string' ? { name: symptom } : symptom
        ),
        pain_level: symptomData.painLevel,
        pain_location: Array.isArray(symptomData.painLocation) 
          ? symptomData.painLocation.join(', ') 
          : symptomData.painLocation,
        duration: symptomData.duration,
        additional_notes: symptomData.additionalNotes
      };
      
      console.log("Sending symptom data to backend:", formattedSymptomData);
      
      const response = await axios.post('/api/simulation/generate-batch', {
        step_ids: stepsToLoad,
        symptom_data: formattedSymptomData
      });
      
      // Update our loaded steps content
      const newLoadedContent = { ...loadedStepsContent };
      response.data.forEach(stepWithContent => {
        // FIXED: Store the dialogue and tips without losing other properties from the step
        newLoadedContent[stepWithContent.id] = {
          dialogPairs: stepWithContent.dialog_pairs || [],
          tips: stepWithContent.tips || [],
          // Now also preserve video_url from the original step data
          videoUrl: stepWithContent.video_url,
          imageUrl: stepWithContent.image_url
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
  
  // First, let's add a function to handle direct navigation to a specific step
  const goToStep = (targetStep) => {
    // Check if the step is available and not already the current step
    if (targetStep !== step && targetStep <= allSteps.length && !loading) {
      setCurrentDialogIndex(0); // Reset dialog to beginning when changing steps
      setStep(targetStep);
      
      // Get the ID for the target step
      const targetStepData = allSteps[targetStep - 1];
      if (targetStepData && targetStepData.id) {
        // Load content for this step if needed
        loadStepContent([targetStepData.id]);
      }
    }
  };
  
  const getCurrentStepData = () => {
    if (allSteps.length === 0 || step <= 0 || step > allSteps.length) {
      return { title: "Loading...", description: "" };
    }
    return allSteps[step - 1];
  };
  
  const getCurrentStepContent = () => {
    const stepId = allSteps[step - 1]?.id;
    if (!stepId || !loadedStepsContent[stepId]) {
      return { dialogPairs: [], tips: [] };
    }
    return loadedStepsContent[stepId];
  };
  
  // Combine to get complete content
  const currentStepData = getCurrentStepData();
  const currentStepContent = getCurrentStepContent();
  
  // Create a merged content object
  const currentContent = {
    title: currentStepData.title || "Loading...",
    description: currentStepData.description || "",
    dialogPairs: currentStepContent.dialogPairs || [],
    tips: currentStepContent.tips || [],
    videoUrl: currentStepContent.videoUrl || currentStepData.video_url,
    imageUrl: currentStepContent.imageUrl || currentStepData.image_url
  };
  
  const currentDialog = currentContent.dialogPairs[currentDialogIndex] || {
    doctor_dialog: "",
    user_guidance: ""
  };

  // For debugging
  console.log("Current step data:", currentStepData);
  console.log("Current step content:", currentStepContent);
  console.log("Combined content:", currentContent);

  // Then, let's create a new component for the step progress indicators
  const StepIndicator = () => {
    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center text-purple-600 mb-6">Hospital Visit Simulation</h1>
        
        <div className="relative flex justify-between items-center max-w-4xl mx-auto">
          {/* Step indicators */}
          {allSteps.map((stepData, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === step;
            const isPast = stepNum < step;
            const isFuture = stepNum > step;
            const isAvailable = !isFuture || stepNum <= step + 1; // Allow current and next step
            
            return (
              <button
                key={stepData.id}
                onClick={() => isAvailable ? goToStep(stepNum) : null}
                disabled={!isAvailable || loading}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all
                  ${isActive ? 'bg-purple-500 text-white font-bold transform scale-110' : ''}
                  ${isPast ? 'bg-purple-200 text-purple-700 hover:bg-purple-300' : ''}
                  ${isFuture && isAvailable ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : ''}
                  ${isFuture && !isAvailable ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}
                  ${isAvailable && !isActive ? 'hover:scale-105' : ''}
                `}
                aria-label={`Step ${stepNum}: ${stepData.title}`}
                title={stepData.title}
              >
                {stepNum}
              </button>
            );
          })}
          
          {/* Progress bar */}
          <div className="absolute h-2 bg-gray-200 left-0 right-0 top-1/2 transform -translate-y-1/2 -z-0"></div>
          <div 
            className="absolute h-2 bg-purple-500 left-0 top-1/2 transform -translate-y-1/2 -z-0 transition-all duration-300" 
            style={{ width: `${((step - 1) / (allSteps.length - 1)) * 100}%` }}
          ></div>
        </div>
        
        {/* Step and dialog counter */}
        <div className="text-right mt-2 text-sm text-gray-600">
          Step {step} of {allSteps.length} • Dialog {currentDialogIndex + 1} of {
            loadedStepsContent[allSteps[step - 1]?.id]?.dialogPairs?.length || 0
          }
        </div>
      </div>
    );
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
    <div className="container mx-auto px-4 py-8">
      {/* Error message if needed */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Loading message */}
      {initialLoading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-lg text-gray-600">Loading simulation...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Step Indicator Component */}
          <StepIndicator />
          
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
                <p className="text-lg text-gray-700 mb-8 max-w-4xl mx-auto">{currentContent.description}</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                  {/* Chat section - 4 columns */}
                  <div className="lg:col-span-4 flex flex-col">
                    <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
                      {/* Chat container */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {/* Doctor message */}
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-lg">
                              👩‍⚕️
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-indigo-100 max-w-[85%]">
                            <div className="text-sm font-medium text-indigo-600 mb-2 text-base md:text-lg">Dr. Sarah</div>
                            <p className="text-gray-800">{currentDialog.doctor_dialog}</p>
                          </div>
                        </div>
                        
                        {/* User response */}
                        <div className="flex items-start flex-row-reverse">
                          <div className="flex-shrink-0 ml-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg">
                              👩
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3 shadow-sm border border-purple-100 max-w-[85%]">
                            <div className="text-sm font-medium text-purple-600 mb-2 text-base md:text-lg">Your Response Instructions</div>
                            <p className="text-gray-800">{currentDialog.user_guidance}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Pro tip section */}
                      <div className="mt-auto">
                        <div className="p-3 bg-yellow-50 border-t border-yellow-200">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-2 mt-1">
                              <div className="bg-yellow-100 p-1 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                            <div className="text-left w-full">
                              <h3 className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Pro Tip</h3>
                              <ul className="text-sm text-yellow-700 space-y-1 mt-1 list-none pl-0">
                                {currentContent.tips.map((tip, index) => (
                                  <li key={index} className="text-left flex items-start">
                                    <span className="text-amber-600 mr-2 mt-1 flex-shrink-0">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        {/* Dialog Navigation */}
                        <div className="bg-indigo-50 p-3 border-t border-indigo-200 flex justify-between items-center">
                          <button 
                            onClick={prevDialog}
                            disabled={currentDialogIndex === 0}
                            className={`flex items-center py-2 px-3 rounded-md ${
                              currentDialogIndex === 0 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Previous
                          </button>
                          
                          <div className="text-sm font-medium text-indigo-700 bg-indigo-100 py-1 px-3 rounded-full">
                            Dialog {currentDialogIndex + 1} of {currentContent.dialogPairs.length}
                          </div>
                          
                          <button 
                            onClick={nextDialog}
                            disabled={currentDialogIndex >= currentContent.dialogPairs.length - 1}
                            className={`flex items-center py-2 px-3 rounded-md ${
                              currentDialogIndex >= currentContent.dialogPairs.length - 1 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            }`}
                          >
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image/Video section - now 6 columns instead of 4 */}
                  <motion.div 
                    className="lg:col-span-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl overflow-hidden border border-indigo-100 h-[600px] flex items-center justify-center p-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <div className="w-full h-full bg-white rounded-lg shadow-inner flex items-center justify-center overflow-hidden">
                      {currentContent.imageUrl ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1 }}
                          className="w-full h-full flex flex-col items-center justify-center"
                        >
                          <img 
                            src={currentContent.imageUrl} 
                            alt={currentStepData.title}
                            className="max-w-full max-h-[85%] object-contain mb-4"
                          />
                          <p className="text-xl text-gray-500">Scene: {currentStepData.title}</p>
                        </motion.div>
                      ) : currentContent.videoUrl ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1 }}
                          className="w-full h-full flex flex-col items-center justify-center"
                        >
                          <video 
                            src={currentContent.videoUrl}
                            autoPlay
                            loop
                            muted
                            controls
                            onError={(e) => console.error("Video error:", e)}
                            className="max-w-full max-h-[85%] object-contain mb-4"
                          />
                          <p className="text-xl text-gray-500">Scene: {currentStepData.title}</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1 }}
                          className="text-center"
                        >
                          <div className="text-8xl mb-6">🏥</div>
                          <p className="text-xl text-gray-500">Scene: {currentStepData.title}</p>
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
        </motion.div>
      )}
    </div>
  );
};

export default HospitalVisitSimulation; 