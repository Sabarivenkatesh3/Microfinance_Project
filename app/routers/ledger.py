from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from ..database import get_db
from .. import models
from datetime import date, timedelta

router = APIRouter(prefix="/customers", tags=["Customer Ledger"])


@router.get("/{customer_id}/ledger")
def customer_ledger(customer_id: str, db: Session = Depends(get_db)):

    # 1️⃣ Find customer
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # 2️⃣ Get all loans for this customer
    loans = db.query(models.Loan).filter(models.Loan.customer_id == customer_id).all()

    ledger = []

    for loan in loans:

        # Total paid for this loan
        total_paid = (
            db.query(func.coalesce(func.sum(models.Payment.paid_amount), 0))
            .filter(models.Payment.loan_id == loan.id)
            .scalar()
        )

        remaining_amount = float(loan.total_amount) - float(total_paid)

        installments_paid = int(total_paid / loan.installment_amount)
        installments_remaining = loan.number_of_installments - installments_paid

        # Last payment
        last_payment = (
            db.query(models.Payment.payment_date)
            .filter(models.Payment.loan_id == loan.id)
            .order_by(models.Payment.payment_date.desc())
            .first()
        )
        last_payment_date = last_payment[0] if last_payment else None

        # Overdue calculation
        today = date.today()
        next_due_date = loan.start_date if installments_paid == 0 else last_payment_date

        if loan.repayment_frequency == "daily":
            next_due_date = next_due_date + timedelta(days=1)
        elif loan.repayment_frequency == "weekly":
            next_due_date = next_due_date + timedelta(days=7)
        else:
            # monthly
            next_due_date = next_due_date.replace(month=next_due_date.month + 1)

        is_overdue = today > next_due_date
        overdue_days = (today - next_due_date).days if is_overdue else 0

        # Get all payments for this loan
        loan_payments = db.query(models.Payment).filter(models.Payment.loan_id == loan.id).order_by(
            models.Payment.payment_date.asc()
        ).all()

        payment_list = [
            {
                "payment_id": str(p.id),
                "amount": float(p.paid_amount),
                "date": p.payment_date,
                "notes": p.notes
            }
            for p in loan_payments
        ]

        ledger.append({
            "loan_id": str(loan.id),
            "principal_amount": float(loan.principal_amount),
            "interest_amount": float(loan.interest_amount),
            "total_amount": float(loan.total_amount),
            "installment_amount": float(loan.installment_amount),
            "number_of_installments": loan.number_of_installments,
            "installments_paid": installments_paid,
            "installments_remaining": installments_remaining,
            "total_paid": float(total_paid),
            "remaining_amount": remaining_amount,
            "start_date": loan.start_date,
            "end_date": loan.end_date,
            "last_payment_date": last_payment_date,
            "next_due_date": next_due_date,
            "is_overdue": is_overdue,
            "overdue_days": overdue_days,
            "status": loan.status,
            "payments": payment_list
        })

    return {
        "customer_id": str(customer.id),
        "customer_name": customer.name,
        "customer_phone": customer.phone,
        "ledger": ledger
    }
