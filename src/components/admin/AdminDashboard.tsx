import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LogOut,
  Plus,
  Search,
  Activity,
  Package,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  X,
  ExternalLink,
  Wrench,
  Layers,
  Menu,
  Bell,
  Sun,
  Moon,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import type { AuthState, SparePart, SiteFilter, ActivityLog, SiteLocation } from '../../types';
import { INITIAL_SPARE_PARTS, INITIAL_LOGS } from '../../data/mockData';
import { getSparePartCategories } from '../../data/categoryStore';
import { SiteSelector } from './SiteSelector';
import { SparePartTable } from './SparePartTable';
import { TransferModal } from './TransferModal';
import { AddEditSparePartModal } from './AddEditSparePartModal';
import { AdminAnalytics } from './AdminAnalytics';
import { Sidebar, type AdminView } from './Sidebar';
import {
  GlobalSearchView,
  CategoriesView,
  AssignmentsView,
  MaintenanceView,
  AuditView,
  BranchesView,
  ProductLinesView,
  TeamView,
  GalleryView,
  ACTION_META,
  parseLogDate,
  timeAgo,
  SITE_LABEL,
} from './AdminExtraViews';

interface AdminDashboardProps {
  auth: AuthState;
  onLogout: () => void;
  onGoToPublicSite: () => void;
}

// Bump this whenever INITIAL_SPARE_PARTS / INITIAL_LOGS changes in mockData.ts,
// so browsers with an older cached dataset (in localStorage) pick up the update
// instead of silently hiding new items (e.g. Site Setu spare parts).
const DATA_VERSION = 'v5-compact-layout-2026-07-26';

// All ActivityLog timestamps must share one sortable, parseable format
// ("YYYY-MM-DD HH:mm", same as the seed data in mockData.ts). Using
// `toLocaleString('id-ID')` here previously produced a locale-formatted
// string ("6/8/2026, 18.16.00") that couldn't be sorted or parsed
// consistently alongside the seed logs.
const nowTimestamp = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const THEME_KEY = 'reethau_admin_theme';
const NOTIF_READ_KEY = 'reethau_notif_last_read';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ auth, onLogout, onGoToPublicSite }) => {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // ── Theme (dark / light) ────────────────────────────────────────────────
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    // Reset to the default (dark) look once the admin portal is left, so the
    // public marketing site keeps its own fixed branded appearance.
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const isDataStale = localStorage.getItem('reethau_data_version') !== DATA_VERSION;

  const [spareParts, setSpareParts] = useState<SparePart[]>(() => {
    if (isDataStale) return INITIAL_SPARE_PARTS;
    const saved = localStorage.getItem('reethau_spare_parts');
    return saved ? JSON.parse(saved) : INITIAL_SPARE_PARTS;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    if (isDataStale) return INITIAL_LOGS;
    const saved = localStorage.getItem('reethau_activity_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('reethau_data_version', DATA_VERSION);
  }, []);

  const [currentSite, setCurrentSite] = useState<SiteFilter>(auth.assignedSite || 'global');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [categoryOptions, setCategoryOptions] = useState<string[]>(getSparePartCategories());

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SparePart | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferringItem, setTransferringItem] = useState<SparePart | null>(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── Notifications ────────────────────────────────────────────────────────
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [lastReadAt, setLastReadAt] = useState<number>(() => Number(localStorage.getItem(NOTIF_READ_KEY) || 0));
  const previousReadAtRef = useRef(lastReadAt);

  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => (parseLogDate(b.timestamp)?.getTime() ?? 0) - (parseLogDate(a.timestamp)?.getTime() ?? 0)),
    [logs]
  );
  const unreadCount = useMemo(
    () => sortedLogs.filter((l) => (parseLogDate(l.timestamp)?.getTime() ?? 0) > lastReadAt).length,
    [sortedLogs, lastReadAt]
  );
  const attentionItems = useMemo(
    () => spareParts.filter((p) => p.status === 'Critical' || p.status === 'Maintenance Needed'),
    [spareParts]
  );

  const toggleNotif = () => {
    setIsNotifOpen((open) => {
      const next = !open;
      if (next) {
        previousReadAtRef.current = lastReadAt;
        const now = Date.now();
        setLastReadAt(now);
        localStorage.setItem(NOTIF_READ_KEY, String(now));
      }
      return next;
    });
  };

  useEffect(() => {
    localStorage.setItem('reethau_spare_parts', JSON.stringify(spareParts));
  }, [spareParts]);

  useEffect(() => {
    localStorage.setItem('reethau_activity_logs', JSON.stringify(logs));
  }, [logs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredSpareParts = spareParts.filter((item) => {
    const matchesSite = currentSite === 'global' || item.site === currentSite;
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specifications.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSite && matchesCategory && matchesSearch;
  });

  const siteCounts = {
    global: spareParts.length,
    bekasi: spareParts.filter((p) => p.site === 'bekasi').length,
    indramayu: spareParts.filter((p) => p.site === 'indramayu').length,
    blora: spareParts.filter((p) => p.site === 'blora').length,
    setu: spareParts.filter((p) => p.site === 'setu').length,
  };

  const totalItems = filteredSpareParts.reduce((acc, curr) => acc + curr.stock, 0);
  const lowStockCount = filteredSpareParts.filter((p) => p.stock <= p.minStock).length;
  const totalValue = filteredSpareParts.reduce((acc, curr) => acc + curr.stock * curr.priceEstimate, 0);
  const maintenanceCount = filteredSpareParts.filter((p) => p.status === 'Maintenance Needed').length;
  const activeCategoryCount = new Set(filteredSpareParts.map((p) => p.category)).size;

  const handleSaveSparePart = (partData: Partial<SparePart>) => {
    if (partData.id) {
      setSpareParts((prev) =>
        prev.map((p) => (p.id === partData.id ? ({ ...p, ...partData } as SparePart) : p))
      );
      showToast(`Spare part ${partData.sku} berhasil diperbarui.`);
    } else {
      const newPart: SparePart = {
        ...partData,
        id: `sp-${Date.now()}`,
      } as SparePart;
      setSpareParts((prev) => [newPart, ...prev]);

      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        timestamp: nowTimestamp(),
        action: 'ADD_SPARE_PART',
        description: `Penambahan spare part baru: ${newPart.name} (${newPart.sku}) di Site ${newPart.site}`,
        performedBy: auth.username,
        siteFrom: newPart.site,
      };
      setLogs((prev) => [newLog, ...prev]);
      showToast(`Spare part baru ${newPart.name} berhasil ditambahkan!`);
    }
    // Refresh in case a new category was added from the modal.
    setCategoryOptions(getSparePartCategories());
  };

  const handleConfirmTransfer = (item: SparePart, quantity: number, targetSite: SiteLocation) => {
    setSpareParts((prev) =>
      prev.map((p) => {
        if (p.id === item.id) {
          const newStock = p.stock - quantity;
          let newStatus = p.status;
          if (newStock <= 0) newStatus = 'Maintenance Needed';
          else if (newStock <= p.minStock) newStatus = 'Low Stock';
          return { ...p, stock: newStock, status: newStatus };
        }
        return p;
      })
    );

    const existingTargetItem = spareParts.find(
      (p) => p.sku === item.sku && p.site === targetSite
    );

    if (existingTargetItem) {
      setSpareParts((prev) =>
        prev.map((p) => (p.id === existingTargetItem.id ? { ...p, stock: p.stock + quantity, status: 'In Stock' } : p))
      );
    } else {
      const newTargetPart: SparePart = {
        ...item,
        id: `sp-tr-${Date.now()}`,
        site: targetSite,
        stock: quantity,
        status: 'In Stock',
        lastInspected: new Date().toISOString().split('T')[0],
      };
      setSpareParts((prev) => [...prev, newTargetPart]);
    }

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: nowTimestamp(),
      action: 'TRANSFER',
      description: `Transfer ${quantity} ${item.unit} ${item.name} dari Site ${item.site.toUpperCase()} ke Site ${targetSite.toUpperCase()}`,
      performedBy: auth.username,
      siteFrom: item.site,
      siteTo: targetSite,
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast(`Berhasil mentransfer ${quantity} unit ${item.name} ke Site ${targetSite.toUpperCase()}`);
  };

  const handleFlagMaintenance = (item: SparePart, note: string) => {
    setSpareParts((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, status: 'Maintenance Needed', lastInspected: new Date().toISOString().split('T')[0] } : p))
    );

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: nowTimestamp(),
      action: 'STOCK_UPDATE',
      description: note
        ? `Menandai ${item.name} (${item.sku}) di Site ${item.site.toUpperCase()} untuk maintenance: ${note}`
        : `Menandai ${item.name} (${item.sku}) di Site ${item.site.toUpperCase()} untuk maintenance.`,
      performedBy: auth.username,
      siteFrom: item.site,
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast(`${item.name} ditandai untuk maintenance.`);
  };

  const handleResolveMaintenance = (item: SparePart) => {
    const resolvedStatus: SparePart['status'] = item.stock <= 0 ? 'Critical' : item.stock <= item.minStock ? 'Low Stock' : 'In Stock';
    setSpareParts((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, status: resolvedStatus, lastInspected: new Date().toISOString().split('T')[0] } : p))
    );

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: nowTimestamp(),
      action: 'STOCK_UPDATE',
      description: `Maintenance selesai untuk ${item.name} (${item.sku}) di Site ${item.site.toUpperCase()}.`,
      performedBy: auth.username,
      siteFrom: item.site,
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast(`${item.name} ditandai selesai maintenance.`);
  };

  const handleDeleteSparePart = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data spare part ini?')) {
      const target = spareParts.find((p) => p.id === id);
      setSpareParts((prev) => prev.filter((p) => p.id !== id));
      if (target) {
        showToast(`Spare part ${target.name} dihapus.`);
      }
    }
  };

  return (
    <div className="admin-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 200,
            background: 'rgba(0, 208, 132, 0.95)',
            color: 'var(--txt-inverse)',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 10px 30px rgba(0, 208, 132, 0.4)',
          }}
        >
          <CheckCircle2 size={22} />
          {toastMessage}
        </div>
      )}

      <div className="admin-layout">
        <Sidebar active={activeView} onNavigate={setActiveView} isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        <div className="admin-content">
      {/* Admin Header Topbar */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <button
              className="admin-mobile-nav-toggle"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={18} />
            </button>
            <img
              src="/assets/images/logo-white.webp"
              alt="Reethau Clean Energy Logo"
              className="admin-brand-logo-img"
            />
            <div style={{ minWidth: 0 }}>
              <div className="admin-brand-title">
                Reethau Inventory Admin Portal
                <span style={{ fontSize: '0.7rem', background: 'rgba(0, 208, 132, 0.15)', color: '#00D084', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  v2.4 Live
                </span>
              </div>
              <div className="admin-brand-sub">
                User: <strong style={{ color: 'var(--txt-tertiary)' }}>{auth.username}</strong> ({auth.role})
              </div>
            </div>
          </div>

          <div className="admin-actions">
            <button
              onClick={toggleTheme}
              className="btn-chip theme-toggle-btn"
              title={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
              aria-label="Ganti tema"
            >
              {theme === 'dark' ? <Moon size={21} strokeWidth={2.1} /> : <Sun size={21} strokeWidth={2.1} />}
            </button>

            <button
              onClick={toggleNotif}
              className="btn-chip notif-bell-btn"
              title="Notifikasi"
              aria-label="Notifikasi"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            <button
              onClick={() => setIsLogsOpen(!isLogsOpen)}
              className="btn-chip"
            >
              <Activity size={16} color="#00D084" />
              <span className="label-text">Log ({logs.length})</span>
            </button>

            <button
              onClick={onGoToPublicSite}
              className="btn-chip"
              style={{ color: 'var(--txt-tertiary)' }}
            >
              <ExternalLink size={16} />
              <span className="label-text">Situs Publik</span>
            </button>

            <button
              onClick={onLogout}
              className="btn-chip danger"
            >
              <LogOut size={16} />
              <span className="label-text">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        {activeView === 'dashboard' && (
        <>
        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--txt-tertiary)', fontSize: '0.85rem' }}>
              <span>Total Unit Spare Part</span>
              <Package size={20} color="#00D084" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--txt-primary)', marginTop: '0.5rem' }}>
              {totalItems}{' '}
              <span style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', fontWeight: 500 }}>
                ({filteredSpareParts.length} jenis)
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#00D084', marginTop: '0.4rem' }}>📍 Filter: Site {currentSite.toUpperCase()}</div>
          </div>

          <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--txt-tertiary)', fontSize: '0.85rem' }}>
              <span>Peringatan Stok Kritis</span>
              <AlertTriangle size={20} color={lowStockCount > 0 ? '#F87171' : '#34D399'} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: lowStockCount > 0 ? '#F87171' : 'var(--txt-primary)', marginTop: '0.5rem' }}>
              {lowStockCount} <span style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', fontWeight: 500 }}>item</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: lowStockCount > 0 ? '#F87171' : 'var(--txt-muted)', marginTop: '0.4rem' }}>
              {lowStockCount > 0 ? 'Perlu tindakan pengadaan / transfer' : 'Semua stok dalam ambang aman'}
            </div>
          </div>

          <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--txt-tertiary)', fontSize: '0.85rem' }}>
              <span>Estimasi Nilai Inventaris</span>
              <DollarSign size={20} color="#00D084" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00D084', marginTop: '0.5rem' }}>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalValue)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', marginTop: '0.4rem' }}>Total nilai aset terdaftar</div>
          </div>

          <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--txt-tertiary)', fontSize: '0.85rem' }}>
              <span>Perlu Maintenance</span>
              <Wrench size={20} color={maintenanceCount > 0 ? '#F59E0B' : '#34D399'} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: maintenanceCount > 0 ? '#F59E0B' : 'var(--txt-primary)', marginTop: '0.5rem' }}>
              {maintenanceCount} <span style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', fontWeight: 500 }}>item</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', marginTop: '0.4rem' }}>Menunggu tindakan servis</div>
          </div>

          <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--txt-tertiary)', fontSize: '0.85rem' }}>
              <span>Kategori Aktif</span>
              <Layers size={20} color="#00D084" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--txt-primary)', marginTop: '0.5rem' }}>
              {activeCategoryCount} <span style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', fontWeight: 500 }}>kategori</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', marginTop: '0.4rem' }}>Jenis produk terdaftar di sistem</div>
          </div>
        </div>

        {/* Analytics */}
        <AdminAnalytics spareParts={filteredSpareParts} logs={logs} />
        </>
        )}

        {activeView === 'assets' && (
        <>
        {/* Site Selector */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--txt-muted)', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Pilih Tampilan Lokasi Site Operasional
          </div>
          <SiteSelector currentSite={currentSite} onSiteChange={setCurrentSite} siteCounts={siteCounts} />
        </div>

        {/* Search & Action Bar */}
        <div
          className="glass-panel admin-toolbar"
          style={{
            borderRadius: '20px',
            padding: '1.5rem',
          }}
        >
          <div className="admin-toolbar-fields">
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#64748B" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Cari nama, SKU, atau spesifikasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(10, 15, 29, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '0.7rem 1rem 0.7rem 2.75rem',
                  color: 'var(--txt-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                background: 'var(--bg-root)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '0.7rem 1rem',
                color: 'var(--txt-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">Semua Kategori</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setEditingItem(null);
              setIsAddEditOpen(true);
            }}
            className="btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem', justifyContent: 'center' }}
          >
            <Plus size={18} />
            Tambah Spare Part Baru
          </button>
        </div>

        {/* Table */}
        <div className="glass-panel admin-table-wrap" style={{ borderRadius: '20px', padding: '1.5rem' }}>
          <SparePartTable
            spareParts={filteredSpareParts}
            onEdit={(item) => {
              setEditingItem(item);
              setIsAddEditOpen(true);
            }}
            onTransfer={(item) => {
              setTransferringItem(item);
              setIsTransferOpen(true);
            }}
            onDelete={handleDeleteSparePart}
          />
        </div>
        </>
        )}

        {activeView === 'global-search' && (
          <GlobalSearchView spareParts={spareParts} logs={logs} onNavigate={setActiveView} />
        )}
        {activeView === 'categories' && <CategoriesView spareParts={spareParts} />}
        {activeView === 'assignments' && (
          <AssignmentsView spareParts={spareParts} logs={logs} onConfirmTransfer={handleConfirmTransfer} />
        )}
        {activeView === 'maintenance' && (
          <MaintenanceView
            spareParts={spareParts}
            onFlagMaintenance={handleFlagMaintenance}
            onResolveMaintenance={handleResolveMaintenance}
          />
        )}
        {activeView === 'audit' && <AuditView logs={logs} />}
        {activeView === 'branches' && <BranchesView spareParts={spareParts} />}
        {activeView === 'product-lines' && <ProductLinesView spareParts={spareParts} />}
        {activeView === 'team' && <TeamView logs={logs} />}
        {activeView === 'gallery' && <GalleryView />}
      </main>
        </div>
      </div>

      {/* Notifications Panel */}
      {isNotifOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 95,
            background: 'rgba(5, 8, 16, 0.6)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsNotifOpen(false); }}
        >
          <div className="notif-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--txt-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={19} color="#00D084" />
                Notifikasi
              </h3>
              <button onClick={() => setIsNotifOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--txt-tertiary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Needs attention */}
            <div className="notif-section-title">
              <AlertOctagon size={13} />
              Butuh Perhatian ({attentionItems.length})
            </div>
            {attentionItems.length === 0 ? (
              <div className="notif-empty">Semua spare part dalam kondisi baik. 🎉</div>
            ) : (
              <>
                {attentionItems.slice(0, 4).map((p) => (
                  <div key={p.id} className="notif-item">
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                      background: p.status === 'Critical' ? 'rgba(248,113,113,0.15)' : 'rgba(167,139,250,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {p.status === 'Critical' ? <AlertOctagon size={16} color="#F87171" /> : <Wrench size={16} color="#A78BFA" />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: 'var(--txt-primary)', fontWeight: 700, fontSize: '0.85rem' }}>{p.name}</div>
                      <div style={{ color: 'var(--txt-muted)', fontSize: '0.76rem' }}>
                        Site {SITE_LABEL[p.site]} &middot; {p.status}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-chip"
                  onClick={() => { setActiveView('maintenance'); setIsNotifOpen(false); }}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
                >
                  Lihat semua di Maintenance
                  <ArrowRight size={13} />
                </button>
              </>
            )}

            {/* Recent activity */}
            <div className="notif-section-title">
              <Activity size={13} />
              Aktivitas Terbaru
            </div>
            {sortedLogs.length === 0 ? (
              <div className="notif-empty">Belum ada aktivitas.</div>
            ) : (
              sortedLogs.slice(0, 8).map((l) => {
                const meta = ACTION_META[l.action];
                const Icon = meta.icon;
                const isNew = (parseLogDate(l.timestamp)?.getTime() ?? 0) > previousReadAtRef.current;
                return (
                  <div key={l.id} className={`notif-item${isNew ? ' is-new' : ''}`}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={meta.color} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: 'var(--txt-primary)', fontSize: '0.83rem', lineHeight: 1.4 }}>{l.description}</div>
                      <div style={{ color: 'var(--txt-muted)', fontSize: '0.74rem', marginTop: '0.2rem' }}>{timeAgo(l.timestamp)}</div>
                    </div>
                  </div>
                );
              })
            )}
            <button
              type="button"
              className="btn-chip"
              onClick={() => { setActiveView('audit'); setIsNotifOpen(false); }}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              Lihat Semua Log Aktivitas
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Activity Logs Drawer */}
      {isLogsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            background: 'rgba(5, 8, 16, 0.6)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsLogsOpen(false); }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '450px',
              height: '100vh',
              background: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-subtle)',
              padding: '2rem',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--txt-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="#00D084" />
                Riwayat Log Aktivitas
              </h3>
              <button onClick={() => setIsLogsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--txt-tertiary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {logs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: 'rgba(10, 15, 29, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#00D084', fontWeight: 700 }}>
                    <span>{log.action}</span>
                    <span style={{ color: 'var(--txt-muted)' }}>{log.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--txt-primary)', marginTop: '0.4rem', fontWeight: 500 }}>{log.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', marginTop: '0.5rem' }}>Oleh: {log.performedBy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEditSparePartModal
        isOpen={isAddEditOpen}
        itemToEdit={editingItem}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveSparePart}
      />

      <TransferModal
        isOpen={isTransferOpen}
        item={transferringItem}
        onClose={() => setIsTransferOpen(false)}
        onConfirmTransfer={handleConfirmTransfer}
      />
    </div>
  );
};