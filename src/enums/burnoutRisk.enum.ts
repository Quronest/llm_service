export const burnoutRisk = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
} as const;

export type BurnoutRisk = (typeof burnoutRisk)[keyof typeof burnoutRisk];

export const burnoutRiskEnumList = Object.values(burnoutRisk) as [
  BurnoutRisk,
  ...BurnoutRisk[],
];
