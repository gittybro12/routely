# Routely: the first ten journeys

Routely helps someone in Abuja understand where to board, what transport to take, where to change, and where to get off. The first release is complete when ten journeys have been checked on the ground and people unfamiliar with each journey can follow the instructions on a phone.

The current dataset is sample material. No field verification or street-level path is being claimed. A report saved in the app is a pending observation, not approval of the connection.

## Collection targets

1. Wuse 2 → Jabi
2. Wuse 2 → Garki
3. Jabi → Utako
4. Wuse 1 → Berger
5. Berger → Kubwa
6. Gwarinpa → Kubwa
7. Area 1 → Lugbe
8. Lugbe → Airport
9. Asokoro → Nyanya
10. Nyanya → Karu

These are proposed collection targets from the existing sample network. Each must be checked independently, including whether the service exists. Do not assume service in the reverse direction.

## Check each directed connection

- Visit and record the precise boarding location and a recognizable landmark. Check and update the stop coordinates separately; the existing pins are approximate samples.
- Record what type of vehicle serves the connection and how a passenger identifies it or asks for its destination.
- Confirm the alighting location and landmark. Record how the passenger recognizes it.
- Confirm whether a vehicle change is needed. Record each connection separately if so.
- Record service restrictions and uncertainties. Leave fares, hours, and times absent unless there is a dated, reliable source; the current UI does not promise those features.
- Record the observation date, observer, and source (a direct observation, operator confirmation, or another attributable record).
- If collecting a travel path, record a sourced sequence of `[longitude, latitude]` points in the direction travelled. Do not substitute a generic driving route for proof of an actual shared transport service.

Use **Coverage & data → Survey template** to download the ten blank records. Use **Record an observation** for an individual report. Reports stay in this browser's localStorage until downloaded; there is no shared inbox or automatic submission. Export them before clearing browser data.

## Review and maintain the source

Review the report against its evidence before changing `rawRouteDefinitions` in `src/data.ts`. Enter the explicit direction with these optional fields:

```ts
{
  from: 'existing-stop-id',
  to: 'another-existing-stop-id',
  instruction: 'Reviewed, practical boarding instruction',
  transportMode: 'shared-taxi', // or bus, shuttle, unknown
  boardingLandmark: 'Observed boarding landmark',
  alightingLandmark: 'Observed alighting landmark',
  serviceNotes: 'Observed restrictions or uncertainty',
  verification: {
    status: 'verified',
    checkedAt: 'YYYY-MM-DD',
    checkedBy: 'Observer or reviewer',
    source: 'Attributable field record',
  },
  // Optional; only include a real sourced path:
  geometry: [[longitude, latitude], /* recorded points */, [longitude, latitude]],
  geometrySource: 'Attributable path record',
}
```

The UI requires both landmarks, a known transport type, source, observer, and a valid non-future date before showing “field-checked.” All connections in a journey must meet that requirement. The date is shown so readers can judge age; verification is not a claim about live service.

Reverse sample links never inherit verification or geometry. Add a separate explicit entry to record evidence for the return direction. Explicit directions take precedence over generated sample links.

Recorded paths need a source, valid coordinates, at least two points, and endpoints within 1 km of their stop pins in the correct direction. This check catches obvious mismatches; a reviewer must still establish that the path represents the actual service. Missing or rejected geometry stays a dashed schematic connection.

## Pilot acceptance

For each target, have someone unfamiliar with the trip review the phone-sized journey, find the boarding point, identify the correct vehicle, explain each change, and identify where to alight. Record their confusion and update the instructions. Publish only coverage the evidence supports. Check both connections and their current dates again before expanding coverage.
