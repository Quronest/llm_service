export const taskType = {
  READING: "READING",
  QUIZ: "QUIZ",
  CODING: "CODING",
} as const;

export type TaskType = (typeof taskType)[keyof typeof taskType];

export const taskTypeEnumList = Object.values(taskType) as [
  TaskType,
  ...TaskType[],
];
