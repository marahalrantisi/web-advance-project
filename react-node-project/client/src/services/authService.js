import api from './api';

export const authService = {
  // Sign up
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('Error signing up:', error.response?.data || error.message);
      throw error;
    }
  },

  // Sign in
  signin: async (credentials) => {
    try {
      // Ensure credentials are properly formatted
      const formattedCredentials = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password
      };

      console.log('Attempting signin with:', { email: formattedCredentials.email });
      
      // Make the request with explicit headers
      const response = await api.post('/auth/signin', formattedCredentials, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Signin response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error signing in:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        request: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      throw error;
    }
  },

  // Sign out
  signout: async () => {
    try {
      const response = await api.post('/auth/signout');
      return response.data;
    } catch (error) {
      console.error('Error signing out:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error.response?.data || error.message);
      throw error;
    }
  }
}; 