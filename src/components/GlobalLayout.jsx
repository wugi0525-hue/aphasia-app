import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export default function GlobalLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const isDashboard = location.pathname === '/dashboard';
    const isTherapy = location.pathname.startsWith('/therapy');

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {!isTherapy && (
                <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 h-14 flex items-center justify-between relative">
                    <div className="flex-1 flex justify-start">
                        {!isDashboard && (
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-gray-700 hover:text-orange-600 p-2 -ml-2 rounded-lg transition-colors active:bg-gray-100"
                                aria-label="Go Back"
                            >
                                <ArrowLeft className="w-6 h-6" />
                                <span className="text-lg font-medium tracking-tight">Back</span>
                            </button>
                        )}
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 flex justify-center w-full max-w-[200px] pointer-events-none">
                        <span className="text-lg font-black tracking-tighter text-gray-900">Language Therapy</span>
                    </div>

                    <div className="flex-1 flex justify-end">
                        {/* Placeholder for future right-aligned items */}
                    </div>
                </header>
            )}

            <main className="flex-1 overflow-y-auto pb-6 relative">
                <Outlet />
            </main>
        </div>
    );
}
