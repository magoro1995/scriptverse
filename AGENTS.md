# AGENTS.md — ScriptVerse

## Mission

ScriptVerse is a Christian programming adventure built on the open-source CodeCombat client.

Tagline: **Code through Scripture.**

The goal is to teach real programming through playable missions based on biblical narratives. Scripture is not decorative trivia or a skin over unrelated gameplay. Each mission should connect its programming mechanic naturally to the biblical setting while preserving the meaning and context of the biblical account.

## Starting point

This branch, `scriptverse-v2`, intentionally starts from the repository's clean `master` CodeCombat base.

There is an older experimental implementation on `world-1-promised-land`. Treat it as a prototype/reference only. Do not merge it wholesale and do not assume its architecture is correct. It contains useful experiments and a playable Jordan-crossing prototype, but it also accumulated core-engine patches that ScriptVerse v2 is intended to avoid.

Before implementing substantial changes, study the existing CodeCombat architecture and determine the least invasive extension points.

## Prime engineering rule

**Preserve CodeCombat behavior wherever possible.**

Do not progressively patch CodeCombat core to make ScriptVerse work.

In particular, preserve the inherited systems for:
- code editor / Tome
- Aether parsing and execution
- Python support
- syntax/runtime error reporting
- contextual programming help and hints
- simulation/world execution
- movement and collision
- playback
- goals and victory flow
- existing programming UI behavior

Prefer ScriptVerse-specific modules, adapters, data, content, configuration, and assets over edits to generic CodeCombat infrastructure.

If a core modification is truly unavoidable:
1. explain why an extension/content-layer solution is insufficient;
2. keep the change minimal and isolated;
3. preserve existing CodeCombat behavior for non-ScriptVerse levels;
4. test the inherited behavior affected by the change.

## Architecture target

Aim for this separation:

```
CodeCombat engine
  -> thin ScriptVerse adapter/integration layer
      -> ScriptVerse content
          - worlds/campaigns
          - levels
          - maps
          - biblical narratives
          - objectives
          - characters
          - assets
          - programming curriculum
```

A new ScriptVerse level should eventually be creatable mostly through content/configuration rather than edits to CodeCombat core files.

## Gameplay identity

ScriptVerse is inspired by CodeCombat's proven learning loop:
- player reads a mission
- player writes real code
- code controls a character in the game world
- execution is visually simulated
- errors should produce the same useful feedback/help users expect from CodeCombat
- success is determined by gameplay goals

Do not replace this with trivia, multiple-choice Bible questions, fake coding, or a simple custom HTML game.

The visual target is a polished isometric/tile-based educational RPG/adventure, not primitive rectangles or placeholder geometry as the long-term solution.

## Biblical narrative design

Biblical faithfulness and programming pedagogy are both first-class requirements.

A level may be part of a continuing biblical story, and several consecutive levels may form a mini-campaign when that works naturally.

However, **narrative continuity is an opportunity, not a restriction**.

Do not force the programming curriculum to remain inside one biblical story. When the next programming concept fits another biblical event better, ScriptVerse may move to that story.

Likewise, do not distort a biblical account merely to fit a programming mechanic.

Design rule:

**When several consecutive programming concepts fit naturally within one biblical narrative, continue that story. When continuity would weaken either the biblical account or the programming lesson, begin another suitable narrative.**

Stories should preserve their biblical context and meaning. Gameplay can condense or expand scenes as game design requires, but should not rewrite Scripture to manufacture mechanics.

The player does not always need to control the principal biblical figure. A mission may appropriately control a soldier, priest, spy, messenger, worker, or another participant when that produces better gameplay without misrepresenting the account.

## Curriculum design

Programming progression must be deliberate, cumulative, and pedagogically coherent.

Possible progression includes:
- sequences and basic movement
- coordinates/navigation
- variables
- conditionals
- while loops
- for loops
- functions
- strings
- lists/arrays
- algorithms and problem solving

This list is not a final curriculum. Design the curriculum first, then select biblical narratives that naturally support each concept or sequence of concepts.

Each level should be able to answer:
1. What programming concept is being taught or practiced?
2. What prior concepts are reused?
3. Why does this biblical scenario naturally support this mechanic?
4. What is the player's concrete gameplay objective?
5. What constitutes victory?
6. What useful feedback does the player receive when code is wrong?

## First prototype reference

The older branch contains a prototype named roughly:

`joshua-01-crossing-the-jordan`

Concept:
- Joshua 3 / crossing the Jordan
- basic movement/sequencing
- Joshua crosses the opened riverbed
- Python-like hero commands
- CodeCombat-style Run/Submit flow
- victory goal

The concept may be reused in v2, but reimplement it cleanly from the original CodeCombat base. Do not copy the old integration blindly.

The Jordan level does NOT mean ScriptVerse must continue through the entire conquest of Canaan.

## Development workflow

For substantial tasks:
1. inspect relevant existing CodeCombat implementation before editing;
2. formulate the smallest integration approach;
3. implement;
4. build/run relevant checks;
5. test both the ScriptVerse behavior and any inherited CodeCombat behavior touched;
6. fix regressions before declaring the task complete;
7. report what changed, what was tested, and any remaining uncertainty.

Prefer solving architectural causes over symptom-by-symptom patches.

Do not claim a build, test, runtime behavior, or browser interaction succeeded unless it was actually executed and observed.

## Local development knowledge

The project has previously been run successfully under WSL/Ubuntu with Node via NVM.

Known development command:

```bash
COCO_PROXY=true npm start
```

Local development URL has been:

```
http://localhost:3000
```

Historical setup also required:
- npm dependencies
- Bower dependencies
- Aether build
- project build

Do not assume historical commands are still optimal. Inspect package scripts and current project documentation before changing setup.

## Licensing boundary

Be conservative with CodeCombat content licensing.

The public CodeCombat client engine is open source, but do not assume every CodeCombat level, script, unit configuration, text, map, or art/content asset is freely reusable merely because it appears in the repository or game.

Do not copy proprietary CodeCombat level content into ScriptVerse.

Use existing open-source engine behavior as permitted, and create original ScriptVerse narratives, level designs, maps, text, and assets unless licensing is clearly established.

When adapting any non-code asset or content, verify its applicable license and attribution requirements first.

## Product principles

ScriptVerse should:
- teach genuine transferable programming skills;
- be enjoyable as a game, not merely a worksheet;
- treat Scripture respectfully and accurately;
- integrate Christian worldview meaningfully rather than attaching unrelated verses;
- make the learning progression visible and cumulative;
- minimize technical debt inherited from customization;
- make future level creation substantially easier than building the first integration.

## Immediate v2 objective

Do NOT begin by producing many levels.

First establish a clean, reusable ScriptVerse integration on top of the original CodeCombat base.

The first engineering milestone is:

1. audit CodeCombat's native level-loading/content mechanisms;
2. identify the smallest clean extension strategy for repository-owned ScriptVerse content;
3. implement one end-to-end playable ScriptVerse level;
4. preserve native editor, Aether execution, errors/help, simulation, playback, goals, and UI;
5. prove that a second level can be added primarily as content/configuration rather than another set of core patches.

Only after that architecture is demonstrated should level production scale up.
