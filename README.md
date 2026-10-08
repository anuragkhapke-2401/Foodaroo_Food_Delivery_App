# Food Delivery Platform

A full-stack food delivery platform built with the MERN stack (MongoDB, Express, React, Node.js), Redis caching, AWS S3 image storage, AWS Secrets Manager, and Stripe payment integration.

## Project Structure
The project is divided into three main components:
- `/backend`: Node.js + Express backend server.
- `/frontend`: React application for end-users to browse food and place orders.
- `/admin`: React application for administrators to add/remove food items.

## Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)
- [Redis](https://redis.io/) (Local or Cloud instance)

## Getting Started

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory using the template below:

#### Environment Variables (`.env`)
```env
# Server Configuration
PORT=4000
FRONTEND_URL=http://localhost:5173

# Database (MongoDB)
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/food-delivery

# Caching (Redis)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Authentication
JWT_SECRET=your_jwt_secret_key

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_key

# Emails (Sendgrid)
SENDGRID_API_KEY=SG.your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# ----------------------------------------
# AWS S3 Integration (Images)
# ----------------------------------------
# Set to 'true' to upload images to AWS S3. 
# If 'false' or omitted, images fallback to local disk storage in `backend/uploads/`.
USE_S3=true
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your_s3_bucket_name

# ----------------------------------------
# AWS Credentials & Secrets Manager
# ----------------------------------------
# Only required if you are NOT using an IAM role (e.g., local development).
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Name of the secret in AWS Secrets Manager (Optional)
# If provided and AWS credentials exist, the app will inject these remote secrets 
# into process.env, overriding local .env values.
AWS_SECRET_NAME=FoodDeliveryAppSecrets
```

Start the backend server:
```bash
npm run server
# or
node server.js
```

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```

### 3. Admin Panel Setup

Open another terminal and navigate to the admin directory:
```bash
cd admin
npm install
npm run dev
```

---

## Integrations Guide

### AWS S3 Image Uploads
By default, the backend can store images locally in the `backend/uploads/` directory. To seamlessly switch to AWS S3:
1. Create an S3 Bucket in AWS.
2. Set `USE_S3=true` and provide `AWS_BUCKET_NAME` in your `.env`.
3. Ensure your AWS credentials have `s3:PutObject`, `s3:DeleteObject`, and `s3:GetObject` permissions.
4. The application will now upload images to S3 and serve them dynamically using secure, 1-hour expiring **Pre-signed URLs** to the frontend seamlessly.

### AWS Secrets Manager
To keep your production environment secure, you can store your sensitive keys (MongoDB URI, JWT secret, Stripe key, Sendgrid) in AWS Secrets Manager:
1. Create a secret in AWS Secrets Manager and format it as Key/Value pairs (e.g. `MONGO_URL`, `JWT_SECRET`).
2. Provide the secret's name in `AWS_SECRET_NAME` inside your `.env` (defaults to `FoodDeliveryAppSecrets`).
3. Ensure your AWS credentials have `secretsmanager:GetSecretValue` permissions.
4. When the backend starts, it will automatically fetch these secrets and merge them into `process.env`. Note: `.env` is loaded first, and remote secrets override local ones.

### Redis Caching
The application uses Redis to cache frequently accessed data (like the food menu) to reduce MongoDB queries:
1. Set `REDIS_URL` and `REDIS_PASSWORD` in your `.env`. 
2. Ensure your Redis instance is running locally or via a provider like Upstash/Redis Enterprise.
3. The backend caches the food list for 1 hour. Whenever an admin adds or removes an item, the cache is automatically invalidated.
