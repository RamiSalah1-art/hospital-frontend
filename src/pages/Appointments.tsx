import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Appointment, Patient, Doctor } from '../types/index';

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/patients'),
        api.get('/doctors'),
      ]);
      setAppointments(appointmentsRes.data);
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/appointments', {
        ...formData,
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
      });
      setShowForm(false);
      setFormData({ patientId: '', doctorId: '', date: '', time: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to create appointment');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete appointment');
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  if (loading) {
    return (
      <div className="container-custom">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title">
          <span>📅</span>
          إدارة المواعيد
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'إلغاء' : '+ حجز موعد جديد'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2 className="form-title">حجز موعد جديد</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <select
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
              >
                <option value="">اختر المريض</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                required
              >
                <option value="">اختر الطبيب</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>
                ))}
              </select>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="ملاحظات (اختياري)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                حجز الموعد
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {appointments.length === 0 ? (
          <p className="text-center text-gray-500 py-12">لا توجد مواعيد حالياً</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>المريض</th>
                <th>الطبيب</th>
                <th>التاريخ</th>
                <th>الوقت</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="font-medium">{app.patient?.name}</td>
                  <td>{app.doctor?.name}</td>
                  <td>{formatDate(app.date)}</td>
                  <td>{app.time}</td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}