export const loadPayPalScript = (clientId) => {
    return new Promise((resolve, reject) => {
        if (window.paypal) {
            resolve(window.paypal);
            return;
        }
        const script = document.createElement('script');
        const url = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&vault=true&intent=subscription`;
        script.src = url;
        script.onload = () => resolve(window.paypal);
        script.onerror = () => reject(new Error('PayPal SDK could not be loaded.'));
        document.body.appendChild(script);
    });
};

export const PAYPAL_CLIENT_ID = "AehcwZotgvnej9vOpVCZldOwGnQttxg9sDpR7eMAs2F6tIBkmPHeTFVNuPPl-RArMamk4budb3b__VFl";
