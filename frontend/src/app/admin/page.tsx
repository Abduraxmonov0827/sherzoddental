'use client';

import { useEffect, useState } from 'react';
import { Users, UserCog, Calendar, CheckCircle, Clock, DollarSign } from 'lucide-react';
import api, { STATUS_LABELS } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import RevenueChart from '@/components/charts/RevenueChart';
import StatusChart from '@/components/charts/StatusChart';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard/admin').then((r) => setData(r.data));
  }, []);

  if (!data) {
    return <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />;
  }

  const { stats, monthlyRevenue, appointmentsByStatus, recentAppointments } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin boshqaruv paneli</h1>
        <p className="text-gray-500">Klinika statistikasi va analitikasi</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Jami mijozlar" value={stats.totalPatients} icon={Users} color="blue" />
        <StatCard title="Doctorlar" value={stats.totalDoctors} icon={UserCog} color="purple" />
        <StatCard title="Bugungi uchrashuvlar" value={stats.todayAppointments} icon={Calendar} color="orange" />
        <StatCard title="Tugallangan davolanishlar" value={stats.completedTreatments} icon={CheckCircle} color="green" />
        <StatCard title="Kutilayotgan davolanishlar" value={stats.pendingTreatments} icon={Clock} color="orange" />
        <StatCard
          title="Jami daromad"
          value={`${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          color="green"
          subtitle="so'm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Daromad statistikasi</h3>
          {monthlyRevenue?.length > 0 ? (
            <RevenueChart data={monthlyRevenue} />
          ) : (
            <p className="text-gray-500 text-center py-8">Hali to&apos;lovlar yo&apos;q</p>
          )}
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Uchrashuvlar holati</h3>
          {appointmentsByStatus?.length > 0 ? (
            <StatusChart data={appointmentsByStatus} />
          ) : (
            <p className="text-gray-500 text-center py-8">Ma&apos;lumot yo&apos;q</p>
          )}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h3 className="font-semibold mb-4">So&apos;nggi uchrashuvlar</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="table-header">Mijoz</th>
              <th className="table-header">Doctor</th>
              <th className="table-header">Sana</th>
              <th className="table-header">Vaqt</th>
              <th className="table-header">Holat</th>
            </tr>
          </thead>
          <tbody>
            {recentAppointments?.map((a: any) => (
              <tr key={a.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="table-cell font-medium">{a.patient_name}</td>
                <td className="table-cell">{a.doctor_name}</td>
                <td className="table-cell">{new Date(a.appointment_date).toLocaleDateString('uz-UZ')}</td>
                <td className="table-cell">{a.appointment_time?.slice(0, 5)}</td>
                <td className="table-cell">
                  <span className="px-2 py-1 text-xs rounded-full bg-dental-50 text-dental-700 dark:bg-dental-900/30">
                    {STATUS_LABELS[a.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
