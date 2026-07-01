export const taskType = {
  READING: "READING",
  QUIZ: "QUIZ",
  CODING: "CODING",
  DESCRIPTIVE: "DESCRIPTIVE",
} as const;

export type TaskType = (typeof taskType)[keyof typeof taskType];

export const taskTypeEnumList = Object.values(taskType) as [
  TaskType,
  ...TaskType[],
];
