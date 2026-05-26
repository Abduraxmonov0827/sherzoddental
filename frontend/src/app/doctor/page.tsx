'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';
import api, { STATUS_LABELS } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/context/AuthContext';
import { WORK_DAY_LABELS } from '@/lib/constants';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard/doctor').then((r) => setData(r.data));
  }, []);

  if (!data) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />;

  const { stats, upcomingAppointments, schedule } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Salom, {user?.doctorName}!</h1>
        <p className="text-gray-500">Sizning shaxsiy doctor panelingiz</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Bugungi mijozlar" value={stats.todayPatients} icon={Users} color="blue" />
        <StatCard title="Jami mijozlarim" value={stats.totalPatients} icon={Users} color="purple" />
        <StatCard title="Tugallangan davolanishlar" value={stats.completedTreatments} icon={CheckCircle} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-dental-600" />
            Keyingi uchrashuvlar
          </h3>
          <div className="space-y-3">
            {upcomingAppointments?.length === 0 ? (
              <p className="text-gray-500 text-sm">Keyingi uchrashuvlar yo&apos;q</p>
            ) : (
              upcomingAppointments.map((a: any) => (
                <div key={a.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium">{a.patient_name}</p>
                    <p className="text-sm text-gray-500">{a.patient_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(a.appointment_date).toLocaleDateString('uz-UZ')}</p>
                    <p className="text-sm text-dental-600">{a.appointment_time?.slice(0, 5)}</p>
                    <span className="text-xs px-2 py-0.5 bg-dental-50 text-dental-700 rounded">{STATUS_LABELS[a.status]}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-dental-600" />
            Ish jadvali
          </h3>
          {schedule && (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-gray-500">Ish vaqti:</span>{' '}
                {schedule.work_start?.slice(0, 5)} — {schedule.work_end?.slice(0, 5)}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {(schedule.work_days || []).map((day: string) => (
                  <span key={day} className="px-3 py-1 bg-dental-50 dark:bg-dental-900/30 text-dental-700 rounded-full text-sm">
                    {WORK_DAY_LABELS[day] || day}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Link href="/doctor/patients" className="card block hover:border-dental-300 transition-colors">
        <p className="font-medium text-dental-600">Mijozlarimga o&apos;tish →</p>
        <p className="text-sm text-gray-500">Biriktirilgan mijozlar, tish diagrammasi va davolash rejasi</p>
      </Link>
    </div>
  );
}
