from fastapi import FastAPI
from .database import Base, engine
from .routers import customers, loans, payments, dashboard, ledger


import logging

logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

Base.metadata.create_all(bind=engine)

# include routers
app.include_router(customers.router)
app.include_router(loans.router)
app.include_router(payments.router)
app.include_router(dashboard.router)
app.include_router(ledger.router)

@app.get("/")
def root():
    return {"message": "Microfinance SaaS Backend Running"}


