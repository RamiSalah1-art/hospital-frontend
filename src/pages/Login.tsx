import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
    } catch {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🏥</div>
            <h1 className="text-3xl font-bold text-gray-800">نظام إدارة المستشفى</h1>
            <p className="text-gray-500 mt-2">تسجيل الدخول للمتابعة</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm border border-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full btn btn-primary py-3 text-lg"
            >
              دخول
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>admin / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}