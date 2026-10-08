import { createClient } from "redis";

let redisClient;

export const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const redisPassword = process.env.REDIS_PASSWORD || "Anurag1234";

  redisClient = createClient({
    url: redisUrl,
    password: redisPassword,
  });

  redisClient.on("error", (error) => console.error(`Redis Error: ${error}`));

  try {
    await redisClient.connect();
    console.log("Redis Connected");
  } catch (err) {
    console.error("Failed to connect to Redis", err);
  }
};

export const getRedisClient = () => redisClient;
