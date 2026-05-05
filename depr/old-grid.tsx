"use client";

import { useEffect, useState } from "react";
import {
  buildLayout,
  assignColors,
  cleanTraject,
  getSemesterFromCalendar,
  getFamily,
  SEM_KEYS,
  type CourseEntry,
  type Placement,
} from "@/lib/courseLayout";
import SemesterColumn from "../../components/course/CourseGrid";

type StructuredCourses = Record<string, Record<string, CourseEntry[]>>;

export default function CoursesPage() {
  const [courses, setCourses] = useState<StructuredCourses>({});
  const [layout, setLayout] = useState<{ placement: Placement; totalRows: number } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("courses");
    const data = raw ? JSON.parse(raw) : [];

    const structured: StructuredCourses = {};
    data.forEach((course) => {
      if (!course.course_name) return;
      const traject = cleanTraject(course.traject);
      if (traject === "Unknown Trajectory") return;
      const semester = getSemesterFromCalendar(course.calendar);
      const studyLoad = Number.parseInt(String(course.study_load ?? "").replace(/[^\d]/g, ""), 10) || 0;
      if (!structured[traject]) structured[traject] = { "Semester 1": [], "Semester 2": [] };
      structured[traject][semester].push({
        course_name:    course.course_name,
        study_load:     studyLoad,
        study_programs: course.study_programs || "",
        content:        course.content        || "",
      });
    });

    const colors = assignColors(structured);

    Object.values(structured).forEach((sems) =>
      Object.values(sems).forEach((list) =>
        list.forEach((c) => {
          const ci = colors[c.course_name] || { color: "#fff", category: "default" };
          c.color    = ci.color;
          c.category = ci.category;
          c.family   = getFamily(c.course_name);
        })
      )
    );

    const trajectProgramName = (traject: string) =>
      traject.replace(/^-?\s*Schijf\s*\d+\s*/i, "").trim();

    const parseStudyPrograms = (studyPrograms: string) =>
      Array.from(String(studyPrograms || "").matchAll(/'([^']+)'|"([^"]+)"/g))
        .map((m) => m[1] || m[2])
        .filter(Boolean);

    const isSpecificForTraject = (course: CourseEntry, traject: string) => {
      const programs = parseStudyPrograms(course.study_programs || "");
      const program = trajectProgramName(traject);
      return programs.length === 1 && programs[0] === program;
    };

    Object.entries(structured).forEach(([traject, sems]) =>
      Object.values(sems).forEach((list) =>
        list.sort((a, b) => {
          const byLoad = (b.study_load || 0) - (a.study_load || 0);
          if (byLoad !== 0) return byLoad;

          const bySpecific = Number(isSpecificForTraject(b, traject)) - Number(isSpecificForTraject(a, traject));
          if (bySpecific !== 0) return bySpecific;

          return a.course_name.localeCompare(b.course_name, "nl");
        })
      )
    );

    console.log("Structured:", structured);

    const lyt = buildLayout(structured);
    
    setCourses(structured);
    setLayout(lyt);
  }, []);

  if (!layout) return null;

  const { placement, totalRows } = layout;

  return (
    <main className="imd-shell">
      <section className="imd-panel overflow-hidden rounded-[2rem]">
        <header className="mb-8 text-center">
          <h1 className="mx-auto max-w-4xl text-balance text-3xl font-extrabold leading-tight tracking-[-0.04em] text-slate-900 sm:text-4xl lg:text-[3.25rem]">
            Programma{" "}
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-blue-700 bg-clip-text text-transparent">
              Interactive Media Development
            </span>
          </h1>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-6 divide-y-4 divide-slate-300 xl:divide-y-0 xl:divide-x-4">
          {Object.entries(courses).map(([traject, _], yi) => (
            <section key={traject} className="col-span-1 grid grid-rows-[auto_1fr] xl:col-span-2">
              <div className="px-1 text-center">
                <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-900">
                  Jaar {yi + 1}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dashed divide-slate-300">
                {SEM_KEYS.map((semKey) => (
                  <SemesterColumn
                    key={semKey}
                    semKey={semKey}
                    colEntries={placement[`${yi}-${semKey}`] || []}
                    totalRows={totalRows}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
