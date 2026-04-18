import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    hospitalName: '',
    address: '',
    phone: '',
    email: '',
    taxNumber: '',
    logo: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      alert('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      alert('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  if (user?.role !== 'ADMIN') return <div className="p-8 text-center text-red-600">غير مصرح</div>;

  return (
    <div className="container-custom">
      <h1 className="page-title">
        <span>⚙️</span>
        إعدادات النظام
      </h1>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label className="block text-gray-700 font-medium mb-2">اسم المستشفى</label>
              <input
                type="text"
                value={settings.hospitalName}
                onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">العنوان</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">رقم الهاتف</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">الرقم الضريبي</label>
              <input
                type="text"
                value={settings.taxNumber}
                onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">رابط الشعار (URL)</label>
              <input
                type="text"
                value={settings.logo}
                onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                className="w-full"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving} className="btn btn-success">
              {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}