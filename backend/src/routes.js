const express = require('express');
const { connectDB } = require('./db');
const { generateToken, verifyToken } = require('./lib/jwt');
const databaseRoutes = require('./routes/database');

const router = express.Router();

router.use('/database', databaseRoutes);

router.get('/users', async (_req, res) => {
  try {
    const { users } = await connectDB();
    const all = await users.find().toArray();
    res.json(all);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { users } = await connectDB();
    const result = await users.insertOne(req.body);
    res.json({ insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { users } = await connectDB();
    const { id } = req.params;
    await users.updateOne({ _id: id }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { users } = await connectDB();
    const { id } = req.params;
    await users.deleteOne({ _id: id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tasks', async (_req, res) => {
  try {
    const { tasks } = await connectDB();
    const all = await tasks.find().toArray();
    res.json(all);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const { tasks } = await connectDB();
    const result = await tasks.insertOne(req.body);
    res.json({ insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    const { tasks } = await connectDB();
    const { id } = req.params;
    await tasks.updateOne({ _id: id }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  try {
    const { tasks } = await connectDB();
    const { id } = req.params;
    await tasks.deleteOne({ _id: id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/messages', async (_req, res) => {
  try {
    const { messages } = await connectDB();
    const all = await messages.find().toArray();
    res.json(all);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const { messages } = await connectDB();
    const result = await messages.insertOne(req.body);
    res.json({ insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    const { messages } = await connectDB();
    const { id } = req.params;
    await messages.deleteOne({ _id: id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { users } = await connectDB();
    const { email, password } = req.body;
    const user = await users.findOne({ email, password });
    
    if (user) {
      const token = generateToken(user);
      res.json({ user, token });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { users } = await connectDB();
    const { email } = req.body;
    
    const exists = await users.findOne({ email });
    if (exists) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }
    
    const result = await users.insertOne(req.body);
    const user = { ...req.body, _id: result.insertedId };
    const token = generateToken(user);
    
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 