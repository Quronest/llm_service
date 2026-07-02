export const domain = {
  FRONTEND: "FRONTEND",
  BACKEND: "BACKEND",
  FULL_STACK: "FULL_STACK",
  DEVOPS: "DEVOPS",
  CLOUD: "CLOUD",
  DATA_SCIENCE: "DATA_SCIENCE",
  AI_ML: "AI_ML",
  MOBILE: "MOBILE",
  UI_UX: "UI_UX",
  DATABASES: "DATABASES",
  DSA: "DSA",
} as const;

export type Domain = (typeof domain)[keyof typeof domain];

export const domainEnumList = Object.values(domain) as [Domain, ...Domain[]];