require('dotenv').config(); 
const express = require('express');
const authRoutes = require('./src/routes/auth.routes'); // 👈 Add this import
const cors = require('cors');
const http = require('http'); // Built-in Node module
const { Server } = require('socket.io'); // Socket.io server package
const mongoose = require('mongoose');
const verifyToken = require('./src/middleware/auth.middleware');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const webhookRoutes = require('./src/routes/webhook.routes');
const Scan = require('./src/models/scan.model'); // 👈 Add this line
const app = express();
app.use(cors()); 
app.use(express.json());

// 1. Create HTTP server and integrate Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allows your React frontend to connect locally
        methods: ["GET", "POST"]
    }
});

// 2. Attach the 'io' instance to Express app so we can use it inside our routes file
// 2. Attach the 'io' instance to Express app so we can use it inside our routes file
app.use((req, res, next) => {
    req.io = io;
    next();
});
// 3. Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Successfully connected to MongoDB Atlas");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};
connectDB();

// 4. AWS S3 Configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// 5. Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Real-Time Feed: ${socket.id}`);

    // When the frontend uploads a scan, it will join a "room" named after the file's unique key
    socket.on('join-scan-room', (fileKey) => {
        socket.join(fileKey);
        console.log(`📁 Client joined room for file: ${fileKey}`);
    });

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected from Real-Time Feed');
    });
});

// 6. Routes
app.use('/api/webhooks', webhookRoutes);
app.use('/api/auth', authRoutes);
// GET /api/scans - SECURED: Only fetches scans belonging to the logged-in user
app.get('/api/scans', verifyToken, async (req, res) => {
    try {
        // The req.user.id was securely attached by the middleware
        const scans = await Scan.find({ clinicianId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        return res.status(200).json(scans);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch scan history' });
    }
});

// GET /api/scans/:id - SECURED: Only allows viewing if the user owns it
app.get('/api/scans/:id', verifyToken, async (req, res) => {
    try {
        const scan = await Scan.findOne({ _id: req.params.id, clinicianId: req.user.id });
        if (!scan) return res.status(404).json({ error: 'Scan not found or access denied' });
        return res.status(200).json(scan);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch scan details' });
    }
});

// GET /api/upload-url - SECURED: Creates a "Pending" record before the upload
app.get('/api/upload-url', verifyToken, async (req, res) => {
    try {
        const { filename, contentType } = req.query;
        const key = `scans/${Date.now()}-${filename}`;

        const command = new PutObjectCommand({
            Bucket: process.env.RAW_BUCKET_NAME,
            Key: key,
            ContentType: contentType
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // IMPORTANT: Create the pending database record right now
        await Scan.create({
            clinicianId: req.user.id,
            originalFileKey: key,
            status: 'PROCESSING'
        });

        res.json({ uploadUrl, key });
    } catch (error) {
        console.error("Presigned URL Error:", error);
        res.status(500).json({ error: "Could not generate upload URL" });
    }
});

// 7. CRITICAL: Change app.listen to server.listen so sockets can run
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));