// import { ChevronRight } from 'lucide-react';

// interface Crumb {
//   id: string | null;
//   name: string;
// }

// interface TopBarProps {
//   breadcrumbs?: Crumb[];
//   onCrumbClick?: (id: string | null) => void;
// }

// export function TopBar({ breadcrumbs = [], onCrumbClick }: TopBarProps) {
//   return (
//     <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
//       <nav className="flex items-center gap-1 text-sm text-slate-500">
//         {breadcrumbs.length === 0 ? (
//           <span className="font-medium text-slate-900">Home</span>
//         ) : (
//           breadcrumbs.map((crumb, i) => (
//             <span key={crumb.id ?? 'root'} className="flex items-center gap-1">
//               {i > 0 && <ChevronRight size={14} className="text-slate-300" />}
//               <button
//                 onClick={() => onCrumbClick?.(crumb.id)}
//                 className={`hover:text-brand-primary ${i === breadcrumbs.length - 1 ? 'font-medium text-slate-900' : ''
//                   }`}
//               >
//                 {crumb.name}
//               </button>
//             </span>
//           ))
//         )}
//       </nav>

//       <div className="flex items-center gap-3">
//         {/* user menu placeholder — wired once auth context exists */}
//         <div className="h-8 w-8 rounded-full bg-slate-200" />
//       </div>
//     </header>
//   );
// }



import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search, Bell, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useTheme } from '../../context/ThemeContext';

interface Crumb {
  id: string | null;
  name: string;
}

interface TopBarProps {
  breadcrumbs?: Crumb[];
  onCrumbClick?: (id: string | null) => void;
  onSearch?: (query: string) => void;
}

export function TopBar({ breadcrumbs = [], onCrumbClick, onSearch }: TopBarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  console.log(user)

  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate('/login');
  }

  const initials = (user?.email || 'U').charAt(0).toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      {/* breadcrumbs */}
      <nav className="flex min-w-0 items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        {breadcrumbs.length === 0 ? (
          <span className="font-medium text-slate-900 dark:text-white"></span>
        ) : (
          breadcrumbs.map((crumb, i) => (
            <span key={crumb.id ?? 'root'} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={14} className="shrink-0 text-slate-300 dark:text-slate-600" />}
              <button
                onClick={() => onCrumbClick?.(crumb.id)}
                className={`truncate hover:text-brand-primary ${i === breadcrumbs.length - 1 ? 'font-medium text-slate-900 dark:text-white' : ''
                  }`}
              >
                {crumb.name}
              </button>
            </span>
          ))
        )}
      </nav>

      {/* search */}
      <div className="hidden max-w-sm flex-1 sm:block">
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary dark:border-slate-700 dark:bg-slate-800/60">
          <Search size={14} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder="Search files, members, logs…"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* right cluster */}
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Account menu"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {initials}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-56 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <UserIcon size={15} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {'Account'}
                  </p>
                  {user?.email && (
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}