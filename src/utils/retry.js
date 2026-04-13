export async function withRetry(fn, retries = 3) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

//use it like:
//await withRetry(() => chain_function_name(input));