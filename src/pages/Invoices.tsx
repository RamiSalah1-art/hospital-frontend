import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Invoice, InvoiceItem, Patient } from '../types/index';
import { useAuth } from '../hooks/useAuth';

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<{ invoiceId: number; balance: number } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    dueDate: '',
    notes: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const [tax, setTax] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invoicesRes, patientsRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/patients'),
      ]);
      setInvoices(invoicesRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (tax / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
  const updated = [...items];
  if (field === 'quantity' || field === 'unitPrice') {
    updated[index][field] = Number(value);
    updated[index].total = updated[index].quantity * updated[index].unitPrice;
  } else if (field === 'description') {
    updated[index][field] = value as string;
  }
  setItems(updated);
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) {
      alert('الرجاء اختيار المريض');
      return;
    }
    if (items.length === 0 || items.some(i => !i.description || i.quantity <= 0 || i.unitPrice <= 0)) {
      alert('الرجاء إضافة خدمة واحدة على الأقل مع وصف وسعر صحيح');
      return;
    }

    const { subtotal, taxAmount, total } = calculateTotals();

    try {
      await api.post('/invoices', {
        patientId: Number(formData.patientId),
        dueDate: formData.dueDate,
        items: JSON.stringify(items),
        subtotal,
        tax: taxAmount,
        total,
        paid: 0,
        notes: formData.notes,
      });
      alert('تم إنشاء الفاتورة بنجاح');
      setShowForm(false);
      setFormData({ patientId: '', dueDate: '', notes: '' });
      setItems([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
      setTax(0);
      fetchData();
    } catch (error) {
      alert('فشل إنشاء الفاتورة');
    }
  };

  const handleAddPayment = async () => {
    if (!showPaymentModal) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > showPaymentModal.balance) {
      alert('المبلغ غير صالح');
      return;
    }
    try {
      await api.put(`/invoices/${showPaymentModal.invoiceId}/payment`, { amount });
      alert('تم إضافة الدفعة بنجاح');
      setShowPaymentModal(null);
      setPaymentAmount('');
      fetchData();
    } catch (error) {
      alert('فشل إضافة الدفعة');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PAID: 'badge badge-success',
      UNPAID: 'badge badge-danger',
      PARTIAL: 'badge badge-warning',
      CANCELLED: 'badge badge-info',
    };
    const labels: Record<string, string> = {
      PAID: 'مدفوعة',
      UNPAID: 'غير مدفوعة',
      PARTIAL: 'مدفوعة جزئياً',
      CANCELLED: 'ملغية',
    };
    return <span className={badges[status]}>{labels[status]}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} SDG`;
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  if (loading) {
    return (
      <div className="container-custom">
        <div className="text-center py-12">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title">
          <span>🧾</span>
          إدارة الفواتير
        </h1>
        {(user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST') && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'إلغاء' : '+ فاتورة جديدة'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-card">
          <h2 className="form-title">فاتورة جديدة</h2>
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
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">الخدمات</label>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="الوصف"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="الكمية"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                    required
                  />
                  <input
                    type="number"
                    placeholder="سعر الوحدة (SDG)"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    required
                  />
                  <div className="flex items-center">{formatCurrency(item.total)}</div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="btn btn-danger"
                    disabled={items.length === 1}
                  >
                    حذف
                  </button>
                </div>
              ))}
              <button type="button" onClick={addItem} className="btn btn-outline">
                + إضافة خدمة
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">الضريبة (%)</label>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">ملاحظات</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة ({tax}%):</span>
                <span className="font-semibold">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                <span>الإجمالي:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                إنشاء الفاتورة
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {invoices.length === 0 ? (
          <p className="text-center text-gray-500 py-12">لا توجد فواتير</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>المريض</th>
                <th>تاريخ الإصدار</th>
                <th>تاريخ الاستحقاق</th>
                <th>الإجمالي</th>
                <th>المدفوع</th>
                <th>المتبقي</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="font-medium">{inv.invoiceNo}</td>
                  <td>{inv.patient?.name}</td>
                  <td>{formatDate(inv.issueDate)}</td>
                  <td>{formatDate(inv.dueDate)}</td>
                  <td>{formatCurrency(inv.total)}</td>
                  <td>{formatCurrency(inv.paid)}</td>
                  <td>{formatCurrency(inv.balance)}</td>
                  <td>{getStatusBadge(inv.status)}</td>
                  <td>
                    <div className="flex gap-2">
                      {inv.status !== 'PAID' && (user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST') && (
                        <button
                          onClick={() => setShowPaymentModal({ invoiceId: inv.id, balance: inv.balance })}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          دفع
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">إضافة دفعة</h3>
            <p className="mb-4">المبلغ المتبقي: {formatCurrency(showPaymentModal.balance)}</p>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="المبلغ (SDG)"
              className="w-full mb-4"
              min="0"
              max={showPaymentModal.balance}
              step="0.01"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowPaymentModal(null)} className="btn btn-outline">
                إلغاء
              </button>
              <button onClick={handleAddPayment} className="btn btn-success">
                حفظ الدفعة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}