import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard-layout';
import { CheckCircle, Clock, Filter } from 'lucide-react';
import api from '../services/api';

const Notifications = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    if (currentUser.role !== 'student') {
      navigate('/dashboard');
      return;
    }

    fetchNotifications();
  }, [currentUser, navigate]);

  useEffect(() => {
    // Filter notifications based on active tab
    if (activeTab === 'all') {
      setFilteredNotifications(notifications);
    } else if (activeTab === 'unread') {
      setFilteredNotifications(notifications.filter((notif) => !notif.read));
    } else {
      setFilteredNotifications(notifications.filter((notif) => notif.type === activeTab));
    }
  }, [activeTab, notifications]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get(`/notifications/${currentUser.id}`);
      const userNotifications = response.data.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      setNotifications(userNotifications);
      setFilteredNotifications(userNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await api.put(`/notifications/${notification.id}`, { read: true });
        const updatedNotifications = notifications.map((notif) =>
          notif.id === notification.id ? { ...notif, read: true } : notif,
        );
        setNotifications(updatedNotifications);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type
    if (notification.type === 'task') {
      navigate('/student-dashboard/tasks');
    } else if (notification.type === 'project') {
      navigate('/student-dashboard/projects');
    } else if (notification.type === 'message') {
      navigate('/student-dashboard/chat');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(`/notifications/${currentUser.id}/mark-all-read`);
      const updatedNotifications = notifications.map((notif) => ({ ...notif, read: true }));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return '📋';
      case 'project':
        return '📁';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const getUnreadCount = () => {
    return notifications.filter((notif) => !notif.read).length;
  };

  return (
    <DashboardLayout title="Notifications" userRole="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Your Notifications</h2>
          <div className="flex items-center gap-2">
            {getUnreadCount() > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Mark all as read</span>
                <span className="sm:hidden">Mark all</span>
              </button>
            )}
          </div>
        </div>

        <div className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-1 w-full sm:w-auto">
              <div className="flex flex-wrap gap-1">
                <button
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    activeTab === 'all' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                  onClick={() => setActiveTab('all')}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                    activeTab === 'unread' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                  onClick={() => setActiveTab('unread')}
                >
                  Unread
                  {getUnreadCount() > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      {getUnreadCount()}
                    </span>
                  )}
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    activeTab === 'task' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                  onClick={() => setActiveTab('task')}
                >
                  Tasks
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    activeTab === 'project' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                  onClick={() => setActiveTab('project')}
                >
                  Projects
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    activeTab === 'message' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                  onClick={() => setActiveTab('message')}
                >
                  Messages
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 hidden sm:flex">
              <Filter className="h-4 w-4" />
              <span>Filter: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
            </div>
          </div>

          <div className="mt-0">
            {filteredNotifications.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="p-6 text-center">
                  <p className="text-gray-400">No notifications found</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="p-0">
                  <ul className="divide-y divide-gray-700">
                    {filteredNotifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={`p-4 cursor-pointer hover:bg-gray-700/50 ${
                          !notification.read ? 'bg-gray-700/30' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-4">
                          <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <p className={`${!notification.read ? 'font-medium text-white' : 'text-gray-300'}`}>
                              {notification.message}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(notification.timestamp)}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full border ${
                                  notification.type === 'task'
                                    ? 'bg-blue-900/20 text-blue-400 border-blue-500'
                                    : notification.type === 'project'
                                    ? 'bg-green-900/20 text-green-400 border-green-500'
                                    : 'bg-purple-900/20 text-purple-400 border-purple-500'
                                }`}
                              >
                                {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                              </span>
                              {!notification.read && (
                                <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">New</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications; 