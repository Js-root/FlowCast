import { useState, useEffect, useMemo } from 'react';
import { Incident, RouteOption } from '../types';
import { INCIDENT_ROUTES } from '../data/incidentRoutes';

function generateDynamicRoutes(incident: Incident): RouteOption[] {
  const { lat, lng, area, delayMinutes } = incident;
  
  const standardPolyline: [number, number][] = [
    [lat - 0.015, lng - 0.015],
    [lat, lng],
    [lat + 0.015, lng + 0.015]
  ];

  const aiPolyline: [number, number][] = [
    [lat - 0.015, lng - 0.015],
    [lat - 0.008, lng + 0.012],
    [lat + 0.015, lng + 0.015]
  ];

  const altPolyline: [number, number][] = [
    [lat - 0.015, lng - 0.015],
    [lat + 0.012, lng - 0.008],
    [lat + 0.015, lng + 0.015]
  ];

  return [
    {
      id: `rt-${incident.id}-ai`,
      name: `Option 1: AI Optimized Bypass`,
      distanceKm: 8.2,
      normalTimeMins: 20,
      predictedTimeMins: 24,
      delayMins: 4,
      isAiRecommended: true,
      congestionPoints: ['Minor delay on detour'],
      sparklineData: [10, 14, 12, 11, 10],
      viaRoads: `Bypass around ${area || 'disruption'}`,
      etaMinutes: 24,
      predictedDelayMinutes: 4,
      savedMinutes: Math.max(12, delayMinutes - 4),
      risk: 'low',
      arrivalProbability: 95,
      polylinePositions: aiPolyline
    },
    {
      id: `rt-${incident.id}-standard`,
      name: `Option 2: Direct path (Standard Maps)`,
      distanceKm: 7.0,
      normalTimeMins: 18,
      predictedTimeMins: 18 + delayMinutes,
      delayMins: delayMinutes,
      isAiRecommended: false,
      congestionPoints: [`${area || 'Incident'} congestion`],
      sparklineData: [20, 35, 50, 55, 60],
      viaRoads: area || 'Primary Corridor',
      etaMinutes: 18 + delayMinutes,
      predictedDelayMinutes: delayMinutes,
      savedMinutes: 0,
      risk: 'high',
      arrivalProbability: 40,
      polylinePositions: standardPolyline
    },
    {
      id: `rt-${incident.id}-alt`,
      name: `Option 3: Alternative Corridor`,
      distanceKm: 9.5,
      normalTimeMins: 25,
      predictedTimeMins: 32,
      delayMins: 7,
      isAiRecommended: false,
      congestionPoints: ['Moderate volume'],
      sparklineData: [15, 18, 20, 22, 18],
      viaRoads: 'Secondary Ring Road',
      etaMinutes: 32,
      predictedDelayMinutes: 7,
      savedMinutes: Math.max(2, delayMinutes - 14),
      risk: 'medium',
      arrivalProbability: 85,
      polylinePositions: altPolyline
    }
  ];
}

export function useRouteSelection(incidents: Incident[]) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // Set default incident if none selected
  useEffect(() => {
    if (incidents.length > 0 && !selectedIncidentId) {
      setSelectedIncidentId(incidents[0].id);
    }
  }, [incidents, selectedIncidentId]);

  // Derive current incident
  const selectedIncident = useMemo(() => {
    return incidents.find((inc) => inc.id === selectedIncidentId) || null;
  }, [incidents, selectedIncidentId]);

  // Derive available routes
  const availableRoutes = useMemo(() => {
    if (!selectedIncidentId) return [];
    if (INCIDENT_ROUTES[selectedIncidentId]) {
      return INCIDENT_ROUTES[selectedIncidentId];
    }
    if (selectedIncident) {
      return generateDynamicRoutes(selectedIncident);
    }
    return [];
  }, [selectedIncidentId, selectedIncident]);

  // Automatically select the default AI route when incident selection changes
  useEffect(() => {
    if (availableRoutes.length > 0) {
      const aiRoute = availableRoutes.find((r) => r.isAiRecommended) || availableRoutes[0];
      setSelectedRouteId(aiRoute.id);
    } else {
      setSelectedRouteId(null);
    }
  }, [availableRoutes]);

  // Derive current selected route
  const selectedRoute = useMemo(() => {
    return availableRoutes.find((r) => r.id === selectedRouteId) || null;
  }, [availableRoutes, selectedRouteId]);

  return {
    selectedIncidentId,
    setSelectedIncidentId,
    selectedRouteId,
    setSelectedRouteId,
    selectedIncident,
    selectedRoute,
    availableRoutes,
  };
}
export type UseRouteSelectionResult = ReturnType<typeof useRouteSelection>;
