import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/sidebar';
import api from '../services/api';

const StudentNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get all notifications and filter for the current user
        const response = await api.get('/notifications');
        const userNotifications = response.data.filter(
          notification => notification.userId === user?.id
        );
        setNotifications(userNotifications);
        setLoading(false);
      } catch (error) {
        console.error('خطأ في جلب الإشعارات:', error);
        setNotifications([]);
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // تحديد حالة الإشعار كمقروء
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      
      // تحديث حالة الإشعار محلياً
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('خطأ في تحديث حالة الإشعار:', error);
    }
  };

  // حذف إشعار
  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      
      // حذف الإشعار محلياً
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('خطأ في حذف الإشعار:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* الشريط الجانبي */}
      <Sidebar />
      
      {/* المحتوى الرئيسي */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">الإشعارات</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow p-4 ${
                    !notification.read ? 'border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentNotifications;
