import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  subtitle?: string;
}) {
  const colors = {
    blue: 'bg-dental-50 text-dental-600 dark:bg-dental-900/30 dark:text-dental-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30',
  };

  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={clsx('p-3 rounded-xl', colors[color])}>
        <Icon size={22} />
      </div>
    </div>
  );
}
