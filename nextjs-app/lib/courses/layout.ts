import type { StructuredCourses, LayoutResult, Placement, PlacedCourse } from "@/types/course";

export const ROWS_PER_SEMESTER = 30;
export const SEM_KEYS = ["Semester 1", "Semester 2"] as const;
const FAMILY_SIZE_THRESHOLD = 2;
// Safety cap for the earliest-fit search below — comfortably larger than any
// real curriculum's row count.
const SEARCH_BOUND = 100000;

export function getFamily(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*(solo|imd)\s*/gi, " ")
    // Strip a trailing "<number>: <descriptor>" suffix (e.g. "3: Virtual Worlds",
    // possibly multiple words) before the plain trailing-number strip, so
    // "Development 3: Virtual Worlds"/"Development 4: Creative Development" land
    // in the same family as "Development 1"/"Development 2".
    .replace(/\s+\d+\s*:\s*.+$/, "")
    .replace(/\s+\d+\s*$/, "")
    .trim();
}

function isSpecific(course: { is_generic?: boolean; study_programs?: string[] }): boolean {
  if (course.is_generic !== undefined) return !course.is_generic;
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

export function buildLayout(courses: StructuredCourses): LayoutResult {
  const columns = toSemesterColumns(courses);
  const sortedColumnKeys = getSortedColumnKeys(columns);

  // How many distinct columns (semesters) a family shows up in — used only to
  // decide which families get priority (appear earlier) when several are
  // competing for the same rows. A family that recurs across columns (e.g.
  // "Development" in semesters 1-4) is a "track": every instance of it always
  // gets the exact same row, computed once below.
  const columnCountByFamily: Record<string, number> = {};
  sortedColumnKeys.forEach((colKey) => {
    const familiesInColumn = new Set((columns[colKey] ?? []).map((c) => getFamily(c.course_name)));
    familiesInColumn.forEach((fam) => {
      columnCountByFamily[fam] = (columnCountByFamily[fam] ?? 0) + 1;
    });
  });
  const largeFamilies = new Set(
    Object.entries(columnCountByFamily).filter(([, count]) => count > FAMILY_SIZE_THRESHOLD).map(([fam]) => fam)
  );

  // Global min study_load per family — purely a sort tiebreaker (spans always
  // come from each course's own study_load).
  const familyMinLoad: Record<string, number> = {};
  sortedColumnKeys.forEach((colKey) => {
    (columns[colKey] ?? []).forEach((course) => {
      const fam = getFamily(course.course_name);
      if (familyMinLoad[fam] === undefined || course.study_load < familyMinLoad[fam]) {
        familyMinLoad[fam] = course.study_load;
      }
    });
  });

  // Large (>FAMILY_SIZE_THRESHOLD-column) families get first pick of rows;
  // within each group sort by min-load then name.
  const compareFamilies = (a: string, b: string): number => {
    const aLarge = largeFamilies.has(a);
    const bLarge = largeFamilies.has(b);
    if (aLarge !== bLarge) return aLarge ? -1 : 1;
    const diff = (familyMinLoad[a] ?? 0) - (familyMinLoad[b] ?? 0);
    return diff !== 0 ? diff : a.localeCompare(b);
  };

  // Schedules one group (non-specific or specific) across every column at
  // once. For each family (in priority order) it finds the EARLIEST row that
  // is simultaneously free in every column that family occupies — checking
  // whatever's already been placed there — instead of pre-reserving fixed
  // space per family. That's what lets a smaller family (e.g. "Interaction")
  // slot into a gap left in front of a bigger one (e.g. "Development") when it
  // actually fits, rather than leaving that gap empty.
  function scheduleGroup(
    matches: (course: any) => boolean,
    floorByColumn: Record<string, number>
  ): Record<string, PlacedCourse[]> {
    const spanFor = (course: any) => Math.max(1, course.study_load);

    // A family can have more than one course in the same column (e.g.
    // "Motion 3: 2D" and "Motion 3: 3D" both belong to family "motion" in the
    // same semester) — group by column so those stack one after another
    // instead of landing on top of each other.
    const columnsByFamily: Record<string, Record<string, any[]>> = {};
    sortedColumnKeys.forEach((colKey) => {
      (columns[colKey] ?? []).filter(matches).forEach((course) => {
        const fam = getFamily(course.course_name);
        const byColumn = (columnsByFamily[fam] ??= {});
        (byColumn[colKey] ??= []).push(course);
      });
    });

    const placedByColumn: Record<string, PlacedCourse[]> = {};
    sortedColumnKeys.forEach((colKey) => {
      placedByColumn[colKey] = [];
    });

    Object.keys(columnsByFamily)
      .sort(compareFamilies)
      .forEach((fam) => {
        const byColumn = columnsByFamily[fam];
        const colKeys = Object.keys(byColumn);
        const totalSpanFor = (colKey: string) => byColumn[colKey].reduce((sum, c) => sum + spanFor(c), 0);

        let row = Math.max(1, ...colKeys.map((colKey) => floorByColumn[colKey] ?? 1));
        while (row <= SEARCH_BOUND) {
          const fits = colKeys.every((colKey) => !hasOverlap(placedByColumn[colKey], row, totalSpanFor(colKey)));
          if (fits) break;
          row++;
        }

        colKeys.forEach((colKey) => {
          let cursor = row;
          byColumn[colKey].forEach((course) => {
            const span = spanFor(course);
            placedByColumn[colKey].push({ course, rowStart: cursor, rowSpan: span });
            cursor += span;
          });
        });
      });

    return placedByColumn;
  }

  // A column can still end up with an empty gap: e.g. a track needs to start
  // late enough to line up with a taller column elsewhere, but this column
  // has nothing else to put in the space that leaves behind. When that
  // happens, and nothing was available to fill it, just close the gap by
  // pulling everything below it up — that column's alignment with its
  // siblings no longer holds for the shifted items, but there was nothing to
  // align there anyway, and a solid block reads better than a dangling gap.
  function compactColumn(placed: PlacedCourse[], floor: number): PlacedCourse[] {
    let cursor = floor;
    return [...placed]
      .sort((a, b) => a.rowStart - b.rowStart)
      .map((p) => {
        const compacted = { ...p, rowStart: cursor };
        cursor += p.rowSpan;
        return compacted;
      });
  }

  // Non-specific (generic) courses always occupy the top block, specific
  // courses the block right below — the floor for the specific pass is each
  // column's own generic block height, so the split still happens at (at
  // least) that row everywhere, without forcing every column to match the
  // single tallest one.
  const nonSpecificPlaced = scheduleGroup((c) => !isSpecific(c), {});
  sortedColumnKeys.forEach((colKey) => {
    nonSpecificPlaced[colKey] = compactColumn(nonSpecificPlaced[colKey], 1);
  });

  const floorByColumn: Record<string, number> = {};
  sortedColumnKeys.forEach((colKey) => {
    floorByColumn[colKey] = nonSpecificPlaced[colKey].reduce(
      (max, p) => Math.max(max, p.rowStart + p.rowSpan),
      1
    );
  });
  const specificPlaced = scheduleGroup((c) => isSpecific(c), floorByColumn);
  sortedColumnKeys.forEach((colKey) => {
    specificPlaced[colKey] = compactColumn(specificPlaced[colKey], floorByColumn[colKey]);
  });

  const placement: Placement = {};
  sortedColumnKeys.forEach((colKey) => {
    placement[colKey] = [...nonSpecificPlaced[colKey], ...specificPlaced[colKey]];
  });

  // Overflow rule: a semester's total load can occasionally spike well past a
  // normal one (bad source data, a one-off heavy semester). If that happens
  // and another semester has trailing empty space — it's simply shorter,
  // since every column shares one row count — move one of the overloaded
  // semester's non-recurring courses to render inside that empty space
  // instead of stretching the whole grid taller for everyone. The course
  // still belongs to its real semester; only where its card is drawn moves.
  const OVERFLOW_THRESHOLD = 60;

  const columnHeight = (colKey: string) =>
    placement[colKey].reduce((max, p) => Math.max(max, p.rowStart + p.rowSpan - 1), 0);

  const heights: Record<string, number> = {};
  sortedColumnKeys.forEach((colKey) => {
    heights[colKey] = columnHeight(colKey);
  });
  const ceiling = Math.max(...Object.values(heights), 1);

  // Removals are deferred and applied once at the end, per source column —
  // compacting mid-loop would replace the placed entries with new objects,
  // breaking the by-reference removal for any later candidate from that same
  // snapshot.
  const removedByColumn: Record<string, Set<PlacedCourse>> = {};
  sortedColumnKeys.forEach((colKey) => {
    removedByColumn[colKey] = new Set();
  });

  sortedColumnKeys.forEach((colKey, colIndex) => {
    if (heights[colKey] <= OVERFLOW_THRESHOLD) return;

    // Only relocate courses that don't recur elsewhere — moving a track item
    // would break the row-alignment its other instances still rely on.
    const candidates = [...placement[colKey]]
      .filter((p) => columnCountByFamily[getFamily(p.course.course_name)] === 1)
      .sort((a, b) => b.rowStart - a.rowStart);

    for (const candidate of candidates) {
      if (heights[colKey] <= OVERFLOW_THRESHOLD) break;

      // Best-fit: the smallest gap that still fits it, nearest column first.
      const target = sortedColumnKeys
        .map((key, index) => ({ key, gap: ceiling - heights[key], distance: Math.abs(index - colIndex) }))
        .filter(({ key, gap }) => key !== colKey && gap >= candidate.rowSpan)
        .sort((a, b) => a.gap - b.gap || a.distance - b.distance)[0];
      if (!target) continue;

      removedByColumn[colKey].add(candidate);
      heights[colKey] -= candidate.rowSpan;

      placement[target.key] = [
        ...placement[target.key],
        { ...candidate, rowStart: heights[target.key] + 1 },
      ];
      heights[target.key] += candidate.rowSpan;
    }
  });

  sortedColumnKeys.forEach((colKey) => {
    if (removedByColumn[colKey].size === 0) return;
    placement[colKey] = compactColumn(
      placement[colKey].filter((p) => !removedByColumn[colKey].has(p)),
      1
    );
  });

  const totalRows = Math.max(...Object.values(heights), 1);

  return { placement, totalRows };
}
