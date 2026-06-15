export const taskType = {
  READING: "Reading",
  QUIZ: "Quiz",
  CODING: "Coding",
  DESCRIPTIVE: "Descriptive",
} as const;

export type TaskType = (typeof taskType)[keyof typeof taskType];

export const taskTypeEnumList = Object.values(taskType) as [
  TaskType,
  ...TaskType[],
];
