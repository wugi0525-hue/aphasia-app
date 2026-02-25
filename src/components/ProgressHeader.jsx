import React from 'react';

/**
 * ProgressHeader Component
 * 
 * Displays the current progress through the curriculum.
 */
const ProgressHeader = ({ currentWorksheet }) => {
    return (
        <header className="w-full bg-white/90 backdrop-blur-md border-b-2 border-gray-100 py-4 md:py-6 px-6 md:px-10 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-orange-600 mb-0.5">Clinical Progress</span>
                    <h1 className="text-xl md:text-3xl font-black text-gray-900 leading-none tracking-tighter transition-all uppercase">
                        Unit <span className="text-orange-600">{currentWorksheet}</span>
                    </h1>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Session</span>
                </div>
            </div>
        </header>
    );
};

export default ProgressHeader;
