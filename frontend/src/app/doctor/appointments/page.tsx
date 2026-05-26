'use client';

import { useEffect, useState } from 'react';
import api, { STATUS_LABELS } from '@/lib/api';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState({ status: '', date: '' });

  const load = () => api.get('/appointments', { params: filter }).then((r) => setAppointments(r.data));

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/appointments/${id}`, { status });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mening uchrashuvlarim</h1>

      <div className="flex gap-3">
        <input type="date" className="input-field max-w-xs" value={filter.date} onChange={(e) => setFilter({ ...filter, date: e.target.value })} />
        <select className="input-field max-w-xs" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">Barcha</option>
          {Object.entries(STATUS_LABELS).filter(([k]) => ['kutilmoqda', 'tasdiqlangan', 'davolanishda', 'tugallangan', 'bekor_qilingan'].includes(k)).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {appointments.map((a) => (
          <div key={a.id} className="card flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="font-semibold text-lg">{a.patient_name}</p>
              <p className="text-gray-500">{a.patient_phone}</p>
              <p className="text-sm mt-1">
                {new Date(a.appointment_date).toLocaleDateString('uz-UZ')} • {a.appointment_time?.slice(0, 5)}
              </p>
            </div>
            <select
              className="input-field max-w-xs self-start"
              value={a.status}
              onChange={(e) => updateStatus(a.id, e.target.value)}
            >
              {Object.entries(STATUS_LABELS).filter(([k]) => ['kutilmoqda', 'tasdiqlangan', 'davolanishda', 'tugallangan', 'bekor_qilingan'].includes(k)).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
