interface Props {
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onBack: () => void;
}

export function ActionBar({ isEditing, onToggleEdit, onSave, onBack }: Props) {
  return (
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={onToggleEdit}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        {isEditing ? "Annuleren" : "Bewerken"}
      </button>
      {isEditing ? (
        <div className="flex gap-4">
          <button
            onClick={onSave}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Opslaan
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            Terug
          </button>
        </div>
      ) : (
        <a
          href="/courses"
          className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-800 inline-block"
        >
          Terug
        </a>
      )}
    </div>
  );
}