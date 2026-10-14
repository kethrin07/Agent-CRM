"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from "@/components/icons";

type Variant = "success" | "info" | "error";
type ToastAction = { label: string; onClick: () => void };
type Options = { variant?: Variant; action?: ToastAction; duration?: number };
type ToastItem = {
  id: number;
  message: string;
  variant: Variant;
  action?: ToastAction;
};

type ToastFn = (message: string, opts?: Options) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function useToast(): ToastFn {
  return useContext(ToastContext);
}

const accent: Record<Variant, string> = {
  success: "var(--color-good)",
  info: "var(--color-brand)",
  error: "var(--color-bad-bar)",
};

function VariantIcon({ variant }: { variant: Variant }) {
  if (variant === "error") return <AlertIcon size={18} />;
  if (variant === "info") return <InfoIcon size={18} />;
  return <CheckIcon size={16} />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback<ToastFn>(
    (message, opts = {}) => {
      const id = ++idRef.current;
      setToasts((t) => [
        ...t,
        { id, message, variant: opts.variant ?? "success", action: opts.action },
      ]);
      const duration = opts.duration ?? 4000;
      if (duration > 0) window.setTimeout(() => remove(id), duration);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 left-4 z-[100] flex flex-col items-end gap-2 sm:left-auto"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="card pointer-events-auto flex w-full max-w-[380px] items-start gap-3 border-l-4 p-3.5 shadow-lg animate-[toast-in_180ms_ease-out]"
            style={{ borderLeftColor: accent[t.variant] }}
          >
            <span
              className="mt-0.5 flex-shrink-0"
              style={{ color: accent[t.variant] }}
            >
              <VariantIcon variant={t.variant} />
            </span>
            <span className="flex-grow text-sm text-ink">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action!.onClick();
                  remove(t.id);
                }}
                className="flex-shrink-0 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => remove(t.id)}
              className="-mr-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-ink"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
