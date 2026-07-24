import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Circle } from 'react-leaflet';
import { Circle as LeafletCircle } from 'leaflet';

interface AnimatedIncidentCircleProps {
  center: [number, number];
  targetRadius: number;
  color: string;
  fillColor: string;
  fillOpacity: number;
  children?: React.ReactNode;
}

/**
 * AnimatedIncidentCircle is a react-leaflet Circle wrapper that interpolates
 * its radius from its previous size (or 0) to its target size over 500ms
 * using requestAnimationFrame and an ease-out easing function.
 */
export const AnimatedIncidentCircle = forwardRef<LeafletCircle, AnimatedIncidentCircleProps>(({
  center,
  targetRadius,
  color,
  fillColor,
  fillOpacity,
  children
}, ref) => {
  const [currentRadius, setCurrentRadius] = useState(0);
  const prevRadiusRef = useRef(0);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 500; // 500ms duration
    const initialRadius = prevRadiusRef.current;
    const radiusDelta = targetRadius - initialRadius;
    
    let animationFrameId: number;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;
      const percent = Math.min(1, progress / duration);
      
      // Easing: easeOutQuad
      const ease = percent * (2 - percent);
      const newRadius = initialRadius + radiusDelta * ease;
      
      setCurrentRadius(newRadius);
      
      if (progress < duration) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        prevRadiusRef.current = targetRadius;
      }
    };
    
    animationFrameId = requestAnimationFrame(step);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetRadius]);
  
  return (
    <Circle
      ref={ref}
      center={center}
      radius={currentRadius}
      pathOptions={{
        color,
        fillColor,
        fillOpacity,
        weight: 1.5
      }}
    >
      {children}
    </Circle>
  );
});

export default AnimatedIncidentCircle;
