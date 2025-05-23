import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard-layout';
import { MessageSquare, Users, UserCog } from 'lucide-react';
import api from '../services/api';

const Chat = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [studentUsers, setStudentUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('admins');

  const fetchMessages = useCallback(async () => {
    if (!selectedUser) return;
    try {
      const response = await api.get(`/messages?userId=${selectedUser.id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [selectedUser]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages, selectedUser]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      // Filter admin users
      const admins = users.filter(u => u.role === 'admin');
      setAdminUsers(admins);

      // Filter student users (excluding current user)
      const students = users.filter(u => u.role === 'student' && u.id !== currentUser?.id);
      setStudentUsers(students);

      // Set first admin as selected by default if available
      if (admins.length > 0 && !selectedUser) {
        setSelectedUser(admins[0].id);
      }

      // Set first student as selected by default if available
      if (students.length > 0 && !selectedUser) {
        setSelectedUser(students[0].id);
      }
    }
  }, [users, currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage || !currentUser) return;

    const receiverId = activeTab === 'admins' ? selectedUser : selectedUser;
    if (!receiverId) return;

    try {
      const response = await api.post('/messages', {
        senderId: currentUser.id,
        receiverId,
        content: newMessage,
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getUserName = (id) => {
    const user = users.find(user => user.id === id);
    return user ? user.name : 'Unknown User';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getConversation = (userId) => {
    if (!currentUser) return [];

    return messages
      .filter(
        msg =>
          (msg.senderId === currentUser.id && msg.receiverId === userId) ||
          (msg.senderId === userId && msg.receiverId === currentUser.id),
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  return (
    <DashboardLayout title="Chat" userRole={currentUser?.role}>
      <div className="w-full">
        <div className="grid grid-cols-2 mb-6">
          <button
            className={`flex items-center justify-center gap-2 p-4 rounded-t-lg ${
              activeTab === 'admins' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => setActiveTab('admins')}
          >
            <UserCog className="h-4 w-4" />
            <span>Chat with Administrators</span>
          </button>
          <button
            className={`flex items-center justify-center gap-2 p-4 rounded-t-lg ${
              activeTab === 'students' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => setActiveTab('students')}
          >
            <Users className="h-4 w-4" />
            <span>Chat with Students</span>
          </button>
        </div>

        {activeTab === 'admins' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
            <div className="bg-gray-800 border border-gray-700 rounded-lg">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4 text-white">Administrators</h2>
                <div className="h-[calc(100vh-360px)] overflow-y-auto pr-4">
                  <div className="space-y-2">
                    {adminUsers.map((admin) => (
                      <div
                        key={admin.id}
                        className={`p-3 rounded-md cursor-pointer flex items-center space-x-3 ${
                          selectedUser === admin.id ? 'bg-gray-700' : 'hover:bg-gray-700/50'
                        }`}
                        onClick={() => setSelectedUser(admin.id)}
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{admin.name}</p>
                          <p className="text-sm text-gray-400">Administrator</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg md:col-span-2">
              <div className="p-4 flex flex-col h-[calc(100vh-320px)]">
                {selectedUser ? (
                  <>
                    <div className="border-b border-gray-700 pb-4 mb-4">
                      <h2 className="text-xl font-bold text-white">
                        Chatting with {getUserName(selectedUser)}
                      </h2>
                    </div>
                    <div className="flex-grow overflow-y-auto mb-4 pr-4">
                      <div className="space-y-4">
                        {getConversation(selectedUser).map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                msg.senderId === currentUser?.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-white'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">{formatDate(msg.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>Select an administrator from the list to start chatting</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
            <div className="bg-gray-800 border border-gray-700 rounded-lg">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4 text-white">Students</h2>
                <div className="h-[calc(100vh-360px)] overflow-y-auto pr-4">
                  <div className="space-y-2">
                    {studentUsers.length === 0 ? (
                      <p className="text-gray-400 text-center p-4">No other students available</p>
                    ) : (
                      studentUsers.map((student) => (
                        <div
                          key={student.id}
                          className={`p-3 rounded-md cursor-pointer flex items-center space-x-3 ${
                            selectedUser === student.id ? 'bg-gray-700' : 'hover:bg-gray-700/50'
                          }`}
                          onClick={() => setSelectedUser(student.id)}
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{student.name}</p>
                            {student.studentId && (
                              <p className="text-sm text-gray-400">ID: {student.studentId}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg md:col-span-2">
              <div className="p-4 flex flex-col h-[calc(100vh-320px)]">
                {selectedUser ? (
                  <>
                    <div className="border-b border-gray-700 pb-4 mb-4">
                      <h2 className="text-xl font-bold text-white">
                        Chatting with {getUserName(selectedUser)}
                      </h2>
                    </div>
                    <div className="flex-grow overflow-y-auto mb-4 pr-4">
                      <div className="space-y-4">
                        {getConversation(selectedUser).map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                msg.senderId === currentUser?.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-white'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">{formatDate(msg.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>
                      {studentUsers.length === 0
                        ? 'No other students available to chat with'
                        : 'Select a student from the list to start chatting'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Chat;
