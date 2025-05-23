import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard-layout';

const StudentDashboard = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default StudentDashboard;
