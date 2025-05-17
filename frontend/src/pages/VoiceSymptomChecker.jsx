import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SymptomInput from '../components/symptomChecker/SymptomInput';
import BodyVisualization from '../components/symptomChecker/BodyVisualization';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

const VoiceSymptomChecker = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState([
    { role: 'system', content: 'Hello! Please describe your symptoms. Where are you experiencing pain or discomfort?' }
  ]);
  const [currentSymptoms, setCurrentSymptoms] = useState({
    pain_areas: [],
    additional_symptoms: [],
    emotional_state: null
  });
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Function to start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToBackend(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access your microphone. Please check your browser permissions.");
    }
  };
  
  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };
  
  // Function to send audio to backend
  const sendAudioToBackend = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob);
      
      // First, convert speech to text
      const transcriptResponse = await fetch('/api/speech/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!transcriptResponse.ok) {
        throw new Error('Speech to text conversion failed');
      }
      
      const transcriptData = await transcriptResponse.json();
      
      // Add user message to conversation
      const updatedConversation = [...conversation, { role: 'user', content: transcriptData.text }];
      setConversation(updatedConversation);
      
      // Send to conversation endpoint to get guided response
        const conversationResponse = await fetch('/api/symptoms/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: updatedConversation,
          current_symptoms: currentSymptoms
        }),
      });
      
      if (!conversationResponse.ok) {
        throw new Error('Failed to process conversation');
      }
      
      const conversationData = await conversationResponse.json();
      
      // Update conversation with system response
      setConversation([...updatedConversation, { role: 'system', content: conversationData.response }]);
      
      // Update symptom data if available
      if (conversationData.updated_symptoms) {
        setCurrentSymptoms(conversationData.updated_symptoms);
      }
      
      // Convert system response to speech
      const speechResponse = await fetch('/api/speech/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: conversationData.response,
          language: 'en',
          voice_type: 'female'
        }),
      });
      
      if (!speechResponse.ok) {
        throw new Error('Text to speech conversion failed');
      }
      
      const speechData = await speechResponse.json();
      
      // Play audio response
      const audio = new Audio(`data:audio/mp3;base64,${speechData.audio_data}`);
      audio.play();
      
    } catch (error) {
      console.error("Error processing audio:", error);
      setConversation([...conversation, { role: 'system', content: "I'm sorry, I couldn't process that. Could you try again?" }]);
    }
  };
  
  const handleContinue = () => {
    navigate('/summary');
  };

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Symptom Checker
      </motion.h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 py-4 px-6">
            <h2 className="text-xl font-semibold text-white">Tell us about your symptoms</h2>
          </div>
          <div className="p-6">
            <div className="conversation-container h-64 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
              {conversation.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-3 p-3 rounded-lg ${
                    message.role === 'system' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-pink-100 text-pink-800 ml-auto'
                  } max-w-3/4`}
                >
                  {message.content}
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                } text-white font-bold p-4 rounded-full shadow-lg transition-all duration-300`}
              >
                {isRecording ? <FaMicrophoneSlash size={24} /> : <FaMicrophone size={24} />}
              </button>
            </div>
            
            <div className="mt-4">
              <SymptomInput symptoms={currentSymptoms} setSymptoms={setCurrentSymptoms} />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 py-4 px-6">
            <h2 className="text-xl font-semibold text-white">Pain Visualization</h2>
          </div>
          <div className="p-6">
            <BodyVisualization painAreas={currentSymptoms.pain_areas} />
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <button 
          onClick={handleContinue}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover-lift"
        >
          Continue to Summary
        </button>
      </motion.div>
    </div>
  );
};

export default VoiceSymptomChecker; 