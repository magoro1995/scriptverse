# Level 01 — Joshua's Commission

**World:** The Promised Land  
**Primary Scripture:** Joshua 1:1–11  
**Development status:** First playable milestone specification

## Purpose

This level establishes the ScriptVerse gameplay loop while faithfully opening the narrative of Joshua. It should be intentionally simple as a programming lesson, but it must feel like the beginning of a continuing biblical journey rather than a disconnected tutorial.

## Biblical Context

Moses has died. Israel is east of the Jordan. The LORD commissions Joshua to lead the people into the land and repeatedly calls him to be strong and courageous. Joshua then commands the officers to prepare the people to cross the Jordan.

The level should not invent a battle or fictional biblical event simply to create gameplay. Its playable mission comes from Joshua's actual preparation of the people in Joshua 1.

## Opening Story Beat

The player is introduced to the Israelite camp east of the Jordan. A short narrative sequence establishes the transition from Moses to Joshua and Joshua's commission.

Key theme: courage and faithful obedience to God's command.

## Player Character

**Joshua** for the first milestone.

Later ScriptVerse levels may use other playable characters when the biblical narrative calls for it.

## Mission

**Report to the officers and begin preparing Israel to cross the Jordan.**

For the first engine milestone, the mission may be represented by navigating Joshua from his starting position to a clearly marked officer/location in camp.

## Programming Goal

### New concepts

- a program is a sequence of instructions
- method-call syntax
- execution order

### Available commands

Initial implementation target:

```python
hero.moveRight()
hero.moveLeft()
hero.moveUp()
hero.moveDown()
```

The exact command API should follow the existing engine's movement capabilities where practical. ScriptVerse should avoid destination commands that automatically solve the player's route when the lesson is intended to teach explicit sequencing/navigation.

### Example starter code

```python
# Guide Joshua through the camp.
hero.moveRight()
```

The student completes the remaining route.

## Map Design

The battlefield should be spacious and readable, consistent with the visual/gameplay scale expected from the underlying engine.

Suggested elements:

- open Israelite camp
- tents primarily around edges rather than forming narrow corridors
- Jordan visible in the broader world context/direction
- Joshua start point
- officer/mission destination
- a small number of natural obstacles that make route choice visible without making movement frustrating

The first level should establish the visual geography that later levels continue toward the Jordan.

## Victory Condition

The level completes when Joshua reaches the designated officer/mission point after being controlled through student code.

## Goals UI

Primary goal:

- Reach the officers of Israel.

Optional secondary educational indicators may later include:

- Run a valid program.
- Use movement commands in the correct sequence.

## Narrative Continuity

Completion should lead naturally into Level 02 rather than resetting the story. Level 02 remains in the Israelite camp and continues preparations from Joshua 1.

## Technical Milestone Requirements

The milestone is not considered complete until the actual inherited game engine can demonstrate all of the following:

1. Load an original ScriptVerse level.
2. Render a playable world.
3. Render/control a hero entity.
4. Show the code editor.
5. Accept Python from the player.
6. Execute movement through the existing code execution pipeline.
7. Evaluate an original ScriptVerse goal.
8. Mark the level complete when the destination is reached.

## Engine Integration Notes

Initial repository inspection confirms that the client loads levels through `app/lib/LevelLoader.coffee`, with `Level` models backed by `/db/level`. `Level.serialize()` denormalizes level Thangs, components, systems, and ThangTypes into the world representation. Campaign data is represented by `app/models/Campaign.js`, whose model uses `/db/campaign` and stores/denormalizes campaign level information.

This means the next engineering task is to identify the supported local-development path for creating original level/campaign database content (editor, fixtures, seed/import scripts, or another repository-supported mechanism) rather than hard-coding Joshua-specific behavior into the generic engine.

## Non-Goal

Do **not** copy an existing CodeCombat level and merely rename characters or dialogue. Joshua's Commission must be original ScriptVerse level content built using the reusable open-source engine infrastructure.