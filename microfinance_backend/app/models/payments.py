# app/models/payment.py

from sqlalchemy import Column, Numeric, Date, TIMESTAMP, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    loan_id = Column(UUID(as_uuid=True), ForeignKey("loans.id", ondelete="CASCADE"))
    paid_amount = Column(Numeric(14, 2), nullable=False)
    payment_date = Column(Date, nullable=False)
    collector_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    notes = Column(String, nullable=True)   # <-- FIXED

    loan = relationship("Loan", back_populates="payments")
