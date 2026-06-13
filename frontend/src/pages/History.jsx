import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, ExternalLink, Calendar } from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/scans`);
        setScans(res.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Scan History</h2>
          <p style={{ color: '#94a3b8', margin: 0 }}>Clinical audit trail of all automated analyses.</p>
        </div>
        
        {/* Mock Search Bar for aesthetic completeness */}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.5rem 1rem' }}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search records..." 
            style={{ backgroundColor: 'transparent', border: 'none', color: '#f8fafc', outline: 'none', marginLeft: '0.5rem' }} 
          />
        </div>
      </div>

      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500', fontSize: '0.875rem' }}>Date processed</th>
              <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500', fontSize: '0.875rem' }}>File ID</th>
              <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500', fontSize: '0.875rem' }}>Verdict</th>
              <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500', fontSize: '0.875rem' }}>Confidence</th>
              <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500', fontSize: '0.875rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading secure records...</td></tr>
            ) : scans.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No scans processed yet.</td></tr>
            ) : (
              scans.map((scan) => (
                <tr key={scan._id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <Calendar size={14} color="#64748b" /> 
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#e2e8f0' }}>
                    {scan.originalFileKey.split('-').pop()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      backgroundColor: scan.anomalyDetected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: scan.anomalyDetected ? '#f87171' : '#34d399',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {scan.anomalyDetected ? 'Malignant' : 'Benign'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    {scan.confidence ? `${(scan.confidence * 100).toFixed(1)}%` : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {/* Placeholder for the detail page routing */}
                    <Link to={`/scan/${scan._id}`} style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                      View <ExternalLink size={14} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}