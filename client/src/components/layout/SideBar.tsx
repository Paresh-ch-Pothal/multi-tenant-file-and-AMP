import { NavLink, useNavigate } from 'react-router-dom';
import { Folder, Users, Shield, Key, ScrollText, Settings, LogOut } from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';
import { useAuth } from '../../context/authContext';

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

  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="flex w-60 flex-col bg-slate-900 text-slate-300">
      <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-4">
        {branding?.logo_url ? (
          <img
            src={branding.logo_url}
            alt={branding.app_title || 'Logo'}
            className="h-7 w-7 shrink-0 rounded object-cover"
          />
        ) : null}
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
      <div className="border-t border-slate-800 px-2 py-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={16} />
          Log out
        </button>
        <p className="mt-2 px-3 text-[11px] text-slate-600">AMP v1.0</p>
      </div>
    </aside>
  );
}