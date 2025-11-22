import { api } from "@/lib/api";
import { Payment } from "@/types";

export const paymentService = {
  create: async (data: { loan_id: string; paid_amount: number; payment_date: string; notes?: string }) => {
    const response = await api.post<Payment>("/payments/", data);
    return response.data;
  },

  getByLoan: async (loanId: string) => {
    const response = await api.get<Payment[]>(`/payments/?loan_id=${loanId}`);
    return response.data;
  },
};
