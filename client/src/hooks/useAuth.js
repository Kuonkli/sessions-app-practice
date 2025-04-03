import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import {useNavigate} from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await api.get('/api/profile');
                if (response.data.isAuthenticated) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, []);

    const login = async (username, password) => {
        try {
            await api.post('/api/login', { username, password });
            const response = await api.get('/api/profile');
            console.log(response.data)
            setUser(response.data.user);
            navigate("/profile")
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    };

    const register = async (username, password) => {
        try {
            await api.post('/api/register', { username, password });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Registration failed' };
        }
    };

    const logout = async () => {
        try {
            await api.post('/api/logout');
            setUser(null);
            navigate("/")
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}