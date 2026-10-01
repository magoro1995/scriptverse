# ScriptVerse Content

This directory contains **original ScriptVerse game content** independently of upstream CodeCombat level content.

## Why this exists

The inherited engine expects rich `Level` objects containing Thangs, Components, Systems, goals, scripts, and related models. Upstream development can obtain these models from `/db/*` endpoints, but ScriptVerse needs a content source that it owns and can version with the project.

The files here are therefore **authoring manifests**, not copied CodeCombat level JSON.

## Level manifest v1

A `scriptverse-level-v1` manifest describes the parts of a level that belong to ScriptVerse:

- biblical context
- mission text
- programming curriculum
- starter code
- goals
- map intent and positions
- engine capabilities required by the level

The first manifest is:

`worlds/the-promised-land/levels/joshua-01-commission.json`

## Goal compatibility

For the first milestone we deliberately use an engine-native goal shape:

```json
{
  "id": "reach-officers",
  "name": "Reach the officers of Israel",
  "getToLocations": {
    "who": ["Hero Placeholder"],
    "targets": ["Israelite Officers Goal"]
  }
}
```

The existing level schema supports `getToLocations`, and `GoalManager` listens for `world:thang-touched-goal` and marks the arrival when the actor and touched target match the goal definition. This lets Joshua 1 reuse the existing goal engine instead of adding ScriptVerse-specific victory logic.

## Engine adapter boundary

The future adapter should convert these manifests into the data expected by the inherited engine. It should be generic enough that Joshua 2, Jericho, Ai, and later worlds use the same adapter.

The adapter may reference reusable open-source engine components/systems by stable original IDs, but it must not import/copy proprietary upstream level definitions.

Known component IDs exposed by the inherited `LevelComponent` model include:

- Physical: `524b75ad7fc0f6d519000001`
- Programmable: `524b7b5a7fc0f6d51900000e`
- Moves: `524b7b8c7fc0f6d519000013`
- Exists: `524b4150ff92f1f4f8000024`
- Collides: `524b7b857fc0f6d519000012`

These are engine component identities, not level content.

## Current milestone

The repository now contains the first original level manifest. The next task is to connect `joshua-01-commission` to the play pipeline and resolve the minimum reusable ThangType/Component/System dependencies needed to instantiate it.