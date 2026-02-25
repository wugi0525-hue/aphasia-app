import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';

export default function SplashA() {
    const [phase, setPhase] = useState(0); // 0: Dark, 1: Spark, 2: Bulb, 3: Glow burst

    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase(1), 500),   // Spark appears
            setTimeout(() => setPhase(2), 1500),  // Morph to Bulb
            setTimeout(() => setPhase(3), 2500)   // Glow burst
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-900 flex flex-col items-center justify-center transition-colors duration-1000">

            {/* Background Glow Burst */}
            <div
                className={`absolute inset-0 bg-gradient-to-br from-amber-200 via-orange-100 to-amber-50 transition-opacity duration-3000 ease-in-out ${phase >= 3 ? 'opacity-100' : 'opacity-0'
                    }`}
            />

            {/* Center Element */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative w-32 h-32 flex items-center justify-center">

                    {/* Phase 1: Spark */}
                    <div
                        className={`absolute w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_20px_10px_rgba(251,191,36,0.5)] transition-all duration-1000 ease-out ${phase === 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                            }`}
                    />

                    {/* Phase 2 & 3: Bulb */}
                    <div
                        className={`absolute flex items-center justify-center transition-all duration-1000 ease-out ${phase >= 2 ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 -rotate-12'
                            }`}
                    >
                        <div className={`absolute inset-0 rounded-full bg-amber-400 blur-2xl transition-all duration-2000 ${phase >= 3 ? 'scale-[3] opacity-40' : 'scale-100 opacity-0'}`} />
                        <Lightbulb
                            size={64}
                            className={`transition-colors duration-1000 ${phase >= 3 ? 'text-amber-500 fill-amber-400' : 'text-amber-200 fill-transparent'}`}
                        />
                    </div>

                </div>

                {/* Text Reveal */}
                <h1
                    className={`mt-6 text-4xl font-black tracking-tight transition-all duration-2000 ease-out ${phase >= 3 ? 'opacity-100 translate-y-0 text-slate-800' : 'opacity-0 translate-y-4 text-white'
                        }`}
                >
                    Aphasia Therapy
                </h1>
                <p
                    className={`mt-3 text-lg font-medium transition-all duration-2000 delay-500 ease-out ${phase >= 3 ? 'opacity-100 translate-y-0 text-slate-600' : 'opacity-0 translate-y-2 text-white'
                        }`}
                >
                    Finding your voice with warmth.
                </p>
            </div>
        </div>
    );
}
