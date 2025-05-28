const express = require('express');
const { connectDB } = require('../db');
const router = express.Router();

router.get('/info', async (req, res) => {
  try {
    const { db } = await connectDB();
    const stats = await db.stats();
    
    res.json({
      type: 'mongodb',
      collections: stats.collections,
      documents: stats.objects,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const { users, tasks, messages, notifications } = await connectDB();
    
    await users.deleteMany({});
    await tasks.deleteMany({});
    await messages.deleteMany({});
    await notifications.deleteMany({});
    
    const sampleUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password_1',
        role: 'admin',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'hashed_password_2',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?img=2'
      }
    ];

    const sampleTasks = [
      {
        id: '1',
        title: 'Implement Login Page',
        description: 'Create a responsive login page with form validation',
        status: 'in-progress',
        priority: 'high',
        assigneeId: '1',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Design Dashboard',
        description: 'Create wireframes for the main dashboard',
        status: 'todo',
        priority: 'medium',
        assigneeId: '2',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      }
    ];

    const sampleMessages = [
      {
        id: '1',
        senderId: '1',
        receiverId: '2',
        content: 'Hey, how\'s the dashboard design coming along?',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        senderId: '2',
        receiverId: '1',
        content: 'Working on it! Should be done by tomorrow.',
        timestamp: new Date().toISOString()
      }
    ];

    const sampleNotifications = [
      {
        id: '1',
        userId: '1',
        type: 'task_assigned',
        message: 'You have been assigned a new task: Implement Login Page',
        relatedId: '1',
        read: false,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        userId: '2',
        type: 'message_received',
        message: 'You have a new message from John Doe',
        relatedId: '1',
        read: false,
        timestamp: new Date().toISOString()
      }
    ];

    await users.insertMany(sampleUsers);
    await tasks.insertMany(sampleTasks);
    await messages.insertMany(sampleMessages);
    await notifications.insertMany(sampleNotifications);

    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/clear', async (req, res) => {
  try {
    const { users, tasks, messages, notifications } = await connectDB();
    
    await users.deleteMany({});
    await tasks.deleteMany({});
    await messages.deleteMany({});
    await notifications.deleteMany({});
    
    res.json({ message: 'Database cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 