import React from 'react';

const EmergencyExitButton = () => {
  const handleEmergencyExit = () => {
    // Redirect to a safe website (e.g., Google)
    window.location.href = 'https://www.google.com';
  };

  return (
    <button
      onClick={handleEmergencyExit}
      className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white font-bold p-3 rounded-full shadow-lg"
      title="Emergency Exit"
    >
      🛑
    </button>
  );
};

export default EmergencyExitButton; 