import type { RawCourse } from "@/types/course";

const STORAGE_KEY = "ECTS";

export type TrajectCoursesMap = Record<string, RawCourse[]>;

export function getTrajectCoursesFromStorage(): TrajectCoursesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as TrajectCoursesMap;
  } catch {
    return {};
  }
}

export function getRawCoursesFromStorage(): RawCourse[] {
  return Object.values(getTrajectCoursesFromStorage()).flat();
}

// A course is "generic" when it's taught to more than one traject (study
// programme) — the per-row study_programs field is frequently left empty by
// the scraper, so this is derived from how the course actually shows up
// across all stored trajects instead.
export function getGenericCourseNames(trajectMap: TrajectCoursesMap): Set<string> {
  const trajectsByName: Record<string, Set<string>> = {};

  Object.entries(trajectMap).forEach(([traject, courses]) => {
    courses.forEach((course) => {
      if (!course.course_name) return;
      if (!trajectsByName[course.course_name]) trajectsByName[course.course_name] = new Set();
      trajectsByName[course.course_name].add(traject);
    });
  });

  return new Set(
    Object.entries(trajectsByName)
      .filter(([, trajects]) => trajects.size > 1)
      .map(([name]) => name)
  );
}