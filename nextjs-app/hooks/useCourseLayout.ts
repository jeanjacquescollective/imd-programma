"use client";

import { getRawCoursesFromStorage } from "@/lib/courses/storage";
import { prepareCourses } from "@/lib/courses/transform";
import { buildLayout } from "@/lib/courses/layout";
import type { StructuredCourses, LayoutResult, RawCourse } from "@/types/course";

interface UseCourseLayoutResult {
  courses: StructuredCourses;
  layout: LayoutResult | null;
}

export function useCourseLayout(rawCourses?: RawCourse[]): UseCourseLayoutResult {
  
    const raw = rawCourses ?? getRawCoursesFromStorage();
    console.log("Raw courses from storage:", raw);
    const structured = prepareCourses(raw);
    const lyt = buildLayout(structured);

  return { courses: structured, layout: lyt };
}