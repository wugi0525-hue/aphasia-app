import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Users, ShieldCheck, Zap } from 'lucide-react';
import { loadPayPalScript } from '../services/paymentService';
import { useAuth } from '../services/AuthContext';

const Checkout = () => {
    const navigate = useNavigate();
    const { userProfile, loading, updateProfile } = useAuth();
    const paypalContainerRef = useRef(null);
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error, cancelled

    const PAYPAL_PLAN_ID = 'P-8XW299141N561171WNGM5VIY';
    const PAYPAL_CLIENT_ID = 'AehcwZotgvnej9vOpVCZldOwGnQttxg9sDpR7eMAs2F6tIBkmPHeTFVNuPPl-RArMamk4budb3b__VFl';

    useEffect(() => {
        if (!loading && userProfile?.subscriptionTier === 'basic') {
            navigate('/dashboard');
        } else if (!loading && !userProfile) {
            navigate('/login');
        } else if (!loading) {
            initPayPal();
        }
    }, [userProfile?.subscriptionTier, loading]);

    const initPayPal = async () => {
        try {
            const paypal = await loadPayPalScript(PAYPAL_CLIENT_ID);
            if (paypal && paypalContainerRef.current) {
                // Clear container before rendering
                paypalContainerRef.current.innerHTML = '';

                paypal.Buttons({
                    style: {
                        shape: 'pill',
                        color: 'black',
                        layout: 'vertical',
                        label: 'subscribe'
                    },
                    createSubscription: (data, actions) => {
                        return actions.subscription.create({
                            'plan_id': PAYPAL_PLAN_ID
                        });
                    },
                    onApprove: async (data, actions) => {
                        console.log('Subscription Approved:', data);
                        setPaymentStatus('processing');

                        try {
                            // Update user to basic tier upon successful subscription
                            await updateProfile({
                                subscriptionTier: 'basic',
                                subscriptionId: data.subscriptionID // Store subscription ID for reference
                            });
                            setPaymentStatus('success');
                            setTimeout(() => navigate('/dashboard'), 2000);
                        } catch (error) {
                            console.error("Failed to update profile:", error);
                            setPaymentStatus('error');
                        }
                    },
                    onError: (err) => {
                        console.error('PayPal Error:', err);
                        setPaymentStatus('error');
                        alert("Payment encountered an error. Please try again.");
                    },
                    onCancel: () => {
                        console.log('Subscription cancelled');
                        setPaymentStatus('cancelled');
                    }
                }).render(paypalContainerRef.current);
            }
        } catch (error) {
            console.error("Failed to load PayPal", error);
            setPaymentStatus('error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center text-gray-900 font-lexend">
                <div className="w-16 h-16 border-4 border-gray-100 border-t-orange-600 rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-black text-gray-900 animate-pulse uppercase tracking-widest">Syncing Data...</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 md:p-12 font-lexend">
            <div className="bg-white p-8 md:p-16 rounded-[40px] md:rounded-[60px] border-b-[12px] border-orange-600 border-x-4 border-t-4 border-gray-100 max-w-4xl w-full shadow-2xl">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 text-center md:text-left">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-8 mx-auto md:mx-0">
                            <Award className="text-orange-600 w-12 h-12" />
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
                            Unlock Your <br /> <span className="text-orange-600">Recovery</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-500 mb-8 font-medium leading-relaxed">
                            Upgrade to PREMIUM ACCESS and unlock all 90+ worksheets, clinical reports, and advanced AI analysis.
                        </p>

                        <div className="grid grid-cols-1 gap-6 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-50 p-2 rounded-xl">
                                    <ShieldCheck className="text-green-600 w-6 h-6" />
                                </div>
                                <p className="font-bold text-gray-700">90+ Clinical Worksheets</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-50 p-2 rounded-xl">
                                    <Zap className="text-blue-600 w-6 h-6" />
                                </div>
                                <p className="font-bold text-gray-700">Detailed Progress Reports</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-purple-50 p-2 rounded-xl">
                                    <Users className="text-purple-600 w-6 h-6" />
                                </div>
                                <p className="font-bold text-gray-700">Caregiver Dashboard Access</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-96 flex flex-col gap-4">
                        <div className="bg-gray-50 p-6 md:p-8 rounded-[30px] border-2 border-gray-100 text-center">
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1 block">Monthly Subscription</span>
                            <div className="flex items-center justify-center gap-1 mb-4">
                                <span className="text-xl font-black text-gray-400">$</span>
                                <span className="text-5xl font-black text-gray-900">10</span>
                                <span className="text-lg font-bold text-gray-400">/mo</span>
                            </div>

                            <div ref={paypalContainerRef} className="min-h-[140px]">
                                {paymentStatus === 'processing' ? (
                                    <div className="flex flex-col items-center justify-center h-[100px] gap-2">
                                        <div className="w-8 h-8 border-4 border-gray-100 border-t-orange-600 rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-black uppercase text-gray-400">Processing...</p>
                                    </div>
                                ) : paymentStatus === 'success' ? (
                                    <div className="flex flex-col items-center justify-center h-[100px] gap-2">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white"></div>
                                        <p className="text-[10px] font-black uppercase text-green-600">Success!</p>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in duration-500">
                                        {/* PayPal buttons load here */}
                                        <div className="animate-pulse flex flex-col gap-2">
                                            <div className="h-10 bg-gray-200 rounded-xl"></div>
                                            <div className="h-10 bg-gray-200 rounded-xl"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                                Secure 256-bit SSL Encrypted Payment
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors text-center"
                        >
                            Or Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

