import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, User, ArrowRight } from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`${BACKEND_URL}${endpoint}`, formData);
      
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.location.href = '/dashboard'; 
      } else {
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '' });
        alert("Registration successful. Please log in.");
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    }
  };

  const inputStyle = { border: 'none', background: 'transparent', width: '100%', padding: '0.5rem', outline: 'none', color: '#f8fafc' };
  const inputWrapperStyle = { display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.5rem 1rem' };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '3rem', borderRadius: '1rem', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Activity size={40} color="#0ea5e9" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
            {isLogin ? 'Clinician Portal' : 'Register New Account'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {isLogin ? 'Enter your credentials to access the AI pipeline.' : 'Create a secure access token.'}
          </p>
        </div>

        {error && <div style={{ backgroundColor: '#450a0a', color: '#f87171', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1.5rem', border: '1px solid #7f1d1d', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <div style={inputWrapperStyle}>
              <User size={18} color="#64748b" />
              <input type="text" placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle} />
            </div>
          )}

          <div style={inputWrapperStyle}>
            <Mail size={18} color="#64748b" />
            <input type="email" placeholder="Email Address" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={inputStyle} />
          </div>

          <div style={inputWrapperStyle}>
            <Lock size={18} color="#64748b" />
            <input type="password" placeholder="Secure Password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={inputStyle} />
          </div>

          <button type="submit" style={{ backgroundColor: '#0ea5e9', color: '#ffffff', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: '600', marginTop: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            {isLogin ? 'Authenticate' : 'Create Account'} <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          {isLogin ? "Don't have access? " : "Already registered? "}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ color: '#38bdf8', fontWeight: '600', cursor: 'pointer' }}>
            {isLogin ? 'Request an account' : 'Sign in here'}
          </span>
        </p>
      </div>
    </div>
  );
}