import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminDashboardHome = () => {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingTasks: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch users to get total students
      const usersResponse = await api.get('/users');
      const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.users || [];
      const totalStudents = usersData.filter(user => user.role === 'student').length;

      // Fetch projects
      const projectsResponse = await api.get('/projects');
      const projectsData = Array.isArray(projectsResponse.data) ? projectsResponse.data : projectsResponse.data.projects || [];
      const totalProjects = projectsData.length;
      const activeProjects = projectsData.filter(project => project.status === 'in-progress').length;
      const completedProjects = projectsData.filter(project => project.status === 'completed').length;

      // Fetch tasks
      const tasksResponse = await api.get('/tasks');
      const tasksData = Array.isArray(tasksResponse.data) ? tasksResponse.data : tasksResponse.data.tasks || [];
      const pendingTasks = tasksData.filter(task => task.status === 'pending').length;

      // Fetch messages
      const messagesResponse = await api.get('/messages');
      const messagesData = Array.isArray(messagesResponse.data) ? messagesResponse.data : messagesResponse.data.messages || [];
      const unreadMessages = messagesData.filter(message => !message.read && message.receiverId === currentUser.id).length;

      setStats({
        totalStudents,
        totalProjects,
        activeProjects,
        completedProjects,
        pendingTasks,
        unreadMessages
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Students Stats */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Students</h3>
          <p className="text-3xl font-bold text-blue-500">{stats.totalStudents}</p>
          <p className="text-sm text-gray-400 mt-2">Total registered students</p>
        </div>

        {/* Projects Stats */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Projects</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Total:</span>
              <span className="text-white">{stats.totalProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active:</span>
              <span className="text-blue-500">{stats.activeProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Completed:</span>
              <span className="text-green-500">{stats.completedProjects}</span>
            </div>
          </div>
        </div>

        {/* Tasks Stats */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Tasks</h3>
          <p className="text-3xl font-bold text-yellow-500">{stats.pendingTasks}</p>
          <p className="text-sm text-gray-400 mt-2">Pending tasks</p>
        </div>

        {/* Messages Stats */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Messages</h3>
          <p className="text-3xl font-bold text-purple-500">{stats.unreadMessages}</p>
          <p className="text-sm text-gray-400 mt-2">Unread messages</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome; 