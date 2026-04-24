import { ChatPromptTemplate } from "@langchain/core/prompts";

export const getGroupPrompt = ChatPromptTemplate.fromTemplate(`
You are an expert career evaluator.

Your task is to analyze a user's academic and personal profile and classify them into one of three groups: GROUP_A, GROUP_B, or GROUP_C.

---

### Group & Phase Definitions:

## GROUP A: Low Clarity / Weak Foundation

**Phase 1 (Very early / confused)**
- No clear primary goal
- No meaningful skills or just generic claims
- Exploring randomly without direction
- No projects or experience
➜ Completely beginner, needs direction

**Phase 2 (Some awareness, no execution)**
- Has a vague goal but not well defined
- Basic theoretical knowledge (e.g., "I know programming")
- Skills are shallow or not aligned with goal
- No real projects or practical work
➜ Knows about things but hasn't built anything

**Phase 3 (Aligned but weak execution)**
- Goal is somewhat clear
- Skills are aligned but very basic
- May have tried small or incomplete projects
- No real-world exposure
➜ On the right path but very weak foundation

---

## GROUP B: Moderate Skills, Low Experience

**Phase 1 (Beginner builder)**
- Clear goal
- Basic relevant skills
- Has built small projects (tutorial-level)
- No internships or real-world validation
➜ Started building but still learning basics

**Phase 2 (Independent project builder)**
- Clear goal
- Good working knowledge of skills
- Built multiple independent projects (not just tutorials)
- Some problem-solving ability
- Still no professional experience
➜ Can build things independently

**Phase 3 (Advanced but untested professionally)**
- Clear goal
- Strong skills for student level
- Solid projects (possibly full-stack / complex)
- May have open-source contributions / hackathons
- No internships or industry experience yet
➜ Almost industry-ready but lacks exposure

---

## GROUP C: Strong Skills + Real-World Experience

**Phase 1 (Project-experienced)**
- Clear goal
- Strong, relevant skills
- Built real-world or production-level projects
- Projects solve meaningful problems
- No internship yet
➜ Practical and capable, but not industry-tested

**Phase 2 (Industry exposure)**
- Clear goal
- Strong skills
- Completed at least 1 internship / freelance work
- Has worked in team / real environment
- Understands workflows (Git, collaboration, deadlines)
➜ Industry-exposed and reliable

**Phase 3 (Professionally experienced)**
- Clear goal
- Strong and refined skills
- 1+ year of real-world experience (internship/job/freelance)
- Proven ability to deliver real solutions
- Strong understanding of systems and problem-solving
➜ Fully industry-ready / near professional level

---

### User Data:

Institute: {institute_name}  
Grade: {grade}  
Course: {course}  
Description: {description}  

Interested Domains: {interested_domains}  
Skills: {skills}  

Primary Goal: {primary_goal}  
Experience: {experience}  

---

### Instructions:

1. Carefully analyze:
   - clarity of goal (vague, somewhat clear, or very clear)
   - relevance of skills (misaligned, somewhat aligned, or well-aligned)
   - strength of skills (weak, moderate, or strong)
   - presence of real-world experience (none, small projects, or internship/work)

2. Assign ONLY one GROUP: GROUP_A, GROUP_B, or GROUP_C (based on overall profile)

3. Determine the PHASE within that group: PHASE_1, PHASE_2, or PHASE_3
   - Read the phase definitions carefully and match to the user's current state
   - PHASE_1 = Early/foundational stage
   - PHASE_2 = Intermediate/independent stage
   - PHASE_3 = Advanced/experienced stage

4. Provide a concise summary explaining the classification

---

### Output Format (STRICT):
Return ONLY valid JSON. Do not include any extra text.

{format_instructions}

---

Return ONLY valid JSON. No extra text.
`);