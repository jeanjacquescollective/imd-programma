export interface LearningOutcome {
  code: string;
  description: string;
  level?: string;
  category?: string;
}

export interface Evaluation {
  exam_chance: string;
  moment: string;
  form: string;
  percentage: string;
}

export interface RawCourse {
  course_name: string;
  study_load: string | number;
  study_programs?: string[] | string;
  content: string;
  traject: string;
  semester: string;
  learning_outcomes?: LearningOutcome[] | string;
  evaluation?: Evaluation[] | string;
  academic_year?: number | string;
  study_program?: string;
  total_study_time?: string;
  trajectschijf?: string;
  language?: string;
  grading_scale?: string;
  teachers?: string;
  evaluation_text?: string;
}

export interface Course {
  course_name: string;
  study_load: number;
  study_programs: string[];
  content: string;
  color: string;
  category: string;
  family: string;
  learning_outcomes: LearningOutcome[];
  evaluation: Evaluation[];
  academic_year?: number | string;
  study_program?: string;
  total_study_time?: string;
  trajectschijf?: string;
  language?: string;
  grading_scale?: string;
  teachers?: string;
  evaluation_text?: string;
  year?: number;
  semester?: number;
}

export interface PlacedCourse {
  course: Course;
  rowStart: number;
  rowSpan: number;
}

export type StructuredCourses = Course[];

export type Placement = Record<string, PlacedCourse[]>;

export interface LayoutResult {
  placement: Placement;
  totalRows: number;
}