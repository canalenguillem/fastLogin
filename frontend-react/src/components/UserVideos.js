// UserVideos.js
import React from 'react';
import axios from 'axios';
import './UserVideos.css';

const UserVideos = ({ videos, fetchUserVideos }) => {
    const token = localStorage.getItem('access_token');

    const deleteVideo = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/delete-video/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchUserVideos(); // Refresh the list after deletion
        } catch (error) {
            console.error('Error deleting video:', error);
        }
    };

    return (
        <div className='user-videos'>
            <h3>Your Videos</h3>
            <div className="video-grid">
                {videos.map((video) => (
                    <div key={video.id} className="video-item">
                        <video controls>
                            <source src={`http://localhost:8000/uploads/videos/${video.filename}`} type="video/mp4" />
                        </video>
                        <button onClick={() => deleteVideo(video.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserVideos;
