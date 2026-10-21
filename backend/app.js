import express from "express";
import cors from "cors";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();

// middlewares
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
  } catch {
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

export default app;
