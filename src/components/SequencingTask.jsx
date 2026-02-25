import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function SequencingTask({ task, userProfile, onSuccess }) {
    // Expected steps count is 3. We use dropZones length.
    const expectedLength = task.steps?.length || 3;

    // items: shuffled list of steps to place
    const [availableItems, setAvailableItems] = useState([]);
    // placedItems: array same length as target, contains item objects or null
    const [placedItems, setPlacedItems] = useState([]);

    const [feedback, setFeedback] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Initialize game state on task change
    useEffect(() => {
        setIsSuccess(false);
        setFeedback('');

        if (task && task.steps) {
            const items = [...task.steps].sort(() => Math.random() - 0.5);
            setAvailableItems(items.map(item => ({ ...item, id: item.step_number })));
            setPlacedItems(new Array(task.steps.length).fill(null));
        }
    }, [task]);

    const handleSuccess = () => {
        setIsSuccess(true);
        setFeedback("Perfect sequence!");
        setTimeout(() => onSuccess(), 3000);
    };

    // A simple, accessible alternative to complex Drag & Drop for seniors:
    // If they click an available item, it snaps to the first empty slot.
    // If they click a placed item, it returns to available items.
    // This provides a "magnetic" feel without requiring fine motor drag skills.

    const placeTargetItem = (item) => {
        if (isSuccess) return;

        // Find first empty slot
        const emptyIndex = placedItems.findIndex(p => p === null);
        if (emptyIndex !== -1) {
            const newPlaced = [...placedItems];
            newPlaced[emptyIndex] = item;
            setPlacedItems(newPlaced);
            setAvailableItems(availableItems.filter(a => a.id !== item.id));

            // Check win condition if full
            if (emptyIndex === expectedLength - 1) {
                checkWin(newPlaced);
            } else {
                setFeedback('');
            }
        }
    };

    const removeTargetItem = (index) => {
        if (isSuccess) return;
        const item = placedItems[index];
        if (item) {
            const newPlaced = [...placedItems];
            newPlaced[index] = null;
            setPlacedItems(newPlaced);
            setAvailableItems([...availableItems, item].sort((a, b) => a.id - b.id)); // sort not strictly needed but looks cleaner
            setFeedback('');
        }
    };

    const checkWin = (currentPlaced) => {
        // Did they match step_number 1, 2, 3 in order?
        const isWin = currentPlaced.every((p, idx) => p && p.step_number === idx + 1);

        if (isWin) {
            handleSuccess();
        } else {
            setFeedback("That doesn't seem to be the right order. Let's try again.");
            // Soft reset after brief pause
            setTimeout(() => {
                setPlacedItems(new Array(expectedLength).fill(null));
                setAvailableItems([...task.steps].sort(() => Math.random() - 0.5));
                setFeedback('');
            }, 2500);
        }
    };

    return (
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto h-full px-4 pt-2 font-lexend">
            <div className="text-center mb-4">
                <h3 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
                    {task.scenario_name}
                </h3>
                <p className="text-gray-500 font-bold mt-1">Tap a card to place it in order.</p>
            </div>

            {/* Target Drop Zones */}
            <div className="flex justify-center gap-3 sm:gap-6 mb-8 w-full mt-4">
                {placedItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => removeTargetItem(index)}
                        className={`flex flex-col items-center justify-center w-28 h-28 sm:w-40 sm:h-40 rounded-3xl border-4 transition-all duration-300
                            ${item
                                ? 'bg-white border-purple-500 shadow-xl cursor-pointer hover:bg-red-50'
                                : 'bg-gray-100 border-dashed border-gray-300'}`}
                    >
                        {item ? (
                            <div className="p-2 sm:p-4 text-center animate-in zoom-in duration-300 w-full h-full flex flex-col justify-center relative">
                                <span className="absolute top-2 left-2 w-6 h-6 bg-purple-100 text-purple-600 rounded-full font-black flex items-center justify-center text-xs">
                                    {index + 1}
                                </span>
                                <p className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-3">
                                    {item.description}
                                </p>
                            </div>
                        ) : (
                            <span className="text-4xl text-gray-300 font-black opacity-50">{index + 1}</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Feedback Status Bar */}
            <div className={`mt-2 w-full max-w-md mx-auto min-h-[48px] rounded-xl flex items-center justify-center p-2 text-base sm:text-lg font-black transition-all shadow-sm border-2
                ${isSuccess ? 'bg-green-50 text-green-700 border-green-200' :
                    feedback ? 'bg-orange-50 text-orange-600 border-orange-200' :
                        'bg-white border-gray-100 text-gray-300'}`}>
                {isSuccess ?
                    <div className="flex items-center gap-2"><CheckCircle /> <span>Excellent! Perfectly arranged.</span></div> :
                    feedback ? feedback : <span>Select step {placedItems.findIndex(p => p === null) + 1}</span>
                }
            </div>

            {/* Available Cards (Source) */}
            <div className="mt-8 flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full justify-items-center mb-8 bg-gray-50/50 p-4 rounded-3xl border-t border-gray-200 shadow-inner">
                {availableItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => placeTargetItem(item)}
                        className="bg-white border-2 border-purple-100 p-4 rounded-2xl w-full max-w-[250px] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[100px] sm:min-h-[140px] group active:scale-95"
                    >
                        <p className="text-sm sm:text-base font-bold text-gray-800 text-center pointer-events-none">
                            {item.description}
                        </p>
                        <span className="text-xs text-purple-400 uppercase tracking-widest font-black mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Tap to Place
                        </span>
                    </div>
                ))}

                {availableItems.length === 0 && !isSuccess && (
                    <div className="col-span-full w-full h-full flex flex-col items-center justify-center animate-pulse text-gray-400">
                        <AlertTriangle size={32} />
                        <span className="font-bold mt-2">Checking sequence...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
