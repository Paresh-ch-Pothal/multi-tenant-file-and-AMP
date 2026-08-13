import { NavLink } from 'react-router-dom';
import { Folder, Users, Shield, Key, ScrollText, Settings } from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';

const navItems = [
  { to: '/files', label: 'Files', icon: Folder },
  { to: '/users', label: 'Team', icon: Users },
  { to: '/roles', label: 'Roles', icon: Shield },
  { to: '/api-keys', label: 'API Keys', icon: Key },
  { to: '/audit-logs', label: 'Audit Log', icon: ScrollText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { branding } = useBranding();
  return (
    <aside className="flex w-60 flex-col bg-slate-900 text-slate-300">
      <div className="flex h-14 items-center border-b border-slate-800 px-4">
        <span className="truncate text-sm font-semibold text-white">
          {branding?.app_title || 'File Portal'}
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors ${isActive
                ? 'bg-brand-primary/15 text-white font-medium'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-brand-primary' : ''} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}