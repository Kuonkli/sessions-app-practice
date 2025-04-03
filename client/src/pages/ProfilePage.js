import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../components/ThemeProvider';
import api from '../services/api';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const { toggleTheme } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/api/data');
            setData(response.data);
        } catch (err) {
            setError('Failed to fetch data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="profile-container">
            <h1>Welcome, {user?.username}!</h1>

            <div className="profile-section">
                <h2>Cached Data</h2>
                {loading ? (
                    <p>Loading data...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : data ? (
                    <div className="data-content">
                        <p>Message: {data.message}</p>
                        <p>Random number: {data.randomNumber}</p>
                        <p>Time: {new Date(data.time).toLocaleString()}</p>
                    </div>
                ) : null}

                <button
                    onClick={fetchData}
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            <div className="theme-switcher">
                <button onClick={toggleTheme}>Toggle Theme</button>
            </div>

            <button className="logout-button" onClick={logout}>
                Logout
            </button>
        </div>
    );
}

export default ProfilePage;