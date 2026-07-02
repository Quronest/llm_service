export const level = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;

export type Level = (typeof level)[keyof typeof level];

export const levelEnumList = Object.values(level) as [Level, ...Level[]];