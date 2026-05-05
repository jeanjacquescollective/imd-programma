import { Course } from "@/types/course";

interface Props {
  course: Course;
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

export function ContentSection({ course, isEditing, onChange }: Props) {
  return (
    <>
      <div className="mb-8 rounded-[1.75rem] border border-[rgba(197,205,216,0.78)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,247,251,0.88))] p-6 shadow-[0_0.5rem_2rem_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em]">Docenten</h2>
        {isEditing ? (
          <input
            type="text"
            value={course.teachers || ""}
            onChange={(e) => onChange("teachers", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          />
        ) : (
          <p className="text-sm leading-6 text-slate-700">{course.teachers || "Geen docenten beschikbaar."}</p>
        )}
      </div>

      <div className="mb-8 rounded-[1.75rem] border border-[rgba(197,205,216,0.78)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,247,251,0.88))] p-6 shadow-[0_0.5rem_2rem_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em]">Inhoud</h2>
        {isEditing ? (
          <textarea
            value={course.content || ""}
            onChange={(e) => onChange("content", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
            rows={6}
          />
        ) : (
          <div
            className="prose prose-sm max-w-none text-slate-700 prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900"
            dangerouslySetInnerHTML={{ __html: course.content }}
          />
        )}
      </div>
    </>
  );
}