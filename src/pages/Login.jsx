import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, PlayCircle } from 'lucide-react';
import { useAuth } from '../services/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { loginWithGoogle, loginWithApple, loginAnonymously, userProfile, loading, logout } = useAuth();
    const [isInAppBrowser, setIsInAppBrowser] = React.useState(false);
    const [isLoggingIn, setIsLoggingIn] = React.useState(false);

    React.useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const targetUrl = window.location.href;

        // Detect in-app browsers
        if (/KAKAOTALK/i.test(userAgent)) {
            setIsInAppBrowser(true);
            // Auto force-redirect for KakaoTalk
            if (/android/i.test(userAgent)) {
                window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(targetUrl)}`;
            } else if (/iphone|ipad|ipod/i.test(userAgent)) {
                // iOS Kakao
                window.location.href = `kakaoweb://closeWindow`;
                window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(targetUrl)}`;
            }
        } else if (/Instagram|FBAN|FBAV|Line|Daum|Naver/i.test(userAgent)) {
            setIsInAppBrowser(true);
            // Auto force-redirect for Naver/Android
            if (/android/i.test(userAgent)) {
                window.location.href = `intent://${targetUrl.replace(/https?:\/\//i, '')}#Intent;scheme=https;package=com.android.chrome;end`;
            }
        }
    }, []);

    // Redirect if already logged in and profile exists
    React.useEffect(() => {
        if (!loading && userProfile) {
            navigate('/dashboard');
        }
    }, [userProfile, loading, navigate]);

    const handleGoogleLogin = async () => {
        setIsLoggingIn(true);
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error("Login failed", error);
            setIsLoggingIn(false);
        }
    };

    const handleAppleLogin = async () => {
        setIsLoggingIn(true);
        try {
            await loginWithApple();
        } catch (error) {
            console.error("Login failed", error);
            setIsLoggingIn(false);
        }
    };

    const handleGuestLogin = async () => {
        setIsLoggingIn(true);
        try {
            await loginAnonymously();
        } catch (error) {
            console.error("Guest login failed", error);
            alert("Guest login is currently unavailable. Please use Google/Apple or try again later.");
            setIsLoggingIn(false);
        }
    };

    if (loading || isLoggingIn) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center text-gray-900 font-lexend">
                <div className="w-20 h-20 border-8 border-gray-100 border-t-orange-600 rounded-full animate-spin mb-10 shadow-inner"></div>
                <h2 className="text-4xl font-black text-gray-900 animate-pulse tracking-tight">Authenticating...</h2>
                <p className="mt-5 text-gray-400 font-bold uppercase tracking-[0.3em] text-sm md:text-lg">Please wait a moment</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center text-gray-900 font-lexend overflow-x-hidden">
            <div className="mb-8 md:mb-12 mt-4">
                <h1 className="text-4xl md:text-6xl font-black mb-2 md:mb-4 tracking-tight">Aphasia Therapy</h1>
                <p className="text-lg md:text-2xl text-gray-500 font-medium tracking-tight">Global Speech Recovery</p>
            </div>

            <div className="w-full max-w-3xl flex flex-col gap-6 md:gap-8 px-2 md:px-0">
                <div className="bg-gray-50 p-6 md:p-10 rounded-3xl md:rounded-[40px] border-2 border-gray-100 italic text-lg md:text-2xl text-gray-400 font-bold uppercase tracking-widest leading-relaxed md:leading-loose">
                    Log in below to start <br className="hidden md:block" />
                    <span className="text-orange-500 font-black md:ml-2">Daily Therapy</span>
                    <br className="md:hidden" />
                    <span className="md:hidden text-gray-300 mx-2">OR</span>
                    <span className="text-blue-500 font-black md:ml-2">Progress Review</span>
                </div>
            </div>

            {isInAppBrowser && (
                <div className="w-full max-w-3xl mt-6 md:mt-8 bg-orange-50 text-orange-700 p-6 md:p-8 rounded-3xl md:rounded-[40px] border-4 border-orange-200 shadow-xl transition-all animate-fade-in z-50 relative">
                    <h2 className="text-xl md:text-3xl font-black mb-3 md:mb-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-center">
                        <ShieldCheck size={32} className="text-orange-500 md:w-9 md:h-9" />
                        In-App Browser Blocked
                    </h2>
                    <p className="text-base md:text-xl font-medium mb-4 md:mb-6 leading-relaxed text-gray-800">
                        You are currently inside a <b>Restricted Browser</b> (Kakao/Instagram/Line).<br className="hidden md:block" />
                        Google Login is <span className="text-orange-600 font-bold">100% BLOCKED</span> here for security reasons.
                    </p>
                    <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-orange-100 text-left w-full mx-auto max-w-lg mb-5 md:mb-6 shadow-sm">
                        <p className="text-base md:text-lg font-bold text-gray-700 mb-2">💡 How to fix it</p>
                        <p className="text-sm md:text-lg text-gray-600 leading-relaxed tracking-tight">
                            Click the button below to copy the link, then open <b>'Chrome', 'Safari', or 'Samsung Internet'</b> and paste it in the address bar!
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText('https://language-therapy-58893.web.app/login');
                            alert('Link (https://language-therapy-58893.web.app/login) copied!\n\nPlease open Chrome or Safari and paste it.');
                        }}
                        className="bg-orange-600 text-white px-6 py-4 md:px-8 md:py-5 rounded-full font-black text-lg md:text-2xl shadow-lg border-b-4 border-orange-800 hover:bg-orange-500 active:border-b-0 active:translate-y-1 transition-all w-full"
                    >
                        ?�� Copy Redirect Link
                    </button>
                    <p className="mt-3 md:mt-4 text-xs md:text-sm text-gray-500 font-bold">* Everything works perfectly in standard internet apps!</p>
                </div>
            )}

            <div className="mt-10 md:mt-16 flex flex-col items-center gap-6 md:gap-10 w-full max-w-md px-4 md:px-0">
                <p className="text-sm md:text-base text-gray-400 font-bold tracking-widest uppercase border-b-2 border-gray-50 pb-2">Safe & Secure Social Login</p>
                <div className="flex flex-col gap-4 w-full">
                    {/* Guest Login Button (Primary Action for New Users) */}
                    <button
                        onClick={handleGuestLogin}
                        className="flex items-center justify-center gap-3 md:gap-4 bg-orange-600 border-4 border-orange-700 py-4 md:py-6 px-4 md:px-8 rounded-2xl md:rounded-[30px] hover:bg-orange-500 hover:border-orange-600 transition-all group shadow-lg md:shadow-xl active:scale-95 w-full mb-2 md:mb-4"
                    >
                        <PlayCircle className="text-white w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform" />
                        <span className="text-xl md:text-2xl font-black text-white">Try Free Trial (No Login)</span>
                    </button>

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center gap-4 bg-white border-4 border-gray-100 py-4 md:py-5 px-4 md:px-12 rounded-2xl md:rounded-[30px] hover:border-orange-500 transition-all group shadow-md active:scale-95 w-full"
                    >
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-50 rounded-full flex items-center justify-center font-black text-xl md:text-2xl text-orange-500 group-hover:scale-110 transition-transform">G</div>
                        <span className="text-lg md:text-xl font-black text-gray-700">Google Login</span>
                    </button>

                    {/* Apple Login Button */}
                    <button
                        onClick={handleAppleLogin}
                        className="flex items-center justify-center gap-4 bg-white border-4 border-gray-100 py-4 md:py-5 px-4 md:px-12 rounded-2xl md:rounded-[30px] hover:border-black transition-all group shadow-md active:scale-95 w-full"
                    >
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-50 rounded-full flex items-center justify-center font-black text-xl md:text-2xl text-black group-hover:scale-110 transition-transform">A</div>
                        <span className="text-lg md:text-xl font-black text-gray-700">Apple Login</span>
                    </button>
                </div>
            </div>

            <p className="mt-8 text-xs md:text-sm text-gray-300 font-bold uppercase tracking-tighter">Powered by Firebase & Google DeepMind</p>
        </div>
    );
};

export default Login;

