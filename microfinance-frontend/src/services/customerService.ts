import { api } from "@/lib/api";
import { Customer } from "@/types";

export const customerService = {
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get<Customer[]>(`/customers/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  create: async (data: { name: string; phone: string; address: string; id_proof_url?: string }) => {
    const response = await api.post<Customer>("/customers/", data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; phone?: string; address?: string; id_proof_url?: string }) => {
    const response = await api.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/customers/${id}`);
  },

  getLoans: async (customerId: string) => {
    const response = await api.get(`/customers/${customerId}/loans`);
    return response.data;
  },

  getLedger: async (customerId: string) => {
    const response = await api.get<import("@/types").CustomerLedgerResponse>(`/customers/${customerId}/ledger`);
    return response.data;
  },
};
