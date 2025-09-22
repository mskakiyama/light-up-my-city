import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TrafficLightData {
  id: string;
  intersection: string;
  currentState: 'red' | 'yellow' | 'green';
  timeRemaining: number;
  position: { x: number; y: number };
  cycle: {
    red: number;
    yellow: number;
    green: number;
  };
}

interface WazeMapProps {
  onMapLoad?: (map: L.Map) => void;
  children?: React.ReactNode;
  trafficLights?: TrafficLightData[];
  onTrafficLightClick?: (light: TrafficLightData) => void;
}

const WazeMap: React.FC<WazeMapProps> = ({ onMapLoad, children, trafficLights = [], onTrafficLightClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Leaflet map
    map.current = L.map(mapContainer.current, {
      center: [37.7749, -122.4194], // San Francisco coordinates
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // Add custom dark tile layer for Waze-like appearance
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map.current);

    // Add zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map.current);

    // Custom CSS for dark theme
    const mapElement = mapContainer.current;
    if (mapElement) {
      mapElement.style.background = '#1a1a1a';
      mapElement.style.filter = 'hue-rotate(200deg) brightness(0.9) contrast(1.1)';
    }

    setMapReady(true);
    onMapLoad?.(map.current);

    return () => {
      map.current?.remove();
    };
  }, [onMapLoad]);

  // Create marker element for traffic lights
  const createTrafficMarker = (light: TrafficLightData) => {
    const el = document.createElement('div');
    el.className = 'traffic-marker';
    el.style.cssText = `
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid ${
        light.currentState === 'red' ? '#ef4444' :
        light.currentState === 'yellow' ? '#eab308' :
        '#22c55e'
      };
      box-shadow: 0 0 20px ${
        light.currentState === 'red' ? 'rgba(239, 68, 68, 0.3)' :
        light.currentState === 'yellow' ? 'rgba(234, 179, 8, 0.3)' :
        'rgba(34, 197, 94, 0.3)'
      };
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    `;
    
    el.innerHTML = `
      <div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${
          light.currentState === 'red' ? '#ef4444' :
          light.currentState === 'yellow' ? '#eab308' :
          '#22c55e'
        };
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
        font-family: monospace;
      ">${light.timeRemaining}</div>
    `;

    el.addEventListener('click', () => {
      onTrafficLightClick?.(light);
    });

    return el;
  };

  // Update traffic light markers
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers for each traffic light
    trafficLights.forEach(light => {
      const markerEl = createTrafficMarker(light);
      const marker = L.marker([light.position.y, light.position.x], {
        icon: L.divIcon({
          html: markerEl.outerHTML,
          className: 'custom-traffic-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        })
      }).addTo(map.current!);

      marker.on('click', () => {
        onTrafficLightClick?.(light);
      });
      
      markersRef.current.push(marker);
    });
  }, [trafficLights, mapReady, onTrafficLightClick]);

  return (
    <div className="relative w-full h-full min-h-screen">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ minHeight: '100vh' }} />
      {mapReady && (
        <div className="absolute inset-0 pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
};

export default WazeMap;