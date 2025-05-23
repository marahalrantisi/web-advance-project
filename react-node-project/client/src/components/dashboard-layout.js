import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Home, FolderOpen, CheckSquare, MessageSquare, LogOut } from 'lucide-react';

const DashboardLayout = ({ children, title, userRole }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (userRole === 'admin' && user.role !== 'admin') {
      navigate('/student-dashboard');
    } else if (userRole === 'student' && user.role !== 'student') {
      navigate('/dashboard');
    }
  }, [navigate, user, userRole]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const navLinks =
    userRole === 'admin'
      ? [
          { href: '/dashboard', label: 'Dashboard', icon: Home },
          { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
          { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
          { href: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
        ]
      : [
          { href: '/student-dashboard', label: 'Dashboard', icon: Home },
          { href: '/student-dashboard/projects', label: 'Projects', icon: FolderOpen },
          { href: '/student-dashboard/tasks', label: 'Tasks', icon: CheckSquare },
          { href: '/student-dashboard/notifications', label: 'Notifications', icon: MessageSquare },
          { href: '/student-dashboard/chat', label: 'Chat', icon: MessageSquare },
        ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="mr-2 md:hidden p-2 hover:bg-gray-700 rounded-md"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-bold truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-gray-300">{user?.name || 'User'}</span>
              <button
                className="px-3 py-1 border border-gray-600 rounded-md hover:bg-gray-700 flex items-center gap-1"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
            <button
              className="p-2 hover:bg-gray-700 rounded-md md:hidden"
              onClick={handleLogout}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile (Overlay) */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-200 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        <aside
          className={`fixed md:block top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-gray-800 border-r border-gray-700 z-30 overflow-y-auto transform transition-transform duration-200 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold">Task Management</h2>
            <button
              className="p-2 hover:bg-gray-700 rounded-md md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <link.icon className="h-5 w-5 text-blue-400" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            
              <li className="md:hidden">
                <button
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 text-red-400" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 md:ml-64">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 