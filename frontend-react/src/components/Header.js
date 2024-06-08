import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('User role:', user.role);
    }
  }, [user]);

  return (
    <header className="header">
      <div className="header-content">
        <h1>Dashboard</h1>
        <nav className="nav-menu">
          {user && user.role.name === "admin" && (
            <>
              <Link to="/create-user">Create User</Link>
              <Link to="/record-audio">Record Audio</Link>
            </>
          )}
        </nav>
        <div className="user-info">
          {user && <span>{user.username}</span>}
          <button onClick={logout}>Logout</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
