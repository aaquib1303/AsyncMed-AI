import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Connect to your local Express server port
const BACKEND_URL = 'http://localhost:8000'; 
const socket = io(BACKEND_URL);

export default function ClinicalDashboard() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('IDLE'); // IDLE, UPLOADING, PROCESSING, SUCCESS, ERROR
    const [scanData, setScanData] = useState(null);
    const [currentRoom, setCurrentRoom] = useState(null);

    useEffect(() => {
        // Listen for the live completion event from the backend
        socket.on('scan-processed', (data) => {
            console.log('📡 Real-time update received via WebSocket:', data);
            setScanData(data);
            setStatus('SUCCESS');
        });

        return () => {
            socket.off('scan-processed');
        };
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('IDLE');
            setScanData(null);
        }
    };

    const handleUploadAndProcess = async () => {
        if (!file) return alert('Please select a file first!');

        try {
            setStatus('UPLOADING');

            // 1. Request a Pre-signed URL from your Express API
            const urlResponse = await axios.get(`${BACKEND_URL}/api/upload-url`, {
                params: {
                    filename: file.name,
                    contentType: file.type
                }
            });

            const { uploadUrl, key } = urlResponse.data;
            console.log('🔗 Generated Presigned URL Key:', key);

            // 2. Join the Socket.io room specific to this file key
            setCurrentRoom(key);
            socket.emit('join-scan-room', key);

            // 3. Upload the file binary directly to your S3 Raw Bucket
            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type }
            });

            // 4. Shift state to processing—AWS EventBridge is taking over right now
            setStatus('PROCESSING');
            console.log('⏳ File uploaded. AWS Fargate container is running inference...');

        } catch (error) {
            console.error('❌ Pipeline breakdown:', error);
            setStatus('ERROR');
        }
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <h2>🩺 Cloud-Native Clinical Diagnostic Dashboard</h2>
            <hr />

            {/* File Selection Input */}
            <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                <input type="file" accept="image/*" onChange={handleFileChange} disabled={status === 'UPLOADING' || status === 'PROCESSING'} />
                <button 
                    onClick={handleUploadAndProcess}
                    disabled={!file || status === 'UPLOADING' || status === 'PROCESSING'}
                    style={{ marginLeft: '10px', padding: '0.5rem 1rem', cursor: 'pointer' }}
                >
                    Upload & Analyze
                </button>
            </div>

            {/* Dynamic Real-Time Status Indicators */}
            <div style={{ padding: '1rem', borderRadius: '4px', background: '#f0f2f5', marginBottom: '1.5rem' }}>
                <strong>Pipeline Status: </strong>
                <span style={{
                    fontWeight: 'bold',
                    color: status === 'SUCCESS' ? 'green' : status === 'PROCESSING' ? 'orange' : status === 'ERROR' ? 'red' : 'black'
                }}>
                    {status}
                </span>

                {status === 'PROCESSING' && (
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        🔄 Amazon EventBridge captured upload. Spinning up an autonomous Fargate container to download image and run Hugging Face Vision Transformer model...
                    </p>
                )}
            </div>

            {/* Diagnostic Output Results Panel */}
            {status === 'SUCCESS' && scanData && (
                <div style={{ border: '2px solid green', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#f6ffed' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: 'green' }}>✅ Diagnostic Analysis Complete</h3>
                    <p><strong>Original File Tracker:</strong> <code style={{ background: '#eee', padding: '2px 4px' }}>{scanData.originalFileKey}</code></p>
                    <p><strong>Processed Output Path:</strong> <code>{scanData.processedFileKey}</code></p>
                    
                    <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '4px', background: scanData.anomalyDetected ? '#fff2f0' : '#f6ffed', border: scanData.anomalyDetected ? '1px solid #ffccc7' : '1px solid #b7eb8f' }}>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>
                            <strong>Analysis Verdict:</strong> {scanData.anomalyDetected ? '🚨 Anomaly/Lesion Detected' : '🟢 Normal / Clear Scan'}
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0' }}>
                            <strong>Model Confidence Score:</strong> ${(scanData.confidence * 100).toFixed(2)}%
                        </p>
                    </div>

                    {/* Display the processed report image directly from your S3 Processed bucket */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <strong>Processed Visual Output:</strong>
                        <img 
                            src={`https://med-scans-processed-aqb.s3.ap-south-1.amazonaws.com/${scanData.processedFileKey}`} 
                            alt="Processed Diagnostic Report" 
                            style={{ width: '100%', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                console.log("S3 image access restricted or file still caching.");
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}