import Link from "next/link";
import type { PlacedCourse } from "@/types/course";
import { CATEGORY_STYLES } from "@/lib/courses/colors";

interface Props {
  entry: PlacedCourse;
  columnStart?: number;
  columnSpan?: number;
  rowOffset?: number;
}

export function CourseCard({
  entry: { course, rowStart, rowSpan },
  columnStart,
  columnSpan = 1,
  rowOffset = 0,
}: Props) {
  const palette = CATEGORY_STYLES[course.category] ?? CATEGORY_STYLES.default;
  const accentColor =
    course.study_programs.length > 1 ? "rgba(255, 255, 255, 0.8)" : "rgba(20, 32, 51, 0.22)";
  const showTooltipBelow = rowStart <= 3;
  const isDark = palette.text === "#ffffff";

  return (
   <Link
  href={`/course/${encodeURIComponent(course.course_name)}`}
  className="group/card relative z-20 block overflow-visible rounded-2xl mx-3 px-3 py-2 shadow-[0_0.125rem_0.75rem_rgba(0,0,0,0.07),0_0.0625rem_0.25rem_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:z-40 hover:shadow-[0_0.375rem_1.5rem_rgba(0,0,0,0.13)]"
  style={{
    gridColumn: columnStart ? `${columnStart} / span ${columnSpan}` : undefined,
    gridRow: `${rowStart + rowOffset} / span ${rowSpan}`,
    background: palette.background,
    border: `1px solid ${palette.border}`,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
    color: palette.text,
  }}
>
  <h2 className="pr-6 font-bold text-sm leading-tight">{course.course_name}</h2>

  <div
    className="pointer-events-none absolute bottom-1.5 right-1.5 z-30 flex h-6 w-6 items-center justify-center rounded-full text-[8px] font-bold leading-none opacity-30"
    style={{
      border: `1.5px solid ${isDark ? "rgba(255,255,255,0.55)" : palette.credit}`,
      color: palette.credit,
    }}
  >
    {course.study_load}st
  </div>

  {course.content && (
    <div
      className={`pointer-events-none absolute left-1/2 z-50 w-80 -translate-x-1/2 rounded-xl bg-gray-800 p-3 text-xs text-white opacity-0 transition-opacity duration-300 delay-300 group-hover/card:opacity-100 ${
        showTooltipBelow ? "top-full mt-2" : "bottom-full mb-2"
      }`}
    >
      <div
        className="leading-5 text-white/90"
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 5,
          overflow: "hidden",
        }}
        dangerouslySetInnerHTML={{ __html: course.content }}
      />
      <p className="mt-2 border-t border-white/15 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
        Klik om meer te lezen
      </p>
    </div>
  )}
</Link>
  );
}