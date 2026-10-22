from django.contrib import admin
from django.urls import path

from inbox import views

admin.site.site_header = "Routely staff"
admin.site.site_title = "Routely report review"
admin.site.index_title = "Reports and field observations"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", views.health),
    path("api/v1/csrf/", views.csrf_token),
    path("api/v1/reports/", views.submit_report),
]
