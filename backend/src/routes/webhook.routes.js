const express = require('express');
const router = express.Router();
const Scan = require('../models/scan.model');

router.post('/inference-complete', async (req, res) => {
    try {
        // ADDED inferenceTimeMs
        const { originalFileKey, fileKey, anomalyDetected, confidence, inferenceTimeMs } = req.body;

        console.log("📣 [Webhook Received] ML Container processing complete!");
        
        if (!originalFileKey) {
            return res.status(400).json({ error: "Missing originalFileKey in payload" });
        }

        // Instead of: const newScan = new Scan({...}); await newScan.save();
        // Use this:
        const updatedScan = await Scan.findOneAndUpdate(
            { originalFileKey: originalFileKey }, // Find the pending record by the S3 key
            {
                heatmapFileKey: fileKey,
                anomalyDetected: anomalyDetected,
                confidence: confidence,
                inferenceTimeMs: inferenceTimeMs,
                status: 'COMPLETED' // Mark the AI process as finished
            },
            { new: true } // Return the updated document
        );

        // Emit socket event so frontend knows it finished
        req.io.to(originalFileKey).emit('scan-processed', updatedScan);

        console.log("✅ Database updated successfully for:", originalFileKey);

        const io = req.app.get('io');
        if (io) {
            io.to(originalFileKey).emit('scan-processed', {
                originalFileKey,
                processedFileKey: fileKey,
                heatmapFileKey: fileKey,
                status: 'processed',
                anomalyDetected,
                confidence,
                inferenceTimeMs
            });
        }

        return res.status(200).json({ success: true, message: "Database updated" });

    } catch (error) {
        console.error("❌ Error processing webhook:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;