import { loadSecrets } from "./config/secrets.js";

const startServer = async () => {
  await loadSecrets();
  const { default: app } = await import("./app.js");
  const { connectDB } = await import("./config/db.js");
  const { connectRedis } = await import("./config/redis.js");
  const { ensureDefaultAdmin } = await import("./config/adminSeed.js");

  await connectDB();
  await connectRedis();
  await ensureDefaultAdmin();
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server Started on port: ${port}`);
  });
};

startServer().catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
});
