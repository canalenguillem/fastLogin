import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import UserVideos from './UserVideos';
import Layout from './Layout';
import './RecordVideo.css';

const RecordVideo = () => {
    const [recording, setRecording] = useState(false);
    const [videoBlob, setVideoBlob] = useState(null);
    const [videos, setVideos] = useState([]);
    const videoRef = useRef();
    const mediaRecorderRef = useRef();
    const token = localStorage.getItem('access_token');

    useEffect(() => {
        fetchUserVideos();
    }, []);

    const fetchUserVideos = async () => {
        try {
            const response = await axios.get('http://localhost:8000/user-videos/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setVideos(response.data);
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: { sampleRate: 44100, channelCount: 2 } });
        videoRef.current.srcObject = stream;
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8,opus' });
        mediaRecorderRef.current.ondataavailable = (event) => {
            setVideoBlob(event.data);
        };
        mediaRecorderRef.current.start();
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        setRecording(false);
    };

    const uploadVideo = async () => {
        if (!videoBlob) return;
        const formData = new FormData();
        formData.append('file', videoBlob, 'recording.webm');
        try {
            const response = await axios.post('http://localhost:8000/upload-video/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Video uploaded successfully:', response.data);
            setVideoBlob(null);
            fetchUserVideos(); // Refresh the list after uploading
        } catch (error) {
            console.error('Error uploading video:', error);
        }
    };

    return (
        <Layout>
            <div>
                <h2>Record Video</h2>
                <div>
                    <video ref={videoRef} autoPlay style={{ display: recording ? 'block' : 'none' }}></video>
                    {!recording ? (
                        <button onClick={startRecording}>Start Recording</button>
                    ) : (
                        <button onClick={stopRecording}>Stop Recording</button>
                    )}
                    {videoBlob && (
                        <div>
                            <video src={URL.createObjectURL(videoBlob)} controls></video>
                            <button onClick={uploadVideo}>Upload Video</button>
                        </div>
                    )}
                </div>
                <UserVideos videos={videos} fetchUserVideos={fetchUserVideos} />
            </div>
        </Layout>
    );
};

export default RecordVideo;