export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  id_proof_url?: string;
  created_at: string;
}

export interface Loan {
  id: string;
  customer_id: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  installment_amount: number;
  repayment_frequency: "daily" | "weekly" | "monthly";
  start_date: string;
  end_date: string;
  number_of_installments: number;
  loan_duration_days: number;
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  loan_id: string;
  paid_amount: number;
  payment_date: string;
  collector_id?: string;
  notes?: string;
  created_at: string;
}

export interface LoanSummary {
  loan_id: string;
  customer_name: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  total_paid: number;
  remaining: number;
  installment_amount: number;
  installments_paid: number;
  installments_remaining: number;
  next_due_date: string | null;
  overdue_days: number;
  last_payment_date: string | null;
}

export interface DashboardSummary {
  total_customers: number;
  total_loans: number;
  active_loans: number;
  total_issued: number;
  collected: number;
  pending: number;
  due_today: number;
  overdue: number;
  today_collection: number;
}

export interface TodayCollection {
  loan_id: string;
  customer_name: string;
  amount: number;
  payment_date: string;
}

export interface LedgerEntry {
  loan_id: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  installment_amount: number;
  number_of_installments: number;
  installments_paid: number;
  installments_remaining: number;
  total_paid: number;
  remaining_amount: number;
  start_date: string;
  end_date: string;
  last_payment_date: string | null;
  next_due_date: string | null;
  is_overdue: boolean;
  overdue_days: number;
  status: string;
  payments: PaymentDetail[];
}

export interface PaymentDetail {
  payment_id: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface CustomerLedgerResponse {
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  ledger: LedgerEntry[];
}
