import { useState, useEffect, useMemo } from 'react';
import { Incident } from '../types';
import { INCIDENT_ROUTES } from '../data/incidentRoutes';

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
    return INCIDENT_ROUTES[selectedIncidentId] || [];
  }, [selectedIncidentId]);

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
