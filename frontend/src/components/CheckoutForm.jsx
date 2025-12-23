import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { formatPriceVND } from '../utils/currency';

const CheckoutForm = ({ amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL only used if card requires 3DS redirect, but we might handle inline
                return_url: `${window.location.origin}/account/orders`,
            },
            redirect: 'if_required', // Handle success manually if no redirect needed
        });

        if (error) {
            setMessage(error.message);
            onError && onError(error.message);
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            setMessage("Payment succeeded!");
            onSuccess && onSuccess(paymentIntent);
            // Don't set loading false immediately to prevent double submissions or UI flicker before redirect
        } else {
            setMessage("Unexpected state.");
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#2d152d] border border-[#482348] rounded-xl p-4">
                <PaymentElement
                    options={{
                        layout: "tabs",
                        theme: 'night',
                        variables: {
                            colorPrimary: '#d411d4',
                            colorBackground: '#2d152d',
                            colorText: '#ffffff',
                            colorDanger: '#ff4444',
                            fontFamily: 'Space Grotesk, system-ui, sans-serif',
                            borderRadius: '8px',
                        }
                    }}
                />
            </div>

            {message && (
                <div className={`text-sm ${message.includes('succeeded') ? 'text-green-400' : 'text-red-400'}`}>
                    {message}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full bg-[#d411d4] hover:bg-[#d411d4]/90 text-white font-bold py-4 px-12 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-[#d411d4]/20 text-lg tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span id="button-text">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                            Processing...
                        </div>
                    ) : (
                        `Pay ${formatPriceVND(amount)}`
                    )}
                </span>
            </button>
        </form>
    );
};

export default CheckoutForm;
