import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard-layout';
import { Search, Filter } from 'lucide-react';
import api from '../services/api';

const StudentProjects = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [studentProjects, setStudentProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const statusCycle = ['pending', 'in-progress', 'completed', 'on-hold', 'cancelled'];

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/projects');
      const projectsData = Array.isArray(response.data) ? response.data : response.data.projects || [];
      setProjects(projectsData);

      const userProjects = projectsData.filter((project) => project.students.includes(currentUser?.id));
      setStudentProjects(userProjects);
      setFilteredProjects(userProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      setStudentProjects([]);
      setFilteredProjects([]);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    if (currentUser.role !== 'student') {
      navigate('/dashboard');
      return;
    }

    fetchProjects();
  }, [currentUser, navigate, fetchProjects]);

  useEffect(() => {
    let filtered = [...studentProjects];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(term) || project.description.toLowerCase().includes(term),
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((project) => project.category === categoryFilter);
    }
    setFilteredProjects(filtered);
  }, [searchTerm, statusFilter, categoryFilter, studentProjects]);

  const handleUpdateProjectStatus = async (projectId) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      const currentIndex = statusCycle.indexOf(project.status);
      const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

      const updatedProject = {
        ...project,
        status: nextStatus,
        progress:
          nextStatus === 'completed'
            ? 100
            : nextStatus === 'in-progress'
            ? 50
            : nextStatus === 'pending'
            ? 0
            : project.progress,
      };

      await api.put(`/projects/${projectId}`, updatedProject);

      const updatedProjects = projects.map((p) => (p.id === projectId ? updatedProject : p));
      setProjects(updatedProjects);

      const userProjects = updatedProjects.filter((p) => p.students.includes(currentUser.id));
      setStudentProjects(userProjects);
      setFilteredProjects(userProjects);
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const getStatusBadge = (project) => {
    const badgeColors = {
      pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-500',
      'in-progress': 'bg-blue-900/20 text-blue-400 border-blue-500',
      completed: 'bg-green-900/20 text-green-400 border-green-500',
      'on-hold': 'bg-orange-900/20 text-orange-400 border-orange-500',
      cancelled: 'bg-red-900/20 text-red-400 border-red-500',
    };

    const nextStatus = statusCycle[(statusCycle.indexOf(project.status) + 1) % statusCycle.length];

    return (
      <span
        onClick={() => handleUpdateProjectStatus(project.id)}
        className={`px-2 py-1 rounded-full border text-sm cursor-pointer hover:opacity-80 transition ${
          badgeColors[project.status]
        }`}
        title={`Click to change status to "${nextStatus}"`}
      >
        {project.status.replace('-', ' ')}
      </span>
    );
  };

  const getUniqueCategories = () => {
    const categories = new Set();
    studentProjects.forEach((project) => categories.add(project.category));
    return Array.from(categories);
  };

  const getTeamMembers = (studentIds) => {
    return studentIds
      .map((id) => {
        const student = projects.find((user) => user.id === id);
        return student ? student.name : 'Unknown';
      })
      .join(', ');
  };

  return (
    <DashboardLayout title="My Projects" userRole="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-white">My Projects</h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full border bg-blue-900/20 text-blue-400 border-blue-500">
              Total Projects: {studentProjects.length}
            </span>
          </div>
        </div>

        <div className="flex gap-2 md:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Filter size={18} />
          </button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {getUniqueCategories().map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6">
              <p className="text-center text-gray-400">
                {studentProjects.length === 0
                  ? "You don't have any projects assigned to you yet."
                  : 'No projects match your current filters.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-blue-500">{project.title}</h3>
                    {getStatusBadge(project)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-300">{project.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Category:</span>
                        <span className="text-gray-200">{project.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Timeline:</span>
                        <span className="text-gray-200">
                          {project.startDate} to {project.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Team:</span>
                        <span className="text-gray-200">{getTeamMembers(project.students)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Progress:</span>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentProjects;
