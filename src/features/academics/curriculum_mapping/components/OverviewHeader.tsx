import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { CurriculumOverviewDto } from '../types';

interface OverviewHeaderProps {
    data: CurriculumOverviewDto[];
    isLoading: boolean;
    selectedClassId: string | null;
    onSelectClass: (classId: string, className: string) => void;
}

const StatusBadge = ({ pct }: { pct: number }) => {
    if (pct >= 90) return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5"><CheckCircle2 className="w-3 h-3" /> Complete</span>;
    if (pct >= 50) return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"><TrendingUp className="w-3 h-3" /> In Progress</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5"><AlertCircle className="w-3 h-3" /> Needs Attention</span>;
};

export function OverviewHeader({ data, isLoading, selectedClassId, onSelectClass }: OverviewHeaderProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-44 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
                {data.map((cls, i) => {
                    const pct = Number(cls.coveragePercent ?? 0);
                    const isSelected = selectedClassId === cls.classId;
                    return (
                        <motion.div
                            key={cls.classId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <Card
                                onClick={() => onSelectClass(cls.classId, cls.className)}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-2 ${
                                    isSelected
                                        ? 'border-primary shadow-primary/20 shadow-md bg-primary/5'
                                        : 'border-border/50 hover:border-primary/40'
                                }`}
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm text-foreground">{cls.className}</h3>
                                                <p className="text-xs text-muted-foreground">{cls.totalSubjects} subjects</p>
                                            </div>
                                        </div>
                                        <StatusBadge pct={pct} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {cls.scheduledPeriods}/{cls.totalPeriodsPerWeek} periods/week
                                            </span>
                                            <span className={`text-sm font-bold tabular-nums ${pct >= 90 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                                                {pct.toFixed(0)}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={pct}
                                            className="h-2"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
