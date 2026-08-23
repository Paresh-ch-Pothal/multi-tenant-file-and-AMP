import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

interface TableLoadingRowsProps {
    columns: number;
    rows?: number;
}

export function TableLoadingRows({ columns, rows = 5 }: TableLoadingRowsProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <tr key={rowIdx} className="border-b border-slate-100 last:border-0">
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <td key={colIdx} className="px-4 py-3">
                            <div
                                className="h-4 animate-pulse rounded bg-slate-100"
                                style={{ width: colIdx === 0 ? '70%' : '50%' }}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

interface TableEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
    colSpan: number;
}

export function TableEmptyState({ icon: Icon, title, description, action, colSpan }: TableEmptyStateProps) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-4 py-12">
                <div className="flex flex-col items-center gap-2 text-center">
                    <Icon size={32} className="text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">{title}</p>
                    {description && <p className="max-w-xs text-xs text-slate-400">{description}</p>}
                    {action && <div className="mt-2">{action}</div>}
                </div>
            </td>
        </tr>
    );
}