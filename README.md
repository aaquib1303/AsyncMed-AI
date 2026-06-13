# AsyncMed.ai 🩺☁️

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

**AsyncMed.ai** is a cloud-native, asynchronous diagnostic pipeline designed to classify ovarian ultrasound scans. It utilizes an event-driven architecture to decouple heavy PyTorch machine learning inference from the main web server, ensuring high scalability and zero UI blocking.

Instead of simple binary classifications, the platform utilizes **Explainable AI (Grad-CAM)** to generate heatmaps, showing clinicians exactly which tissue regions the model focused on to make its decision.

### 🎥 [Watch the 2-Minute Demo Video Here] *(<- Link your video here!)*

---

## 🚀 Key Features

- **Asynchronous ML Inference:** Heavy image processing is offloaded to serverless AWS Fargate containers, keeping the Node.js backend completely unblocked.
- **Explainable AI (XAI):** Implements Grad-CAM to visualize the CNN's decision-making process, fostering clinical trust.
- **Real-Time WebSocket Updates:** The React UI instantly snaps to the results screen using Socket.io the moment the cloud worker completes inference.
- **Secure Multi-Tenant Architecture:** JWT-based authentication ensures that clinicians can only access diagnostic records tied to their specific IDs, laying the structural groundwork for HIPAA compliance.
- **Presigned URL Uploads:** The Node backend never touches the heavy image files. Clients upload directly to S3 using securely generated, short-lived presigned URLs.

---

## 🧠 System Architecture

1. **Upload:** A clinician uploads an ultrasound scan via the React UI. The frontend requests a presigned URL from the Express backend and uploads the file directly to an AWS S3 `raw` bucket.
2. **Trigger:** The upload event triggers a task in an AWS ECS Fargate cluster.
3. **Inference:** An isolated Docker container (pulled from Amazon ECR) wakes up, downloads the image, and runs inference using a custom fine-tuned **EfficientNet-B0** PyTorch model.
4. **Grad-CAM:** The Python worker calculates the gradients of the final convolutional layer to generate a heatmap overlay.
5. **Callback:** The worker uploads the heatmap to an S3 `processed` bucket and hits an Express Webhook.
6. **Real-Time Update:** The Express server updates the MongoDB record and emits a Socket.io event, instantly updating the clinician's dashboard.

---

## ☁️ AWS Infrastructure

This project was deployed using a robust, decoupled AWS cloud environment. Below is the active infrastructure handling the pipeline:

### 1. Elastic Container Service (ECS / Fargate)

The serverless computing engine that spins up isolated workers to handle the PyTorch inference tasks.

![ECS Cluster](Screenshot%202026-06-12%20224623.png)

### 2. Elastic Container Registry (ECR)

The secure, private repository hosting the containerized Python ML worker environment.

![ECR Registry](Screenshot%202026-06-12%20224815.png)

### 3. Amazon S3 (Simple Storage Service)

The segregated cloud storage environment handling raw inputs and processed outputs.

- **S3 Buckets Overview:**
  ![S3 Overview](Screenshot%202026-06-12%20224654.png)

- **Raw Uploads Bucket (`med-scans-raw-aqb`):** Where presigned URLs securely deposit clinician uploads.
  ![S3 Raw](Screenshot%202026-06-12%20224709.png)

- **Processed Reports Bucket (`med-scans-processed-aqb`):** Where the Fargate worker deposits the generated Grad-CAM heatmaps.
  ![S3 Processed](Screenshot%202026-06-12%20224738.png)

---

## 💻 Tech Stack

### Frontend

- React 18 (Vite)
- TailwindCSS
- Axios (with Global Security Interceptors)
- Socket.io-client

### Backend

- Node.js / Express
- MongoDB / Mongoose
- JWT Authentication
- AWS SDK (S3 Presigned URLs)
- Socket.io

### Machine Learning & Cloud Worker

- Python 3
- PyTorch (EfficientNet-B0)
- OpenCV / PIL
- Docker
- AWS (ECS, Fargate, ECR, S3)

---

## ⚙️ Local Setup & Development

If you wish to run this pipeline locally, you will need to configure your own AWS credentials and MongoDB instance.

### 1. Clone the repository

```bash
git clone https://github.com/samehnadeem7/AsyncMed-AI.git
cd AsyncMed-AI
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with the following keys:

```env
PORT=8000
AWS_REGION=ap-south-1
RAW_BUCKET_NAME=med-scans-raw-aqb
PROCESSED_BUCKET_NAME=med-scans-processed-aqb
MONGO_URI=mongodb+srv://aaquibuddinmd_db_user:bpIn3k4B4g5nA4uY@med-cluster.g0lxuh9.mongodb.net/?appName=med-cluster
JWT_SECRET=aisa_nakko_karo_yaro_2026
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```
