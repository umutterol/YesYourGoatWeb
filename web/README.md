YesYourGoatWeb — Minimal Web Prototype

This is a zero-dependency static prototype that loads `resources/events/events.json` and implements the core loop:
- Draw an event card (every 3rd week draws from `raid_night_check` tag if present)
- Apply left/right effects to meters
- Clamp meters to 0..10
- Persist to `localStorage`

Run locally
Because browsers block `fetch` from `file://`, serve the folder over HTTP.

Options (pick one):
- Python 3: `cd web && python -m http.server 5173`
- Node (serve): `npx serve web -l 5173` (requires Node/npm)
- PowerShell (basic): `cd web; powershell -c "Start-Process powershell -Verb RunAs -ArgumentList 'Start-Job { python -m http.server 5173 }'"` (if Python is installed)

Then open:
- http://localhost:5173/

Next steps (recommended)
- Migrate to React + TypeScript (Vite) for components and state.
- Add schema validation (AJV) for events at load.
- Implement trait hooks and barks.
