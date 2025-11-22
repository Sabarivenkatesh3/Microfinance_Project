from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, Date, cast
from datetime import date, timedelta
from ..database import get_db
from .. import models

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def dashboard_stats(db: Session = Depends(get_db)):

    today = date.today()

    total_customers = db.query(models.Customer).count()
    total_loans = db.query(models.Loan).count()
    active_loans = db.query(models.Loan).filter(models.Loan.status == "active").count()

    total_issued = db.query(func.coalesce(func.sum(models.Loan.total_amount), 0)).scalar()
    total_collected = db.query(func.coalesce(func.sum(models.Payment.paid_amount), 0)).scalar()
    pending_amount = total_issued - total_collected

    # Calculate Due Today and Overdue Loans
    loans = db.query(models.Loan).filter(models.Loan.status == "active").all()

    due_today = 0
    overdue_loans = 0

    for loan in loans:
        last_payment = (
            db.query(models.Payment.payment_date)
            .filter(models.Payment.loan_id == loan.id)
            .order_by(models.Payment.payment_date.desc())
            .first()
        )

        if last_payment is None:
            next_due = loan.start_date
        else:
            if loan.repayment_frequency == "daily":
                next_due = last_payment[0] + timedelta(days=1)
            elif loan.repayment_frequency == "weekly":
                next_due = last_payment[0] + timedelta(days=7)
            elif loan.repayment_frequency == "monthly":
                month = last_payment[0].month + 1
                year = last_payment[0].year
                if month > 12:
                    month = 1
                    year += 1
                day = min(last_payment[0].day, 28)  # safe for February
                next_due = date(year, month, day)

        if next_due == today:
            due_today += 1
        if next_due < today:
            overdue_loans += 1

    today_collection = (
        db.query(func.coalesce(func.sum(models.Payment.paid_amount), 0))
        .filter(cast(models.Payment.payment_date, Date) == today)
        .scalar()
    )

    return {
        "total_customers": total_customers,
        "total_loans": total_loans,
        "active_loans": active_loans,
        "total_issued": float(total_issued),
        "collected": float(total_collected),
        "pending": float(pending_amount),
        "due_today": due_today,
        "overdue": overdue_loans,
        "today_collection": float(today_collection),
    }
