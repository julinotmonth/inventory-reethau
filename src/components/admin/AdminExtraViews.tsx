import React, { useMemo, useState } from 'react';
import {
  Search,
  Tags,
  ArrowLeftRight,
  Wrench,
  ClipboardList,
  MapPin,
  Layers,
  Users,
  Package,
  ArrowRight,
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  QrCode as QrCodeIcon,
  ScanLine,
  History,
  CheckCircle2,
} from 'lucide-react';
import type { SparePart, ActivityLog, SiteLocation } from '../../types';
import { getCategoryVisual } from '../../data/categoryVisuals';
import { QRCodeModal } from './QRCodeModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import type { AdminView } from './Sidebar';

export const SETU_GALLERY: { src: string; caption: string }[] = [
  { src: '/assets/images/setu/setu-01.webp', caption: 'Sambungan & Fitting Perpipaan Gas' },
  { src: '/assets/images/setu/setu-02.webp', caption: 'Jalur Distribusi Pipa Compressor Station' },
  { src: '/assets/images/setu/setu-03.webp', caption: 'Unit Meter Turbin Gas' },
  { src: '/assets/images/setu/setu-04.webp', caption: 'Panel Kontrol Elektrikal Site' },
  { src: '/assets/images/setu/setu-05.webp', caption: 'Regulator & Valve Tekanan Tinggi' },
  { src: '/assets/images/setu/setu-06.webp', caption: 'Rangkaian Skid Instrumentasi' },
  { src: '/assets/images/setu/setu-07.webp', caption: 'Plat Spesifikasi Peralatan' },
  { src: '/assets/images/setu/setu-08.webp', caption: 'Area Skid Compressor Terbungkus' },
  { src: '/assets/images/setu/setu-09.webp', caption: 'Gardu & Jaringan Listrik Site' },
  { src: '/assets/images/setu/setu-10.webp', caption: 'Panel Distribusi Daya Site Setu' },
  { src: '/assets/images/setu/setu-11.webp', caption: 'APAR & Perlengkapan Keselamatan' },
  { src: '/assets/images/setu/setu-12.webp', caption: 'Instalasi Skid & Rak Peralatan' },
  { src: '/assets/images/setu/setu-13.webp', caption: 'Unit AC Ruang Fleet' },
  { src: '/assets/images/setu/setu-14.webp', caption: 'Unit AC Ruang Fleet (Tampak Lain)' },
  { src: '/assets/images/setu/setu-15.webp', caption: 'Label Barcode Aset Terdaftar' },
  { src: '/assets/images/setu/setu-16.webp', caption: 'Label Barcode Aset pada Furnitur Site' },
];

const SITE_LABEL: Record<SiteLocation, string> = {
  bekasi: 'Bekasi',
  indramayu: 'Indramayu',
  blora: 'Blora',
  setu: 'Setu',
};

const SITE_SUB: Record<SiteLocation, string> = {
  bekasi: 'Mother Station & Workshop',
  indramayu: 'Daughter Station & Depot',
  blora: 'Wellhead & Processing Plant',
  setu: 'Compressor Station & Fleet Room',
};

const SITE_IMAGE: Record<SiteLocation, string> = {
  bekasi: '/assets/images/cng-cylinder.webp',
  indramayu: '/assets/images/distribution-truck.webp',
  blora: '/assets/images/cng-pipe.webp',
  setu: '/assets/images/setu/setu-02.webp',
};

function formatIDR(val: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
}

function PageHeader({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="view-page-header">
      <div className="view-page-title">
        <Icon size={22} color="#00D084" />
        {title}
      </div>
      <div className="view-page-sub">{sub}</div>
    </div>
  );
}

/* ────────────────────────────── Global Search ────────────────────────────── */
export const GlobalSearchView: React.FC<{
  spareParts: SparePart[];
  logs: ActivityLog[];
  onNavigate?: (view: AdminView) => void;
}> = ({ spareParts, logs, onNavigate }) => {
  const [q, setQ] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanNotice, setScanNotice] = useState<{ code: string; matched: boolean } | null>(null);
  const query = q.trim().toLowerCase();

  const partResults = query
    ? spareParts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.specifications.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.productEnergy.toLowerCase().includes(query) ||
          SITE_LABEL[p.site].toLowerCase().includes(query)
      )
    : [];

  const logResults = query
    ? logs.filter((l) => l.description.toLowerCase().includes(query) || l.performedBy.toLowerCase().includes(query))
    : [];

  const topCategories = useMemo(() => {
    const counts = new Map<string, number>();
    spareParts.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);
  }, [spareParts]);

  const handleScanResult = (code: string) => {
    const matched = spareParts.some(
      (p) => p.sku.toLowerCase() === code.toLowerCase() || p.sku.toLowerCase().includes(code.toLowerCase())
    );
    setQ(code);
    setIsScannerOpen(false);
    setScanNotice({ code, matched });
  };

  return (
    <div>
      <PageHeader icon={Search} title="Global Search" sub="Cari spare part, SKU, spesifikasi, atau riwayat aktivitas di seluruh site" />

      <div className="glass-panel" style={{ borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: query || scanNotice ? '1rem' : '1.5rem' }}>
        <div className="gsearch-input-row">
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <Search size={18} color="#64748B" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              autoFocus
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setScanNotice(null);
              }}
              placeholder="Ketik, atau scan barcode / QR spare part..."
              style={{
                width: '100%',
                background: 'rgba(10, 15, 29, 0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '0.85rem 1rem 0.85rem 2.75rem',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="button"
            className="gsearch-scan-btn"
            onClick={() => {
              setScanNotice(null);
              setIsScannerOpen(true);
            }}
          >
            <ScanLine size={18} />
            Scan
          </button>
        </div>
      </div>

      {scanNotice && (
        <div className="gsearch-scan-toast" style={!scanNotice.matched ? { background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.35)', color: '#F59E0B' } : undefined}>
          <CheckCircle2 size={16} />
          {scanNotice.matched
            ? `Kode "${scanNotice.code}" terdeteksi dan cocok dengan katalog.`
            : `Kode "${scanNotice.code}" terdeteksi, namun tidak ditemukan di katalog.`}
        </div>
      )}

      {query && (
        <>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            Spare Part ({partResults.length})
          </div>
          <div className="glass-panel simple-table-wrap" style={{ borderRadius: '16px', marginBottom: '1.5rem' }}>
            <table className="simple-table">
              <tbody>
                {partResults.length === 0 && (
                  <tr><td style={{ color: '#64748B' }}>Tidak ada spare part yang cocok.</td></tr>
                )}
                {partResults.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', color: '#00D084', width: '140px' }}>{p.sku}</td>
                    <td style={{ color: '#FFFFFF', fontWeight: 600 }}>{p.name}</td>
                    <td>Site {SITE_LABEL[p.site]}</td>
                    <td>{p.stock} {p.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            Riwayat Aktivitas ({logResults.length})
          </div>
          <div className="glass-panel simple-table-wrap" style={{ borderRadius: '16px' }}>
            <table className="simple-table">
              <tbody>
                {logResults.length === 0 && (
                  <tr><td style={{ color: '#64748B' }}>Tidak ada aktivitas yang cocok.</td></tr>
                )}
                {logResults.map((l) => (
                  <tr key={l.id}>
                    <td style={{ color: '#64748B', width: '160px' }}>{l.timestamp}</td>
                    <td style={{ color: '#FFFFFF' }}>{l.description}</td>
                    <td style={{ color: '#94A3B8' }}>{l.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!query && (
        <div className="gsearch-empty">
          <div className="gsearch-empty-hero">
            <div className="gsearch-empty-hero-icon">
              <Search size={28} />
            </div>
            <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>
              Mulai ketik atau scan barcode
            </div>
            <div style={{ color: '#64748B', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
              Cari spare part berdasarkan nama, SKU, kategori, atau spesifikasi — atau langsung scan label barcode/QR di lapangan untuk pencarian instan.
            </div>
          </div>

          <div className="gsearch-action-grid">
            <button type="button" className="gsearch-action-card" onClick={() => setIsScannerOpen(true)}>
              <div className="gsearch-action-card-icon" style={{ background: 'rgba(0, 208, 132, 0.15)', color: '#00D084' }}>
                <ScanLine size={20} />
              </div>
              <div className="gsearch-action-card-title">Scan Barcode / QR</div>
              <div className="gsearch-action-card-sub">Gunakan kamera untuk memindai label SKU spare part secara instan.</div>
            </button>

            <button
              type="button"
              className="gsearch-action-card"
              onClick={() => onNavigate?.('categories')}
              disabled={!onNavigate}
              style={!onNavigate ? { cursor: 'default', opacity: 0.6 } : undefined}
            >
              <div className="gsearch-action-card-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}>
                <Tags size={20} />
              </div>
              <div className="gsearch-action-card-title">Jelajahi Kategori</div>
              <div className="gsearch-action-card-sub">Lihat ringkasan stok per kategori spare part di seluruh site.</div>
            </button>

            <button
              type="button"
              className="gsearch-action-card"
              onClick={() => onNavigate?.('audit')}
              disabled={!onNavigate}
              style={!onNavigate ? { cursor: 'default', opacity: 0.6 } : undefined}
            >
              <div className="gsearch-action-card-icon" style={{ background: 'rgba(244, 114, 182, 0.15)', color: '#F472B6' }}>
                <History size={20} />
              </div>
              <div className="gsearch-action-card-title">Riwayat Aktivitas</div>
              <div className="gsearch-action-card-sub">Telusuri log transfer, penambahan, dan perubahan stok terbaru.</div>
            </button>
          </div>

          {topCategories.length > 0 && (
            <div className="gsearch-chip-section">
              <div className="gsearch-chip-label">Pencarian Cepat &mdash; Kategori</div>
              <div className="gsearch-chips">
                {topCategories.map((cat) => {
                  const visual = getCategoryVisual(cat);
                  const Icon = visual.icon;
                  return (
                    <button key={cat} type="button" className="gsearch-chip" onClick={() => setQ(cat)}>
                      <Icon size={13} color={visual.color} />
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="gsearch-chip-section">
            <div className="gsearch-chip-label">Pencarian Cepat &mdash; Site</div>
            <div className="gsearch-chips">
              {(Object.keys(SITE_LABEL) as SiteLocation[]).map((site) => (
                <button key={site} type="button" className="gsearch-chip" onClick={() => setQ(SITE_LABEL[site])}>
                  <MapPin size={13} />
                  Site {SITE_LABEL[site]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleScanResult} />
    </div>
  );
};

/* ────────────────────────────── Categories ────────────────────────────── */
export const CategoriesView: React.FC<{ spareParts: SparePart[] }> = ({ spareParts }) => {
  const grouped = Object.entries(
    spareParts.reduce<Record<string, { count: number; stock: number; value: number }>>((acc, p) => {
      if (!acc[p.category]) acc[p.category] = { count: 0, stock: 0, value: 0 };
      acc[p.category].count += 1;
      acc[p.category].stock += p.stock;
      acc[p.category].value += p.stock * p.priceEstimate;
      return acc;
    }, {})
  );

  return (
    <div>
      <PageHeader icon={Tags} title="Kategori Spare Part" sub="Ringkasan tiap kategori produk di seluruh site" />
      <div className="kpi-grid">
        {grouped.map(([name, data]) => {
          const visual = getCategoryVisual(name);
          const Icon = visual.icon || Package;
          return (
            <div key={name} className="glass-panel" style={{ borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: visual?.bg || 'rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={20} color={visual?.color || '#94A3B8'} />
                </div>
                <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>{name}</div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>
                {data.stock} <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>unit / {data.count} jenis</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#00D084', marginTop: '0.4rem' }}>{formatIDR(data.value)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ────────────────────────────── Assignments (Transfers) ────────────────────────────── */
export const AssignmentsView: React.FC<{ logs: ActivityLog[] }> = ({ logs }) => {
  const transfers = logs.filter((l) => l.action === 'TRANSFER');
  return (
    <div>
      <PageHeader icon={ArrowLeftRight} title="Transfer Antar Site" sub="Riwayat perpindahan spare part antar lokasi operasional" />
      <div className="glass-panel simple-table-wrap" style={{ borderRadius: '16px', padding: '0.5rem' }}>
        <table className="simple-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Deskripsi</th>
              <th>Dari</th>
              <th></th>
              <th>Ke</th>
              <th>Oleh</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 && (
              <tr><td colSpan={6} style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>Belum ada transfer.</td></tr>
            )}
            {transfers.map((l) => (
              <tr key={l.id}>
                <td style={{ color: '#64748B', whiteSpace: 'nowrap' }}>{l.timestamp}</td>
                <td style={{ color: '#FFFFFF' }}>{l.description}</td>
                <td>{l.siteFrom ? `Site ${SITE_LABEL[l.siteFrom]}` : '—'}</td>
                <td><ArrowRight size={14} color="#00D084" /></td>
                <td>{l.siteTo ? `Site ${SITE_LABEL[l.siteTo]}` : '—'}</td>
                <td style={{ color: '#94A3B8' }}>{l.performedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ────────────────────────────── Maintenance ────────────────────────────── */
export const MaintenanceView: React.FC<{ spareParts: SparePart[] }> = ({ spareParts }) => {
  const items = spareParts.filter((p) => p.status === 'Maintenance Needed' || p.status === 'Critical' || p.status === 'Low Stock');
  return (
    <div>
      <PageHeader icon={Wrench} title="Maintenance" sub="Spare part yang butuh servis, pengadaan, atau perhatian segera" />
      <div className="glass-panel simple-table-wrap" style={{ borderRadius: '16px', padding: '0.5rem' }}>
        <table className="simple-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nama</th>
              <th>Site</th>
              <th>Status</th>
              <th>Stok / Min</th>
              <th>Terakhir Diperiksa</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={6} style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>Tidak ada item yang butuh perhatian. 🎉</td></tr>
            )}
            {items.map((p) => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', color: '#00D084' }}>{p.sku}</td>
                <td style={{ color: '#FFFFFF', fontWeight: 600 }}>{p.name}</td>
                <td>Site {SITE_LABEL[p.site]}</td>
                <td>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      color: p.status === 'Critical' ? '#F87171' : p.status === 'Maintenance Needed' ? '#A78BFA' : '#F59E0B',
                      background: p.status === 'Critical' ? 'rgba(248,113,113,0.12)' : p.status === 'Maintenance Needed' ? 'rgba(167,139,250,0.12)' : 'rgba(245,158,11,0.12)',
                    }}
                  >
                    {p.status}
                  </span>
                </td>
                <td>{p.stock} / {p.minStock}</td>
                <td style={{ color: '#94A3B8' }}>{p.lastInspected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ────────────────────────────── Audit / Log ────────────────────────────── */
export const AuditView: React.FC<{ logs: ActivityLog[] }> = ({ logs }) => {
  return (
    <div>
      <PageHeader icon={ClipboardList} title="Audit / Log Aktivitas" sub="Seluruh riwayat perubahan data inventaris" />
      <div className="glass-panel simple-table-wrap" style={{ borderRadius: '16px', padding: '0.5rem' }}>
        <table className="simple-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Aksi</th>
              <th>Deskripsi</th>
              <th>Oleh</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={4} style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>Belum ada log.</td></tr>
            )}
            {logs.map((l) => (
              <tr key={l.id}>
                <td style={{ color: '#64748B', whiteSpace: 'nowrap' }}>{l.timestamp}</td>
                <td style={{ color: '#00D084', fontWeight: 700, fontSize: '0.75rem' }}>{l.action}</td>
                <td style={{ color: '#FFFFFF' }}>{l.description}</td>
                <td style={{ color: '#94A3B8' }}>{l.performedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ────────────────────────────── Branches (Sites) ────────────────────────────── */
export const BranchesView: React.FC<{ spareParts: SparePart[] }> = ({ spareParts }) => {
  const sites: SiteLocation[] = ['bekasi', 'indramayu', 'blora', 'setu'];
  const [qrSite, setQrSite] = useState<SiteLocation | null>(null);

  return (
    <div>
      <PageHeader icon={MapPin} title="Site Operasional" sub="Ringkasan inventaris di tiap lokasi Reethau — ketuk ikon QR untuk kode akses cepat site" />
      <div className="site-grid" style={{ marginBottom: '1rem' }}>
        {sites.map((site) => {
          const items = spareParts.filter((p) => p.site === site);
          const value = items.reduce((acc, p) => acc + p.stock * p.priceEstimate, 0);
          const lowStock = items.filter((p) => p.stock <= p.minStock).length;
          return (
            <div key={site} className="site-card active" style={{ minHeight: '160px', cursor: 'default' }}>
              <div className="site-card-bg" style={{ backgroundImage: `url(${SITE_IMAGE[site]})` }} />
              <div className="site-card-overlay" />
              <button
                className="site-card-qr-btn"
                title={`QR Code Site ${SITE_LABEL[site]}`}
                aria-label={`Tampilkan QR Code Site ${SITE_LABEL[site]}`}
                onClick={(e) => { e.stopPropagation(); setQrSite(site); }}
              >
                <QrCodeIcon size={16} />
              </button>
              <div className="site-card-content" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <div className="site-card-label"><MapPin size={16} />Site {SITE_LABEL[site]}</div>
                  <div className="site-card-sub">{SITE_SUB[site]}</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#fff' }}>
                  <span>{items.length} jenis part</span>
                  <span>{lowStock} stok kritis</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00D084' }}>{formatIDR(value)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {qrSite && (
        <QRCodeModal
          isOpen={!!qrSite}
          onClose={() => setQrSite(null)}
          title={`Site ${SITE_LABEL[qrSite]}`}
          subtitle={`REETHAU-SITE-${qrSite.toUpperCase()}`}
          value={`https://inventory.reethau.id/site/${qrSite}`}
          fileName={`reethau-site-${qrSite}-qr`}
          metaLines={[
            { label: 'Deskripsi', value: SITE_SUB[qrSite] },
            { label: 'Jenis Part', value: `${spareParts.filter((p) => p.site === qrSite).length} terdaftar` },
          ]}
        />
      )}
    </div>
  );
};

/* ────────────────────────────── Asset Photo Gallery (Site Setu) ────────────────────────────── */
export const GalleryView: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = () => setActiveIndex(null);
  const showPrev = () =>
    setActiveIndex((i) => (i === null ? null : (i - 1 + SETU_GALLERY.length) % SETU_GALLERY.length));
  const showNext = () =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % SETU_GALLERY.length));

  return (
    <div>
      <PageHeader
        icon={Images}
        title="Galeri Aset — Site Setu"
        sub={`${SETU_GALLERY.length} dokumentasi foto peralatan & instalasi lapangan Site Setu (Compressor Station & Fleet Room)`}
      />
      <div className="gallery-grid">
        {SETU_GALLERY.map((photo, idx) => (
          <button key={photo.src} className="gallery-card" onClick={() => setActiveIndex(idx)}>
            <img src={photo.src} alt={photo.caption} loading="lazy" />
            <div className="gallery-card-caption">{photo.caption}</div>
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="gallery-lightbox"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          role="dialog"
          aria-modal="true"
        >
          <button className="gallery-lightbox-close" onClick={close} aria-label="Tutup galeri">
            <X size={20} />
          </button>
          <button className="gallery-lightbox-nav prev" onClick={showPrev} aria-label="Foto sebelumnya">
            <ChevronLeft size={22} />
          </button>
          <img
            src={SETU_GALLERY[activeIndex].src}
            alt={SETU_GALLERY[activeIndex].caption}
            className="gallery-lightbox-img"
          />
          <button className="gallery-lightbox-nav next" onClick={showNext} aria-label="Foto berikutnya">
            <ChevronRight size={22} />
          </button>
          <div className="gallery-lightbox-caption">
            {SETU_GALLERY[activeIndex].caption} — ({activeIndex + 1}/{SETU_GALLERY.length})
          </div>
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────── Product Lines ────────────────────────────── */
export const ProductLinesView: React.FC<{ spareParts: SparePart[] }> = ({ spareParts }) => {
  const lines = ['CNG', 'LNG', 'Biomass'] as const;
  const colors: Record<string, string> = { CNG: '#38BDF8', LNG: '#F472B6', Biomass: '#A3E635' };
  return (
    <div>
      <PageHeader icon={Layers} title="Lini Produk Energi" sub="Spare part dikelompokkan berdasarkan lini produk clean energy Reethau" />
      <div className="kpi-grid">
        {lines.map((line) => {
          const items = spareParts.filter((p) => p.productEnergy === line);
          const stock = items.reduce((acc, p) => acc + p.stock, 0);
          const value = items.reduce((acc, p) => acc + p.stock * p.priceEstimate, 0);
          return (
            <div key={line} className="glass-panel" style={{ borderRadius: '16px', padding: '1.25rem', borderTop: `3px solid ${colors[line]}` }}>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 700 }}>{line} Line</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
                {stock} <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>unit / {items.length} jenis</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: colors[line], marginTop: '0.4rem', fontWeight: 700 }}>{formatIDR(value)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ────────────────────────────── Team (from log activity) ────────────────────────────── */
export const TeamView: React.FC<{ logs: ActivityLog[] }> = ({ logs }) => {
  const roster = Object.entries(
    logs.reduce<Record<string, number>>((acc, l) => {
      acc[l.performedBy] = (acc[l.performedBy] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const initials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  return (
    <div>
      <PageHeader icon={Users} title="Tim Lapangan" sub="Personel yang tercatat aktif melakukan perubahan data inventaris" />
      <div className="roster-grid">
        {roster.length === 0 && (
          <div style={{ color: '#64748B' }}>Belum ada aktivitas tercatat.</div>
        )}
        {roster.map(([name, count]) => (
          <div key={name} className="glass-panel roster-card">
            <div className="roster-avatar">{initials(name)}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.88rem' }}>{name}</div>
              <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.15rem' }}>{count} aktivitas tercatat</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};