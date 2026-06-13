import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Clock, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ReportDetail() {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScanDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/scans/${id}`);
        setScan(res.data);
      } catch (error) {
        console.error("Failed to fetch scan", error);
      } finally {
        setLoading(false);
      }
    };
    fetchScanDetails();
  }, [id]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading secure medical record...</div>;
  if (!scan) return <div style={{ padding: '4rem', textAlign: 'center', color: '#ef4444' }}>Record not found.</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>
      <Link to="/history" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', textDecoration: 'none', marginBottom: '2rem', fontWeight: '500' }}>
        <ArrowLeft size={16} /> Back to History
      </Link>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '1rem', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
        {/* Header */}
        <div style={{ padding: '2rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#f8fafc' }}>Diagnostic Report Details</h2>
            <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> {new Date(scan.createdAt).toLocaleDateString()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> Latency: {scan.inferenceTimeMs || 'N/A'}ms</span>
            </div>
          </div>
          
          {/* Status Badge */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: '600',
            backgroundColor: scan.anomalyDetected ? '#450a0a' : '#064e3b',
            color: scan.anomalyDetected ? '#f87171' : '#34d399',
            border: `1px solid ${scan.anomalyDetected ? '#7f1d1d' : '#065f46'}`
          }}>
            {scan.anomalyDetected ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
            {scan.anomalyDetected ? 'Malignant / Anomaly Detected' : 'Benign / Normal'}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#0ea5e9" /> AI Confidence Score
            </h3>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#f8fafc', marginBottom: '2rem' }}>
              {(scan.confidence * 100).toFixed(1)}<span style={{ fontSize: '1.5rem', color: '#64748b' }}>%</span>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#cbd5e1' }}>File Tracking Keys:</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', wordBreak: 'break-all' }}>Raw: {scan.originalFileKey}</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#64748b', wordBreak: 'break-all' }}>Processed: {scan.heatmapFileKey || scan.processedFileKey}</p>
            </div>
          </div>

          <div>
             <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '1rem' }}>Grad-CAM Explanation Heatmap</h3>
             <div style={{ backgroundColor: '#0f172a', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
               <img 
                  src={`https://med-scans-processed-aqb.s3.ap-south-1.amazonaws.com/${scan.heatmapFileKey || scan.processedFileKey}`} 
                  alt="Grad-CAM Output" 
                  style={{ width: '100%', borderRadius: '0.25rem', display: 'block' }}
                />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}