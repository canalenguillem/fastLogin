import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import CreateUser from './components/CreateUser';
import RecordAudio from './components/RecordAudio';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-user" element={<CreateUser />} />
      <Route path="/record-audio" element={<RecordAudio />} />
    </Routes>
  );
}

export default App;
