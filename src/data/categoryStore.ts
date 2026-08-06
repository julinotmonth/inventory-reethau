import { Gauge, Cylinder, SlidersHorizontal, GitBranch, Radar, Filter, Package, Flame, Droplet, Leaf } from 'lucide-react';
import type { ElementType } from 'react';

// ---- Default category catalogs -------------------------------------------------

export const DEFAULT_SPARE_PART_CATEGORIES: string[] = [
  'Compressors',
  'Cylinders & Storage',
  'Valves & Control',
  'Piping & Connectors',
  'Instruments & Sensors',
  'Filtration & Purification',
];

export const DEFAULT_PRODUCT_ENERGY_CATEGORIES: string[] = ['CNG', 'LNG', 'Biomass'];

export const CATEGORY_VISUAL: Record<string, { icon: ElementType; color: string; bg: string }> = {
  'Compressors': { icon: Gauge, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' },
  'Cylinders & Storage': { icon: Cylinder, color: '#F472B6', bg: 'rgba(244, 114, 182, 0.12)' },
  'Valves & Control': { icon: SlidersHorizontal, color: '#00D084', bg: 'rgba(0, 208, 132, 0.12)' },
  'Piping & Connectors': { icon: GitBranch, color: '#A3E635', bg: 'rgba(163, 230, 53, 0.12)' },
  'Instruments & Sensors': { icon: Radar, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  'Filtration & Purification': { icon: Filter, color: '#818CF8', bg: 'rgba(129, 140, 248, 0.12)' },
};

export const PRODUCT_ENERGY_VISUAL: Record<string, { icon: ElementType; color: string; bg: string }> = {
  'CNG': { icon: Flame, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' },
  'LNG': { icon: Droplet, color: '#818CF8', bg: 'rgba(129, 140, 248, 0.12)' },
  'Biomass': { icon: Leaf, color: '#A3E635', bg: 'rgba(163, 230, 53, 0.12)' },
};

const FALLBACK_VISUAL = { icon: Package, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)' };

/** Safe lookup that always returns a visual, even for user-added categories. */
export const getCategoryVisual = (name: string) => CATEGORY_VISUAL[name] ?? FALLBACK_VISUAL;
export const getProductEnergyVisual = (name: string) => PRODUCT_ENERGY_VISUAL[name] ?? FALLBACK_VISUAL;

// ---- Custom category persistence (per browser, via localStorage) --------------

const STORAGE_KEYS = {
  sparePart: 'reethau_custom_spare_part_categories',
  productEnergy: 'reethau_custom_product_energy_categories',
} as const;

type CategoryKind = keyof typeof STORAGE_KEYS;

const readCustom = (kind: CategoryKind): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[kind]);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
};

const writeCustom = (kind: CategoryKind, categories: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS[kind], JSON.stringify(categories));
  } catch {
    // localStorage unavailable (e.g. private mode) — fail silently, category still works for this session
  }
};

/** Returns default + previously-added custom categories, de-duplicated. */
export const getSparePartCategories = (): string[] => {
  const merged = [...DEFAULT_SPARE_PART_CATEGORIES, ...readCustom('sparePart')];
  return Array.from(new Set(merged));
};

export const getProductEnergyCategories = (): string[] => {
  const merged = [...DEFAULT_PRODUCT_ENERGY_CATEGORIES, ...readCustom('productEnergy')];
  return Array.from(new Set(merged));
};

/** Adds a new spare part category and persists it for future sessions. */
export const addSparePartCategory = (name: string): void => {
  const trimmed = name.trim();
  if (!trimmed) return;
  const existing = readCustom('sparePart');
  if (getSparePartCategories().some((c) => c.toLowerCase() === trimmed.toLowerCase())) return;
  writeCustom('sparePart', [...existing, trimmed]);
};

/** Adds a new product energy category and persists it for future sessions. */
export const addProductEnergyCategory = (name: string): void => {
  const trimmed = name.trim();
  if (!trimmed) return;
  const existing = readCustom('productEnergy');
  if (getProductEnergyCategories().some((c) => c.toLowerCase() === trimmed.toLowerCase())) return;
  writeCustom('productEnergy', [...existing, trimmed]);
};