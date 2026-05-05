import { Course } from "@/types/course";

interface Props {
  course: Course;
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

const fields = [
  { key: "academic_year",    label: "Academisch jaar" },
  { key: "study_program",    label: "Studieprogramma" },
  { key: "study_load",       label: "Studiepunten" },
  { key: "total_study_time", label: "Totale studietijd" },
  { key: "trajectschijf",    label: "Schijf" },
  { key: "calendar",         label: "Kalender" },
  { key: "language",         label: "Taal" },
  { key: "grading_scale",    label: "Cijferschaal" },
];

export function MetaGrid({ course, isEditing, onChange }: Props) {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {fields.map(({ key, label }) => (
        <div key={key} className="rounded-3xl border border-[rgba(197,205,216,0.78)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,247,251,0.9))] p-4 shadow-[0_0.125rem_0.75rem_rgba(0,0,0,0.05)]">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</label>
          {isEditing ? (
            <input
              type="text"
              value={(course as any)[key] || ""}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
            />
          ) : (
            <p className="text-sm font-medium text-slate-800">{(course as any)[key] || "-"}</p>
          )}
        </div>
      ))}
    </div>
  );
}