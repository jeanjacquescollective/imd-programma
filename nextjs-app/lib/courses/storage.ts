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