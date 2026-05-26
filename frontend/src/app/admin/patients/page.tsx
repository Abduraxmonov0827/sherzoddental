'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import api from '@/lib/api';

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [editId, setEditId] = useState<string | null>(null);

  const load = () => {
    api.get('/patients', { params: { search, page, limit: 10 } }).then((r) => {
      setPatients(r.data.data);
      setTotal(r.data.total);
    });
  };

  useEffect(() => { load(); }, [page, search]);
  useEffect(() => { api.get('/doctors').then((r) => setDoctors(r.data)); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await api.put(`/patients/${editId}`, form);
    else await api.post('/patients', form);
    setShowModal(false);
    setForm({});
    setEditId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Mijozni o\'chirishni tasdiqlaysizmi?')) return;
    await api.delete(`/patients/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mijozlar boshqaruvi</h1>
          <p className="text-gray-500">Jami: {total} ta mijoz</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setShowModal(true); setEditId(null); setForm({}); }}>
          <Plus size={18} /> Mijoz qo&apos;shish
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          className="input-field pl-10 max-w-md"
          placeholder="Ism yoki telefon bo'yicha qidirish..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="table-header">F.I.O</th>
              <th className="table-header">Telefon</th>
              <th className="table-header">Yosh</th>
              <th className="table-header">Jinsi</th>
              <th className="table-header">Doctor</th>
              <th className="table-header">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="table-cell font-medium">{p.full_name}</td>
                <td className="table-cell">{p.phone}</td>
                <td className="table-cell">{p.age}</td>
                <td className="table-cell capitalize">{p.gender}</td>
                <td className="table-cell">{p.doctor_name || '—'}</td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <Link href={`/admin/patients/${p.id}`} className="p-1.5 text-dental-600 hover:bg-dental-50 rounded">
                      <Eye size={16} />
                    </Link>
                    <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" onClick={() => { setEditId(p.id); setForm(p); setShowModal(true); }}>
                      <Pencil size={16} />
                    </button>
                    <button className="p-1.5 text-red-600 hover:bg-red-50 rounded" onClick={() => handleDelete(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 10 && (
        <div className="flex justify-center gap-2">
          <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Oldingi</button>
          <span className="px-4 py-2">{page} / {Math.ceil(total / 10)}</span>
          <button className="btn-secondary" disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(page + 1)}>Keyingi</button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editId ? 'Mijozni tahrirlash' : 'Yangi mijoz'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {['full_name', 'phone', 'age', 'address', 'allergy', 'medical_history'].map((f) => (
                <div key={f}>
                  <label className="text-sm capitalize">{f.replace('_', ' ')}</label>
                  <input className="input-field mt-1" value={form[f] || ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required={f === 'full_name' || f === 'phone'} />
                </div>
              ))}
              <div>
                <label className="text-sm">Jinsi</label>
                <select className="input-field mt-1" value={form.gender || ''} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Tanlang</option>
                  <option value="erkak">Erkak</option>
                  <option value="ayol">Ayol</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Doctor</label>
                <select className="input-field mt-1" value={form.assigned_doctor_id || ''} onChange={(e) => setForm({ ...form, assigned_doctor_id: e.target.value })}>
                  <option value="">Tanlang</option>
                  {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                </select>
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
