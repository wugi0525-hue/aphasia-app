import React, { useState, useRef, useEffect } from 'react';
import { Activity, Lightbulb, ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { compareTwoStrings } from 'string-similarity';
import { startListening } from '../services/sttService';
import { startCloudListening } from '../services/cloudSttService';
import { recordTrial } from '../services/analyticsService';
import MicButton from './MicButton';
import AudioVisualizer from './AudioVisualizer';

export default function AphasiaTask({ task, imageUrl, userProfile, onSuccess }) {
    const navigate = useNavigate();
    const [hintLevel, setHintLevel] = useState(0); // 0: None, 1: Semantic, 2: Sentence, 3: Answer
    const [isListening, setIsListening] = useState(false);
    const [interimText, setInterimText] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [trialStartTime, setTrialStartTime] = useState(null);
    const recognitionRef = useRef(null);
    const currentAudioRef = useRef(null);

    useEffect(() => {
        setHintLevel(0);
        setIsListening(false);
        setInterimText('');
        setFeedback('');
        setIsSuccess(false);
        setTrialStartTime(null);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
        }
    }, [task]);

    const playAudioFile = (audioPath) => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
        }

        const audio = new Audio(audioPath);
        currentAudioRef.current = audio;

        // Slight delay to mimic human response time and ensure smooth playback
        setTimeout(() => {
            audio.play().catch(e => console.error("Error playing audio hint:", e));
        }, 300);
    };

    const handleHintClick = () => {
        const newLevel = hintLevel >= 3 ? 1 : hintLevel + 1;
        setHintLevel(newLevel);

        const currentUnit = task.worksheet_index;

        if (newLevel === 1 && task.hint_1) {
            playAudioFile(`/audio/hints/unit_${currentUnit}_hint1.mp3`);
        }
        else if (newLevel === 2 && task.hint_2) {
            playAudioFile(`/audio/hints/unit_${currentUnit}_hint2.mp3`);
        }
        else if (newLevel === 3 && task.hint_3) {
            playAudioFile(`/audio/hints/unit_${currentUnit}_hint3.mp3`);
        }
    };

    // Auto-play usage example upon success
    useEffect(() => {
        if (isSuccess && task.usage_example) {
            setTimeout(() => {
                playAudioFile(`/audio/hints/unit_${task.worksheet_index}_usage.mp3`);
            }, 500);
        }
    }, [isSuccess, task]);

    const toggleMic = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            setInterimText('');
        } else {
            setFeedback('');
            setInterimText('');
            setIsSuccess(false);
            setTrialStartTime(Date.now());

            let useCloud = userProfile?.subscriptionTier === 'basic';
            if (userProfile?.role === 'admin') {
                useCloud = userProfile?.useCloudSttInAdmin === true;
            }
            const sttEngine = useCloud ? startCloudListening : startListening;

            recognitionRef.current = sttEngine(
                task.target_word,
                (result) => {
                    if (result.interim) setInterimText(result.interim);
                    if (result.final) {
                        const transcript = result.final.toLowerCase().trim();
                        const target = task.target_word.toLowerCase().trim();
                        let threshold = target.length <= 3 ? 0.4 : 0.6;
                        const similarity = compareTwoStrings(transcript, target);
                        const isAliasMatch = task.aliases?.some(alias =>
                            alias.toLowerCase().trim() === transcript ||
                            compareTwoStrings(transcript, alias.toLowerCase().trim()) >= threshold
                        );

                        const latency = trialStartTime ? (Date.now() - trialStartTime) : 0;
                        recordTrial(userProfile.uid, task.worksheet_index, task.target_word, transcript, similarity, latency);

                        if (transcript === target || transcript.includes(target) || similarity >= threshold || isAliasMatch) {
                            setIsSuccess(true);
                            setFeedback('Excellent! You said it perfectly!');
                            setTimeout(() => onSuccess(), 2500); // Restored auto-advance
                        } else if (transcript.length > 0) {
                            setFeedback(`Let's try that again!`);
                        }
                        setIsListening(false);
                        setInterimText('');
                    }
                },
                (error) => {
                    if (error === 'no-speech') setFeedback("I didn't hear anything.");
                    else if (error !== 'aborted') setFeedback(`Error: ${error}`);
                    setIsListening(false);
                    setInterimText('');
                },
                () => { setIsListening(false); setInterimText(''); },
                () => { setIsListening(true); }
            );
        }
    };

    return (
        <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto h-full px-4 pt-2">
            {/* VSD & Hint Area - VH constraint to prevent scroll */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3">
                <div className="w-full h-full bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden flex flex-col group">
                    <div className="flex-1 min-h-0 p-2 flex items-center justify-center bg-gray-50/50">
                        {imageUrl ? (
                            <img src={imageUrl} alt={task.display_text} className="max-h-[35vh] w-auto object-contain mix-blend-multiply" />
                        ) : (
                            <div className="h-[35vh] w-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">
                                <span className="text-gray-400 font-medium">No Image</span>
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 p-3 sm:p-5 bg-white flex flex-col items-center border-t border-gray-100 min-h-[140px] justify-center">
                        {isSuccess ? (
                            <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h3 className="text-4xl sm:text-6xl font-black text-center tracking-tight text-green-600 drop-shadow-sm">
                                    {task.display_text}
                                </h3>
                                <p className="text-lg sm:text-2xl text-gray-700 font-bold text-center mt-2 px-4 leading-relaxed bg-green-50 py-2 rounded-xl">
                                    {task.usage_example}
                                </p>
                            </div>
                        ) : (
                            <>
                                <h3 className={`text-4xl sm:text-6xl font-black text-center tracking-tight transition-all duration-300 break-words w-full ${hintLevel >= 3 ? 'text-gray-900 drop-shadow-sm' : 'text-gray-200 blur-sm select-none'}`}>
                                    {hintLevel >= 3 ? task.display_text : Array.from({ length: task.target_word.length }).map(c => c === ' ' ? ' ' : '?').join('')}
                                </h3>
                                <div className="min-h-[3rem] mt-3 flex flex-col items-center justify-center w-full px-2">
                                    {hintLevel === 0 && <p className="text-lg sm:text-xl text-gray-500 font-bold text-center w-full animate-fade-in">{task.initial_prompt}</p>}
                                    {hintLevel === 1 && <p className="text-xl sm:text-2xl text-blue-600 font-black animate-in slide-in-from-bottom-1 text-center w-full">{task.hint_1}</p>}
                                    {hintLevel === 2 && <p className="text-xl sm:text-2xl text-purple-600 font-black animate-in slide-in-from-bottom-1 text-center w-full">{task.hint_2}</p>}
                                    {hintLevel === 3 && <p className="text-xl sm:text-2xl text-green-600 font-black animate-pulse text-center w-full">{task.hint_3}</p>}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Feedback & Audioizer Shrinkable Box */}
            <div className="shrink-0 my-2">
                <AudioVisualizer isListening={isListening} />
                <div className={`mt-2 w-full mx-auto min-h-[48px] rounded-xl flex flex-col items-center justify-center p-2 text-base sm:text-xl font-black transition-all shadow-sm border-2
                    ${isSuccess ? 'bg-green-50 text-green-700 border-green-200' :
                        feedback.startsWith('Error') || feedback.startsWith('I heard') ? 'bg-orange-50 text-orange-600 border-orange-200' :
                            isListening ? 'bg-white border-orange-200 text-gray-800' :
                                'bg-white border-gray-100 text-gray-300'}`}>
                    {isSuccess || feedback ? <span className="text-center w-full line-clamp-1">{feedback}</span> :
                        isListening ? <div className="animate-pulse text-orange-400">Listening...</div> :
                            <span>System Ready</span>}
                </div>
            </div>

            {/* Bottom Dock - Fixed Height, safe for mic */}
            <div className="shrink-0 h-24 sm:h-32 w-full flex items-center justify-center pb-2 gap-8 relative">
                <button onClick={handleHintClick} disabled={isListening || isSuccess}
                    className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed z-10 overflow-hidden shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-yellow-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-amber-500 group-hover:from-yellow-400 group-hover:to-amber-600 transition-colors"></div>
                    {hintLevel === 0 && !isSuccess && (
                        <div className="absolute inset-0 bg-yellow-400 animate-ping opacity-30 rounded-full"></div>
                    )}
                    <Lightbulb size={32} className="text-white z-10 fill-white drop-shadow-md" />
                </button>

                <div className="z-20 flex flex-col items-center gap-2">
                    <MicButton isListening={isListening} onClick={toggleMic} disabled={isSuccess} />
                </div>

                <button
                    onClick={onSuccess}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 z-10 
                                ${isSuccess ? 'bg-orange-600 text-white hover:bg-orange-700 animate-bounce' : 'bg-gray-100 text-gray-300'}`}
                >
                    <ChevronRight size={32} />
                </button>
            </div>
        </div>
    );
}
