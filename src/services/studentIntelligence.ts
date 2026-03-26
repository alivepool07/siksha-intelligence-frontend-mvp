import { api } from "@/lib/axios";
import type { StudentDashboardOverviewDTO } from "./types/studentIntelligence";

export const studentIntelligenceService = {
  /**
   * Fetches the unified dashboard snapshot for the currently authenticated student.
   * Fails cleanly if the user is not a STUDENT.
   */
  getDashboardOverview() {
    return api.get<StudentDashboardOverviewDTO>("/student/dashboard/overview");
  },
};
