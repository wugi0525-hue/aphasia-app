import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Coffee, Stethoscope, ChevronRight } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import VaultEngine from '../components/VaultEngine';
import vaultData from '../data/vault_scenarios_spec.json';

const Vault = () => {
    const navigate = useNavigate();
    const { userProfile, loading } = useAuth();
    const location = useLocation();

    const isAdmin = userProfile?.role?.toLowerCase() === 'admin';
    const isTestMode = userProfile?.testPaywallInAdmin === true;
    const isPaidByTier = userProfile?.subscriptionTier !== 'free';
    const effectiveIsPaid = isAdmin ? !isTestMode : isPaidByTier;

    useEffect(() => {
        if (!loading && !userProfile) navigate('/login');
    }, [loading, userProfile, navigate]);

    const queryParams = new URLSearchParams(location.search);
    const urlScenarioId = queryParams.get('s');

    const [selectedScenario, setSelectedScenario] = useState(
        urlScenarioId ? vaultData.find(s => s.scenario_id === urlScenarioId) : null
    );

    const [showPaywall, setShowPaywall] = useState(false);

    useEffect(() => {
        if (selectedScenario && !selectedScenario.is_free_teaser && !effectiveIsPaid) {
            setShowPaywall(true);
        } else {
            setShowPaywall(false);
        }
    }, [selectedScenario, effectiveIsPaid]);

    if (loading) return null;
    if (!userProfile) return null;

    if (showPaywall) {
        return (
            <div className="flex-1 bg-gray-900 flex flex-col items-center justify-center p-4 pb-20">
                <div className="bg-gray-800 p-6 sm:p-10 rounded-3xl border border-gray-700 w-full max-w-xl shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-400"></div>
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="text-yellow-500 w-8 h-8" />
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tighter">
                        The <span className="text-yellow-500">Vault</span> is Locked
                    </h2>
                    <p className="text-gray-400 text-sm sm:text-base mb-8">
                        Upgrade to Premium to unlock unlimited roleplay scenarios and practice in real-world simulations.
                    </p>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 text-xl font-black py-4 rounded-xl transition-all"
                    >
                        Unlock The Vault - $10/mo
                    </button>
                    <button
                        onClick={() => setSelectedScenario(null)}
                        className="mt-6 text-gray-400 font-bold text-sm uppercase tracking-widest hover:text-white transition-colors p-2"
                    >
                        Return to Scenarios
                    </button>
                </div>
            </div>
        );
    }

    if (selectedScenario) {
        return (
            <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden font-lexend">
                <div className="shrink-0 bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center z-10">
                    <button onClick={() => setSelectedScenario(null)} className="text-blue-600 font-bold text-sm hover:underline">
                        ← Back to List
                    </button>
                    <span className="text-xs font-black uppercase text-gray-400 tracking-widest pr-4">The Vault Simulation</span>
                </div>
                <VaultEngine
                    scenario={selectedScenario}
                    userProfile={userProfile}
                    onComplete={() => {
                        window.alert("Scenario Complete! Returning to the Vault.");
                        setSelectedScenario(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-900 overflow-y-auto font-lexend p-4 pb-24 sm:p-8">
            <div className="mb-8 mt-4 text-center">
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase mb-2">
                    The <span className="text-yellow-500">Vault</span>
                </h1>
                <p className="text-gray-400">Real-world simulation roleplays</p>
            </div>

            <div className="max-w-3xl w-full mx-auto space-y-4">
                {vaultData.map(scenario => {
                    const isLocked = !scenario.is_free_teaser && !effectiveIsPaid;
                    return (
                        <button
                            key={scenario.scenario_id}
                            onClick={() => setSelectedScenario(scenario)}
                            className="w-full flex items-center p-4 sm:p-6 bg-gray-800 border-2 border-transparent hover:border-gray-600 rounded-2xl transition-all group active:scale-[0.98] text-left"
                        >
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shrink-0 mr-4 ${isLocked ? 'bg-gray-700/50' : 'bg-blue-500/20'}`}>
                                {isLocked ? <Lock className="text-gray-500 w-6 h-6 sm:w-8 sm:h-8" /> :
                                    scenario.scenario_id.includes('cafe') ? <Coffee className="text-blue-400 w-6 h-6 sm:w-8 sm:h-8" /> :
                                        <Stethoscope className="text-blue-400 w-6 h-6 sm:w-8 sm:h-8" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {scenario.is_free_teaser && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] sm:text-xs font-black uppercase rounded">Free Teaser</span>}
                                    <h3 className={`text-lg sm:text-2xl font-black truncate ${isLocked ? 'text-gray-400' : 'text-white'}`}>{scenario.title}</h3>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">{scenario.description}</p>
                            </div>
                            <ChevronRight className={`w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-4 shrink-0 ${isLocked ? 'text-gray-600' : 'text-gray-400 group-hover:text-white transition-colors'}`} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Vault;

