import Link from "next/link";
import type { PlacedCourse } from "@/types/course";
export default function CourseCard({ course, rowStart, rowSpan }: PlacedCourse) {
  return (
    <Link
      href={`/course/${encodeURIComponent(course.course_name)}`}
      className="imd-card-hover group relative block overflow-visible rounded-2xl border border-white/70 p-2 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
      style={{
        gridRow: `${rowStart} / span ${rowSpan}`,
        backgroundColor: course.color,
        borderLeft: `4px solid ${(course.study_programs?.length ?? 0) > 1 ? "#4caf50" : "#8b5cf6"}`,
      }}
    >
      <h2 className="text-sm font-bold leading-tight text-slate-900 sm:text-[0.95rem]">
        {course.course_name}
      </h2>
      <span className="mt-1 block text-[0.68rem] font-normal text-slate-500">
        {course.study_load} SP
      </span>
{/* 
      {course.content && (
        <div className="pointer-events-none absolute bottom-[calc(100%+0.75rem)] left-1/2 z-20 w-[20rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl bg-slate-950/95 p-4 text-xs leading-5 text-slate-100 opacity-0 shadow-2xl transition-opacity duration-200 group-hover:opacity-100">
          {course.content}
        </div>
      )} */}
    </Link>
  );
}
