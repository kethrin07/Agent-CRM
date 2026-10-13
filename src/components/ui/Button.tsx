import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "dashed" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 text-[13px]",
  md: "min-h-10 px-3.5 text-sm",
  lg: "min-h-11 px-4 text-sm",
};

const variants: Record<Variant, string> = {
  primary:
    "border border-transparent bg-brand font-semibold text-white hover:bg-brand-hover",
  secondary: "border border-border-strong bg-card text-ink hover:bg-hover",
  danger: "border border-border-strong bg-card text-bad-fg hover:bg-hover",
  dashed: "border border-dashed border-dash bg-card text-ink hover:bg-hover",
  ghost:
    "border border-transparent bg-transparent text-muted hover:bg-hover hover:text-ink",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "secondary", size = "md", className = "", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
});
