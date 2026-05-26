'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, FileText, CreditCard, Clock, ClipboardList } from 'lucide-react';
import api, { STATUS_LABELS, TREATMENT_TYPES } from '@/lib/api';
import DentalChart from '@/components/dental/DentalChart';
import { useAuth } from '@/context/AuthContext';

type Tab = 'info' | 'chart' | 'notes' | 'plan' | 'payments' | 'timeline';

export default function PatientProfile({ patientId, basePath }: { patientId: string; basePath: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('info');
  const [noteForm, setNoteForm] = useState<any>({});
  const [planForm, setPlanForm] = useState<any>({});
  const [paymentForm, setPaymentForm] = useState<any>({});

  const load = () => api.get(`/patients/${patientId}/full`).then((r) => setData(r.data));

  useEffect(() => { load(); }, [patientId]);

  if (!data) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />;

  const { patient, dentalChart, notes, treatmentPlans, payments, timeline, paymentSummary } = data;
  const isDoctor = user?.role === 'doctor';

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'info', label: 'Asosiy', icon: User },
    { id: 'chart', label: 'Tish diagrammasi', icon: ClipboardList },
    { id: 'notes', label: 'Klinik izohlar', icon: FileText },
    { id: 'plan', label: 'Plan Lecheniya', icon: ClipboardList },
    { id: 'payments', label: 'To\'lovlar', icon: CreditCard },
    { id: 'timeline', label: 'Tarix', icon: Clock },
  ];

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/notes/${patientId}`, noteForm);
    setNoteForm({});
    load();
  };

  const addPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/treatment-plans/${patientId}`, planForm);
    setPlanForm({});
    load();
  };

  const addPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/payments/${patientId}`, paymentForm);
    setPaymentForm({});
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`${basePath}/patients`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{patient.full_name}</h1>
          <p className="text-gray-500">{patient.phone} • {patient.age} yosh • {patient.gender}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card"><p className="text-sm text-gray-500">Davolash narxi</p><p className="text-xl font-bold">{paymentSummary.totalCost?.toLocaleString()} so&apos;m</p></div>
        <div className="card"><p className="text-sm text-gray-500">To&apos;langan</p><p className="text-xl font-bold text-green-600">{paymentSummary.totalPaid?.toLocaleString()} so&apos;m</p></div>
        <div className="card"><p className="text-sm text-gray-500">Qarzdorlik</p><p className="text-xl font-bold text-red-600">{paymentSummary.debt?.toLocaleString()} so&apos;m</p></div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id ? 'bg-dental-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card space-y-3">
            <h3 className="font-semibold">Asosiy ma&apos;lumotlar</h3>
            <InfoRow label="Manzil" value={patient.address} />
            <InfoRow label="Allergiya" value={patient.allergy} />
            <InfoRow label="Doctor" value={patient.doctor_name} />
            <InfoRow label="Ro'yxatdan o'tgan" value={new Date(patient.registered_at).toLocaleDateString('uz-UZ')} />
          </div>
          <div className="card">
            <h3 className="font-semibold mb-3">Kasallik tarixi</h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{patient.medical_history || 'Ma\'lumot kiritilmagan'}</p>
          </div>
        </div>
      )}

      {tab === 'chart' && (
        <DentalChart patientId={patientId} chartData={dentalChart} onUpdate={load} readOnly={!isDoctor && user?.role !== 'admin'} />
      )}

      {tab === 'notes' && (
        <div className="space-y-4">
          {isDoctor && (
            <form onSubmit={addNote} className="card space-y-3">
              <h3 className="font-semibold">Yangi izoh qo&apos;shish</h3>
              {['diagnosis', 'symptoms', 'observation', 'additional_conditions', 'internal_notes', 'prescription'].map((f) => (
                <div key={f}>
                  <label className="text-sm capitalize">{f.replace('_', ' ')}</label>
                  <textarea className="input-field mt-1" rows={2} value={noteForm[f] || ''} onChange={(e) => setNoteForm({ ...noteForm, [f]: e.target.value })} />
                </div>
              ))}
              <button type="submit" className="btn-primary">Saqlash</button>
            </form>
          )}
          {notes.map((n: any) => (
            <div key={n.id} className="card">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>{n.doctor_name}</span>
                <span>{new Date(n.created_at).toLocaleString('uz-UZ')}</span>
              </div>
              {n.diagnosis && <p><strong>Diagnosis:</strong> {n.diagnosis}</p>}
              {n.symptoms && <p><strong>Belgilar:</strong> {n.symptoms}</p>}
              {n.prescription && <p><strong>Retsept:</strong> {n.prescription}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'plan' && (
        <div className="space-y-4">
          {(isDoctor || user?.role === 'admin') && (
            <form onSubmit={addPlan} className="card grid grid-cols-1 sm:grid-cols-2 gap-3">
              <h3 className="font-semibold sm:col-span-2">Plan Lecheniya qo&apos;shish</h3>
              <select className="input-field" value={planForm.treatment_type || ''} onChange={(e) => setPlanForm({ ...planForm, treatment_type: e.target.value })} required>
                <option value="">Davolash turi</option>
                {TREATMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className="input-field" placeholder="Tish raqami" type="number" value={planForm.tooth_number || ''} onChange={(e) => setPlanForm({ ...planForm, tooth_number: e.target.value })} />
              <select className="input-field" value={planForm.priority || 'o\'rta'} onChange={(e) => setPlanForm({ ...planForm, priority: e.target.value })}>
                <option value="past">Past</option>
                <option value="o'rta">O&apos;rta</option>
                <option value="yuqori">Yuqori</option>
                <option value="shoshilinch">Shoshilinch</option>
              </select>
              <input className="input-field" placeholder="Narxi" type="number" value={planForm.price || ''} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} />
              <input className="input-field" type="date" value={planForm.start_date || ''} onChange={(e) => setPlanForm({ ...planForm, start_date: e.target.value })} />
              <textarea className="input-field sm:col-span-2" placeholder="Doctor izohi" value={planForm.doctor_notes || ''} onChange={(e) => setPlanForm({ ...planForm, doctor_notes: e.target.value })} />
              <button type="submit" className="btn-primary sm:col-span-2">Qo&apos;shish</button>
            </form>
          )}
          <div className="card overflow-x-auto p-0">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="table-header">Turi</th>
                  <th className="table-header">Tish</th>
                  <th className="table-header">Narxi</th>
                  <th className="table-header">Holat</th>
                </tr>
              </thead>
              <tbody>
                {treatmentPlans.map((p: any) => (
                  <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="table-cell">{p.treatment_type}</td>
                    <td className="table-cell">{p.tooth_number || '—'}</td>
                    <td className="table-cell">{Number(p.price).toLocaleString()} so&apos;m</td>
                    <td className="table-cell">{STATUS_LABELS[p.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="space-y-4">
          <form onSubmit={addPayment} className="card flex flex-wrap gap-3 items-end">
            <input className="input-field max-w-xs" type="number" placeholder="Summa" value={paymentForm.amount || ''} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} required />
            <select className="input-field max-w-xs" value={paymentForm.payment_method || 'naqd'} onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}>
              <option value="naqd">Naqd</option>
              <option value="karta">Karta</option>
              <option value="transfer">Transfer</option>
            </select>
            <button type="submit" className="btn-primary">To&apos;lov qabul qilish</button>
          </form>
          {payments.map((p: any) => (
            <div key={p.id} className="card flex justify-between">
              <div>
                <p className="font-semibold">{Number(p.amount).toLocaleString()} so&apos;m</p>
                <p className="text-sm text-gray-500">{p.invoice_number} • {p.payment_method}</p>
              </div>
              <p className="text-sm text-gray-500">{new Date(p.payment_date).toLocaleDateString('uz-UZ')}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'timeline' && (
        <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-dental-200">
          {timeline.map((e: any) => (
            <div key={e.id} className="relative">
              <span className="absolute -left-5 w-4 h-4 bg-dental-600 rounded-full border-4 border-white dark:border-gray-900" />
              <div className="card">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-dental-600">{e.event_type}</span>
                  <span className="text-gray-500">{new Date(e.created_at).toLocaleString('uz-UZ')}</span>
                </div>
                <p className="font-semibold mt-1">{e.title}</p>
                {e.description && <p className="text-gray-600 text-sm mt-1">{e.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value || '—'}</span>
    </div>
  );
}
