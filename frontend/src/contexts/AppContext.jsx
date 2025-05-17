import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // State for language
  const [language, setLanguage] = useState('en');
  
  // State for symptom data
  const [symptoms, setSymptoms] = useState({
    painAreas: [],
    mainSymptoms: [],
    additionalSymptoms: [],
    emotionalState: null,
    emotionalScale: 0,
    completenessScore: 0
  });
  
  // State for visualization
  const [visualization, setVisualization] = useState({
    painDetails: [],
    intensity: 0,
    emotion: '😐'
  });
  
  // State for session
  const [session, setSession] = useState({
    isLoggedIn: false,
    userId: null
  });

  // Update symptoms data
  const updateSymptoms = (newSymptoms) => {
    setSymptoms({
      ...symptoms,
      ...newSymptoms
    });
  };
  
  // Update visualization data
  const updateVisualization = (newVisualization) => {
    setVisualization({
      ...visualization,
      ...newVisualization
    });
  };

  const value = {
    language,
    setLanguage,
    symptoms,
    setSymptoms,
    visualization,
    setVisualization,
    session,
    setSession,
    updateSymptoms,
    updateVisualization
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext); 