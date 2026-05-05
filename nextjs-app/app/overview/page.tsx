"use client";

import { useEffect, useState } from "react";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { useCourseLayout } from "@/hooks/useCourseLayout";
import { getTrajectCoursesFromStorage } from "@/lib/courses/storage";
import type { RawCourse } from "@/types/course";

function TrajectGrid({ traject, rawCourses }: { traject: string; rawCourses: RawCourse[] }) {
  const { courses, layout } = useCourseLayout(rawCourses);

  if (!layout || courses.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{traject}</h2>
      <CourseGrid courses={courses} layout={layout} />
    </section>
  );
}

export default function CoursesPage() {
  const [trajectEntries, setTrajectEntries] = useState<[string, RawCourse[]][]>([]);

  useEffect(() => {
    const trajectMap = getTrajectCoursesFromStorage();
    setTrajectEntries(Object.entries(trajectMap));
  }, []);

  if (trajectEntries.length === 0) {
    return <div className="p-6">No traject data found. Upload a CSV first.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Overzicht per traject</h1>
      {trajectEntries.map(([traject, rawCourses]) => (
        <TrajectGrid key={traject} traject={traject} rawCourses={rawCourses} />
      ))}
    </div>
  );
}