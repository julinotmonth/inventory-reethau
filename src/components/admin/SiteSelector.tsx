import React from 'react';
import { MapPin, Globe } from 'lucide-react';
import type { SiteFilter } from '../../types';

interface SiteSelectorProps {
  currentSite: SiteFilter;
  onSiteChange: (site: SiteFilter) => void;
  siteCounts: {
    global: number;
    bekasi: number;
    indramayu: number;
    blora: number;
    setu: number;
  };
}

export const SiteSelector: React.FC<SiteSelectorProps> = ({ currentSite, onSiteChange, siteCounts }) => {
  const sites: { id: SiteFilter; label: string; sub: string; count: number; image: string }[] = [
    {
      id: 'global',
      label: 'Semua Site (Global)',
      sub: 'Ikhtisar Seluruh Aset',
      count: siteCounts.global,
      image: '/assets/images/gallery-6.webp',
    },
    {
      id: 'bekasi',
      label: 'Site Bekasi',
      sub: 'Mother Station & Workshop',
      count: siteCounts.bekasi,
      image: '/assets/images/cng-cylinder.webp',
    },
    {
      id: 'indramayu',
      label: 'Site Indramayu',
      sub: 'Daughter Station & Depot',
      count: siteCounts.indramayu,
      image: '/assets/images/distribution-truck.webp',
    },
    {
      id: 'blora',
      label: 'Site Blora',
      sub: 'Wellhead & Processing Plant',
      count: siteCounts.blora,
      image: '/assets/images/cng-pipe.webp',
    },
    {
      id: 'setu',
      label: 'Site Setu',
      sub: 'Compressor Station & Fleet Room',
      count: siteCounts.setu,
      image: '/assets/images/setu/setu-02.webp',
    },
  ];

  return (
    <div className="site-grid">
      {sites.map((s) => {
        const isActive = currentSite === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSiteChange(s.id)}
            className={`site-card${isActive ? ' active' : ''}`}
          >
            <div className="site-card-bg" style={{ backgroundImage: `url(${s.image})` }} />
            <div className="site-card-overlay" />
            <div className="site-card-content">
              <div>
                <div className="site-card-label">
                  {s.id === 'global' ? <Globe size={16} /> : <MapPin size={16} />}
                  {s.label}
                </div>
                <div className="site-card-sub">{s.sub}</div>
              </div>
              <span className="site-card-count">{s.count}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
