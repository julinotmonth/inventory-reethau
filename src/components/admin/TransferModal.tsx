import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRightLeft, Send } from 'lucide-react';
import type { SparePart, SiteLocation } from '../../types';

interface TransferModalProps {
  isOpen: boolean;
  item: SparePart | null;
  onClose: () => void;
  onConfirmTransfer: (item: SparePart, quantity: number, targetSite: SiteLocation) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, item, onClose, onConfirmTransfer }) => {
  const [quantity, setQuantity] = useState(1);
  const [targetSite, setTargetSite] = useState<SiteLocation>('indramayu');
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const sitesList: { id: SiteLocation; name: string }[] = [
    { id: 'bekasi', name: 'Site Bekasi (Mother Station CNG)' },
    { id: 'indramayu', name: 'Site Indramayu (Daughter Station CNG)' },
    { id: 'blora', name: 'Site Blora (Wellhead & Processing)' },
    { id: 'setu', name: 'Site Setu (Compressor Station & Fleet Room)' },
  ];

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetSite === item.site) {
      setError('Lokasi site tujuan harus berbeda dari lokasi asal saat ini.');
      return;
    }
    if (quantity <= 0 || quantity > item.stock) {
      setError(`Jumlah transfer harus antara 1 dan stok maksimum (${item.stock}).`);
      return;
    }

    onConfirmTransfer(item, quantity, targetSite);
    onClose();
  };

  return createPortal(
    <div className="admin-modal-overlay" style={{ zIndex: 110 }}>
      <div
        className="glass-panel admin-modal-panel"
        style={{
          maxWidth: '500px',
          border: '1px solid rgba(0, 208, 132, 0.4)',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingRight: '2.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(0, 208, 132, 0.15)',
              color: '#00D084',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ArrowRightLeft size={24} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>Transfer Spare Part Antar Site</h3>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Modul Distribusi Logistik Reethau</div>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(10, 15, 29, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#00D084', fontWeight: 700 }}>SKU: {item.sku}</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.2rem' }}>{item.name}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem', color: '#94A3B8' }}>
            <span>Asal: <strong style={{ color: '#FFFFFF', textTransform: 'capitalize' }}>Site {item.site}</strong></span>
            <span>Stok Tersedia: <strong style={{ color: '#00D084' }}>{item.stock} {item.unit}</strong></span>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>
              Pilih Site Tujuan
            </label>
            <select
              value={targetSite}
              onChange={(e) => setTargetSite(e.target.value as SiteLocation)}
              style={{
                width: '100%',
                background: '#0A0F1D',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            >
              {sitesList.map((s) => (
                <option key={s.id} value={s.id} disabled={s.id === item.site}>
                  {s.name} {s.id === item.site ? '(Asal Saat Ini)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>
              Jumlah Unit Transfer ({item.unit})
            </label>
            <input
              type="number"
              min={1}
              max={item.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              style={{
                width: '100%',
                background: 'rgba(10, 15, 29, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 700,
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.85rem',
              marginTop: '0.5rem',
            }}
          >
            <Send size={18} />
            Konfirmasi Transfer Spare Part
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
