import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// مكون مسار محمي
// يتحقق من حالة المصادقة ويعيد توجيه المستخدم إذا لم يكن مصادقاً
const ProtectedRoute = ({ children, role = null }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // إذا كان التحميل جارياً، اعرض شاشة التحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مصادقاً، أعد توجيهه إلى صفحة تسجيل الدخول
  if (!user) {
    navigate('/signin', { replace: true });
    return null;
  }

  // إذا كان هناك دور محدد وكان دور المستخدم لا يطابقه، أعد توجيهه إلى الصفحة المناسبة
  if (role && user.role !== role) {
    if (user.role === 'admin') {
      navigate('/dashboard', { replace: true });
    } else if (user.role === 'student') {
      navigate('/student-dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
    return null;
  }

  // إذا كان المستخدم مصادقاً ودوره مناسب، اعرض المحتوى
  return children;
};

export default ProtectedRoute;
