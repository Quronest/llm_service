import type { RunnableLike } from "@langchain/core/runnables";

export type Group = "GROUP_A" | "GROUP_B" | "GROUP_C";
export type Phase = "PHASE_1" | "PHASE_2" | "PHASE_3";

export type UserContextType = {
  current_group: Group;
  current_phase: Phase;
  current_stage: string;
  current_day: number;
  summary: string;
  engagement_level: string;
  burnout_risk: string;
  is_on_track: boolean;
  needs_intervention: boolean;
};

export type LlmWithConfig = {
  withConfig: (config: Record<string, unknown>) => RunnableLike;
};

export type TaskUserContext = UserContextType & Record<string, unknown>;

export type GenerateTasksInput = {
  userContext: TaskUserContext;
};

export type UserSummaryInput = {
  academic_data?: {
    institute_name?: string;
    grade?: string;
    course?: string;
    description?: string;
    interested_domains?: string[];
  };
  personal_data?: {
    skills?: string[];
    primary_goal?: string;
    experience?: string;
  };
};
