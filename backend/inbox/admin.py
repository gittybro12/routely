from django.contrib import admin
from django.db import transaction
from django.utils import timezone

from .models import CorrectionReport, ReportReview, Stop


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "zone"]
    search_fields = ["name", "zone", "id"]
    readonly_fields = ["id", "name", "zone", "latitude", "longitude"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


class ReviewInline(admin.TabularInline):
    model = ReportReview
    extra = 0
    can_delete = False
    readonly_fields = ["created_at", "previous_status", "status", "notes", "reviewer_name"]
    fields = readonly_fields

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(CorrectionReport)
class CorrectionReportAdmin(admin.ModelAdmin):
    list_display = ["route", "category", "status", "received_at", "reviewed_by"]
    list_filter = ["status", "category", "transport_mode", "received_at"]
    search_fields = ["id", "description", "from_stop__name", "to_stop__name", "boarding_landmark", "alighting_landmark"]
    date_hierarchy = "received_at"
    list_select_related = ["from_stop", "to_stop", "reviewed_by"]
    actions = None
    inlines = [ReviewInline]
    readonly_fields = ["id", "received_at", "from_stop", "to_stop", "category", "description", "boarding_landmark",
                       "alighting_landmark", "transport_mode", "checked_at", "source", "checked_by", "reviewed_by", "reviewed_at"]
    fieldsets = [
        ("Report", {"fields": ["id", "received_at", "from_stop", "to_stop", "category", "description"]}),
        ("Field observations (submitted evidence)", {"fields": ["boarding_landmark", "alighting_landmark", "transport_mode", "checked_at", "source", "checked_by"]}),
        ("Staff review", {"fields": ["status", "review_notes", "reviewed_by", "reviewed_at"],
                         "description": "Acceptance records a review decision. It does not publish or verify a transport connection. Review route evidence separately before updating public data."}),
    ]

    @admin.display(description="Journey")
    def route(self, obj):
        return f"{obj.from_stop} → {obj.to_stop}"

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @transaction.atomic
    def save_model(self, request, obj, form, change):
        previous = CorrectionReport.objects.select_for_update().get(pk=obj.pk)
        reviewed = obj.status != previous.status or obj.review_notes != previous.review_notes
        if reviewed:
            obj.reviewed_by = request.user
            obj.reviewed_at = timezone.now()
        obj.full_clean()
        super().save_model(request, obj, form, change)
        if reviewed:
            ReportReview.objects.create(report=obj, previous_status=previous.status, status=obj.status,
                                        notes=obj.review_notes, reviewer=request.user, reviewer_name=request.user.get_username())
