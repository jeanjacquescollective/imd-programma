import { CourseCard } from "./CourseCard";
import type { PlacedCourse } from "@/types/course";

interface Props {
  semKey: string;
  entries: PlacedCourse[];
  totalRows: number;
}

export function SemesterColumn({ semKey, entries, totalRows }: Props) {

  
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] p-0">
      <h3 className="text-xl font-semibold mb-2">{semKey}</h3>
      <div
      className="min-h-0"
      style={{
        display: "grid",
        gridTemplateRows: `repeat(${totalRows}, 1fr)`,
        gap: "4px",
        gridAutoRows: "1fr",
      }}
      >
      {entries.map((entry, idx) => (
        <CourseCard key={idx} entry={entry} />
      ))}
      </div>
    </div>
  );
}