import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard-layout';
import api from '../services/api';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status cycle order
  const statusCycle = ['pending', 'in-progress', 'completed', 'on-hold', 'cancelled'];

  // New project form state
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    category: 'Web Development',
    status: 'pending',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    members: [],
    completionPercentage: 0
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/projects');
      const projectsData = response.data || [];
      setProjects(projectsData);
      setFilteredProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to fetch projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Array.isArray(projects)) return;

    let filtered = [...projects];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.category.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-500';
      case 'in-progress':
        return 'bg-blue-900/20 text-blue-400 border-blue-500';
      case 'completed':
        return 'bg-green-900/20 text-green-400 border-green-500';
      case 'on-hold':
        return 'bg-orange-900/20 text-orange-400 border-orange-500';
      case 'cancelled':
        return 'bg-red-900/20 text-red-400 border-red-500';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-500';
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/projects', newProject);
      setProjects([...projects, response.data]);
      setFilteredProjects([...filteredProjects, response.data]);
      setIsAddProjectOpen(false);
      setNewProject({
        name: '',
        description: '',
        category: 'Web Development',
        status: 'pending',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        members: [],
        completionPercentage: 0
      });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const cycleProjectStatus = (project) => {
    const currentIndex = statusCycle.indexOf(project.status);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    const newStatus = statusCycle[nextIndex];

    const updatedProject = {
      ...project,
      status: newStatus
    };

    api.put(`/projects/${project.id}`, updatedProject)
      .then(response => {
        const updatedProjects = projects.map(p => 
          p.id === project.id ? response.data : p
        );
        setProjects(updatedProjects);
      })
      .catch(error => {
        console.error('Error updating project status:', error);
      });
  };

  return (
    <DashboardLayout title="Projects Management" userRole="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <button
            onClick={() => setIsAddProjectOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Create New Project
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && (!Array.isArray(filteredProjects) || filteredProjects.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-400">No projects found</p>
          </div>
        )}

        {/* Project List */}
        {!loading && !error && Array.isArray(filteredProjects) && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setSelectedProject(project)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-4">{project.description}</p>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><span className="font-medium">Category:</span> {project.category}</p>
                    <p><span className="font-medium">Progress:</span> {project.completionPercentage}%</p>
                    <p><span className="font-medium">Start Date:</span> {new Date(project.startDate).toLocaleDateString()}</p>
                    {project.endDate && (
                      <p><span className="font-medium">End Date:</span> {new Date(project.endDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Project Dialog */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Add New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white min-h-[100px]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Database">Database</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Security">Security</option>
                      <option value="DevOps">DevOps</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on-hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                    <input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddProjectOpen(false)}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Add Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Project Details Sidebar */}
      {selectedProject && (
        <div className="fixed top-0 right-0 h-full w-[320px] md:w-[400px] bg-gray-900 text-white shadow-lg p-6 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-cyan-400">{selectedProject.name}</h3>
            <button
              onClick={() => setSelectedProject(null)}
              className="p-2 hover:bg-gray-800 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400">Description</h4>
              <p className="text-white">{selectedProject.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400">Category</h4>
              <p className="text-white">{selectedProject.category}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400">Status</h4>
              <button
                onClick={() => cycleProjectStatus(selectedProject)}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}
              >
                {selectedProject.status}
              </button>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400">Progress</h4>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{ width: `${selectedProject.completionPercentage}%` }}
                ></div>
              </div>
              <p className="text-white mt-1">{selectedProject.completionPercentage}%</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400">Dates</h4>
              <p className="text-white">Start: {new Date(selectedProject.startDate).toLocaleDateString()}</p>
              {selectedProject.endDate && (
                <p className="text-white">End: {new Date(selectedProject.endDate).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Projects;
