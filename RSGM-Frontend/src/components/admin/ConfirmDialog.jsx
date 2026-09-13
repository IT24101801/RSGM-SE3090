import { Loader2, TriangleAlert, X } from "lucide-react";

function ConfirmDialog({ title, message, confirmLabel = "Confirm", isLoading = false, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-3xl border border-white/70 bg-white shadow-2xl p-6 sm:p-7">
        <button onClick={onClose} className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-700 transition">
          <X size={18} />
        </button>

        <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center">
          <TriangleAlert size={20} className="text-red-500" />
        </div>

        <h2 className="mt-4 text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1.5 text-sm text-neutral-500">{message}</p>

        <div className="flex items-center gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-700 active:scale-[0.99] transition disabled:opacity-60"
          >
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;