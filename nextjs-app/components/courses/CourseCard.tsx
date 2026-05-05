import Link from "next/link";
import type { PlacedCourse } from "@/types/course";

interface Props {
  entry: PlacedCourse;
}

export function CourseCard({ entry: { course, rowStart, rowSpan } }: Props) {
  const borderColor =
    course.study_programs.length > 1 ? "#9ae6b4" : "#c084fc";

  return (
   <Link
  href={`/course/${encodeURIComponent(course.course_name)}`}
  className="p-2 shadow rounded block hover:shadow-lg transition group/card relative z-20"
  style={{
    gridRow: `${rowStart} / span ${rowSpan}`,
    backgroundColor: course.color,
    borderLeft: `3px solid ${borderColor}`,
  }}
>
  <h2 className="font-bold text-sm leading-tight">{course.course_name}</h2>
  <p className="text-xs text-gray-600 mt-0.5">{course.study_load} SP</p>

  {course.content && (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 bg-gray-800 text-white text-xs p-3 rounded opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 delay-300 z-30"
      dangerouslySetInnerHTML={{ __html: course.content }}
    />
  )}
</Link>
  );
}