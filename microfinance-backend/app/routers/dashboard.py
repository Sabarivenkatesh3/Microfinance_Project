from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, Date, cast
from datetime import date, timedelta
from ..database import get_db
from .. import models

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ---------------------------------------------------
# 1) MAIN DASHBOARD STATS
# ---------------------------------------------------
@router.get("/")
def dashboard_stats(db: Session = Depends(get_db)):

    today = date.today()

    # Total Customers
    total_customers = db.query(models.Customer).count()

    # Total Loans
    total_loans = db.query(models.Loan).count()

    # Active Loans
    active_loans = db.query(models.Loan).filter(models.Loan.status == "active").count()

    # Total Loan Amount Issued
    total_issued = db.query(func.coalesce(func.sum(models.Loan.total_amount), 0)).scalar()

    # Total Collected (Payments)
    total_collected = db.query(func.coalesce(func.sum(models.Payment.paid_amount), 0)).scalar()

    # Pending Amount
    pending_amount = total_issued - total_collected

    # Due Today (simple: loans active and today within loan range)
    due_today = db.query(models.Loan).filter(
        models.Loan.start_date <= today,
        models.Loan.end_date >= today,
        models.Loan.status == "active"
    ).count()

    # Overdue Loans (end date < today)
    overdue_loans = db.query(models.Loan).filter(
        models.Loan.end_date < today,
        models.Loan.status == "active"
    ).count()

    # Today total collection
    today_collection = db.query(
        func.coalesce(func.sum(models.Payment.paid_amount), 0)
    ).filter(
        cast(models.Payment.payment_date, Date) == today
    ).scalar()

    return {
        "total_customers": total_customers,
        "total_loans": total_loans,
        "active_loans": active_loans,
        "total_issued": float(total_issued),
        "total_collected": float(total_collected),
        "pending_amount": float(pending_amount),
        "due_today": due_today,
        "overdue_loans": overdue_loans,
        "today_collection": float(today_collection)
    }



# ---------------------------------------------------
# 2) TODAY'S COLLECTION LIST
# ---------------------------------------------------
@router.get("/today-collection")
def today_collection_list(db: Session = Depends(get_db)):
    today = date.today()

    # Fetch all payments for today
    payments = (
        db.query(
            models.Payment.id,
            models.Payment.paid_amount,
            models.Payment.payment_date,
            models.Payment.notes,
            models.Loan.id.label("loan_id"),
            models.Customer.name.label("customer_name"),
            models.Customer.phone.label("customer_phone"),
            models.Loan.installment_amount
        )
        .join(models.Loan, models.Payment.loan_id == models.Loan.id)
        .join(models.Customer, models.Loan.customer_id == models.Customer.id)
        .filter(cast(models.Payment.payment_date, Date) == today)
        .order_by(models.Payment.payment_date.desc())
        .all()
    )

    result = []

    for p in payments:
        result.append({
            "payment_id": str(p.id),
            "customer_name": p.customer_name,
            "customer_phone": p.customer_phone,
            "loan_id": str(p.loan_id),
            "installment_amount": float(p.installment_amount),
            "paid_amount": float(p.paid_amount),
            "payment_date": p.payment_date,
            "notes": p.notes
        })

    return {
        "date": today,
        "total_collections": len(result),
        "payments": result
    }
