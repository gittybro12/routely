import hashlib
import json
import time

from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import RequestDataTooBig
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_GET, require_POST

from .forms import SubmissionForm
from .models import CorrectionReport, Stop


def csrf_failure(request, reason=""):
    return JsonResponse({"error": "Your submission token expired. Please try submitting again."}, status=403)


@require_GET
@never_cache
def csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_GET
def health(request):
    return JsonResponse({"status": "ok", "stops": Stop.objects.count()})


def receipt(report, status=200):
    # Receipt confirms delivery only. Review decisions and observations stay private.
    return JsonResponse({"id": str(report.id), "receivedAt": report.received_at.isoformat(), "status": "received"}, status=status)


def same_submission(report, cleaned):
    for name in SubmissionForm.Meta.fields:
        actual = getattr(report, name)
        if actual != cleaned[name]:
            return False
    return True


def limited(request):
    address = request.META.get("REMOTE_ADDR", "unknown")
    digest = hashlib.sha256(address.encode()).hexdigest()
    bucket = int(time.time()) // 60
    key = f"report-submit:{digest}:{bucket}"
    cache.add(key, 0, 65)
    try:
        count = cache.incr(key)
    except ValueError:
        cache.add(key, 1, 65)
        count = 1
    return count > settings.REPORT_SUBMISSIONS_PER_MINUTE


@require_POST
def submit_report(request):
    if request.content_type != "application/json":
        return JsonResponse({"error": "Send the report as JSON."}, status=415)
    try:
        payload = json.loads(request.body)
    except RequestDataTooBig:
        return JsonResponse({"error": "The report is too large."}, status=413)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse({"error": "The report contains invalid JSON."}, status=400)
    allowed = {"id", "from", "to", "category", "description", "observations"}
    if not isinstance(payload, dict) or set(payload) - allowed:
        return JsonResponse({"error": "The report contains unsupported fields."}, status=400)
    for name in ["id", "from", "to", "category", "description"]:
        if not isinstance(payload.get(name), str):
            return JsonResponse({"error": f"A valid {name} is required."}, status=400)
    observations = payload.get("observations", {})
    observation_fields = {"boardingLandmark": "boarding_landmark", "alightingLandmark": "alighting_landmark",
                          "transportMode": "transport_mode", "checkedAt": "checked_at", "source": "source", "checkedBy": "checked_by"}
    if not isinstance(observations, dict) or set(observations) - set(observation_fields) or any(not isinstance(value, str) for value in observations.values()):
        return JsonResponse({"error": "The field observations have an invalid format."}, status=400)
    data = {"submission_id": payload["id"], "from_stop": payload["from"], "to_stop": payload["to"],
            "category": payload["category"], "description": payload["description"]}
    data.update({field: observations.get(key, "") for key, field in observation_fields.items()})
    data["transport_mode"] = data["transport_mode"] or "unknown"
    form = SubmissionForm(data)
    if not form.is_valid():
        return JsonResponse({"error": "Check the report details.", "fields": form.errors.get_json_data()}, status=400)
    report_id = form.cleaned_data["submission_id"]
    existing = CorrectionReport.objects.filter(pk=report_id).first()
    if existing:
        if same_submission(existing, form.cleaned_data):
            return receipt(existing)
        return JsonResponse({"error": "An earlier version of this report was already received. Create a new report for different details."}, status=409)
    if limited(request):
        response = JsonResponse({"error": "Too many reports were sent. Wait a minute before trying again."}, status=429)
        response["Retry-After"] = "60"
        return response
    try:
        with transaction.atomic():
            report = form.save(commit=False)
            report.pk = report_id
            report.save(force_insert=True)
    except IntegrityError:
        existing = CorrectionReport.objects.filter(pk=report_id).first()
        if existing and same_submission(existing, form.cleaned_data):
            return receipt(existing)
        return JsonResponse({"error": "This report ID was already used for different details."}, status=409)
    return receipt(report, status=201)
