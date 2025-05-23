const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// إنشاء فهرس للبحث السريع حسب المحادثة
messageSchema.index({ conversationId: 1, timestamp: 1 });

// طريقة لإنشاء معرف المحادثة من معرفات المستخدمين
messageSchema.statics.generateConversationId = function(userId1, userId2) {
  // ترتيب المعرفات لضمان اتساق معرف المحادثة بغض النظر عن ترتيب المستخدمين
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}-${sortedIds[1]}`;
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
