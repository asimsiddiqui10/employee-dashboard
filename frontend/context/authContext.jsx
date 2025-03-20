import React, { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const userContext = createContext();

const AuthContext = ({children}) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const verifyUser = async () => {
            
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    const response = await axios.get('http://localhost:5001/api/auth/verify', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if(response.data.success) {
                        setUser(response.data.user);
                    }   
                } else {
                    setUser(null);
                }
            } catch(error) {
                if (error.response && !error.response.data.success) {
                    setUser(null);
                }
            }
        };
        verifyUser();
    }, [navigate]);

    const login = (user) => {
        setUser(user);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };
    
    return (
        <userContext.Provider value={{user, login, logout}}>
            {children}
        </userContext.Provider>
    );
};

export const useAuth = () => useContext(userContext);
export default AuthContext;