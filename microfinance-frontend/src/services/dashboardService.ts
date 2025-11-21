import { api } from "@/lib/api";
import { DashboardSummary, TodayCollection } from "@/types";

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get<DashboardSummary>("/dashboard/");
    return response.data;
  },

  getTodayCollection: async () => {
    const response = await api.get<TodayCollection[]>("/dashboard/today-collection");
    return response.data;
  },
};
