import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // State for language
  const [language, setLanguage] = useState('en');
  
  // State for symptom data
  const [symptoms, setSymptoms] = useState({
    painAreas: [],
    painIntensity: 0,
    painType: [],
    additionalSymptoms: [],
    emotionalSymptoms: []
  });
  
  // State for visualization
  const [visualization, setVisualization] = useState({
    activeAreas: [],
    intensity: 0,
    emotion: null
  });
  
  // State for session
  const [session, setSession] = useState({
    isLoggedIn: false,
    userId: null
  });

  const value = {
    language,
    setLanguage,
    symptoms,
    setSymptoms,
    visualization,
    setVisualization,
    session,
    setSession
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 