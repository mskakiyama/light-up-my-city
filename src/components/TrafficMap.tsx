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
      {/* Map Area */}
      <div className="flex-1 relative">
        {/* Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted rounded-lg m-4">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }} />
          </div>

          {/* City Label */}
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="text-sm">
              <MapPin size={14} className="mr-1" />
              Downtown Traffic Monitor
            </Badge>
          </div>

          {/* Stats */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant="default" className="bg-traffic-green">
              {getTotalGreenLights()} Green
            </Badge>
            <Badge variant="secondary">
              Avg Wait: {getAverageWaitTime()}s
            </Badge>
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

          {/* Map Controls */}
          <div className="absolute bottom-4 right-4">
            <Button size="icon" variant="secondary">
              <Navigation size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-card border-l border-border p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Traffic Status</h2>
          <Button size="icon" variant="ghost">
            <RefreshCw size={16} />
          </Button>
        </div>

        {/* Selected Light Details */}
        {selectedLightData && (
          <Card className="p-4 mb-4 bg-gradient-to-br from-card to-secondary border-primary/20">
            <h3 className="font-medium mb-2">{selectedLightData.intersection}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current:</span>
                <Badge 
                  className={
                    selectedLightData.currentState === 'red' ? 'bg-traffic-red text-white' :
                    selectedLightData.currentState === 'yellow' ? 'bg-traffic-yellow text-black' :
                    'bg-traffic-green text-white'
                  }
                >
                  {selectedLightData.currentState.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Time Remaining:</span>
                <span className="font-mono font-bold text-primary">
                  {selectedLightData.timeRemaining}s
                </span>
              </div>
              <div className="pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Cycle Times:</span>
                <div className="flex justify-between text-xs mt-1">
                  <span>Red: {selectedLightData.cycle.red}s</span>
                  <span>Yellow: {selectedLightData.cycle.yellow}s</span>
                  <span>Green: {selectedLightData.cycle.green}s</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* All Traffic Lights List */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">All Intersections</h3>
          {trafficLights.map(light => (
            <Card 
              key={light.id}
              className={`p-3 cursor-pointer transition-all duration-200 hover:bg-secondary/50 ${
                selectedLight === light.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedLight(light.id)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{light.intersection}</span>
                <Badge 
                  className={
                    light.currentState === 'red' ? 'bg-traffic-red text-white' :
                    light.currentState === 'yellow' ? 'bg-traffic-yellow text-black' :
                    'bg-traffic-green text-white'
                  }
                >
                  {light.timeRemaining}s
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {light.currentState.charAt(0).toUpperCase() + light.currentState.slice(1)} light
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrafficMap;