import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Prescription, Medication, Patient, Doctor } from '../types/index';
import { useAuth } from '../hooks/useAuth';

export default function PrescriptionsPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: '', duration: '' }]);
  const [instructions, setInstructions] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      const [patientRes, prescriptionsRes, doctorsRes] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/prescriptions/patient/${patientId}`),
        api.get('/doctors'),
      ]);
      setPatient(patientRes.data);
      setPrescriptions(prescriptionsRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', duration: '' }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      alert('الرجاء اختيار الطبيب');
      return;
    }
    try {
      await api.post('/prescriptions', {
        patientId: Number(patientId),
        doctorId: Number(selectedDoctorId),
        medications: JSON.stringify(medications),
        instructions,
      });
      alert('تم حفظ الوصفة الطبية بنجاح');
      setShowForm(false);
      setMedications([{ name: '', dosage: '', duration: '' }]);
      setInstructions('');
      setSelectedDoctorId('');
      fetchData();
    } catch (error) {
      alert('فشل حفظ الوصفة الطبية');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
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

      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title">
          <span>💊</span>
          الوصفات الطبية: {patient?.name}
        </h1>
        {(user?.role === 'ADMIN' || user?.role === 'DOCTOR') && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'إلغاء' : '+ وصفة جديدة'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-card">
          <h2 className="form-title">وصفة طبية جديدة</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">الطبيب</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full"
                required
              >
                <option value="">اختر الطبيب</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">الأدوية</label>
              {medications.map((med, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="اسم الدواء"
                    value={med.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="الجرعة"
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="المدة"
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="btn btn-danger"
                    disabled={medications.length === 1}
                  >
                    حذف
                  </button>
                </div>
              ))}
              <button type="button" onClick={addMedication} className="btn btn-outline">
                + إضافة دواء
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">تعليمات إضافية</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full"
                rows={3}
                placeholder="تعليمات إضافية للمريض..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                حفظ الوصفة
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {prescriptions.length === 0 ? (
          <p className="text-center text-gray-500 py-12">لا توجد وصفات طبية</p>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((pres) => {
              const meds: Medication[] = JSON.parse(pres.medications);
              return (
                <div key={pres.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">د. {pres.doctor?.name} - {pres.doctor?.specialty}</p>
                      <p className="text-sm text-gray-500">{formatDate(pres.prescribedAt)}</p>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-2">الدواء</th>
                        <th className="text-right py-2">الجرعة</th>
                        <th className="text-right py-2">المدة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meds.map((med, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2">{med.name}</td>
                          <td className="py-2">{med.dosage}</td>
                          <td className="py-2">{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pres.instructions && (
                    <p className="mt-3 text-gray-600 text-sm">
                      <span className="font-semibold">تعليمات:</span> {pres.instructions}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}