import React, { useEffect } from 'react';
import { WeatherDashboard } from '../features/weather/WeatherDashboard';
import { InteractiveBeachMap } from '../features/map/InteractiveBeachMap';
import { BeachFacilitiesView } from '../features/facilities/BeachFacilitiesView';
import { ReviewsAndCrowdView } from '../features/reviews/ReviewsAndCrowdView';
import { IncidentReportingView } from '../features/incidents/IncidentReportingView';
import { useBeachStore } from '../store/useBeachStore';

export const TouristPortalPage: React.FC = () => {
  const { activeTab, refreshWeather, selectedBeachId } = useBeachStore();

  useEffect(() => {
    refreshWeather();
  }, [selectedBeachId]);

  return (
    <div>
      {activeTab === 'dashboard' && <WeatherDashboard />}
      {activeTab === 'map' && <InteractiveBeachMap />}
      {activeTab === 'facilities' && <BeachFacilitiesView />}
      {activeTab === 'reviews' && <ReviewsAndCrowdView />}
      {activeTab === 'sos' && <IncidentReportingView />}
    </div>
  );
};
