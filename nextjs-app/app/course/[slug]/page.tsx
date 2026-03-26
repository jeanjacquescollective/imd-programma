"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CourseDetail() {
  const { slug } = useParams();
  const decoded = decodeURIComponent(Array.isArray(slug) ? slug[0] : slug);
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [editedCourse, setEditedCourse] = useState({});
  const [isEditing, setIsEditing] = useState(false);

useEffect(() => {
  const storedCourses = localStorage.getItem("courses");
  const allCourses = storedCourses ? JSON.parse(storedCourses) : [];
  const found = allCourses.find(c => c.course_name === decoded);
  if (found) {
    console.log("Gevonden cursus:", JSON.parse(found.learning_outcomes.replace(/'/g, '"')));
    // Parse string data into arrays
    const parsedCourse = {
      ...found,
      learning_outcomes: typeof found.learning_outcomes === 'string' 
      ? JSON.parse(found.learning_outcomes.replace(/'/g, '"'))
      : [],
      evaluation: typeof found.evaluation === 'string' 
      ? JSON.parse(found.evaluation.replace(/'/g, '"'))
      : [],
    };
    console.log("Parsed learning outcomes:", parsedCourse.learning_outcomes);
    setCourse(parsedCourse);
    setEditedCourse(parsedCourse);
  }
}, [decoded]);


  if (!course) return <div className="p-20 text-center">Loading...</div>;

  const handleInputChange = (field, value) => {
    setEditedCourse({ ...editedCourse, [field]: value });
  };

  const handleLearningOutcomeChange = (index, field, value) => {
    const updatedOutcomes = [...editedCourse.learning_outcomes];
    updatedOutcomes[index][field] = value;
    setEditedCourse({ ...editedCourse, learning_outcomes: updatedOutcomes });
  };

  const handleEvaluationChange = (index, field, value) => {
    const updatedEvaluations = [...editedCourse.evaluation];
    updatedEvaluations[index][field] = value;
    setEditedCourse({ ...editedCourse, evaluation: updatedEvaluations });
  };

  const addLearningOutcome = () => {
    setEditedCourse({
      ...editedCourse,
      learning_outcomes: [...editedCourse.learning_outcomes, { code: "", description: "" }]
    });
  };

  const addEvaluation = () => {
    setEditedCourse({
      ...editedCourse,
      evaluation: [...editedCourse.evaluation, { exam_chance: "", moment: "", form: "", percentage: "" }]
    });
  };

  const save = () => {
    const storedCourses = localStorage.getItem("courses");
    let allCourses = storedCourses ? JSON.parse(storedCourses) : [];
    const updatedCourses = allCourses.map(c =>
      c.course_name === course.course_name ? editedCourse : c
    );
    localStorage.setItem("courses", JSON.stringify(updatedCourses));
    setCourse(editedCourse);
    setIsEditing(false);
    alert("Opgeslagen!");
  };

  const learningOutcomes = Array.isArray(editedCourse.learning_outcomes)
    ? editedCourse.learning_outcomes
    : [];

  const evaluations = Array.isArray(editedCourse.evaluation)
    ? editedCourse.evaluation
    : [];

  return (
    <div className="max-w-4xl mx-auto pt-16 pb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">{editedCourse.course_name}</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          {isEditing ? "Annuleren" : "Bewerken"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <label className="block font-semibold text-sm mb-1">Academisch jaar</label>
          {isEditing ? (
            <input
              type="text"
              value={editedCourse.academic_year || ""}
              onChange={(e) => handleInputChange("academic_year", e.target.value)}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{editedCourse.academic_year}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <label className="block font-semibold text-sm mb-1">Studieprogramma</label>
          {isEditing ? (
            <input
              type="text"
              value={editedCourse.study_program || ""}
              onChange={(e) => handleInputChange("study_program", e.target.value)}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{editedCourse.study_program}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <label className="block font-semibold text-sm mb-1">Studiepunten</label>
          {isEditing ? (
            <input
              type="text"
              value={editedCourse.study_load || ""}
              onChange={(e) => handleInputChange("study_load", e.target.value)}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{editedCourse.study_load}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <label className="block font-semibold text-sm mb-1">Totale studietijd</label>
          {isEditing ? (
            <input
              type="text"
              value={editedCourse.total_study_time || ""}
              onChange={(e) => handleInputChange("total_study_time", e.target.value)}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{editedCourse.total_study_time}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <label className="block font-semibold text-sm mb-1">Schijf</label>
          {isEditing ? (
            <input
              type="text"
              value={editedCourse.trajectschijf || ""}
              onChange={(e) => handleInputChange("trajectschijf", e.target.value)}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{editedCourse.trajectschijf}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <label className="block font-semibold text-sm mb-1">Kalender</label>
          {isEditing ? (
            <input
              type="text"
              value={editedCourse.calendar || ""}
              onChange={(e) => handleInputChange("calendar", e.target.value)}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{editedCourse.calendar}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <label className="block font-semibold text-sm mb-1">Taal</label>
          {isEditing ? (
            <input
              type="text"
              value={editedCourse.language || ""}
              onChange={(e) => handleInputChange("language", e.target.value)}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{editedCourse.language}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <label className="block font-semibold text-sm mb-1">Cijferschaal</label>
          {isEditing ? (
            <input
              type="text"
              value={editedCourse.grading_scale || ""}
              onChange={(e) => handleInputChange("grading_scale", e.target.value)}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{editedCourse.grading_scale}</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">Docenten</h2>
        {isEditing ? (
          <input
            type="text"
            value={editedCourse.teachers || ""}
            onChange={(e) => handleInputChange("teachers", e.target.value)}
            className="w-full p-2 border rounded"
          />
        ) : (
          <p>{editedCourse.teachers}</p>
        )}
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">Inhoud</h2>
        {isEditing ? (
          <textarea
            value={editedCourse.content || ""}
            onChange={(e) => handleInputChange("content", e.target.value)}
            className="w-full p-2 border rounded"
            rows="6"
          />
        ) : (
          <p className="whitespace-pre-wrap">{editedCourse.content}</p>
        )}
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">Leerdoelen</h2>
        {isEditing && (
          <button
            onClick={addLearningOutcome}
            className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Leerdoel toevoegen
          </button>
        )}
        <div className="space-y-3">
          {learningOutcomes.map((outcome, idx) => (
            <div key={idx} className="border-l-4 border-blue-600 pl-4 p-2 bg-gray-50 rounded">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    placeholder="Code"
                    value={outcome.code || ""}
                    onChange={(e) => handleLearningOutcomeChange(idx, "code", e.target.value)}
                    className="w-full p-2 mb-2 border rounded"
                  />
                  <textarea
                    placeholder="Beschrijving"
                    value={outcome.description || ""}
                    onChange={(e) => handleLearningOutcomeChange(idx, "description", e.target.value)}
                    className="w-full p-2 border rounded"
                    rows="3"
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

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">Evaluatie</h2>
        {isEditing && (
          <button
            onClick={addEvaluation}
            className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Evaluatie toevoegen
          </button>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Examenkans</th>
                <th className="p-2 text-left">Moment</th>
                <th className="p-2 text-left">Vorm</th>
                <th className="p-2 text-left">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evaluation, idx) => (
                <tr key={idx} className="border-b">
                  {isEditing ? (
                    <>
                      <td className="p-2">
                        <input
                          type="text"
                          value={evaluation.exam_chance || ""}
                          onChange={(e) => handleEvaluationChange(idx, "exam_chance", e.target.value)}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={evaluation.moment || ""}
                          onChange={(e) => handleEvaluationChange(idx, "moment", e.target.value)}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={evaluation.form || ""}
                          onChange={(e) => handleEvaluationChange(idx, "form", e.target.value)}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={evaluation.percentage || ""}
                          onChange={(e) => handleEvaluationChange(idx, "percentage", e.target.value)}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2">{evaluation.exam_chance}</td>
                      <td className="p-2">{evaluation.moment}</td>
                      <td className="p-2">{evaluation.form}</td>
                      <td className="p-2">{evaluation.percentage}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editedCourse.evaluation_text && (
          <p className="mt-4 text-sm italic">{editedCourse.evaluation_text}</p>
        )}
      </div>

      {isEditing && (
        <div className="flex gap-4">
          <button
            onClick={save}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Opslaan
          </button>
          <button
            onClick={() => router.push("/courses")}
            className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            Terug
          </button>
        </div>
      )}
      {!isEditing && (
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