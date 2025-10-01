import TrafficMap from '@/components/TrafficMap';
import { ShinyButton } from '@/components/ui/shiny-button';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <main className="h-screen relative">
      <div className="absolute z-10" style={{ top: '15px', left: '15px' }}>
        <ShinyButton 
          onClick={() => navigate('/')} 
          className="!rounded-full !w-12 !h-12 !p-0 flex items-center justify-center [&_span]:!text-[#8A8D95]"
        >
          <Home size={20} />
        </ShinyButton>
      </div>
      <TrafficMap />
    </main>
  );
};

export default Index;