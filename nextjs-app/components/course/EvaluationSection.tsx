import { Evaluation } from "@/types/course";

interface Props {
  evaluations: Evaluation[];
  evaluationText?: string;
  isEditing: boolean;
  onChange: (index: number, field: string, value: string) => void;
  onAdd: () => void;
}

const columns = [
  { key: "exam_chance", label: "Examenkans" },
  { key: "moment",      label: "Moment" },
  { key: "form",        label: "Vorm" },
  { key: "percentage",  label: "Percentage" },
];

export function EvaluationSection({ evaluations, evaluationText, isEditing, onChange, onAdd }: Props) {
  return (
    <div className="mb-8 rounded-[1.75rem] border border-[rgba(197,205,216,0.78)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,247,251,0.88))] p-6 shadow-[0_0.5rem_2rem_rgba(0,0,0,0.06)]">
      <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em]">Evaluatie</h2>
      {isEditing && (
        <button
          onClick={onAdd}
          className="mb-4 rounded-full border border-[#4db84a] bg-[linear-gradient(135deg,#7dd87a_0%,#58c754_100%)] px-4 py-2 text-sm font-semibold text-[#103410] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          Evaluatie toevoegen
        </button>
      )}
      <div className="overflow-x-auto">
        <table className="w-full overflow-hidden rounded-2xl text-sm">
          <thead className="bg-[linear-gradient(135deg,#c8f0ec_0%,#9dddd6_100%)] text-[#0d3633]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="p-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/85">
            {evaluations.map((evaluation, idx) => (
              <tr key={idx} className="border-b border-slate-200 last:border-b-0">
                {columns.map((col) => (
                  <td key={col.key} className="p-3 align-top text-slate-700">
                    {isEditing ? (
                      <input
                        type="text"
                        value={(evaluation as any)[col.key] || ""}
                        onChange={(e) => onChange(idx, col.key, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                      />
                    ) : (
                      (evaluation as any)[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {evaluationText && (
        <p className="mt-4 text-sm italic text-slate-600">{evaluationText}</p>
      )}
    </div>
  );
}