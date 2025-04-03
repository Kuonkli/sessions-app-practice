import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import {AuthProvider, useAuth} from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/" />;
}

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route
                            path="/profile"
                            element={
                                <ProfilePage />
                            }
                        />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;