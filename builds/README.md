# Builds

| File | What it is |
|---|---|
| `type-warriors-8.4.html` | The current release: Update 8.4c (Runestone Riddle with music, the rune arch, the sanctum and Silas). Byte-identical to `type-warriors.html` at commit `a95a7a7`. No Lantern Caravan code. |
| `type-warriors-8.5-TEST.html` | The 8.5 test build: everything in 8.4 plus Lantern Caravan (8.5, 8.5b polish, 8.5c detailed wagon). Identical to `type-warriors.html` at the root. No 8.5 Updates-tab notice has been added. |

Both builds use the same save (`localStorage` key `typeWarriorsSave`). The caravan keeps its data in `P.wr`; the 8.4 build ignores it, so a save can move between the two builds.
