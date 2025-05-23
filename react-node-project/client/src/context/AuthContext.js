import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { api } from '../services/api';

// Create auth context
const AuthContext = createContext();

// Auth provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = sessionStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Verify token
        const response = await authService.getCurrentUser();
        
        if (response.user) {
          setUser(response.user);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        // Clear local data on error
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Sign in
  const login = async (email, password, rememberMe) => {
    try {
      setError(null);
      const response = await authService.signin({ email, password });
      
      if (response.success && response.token && response.user) {
        setUser(response.user);
        if (rememberMe) {
          localStorage.setItem('authData', JSON.stringify({ email, password }));
        }
        return response;
      } else {
        setError('Invalid response from server');
        return null;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Failed to sign in');
      return null;
    }
  };

  // Sign up
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.signup(userData);
      return true;
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err.response?.data?.message || 'Sign up failed');
      return false;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await authService.signout();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setUser(null);
    }
  };

  // Update user data
  const updateUser = (updatedUser) => {
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Context values
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
