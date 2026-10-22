import json

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from inbox.models import Stop


class Command(BaseCommand):
    help = "Load the app's current sample stops from the shared data/stops.json file."

    @transaction.atomic
    def handle(self, *args, **options):
        path = settings.BASE_DIR.parent / "data" / "stops.json"
        try:
            stops = json.loads(path.read_text(encoding="utf-8-sig"))
        except (OSError, ValueError) as error:
            raise CommandError("Cannot read the shared sample stops.") from error
        if not isinstance(stops, list) or not stops:
            raise CommandError("The shared stop list is empty or invalid.")
        seen = set()
        for entry in stops:
            if not isinstance(entry, dict) or not {"id", "name", "zone", "latitude", "longitude"}.issubset(entry):
                raise CommandError("Each sample stop needs an ID, name, zone and coordinates.")
            if entry["id"] in seen:
                raise CommandError("Duplicate stop IDs are not allowed.")
            seen.add(entry["id"])
            stop = Stop(**{field: entry[field] for field in ["id", "name", "zone", "latitude", "longitude"]})
            stop.full_clean(validate_unique=False)
            Stop.objects.update_or_create(pk=stop.pk, defaults={field: getattr(stop, field) for field in ["name", "zone", "latitude", "longitude"]})
        self.stdout.write(self.style.SUCCESS(f"Loaded {len(seen)} current sample stops. No route verification was changed."))
