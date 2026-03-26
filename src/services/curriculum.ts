import { api } from "@/lib/axios";
import type {
    CurriculumClassSubjectDto,
    CurriculumOverviewDto,
    CurriculumSubjectUpsertDto,
    CurriculumPeriodsUpdateDto,
} from '@/features/academics/curriculum_mapping/types';

export const curriculumService = {
    /** Fetch institution-wide curriculum coverage summary */
    getOverview: async (): Promise<CurriculumOverviewDto[]> => {
        const response = await api.get('/auth/curriculum/overview');
        return response.data;
    },

    /** Fetch all subjects mapped to a specific class, with period counts */
    getClassCurriculum: async (classId: string): Promise<CurriculumClassSubjectDto[]> => {
        const response = await api.get(`/auth/curriculum/classes/${classId}`);
        return response.data;
    },

    /** Map a subject to a class curriculum */
    addSubjectToClass: async (classId: string, body: CurriculumSubjectUpsertDto): Promise<CurriculumClassSubjectDto> => {
        const response = await api.post(`/auth/curriculum/classes/${classId}/subjects`, body);
        return response.data;
    },

    /** Update periods per week for a mapped subject */
    updatePeriods: async (curriculumMapId: string, body: CurriculumPeriodsUpdateDto): Promise<CurriculumClassSubjectDto> => {
        const response = await api.put(`/auth/curriculum/${curriculumMapId}`, body);
        return response.data;
    },

    /** Remove a subject from a class curriculum */
    removeSubject: async (curriculumMapId: string): Promise<void> => {
        await api.delete(`/auth/curriculum/${curriculumMapId}`);
    },
};
