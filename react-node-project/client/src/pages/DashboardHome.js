import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0, pending: 0 },
    projects: { total: 0, active: 0, completed: 0 },
    messages: { total: 0, unread: 0 }
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // جلب الإحصائيات
        const statsResponse = await api.get('/dashboard/stats');
        
        // جلب المهام الأخيرة
        const tasksResponse = await api.get('/tasks/recent');
        
        setStats(statsResponse.data);
        setRecentTasks(tasksResponse.data.tasks);
      } catch (error) {
        console.error('خطأ في جلب بيانات لوحة التحكم:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">لوحة التحكم</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">المهام</h3>
                  <p className="text-3xl font-bold text-gray-800">{stats.tasks.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">مكتملة</span>
                  <span className="font-medium">{stats.tasks.completed}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">قيد التنفيذ</span>
                  <span className="font-medium">{stats.tasks.pending}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">المشاريع</h3>
                  <p className="text-3xl font-bold text-gray-800">{stats.projects.total}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">نشطة</span>
                  <span className="font-medium">{stats.projects.active}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">مكتملة</span>
                  <span className="font-medium">{stats.projects.completed}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">الرسائل</h3>
                  <p className="text-3xl font-bold text-gray-800">{stats.messages.total}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">غير مقروءة</span>
                  <span className="font-medium">{stats.messages.unread}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* المهام الأخيرة */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">المهام الأخيرة</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentTasks.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  لا توجد مهام حديثة
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div key={task._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">{task.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status === 'completed' ? 'مكتملة' : 
                           task.status === 'in-progress' ? 'قيد التنفيذ' : 
                           'معلقة'}
                        </span>
                        <span className="text-xs text-gray-500 mr-4">{formatDate(task.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardHome; 