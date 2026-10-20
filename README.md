# Routely Abuja

A React + Vite journey guide for Abuja. Its purpose is to help someone understand where to board, what transport to take, where to change, and where to get off.

The current transport network is **sample data**. The first milestone is ten journeys checked on the ground. See [FIELD_GUIDE.md](FIELD_GUIDE.md) for collection targets, evidence requirements, and the review workflow.

## Features

- One start → destination → journey flow, with nearby starting stops when location is available.
- Phone layouts with separate journey and map views.
- Ride-by-ride boarding, transfer, alighting, and data status cards.
- Shareable `/planner?from=…&to=…` links and downloadable text steps.
- `/coverage` with ten pilot targets, evidence requirements, and a survey export.
- Correction and field observation reports saved on this device and downloadable for review.
- A built-in journey helper that works without a model. Local Ollama replies are optional; see [AI_SETUP.md](AI_SETUP.md).
- Dashed schematic connections, plus solid recorded paths when sourced geometry exists.

## Setup

1. Install dependencies:

   npm install

2. Run development server:

   npm run dev

3. Open the local URL shown by Vite.

## Notes

- The app uses manual sample data for Abuja stops and connections. It does not provide live service, traffic, travel times, fares, street-address search, or walking directions.
- The search minimizes mapped rides, not time or fare. A connection is not proof that a service operates.
- Map tiles require internet. Downloaded text steps can be read offline; the app itself is not an offline installation.
- Reports use browser localStorage and are not submitted to a server. Export reports before clearing browser data. A shared report inbox remains future work.
- Verification belongs to a specific directed connection. Pending reports never automatically change public route information.

## Validation

Run `npm test` and `npm run build`. Tests cover the fewest-rides search, unknown stops, pilot coverage, verification evidence, path direction and validity, geographic distance, shared links, downloads, and corrupt report storage.
