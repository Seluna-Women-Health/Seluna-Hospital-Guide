import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';

const SymptomSummary = () => {
  const { symptoms, visualization } = useAppContext();
  const navigate = useNavigate();

  const handlePrepareForClinic = () => {
    navigate('/hospital-simulation');
  };

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Symptom Summary
      </motion.h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Symptoms */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 lg:col-span-1"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 py-4 px-6">
            <h2 className="text-xl font-semibold text-white">Your Symptoms</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Pain Areas</h3>
              {symptoms.painAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {symptoms.painAreas.map((area, index) => (
                    <motion.span 
                      key={index} 
                      className="px-3 py-1 bg-purple-100 rounded-full"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {area}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No pain areas selected</p>
              )}
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Pain Type</h3>
              {symptoms.painType.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {symptoms.painType.map((type, index) => (
                    <motion.span 
                      key={index} 
                      className="px-3 py-1 bg-pink-100 rounded-full"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {type}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No pain types selected</p>
              )}
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Additional Symptoms</h3>
              {symptoms.additionalSymptoms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {symptoms.additionalSymptoms.map((symptom, index) => (
                    <motion.span 
                      key={index} 
                      className="px-3 py-1 bg-blue-100 rounded-full"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {symptom}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No additional symptoms selected</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Middle Column - Body Visualization */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 py-4 px-6">
            <h2 className="text-xl font-semibold text-white">Pain Visualization</h2>
          </div>
          
          <div className="p-6">
            <div className="rounded-xl overflow-hidden bg-gray-100 h-48 md:h-64 flex items-center justify-center border border-gray-200 mb-4">
              {/* Placeholder for body visualization */}
              <p className="text-gray-500">Body visualization from previous page</p>
            </div>
            
            <div className="flex flex-wrap justify-between items-center mt-4">
              <div className="mb-4 md:mb-0">
                <h3 className="font-medium text-gray-700 mb-2">Pain Intensity</h3>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div 
                      className="bg-pink-500 h-2.5 rounded-full" 
                      style={{ width: `${(visualization.intensity / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{visualization.intensity}/10</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Feeling</h3>
                <div className="text-3xl">{visualization.emotion || '😐'}</div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Right Column - Recommendation */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 py-4 px-6">
            <h2 className="text-xl font-semibold text-white">Recommendation</h2>
          </div>
          
          <div className="p-6">
            <div className="p-4 bg-yellow-100 rounded-lg mb-6">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🟡</span>
                <h3 className="font-medium text-lg">Monitor</h3>
              </div>
              <p className="text-gray-700">Watch your symptoms for 24-48 hours. If they worsen, consult a healthcare provider.</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <motion.button 
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Download Report
              </motion.button>
              
              <Link to="/details" className="block w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-center rounded-lg font-medium transition-colors duration-200">
                Add More Details
              </Link>
            </div>
            
            {/* Make this button more prominent */}
            <motion.button
              onClick={handlePrepareForClinic}
              className="w-full mt-8 py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.03, 1],
                transition: { duration: 2, repeat: Infinity, repeatType: "loop" }
              }}
            >
              <div className="flex items-center justify-center">
                <span className="mr-2">🏥</span>
                Prepare for a Clinic Visit
                <span className="ml-2">→</span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SymptomSummary; 