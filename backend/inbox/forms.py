from django import forms

from .models import CorrectionReport


class SubmissionForm(forms.ModelForm):
    submission_id = forms.UUIDField()

    class Meta:
        model = CorrectionReport
        fields = ["from_stop", "to_stop", "category", "description", "boarding_landmark",
                  "alighting_landmark", "transport_mode", "checked_at", "source", "checked_by"]

    def clean_description(self):
        value = self.cleaned_data["description"].strip()
        if len(value) < 10:
            raise forms.ValidationError("Describe the issue in at least 10 characters.")
        return value
