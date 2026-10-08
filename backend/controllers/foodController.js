import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import fs from "fs";
import path from "path";
import { getRedisClient } from "../config/redis.js";
import { uploadImageToS3, deleteImageFromS3, isS3Configured } from "../config/s3.js";

// add food items
const addFood = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      let image_filename = `${Date.now()}${req.file.originalname}`;
      
      if (isS3Configured()) {
        await uploadImageToS3(image_filename, req.file.buffer, req.file.mimetype);
      } else {
        // Fallback to local storage
        await fs.promises.writeFile(path.join("uploads", image_filename), req.file.buffer);
      }

      const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename,
      });

      await food.save();
      const redisClient = getRedisClient();
      if (redisClient) await redisClient.del("foodList");
      res.json({ success: true, message: "Food Added" });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// all foods
const listFood = async (req, res) => {
  try {
    const redisClient = getRedisClient();
    if (redisClient) {
      const cachedFoods = await redisClient.get("foodList");
      if (cachedFoods) {
        return res.json({ success: true, data: JSON.parse(cachedFoods) });
      }
    }

    const foods = await foodModel.find({});
    
    if (redisClient) {
      await redisClient.setEx("foodList", 3600, JSON.stringify(foods));
    }

    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// remove food item
const removeFood = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const food = await foodModel.findById(req.body.id);
      
      try {
        if (isS3Configured()) {
          await deleteImageFromS3(food.image);
        } else {
          // Fallback to local storage deletion
          await fs.promises.unlink(path.join("uploads", food.image));
        }
      } catch (err) {
        console.log("Failed to delete image", err);
      }
      
      await foodModel.findByIdAndDelete(req.body.id);
      const redisClient = getRedisClient();
      if (redisClient) await redisClient.del("foodList");
      res.json({ success: true, message: "Food Removed" });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { addFood, listFood, removeFood };
