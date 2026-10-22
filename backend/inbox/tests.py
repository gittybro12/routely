import json
import uuid
from datetime import timedelta
from io import StringIO

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management import call_command
from django.test import Client, TestCase, override_settings
from django.utils import timezone

from .models import CorrectionReport, ReportReview, Stop


@override_settings(REPORT_SUBMISSIONS_PER_MINUTE=100)
class ReportTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_stops", stdout=StringIO())
        cls.reviewer = get_user_model().objects.create_superuser("reviewer", password="Test-only-review-password-123")
        cls.unprivileged = get_user_model().objects.create_user("no-permissions", password="Test-only-password-123", is_staff=True)

    def setUp(self):
        cache.clear()
        self.payload = {"id": str(uuid.uuid4()), "from": "wuse2", "to": "jabi", "category": "boarding",
                        "description": "The boarding landmark needs to be checked."}

    def post(self, payload=None, client=None, **headers):
        return (client or self.client).post("/api/v1/reports/", data=json.dumps(self.payload if payload is None else payload), content_type="application/json", **headers)

    def create_report(self):
        response = self.post()
        self.assertEqual(response.status_code, 201)
        return CorrectionReport.objects.get(pk=self.payload["id"])

    def review_data(self, status="accepted", notes="Evidence reviewed; follow up on the boarding point.", total=0):
        return {"status": status, "review_notes": notes, "_save": "Save",
                "reviews-TOTAL_FORMS": str(total), "reviews-INITIAL_FORMS": str(total),
                "reviews-MIN_NUM_FORMS": "0", "reviews-MAX_NUM_FORMS": "1000"}

    def test_receipt_is_private_and_report_starts_pending(self):
        response = self.post()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(set(response.json()), {"id", "receivedAt", "status"})
        self.assertEqual(response.json()["status"], "received")
        report = CorrectionReport.objects.get()
        self.assertEqual(report.status, "pending-review")
        self.assertIsNone(report.reviewed_by)
        self.assertEqual(ReportReview.objects.count(), 0)

    def test_uuid_retries_are_idempotent_and_different_payload_cannot_overwrite(self):
        self.create_report()
        self.assertEqual(self.post().status_code, 200)
        changed = {**self.payload, "description": "Changed report contents should not replace the original."}
        self.assertEqual(self.post(changed).status_code, 409)
        self.assertEqual(CorrectionReport.objects.count(), 1)
        self.assertEqual(CorrectionReport.objects.get().description, self.payload["description"])

    def test_invalid_stops_same_stop_and_short_description_are_rejected(self):
        for fields in [{"from": "missing"}, {"to": "wuse2"}, {"id": "not-a-uuid"}, {"description": "   too tiny  "}, {"category": "invented"}]:
            with self.subTest(fields=fields):
                self.assertEqual(self.post({**self.payload, **fields}).status_code, 400)
        self.assertEqual(CorrectionReport.objects.count(), 0)

    def test_public_caller_cannot_set_review_fields(self):
        for field, value in [("status", "accepted"), ("review_notes", "Approved"), ("reviewed_by", self.reviewer.pk)]:
            self.assertEqual(self.post({**self.payload, field: value}).status_code, 400)
        self.assertEqual(CorrectionReport.objects.count(), 0)

    def test_field_observations_need_complete_dated_evidence(self):
        observation = {"boardingLandmark": "Observed boarding point", "alightingLandmark": "Observed alighting point",
                       "transportMode": "shared-taxi", "checkedAt": timezone.localdate().isoformat(),
                       "source": "Test field notes", "checkedBy": "Test observer"}
        payload = {**self.payload, "category": "field-observation", "observations": observation}
        for field in observation:
            self.assertEqual(self.post({**payload, "observations": {**observation, field: ""}}).status_code, 400)
        future = (timezone.localdate() + timedelta(days=1)).isoformat()
        self.assertEqual(self.post({**payload, "observations": {**observation, "checkedAt": future}}).status_code, 400)
        self.assertEqual(self.post(payload).status_code, 201)
        self.assertEqual(CorrectionReport.objects.get().status, "pending-review")

    def test_invalid_json_content_type_and_oversized_payload_are_rejected(self):
        self.assertEqual(self.client.post("/api/v1/reports/", data="{broken", content_type="application/json").status_code, 400)
        self.assertEqual(self.client.post("/api/v1/reports/", data="{}", content_type="text/plain").status_code, 415)
        self.assertEqual(self.post({**self.payload, "description": "x" * 20000}).status_code, 413)
        self.assertEqual(self.post({**self.payload, "observations": []}).status_code, 400)

    def test_csrf_is_required_and_only_trusted_origins_can_submit(self):
        client = Client(enforce_csrf_checks=True)
        self.assertEqual(self.post(client=client).status_code, 403)
        token = client.get("/api/v1/csrf/").json()["csrfToken"]
        self.assertEqual(self.post(client=client, HTTP_X_CSRFTOKEN=token, HTTP_ORIGIN="https://untrusted.invalid").status_code, 403)
        self.assertEqual(self.post(client=client, HTTP_X_CSRFTOKEN=token, HTTP_ORIGIN="http://127.0.0.1:5173").status_code, 201)

    def test_reports_are_not_publicly_readable(self):
        self.create_report()
        self.assertEqual(self.client.get("/api/v1/reports/").status_code, 405)
        self.assertEqual(self.client.get(f"/api/v1/reports/{self.payload['id']}/").status_code, 404)
        self.assertEqual(self.client.get("/admin/inbox/correctionreport/").status_code, 302)
        self.client.force_login(self.unprivileged)
        self.assertEqual(self.client.get("/admin/inbox/correctionreport/").status_code, 403)

    def test_staff_review_records_reviewer_time_and_audit_without_altering_evidence(self):
        report = self.create_report()
        self.client.force_login(self.reviewer)
        url = f"/admin/inbox/correctionreport/{report.pk}/change/"
        response = self.client.post(url, {**self.review_data(), "description": "An attempt to change submitted evidence."})
        self.assertEqual(response.status_code, 302)
        report.refresh_from_db()
        self.assertEqual(report.status, "accepted")
        self.assertEqual(report.description, self.payload["description"])
        self.assertEqual(report.reviewed_by, self.reviewer)
        self.assertIsNotNone(report.reviewed_at)
        review = ReportReview.objects.get()
        self.assertEqual((review.previous_status, review.status, review.reviewer), ("pending-review", "accepted", self.reviewer))
        self.assertEqual(Stop.objects.count(), 21)
        self.assertEqual(self.post().status_code, 200)
        report.refresh_from_db()
        self.assertEqual(report.status, "accepted")

    def test_staff_review_requires_notes(self):
        report = self.create_report()
        self.client.force_login(self.reviewer)
        response = self.client.post(f"/admin/inbox/correctionreport/{report.pk}/change/", self.review_data(notes=""))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Add review notes")
        report.refresh_from_db()
        self.assertEqual(report.status, "pending-review")
        self.assertEqual(ReportReview.objects.count(), 0)

    @override_settings(REPORT_SUBMISSIONS_PER_MINUTE=2)
    def test_submission_limit_does_not_block_duplicate_retry_receipts(self):
        self.create_report()
        self.assertEqual(self.post({**self.payload, "id": str(uuid.uuid4())}).status_code, 201)
        blocked = self.post({**self.payload, "id": str(uuid.uuid4())})
        self.assertEqual(blocked.status_code, 429)
        self.assertEqual(blocked["Retry-After"], "60")
        self.assertEqual(self.post().status_code, 200)
        self.assertEqual(CorrectionReport.objects.count(), 2)

    def test_seeding_is_repeatable_and_keeps_received_reports(self):
        report = self.create_report()
        call_command("seed_stops", stdout=StringIO())
        self.assertEqual(Stop.objects.count(), 21)
        self.assertTrue(CorrectionReport.objects.filter(pk=report.pk).exists())
        self.assertEqual(self.client.get("/api/v1/health/").json(), {"status": "ok", "stops": 21})
