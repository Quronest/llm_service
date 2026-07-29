import logger from "../utils/logger";

export async function executeOnJudge0(
  sourceCode: string,
  stdin: string,
): Promise<string> {
  const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.JUDGE0_AUTH_TOKEN) {
    headers["X-Auth-Token"] = process.env.JUDGE0_AUTH_TOKEN;
  }

  try {
    const response = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: 71, // Python 3
          stdin: stdin,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status?.id !== 3 && data.status?.id !== 4) {
      logger.warn(
        `Judge0 Error (${data.status?.description}): ${
          data.compile_output || data.stderr || "Unknown error"
        }`,
      );
    }

    return (data.stdout || "").trim();
  } catch (error) {
    logger.error(`Judge0 execution failed: ${error}`);
    return "JUDGE_ERROR";
  }
}
