import { LearningOutcome } from "@/types/course";

interface Props {
  outcomes: LearningOutcome[];
  isEditing: boolean;
  onChange: (index: number, field: string, value: string) => void;
  onAdd: () => void;
}

export function LearningOutcomesSection({ outcomes, isEditing, onChange, onAdd }: Props) {
  return (
    <div className="bg-white p-6 rounded shadow mb-8">
      <h2 className="text-2xl font-bold mb-4">Leerdoelen</h2>
      {isEditing && (
        <button
          onClick={onAdd}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Leerdoel toevoegen
        </button>
      )}
      <div className="space-y-3">
        {outcomes.map((outcome, idx) => (
          <div key={idx} className="border-l-4 border-blue-600 pl-4 p-2 bg-gray-50 rounded">
            {isEditing ? (
              <>
                <input
                  type="text"
                  placeholder="Code"
                  value={outcome.code || ""}
                  onChange={(e) => onChange(idx, "code", e.target.value)}
                  className="w-full p-2 mb-2 border rounded"
                />
                <textarea
                  placeholder="Beschrijving"
                  value={outcome.description || ""}
                  onChange={(e) => onChange(idx, "description", e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </>
            ) : (
              <>
                <p className="font-semibold text-sm">{outcome.code}</p>
                <p>{outcome.description}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}