"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function FloatingPaths({ position }: { position: number }) {
    // Traffic light colors for realistic traffic flow simulation
    const trafficColors = [
        { color: '#16A34A', weight: 0.5, speed: 1.2, name: 'green' },    // Green - flowing traffic (50%)
        { color: '#F59E0B', weight: 0.3, speed: 1.0, name: 'amber' },    // Amber - medium traffic (30%)
        { color: '#DC2626', weight: 0.2, speed: 0.7, name: 'red' },      // Red - slow/stopped traffic (20%)
    ];

    // Weighted random color selection
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
            <svg
                className="w-full h-full"
                viewBox="0 0 696 316"
                fill="none"
            >
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
                            opacity: path.isPulsing 
                                ? [0.3, 0.7, 0.3] 
                                : [0.4, 0.7, 0.4],
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

export function BackgroundPaths() {
    const navigate = useNavigate();
    const title = "Light up my city";
    const words = title.split(" ");

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            <div className="absolute inset-0">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-4 last:mr-0"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={`${wordIndex}-${letterIndex}`}
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay:
                                                wordIndex * 0.1 +
                                                letterIndex * 0.03,
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 25,
                                        }}
                                        className="inline-block text-transparent bg-clip-text 
                                        bg-gradient-to-r from-foreground to-foreground/80"
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </h1>

                    <div
                        className="inline-block group relative bg-gradient-to-b from-border/50 to-border/10 
                        p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                        <Button
                            onClick={() => navigate('/app')}
                            variant="ghost"
                            className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                            bg-background/95 hover:bg-background/100 transition-all duration-300 
                            group-hover:-translate-y-0.5 border border-border/10
                            hover:shadow-md"
                        >
                            <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                                Welcome
                            </span>
                            <span
                                className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                transition-all duration-300"
                            >
                                →
                            </span>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}