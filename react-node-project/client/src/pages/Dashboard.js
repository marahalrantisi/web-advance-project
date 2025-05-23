import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard-layout';
import { Clock } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    studentsCount: 0,
    tasksCount: 0,
    projectsCount: 0,
    finishedProjectsCount: 0
  });

  const fetchStats = async () => {
    try {
      const [usersResponse, tasksResponse, projectsResponse] = await Promise.all([
        api.get('/users'),
        api.get('/tasks'),
        api.get('/projects')
      ]);

      const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      const tasksData = Array.isArray(tasksResponse.data) ? tasksResponse.data : [];
      const projectsData = Array.isArray(projectsResponse.data) ? projectsResponse.data : [];

      setStats({
        studentsCount: usersData.filter(user => user.role === 'student').length,
        tasksCount: tasksData.length,
        projectsCount: projectsData.length,
        finishedProjectsCount: projectsData.filter(project => project.status === 'completed').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard" userRole="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-500">
            Welcome to the Task Management System
          </h1>
          <Clock className="w-6 h-6 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Number of Projects</h3>
              <p className="text-4xl font-bold text-white">{stats.projectsCount}</p>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Number of Students</h3>
              <p className="text-4xl font-bold text-white">{stats.studentsCount}</p>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Number of Tasks</h3>
              <p className="text-4xl font-bold text-white">{stats.tasksCount}</p>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Finished Projects</h3>
              <p className="text-4xl font-bold text-white">{stats.finishedProjectsCount}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
