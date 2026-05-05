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
    <div className="mb-8 col-span-2 grid min-h-0 grid-rows-[auto_minmax(0,1fr)]">
      <h2 className="text-2xl font-bold mb-4">Jaar {yearNumber}</h2>
      <div className="grid min-h-0 grid-cols-2 gap-4">
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