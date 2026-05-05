import type { PlacedCourse } from "../../lib/courseLayout";
import CourseCard from "./CourseCard";

type Props = {
  semKey: string;
  colEntries: PlacedCourse[];
  totalRows: number;
};

export default function SemesterColumn({ semKey, colEntries, totalRows }: Props) {
  const totalSP = colEntries.reduce((sum, { course }) => sum + (course.study_load || 0), 0);

  return (
    <div className="grid grid-rows-[auto_1fr] p-2" style={{ minHeight: totalRows * 2.5 + "rem" }}>
      <div className="mb-3 grid gap-1 px-1 pb-3">
        <h3 className="text-lg font-bold tracking-[-0.02em] text-slate-900">{semKey}</h3>
        <span className="text-[0.72rem] font-normal text-slate-500">{totalSP} SP</span>
      </div>

      <div
        className="overflow-y-auto"
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${totalRows}, minmax(0.5rem, 1fr))`,
          gap: "0.45rem",
        }}
      >
        {colEntries.map(({ course, rowStart, rowSpan }, idx) => (
          <CourseCard key={idx} course={course} rowStart={rowStart} rowSpan={rowSpan} />
        ))}
      </div>
    </div>
  );
}
