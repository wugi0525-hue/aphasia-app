import React from 'react';
import { Mic } from 'lucide-react';

/**
 * MicButton Component
 * 
 * A giant, high-contrast floating action button (FAB) designed for patients with fine motor 
 * and cognitive impairments. Toggles the STT listening state.
 */
const MicButton = ({ isListening, onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        relative w-20 h-20 sm:w-28 sm:h-28
        rounded-full flex items-center justify-center
        transition-all duration-300 transform active:scale-95
        shadow-xl z-50
        ${disabled ? 'bg-gray-400 cursor-not-allowed' :
                    isListening ? 'bg-orange-500 animate-[pulse_1s_ease-in-out_infinite] ring-8 ring-orange-200 shadow-[0_0_40px_rgba(239,68,68,0.6)]' :
                        'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}
      `}
            aria-label={isListening ? "Listening - Click to stop" : "Speak - Click to start"}
        >
            <Mic
                size={64}
                color="white"
                strokeWidth={3}
                className={`${isListening ? 'scale-110' : 'scale-100'} transition-transform`}
            />
        </button>
    );
};

export default MicButton;
