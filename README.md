# Routely

**Know your Abuja journey.**

Routely is a public transport journey planner for Abuja. It is designed to help you understand where to board, which connections to take, where to change vehicles, and where to get off.

**Project status:** Routely is a working prototype using sample transport data. The next milestone is to check ten journeys on the ground and test their instructions with passengers.

## What you can do

- Choose a starting stop and destination to explore a sample journey.
- Read boarding, transfer, and alighting steps alongside a map.
- Find nearby starting stops when you allow location access.
- Share a journey link or download its steps as text.
- Explore the ten pilot journeys and record observations for review.
- Ask the built-in journey helper for assistance. Local AI is optional.

## How it works

1. Open the planner and choose your starting stop and destination.
2. Select **Find a journey** to see the mapped connections and steps.
3. Switch between the steps and map on your phone, then share or download the journey if needed.

## Current limits

The stop locations and connections are samples awaiting field checks. Dashed map lines connect stops; they do not show the streets a vehicle follows. The planner finds the fewest mapped rides. Live service, traffic, fares, operating hours, journey times, street-address search, and walking directions are not available.

Reports are saved in your browser and must be downloaded to share with a maintainer. They are not automatically submitted or approved. Map tiles need internet; downloaded text steps can be read offline.

## What comes next

1. Check the ten pilot journeys listed on **Coverage & data**.
2. Improve the instructions using feedback from people unfamiliar with each trip.
3. Expand coverage as more connections are checked and reviewed.

## For developers

Built with React, TypeScript, Vite, Material UI, and MapLibre.

<details>
<summary>Run on your computer</summary>

With Node.js and npm installed, open a terminal in the project folder:

```sh
npm install
npm run dev
```

Open the local URL printed in the terminal. If PowerShell blocks the npm script, use `npm.cmd` in place of `npm`.

To run the tests and create a production build:

```sh
npm test
npm run build
```

</details>

<details>
<summary>Optional local AI setup</summary>

The built-in helper works without a model. To enable local AI, install and start Ollama on the same computer, then download the configured model:

```sh
ollama pull qwen3.5:4b
```

Start Routely with `npm run dev` and open the journey helper. The Vite development server forwards `/api` requests to Ollama at `127.0.0.1:11434`.

If the model cannot be reached, check that Ollama is running and the model download has finished. A hosted version needs a reachable model service; the development proxy does not provide a model for website visitors.

</details>

<details>
<summary>Contributing and checking route information</summary>

Contributions can improve the interface, accessibility, instructions, or transport data. Keep changes focused and run the tests and production build before submitting a pull request.

For fieldwork, download the survey template from **Coverage & data**. Record the exact stop coordinates, boarding and alighting landmarks, vehicle type, observation date, observer, and source. Check each direction separately and test the instructions with someone unfamiliar with the journey. Download observations before clearing browser data.

After reviewing the evidence, update `rawRouteDefinitions` in `src/data.ts`. A connection appears field-checked only when it has both landmarks, a known transport type, `verification.status: 'verified'`, a source, an observer, and a valid observation date that is not in the future. All connections in a journey must qualify. Generated reverse connections do not inherit verification or recorded paths.

Recorded paths need a source and at least two valid `[longitude, latitude]` points. Their endpoints must be within 1 km of the corresponding stop pins, in the correct direction. A reviewer must confirm that the path represents the service. Missing or rejected paths remain dashed map connections. See `src/types.ts` for the data fields and `src/journey.ts` for the checks.

</details>
