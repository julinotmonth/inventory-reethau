import { Gauge, Cylinder, SlidersHorizontal, GitBranch, Radar, Filter } from 'lucide-react';
import type { ElementType } from 'react';
import type { SparePartCategory } from '../types';

export const CATEGORY_VISUAL: Record<SparePartCategory, { icon: ElementType; color: string; bg: string }> = {
  'Compressors': { icon: Gauge, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' },
  'Cylinders & Storage': { icon: Cylinder, color: '#F472B6', bg: 'rgba(244, 114, 182, 0.12)' },
  'Valves & Control': { icon: SlidersHorizontal, color: '#00D084', bg: 'rgba(0, 208, 132, 0.12)' },
  'Piping & Connectors': { icon: GitBranch, color: '#A3E635', bg: 'rgba(163, 230, 53, 0.12)' },
  'Instruments & Sensors': { icon: Radar, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  'Filtration & Purification': { icon: Filter, color: '#818CF8', bg: 'rgba(129, 140, 248, 0.12)' },
};