export interface StudentProfileDTO {
  studentId: number;
  fullName: string;
  enrollmentNumber: string;
  courseOrClass: string;
  profileUrl: string | null;
}

export interface KpiOverviewDTO {
  attendancePercentage: number;
  currentCgpa: number;
  pendingAssignmentsCount: number;
  totalOverdueFees: number;
}

export interface TodayScheduleDTO {
  id: number;
  subject: string;
  teacher: string;
  room: string;
  startTime: string; // ISO-8601
  endTime: string;   // ISO-8601
  status: 'COMPLETED' | 'LIVE' | 'UPCOMING';
}

export interface PendingAssignmentDTO {
  id: number;
  subject: string;
  title: string;
  dueDate: string; // ISO-8601
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PerformanceTrendDTO {
  term: string;
  score: number;
}

export interface RecentAnnouncementDTO {
  id: number;
  title: string;
  date: string; // ISO-8601
  type: 'EVENT' | 'ACADEMIC' | 'ALERT';
}

export interface StudentDashboardOverviewDTO {
  profile: StudentProfileDTO;
  kpis: KpiOverviewDTO;
  todaySchedule: TodayScheduleDTO[];
  pendingAssignments: PendingAssignmentDTO[];
  performanceTrend: PerformanceTrendDTO[];
  recentAnnouncements: RecentAnnouncementDTO[];
}
