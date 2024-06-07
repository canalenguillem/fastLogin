// Dashboard.js (modified)
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div>
      <header>
        <nav>
          <h1>Dashboard</h1>
        </nav>
      </header>
      <main>
        <h2>Welcome to the Dashboard</h2>
      </main>
      <footer>
        <p>&copy; 2023 Your Company</p>
      </footer>
    </div>
  );
};

export default Dashboard;
