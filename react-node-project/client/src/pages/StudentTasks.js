import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/sidebar';
import api from '../services/api';

const StudentTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks');
        // Filter tasks for the current user
        const userTasks = response.data.filter(task => task.assignedTo === user?.id);
        setTasks(userTasks);
        setLoading(false);
      } catch (error) {
        console.error('خطأ في جلب المهام:', error);
        setTasks([]);
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    const badgeColors = {
      pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-500',
      'in-progress': 'bg-blue-900/20 text-blue-400 border-blue-500',
      completed: 'bg-green-900/20 text-green-400 border-green-500',
    };

    return (
      <span className={`px-2 py-1 rounded-full border text-sm ${badgeColors[status]}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

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

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      // Update task status locally
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('خطأ في تحديث حالة المهمة:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">المهام</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                قيد الانتظار
              </button>
              <button
                onClick={() => setFilter('in-progress')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'in-progress'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                قيد التنفيذ
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
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
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد مهام</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                      <div className="mt-2">
                        {getStatusBadge(task.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDate(task.createdAt)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                          className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                          إكمال
                        </button>
                      )}
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          بدء العمل
                        </button>
                      )}
                    </div>
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

export default StudentTasks;
