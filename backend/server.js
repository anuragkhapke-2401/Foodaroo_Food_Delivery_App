import { loadSecrets } from "./config/secrets.js";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { ensureDefaultAdmin } from "./config/adminSeed.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

// app config
const app = express();

//middlewares
app.use(express.json());
app.use(cors());

// api endpoints
app.use("/api/food", foodRouter);
app.get("/images/:filename", async (req, res, next) => {
  try {
    const { generatePresignedUrl, isS3Configured } = await import("./config/s3.js");
    if (!isS3Configured()) {
      return next();
    }
    const url = await generatePresignedUrl(req.params.filename);
    res.redirect(url);
  } catch (error) {
    res.status(404).send("Image not found");
  }
});
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

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
