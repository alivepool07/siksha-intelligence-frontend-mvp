import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DraggableTeacher } from './DraggableTeacher';
import type { RootState } from '@/store/store';
import { Users } from 'lucide-react';
import type { Teacher } from '../types';

interface SidebarTeachersProps {
    teachers: Teacher[];
    isLoading: boolean;
}

export function SidebarTeachers({ teachers, isLoading }: SidebarTeachersProps) {
    const { activeCell, grid } = useSelector((state: RootState) => state.timetable);

    // Get the subject ID of the active cell (if any)
    const activeCellData = activeCell ? grid[activeCell] : null;
    const activeSubjectId = activeCellData?.subject?._id || null;

    // Filter teachers based on whether they can teach the active subject
    const getTeacherState = (teacher: Teacher) => {
        if (!activeSubjectId) return { isEnabled: false };
        return {
            isEnabled: teacher.teachableSubjects.includes(activeSubjectId),
        };
    };

    const enabledCount = teachers.filter(
        t => activeSubjectId && t.teachableSubjects.includes(activeSubjectId)
    ).length;

    return (
        <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Teachers
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    {isLoading
                        ? 'Loading...'
                        : activeSubjectId
                            ? `${enabledCount} teacher${enabledCount !== 1 ? 's' : ''} available`
                            : 'Select a cell with subject first'
                    }
                </p>
            </CardHeader>
            <CardContent className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))
                    : teachers.map((teacher, index) => {
                        const { isEnabled } = getTeacherState(teacher);
                        return (
                            <motion.div
                                key={teacher._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <DraggableTeacher
                                    teacher={teacher}
                                    isEnabled={isEnabled}
                                    targetCellKey={activeCell}
                                />
                            </motion.div>
                        );
                    })
                }
            </CardContent>
        </Card>
    );
}
