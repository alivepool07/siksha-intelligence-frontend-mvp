import { useQuery } from '@tanstack/react-query';
import { studentIntelligenceService } from '@/services/studentIntelligence';

export const overviewKeys = {
  all: ['student', 'overview'] as const,
};

export const useStudentOverview = () => {
  return useQuery({
    queryKey: overviewKeys.all,
    queryFn: async () => {
      const response = await studentIntelligenceService.getDashboardOverview();
      return response.data;
    },
    // Maintain cache for 5 minutes before background refetching
    staleTime: 5 * 60 * 1000,
    // Keep the garbage collector from wiping it for 10 minutes to support offline/slow-back navigations
    gcTime: 10 * 60 * 1000, 
    // Do not automatically refetch on window focus to avoid hammering the backend
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
