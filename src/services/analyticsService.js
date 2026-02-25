import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';

/**
 * Records a single speech attempt (trial) for clinical analysis.
 * @param {string} userId - Current user's UID
 * @param {number} worksheetIndex - The index of the worksheet being practiced
 * @param {string} targetWord - The intended word
 * @param {string} perceivedWord - What the STT engine heard
 * @param {number} similarity - Score from 0 to 1 (string similarity)
 * @param {number} latencyMs - Time in milliseconds from prompt to speech
 */
export const recordTrial = async (userId, worksheetIndex, targetWord, perceivedWord, similarity, latencyMs) => {
    if (!userId) return;
    try {
        await addDoc(collection(db, 'analytics'), {
            userId,
            worksheetIndex,
            targetWord,
            perceivedWord,
            similarity,
            latencyMs,
            timestamp: Timestamp.now()
        });
    } catch (error) {
        console.error("Clinical Analytics: Failed to record trial", error);
    }
};

/**
 * Retrieves aggregate analytics for the dashboard.
 * @param {string} userId - Current user's UID
 */
export const getSummaryAnalytics = async (userId) => {
    if (!userId) return null;
    try {
        const q = query(
            collection(db, 'analytics'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(100)
        );
        const querySnapshot = await getDocs(q);
        const trials = querySnapshot.docs.map(doc => doc.data());

        if (trials.length === 0) return null;

        // Calculate aggregates
        const avgAccuracy = (trials.reduce((acc, t) => acc + t.similarity, 0) / trials.length * 100).toFixed(0);
        const avgLatency = (trials.reduce((acc, t) => acc + t.latencyMs, 0) / trials.length / 1000).toFixed(1);

        // Vocabulary Variance (Unique target words successfully spoken with >70% accuracy in last 100 trials)
        const uniqueSuccessfulWords = new Set(
            trials.filter(t => t.similarity >= 0.7).map(t => t.targetWord)
        );
        const vocabVariance = uniqueSuccessfulWords.size;

        return {
            accuracy: parseInt(avgAccuracy),
            latency: parseFloat(avgLatency),
            vocabVariance: vocabVariance,
            totalTrials: trials.length
        };
    } catch (error) {
        console.error("Clinical Analytics: Failed to fetch summary", error);
        return null;
    }
};
/**
 * Retrieves detailed trial history for the report page.
 */
export const getTrialHistory = async (userId, limitCount = 50) => {
    if (!userId) return [];
    try {
        const q = query(
            collection(db, 'analytics'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            formattedDate: doc.data().timestamp?.toDate().toLocaleString()
        }));
    } catch (error) {
        console.error("Clinical Analytics: Failed to fetch history", error);
        return [];
    }
};
