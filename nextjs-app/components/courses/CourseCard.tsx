import Link from "next/link";
import type { PlacedCourse } from "@/types/course";

const PALETTE_STYLES: Record<
  string,
  { background: string; border: string; text: string; credit: string }
> = {
  // Every specific (single-programme) course family gets the same hue (blue),
  // just a different shade — so unrelated families stay distinguishable while
  // reading as one consistent color, and same-family courses (e.g.
  // "Interaction 1" / "Interaction 2") land on the exact same shade.
  "specific-1": {
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    border: "#bfdbfe",
    text: "#1e3a8a",
    credit: "#1d4ed8",
  },
  "specific-2": {
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    border: "#93c5fd",
    text: "#1e3a8a",
    credit: "#1d4ed8",
  },
  "specific-3": {
    background: "linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)",
    border: "#60a5fa",
    text: "#1e3a8a",
    credit: "#1d4ed8",
  },
  "specific-4": {
    background: "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)",
    border: "#3b82f6",
    text: "#0f2557",
    credit: "#17356e",
  },
  "specific-5": {
    background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
    border: "#2563eb",
    text: "#ffffff",
    credit: "rgba(255, 255, 255, 0.86)",
  },
  "specific-6": {
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    border: "#1e40af",
    text: "#ffffff",
    credit: "rgba(255, 255, 255, 0.86)",
  },
  "nonspecific-shared": {
    background: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
    border: "#fdba74",
    text: "#7c2d12",
    credit: "#9a3412",
  },
  "nonspecific-orange-1": {
    background: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
    border: "#fdba74",
    text: "#7c2d12",
    credit: "#9a3412",
  },
  "nonspecific-orange-2": {
    background: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)",
    border: "#fb923c",
    text: "#7c2d12",
    credit: "#9a3412",
  },
  "nonspecific-orange-3": {
    background: "linear-gradient(135deg, #fdba74 0%, #fb923c 100%)",
    border: "#f97316",
    text: "#5f290f",
    credit: "#7c2d12",
  },
  "nonspecific-orange-4": {
    background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
    border: "#ea580c",
    text: "#ffffff",
    credit: "rgba(255, 255, 255, 0.86)",
  },
  "light-grey": {
    background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
    border: "#d1d5db",
    text: "#374151",
    credit: "#6b7280",
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