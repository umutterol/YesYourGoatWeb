# YesYourGoat — Prototype Docs (Web)

- GDD: `gdd.md`
- Full GDD v1.1: `GDDv1-1.md`
- Events (authoring): `resources/events/events.json`
- Events schema (machine): `resources/events/schema.json`
- Events schema (human): `resources/events/schema.md`
- Traits pack: `resources/traits/traits.md`
- Trait barks: `resources/barks/trait_barks.json`

Web runtime loads event data from `resources/events/events.json` (copied or served statically by the web app/bundler).

Web Prototype
- A minimal static prototype lives in `web/`. Serve it locally and open http://localhost:5173/.
- Example: `cd web && python -m http.server 5173`
