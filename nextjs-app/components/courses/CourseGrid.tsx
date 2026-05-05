import type { StructuredCourses, LayoutResult } from "@/types/course";
import { CourseCard } from "./CourseCard";

const GRID_COLUMNS_PER_SEMESTER = 2;
const HEADER_ROW_COUNT = 2;

interface Props {
  courses: StructuredCourses;
  layout: LayoutResult;
}

export function CourseGrid({ courses, layout }: Props) {
  const columnKeys = Array.from(
    new Set(
      courses.map((item) => {
        const semester = item.semester ?? 1;
        const year = item.year ?? Math.ceil(semester / 2);
        return `Y${year}-S${semester}`;
      })
    )
  ).sort((a, b) => {
    const [, aYear, aSem] = a.match(/^Y(\d+)-S(\d+)$/) || [];
    const [, bYear, bSem] = b.match(/^Y(\d+)-S(\d+)$/) || [];
    const yearDiff = Number(aYear || 0) - Number(bYear || 0);
    if (yearDiff !== 0) return yearDiff;
    return Number(aSem || 0) - Number(bSem || 0);
  });

  const labels = columnKeys.map((key) => {
    const [, year, semester] = key.match(/^Y(\d+)-S(\d+)$/) || [];
    return {
      key,
      year: Number(year || 0),
      semester: Number(semester || 0),
    };
  });

  const yearGroups = labels.reduce<
    { year: number; startColumn: number; columnSpan: number }[]
  >((groups, { year }, index) => {
    const startColumn = index * GRID_COLUMNS_PER_SEMESTER + 1;
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.year === year) {
      lastGroup.columnSpan += GRID_COLUMNS_PER_SEMESTER;
      return groups;
    }

    groups.push({
      year,
      startColumn,
      columnSpan: GRID_COLUMNS_PER_SEMESTER,
    });

    return groups;
  }, []);

  const gridTemplateColumns = `repeat(${Math.max(
    labels.length * GRID_COLUMNS_PER_SEMESTER,
    GRID_COLUMNS_PER_SEMESTER
  )}, minmax(0, 1fr))`;
  const gridTemplateRows = `auto auto repeat(${Math.max(layout.totalRows, 1)}, minmax(0, 1fr))`;
  const semesterDividers = labels.slice(0, -1).map((label, index) => ({
    key: label.key,
    gridColumn: (index + 1) * GRID_COLUMNS_PER_SEMESTER,
    isYearBoundary: labels[index + 1]?.year !== label.year,
  }));

  return (
    <div className="mx-auto grid max-w-8xl min-h-[70vh] grid-rows-[auto_minmax(0,1fr)] pt-5 lg:h-[calc(100vh-3rem)] lg:min-h-0 lg:overflow-visible lg:pt-0">
      <div className="min-h-0 overflow-x-auto overflow-y-visible pb-2 lg:overflow-visible">
        <div
          className="relative grid min-h-full gap-y-1 overflow-visible lg:h-full"
          style={{
            gridTemplateColumns,
            gridTemplateRows,
          }}
        >
          {yearGroups.map(({ year, startColumn, columnSpan }) => (
            <div
              key={`year-${year}`}
              className="min-w-0 px-3 py-2 text-center"
              style={{ gridColumn: `${startColumn} / span ${columnSpan}`, gridRow: "1" }}
            >
              <h2 className="text-xl font-bold tracking-[-0.02em]">Jaar {year}</h2>
            </div>
          ))}

          {labels.map(({ key, semester }, index) => {
            const columnStart = index * GRID_COLUMNS_PER_SEMESTER + 1;

            return (
              <div
                key={key}
                className="min-w-0 py-1 text-center"
                style={{
                  gridColumn: `${columnStart} / span ${GRID_COLUMNS_PER_SEMESTER}`,
                  gridRow: "2",
                }}
              >
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Semester {semester}</h3>
              </div>
            );
          })}

          {semesterDividers.map(({ key, gridColumn, isYearBoundary }) => (
            <div
              key={`divider-${key}`}
              aria-hidden="true"
              className="pointer-events-none self-stretch justify-self-end"
              style={{
                gridColumn,
                gridRow: "2 / -1",
                width: isYearBoundary ? "1px" : "2px",
                background: isYearBoundary
                  ? "rgba(197,205,216,0.95)"
                  : "repeating-linear-gradient(to bottom, rgba(221,227,236,0.95) 0 7px, rgba(221,227,236,0) 7px 12px)",
              }}
            />
          ))}

          {labels.flatMap(({ key }, index) => {
            const columnStart = index * GRID_COLUMNS_PER_SEMESTER + 1;

            return (layout.placement[key] ?? []).map((entry, entryIndex) => (
              <CourseCard
                key={`${key}-${entry.course.course_name}-${entryIndex}`}
                entry={entry}
                columnStart={columnStart}
                columnSpan={GRID_COLUMNS_PER_SEMESTER}
                rowOffset={HEADER_ROW_COUNT}
              />
            ));
          })}
        </div>
      </div>
    </div>
  );
}