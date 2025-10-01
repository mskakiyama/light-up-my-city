import TrafficMap from '@/components/TrafficMap';
import { ShinyButton } from '@/components/ui/shiny-button';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <main className="h-screen relative">
      <div className="absolute top-4 left-4 z-10">
        <ShinyButton onClick={() => navigate('/')} className="[&_span]:!text-[#8A8D95]">
          <Home size={20} />
        </ShinyButton>
      </div>
      <TrafficMap />
    </main>
  );
};

export default Index;