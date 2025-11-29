from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from ..schemas.payments import PaymentCreate, PaymentResponse

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/", response_model=PaymentResponse)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)):

    # Check loan exists
    loan = db.query(models.Loan).filter(models.Loan.id == payload.loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    payment = models.Payment(
        loan_id=payload.loan_id,
        paid_amount=payload.paid_amount,
        payment_date=payload.payment_date,  # <-- REQUIRED FIX
        collector_id=None
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment
