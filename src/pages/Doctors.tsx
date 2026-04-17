import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Doctor } from '../types/index';

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
  });

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', specialty: '', phone: '', email: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (doctor: Doctor) => {
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      phone: doctor.phone,
      email: doctor.email || '',
    });
    setEditingId(doctor.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/doctors/${editingId}`, formData);
      } else {
        await api.post('/doctors', formData);
      }
      resetForm();
      fetchDoctors();
    } catch (error) {
      console.error('Failed to save doctor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطبيب؟')) return;
    try {
      await api.delete(`/doctors/${id}`);
      fetchDoctors();
    } catch (error) {
      console.error('Failed to delete doctor');
    }
  };

  if (loading) {
    return (
      <div className="container-custom">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title">
          <span>👨‍⚕️</span>
          إدارة الأطباء
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="btn btn-primary"
        >
          {showForm ? 'إلغاء' : '+ إضافة طبيب جديد'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2 className="form-title">
            {editingId ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input
                type="text"
                placeholder="الاسم الكامل"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="التخصص"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="رقم الهاتف"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingId ? 'تحديث الطبيب' : 'حفظ الطبيب'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {doctors.length === 0 ? (
          <p className="text-center text-gray-500 py-12">لا يوجد أطباء حالياً</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>التخصص</th>
                <th>الهاتف</th>
                <th>البريد الإلكتروني</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="font-medium">{doctor.name}</td>
                  <td>
                    <span className="badge badge-info">{doctor.specialty}</span>
                  </td>
                  <td>{doctor.phone}</td>
                  <td>{doctor.email || '-'}</td>
                  <td>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(doctor)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(doctor.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        حذف
                      </button>
                    </div>
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