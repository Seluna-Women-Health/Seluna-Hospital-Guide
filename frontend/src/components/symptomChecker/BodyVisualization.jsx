import React from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';

const BodyVisualization = () => {
  const { visualization, setVisualization } = useAppContext();

  const handleBodyPartClick = (bodyPart) => {
    // Handle body part selection logic
    const updatedAreas = visualization.activeAreas.includes(bodyPart)
      ? visualization.activeAreas.filter(area => area !== bodyPart)
      : [...visualization.activeAreas, bodyPart];
    
    setVisualization({
      ...visualization,
      activeAreas: updatedAreas
    });
  };

  const handleIntensityChange = (value) => {
    // Handle intensity change
    setVisualization({
      ...visualization,
      intensity: parseInt(value, 10)
    });
  };

  const handleEmotionSelect = (emotion) => {
    // Handle emotion selection
    setVisualization({
      ...visualization,
      emotion
    });
  };

  return (
    <div className="space-y-8">
      <motion.div 
        className="body-svg-container mb-6 rounded-xl overflow-hidden bg-gray-100 h-64 flex items-center justify-center border border-gray-200"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {/* This will contain the SVG of female body */}
        <motion.div 
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          className="text-gray-500 text-lg"
        >
          Female Body SVG will go here
        </motion.div>
      </motion.div>
      
      <div className="mb-6">
        <label className="block mb-3 font-medium text-gray-700">Pain Intensity</label>
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="10"
            value={visualization.intensity}
            onChange={(e) => handleIntensityChange(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <div className="flex justify-between text-sm mt-2 text-gray-600">
            <span>0 (None)</span>
            <span>5 (Moderate)</span>
            <span>10 (Severe)</span>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block mb-3 font-medium text-gray-700">How are you feeling?</label>
        <div className="flex justify-between">
          {['😢', '😣', '😐', '🙂', '😊'].map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleEmotionSelect(emoji)}
              className={`p-3 text-3xl ${
                visualization.emotion === emoji 
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 rounded-full ring-2 ring-purple-300 transform scale-110' 
                  : 'hover:bg-gray-100 rounded-full'
              }`}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BodyVisualization; 