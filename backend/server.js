import app from "./app.js";
import { loadSecrets } from "./config/secrets.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { ensureDefaultAdmin } from "./config/adminSeed.js";

const startServer = async () => {
  await loadSecrets();
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
