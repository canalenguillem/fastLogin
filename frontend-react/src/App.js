// App.js
import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import CreateUser from './components/CreateUser';
import RecordAudio from './components/RecordAudio';
import Header from './components/Header';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.get('http://localhost:8000/users/me/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Error fetching user:', error);
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    navigate('/login');
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="*" element={<LoginForm />} />
      </Routes>
    );
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/record-audio" element={<RecordAudio />} />
      </Routes>
    </>
  );
}

export default App;
