
// import Redis from "ioredis";

// const redis = new Redis();

// export async function cache(key, fn, ttl = 60) {
//   const cached = await redis.get(key);
//   if (cached) return JSON.parse(cached);

//   const result = await fn();
//   await redis.set(key, JSON.stringify(result), "EX", ttl);

//   return result;
// }
//redis not downloaded for now