export enum Level {
  BASIC = "Cơ bản",
  INTERMEDIATE = "Trung bình",
  ADVANCED = "Nâng cao",
}

export interface Exercise {
  id: string;
  topic: string;
  grade: string;
  skill: string;
  level: Level;
  question: string;
  answer: string;
  hint: string;
}

export enum ViewMode {
  TEACHER = "teacher",
  STUDENT = "student",
}

// New types for user authentication
export interface User {
  name: string;
  className: string;
}

export interface Teacher extends User {
  role: ViewMode.TEACHER;
}

export interface Student extends User {
  role: ViewMode.STUDENT;
  teacherName: string;
  previousWeekCorrect: number;
  currentWeekCorrect: number;
  knowledgeSeeds: number;
}

export type AppUser = Teacher | Student;