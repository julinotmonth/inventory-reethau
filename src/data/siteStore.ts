import React from 'react';

export interface SiteMeta {
  key: string;
  label: string;
  subtitle: string;
  color: string;
  imageUrl: string;
  createdAt: string;
}

// A small rotating palette so a newly-added site gets a sensible accent
// color automatically, without the user having to pick one.
const ACCENT_PALETTE = ['#00D084', '#60A5FA', '#FBBF24', '#C084FC', '#F472B6', '#38BDF8', '#A3E635', '#F87171'];

// A few generic facility photos to rotate through for new sites that don't
// have a dedicated photo yet — same imagery already used elsewhere in the app.
const FALLBACK_IMAGES = [
  '/assets/images/cng-cylinder.webp',
  '/assets/images/cng-pipe.webp',
  '/assets/images/distribution-truck.webp',
  '/assets/images/lng-storage.webp',
  '/assets/images/biomass.webp',
];

export const DEFAULT_SITES: SiteMeta[] = [
  { key: 'bekasi', label: 'Bekasi', subtitle: 'Mother Station & Workshop', color: '#00D084', imageUrl: '/assets/images/cng-cylinder.webp', createdAt: '2026-01-01' },
  { key: 'indramayu', label: 'Indramayu', subtitle: 'Daughter Station & Depot', color: '#60A5FA', imageUrl: '/assets/images/distribution-truck.webp', createdAt: '2026-01-01' },
  { key: 'blora', label: 'Blora', subtitle: 'Wellhead & Processing Plant', color: '#FBBF24', imageUrl: '/assets/images/cng-pipe.webp', createdAt: '2026-01-01' },
  { key: 'setu', label: 'Setu', subtitle: 'Compressor Station & Fleet Room', color: '#C084FC', imageUrl: '/assets/images/setu/setu-02.webp', createdAt: '2026-01-01' },
];

const FALLBACK_META = (key: string): SiteMeta => ({
  key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
  subtitle: 'Site Operasional',
  color: '#94A3B8',
  imageUrl: FALLBACK_IMAGES[0],
  createdAt: '',
});

const STORAGE_KEY = 'reethau_custom_sites';

const readCustom = (): SiteMeta[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCustom = (sites: SiteMeta[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
  } catch (err) {
    // Surface storage failures (e.g. quota exceeded from a large uploaded
    // photo) instead of failing silently — a "successful" add that never
    // actually persisted is a confusing, hard-to-diagnose bug otherwise.
    console.error('Gagal menyimpan data site ke penyimpanan lokal:', err);
    throw new Error('Gagal menyimpan site — kemungkinan penyimpanan browser penuh. Coba gunakan foto site berukuran lebih kecil.');
  }
  // Notify every mounted component that reads the site list (SiteSelector,
  // dropdowns, filters, etc.) to refresh — regardless of whether it happens
  // to remount naturally from navigation, so nothing ever shows stale data.
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('reethau:sites-changed'));
  }
};

const slugify = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `site-${Date.now()}`;

/** Returns default + previously-added sites, defaults first. */
export const getSites = (): SiteMeta[] => {
  const custom = readCustom();
  const customKeys = new Set(custom.map((s) => s.key));
  return [...DEFAULT_SITES.filter((s) => !customKeys.has(s.key)), ...custom];
};

/** Safe lookup that always returns something displayable, even for an unknown/removed site key. */
export const getSiteMeta = (key: string): SiteMeta => getSites().find((s) => s.key === key) ?? FALLBACK_META(key);

export const isKnownSite = (key: string): boolean => getSites().some((s) => s.key === key);

/** Adds a new operational site and persists it for future sessions. Returns the created record. */
export const addSite = (input: { label: string; subtitle?: string; color?: string; imageUrl?: string }): SiteMeta => {
  const label = input.label.trim();
  const key = slugify(label);
  const existing = getSites();
  const index = existing.length % ACCENT_PALETTE.length;
  const newSite: SiteMeta = {
    key: existing.some((s) => s.key === key) ? `${key}-${Date.now().toString(36)}` : key,
    label,
    subtitle: input.subtitle?.trim() || 'Site Operasional',
    color: input.color || ACCENT_PALETTE[index],
    imageUrl: input.imageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    createdAt: new Date().toISOString().split('T')[0],
  };
  const custom = readCustom();
  writeCustom([...custom, newSite]);
  return newSite;
};

export const updateSite = (key: string, patch: Partial<Omit<SiteMeta, 'key' | 'createdAt'>>): void => {
  const custom = readCustom();
  if (custom.some((s) => s.key === key)) {
    writeCustom(custom.map((s) => (s.key === key ? { ...s, ...patch } : s)));
    return;
  }
  // Editing a built-in default site for the first time — "promote" it into
  // the custom list so the change persists.
  const base = DEFAULT_SITES.find((s) => s.key === key);
  if (base) writeCustom([...custom, { ...base, ...patch }]);
};

/** Only custom (non-default) sites can be removed, to keep the seed data stable. */
export const deleteSite = (key: string): void => {
  const custom = readCustom();
  writeCustom(custom.filter((s) => s.key !== key));
};

export const isDefaultSite = (key: string): boolean => DEFAULT_SITES.some((s) => s.key === key);

/** Proxy-backed Record<string, string> so existing `SITE_LABEL[key]`-style
 * lookups (incl. Object.keys(), `in`, spreads) keep working unchanged, while
 * the underlying data stays fully dynamic (reads the live site list on every
 * access instead of a frozen snapshot). */
function createSiteRecordProxy(pick: (meta: SiteMeta) => string): Record<string, string> {
  return new Proxy({} as Record<string, string>, {
    get(_target, prop) {
      if (typeof prop !== 'string') return undefined;
      return pick(getSiteMeta(prop));
    },
    has(_target, prop) {
      return typeof prop === 'string' && isKnownSite(prop);
    },
    ownKeys() {
      return getSites().map((s) => s.key);
    },
    getOwnPropertyDescriptor(_target, prop) {
      if (typeof prop === 'string' && isKnownSite(prop)) {
        return { enumerable: true, configurable: true, value: pick(getSiteMeta(prop)) };
      }
      return undefined;
    },
  });
}

export const SITE_LABEL = createSiteRecordProxy((m) => m.label);
export const SITE_SUB = createSiteRecordProxy((m) => m.subtitle);
export const SITE_IMAGE = createSiteRecordProxy((m) => m.imageUrl);
export const SITE_COLOR = createSiteRecordProxy((m) => m.color);

/** Forces the calling component to re-render whenever the site list changes
 * anywhere in the app (add/edit/delete) — even if this component wasn't the
 * one that made the change and isn't freshly (re)mounted after it. Combine
 * with a fresh `getSites()` call in the render body to always show current data. */
export function useSitesRefresh(): number {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener('reethau:sites-changed', handler);
    return () => window.removeEventListener('reethau:sites-changed', handler);
  }, []);
  return tick;
}