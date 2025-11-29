import { api } from "@/lib/api";
import { DashboardSummary, TodayCollection, LoanSummary } from "@/types";

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get<DashboardSummary>("/dashboard/");
    return response.data;
  },

  getTodayCollection: async () => {
    const response = await api.get<TodayCollection[]>("/dashboard/today-collection");
    return response.data;
  },

  getOverdueLoans: async () => {
    const response = await api.get<LoanSummary[]>("/loans/summary");
    // Filter only overdue loans
    return response.data.filter((loan) => loan.overdue_days > 0);
  },
};
