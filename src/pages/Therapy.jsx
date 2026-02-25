import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, FastForward, ArrowLeft, Home, PlayCircle, Plus, LayoutGrid } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { getDailyTasks, getImagePath } from '../services/curriculumService';
import WorksheetEngine from '../components/WorksheetEngine';

const Therapy = () => {
    const navigate = useNavigate();
    const { userProfile, loading, updateProfile } = useAuth();

    const isAdmin = userProfile?.role?.toLowerCase() === 'admin';
    const isTestMode = userProfile?.testPaywallInAdmin === true;
    const isPaidByTier = userProfile?.subscriptionTier !== 'free';
    const effectiveIsPaid = isAdmin ? !isTestMode : isPaidByTier;

    useEffect(() => {
        if (!loading && !userProfile) navigate('/login');
    }, [loading, userProfile, navigate]);

    // Track user's progress: day and task position within the day
    const currentDay = userProfile?.currentWorksheet || 1;
    const dailyTasks = getDailyTasks(currentDay) || [];

    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [showPaywall, setShowPaywall] = useState(false);

    useEffect(() => {
        // Free tier allows Day 1 only.
        const isLocked = !effectiveIsPaid && currentDay > 1;
        setShowPaywall(isLocked);
    }, [currentDay, effectiveIsPaid]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-900 font-lexend">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-orange-600 rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-black uppercase tracking-widest animate-pulse">Syncing Therapy...</h2>
            </div>
        );
    }

    if (!userProfile) return null;

    const handleGoBack = () => {
        navigate('/dashboard');
    };

    const handleSuccess = async () => {
        if (currentTaskIndex < dailyTasks.length - 1) {
            setCurrentTaskIndex(currentTaskIndex + 1);
        } else {
            // Day Complete!
            try {
                // If not paid, they just finished the free sample
                if (!effectiveIsPaid && currentDay === 1) {
                    await updateProfile({ currentWorksheet: 2 });
                    setShowPaywall(true);
                } else {
                    await updateProfile({ currentWorksheet: currentDay + 1 });
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error("Failed to update progress", error);
            }
        }
    };

    if (showPaywall) {
        return (
            <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-4 font-lexend">
                <div className="bg-white p-6 sm:p-10 rounded-3xl border-b-8 border-orange-600 border-x-2 border-t-2 border-gray-100 w-full max-w-xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Award className="text-orange-600 w-8 h-8" />
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
                        Unlock Your Full <br /> <span className="text-orange-600">Recovery</span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-500 mb-8 font-medium">
                        A great leap forward! Unlock the <b>Full Curriculum</b>, precision STT analysis, and detailed progress reports.
                    </p>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xl sm:text-2xl font-black py-4 sm:py-6 rounded-2xl shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center"
                    >
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-1 opacity-90">Total Access</span>
                        <div className="flex items-center gap-2">
                            <span>Enroll Now - $10/mo</span>
                            <FastForward className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-6 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (dailyTasks.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6 text-center font-lexend text-gray-900">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <Award size={40} />
                </div>
                <h1 className="text-4xl font-black mb-4">Curriculum Completed!</h1>
                <p className="text-gray-500 font-medium mb-8">You have reached the end of the 90-day program.</p>
                <button onClick={() => navigate('/dashboard')} className="bg-orange-600 text-white px-8 py-4 rounded-full font-black hover:bg-orange-700 active:scale-95 transition-all">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const currentTask = dailyTasks[currentTaskIndex];
    const imageUrl = getImagePath(currentTask);

    const getTypeIcon = (taskType) => {
        if (taskType === 'aphasia') return <PlayCircle size={14} className="text-blue-500" />;
        if (taskType === 'crisis') return <Award size={14} className="text-red-500" />;
        if (taskType === 'sequencing') return <LayoutGrid size={14} className="text-purple-500" />;
        if (taskType === 'matching') return <Plus size={14} className="text-orange-500" />;
        return null;
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 font-lexend relative">

            {/* Sticky Header */}
            <header className="flex-none z-50 bg-white border-b border-gray-200 shadow-sm px-4 h-14 flex items-center justify-between relative">
                <div className="flex-1 flex justify-start">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center gap-1 text-gray-700 hover:text-orange-600 p-2 -ml-2 rounded-lg transition-colors active:bg-gray-100"
                        aria-label="Previous Unit"
                    >
                        <ArrowLeft className="w-6 h-6" />
                        <span className="text-sm sm:text-base font-bold tracking-tight">Pause</span>
                    </button>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center w-full max-w-[250px] pointer-events-none">
                    <span className="text-sm sm:text-base font-black text-gray-900 tracking-tighter uppercase line-clamp-1 text-center w-full flex items-center justify-center gap-1">
                        Day {currentDay} Mission
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-0.5">
                        Task {currentTaskIndex + 1} of {dailyTasks.length}
                    </span>
                </div>

                <div className="flex-1 flex justify-end">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-gray-500 hover:text-orange-600 p-2 -mr-2 rounded-lg transition-colors active:bg-gray-100"
                        aria-label="Go to Dashboard"
                    >
                        <Home className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Daily Mix Progress Bar */}
            <div className="shrink-0 bg-white border-b border-gray-200 py-3 overflow-x-auto scrollbar-hide px-4 shadow-sm z-10">
                <div className="flex gap-2 max-w-2xl mx-auto items-center justify-center w-full">
                    {dailyTasks.map((t, index) => {
                        const isCompleted = index < currentTaskIndex;
                        const isActive = index === currentTaskIndex;
                        const isFuture = index > currentTaskIndex;

                        return (
                            <div key={index} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                    ${isActive ? 'bg-orange-600 text-white border-orange-700 shadow-md scale-110' :
                                        isCompleted ? 'bg-green-500 text-white border-green-600' :
                                            'bg-gray-50 text-gray-300 border-gray-200'}
                                `}>
                                    {isCompleted ? <Award size={14} /> : getTypeIcon(t.task_type)}
                                </div>
                                {index < dailyTasks.length - 1 && (
                                    <div className={`w-4 sm:w-8 h-1 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'} mx-0.5 rounded-full transition-colors`}></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Core Engine Rendering */}
            <WorksheetEngine
                task={currentTask}
                imageUrl={imageUrl}
                userProfile={userProfile}
                effectiveIsPaid={effectiveIsPaid}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default Therapy;
