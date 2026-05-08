// ─── Types ────────────────────────────────────────────────────────────────────

export type CourseEntry = {
  course_name: string;
  study_load: number;
  study_programs: string;
  content: string;
  color?: string;
  category?: string;
  family?: string;
};

export type PlacedCourse = {
  course: CourseEntry;
  rowStart: number;
  rowSpan: number;
};

export type Placement = Record<string, PlacedCourse[]>;

// ─── Constants ────────────────────────────────────────────────────────────────

export const ROWS_PER_SEMESTER = 30;
export const SEM_KEYS = ["Semester 1", "Semester 2"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateHues(n: number, offset = 200): number[] {
  return Array.from({ length: n }, (_, i) =>
    Math.round((offset + (i * 360) / n) % 360)
  );
}

function hueToPalette(hue: number): string[] {
  return [
    `hsl(${hue}, 70%, 88%)`,
    `hsl(${hue}, 65%, 80%)`,
    `hsl(${hue}, 60%, 72%)`,
  ];
}

function buildFamilyPalettes(families: string[]): Record<string, string[]> {
  const uniqueFamilies = Array.from(new Set(families));
  const hues = generateHues(uniqueFamilies.length);
  const map: Record<string, string[]> = {};
  uniqueFamilies.forEach((fam, i) => { map[fam] = hueToPalette(hues[i]); });
  return map;
}

// ─── Exported utilities ───────────────────────────────────────────────────────

export const getFamily = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\s*(solo|imd)\s*/gi, " ")
    .replace(/\s+\d+\s*$/, "")
    .trim();

export const getSemesterFromCalendar = (calendar: string): string => {
  const last = parseInt(calendar?.match(/\d+/g)?.pop() || "1");
  return last % 2 === 0 ? "Semester 2" : "Semester 1";
};

export const cleanTraject = (traject: string): string =>
  (traject || "Unknown Trajectory")
    .replace(/\s*(voltijds|contacttraject)\s*/gi, "")
    .trim()
    .split(/\s+/)
    .filter((w, i, arr) => i === arr.lastIndexOf(w))
    .join(" ");

// ─── Layout builder ───────────────────────────────────────────────────────────

export function buildLayout(
  structuredCourses: Record<string, Record<string, CourseEntry[]>>
): { placement: Placement; totalRows: number } {
  const years = Object.entries(structuredCourses);

  // Sort each column by family name so related courses align across years
  years.forEach(([, semesters]) => {
    SEM_KEYS.forEach((sk) => {
      semesters[sk]?.sort((a, b) => {
        const famCmp = getFamily(a.course_name).localeCompare(getFamily(b.course_name));
        if (famCmp !== 0) return famCmp;
        return (b.study_load || 0) - (a.study_load || 0);
      });
    });
  });

  // familyAnchor tracks the first row a family was placed on so later columns
  // can snap to the same position, keeping family rows horizontally aligned
  const familyAnchor: Record<string, number> = {};
  const placement: Placement = {};

  years.forEach(([, semesters], yi) => {
    SEM_KEYS.forEach((sk) => {
      const colKey = `${yi}-${sk}`;
      const list = semesters[sk] || [];
      placement[colKey] = [];
      let cursor = 1;

      list.forEach((course) => {
        const fam = getFamily(course.course_name);
        const span = course.study_load;

        if (familyAnchor[fam] !== undefined) {
          if (familyAnchor[fam] >= cursor) cursor = familyAnchor[fam];
        } else {
          familyAnchor[fam] = cursor;
        }

        const rowStart = cursor;
        const rowSpan = Math.min(span, ROWS_PER_SEMESTER - cursor + 1);
        placement[colKey].push({ course, rowStart, rowSpan });
        cursor += rowSpan;
      });
    });
  });

  return { placement, totalRows: ROWS_PER_SEMESTER };
}

// ─── Color assignment ─────────────────────────────────────────────────────────

export function assignColors(
  structuredCourses: Record<string, Record<string, CourseEntry[]>>
): Record<string, { color: string; category: string }> {
  const allFamilies: string[] = [];
  Object.values(structuredCourses).forEach((sems) =>
    Object.values(sems).forEach((courses) =>
      courses.forEach((c) => allFamilies.push(getFamily(c.course_name)))
    )
  );

  const familyPalettes = buildFamilyPalettes(allFamilies);
  const familyShadeIdx: Record<string, number> = {};
  const colorMap: Record<string, { color: string; category: string }> = {};

  Object.values(structuredCourses).forEach((sems) =>
    Object.values(sems).forEach((courses) =>
      courses.forEach((c) => {
        if (colorMap[c.course_name]) return;
        const fam = getFamily(c.course_name);
        const pal = familyPalettes[fam];
        const idx = (familyShadeIdx[fam] || 0) % pal.length;
        familyShadeIdx[fam] = (familyShadeIdx[fam] || 0) + 1;
        colorMap[c.course_name] = { color: pal[idx], category: fam };
      })
    )
  );

  return colorMap;
}
