import { useCallback, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { SidebarSubjects } from './SidebarSubjects';
import { SidebarTeachers } from './SidebarTeachers';
import { TimetableGrid } from './TimetableGrid';
import { AutoGenerateModal } from './AutoGenerateModal';
import { setSubjectToCell, setTeacherToCell, resetGrid } from '../store/timetableSlice';
import { generateTimetable } from '../services/autoGenerateService';
import type { RootState } from '@/store/store';
import type { Subject, Teacher, LLMTeacher, GeneratedTimetable, ScheduleRequestDto } from '../types';
import { useBulkUpdateSchedule, useUpdateScheduleStatus, useGetEditorContext } from '../queries/useTimetableQueries';
import { ArrowLeft, Save, Send, RotateCcw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function TimetableEditor() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedClass, selectedSection, grid } = useSelector(
        (state: RootState) => state.timetable
    );
    const [activeDragItem, setActiveDragItem] = useState<{ type: string; item: Subject | Teacher } | null>(null);

    // Auto Generate state
    const [isAutoGenerateModalOpen, setIsAutoGenerateModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [autoGenerateError, setAutoGenerateError] = useState<string | null>(null);
    // Track whether we've already hydrated the grid for this section (prevents duplicate hydration)
    const [hydratedSectionId, setHydratedSectionId] = useState<string | null>(null);

    // ─── Live API ─────────────────────────────────────────────────────────────
    const { data: editorContext, isLoading: isContextLoading } = useGetEditorContext(selectedSection?._id);
    const { mutate: bulkUpdate, isPending: isSavingData } = useBulkUpdateSchedule();
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateScheduleStatus();

    const isSaving = isSavingData || isUpdatingStatus;

    // ─── Map API data → local Subject/Teacher types for Sidebars ─────────────
    const liveSubjects: Subject[] = useMemo(() => {
        if (!editorContext?.availableSubjects) return [];
        return editorContext.availableSubjects.map(s => ({
            _id: s.uuid,
            name: s.name,
            code: s.subjectCode,
            color: s.color || 'bg-blue-100 border-blue-200 text-blue-800',
        }));
    }, [editorContext?.availableSubjects]);

    const liveTeachers: Teacher[] = useMemo(() => {
        if (!editorContext?.teachers) return [];
        return editorContext.teachers.map(t => ({
            _id: t.id,
            name: t.name,
            teachableSubjects: t.teachableSubjectIds,
        }));
    }, [editorContext?.teachers]);

    // ─── Hydrate Grid from Existing Schedule ──────────────────────────────────
    useEffect(() => {
        if (
            editorContext &&
            editorContext.existingSchedule.length > 0 &&
            selectedSection?._id &&
            hydratedSectionId !== selectedSection._id
        ) {
            dispatch(resetGrid());
            setHydratedSectionId(selectedSection._id);

            setTimeout(() => {
                editorContext.existingSchedule.forEach((entry) => {
                    const cellKey = entry.slotLabel; // e.g. "Monday_08:00"

                    const subject = liveSubjects.find(s => s._id === entry.subjectId);
                    const teacher = liveTeachers.find(t => t._id === entry.teacherId);

                    if (cellKey && subject) {
                        dispatch(setSubjectToCell({ cellKey, subject }));
                        if (teacher) {
                            dispatch(setTeacherToCell({ cellKey, teacher }));
                        }
                    }
                });
            }, 50);
        }
    }, [editorContext, liveSubjects, liveTeachers, selectedSection?._id, hydratedSectionId, dispatch]);

    // Reset hydration tracking when section changes
    useEffect(() => {
        if (selectedSection?._id && hydratedSectionId !== selectedSection._id) {
            dispatch(resetGrid());
        }
    }, [selectedSection?._id]); // eslint-disable-line react-hooks/exhaustive-deps

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const data = active.data.current as { type: string; item: Subject | Teacher } | undefined;
        if (data) {
            setActiveDragItem(data);
        }
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        const dragData = active.data.current as { type: string; item: Subject | Teacher; targetCellKey?: string } | undefined;
        const dropData = over.data.current as { cellKey: string; status: string } | undefined;

        if (!dragData || !dropData) return;

        const { type, item, targetCellKey } = dragData;
        const { cellKey, status } = dropData;

        if (type === 'SUBJECT' && status === 'EMPTY') {
            dispatch(setSubjectToCell({ cellKey, subject: item as Subject }));
        }

        if (type === 'TEACHER' && status === 'AWAITING_TEACHER') {
            if (targetCellKey === cellKey) {
                dispatch(setTeacherToCell({ cellKey, teacher: item as Teacher }));
            }
        }
    }, [dispatch]);

    // ─── Build Payload for Bulk Save ──────────────────────────────────────────
    const generatePayload = (): ScheduleRequestDto[] => {
        if (!selectedSection || !editorContext) return [];

        // Build a lookup for slotLabel → timeslot UUID from the context
        const slotToTimeslotId: Record<string, string> = {};
        editorContext.timeslots.forEach(ts => {
            slotToTimeslotId[ts.slotLabel] = ts.uuid;
        });

        const payload: ScheduleRequestDto[] = [];
        Object.entries(grid).forEach(([slotLabel, value]) => {
            if (value.status === 'LOCKED' && value.subject && value.teacher) {
                const timeslotId = slotToTimeslotId[slotLabel];
                if (!timeslotId) return; // Skip if timeslot not found

                payload.push({
                    sectionId: selectedSection._id,
                    subjectId: value.subject._id,
                    teacherId: value.teacher._id,
                    roomId: 'default-lab', // Room selection is a future feature
                    timeslotId,
                });
            }
        });
        return payload;
    };

    const handleSaveDraft = () => {
        if (!selectedSection) return;
        const payload = generatePayload();
        if (payload.length === 0) {
            toast.warning('No completed periods to save. Assign both a subject and teacher to at least one cell.');
            return;
        }
        bulkUpdate(
            { sectionId: selectedSection._id, payload },
            {
                onSuccess: () => {
                    updateStatus({ sectionId: selectedSection._id, statusType: 'draft' });
                }
            }
        );
    };

    const handlePublish = () => {
        if (!selectedSection) return;
        const payload = generatePayload();
        if (payload.length === 0) {
            toast.warning('No completed periods to publish. Assign both a subject and teacher to at least one cell.');
            return;
        }
        bulkUpdate(
            { sectionId: selectedSection._id, payload },
            {
                onSuccess: () => {
                    updateStatus({ sectionId: selectedSection._id, statusType: 'publish' });
                }
            }
        );
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset the timetable? All changes will be lost.')) {
            dispatch(resetGrid());
            setHydratedSectionId(null); // Allow re-hydration if user doesn't save
        }
    };

    // ─── Auto Generate ─────────────────────────────────────────────────────────
    const findSubjectByName = (name: string): Subject | undefined =>
        liveSubjects.find(s => s.name.toLowerCase() === name.toLowerCase());

    const findTeacherByName = (name: string): Teacher | undefined =>
        liveTeachers.find(t => t.name.toLowerCase() === name.toLowerCase());

    const animateFillGrid = async (timetable: GeneratedTimetable) => {
        const days: (keyof GeneratedTimetable)[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];

        dispatch(resetGrid());
        await new Promise(resolve => setTimeout(resolve, 300));

        for (const day of days) {
            const periods = timetable[day];
            if (!periods) continue;

            for (const periodData of periods) {
                const timeSlotIndex = periodData.period - 1;
                if (timeSlotIndex < 0 || timeSlotIndex >= timeSlots.length) continue;

                const timeSlot = timeSlots[timeSlotIndex];
                const cellKey = `${day}_${timeSlot}`;

                const subject = findSubjectByName(periodData.subject);
                const teacher = findTeacherByName(periodData.teacher);

                if (subject) {
                    dispatch(setSubjectToCell({ cellKey, subject }));
                    await new Promise(resolve => setTimeout(resolve, 100));

                    if (teacher) {
                        dispatch(setTeacherToCell({ cellKey, teacher }));
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
            }
        }
    };

    const handleAutoGenerate = async (query: string) => {
        setIsGenerating(true);
        setAutoGenerateError(null);

        try {
            const subjects = liveSubjects.map(s => s.name);
            const teachers: LLMTeacher[] = liveTeachers.map(t => ({
                name: t.name,
                subjects: t.teachableSubjects.map(subId => {
                    const sub = liveSubjects.find(s => s._id === subId);
                    return sub?.name || '';
                }).filter(Boolean),
            }));

            const response = await generateTimetable({
                subjects,
                teachers,
                subjects_per_day: 6,
                user_query: query,
            });

            if (response.success) {
                setIsAutoGenerateModalOpen(false);
                await animateFillGrid(response.timetable);
            } else {
                if (response.error.includes('constraint') || response.error.includes('cannot be satisfied')) {
                    setAutoGenerateError(`Timetable cannot be created with these constraints: ${response.error}. Please try with different constraints or create the timetable manually.`);
                } else {
                    setAutoGenerateError(response.error);
                }
            }
        } catch {
            setAutoGenerateError('Cannot generate timetable due to some error. Please try again later.');
        } finally {
            setIsGenerating(false);
        }
    };

    const openAutoGenerateModal = () => {
        setAutoGenerateError(null);
        setIsAutoGenerateModalOpen(true);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="z-10 bg-card rounded-xl border border-border shadow-sm"
                >
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate('/dashboard/admin/timetable')}
                                    className="shrink-0"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <div>
                                    <h1 className="text-lg font-semibold text-foreground">
                                        Timetable Editor
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedClass?.name || 'Class'} — {selectedSection?.name || 'Section'}
                                        {editorContext && (
                                            <span className="ml-2 text-xs text-primary font-medium">
                                                ({editorContext.existingSchedule.length} periods loaded)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    onClick={openAutoGenerateModal}
                                    disabled={isContextLoading || !editorContext}
                                    className="ai-glow-button gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Auto Generate
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className="gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSaveDraft}
                                    disabled={!selectedSection || isSaving || isContextLoading}
                                    className="gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save Draft'}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handlePublish}
                                    disabled={!selectedSection || isSaving || isContextLoading}
                                    className="gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    {isSaving ? 'Publishing...' : 'Publish'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* Main Content - 3 Column Layout */}
                <div className="w-full">
                    <div className="grid xl:grid-cols-[260px_1fr_260px] lg:grid-cols-[220px_1fr_220px] grid-cols-1 gap-6">
                        {/* Left Sidebar - Subjects (live from API) */}
                        <motion.aside
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <SidebarSubjects subjects={liveSubjects} isLoading={isContextLoading} />
                        </motion.aside>

                        {/* Center - Timetable Grid */}
                        <motion.main
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card/30 rounded-xl p-4 border border-border/50"
                        >
                            <TimetableGrid />
                        </motion.main>

                        {/* Right Sidebar - Teachers (live from API) */}
                        <motion.aside
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <SidebarTeachers teachers={liveTeachers} isLoading={isContextLoading} />
                        </motion.aside>
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeDragItem && (
                        <div className="p-3 rounded-lg bg-card border border-primary shadow-2xl">
                            <span className="text-sm font-medium">
                                {(activeDragItem.item as Subject).name || (activeDragItem.item as Teacher).name}
                            </span>
                        </div>
                    )}
                </DragOverlay>

                {/* Auto Generate Modal */}
                <AutoGenerateModal
                    open={isAutoGenerateModalOpen}
                    onOpenChange={setIsAutoGenerateModalOpen}
                    onGenerate={handleAutoGenerate}
                    isGenerating={isGenerating}
                    error={autoGenerateError}
                />
            </div>
        </DndContext>
    );
}
