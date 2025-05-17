import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';
// Import the components
import SymptomSummary from '../components/symptomChecker/SymptomSummary';
import PainVisualizer from '../components/symptomChecker/PainVisualizer';
import RecommendationPanel from '../components/symptomChecker/RecommendationPanel';

const SymptomSummaryPage = () => {
  const { symptoms, visualization } = useAppContext();
  const navigate = useNavigate();

  // Add debug logging
  useEffect(() => {
    console.log("Diagnosis page loaded");
    console.log("Symptoms from context:", symptoms);
    console.log("Visualization from context:", visualization);
  }, [symptoms, visualization]);

  // Convert symptoms data from AppContext to format expected by the components
  const formattedSymptoms = {
    pain_areas: symptoms.painAreas?.map(area => {
      // Find the matching pain area in visualization if available
      const painDetail = visualization.painDetails?.find(p => p.area === area);
      return {
        area: area,
        intensity: painDetail?.intensity || 5,
        frequency: painDetail?.frequency || 'sometimes',
        description: painDetail?.description || 'dull'
      };
    }) || [],
    main_symptoms: symptoms.mainSymptoms || [],
    additional_symptoms: symptoms.additionalSymptoms || [],
    emotional_state: symptoms.emotionalState || null,
    emotional_scale: symptoms.emotionalScale || 0,
    completeness_score: symptoms.completenessScore || 0
  };

  const handlePrepareForClinic = () => {
    navigate('/hospital-simulation');
  };

  // Add defense against empty data
  if (!symptoms || !visualization) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-700">No symptom data available</h1>
        <p className="mb-6 text-gray-600">Please go back and enter your symptoms first.</p>
        <button 
          onClick={() => navigate('/voice-symptom-checker')}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
        >
          Go to Symptom Checker
        </button>
      </div>
    );
  }

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
        {/* Left Column - Symptoms - Extended height */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 lg:col-span-1 min-h-[800px]"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 py-4 px-6">
            <h2 className="text-xl font-semibold text-white">Your Symptoms</h2>
          </div>
          
          <div className="p-6 h-full">
            <SymptomSummary 
              symptoms={formattedSymptoms} 
              hideCompleteness={true}
            />
          </div>
        </motion.div>

        {/* Middle Column - Body Visualization - Extended height */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 min-h-[800px] flex flex-col"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 py-4 px-6">
            <h2 className="text-xl font-semibold text-white">Pain Visualization</h2>
          </div>
          
          <div className="p-6 flex-grow flex flex-col justify-between">
            <div className="rounded-xl overflow-hidden bg-gray-100 flex-1 min-h-0 flex items-center justify-center border border-gray-200 mb-4">
              <PainVisualizer painAreas={formattedSymptoms.pain_areas} />
            </div>
            
            <div className="mt-auto">
              <div className="flex flex-wrap justify-between items-center mt-4 mb-2">
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
          </div>
        </motion.div>
        
        {/* Right Column - Recommendation - Now using the separated component */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 min-h-[800px] flex flex-col"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 py-4 px-6">
            <h2 className="text-xl font-semibold text-white">Recommendation</h2>
          </div>
          
          <div className="p-6">
            <RecommendationPanel 
              symptoms={formattedSymptoms}
              onPrepareForClinic={handlePrepareForClinic} 
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SymptomSummaryPage; 