from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from ..database import Base
import uuid

class LoanPlan(Base):
    __tablename__ = "loan_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_name = Column(String, nullable=False)
    payment_frequency = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # REMOVE THIS — no foreign key exists anymore
    # loans = relationship("Loan", back_populates="plan")
