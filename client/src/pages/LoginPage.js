import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../components/ThemeProvider';
import '../styles/LoginPage.css';
import {useNavigate} from "react-router-dom";

const LoginPage = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const { login, register } = useAuth();
    const { toggleTheme } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        let result;
        if (activeTab === 'login') {
            result = await login(username, password);
        } else {
            result = await register(username, password);
            if (result.success) {
                setMessage({ text: 'Registration successful! Please login.', type: 'success' });
                setActiveTab('login');
                return;
            }
        }

        if (!result.success) {
            setMessage({ text: result.error, type: 'error' });
        }
    };

    return (
        <div className="login-container">
            <h1>Welcome</h1>

            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
                    onClick={() => setActiveTab('login')}
                >
                    Login
                </button>
                <button
                    className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => setActiveTab('register')}
                >
                    Register
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">
                    {activeTab === 'login' ? 'Login' : 'Register'}
                </button>
            </form>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <div className="theme-switcher">
                <button onClick={toggleTheme}>Toggle Theme</button>
            </div>
        </div>
    );
}

export default LoginPage;