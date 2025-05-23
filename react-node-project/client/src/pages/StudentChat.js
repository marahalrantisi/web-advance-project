import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/sidebar';
import io from 'socket.io-client';
import api from '../services/api';

const StudentChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // إنشاء اتصال WebSocket عند تحميل المكون
  useEffect(() => {
    const newSocket = io('/chat', {
      auth: {
        token: sessionStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('تم الاتصال بخادم الدردشة');
    });

    newSocket.on('message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    newSocket.on('disconnect', () => {
      console.log('تم قطع الاتصال بخادم الدردشة');
    });

    setSocket(newSocket);

    // تنظيف الاتصال عند إزالة المكون
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // جلب جهات الاتصال والرسائل
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        // Get all users and filter for admins
        const response = await api.get('/users');
        const usersData = Array.isArray(response.data) ? response.data : response.data.users || [];
        const adminContacts = usersData.filter(contact => 
          contact.role === 'admin' && contact.id !== user?.id
        );
        setContacts(adminContacts);
        
        // تحديد جهة الاتصال الافتراضية إذا كانت متوفرة
        if (adminContacts.length > 0) {
          setSelectedContact(adminContacts[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('خطأ في جلب جهات الاتصال:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchContacts();
    }
  }, [user]);

  // جلب الرسائل عند تغيير جهة الاتصال المحددة
  useEffect(() => {
    if (selectedContact) {
      const fetchMessages = async () => {
        try {
          const response = await api.get(`/messages?userId=${selectedContact.id}`);
          const messagesData = Array.isArray(response.data) ? response.data : response.data.messages || [];
          setMessages(messagesData);
        } catch (error) {
          console.error('خطأ في جلب الرسائل:', error);
        }
      };

      fetchMessages();
    }
  }, [selectedContact]);

  // إرسال رسالة جديدة
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedContact || !socket) return;
    
    const messageData = {
      content: newMessage,
      recipientId: selectedContact.id,
      senderId: user.id,
      timestamp: new Date().toISOString()
    };
    
    socket.emit('sendMessage', messageData);
    
    // إضافة الرسالة إلى القائمة المحلية
    setMessages(prevMessages => [...prevMessages, {
      ...messageData,
      sender: { id: user.id, name: user.name }
    }]);
    
    setNewMessage('');
  };

  // تنسيق التاريخ
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* الشريط الجانبي */}
      <Sidebar />
      
      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">الدردشة</h1>
        </div>
        
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* قائمة جهات الاتصال */}
            <div className="w-1/4 border-l bg-white overflow-y-auto">
              <div className="p-4 border-b">
                <input
                  type="text"
                  placeholder="بحث..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="divide-y">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedContact?.id === contact.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="mr-3">
                        <p className="font-medium text-gray-800">{contact.name}</p>
                        <p className="text-sm text-gray-500 truncate">{contact.lastMessage || 'لا توجد رسائل'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* منطقة الدردشة */}
            <div className="flex-1 flex flex-col">
              {selectedContact ? (
                <>
                  {/* رأس الدردشة */}
                  <div className="p-4 border-b bg-white">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {selectedContact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="mr-3">
                        <p className="font-medium text-gray-800">{selectedContact.name}</p>
                        <p className="text-sm text-gray-500">
                          {selectedContact.online ? 'متصل الآن' : 'غير متصل'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* محتوى الدردشة */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full text-gray-500">
                        ابدأ محادثة جديدة
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.sender.id === user.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                                message.sender.id === user.id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white text-gray-800 border'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className={`text-xs mt-1 text-right ${
                                message.sender.id === user.id ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* نموذج إرسال الرسائل */}
                  <div className="p-4 border-t bg-white">
                    <form onSubmit={sendMessage} className="flex">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب رسالة..."
                        className="flex-1 px-4 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-l-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        إرسال
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex justify-center items-center text-gray-500">
                  اختر جهة اتصال لبدء المحادثة
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentChatPage;
