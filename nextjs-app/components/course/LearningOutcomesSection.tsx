import { LearningOutcome } from "@/types/course";

interface Props {
  outcomes: LearningOutcome[];
  isEditing: boolean;
  onChange: (index: number, field: string, value: string) => void;
  onAdd: () => void;
}

export function LearningOutcomesSection({ outcomes, isEditing, onChange, onAdd }: Props) {
  return (
    <div className="mb-8 rounded-[1.75rem] border border-[rgba(197,205,216,0.78)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,247,251,0.88))] p-6 shadow-[0_0.5rem_2rem_rgba(0,0,0,0.06)]">
      <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em]">Leerdoelen</h2>
      {isEditing && (
        <button
          onClick={onAdd}
          className="mb-4 rounded-full border border-[#4db84a] bg-[linear-gradient(135deg,#7dd87a_0%,#58c754_100%)] px-4 py-2 text-sm font-semibold text-[#103410] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          Leerdoel toevoegen
        </button>
      )}
      <div className="space-y-3">
        {outcomes.map((outcome, idx) => (
          <div key={idx} className="rounded-2xl border border-[#6aaae0] bg-[linear-gradient(135deg,#b3d9ff_0%,#85bef5_100%)] p-4 text-[#0d2a4a] shadow-[0_0.125rem_0.75rem_rgba(0,0,0,0.05)]">
            {isEditing ? (
              <>
                <input
                  type="text"
                  placeholder="Code"
                  value={outcome.code || ""}
                  onChange={(e) => onChange(idx, "code", e.target.value)}
                  className="mb-2 w-full rounded-2xl border border-white/70 bg-white/90 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-white"
                />
                <textarea
                  placeholder="Beschrijving"
                  value={outcome.description || ""}
                  onChange={(e) => onChange(idx, "description", e.target.value)}
                  className="w-full rounded-2xl border border-white/70 bg-white/90 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-white"
                  rows={3}
                />
              </>
            ) : (
              <>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#315778]">{outcome.code}</p>
                <p className="text-sm leading-6">{outcome.description}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}