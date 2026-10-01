# ScriptVerse Engine Integration

## Current Finding

The fork is primarily configured as a **front-end development proxy**, not as a self-contained local copy of CodeCombat's production content database.

`package.json` exposes `npm run proxy` by setting `COCO_PROXY=true` and running the local Node server. The local Express server serves the built client. In development, `server_setup.js` proxies requests it does not handle locally to CodeCombat staging (`https://direct.staging.codecombat.com` by default).

This explains how `/db/level`, `/db/campaign`, authentication, and other application data can appear to work during normal upstream development without a local MongoDB service in the included Docker Compose configuration.

The included `docker-compose.yml` has only a `proxy` service. It builds the application, runs `npm run proxy`, and maps host port 7777 to container port 3000. It does not define MongoDB.

## Consequence for ScriptVerse

ScriptVerse cannot depend on CodeCombat's staging database for its own campaign content. Our original levels need a source controlled by ScriptVerse.

We also should not copy upstream proprietary level definitions. `LICENSE-LEVELS.md` explicitly separates CodeCombat level content from the open-source engine.

Therefore, the correct architecture is to keep the reusable engine/client while creating a ScriptVerse-owned content path.

## Development Strategy

### Phase A — Prove the inherited engine runs

Use the existing proxy workflow first. This verifies that the fork builds and that the inherited editor/play client can run without prematurely replacing backend infrastructure.

Expected development entry point:

```bash
npm install
npm run build
npm run proxy
```

or the repository's Docker Compose workflow, which exposes the app on port 7777.

### Phase B — ScriptVerse-owned level content

Create a development content adapter for ScriptVerse levels rather than embedding Joshua-specific behavior in generic world/renderer code.

Target behavior:

1. A ScriptVerse level slug is requested, e.g. `joshua-01-commission`.
2. The ScriptVerse adapter resolves original level metadata/data from repository-controlled content.
3. The resulting object conforms to the existing `Level` model/world serialization expectations.
4. Existing `LevelLoader`, world simulation, Aether/student-code execution, surface rendering, and goal systems remain reusable.

The first adapter should be intentionally narrow and development-oriented. Once the exact minimum Level/Thang/System/Component dependency graph is proven, we can decide whether the production backend should remain file/content-service based or move to a ScriptVerse database/API.

### Phase C — Level authoring

The upstream Level Editor UI is useful as an architectural reference and potentially as an authoring interface, but its persistence calls cannot be assumed to save ScriptVerse content while the backend is proxied to upstream staging.

We should separate:

- **editor UI** — potentially reusable
- **persistence/storage** — must be ScriptVerse-controlled
- **engine execution** — reusable
- **level content** — original ScriptVerse material

## First Playable Target

Slug: `joshua-01-commission`

Required proof:

- original ScriptVerse level loads
- hero appears
- Python editor appears
- student code executes through inherited code pipeline
- movement affects the hero
- reaching the officer satisfies an original goal

Example intended student program:

```python
hero.moveRight()
hero.moveRight()
hero.moveUp()
```

## What We Should Not Do

- Do not hard-code the Joshua campaign into `LevelLoader` or the renderer.
- Do not make CodeCombat staging the long-term ScriptVerse backend.
- Do not copy proprietary upstream level JSON/scripts/dialogue.
- Do not replace Aether/world/goal infrastructure with a homemade HTML game unless engine integration proves genuinely infeasible.

## Next Investigation

Determine the minimum serialized data required by `Level.serialize()` for a small movement-only level, especially:

- hero ThangType
- movement/programmable Components
- required Systems
- goals
- programmable method API
- session/code-language defaults

Then implement the smallest repository-owned ScriptVerse content fixture capable of reaching the existing play pipeline.