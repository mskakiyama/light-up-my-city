import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

function FloatingPaths({ position }: { position: number }) {
  const trafficColors = [
    { color: '#51FE0D', weight: 0.5, speed: 1.2, name: 'green' },
    { color: '#F6FE0D', weight: 0.3, speed: 1.0, name: 'amber' },
    { color: '#FE0D51', weight: 0.2, speed: 0.7, name: 'red' },
  ];

  const getRandomTrafficColor = () => {
    const rand = Math.random();
    let cumulative = 0;
    for (const tc of trafficColors) {
      cumulative += tc.weight;
      if (rand <= cumulative) return tc;
    }
    return trafficColors[0];
  };

  const paths = Array.from({ length: 36 }, (_, i) => {
    const trafficColor = getRandomTrafficColor();
    return {
      id: i,
      d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
        380 - i * 5 * position
      } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
        152 - i * 5 * position
      } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
        684 - i * 5 * position
      } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
      color: trafficColor.color,
      width: 0.5 + i * 0.03 + Math.random() * 0.2,
      speed: trafficColor.speed,
      delay: Math.random() * 10,
      isPulsing: trafficColor.name === 'red',
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={path.color}
            strokeWidth={path.width}
            strokeOpacity={0.4 + Math.random() * 0.3}
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: path.isPulsing ? [0.3, 0.7, 0.3] : [0.4, 0.7, 0.4],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: (20 + Math.random() * 10) / path.speed,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: path.delay,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`
          }
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Welcome! You can now access the app.",
        });
        navigate("/app");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        navigate("/app");
      }
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/app");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0E1219]">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="relative">
            {/* Enhanced glassmorphic overlay with stronger shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/3 to-transparent rounded-lg pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tl from-primary/3 via-transparent to-transparent rounded-lg pointer-events-none" />
            
            <Card className="backdrop-blur-xl bg-[#0B0D0F]/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),0_0_1px_0_rgba(255,255,255,0.2)_inset] relative overflow-hidden">
              <CardHeader className="space-y-1 text-center relative z-10">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Light up my city
              </CardTitle>
              <CardDescription>
                {isSignUp ? "Create an account to get started" : "Sign in to your account"}
              </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="backdrop-blur-sm bg-background/10 border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="backdrop-blur-sm bg-background/10 border-white/20"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/20 backdrop-blur-sm px-2 text-muted-foreground">Or</span>
                </div>
              </div>

                <Button
                  variant="outline"
                  className="w-full backdrop-blur-sm bg-background/10 border-white/20 hover:bg-background/20"
                  onClick={handleSkip}
                  disabled={loading}
                >
                Skip Sign In
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Create one"}
                </button>
              </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;