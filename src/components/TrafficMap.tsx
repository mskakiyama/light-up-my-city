import React, { useState, useEffect } from 'react';
import TrafficLight from './TrafficLight';
import WazeMap from './WazeMap';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import mapboxgl from 'mapbox-gl';

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

const TrafficMap: React.FC = () => {
  const [selectedLight, setSelectedLight] = useState<TrafficLightData | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [trafficLights, setTrafficLights] = useState<TrafficLightData[]>([
    {
      id: '1',
      intersection: 'Market St & Powell St',
      currentState: 'red',
      timeRemaining: 45,
      position: { x: -122.4083, y: 37.7849 }, // Real coordinates
      cycle: { red: 90, yellow: 6, green: 55 }
    },
    {
      id: '2',
      intersection: 'Geary Blvd & Van Ness Ave',
      currentState: 'green',
      timeRemaining: 35,
      position: { x: -122.4194, y: 37.7849 },
      cycle: { red: 80, yellow: 5, green: 45 }
    },
    {
      id: '3',
      intersection: 'Mission St & 16th St',
      currentState: 'yellow',
      timeRemaining: 4,
      position: { x: -122.4194, y: 37.7649 },
      cycle: { red: 75, yellow: 5, green: 50 }
    },
    {
      id: '4',
      intersection: 'California St & Nob Hill',
      currentState: 'red',
      timeRemaining: 28,
      position: { x: -122.4114, y: 37.7919 },
      cycle: { red: 85, yellow: 4, green: 40 }
    },
    {
      id: '5',
      intersection: 'Lombard St & Hyde St',
      currentState: 'green',
      timeRemaining: 22,
      position: { x: -122.4194, y: 37.8019 },
      cycle: { red: 70, yellow: 5, green: 45 }
    },
    {
      id: '6',
      intersection: 'Castro St & 18th St',
      currentState: 'red',
      timeRemaining: 55,
      position: { x: -122.4349, y: 37.7609 },
      cycle: { red: 95, yellow: 6, green: 60 }
    },
    {
      id: '7',
      intersection: 'Fillmore St & Divisadero St',
      currentState: 'green',
      timeRemaining: 18,
      position: { x: -122.4333, y: 37.7849 },
      cycle: { red: 65, yellow: 4, green: 35 }
    },
    {
      id: '8',
      intersection: 'Union St & Polk St',
      currentState: 'yellow',
      timeRemaining: 2,
      position: { x: -122.4194, y: 37.7989 },
      cycle: { red: 60, yellow: 5, green: 40 }
    },
    {
      id: '9',
      intersection: 'Valencia St & 24th St',
      currentState: 'red',
      timeRemaining: 42,
      position: { x: -122.4214, y: 37.7529 },
      cycle: { red: 80, yellow: 5, green: 50 }
    },
    {
      id: '10',
      intersection: 'Bay St & Embarcadero',
      currentState: 'green',
      timeRemaining: 31,
      position: { x: -122.3994, y: 37.8059 },
      cycle: { red: 75, yellow: 4, green: 45 }
    },
    {
      id: '11',
      intersection: 'Irving St & 19th Ave',
      currentState: 'red',
      timeRemaining: 67,
      position: { x: -122.4750, y: 37.7639 },
      cycle: { red: 100, yellow: 6, green: 65 }
    },
    {
      id: '12',
      intersection: 'Judah St & Sunset Blvd',
      currentState: 'green',
      timeRemaining: 28,
      position: { x: -122.4794, y: 37.7609 },
      cycle: { red: 85, yellow: 5, green: 55 }
    }
  ]);

  // Simulate traffic light cycles
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficLights(prevLights => 
        prevLights.map(light => {
          let newTimeRemaining = light.timeRemaining - 1;
          let newState = light.currentState;

          if (newTimeRemaining <= 0) {
            // Cycle to next state
            if (light.currentState === 'red') {
              newState = 'green';
              newTimeRemaining = light.cycle.green;
            } else if (light.currentState === 'green') {
              newState = 'yellow';
              newTimeRemaining = light.cycle.yellow;
            } else if (light.currentState === 'yellow') {
              newState = 'red';
              newTimeRemaining = light.cycle.red;
            }
          }

          return {
            ...light,
            currentState: newState,
            timeRemaining: newTimeRemaining
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTotalGreenLights = () => {
    return trafficLights.filter(light => light.currentState === 'green').length;
  };

  const getAverageWaitTime = () => {
    const redLights = trafficLights.filter(light => light.currentState === 'red');
    if (redLights.length === 0) return 0;
    const totalWait = redLights.reduce((sum, light) => sum + light.timeRemaining, 0);
    return Math.round(totalWait / redLights.length);
  };

  const convertToMapPosition = (lng: number, lat: number) => {
    if (!map) return { x: 50, y: 50 };
    
    const point = map.project([lng, lat]);
    const container = map.getContainer();
    const rect = container.getBoundingClientRect();
    
    return {
      x: (point.x / rect.width) * 100,
      y: (point.y / rect.height) * 100
    };
  };

  return (
    <div className="h-screen bg-background flex">
      {/* Waze-style Map Area */}
      <div className="flex-1 relative m-4 rounded-2xl overflow-hidden">
        <WazeMap 
          onMapLoad={setMap}
          trafficLights={trafficLights}
          onTrafficLightClick={setSelectedLight}
        />
      </div>

      {/* Waze-style Sidebar */}
      <div className="w-80 bg-card/95 backdrop-blur-md border-l border-border/50 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Live Traffic</h2>
          <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10">
            <RefreshCw size={16} className="text-primary" />
          </Button>
        </div>

        {/* Waze-style Selected Light Details */}
        {selectedLight && (
          <Card className="p-4 mb-4 bg-gradient-to-br from-card/90 to-secondary/50 border border-primary/30 rounded-2xl shadow-navigation backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${
                selectedLight.currentState === 'red' ? 'bg-traffic-red' :
                selectedLight.currentState === 'yellow' ? 'bg-traffic-yellow' :
                'bg-traffic-green'
              } waze-pulse`} />
              <h3 className="font-semibold text-primary">{selectedLight.intersection}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-secondary/30 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge 
                    className={`rounded-full ${
                      selectedLight.currentState === 'red' ? 'bg-traffic-red/20 text-traffic-red border-traffic-red/30' :
                      selectedLight.currentState === 'yellow' ? 'bg-traffic-yellow/20 text-traffic-yellow border-traffic-yellow/30' :
                      'bg-traffic-green/20 text-traffic-green border-traffic-green/30'
                    }`}
                  >
                    {selectedLight.currentState.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Time left:</span>
                  <span className="font-mono text-lg font-bold text-primary">
                    {selectedLight.timeRemaining}s
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-traffic-red/10 rounded-lg p-2 text-center border border-traffic-red/20">
                  <div className="text-traffic-red font-semibold">{selectedLight.cycle.red}s</div>
                  <div className="text-muted-foreground">Red</div>
                </div>
                <div className="bg-traffic-yellow/10 rounded-lg p-2 text-center border border-traffic-yellow/20">
                  <div className="text-traffic-yellow font-semibold">{selectedLight.cycle.yellow}s</div>
                  <div className="text-muted-foreground">Yellow</div>
                </div>
                <div className="bg-traffic-green/10 rounded-lg p-2 text-center border border-traffic-green/20">
                  <div className="text-traffic-green font-semibold">{selectedLight.cycle.green}s</div>
                  <div className="text-muted-foreground">Green</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Waze-style Traffic List */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Live Intersections</h3>
          {trafficLights.map(light => (
            <Card 
              key={light.id}
              className={`p-3 cursor-pointer transition-all duration-200 hover:bg-secondary/30 rounded-2xl border-0 bg-secondary/20 backdrop-blur-sm ${
                selectedLight?.id === light.id ? 'ring-2 ring-primary/50 bg-primary/10' : ''
              }`}
              onClick={() => setSelectedLight(light)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    light.currentState === 'red' ? 'bg-traffic-red' :
                    light.currentState === 'yellow' ? 'bg-traffic-yellow' :
                    'bg-traffic-green'
                  } traffic-active`} />
                  <div>
                    <div className="text-sm font-medium">{light.intersection}</div>
                    <div className="text-xs text-muted-foreground">
                      {light.currentState.charAt(0).toUpperCase() + light.currentState.slice(1)} • Next in {light.timeRemaining}s
                    </div>
                  </div>
                </div>
                <div className={`font-mono text-sm font-bold ${
                  light.currentState === 'red' ? 'text-traffic-red' :
                  light.currentState === 'yellow' ? 'text-traffic-yellow' :
                  'text-traffic-green'
                }`}>
                  {light.timeRemaining}s
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrafficMap;