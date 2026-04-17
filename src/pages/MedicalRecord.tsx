import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { MedicalRecord, Patient } from '../types/index';

export default function MedicalRecordPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      const [patientRes, recordRes] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/medical-records/${patientId}`),
      ]);
      setPatient(patientRes.data);
      if (recordRes.data) {
        setRecord(recordRes.data);
        setFormData({
          bloodType: recordRes.data.bloodType || '',
          allergies: recordRes.data.allergies || '',
          chronicConditions: recordRes.data.chronicConditions || '',
          currentMedications: recordRes.data.currentMedications || '',
          notes: recordRes.data.notes || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.post(`/medical-records/${patientId}`, formData);
      setRecord(response.data);
      alert('تم حفظ السجل الطبي بنجاح');
    } catch (error) {
      alert('فشل حفظ السجل الطبي');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom">
        <div className="text-center py-12">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <div className="mb-6">
        <button onClick={() => navigate('/patients')} className="text-blue-600 hover:underline">
          ← العودة للمرضى
        </button>
      </div>

      <div className="card">
        <h1 className="text-2xl font-bold mb-6">
          السجل الطبي: {patient?.name}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">فصيلة الدم</label>
            <select
              value={formData.bloodType}
              onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
              className="w-full"
            >
              <option value="">غير محدد</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">الحساسية</label>
            <textarea
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="مثل: حساسية من البنسلين، الفول السوداني..."
              className="w-full"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">الأمراض المزمنة</label>
            <textarea
              value={formData.chronicConditions}
              onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
              placeholder="مثل: السكري، ضغط الدم، الربو..."
              className="w-full"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">الأدوية الحالية</label>
            <textarea
              value={formData.currentMedications}
              onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
              placeholder="مثل: الأنسولين، حبوب الضغط..."
              className="w-full"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">ملاحظات إضافية</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات أخرى..."
              className="w-full"
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-success"
            >
              {saving ? 'جاري الحفظ...' : (record ? 'تحديث السجل' : 'حفظ السجل')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}