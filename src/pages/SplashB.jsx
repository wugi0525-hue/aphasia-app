import React, { useState, useEffect } from 'react';

export default function SplashB() {
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        // Start clearing the fog after 1.5 seconds
        const timer = setTimeout(() => {
            setClearing(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-orange-50 flex items-center justify-center">

            {/* Background (The "Clear" World) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                <div className="w-24 h-24 bg-gradient-to-tr from-rose-400 to-orange-400 rounded-3xl shadow-2xl mb-8 flex items-center justify-center">
                    <span className="text-white text-4xl font-black">Aa</span>
                </div>
                <h1 className="text-5xl font-black text-slate-800 tracking-tight">Clear Thoughts</h1>
                <p className="text-xl text-slate-500 mt-4 font-medium">Reconnecting the dots, smoothly.</p>

                {/* Mock UI elements backing */}
                <div className="mt-12 w-full max-w-md px-6 space-y-4">
                    <div className="h-20 bg-white rounded-2xl shadow-sm border border-slate-100" />
                    <div className="h-20 bg-white rounded-2xl shadow-sm border border-slate-100" />
                </div>
            </div>

            {/* The Fog Overlay */}
            <div
                className={`absolute inset-0 z-10 bg-slate-200/50 backdrop-blur-[40px] transition-all duration-3000 ease-in-out flex flex-col items-center justify-center ${clearing ? 'opacity-0 pointer-events-none backdrop-blur-none scale-110' : 'opacity-100 backdrop-blur-[40px] scale-100'
                    }`}
            >
                <div className="text-slate-400 mt-10 text-lg font-medium animate-pulse">
                    Clearing the fog...
                </div>
            </div>

        </div>
    );
}
