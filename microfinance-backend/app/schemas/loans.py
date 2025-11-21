from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from decimal import Decimal
import math
from typing import Optional

class LoanCreate(BaseModel):
    customer_id: UUID
    principal_amount: float
    interest_amount: float
    installment_amount: float      # YOU decide this
    repayment_frequency: str       # daily | weekly | monthly
    start_date: date
    notes: str | None = None


class LoanSummary(BaseModel):
    loan_id: UUID
    total_amount: Decimal
    total_paid: Decimal
    remaining_amount: Decimal
    installments_paid: int
    installments_remaining: int
    next_due_date: date | None
    status: str


    class Config:
        from_attributes = True


class LoanResponse(BaseModel):
    id: UUID
    customer_id: UUID
    principal_amount: float
    interest_amount: float
    total_amount: float
    installment_amount: float
    number_of_installments: int
    repayment_frequency: str
    start_date: date
    end_date: date
    status: str
    notes: Optional[str] = None

    plan_id: Optional[UUID] = None        # FIX
    end_date_actual: Optional[date] = None  # FIX

    class Config:
        orm_mode = True

class CustomerLoanItem(BaseModel):
    loan_id: UUID
    total_amount: Decimal
    total_paid: Decimal
    remaining_amount: Decimal
    installments_paid: int
    installments_remaining: int
    status: str

    class Config:
        from_attributes = True

class CustomerLoanList(BaseModel):
    customer_id: UUID
    loans: list[CustomerLoanItem]
