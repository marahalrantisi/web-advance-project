import api from './api';

export const statsService = {
  // Get current stats
  getStats: async () => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Update stats (admin only)
  updateStats: async (statsData) => {
    try {
      const response = await api.put('/stats', statsData);
      return response.data;
    } catch (error) {
      console.error('Error updating stats:', error);
      throw error;
    }
  }
}; 