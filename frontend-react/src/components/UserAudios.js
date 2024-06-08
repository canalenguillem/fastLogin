// UserAudios.js
import React from 'react';
import './UserAudios.css';

const UserAudios = ({ audios, deleteAudio }) => {
  return (
    <div className="user-audios">
      <h2>Your Audios</h2>
      <div className="audio-grid">
        {audios.map(audio => (
          <div key={audio.id} className="audio-item">
            <audio controls src={`http://localhost:8000/uploads/${audio.filename}`} />
            <button onClick={() => deleteAudio(audio.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserAudios;
