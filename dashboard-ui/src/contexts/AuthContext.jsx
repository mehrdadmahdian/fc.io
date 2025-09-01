import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Interceptor for adding token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor for handling token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post('/auth/refresh', {
                    refreshToken
                });

                const { accessToken } = response.data;
                localStorage.setItem('accessToken', accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (error) {
                // Refresh token failed, logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/dashboard/auth/login';
            }
        }

        return Promise.reject(error);
    }
);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Initializing authentication check
        try {
            getUser();
        } catch (error) {
            // Error during initialization - could add proper error handling
            setIsLoading(false);
            setIsAuthenticated(false);
        }
    }, []);

    const getUser = async () => {
        const token = localStorage.getItem('accessToken');
        // Checking for existing token
        
        if (token) {
            setIsAuthenticated(true);

            try {
                const response = await api.get('/auth/user');
                if (response.data.data) {
                    setUser({
                        id: response.data.data.userID,
                        name: response.data.data.userName,
                        email: response.data.data.userEmail 
                    });
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            } catch (error) {
                setIsAuthenticated(false);
                if (error.response?.status === 401) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            }
        } else {
            // No token found, setting as unauthenticated
            setIsAuthenticated(false);
        }
        // Authentication check complete
        setIsLoading(false);
    };

    const login = async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { accessToken, refreshToken } = response.data.data;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setIsAuthenticated(true);
            
            // Get user info after login
            await getUser();
            return true;
        } catch (error) {
            // Login error - could add proper error handling
            return false;
        }
    };

    const register = async (registerData) => {
        try {
            const response = await api.post('/auth/register', registerData);
            const { accessToken, refreshToken } = response.data.data;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setIsAuthenticated(true);
            
            // Get user info after registration
            await getUser();
            return true;
        } catch (error) {
            // Registration error - could add proper error handling
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            isLoading, 
            user,
            login,
            logout,
            register,
            api
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 