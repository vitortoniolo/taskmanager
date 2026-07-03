import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

// componentes básicos de formulário; o visual vem das classes do index.css

export function Button({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`btn ${className}`} {...props} />;
}

export function Input({
  label,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <input className={`input ${className}`} {...props} />
    </label>
  );
}

export function Textarea({
  label,
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <textarea className={`input resize-y ${className}`} {...props} />
    </label>
  );
}

export function Select({
  label,
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <select className={`input ${className}`} {...props}>
        {children}
      </select>
    </label>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return <div className="error-box">{message}</div>;
}
