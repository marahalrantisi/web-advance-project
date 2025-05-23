import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';
import Chart from 'chart.js/auto';
import api from '../services/api';

const StudentDashboardHome = () => {
  const { user: currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [studentProjects, setStudentProjects] = useState([]);

  // Chart refs
  const statusChartRef = useRef(null);
  const projectsChartRef = useRef(null);
  const timelineChartRef = useRef(null);
  const statusChartInstance = useRef(null);
  const projectsChartInstance = useRef(null);
  const timelineChartInstance = useRef(null);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      const tasksData = Array.isArray(response.data) ? response.data : response.data.tasks || [];
      const studentTasks = tasksData.filter(task => task.assignedTo === currentUser?.id);
      setTasks(studentTasks);
      setFilteredTasks(studentTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      setFilteredTasks([]);
    }
  }, [currentUser?.id]);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/projects');
      const projectsData = Array.isArray(response.data) ? response.data : response.data.projects || [];
      const studentProjects = projectsData.filter(project => project.assignedTo === currentUser?.id);
      setProjects(studentProjects);
      setStudentProjects(studentProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      setStudentProjects([]);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchTasks();
      fetchProjects();
    }
  }, [fetchTasks, fetchProjects, currentUser?.id]);

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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              Welcome, {currentUser?.name}
            </h2>
            {currentUser?.studentId && (
              <p className="text-muted-foreground">Student ID: {currentUser.studentId}</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="card-dashboard">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Task Status</h3>
            <div className="h-64">
              <canvas ref={statusChartRef} className="w-full h-full"></canvas>
            </div>
          </div>
        </div>

        <div className="card-dashboard">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">My Projects</h3>
            <div className="h-64">
              {studentProjects.length > 0 ? (
                <canvas ref={projectsChartRef} className="w-full h-full"></canvas>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No projects assigned yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-dashboard">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Task Summary</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary p-4 rounded-lg text-center">
                  <h3 className="text-yellow-400 text-lg font-bold">Pending</h3>
                  <p className="text-3xl font-bold text-foreground">
                    {tasks.filter(task => task.status === 'pending').length}
                  </p>
                </div>
                <div className="bg-secondary p-4 rounded-lg text-center">
                  <h3 className="text-blue-400 text-lg font-bold">In Progress</h3>
                  <p className="text-3xl font-bold text-foreground">
                    {tasks.filter(task => task.status === 'in-progress').length}
                  </p>
                </div>
                <div className="bg-secondary p-4 rounded-lg text-center">
                  <h3 className="text-green-400 text-lg font-bold">Completed</h3>
                  <p className="text-3xl font-bold text-foreground">
                    {tasks.filter(task => task.status === 'completed').length}
                  </p>
                </div>
              </div>

              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2 text-foreground">Projects Overview</h3>
                <p className="text-muted-foreground">
                  {studentProjects.length > 0
                    ? `You are assigned to ${studentProjects.length} project${
                        studentProjects.length > 1 ? 's' : ''
                      }.`
                    : 'No projects assigned yet.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-dashboard">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Task Timeline</h3>
          <div className="h-64">
            <canvas ref={timelineChartRef} className="w-full h-full"></canvas>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground">My Tasks</h2>

      {filteredTasks.length === 0 ? (
        <div className="card-dashboard">
          <div className="p-6">
            <p className="text-center text-muted-foreground">You don't have any tasks matching your filters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="card-dashboard">
              <div className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
                  {getStatusBadge(task.status)}
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  {task.hasProblem && (
                    <div className="bg-destructive/20 border border-destructive rounded-md p-2 text-sm">
                      <p className="font-semibold text-destructive-foreground">Problem:</p>
                      <p className="text-muted-foreground">{task.problemDescription}</p>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    <p>Created: {formatDate(task.createdAt)}</p>
                    {task.projectId && (
                      <p>
                        Project: {projects.find((p) => p.id === task.projectId)?.title || 'Unknown Project'}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        task.status === 'in-progress'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                      onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                    >
                      Start Working
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                        task.status === 'completed'
                          ? 'bg-green-600 text-white'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                      onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Complete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboardHome; 