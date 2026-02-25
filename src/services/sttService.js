export const startListening = (targetWord, onResult, onError, onEnd, onStart) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error("Speech recognition not supported in this browser.");
        if (onError) onError("Browser not supported");
        return null;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
        if (onStart) onStart();
    };

    recognition.onresult = (event) => {
        let interimText = '';
        let finalResult = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalResult = transcript;
            } else {
                interimText += transcript;
            }
        }

        if (onResult) {
            onResult({
                interim: interimText,
                final: finalResult
            });
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (onError) onError(event.error);
    };

    recognition.onend = () => {
        if (onEnd) onEnd();
    };

    try {
        recognition.start();
    } catch (e) {
        console.error("Failed to start speech recognition:", e);
        if (onError) onError("Failed to start microphone");
    }

    return recognition;
};

