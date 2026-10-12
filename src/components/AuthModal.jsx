import React, { useState } from 'react';
import { X, Sparkles, Lock, Mail, User, Phone, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { signInUser, signUpUser } from '../lib/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, showToast }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' | 'admin'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await signInUser({ email, password });
        showToast?.(`Welcome back, ${user.full_name || user.email}!`);
        onAuthSuccess?.(user);
        onClose();
      } else {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        const user = await signUpUser({
          email,
          password,
          fullName,
          phone,
          role
        });
        showToast?.(`Account registered successfully. Welcome to Kyaari Maison!`);
        onAuthSuccess?.(user);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole) => {
    setErrorMessage('');
    setLoading(true);
    try {
      const demoEmail = demoRole === 'admin' ? 'admin@kyaarijewellery.com' : 'customer@kyaarijewellery.com';
      const user = await signInUser({ email: demoEmail, password: 'password123' });
      showToast?.(`Signed in as ${user.full_name} (${user.role.toUpperCase()})`);
      onAuthSuccess?.(user);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content auth-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: '32px' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span className="gold-badge">KYAARI MAISON PRIVILEGE</span>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-teal)', marginTop: '8px' }}>
            {mode === 'login' ? 'Patron Sign In' : 'Create Maison Account'}
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#666', marginTop: '4px' }}>
            {mode === 'login'
              ? 'Access insured orders, royal wishlist, and concierge support.'
              : 'Join Kyaari for priority access to bridal releases & hallmark guarantee.'}
          </p>
        </div>

        {/* Quick Demo Switcher for Evaluation */}
        <div
          style={{
            background: 'var(--bg-pearl)',
            border: '1px solid var(--border-gold)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '18px'
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--primary-teal)',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} color="var(--gold-accent)" />
            <span>ONE-CLICK DEMO LOGIN (TESTING & REVIEW):</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="gold-outline-btn"
              style={{ fontSize: '0.78rem', padding: '7px 8px', width: '100%' }}
              onClick={() => handleQuickDemoLogin('customer')}
            >
              <UserCheck size={14} /> Test Customer
            </button>
            <button
              type="button"
              className="teal-btn"
              style={{ fontSize: '0.78rem', padding: '7px 8px', width: '100%' }}
              onClick={() => handleQuickDemoLogin('admin')}
            >
              <ShieldCheck size={14} /> Store Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #f87171',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              marginBottom: '16px'
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '4px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharani Gayatri Devi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-gold)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '4px' }}>
                  Mobile (+91 Indian PIN Verified)
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-gold)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '4px' }}>
                  Account Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-gold)',
                    fontSize: '0.9rem',
                    background: '#fff'
                  }}
                >
                  <option value="customer">Customer (Patron)</option>
                  <option value="admin">Store Admin (Atelier Inventory Manager)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '4px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                required
                placeholder="patron@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-gold)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '4px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-gold)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="teal-btn"
            disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '0.95rem' }}
          >
            {loading ? (
              'Authenticating...'
            ) : mode === 'login' ? (
              'Sign In to Maison'
            ) : (
              'Complete Registration'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.84rem', color: '#666' }}>
          {mode === 'login' ? (
            <>
              New patron at Kyaari?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                }}
                style={{ color: 'var(--primary-teal)', fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                style={{ color: 'var(--primary-teal)', fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
