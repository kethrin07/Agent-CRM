import type { SelectHTMLAttributes } from "react";

/**
 * Styled native <select>: custom chevron (native arrow removed), themed border,
 * and hover/focus states. Wrapper width is controllable via `wrapperClassName`
 * (defaults to filling its container).
 */
export function Select({
  className = "",
  wrapperClassName = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
}) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <select
        {...props}
        className={`h-11 w-full appearance-none rounded-lg border border-border-strong bg-card pl-3.5 pr-10 text-sm font-medium text-ink transition-colors hover:border-dash focus:border-brand focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        {children}
      </select>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
