import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { UploadCloud, Loader2, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000'; 
const socket = io(BACKEND_URL);

export default function NewScan() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('IDLE'); // IDLE, UPLOADING, PROCESSING, SUCCESS, ERROR
  const [scanData, setScanData] = useState(null);

  useEffect(() => {
    socket.on('scan-processed', (data) => {
      console.log('📡 Real-time update:', data);
      setScanData(data);
      setStatus('SUCCESS');
    });
    return () => socket.off('scan-processed');
  }, []);

  const handleUploadAndProcess = async () => {
    if (!file) return;
    try {
      setStatus('UPLOADING');
      
      // 1. Get Presigned URL
      const urlRes = await axios.get(`${BACKEND_URL}/api/upload-url`, {
        params: { filename: file.name, contentType: file.type }
      });
      const { uploadUrl, key } = urlRes.data;

      // 2. Join Socket Room & Upload to S3
      socket.emit('join-scan-room', key);
      await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });

      // 3. AWS EventBridge takes over
      setStatus('PROCESSING');
    } catch (error) {
      console.error('Pipeline Error:', error);
      setStatus('ERROR');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Initiate New Analysis</h2>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Upload an ovarian ultrasound scan for real-time AI classification and Grad-CAM generation.</p>

      {/* Upload Zone */}
      <div style={{
        backgroundColor: '#1e293b',
        border: '2px dashed #334155',
        borderRadius: '0.75rem',
        padding: '3rem 2rem',
        textAlign: 'center',
        transition: 'border-color 0.2s'
      }}>
        <UploadCloud size={48} color={file ? '#38bdf8' : '#64748b'} style={{ margin: '0 auto 1rem auto' }} />
        
        <input 
          type="file" 
          id="scan-upload" 
          accept="image/*" 
          onChange={(e) => { setFile(e.target.files[0]); setStatus('IDLE'); setScanData(null); }} 
          style={{ display: 'none' }} 
          disabled={status === 'UPLOADING' || status === 'PROCESSING'}
        />
        
        <label htmlFor="scan-upload" style={{
          display: 'inline-block',
          backgroundColor: '#334155',
          color: '#f8fafc',
          padding: '0.5rem 1.5rem',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontWeight: '500',
          marginBottom: '1rem'
        }}>
          {file ? file.name : 'Select Ultrasound Image'}
        </label>

        {file && status === 'IDLE' && (
          <div style={{ marginTop: '1.5rem' }}>
            <button 
              onClick={handleUploadAndProcess}
              style={{
                backgroundColor: '#0ea5e9', color: '#fff', padding: '0.75rem 2rem', 
                borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', border: 'none', fontSize: '1rem'
              }}
            >
              Run Pipeline
            </button>
          </div>
        )}

        {/* Dynamic Status Indicators */}
        {status === 'UPLOADING' && <p style={{ color: '#38bdf8', marginTop: '1rem' }}><Loader2 size={16} className="spin" /> Encrypting and uploading to S3...</p>}
        {status === 'PROCESSING' && <p style={{ color: '#f59e0b', marginTop: '1rem' }}><Loader2 size={16} className="spin" /> Fargate Container active. Running EfficientNet-B0...</p>}
        {status === 'ERROR' && <p style={{ color: '#ef4444', marginTop: '1rem' }}><AlertCircle size={16} /> Connection error. Please try again.</p>}
      </div>

      {/* Results Panel */}
      {status === 'SUCCESS' && scanData && (
        <div style={{ marginTop: '2rem', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
              <CheckCircle size={20} /> Analysis Complete
            </h3>
            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Latency: {scanData.inferenceTimeMs}ms</span>
          </div>
          
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Clinical Verdict</p>
              <div style={{ 
                padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem',
                backgroundColor: scanData.anomalyDetected ? '#450a0a' : '#064e3b',
                border: `1px solid ${scanData.anomalyDetected ? '#7f1d1d' : '#065f46'}`
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: scanData.anomalyDetected ? '#f87171' : '#34d399' }}>
                  {scanData.anomalyDetected ? '🚨 Malignant Anomaly Detected' : '🟢 Benign / Normal'}
                </span>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>AI Confidence Score</p>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{(scanData.confidence * 100).toFixed(2)}%</div>
            </div>

            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Grad-CAM Explanation Heatmap</p>
              <img 
                src={`https://med-scans-processed-aqb.s3.ap-south-1.amazonaws.com/${scanData.heatmapFileKey}`} 
                alt="Grad-CAM Output" 
                style={{ width: '100%', borderRadius: '0.5rem', border: '1px solid #334155' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}