const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    // Security link to the exact doctor who uploaded this
    clinicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    originalFileKey: { type: String, required: true },
    heatmapFileKey: { type: String },
    anomalyDetected: { type: Boolean },
    confidence: { type: Number },
    inferenceTimeMs: { type: Number },
    
    // New field to track pipeline progress
    status: { type: String, default: 'PROCESSING' } 
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);