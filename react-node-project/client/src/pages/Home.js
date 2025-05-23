import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statsService } from '../services/statsService';

const HomePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    tasks: 0,
    projects: 0,
    messages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await statsService.getStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error);
        setError('حدث خطأ في جلب الإحصائيات');
        // استخدام إحصائيات افتراضية في حالة الخطأ
        setStats({
          users: 1000,
          tasks: 5000,
          projects: 200,
          messages: 10000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // تحديد المسار المناسب بناءً على دور المستخدم
  const getDashboardPath = () => {
    if (!user) return '/signin';
    
    switch (user.role) {
      case 'admin':
        return '/dashboard';
      case 'student':
        return '/student-dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* الشريط العلوي */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">نظام إدارة المهام والدردشة</h1>
          <div>
            {user ? (
              <Link 
                to={getDashboardPath()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                لوحة التحكم
              </Link>
            ) : (
              <div className="space-x-2 rtl:space-x-reverse">
                <Link 
                  to="/signin"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link 
                  to="/signup"
                  className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* القسم الرئيسي */}
      <main>
        {/* قسم الترحيب */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-6">مرحباً بك في نظام إدارة المهام والدردشة</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              منصة متكاملة لإدارة المهام والمشاريع والتواصل مع الفريق في مكان واحد.
            </p>
            <Link 
              to={getDashboardPath()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-3 rounded-md transition-colors"
            >
              {user ? 'الذهاب إلى لوحة التحكم' : 'البدء الآن'}
            </Link>
          </div>
        </section>

        {/* قسم الإحصائيات */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold text-center mb-10">إحصائيات النظام</h3>
            {loading ? (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">جاري تحميل الإحصائيات...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.users}</div>
                  <div className="text-gray-600">المستخدمين</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.tasks}</div>
                  <div className="text-gray-600">المهام</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{stats.projects}</div>
                  <div className="text-gray-600">المشاريع</div>
                </div>
                <div className="bg-amber-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-2">{stats.messages}</div>
                  <div className="text-gray-600">الرسائل</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* قسم الميزات */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold text-center mb-10">الميزات الرئيسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold mb-3">إدارة المهام</h4>
                <p className="text-gray-600">
                  إنشاء وتتبع وإدارة المهام بسهولة، مع إمكانية تعيين المهام للأعضاء وتتبع حالة التقدم.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold mb-3">إدارة المشاريع</h4>
                <p className="text-gray-600">
                  تنظيم المهام في مشاريع، وتتبع تقدم المشروع، وإدارة فريق العمل بكفاءة.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold mb-3">نظام الدردشة</h4>
                <p className="text-gray-600">
                  التواصل مع أعضاء الفريق في الوقت الحقيقي، ومشاركة الملفات والمعلومات بسهولة.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* التذييل */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} نظام إدارة المهام والدردشة. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
