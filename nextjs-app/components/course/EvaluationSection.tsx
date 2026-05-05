import { Evaluation } from "@/types/course";

interface Props {
  evaluations: Evaluation[];
  evaluationText?: string;
  isEditing: boolean;
  onChange: (index: number, field: string, value: string) => void;
  onAdd: () => void;
}

const columns = [
  { key: "exam_chance", label: "Examenkans" },
  { key: "moment",      label: "Moment" },
  { key: "form",        label: "Vorm" },
  { key: "percentage",  label: "Percentage" },
];

export function EvaluationSection({ evaluations, evaluationText, isEditing, onChange, onAdd }: Props) {
  return (
    <div className="bg-white p-6 rounded shadow mb-8">
      <h2 className="text-2xl font-bold mb-4">Evaluatie</h2>
      {isEditing && (
        <button
          onClick={onAdd}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Evaluatie toevoegen
        </button>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="p-2 text-left">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {evaluations.map((evaluation, idx) => (
              <tr key={idx} className="border-b">
                {columns.map((col) => (
                  <td key={col.key} className="p-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={(evaluation as any)[col.key] || ""}
                        onChange={(e) => onChange(idx, col.key, e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      (evaluation as any)[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {evaluationText && (
        <p className="mt-4 text-sm italic">{evaluationText}</p>
      )}
    </div>
  );
}