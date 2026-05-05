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
    <div className="grid grid-cols-2 gap-4 mb-8">
      {fields.map(({ key, label }) => (
        <div key={key} className="bg-white p-4 rounded shadow">
          <label className="block font-semibold text-sm mb-1">{label}</label>
          {isEditing ? (
            <input
              type="text"
              value={(course as any)[key] || ""}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{(course as any)[key]}</p>
          )}
        </div>
      ))}
    </div>
  );
}