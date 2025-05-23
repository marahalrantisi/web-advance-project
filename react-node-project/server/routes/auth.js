const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, studentId } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use'
      });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'student',
      studentId: role === 'student' ? studentId : undefined
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account'
    });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last active
    user.lastActive = Date.now();
    await user.save();
    
    // Generate JWT token
    const token = user.generateAuthToken();
    
    res.json({
      success: true,
      message: 'Signed in successfully',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Error in signin:', error);
    res.status(500).json({
      success: false,
      message: 'Error signing in'
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

// Sign out
router.post('/signout', (req, res) => {
  res.json({
    success: true,
    message: 'Signed out successfully'
  });
});

module.exports = router;
