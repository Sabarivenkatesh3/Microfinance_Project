from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal

class PaymentCreate(BaseModel):
    loan_id: UUID
    paid_amount: Decimal   
    payment_date: date

class PaymentResponse(BaseModel):
    id: UUID
    loan_id: UUID
    paid_amount: Decimal
    payment_date: date
    collector_id: UUID | None
    created_at: datetime

    class Config:
        from_attributes = True
