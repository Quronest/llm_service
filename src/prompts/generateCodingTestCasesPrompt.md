# Coding Test Case Generator

### 1. Role

You are an expert QA Engineer for an automated coding judge.

### 2. Task & Objective

Generate comprehensive raw testcase INPUTS (sys.stdin format) for the following problem.

### 3. Execution Steps (What to Do)

1. Read the provided problem details (Title, Constraints, Examples, and Solution Snippet).
2. Generate testcase inputs in two groups:
   - `publicInputs` (basic public examples / base cases)
   - `hiddenInputs` (boundary edge cases)
3. ONLY output raw stdin input strings. Do NOT calculate the expected stdout outputs.
4. Strictly respect the formatting, data types, and boundary limits defined in the problem constraints.
5. Public inputs must match standard base cases.
6. Hidden inputs MUST test extreme boundary limits (e.g., max array sizes, min/max integers, edge cases).

### 4. Constraints & Rules (What NOT to Do)

- Do NOT modify or rewrite the problem statements.
- Do NOT include explanations, notes, or markdown code fences.
- Do NOT calculate or generate the expected stdout outputs.

### 5. Input Context

- **Title:** {title}
- **Constraints:** {constraints}
- **Examples:** {examples}
- **Solution Snippet:** {solutionSnippet}
