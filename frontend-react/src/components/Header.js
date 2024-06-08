// Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ user, onLogout }) => {
  if (!user || !user.role) {
    return null; // or a loading spinner
  }

  return (
    <header className="header">
      <div className="header-content">
        <h1>Dashboard</h1>
        <nav>
          <ul className="nav-links">
            {user.role.name === 'admin' && <li><Link to="/create-user">Create User</Link></li>}
            <li><Link to="/record-audio">Record Audio</Link></li>
          </ul>
        </nav>
      </div>
      <div className="user-info">
        <span>{user.username}</span>
        <button onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
