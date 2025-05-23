import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import "./index.css";

// صفحات المستخدم العام
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

// صفحات لوحة التحكم
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import Chat from './pages/Chat';
import CreateTask from './pages/CreateTask';
import AdminDashboard from './pages/AdminDashboard';
import AdminDashboardHome from './pages/AdminDashboardHome';
import AdminStudents from './pages/AdminStudents';
import AdminProjects from './pages/AdminProjects';
import AdminChat from './pages/AdminChat';
import AdminNotifications from './pages/AdminNotifications';

// صفحات الطالب
import StudentDashboard from './pages/StudentDashboard';
import StudentDashboardHome from './pages/StudentDashboardHome';
import StudentProjects from './pages/StudentProjects';
import StudentTasks from './pages/StudentTasks';
import StudentChat from './pages/StudentChat';
import StudentNotifications from './pages/StudentNotifications';

// مكونات الحماية
import ProtectedRoute from './components/ProtectedRoute';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* مسارات المستخدم العام */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* مسارات لوحة التحكم */}
        <Route path="/dashboard" element={<ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="projects" element={<Projects />} />
          <Route path="chat" element={<Chat />} />
          <Route path="tasks/create" element={<CreateTask />} />
        </Route>

        {/* مسارات لوحة تحكم المشرف */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}>
          <Route index element={<AdminDashboardHome />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>
        
        {/* مسارات الطالب */}
        <Route path="/student-dashboard" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>}>
          <Route index element={<StudentDashboardHome />} />
          <Route path="tasks" element={<StudentTasks />} />
          <Route path="projects" element={<StudentProjects />} />
          <Route path="chat" element={<StudentChat />} />
          <Route path="notifications" element={<StudentNotifications />} />
        </Route>
        
        {/* مسار غير موجود */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
