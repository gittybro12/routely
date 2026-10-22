import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinLengthValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class Stop(models.Model):
    id = models.SlugField(primary_key=True, max_length=64)
    name = models.CharField(max_length=160)
    zone = models.CharField(max_length=160)
    latitude = models.FloatField(validators=[MinValueValidator(-90), MaxValueValidator(90)])
    longitude = models.FloatField(validators=[MinValueValidator(-180), MaxValueValidator(180)])

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class CorrectionReport(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending-review", "Pending review"
        ACCEPTED = "accepted", "Accepted for follow-up"
        REJECTED = "rejected", "Rejected"

    class Category(models.TextChoices):
        BOARDING = "boarding", "Boarding or alighting point"
        CONNECTION = "connection", "Connection or transport type"
        MAP = "map", "Map or stop location"
        FIELD = "field-observation", "Field observation"
        OTHER = "other", "Other"

    class Transport(models.TextChoices):
        UNKNOWN = "unknown", "Needs checking"
        TAXI = "shared-taxi", "Shared taxi"
        BUS = "bus", "Bus"
        SHUTTLE = "shuttle", "Shuttle"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    received_at = models.DateTimeField(auto_now_add=True)
    from_stop = models.ForeignKey(Stop, on_delete=models.PROTECT, related_name="reports_from")
    to_stop = models.ForeignKey(Stop, on_delete=models.PROTECT, related_name="reports_to")
    category = models.CharField(max_length=24, choices=Category.choices)
    description = models.TextField(max_length=2000, validators=[MinLengthValidator(10)])
    boarding_landmark = models.CharField(max_length=200, blank=True)
    alighting_landmark = models.CharField(max_length=200, blank=True)
    transport_mode = models.CharField(max_length=16, choices=Transport.choices, default=Transport.UNKNOWN)
    checked_at = models.DateField(null=True, blank=True)
    source = models.CharField(max_length=200, blank=True)
    checked_by = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    review_notes = models.TextField(max_length=2000, blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, editable=False, on_delete=models.SET_NULL)
    reviewed_at = models.DateTimeField(null=True, blank=True, editable=False)

    class Meta:
        ordering = ["-received_at"]
        constraints = [models.CheckConstraint(condition=~models.Q(from_stop=models.F("to_stop")), name="report_different_stops")]

    def __str__(self):
        return f"{self.from_stop} → {self.to_stop} · {self.get_status_display()}"

    def clean(self):
        errors = {}
        if self.from_stop_id and self.from_stop_id == self.to_stop_id:
            errors["to_stop"] = "Choose two different stops."
        if self.checked_at and self.checked_at > timezone.localdate():
            errors["checked_at"] = "The observation date cannot be in the future."
        if self.category == self.Category.FIELD:
            for field in ["boarding_landmark", "alighting_landmark", "checked_at", "source", "checked_by"]:
                if not getattr(self, field):
                    errors[field] = "This field is required for a field observation."
            if self.transport_mode == self.Transport.UNKNOWN:
                errors["transport_mode"] = "Select the observed transport type."
        if self.status != self.Status.PENDING and not self.review_notes.strip():
            errors["review_notes"] = "Add review notes before accepting or rejecting a report."
        if errors:
            raise ValidationError(errors)


class ReportReview(models.Model):
    report = models.ForeignKey(CorrectionReport, related_name="reviews", on_delete=models.PROTECT)
    previous_status = models.CharField(max_length=16, choices=CorrectionReport.Status.choices)
    status = models.CharField(max_length=16, choices=CorrectionReport.Status.choices)
    notes = models.TextField(max_length=2000, blank=True)
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    reviewer_name = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
