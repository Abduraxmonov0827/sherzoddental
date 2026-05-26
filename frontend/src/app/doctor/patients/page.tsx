'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import api from '@/lib/api';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/patients', { params: { search, limit: 50 } }).then((r) => setPatients(r.data.data));
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mening mijozlarim</h1>
        <p className="text-gray-500">Faqat sizga biriktirilgan mijozlar</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          className="input-field pl-10"
          placeholder="Qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((p) => (
          <div key={p.id} className="card hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg">{p.full_name}</h3>
            <p className="text-gray-500 text-sm">{p.phone}</p>
            <p className="text-sm mt-2">{p.age} yosh • {p.gender}</p>
            {p.allergy && (
              <p className="text-xs text-red-600 mt-2 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                Allergiya: {p.allergy}
              </p>
            )}
            <Link
              href={`/doctor/patients/${p.id}`}
              className="mt-4 flex items-center gap-2 text-dental-600 text-sm font-medium hover:underline"
            >
              <Eye size={16} /> Profilni ochish
            </Link>
          </div>
        ))}
      </div>

      {patients.length === 0 && (
        <div className="card text-center py-12 text-gray-500">Mijozlar topilmadi</div>
      )}
    </div>
  );
}
