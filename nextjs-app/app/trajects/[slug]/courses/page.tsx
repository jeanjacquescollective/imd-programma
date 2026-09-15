"use client";

import { CourseGrid } from "@/components/courses/CourseGrid";
import { useCourseLayout } from "@/hooks/useCourseLayout";
import { use } from "react";

export default function CoursesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params);
  const { courses, layout } = useCourseLayout();
  if (!layout) return null;

  return (
    <div>
      <div className="imd-page pb-0 pt-4">
        <section className="imd-hero mb-3">
          <h1 className="text-4xl font-bold tracking-[-0.03em] text-slate-900">{decodeURIComponent(slug)}</h1>
          <p className="mt-1 text-sm leading-7 text-slate-600">Rechtstreekse gridweergave van dit traject in dezelfde layoutstijl als de andere hoofdpagina&apos;s.</p>
        </section>
      </div>
      <div className="imd-grid-wrap">
        <CourseGrid courses={courses} layout={layout} />
      </div>
    </div>
  );
}