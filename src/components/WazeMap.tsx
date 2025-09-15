import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

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
  onMapLoad?: (map: mapboxgl.Map) => void;
  children?: React.ReactNode;
  trafficLights?: TrafficLightData[];
  onTrafficLightClick?: (light: TrafficLightData) => void;
}

const WazeMap: React.FC<WazeMapProps> = ({ onMapLoad, children, trafficLights = [], onTrafficLightClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenSubmitted, setTokenSubmitted] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setTokenSubmitted(true);
      initializeMap();
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-122.4194, 37.7749], // San Francisco coordinates
      zoom: 13,
      pitch: 0,
      bearing: 0,
      attributionControl: false
    });

    // Custom Waze-style map styling
    map.current.on('style.load', () => {
      if (!map.current) return;

      // Customize map colors to match Waze dark theme
      map.current.setPaintProperty('background', 'background-color', '#1a1a1a');
      
      // Roads styling
      const roadLayers = [
        'road-motorway-trunk',
        'road-primary', 
        'road-secondary-tertiary',
        'road-minor',
        'road-street'
      ];

      roadLayers.forEach(layer => {
        if (map.current?.getLayer(layer)) {
          map.current.setPaintProperty(layer, 'line-color', '#2d3748');
        }
      });

      // Water styling
      if (map.current.getLayer('water')) {
        map.current.setPaintProperty('water', 'fill-color', '#1a202c');
      }

      // Building styling
      if (map.current.getLayer('building')) {
        map.current.setPaintProperty('building', 'fill-color', '#2d3748');
        map.current.setPaintProperty('building', 'fill-opacity', 0.6);
      }

      setMapReady(true);
      onMapLoad?.(map.current);
    });

    // Add navigation controls with Waze styling
    const nav = new mapboxgl.NavigationControl({
      showCompass: false,
      showZoom: true,
      visualizePitch: false
    });
    map.current.addControl(nav, 'top-right');

    // Disable map rotation and pitch
    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();
  };

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
        light.currentState === 'red' ? 'hsl(var(--traffic-red))' :
        light.currentState === 'yellow' ? 'hsl(var(--traffic-yellow))' :
        'hsl(var(--traffic-green))'
      };
      box-shadow: 0 0 20px ${
        light.currentState === 'red' ? 'hsl(var(--traffic-red) / 0.3)' :
        light.currentState === 'yellow' ? 'hsl(var(--traffic-yellow) / 0.3)' :
        'hsl(var(--traffic-green) / 0.3)'
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
          light.currentState === 'red' ? 'hsl(var(--traffic-red))' :
          light.currentState === 'yellow' ? 'hsl(var(--traffic-yellow))' :
          'hsl(var(--traffic-green))'
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
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([light.position.x, light.position.y])
        .addTo(map.current!);
      
      markersRef.current.push(marker);
    });
  }, [trafficLights, mapReady, onTrafficLightClick]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  if (!tokenSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background p-8">
        <div className="bg-card/90 backdrop-blur-md border border-border rounded-3xl p-8 max-w-md w-full shadow-navigation">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Connect Mapbox</h2>
              <p className="text-sm text-muted-foreground">Add your Mapbox token to see real streets</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your Mapbox public token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="bg-input border-border text-foreground"
            />
            <Button 
              onClick={handleTokenSubmit}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
              disabled={!mapboxToken.trim()}
            >
              Load Map
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Get your token at{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

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