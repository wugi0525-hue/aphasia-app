import React, { useState, useRef, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { compareTwoStrings } from 'string-similarity';
import { startListening } from '../services/sttService';
import { startCloudListening } from '../services/cloudSttService';
import { recordTrial } from '../services/analyticsService';
import MicButton from './MicButton';
import AudioVisualizer from './AudioVisualizer';

export default function VaultEngine({ scenario, userProfile, onComplete }) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [hintLevel, setHintLevel] = useState(0); // 0: None, 1: Semantic, 2: Sentence, 3: Answer
    const [isListening, setIsListening] = useState(false);
    const [interimText, setInterimText] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [trialStartTime, setTrialStartTime] = useState(null);
    const recognitionRef = useRef(null);

    const currentStep = scenario.steps[currentStepIndex];

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
    }, [currentStepIndex, scenario]);

    // Initial TTS for NPC Dialogue
    useEffect(() => {
        if (currentStep?.npc_dialogue) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(currentStep.npc_dialogue);
                utterance.lang = 'ko-KR';
                utterance.pitch = 1.1;

                setTimeout(() => {
                    window.speechSynthesis.speak(utterance);
                }, 300);
            }
        }
    }, [currentStep]);

    const playTTS = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            utterance.pitch = pitch;

            setTimeout(() => {
                window.speechSynthesis.speak(utterance);
            }, 300);
        }
    };

    const handleHintClick = () => {
        if (hintLevel < 3) {
            const newLevel = hintLevel + 1;
            setHintLevel(newLevel);
            if (newLevel === 1 && currentStep.hint_semantic) playTTS(currentStep.hint_semantic);
            else if (newLevel === 2 && currentStep.hint_sentence) playTTS(currentStep.hint_sentence);
            else if (newLevel === 3 && currentStep.display_text) playTTS(currentStep.display_text);
        }
    };

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
                currentStep.target_word,
                (result) => {
                    if (result.interim) setInterimText(result.interim);
                    if (result.final) {
                        const transcript = result.final.toLowerCase().trim();
                        const target = currentStep.target_word.toLowerCase().trim();
                        let threshold = target.length <= 3 ? 0.4 : 0.6;
                        const similarity = compareTwoStrings(transcript, target);

                        const latency = trialStartTime ? (Date.now() - trialStartTime) : 0;
                        recordTrial(userProfile.uid, `vault_${scenario.scenario_id}_s${currentStep.step_index}`, currentStep.target_word, transcript, similarity, latency);

                        if (transcript === target || transcript.includes(target) || similarity >= threshold) {
                            setIsSuccess(true);
                            setFeedback('Excellent! You said it perfectly!');

                            setTimeout(() => {
                                if (currentStepIndex + 1 < scenario.total_steps) {
                                    setCurrentStepIndex(currentStepIndex + 1);
                                } else {
                                    onComplete();
                                }
                            }, 2500);
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

    if (!currentStep) return null;

    return (
        <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto h-full px-4 pt-2">
            {/* Scenario Header with Progress Indicator */}
            <div className="w-full text-center mb-2 shrink-0">
                <div className="inline-flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        {Array.from({ length: scenario.total_steps }).map((_, idx) => (
                            <div key={idx} className={`h-2 rounded-full transition-all ${idx === currentStepIndex ? 'w-6 bg-blue-600' : idx < currentStepIndex ? 'w-2 bg-blue-300' : 'w-2 bg-gray-200'}`} />
                        ))}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter uppercase line-clamp-1">
                        {scenario.title}
                    </h2>
                </div>
            </div>

            {/* NPC Speech Bubble */}
            <div className="shrink-0 mb-3 w-full flex justify-start">
                <div className="bg-blue-100 text-blue-900 px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-blue-200 inline-block max-w-[85%]">
                    <p className="text-lg sm:text-2xl font-bold leading-tight">{currentStep.npc_dialogue}</p>
                </div>
            </div>

            {/* VSD & Hint Area */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 w-full">
                <div className="w-full h-full bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden flex flex-col group">
                    <div className="flex-1 min-h-0 p-2 flex items-center justify-center bg-gray-50/50">
                        <div className="h-[25vh] sm:h-[30vh] w-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-100 text-gray-400">
                            <p className="font-medium">Image: {currentStep.asset_file_name}</p>
                        </div>
                    </div>

                    <div className="shrink-0 p-3 sm:p-4 bg-white flex flex-col items-center border-t border-gray-100">
                        <h3 className={`text-3xl sm:text-5xl font-black text-center tracking-tight transition-all duration-300 ${hintLevel >= 3 ? 'text-gray-900' : 'text-gray-300 blur-sm select-none'}`}>
                            {hintLevel >= 3 ? currentStep.display_text : Array.from({ length: currentStep.target_word.length }).fill('?').join('')}
                        </h3>
                        <div className="h-6 mt-1 flex items-center justify-center overflow-hidden">
                            {hintLevel === 1 && <p className="text-sm sm:text-base text-blue-600 font-bold animate-pulse">{currentStep.hint_semantic}</p>}
                            {hintLevel === 2 && <p className="text-sm sm:text-base text-blue-600 font-bold animate-pulse">{currentStep.hint_sentence}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Box */}
            <div className="shrink-0 my-2">
                <AudioVisualizer isListening={isListening} />
                <div className={`mt-2 w-full mx-auto min-h-[48px] rounded-xl flex flex-col items-center justify-center p-2 text-base sm:text-xl font-black transition-all shadow-sm border-2
                    ${isSuccess ? 'bg-green-50 text-green-700 border-green-200' :
                        feedback.startsWith('Error') || feedback.startsWith('I heard') ? 'bg-orange-50 text-orange-600 border-orange-200' :
                            isListening ? 'bg-white border-orange-200 text-gray-800' :
                                'bg-white border-gray-100 text-gray-300'}`}>
                    {isSuccess || feedback ? <span className="text-center w-full line-clamp-1">{feedback}</span> :
                        isListening ? <div className="animate-pulse text-orange-400">Listening...</div> :
                            <span>Your turn to reply!</span>}
                </div>
            </div>

            {/* Bottom Dock */}
            <div className="shrink-0 h-24 sm:h-32 w-full flex items-center justify-center pb-2 gap-8 relative">
                <button onClick={handleHintClick} disabled={hintLevel >= 3 || isListening || isSuccess}
                    className="w-14 h-14 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shadow-sm hover:bg-yellow-200 disabled:opacity-30 transition-all active:scale-95 z-10">
                    <Lightbulb size={24} />
                </button>

                <div className="z-20">
                    <MicButton isListening={isListening} onClick={toggleMic} disabled={isSuccess} />
                </div>

                <div className="w-14 h-14"></div>
            </div>
        </div>
    );
}

