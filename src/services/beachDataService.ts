import { 
  Beach, 
  HazardZone, 
  Facility, 
  SafetyAlert, 
  IncidentReport, 
  Review, 
  CrowdReport, 
  FlagStatus, 
  IncidentStatus,
  IncidentPriority
} from '../types';
import { 
  SEED_BEACHES, 
  SEED_HAZARDS, 
  SEED_FACILITIES, 
  SEED_ALERTS, 
  SEED_INCIDENTS, 
  SEED_REVIEWS, 
  SEED_CROWD_REPORTS 
} from '../data/seedData';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc,
  addDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';

const STORAGE_KEYS = {
  BEACHES: 'bsp_beaches_data',
  HAZARDS: 'bsp_hazards_data',
  FACILITIES: 'bsp_facilities_data',
  ALERTS: 'bsp_alerts_data',
  INCIDENTS: 'bsp_incidents_data',
  REVIEWS: 'bsp_reviews_data',
  CROWD: 'bsp_crowd_data',
};

// Cross-tab real-time event channel
const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('beach_safety_portal_events')
  : null;

class BeachDataService {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.initStorage();
    if (channel) {
      channel.onmessage = (event) => {
        this.notifyListeners(event.data.key, this.getItem(event.data.key));
      };
    }
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.BEACHES)) {
      localStorage.setItem(STORAGE_KEYS.BEACHES, JSON.stringify(SEED_BEACHES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HAZARDS)) {
      localStorage.setItem(STORAGE_KEYS.HAZARDS, JSON.stringify(SEED_HAZARDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FACILITIES)) {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(SEED_FACILITIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(SEED_ALERTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INCIDENTS)) {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(SEED_INCIDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CROWD)) {
      localStorage.setItem(STORAGE_KEYS.CROWD, JSON.stringify(SEED_CROWD_REPORTS));
    }
  }

  private getItem<T>(key: string): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : ([] as unknown as T);
    } catch {
      return [] as unknown as T;
    }
  }

  private setItem<T>(key: string, data: T) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notifyListeners(key, data);
      if (channel) {
        channel.postMessage({ key });
      }
    } catch (err) {
      console.error('[Storage Error]', err);
    }
  }

  private notifyListeners(key: string, data: any) {
    const set = this.listeners.get(key);
    if (set) {
      set.forEach(callback => callback(data));
    }
  }

  private subscribe<T>(key: string, callback: (data: T) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
    // Trigger immediately with cached value
    callback(this.getItem<T>(key));

    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  // --- BEACHES ---
  getBeaches(): Beach[] {
    return this.getItem<Beach[]>(STORAGE_KEYS.BEACHES);
  }

  subscribeToBeaches(callback: (beaches: Beach[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      const q = collection(db, 'beaches');
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Beach));
        callback(list.length > 0 ? list : this.getBeaches());
      }, () => callback(this.getBeaches()));
    }
    return this.subscribe<Beach[]>(STORAGE_KEYS.BEACHES, callback);
  }

  updateBeachFlag(beachId: string, flag: FlagStatus): void {
    const beaches = this.getBeaches();
    const updated = beaches.map(b => b.id === beachId ? { ...b, currentFlagStatus: flag } : b);
    this.setItem(STORAGE_KEYS.BEACHES, updated);

    if (isFirebaseConfigured && db) {
      updateDoc(doc(db, 'beaches', beachId), { currentFlagStatus: flag }).catch(console.error);
    }
  }

  // --- HAZARDS ---
  getHazards(beachId?: string): HazardZone[] {
    const all = this.getItem<HazardZone[]>(STORAGE_KEYS.HAZARDS);
    return beachId ? all.filter(h => h.beachId === beachId && h.active) : all;
  }

  subscribeToHazards(beachId: string, callback: (hazards: HazardZone[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'hazardZones'), where('beachId', '==', beachId), where('active', '==', true));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HazardZone));
        callback(list);
      }, () => callback(this.getHazards(beachId)));
    }
    return this.subscribe<HazardZone[]>(STORAGE_KEYS.HAZARDS, (hazards) => {
      callback(hazards.filter(h => h.beachId === beachId && h.active));
    });
  }

  addHazardZone(zone: Omit<HazardZone, 'id' | 'createdAt' | 'updatedAt'>): HazardZone {
    const all = this.getItem<HazardZone[]>(STORAGE_KEYS.HAZARDS);
    const newZone: HazardZone = {
      ...zone,
      id: `hz-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.HAZARDS, [newZone, ...all]);

    if (isFirebaseConfigured && db) {
      addDoc(collection(db, 'hazardZones'), newZone).catch(console.error);
    }
    return newZone;
  }

  deleteHazardZone(id: string): void {
    const all = this.getItem<HazardZone[]>(STORAGE_KEYS.HAZARDS);
    const updated = all.filter(h => h.id !== id);
    this.setItem(STORAGE_KEYS.HAZARDS, updated);

    if (isFirebaseConfigured && db) {
      deleteDoc(doc(db, 'hazardZones', id)).catch(console.error);
    }
  }

  // --- FACILITIES ---
  getFacilities(beachId?: string): Facility[] {
    const all = this.getItem<Facility[]>(STORAGE_KEYS.FACILITIES);
    return beachId ? all.filter(f => f.beachId === beachId) : all;
  }

  subscribeToFacilities(beachId: string, callback: (facilities: Facility[]) => void): () => void {
    return this.subscribe<Facility[]>(STORAGE_KEYS.FACILITIES, (facilities) => {
      callback(facilities.filter(f => f.beachId === beachId));
    });
  }

  // --- ALERTS ---
  getAlerts(beachId?: string): SafetyAlert[] {
    const all = this.getItem<SafetyAlert[]>(STORAGE_KEYS.ALERTS);
    return beachId ? all.filter(a => a.beachId === beachId && a.isActive) : all;
  }

  subscribeToAlerts(beachId: string, callback: (alerts: SafetyAlert[]) => void): () => void {
    return this.subscribe<SafetyAlert[]>(STORAGE_KEYS.ALERTS, (alerts) => {
      callback(alerts.filter(a => a.beachId === beachId && a.isActive));
    });
  }

  createAlert(alert: Omit<SafetyAlert, 'id' | 'createdAt'>): SafetyAlert {
    const all = this.getItem<SafetyAlert[]>(STORAGE_KEYS.ALERTS);
    const newAlert: SafetyAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.setItem(STORAGE_KEYS.ALERTS, [newAlert, ...all]);
    return newAlert;
  }

  dismissAlert(id: string): void {
    const all = this.getItem<SafetyAlert[]>(STORAGE_KEYS.ALERTS);
    const updated = all.map(a => a.id === id ? { ...a, isActive: false } : a);
    this.setItem(STORAGE_KEYS.ALERTS, updated);
  }

  // --- INCIDENTS & SOS ---
  getIncidents(beachId?: string): IncidentReport[] {
    const all = this.getItem<IncidentReport[]>(STORAGE_KEYS.INCIDENTS);
    return beachId ? all.filter(i => i.beachId === beachId) : all;
  }

  private mapDocToIncident(docId: string, data: any): IncidentReport {
    let createdAtIso = new Date().toISOString();
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      createdAtIso = data.createdAt.toDate().toISOString();
    } else if (data.createdAtIso) {
      createdAtIso = data.createdAtIso;
    } else if (typeof data.createdAt === 'string') {
      createdAtIso = data.createdAt;
    }

    let updatedAtIso = createdAtIso;
    if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
      updatedAtIso = data.updatedAt.toDate().toISOString();
    } else if (data.updatedAtIso) {
      updatedAtIso = data.updatedAtIso;
    } else if (typeof data.updatedAt === 'string') {
      updatedAtIso = data.updatedAt;
    }

    const lat = data.location?.lat ?? data.latitude ?? 0;
    const lng = data.location?.lng ?? data.longitude ?? 0;
    const landmark = data.location?.landmarkDescription ?? data.landmark ?? '';

    const isAnon = Boolean(data.reporter?.isAnonymous ?? data.anonymous ?? false);
    const contactName = data.reporter?.contactName ?? data.reporterName ?? (isAnon ? 'Anonymous' : 'Beach Visitor');
    const contactPhone = data.reporter?.contactPhone ?? data.reporterPhone ?? '';

    return {
      id: data.trackingId || data.id || docId,
      trackingId: data.trackingId || data.id || docId,
      beachId: data.beachId || '',
      beachName: data.beachName || '',
      type: data.type || 'sos_emergency',
      priority: data.priority || (data.type === 'sos_emergency' ? 'critical' : 'high'),
      status: data.status || 'new',
      location: {
        lat,
        lng,
        accuracyMeters: data.location?.accuracyMeters ?? 10,
        landmarkDescription: landmark
      },
      latitude: lat,
      longitude: lng,
      landmark,
      description: data.description || '',
      photoUrls: Array.isArray(data.photoUrls) ? data.photoUrls : [],
      reporter: {
        uid: data.reporter?.uid || 'tourist-guest',
        isAnonymous: isAnon,
        contactName,
        contactPhone: contactPhone || undefined
      },
      reporterName: contactName,
      reporterPhone: contactPhone || null,
      anonymous: isAnon,
      assignedOfficerUid: data.assignedOfficerUid,
      assignedOfficerName: data.assignedOfficerName,
      statusHistory: Array.isArray(data.statusHistory) && data.statusHistory.length > 0 ? data.statusHistory : [
        {
          status: data.status || 'new',
          changedByUid: data.reporter?.uid || 'tourist-guest',
          changedByName: contactName,
          timestamp: createdAtIso,
          notes: 'Report submitted by beachgoer'
        }
      ],
      resolutionNotes: data.resolutionNotes || '',
      createdAt: createdAtIso,
      updatedAt: updatedAtIso
    };
  }

  subscribeToIncidents(beachId: string, callback: (incidents: IncidentReport[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const incidentsCol = collection(db, 'incidents');
        const unsubscribe = onSnapshot(
          incidentsCol,
          (snapshot) => {
            const firestoreIncidents: IncidentReport[] = snapshot.docs.map((docSnap) => {
              return this.mapDocToIncident(docSnap.id, docSnap.data());
            });

            // Filter by beachId if specified
            const matchingIncidents = beachId
              ? firestoreIncidents.filter((i) => i.beachId === beachId)
              : firestoreIncidents;

            // Merge demo seed incidents without duplicating IDs
            const firestoreIds = new Set(matchingIncidents.map((i) => i.id));
            const seedItems = SEED_INCIDENTS.filter(
              (i) => (!beachId || i.beachId === beachId) && !firestoreIds.has(i.id)
            );

            const combined = [...matchingIncidents, ...seedItems];
            // Sort by newest first
            combined.sort((a, b) => {
              const timeA = new Date(a.createdAt).getTime() || 0;
              const timeB = new Date(b.createdAt).getTime() || 0;
              return timeB - timeA;
            });

            this.setItem(STORAGE_KEYS.INCIDENTS, combined);
            callback(combined);
          },
          (error) => {
            console.error('[Firestore] onSnapshot error on incidents collection:', error);
            const local = this.getIncidents(beachId);
            callback(local);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error('[Firestore] Failed to attach onSnapshot to incidents:', err);
      }
    }

    return this.subscribe<IncidentReport[]>(STORAGE_KEYS.INCIDENTS, (incidents) => {
      callback(incidents.filter((i) => !beachId || i.beachId === beachId));
    });
  }

  async submitIncident(
    report: Omit<IncidentReport, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'statusHistory'> & {
      beachName?: string;
    }
  ): Promise<IncidentReport> {
    const trackingId = `inc-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const priority: IncidentPriority = report.priority || (report.type === 'sos_emergency' ? 'critical' : 'high');
    const isAnonymous = Boolean(report.reporter?.isAnonymous);
    const reporterName = isAnonymous ? 'Anonymous' : (report.reporter?.contactName || 'Beach Visitor');
    const reporterPhone = isAnonymous ? null : (report.reporter?.contactPhone || null);

    const lat = report.location?.lat ?? null;
    const lng = report.location?.lng ?? null;
    const landmark = report.location?.landmarkDescription || '';

    // Safe photo URLs to avoid exceeding Firestore's 1MB document limit
    const safePhotoUrls = (report.photoUrls || []).filter(
      (url) => typeof url === 'string' && url.length < 300000
    );

    const newIncident: IncidentReport = {
      id: trackingId,
      trackingId,
      beachId: report.beachId,
      beachName: report.beachName || report.beachId,
      type: report.type,
      priority,
      status: 'new',
      location: {
        lat: lat ?? 0,
        lng: lng ?? 0,
        accuracyMeters: report.location?.accuracyMeters ?? 10,
        landmarkDescription: landmark
      },
      latitude: lat,
      longitude: lng,
      landmark,
      description: report.description,
      photoUrls: report.photoUrls || [],
      reporter: {
        uid: report.reporter?.uid || 'tourist-guest',
        isAnonymous,
        contactName: reporterName,
        contactPhone: reporterPhone || undefined
      },
      reporterName,
      reporterPhone,
      anonymous: isAnonymous,
      statusHistory: [
        {
          status: 'new',
          changedByUid: report.reporter?.uid || 'tourist-guest',
          changedByName: reporterName,
          timestamp: nowIso,
          notes: 'Report submitted by beachgoer'
        }
      ],
      resolutionNotes: '',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // If Firebase Firestore is configured, persist directly to Cloud Firestore
    if (isFirebaseConfigured && db) {
      try {
        const firestoreDoc = {
          trackingId,
          id: trackingId,
          type: report.type,
          beachId: report.beachId,
          beachName: report.beachName || report.beachId,
          description: report.description,
          latitude: lat,
          longitude: lng,
          landmark,
          reporterName,
          reporterPhone,
          anonymous: isAnonymous,
          status: 'new',
          priority,
          location: newIncident.location,
          photoUrls: safePhotoUrls,
          reporter: {
            uid: report.reporter?.uid || 'tourist-guest',
            isAnonymous,
            contactName: reporterName,
            contactPhone: reporterPhone
          },
          statusHistory: newIncident.statusHistory,
          resolutionNotes: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdAtIso: nowIso,
          updatedAtIso: nowIso
        };

        const docRef = doc(db, 'incidents', trackingId);
        await setDoc(docRef, firestoreDoc);
        console.info('[Firestore] Persisted incident report to Firestore:', trackingId);
      } catch (err: any) {
        console.error('[Firestore] Failed to write incident to Firestore:', err);
        throw new Error(
          err?.message || 'Database write error. Could not transmit incident to Firestore.'
        );
      }
    } else {
      console.warn('[BeachDataService] Firestore not configured. Operating in local mode.');
    }

    // Update local cache
    const all = this.getItem<IncidentReport[]>(STORAGE_KEYS.INCIDENTS);
    this.setItem(STORAGE_KEYS.INCIDENTS, [newIncident, ...all.filter((i) => i.id !== trackingId)]);

    return newIncident;
  }

  async updateIncidentStatus(
    incidentId: string, 
    newStatus: IncidentStatus, 
    officer: { uid: string; name: string },
    notes?: string
  ): Promise<void> {
    const nowIso = new Date().toISOString();

    // 1. Update Firestore if configured
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'incidents', incidentId);
        await setDoc(
          docRef,
          {
            status: newStatus,
            assignedOfficerUid: officer.uid,
            assignedOfficerName: officer.name,
            resolutionNotes: notes || '',
            updatedAt: serverTimestamp(),
            updatedAtIso: nowIso,
            statusHistory: arrayUnion({
              status: newStatus,
              changedByUid: officer.uid,
              changedByName: officer.name,
              timestamp: nowIso,
              notes: notes || `Status updated to ${newStatus}`
            })
          },
          { merge: true }
        );
        console.info(`[Firestore] Incident ${incidentId} updated to status "${newStatus}"`);
      } catch (err) {
        console.error('[Firestore] Failed to update incident status:', err);
      }
    }

    // 2. Update local storage cache
    const all = this.getItem<IncidentReport[]>(STORAGE_KEYS.INCIDENTS);
    const updated = all.map((inc) => {
      if (inc.id !== incidentId) return inc;
      return {
        ...inc,
        status: newStatus,
        assignedOfficerUid: officer.uid,
        assignedOfficerName: officer.name,
        resolutionNotes: newStatus === 'resolved' ? (notes || inc.resolutionNotes) : inc.resolutionNotes,
        updatedAt: nowIso,
        statusHistory: [
          ...(inc.statusHistory || []),
          {
            status: newStatus,
            changedByUid: officer.uid,
            changedByName: officer.name,
            timestamp: nowIso,
            notes
          }
        ]
      };
    });

    this.setItem(STORAGE_KEYS.INCIDENTS, updated);
  }

  // --- REVIEWS ---
  getReviews(beachId: string): Review[] {
    const all = this.getItem<Review[]>(STORAGE_KEYS.REVIEWS);
    return all.filter(r => r.beachId === beachId && r.status === 'approved');
  }

  subscribeToReviews(beachId: string, callback: (reviews: Review[]) => void): () => void {
    return this.subscribe<Review[]>(STORAGE_KEYS.REVIEWS, (reviews) => {
      callback(reviews.filter(r => r.beachId === beachId && r.status === 'approved'));
    });
  }

  submitReview(review: Omit<Review, 'id' | 'createdAt' | 'flagged' | 'status'>): Review {
    const all = this.getItem<Review[]>(STORAGE_KEYS.REVIEWS);
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      flagged: false,
      status: 'approved'
    };
    this.setItem(STORAGE_KEYS.REVIEWS, [newRev, ...all]);
    return newRev;
  }

  // --- CROWD REPORTS ---
  getCrowdReports(beachId: string): CrowdReport[] {
    const all = this.getItem<CrowdReport[]>(STORAGE_KEYS.CROWD);
    return all.filter(c => c.beachId === beachId);
  }

  subscribeToCrowdReports(beachId: string, callback: (reports: CrowdReport[]) => void): () => void {
    return this.subscribe<CrowdReport[]>(STORAGE_KEYS.CROWD, (reports) => {
      callback(reports.filter(c => c.beachId === beachId));
    });
  }

  submitCrowdReport(report: Omit<CrowdReport, 'id' | 'upvotes' | 'verifiedByLifeguard' | 'createdAt'>): CrowdReport {
    const all = this.getItem<CrowdReport[]>(STORAGE_KEYS.CROWD);
    const newCrowd: CrowdReport = {
      ...report,
      id: `crowd-${Date.now()}`,
      upvotes: 1,
      verifiedByLifeguard: false,
      createdAt: new Date().toISOString()
    };
    this.setItem(STORAGE_KEYS.CROWD, [newCrowd, ...all]);
    return newCrowd;
  }
}

export const beachDataService = new BeachDataService();
