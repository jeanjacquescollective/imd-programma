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
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-slate-900">{traject}</h2>
      </div>
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
    return <div className="imd-page"><div className="imd-soft-card p-8 text-center text-slate-500">No traject data found. Upload a CSV first.</div></div>;
  }

  return (
    <div className="imd-page">
      <section className="imd-hero mb-8">
        <h1 className="text-4xl font-bold tracking-[-0.03em] text-slate-900">Alle trajecten naast elkaar</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Vergelijk opgeslagen trajecten in dezelfde curriculumopmaak zonder de context van een individueel detailscherm te verliezen.</p>
      </section>
      {trajectEntries.map(([traject, rawCourses]) => (
        <TrajectGrid key={traject} traject={traject} rawCourses={rawCourses} />
      ))}
    </div>
  );
}