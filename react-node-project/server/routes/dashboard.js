const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Message = require('../models/Message');

// Get dashboard statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Get counts from all collections
    const [totalTasks, totalProjects, totalUsers, totalMessages] = await Promise.all([
      Task.countDocuments(),
      Project.countDocuments(),
      User.countDocuments(),
      Message.countDocuments()
    ]);

    // Get task completion stats
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });

    // Get project stats
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });

    // Get unread messages count
    const unreadMessages = await Message.countDocuments({ read: false });

    res.json({
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks + inProgressTasks
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects
      },
      messages: {
        total: totalMessages,
        unread: unreadMessages
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

module.exports = router; 