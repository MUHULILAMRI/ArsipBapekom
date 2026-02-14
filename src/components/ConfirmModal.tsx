"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  danger: {
    icon: "bg-red-100 text-red-600",
    button: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-500/20",
    ring: "ring-red-100",
  },
  warning: {
    icon: "bg-amber-100 text-amber-600",
    button: "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-500/20",
    ring: "ring-amber-100",
  },
  info: {
    icon: "bg-blue-100 text-blue-600",
    button: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20",
    ring: "ring-blue-100",
  },
};

export default function ConfirmModal({
  isOpen,
  title = "Confirm",
  message,
  confirmLabel = "Yes, Continue",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/10 w-full max-w-md animate-scale-in overflow-hidden">
        {/* Close button */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={`w-14 h-14 ${styles.icon} rounded-2xl flex items-center justify-center mb-4 ring-8 ${styles.ring}`}>
            <AlertTriangle size={28} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>

          {/* Message */}
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 ${styles.button} text-white rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2`}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
