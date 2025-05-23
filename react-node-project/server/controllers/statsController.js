const Stats = require('../models/Stats');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Message = require('../models/Message');

// Get current stats
const getStats = async (req, res) => {
  try {
    // Get counts from all collections
    const [users, tasks, projects, messages] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Project.countDocuments(),
      Message.countDocuments()
    ]);

    // Update stats in the database
    const stats = await Stats.findOneAndUpdate(
      {},
      {
        users,
        tasks,
        projects,
        messages,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
};

// Update stats manually (admin only)
const updateStats = async (req, res) => {
  try {
    const { users, tasks, projects, messages } = req.body;

    const stats = await Stats.findOneAndUpdate(
      {},
      {
        users,
        tasks,
        projects,
        messages,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stats',
      error: error.message
    });
  }
};

module.exports = {
  getStats,
  updateStats
}; 