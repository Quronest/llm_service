export const engagementLevel = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  UNSET: "UNSET",
} as const;

export type EngagementLevel =
  (typeof engagementLevel)[keyof typeof engagementLevel];

export const engagementLevelEnumList = Object.values(engagementLevel) as [
  EngagementLevel,
  ...EngagementLevel[],
];
