'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api, { STATUS_LABELS } from '@/lib/api';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [filter, setFilter] = useState({ status: '', date: '' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const load = () => {
    api.get('/appointments', { params: filter }).then((r) => setAppointments(r.data));
  };

  useEffect(() => { load(); }, [filter]);
  useEffect(() => {
    api.get('/doctors').then((r) => setDoctors(r.data));
    api.get('/patients', { params: { limit: 100 } }).then((r) => setPatients(r.data.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/appointments', form);
    setShowModal(false);
    setForm({});
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/appointments/${id}`, { status });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Uchrashuvlar</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Uchrashuv yaratish
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input type="date" className="input-field max-w-xs" value={filter.date} onChange={(e) => setFilter({ ...filter, date: e.target.value })} />
        <select className="input-field max-w-xs" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">Barcha holatlar</option>
          {Object.entries(STATUS_LABELS).filter(([k]) => ['kutilmoqda', 'tasdiqlangan', 'davolanishda', 'tugallangan', 'bekor_qilingan'].includes(k)).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="table-header">Mijoz</th>
              <th className="table-header">Doctor</th>
              <th className="table-header">Sana</th>
              <th className="table-header">Vaqt</th>
              <th className="table-header">Holat</th>
              <th className="table-header">Amal</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-t border-gray-100 dark:border-gray-700">
                <td className="table-cell font-medium">{a.patient_name}</td>
                <td className="table-cell">{a.doctor_name}</td>
                <td className="table-cell">{new Date(a.appointment_date).toLocaleDateString('uz-UZ')}</td>
                <td className="table-cell">{a.appointment_time?.slice(0, 5)}</td>
                <td className="table-cell">
                  <select
                    className="text-xs border rounded px-2 py-1"
                    value={a.status}
                    onChange={(e) => updateStatus(a.id, e.target.value)}
                  >
                    {Object.entries(STATUS_LABELS).filter(([k]) => ['kutilmoqda', 'tasdiqlangan', 'davolanishda', 'tugallangan', 'bekor_qilingan'].includes(k)).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </td>
                <td className="table-cell text-gray-400 text-xs">{a.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Yangi uchrashuv</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select className="input-field" value={form.patient_id || ''} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required>
                <option value="">Mijoz tanlang</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
              <select className="input-field" value={form.doctor_id || ''} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} required>
                <option value="">Doctor tanlang</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
              <input type="date" className="input-field" value={form.appointment_date || ''} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} required />
              <input type="time" className="input-field" value={form.appointment_time || ''} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} required />
              <select className="input-field" value={form.status || 'kutilmoqda'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(STATUS_LABELS).filter(([k]) => ['kutilmoqda', 'tasdiqlangan', 'davolanishda', 'tugallangan', 'bekor_qilingan'].includes(k)).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Yaratish</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Bekor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
