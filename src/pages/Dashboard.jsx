import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, TrendingUp, Calendar, Award, LogOut, CheckCircle, Play, Lock, Activity, ChevronRight, LayoutList, AlertTriangle, Settings, Shield, Camera } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { loadPayPalScript, PAYPAL_CLIENT_ID } from '../services/paymentService';
import { getSummaryAnalytics } from '../services/analyticsService';

const Dashboard = () => {
    const { userProfile, loading, updateProfile, logout } = useAuth();
    const navigate = useNavigate();
    const isAdmin = userProfile?.role?.toLowerCase() === 'admin';
    const isTestMode = userProfile?.testPaywallInAdmin === true;
    const isPaidByTier = userProfile?.subscriptionTier !== 'free';
    const effectiveIsPaid = isAdmin ? !isTestMode : isPaidByTier;

    const FREE_SAMPLES = [1, 12, 22, 36, 50, 64, 71];

    // UI State: Default ALL collapsed
    const [expandedPhase, setExpandedPhase] = useState(null);
    const [expandedStage, setExpandedStage] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        if (!loading && !userProfile) {
            navigate('/login');
        } else if (userProfile) {
            loadAnalytics();
        }
    }, [loading, userProfile, navigate]);

    const loadAnalytics = async () => {
        const data = await getSummaryAnalytics(userProfile.uid);
        if (data) setAnalytics(data);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center text-gray-900 font-lexend">
                <div className="w-16 h-16 border-4 border-gray-100 border-t-orange-600 rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-black text-gray-900 animate-pulse uppercase tracking-widest">Syncing Data...</h2>
            </div>
        );
    }

    if (!userProfile) return null;

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/login';
        } catch (error) {
            console.error("Logout failed:", error);
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-lexend text-gray-900 overflow-x-hidden">
            {/* Header: Clean & Integrated Status */}
            <header className="bg-white/80 backdrop-blur-md border-b-2 border-gray-100 py-4 px-4 md:px-10 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="w-full sm:w-auto">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-xl md:text-3xl font-black tracking-tighter text-gray-900">
                                Recovery Dashboard
                                <span className="ml-2 py-0.5 px-3 rounded-full bg-gray-100 text-[10px] md:text-xs font-bold text-gray-500 border border-gray-200 uppercase tracking-widest">
                                    {effectiveIsPaid ? "Full Access" : "Limited Access"}
                                </span>
                            </h1>
                            {isAdmin && (
                                <span className="bg-purple-600 text-white text-[10px] md:text-xs px-2 py-0.5 rounded-full italic font-bold uppercase">Admin</span>
                            )}
                        </div>
                        <p className="text-gray-400 text-[10px] md:text-sm font-bold uppercase tracking-[0.1em] flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Managing for: <span className="text-gray-900">{userProfile?.displayName || 'Active Patient'}</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end items-center">
                        {isAdmin && (
                            <div className="flex items-center gap-4 bg-gray-50 px-4 py-1.5 rounded-xl border border-gray-100 shadow-sm mr-2 transition-all hover:shadow-md">
                                <div className="flex items-center gap-2">
                                    <Settings size={14} className="text-gray-400" />
                                    <span className="text-[10px] font-black uppercase text-gray-400">Admin Lab:</span>
                                </div>

                                <label className="flex items-center gap-1.5 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={userProfile?.testPaywallInAdmin}
                                        onChange={(e) => updateProfile({ testPaywallInAdmin: e.target.checked })}
                                        className="w-3.5 h-3.5 accent-orange-600 rounded cursor-pointer"
                                    />
                                    <span className="text-[10px] font-bold text-gray-600 group-hover:text-orange-600 transition-colors uppercase">Test Paywall</span>
                                </label>

                                <div className="w-px h-4 bg-gray-200"></div>

                                <label className="flex items-center gap-1.5 cursor-pointer group relative">
                                    <input
                                        type="checkbox"
                                        checked={userProfile?.useCloudSttInAdmin}
                                        onChange={(e) => updateProfile({ useCloudSttInAdmin: e.target.checked })}
                                        className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer"
                                    />
                                    <span className="text-[10px] font-bold text-gray-600 group-hover:text-blue-600 transition-colors uppercase flex items-center gap-1">
                                        Google SST
                                        {userProfile?.useCloudSttInAdmin && <AlertTriangle size={10} className="text-orange-500 animate-pulse" title="Caution: Billing Active" />}
                                    </span>
                                </label>
                            </div>
                        )}

                        <button
                            onClick={async () => {
                                await updateProfile({ subscriptionTier: 'free', currentWorksheet: 1, testPaywallInAdmin: false, useCloudSttInAdmin: false });
                                window.location.reload();
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold px-3 py-1 rounded-lg text-[9px] uppercase transition-all"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 p-2 rounded-xl transition-all active:scale-95 border border-orange-100"
                        >
                            <LogOut size={18} className="md:w-5 md:h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                {/* Main Content Area (Wider) */}
                <div className="lg:col-span-3 space-y-6 md:space-y-8">

                    {/* PRIMARY ACTION: conditionally Continue Study or Sample Taste */}
                    {!effectiveIsPaid ? (
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-[50px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <Link
                                to="/therapy?w=1"
                                className="relative bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black py-5 md:py-8 px-6 rounded-[32px] md:rounded-[40px] shadow-2xl w-full transition-all duration-300 active:scale-95 italic text-center flex flex-col items-center justify-center gap-2 group overflow-hidden border border-teal-400/30"
                            >
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                                <span className="text-sm md:text-base font-bold text-teal-100 uppercase tracking-[0.2em] not-italic mb-1 drop-shadow-sm flex items-center gap-2">
                                    <Play size={16} className="fill-current" /> Try the free experience
                                </span>
                                <span className="text-4xl md:text-7xl uppercase tracking-tighter drop-shadow-md">Start<br className="md:hidden" /> Today's Training</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-[50px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <Link
                                to="/therapy"
                                className="relative bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black py-5 md:py-8 px-6 rounded-[32px] md:rounded-[40px] shadow-2xl w-full transition-all duration-300 active:scale-95 italic text-center flex flex-col items-center justify-center gap-2 group overflow-hidden border border-orange-400/30"
                            >
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                                <span className="text-sm md:text-base font-bold text-orange-100 uppercase tracking-[0.2em] not-italic mb-1 drop-shadow-sm flex items-center gap-2">
                                    <Play size={16} className="fill-current" /> Ready for today's session?
                                </span>
                                <span className="text-4xl md:text-7xl uppercase tracking-tighter drop-shadow-md">Start<br className="md:hidden" /> Today's Training</span>
                            </Link>
                        </div>
                    )}

                    {/* Mastery Metrics Card - Refined & Clickable */}
                    <div
                        onClick={() => navigate('/report')}
                        className="bg-white rounded-[32px] p-6 md:p-8 shadow-xl border-2 border-white cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all group relative overflow-hidden"
                    >
                        <div className="mb-6 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-50 p-2 rounded-xl group-hover:bg-green-100 transition-colors">
                                    <TrendingUp className="text-green-600 w-6 h-6" />
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black tracking-tighter">Diagnostic Analytics</h2>
                            </div>
                            <div className="bg-gray-100 px-3 py-1.5 rounded-full text-[10px] font-black text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all uppercase tracking-widest">
                                View Full Report ➔
                            </div>
                        </div>

                        <div className="bg-gray-50/50 rounded-[24px] p-6 border-2 border-white shadow-inner grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-[8px] border-gray-200 flex items-center justify-center bg-white shadow-sm">
                                    <div className="absolute inset-0 rounded-full border-[8px] border-orange-500 border-t-transparent border-l-transparent" style={{ transform: 'rotate(45deg)' }}></div>
                                    <div className="text-center">
                                        <span className="text-xl md:text-3xl font-black text-gray-900">{analytics?.accuracy || 0}%</span>
                                        <span className="block text-[7px] md:text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">Accuracy</span>
                                    </div>
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Articulation Quality</p>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] md:text-xs">
                                        <span className="font-black text-gray-600 uppercase">Vocabulary Variance</span>
                                        <span className="font-bold text-blue-600">{analytics?.vocabVariance || 0} Successful Units</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((analytics?.vocabVariance || 0) * 10, 100)}% ` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] md:text-xs">
                                        <span className="font-black text-gray-600 uppercase">Processing Latency</span>
                                        <span className="font-bold text-green-600">{analytics?.latency || 0}s Avg</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.max(100 - (analytics?.latency || 0) * 20, 10)}% ` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Roadmap Section removed to adhere to Zero-Friction UX */}
                </div>

                {/* Right Sidebar: Contextual Actions */}
                <div className="space-y-6">
                    {/* Family Lounge Entry */}
                    <div className="bg-white rounded-[28px] p-6 shadow-xl border-t-8 border-indigo-500 border-x-2 border-white flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={16} className="text-indigo-500" />
                            <h3 className="text-xl font-black tracking-tighter text-gray-900">Family Lounge</h3>
                        </div>
                        <p className="text-gray-500 text-xs font-medium mb-6 leading-relaxed">
                            Upload photos of your family members and familiar objects to enhance therapy.
                        </p>
                        <button
                            onClick={() => navigate('/family-lounge')}
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-black text-sm py-3 rounded-xl w-full transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Camera size={16} />
                            Manage Custom Photos
                        </button>
                    </div>
                    {/* Paywall Card - Visible for free users AND admins in Test Mode */}
                    {!effectiveIsPaid && (
                        <div className="bg-white rounded-[28px] p-6 shadow-2xl border-t-8 border-orange-600 border-x-2 border-white flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield size={16} className="text-orange-600" />
                                <h3 className="text-xl font-black tracking-tighter text-gray-900">Unlock Mastery</h3>
                            </div>
                            <p className="text-gray-500 text-xs font-medium mb-6 leading-relaxed">
                                Proceed through all 4 Phases, with integrated clinical speech reporting.
                            </p>
                            <button
                                onClick={() => navigate('/checkout')}
                                className="bg-orange-600 hover:bg-black text-white font-black text-sm py-4 rounded-xl shadow-lg w-full transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <CreditCard size={16} />
                                Upgrade To Premium
                            </button>
                        </div>
                    )}


                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] text-center px-4 leading-loose mt-12">
                        Neuro-Linguistic Recovery <br /> Systems v2.3
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

