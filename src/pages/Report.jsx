import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { getSummaryAnalytics, getTrialHistory } from '../services/analyticsService';
import { ArrowLeft, Activity, Target, Clock, MessageSquare, Download, Calendar, CheckCircle, XCircle, Lock, FastForward } from 'lucide-react';

const Report = () => {
    const { userProfile, loading } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [fetching, setFetching] = useState(true);

    const isAdmin = userProfile?.role?.toLowerCase() === 'admin';
    const isTestMode = userProfile?.testPaywallInAdmin === true;
    const isPaidByTier = userProfile?.subscriptionTier !== 'free';
    const effectiveIsPaid = isAdmin ? !isTestMode : isPaidByTier;
    const showTeaser = !effectiveIsPaid;

    useEffect(() => {
        if (!loading && !userProfile) {
            navigate('/login');
            return;
        }

        if (userProfile) {
            const loadData = async () => {
                setFetching(true);
                if (showTeaser) {
                    setSummary({ totalTrials: 142, accuracy: 85, latency: 1.2, vocabVariance: 24 });
                    setHistory([
                        { id: '1', timestamp: { toDate: () => new Date() }, targetWord: 'Apple', perceivedWord: 'Apple', similarity: 1.0, latencyMs: 1200, worksheetIndex: 12 },
                        { id: '2', timestamp: { toDate: () => new Date(Date.now() - 86400000) }, targetWord: 'Water please', perceivedWord: 'Water please', similarity: 0.9, latencyMs: 1500, worksheetIndex: 22 },
                        { id: '3', timestamp: { toDate: () => new Date(Date.now() - 172800000) }, targetWord: 'Hospital', perceivedWord: 'Hos...', similarity: 0.4, latencyMs: 3100, worksheetIndex: 36 },
                    ]);
                    setTimeout(() => setFetching(false), 800);
                } else {
                    const [sumData, histData] = await Promise.all([
                        getSummaryAnalytics(userProfile.uid),
                        getTrialHistory(userProfile.uid, 50)
                    ]);
                    setSummary(sumData);
                    setHistory(histData || []);
                    setFetching(false);
                }
            };
            loadData();
        }
    }, [loading, userProfile, navigate, showTeaser]);

    if (loading || fetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold animate-pulse">GENERATING CLINICAL REPORT...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-gray-900 font-sans selection:bg-orange-100 pb-20 relative">
            <header className="bg-white border-b-2 border-gray-100 py-6 px-6 md:px-12 sticky top-0 z-50 backdrop-blur-md bg-white/90">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-3 hover:bg-gray-100 rounded-2xl transition-all active:scale-90"
                        >
                            <ArrowLeft size={28} className="text-gray-800" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-orange-100">Official Record</span>
                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Medical Analytics v1.0</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900">
                                Language Therapy <span className="text-orange-600">Diagnostic Report</span>
                            </h1>
                        </div>
                    </div>

                    <button disabled={showTeaser} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all active:scale-95 shadow-lg shadow-gray-200 disabled:opacity-50 disabled:pointer-events-none">
                        <Download size={18} />
                        EXPORT PDF
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 md:px-12 py-10 relative">



                <div className="transition-all duration-1000">
                    <section className="bg-white rounded-[40px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border-2 border-white mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
                        {showTeaser && <div className="absolute top-4 right-4 rotate-[15deg] text-4xl font-black text-orange-600/10 uppercase tracking-widest border-4 border-orange-600/10 px-6 py-2 rounded-3xl z-10 pointer-events-none">MOCK DATA</div>}
                        <div className="flex items-center gap-6 relative z-20">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-800 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shrink-0">
                                {userProfile?.displayName?.[0] || 'U'}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-2">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{userProfile?.displayName || 'Evaluation User'}</h2>
                                    {showTeaser && (
                                        <button onClick={() => navigate('/checkout')} className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 px-4 py-1.5 rounded-full text-xs font-black transition-colors shadow-sm flex items-center gap-1.5 uppercase tracking-widest self-start sm:self-auto">
                                            <Lock size={12} /> Subscribe to Unlock
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <span className="text-gray-400 text-sm font-bold flex items-center gap-1.5">
                                        <Calendar size={14} /> Joined {userProfile?.createdAt?.toDate ? new Date(userProfile.createdAt.toDate()).toLocaleDateString() : 'Active Member'}
                                    </span>
                                    <span className="text-orange-600 text-sm font-black flex items-center gap-1.5 uppercase tracking-widest">
                                        <Activity size={14} /> Current Status: Recovering
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-3xl p-6 border-2 border-gray-100 flex gap-8 relative z-20">
                            <div className="text-center px-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Trials</p>
                                <p className="text-2xl font-black text-gray-900">{summary?.totalTrials || 0}</p>
                            </div>
                            <div className="w-px h-10 bg-gray-200"></div>
                            <button
                                onClick={() => {
                                    const lastUnit = history.length > 0 && history[0].worksheetIndex ? history[0].worksheetIndex : (userProfile?.currentWorksheet || 1);
                                    navigate(`/therapy?w=${lastUnit}`);
                                }}
                                className="text-center px-4 group cursor-pointer transition-transform active:scale-95"
                            >
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-orange-600 transition-colors">Last Practiced</p>
                                <div className="flex items-center justify-center gap-1 group-hover:text-orange-600 transition-colors">
                                    <p className="text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                                        Unit {history.length > 0 && history[0].worksheetIndex ? history[0].worksheetIndex : (userProfile?.currentWorksheet || 1)}
                                    </p>
                                    <span className="text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity translate-y-0.5">➔</span>
                                </div>
                            </button>
                        </div>
                    </section>

                    {/* NEW: AI Clinical Assessment Text Block */}
                    <section className="bg-white rounded-[35px] p-8 border-2 border-white shadow-xl mb-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-orange-600"></div>
                        <h3 className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Activity size={16} className="text-orange-600" />
                            AI Clinical Assessment
                        </h3>
                        <p className="text-gray-700 text-lg md:text-xl font-medium leading-relaxed">
                            {showTeaser
                                ? "Patient demonstrates a strong 85% articulation accuracy across foundational vocabulary. Processing latency is excellent at an average of 1.2 seconds, indicating rapid lexical retrieval. Slight struggles noted with multi-syllabic targets (e.g., 'Hospital'), resulting in aborted utterances. Recommendation: Proceed to Phase 4 (Complex Communication) to challenge sentence formation while maintaining daily repetition of functional nouns to solidify phonetic mastery."
                                : "Currently collecting sufficient vocal data to generate a comprehensive AI summary. Continue daily practice sessions to build a longitudinal accuracy profile. The AI model requires at least 50 vocal trials to isolate specific articulation errors and recommend targeted therapy adjustments."}
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white p-8 rounded-[35px] border-2 border-white shadow-xl flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                                <Target size={32} />
                            </div>
                            <h3 className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Speech Accuracy</h3>
                            <p className="text-5xl font-black text-gray-900 mb-1">{summary?.accuracy || 0}%</p>
                            <p className="text-xs font-bold text-green-500 uppercase tracking-tighter">Consistent Articulation</p>
                        </div>

                        <div className="bg-white p-8 rounded-[35px] border-2 border-white shadow-xl flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                <Clock size={32} />
                            </div>
                            <h3 className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Avg. Latency</h3>
                            <p className="text-5xl font-black text-gray-900 mb-1">{summary?.latency || 0}s</p>
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-tighter">Response Speed</p>
                        </div>

                        <div className="bg-white p-8 rounded-[35px] border-2 border-white shadow-xl flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                                <MessageSquare size={32} />
                            </div>
                            <h3 className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Vocab Variance</h3>
                            <p className="text-5xl font-black text-gray-900 mb-1">{summary?.vocabVariance || 0}</p>
                            <p className="text-xs font-bold text-orange-500 uppercase tracking-tighter">Lexical Divergence</p>
                        </div>
                    </div>

                    <section>
                        <div className="flex justify-between items-end mb-6 px-2">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Practice Log</h3>
                                <p className="text-gray-400 text-sm font-medium">Detailed audit of recent session performance</p>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last {history.length} attempts</span>
                        </div>

                        <div className="bg-white rounded-[35px] shadow-2xl overflow-hidden border-2 border-white">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date / Time</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Perceived</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Accuracy</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Latency</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-bold italic">No session data available yet.</td>
                                        </tr>
                                    ) : (
                                        history.map((trial, index) => {
                                            const isHighAccuracy = trial.similarity >= 0.7;
                                            return (
                                                <tr key={trial.id || index} className="hover:bg-gray-50/80 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-black text-gray-900 leading-none mb-1">
                                                            {trial.timestamp?.toDate ? trial.timestamp.toDate().toLocaleDateString() : 'Sample Date'}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                            {trial.timestamp?.toDate ? trial.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00 PM'}
                                                        </p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-800">
                                                            {trial.targetWord}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`text-sm font-medium ${trial.similarity > 0.4 ? 'text-gray-700 font-bold' : 'text-gray-300 italic'}`}>
                                                            {trial.perceivedWord || '(No Speech Detected)'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                {isHighAccuracy ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                                                                <span className={`text-base font-black ${isHighAccuracy ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {Math.round(trial.similarity * 100)}%
                                                                </span>
                                                            </div>
                                                            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${isHighAccuracy ? 'bg-green-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${trial.similarity * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <span className="text-base font-black text-gray-900">{(trial.latencyMs / 1000).toFixed(1)}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">sec</span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Report;

