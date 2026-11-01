import { create } from 'zustand';
import { Beach, BeachWeather, AppUser } from '../types';
import { beachDataService } from '../services/beachDataService';
import { fetchLiveBeachWeather } from '../services/weatherService';
import { SEED_WEATHER } from '../data/seedData';

interface BeachState {
  selectedBeachId: string;
  beaches: Beach[];
  weather: BeachWeather | null;
  isLoadingWeather: boolean;
  activeTab: 'dashboard' | 'map' | 'facilities' | 'reviews' | 'sos';
  currentUser: AppUser | null;
  authLoading: boolean;
  mapFilters: {
    showHazards: boolean;
    showFacilities: boolean;
    showIncidents: boolean;
    hazardTypeFilter: string; // 'all' or specific
  };
  
  // Actions
  setSelectedBeachId: (id: string) => void;
  setActiveTab: (tab: 'dashboard' | 'map' | 'facilities' | 'reviews' | 'sos') => void;
  setCurrentUser: (user: AppUser | null) => void;
  setAuthLoading: (loading: boolean) => void;
  toggleMapFilter: (key: 'showHazards' | 'showFacilities' | 'showIncidents') => void;
  setHazardTypeFilter: (type: string) => void;
  refreshWeather: () => Promise<void>;
  getSelectedBeach: () => Beach | undefined;
}

export const useBeachStore = create<BeachState>((set, get) => ({
  selectedBeachId: 'bondi-beach',
  beaches: beachDataService.getBeaches(),
  weather: SEED_WEATHER['bondi-beach'] || null,
  isLoadingWeather: false,
  activeTab: 'dashboard',
  currentUser: null, // Default: guest / unauthenticated
  authLoading: true,
  mapFilters: {
    showHazards: true,
    showFacilities: true,
    showIncidents: true,
    hazardTypeFilter: 'all',
  },

  setSelectedBeachId: (id: string) => {
    set({ selectedBeachId: id });
    get().refreshWeather();
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setCurrentUser: (user) => set({ currentUser: user }),

  setAuthLoading: (loading) => set({ authLoading: loading }),

  toggleMapFilter: (key) => set((state) => ({
    mapFilters: {
      ...state.mapFilters,
      [key]: !state.mapFilters[key]
    }
  })),

  setHazardTypeFilter: (type) => set((state) => ({
    mapFilters: {
      ...state.mapFilters,
      hazardTypeFilter: type
    }
  })),

  refreshWeather: async () => {
    const beach = get().getSelectedBeach();
    if (!beach) return;
    set({ isLoadingWeather: true });
    try {
      const data = await fetchLiveBeachWeather(beach.id, beach.center.lat, beach.center.lng);
      set({ weather: data, isLoadingWeather: false });
    } catch (err) {
      console.error(err);
      set({ isLoadingWeather: false });
    }
  },

  getSelectedBeach: () => {
    const { beaches, selectedBeachId } = get();
    return beaches.find(b => b.id === selectedBeachId) || beaches[0];
  }
}));
