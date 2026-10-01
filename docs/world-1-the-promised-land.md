# ScriptVerse — World I: The Promised Land

**Joshua and the Conquest of Canaan**

> Every level advances the story and advances the programmer.

## Design Principles

World I follows two parallel progressions that must remain synchronized:

1. **Biblical progression** — follow the narrative and theological movement of Joshua in its biblical order. Levels may expand or condense episodes for gameplay, but should not rearrange the story merely to fit a programming concept.
2. **Programming progression** — introduce programming concepts in a deliberate sequence. New concepts build on previous concepts rather than replacing them.

ScriptVerse is not Bible trivia with coding attached, and it is not a generic coding course with a biblical skin. Story and computer science must both drive the level design.

## Standard Level Specification

Every level should define:

- **Scripture** — biblical passage/context
- **Story** — what is happening in the narrative
- **Mission** — what the player must accomplish in the world
- **New CS Concept** — the primary new programming idea
- **Previous CS Concepts** — concepts deliberately reinforced
- **Victory Condition** — objective state that completes the level

## Curriculum Map

| # | Scripture / Story | Gameplay / Mission | Programming Focus |
|---|---|---|---|
| 1 | Joshua 1 — Joshua receives God's commission | Navigate through the Israelite camp and report to the officers | First program, syntax, sequences |
| 2 | Joshua 1 — Be strong and courageous | Move through camp to complete assigned preparations | Movement commands |
| 3 | Joshua 1 — Preparing Israel to cross | Deliver instructions to multiple locations | Longer sequences |
| 4 | Joshua 2 — Two spies are sent | Travel toward Jericho | Method arguments |
| 5 | Joshua 2 — The spies enter Jericho | Navigate to Rahab's house | Coordinates and navigation basics |
| 6 | Joshua 2 — Rahab hides the spies | Move while avoiding guards | Objects and properties |
| 7 | Joshua 2 — Escape from Jericho | Reach the hill country safely | Cumulative movement/navigation practice |
| 8 | Joshua 2 — The spies return | Return to Joshua and complete the report | First cumulative challenge |
| 9 | Joshua 3 — Israel approaches the Jordan | Position units for the crossing | Variables |
| 10 | Joshua 3 — Priests advance with the ark | Coordinate ordered movement | Variables + sequences |
| 11 | Joshua 3 — Crossing the Jordan | Execute repeated movement efficiently | Introduction to loops |
| 12 | Joshua 4 — Stones of remembrance | Collect stones from the Jordan | Loops + collect actions |
| 13 | Joshua 4 — Memorial at Gilgal | Transport/place stones correctly | Loops + variables |
| 14 | Joshua 5 — Israel at Gilgal | Navigate the camp and prepare for what comes next | Consolidation |
| 15 | Joshua 5 — Near Jericho | Explore terrain around Jericho | Coordinates/navigation |
| 16 | Joshua 5 — Commander of the LORD's army | Complete a short narrative mission | Cumulative challenge |
| 17 | Joshua 6 — Jericho, first circuit | Move around part of the city | `while` loops |
| 18 | Joshua 6 — Circling Jericho | Complete a full repeated route | Loops |
| 19 | Joshua 6 — Repeated days | Automate repeated circuits | Loops + counters |
| 20 | Joshua 6 — The seventh day | Execute a specified number of repetitions | Counted repetition + variables |
| 21 | Joshua 6 — Fall of Jericho | Complete the full ordered strategy | Capstone I |
| 22 | Joshua 7 — Achan's sin | Investigate conditions within the camp | `if` conditions |
| 23 | Joshua 7 — Defeat at Ai | Respond differently to changing danger | `if` / `else` |
| 24 | Joshua 8 — Preparing the second attack | Choose actions based on position/state | Conditionals |
| 25 | Joshua 8 — Ambush at Ai | Detect nearby enemies | Finding/querying objects |
| 26 | Joshua 8 — Battle of Ai | Attack or move according to conditions | Conditionals + loops |
| 27 | Joshua 8 — Mount Ebal | Execute a structured sequence of instructions | Algorithms |
| 28 | Joshua 9 — The Gibeonites | Inspect information about objects/characters | Comparisons |
| 29 | Joshua 9 — Decision concerning Gibeon | Evaluate multiple conditions | Logical operators |
| 30 | Joshua 10 — Five kings | Organize reusable battle actions | Functions |
| 31 | Joshua 10 — Defense of Gibeon | Reuse strategies with changing targets | Functions + parameters |
| 32 | Joshua 10 — Southern campaign | Complete multiple objectives efficiently | Functions + loops |
| 33 | Joshua 11 — Northern campaign | Solve a larger multi-stage battlefield | Abstraction and cumulative programming |
| 34 | Joshua 12–19 — The land and its allotments | Work with territories/data | Lists / arrays |
| 35 | Joshua 20–22 — Cities, tribes, and settlements | Search and assign locations from collections | Lists + loops |
| 36 | Joshua 23–24 — Joshua's final charge and covenant renewal | Complete a final multi-stage mission | World I capstone |

## Programming Progression

The intended broad progression is:

**Syntax & sequences → movement & arguments → navigation → variables → loops → counters → conditionals → object queries → algorithms → comparisons & logical operators → functions → parameters → abstraction → lists/arrays → cumulative problem solving.**

Concepts remain active after introduction. A later conditional level may still require loops, movement, variables, and object interaction.

## Biblical Narrative Progression

The broad narrative progression is:

**Commission of Joshua → spies and Rahab → crossing the Jordan → memorial stones → Gilgal → Jericho → Achan and Ai → Mount Ebal → Gibeon → southern campaign → northern campaign → land/allotments → tribal settlement → Joshua's final charge and covenant renewal.**

The game should preserve the historical/narrative relationships between these events and provide enough context for the player to understand why each mission is happening.

## World Continuity

The Promised Land should feel like one continuous journey rather than 36 disconnected puzzles. The world map should progressively reveal locations such as the Jordan, Gilgal, Jericho, Ai, Gibeon, the southern campaign region, the northern campaign region, tribal territories, and the final covenant setting.

Player-controlled characters may change when the biblical story and gameplay call for it. Joshua does not need to be the playable hero in every mission. For example, the player may control one of the spies during Joshua 2 while the campaign itself continues to follow Joshua's narrative.

## First Development Milestone

The first technical milestone is **Level 1 — Joshua's Commission**.

It should prove that ScriptVerse can use the existing open-source game engine to provide:

- a playable world
- a controllable hero
- a code editor
- Python execution
- movement commands
- a mission objective
- goal completion
- ScriptVerse-specific biblical narrative/content

Initial programming should remain intentionally simple, for example:

```python
hero.moveRight()
hero.moveRight()
hero.moveUp()
```

The milestone is successful when code entered by the student controls the character in the actual game engine and completing the required route satisfies the level goal.

## Content Boundary

ScriptVerse may build on applicable open-source CodeCombat engine code and appropriately licensed shared assets while preserving required licenses and attribution. ScriptVerse's biblical campaigns, level designs, dialogue, objectives, characters, maps, writing, branding, and other proprietary level content should be original. CodeCombat's proprietary level-specific content should not be copied.