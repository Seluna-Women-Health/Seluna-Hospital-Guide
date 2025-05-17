import React from 'react';
import { motion } from 'framer-motion';

const PainVisualizer = ({ painAreas = [] }) => {
  // Map backend body areas to SVG part IDs
  const bodyPartMapping = {
    'head': 'head',
    'neck': 'neck',
    'chest': 'chest',
    'abdomen': 'abdomen',
    'pelvis': 'pelvis',
    'left_arm': 'leftArm',
    'right_arm': 'rightArm',
    'left_shoulder': 'leftShoulder',
    'right_shoulder': 'rightShoulder',
    'left_leg': 'leftLeg',
    'right_leg': 'rightLeg',
    'back': 'back',
    'spine': 'back'
  };
  
  // Get color based on pain intensity (1-10)
  const getColorByIntensity = (intensity) => {
    // Color scale from yellow (low) to red (high)
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
  
  // Get animation parameters based on frequency and description
  const getAnimationParams = (frequency, description) => {
    // Frequency mapping to animation speed
    const frequencyMap = {
      'rare': 6,
      'sometimes': 4,
      'often': 3,
      'constant': 1.5
    };
    
    // Description mapping to animation type
    const descriptionVariants = {
      'sharp': {
        scale: [1, 1.4, 1],
        opacity: [0.7, 1, 0.7]
      },
      'dull': {
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5]
      },
      'throbbing': {
        scale: [1, 1.3, 1, 1.2, 1],
        opacity: [0.6, 0.9, 0.7, 0.8, 0.6]
      },
      'burning': {
        scale: [1, 1.15, 1.05, 1.15, 1],
        opacity: [0.7, 0.9, 0.8, 0.9, 0.7]
      },
      'stabbing': {
        scale: [1, 1.5, 1],
        opacity: [0.6, 1, 0.6]
      }
    };
    
    // Default values
    const duration = frequency ? frequencyMap[frequency] || 3 : 3;
    const variant = description ? descriptionVariants[description] || descriptionVariants.dull : descriptionVariants.dull;
    
    return {
      duration,
      variant
    };
  };

  return (
    <div className="pain-visualizer">
      <svg
        viewBox="0 0 200 400"
        xmlns="http://www.w3.org/2000/svg"
        className="body-svg"
        style={{ width: '100%', height: '100%', maxHeight: '500px' }}
      >
        {/* Base body outline */}
        <g className="body-outline" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1">
          <circle id="head" cx="100" cy="40" r="30" />
          <rect id="neck" x="90" y="70" width="20" height="15" />
          <rect id="chest" x="75" y="85" width="50" height="40" rx="5" />
          <rect id="abdomen" x="75" y="125" width="50" height="35" rx="5" />
          <rect id="pelvis" x="75" y="160" width="50" height="30" rx="8" />
          
          <path id="leftArm" d="M75,95 Q55,120 45,160" strokeWidth="16" stroke="#E5E7EB" fill="none" />
          <path id="rightArm" d="M125,95 Q145,120 155,160" strokeWidth="16" stroke="#E5E7EB" fill="none" />
          
          <circle id="leftShoulder" cx="75" cy="95" r="8" />
          <circle id="rightShoulder" cx="125" cy="95" r="8" />
          
          <path id="leftLeg" d="M85,190 Q80,260 75,350" strokeWidth="18" stroke="#E5E7EB" fill="none" />
          <path id="rightLeg" d="M115,190 Q120,260 125,350" strokeWidth="18" stroke="#E5E7EB" fill="none" />
          
          <rect id="back" x="65" y="85" width="70" height="105" rx="5" fill="none" stroke="none" />
        </g>
        
        {/* Pain area indicators */}
        {painAreas.map((pain, index) => {
          const bodyPartId = bodyPartMapping[pain.area] || 'chest';
          const color = getColorByIntensity(pain.intensity || 5);
          const { duration, variant } = getAnimationParams(pain.frequency, pain.description);
          
          // Get position for pain indicator
          let x, y;
          switch(bodyPartId) {
            case 'head': x = 100; y = 40; break;
            case 'neck': x = 100; y = 77; break;
            case 'chest': x = 100; y = 105; break;
            case 'abdomen': x = 100; y = 142; break;
            case 'pelvis': x = 100; y = 175; break;
            case 'leftArm': x = 55; y = 130; break;
            case 'rightArm': x = 145; y = 130; break;
            case 'leftShoulder': x = 75; y = 95; break;
            case 'rightShoulder': x = 125; y = 95; break;
            case 'leftLeg': x = 80; y = 260; break;
            case 'rightLeg': x = 120; y = 260; break;
            case 'back': x = 100; y = 130; break;
            default: x = 100; y = 120;
          }
          
          return (
            <motion.circle
              key={`pain-${index}`}
              cx={x}
              cy={y}
              r={20}
              fill={color}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{
                ...variant,
              }}
              transition={{
                duration,
                repeat: Infinity,
                ease: pain.description === 'sharp' || pain.description === 'stabbing' 
                  ? "easeInOut" 
                  : "easeInOut"
              }}
              style={{ filter: 'blur(5px)' }}
            />
          );
        })}
      </svg>
      
      {/* Legend for pain intensity */}
      <div className="pain-legend mt-4 flex items-center justify-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#FFEA00' }}></div>
            <span className="text-xs">Mild</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#FFC500' }}></div>
            <span className="text-xs">Moderate</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#FF7F00' }}></div>
            <span className="text-xs">Severe</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#FF0000' }}></div>
            <span className="text-xs">Extreme</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainVisualizer; 