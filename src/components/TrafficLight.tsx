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
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      onClick={onClick}
    >
      {/* Waze-style Compact Traffic Marker */}
      <div className="relative">
        <div className="bg-card/95 border border-border rounded-2xl px-3 py-2 min-w-[100px] shadow-navigation backdrop-blur-md hover:scale-105 transition-all duration-200">
          {/* Compact Traffic Light Visual */}
          <div className="flex justify-center mb-1.5">
            <div className="bg-secondary/50 p-1.5 rounded-xl">
              <div className="flex flex-col gap-0.5">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${getLightColor('red')}`} />
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${getLightColor('yellow')}`} />
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${getLightColor('green')}`} />
              </div>
            </div>
          </div>

          {/* Compact Timer Display */}
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className={`w-1.5 h-1.5 rounded-full ${
              currentState === 'red' ? 'bg-traffic-red' :
              currentState === 'yellow' ? 'bg-traffic-yellow' :
              'bg-traffic-green'
            } traffic-active`} />
            <span className="text-xs font-mono font-bold text-primary">
              {formatTime(displayTime)}
            </span>
          </div>

          {/* Intersection Name */}
          <div className="text-[10px] font-medium text-center text-muted-foreground truncate">
            {intersection.split(' & ')[0]}
          </div>
        </div>

        {/* Waze-style Location Pin */}
        <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2">
          <div className="w-3 h-3 bg-primary rounded-full border-2 border-background shadow-sm" />
        </div>
      </div>
    </div>
  );
};

export default TrafficLight;