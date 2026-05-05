import type { RawCourse, Course, StructuredCourses } from "@/types/course";
import { assignColors } from "./colors";
import { getFamily } from "./layout";

export function getSemesterFromCalendar(semester: string): number {
  const last = parseInt(semester?.match(/\d+/g)?.pop() || "1");
  return last;
}

export function cleanTraject(traject: string): string {
  return (traject || "Unknown Trajectory")
    .replace(/\s*(voltijds|contacttraject)\s*/gi, "")
    .trim()
    .split(/\s+/)
    .filter((w, i, arr) => i === arr.lastIndexOf(w))
    .join(" ");
}

export function buildStructuredCourses(data: RawCourse[]): StructuredCourses {
  const structuredCourses: StructuredCourses = [];

  data.forEach((course) => {
    if (!course.course_name) return;
    const traject = cleanTraject(course.traject);
    if (traject === "Unknown Trajectory") return;
    const semester = getSemesterFromCalendar(course.semester);
    const year = Math.ceil(semester / 2);

    structuredCourses.push({
      course_name: course.course_name,
      study_load: parseInt(String(course.study_load)),
      study_programs: Array.isArray(course.study_programs) ? course.study_programs : [],
      content: course.content || "",
      color: "",
      category: "",
      family: getFamily(course.course_name),
      learning_outcomes: [],
      evaluation: [],
      year: year,
      semester: semester,
    });
  });

  return structuredCourses;
}

export function attachColors(structured: StructuredCourses): StructuredCourses {
  const colorMap = assignColors(structured);

  structured.forEach((course) => {
      const ci = colorMap[course.course_name] ?? { color: "#fff", category: "default" };
      course.color = ci.color;
      course.category = ci.category;
      course.family = getFamily(course.course_name);
  });

  return structured;
}

export function prepareCourses(raw: RawCourse[]): StructuredCourses {
  const structured = buildStructuredCourses(raw);
  return attachColors(structured);
}