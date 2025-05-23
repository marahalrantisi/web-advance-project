import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  // تحديد القوائم بناءً على دور المستخدم
  const getMenuItems = () => {
    if (!user) return [];
    
    if (user.role === 'admin') {
      return [
        { name: 'لوحة التحكم', path: '/dashboard', icon: 'home' },
        { name: 'المهام', path: '/dashboard/tasks', icon: 'clipboard' },
        { name: 'المشاريع', path: '/dashboard/projects', icon: 'folder' },
        { name: 'الدردشة', path: '/dashboard/chat', icon: 'message-circle' },
        { name: 'قاعدة البيانات', path: '/admin/database', icon: 'database' }
      ];
    } else if (user.role === 'student') {
      return [
        { name: 'لوحة التحكم', path: '/student-dashboard', icon: 'home' },
        { name: 'المهام', path: '/student-dashboard/tasks', icon: 'clipboard' },
        { name: 'المشاريع', path: '/student-dashboard/projects', icon: 'folder' },
        { name: 'الدردشة', path: '/student-dashboard/chat', icon: 'message-circle' },
        { name: 'الإشعارات', path: '/student-dashboard/notifications', icon: 'bell' }
      ];
    } else {
      return [
        { name: 'لوحة التحكم', path: '/dashboard', icon: 'home' },
        { name: 'المهام', path: '/dashboard/tasks', icon: 'clipboard' },
        { name: 'المشاريع', path: '/dashboard/projects', icon: 'folder' },
        { name: 'الدردشة', path: '/dashboard/chat', icon: 'message-circle' }
      ];
    }
  };
  
  const menuItems = getMenuItems();
  
  // تسجيل الخروج
  const handleLogout = () => {
    logout();
    window.location.href = '/signin';
  };
  
  // أيقونات القائمة
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'home':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        );
      case 'clipboard':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        );
      case 'folder':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
        );
      case 'message-circle':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        );
      case 'bell':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
        );
      case 'database':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      {/* رأس الشريط الجانبي */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">نظام إدارة المهام</h2>
      </div>
      
      {/* معلومات المستخدم */}
      {user && (
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="mr-3">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* قائمة التنقل */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="flex items-center p-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <span className="text-gray-500">{getIcon(item.icon)}</span>
                <span className="mr-3">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* تذييل الشريط الجانبي */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center p-2 w-full text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span className="mr-3">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
