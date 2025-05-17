import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const SymptomSummary = ({ 
  symptoms = { 
    pain_areas: [], 
    main_symptoms: [], 
    additional_symptoms: [], 
    emotional_state: null, 
    emotional_scale: 0, 
    completeness_score: 0 
  },
  hideCompleteness = false // New prop with default value of false
}) => {
  // For debugging - log the symptoms data to console when it changes
  useEffect(() => {
    console.log("SymptomSummary received data:", symptoms);
  }, [symptoms]);

  // Helper function to capitalize first letter
  const capitalize = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.replace(/_/g, ' ').slice(1);
  };

  // Get color for emotional scale
  const getEmotionalColor = (scale) => {
    if (!scale && scale !== 0) return '#9CA3AF'; // Gray default
    
    // Color gradient from green (calm) to red (distressed)
    if (scale <= 3) return '#10B981'; // Green for calm/low
    if (scale <= 5) return '#FBBF24'; // Yellow for moderate
    if (scale <= 7) return '#F59E0B'; // Orange for higher
    return '#EF4444'; // Red for high distress
  };

  // Get emoji based on emotional scale
  const getEmotionalEmoji = (state, scale) => {
    // Default emoji based on scale
    if (scale <= 2) return "😌"; // Very calm
    if (scale <= 4) return "🙂"; // Somewhat calm
    if (scale <= 6) return "😐"; // Neutral/moderate
    if (scale <= 8) return "😟"; // Concerned
    if (scale > 8) return "😰"; // Very distressed

    // Special cases based on specific emotional states
    const emotionEmojiMap = {
      'anxious': '😰',
      'nervous': '😥',
      'worried': '😟',
      'scared': '😨',
      'calm': '😌',
      'relaxed': '😊',
      'stressed': '😓',
      'depressed': '😔',
      'sad': '😢',
      'angry': '😠',
      'frustrated': '😤',
      'happy': '😄',
      'optimistic': '🙂'
    };
    
    // If we have a specific emoji for this state, use it
    if (state && emotionEmojiMap[state.toLowerCase()]) {
      return emotionEmojiMap[state.toLowerCase()];
    }
    
    // Otherwise fall back to the scale-based emoji (default return above)
    return "😐";
  };
  
  // Consistent section title style for all subsections
  const SectionTitle = ({ children }) => (
    <h3 className="text-base font-semibold text-purple-600 mb-3 border-l-4 border-purple-400 pl-2">
      {children}
    </h3>
  );
  
  // Symptom pill/badge component for consistency
  const SymptomBadge = ({ symptom }) => (
    <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm shadow-sm">
      {capitalize(symptom)}
    </span>
  );
  
  return (
    <div className="symptom-summary">
      <div className="mb-5">
        <SectionTitle>Reported Pain</SectionTitle>
        {symptoms.pain_areas.length > 0 ? (
          <div className="space-y-2">
            {symptoms.pain_areas.map((pain, index) => (
              <div key={index} className="bg-purple-50 rounded-lg p-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{capitalize(pain.area)}</span>
                  <span 
                    className="text-sm px-2 py-1 rounded-full" 
                    style={{ 
                      backgroundColor: `${getColorByIntensity(pain.intensity || 5)}30`,
                      color: getColorByIntensity(pain.intensity || 5)
                    }}
                  >
                    Level {pain.intensity || '?'}/10
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {pain.description && <span className="mr-2">{capitalize(pain.description)}</span>}
                  {pain.frequency && <span>• {capitalize(pain.frequency)}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No pain areas reported yet</p>
        )}
      </div>
      
      <div className="mb-5">
        <SectionTitle>Main Symptoms</SectionTitle>
        {symptoms.main_symptoms && symptoms.main_symptoms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {symptoms.main_symptoms.map((symptom, index) => (
              <SymptomBadge key={index} symptom={symptom} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No main symptoms reported yet</p>
        )}
      </div>
      
      <div className="mb-5">
        <SectionTitle>Other Symptoms</SectionTitle>
        {symptoms.additional_symptoms && symptoms.additional_symptoms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {symptoms.additional_symptoms.map((symptom, index) => (
              <SymptomBadge key={index} symptom={symptom} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No additional symptoms reported</p>
        )}
      </div>
      
      {(symptoms.emotional_state || symptoms.emotional_scale > 0) ? (
        <div className="mb-5">
          <SectionTitle>Emotional State</SectionTitle>
          <div className="bg-purple-50 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: getEmotionalColor(symptoms.emotional_scale) }}
                ></div>
                <span className="font-medium">{capitalize(symptoms.emotional_state || 'Unknown')}</span>
              </div>
              {symptoms.emotional_scale !== undefined && (
                <span className="text-sm px-2 py-1 rounded-full bg-white bg-opacity-50">
                  Level {symptoms.emotional_scale}/10
                </span>
              )}
            </div>
            
            {symptoms.emotional_scale !== undefined && (
              <div className="mt-3 flex items-center">
                <div className="text-2xl mr-2">
                  {getEmotionalEmoji(symptoms.emotional_state, symptoms.emotional_scale)}
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2 flex-grow">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-red-500 h-2 rounded-full" 
                    style={{ width: `${(symptoms.emotional_scale/10) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-5">
          <SectionTitle>Emotional State</SectionTitle>
          <p className="text-gray-500 italic">No emotional state reported yet</p>
        </div>
      )}
      
      {/* Only render the completeness score if hideCompleteness is false */}
      {!hideCompleteness && symptoms.completeness_score > 0 && (
        <div className="mt-6 pt-4 border-t border-purple-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-600">Assessment completeness</span>
            <span className="text-sm font-medium">{symptoms.completeness_score || 0}%</span>
          </div>
          <div className="w-full bg-purple-100 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
              style={{ width: `${symptoms.completeness_score || 0}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for pain intensity colors (copied from PainVisualizer for consistency)
const getColorByIntensity = (intensity) => {
  const colors = [
    '#FFEA00', // 1
    '#FFE100',
    '#FFD800',
    '#FFCE00',
    '#FFC500', 
    '#FFB200', // 6
    '#FF9900', 
    '#FF7F00',
    '#FF6600', 
    '#FF0000'  // 10
  ];
  
  const index = Math.min(Math.max(Math.floor(intensity) - 1, 0), 9);
  return colors[index];
};

export default SymptomSummary; 