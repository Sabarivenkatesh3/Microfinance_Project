import { api } from "@/lib/api";
import { Loan, LoanSummary } from "@/types";

export const loanService = {
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get<Loan[]>(`/loans/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Loan>(`/loans/${id}`);
    return response.data;
  },

  create: async (data: {
    customer_id: string;
    principal_amount: number;
    interest_amount: number;
    installment_amount: number;
    repayment_frequency: "daily" | "weekly" | "monthly";
    start_date: string;
    notes?: string;
  }) => {
    const response = await api.post<Loan>("/loans/", data);
    return response.data;
  },

  getSummary: async (id: string) => {
    const response = await api.get<LoanSummary>(`/loans/${id}/summary`);
    return response.data;
  },
};
