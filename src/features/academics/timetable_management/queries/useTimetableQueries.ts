import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableService } from '@/services/timetable';
import type { ScheduleRequestDto } from '../types';
import { toast } from 'sonner';

const QUERY_KEYS = {
    overview: ['timetable', 'overview'] as const,
    section: (sectionId: string) => ['timetable', 'section', sectionId] as const,
    editorContext: (sectionId: string) => ['timetable', 'editor-context', sectionId] as const,
};

export const useGetTimetableOverview = () => {
    return useQuery({
        queryKey: QUERY_KEYS.overview,
        queryFn: timetableService.getOverview,
        staleTime: 5 * 60 * 1000, // 5 minutes fresh
    });
};

export const useGetSectionSchedule = (sectionId: string | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.section(sectionId!),
        queryFn: () => timetableService.getSectionSchedule(sectionId!),
        enabled: !!sectionId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useGetEditorContext = (sectionId: string | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.editorContext(sectionId!),
        queryFn: () => timetableService.getEditorContext(sectionId!),
        enabled: !!sectionId,
        staleTime: 1 * 60 * 1000, // 1 minute
    });
};

export const useBulkUpdateSchedule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sectionId, payload }: { sectionId: string; payload: ScheduleRequestDto[] }) =>
            timetableService.bulkReplaceSectionSchedule(sectionId, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.section(variables.sectionId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.editorContext(variables.sectionId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.overview });
            toast.success('Timetable schedule saved successfully.');
        },
        onError: () => {
            toast.error('Failed to save timetable. Please try again.');
        }
    });
};

export const useUpdateScheduleStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sectionId, statusType }: { sectionId: string; statusType: 'draft' | 'publish' }) => 
            timetableService.updateScheduleStatus(sectionId, statusType),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.section(variables.sectionId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.overview });
            toast.success(`Timetable marked as ${variables.statusType === 'draft' ? 'Draft' : 'Published'}.`);
        },
        onError: () => {
            toast.error('Failed to update timetable status.');
        }
    });
};
