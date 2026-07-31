from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class PatientCreate(BaseModel):
    mrn: str
    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    contact_number: Optional[str] = None
    hospital_id: Optional[str] = None


class PatientOut(PatientCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class VitalsInput(BaseModel):
    heart_rate: Optional[float] = None
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    respiratory_rate: Optional[float] = None
    temperature: Optional[float] = None
    spo2: Optional[float] = None
    glucose: Optional[float] = None
