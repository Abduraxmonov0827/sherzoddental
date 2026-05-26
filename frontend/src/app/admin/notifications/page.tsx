'use client';

import { useEffect, useState } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const load = () => api.get('/notifications').then((r) => setNotifications(r.data));

  useEffect(() => { load(); }, []);

  const generateReminders = async () => {
    await api.post('/notifications/generate-reminders');
    load();
  };

  const markRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Bildirishnomalar</h1>
          <p className="text-gray-500">Uchrashuv va davolash eslatmalari</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={generateReminders}>
          <RefreshCw size={18} /> Eslatmalarni yaratish
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <Bell className="mx-auto mb-2 opacity-50" size={40} />
            Bildirishnomalar yo&apos;q
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`card flex justify-between items-start cursor-pointer ${!n.is_read ? 'border-l-4 border-l-dental-600' : ''}`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                <span className="text-xs text-dental-600 mt-2 inline-block">{n.type}</span>
              </div>
              <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString('uz-UZ')}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
