/**
 * خدمة قاعدة البيانات
 * تستبدل localStorage بقاعدة بيانات MongoDB
 */

const mongoose = require('mongoose');

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`تم الاتصال بقاعدة البيانات MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`خطأ في الاتصال بقاعدة البيانات: ${error.message}`);
    process.exit(1);
  }
};

// إغلاق الاتصال بقاعدة البيانات
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('تم إغلاق الاتصال بقاعدة البيانات');
  } catch (error) {
    console.error(`خطأ في إغلاق الاتصال بقاعدة البيانات: ${error.message}`);
  }
};

// استيراد النماذج
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// وظائف مساعدة لترحيل البيانات من localStorage إلى قاعدة البيانات
const migrateLocalStorageData = async (userId, data) => {
  try {
    // ترحيل المهام
    if (data.tasks && Array.isArray(data.tasks)) {
      for (const task of data.tasks) {
        const existingTask = await Task.findOne({ 
          title: task.title,
          createdBy: userId
        });
        
        if (!existingTask) {
          const newTask = new Task({
            ...task,
            createdBy: userId,
            assignedTo: task.assignedTo || userId
          });
          
          await newTask.save();
        }
      }
    }
    
    // ترحيل المشاريع
    if (data.projects && Array.isArray(data.projects)) {
      for (const project of data.projects) {
        const existingProject = await Project.findOne({ 
          name: project.name,
          createdBy: userId
        });
        
        if (!existingProject) {
          const newProject = new Project({
            ...project,
            createdBy: userId,
            team: project.team || [userId]
          });
          
          await newProject.save();
        }
      }
    }
    
    return { success: true, message: 'تم ترحيل البيانات بنجاح' };
  } catch (error) {
    console.error('خطأ في ترحيل البيانات:', error);
    return { success: false, message: 'فشل في ترحيل البيانات' };
  }
};

module.exports = {
  connectDB,
  closeDB,
  migrateLocalStorageData,
  models: {
    User,
    Task,
    Project,
    Message,
    Notification
  }
};
