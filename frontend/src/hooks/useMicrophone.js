import { useState, useEffect } from 'react';

const useMicrophone = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  // Set up the media recorder
  useEffect(() => {
    if (!isRecording) return;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Audio = reader.result.split(',')[1];
            setAudioData(base64Audio);
          };
          
          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setAudioChunks(chunks);
      } catch (err) {
        setError(err.message);
        setIsRecording(false);
      }
    };

    startRecording();

    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setAudioData(null);
    setTranscript('');
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return {
    isRecording,
    audioData,
    transcript,
    error,
    startRecording,
    stopRecording,
    toggleRecording,
    setTranscript
  };
};

export default useMicrophone; 