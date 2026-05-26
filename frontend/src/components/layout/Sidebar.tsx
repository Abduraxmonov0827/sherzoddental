'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCog, Calendar, Bell,
  Stethoscope, LogOut, Moon, Sun, Menu, X,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

const adminLinks = [
  { href: '/admin', label: 'Bosh sahifa', icon: LayoutDashboard },
  { href: '/admin/patients', label: 'Mijozlar', icon: Users },
  { href: '/admin/doctors', label: 'Doctorlar', icon: UserCog },
  { href: '/admin/appointments', label: 'Uchrashuvlar', icon: Calendar },
  { href: '/admin/notifications', label: 'Bildirishnomalar', icon: Bell },
];

const doctorLinks = [
  { href: '/doctor', label: 'Bosh sahifa', icon: LayoutDashboard },
  { href: '/doctor/patients', label: 'Mijozlarim', icon: Users },
  { href: '/doctor/appointments', label: 'Uchrashuvlar', icon: Calendar },
  { href: '/doctor/notifications', label: 'Bildirishnomalar', icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const links = user?.role === 'admin' ? adminLinks : doctorLinks;
  const base = user?.role === 'admin' ? '/admin' : '/doctor';

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dental-600 text-white rounded-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-dental-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="text-white" size={22} />
            </div>
            <div>
              <h1 className="font-bold text-dental-700 dark:text-dental-400">DentalPro</h1>
              <p className="text-xs text-gray-500">Klinika tizimi</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === href || (href !== base && pathname.startsWith(href))
                  ? 'bg-dental-50 text-dental-700 dark:bg-dental-900/30 dark:text-dental-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
          <div className="px-4 py-2 text-sm">
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {user?.role === 'admin' ? 'Administrator' : user?.doctorName}
            </p>
            <p className="text-xs text-gray-500">{user?.login}</p>
          </div>
          <button onClick={toggle} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? 'Yorug\' rejim' : 'Qorong\'u rejim'}
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
            <LogOut size={18} />
            Chiqish
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
