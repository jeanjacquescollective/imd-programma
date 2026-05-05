import type { StructuredCourses, LayoutResult, Placement } from "@/types/course";

export const ROWS_PER_SEMESTER = 30;
export const SEM_KEYS = ["Semester 1", "Semester 2"] as const;
const FAMILY_SIZE_THRESHOLD = 2;

export function getFamily(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*(solo|imd)\s*/gi, " ")
    .replace(/\s+\d+\s*$/, "")
    .trim();
}

function isSpecific(course: { study_programs?: string[] }): boolean {
  return (course.study_programs?.length ?? 0) === 1;
}

function hasOverlap(
  placed: { rowStart: number; rowSpan: number }[],
  rowStart: number,
  rowSpan: number
): boolean {
  return placed.some(
    (p) => rowStart < p.rowStart + p.rowSpan && rowStart + rowSpan > p.rowStart
  );
}

function findFreeSlot(
  placed: { rowStart: number; rowSpan: number }[],
  fromRow: number,
  span: number,
  totalRows: number
): number {
  const normalizedSpan = Math.max(1, Math.min(span, totalRows));
  const maxStart = totalRows - normalizedSpan + 1;
  const start = Math.min(Math.max(1, fromRow), maxStart);

  for (let row = start; row <= maxStart; row++) {
    if (!hasOverlap(placed, row, normalizedSpan)) return row;
  }
  return start;
}

function buildFamilyCourseCounts(
  columns: Record<string, { course_name: string }[]>
): Record<string, number> {
  const seen: Record<string, Set<string>> = {};
  Object.values(columns).forEach((courses) => {
    courses.forEach((course) => {
      const fam = getFamily(course.course_name);
      if (!seen[fam]) seen[fam] = new Set();
      seen[fam].add(course.course_name);
    });
  });

  return Object.fromEntries(
    Object.entries(seen).map(([fam, names]) => [fam, names.size])
  );
}

function sortCourses<T extends { course_name: string; study_load: number; study_programs?: string[] }>(
  courses: T[],
  largeFamilies: Set<string>
): T[] {
  return [...courses].sort((a, b) => {
    const aLarge = largeFamilies.has(getFamily(a.course_name));
    const bLarge = largeFamilies.has(getFamily(b.course_name));
    if (aLarge && !bLarge) return 1;
    if (!aLarge && bLarge) return -1;
    const familyCompare = getFamily(a.course_name).localeCompare(getFamily(b.course_name));
    if (familyCompare !== 0) return familyCompare;
    return a.study_load - b.study_load;
  });
}

function prepareColumn<T extends { course_name: string; study_load: number; study_programs?: string[] }>(
  courses: T[],
  largeFamilies: Set<string>
): T[] {
  const shared   = sortCourses(courses.filter((c) => !isSpecific(c)), largeFamilies);
  const specific = sortCourses(courses.filter((c) =>  isSpecific(c)), largeFamilies);
  return [...shared, ...specific];
}

function buildFamilyOffsets(
  referenceList: { course_name: string; study_load: number }[]
): Record<string, number> {
  const offsets: Record<string, number> = {};
  let cursor = 1;
  referenceList.forEach((course) => {
    const fam = getFamily(course.course_name);
    if (offsets[fam] === undefined) offsets[fam] = cursor;
    cursor += course.study_load;
  });
  return offsets;
}

function placeCourses(
  list: { course_name: string; study_load: number; study_programs?: string[]; [key: string]: any }[],
  placed: { course: any; rowStart: number; rowSpan: number }[],
  familyOffsets: Record<string, number>,
  largeFamilies: Set<string>,
  onlyLarge: boolean,
  totalRows: number  // true = first pass (large families), false = second pass (small families)
) {
  const familyCursor: Record<string, number> = {};

  list.forEach((course) => {
    const span = Math.max(1, Math.min(course.study_load, totalRows));
    const maxStart = totalRows - span + 1;

    const fam = getFamily(course.course_name);
    const isLarge = largeFamilies.has(fam);

    // Skip courses that don't belong to this pass
    if (onlyLarge && !isLarge) return;
    if (!onlyLarge && isLarge) return;

    if (familyCursor[fam] === undefined) {
      const desired = familyOffsets[fam] ?? 1;
      // Large families always claim their desired slot (they have upper hand)
      // Small families find the first free slot from row 1
      familyCursor[fam] = isLarge
        ? findFreeSlot(placed, Math.min(Math.max(1, desired), maxStart), span, totalRows)
        : findFreeSlot(placed, 1, span, totalRows);
    } else {
      // Stack within the same family — skip over anything in the way
      const desired = familyCursor[fam];
      familyCursor[fam] = hasOverlap(placed, desired, span)
        ? findFreeSlot(placed, desired, span, totalRows)
        : desired;
    }

    const rowStart = familyCursor[fam];
    const rowSpan = span;

    placed.push({ course, rowStart, rowSpan });
    familyCursor[fam] += rowSpan;
  });
}

function compactPlacement<T extends { rowStart: number; rowSpan: number }>(placed: T[]): T[] {
  let nextRow = 1;

  return [...placed]
    .sort((a, b) => a.rowStart - b.rowStart)
    .map((entry) => {
      const compacted = {
        ...entry,
        rowStart: nextRow,
      };

      nextRow += entry.rowSpan;
      return compacted;
    });
}

function stackCourses(
  list: { course: any; study_load: number }[] | { study_load: number; [key: string]: any }[],
  totalRows: number
): { course: any; rowStart: number; rowSpan: number }[] {
  let nextRow = 1;

  return list.map((course: any) => {
    const rowSpan = Math.max(1, Math.min(course.study_load, totalRows));
    const placedCourse = {
      course,
      rowStart: nextRow,
      rowSpan,
    };

    nextRow += rowSpan;
    return placedCourse;
  });
}

function toSemesterColumns(courses: StructuredCourses): Record<string, any[]> {
  const columns: Record<string, any[]> = {};

  courses.forEach((course) => {
    const semester = course.semester ?? 1;
    const year = course.year ?? Math.ceil(semester / 2);
    const colKey = `Y${year}-S${semester}`;

    if (!columns[colKey]) {
      columns[colKey] = [];
    }

    columns[colKey].push(course);
  });

  return columns;
}

function getSortedColumnKeys(columns: Record<string, any[]>): string[] {
  return Object.keys(columns).sort((a, b) => {
    const [, aYear, aSem] = a.match(/^Y(\d+)-S(\d+)$/) || [];
    const [, bYear, bSem] = b.match(/^Y(\d+)-S(\d+)$/) || [];
    const yearDiff = Number(aYear || 0) - Number(bYear || 0);
    if (yearDiff !== 0) return yearDiff;
    return Number(aSem || 0) - Number(bSem || 0);
  });
}

function getTotalRows(columns: Record<string, { study_load: number }[]>): number {
  const maxStudyLoad = Object.values(columns).reduce((maxValue, courses) => {
    const totalStudyLoad = courses.reduce((sum, course) => sum + course.study_load, 0);
    return Math.max(maxValue, totalStudyLoad);
  }, 0);

  return Math.max(maxStudyLoad, 1);
}

export function buildLayout(courses: StructuredCourses): LayoutResult {
  const columns = toSemesterColumns(courses);
  const sortedColumnKeys = getSortedColumnKeys(columns);
  const totalRows = getTotalRows(columns);

  const placement: Placement = {};
  const familyCourseCounts = buildFamilyCourseCounts(columns);
  const largeFamilies = new Set(
    Object.entries(familyCourseCounts)
      .filter(([, count]) => count > FAMILY_SIZE_THRESHOLD)
      .map(([fam]) => fam)
  );

  sortedColumnKeys.forEach((colKey) => {
    columns[colKey] = prepareColumn(columns[colKey] ?? [], largeFamilies);
  });

  // Find reference column for family offsets
  let referenceList: { course_name: string; study_load: number }[] = [];
  for (const colKey of sortedColumnKeys) {
    if ((columns[colKey] ?? []).length) {
      referenceList = columns[colKey];
      break;
    }
  }

  const familyOffsets = buildFamilyOffsets(referenceList);

  sortedColumnKeys.forEach((colKey) => {
    const list = columns[colKey] ?? [];
    const orderedCourses = [
      ...list.filter((course) => largeFamilies.has(getFamily(course.course_name))),
      ...list.filter((course) => !largeFamilies.has(getFamily(course.course_name))),
    ];

    placement[colKey] = stackCourses(orderedCourses, totalRows);
  });

  return { placement, totalRows };
}
