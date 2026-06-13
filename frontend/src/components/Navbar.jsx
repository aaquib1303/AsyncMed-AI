import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, Upload, History, Home } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const navItemStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: isActive(path) ? '#38bdf8' : '#94a3b8',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.95rem',
    transition: 'color 0.2s ease',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    backgroundColor: isActive(path) ? '#0f172a' : 'transparent',
  });

  return (
    <nav style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <Activity size={28} color="#0ea5e9" />
          <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#f8fafc', letterSpacing: '-0.025em' }}>
            AsyncMed<span style={{ color: '#0ea5e9', fontWeight: '400' }}>.ai</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/" style={navItemStyle('/')}><Home size={18} /> Home</Link>
          
          {token ? (
            <>
              <Link to="/dashboard" style={navItemStyle('/dashboard')}><LayoutDashboard size={18} /> Dashboard</Link>
              <Link to="/scan/new" style={navItemStyle('/scan/new')}><Upload size={18} /> Analyze</Link>
              <Link to="/history" style={navItemStyle('/history')}><History size={18} /> History</Link>
              <button 
                onClick={handleLogout}
                style={{ backgroundColor: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', marginLeft: '0.5rem' }}
              >
                Log Out
              </button>
            </>
          ) : (
            <Link to="/auth" style={{ backgroundColor: '#0ea5e9', color: '#ffffff', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '600' }}>
              Clinician Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}