# Food Delivery Platform

A full-stack food delivery platform built with the MERN stack (MongoDB, Express, React, Node.js), Redis caching, AWS S3 image storage, AWS Secrets Manager, and Stripe payment integration.

## Project Structure
The project is divided into three main components:
- `/backend`: Node.js + Express backend server.
- `/frontend`: React application for end-users to browse food and place orders.
- `/admin`: React application for administrators to add/remove food items.

## Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (**v24.0.0 or higher is strictly required**)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)
- [Redis](https://redis.io/) (Local or Cloud instance)

## Getting Started

### 1. Installation

First, install dependencies for the root, backend, frontend, and admin all at once:
```bash
# In the root directory:
npm install

# In the subdirectories:
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd admin && npm install && cd ..
```

### 2. Environment Variables Configuration (Choose Your Setup)

You can run the project in two modes: **Local-Only (no AWS account required)** or **AWS-Integrated (with S3 & Secrets Manager)**.

---

#### Option A: Local-Only Setup (WITHOUT AWS Secrets Manager & WITHOUT AWS S3)
Use this setup if you are developing locally without an AWS account.
- **Images:** Stored locally on disk in `backend/uploads/`.
- **Secrets:** Loaded purely from your local `backend/.env` file.

Create `backend/.env`:
```env
# Server
PORT=4000
FRONTEND_URL=http://localhost:5173

# Database (MongoDB: local or Atlas)
MONGO_URL=mongodb://localhost:27017/food-delivery

# Caching (Redis)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=Anurag1234

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_key

# Email Verification (SendGrid)
SENDGRID_API_KEY=SG.your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Disable AWS S3 (Images saved locally in backend/uploads/)
USE_S3=false

# Omit or leave empty to disable AWS Secrets Manager:
# AWS_SECRET_NAME=
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
```

---

#### Option B: Cloud Setup (WITH AWS Secrets Manager & WITH AWS S3)
Use this setup for cloud deployments or staging environments integrated with AWS.
- **Images:** Uploaded to an S3 bucket and served via secure 1-hour presigned URLs.
- **Secrets:** Fetched securely on server startup from AWS Secrets Manager and merged into `process.env`.

Create `backend/.env`:
```env
# Server
PORT=4000
FRONTEND_URL=http://localhost:5173

# Enable AWS S3 Image Storage
USE_S3=true
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your_s3_bucket_name

# Enable AWS Secrets Manager (fetches MONGO_URL, JWT_SECRET, etc. remotely)
AWS_SECRET_NAME=FoodDeliveryAppSecrets

# AWS IAM Credentials (Only required if not running on EC2/ECS with an IAM Role)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# Fallbacks / overrides if remote secrets are not present
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/food-delivery
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
SENDGRID_API_KEY=SG.your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

---

#### Frontend & Admin Environment Variables
- `frontend/.env`:
  ```env
  VITE_API_URL=http://localhost:4000
  ```
- `admin/.env`:
  ```env
  VITE_API_URL=http://localhost:4000
  ```

### 3. Run the Entire Project

Instead of opening three separate terminals, you can boot up the Backend, Frontend, and Admin simultaneously from the root directory using the unified dev script:

```bash
# In the root directory:
npm run dev
```

*Note: Make sure port 4000 (Backend), 5173 (Admin), and 5174+ (Frontend) are available before running.*

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

---

## Testing Guide (Unit & Integration)

The project includes an automated test suite (**78 total tests, 100% passing**) built with Node.js's native test runner (`node:test` and `node:assert/strict`).

### 1. Run All Tests (Entire Project)
Runs all unit and integration tests across Backend, Frontend, and Admin:
```bash
npm test
```

### 2. Run by Test Layer
```bash
# Run ONLY Unit Tests (Backend + Frontend + Admin)
npm run test:unit

# Run ONLY Integration Tests (Live HTTP API flows)
npm run test:integration
```

### 3. Run by Service
```bash
# Backend (39 Unit + 13 Integration = 52 tests)
npm run test:backend

# Frontend (12 tests)
npm run test:frontend

# Admin Dashboard (14 tests)
npm run test:admin
```

### 4. Run a Specific Test File or Pattern
```bash
# Run a specific backend test
node --test backend/tests/auth.test.js
node --test backend/tests/orderController.test.js

# Run a specific integration test
node --test backend/tests/integration/authFlow.integration.test.js
node --test backend/tests/integration/orderFlow.integration.test.js

# Run tests in watch mode (auto re-run on file changes)
node --test --watch backend/tests/*.test.js
```

### Test Coverage Summary:
- **Backend Unit Tests (39)**: Auth middleware, JWT verification, OTP registration, user/admin login, cart operations, food management, and Stripe order processing.
- **Backend Integration Tests (13)**: End-to-end HTTP requests over ephemeral ports testing Health check, Auth & protected routes flow, Cart lifecycle, Food catalog & admin authorization, and Order placement & status updates.
- **Frontend Unit Tests (12)**: Cart price calculations, item count totals, free delivery logic ($0 vs $2), order payload assembly, and checkout address form validation.
- **Admin Unit Tests (14)**: Customer name formatting, order items kitchen summary, delivery address formatting, dish form validation (image, price, allowed categories), and order fulfillment status transitions.

---

## Running with Docker (MongoDB, Redis, Backend, Frontend, Admin)

You can run the entire stack in isolated Docker containers using the step-by-step commands below.

### Step 1: Create a Shared Docker Bridge Network
This allows the containers to communicate with each other using their container names as hostnames:
```bash
docker network create food-network
```

### Step 2: Start MongoDB Container
```bash
docker run -d \
  --name mongodb \
  --network food-network \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  mongo:7
```

### Step 3: Start Redis Container
```bash
docker run -d \
  --name redis \
  --network food-network \
  -p 6379:6379 \
  redis:alpine \
  redis-server --requirepass Anurag1234
```

### Step 4: Build & Run the Backend Container
Build the backend Docker image:
```bash
docker build -t food-delivery-backend ./backend
```

Then run the container choosing **Case 1** (local) or **Case 2** (with AWS):

#### Case 1: Running Locally (WITHOUT AWS S3 & Secrets Manager)
All secrets come from `backend/.env`. We mount a local volume for `uploads` so food images uploaded by admins persist on your host machine:
```bash
docker run -d \
  --name backend \
  --network food-network \
  -p 4000:4000 \
  -v $(pwd)/backend/uploads:/app/uploads \
  --env-file ./backend/.env \
  food-delivery-backend
```

#### Case 2: Running with AWS S3 & Secrets Manager ENABLED
Secrets are fetched on startup from AWS Secrets Manager, and images stream to S3 (no local volume mount needed):
```bash
docker run -d \
  --name backend \
  --network food-network \
  -p 4000:4000 \
  --env-file ./backend/.env \
  food-delivery-backend
```
*(The backend starts on port 4000, loads your `.env`, and automatically pulls remote secrets from AWS Secrets Manager on startup if configured)*

### Step 5: Build & Run the Frontend Container (Customer App)
The frontend uses a multi-stage build that compiles the Vite React bundle and serves it through non-root Nginx on port 8080 internally:
1. **Build the image**:
   ```bash
   docker build -t food-delivery-frontend ./frontend
   ```
2. **Run the container** (mapped to host port `5173`):
   ```bash
   docker run -d \
     --name frontend \
     --network food-network \
     -p 5173:8080 \
     --env-file ./frontend/.env \
     food-delivery-frontend
   ```
   *(The Customer App is now accessible at `http://localhost:5173`)*

### Step 6: Build & Run the Admin Container (Admin Dashboard)
1. **Build the image**:
   ```bash
   docker build -t food-delivery-admin ./admin
   ```
2. **Run the container** (mapped to host port `5174`):
   ```bash
   docker run -d \
     --name admin \
     --network food-network \
     -p 5174:8080 \
     --env-file ./admin/.env \
     food-delivery-admin
   ```
   *(The Admin Dashboard is now accessible at `http://localhost:5174`)*

---

### Managing the Running Containers

- **Check status of all containers**:
  ```bash
  docker ps
  ```
- **View logs**:
  ```bash
  docker logs -f backend
  docker logs -f frontend
  docker logs -f admin
  docker logs -f redis
  docker logs -f mongodb
  ```
- **Stop all containers**:
  ```bash
  docker stop frontend admin backend redis mongodb
  ```
- **Remove all containers**:
  ```bash
  docker rm frontend admin backend redis mongodb
  ```
- **Remove the network**:
  ```bash
  docker network rm food-network
  ```

