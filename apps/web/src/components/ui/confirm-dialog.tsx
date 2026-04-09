'use client';

import { create } from 'zustand';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  open: (opts: { title: string; message: string; confirmLabel?: string; onConfirm: () => void }) => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: 'حذف',
  onConfirm: () => {},
  open: (opts) => set({ isOpen: true, title: opts.title, message: opts.message, confirmLabel: opts.confirmLabel || 'حذف', onConfirm: opts.onConfirm }),
  close: () => set({ isOpen: false }),
}));

export function confirmAction(opts: { title: string; message: string; confirmLabel?: string }): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.getState().open({
      ...opts,
      onConfirm: () => { resolve(true); useConfirmStore.getState().close(); },
    });
    const unsub = useConfirmStore.subscribe((state) => {
      if (!state.isOpen) { unsub(); resolve(false); }
    });
  });
}

export function ConfirmDialog() {
  const { isOpen, title, message, confirmLabel, onConfirm, close } = useConfirmStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4 animate-in fade-in" onClick={close}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="flex gap-3 p-4 pt-0">
          <button onClick={close}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            إلغاء
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
