# Routely

**Know your Abuja journey.**

Routely is a public transport journey planner for Abuja. It is designed to help you understand where to board, which connections to take, where to change vehicles, and where to get off.

**Project status:** Routely is a working prototype using sample transport data. The next milestone is to check ten journeys on the ground and test their instructions with passengers.

## What you can do

- Choose a starting stop and destination to explore a sample journey.
- Search using local stop aliases, alternate spellings, and small typing mistakes.
- Read boarding, transfer, and alighting steps alongside a map.
- Find nearby starting stops when you allow location access.
- Share a journey link or download its steps as text.
- Save up to twenty journeys and reopen your five most recent successful searches on this device.
- Explore the ten pilot journeys and submit observations to a shared staff inbox, with a copy on your device.
- Ask the built-in journey helper for assistance. Local AI is optional.

## How it works

1. Open the planner and choose your starting stop and destination.
2. Select **Find a journey** to see the mapped connections and steps.
3. Switch between the steps and map on your phone, then share or download the journey if needed.

## Current limits

The stop locations and connections are samples awaiting field checks. Dashed map lines connect stops; they do not show the streets a vehicle follows. The planner finds the fewest mapped rides. Live service, traffic, fares, operating hours, journey times, street-address search, and walking directions are not available.

Reports are sent to the Django backend for staff review. When the service is unavailable, a draft stays on your device when storage is available; use the retry button or **Coverage & data → Send saved report** later. A delivery receipt confirms submission. Acceptance by staff does not automatically change or verify a route. Map tiles need internet; downloaded text steps can be read offline.

Saved journeys and recent searches also stay in this browser. They store the selected stops and reopen with current route information. They do not provide offline app or map access. If browser storage is unavailable, journeys are only kept for the current visit.

## What comes next

1. Check the ten pilot journeys listed on **Coverage & data**.
2. Improve the instructions using feedback from people unfamiliar with each trip.
3. Expand coverage as more connections are checked and reviewed.

## For developers

Built with React, TypeScript, Vite, Material UI, MapLibre, and Django.

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
<summary>Django reports and staff review</summary>

The backend is tested with Python 3.12. In a separate PowerShell terminal, start from the project root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe manage.py migrate
.venv\Scripts\python.exe manage.py seed_stops
.venv\Scripts\python.exe manage.py createsuperuser
.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

Keep the frontend running with `npm run dev` in another terminal. Open `http://127.0.0.1:8000/admin/` and sign in with the account you created. Filter reports by status or category, read the submitted evidence, choose a review status, and add review notes. Each decision records the reviewer, time, and audit history. Submitted evidence is read-only in the admin.

The frontend and backend seed share `data/stops.json`. These remain sample stop locations. `seed_stops` is repeatable and keeps received reports. SQLite stores the local inbox in `backend/db.sqlite3`, which is excluded from Git along with virtual environments. Run backend checks with:

```powershell
.venv\Scripts\python.exe manage.py test
.venv\Scripts\python.exe manage.py check
```

The Vite proxy sends `/api/v1`, `/admin`, and `/static` to Django, while `/api/chat` still uses local Ollama. Vite blocks direct access to backend files and excludes the Python environment from frontend file watching. The public API accepts reports with CSRF protection and returns delivery receipts; it does not expose the inbox or private observation details. Retrying the same report ID does not create a duplicate. Reports saved before this update are only sent when their owner chooses **Send saved report**.

For hosting, run Django as a separate service with persistent database storage. Set `DJANGO_DEBUG=0`, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, and `DJANGO_CSRF_TRUSTED_ORIGINS`; route the frontend's API requests to it and serve Django's collected static files. `ROUTELY_DB_PATH` can select the SQLite database location. A shared Django cache is needed to share the submission rate limiter across multiple workers. Local development uses a temporary secret unless you set `DJANGO_SECRET_KEY`.

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
