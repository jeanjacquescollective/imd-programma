"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Configurable color palettes and category logic
const COLOR_PALETTES = {
    stage: ['#6b9eff', '#5a8dff', '#4a7cff'],
    studio: ['#5a8dff', '#4a7cff', '#6b9eff'],
    expert: ['#5a8dff', '#4a7cff', '#6b9eff'],
    development: ['#e9d5ff', '#ddd6fe', '#c4b5fd'],
    technology: ['#7db3f5', '#9dcbfd', '#8b9db3'],
    web: ['#bfdbfe', '#93c5fd', '#60a5fa'],
    default: ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e']
};

// Helper function to determine course category
const getCourseCategory = (courseName) => {
  const lower = courseName.toLowerCase();
  if (lower.includes('stage') || lower.includes('studio') || lower.includes('expert')) return 'stage';
  if (lower.includes('development')) return 'development';
  if (lower.includes('technology')) return 'technology';
  if (lower.includes('web')) return 'web';
  return 'default';
};

// Helper function to determine semester from calendar string
const getSemesterFromCalendar = (calendar) => {
  const lastNumber = parseInt(calendar?.match(/\d+/g)?.pop() || '1');
  return lastNumber % 2 === 0 ? 'Semester 2' : 'Semester 1';
};

// Helper function to clean and format traject
const cleanTraject = (traject) => {
  return (traject || 'Unknown Trajectory')
    .replace(/\s*(voltijds|contacttraject)\s*/gi, '')
    .trim()
    .split(/\s+/)
    .filter((word, index, array) => index === array.lastIndexOf(word))
    .join(' ');
};

export default function CoursesPage() {
  const [courses, setCourses] = useState({});

  useEffect(() => {
    const storedCourses = localStorage.getItem("courses");
    const coursesData = storedCourses ? JSON.parse(storedCourses) : [];
    const structuredCourses = {};
    const courseColors = {};
    const usedColors = [];

    coursesData.forEach(course => {
      const category = getCourseCategory(course.course_name);
      const palette = COLOR_PALETTES[category];
      const colorIndex = usedColors.filter(c => c.category === category).length % palette.length;
      const color = palette[colorIndex];
      courseColors[course.course_name] = { color, category };
      usedColors.push({ category, color });
    });

    coursesData.forEach(course => {
      const studyLoad = parseInt(course.study_load);
      const semester = getSemesterFromCalendar(course.calendar);
      const traject = cleanTraject(course.traject);
      const appearsIn = course.appears_in || '';
      const courseContent = course.content || '';
      const colorInfo = courseColors[course.course_name] || { color: '#fff' };

      if (traject === 'Unknown Trajectory') {
        console.warn(`Course "${course.course_name}" has an unknown trajectory. Please check the data.`);
        return;
      }

      if (!structuredCourses[traject]) {
        structuredCourses[traject] = {
          'Semester 1': [],
          'Semester 2': []
        };
      }

      structuredCourses[traject][semester].push({
        course_name: course.course_name,
        study_load: studyLoad,
        appears_in: appearsIn,
        color: colorInfo.color,
        category: colorInfo.category,
        content: courseContent
      });
    });

    setCourses(structuredCourses);
  }, []);

  return (
    <div className="max-w-6xl mx-auto pt-5 min-h-screen">
      <h1 className="text-3xl font-bold mb-3">Cursusoverzicht {Object.entries(courses)[0]?.[0].replace("Schijf 1", ' ') || 'Unknown Course'}</h1>
      <div className="grid grid-cols-6 gap-4">
        {Object.entries(courses).map(([traject, semesters]) => (
          <div key={traject} className="mb-8 col-span-2 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Jaar {Object.keys(courses).indexOf(traject) + 1}</h2>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {Object.entries(semesters).map(([semester, semesterCourses]) => (
                <div key={semester} className="bg-gray-100 rounded flex flex-col p-0">
                  <h3 className="text-xl font-semibold mb-2">{semester}</h3>
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateRows: 'repeat(30, 1fr)',
                      height: '100%',
                    }}
                  >
                    {semesterCourses.map((course, idx) => (
                      <Link
                        key={idx}
                        href={`/course/${encodeURIComponent(course.course_name)}`}
                        className="p-2 bg-white shadow rounded block hover:shadow-lg transition group relative"
                        style={{
                          gridRow: `span ${course.study_load}`,
                          borderColor: course.appears_in ? '#9ae6b4' : '#c084fc',
                          backgroundColor: course.color,
                        }}
                      >
                        <h2 className="font-bold">{course.course_name}</h2>
                        <p className="text-sm text-gray-600">{course.study_load} studiepunten</p>
                        {course.content && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 bg-gray-800 text-white text-xs p-3 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                            {course.content}
                        </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}