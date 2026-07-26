interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-scale-in">
      <div className="mb-5 text-6xl opacity-50 animate-pulse-glow">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-white/90">{title}</h3>
      <p className="mb-8 max-w-xs text-sm leading-relaxed text-slate-400">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="hover-lift rounded-xl bg-indigo-500/20 px-6 py-3 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/30"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
