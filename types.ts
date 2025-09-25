export interface CourseInput {
  id: number;
  skill: string;
  ageGroup: string;
}

export interface KnowledgeFile {
  id: number;
  file: File;
  content: string | null;
  status: 'pending' | 'loaded' | 'error' | 'unsupported';
  contentType: 'text' | 'html';
}

export interface GeneratedCourseContent {
  courseId: number;
  skill: string;
  ageGroup: string;
  content: string;
}