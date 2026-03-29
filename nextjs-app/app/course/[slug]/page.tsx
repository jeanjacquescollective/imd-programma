"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Course, LearningOutcome, Evaluation, RawCourse } from "@/types/course";
import { MetaGrid } from "@/components/course/MetaGrid";
import { ContentSection } from "@/components/course/ContentSection";
import { LearningOutcomesSection } from "@/components/course/LearningOutcomesSection";
import { EvaluationSection } from "@/components/course/EvaluationSection";
import { ActionBar } from "@/components/course/ActionBar";
import { getTrajectCoursesFromStorage, type TrajectCoursesMap } from "@/lib/courses/storage";

const EMPTY_COURSE: Course = {
  course_name: "",
  learning_outcomes: [],
  evaluation: [],
  study_load: 0,
  study_programs: [],
  content: "",
  color: "",
  academic_year: 0,
  study_program: "",
  total_study_time: "",
  trajectschijf: "",
  semester: 0,
  language: "",
  grading_scale: "",
  teachers: "",
  evaluation_text: "",
  category: "",
  family: ""
};

function toEditableCourse(raw: RawCourse): Course {
  return {
    ...EMPTY_COURSE,
    course_name: raw.course_name || "",
    study_load: Number.parseInt(String(raw.study_load ?? 0), 10) || 0,
    study_programs: Array.isArray(raw.study_programs) ? raw.study_programs : [],
    content: raw.content || "",
    learning_outcomes: Array.isArray(raw.learning_outcomes) ? raw.learning_outcomes : [],
    evaluation: Array.isArray(raw.evaluation) ? raw.evaluation : [],
    academic_year: raw.academic_year,
    study_program: raw.study_program || "",
    total_study_time: raw.total_study_time || "",
    trajectschijf: raw.trajectschijf || "",
    language: raw.language || "",
    grading_scale: raw.grading_scale || "",
    teachers: raw.teachers || "",
    evaluation_text: raw.evaluation_text || "",
  };
}

function mergeEditedIntoRaw(raw: RawCourse, edited: Course): RawCourse {
  return {
    ...raw,
    course_name: edited.course_name,
    study_load: edited.study_load,
    study_programs: edited.study_programs,
    content: edited.content,
    learning_outcomes: edited.learning_outcomes,
    evaluation: edited.evaluation,
    academic_year: edited.academic_year,
    study_program: edited.study_program,
    total_study_time: edited.total_study_time,
    trajectschijf: edited.trajectschijf,
    language: edited.language,
    grading_scale: edited.grading_scale,
    teachers: edited.teachers,
    evaluation_text: edited.evaluation_text,
  };
}

export default function CourseDetail() {
  const { slug } = useParams();
  const decoded = decodeURIComponent(Array.isArray(slug) ? slug[0] : slug);
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [editedCourse, setEditedCourse] = useState<Course>(EMPTY_COURSE);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const trajectMap = getTrajectCoursesFromStorage();
    const all = Object.values(trajectMap).flat();
    const found = all.find((c) => c.course_name === decoded);

    if (found) {
      const editable = toEditableCourse(found);
      setCourse(editable);
      setEditedCourse(editable);
    }
  }, [decoded]);

  if (!course) return <div className="p-20 text-center">Loading...</div>;

  const handleInputChange = (field: string, value: string) =>
    setEditedCourse((prev) => ({ ...prev, [field]: value }));

  const handleLearningOutcomeChange = (index: number, field: string, value: string) => {
    const updated = [...editedCourse.learning_outcomes] as LearningOutcome[];
    (updated[index] as any)[field] = value;
    setEditedCourse((prev) => ({ ...prev, learning_outcomes: updated }));
  };

  const handleEvaluationChange = (index: number, field: string, value: string) => {
    const updated = [...editedCourse.evaluation] as Evaluation[];
    (updated[index] as any)[field] = value;
    setEditedCourse((prev) => ({ ...prev, evaluation: updated }));
  };

  const addLearningOutcome = () =>
    setEditedCourse((prev) => ({
      ...prev,
      learning_outcomes: [...prev.learning_outcomes, { code: "", description: "" }],
    }));

  const addEvaluation = () =>
    setEditedCourse((prev) => ({
      ...prev,
      evaluation: [...prev.evaluation, { exam_chance: "", moment: "", form: "", percentage: "" }],
    }));

  const save = () => {
    const trajectMap = getTrajectCoursesFromStorage();
    const updatedMap: TrajectCoursesMap = Object.fromEntries(
      Object.entries(trajectMap).map(([traject, courses]) => [
        traject,
        courses.map((raw) =>
          raw.course_name === course.course_name ? mergeEditedIntoRaw(raw, editedCourse) : raw
        ),
      ])
    );

    localStorage.setItem("ECTS", JSON.stringify(updatedMap));
    setCourse(editedCourse);
    setIsEditing(false);
    alert("Opgeslagen!");
  };

  const toggleEdit = () => {
    if (isEditing) setEditedCourse(course); // reset on cancel
    setIsEditing((prev) => !prev);
  };

  return (
    <div className="max-w-4xl mx-auto pt-16 pb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">{editedCourse.course_name}</h1>
        <ActionBar
          isEditing={isEditing}
          onToggleEdit={toggleEdit}
          onSave={save}
          onBack={() => router.push("/courses")}
        />
      </div>

      <MetaGrid
        course={editedCourse}
        isEditing={isEditing}
        onChange={handleInputChange}
      />

      <ContentSection
        course={editedCourse}
        isEditing={isEditing}
        onChange={handleInputChange}
      />

      <LearningOutcomesSection
        outcomes={Array.isArray(editedCourse.learning_outcomes) ? editedCourse.learning_outcomes : []}
        isEditing={isEditing}
        onChange={handleLearningOutcomeChange}
        onAdd={addLearningOutcome}
      />

      <EvaluationSection
        evaluations={Array.isArray(editedCourse.evaluation) ? editedCourse.evaluation : []}
        evaluationText={editedCourse.evaluation_text}
        isEditing={isEditing}
        onChange={handleEvaluationChange}
        onAdd={addEvaluation}
      />
    </div>
  );
}
