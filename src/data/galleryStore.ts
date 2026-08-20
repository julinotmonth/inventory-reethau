import React from 'react';
import type { GalleryItem, SiteLocation } from '../types';

// Seed data — the original Site Setu documentation photos, now tagged with
// a site so the gallery can be filtered/grouped instead of being hardcoded
// to a single location.
export const DEFAULT_GALLERY: GalleryItem[] = [
  { id: 'gal-setu-01', site: 'setu', src: '/assets/images/setu/setu-01.webp', caption: 'Sambungan & Fitting Perpipaan Gas', createdAt: '2026-01-01' },
  { id: 'gal-setu-02', site: 'setu', src: '/assets/images/setu/setu-02.webp', caption: 'Jalur Distribusi Pipa Compressor Station', createdAt: '2026-01-01' },
  { id: 'gal-setu-03', site: 'setu', src: '/assets/images/setu/setu-03.webp', caption: 'Unit Meter Turbin Gas', createdAt: '2026-01-01' },
  { id: 'gal-setu-04', site: 'setu', src: '/assets/images/setu/setu-04.webp', caption: 'Panel Kontrol Elektrikal Site', createdAt: '2026-01-01' },
  { id: 'gal-setu-05', site: 'setu', src: '/assets/images/setu/setu-05.webp', caption: 'Regulator & Valve Tekanan Tinggi', createdAt: '2026-01-01' },
  { id: 'gal-setu-06', site: 'setu', src: '/assets/images/setu/setu-06.webp', caption: 'Rangkaian Skid Instrumentasi', createdAt: '2026-01-01' },
  { id: 'gal-setu-07', site: 'setu', src: '/assets/images/setu/setu-07.webp', caption: 'Plat Spesifikasi Peralatan', createdAt: '2026-01-01' },
  { id: 'gal-setu-08', site: 'setu', src: '/assets/images/setu/setu-08.webp', caption: 'Area Skid Compressor Terbungkus', createdAt: '2026-01-01' },
  { id: 'gal-setu-09', site: 'setu', src: '/assets/images/setu/setu-09.webp', caption: 'Gardu & Jaringan Listrik Site', createdAt: '2026-01-01' },
  { id: 'gal-setu-10', site: 'setu', src: '/assets/images/setu/setu-10.webp', caption: 'Panel Distribusi Daya Site Setu', createdAt: '2026-01-01' },
  { id: 'gal-setu-11', site: 'setu', src: '/assets/images/setu/setu-11.webp', caption: 'APAR & Perlengkapan Keselamatan', createdAt: '2026-01-01' },
  { id: 'gal-setu-12', site: 'setu', src: '/assets/images/setu/setu-12.webp', caption: 'Instalasi Skid & Rak Peralatan', createdAt: '2026-01-01' },
  { id: 'gal-setu-13', site: 'setu', src: '/assets/images/setu/setu-13.webp', caption: 'Unit AC Ruang Fleet', createdAt: '2026-01-01' },
  { id: 'gal-setu-14', site: 'setu', src: '/assets/images/setu/setu-14.webp', caption: 'Unit AC Ruang Fleet (Tampak Lain)', createdAt: '2026-01-01' },
  { id: 'gal-setu-15', site: 'setu', src: '/assets/images/setu/setu-15.webp', caption: 'Label Barcode Aset Terdaftar', createdAt: '2026-01-01' },
  { id: 'gal-setu-16', site: 'setu', src: '/assets/images/setu/setu-16.webp', caption: 'Label Barcode Aset pada Furnitur Site', createdAt: '2026-01-01' },
];

const STORAGE_KEY = 'reethau_custom_gallery';
const EVENT_NAME = 'reethau:gallery-changed';

const readCustom = (): GalleryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCustom = (items: GalleryItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Gagal menyimpan galeri ke penyimpanan lokal:', err);
    throw new Error('Gagal menyimpan foto — kemungkinan penyimpanan browser penuh. Coba gunakan foto berukuran lebih kecil.');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
};

/** All gallery photos across every site (defaults + user-uploaded). */
export const getGallery = (): GalleryItem[] => [...DEFAULT_GALLERY, ...readCustom()];

export const getGalleryBySite = (site: SiteLocation): GalleryItem[] => getGallery().filter((g) => g.site === site);

export const isDefaultGalleryItem = (id: string): boolean => DEFAULT_GALLERY.some((g) => g.id === id);

export const addGalleryItem = (input: { site: SiteLocation; src: string; caption: string; description?: string; uploadedBy?: string }): GalleryItem => {
  const newItem: GalleryItem = {
    id: `gal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    site: input.site,
    src: input.src,
    caption: input.caption.trim(),
    description: input.description?.trim() || undefined,
    uploadedBy: input.uploadedBy,
    createdAt: new Date().toISOString().split('T')[0],
  };
  writeCustom([...readCustom(), newItem]);
  return newItem;
};

export const deleteGalleryItem = (id: string): void => {
  writeCustom(readCustom().filter((g) => g.id !== id));
};

/** Re-renders the calling component whenever the gallery changes anywhere
 * in the app (upload/delete) — same live-refresh pattern as useSitesRefresh. */
export function useGalleryRefresh(): number {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);
  return tick;
}