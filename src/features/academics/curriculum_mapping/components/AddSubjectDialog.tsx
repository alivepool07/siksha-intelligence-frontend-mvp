import { useState, useMemo } from 'react';
import { Search, Plus, BookOpen } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface SubjectOption {
    uuid: string;
    name: string;
    subjectCode: string;
    color?: string;
}

interface AddSubjectDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    existingSubjectIds: string[];
    onAdd: (subjectId: string, periodsPerWeek: number) => void;
    isAdding: boolean;
}

export function AddSubjectDialog({ open, onOpenChange, existingSubjectIds, onAdd, isAdding }: AddSubjectDialogProps) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<SubjectOption | null>(null);
    const [periods, setPeriods] = useState(5);

    const { data: allSubjects = [], isLoading } = useQuery<SubjectOption[]>({
        queryKey: ['subjects', 'all'],
        queryFn: async () => {
            const res = await api.get('/auth/subjects');
            return res.data;
        },
        staleTime: 10 * 60 * 1000,
        enabled: open,
    });

    const available = useMemo(() =>
        allSubjects.filter(s =>
            !existingSubjectIds.includes(s.uuid) &&
            (s.name.toLowerCase().includes(search.toLowerCase()) ||
             s.subjectCode.toLowerCase().includes(search.toLowerCase()))
        ),
        [allSubjects, existingSubjectIds, search]
    );

    const handleSubmit = () => {
        if (!selected) return;
        onAdd(selected.uuid, periods);
        setSelected(null);
        setSearch('');
        setPeriods(5);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Add Subject to Curriculum
                    </DialogTitle>
                    <DialogDescription>
                        Search and select a subject, then set its weekly period count.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search subjects..."
                            className="pl-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Subject List */}
                    <div className="max-h-52 overflow-y-auto space-y-1 rounded-lg border border-border/60 p-1">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full rounded-lg" />
                            ))
                        ) : available.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-8">
                                {search ? 'No matching subjects found.' : 'All subjects already added.'}
                            </div>
                        ) : (
                            available.map(s => {
                                const dotColor = s.color?.startsWith('#') ? s.color : '#6366f1';
                                return (
                                    <button
                                        key={s.uuid}
                                        onClick={() => setSelected(prev => prev?.uuid === s.uuid ? null : s)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                                            selected?.uuid === s.uuid
                                                ? 'bg-primary/10 text-primary border border-primary/30'
                                                : 'hover:bg-muted text-foreground border border-transparent'
                                        }`}
                                    >
                                        <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: dotColor }}
                                        />
                                        <span className="font-medium flex-1 text-left">{s.name}</span>
                                        <span className="text-xs font-mono text-muted-foreground">{s.subjectCode}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Periods input */}
                    {selected && (
                        <div className="space-y-2 pt-1">
                            <Label>Periods per week</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="number"
                                    min={0}
                                    max={40}
                                    value={periods}
                                    onChange={e => setPeriods(Number(e.target.value))}
                                    className="w-28"
                                />
                                <p className="text-xs text-muted-foreground">Recommended: 4–6 for core subjects</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!selected || isAdding} className="gap-2">
                        <Plus className="w-4 h-4" />
                        {isAdding ? 'Adding...' : 'Add to Curriculum'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
