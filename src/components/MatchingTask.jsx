import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Image as ImageIcon } from 'lucide-react';
import { startListening } from '../services/sttService';
import { startCloudListening } from '../services/cloudSttService';
import AudioVisualizer from './AudioVisualizer';
import MicButton from './MicButton';

export default function MatchingTask({ task, imageUrl, userProfile, onSuccess }) {
    const [isListening, setIsListening] = useState(false);
    const [interimText, setInterimText] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [showTouchFallback, setShowTouchFallback] = useState(false);

    const recognitionRef = useRef(null);
    const timerRef = useRef(null);

    // Initial setup and fallback timer
    useEffect(() => {
        setIsListening(false);
        setInterimText('');
        setFeedback('');
        setIsSuccess(false);
        setShowTouchFallback(false);

        if (recognitionRef.current) recognitionRef.current.stop();

        // Start 7-second timer for touch fallback
        timerRef.current = setTimeout(() => {
            setShowTouchFallback(true);
        }, 7000);

        return () => {
            clearTimeout(timerRef.current);
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [task]);

    const handleSuccess = () => {
        setIsSuccess(true);
        setFeedback("Exactly right! Brilliant.");
        if (recognitionRef.current) recognitionRef.current.stop();
        if (timerRef.current) clearTimeout(timerRef.current);

        setTimeout(() => {
            onSuccess();
        }, 3000);
    };

    const handleIncorrectClick = () => {
        setFeedback("Let's look a bit closer. That's not the best match.");
    };

    const toggleMic = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            setInterimText('');
        } else {
            setFeedback('');
            setInterimText('');

            let useCloud = userProfile?.subscriptionTier === 'basic';
            if (userProfile?.role === 'admin') useCloud = userProfile?.useCloudSttInAdmin === true;

            const sttEngine = useCloud ? startCloudListening : startListening;

            // Optional pseudo-model for the cloud API
            const validTokens = (task.valid_answers || []).join(' ');

            recognitionRef.current = sttEngine(
                validTokens,
                (result) => {
                    if (result.interim) setInterimText(result.interim);
                    if (result.final) {
                        const transcript = result.final.toLowerCase().trim();

                        // Semantic Check
                        const isCorrect = (task.valid_answers || []).some(ans =>
                            transcript.includes(ans.toLowerCase().trim())
                        );

                        if (isCorrect) {
                            handleSuccess();
                        } else if (transcript.length > 0) {
                            setFeedback(`I heard "${transcript}". Think about the connection shown.`);
                        }

                        setIsListening(false);
                        setInterimText('');
                    }
                },
                (error) => {
                    if (error !== 'aborted') setFeedback(`I couldn't hear you clearly.`);
                    setIsListening(false);
                    setInterimText('');
                },
                () => { setIsListening(false); setInterimText(''); },
                () => { setIsListening(true); }
            );
        }
    };

    // Prepare exactly 4 fallback buttons (1 correct, 3 incorrect)
    const fallbackButtons = useRef([]);
    useEffect(() => {
        let buttons = [
            { text: task.fallback_button_correct, isCorrect: true }
        ];

        if (Array.isArray(task.fallback_button_incorrect)) {
            task.fallback_button_incorrect.forEach(inc => {
                buttons.push({ text: inc, isCorrect: false });
            });
        }

        fallbackButtons.current = buttons.sort(() => Math.random() - 0.5);
    }, [task]);

    return (
        <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto h-full px-4 pt-2">
            <div className={`flex-1 min-h-0 flex ${showTouchFallback ? 'flex-col sm:flex-row gap-4' : 'flex-col justify-center gap-3'} items-center`}>

                {/* Visual Context Box */}
                <div className={`w-full bg-white rounded-2xl shadow-sm border-4 border-orange-100 overflow-hidden flex flex-col group transition-all duration-500
                    ${showTouchFallback ? 'h-1/2 sm:h-full flex-1' : 'h-full flex-1'}`}>

                    <div className="flex-1 min-h-0 p-2 flex items-center justify-center bg-gray-50/50 relative">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Matching target" className="max-h-full max-w-full object-contain mix-blend-multiply rounded-xl" />
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center border-2 border-dashed border-orange-200 rounded-xl bg-orange-50 text-orange-400">
                                <ImageIcon size={48} className="mb-4 opacity-50" />
                                <span className="font-bold">Family / Custom Asset</span>
                            </div>
                        )}
                        {isSuccess && (
                            <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
                                <CheckCircle size={96} className="text-green-500 bg-white rounded-full drop-shadow-xl animate-bounce" />
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 p-4 sm:p-6 bg-white border-t border-orange-50 flex items-center justify-center min-h-[100px]">
                        <h3 className="text-xl sm:text-2xl font-black text-center tracking-tight text-gray-900 leading-tight">
                            {task.tts_prompt}
                        </h3>
                    </div>
                </div>

                {/* Touch Fallback Multiple Choice Panel */}
                {showTouchFallback && !isSuccess && (
                    <div className="w-full sm:w-1/2 flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-500 justify-center h-1/2 sm:h-full">
                        {fallbackButtons.current.map((btn, idx) => (
                            <button
                                key={idx}
                                onClick={btn.isCorrect ? handleSuccess : handleIncorrectClick}
                                className={`w-full p-4 rounded-xl text-lg sm:text-lg font-black transition-all active:scale-95 shadow-md border-2 text-left flex items-center justify-between
                                    ${btn.isCorrect ? 'bg-white text-green-700 border-green-200 hover:bg-green-50 focus:ring-4 ring-green-100' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                <span>{btn.text}</span>
                                <div className={`w-6 h-6 rounded-full border-2 ${btn.isCorrect ? 'border-green-400' : 'border-gray-300'}`}></div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Mic and Feedback Dock */}
            <div className="shrink-0 my-2">
                <AudioVisualizer isListening={isListening} />
                <div className={`mt-2 w-full mx-auto min-h-[48px] rounded-xl flex flex-col items-center justify-center p-2 text-base sm:text-lg font-black transition-all shadow-sm border-2
                    ${isSuccess ? 'bg-green-50 text-green-700 border-green-200' :
                        feedback ? 'bg-orange-50 text-orange-600 border-orange-200' :
                            isListening ? 'bg-white border-orange-200 text-gray-800' :
                                'bg-white border-gray-100 text-gray-300'}`}>
                    {feedback ? <span className="text-center w-full">{feedback}</span> :
                        isListening ? <div className="animate-pulse text-orange-500">Listening to match...</div> :
                            <span>Voice or touch to answer</span>}
                </div>
            </div>

            <div className="shrink-0 h-24 sm:h-32 w-full flex items-center justify-center pb-2 relative">
                <MicButton isListening={isListening} onClick={toggleMic} disabled={isSuccess} />
            </div>
        </div>
    );
}
