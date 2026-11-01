import L from 'leaflet';
import { HazardType, HazardSeverity, FacilityType, IncidentPriority, IncidentStatus } from '../../types';

// Helper for rendering SVG string directly into L.divIcon html
export function createHazardIcon(type: HazardType, severity: HazardSeverity): L.DivIcon {
  let bgColor = '#ef4444'; // red (danger)
  let ringColor = 'rgba(239, 68, 68, 0.4)';
  let borderColor = '#b91c1c';
  let iconSvg = '';

  if (severity === 'warning') {
    bgColor = '#f97316'; // orange
    ringColor = 'rgba(249, 115, 22, 0.4)';
    borderColor = '#c2410c';
  } else if (severity === 'advisory') {
    bgColor = '#eab308'; // yellow
    ringColor = 'rgba(234, 179, 8, 0.4)';
    borderColor = '#a16207';
  }

  // Choose icon SVG shape based on hazard type
  switch (type) {
    case 'rip_current':
      // Swirling arrows / waves
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 5-3"></path>
          <path d="M2 17c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 5-3"></path>
          <path d="M12 3v10"></path>
          <path d="m8 7 4-4 4 4"></path>
        </svg>`;
      break;
    case 'jellyfish':
      bgColor = '#9333ea'; // purple
      ringColor = 'rgba(147, 51, 234, 0.4)';
      borderColor = '#7e22ce';
      // Jellyfish tentacles
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2a8 8 0 0 0-8-8z"></path>
          <path d="M8 14v6"></path>
          <path d="M12 14v7"></path>
          <path d="M16 14v6"></path>
        </svg>`;
      break;
    case 'submerged_rocks':
      // Jagged rocks / warning triangle
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>`;
      break;
    case 'restricted_swimming':
      // Circle slash (prohibited)
      bgColor = '#dc2626';
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
        </svg>`;
      break;
    case 'high_surf':
    default:
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 14c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 5-3"></path>
          <path d="M2 18c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 5-3"></path>
        </svg>`;
      break;
  }

  const isDanger = severity === 'danger';
  const pulseHtml = isDanger
    ? `<div style="position: absolute; inset: -6px; border-radius: 9999px; background-color: ${ringColor}; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
    : '';

  return L.divIcon({
    className: 'custom-map-icon hazard-icon',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        ${pulseHtml}
        <div style="
          position: relative;
          width: 34px;
          height: 34px;
          background: ${bgColor};
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        ">
          ${iconSvg}
        </div>
        <div style="
          position: absolute;
          bottom: -4px;
          right: -2px;
          background: ${borderColor};
          color: white;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 1px 4px;
          border-radius: 4px;
          border: 1px solid white;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">${severity.slice(0, 4)}</div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
}

// Lifeguard station icon
export function createLifeguardIcon(isOpen: boolean = true): L.DivIcon {
  const bgColor = isOpen ? '#059669' : '#64748b'; // emerald or slate
  const ringColor = isOpen ? 'rgba(16, 185, 129, 0.4)' : 'transparent';

  return L.divIcon({
    className: 'custom-map-icon lifeguard-icon',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        ${isOpen ? `<div style="position: absolute; inset: -4px; border-radius: 9999px; background: ${ringColor}; animation: pulse 2s infinite;"></div>` : ''}
        <div style="
          position: relative;
          width: 34px;
          height: 34px;
          background: ${bgColor};
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Lifeguard Tower / Shield Icon -->
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M12 8v8"></path>
            <path d="M8 12h8"></path>
          </svg>
        </div>
        <div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: ${isOpen ? '#22c55e' : '#94a3b8'};
          border: 2px solid white;
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
}

// Facility icons
export function createFacilityIcon(type: FacilityType): L.DivIcon {
  let bgColor = '#0284c7'; // ocean blue
  let iconSvg = '';

  switch (type) {
    case 'first_aid':
      bgColor = '#e11d48'; // rose
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 6v12"></path>
          <path d="M6 12h12"></path>
        </svg>`;
      break;
    case 'parking':
      bgColor = '#4f46e5'; // indigo
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="18" rx="4"></rect>
          <path d="M9 17V7h4a3 3 0 0 1 0 6H9"></path>
        </svg>`;
      break;
    case 'restroom':
      bgColor = '#0284c7'; // ocean-600
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="7" r="3"></circle>
          <path d="M9 13v7a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-7"></path>
          <path d="M6 13a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3"></path>
        </svg>`;
      break;
    case 'shower':
      bgColor = '#0891b2'; // cyan
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4v7a4 4 0 0 0 8 0V4"></path>
          <line x1="12" y1="4" x2="20" y2="4"></line>
          <line x1="8" y1="17" x2="8.01" y2="17"></line>
          <line x1="6" y1="20" x2="6.01" y2="20"></line>
          <line x1="10" y1="20" x2="10.01" y2="20"></line>
        </svg>`;
      break;
    case 'accessibility_mat':
      bgColor = '#7c3aed'; // violet
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="4" r="2"></circle>
          <path d="m5 9 7 3 7-3"></path>
          <path d="M12 12v9"></path>
        </svg>`;
      break;
    default:
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>`;
      break;
  }

  return L.divIcon({
    className: 'custom-map-icon facility-icon',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="
          width: 30px;
          height: 30px;
          background: ${bgColor};
          border: 2px solid #ffffff;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.22);
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
}

// Active SOS / Incident icon
export function createIncidentIcon(priority: IncidentPriority, status: IncidentStatus): L.DivIcon {
  const isCritical = priority === 'critical' || priority === 'high';
  const isResponding = status === 'responding';
  const bgColor = isCritical ? '#be123c' : '#d97706';

  return L.divIcon({
    className: 'custom-map-icon incident-icon',
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="position: absolute; inset: -8px; border-radius: 9999px; background: rgba(225, 29, 72, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          background: ${bgColor};
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 14px rgba(190, 18, 60, 0.5);
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Siren / Alert Bell Icon -->
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div style="
          position: absolute;
          bottom: -4px;
          background: #1e293b;
          color: white;
          font-size: 7.5px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 1px 3px;
          border-radius: 3px;
          border: 1px solid white;
          letter-spacing: 0.3px;
        ">${isResponding ? 'EN ROUTE' : 'ACTIVE'}</div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22]
  });
}

// User GPS Position icon
export function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-map-icon user-location-icon',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          inset: -6px;
          border-radius: 9999px;
          background: rgba(37, 99, 235, 0.3);
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          width: 22px;
          height: 22px;
          background: #2563eb;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.6);
          border-radius: 9999px;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  });
}
