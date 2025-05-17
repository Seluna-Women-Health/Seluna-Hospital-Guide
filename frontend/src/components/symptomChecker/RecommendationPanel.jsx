import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

/**
 * Component for displaying symptom recommendations and actions
 */
const RecommendationPanel = ({ symptoms, onPrepareForClinic }) => {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        setLoading(true);
        const response = await axios.post('/api/symptoms/diagnosis', symptoms);
        console.log("Diagnosis API response:", response.data);
        setRecommendation(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch diagnosis recommendation:', err);
        setError('Unable to generate recommendation at this time');
      } finally {
        setLoading(false);
      }
    };

    if (symptoms && Object.keys(symptoms).length > 0) {
      console.log("Sending symptoms to API:", symptoms);
      fetchRecommendation();
    } else {
      console.log("No symptoms data to send to API");
      setLoading(false);
    }
  }, [symptoms]);

  // Helper function to get color based on recommendation level
  const getRecommendationColor = (level) => {
    switch (level) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'orange':
        return 'bg-orange-100 text-orange-800';
      case 'yellow':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Helper function to get emoji based on recommendation level
  const getRecommendationEmoji = (level) => {
    switch (level) {
      case 'red':
        return '🔴';
      case 'orange':
        return '🟠';
      case 'yellow':
      default:
        return '🟡';
    }
  };

  // Helper function to get confidence badge color
  const getConfidenceBadgeColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'bg-blue-100 text-blue-800';
      case 'moderate':
        return 'bg-purple-100 text-purple-800';
      case 'low':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-grow flex flex-col justify-between">
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-600">Analyzing your symptoms...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-yellow-100 rounded-lg mb-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🟡</span>
              <h3 className="font-medium text-lg">Monitor</h3>
            </div>
            <p className="text-gray-700">
              Watch your symptoms for 24-48 hours. If they worsen, consult a healthcare provider.
            </p>
            <p className="text-sm text-red-600 mt-2">{error}</p>
          </div>
        ) : recommendation ? (
          <>
            <div className={`p-4 ${getRecommendationColor(recommendation.recommendation_level)} rounded-lg mb-6`}>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">{getRecommendationEmoji(recommendation.recommendation_level)}</span>
                <h3 className="font-medium text-lg">
                  {recommendation.recommendation_level === 'red' ? 'Seek Care' : 
                   recommendation.recommendation_level === 'orange' ? 'Consult Soon' : 'Monitor'}
                </h3>
              </div>
              <p className="text-gray-700">
                {recommendation.recommendation_text}
              </p>
              {recommendation.urgent && (
                <p className="mt-2 font-bold text-red-600">
                  These symptoms may require urgent medical attention.
                </p>
              )}
            </div>

            {recommendation.potential_conditions && recommendation.potential_conditions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-3">Potential Conditions</h3>
                <div className="space-y-3">
                  {recommendation.potential_conditions.map((condition, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{condition.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceBadgeColor(condition.confidence)}`}>
                          {condition.confidence} match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{condition.description}</p>
                      <p className="text-sm text-gray-600 italic">
                        <span className="font-medium">Symptom match:</span> {condition.symptom_match}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendation.specialty && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-1">Recommended Specialty</h3>
                <p className="text-blue-700">{recommendation.specialty}</p>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 bg-yellow-100 rounded-lg mb-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🟡</span>
              <h3 className="font-medium text-lg">Monitor</h3>
            </div>
            <p className="text-gray-700">
              Watch your symptoms for 24-48 hours. If they worsen, consult a healthcare provider.
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <motion.button
          onClick={onPrepareForClinic}
          className={`w-full py-4 px-6 text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl
            ${recommendation && recommendation.urgent ? 
              'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700' : 
              'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'}`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ scale: 1 }}
          animate={{ 
            scale: recommendation && recommendation.urgent ? [1, 1.05, 1] : [1, 1.03, 1],
            transition: { 
              duration: recommendation && recommendation.urgent ? 1.5 : 2, 
              repeat: Infinity, 
              repeatType: "loop" 
            }
          }}
        >
          <div className="flex items-center justify-center">
            <span className="mr-2">🏥</span>
            {recommendation && recommendation.urgent ? 
              "Seek Medical Attention Now" : 
              "Prepare for a Clinic Visit"}
            <span className="ml-2">→</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default RecommendationPanel; 