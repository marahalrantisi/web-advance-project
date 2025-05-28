const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./src/db');
const { verifyToken } = require('./src/lib/jwt');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const corsOptions = {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());


app.use('/api', routes);

const server = createServer(app);

const wss = new WebSocketServer({ 
  server,
  path: '/chat'
});

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection from:', req.socket.remoteAddress);

  ws.send(JSON.stringify({ type: 'connection', status: 'connected' }));

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data.type);
      
      switch (data.type) {
        case 'init':
          console.log('Client initialized:', data.userId);
          const { users, messages } = await connectDB();
          const allUsers = await users.find({}).toArray();
          const userMessages = await messages.find({
            $or: [
              { senderId: data.userId },
              { receiverId: data.userId }
            ]
          }).toArray();
          
          console.log(`Found ${allUsers.length} users and ${userMessages.length} messages`);
          
          ws.send(JSON.stringify({ type: 'users', data: allUsers }));
          ws.send(JSON.stringify({ type: 'messages', data: userMessages }));
          ws.send(JSON.stringify({ type: 'init', status: 'success' }));
          break;
        case 'chat':
          console.log('Saving chat message:', data.data);
          try {
            const { messages: msgCollection } = await connectDB();
            if (!data.data.senderId || !data.data.receiverId || !data.data.content) {
              throw new Error('Invalid message data');
            }
            if (!data.data.timestamp) {
              data.data.timestamp = new Date().toISOString();
            }
            if (!data.data.id) {
              data.data.id = Date.now().toString();
            }
            
            const result = await msgCollection.insertOne(data.data);
            console.log('Message saved with ID:', result.insertedId);
            
            const savedMessage = await msgCollection.findOne({ _id: result.insertedId });
            console.log('Verified saved message:', savedMessage);
            
            wss.clients.forEach((client) => {
              if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify({ type: 'chat', data: savedMessage }));
              }
            });
          } catch (error) {
            console.error('Error saving message:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Failed to save message' }));
          }
          break;
        case 'notification':
          console.log('Saving notification:', data.data);
          try {
            const { notifications } = await connectDB();
            if (!data.data.timestamp) {
              data.data.timestamp = new Date().toISOString();
            }
            if (!data.data.id) {
              data.data.id = Date.now().toString();
            }
            
            const notifResult = await notifications.insertOne(data.data);
            console.log('Notification saved with ID:', notifResult.insertedId);
            
            const savedNotification = await notifications.findOne({ _id: notifResult.insertedId });
            console.log('Verified saved notification:', savedNotification);
            
            wss.clients.forEach((client) => {
              if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify({ type: 'notification', data: savedNotification }));
              }
            });
          } catch (error) {
            console.error('Error saving notification:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Failed to save notification' }));
          }
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Error processing message' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`WebSocket server is available at ws://localhost:${PORT}/chat`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }); 