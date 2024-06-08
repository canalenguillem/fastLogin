import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';
import './CreateUser.css'; // Asegúrate de importar el archivo CSS

const CreateUser = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState(2); // Por defecto, un rol de usuario normal
  const [roles, setRoles] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:8000/roles/');
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/register_user/', {
        username,
        email,
        password,
        role_id: roleId,
      });
      setMessage('User created successfully');
      setUsername('');
      setEmail('');
      setPassword('');
      setRoleId(2);
    } catch (error) {
      setError('Error creating user: ' + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <Layout>
      <div className="create-user-container">
        <div className="create-user">
          <h2>Create User</h2>
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label>
              Username:
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
            <br />
            <label>
              Email:
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <br />
            <label>
              Password:
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <br />
            <label>
              Role:
              <select value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
            <br />
            <button type="submit">Create User</button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateUser;
