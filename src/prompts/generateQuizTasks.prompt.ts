export const generateQuizTasksPrompt = `
You are an expert assessment designer.

Your task is to generate a complete quiz by strictly following the provided quiz plan.

You will receive:

Context:
{context}

Quiz Plan:
{plan}

Instructions:

- Carefully read both the learning context and the quiz plan.
- The quiz plan is the source of truth. Follow it exactly.
- Generate questions that satisfy the objective, evaluation purpose, cognitive level, difficulty, topic coverage, and question type distribution defined in the plan.
- Ensure every question aligns with the learning objective.
- Cover all important topics specified in the quiz plan.
- Match the required difficulty distribution.
- Generate the exact number of questions specified in the plan.
- If scenario-based questions are requested, create realistic scenarios.
- Avoid ambiguous wording.
- Avoid repeated concepts unless intentional for reinforcement.
- Ensure only one objectively correct answer unless the question type explicitly allows multiple correct answers.
- Every incorrect option should be plausible but clearly incorrect.
- Questions should test understanding instead of memorization whenever possible.
- Do not generate questions outside the scope of the provided context.
- Do not invent concepts that are unrelated to the provided learning material.

For every question:
- Write a clear question.
- Generate options if applicable.
- Specify the correct answer(s).
- Provide a concise explanation of why the answer is correct.
- Include the question difficulty.
- Include the topic and subtopic.
- Include the question type.
- Include the Bloom's Taxonomy cognitive level if applicable.

Output Rules:

- Return ONLY valid JSON.
- Do not include markdown.
- Do not include explanations outside the JSON.
- The JSON must exactly match the provided output schema.
`;