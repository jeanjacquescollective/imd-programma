"use client";

import { getRawCoursesFromStorage, getTrajectCoursesFromStorage, getGenericCourseNames } from "@/lib/courses/storage";
import { prepareCourses } from "@/lib/courses/transform";
import { buildLayout } from "@/lib/courses/layout";
import type { StructuredCourses, LayoutResult, RawCourse } from "@/types/course";

interface UseCourseLayoutResult {
  courses: StructuredCourses;
  layout: LayoutResult | null;
}

export function useCourseLayout(rawCourses?: RawCourse[]): UseCourseLayoutResult {

    const raw = rawCourses ?? getRawCoursesFromStorage();
    // Generic (multi-traject) courses are determined from every stored traject,
    // not just the one being rendered, so a course keeps its color/placement
    // no matter which traject view it's shown in.
    const genericNames = getGenericCourseNames(getTrajectCoursesFromStorage());
    const structured = prepareCourses(raw, genericNames);
    const lyt = buildLayout(structured);

  return { courses: structured, layout: lyt };
}