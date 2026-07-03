import type { ReactNode } from 'react';

// modal simples: clicar no fundo fecha, clicar dentro não
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-xl text-slate-400 hover:text-slate-200"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
