interface Props {
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onBack: () => void;
}

export function ActionBar({ isEditing, onToggleEdit, onSave, onBack }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        onClick={onToggleEdit}
        className="rounded-full border border-slate-300 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-white"
      >
        {isEditing ? "Annuleren" : "Bewerken"}
      </button>
      {isEditing ? (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onSave}
            className="rounded-full border border-[#2d6aaa] bg-[linear-gradient(135deg,#5b9bd5_0%,#3d7fc0_100%)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Opslaan
          </button>
          <button
            onClick={onBack}
            className="rounded-full border border-slate-300 bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Terug
          </button>
        </div>
      ) : (
        <a
          href="/courses"
          className="inline-block rounded-full border border-slate-300 bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Terug
        </a>
      )}
    </div>
  );
}