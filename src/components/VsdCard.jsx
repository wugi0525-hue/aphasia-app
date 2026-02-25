import React from 'react';
import { Volume2 } from 'lucide-react';

/**
 * VsdCard Component
 * 
 * Provides a high-contrast, distraction-free container for Visual Scene Display (VSD) therapy.
 * Renders a large image centered on a pure white background, followed by bold target text.
 * Users can tap the card to hear the pronunciation via Web Speech API (TTS).
 */
const VsdCard = ({ imageUrl, displayText }) => {
    const playAudio = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any ongoing speech
            const utterance = new SpeechSynthesisUtterance(displayText);
            utterance.lang = 'en-US';
            utterance.rate = 0.85; // Slightly slower for aphasia patients to hear clearly
            utterance.pitch = 1.0;

            // Add a slight delay to prevent the first syllable from being cut off
            setTimeout(() => {
                window.speechSynthesis.speak(utterance);
            }, 300);
        }
    };

    return (
        <button
            onClick={playAudio}
            className="flex flex-col items-center justify-center p-6 md:p-8 bg-white rounded-3xl shadow-xl border-4 border-gray-100 max-w-2xl w-full mx-auto cursor-pointer hover:border-blue-200 hover:shadow-2xl hover:bg-blue-50/30 transition-all group active:scale-[0.98]"
            aria-label={`Listen to ${displayText}`}
        >
            {/* VSD Image Container */}
            <div className="aspect-square w-full flex items-center justify-center mb-6 md:mb-8 overflow-hidden rounded-2xl bg-white group-hover:scale-[1.02] transition-transform duration-500">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={displayText}
                        className="max-w-[90%] max-h-[90%] object-contain"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
                        <span className="text-gray-400 text-xl font-medium">Image Placeholder</span>
                    </div>
                )}
            </div>

            {/* Target Display Text - Bold & Massive for Senior Accessibility */}
            <div className="text-center flex flex-col items-center gap-3 md:gap-4 mt-2">
                <h2 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                    {displayText}
                </h2>

                {/* Visual Hint for Audio Playback */}
                <div className="flex items-center gap-2 md:gap-3 text-blue-500 bg-blue-50 px-4 py-2 md:px-6 md:py-3 rounded-full opacity-80 group-hover:opacity-100 transition-opacity border-2 border-blue-100 group-active:bg-blue-100">
                    <Volume2 size={24} className="md:w-8 md:h-8" />
                    <span className="text-sm md:text-xl font-bold uppercase tracking-widest">Listen</span>
                </div>
            </div>
        </button>
    );
};

export default VsdCard;

