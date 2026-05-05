import Link from "next/link";
import type { PlacedCourse } from "@/types/course";

const PALETTE_STYLES: Record<
  string,
  { background: string; border: string; text: string; credit: string }
> = {
  green: {
    background: "linear-gradient(135deg, #c8f5c4 0%, #a5e8a0 100%)",
    border: "#8ed88a",
    text: "#1b4a1a",
    credit: "#315f31",
  },
  "green-dark": {
    background: "linear-gradient(135deg, #7dd87a 0%, #58c754 100%)",
    border: "#4db84a",
    text: "#103410",
    credit: "#1f4a1f",
  },
  blue: {
    background: "linear-gradient(135deg, #b3d9ff 0%, #85bef5 100%)",
    border: "#6aaae0",
    text: "#0d2a4a",
    credit: "#315778",
  },
  "blue-dark": {
    background: "linear-gradient(135deg, #5b9bd5 0%, #3d7fc0 100%)",
    border: "#2d6aaa",
    text: "#ffffff",
    credit: "rgba(255, 255, 255, 0.82)",
  },
  purple: {
    background: "linear-gradient(135deg, #e0b8f0 0%, #ce93d8 100%)",
    border: "#bb7acc",
    text: "#3a0a4a",
    credit: "#633872",
  },
  "purple-dark": {
    background: "linear-gradient(135deg, #ba68c8 0%, #9c45b8 100%)",
    border: "#8a32a8",
    text: "#ffffff",
    credit: "rgba(255, 255, 255, 0.82)",
  },
  teal: {
    background: "linear-gradient(135deg, #c8f0ec 0%, #9dddd6 100%)",
    border: "#7cccc4",
    text: "#0d3633",
    credit: "#3a6662",
  },
  "teal-dark": {
    background: "linear-gradient(135deg, #80cbc4 0%, #55b5ac 100%)",
    border: "#42a09a",
    text: "#042422",
    credit: "#2f5f5b",
  },
  default: {
    background: "linear-gradient(135deg, #ffffff 0%, #e8eef6 100%)",
    border: "#cbd5e1",
    text: "#142033",
    credit: "#5b6677",
  },
};

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
  const palette = PALETTE_STYLES[course.category] ?? PALETTE_STYLES.default;
  const accentColor =
    course.study_programs.length > 1 ? "rgba(255, 255, 255, 0.8)" : "rgba(20, 32, 51, 0.22)";
  const showTooltipBelow = rowStart <= 3;

  return (
   <Link
  href={`/course/${encodeURIComponent(course.course_name)}`}
  className="group/card relative z-20 block overflow-visible rounded-2xl mx-3 px-3 py-2 shadow-[0_0.125rem_0.75rem_rgba(0,0,0,0.07),0_0.0625rem_0.25rem_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:z-40 hover:shadow-[0_0.375rem_1.5rem_rgba(0,0,0,0.13)]"
  style={{
    gridColumn: columnStart ? `${columnStart} / span ${columnSpan}` : undefined,
    gridRow: `${rowStart + rowOffset} / span ${rowSpan}`,
    background: palette.background,
    border: `1px solid ${palette.border}`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), inset 4px 0 0 ${accentColor}`,
    color: palette.text,
  }}
>
  <h2 className="font-bold text-sm leading-tight">{course.course_name}</h2>
  <p className="mt-0.5 text-xs font-medium" style={{ color: palette.credit }}>{course.study_load} SP</p>

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