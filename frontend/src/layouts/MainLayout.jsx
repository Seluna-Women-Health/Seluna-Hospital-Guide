import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import EmergencyExitButton from '../components/common/EmergencyExitButton';
import ChatbotWidget from '../components/common/ChatbotWidget';
import { useAppContext } from '../contexts/AppContext';

const MainLayout = () => {
  const { language } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col" data-language={language}>
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <EmergencyExitButton />
      <ChatbotWidget />
      <Footer />
    </div>
  );
};

export default MainLayout; 