import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock } from 'lucide-react';

interface TrafficLightProps {
  intersection: string;
  currentState: 'red' | 'yellow' | 'green';
  timeRemaining: number;
  position: { x: number; y: number };
  onClick: () => void;
}

const TrafficLight: React.FC<TrafficLightProps> = ({
  intersection,
  currentState,
  timeRemaining,
  position,
  onClick
}) => {
  const [displayTime, setDisplayTime] = useState(timeRemaining);

  useEffect(() => {
    setDisplayTime(timeRemaining);
    const interval = setInterval(() => {
      setDisplayTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const getLightColor = (light: 'red' | 'yellow' | 'green') => {
    if (currentState === light) {
      switch (light) {
        case 'red': return 'bg-traffic-red shadow-[0_0_20px_hsl(var(--traffic-red)/0.6)]';
        case 'yellow': return 'bg-traffic-yellow shadow-[0_0_20px_hsl(var(--traffic-yellow)/0.6)]';
        case 'green': return 'bg-traffic-green shadow-[0_0_20px_hsl(var(--traffic-green)/0.6)]';
      }
    }
    return 'bg-traffic-off';
  };

  const getStateText = () => {
    switch (currentState) {
      case 'red': return 'STOP';
      case 'yellow': return 'CAUTION';
      case 'green': return 'GO';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      onClick={onClick}
    >
      {/* Traffic Light Marker */}
      <div className="relative">
        <div className="bg-card border border-border rounded-lg p-3 min-w-[120px] shadow-lg backdrop-blur-sm">
          {/* Traffic Light Visual */}
          <div className="flex justify-center mb-2">
            <div className="bg-secondary p-2 rounded-lg">
              <div className="flex flex-col gap-1">
                <div className={`w-4 h-4 rounded-full transition-all duration-300 ${getLightColor('red')}`} />
                <div className={`w-4 h-4 rounded-full transition-all duration-300 ${getLightColor('yellow')}`} />
                <div className={`w-4 h-4 rounded-full transition-all duration-300 ${getLightColor('green')}`} />
              </div>
            </div>
          </div>

          {/* Intersection Name */}
          <div className="text-xs font-medium text-center mb-1 text-foreground">
            {intersection}
          </div>

          {/* Current State */}
          <Badge 
            variant={currentState === 'green' ? 'default' : 'secondary'}
            className={`w-full justify-center text-xs mb-2 ${
              currentState === 'red' ? 'bg-traffic-red text-white' :
              currentState === 'yellow' ? 'bg-traffic-yellow text-black' :
              'bg-traffic-green text-white'
            }`}
          >
            {getStateText()}
          </Badge>

          {/* Timer */}
          <div className="flex items-center justify-center gap-1 text-primary">
            <Clock size={12} />
            <span className="text-sm font-mono font-bold">
              {formatTime(displayTime)}
            </span>
          </div>
        </div>

        {/* Location Pin */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <MapPin size={16} className="text-primary" />
        </div>
      </div>
    </div>
  );
};

export default TrafficLight;