interface BadgeProps {
  variant: 'success' | 'warning' | 'neutral' | 'danger';
  children: React.ReactNode;
}

const variants = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}