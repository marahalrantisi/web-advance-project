const { MongoClient } = require('mongodb');
require('dotenv').config();


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
    content: 'Hey, how the dashboard design coming along?',
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

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas successfully');

    const db = client.db('Task-Management-System');

    await db.collection('users').deleteMany({});
    await db.collection('tasks').deleteMany({});
    await db.collection('messages').deleteMany({});
    await db.collection('notifications').deleteMany({});

    await db.collection('users').insertMany(sampleUsers);
    await db.collection('tasks').insertMany(sampleTasks);
    await db.collection('messages').insertMany(sampleMessages);
    await db.collection('notifications').insertMany(sampleNotifications);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

seedDatabase(); 