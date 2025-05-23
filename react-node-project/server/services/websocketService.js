/**
 * خدمة WebSocket
 * تستبدل GraphQL بـ Socket.io للدردشة المباشرة
 */

module.exports = function(io) {
  // مجموعة المستخدمين المتصلين
  const connectedUsers = new Map();
  
  // إعداد مساحة الدردشة
  const chatNamespace = io.of('/chat');
  
  // التعامل مع المصادقة
  chatNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('غير مصرح'));
    }
    
    // يمكن هنا التحقق من صحة الرمز JWT
    // لتبسيط المثال، نفترض أن الرمز صالح
    
    next();
  });
  
  // التعامل مع الاتصال
  chatNamespace.on('connection', (socket) => {
    console.log('مستخدم جديد متصل:', socket.id);
    
    // تسجيل المستخدم عند الاتصال
    socket.on('register', (userData) => {
      const userId = userData.id;
      
      // تخزين معلومات المستخدم
      connectedUsers.set(userId, {
        socketId: socket.id,
        userData
      });
      
      // إرسال حالة الاتصال للمستخدمين الآخرين
      socket.broadcast.emit('userStatus', {
        userId,
        status: 'online'
      });
      
      // إرسال قائمة المستخدمين المتصلين
      const onlineUsers = [];
      connectedUsers.forEach((value, key) => {
        onlineUsers.push({
          id: key,
          ...value.userData
        });
      });
      
      socket.emit('onlineUsers', onlineUsers);
      
      console.log(`المستخدم ${userId} مسجل الآن`);
    });
    
    // إرسال رسالة
    socket.on('sendMessage', async (messageData) => {
      try {
        const { recipientId, senderId, content, timestamp } = messageData;
        
        // حفظ الرسالة في قاعدة البيانات
        const Message = require('../models/Message');
        
        const conversationId = Message.generateConversationId(senderId, recipientId);
        
        const newMessage = new Message({
          content,
          sender: senderId,
          recipient: recipientId,
          timestamp,
          conversationId
        });
        
        await newMessage.save();
        
        // إرسال الرسالة للمستلم إذا كان متصلاً
        const recipientInfo = connectedUsers.get(recipientId);
        if (recipientInfo) {
          const senderInfo = connectedUsers.get(senderId);
          
          chatNamespace.to(recipientInfo.socketId).emit('message', {
            id: newMessage._id,
            content,
            timestamp,
            sender: {
              id: senderId,
              name: senderInfo ? senderInfo.userData.name : 'مستخدم غير معروف'
            }
          });
        }
        
        // إنشاء إشعار للمستلم
        const Notification = require('../models/Notification');
        const User = require('../models/User');
        
        const sender = await User.findById(senderId);
        
        const notification = new Notification({
          title: 'رسالة جديدة',
          message: `لديك رسالة جديدة من ${sender.name}`,
          type: 'message',
          recipient: recipientId,
          sender: senderId,
          relatedItem: newMessage._id,
          itemModel: 'Message'
        });
        
        await notification.save();
        
        console.log(`تم إرسال رسالة من ${senderId} إلى ${recipientId}`);
      } catch (error) {
        console.error('خطأ في إرسال الرسالة:', error);
        socket.emit('error', { message: 'فشل في إرسال الرسالة' });
      }
    });
    
    // الكتابة
    socket.on('typing', (data) => {
      const { recipientId, senderId } = data;
      
      const recipientInfo = connectedUsers.get(recipientId);
      if (recipientInfo) {
        chatNamespace.to(recipientInfo.socketId).emit('typing', { senderId });
      }
    });
    
    // توقف الكتابة
    socket.on('stopTyping', (data) => {
      const { recipientId, senderId } = data;
      
      const recipientInfo = connectedUsers.get(recipientId);
      if (recipientInfo) {
        chatNamespace.to(recipientInfo.socketId).emit('stopTyping', { senderId });
      }
    });
    
    // قطع الاتصال
    socket.on('disconnect', () => {
      console.log('انقطع اتصال المستخدم:', socket.id);
      
      // البحث عن المستخدم وإزالته من القائمة
      let disconnectedUserId = null;
      
      connectedUsers.forEach((value, key) => {
        if (value.socketId === socket.id) {
          disconnectedUserId = key;
        }
      });
      
      if (disconnectedUserId) {
        connectedUsers.delete(disconnectedUserId);
        
        // إرسال حالة الانقطاع للمستخدمين الآخرين
        socket.broadcast.emit('userStatus', {
          userId: disconnectedUserId,
          status: 'offline'
        });
        
        console.log(`المستخدم ${disconnectedUserId} غير متصل الآن`);
      }
    });
  });
  
  return chatNamespace;
};
