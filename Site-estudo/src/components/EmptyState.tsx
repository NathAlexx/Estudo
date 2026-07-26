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
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
      <div className="mb-4 text-5xl opacity-60">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-white/90">{title}</h3>
      <p className="mb-6 max-w-xs text-sm text-slate-400">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-xl bg-indigo-500/20 px-5 py-2.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/30"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
