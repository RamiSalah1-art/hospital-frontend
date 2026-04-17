import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Appointment } from '../types/index';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    todayAppointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/doctors'),
        api.get('/appointments'),
      ]);

      const patients = patientsRes.data;
      const doctors = doctorsRes.data;
      const appointments = appointmentsRes.data;

      // مواعيد اليوم
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(
        (app: Appointment) => app.date.startsWith(today)
      );

      setStats({
        patients: patients.length,
        doctors: doctors.length,
        todayAppointments: todayAppointments.length,
      });

      // آخر 5 مواعيد
      setRecentAppointments(appointments.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'badge badge-warning',
      CONFIRMED: 'badge badge-success',
      COMPLETED: 'badge badge-info',
      CANCELLED: 'badge badge-danger',
    };
    const labels: Record<string, string> = {
      PENDING: 'قيد الانتظار',
      CONFIRMED: 'مؤكد',
      COMPLETED: 'مكتمل',
      CANCELLED: 'ملغي',
    };
    return <span className={badges[status]}>{labels[status]}</span>;
  };

  const cards = [
    {
      title: 'المرضى',
      description: 'إدارة سجلات المرضى',
      icon: '👥',
      link: '/patients',
      color: 'from-blue-500 to-blue-600',
      count: stats.patients,
    },
    {
      title: 'الأطباء',
      description: 'إدارة بيانات الأطباء',
      icon: '👨‍⚕️',
      link: '/doctors',
      color: 'from-green-500 to-green-600',
      count: stats.doctors,
    },
    {
      title: 'المواعيد',
      description: 'إدارة مواعيد المرضى',
      icon: '📅',
      link: '/appointments',
      color: 'from-purple-500 to-purple-600',
      count: stats.todayAppointments,
      countLabel: 'اليوم',
    },

{
  title: 'الفواتير',
  description: 'إدارة الفواتير والمدفوعات',
  icon: '🧾',
  link: '/invoices',
  color: 'from-yellow-500 to-yellow-600',
  count: 0,
  countLabel: 'إجمالي',
},

  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="text-2xl font-bold text-blue-600">🏥 نظام إدارة المستشفى</h1>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-500">مرحباً،</p>
              <p className="font-semibold text-gray-800">{user?.username} ({user?.role})</p>
            </div>
            <button onClick={logout} className="btn btn-outline">
              تسجيل خروج
            </button>
          </div>
        </div>
      </nav>

      <div className="container-custom">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">لوحة التحكم</h2>
          <p className="text-gray-500 mt-1">مرحباً بك في نظام إدارة المستشفى</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Link key={index} to={card.link}>
              <div className="card group hover:scale-105 transition-transform duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className={`text-5xl bg-gradient-to-r ${card.color} w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    <span className="text-2xl">{card.icon}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800">
                      {loading ? '--' : card.count}
                    </div>
                    {card.countLabel && (
                      <div className="text-sm text-gray-500">{card.countLabel}</div>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-gray-500">{card.description}</p>
                <div className="mt-4 text-blue-600 font-medium group-hover:translate-x-1 transition-transform duration-200 inline-block">
                  عرض الكل ←
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">⏰ آخر المواعيد</h3>
            {loading ? (
              <p className="text-center text-gray-500 py-8">جاري التحميل...</p>
            ) : recentAppointments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد مواعيد حديثة</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>المريض</th>
                    <th>الطبيب</th>
                    <th>التاريخ</th>
                    <th>الوقت</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="font-medium">{app.patient?.name}</td>
                      <td>{app.doctor?.name}</td>
                      <td>{formatDate(app.date)}</td>
                      <td>{app.time}</td>
                      <td>{getStatusBadge(app.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}