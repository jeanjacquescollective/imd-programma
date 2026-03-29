import { SemesterColumn } from "./SemesterColumn";
import type { StructuredCourses, LayoutResult } from "@/types/course";

interface Props {
  courses: StructuredCourses;
  layout: LayoutResult;
}

export function CourseGrid({ courses, layout }: Props) {
  const columnKeys = Array.from(
    new Set(
      courses.map((item) => {
        const semester = item.semester ?? 1;
        const year = item.year ?? Math.ceil(semester / 2);
        return `Y${year}-S${semester}`;
      })
    )
  ).sort((a, b) => {
    const [, aYear, aSem] = a.match(/^Y(\d+)-S(\d+)$/) || [];
    const [, bYear, bSem] = b.match(/^Y(\d+)-S(\d+)$/) || [];
    const yearDiff = Number(aYear || 0) - Number(bYear || 0);
    if (yearDiff !== 0) return yearDiff;
    return Number(aSem || 0) - Number(bSem || 0);
  });

  const gridTemplateColumns = `repeat(${Math.max(columnKeys.length, 1)}, minmax(60px, 1fr))`;

  const labels = columnKeys.map((key) => {
    const [, year, semester] = key.match(/^Y(\d+)-S(\d+)$/) || [];
    return {
      key,
      year: Number(year || 0),
      semester: Number(semester || 0),
    };
  });

  return (
    <div className="max-w-8xl mx-auto pt-5 flex flex-col min-h-screen">
      <h1 className="text-3xl font-bold mb-3">Cursusoverzicht</h1>
      <div className="pb-2 flex-1 min-h-0">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns }}
        >
          {labels.map(({ key, year, semester }) => (
            <div key={key} className="min-w-0">
              <h2 className="text-xl font-bold mb-1">Jaar {year}</h2>
              <SemesterColumn
                semKey={`Semester ${semester}`}
                entries={layout.placement[key] ?? []}
                totalRows={layout.totalRows}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}