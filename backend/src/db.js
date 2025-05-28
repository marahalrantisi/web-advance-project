const { MongoClient } = require('mongodb');
require('dotenv').config();


let client = null;
let db = null;
const MONGODB_URI = "mongodb+srv://s11840585:yL7UEKQpqcUyjYzO@task-management-system.vi6nxyb.mongodb.net/Task-Management-System?retryWrites=true&w=majority";
async function connectDB() {
  try {
    if (client && db) {
      return {
        client,
        db,
        users: db.collection('users'),
        tasks: db.collection('tasks'),
        messages: db.collection('messages'),
        projects: db.collection('projects'),
        notifications: db.collection('notifications')
      };
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('Task-Management-System');
    console.log('Connected to MongoDB Atlas successfully');

    return {
      client,
      db,
      users: db.collection('users'),
      tasks: db.collection('tasks'),
      messages: db.collection('messages'),
      projects: db.collection('projects'),
      notifications: db.collection('notifications')
    };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  connectDB,
  closeDB
}; 