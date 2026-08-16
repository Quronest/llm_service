export const taskStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  PARTIAL: "PARTIAL",
  SKIPPED: "SKIPPED",
} as const;

export type TaskStatus = (typeof taskStatus)[keyof typeof taskStatus];

export const taskStatusEnumList = Object.values(taskStatus) as [
  TaskStatus,
  ...TaskStatus[],
];
