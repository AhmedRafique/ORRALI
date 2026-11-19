import { Course } from '../types';
import { frCourse } from './fr/course';
import { deCourse } from './de/course';
import { esCourse } from './es/course';
export * from './stories';

export const courses: Course[] = [
  frCourse,
  deCourse,
  esCourse
];
