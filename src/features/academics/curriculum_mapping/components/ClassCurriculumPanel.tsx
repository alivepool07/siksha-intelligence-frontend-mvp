import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, Pencil, Check, X, Clock, BarChart3, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CurriculumClassSubjectDto } from '../types';

interface SubjectCardProps {
    entry: CurriculumClassSubjectDto;
    onUpdatePeriods: (curriculumMapId: string, periods: number) => void;
    onRemove: (curriculumMapId: string) => void;
    isUpdating: boolean;
}

function SubjectCard({ entry, onUpdatePeriods, onRemove, isUpdating }: SubjectCardProps) {
    const [editing, setEditing] = useState(false);
    const [periods, setPeriods] = useState(entry.periodsPerWeek);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const scheduledPct = entry.periodsPerWeek > 0
        ? Math.min(100, Math.round((entry.totalScheduledPeriods / entry.periodsPerWeek) * 100))
        : 0;

    const barColor = scheduledPct >= 100
        ? 'bg-emerald-500'
        : scheduledPct >= 60
        ? 'bg-amber-500'
        : 'bg-rose-500';

    // Parse color — backend stores things like "#3b82f6" or "bg-blue-100 border-blue-200..."
    const dotColor = entry.color?.startsWith('#') ? entry.color : '#6366f1';

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            >
                {/* Color Dot + Subject Info */}
                <div
                    className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white shadow-sm"
                    style={{ backgroundColor: dotColor }}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground truncate">{entry.subjectName}</span>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">{entry.subjectCode}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full ${barColor}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${scheduledPct}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                            {entry.totalScheduledPeriods}/{entry.periodsPerWeek} scheduled
                        </span>
                    </div>
                </div>

                {/* Period Editor */}
                <div className="flex items-center gap-2 shrink-0">
                    {editing ? (
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min={0}
                                max={40}
                                value={periods}
                                onChange={e => setPeriods(Number(e.target.value))}
                                className="w-14 text-center text-sm border border-input rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                autoFocus
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
                                onClick={() => { onUpdatePeriods(entry.curriculumMapId, periods); setEditing(false); }}
                                disabled={isUpdating}
                            >
                                <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground"
                                onClick={() => { setPeriods(entry.periodsPerWeek); setEditing(false); }}
                            >
                                <X className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                                <Clock className="w-3 h-3" />
                                {entry.periodsPerWeek} / wk
                            </span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setEditing(true)}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    )}

                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDelete(true)}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </motion.div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            Remove from Curriculum?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{entry.subjectName}</strong> will be removed from this class's curriculum.
                            This does not affect existing timetable entries.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => onRemove(entry.curriculumMapId)}
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

interface ClassCurriculumPanelProps {
    className: string;
    entries: CurriculumClassSubjectDto[];
    isLoading: boolean;
    onUpdatePeriods: (curriculumMapId: string, periods: number) => void;
    onRemove: (curriculumMapId: string) => void;
    onAddClick: () => void;
    isUpdating: boolean;
}

export function ClassCurriculumPanel({
    className,
    entries,
    isLoading,
    onUpdatePeriods,
    onRemove,
    onAddClick,
    isUpdating,
}: ClassCurriculumPanelProps) {
    const totalDefined = entries.reduce((s, e) => s + e.periodsPerWeek, 0);
    const totalScheduled = entries.reduce((s, e) => s + e.totalScheduledPeriods, 0);
    const coveragePct = totalDefined > 0 ? Math.round((totalScheduled / totalDefined) * 100) : 0;

    return (
        <Card className="flex flex-col h-full border-border/60">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            {className} — Curriculum
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {entries.length} subjects · {totalDefined} periods/week defined
                        </p>
                    </div>
                    <Button size="sm" onClick={onAddClick} className="gap-1.5 shrink-0">
                        <Plus className="w-4 h-4" />
                        Add Subject
                    </Button>
                </div>

                {/* Global coverage bar */}
                {entries.length > 0 && (
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span>Timetable coverage</span>
                            <span className="font-medium text-foreground">{coveragePct}%</span>
                        </div>
                        <Progress value={coveragePct} className="h-2" />
                    </div>
                )}
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-2">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-4 rounded-full bg-muted mb-4">
                            <Plus className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No subjects yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Add subjects to define this class's curriculum</p>
                        <Button size="sm" onClick={onAddClick} className="mt-4 gap-1.5">
                            <Plus className="w-4 h-4" />
                            Add First Subject
                        </Button>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {entries.map(entry => (
                            <SubjectCard
                                key={entry.curriculumMapId}
                                entry={entry}
                                onUpdatePeriods={onUpdatePeriods}
                                onRemove={onRemove}
                                isUpdating={isUpdating}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </CardContent>
        </Card>
    );
}
