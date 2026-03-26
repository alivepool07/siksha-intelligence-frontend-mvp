import { useDispatch } from 'react-redux';
import { setSelectedClass, setSelectedSection } from '../store/timetableSlice';
import { classes, sections } from '../data/mockData';

export const useSelectTimetableScope = () => {
    const dispatch = useDispatch();

    const selectScope = (classId: string, sectionId: string, className?: string, sectionName?: string) => {
        const classObj = classes.find(c => c._id === classId) || { _id: classId, name: className || 'Unknown Class' };
        const sectionObj = sections.find(s => s._id === sectionId) || { _id: sectionId, name: sectionName || 'Unknown Section' };
        
        dispatch(setSelectedClass(classObj));
        dispatch(setSelectedSection(sectionObj));
    };

    return { selectScope };
};
