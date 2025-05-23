import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/sidebar';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, pending

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tasks');
        setTasks(response.data.tasks);
      } catch (error) {
        console.error('خطأ في جلب المهام:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // تصفية المهام حسب الحالة
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'pending') return task.status === 'pending';
    return true;
  });

  // تغيير حالة المهمة
  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      
      // تحديث حالة المهمة محلياً
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('خطأ في تحديث حالة المهمة:', error);
    }
  };

  // حذف مهمة
  const deleteTask = async (taskId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه المهمة؟')) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
      
      // حذف المهمة محلياً
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('خطأ في حذف المهمة:', error);
    }
  };

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
    <div className="flex h-screen bg-gray-100">
      {/* الشريط الجانبي */}
      <Sidebar />
      
      {/* المحتوى الرئيسي */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">المهام</h1>
            <a
              href="/dashboard/tasks/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              إضافة مهمة جديدة
            </a>
          </div>
          
          {/* أزرار التصفية */}
          <div className="mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-200`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 text-sm font-medium ${
                  filter === 'pending'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-t border-b border-gray-200`}
              >
                قيد التنفيذ
              </button>
              <button
                type="button"
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  filter === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-200`}
              >
                مكتملة
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
              لا توجد مهام متاحة
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العنوان
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإنشاء
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={task.status === 'completed'}
                            onChange={() => toggleTaskStatus(task.id, task.status)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="mr-4">
                            <div className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {task.title}
                            </div>
                            <div className="text-sm text-gray-500">{task.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status === 'completed' ? 'مكتملة' : 'قيد التنفيذ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(task.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
