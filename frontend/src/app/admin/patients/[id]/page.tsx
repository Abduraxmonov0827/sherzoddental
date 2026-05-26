'use client';

import PatientProfile from '@/components/patient/PatientProfile';

export default function AdminPatientDetailPage({ params }: { params: { id: string } }) {
  return <PatientProfile patientId={params.id} basePath="/admin" />;
}
