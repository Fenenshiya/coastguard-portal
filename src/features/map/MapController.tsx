import React, { useEffect, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { LatLng } from '../../types';

interface MapControllerProps {
  beachCenter: LatLng;
  targetLocation: { lat: number; lng: number; zoom?: number; timestamp: number } | null;
  isDrawingMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  defaultZoom?: number;
}

export const MapController: React.FC<MapControllerProps> = ({
  beachCenter,
  targetLocation,
  isDrawingMode,
  onMapClick,
  defaultZoom = 15
}) => {
  const map = useMap();
  const prevCenterRef = useRef<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const prevTargetTsRef = useRef<number>(0);

  // Re-center when beach changes
  useEffect(() => {
    if (
      beachCenter.lat !== prevCenterRef.current.lat ||
      beachCenter.lng !== prevCenterRef.current.lng
    ) {
      prevCenterRef.current = { lat: beachCenter.lat, lng: beachCenter.lng };
      map.flyTo([beachCenter.lat, beachCenter.lng], defaultZoom, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [beachCenter.lat, beachCenter.lng, defaultZoom, map]);

  // Handle explicit flyTo requests (such as Locate Me or Reset View)
  useEffect(() => {
    if (targetLocation && targetLocation.timestamp !== prevTargetTsRef.current) {
      prevTargetTsRef.current = targetLocation.timestamp;
      map.flyTo(
        [targetLocation.lat, targetLocation.lng],
        targetLocation.zoom || 16,
        {
          duration: 1.0,
          easeLinearity: 0.25
        }
      );
    }
  }, [targetLocation, map]);

  // Invalidate map size on mount/resize so tiles load properly
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  // Handle map clicks (for staff hazard placement mode)
  useMapEvents({
    click(e) {
      if (isDrawingMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });

  return null;
};
