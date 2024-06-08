// RecordAudio.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';
import UserAudios from './UserAudios';  // Importa el nuevo componente
import './RecordAudio.css';

const RecordAudio = () => {
  const [audioURL, setAudioURL] = useState('');
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [audios, setAudios] = useState([]);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchAudios();
  }, []);

  const fetchAudios = async () => {
    try {
      const response = await axios.get('http://localhost:8000/user-audios/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAudios(response.data);
    } catch (error) {
      console.error('Error fetching audios:', error);
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      setAudioBlob(e.data);
      const url = URL.createObjectURL(e.data);
      setAudioURL(url);
      setIsUploaded(false); // Permitir la subida de nuevo
    };
    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  const uploadAudio = async () => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    try {
      const response = await axios.post('http://localhost:8000/upload-audio/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Audio uploaded successfully:', response.data);
      setIsUploaded(true); // Deshabilitar el botón de subida
      fetchAudios(); // Refresh the list after uploading
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  const deleteAudio = async (audioId) => {
    try {
      await axios.delete(`http://localhost:8000/delete-audio/${audioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchAudios();  // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting audio:', error);
    }
  };

  return (
    <Layout>
      <div className="record-audio">
        <h2>Record Audio</h2>
        <div className="controls">
          {!recording ? (
            <button onClick={startRecording}>Start Recording</button>
          ) : (
            <button onClick={stopRecording}>Stop Recording</button>
          )}
          {audioURL && (
            <>
              <audio src={audioURL} controls />
              <button onClick={uploadAudio} disabled={isUploaded}>Upload Audio</button>
            </>
          )}
        </div>
      </div>

      <UserAudios audios={audios} deleteAudio={deleteAudio} />
    </Layout>
  );
};

export default RecordAudio;
