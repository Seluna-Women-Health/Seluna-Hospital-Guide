import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HospitalVisitSimulation = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 10;
  const navigate = useNavigate();
  
  const goToNextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      navigate('/feedback');
    }
  };
  
  const goToPrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/summary');
    }
  };

  const stepContent = [
    {
      title: "Arriving at the Clinic",
      introduction: "What to expect when you first arrive at the women's health clinic.",
      doctorDialog: "Hello, I'm Dr. Sarah. Welcome to our women's health clinic. Have you brought your ID and insurance card with you today?",
      userGuidance: "Be prepared to hand over your ID and insurance card. Let the doctor know if this is your first visit or if you've been here before.",
      illustration: "arrival.svg",
      tips: "Remember to bring your ID, insurance card, and a list of any medications you're taking."
    },
    {
      title: "Check-in Process",
      introduction: "How to complete the check-in process at the front desk.",
      doctorDialog: "Could you please fill out these intake forms? We'll need information about your medical history and the symptoms you're experiencing today.",
      userGuidance: "Take your time with the forms and answer all questions honestly. If you're unsure about anything, it's okay to ask the staff for clarification.",
      illustration: "checkin.svg",
      tips: "Be thorough when filling out symptom descriptions, as this helps the doctor provide better care."
    },
    // Add additional steps as needed
  ];

  const currentContent = stepContent[step - 1] || stepContent[0];

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
          Step {step} of {totalSteps}
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 mb-8 max-w-[1800px] mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        key={step}
      >
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 py-4 px-8">
          <h2 className="text-2xl font-semibold text-white">{currentContent.title}</h2>
        </div>
        
        <div className="p-8">
          <p className="text-lg text-gray-700 mb-8 max-w-4xl mx-auto">{currentContent.introduction}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">
            <div className="lg:col-span-6 relative h-[550px] bg-gradient-to-b from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100">
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
              >
                <div className="bg-white p-5 rounded-xl shadow-md border-2 border-indigo-200 text-indigo-800 text-base relative">
                  {currentContent.doctorDialog}
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
              >
                <div className="bg-white p-5 rounded-xl shadow-md border-2 border-purple-200 text-purple-800 text-base relative">
                  <div className="font-medium text-sm text-purple-600 mb-2 uppercase tracking-wide">Your Response:</div>
                  {currentContent.userGuidance}
                  <div className="absolute w-5 h-5 bg-white border-t-2 border-r-2 border-purple-200 transform rotate-45 -right-3 top-6"></div>
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute left-8 right-8 bottom-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
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
                      <p className="text-yellow-700">{currentContent.tips}</p>
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="text-center"
                >
                  <div className="text-8xl mb-6">🏥</div>
                  <p className="text-xl text-gray-500">Scene: {currentContent.title}</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
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
          disabled={step === 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous
        </motion.button>
        
        <motion.button 
          onClick={goToNextStep}
          className="py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-lg shadow-md flex items-center"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          {step === totalSteps ? 'Finish' : 'Next'}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default HospitalVisitSimulation; 