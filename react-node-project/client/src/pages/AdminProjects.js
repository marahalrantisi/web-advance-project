import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Search, Filter, Users, BookOpen, MessageSquare, Bell, CheckCircle, Clock } from 'lucide-react';

const AdminProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    studentId: '',
    startDate: '',
    endDate: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchProjects();
    fetchStudents();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      const projectsData = Array.isArray(response.data) ? response.data : response.data.projects || [];
      setProjects(projectsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/users');
      const usersData = Array.isArray(response.data) ? response.data : response.data.users || [];
      const studentsData = usersData.filter(user => user.role === 'student');
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await api.patch(`/projects/${projectId}`, { status: newStatus });
      setProjects(projects.map(project => 
        project.id === projectId ? { ...project, status: newStatus } : project
      ));
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/projects', newProject);
      setProjects([...projects, response.data]);
      setShowAddProjectModal(false);
      setNewProject({
        title: '',
        description: '',
        studentId: '',
        startDate: '',
        endDate: '',
        status: 'pending'
      });
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Management</h2>
        <button
          onClick={() => setShowAddProjectModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="text-gray-400 mt-1">{project.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-400">
                    Assigned to: {students.find(s => s.id === project.studentId)?.name || 'Unknown'}
                  </span>
                  <span className="text-sm text-gray-400">
                    Start: {new Date(project.startDate).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-400">
                    End: {new Date(project.endDate).toLocaleDateString()}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    project.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange(project.id, 'completed')}
                  className={`p-2 rounded-md ${
                    project.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'hover:bg-gray-700'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleStatusChange(project.id, 'in-progress')}
                  className={`p-2 rounded-md ${
                    project.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-gray-700'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Project</h3>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign to Student</label>
                <select
                  value={newProject.studentId}
                  onChange={(e) => setNewProject({ ...newProject, studentId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects; 