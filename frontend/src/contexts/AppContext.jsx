import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // State for language
  const [language, setLanguage] = useState('en');
  
  // State for symptom data
  const [symptoms, setSymptoms] = useState(() => {
    const savedSymptoms = localStorage.getItem('appSymptoms');
    return savedSymptoms ? JSON.parse(savedSymptoms) : {
      painAreas: [],
      mainSymptoms: [],
      additionalSymptoms: [],
      emotionalState: null,
      emotionalScale: 0,
      completenessScore: 0
    };
  });
  
  // State for visualization
  const [visualization, setVisualization] = useState(() => {
    const savedVisualization = localStorage.getItem('appVisualization');
    return savedVisualization ? JSON.parse(savedVisualization) : {
      painDetails: [],
      intensity: 0,
      emotion: '😐'
    };
  });
  
  // State for session
  const [session, setSession] = useState({
    isLoggedIn: false,
    userId: null
  });

  const [diagnosis, setDiagnosis] = useState(() => {
    const savedDiagnosis = localStorage.getItem('appDiagnosis');
    return savedDiagnosis ? JSON.parse(savedDiagnosis) : null;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('appSymptoms', JSON.stringify(symptoms));
  }, [symptoms]);
  
  useEffect(() => {
    localStorage.setItem('appVisualization', JSON.stringify(visualization));
  }, [visualization]);
  
  useEffect(() => {
    localStorage.setItem('appDiagnosis', JSON.stringify(diagnosis));
  }, [diagnosis]);

  // Function to update symptoms
  const updateSymptoms = (newSymptoms) => {
    console.log("Updating app symptoms:", newSymptoms);
    setSymptoms(newSymptoms);
  };
  
  // Function to update visualization
  const updateVisualization = (newVisualization) => {
    console.log("Updating app visualization:", newVisualization);
    setVisualization(newVisualization);
  };

  // Function to update diagnosis
  const updateDiagnosis = (newDiagnosis) => {
    console.log("Updating app diagnosis:", newDiagnosis);
    setDiagnosis(newDiagnosis);
  };
  
  // Function to clear all data (for reset)
  const clearAllData = () => {
    setSymptoms({
      painAreas: [],
      mainSymptoms: [],
      additionalSymptoms: [],
      emotionalState: null,
      emotionalScale: 0,
      completenessScore: 0
    });
    setVisualization({
      painDetails: [],
      intensity: 0,
      emotion: '😐'
    });
    setDiagnosis(null);
    
    // Also clear from localStorage
    localStorage.removeItem('appSymptoms');
    localStorage.removeItem('appVisualization');
    localStorage.removeItem('appDiagnosis');
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
    updateVisualization,
    diagnosis,
    updateDiagnosis,
    clearAllData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext); 