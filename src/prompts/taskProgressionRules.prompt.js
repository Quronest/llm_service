export const taskProgressionRulesPrompt = `### Curriculum & Progression Rules

When generating the 7-day plan, you MUST strictly adapt the tasks based on the user's {current_group}, {current_phase}, and {current_day}. 
(Note: If {current_day} is 1, you are generating Days 1-7. If it is 8, you are generating Days 8-14. If it is 15, you are generating Days 15-21).

Follow these exact progression trajectories:

## GROUP A Progression (Focus: Exploration -> Fundamentals -> Execution)
- Phase 1 (Very early / confused):
  - Days 1-7: Pure Exploration. Tasks must expose the user to 3-4 different domains (e.g., web dev, data, UI/UX) through light reading and basic interactive tests to see what they like.
  - Days 8-14: Filtering. Narrow down to their top 2-3 domains. Tasks should involve very basic, high-level practice (no complex coding).
  - Days 15-21: Selection. Pick 1 primary domain based on their interests and begin establishing absolute basic terminology and theory.
- Phase 2 (Some awareness, no execution):
  - Days 1-7: Deep theory reinforcement in their chosen domain.
  - Days 8-14: "Hello World" execution. Very guided, step-by-step practice tasks setting up environments and writing first lines of code/work.
  - Days 15-21: First guided micro-project (e.g., a simple HTML page or single-function script). 
- Phase 3 (Aligned but weak execution):
  - Days 1-7: Unguided micro-project setup. The user must plan a project without hand-holding.
  - Days 8-14: Execution and debugging focus. Tasks must test their ability to find errors and read documentation.
  - Days 15-21: Polish and review. Wrap up the micro-project and prepare them to transition to Group B (understanding versions, basic GitHub).

## GROUP B Progression (Focus: Independence -> Complexity -> Industry-Prep)
- Phase 1 (Beginner builder):
  - Days 1-7: Project architecture. Tasks focus on planning a multi-feature project and writing a clean README.
  - Days 8-14: Core feature building. Tasks require independent coding with minimal guidance.
  - Days 15-21: Project deployment and edge-case testing.
- Phase 2 (Independent project builder):
  - Days 1-7: Moving away from tutorials. Tasks involve reading raw documentation and integrating external APIs or databases.
  - Days 8-14: Complex problem solving. Tasks should introduce data structures or optimizing their previous code.
  - Days 15-21: Refactoring. Tasks focus strictly on "Clean Code" principles, renaming variables, and modularizing functions.
- Phase 3 (Advanced but untested professionally):
  - Days 1-7: Open-source exposure. Tasks involve finding repositories, reading enterprise code, and understanding issues.
  - Days 8-14: Mock real-world tasks (e.g., "Implement this specific feature ticket"). Focus on Git branching and PR workflows.
  - Days 15-21: Portfolio assembly and interview prep (Leetcode/System Design basics). Prepare to transition to Group C.

## GROUP C Progression (Focus: Enterprise Architecture -> Workflows -> Leadership)
- Phase 1 (Project-experienced):
  - Days 1-7: Enterprise Architecture. Tasks focus on CI/CD pipelines, Docker basics, or cloud deployment.
  - Days 8-14: Scalability & Security. Tasks focus on identifying bottlenecks, securing APIs, and writing automated tests.
  - Days 15-21: Outreach and networking. Tasks involve writing technical blogs or applying for specific internships/freelance gigs.
- Phase 2 (Industry exposure):
  - Days 1-7: Agile/Scrum simulation. Tasks should mimic sprint planning, writing user stories, and ticket estimation.
  - Days 8-14: Code reviews. Tasks require the user to review bad code snippets and provide professional written feedback.
  - Days 15-21: Cross-functional communication practice (explaining technical concepts to non-technical stakeholders).
- Phase 3 (Professionally experienced):
  - Days 1-7: Advanced System Design (e.g., microservices, load balancing).
  - Days 8-14: Establishing thought leadership. Tasks involve mentoring concepts or contributing meaningful open-source PRs.
  - Days 15-21: Executive mock interviews, final resume polish, and readiness for mid/senior level applications.

**CRITICAL INSTRUCTION:** Read the {current_day} and {current_phase} carefully. ONLY generate tasks that match the specific 7-day window the user is currently in.`;