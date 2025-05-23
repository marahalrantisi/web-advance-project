import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard-layout';
import { Search, Filter, Users, BookOpen, MessageSquare, Bell, Settings } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
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
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    if (currentUser.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchDashboardStats();
  }, [currentUser, navigate]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch users to get total students count
      const usersResponse = await api.get('/users');
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.users || [];
      const totalStudents = users.filter(user => user.role === 'student').length;

      // Fetch projects to get project statistics
      const projectsResponse = await api.get('/projects');
      const projects = Array.isArray(projectsResponse.data) ? projectsResponse.data : projectsResponse.data.projects || [];
      
      // Calculate project statistics
      const totalProjects = projects.length;
      const activeProjects = projects.filter(project => project.status === 'in-progress').length;
      const completedProjects = projects.filter(project => project.status === 'completed').length;

      // Fetch tasks to get pending tasks count
      const tasksResponse = await api.get('/tasks');
      const tasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : tasksResponse.data.tasks || [];
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;

      // Fetch messages to get unread messages count
      const messagesResponse = await api.get('/messages');
      const messages = Array.isArray(messagesResponse.data) ? messagesResponse.data : messagesResponse.data.messages || [];
      const unreadMessages = messages.filter(message => !message.read && message.recipientId === currentUser.id).length;

      // Update stats state with calculated values
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

  const handleSectionChange = (section) => {
    setActiveSection(section);
    switch (section) {
      case 'students':
        navigate('/admin/students');
        break;
      case 'projects':
        navigate('/admin/projects');
        break;
      case 'chat':
        navigate('/admin/chat');
        break;
      case 'notifications':
        navigate('/admin/notifications');
        break;
      default:
        navigate('/admin');
    }
  };

  const renderContent = () => {
    // If there's a nested route, render it
    if (window.location.pathname !== '/admin') {
      return <Outlet />;
    }

    // Otherwise render the overview dashboard
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Students</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.totalStudents}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Projects</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.totalProjects}</h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full">
              <BookOpen className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Projects</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.activeProjects}</h3>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-full">
              <BookOpen className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Completed Projects</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.completedProjects}</h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full">
              <BookOpen className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending Tasks</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.pendingTasks}</h3>
            </div>
            <div className="p-3 bg-red-500/10 rounded-full">
              <Bell className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Unread Messages</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.unreadMessages}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <MessageSquare className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Admin Dashboard" userRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full border bg-blue-900/20 text-blue-400 border-blue-500">
              Welcome, {currentUser?.name}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            onClick={() => handleSectionChange('overview')}
            className={`p-4 rounded-lg border ${
              activeSection === 'overview'
                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <BookOpen className="w-6 h-6" />
              <span>Overview</span>
            </div>
          </button>

          <button
            onClick={() => handleSectionChange('students')}
            className={`p-4 rounded-lg border ${
              activeSection === 'students'
                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Users className="w-6 h-6" />
              <span>Students</span>
            </div>
          </button>

          <button
            onClick={() => handleSectionChange('projects')}
            className={`p-4 rounded-lg border ${
              activeSection === 'projects'
                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <BookOpen className="w-6 h-6" />
              <span>Projects</span>
            </div>
          </button>

          <button
            onClick={() => handleSectionChange('chat')}
            className={`p-4 rounded-lg border ${
              activeSection === 'chat'
                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              <span>Chat</span>
            </div>
          </button>

          <button
            onClick={() => handleSectionChange('notifications')}
            className={`p-4 rounded-lg border ${
              activeSection === 'notifications'
                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Bell className="w-6 h-6" />
              <span>Notifications</span>
            </div>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard; 