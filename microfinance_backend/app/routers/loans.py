from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import timedelta, date
from ..database import get_db
from .. import models
from ..schemas.loans import LoanCreate, LoanResponse, LoanSummary
import math
from typing import List
from ..schemas.loans import LoanResponse
router = APIRouter(prefix="/loans", tags=["Loans"])


# Utility function to safely add a month
def add_month(d: date):
    month = d.month + 1
    year = d.year
    if month > 12:
        month = 1
        year += 1

    # Days in each month
    month_days = [31, 29 if year % 4 == 0 else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    day = min(d.day, month_days[month - 1])
    return date(year, month, day)


# ----------------------------------
# CREATE LOAN (DYNAMIC)
# ----------------------------------
@router.post("/", response_model=LoanResponse)
def create_loan(payload: LoanCreate, db: Session = Depends(get_db)):

    customer = db.query(models.Customer).filter(models.Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total_amount = payload.principal_amount + payload.interest_amount

    # Installments count
    number_of_installments = math.ceil(total_amount / payload.installment_amount)

    # Duration
    if payload.repayment_frequency == "daily":
        duration_days = number_of_installments
    elif payload.repayment_frequency == "weekly":
        duration_days = number_of_installments * 7
    elif payload.repayment_frequency == "monthly":
        duration_days = number_of_installments * 30
    else:
        raise HTTPException(status_code=400, detail="Invalid repayment frequency")

    end_date = payload.start_date + timedelta(days=duration_days)

    new_loan = models.Loan(
        customer_id=payload.customer_id,
        principal_amount=payload.principal_amount,
        interest_amount=payload.interest_amount,
        total_amount=total_amount,
        installment_amount=payload.installment_amount,
        number_of_installments=number_of_installments,
        loan_duration_days=duration_days,
        repayment_frequency=payload.repayment_frequency,
        start_date=payload.start_date,
        end_date=end_date,
        notes=payload.notes
    )

    db.add(new_loan)
    db.commit()
    db.refresh(new_loan)
    return new_loan



# ----------------------------------
# LOAN SUMMARY
# ----------------------------------
@router.get("/{loan_id}/summary", response_model=LoanSummary)
def get_loan_summary(loan_id: str, db: Session = Depends(get_db)):

    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    total_paid = (
        db.query(func.coalesce(func.sum(models.Payment.paid_amount), 0))
        .filter(models.Payment.loan_id == loan_id)
        .scalar()
    )

    remaining_amount = float(loan.total_amount) - float(total_paid)

    installments_paid = int(total_paid / loan.installment_amount)
    installments_remaining = loan.number_of_installments - installments_paid

    # Last payment date
    last_payment = (
        db.query(models.Payment.payment_date)
        .filter(models.Payment.loan_id == loan_id)
        .order_by(models.Payment.payment_date.desc())
        .first()
    )
    last_payment_date = last_payment[0] if last_payment else None

    # NEXT DUE DATE
    if last_payment_date is None:
        next_due_date = loan.start_date
    else:
        if loan.repayment_frequency == "daily":
            next_due_date = last_payment_date + timedelta(days=1)
        elif loan.repayment_frequency == "weekly":
            next_due_date = last_payment_date + timedelta(days=7)
        elif loan.repayment_frequency == "monthly":
            next_due_date = add_month(last_payment_date)

    # OVERDUE CALCULATION
    today = date.today()
    is_overdue = today > next_due_date
    overdue_days = (today - next_due_date).days if is_overdue else 0

    status = "completed" if remaining_amount <= 0 else "active"

    return {
        "loan_id": str(loan.id),
        "total_amount": float(loan.total_amount),
        "total_paid": float(total_paid),
        "remaining_amount": remaining_amount,
        "installments_paid": installments_paid,
        "installments_remaining": installments_remaining,
        "next_due_date": next_due_date,
        "last_payment_date": last_payment_date,
        "is_overdue": is_overdue,
        "overdue_days": overdue_days,
        "status": status
    }

@router.get("/", response_model=List[LoanResponse])
def list_loans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    loans = (
        db.query(models.Loan)
        .order_by(models.Loan.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return loans
