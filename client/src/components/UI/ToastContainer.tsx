import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToast, type ToastType } from '../../context/ToastContext';
import type { JSX } from 'react/jsx-runtime';

const styles: Record<ToastType, { bg: string; border: string; text: string; icon: JSX.Element }> = {
    success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: <CheckCircle2 size={18} className="text-green-600" />,
    },
    error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: <XCircle size={18} className="text-red-600" />,
    },
    info: {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        text: 'text-slate-800',
        icon: <Info size={18} className="text-slate-500" />,
    },
};

export function ToastContainer() {
    const { toasts, dismissToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed right-4 top-4 z-[100] flex w-80 flex-col gap-2">
            {toasts.map((toast) => {
                const style = styles[toast.type];
                return (
                    <div
                        key={toast.id}
                        className={`flex items-start gap-2.5 rounded-lg border ${style.border} ${style.bg} p-3 shadow-lg transition-all`}
                    >
                        {style.icon}
                        <p className={`flex-1 text-sm ${style.text}`}>{toast.message}</p>
                        <button
                            onClick={() => dismissToast(toast.id)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}