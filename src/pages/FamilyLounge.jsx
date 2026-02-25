import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, Image as ImageIcon, Trash2, ArrowLeft, Camera } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const FamilyLounge = () => {
    const navigate = useNavigate();
    const { userProfile, loading } = useAuth();
    const [pinEntry, setPinEntry] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [customAssets, setCustomAssets] = useState({});
    const [uploadingWord, setUploadingWord] = useState(null);

    // List of priority words/concepts for dementia tracking where photos help immensely
    const priorityConcepts = [
        "Spouse", "Daughter", "Son", "Grandchild", "My House", "My Room", "My Cup", "My Medicine"
    ];

    useEffect(() => {
        if (!loading && !userProfile) navigate('/login');
    }, [loading, userProfile, navigate]);

    useEffect(() => {
        if (isAuthenticated && userProfile) {
            loadCustomAssets();
        }
    }, [isAuthenticated, userProfile]);

    const loadCustomAssets = async () => {
        try {
            const docRef = doc(db, 'users', userProfile.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().customAssets) {
                setCustomAssets(docSnap.data().customAssets);
            }
        } catch (error) {
            console.error("Error loading custom assets", error);
        }
    };

    const saveCustomAssets = async (newAssets) => {
        try {
            const docRef = doc(db, 'users', userProfile.uid);
            await setDoc(docRef, { customAssets: newAssets }, { merge: true });
            setCustomAssets(newAssets);
        } catch (error) {
            console.error("Error saving custom asset", error);
            alert("Failed to save. Please try again.");
        }
    };

    const handlePinSubmit = (e) => {
        e.preventDefault();
        // For demonstration, PIN is 1234
        if (pinEntry === '1234') {
            setIsAuthenticated(true);
        } else {
            alert("Incorrect PIN. Please try again.");
            setPinEntry('');
        }
    };

    // Simulated local file upload using base64 for MVP.
    // In production, upload to Firebase Storage and save URL.
    const handleFileUpload = (e, concept) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingWord(concept);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            const newAssets = { ...customAssets, [concept]: base64String };
            await saveCustomAssets(newAssets);
            setUploadingWord(null);
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteAsset = async (concept) => {
        const newAssets = { ...customAssets };
        delete newAssets[concept];
        await saveCustomAssets(newAssets);
    };

    if (loading) return null;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-lexend">
                <div className="bg-white p-8 rounded-[40px] shadow-2xl border-4 border-gray-100 max-w-sm w-full text-center">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Family Lounge</h2>
                    <p className="text-sm text-gray-500 font-medium mb-8">Enter your Supporter PIN to manage custom therapy assets.</p>

                    <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
                        <input
                            type="password"
                            maxLength="4"
                            value={pinEntry}
                            onChange={(e) => setPinEntry(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="****"
                            className="w-full text-center text-3xl font-black tracking-[1em] p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none"
                            autoFocus
                        />
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all">
                            Unlock
                        </button>
                    </form>
                    <button onClick={() => navigate('/dashboard')} className="mt-6 text-gray-400 font-bold text-sm uppercase tracking-widest hover:text-gray-600">
                        Return
                    </button>
                    <p className="mt-8 text-xs text-gray-400">Hint for demo: 1234</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-lexend pb-20">
            <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 sticky top-0 z-50 flex items-center shadow-sm">
                <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 text-gray-500 hover:text-indigo-600 rounded-lg transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="ml-2 flex flex-col">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Family Lounge</h1>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Custom Engine Manager</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
                <div className="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <Camera size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-indigo-900 mb-2">Enhance Memory with Real Photos</h2>
                        <p className="text-sm sm:text-base text-indigo-800/80 font-medium leading-relaxed">
                            Upload photos of actual family members or personal items. Our engine will prioritize showing these familiar images during daily therapy to strengthen personal episodic memory and context recognition.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {priorityConcepts.map((concept) => {
                        const hasImage = !!customAssets[concept];
                        const isUploading = uploadingWord === concept;

                        return (
                            <div key={concept} className={`bg-white rounded-3xl border-2 transition-all overflow-hidden flex flex-col
                                ${hasImage ? 'border-indigo-200 shadow-lg' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}>

                                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-black text-gray-900 tracking-tight">{concept}</h3>
                                    {hasImage && (
                                        <button onClick={() => handleDeleteAsset(concept)} className="text-red-400 hover:text-red-600 transition-colors p-1" title="Remove Photo">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 p-4 flex flex-col items-center justify-center min-h-[160px] relative group">
                                    {isUploading ? (
                                        <div className="flex flex-col items-center text-indigo-500 animate-pulse">
                                            <Upload size={32} className="mb-2" />
                                            <span className="font-bold text-sm">Saving...</span>
                                        </div>
                                    ) : hasImage ? (
                                        <img src={customAssets[concept]} alt={concept} className="w-full h-32 object-contain rounded-xl" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-300 group-hover:text-indigo-400 transition-colors">
                                            <ImageIcon size={48} className="mb-2" />
                                            <span className="font-bold text-sm uppercase tracking-widest">No Image</span>
                                        </div>
                                    )}

                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-b-2xl">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(e, concept)}
                                            disabled={isUploading}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Upload size={20} /> {hasImage ? 'Replace' : 'Upload'}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default FamilyLounge;
