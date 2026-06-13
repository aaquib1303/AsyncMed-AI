import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Users, ShieldAlert, Zap } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, anomalies: 0, avgConfidence: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/scans');
        const scans = res.data;
        if (scans.length > 0) {
          const anomalies = scans.filter(s => s.anomalyDetected).length;
          const totalConf = scans.reduce((acc, curr) => acc + (curr.confidence || 0), 0);
          setStats({
            total: scans.length,
            anomalies: anomalies,
            avgConfidence: (totalConf / scans.length) * 100
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ backgroundColor: color + '20', padding: '1rem', borderRadius: '0.75rem', color: color }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: '0 0 0.25rem 0', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>{title}</p>
        <h3 style={{ margin: 0, fontSize: '1.75rem', color: '#f8fafc', fontWeight: '700' }}>{value}</h3>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#f8fafc', marginBottom: '2rem' }}>Clinic Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="Total Scans Processed" value={stats.total} icon={<Activity size={24} />} color="#0ea5e9" />
        <StatCard title="Anomalies Flagged" value={stats.anomalies} icon={<ShieldAlert size={24} />} color="#ef4444" />
        <StatCard title="Avg Model Confidence" value={`${stats.avgConfidence.toFixed(1)}%`} icon={<Zap size={24} />} color="#34d399" />
      </div>

      <div style={{ marginTop: '3rem', backgroundColor: '#1e293b', padding: '2rem', borderRadius: '1rem', border: '1px solid #334155', textAlign: 'center' }}>
        <Users size={48} color="#475569" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Ready for Patient Data</h3>
        <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto' }}>
          The asynchronous pipeline is active. Real-time metrics will update automatically as new ultrasound scans are processed by the Fargate cluster.
        </p>
      </div>
    </div>
  );
}