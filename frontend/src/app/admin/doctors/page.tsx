'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { WORK_DAYS, WORK_DAY_LABELS } from '@/lib/constants';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({ work_days: [] });
  const [editId, setEditId] = useState<string | null>(null);

  const load = () => api.get('/doctors').then((r) => setDoctors(r.data));

  useEffect(() => { load(); }, []);

  const toggleDay = (day: string) => {
    const days = form.work_days || [];
    setForm({
      ...form,
      work_days: days.includes(day) ? days.filter((d: string) => d !== day) : [...days, day],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await api.put(`/doctors/${editId}`, form);
    else await api.post('/doctors', form);
    setShowModal(false);
    setForm({ work_days: [] });
    setEditId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Doctorni o\'chirishni tasdiqlaysizmi?')) return;
    await api.delete(`/doctors/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Doctorlar boshqaruvi</h1>
          <p className="text-gray-500">Sherzod, Feruza, Baxriddin va boshqa doctorlar</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setShowModal(true); setEditId(null); setForm({ work_days: [] }); }}>
          <Plus size={18} /> Doctor qo&apos;shish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((d) => (
          <div key={d.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-dental-100 dark:bg-dental-900/30 rounded-full flex items-center justify-center text-dental-700 font-bold text-lg">
                {d.full_name[0]}
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => { setEditId(d.id); setForm({ ...d, work_days: d.work_days || [] }); setShowModal(true); }}>
                  <Pencil size={16} />
                </button>
                <button className="p-1.5 text-red-600 hover:bg-red-50 rounded" onClick={() => handleDelete(d.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-lg">{d.full_name}</h3>
            <p className="text-dental-600 text-sm">{d.specialty}</p>
            <p className="text-gray-500 text-sm mt-1">{d.phone}</p>
            <p className="text-gray-500 text-sm">Login: {d.login}</p>
            <p className="text-sm mt-2">
              <span className="text-gray-400">Ish vaqti:</span> {d.work_start?.slice(0, 5)} - {d.work_end?.slice(0, 5)}
            </p>
            <p className="text-sm mt-1">
              <span className="text-gray-400">Mijozlar:</span> {d.patient_count}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {(d.work_days || []).map((day: string) => (
                <span key={day} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                  {WORK_DAY_LABELS[day] || day}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editId ? 'Doctorni tahrirlash' : 'Yangi doctor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {['full_name', 'phone', 'specialty', 'login', 'password'].map((f) => (
                <div key={f}>
                  <label className="text-sm capitalize">{f === 'full_name' ? 'F.I.O' : f}</label>
                  <input
                    className="input-field mt-1"
                    type={f === 'password' ? 'password' : 'text'}
                    value={form[f] || ''}
                    onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                    required={!editId && (f === 'full_name' || f === 'login')}
                    placeholder={f === 'password' && editId ? 'O\'zgartirmaslik uchun bo\'sh qoldiring' : ''}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm">Ish boshlanishi</label>
                  <input type="time" className="input-field mt-1" value={form.work_start?.slice(0, 5) || '09:00'} onChange={(e) => setForm({ ...form, work_start: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm">Ish tugashi</label>
                  <input type="time" className="input-field mt-1" value={form.work_end?.slice(0, 5) || '18:00'} onChange={(e) => setForm({ ...form, work_end: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm">Ish kunlari</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {WORK_DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 text-xs rounded-full border ${
                        (form.work_days || []).includes(day)
                          ? 'bg-dental-600 text-white border-dental-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {WORK_DAY_LABELS[day]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary">Saqlash</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Bekor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
