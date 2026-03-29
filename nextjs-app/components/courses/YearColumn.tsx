import { SemesterColumn } from "./SemesterColumn";
import { SEM_KEYS } from "@/lib/courses/layout";
import type { Placement } from "@/types/course";

interface Props {
  yearKey: string;
  yearNumber: number;
  placement: Placement;
}

export function YearColumn({ yearKey, yearNumber, placement }: Props) {
  return (
    <div className="mb-8 col-span-2 flex flex-col min-h-0">
      <h2 className="text-2xl font-bold mb-4">Jaar {yearNumber}</h2>
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {SEM_KEYS.map((sk) => (
          <SemesterColumn
            key={sk}
            semKey={sk}
            entries={placement[`${yearKey}-${sk}`] ?? []}
            totalRows={placement[`${yearKey}-${sk}`]?.length ?? 0}
          />
        ))}
      </div>
    </div>
  );
}