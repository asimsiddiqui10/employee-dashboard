import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';

// Create and export the context
export const AuthContext = createContext(null);

// Export the provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Verify token and load user data on mount or refresh
    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Add token to default axios headers
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    // Verify token with backend
                    const response = await api.get('/auth/verify');
                    if (response.data.user) {
                        setUser(response.data.user);
                    } else {
                        localStorage.removeItem('token');
                        delete api.defaults.headers.common['Authorization'];
                    }
                } catch (error) {
                    const { message } = handleApiError(error);
                    console.error(message);
                    localStorage.removeItem('token');
                    delete api.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        }
        verifyToken();
    }, []);

    const login = (userData) => {
        setUser(userData);
        // Set token in axios defaults when logging in
        const token = localStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    };
    
    // Provide a value object with all the context data
    const value = {
        user,
        login,
        logout,
        loading
    };

    if (loading) {
        return <div>Loading...</div>; // Or your loading component
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Export the useAuth hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;