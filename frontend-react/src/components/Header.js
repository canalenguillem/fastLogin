import React, { useEffect } from 'react';
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
            <button onClick={() => window.location.href = '/create-user'}>Create User</button>
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
