import { Course } from "@/types/course";

interface Props {
  course: Course;
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

export function ContentSection({ course, isEditing, onChange }: Props) {
  return (
    <>
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">Docenten</h2>
        {isEditing ? (
          <input
            type="text"
            value={course.teachers || ""}
            onChange={(e) => onChange("teachers", e.target.value)}
            className="w-full p-2 border rounded"
          />
        ) : (
          <p>{course.teachers}</p>
        )}
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">Inhoud</h2>
        {isEditing ? (
          <textarea
            value={course.content || ""}
            onChange={(e) => onChange("content", e.target.value)}
            className="w-full p-2 border rounded"
            rows={6}
          />
        ) : (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: course.content }}
          />
        )}
      </div>
    </>
  );
}