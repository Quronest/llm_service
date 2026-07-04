export const taskTag = {
  FOUNDATION: "FOUNDATION",
  READING: "READING",
  PRACTICE: "PRACTICE",
  PROJECT: "PROJECT",
  RECAP: "RECAP",
  QUIZ: "QUIZ",
  DEBUGGING: "DEBUGGING",
  RESEARCH: "RESEARCH",
  REVISION: "REVISION",
  ASSESSMENT: "ASSESSMENT",
} as const;

export type TaskTag = (typeof taskTag)[keyof typeof taskTag];

export const taskTagEnumList = Object.values(taskTag) as [TaskTag, ...TaskTag[]];