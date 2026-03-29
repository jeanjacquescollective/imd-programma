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
  console.log("Slug:", slug);
  console.log("Courses:", courses);
  if (!layout) return null;

  return <CourseGrid courses={courses} layout={layout} />;
}