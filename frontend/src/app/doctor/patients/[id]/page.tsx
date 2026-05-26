'use client';

import PatientProfile from '@/components/patient/PatientProfile';

export default function DoctorPatientDetailPage({ params }: { params: { id: string } }) {
  return <PatientProfile patientId={params.id} basePath="/doctor" />;
}
