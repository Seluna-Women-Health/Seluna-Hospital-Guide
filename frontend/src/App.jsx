import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import './App.css';

// Import layouts
import MainLayout from './layouts/MainLayout';

// Import pages
import LandingPage from './pages/LandingPage';
import VoiceSymptomChecker from './pages/VoiceSymptomChecker';
import AdditionalDetails from './pages/AdditionalDetails';
import CulturalView from './pages/CulturalView';
import HospitalVisitSimulation from './pages/HospitalVisitSimulation';
import Feedback from './pages/Feedback';
import ResourcesHub from './pages/ResourcesHub';
import Diagnosis from './pages/Diagnosis';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="symptom-checker" element={<VoiceSymptomChecker />} />
            <Route path="diagnosis" element={<Diagnosis />} />
            <Route path="details" element={<AdditionalDetails />} />
            <Route path="cultural-view" element={<CulturalView />} />
            <Route path="hospital-simulation" element={<HospitalVisitSimulation />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="resources" element={<ResourcesHub />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
