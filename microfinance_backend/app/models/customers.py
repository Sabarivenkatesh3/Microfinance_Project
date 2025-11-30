from sqlalchemy import Column, String, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from ..database import Base
from sqlalchemy import func

class Customer(Base):
    __tablename__ = "customers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=True)
    id_proof_url = Column(String, nullable=True)
    status = Column(String, nullable=False, server_default="active")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    # FIX: relationship to Loan
    loans = relationship("Loan", back_populates="customer")