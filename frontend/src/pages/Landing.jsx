import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Zap, ArrowRight, CheckCircle } from 'lucide-react';

export default function Landing() {
  return (
    <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '5rem' }}>
      
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '3rem 0 1rem 0', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          padding: '0.375rem 1rem',
          borderRadius: '9999px',
          color: '#38bdf8',
          fontSize: '0.875rem',
          fontWeight: '500',
          marginBottom: '1.5rem'
        }}>
          <Cpu size={16} /> Powered by Custom EfficientNet-B0 Deep Learning
        </div>
        
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
          Asynchronous Ultrasound Analysis <br />
          <span style={{ background: 'linear-gradient(to right, #38bdf8, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            With Explainable Computer Vision
          </span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
          A secure, cloud-native diagnostic pipeline for processing ovarian ultrasound imagery. Upload high-resolution scans, execute decoupled worker environments, and interpret decisions via automated Grad-CAM heatmaps.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/scan/new" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#0ea5e9',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '1rem',
            transition: 'background-color 0.2s'
          }}>
            Analyze a Scan <ArrowRight size={18} />
          </Link>
          <Link to="/dashboard" style={{
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '1rem'
          }}>
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Feature Pillar Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '2rem'
      }}>
        {/* Card 1 */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '2rem', borderRadius: '0.75rem' }}>
          <div style={{ backgroundColor: '#0c4a6e', width: '48px', height: '48px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyWay: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Cpu color="#38bdf8" size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Fine-Tuned Image Models</h3>
          <p style={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.95rem' }}>
            Utilizes a custom, 2-class binary classification architecture designed using deep transfer learning to safely differentiate between benign structures and malignant anomalies.
          </p>
        </div>

        {/* Card 2 */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '2rem', borderRadius: '0.75rem' }}>
          <div style={{ backgroundColor: '#064e3b', width: '48px', height: '48px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Zap color="#34d399" size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Grad-CAM Visual Explanations</h3>
          <p style={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.95rem' }}>
            No black boxes. The system runs backpropagation into the final convolutional feature layer to visually map out exactly which tissue variations directed the output class confidence.
          </p>
        </div>

        {/* Card 3 */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '2rem', borderRadius: '0.75rem' }}>
          <div style={{ backgroundColor: '#3b0764', width: '48px', height: '48px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <ShieldCheck color="#c084fc" size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Decoupled Cloud Execution</h3>
          <p style={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.95rem' }}>
            Web app actions stay performant. Express delegates long-running inference jobs via safe AWS event loops to containerized compute tasks running inside isolated Docker runtimes.
          </p>
        </div>
      </section>

      {/* Workflow Summary Divider */}
      <section style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Pipeline Overview</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
            <CheckCircle size={18} color="#34d399" /> React Frontend Upload
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
            <CheckCircle size={18} color="#34d399" /> Secure S3 Raw Storage
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
            <CheckCircle size={18} color="#34d399" /> Decoupled Fargate Cluster
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
            <CheckCircle size={18} color="#34d399" /> Express Webhook Synchronization
          </div>
        </div>
      </section>

    </div>
  );
}