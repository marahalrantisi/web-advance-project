const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// تحميل متغيرات البيئة
dotenv.config();

// استيراد المسارات
const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const projectsRoutes = require('./routes/projects');
const usersRoutes = require('./routes/users');
const notificationsRoutes = require('./routes/notifications');
const statsRoutes = require('./routes/stats');
const chatRoutes = require('./routes/chat');
const dashboardRoutes = require('./routes/dashboard');

// استيراد وسائط
const { verifyToken } = require('./middleware/auth');

// إنشاء تطبيق Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    
    // Configure mongoose options
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      wtimeoutMS: 2500,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB Connected Successfully!');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Don't exit the process, just log the error
    console.error('Will retry connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// الإعدادات الأساسية
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// تكوين WebSocket
require('./services/websocketService')(io);

// المسارات API
app.use('/api/auth', authRoutes);
app.use('/api/tasks', verifyToken, tasksRoutes);
app.use('/api/projects', verifyToken, projectsRoutes);
app.use('/api/users', verifyToken, usersRoutes);
app.use('/api/notifications', verifyToken, notificationsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', verifyToken, dashboardRoutes);

// خدمة الملفات الثابتة للواجهة الأمامية في الإنتاج
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// تشغيل الخادم
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Connect to database
connectDB();

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  setTimeout(connectDB, 5000);
});

module.exports = { app, server };
