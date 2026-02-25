import curriculumData from '../data/curriculum_worksheets_spec.json';
import dailyCurriculum from '../data/curriculum_daily_spec.json';

export const getWorksheet = (index) => {
    return curriculumData.find(task => task.worksheet_index === index) || null;
};

export const getDailyTasks = (day) => {
    const dayData = dailyCurriculum.find(d => d.day === day);
    return dayData ? dayData.tasks : [];
};

export const getStageWorksheets = (stageNum) => {
    const startIdx = (stageNum - 1) * 7 + 1;
    const endIdx = stageNum * 7;
    return curriculumData.filter(task => task.worksheet_index >= startIdx && task.worksheet_index <= endIdx);
};

export const getTotalWorksheets = () => {
    return curriculumData.length;
};

export const getImagePath = (task) => {
    if (!task) return null;
    if (task.task_type === 'aphasia') {
        return `/assets/vsd/${task.worksheet_index}.png`;
    }
    // Placeholder until Phase 0-B generates image assets
    return null;
};
