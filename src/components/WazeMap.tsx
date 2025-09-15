import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface WazeMapProps {
  onMapLoad?: (map: mapboxgl.Map) => void;
  children?: React.ReactNode;
}

const WazeMap: React.FC<WazeMapProps> = ({ onMapLoad, children }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
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

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (!tokenSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-waze-dark p-8">
        <div className="bg-waze-card/90 backdrop-blur-md border border-waze-border rounded-3xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-8 h-8 text-waze-accent" />
            <div>
              <h2 className="text-xl font-bold text-waze-text">Connect Mapbox</h2>
              <p className="text-sm text-waze-text-muted">Add your Mapbox token to see real streets</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your Mapbox public token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="bg-waze-input border-waze-border text-waze-text"
            />
            <Button 
              onClick={handleTokenSubmit}
              className="w-full bg-waze-accent hover:bg-waze-accent/90 text-white font-medium"
              disabled={!mapboxToken.trim()}
            >
              Load Map
            </Button>
            <p className="text-xs text-waze-text-muted text-center">
              Get your token at{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-waze-accent hover:underline"
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
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {mapReady && (
        <div className="absolute inset-0 pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
};

export default WazeMap;