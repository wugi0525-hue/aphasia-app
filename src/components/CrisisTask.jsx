import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { startListening } from '../services/sttService';
import { startCloudListening } from '../services/cloudSttService';
import AudioVisualizer from './AudioVisualizer';
import MicButton from './MicButton';

export default function CrisisTask({ task, imageUrl, userProfile, onSuccess }) {
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
        setFeedback("Excellent! You knew exactly what to do.");
        if (recognitionRef.current) recognitionRef.current.stop();
        if (timerRef.current) clearTimeout(timerRef.current);

        setTimeout(() => {
            onSuccess();
        }, 3000);
    };

    const handleIncorrectClick = () => {
        setFeedback("Let's think carefully about safety. Try the other option!");
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

            recognitionRef.current = sttEngine(
                task.valid_answers.join(' '), // Pseudo target
                (result) => {
                    if (result.interim) setInterimText(result.interim);
                    if (result.final) {
                        const transcript = result.final.toLowerCase().trim();

                        // Semantic Check: Does transcript contain ANY of the valid answers?
                        const isCorrect = task.valid_answers.some(ans =>
                            transcript.includes(ans.toLowerCase().trim())
                        );

                        if (isCorrect) {
                            handleSuccess();
                        } else if (transcript.length > 0) {
                            setFeedback(`I heard "${transcript}". Let's try again or use the buttons.`);
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

    // Shuffle fallbacks just once so they don't jump around
    const fallbackButtons = useRef([]);
    useEffect(() => {
        const buttons = [
            { text: task.fallback_button_correct, isCorrect: true },
            { text: task.fallback_button_incorrect, isCorrect: false }
        ];
        fallbackButtons.current = buttons.sort(() => Math.random() - 0.5);
    }, [task]);

    return (
        <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto h-full px-4 pt-2">
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3">
                <div className="w-full h-full bg-white rounded-2xl shadow-sm border-4 border-red-100 overflow-hidden flex flex-col group">
                    <div className="flex-1 min-h-0 p-2 flex items-center justify-center bg-gray-50/50">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Crisis Context" className="max-h-[35vh] w-auto object-contain rounded-xl" />
                        ) : (
                            <div className="h-[35vh] w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
                                <ImageIcon size={48} className="mb-4 opacity-30" />
                                <span className="font-bold">Situation Photo Pending</span>
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 p-4 sm:p-6 bg-white flex flex-col items-center border-t border-gray-100 min-h-[140px] justify-center relative">
                        {isSuccess ? (
                            <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <CheckCircle size={64} className="text-green-500" />
                                <h3 className="text-2xl sm:text-4xl font-black text-center text-green-600">Great Job!</h3>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl sm:text-3xl font-black text-center tracking-tight text-gray-900 leading-tight mb-4">
                                    {task.tts_prompt}
                                </h3>

                                {showTouchFallback && (
                                    <div className="flex flex-col sm:flex-row w-full gap-3 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {fallbackButtons.current.map((btn, idx) => (
                                            <button
                                                key={idx}
                                                onClick={btn.isCorrect ? handleSuccess : handleIncorrectClick}
                                                className={`flex-1 p-4 rounded-xl text-lg sm:text-xl font-black transition-all active:scale-95 shadow-md border-2 
                                                    ${btn.isCorrect ? 'bg-white text-green-700 border-green-200 hover:bg-green-50' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                {btn.text}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mic and Feedback Area */}
            <div className="shrink-0 my-2">
                <AudioVisualizer isListening={isListening} />
                <div className={`mt-2 w-full mx-auto min-h-[48px] rounded-xl flex flex-col items-center justify-center p-2 text-base sm:text-lg font-black transition-all shadow-sm border-2
                    ${isSuccess ? 'bg-green-50 text-green-700 border-green-200' :
                        feedback ? 'bg-orange-50 text-orange-600 border-orange-200' :
                            isListening ? 'bg-white border-red-200 text-gray-800' :
                                'bg-white border-gray-100 text-gray-300'}`}>
                    {feedback ? <span className="text-center w-full">{feedback}</span> :
                        isListening ? <div className="animate-pulse text-red-500">Listening logic...</div> :
                            <span>Voice or touch to answer</span>}
                </div>
            </div>

            <div className="shrink-0 h-24 sm:h-32 w-full flex items-center justify-center pb-2 relative">
                <MicButton isListening={isListening} onClick={toggleMic} disabled={isSuccess} />
            </div>
        </div>
    );
}
