// import { type InputHTMLAttributes, forwardRef } from 'react';

// interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
//   label?: string;
//   error?: string;
// }

// export const Input = forwardRef<HTMLInputElement, InputProps>(
//   ({ label, error, className = '', id, ...props }, ref) => {
//     return (
//       <div className="space-y-1">
//         {label && (
//           <label htmlFor={id} className="block text-sm font-medium text-slate-700">
//             {label}
//           </label>
//         )}
//         <input
//           ref={ref}
//           id={id}
//           className={`w-full rounded border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${error ? 'border-red-400' : 'border-slate-300'
//             } ${className}`}
//           {...props}
//         />
//         {error && <p className="text-xs text-red-600">{error}</p>}
//       </div>
//     );
//   }
// );
// Input.displayName = 'Input';



import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full rounded border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 ${error ? 'border-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'
            } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';