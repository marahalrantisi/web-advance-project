import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminChat = () => {
  const { user: currentUser } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    fetchContacts();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
      setupWebSocket();
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupWebSocket = () => {
    if (ws.current) {
      ws.current.close();
    }

    // Use the correct WebSocket URL from your environment
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
    ws.current = new WebSocket(`${wsUrl}/ws?userId=${currentUser.id}&contactId=${selectedContact.id}`);

    ws.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (selectedContact) {
          setupWebSocket();
        }
      }, 3000);
    };
  };

  const fetchContacts = async () => {
    try {
      const response = await api.get('/users');
      const usersData = Array.isArray(response.data) ? response.data : response.data.users || [];
      const studentContacts = usersData.filter(user => user.role === 'student');
      setContacts(studentContacts);
      if (studentContacts.length > 0) {
        setSelectedContact(studentContacts[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages?userId=${selectedContact.id}`);
      const messagesData = Array.isArray(response.data) ? response.data : response.data.messages || [];
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedContact.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      // First, send the message through the REST API
      const response = await api.post('/messages', messageData);
      const savedMessage = response.data;

      // Update the local state with the saved message
      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');

      // Then, try to send through WebSocket if available
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(savedMessage));
      } else {
        console.log('WebSocket not connected, message saved but not sent in real-time');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error to user
      alert('Failed to send message. Please try again.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Contacts List */}
      <div className="w-1/4 border-r border-gray-700 p-4">
        <h2 className="text-xl font-semibold text-white mb-4">Students</h2>
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-3 rounded-lg cursor-pointer ${
                selectedContact?.id === contact.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="font-medium">{contact.name}</div>
              <div className="text-sm opacity-75">{contact.email}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">{selectedContact.name}</h3>
              <p className="text-sm text-gray-400">{selectedContact.email}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderId === currentUser.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    newMessage.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a student to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat; 