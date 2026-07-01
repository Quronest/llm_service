export const burnoutRisk = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  UNSET: "UNSET",
} as const;

export type BurnoutRisk = (typeof burnoutRisk)[keyof typeof burnoutRisk];

export const burnoutRiskEnumList = Object.values(burnoutRisk) as [
  BurnoutRisk,
  ...BurnoutRisk[],
];
