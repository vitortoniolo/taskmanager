import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

export function Button({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-lg bg-[var(--color-primary)] px-4 py-2.5 font-semibold text-slate-900 transition
        hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function Input({
  label,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-[var(--color-muted)]">{label}</span>}
      <input
        className={`w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5
          text-[var(--color-text)] outline-none transition placeholder:text-slate-500
          focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 ${className}`}
        {...props}
      />
    </label>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
      {message}
    </div>
  );
}
