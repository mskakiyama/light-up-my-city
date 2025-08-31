import React, { useState, useEffect } from 'react';
import TrafficLight from './TrafficLight';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [selectedLight, setSelectedLight] = useState<string | null>(null);
  const [trafficLights, setTrafficLights] = useState<TrafficLightData[]>([
    {
      id: '1',
      intersection: 'Main St & 1st Ave',
      currentState: 'red',
      timeRemaining: 45,
      position: { x: 25, y: 30 },
      cycle: { red: 60, yellow: 5, green: 40 }
    },
    {
      id: '2',
      intersection: 'Oak St & 2nd Ave',
      currentState: 'green',
      timeRemaining: 25,
      position: { x: 60, y: 45 },
      cycle: { red: 50, yellow: 5, green: 35 }
    },
    {
      id: '3',
      intersection: 'Pine St & 3rd Ave',
      currentState: 'yellow',
      timeRemaining: 3,
      position: { x: 40, y: 70 },
      cycle: { red: 55, yellow: 5, green: 30 }
    },
    {
      id: '4',
      intersection: 'Elm St & Main St',
      currentState: 'red',
      timeRemaining: 15,
      position: { x: 75, y: 25 },
      cycle: { red: 45, yellow: 4, green: 35 }
    },
    {
      id: '5',
      intersection: 'Cedar Ave & 4th St',
      currentState: 'green',
      timeRemaining: 30,
      position: { x: 20, y: 80 },
      cycle: { red: 50, yellow: 5, green: 40 }
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

  const selectedLightData = trafficLights.find(light => light.id === selectedLight);

  const getTotalGreenLights = () => {
    return trafficLights.filter(light => light.currentState === 'green').length;
  };

  const getAverageWaitTime = () => {
    const redLights = trafficLights.filter(light => light.currentState === 'red');
    if (redLights.length === 0) return 0;
    const totalWait = redLights.reduce((sum, light) => sum + light.timeRemaining, 0);
    return Math.round(totalWait / redLights.length);
  };

  return (
    <div className="h-screen bg-background flex">
      {/* Waze-style Map Area */}
      <div className="flex-1 relative">
        {/* Navigation Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-waze-map to-background rounded-2xl m-4 overflow-hidden">
          {/* Road Network Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(hsl(var(--map-road)) 2px, transparent 2px),
                linear-gradient(90deg, hsl(var(--map-road)) 2px, transparent 2px),
                linear-gradient(45deg, hsl(var(--map-road)) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px, 80px 80px, 40px 40px'
            }} />
          </div>

          {/* Waze-style Map Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-waze-map/20 to-transparent" />

          {/* Waze-style Header */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <div className="bg-card/90 backdrop-blur-md rounded-full px-4 py-2 shadow-navigation">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Navigation size={16} className="text-primary" />
                <span>Traffic Monitor</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="bg-card/90 backdrop-blur-md rounded-full px-3 py-2 shadow-navigation">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-traffic-green rounded-full waze-pulse" />
                  <span className="font-medium">{getTotalGreenLights()} Active</span>
                </div>
              </div>
              <div className="bg-card/90 backdrop-blur-md rounded-full px-3 py-2 shadow-navigation">
                <div className="text-xs font-medium">
                  {getAverageWaitTime()}s avg
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Lights */}
          {trafficLights.map(light => (
            <TrafficLight
              key={light.id}
              intersection={light.intersection}
              currentState={light.currentState}
              timeRemaining={light.timeRemaining}
              position={light.position}
              onClick={() => setSelectedLight(light.id)}
            />
          ))}

          {/* Waze-style Navigation Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <div className="bg-card/90 backdrop-blur-md rounded-full p-3 shadow-navigation">
              <Navigation size={20} className="text-primary" />
            </div>
          </div>
        </div>
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
        {selectedLightData && (
          <Card className="p-4 mb-4 bg-gradient-to-br from-card/90 to-secondary/50 border border-primary/30 rounded-2xl shadow-navigation backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${
                selectedLightData.currentState === 'red' ? 'bg-traffic-red' :
                selectedLightData.currentState === 'yellow' ? 'bg-traffic-yellow' :
                'bg-traffic-green'
              } waze-pulse`} />
              <h3 className="font-semibold text-primary">{selectedLightData.intersection}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-secondary/30 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge 
                    className={`rounded-full ${
                      selectedLightData.currentState === 'red' ? 'bg-traffic-red/20 text-traffic-red border-traffic-red/30' :
                      selectedLightData.currentState === 'yellow' ? 'bg-traffic-yellow/20 text-traffic-yellow border-traffic-yellow/30' :
                      'bg-traffic-green/20 text-traffic-green border-traffic-green/30'
                    }`}
                  >
                    {selectedLightData.currentState.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Time left:</span>
                  <span className="font-mono text-lg font-bold text-primary">
                    {selectedLightData.timeRemaining}s
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-traffic-red/10 rounded-lg p-2 text-center border border-traffic-red/20">
                  <div className="text-traffic-red font-semibold">{selectedLightData.cycle.red}s</div>
                  <div className="text-muted-foreground">Red</div>
                </div>
                <div className="bg-traffic-yellow/10 rounded-lg p-2 text-center border border-traffic-yellow/20">
                  <div className="text-traffic-yellow font-semibold">{selectedLightData.cycle.yellow}s</div>
                  <div className="text-muted-foreground">Yellow</div>
                </div>
                <div className="bg-traffic-green/10 rounded-lg p-2 text-center border border-traffic-green/20">
                  <div className="text-traffic-green font-semibold">{selectedLightData.cycle.green}s</div>
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
                selectedLight === light.id ? 'ring-2 ring-primary/50 bg-primary/10' : ''
              }`}
              onClick={() => setSelectedLight(light.id)}
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