'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { STATUS_LABELS } from '@/lib/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function StatusChart({ data }: { data: { status: string; count: number }[] }) {
  const chartData = {
    labels: data.map((d) => STATUS_LABELS[d.status] || d.status),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: COLORS.slice(0, data.length),
      },
    ],
  };

  return (
    <div className="h-64 flex items-center justify-center">
      <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
}
