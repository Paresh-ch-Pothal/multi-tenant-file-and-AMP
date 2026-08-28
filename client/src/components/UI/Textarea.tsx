// import { type TextareaHTMLAttributes, forwardRef } from 'react';

// interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
//   label?: string;
// }

// export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
//   ({ label, className = '', id, ...props }, ref) => {
//     return (
//       <div className="space-y-1">
//         {label && (
//           <label htmlFor={id} className="block text-sm font-medium text-slate-700">
//             {label}
//           </label>
//         )}
//         <textarea
//           ref={ref}
//           id={id}
//           rows={3}
//           className={`w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
//           {...props}
//         />
//       </div>
//     );
//   }
// );
// Textarea.displayName = 'Textarea';


import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className = '', id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={3}
          className={`w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 ${className}`}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';