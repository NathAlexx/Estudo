import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    alta: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    media: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    baixa: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  };
  const labels: Record<string, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[priority] ?? styles.media}`}
    >
      {labels[priority] ?? priority}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-14 text-center">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 text-lg font-semibold text-white/90">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-slate-500">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-xl bg-indigo-500/20 px-5 py-2.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/30"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:brightness-110",
    ghost: "border border-white/10 text-slate-300 hover:bg-white/5",
    danger: "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25",
  };
  return (
    <button
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400/60 focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-400/60 focus:outline-none ${props.className ?? ""}`}
    >
      {props.children}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400/60 focus:outline-none ${props.className ?? ""}`}
    />
  );
}
