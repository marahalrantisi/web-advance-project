const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Message = require('../models/Message');

// Get user's chat contacts
router.get('/contacts', verifyToken, async (req, res) => {
  try {
    // Get all users except the current user
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name email role lastActive')
      .lean();

    // Get the last message for each contact
    const contacts = await Promise.all(users.map(async (user) => {
      const lastMessage = await Message.findOne({
        $or: [
          { sender: req.user.id, recipient: user._id },
          { sender: user._id, recipient: req.user.id }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        online: user.lastActive > new Date(Date.now() - 5 * 60 * 1000), // Online if active in last 5 minutes
        lastMessage: lastMessage ? lastMessage.content : null,
        lastMessageTime: lastMessage ? lastMessage.createdAt : null
      };
    }));

    res.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Error fetching contacts' });
  }
});

// Get messages between two users
router.get('/messages/:userId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user.id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name')
    .lean();

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a new message
router.post('/messages', verifyToken, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    const message = new Message({
      sender: req.user.id,
      recipient: recipientId,
      content
    });

    await message.save();

    // Populate sender info before sending response
    await message.populate('sender', 'name');

    res.status(201).json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

module.exports = router; 