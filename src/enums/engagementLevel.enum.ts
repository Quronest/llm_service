export const engagementLevel = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
} as const;

export type EngagementLevel =
  (typeof engagementLevel)[keyof typeof engagementLevel];

export const engagementLevelEnumList = Object.values(engagementLevel) as [
  EngagementLevel,
  ...EngagementLevel[],
];
