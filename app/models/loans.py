from sqlalchemy import Column, String, Numeric, Integer, Date, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..database import Base

class Loan(Base):
    __tablename__ = "loans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)

    principal_amount = Column(Numeric(14, 2), nullable=False)
    interest_amount = Column(Numeric(14, 2), nullable=False)
    total_amount = Column(Numeric(14, 2), nullable=False)

    installment_amount = Column(Numeric(14, 2), nullable=False)
    number_of_installments = Column(Integer, nullable=False)
    loan_duration_days = Column(Integer, nullable=False)

    repayment_frequency = Column(String, nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    status = Column(String, nullable=False, server_default="active")
    notes = Column(String, nullable=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    
    customer = relationship("Customer", back_populates="loans")

    payments = relationship("Payment", back_populates="loan")
