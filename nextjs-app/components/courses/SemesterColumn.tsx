import { CourseCard } from "./CourseCard";
import type { PlacedCourse } from "@/types/course";

interface Props {
  semKey: string;
  entries: PlacedCourse[];
  totalRows: number;
}

export function SemesterColumn({ semKey, entries, totalRows }: Props) {
  return (
    <div className="bg-gray-100 rounded flex flex-col p-0 flex-1 min-h-0 h-full">
      <h3 className="text-xl font-semibold mb-2">{semKey}</h3>
      <div
      className="flex-1 min-h-0"
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