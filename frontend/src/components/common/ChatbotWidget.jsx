import React, { useState } from 'react';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg p-4 w-80 h-96 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Help Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="flex-grow bg-gray-50 rounded p-3 overflow-y-auto mb-4">
            <div className="bg-purple-100 rounded-lg p-2 mb-2">
              How can I help you today?
            </div>
          </div>
          <div className="flex">
            <input 
              type="text" 
              placeholder="Type your question..." 
              className="flex-grow p-2 border rounded-l"
            />
            <button className="bg-purple-500 text-white p-2 rounded-r">
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold p-3 rounded-full shadow-lg"
          title="Get Help"
        >
          💬
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget; 