import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ isListening }) => {
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        if (isListening) {
            startVisualizer();
        } else {
            stopVisualizer();
        }

        return () => stopVisualizer();
    }, [isListening]);

    const startVisualizer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64; // Small fft for thick bars

            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);

            draw();
        } catch (err) {
            console.error("Error accessing mic for visualizer:", err);
            // Optionally set fallback animation if mic not accessible
        }
    };

    const stopVisualizer = () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (sourceRef.current) sourceRef.current.disconnect();

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => { });
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw a flat line when stopped
            ctx.fillStyle = '#fca5a5'; // lighter red
            ctx.fillRect(0, canvas.height / 2 - 2, canvas.width, 4);
        }
    };

    const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const renderFrame = () => {
            if (!isListening) return;
            animationRef.current = requestAnimationFrame(renderFrame);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Dynamically adjust sizes based on container size
            const barWidth = (canvas.width / bufferLength) * 2;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                // Scale bar height to fit canvas height
                const pct = dataArray[i] / 255;
                const barHeight = pct * canvas.height;

                ctx.fillStyle = '#ef4444'; // Tailwind orange-500
                // Match the visualizer's vertical center
                const y = (canvas.height - barHeight) / 2;

                // Add soft rounded corners using arcTo or roundRect if supported 
                // but standard fillRect is faster
                ctx.fillRect(x, y, barWidth - 2, Math.max(4, barHeight));

                x += barWidth;
            }
        };
        renderFrame();
    };

    return (
        <div className="w-full h-16 md:h-24 flex items-center justify-center my-4 transition-opacity duration-300">
            <canvas
                ref={canvasRef}
                width="300"
                height="80"
                className={`w-full max-w-[300px] h-full ${!isListening && 'opacity-30 grayscale'}`}
            />
        </div>
    );
};

export default AudioVisualizer;
