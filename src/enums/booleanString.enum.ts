export const booleanString = {
  TRUE: "True",
  FALSE: "False",
} as const;

export type BooleanString = (typeof booleanString)[keyof typeof booleanString];

export const booleanStringEnumList = Object.values(booleanString) as [
  BooleanString,
  ...BooleanString[],
];
