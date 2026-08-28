// import { NavLink, useNavigate } from 'react-router-dom';
// import { Folder, Users, Shield, Key, ScrollText, Settings, LogOut, Webhook, Sun, Moon } from 'lucide-react';
// import { useBranding } from '../../context/BrandingContext';
// import { useAuth } from '../../context/authContext';
// import { useTheme } from '../../context/ThemeContext';

// const navItems = [
//   { to: '/files', label: 'Files', icon: Folder },
//   { to: '/users', label: 'Team', icon: Users },
//   { to: '/roles', label: 'Roles', icon: Shield },
//   { to: '/api-keys', label: 'API Keys', icon: Key },
//   { to: '/audit-logs', label: 'Audit Log', icon: ScrollText },
//   { to: '/settings', label: 'Settings', icon: Settings },
//   { to: '/webhooks', label: 'Webhooks', icon: Webhook },
// ];

// export function Sidebar() {
//   const { branding } = useBranding();

//   const { logout } = useAuth();
//   const navigate = useNavigate();
//   const { theme, toggleTheme } = useTheme();

//   function handleLogout() {
//     logout();
//     navigate('/login');
//   }

//   return (
//     <aside className="flex w-60 flex-col bg-slate-900 text-slate-300">
//       <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-4">
//         {branding?.logo_url ? (
//           <img
//             src={branding.logo_url}
//             alt={branding.app_title || 'Logo'}
//             className="h-7 w-7 shrink-0 rounded object-cover"
//           />
//         ) : null}
//         <span className="truncate text-sm font-semibold text-white">
//           {branding?.app_title || 'File Portal'}
//         </span>
//       </div>

//       <nav className="flex-1 space-y-0.5 px-2 py-3">
//         {navItems.map(({ to, label, icon: Icon }) => (
//           <NavLink
//             key={to}
//             to={to}
//             className={({ isActive }) =>
//               `flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors ${isActive
//                 ? 'bg-brand-primary/15 text-white font-medium'
//                 : 'text-slate-400 hover:bg-slate-800 hover:text-white'
//               }`
//             }
//           >
//             {({ isActive }) => (
//               <>
//                 <Icon size={16} className={isActive ? 'text-brand-primary' : ''} />
//                 {label}
//               </>
//             )}
//           </NavLink>
//         ))}
//       </nav>
//       <div className="border-t border-slate-800 px-2 py-3">
//         <button
//           onClick={toggleTheme}
//           className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
//         >
//           {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
//           {theme === 'dark' ? 'Light mode' : 'Dark mode'}
//         </button>
//         <button
//           onClick={handleLogout}
//           className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
//         >
//           <LogOut size={16} />
//           Log out
//         </button>
//         <p className="mt-2 px-3 text-[11px] text-slate-600">AMP v1.0</p>
//       </div>
//     </aside>
//   );
// }

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Folder,
  Users,
  Shield,
  Key,
  ScrollText,
  Settings,
  Webhook,
  ChevronsLeft,
  ChevronsRight,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';
import { useAuth } from '../../context/authContext';
import { useTheme } from '../../context/ThemeContext';

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { to: '/files', label: 'Files', icon: Folder },
      { to: '/users', label: 'Team', icon: Users },
    ],
  },
  {
    label: 'Access control',
    items: [
      { to: '/roles', label: 'Roles', icon: Shield },
      { to: '/api-keys', label: 'API Keys', icon: Key },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { to: '/audit-logs', label: 'Audit Log', icon: ScrollText },
      { to: '/webhooks', label: 'Webhooks', icon: Webhook },
    ],
  },
];

export function Sidebar() {
  const { branding } = useBranding();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${isActive
      ? 'bg-brand-primary/10 font-medium text-brand-primary'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
    } ${collapsed ? 'justify-center' : ''}`;

  const initials = (user?.email || 'U').charAt(0).toUpperCase();

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 dark:border-slate-800 dark:bg-slate-900 ${collapsed ? 'w-16' : 'w-60'
        }`}
    >
      {/* brand header */}
      <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
        {branding?.logo_url ? (
          <img
            src={branding.logo_url}
            alt={branding.app_title || 'Logo'}
            className="h-7 w-7 shrink-0 rounded object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-primary text-sm font-bold text-white">
            {(branding?.app_title || 'File Portal').charAt(0)}
          </span>
        )}
        {!collapsed && (
          <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {branding?.app_title || 'File Portal'}
          </span>
        )}
      </div>

      {/* grouped nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} title={collapsed ? label : undefined} className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-brand-primary" />
                      )}
                      <Icon size={16} className="shrink-0" />
                      {!collapsed && label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <div>
          {!collapsed && (
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              General
            </p>
          )}
          <NavLink to="/settings" title={collapsed ? 'Settings' : undefined} className={navLinkClass}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-brand-primary" />
                )}
                <Settings size={16} className="shrink-0" />
                {!collapsed && 'Settings'}
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* account + theme + logout + collapse */}
      <div className="border-t border-slate-200 px-2 py-3 dark:border-slate-800">
        <div className={`flex items-center gap-2.5 rounded-md px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <span
            title={collapsed ? user?.email || 'Account' : undefined}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white"
          >
            {initials}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {'Account'}
              </p>
              {user?.email && (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          title={collapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
          className={`mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white ${collapsed ? 'justify-center' : ''
            }`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && (theme === 'dark' ? 'Light mode' : 'Dark mode')}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Log out' : undefined}
          className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white ${collapsed ? 'justify-center' : ''
            }`}
        >
          <LogOut size={16} />
          {!collapsed && 'Log out'}
        </button>

        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? 'Expand' : undefined}
          className={`mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-white ${collapsed ? 'justify-center' : ''
            }`}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!collapsed && 'Collapse'}
        </button>

        {!collapsed && <p className="mt-2 px-3 text-[11px] text-slate-400 dark:text-slate-600">AMP v1.0</p>}
      </div>
    </aside>
  );
}