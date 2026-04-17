import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Patient } from '../types/index';

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    address: '',
    gender: '',
  });

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', age: '', phone: '', address: '', gender: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (patient: Patient) => {
    setFormData({
      name: patient.name,
      age: patient.age.toString(),
      phone: patient.phone,
      address: patient.address || '',
      gender: patient.gender || '',
    });
    setEditingId(patient.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
      };

      if (editingId) {
        await api.put(`/patients/${editingId}`, payload);
      } else {
        await api.post('/patients', payload);
      }
      resetForm();
      fetchPatients();
    } catch (error) {
      console.error('Failed to save patient');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المريض؟')) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
    } catch (error) {
      console.error('Failed to delete patient');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  if (loading) {
    return (
      <div className="container-custom">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title">
          <span>👥</span>
          إدارة المرضى
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="btn btn-primary"
        >
          {showForm ? 'إلغاء' : '+ إضافة مريض جديد'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2 className="form-title">
            {editingId ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}
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
                type="number"
                placeholder="العمر"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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
                type="text"
                placeholder="العنوان"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="">الجنس</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingId ? 'تحديث المريض' : 'حفظ المريض'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {patients.length === 0 ? (
          <p className="text-center text-gray-500 py-12">لا يوجد مرضى حالياً</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>العمر</th>
                <th>الهاتف</th>
                <th>الجنس</th>
                <th>تاريخ الإضافة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="font-medium">{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.gender || '-'}</td>
                  <td>{formatDate(patient.createdAt)}</td>
                  <td>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(patient)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => navigate(`/patients/${patient.id}/medical-record`)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        سجل طبي
                      </button>
                      <button
                        onClick={() => navigate(`/patients/${patient.id}/prescriptions`)}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        وصفات
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
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