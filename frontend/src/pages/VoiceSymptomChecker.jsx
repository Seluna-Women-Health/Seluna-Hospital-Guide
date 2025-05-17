import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaPaperPlane } from 'react-icons/fa';
import { useAppContext } from '../contexts/AppContext';
import PainVisualizer from '../components/symptomChecker/PainVisualizer';
import SymptomSummary from '../components/symptomChecker/SymptomSummary';

const VoiceSymptomChecker = () => {
  const navigate = useNavigate();
  const { updateSymptoms, updateVisualization } = useAppContext();
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [currentSymptoms, setCurrentSymptoms] = useState({
    pain_areas: [],
    additional_symptoms: [],
    emotional_state: null,
    emotional_scale: 0,
    completeness_score: 0
  });
  const [loading, setLoading] = useState(true);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const conversationEndRef = useRef(null);
  
  // Initialize conversation on component mount
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/symptoms/conversation/start', {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error('Failed to start conversation');
        }
        
        const data = await response.json();
        setConversationId(data.conversation_id);
        setConversation(data.messages);
        
        // Map the backend symptoms data to our frontend structure
        processSymptomData(data.symptoms);
      } catch (error) {
        console.error('Error initializing conversation:', error);
        // Fallback to local initial message if server is unavailable
        setConversation([
          { role: 'system', content: 'Hello! Please describe your symptoms. Where are you experiencing pain or discomfort?' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    initializeConversation();
  }, []);
  
  // Auto-scroll to the bottom of conversation
  useEffect(() => {
    if (conversationEndRef.current) {
      // Add a small delay to ensure DOM updates are complete
      setTimeout(() => {
        conversationEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    }
  }, [conversation]);
  
  // Process symptoms data from backend to match frontend expectations
  const processSymptomData = (backendSymptoms) => {
    if (!backendSymptoms) {
      console.log("No symptoms data received from backend");
      return;
    }
    
    console.log("Raw backend symptoms:", backendSymptoms);
    console.log("Main symptoms from backend:", backendSymptoms.main_symptoms);
    console.log("Additional symptoms from backend:", backendSymptoms.additional_symptoms);
    
    // Create a formatted symptoms object that matches our frontend structure
    const formattedSymptoms = {
      // Always ensure pain_areas is an array
      pain_areas: Array.isArray(backendSymptoms.pain_areas) 
        ? backendSymptoms.pain_areas 
        : [],
      
      // Get main_symptoms array, with fallbacks
      main_symptoms: Array.isArray(backendSymptoms.main_symptoms)
        ? backendSymptoms.main_symptoms
        : [],
      
      // Get additional_symptoms array, with fallbacks for legacy "symptoms" field 
      additional_symptoms: Array.isArray(backendSymptoms.additional_symptoms) 
        ? backendSymptoms.additional_symptoms 
        : (Array.isArray(backendSymptoms.symptoms) 
            ? backendSymptoms.symptoms 
            : []),
      
      // Copy emotional state and scale
      emotional_state: backendSymptoms.emotional_state || null,
      emotional_scale: backendSymptoms.emotional_scale !== undefined 
        ? Number(backendSymptoms.emotional_scale) 
        : 0,
      
      // Make absolutely sure completeness_score is set
      completeness_score: backendSymptoms.completeness_score !== undefined 
        ? Number(backendSymptoms.completeness_score)
        : 0
    };
    
    console.log("Final formatted symptoms for frontend:", formattedSymptoms);
    setCurrentSymptoms(formattedSymptoms);
  };
  
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
      
      // Send the text to the conversation endpoint
      await sendMessageToBackend(transcriptData.text);
      
      // Text-to-speech for the response can be handled optionally
      // ...
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  };
  
  // Function to send a text message to backend
  const sendMessageToBackend = async (messageText) => {
    if (!conversationId) {
      console.error("No conversation ID available");
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/symptoms/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          content: messageText
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      setConversation(data.messages);
      
      // Process the symptoms data
      processSymptomData(data.symptoms);
      
      // Optional: Convert the latest system response to speech
      const latestMessage = data.messages[data.messages.length - 1];
      if (latestMessage.role === 'system') {
        const speechResponse = await fetch('/api/speech/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: latestMessage.content,
            language: 'en',
            voice_type: 'female'
          }),
        });
        
        if (speechResponse.ok) {
          const speechData = await speechResponse.json();
          // Play audio response
          const audio = new Audio(`data:audio/mp3;base64,${speechData.audio_data}`);
          audio.play();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error (maybe add a user-friendly error message)
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle navigation to the diagnosis page
  const handleContinue = () => {
    // First, store all the symptom data in the global context
    updateSymptoms({
      painAreas: currentSymptoms.pain_areas.map(area => area.area || area),
      mainSymptoms: currentSymptoms.main_symptoms || [],
      additionalSymptoms: currentSymptoms.additional_symptoms || [],
      emotionalState: currentSymptoms.emotional_state,
      emotionalScale: currentSymptoms.emotional_scale,
      completenessScore: currentSymptoms.completeness_score
    });
    
    // Prepare visualization data based on pain areas
    const visualizationData = {
      painDetails: currentSymptoms.pain_areas.map(area => {
        // If area is already an object with properties, use those
        if (typeof area === 'object' && area !== null) {
          return {
            area: area.area,
            intensity: area.intensity || 5,
            frequency: area.frequency || 'sometimes',
            description: area.description || 'dull'
          };
        }
        // Otherwise create a default object with the area name
        return {
          area: area,
          intensity: 5,
          frequency: 'sometimes',
          description: 'dull'
        };
      }),
      intensity: currentSymptoms.pain_areas.length > 0 
        ? Math.min(Math.max(
            // Calculate average intensity, or default to 5
            currentSymptoms.pain_areas.reduce((sum, area) => 
              sum + (typeof area === 'object' ? (area.intensity || 5) : 5), 0) / 
              Math.max(currentSymptoms.pain_areas.length, 1),
            1), 10)
        : 0,
      emotion: currentSymptoms.emotional_state ? '😐' : '😐'
    };
    
    // Update visualization in global context
    updateVisualization(visualizationData);
    
    // Then navigate to the diagnosis page
    navigate('/diagnosis');
  };

  // Handle text input submission
  const handleSubmitText = async () => {
    if (!inputText.trim()) return;
    
    // Store the message locally first (for immediate feedback)
    const messageText = inputText;
    setInputText('');
    
    // Send to backend
    await sendMessageToBackend(messageText);
  };

  // If you have any functions that fetch conversation data directly
  const fetchConversationData = async () => {
    if (!conversationId) {
      console.error("No conversation ID available");
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/symptoms/conversation?conversation_id=${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversation data');
      }
      
      const data = await response.json();
      setConversation(data.messages);
      processSymptomData(data.symptoms);
    } catch (error) {
      console.error('Error fetching conversation data:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  // Add this function to your component
  const addTestData = () => {
    setCurrentSymptoms({
      pain_areas: [
        {area: "pelvis", intensity: 7, frequency: "often", description: "sharp"},
        {area: "head", intensity: 4, frequency: "sometimes", description: "dull"}
      ],
      additional_symptoms: ["bloating", "irregular periods", "fatigue"],
      emotional_state: "anxious",
      emotional_scale: 6,
      completeness_score: 70
    });
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 flex flex-col md:col-span-1"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 py-4 px-6">
            <h2 className="text-xl font-semibold text-white">Tell us about your symptoms</h2>
          </div>
          
          <div className="flex-grow p-6 flex flex-col">
            <div className="conversation-container h-[400px] overflow-y-auto mb-4 rounded-lg bg-gray-50 p-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
              {loading && conversation.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-pulse text-purple-500">Loading conversation...</div>
                </div>
              ) : (
                <>
                  {conversation.map((message, index) => (
                    <div 
                      key={index} 
                      className={`max-w-[80%] mb-3 p-3 rounded-lg ${
                        message.role === 'system' 
                          ? 'bg-purple-100 text-purple-800 ml-2' 
                          : 'bg-pink-100 text-pink-800 ml-auto mr-2'
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                  <div ref={conversationEndRef} className="h-1" />
                </>
              )}
            </div>
            
            <div className="mt-auto flex flex-col items-center justify-center">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                className={`w-12 h-12 rounded-full flex items-center justify-center 
                  ${isRecording 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  } text-white transition-all duration-300 shadow-lg transform hover:scale-105 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                <FaMicrophone size={20} className={isRecording ? 'animate-pulse' : ''} />
              </button>
              
              {isRecording && (
                <span className="mt-2 text-red-500 animate-pulse text-center">
                  Recording...
                </span>
              )}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow transition-all duration-300 transform hover:-translate-y-1"
            >
              Estimate Diagnosis
            </button>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 md:col-span-2"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 py-4 px-6">
            <h2 className="text-xl font-semibold text-white">Symptoms Analysis</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-purple-700 mb-4">Pain Visualization</h3>
              <div className="flex-grow">
                <PainVisualizer painAreas={currentSymptoms.pain_areas} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-700 mb-4">Summary</h3>
              <SymptomSummary symptoms={currentSymptoms} hideCompleteness={false}/>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="mt-2">
        <button 
          onClick={addTestData}
          className="text-xs text-gray-500 underline"
        >
          (Load test data)
        </button>
      </div>
    </div>
  );
};

export default VoiceSymptomChecker; 