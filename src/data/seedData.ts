import { Beach, BeachWeather, HazardZone, Facility, SafetyAlert, IncidentReport, Review, CrowdReport } from '../types';

export const SEED_BEACHES: Beach[] = [
  {
    id: 'bondi-beach',
    name: 'Bondi Beach',
    slug: 'bondi-beach',
    city: 'Sydney',
    state: 'New South Wales',
    country: 'Australia',
    center: { lat: -33.8915, lng: 151.2767 },
    bounds: {
      north: -33.885,
      south: -33.898,
      east: 151.285,
      west: 151.268,
    },
    currentFlagStatus: 'yellow',
    safetyOverview: 'Patrolled by Bondi Surf Bathers Life Saving Club. Always swim between the red and yellow flags. Backpackers Express rip active at the southern headland.',
    lifeguardOnDuty: true,
    patrolHours: {
      opensAt: '06:00',
      closesAt: '18:30',
      timezone: 'Australia/Sydney',
    },
    contactEmergency: '+61 2 9083 8888',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    activeAlertsCount: 2,
    description: 'World-famous crescent-shaped golden sand beach with reliable surf, coastal walks, and active professional lifeguard patrols.'
  },
  {
    id: 'south-beach-miami',
    name: 'South Beach Miami',
    slug: 'south-beach-miami',
    city: 'Miami Beach',
    state: 'Florida',
    country: 'United States',
    center: { lat: 25.7826, lng: -80.1290 },
    bounds: {
      north: 25.795,
      south: 25.770,
      east: -80.120,
      west: -80.138,
    },
    currentFlagStatus: 'purple',
    safetyOverview: 'Purple flag flying due to Portuguese Man o\' War sightings. Moderate surf conditions. Ocean Rescue towers staffed daily.',
    lifeguardOnDuty: true,
    patrolHours: {
      opensAt: '09:00',
      closesAt: '17:00',
      timezone: 'America/New_York',
    },
    contactEmergency: '+1 305-673-7714',
    imageUrl: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80',
    activeAlertsCount: 1,
    description: 'Iconic wide beachfront flanked by Art Deco architecture, warm Atlantic waters, and vibrant beach life.'
  },
  {
    id: 'waikiki-beach',
    name: 'Waikiki Beach',
    slug: 'waikiki-beach',
    city: 'Honolulu',
    state: 'Hawaii',
    country: 'United States',
    center: { lat: 21.2766, lng: -157.8275 },
    bounds: {
      north: 21.285,
      south: 21.268,
      east: -157.818,
      west: -157.838,
    },
    currentFlagStatus: 'green',
    safetyOverview: 'Gentle shorebreak protected by barrier reef. Ideal for swimming and beginner surfers. Lifeguards stationed along Kuhio Beach section.',
    lifeguardOnDuty: true,
    patrolHours: {
      opensAt: '08:00',
      closesAt: '17:30',
      timezone: 'Pacific/Honolulu',
    },
    contactEmergency: '+1 808-723-7000',
    imageUrl: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=1200&q=80',
    activeAlertsCount: 0,
    description: 'Historic Hawaiian resort beach renowned for calm turquoise waters, Diamond Head views, and outrigger canoe rides.'
  }
];

export const SEED_WEATHER: Record<string, BeachWeather> = {
  'bondi-beach': {
    temperatureC: 24,
    apparentTempC: 25,
    uvIndex: 8,
    uvDescription: 'Very High',
    windSpeedKmh: 22,
    windDirectionDeg: 110,
    windGustsKmh: 31,
    waveHeightM: 1.8,
    wavePeriodSec: 11,
    waterTemperatureC: 20.5,
    tide: {
      currentStatus: 'rising',
      nextHighTide: '14:45',
      nextLowTide: '20:50',
      heightM: 1.45,
    },
    ripCurrentRiskIndex: 'moderate',
    weatherCode: 1,
    weatherDescription: 'Mainly clear with onshore ocean breeze',
    fetchedAt: new Date().toISOString(),
  },
  'south-beach-miami': {
    temperatureC: 29,
    apparentTempC: 33,
    uvIndex: 10,
    uvDescription: 'Extreme',
    windSpeedKmh: 16,
    windDirectionDeg: 80,
    windGustsKmh: 24,
    waveHeightM: 1.1,
    wavePeriodSec: 8,
    waterTemperatureC: 27.2,
    tide: {
      currentStatus: 'high',
      nextHighTide: '12:15',
      nextLowTide: '18:30',
      heightM: 0.95,
    },
    ripCurrentRiskIndex: 'low',
    weatherCode: 2,
    weatherDescription: 'Partly cloudy with humid ocean winds',
    fetchedAt: new Date().toISOString(),
  },
  'waikiki-beach': {
    temperatureC: 27,
    apparentTempC: 28,
    uvIndex: 7,
    uvDescription: 'High',
    windSpeedKmh: 12,
    windDirectionDeg: 65,
    windGustsKmh: 18,
    waveHeightM: 0.8,
    wavePeriodSec: 13,
    waterTemperatureC: 25.8,
    tide: {
      currentStatus: 'falling',
      nextHighTide: '22:10',
      nextLowTide: '16:05',
      heightM: 0.52,
    },
    ripCurrentRiskIndex: 'low',
    weatherCode: 0,
    weatherDescription: 'Sunny tropical skies, calm swell',
    fetchedAt: new Date().toISOString(),
  }
};

export const SEED_HAZARDS: HazardZone[] = [
  {
    id: 'hz-bondi-1',
    beachId: 'bondi-beach',
    type: 'rip_current',
    title: 'Backpackers Express Rip',
    description: 'Powerful permanent rip current pulling rapidly past the southern rocks towards open sea. Swimming prohibited in this zone.',
    severity: 'danger',
    geometryType: 'polygon',
    coordinates: [
      { lat: -33.8938, lng: 151.2745 },
      { lat: -33.8945, lng: 151.2760 },
      { lat: -33.8960, lng: 151.2785 },
      { lat: -33.8950, lng: 151.2735 }
    ],
    active: true,
    reportedBy: 'Bondi Lifeguard Central',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hz-bondi-2',
    beachId: 'bondi-beach',
    type: 'submerged_rocks',
    title: 'North Bondi Reef Flat',
    description: 'Submerged boulders and shallow reef exposed at low tide. Danger of impact while surfing or diving.',
    severity: 'warning',
    geometryType: 'circle',
    coordinates: [{ lat: -33.8885, lng: 151.2800 }],
    circleRadiusMeters: 75,
    active: true,
    reportedBy: 'Tower 3 Patrol',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hz-miami-1',
    beachId: 'south-beach-miami',
    type: 'jellyfish',
    title: 'Portuguese Man o\' War Swarm',
    description: 'Multiple stinger sightings along the surf line between 5th and 10th Street. High sting risk; vinegar stations active.',
    severity: 'warning',
    geometryType: 'circle',
    coordinates: [{ lat: 25.7780, lng: -80.1285 }],
    circleRadiusMeters: 180,
    active: true,
    reportedBy: 'Miami Beach Ocean Rescue',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const SEED_FACILITIES: Facility[] = [
  // Bondi Facilities
  {
    id: 'fac-bondi-1',
    beachId: 'bondi-beach',
    type: 'lifeguard_tower',
    name: 'Main Lifeguard Tower (Bondi Pavilion)',
    location: { lat: -33.8912, lng: 151.2755 },
    status: 'open',
    details: 'Primary control room, defib unit, oxygen, public emergency intercom.',
    operatingHours: '06:00 - 18:30'
  },
  {
    id: 'fac-bondi-2',
    beachId: 'bondi-beach',
    type: 'lifeguard_tower',
    name: 'Tower 2 - South Bondi',
    location: { lat: -33.8942, lng: 151.2740 },
    status: 'open',
    details: 'Monitoring the southern break and Backpackers Rip.',
    operatingHours: '08:00 - 18:00'
  },
  {
    id: 'fac-bondi-3',
    beachId: 'bondi-beach',
    type: 'first_aid',
    name: 'Bondi Surf Bathers First Aid Station',
    location: { lat: -33.8898, lng: 151.2778 },
    status: 'open',
    details: 'Stinger treatment, minor wound dressing, wheelchair triage.'
  },
  {
    id: 'fac-bondi-4',
    beachId: 'bondi-beach',
    type: 'restroom',
    name: 'Bondi Pavilion Amenities & Showers',
    location: { lat: -33.8908, lng: 151.2748 },
    status: 'open',
    details: 'Wheelchair accessible, baby change station, cold freshwater showers.'
  },
  {
    id: 'fac-bondi-5',
    beachId: 'bondi-beach',
    type: 'parking',
    name: 'Park Drive Beach Parking',
    location: { lat: -33.8918, lng: 151.2735 },
    status: 'open',
    details: 'Paid metered parking (450 bays). High congestion on weekends.'
  },
  // Miami Facilities
  {
    id: 'fac-miami-1',
    beachId: 'south-beach-miami',
    type: 'lifeguard_tower',
    name: 'Ocean Rescue Tower - 10th St',
    location: { lat: -25.7810, lng: -80.1285 },
    status: 'open',
    details: 'Classic pink-and-turquoise lifeguard tower with emergency beacon.'
  },
  {
    id: 'fac-miami-2',
    beachId: 'south-beach-miami',
    type: 'restroom',
    name: 'Lummus Park Restroom Center',
    location: { lat: 25.7795, lng: -80.1305 },
    status: 'open',
    details: 'Showers, foot wash stations, restrooms.'
  }
];

export const SEED_ALERTS: SafetyAlert[] = [
  {
    id: 'alert-bondi-1',
    beachId: 'bondi-beach',
    title: 'High Rip Current Risk Warning',
    category: 'rip_current',
    severity: 'warning',
    message: 'A 1.8m southeasterly swell is driving strong seaward rips along the entire length of the beach. Swim strictly between the flagged patrol zone.',
    effectiveFrom: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 10).toISOString(),
    isActive: true,
    issuedByUid: 'guard-bondi-lead',
    issuerName: 'Duty Officer Henderson',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'alert-bondi-2',
    beachId: 'bondi-beach',
    title: 'Extreme UV Index Alert',
    category: 'severe_weather',
    severity: 'advisory',
    message: 'UV Index predicted to hit 8+ between 11:00 and 15:30. High sunburn risk within 15 minutes. Wear SPF 50+, hat, and sunglasses.',
    effectiveFrom: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 6).toISOString(),
    isActive: true,
    issuedByUid: 'guard-bondi-lead',
    issuerName: 'Beach Authority Met Office',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'alert-miami-1',
    beachId: 'south-beach-miami',
    title: 'Portuguese Man o\' War Advisory',
    category: 'marine_life',
    severity: 'critical',
    message: 'Purple safety flags are flying. Multiple stinging jellyfish washed ashore. Avoid entering the water near 8th Street. Contact lifeguards immediately if stung.',
    effectiveFrom: new Date(Date.now() - 3600000 * 3).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 8).toISOString(),
    isActive: true,
    issuedByUid: 'guard-miami-1',
    issuerName: 'Miami Beach Ocean Rescue',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  }
];

export const SEED_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc-001',
    beachId: 'bondi-beach',
    type: 'sos_emergency',
    priority: 'critical',
    status: 'responding',
    location: {
      lat: -33.8940,
      lng: 151.2762,
      accuracyMeters: 6,
      landmarkDescription: 'Swimmer caught in south rip, approx 45m out from rocks'
    },
    description: 'Two adult swimmers pulled beyond the break into the Backpackers rip. One signaling for assistance.',
    photoUrls: [],
    reporter: {
      isAnonymous: false,
      contactName: 'David Evans (Tourist)',
      contactPhone: '+61 412 888 123'
    },
    assignedOfficerUid: 'guard-bondi-lead',
    assignedOfficerName: 'Lifeguard Mark T.',
    statusHistory: [
      {
        status: 'new',
        changedByUid: 'system',
        timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
        notes: 'SOS triggered via mobile portal.'
      },
      {
        status: 'acknowledged',
        changedByUid: 'guard-bondi-lead',
        changedByName: 'Duty Officer Henderson',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        notes: 'Dispatched rescue board and jet ski patrol.'
      },
      {
        status: 'responding',
        changedByUid: 'guard-bondi-lead',
        changedByName: 'Lifeguard Mark T.',
        timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
        notes: 'Rescue ski en route, visual contact confirmed.'
      }
    ],
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60000).toISOString(),
  },
  {
    id: 'inc-002',
    beachId: 'bondi-beach',
    type: 'hazard_sighting',
    priority: 'medium',
    status: 'new',
    location: {
      lat: -33.8895,
      lng: 151.2780,
      accuracyMeters: 10,
      landmarkDescription: 'Near rock pool steps on North Bondi side'
    },
    description: 'Broken glass and exposed sharp rusty pipe near the ramp entrance.',
    photoUrls: [],
    reporter: {
      isAnonymous: true,
      contactName: 'Anonymous Visitor'
    },
    statusHistory: [
      {
        status: 'new',
        changedByUid: 'system',
        timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
        notes: 'Reported with photo attachment.'
      }
    ],
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 60000).toISOString(),
  }
];

export const SEED_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    beachId: 'bondi-beach',
    userId: 'user-1',
    userName: 'Elena Rostova',
    rating: 5,
    cleanlinessRating: 4,
    crowdDensity: 'moderate',
    comment: 'Spectacular beach! Lifeguards are extremely vigilant and shouted over the loudspeaker to keep everyone within the flags. Great facilities at the pavilion.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    flagged: false,
    status: 'approved'
  },
  {
    id: 'rev-02',
    beachId: 'bondi-beach',
    userId: 'user-2',
    userName: 'Marcus Chen',
    rating: 4,
    cleanlinessRating: 5,
    crowdDensity: 'packed',
    comment: 'The waves were big today. Checked this safety portal before heading down and saw the yellow flag and rip warning. Very helpful to know in advance!',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    flagged: false,
    status: 'approved'
  }
];

export const SEED_CROWD_REPORTS: CrowdReport[] = [
  {
    id: 'crowd-01',
    beachId: 'bondi-beach',
    reportType: 'hazard_spotted',
    location: { lat: -33.8920, lng: 151.2760 },
    details: 'Spotted a bluebottle jellyfish washed up near the high tide watermark.',
    upvotes: 4,
    verifiedByLifeguard: true,
    createdAt: new Date(Date.now() - 10000000).toISOString()
  }
];
