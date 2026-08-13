import { ChevronRight } from 'lucide-react';

interface Crumb {
  id: string | null;
  name: string;
}

interface TopBarProps {
  breadcrumbs?: Crumb[];
  onCrumbClick?: (id: string | null) => void;
}

export function TopBar({ breadcrumbs = [], onCrumbClick }: TopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        {breadcrumbs.length === 0 ? (
          <span className="font-medium text-slate-900">Home</span>
        ) : (
          breadcrumbs.map((crumb, i) => (
            <span key={crumb.id ?? 'root'} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={14} className="text-slate-300" />}
              <button
                onClick={() => onCrumbClick?.(crumb.id)}
                className={`hover:text-brand-primary ${
                  i === breadcrumbs.length - 1 ? 'font-medium text-slate-900' : ''
                }`}
              >
                {crumb.name}
              </button>
            </span>
          ))
        )}
      </nav>

      <div className="flex items-center gap-3">
        {/* user menu placeholder — wired once auth context exists */}
        <div className="h-8 w-8 rounded-full bg-slate-200" />
      </div>
    </header>
  );
}