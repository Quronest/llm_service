export const phase = {
  PHASE_1: "PHASE_1",
  PHASE_2: "PHASE_2",
  PHASE_3: "PHASE_3",
} as const;

export type Phase = (typeof phase)[keyof typeof phase];

export const phaseEnumList = Object.values(phase) as [Phase, ...Phase[]];
