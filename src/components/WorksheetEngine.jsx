import React from 'react';
import AphasiaTask from './AphasiaTask';
import CrisisTask from './CrisisTask';
import SequencingTask from './SequencingTask';
import MatchingTask from './MatchingTask';

export default function WorksheetEngine({ task, imageUrl, userProfile, onSuccess }) {
    if (!task) return null;

    switch (task.task_type) {
        case 'aphasia':
            return <AphasiaTask task={task} imageUrl={imageUrl} userProfile={userProfile} onSuccess={onSuccess} />;
        case 'crisis':
            return <CrisisTask task={task} imageUrl={imageUrl} userProfile={userProfile} onSuccess={onSuccess} />;
        case 'sequencing':
            return <SequencingTask task={task} userProfile={userProfile} onSuccess={onSuccess} />;
        case 'matching':
            return <MatchingTask task={task} imageUrl={imageUrl} userProfile={userProfile} onSuccess={onSuccess} />;
        default:
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-red-50 font-lexend">
                    <div className="text-3xl font-black text-red-600 mb-2">Unknown Task Type</div>
                    <div className="text-gray-500 font-medium">Type received: {task.task_type}</div>
                    <button onClick={onSuccess} className="mt-8 bg-gray-200 px-6 py-2 rounded-xl text-gray-700 font-bold">Skip</button>
                </div>
            );
    }
}
