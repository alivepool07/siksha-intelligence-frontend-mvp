// ── Curriculum Mapping Types ──────────────────────────────────────────────────

/** Response from GET /auth/curriculum/classes/{classId} */
export interface CurriculumClassSubjectDto {
    curriculumMapId: string;
    classId: string;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    color?: string;
    periodsPerWeek: number;
    totalScheduledPeriods: number;
}

/** Response from GET /auth/curriculum/overview */
export interface CurriculumOverviewDto {
    classId: string;
    className: string;
    totalSubjects: number;
    totalPeriodsPerWeek: number;
    scheduledPeriods: number;
    coveragePercent: number;
}

/** Request body for POST /auth/curriculum/classes/{classId}/subjects */
export interface CurriculumSubjectUpsertDto {
    subjectId: string;
    periodsPerWeek: number;
}

/** Request body for PUT /auth/curriculum/{curriculumMapId} */
export interface CurriculumPeriodsUpdateDto {
    periodsPerWeek: number;
}
