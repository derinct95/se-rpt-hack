from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import repo
from app.db.session import get_db
from app.models import (
    AgendaSuggestRequest,
    Appointment,
    AppointmentCreateRequest,
    EmailDraftRequest,
    EmailDraftResponse,
    EmailMessage,
    EmailSendRequest,
)
from app.services.communications import draft_email

router = APIRouter(prefix="/api", tags=["communications"])


def _load_providers(db: Session, provider_ids: list[str]):
    providers = repo.compare_providers(db, provider_ids)
    if not providers:
        raise HTTPException(status_code=404, detail="No matching providers found")
    return providers


@router.post("/communications/email/draft", response_model=EmailDraftResponse)
def draft_email_endpoint(payload: EmailDraftRequest, db: Session = Depends(get_db)) -> EmailDraftResponse:
    providers = _load_providers(db, payload.providerIds)
    subject, body, generated_by = draft_email(providers, payload.topic)
    return EmailDraftResponse(subject=subject, body=body, generatedBy=generated_by)


@router.post("/communications/email/send", response_model=EmailMessage)
def send_email_endpoint(payload: EmailSendRequest, db: Session = Depends(get_db)) -> EmailMessage:
    _load_providers(db, payload.providerIds)
    return repo.send_email(
        db, payload.providerIds, payload.subject, payload.body,
        related_appointment_id=payload.relatedAppointmentId, sent_by="user",
    )


@router.get("/communications/emails", response_model=list[EmailMessage])
def list_emails_endpoint(providerId: str | None = None, db: Session = Depends(get_db)) -> list[EmailMessage]:
    return repo.list_emails(db, providerId)


@router.post("/communications/agenda/suggest", response_model=EmailDraftResponse)
def suggest_agenda_endpoint(payload: AgendaSuggestRequest, db: Session = Depends(get_db)) -> EmailDraftResponse:
    providers = _load_providers(db, payload.providerIds)
    subject, body, generated_by = draft_email(providers, f"Meeting agenda: {payload.topic}")
    return EmailDraftResponse(subject=subject, body=body, generatedBy=generated_by)


@router.post("/appointments", response_model=Appointment)
def create_appointment_endpoint(payload: AppointmentCreateRequest, db: Session = Depends(get_db)) -> Appointment:
    _load_providers(db, payload.providerIds)
    return repo.create_appointment(
        db, payload.providerIds, payload.topic, payload.agenda, payload.scheduledAt,
        send_confirmation_email=payload.sendConfirmationEmail,
    )


@router.get("/appointments", response_model=list[Appointment])
def list_appointments_endpoint(providerId: str | None = None, db: Session = Depends(get_db)) -> list[Appointment]:
    return repo.list_appointments(db, providerId)
