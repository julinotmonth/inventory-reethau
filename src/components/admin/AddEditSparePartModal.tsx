import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, PlusCircle } from 'lucide-react';
import type { SparePart, SparePartCategory, ProductEnergyCategory, SiteLocation } from '../../types';

interface AddEditSparePartModalProps {
  isOpen: boolean;
  itemToEdit: SparePart | null;
  onClose: () => void;
  onSave: (part: Partial<SparePart>) => void;
}

export const AddEditSparePartModal: React.FC<AddEditSparePartModalProps> = ({
  isOpen,
  itemToEdit,
  onClose,
  onSave,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SparePartCategory>('Valves & Control');
  const [productEnergy, setProductEnergy] = useState<ProductEnergyCategory>('CNG');
  const [site, setSite] = useState<SiteLocation>('bekasi');
  const [stock, setStock] = useState(10);
  const [minStock, setMinStock] = useState(5);
  const [unit, setUnit] = useState('Units');
  const [priceEstimate, setPriceEstimate] = useState(2500000);
  const [specifications, setSpecifications] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setSku(itemToEdit.sku);
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setProductEnergy(itemToEdit.productEnergy);
      setSite(itemToEdit.site);
      setStock(itemToEdit.stock);
      setMinStock(itemToEdit.minStock);
      setUnit(itemToEdit.unit);
      setPriceEstimate(itemToEdit.priceEstimate);
      setSpecifications(itemToEdit.specifications);
    } else {
      setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
      setName('');
      setCategory('Valves & Control');
      setProductEnergy('CNG');
      setSite('bekasi');
      setStock(10);
      setMinStock(5);
      setUnit('Units');
      setPriceEstimate(2500000);
      setSpecifications('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    let status: SparePart['status'] = 'In Stock';
    if (stock <= 0) status = 'Maintenance Needed';
    else if (stock <= minStock / 2) status = 'Critical';
    else if (stock <= minStock) status = 'Low Stock';

    onSave({
      id: itemToEdit ? itemToEdit.id : undefined,
      sku,
      name,
      category,
      productEnergy,
      site,
      stock,
      minStock,
      unit,
      priceEstimate,
      status,
      lastInspected: new Date().toISOString().split('T')[0],
      specifications: specifications || 'Standar spesifikasi industri Reethau',
    });
    onClose();
  };

  return createPortal(
    <div className="admin-modal-overlay" style={{ zIndex: 110 }}>
      <div
        className="glass-panel admin-modal-panel"
        style={{
          maxWidth: '650px',
          border: '1px solid rgba(0, 208, 132, 0.4)',
          maxHeight: '90vh',
          overflowY: 'auto',
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
            {itemToEdit ? <Save size={24} /> : <PlusCircle size={24} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              {itemToEdit ? 'Edit Data Spare Part' : 'Tambah Spare Part Baru'}
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Katalog Inventaris Energi Bersih Reethau</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid-2">
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 600 }}>
              Kode SKU / Serial Number
            </label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(10, 15, 29, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#00D084',
                fontWeight: 700,
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 600 }}>
              Lokasi Site
            </label>
            <select
              value={site}
              onChange={(e) => setSite(e.target.value as SiteLocation)}
              style={{
                width: '100%',
                background: '#0A0F1D',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                outline: 'none',
              }}
            >
              <option value="bekasi">📍 Site Bekasi (Mother Station)</option>
              <option value="indramayu">📍 Site Indramayu (Daughter Station)</option>
              <option value="blora">📍 Site Blora (Wellhead)</option>
              <option value="setu">📍 Site Setu (Compressor Station)</option>
            </select>
          </div>

          <div className="span-2">
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 600 }}>
              Nama Spare Part
            </label>
            <input
              type="text"
              required
              value={name}
              placeholder="Contoh: High-Pressure Ball Valve 1/2 inch"
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(10, 15, 29, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 600 }}>
              Kategori Spare Part
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SparePartCategory)}
              style={{
                width: '100%',
                background: '#0A0F1D',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                outline: 'none',
              }}
            >
              <option value="Compressors">Compressors</option>
              <option value="Cylinders & Storage">Cylinders & Storage</option>
              <option value="Valves & Control">Valves & Control</option>
              <option value="Piping & Connectors">Piping & Connectors</option>
              <option value="Instruments & Sensors">Instruments & Sensors</option>
              <option value="Filtration & Purification">Filtration & Purification</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 600 }}>
              Kategori Produk Energi
            </label>
            <select
              value={productEnergy}
              onChange={(e) => setProductEnergy(e.target.value as ProductEnergyCategory)}
              style={{
                width: '100%',
                background: '#0A0F1D',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                outline: 'none',
              }}
            >
              <option value="CNG">CNG (Compressed Natural Gas)</option>
              <option value="LNG">LNG (Liquefied Natural Gas)</option>
              <option value="Biomass">Biomassa & Woodchip</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 600 }}>
              Jumlah Stok Saat Ini
            </label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                background: 'rgba(10, 15, 29, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                fontWeight: 700,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 600 }}>
              Batas Stok Minimum
            </label>
            <input
              type="number"
              min={1}
              value={minStock}
              onChange={(e) => setMinStock(parseInt(e.target.value) || 1)}
              style={{
                width: '100%',
                background: 'rgba(10, 15, 29, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                fontWeight: 700,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 600 }}>
              Satuan Unit
            </label>
            <input
              type="text"
              value={unit}
              placeholder="Units / Kits / Sets / Pcs"
              onChange={(e) => setUnit(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(10, 15, 29, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 600 }}>
              Estimasi Harga (IDR)
            </label>
            <input
              type="number"
              step={100000}
              value={priceEstimate}
              onChange={(e) => setPriceEstimate(parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                background: 'rgba(10, 15, 29, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                fontWeight: 700,
                outline: 'none',
              }}
            />
          </div>

          <div className="span-2">
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 600 }}>
              Spesifikasi Teknis
            </label>
            <textarea
              rows={3}
              value={specifications}
              placeholder="Standar tekanan, material SS316, sertifikasi ATEX, dll."
              onChange={(e) => setSpecifications(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(10, 15, 29, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <div className="span-2" style={{ marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.85rem',
              }}
            >
              <Save size={18} />
              Simpan Data Spare Part
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
