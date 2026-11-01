export type FlagStatus = 'green' | 'yellow' | 'red' | 'double_red' | 'purple';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Beach {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  country: string;
  center: LatLng;
  bounds: Bounds;
  currentFlagStatus: FlagStatus;
  safetyOverview: string;
  lifeguardOnDuty: boolean;
  patrolHours: {
    opensAt: string;
    closesAt: string;
    timezone: string;
  };
  contactEmergency: string;
  imageUrl: string;
  activeAlertsCount: number;
  description: string;
}

export interface TideInfo {
  currentStatus: 'rising' | 'falling' | 'high' | 'low';
  nextHighTide: string; // ISO string or human time
  nextLowTide: string;
  heightM: number;
}

export interface BeachWeather {
  temperatureC: number;
  apparentTempC: number;
  uvIndex: number;
  uvDescription: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  windSpeedKmh: number;
  windDirectionDeg: number;
  windGustsKmh: number;
  waveHeightM: number;
  wavePeriodSec: number;
  waterTemperatureC: number;
  tide: TideInfo;
  ripCurrentRiskIndex: 'low' | 'moderate' | 'high';
  weatherCode: number;
  weatherDescription: string;
  fetchedAt: string;
}

export type HazardType = 'rip_current' | 'jellyfish' | 'submerged_rocks' | 'restricted_swimming' | 'high_surf';
export type HazardSeverity = 'advisory' | 'warning' | 'danger';

export interface HazardZone {
  id: string;
  beachId: string;
  type: HazardType;
  title: string;
  description: string;
  severity: HazardSeverity;
  geometryType: 'polygon' | 'circle';
  coordinates: LatLng[];
  circleRadiusMeters?: number;
  active: boolean;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type FacilityType = 'lifeguard_tower' | 'first_aid' | 'restroom' | 'shower' | 'parking' | 'accessibility_mat';

export interface Facility {
  id: string;
  beachId: string;
  type: FacilityType;
  name: string;
  location: LatLng;
  status: 'open' | 'closed' | 'under_maintenance';
  details?: string;
  operatingHours?: string;
}

export type AlertSeverity = 'advisory' | 'warning' | 'critical';
export type AlertCategory = 'rip_current' | 'severe_weather' | 'beach_closure' | 'marine_life' | 'water_quality' | 'general';

export interface SafetyAlert {
  id: string;
  beachId: string;
  title: string;
  category: AlertCategory;
  severity: AlertSeverity;
  message: string;
  effectiveFrom: string;
  expiresAt: string;
  isActive: boolean;
  issuedByUid: string;
  issuerName: string;
  createdAt: string;
}

export type IncidentType = 'sos_emergency' | 'hazard_sighting' | 'missing_person' | 'first_aid_need' | 'marine_pest';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'new' | 'acknowledged' | 'responding' | 'resolved';

export interface IncidentReport {
  id: string;
  trackingId?: string;
  beachId: string;
  beachName?: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  location: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
    landmarkDescription?: string;
  };
  latitude?: number | null;
  longitude?: number | null;
  landmark?: string;
  description: string;
  photoUrls: string[];
  reporter: {
    uid?: string;
    isAnonymous: boolean;
    contactName?: string;
    contactPhone?: string;
  };
  reporterName?: string | null;
  reporterPhone?: string | null;
  anonymous?: boolean;
  assignedOfficerUid?: string;
  assignedOfficerName?: string;
  statusHistory: Array<{
    status: IncidentStatus;
    changedByUid: string;
    changedByName?: string;
    timestamp: string;
    notes?: string;
  }>;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  beachId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  cleanlinessRating: number;
  crowdDensity: 'empty' | 'moderate' | 'packed';
  comment: string;
  createdAt: string;
  flagged: boolean;
  status: 'approved' | 'hidden';
}

export interface CrowdReport {
  id: string;
  beachId: string;
  reportType: 'hazard_spotted' | 'incorrect_info' | 'jellyfish_seen' | 'overflowing_parking';
  location?: LatLng;
  details: string;
  upvotes: number;
  verifiedByLifeguard: boolean;
  createdAt: string;
}

export type UserRole = 'tourist' | 'lifeguard' | 'beach_authority_admin' | 'super_admin';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  assignedBeaches: string[];
  badgeNumber?: string;
  phoneNumber?: string;
}
