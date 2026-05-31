'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stethoscope, Shield, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin, user } = useAuth();
  const router = useRouter();

  if (user) {
    router.push(user.role === 'admin' ? '/admin' : '/doctor');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authLogin(login, password);
      const saved = JSON.parse(localStorage.getItem('user') || '{}');
      router.push(saved.role === 'admin' ? '/admin' : '/doctor');
    } catch {
      setError('Login yoki parol noto\'g\'ri');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dental-600 via-dental-700 to-dental-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Stethoscope className="text-dental-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">DentalPro</h1>
          <p className="text-dental-200 mt-1">Stomatologiya klinikasi boshqaruv tizimi</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Tizimga kirish</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Login</label>
              <input
                className="input-field mt-1"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="admin yoki doctor login"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Parol</label>
              <input
                type="password"
                className="input-field mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
            <p className="text-xs text-gray-500 text-center">Demo hisoblar</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Shield size={14} className="text-dental-600 mb-1" />
                <p className="font-medium">Admin</p>
                <p className="text-gray-500">admin / admin123</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <User size={14} className="text-dental-600 mb-1" />
                <p className="font-medium">Doctorlar</p>
                <p className="text-gray-500">sherzod / doctor123</p>
                <p className="text-gray-500">feruza / doctor123</p>
                <p className="text-gray-500">baxriddin / doctor123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
