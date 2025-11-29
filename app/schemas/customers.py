from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class CustomerBase(BaseModel):
    name: str
    phone: str
    address: str
    id_proof_url: str

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: UUID
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CustomerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    address: str | None = None
    id_proof_url: str | None = None
