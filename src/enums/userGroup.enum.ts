export const userGroup = {
  GROUP_A: "GROUP_A",
  GROUP_B: "GROUP_B",
  GROUP_C: "GROUP_C",
} as const;

export type UserGroup = (typeof userGroup)[keyof typeof userGroup];
export type Group = UserGroup;

export const userGroupEnumList = Object.values(userGroup) as [
  UserGroup,
  ...UserGroup[],
];
