# app/routers/customers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from typing import List
from uuid import UUID
from ..schemas.loans import CustomerLoanList, CustomerLoanItem

from ..database import get_db
from .. import models
from ..schemas.customers import (
    CustomerCreate,
    CustomerResponse,
    CustomerUpdate,
)

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    new_customer = models.Customer(
        name=payload.name,
        phone=payload.phone,
        address=payload.address,
        id_proof_url=payload.id_proof_url,
    )
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer


@router.get("/", response_model=List[CustomerResponse])
def list_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List customers with simple pagination"""
    customers = db.query(models.Customer).offset(skip).limit(limit).all()
    return customers


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: UUID, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: UUID, payload: CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    # Update only provided fields
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(customer, key, value)

    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: UUID, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    db.delete(customer)
    db.commit()
    return None


@router.get("/{customer_id}/loans", response_model=CustomerLoanList)
def get_customer_loans(customer_id: str, db: Session = Depends(get_db)):

    # Check customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Get all loans for this customer
    loans = db.query(models.Loan).filter(models.Loan.customer_id == customer_id).all()

    loan_items = []

    for loan in loans:
        total_paid = (
            db.query(func.coalesce(func.sum(models.Payment.paid_amount), 0))
            .filter(models.Payment.loan_id == loan.id)
            .scalar()
        )

        remaining = loan.total_amount - total_paid
        installments_paid = int(total_paid / loan.installment_amount)
        installments_remaining = loan.number_of_installments - installments_paid

        loan_items.append(
            {
                "loan_id": loan.id,
                "total_amount": loan.total_amount,
                "total_paid": total_paid,
                "remaining_amount": remaining,
                "installments_paid": installments_paid,
                "installments_remaining": installments_remaining,
                "status": loan.status,
            }
        )

    return {
        "customer_id": customer.id,
        "loans": loan_items
    }
