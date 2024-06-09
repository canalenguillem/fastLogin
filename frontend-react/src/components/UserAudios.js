import React, { useState } from 'react';
import axios from 'axios';
import './UserAudios.css';

const UserAudios = ({ audios, fetchUserAudios }) => {
    const [transcriptions, setTranscriptions] = useState({});
    const token = localStorage.getItem('access_token');

    const deleteAudio = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/delete-audio/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchUserAudios(); // Refresh the list after deletion
        } catch (error) {
            console.error('Error deleting audio:', error);
        }
    };

    const convertToText = async (audioId, filename) => {
      try {
          const response = await axios.post(`http://localhost:8000/convert-audio-to-text/`, { filename }, {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
          });
          setTranscriptions((prevTranscriptions) => ({
              ...prevTranscriptions,
              [audioId]: response.data.text,
          }));
      } catch (error) {
          console.error('Error converting audio to text:', error);
      }
  };
  

    return (
        <div>
            <h3>Your Audios</h3>
            <div className="audio-grid">
                {audios.map((audio) => (
                    <div key={audio.id} className="audio-item">
                        <audio controls src={`http://localhost:8000/uploads/${audio.filename}`} />
                        <button onClick={() => deleteAudio(audio.id)}>Delete</button>
                        <button onClick={() => convertToText(audio.id, audio.filename)}>Convert to Text</button>
                        {transcriptions[audio.id] && (
                            <div className="transcription">
                                <h4>Transcription:</h4>
                                <p>{transcriptions[audio.id]}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserAudios;
