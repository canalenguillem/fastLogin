import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/token', new URLSearchParams({
                username: username,
                password: password
            }));
            console.log('Login successful:', response.data);
            localStorage.setItem('access_token', response.data.access_token);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed');
        }
    };

    return (
        <div className="container-login">
            <form onSubmit={handleSubmit}>
                <h2>Login</h2>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <br />
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginForm;
