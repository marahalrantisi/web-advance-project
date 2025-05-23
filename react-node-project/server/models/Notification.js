const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['task', 'project', 'message', 'system'],
    default: 'system'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedItem: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'itemModel'
  },
  itemModel: {
    type: String,
    enum: ['Task', 'Project', 'Message']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// إنشاء فهارس للبحث السريع
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
