const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get recent tasks
router.get('/recent', verifyToken, async (req, res) => {
  try {
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name')
      .lean();

    res.json({ tasks: recentTasks });
  } catch (error) {
    console.error('Error fetching recent tasks:', error);
    res.status(500).json({ message: 'Error fetching recent tasks' });
  }
});

// Get all tasks
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const filter = {};
    
    // Add filters if they exist
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    // Add current user filter if student
    if (req.user.role === 'student') {
      filter.assignedTo = req.user._id;
    }
    
    const tasks = await Task.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Get a specific task
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('project', 'name');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check permissions
    if (req.user.role === 'student' && 
        task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to access this task' });
    }
    
    res.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Error fetching task' });
  }
});

// Create a new task
router.post('/', verifyToken, checkRole(['admin', 'teacher']), async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      createdBy: req.user._id
    });
    
    await task.save();
    await task.populate('assignedTo', 'name');
    
    res.status(201).json({ task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

// Update a task
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check permissions
    if (req.user.role === 'student') {
      // Students can only update status of tasks assigned to them
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to update this task' });
      }
      
      // Students can only update status
      if (req.body.status) task.status = req.body.status;
    } else {
      // Teachers and admins can update all fields
      Object.assign(task, req.body);
    }
    
    await task.save();
    await task.populate('assignedTo', 'name');
    
    res.json({ task });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Delete a task
router.delete('/:id', verifyToken, checkRole(['admin', 'teacher']), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Add comment to task
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check permissions for students
    if (req.user.role === 'student' && 
        task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to comment on this task' });
    }
    
    task.comments.push({
      content,
      author: req.user._id
    });
    
    await task.save();
    
    res.status(201).json({
      comment: task.comments[task.comments.length - 1]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

module.exports = router;
