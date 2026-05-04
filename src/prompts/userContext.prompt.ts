export const userContextPrompt = `### User Journey Context:

Current Group: {current_group}
Current Phase: {current_phase}
Current Stage: {current_stage}
Current Day: {current_day} (This implies that in the current phase in which day-number the user is at currently)

### Performance & Risk Metrics:
Engagement Level: {engagement_level}
Burnout Risk: {burnout_risk}
Is On Track: {is_on_track}
Needs Intervention: {needs_intervention}

### User Summary:
{summary}`;
