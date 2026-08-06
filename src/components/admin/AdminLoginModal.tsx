import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Mail, MapPin, ArrowRight } from 'lucide-react';
import type { AuthState, SiteFilter } from '../../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (auth: AuthState) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@reethau.com');
  const [password, setPassword] = useState('admin123');
  const [selectedSite, setSelectedSite] = useState<SiteFilter>('global');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }

    onLoginSuccess({
      isAuthenticated: true,
      username: email.split('@')[0].toUpperCase(),
      role: 'Super Admin',
      assignedSite: selectedSite,
    });

    onClose();
  };

  return createPortal(
    <div className="admin-modal-overlay">
      <div
        className="glass-panel admin-modal-panel"
        style={{
          maxWidth: '460px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: '#94A3B8',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'rgba(0, 208, 132, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              padding: '10px',
            }}
          >
            <img
              src="/assets/images/logo-icon.png"
              alt="Logo Reethau"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>Portal Admin Reethau</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Manajemen Inventaris & Spare Part Multi-Site
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>
              Email Akun Admin
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#64748B" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(10, 15, 29, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
                placeholder="nama@reethau.com"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>
              Kata Sandi
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#64748B" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(10, 15, 29, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>
              Pilih Akses Site Awal
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} color="#64748B" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value as SiteFilter)}
                style={{
                  width: '100%',
                  background: '#0A0F1D',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              >
                <option value="global">🌐 Semua Site (Global Overview)</option>
                <option value="bekasi">📍 Site Bekasi (CNG Mother Station)</option>
                <option value="indramayu">📍 Site Indramayu (CNG Daughter Station)</option>
                <option value="blora">📍 Site Blora (Wellhead Facility)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.85rem',
              fontSize: '1rem',
              marginTop: '0.5rem',
            }}
          >
            Masuk ke Dashboard
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748B' }}>
          Akun Demo: <code>admin@reethau.com</code> | Pass: <code>admin123</code>
        </div>
      </div>
    </div>,
    document.body
  );
};
