import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import useMicrophone from '../../hooks/useMicrophone';

const SymptomInput = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'system', text: 'Hello! Please describe your symptoms. Where are you experiencing pain or discomfort?' }
  ]);
  const { symptoms, setSymptoms } = useAppContext();
  const { 
    isRecording, 
    audioData, 
    transcript, 
    error, 
    toggleRecording 
  } = useMicrophone();
  
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Process speech to text when audio data is available
  useEffect(() => {
    if (!audioData) return;

    const convertSpeechToText = async () => {
      try {
        // For now, simulate API response
        setTimeout(() => {
          const simulatedText = "I've been having sharp abdominal pain for two days";
          handleSendMessage(simulatedText, true);
        }, 1000);
        
        // Once API is ready:
        // const response = await api.speech.toText(audioData);
        // handleSendMessage(response.text, true);
      } catch (err) {
        console.error('Error converting speech to text:', err);
      }
    };

    convertSpeechToText();
  }, [audioData]);

  const handleSendMessage = (text, fromMic = false) => {
    const messageText = fromMic ? text : input;
    if (!messageText.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: messageText }]);
    
    // Clear input if not from microphone
    if (!fromMic) {
      setInput('');
    }

    // Add loading message
    setMessages(prev => [...prev, { sender: 'system', text: 'Analyzing...', isLoading: true }]);
    
    // For now, simulate API response
    setTimeout(() => {
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [
          ...filtered,
          { sender: 'system', text: 'Have you experienced any other symptoms like nausea or fever?' }
        ];
      });
      
      // Update symptom context (simulated)
      setSymptoms(prev => ({
        ...prev,
        painAreas: [...prev.painAreas, 'abdomen'],
        painType: [...prev.painType, 'sharp']
      }));
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto pr-2 mb-4 space-y-3 max-h-[400px] styled-scrollbar">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-2xl ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-r from-purple-100 to-purple-200 ml-8 text-right' 
                  : 'bg-gray-100 mr-8'
              } ${message.isLoading ? 'animate-pulse' : ''}`}
            >
              {message.text}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleRecording}
          className={`p-4 rounded-full shadow-md ${
            isRecording 
              ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          } text-white`}
        >
          <span>🎤</span>
        </motion.button>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-4 border border-purple-200 rounded-full focus:ring-2 focus:ring-purple-300 focus:border-transparent"
          placeholder="Type your symptoms here..."
        />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSendMessage()}
          className="p-4 rounded-full shadow-md bg-gradient-to-r from-purple-500 to-pink-500 text-white"
        >
          <span>➤</span>
        </motion.button>
      </div>
    </div>
  );
};

export default SymptomInput; 