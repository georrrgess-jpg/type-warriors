# Update 8.7 — The Grand Polish: menus, fixes, motion and a fair economy

Implementation plan. Phase 1 (this document) is done. Phase 2 builds it, milestone by milestone. Phase 3 verifies,
measures and smooths. Read `CLAUDE.md` and `type-warriors-source/HANDOFF.md` first.

The plan comes from five audits of build 8.6d (commit `1a06958`):
- an economy audit, which read every gold writer and ran bots through each mode;
- a menu sweep, covering 43 screens at three viewports with keyboard, focus and overlap checks;
- a gameplay bug hunt;
- a static animation and performance audit;
- spot checks of the most important claims against the source.

Starting point: the full regression passes 36/36 on 8.6d. `t_fishing` timed out under load and passed when rerun alone.

The raw audit scripts are in `tools/audit87/`. Line numbers are approximate, so search by name. Every finding listed
here was checked against the source unless it is marked *(unverified)*.

---

## 0. Goals, and the rules that still apply

**Goals**
1. **Menus that work the same everywhere.**
   - Back and Esc return to the screen you came from.
   - Focus, modals, badges and the keyboard behave the same on every screen.
   - Nothing important hides under the dock.
2. **Older screens catch up with the newest modes** (Moonlit Fishing, Runestone Riddle, Lantern Caravan): same panels,
   gold Pirata titles, one Back, and one clear next action.
3. **Fix the confirmed bugs and close the gold exploits.**
4. **A fair economy.**
   - Each kind of play falls inside a coins-per-minute band.
   - No casino game returns more than it takes.
   - Reward text matches what is paid.
   - Late-game players have things worth saving for.
5. **Smooth motion that follows the performance rules everywhere**, not only in the new modes. Screen changes and
   modal exits stop popping.

**Rules that still apply (from `CLAUDE.md`)**
- **No Updates-tab (bell) notice for 8.7** unless the owner asks for one, and then ask for an okay first. Marking old
  notices as read for brand-new saves (M3) is allowed: it adds nothing.
- **Do not change the Celestial or Graveyard chest animations.** This includes their `shadowBlur`: they are listed
  below only so nobody "fixes" them by accident.
- No Wix, no Firebase. No model IDs in anything committed. Kill test servers by PID (`tools/servers.sh stop`).
- **Never take gold away from a save.** Rebalancing changes future earnings only, and migrations only refund.
- **Values the owner set by hand must not change without asking:**
  - Endless `EGK=.9` (the 8.3 cut);
  - caravan pay 175/420/840, route lengths 1260/1820/2380, and the gold medal at 3 shields and 85%;
  - Higher or Lower's edge, which the owner already lowered once (1.1 → 1.075).
  
  The economy section says where a change touches one of these and makes it an **owner decision** (§8).
- Keep element IDs stable where tests use them (`#dk_*`, `#dkfish`, `#dkwagon`, `#bell`, `#dkcal`, `#np`, `#tr`,
  `#go`, `#dcb`).

**Code conventions for this update**
- **New modules** `94a_…` to `94n_…` go after `93l_wagon_screens.js` and before `70c_ttmenu.js` in **both** `build.sh` and
  `build_ast3.sh`. Add them with `sed`, never by hand-editing `out.html`.
- **Prefer overrides in the new modules.** Where a value is a `const`, the override has to replace the function that
  reads it. If that is impractical, edit the original module after a backup (`name.vNbak`, next free number).
- **Const traps found while planning:**
  - `HLE` (`65_casino.js:111`, read by `mHL`);
  - `EGK` and `EGK_GY` (`50_game.js:80`, read by `gain`);
  - `GYK` (`84c_gy_mode.js:7`);
  - `astMul` and `AST_PAY` (`85_astral.js:312-319`, applied in a `start` wrapper);
  - `kbWant` (`63_touch.js:18`, a `const` arrow function).
  
  `QZ` (`67c_quiz.js:3`) is a `const` object, so it can be changed with `Object.assign`.

---

## 1. What the audits found (summary)

| Area | Headline | Evidence |
|---|---|---|
| Economy | Lantern Caravan pays about 410 / 830 / 1,200 coins a minute (Millbrook / Pines / Gallows, 45 WPM bot, 10 s between runs) against 170–430 for campaign replays and 209 for Endless | `93a:12-20`, `93c:79,117-125`; `tools/audit87/econ/wagon_rates.js` |
| Economy | Higher or Lower returns 104–106% with a sensible strategy | `HLE=1.075`, `65_casino.js:111`; `higher_lower_rtp.py` |
| Economy | Prestige keeps `P.ug`, so a respec right after prestige refunds 75% of the old tree (measured 36,120) | `68b_prestige.js:58-59`, `62_meta.js:181` |
| Economy | 2× game speed multiplies gold per kill (`S.gm*=r`) and the level-clear bonus | `50_game.js:342`, `60_ui.js:147` |
| Economy | Eggs can be bought after every companion of that rarity is owned; the extra eggs never hatch | `87a_pet_data.js:96`, `87i:324` |
| Menus | Practice, Owned crates, Settings, Bounties and Trophies start with their main button under the dock | `88_dock.js:68` (`dkFit` zooms to 0.74 and still overflows) |
| Menus | Trick-or-Treat and Fishing can't be typed on touch screens | `kbWant=()=>TM()&&S.mode==='play'` (`63_touch.js:18`) |
| Menus | 4 trophies can't be earned on new saves (they read the retired Daily Challenge) | `62_meta.js:25-28` |
| Menus | Shop, codes and caravan modals have no focus trap; the bell ignores Esc and keeps showing 14 unread on a fresh save | `68d:61`, `86b:78`, `74_shell.js:52-58` |
| Menus | Settings, Help, Save Center, Menu background and Calendar always go Back to the hub | `88_dock.js:59,232` hard-code `title` |
| Motion | Every screen change is an instant `innerHTML` swap; five modals "fade out" by jumping straight to the end (same keyframe name with `reverse` does not restart) | `60_ui.js:4,6`; `62e_hall.js:357`, `87c:330,349`, `87e:424`, `89u:211` |
| Motion/perf | 110 keyframes animate non-compositor properties; 177 transitions animate box-shadow, filter or size; the global `h1` runs an infinite 52 px drop-shadow loop on the home logo | `00_head.html:19-20` and the tables in §6 |
| Perf | The main canvas keeps painting the menu background under opaque Fishing, Riddle and Caravan screens | only the Casino and Wildcard skip `draw()` (`88l:18`, `89f:22`) |
| Perf | The home hub is the most expensive screen: 40–45 ms a frame against 25 ms for a campaign fight and 26–30 ms for the caravan (headless, idle machine, 3 runs). Boot reaches `DOMContentLoaded` in 0.9–1.2 s | quick rAF probe; becomes `tools/perf87/frames.py` in M0 |
| Gameplay | Fishing loses a caught fish if you leave during the catch show; the riddle saves its result before paying it, so a reload at the wrong moment loses the payout | Appendix A, items A1 and A3 |
| Clean | No page or console errors on any of the 43 screens; every screen reaches the hub in one or two Esc presses; all hub hotkeys work | menu sweep |

---

## 2. Milestones and order

Each milestone is shippable on its own. Each one goes through the full `CLAUDE.md` delivery: both HTML copies, the
zip, a HANDOFF section, commit, push, screenshots and a short summary. Version labels: **8.7a … 8.7g**.

| # | Milestone | Main modules | Depends on |
|---|---|---|---|
| M0 | Baselines and tools: perf numbers, UI sweep, economy sim, animation guard | `tools/perf87/`, `tools/ui/`, `tools/econ/` | — |
| M1 | Bug fixes and exploit closures that change no balance numbers | `94a_fixes87.js` | M0 |
| M2 | Economy rebalance, gold ledger, migration | `94b_econ87.js`, `94c_ledger87.js` | M1, §8 decisions |
| M3 | UI foundation: navigation stack, modal manager, badges, focus and keyboard | `94d_ui_kit.js`, `94e_ui_nav.js`, `94f_ui_modal.js`, `94g_ui_keys.js` | M1 |
| M4 | Hub and Play: Continue, a Choose-mode gallery, NEW-badge registry, Quick Switcher | `94h_ui_home.js`, `94i_ui_switch.js` | M3 |
| M5 | Restyle the screens that lag behind; copy, Help and trophies | `94j_ui_restyle.js`, `94k_ui_copy.js` | M3 |
| M6 | Motion: screen transitions, modal exits, loops moved to opacity and transform, bars and toasts | `94l_motion87.js` | M3 |
| M7 | Performance: skip hidden draws, bake hot paths, pre-warm heavy screens, faster boot | `94m_perf87.js` | M0 |
| M8 | Final QA, docs and delivery | tests, HANDOFF, `CLAUDE.md` latest-update line | all |

Suggested split for the model phases the owner uses:
- **Phase 2 (build):** M0–M5.
- **Phase 3 (verify and polish):** M6–M8. M6 and M7 are where smoothness comes from, and they need the most careful
  before/after measurement.

---

## 3. M0 — Baselines and tools (do this first)

1. **`tools/perf87/frames.py`**
   - rAF frame times (mean, p95, max over 180 frames) for: the home hub; each dock screen; Fishing hub; Riddle;
     Caravan hub; a campaign fight; the Daily calendar; the Astral map; the Casino lobby.
   - Two settings: default, and CDP `Emulation.setCPUThrottlingRate` 4 at device scale factor 1.5.
   - Also time to `DOMContentLoaded` and to the first `title()` paint.
   - Run it on an idle machine (no regression running) three times and keep the median. Save the numbers in
     HANDOFF's 8.7 section as the baseline.
2. **`tools/ui/sweep.py`.** Promote `tools/audit87/menus/sweep.py` and `lib.py`. It opens every screen in the menu tree
   (§5.1) and records:
   - open time;
   - Back and Esc results;
   - Tab focus;
   - overlaps (`tools/wr/overlap.js`) at 1600×900, 1280×720 and 390×844;
   - "covered by dock" (main buttons whose rect intersects `.dk`);
   - fonts in use.
   
   It writes `tools/ui/out/report.json` and screenshots. Becomes `t_ui87.py` in M8.
3. **`tools/econ/sim.py`.** Promote `tools/audit87/econ/ev.py`, `combat_rates.js` and `wagon_rates.js` into one runner
   that prints a coins-per-minute table per mode at 30, 45 and 70 WPM. Commit its output before and after M2.
4. **`tools/ui/anim_guard.js`.** Injected on each screen, it lists `document.getAnimations()` whose keyframes animate
   anything other than `transform`, `opacity` or `offset-*` and are `infinite`, plus running transitions on
   `box-shadow` or `filter`. Exclude the chest animations by selector (Celestial: `85d_cxopen`; Graveyard: `84f_gy_crate`).
   The M6 target is a count of zero.

**Acceptance:** the baseline numbers are in HANDOFF and the four tools are documented in `tools/README.md`.

---

## 4. M1 — Bugs and exploits (no balance numbers change)

Put everything in `94a_fixes87.js` unless the note says otherwise.

| # | Fix | Where | How |
|---|---|---|---|
| B1 | Touch keyboard in Trick-or-Treat and Fishing | `63_touch.js:18` (`const kbWant`) | `kbWant` is a `const`, so wrap its callers or edit `63_touch.js` (back it up first) to `TM()&&['play','treat','fish'].includes(S.mode)`. Check that each mode's key handler takes the on-screen keys (the caravan's `wrTouchKb` is the model). Check the Riddle too. Test at 390×844 and 844×390. |
| B2 | 4 trophies that can't be earned | `62_meta.js:25-28` | Keep the ids so earned trophies stay earned. Point them at riddle stats (`RRP()`): **Daily Duty** = solve your first riddle; **Creature of Habit** = a 7-day riddle streak; **Daily Victor** = solve 5 riddles; **Perfect Day** = solve one in 1–2 guesses. Rewrite their text. (Owner decision D4: remap or retire.) |
| B3 | Prestige keeps `P.ug`, so respec refunds a tree you already lost | `68b_prestige.js:58` | Wrap `doPrestige` to set `P.ug=0` after it runs. No migration needed. |
| B4 | Eggs bought beyond what can hatch | `87a:96` `petBuy`, `87i:324` button | Block when `P.eggs[k] >= companions of rarity k not yet owned`, and show "All Rare companions found" in place of Buy. Migration: refund surplus eggs at their price once (`P.m87egg=1`) with a toast (not a bell notice). |
| B5 | Level-ups from calendar XP or crate duplicates skip the 100-gold level bonus | `72_daily.js:35`, `68_crate.js:108` | Send both through the same level-up path campaign XP uses (find the function that pays `100` per level in `60_ui.js:134`). |
| B6 | Wildcard pays the +150 first-win bonus for free practice games and past the 15-game daily cap | `89d:87,98` | Pay it only on staked games inside the cap. |
| B7 | Shop badges stay stale after a purchase (dock Shop badge and the "Owned crates" sub-tab) | `68d_shop.js:51` | Covered by the badge refresher in M3. Until then, call `dkRefreshBadges()` from a `shBuy` wrapper. |
| B8 | Settings jumps back to the top on every option click | `60_ui.js:79` | Toggle classes in place, or keep and restore `scrollTop` across the re-render (`fitopt` in `88n` already does this). |
| B9 | Bell: Esc doesn't close it, focus doesn't move into it, the count doesn't refresh after reading, and "Clear" comes back as "1" | `74_shell.js:52-58` | Esc closes and returns focus to `#bell`; focus the first tab on open; re-render the badge on read; "Clear" leaves "1 action left" if one remains. |
| B10 | Legacy corner buttons (`#cn`: Casino, Music, Fullscreen in Pirata One) still show on Campaign, Calendar, the Casino lobby and Trick-or-Treat, and overlap Campaign's right panel. The Casino button even shows inside the Casino. | `dkCorner` `88_dock.js:70` | Hide `#cn` on every screen that isn't gameplay. Music and Fullscreen already live in More and in each mode's own bar. (Owner decision D5.) |
| B11 | Unguarded `setTimeout`s re-open a pet screen after Back was pressed | `87d_pet_game.js:35`, `87c_pet_hall.js:161,167,184` | Take a screen token (`SHOWT` from `show`) at schedule time and skip if it changed. |
| B12 | "none" shown as a stat value in the display font; "Prestige none yet" | `84i_beginner.js:90`, `60_ui.js:35`, `84e_gy_ui.js:55` | Show "—" or "No record yet" in Poppins. |
| B13 | Performance mode pauses infinite CSS animations wherever they happen to be, freezing coins and bells mid-squash | `88k_access_perf.js:50` | Set `a.currentTime=0` before `a.pause()`. |
| B14 | Codes can be redeemed again after "Reset save"; the file header says no codes ship with the game | `86b_codes.js:3,7-11` | Keep a used-codes list outside `P` (localStorage `twCodesUsed`) that survives a reset, and fix the header comment. Low priority. |
| B15 | The ten gameplay defects from the bug hunt | Appendix A | Fix A1–A10 as written there. A1, A2 and A3 are the important ones. |
| B16 | Big Screen counts neither the caravan nor fishing as play (`fsBusy` is a const listing neither `wagon` nor `fish`) | `88m_fs_bigscreen.js:15` | Wrap the callers (`fsSleep` and the wake path) to treat `S.wr` and `S.mode==='fish'` as busy. |

**Acceptance:**
- `t_wagon`, `t_riddle` and the 36-test regression pass.
- New checks for B1–B6 and B9 are in `t_fix87.py`.
- `tools/ui/sweep.py` shows no new issues.

### 4.1 Gameplay bug hunt

The ten defects are listed in Appendix A, with repro scripts in `tools/audit87/bugs/`.

---

## 5. M3–M5 — Menus

### 5.1 The menu tree (current entry points)

- **`title()`** (`88_dock.js:73`). It is wrapped by: Fishing card `90f:121`, Riddle card `92d:37`, Caravan card `93d:152`,
  Trick-or-Treat `70_main.js:214`, Arena `84l:4`, Resume `82_resume.js:45`.
- **Header:** `#np` and `#tr` open `profile()` and `profile(1)`.
- **Campaign panel:** opens `campaign(cmCur())` (`75_campaign.js:64`, wrapped in `85_astral.js:463`).
- **Home cards:**
  - Riddle `#dcb` opens `dcMenu`, which opens `rrMenu` (`92k:13`).
  - Fishing `#dkfish` opens `fishing()` and then `fsHub` (`90r:289`).
  - Events `#dkev` opens `modeSheet('ev')`; outside Halloween this card is Endless `#go`, which opens `endlessMenu`
    (`84i:78`).
  - Caravan `#dkwagon` opens `wagonMenu` (`93j:193`).
  - "Manage pet" opens `petHall()`; "Manage gear" opens `armory()`.
- **Dock** (`DKN`, `DKSUB`, `DKGO` in `88_dock.js:16-22`; Loadouts added at `88e:205`):
  - **Play** opens `modeSheet()` (`88_dock.js:186`, wrapped in 90f, 92d and 93d).
  - **Gear:** Armory, Loadouts, Skill Tree.
  - **Pets:** `petHall`.
  - **Progress:** Collection (`catalog`), Bounties, Trophies.
  - **Shop:** `shop` and Owned crates (`crateHub`).
  - **More:** `moreSheet` (`88_dock.js:217`).
- **Corner:** bell (`bellBind`, `74_shell.js:52`) and calendar (`dailyMenu`).
- **Hub hotkeys** (`homeKey`, `88_dock.js:117`, plus F and W): C E R P G M A K L B S X O T H D F W and Enter.

### 5.2 M3 — UI foundation

**`94d_ui_kit.js` — shared components (CSS-first, small JS helpers)**
- **Tokens.** Reuse the HANDOFF palette and fonts. Classes:
  - `.uk-panel`: indigo glass, 18–22 px radius, 1 px inner top highlight;
  - `.uk-title`: Pirata One, gold gradient, `#12081f` 3 px shadow;
  - `.uk-sub`: lavender Poppins;
  - `.uk-btn` with `.pri` (gold), `.sec` (indigo) and `.ghost` variants;
  - `.uk-chip`, `.uk-badge`, `.uk-empty` (for "—").
- **Hover without repaints.** Brighten with `::after{background:#fff;opacity:0}` → `:hover::after{opacity:.12}` in place
  of `filter:brightness`. This also fixes the global `button{transition:filter}` (`00_head.html:25-26`) once you
  override it with `transition:transform .12s`.
- **`ukBack(label)`**: one Back component, top-left, with an Esc chip. Use it on every screen.
  - Remove the bottom duplicate Back on the nine screens that have two.
  - Add one to the Bounty Board, which has none.
  - Add the Esc chip on Armory and Skill Tree.
- **`.uk-actionbar`**: a sticky bar that sits **above** the dock (`bottom: dock height + 12px`) and holds a screen's
  primary action. Use it on Practice ("Start practice"), Owned crates ("Open"), Settings, Bounties and Trophies.
- **`ukDockSafe()`.** Replaces `dkFit`'s zoom to 0.74 (`88_dock.js:68`):
  - reserve the dock's height plus the sub-tab strip as bottom padding on `.mn`;
  - let the content scroll inside its panel, with a fade at the bottom edge as the scroll cue;
  - zoom only as a last resort, with a floor of 0.9.
- **`fmtN(n)`**: one number formatter. Always `1,234`; `1.2K` and `3.4M` only where space is tight (casino chips).
  Replace raw "1000 gold" in the calendar (`72_daily.js:22,44`) and the forced US format in the riddle and codes
  (`92b:37`).

**`94e_ui_nav.js` — a back stack**
- `NAV.cur` holds a function that re-opens the current top-level screen with its arguments.
- Wrap every top-level screen opener so it sets `NAV.cur`:
  - `armory`, `upgrades`, `loadouts`, `petHall`, `catalog`, `bountyBoard`, `profile`, `shop`, `crateHub`;
  - `campaign`, `fishing`/`fsHub`, `wagonMenu`, `rrMenu`, `casinoOpen`, `endlessMenu`, `pracMenu`, `waMenu`;
  - `gyMenu`, `ttMenu`, `title`.
- "Global" destinations take `NAV.cur` as their `back` argument:
  - from the More sheet (`88_dock.js:232`): Settings, Help, Save Center, Menu background, Calendar, Profile;
  - from the bell;
  - from the calendar button (`88_dock.js:59`).
  
  Each of these already accepts a `back` function (`settings(back)`, `help(back)`, `saveCenter(back)`,
  `dailyMenu(back)`, `hbgPick(back)`).
- **Focus on every `show()`.** After render, focus the screen's `h1`/`h2` (`tabindex=-1`) or its first control, never
  the hidden `#inp`. Gameplay keeps focusing `#inp`. Leave `hide()` alone.
- **Acceptance:** for each More item, open it from Armory, Shop, Pets and Bounties and press Esc; you are back where you
  started. Add this to `t_ui87.py`.

**`94f_ui_modal.js` — one modal manager**
- `ukModal({html, cls, opener, onClose})`, built on the `dkSheet` pattern (`88_dock.js:175`). It provides:
  - a focus trap;
  - `inert` on everything behind it (including the dock);
  - Esc to close;
  - focus returned to the opener;
  - an exit animation through its own keyframe (`ukOut`).
- Move these modals onto it:
  - Shop odds and buy confirm (`68d:61`, `.shmod`);
  - codes (`86b:78`, `#ccm`);
  - Caravan workshop, route log and how-to (`93d`);
  - Armory `#armod` (`76_armory.js:71`);
  - Nebula `.nzmod`;
  - Hall `.hlmod`;
  - Pet `.ptmod`, `.pthx` and Atelier `.pat-wrap`;
  - Rank-up `.rkup`;
  - suggestion `.sgm`.
- **Fix the five broken exits.** `.hlmod.out`, `.ptmod.out`, `.pthx`, `.pat-wrap` and `.rkup` reuse the entrance
  keyframe with `reverse`. That doesn't restart the animation, so they vanish instantly. Give each exit its own keyframe
  name and remove the element on `animationend`, with a 400 ms timeout as a fallback.
- **Drop `backdrop-filter`** from those modals and use an opaque scrim `#05030ce6`:
  - `00_head.html:355,1271`;
  - `67e:522`, `68d:197`, `86b:215`, `87e:424`;
  - `70c:108,132`. The Trick-or-Treat panels become solid `#160f3cf2`.

**Badges and notifications (in `94d`)**
- `dkRefreshBadges()` re-renders, in place, the dock badges (`dkBadge`), the sub-tab badges (crates, bounties, skill
  points), the bell count and the calendar "!". Call it from a debounced `save` wrapper (at most once per animation
  frame).
- **Bell:**
  - It counts only actionable items: alerts, plus updates newer than the save's creation.
  - Brand-new saves mark all existing update notices as read (set the read list to every id in the updates table on
    the first `load()` of a fresh `P`). This adds no notice and only hides 12 old "New" entries.
  - B9 fixes.
- **NEW-badge registry** `ukNew(key, sinceBuild)`. It shows "NEW" until the player opens that thing, or for 21 days
  after the build that introduced it, whichever comes first. Today these are permanent:
  - Fishing's dock card (`90f:123,135`);
  - Tower and Nebula (`67d:74`, `67e:97,106`);
  - Wildcard in the Casino (`89f:11,17`, `89m:8`);
  - the Riddle and Caravan cards already use `seen` flags; switch them to the registry too.

**`94g_ui_keys.js` — keyboard everywhere**
- On any dock screen, keys `1`–`6` switch dock tabs.
- On the dock, Arrow Left/Right move with a roving `tabindex`; Enter opens.
- `[` and `]` cycle sub-tabs (for example Armory / Loadouts / Skill Tree).
- `?` opens a shortcut overlay. Help › Shortcuts is generated from the same `KEYMAP` table, which `homeKey` also reads.
- **Visible focus ring** everywhere, including the Profile name field: `:focus-visible{outline:3px solid #ffd45a;
  outline-offset:3px}`, using the same gold as elsewhere.
- **Don't break typing.**
  - All of these are ignored while `S.mode` is a typing mode, while a text input has focus, or while a modal is open.
  - Letter keys keep their hub-only meaning.

### 5.3 M4 — Hub and Play (`94h_ui_home.js`, `94i_ui_switch.js`)

- **Continue card.** On the hub, and at the top of Choose mode: "Continue · Fishing · Tavern Pond", "Continue ·
  Hollow Pines", "Continue · Level 12". Record the last played mode and its context in `P.last87` from each mode's
  start function. One click resumes the same setup.
- **Choose-mode gallery** (replaces the `modeSheet` body):
  - **One card grid with equal cards** for: Campaign, Endless, Lantern Caravan, Moonlit Fishing, Runestone Riddle,
    Warden's Arena, Practice Range, Casino, **Wildcard** (missing today), and Events while one is running.
  - **Filter chips:** All · Typing · Relaxed · Events · Casino.
  - **Live status line per card**, for example:
    - "Riddle #12 unsolved";
    - "2 contracts left today" (if the caravan option in D1 is chosen);
    - "Bounty ready";
    - "Best: wave 31".
  - Fix Fishing's NEW badge wrapping onto its own line.
- **Hub card fixes:**
  - The riddle card's rune tiles poke above the card border: clip them, or move them inside.
  - "Halloween events" runs into the moon art.
  - Fishing's permanent NEW badge, via the registry.
- **Quick Switcher.** `Ctrl+K` or `/` opens a fuzzy search over:
  - every destination (`DKGO`, `NAVGO`, the mode list);
  - each Settings option (it opens Settings scrolled to that option);
  - each Casino game.
  
  Arrow keys and Enter pick a result; Esc closes. Show a small "Ctrl K" hint in the More sheet. Build it as a
  `ukModal`.
- **Pre-warm heavy first opens** in `requestIdleCallback`, after the hub has been idle for 2 s, one task per idle slot:
  - Fishing Spots took 1,032 ms on first open;
  - Bestiary 452 ms;
  - Caravan hub 413 ms (27 ms on later opens);
  - codes modal 359 ms;
  - Choose mode 157–202 ms.
  
  Do this by calling their bake functions: `wrCamp()`, the bestiary sprite bake, the spots art. Never open the screens.

### 5.4 M5 — Screens to restyle (`94j_ui_restyle.js`)

Mostly CSS overrides plus small markup wrappers. The bar to clear is the Fishing hub, Riddle and Caravan screens: gold
Pirata title, indigo panels, Poppins body (no Georgia), one Back top-left, and a primary action in a gold button.

| Screen | What lags today | Change |
|---|---|---|
| Endless menu (`84i`) | Georgia body text, Pirata One on buttons, 26 `vh`/`vw` sizes, a "none" stat | Panels and the kit's buttons; sizes from the 1600×900 stage (no vw/vh); "—" for empty stats. |
| Armory, Skill Tree (`76`, `62_meta`) | Georgia text; item names cut off ("Rusty S…"); large empty grid; Pirata words inside a sentence; Respec next to Back; no Esc hint | Two-line item names with the full name in a tooltip; fill the empty area with the selected item's detail panel; move Respec to the tree's own toolbar; add `ukBack`. |
| Profile / Trophies (`60_ui`) | White Poppins title; Cinzel and Georgia mixed in; 103 trophies in one scroll at 74% zoom; sparse prestige panel; "Reset save" next to "Skill tree" | Gold Pirata title; filter chips (All / Earned / Closest to earning / by category); a progress bar per trophy; move Reset save to Settings › Data (D6). |
| Help (`60_ui:87-89`) | Plain Georgia list, no art; out of date (says five acts; misses Riddle, Wildcard, Monster Mash, Trick-or-Treat; wrong corner-button text) | Panel layout with a tab per area. Text in §5.5. Shortcuts generated from `KEYMAP`. |
| Menu background (`70a:165`) | One thumbnail floating mid-screen; the 30 locked scenes aren't shown | Grid of every scene; locked scenes darkened with "Unlock by reaching Level N"; live preview of the selected one. |
| Settings (`60_ui:62`) | White title, Georgia descriptions; "Fit to screen" On/Off buttons stack vertically; re-render jumps to the top | Kit styling; segmented controls side by side; in-place toggles (B8); "Reset to defaults" in Data. |
| Save Center (`79`), Bounty Board (`80`), Owned crates (`85f`) | White Poppins titles; disabled token-exchange buttons with no reason; the sub-tab strip covers "Special crate" | Kit titles; "Need 3 more tokens" hints on disabled buttons; dock-safe layout. |
| Monster Mash (`84e`) | No panel; four equal buttons (main action, Crates, Back, Trick-or-Treat); Georgia | One gold primary button; the rest secondary; `ukBack`. |
| Practice Range (`70a:132`) | Default browser `<select>` boxes in a serif font; "Start practice" under the dock | Custom select (a `ukModal` list or chips); `.uk-actionbar`. |
| Daily calendar (`72`) | Pirata One on tiny labels; Georgia captions; two Back buttons; legacy corner buttons | Poppins for small text; one Back; B10. |
| Campaign (`75`) | Act tabs cut off ("Act I: The Awak…"); Acts II–V disabled with no hint while Act VI has a tooltip | Short labels ("Act II") with the full name as a tooltip; the same locked style and hint on every act ("Clear Level 5 to unlock"). |

### 5.5 Copy (`94k_ui_copy.js`)

- **Help.** Rewrite for six acts and every current mode:
  - modes: Campaign, Endless, Lantern Caravan, Moonlit Fishing, Runestone Riddle, Warden's Arena, Practice, Casino,
    Wildcard, Monster Mash, Trick-or-Treat;
  - the dock, More, the bell and the calendar.
  
  Remove "red chip in the corner", "Back button top-right on every menu" and "Crates tile on main menu".
- **Settings.** Music and Fullscreen live in More (not "the button in the corner").
- **Reward text that overstates** (see §7 E11):
  - Prospector "+4% gold from everything" (`62_meta.js:151`);
  - prestige "+5% gold from runs" (`68b:8`).
  
  Both say "+4% / +5% gold from monsters and rounds".
- **Empty stats:** "No record yet" in place of "none".

---

## 6. M6 — Motion (`94l_motion87.js`)

The house style: springy `cubic-bezier(.3,1.5,.5,1)`, 0.2–0.7 s, one-shot, animating only `transform` and `opacity`,
and calm under `prefers-reduced-motion`.

**Screen transitions.**
- `show()` swaps `ov.innerHTML` synchronously (`60_ui.js:4`), and callers query the new DOM straight after. The swap must
  therefore stay synchronous.
- Approach: before the swap, move the old children into a sibling layer `#ovghost` (`pointer-events:none`, `inert`).
  Copy each old `<canvas>` with `drawImage` into a new canvas, because cloned canvases are blank. Fade and slightly
  scale the ghost out over 140 ms. The new content enters with `ukIn` (opacity 0→1, translateY 10 px→0, 260 ms
  spring).
- Remove the ghost on `animationend`, with a 300 ms fallback.
- **Skip the ghost** when:
  - the previous screen was gameplay (`ov` was hidden);
  - performance mode is Low;
  - the user prefers reduced motion (use opacity only);
  - the two screens share a persistent hub layer (dock to dock: animate only `.mn`, not the dock).
- Today the dock's own entrance is off for the shell (`00_head.html:888/900`, `88b:275`). Keep the dock still and
  animate only the page body.

**Modal exits.** Every modal goes through `ukModal` (M3), which handles its exit.

**Infinite loops on non-compositor properties.**
- Everywhere: put the static glow on `::after`, then pulse its `opacity`. Move shines with `translateX`, not `left` or
  `background-position`. Where a loop isn't needed, make it a one-shot on a timer, as `dkshine` does (`88b:217`).
- Priority list (most seen first):

| Where | Now | Fix |
|---|---|---|
| Global `h1` (`00_head.html:19-20`): home logo, Victory and Ascended titles, Riddle title | `animation:glow 3s infinite` animates `filter: drop-shadow(… 52px)` | `h1{animation:none}`; a static drop-shadow; for the home logo a one-shot `dkshine` sweep every 8 s plus an opacity glow on `::after`; respect `.rrti h1{filter:none}`. |
| XP bar on every result (`88h:67,76`) and the home XP bar (`88_dock.js:289,405`) | Width set every frame; infinite background-position shimmer; `@keyframes dkbar{from{width:0}}` | `transform:scaleX()` with `transform-origin:left`; one translateX shine when it fills. |
| Achievement toast (`00_head.html:435-437`) | Slides by animating `top` over 3.8 s | translateY spring in (300 ms), hold, fade out (200 ms). |
| Daily calendar (`00_head.html:718/750/775/780`) | `.dbn`, `.dt.now`, `.dclaim` box-shadow pulses; an 1,800 px rotating conic `.dray`; no reduced motion | Opacity pulses on `::after`; rays rotate at 1/3 the speed and stop under reduced motion. |
| Shop buy button (`68d:183`), Bounty claim (`00_head.html:1346`), Hall new (`62e:314`), Pet new / current (`87c:292,303,325`), Arena (`84l:162,179,217,237`), Crate hub (`68e:129,136`), Beginner (`84i:109-145`) | Infinite box-shadow or `left` loops | The `::after` opacity pattern. |
| Armory and Bestiary Mythic cards (`00_head.html:403,1241,487`) | Infinite hue-rotate `filter` with `will-change:filter` (one layer per card) | A static rainbow border with one shared opacity shimmer; drop `will-change`. |
| Touch keyboard ready key (`00_head.html:519`) | Box-shadow pulse during gameplay | Opacity pulse on `::after`. |
| Nebula (`67e:426…588`), Tower (`00_head.html:1520-1715`), Wheel and Roulette (`00_head.html:373,392,412`) | Box-shadow, filter and background-position loops; `mix-blend-mode:screen` (`67e:467,578`) | Same patterns; remove the screen blends. The Casino is forced to Quality (`88l`), so these always run. |

**Other motion fixes.**
- **Hover-triggered keyframes that snap back** when the pointer leaves:
  - `.pat-act:hover .pat-shine` (`87e:383-390`);
  - `.wcbtn:hover::after` (`89m:21`);
  - `.rkhome:hover .rktro` (`89u:244`);
  - `.dktro:hover svg` (`88_dock.js:393`);
  - `.wcvt:hover .wcbxts` (`89y0:318`).
  
  Use the 88c pattern instead: add a class on `pointerenter` and remove it on `animationend`.
- **Hover transitions on `box-shadow` or `filter`** (about 30 card grids: `88_dock.js:300/323`, `88b:188`,
  `87c:287`, `87h:155`, `62e:290`, `68d:154`, …). Move them to the `::after` overlay.
- **Bar fills.** These use `width` transitions:
  - `89u:169-170`, `84l:176`, `67e:503`, `90n:153`, `00_head.html:678/722/1489`;
  - the quiz timer (`00_head.html:636`);
  - the Trick-or-Treat clock (`00_head.html:1434`);
  - the touch keyboard `--f` (`63_touch.js:29`).
  
  Switch them to `scaleX`.
- **Two-property-free transitions** (`#svt{transition:.3s}`, `#cctoast{transition:.25s}`). List `transform,opacity`
  explicitly.
- **Restarting one-shot classes.** `remove` → `void offsetWidth` → `add` forces layout (`68d:53-54`, `93d:140`). Use
  `el.animate()` instead.
- **Delete dead CSS:**
  - `.sm.newp`, `.nd.cur`, `.nd .flag`, `button.al i`, `button.mc.rift`, `button.mc.first`;
  - `button.hxm.rift`, `.gyc`, `.arena` (84l:171), `.hpl::after`, `.hbar i`, `.xb i`;
  - the old `.hwb` keyframes, `.rdot`, the legacy `button.hxc/.hxb` blur and `.mbmod`;
  - the `88b:171-177` `.dki:hover` icon animations, now dead under the 88c markup.
  
  Before deleting each one, grep that nothing emits it.
- **Reduced motion.** Add `prefers-reduced-motion` blocks to `68e_grave.js` (10 keyframes, 5 infinite), `85f_cxeco.js`,
  `88m_fs_bigscreen.js` and `89x_time_alert.js`. Freeze the canvas loops that have no reduced-motion handling: the
  `72_daily` vault, `astMenuBG`, `gvScene` and the casino `live()` canvases.
- **Reward moments — one shared reveal.**
  - Fishing, Riddle and the Caravan already use a coin flight plus count-up (`rrCoins`/`rrCount`, `wrCoins`/`wrCount`).
  - Factor these into `ukCoins(fromEl,toEl,n)` and `ukCount(el,from,to)`, and use them on: campaign Victory,
    Endless/Graveyard results, Arena results, the Bounty claim, the calendar claim, and Shop crate duplicates.
  - Keep the coin sound throttled as the riddle does.

**Acceptance:**
- `anim_guard.js` reports 0 live violations on every swept screen, excluding the protected chests.
- Before/after GIF-like strips (6 frames) of: a screen change, a modal close, the XP bar, the toast, and the calendar.
- Frame times no worse than the M0 baseline anywhere, and better on the home screen.

---

## 7. M2 — Economy (`94b_econ87.js`, `94c_ledger87.js`)

### 7.1 Where the gold comes from today (45 WPM bot, 95% accuracy)

| Source | Coins a minute (or per day) | Notes |
|---|---|---|
| Campaign replays | L1 ~170, L10 ~260, L20 ~380, L30 ~430 | First clears add ~70 a minute; the level-clear bonus is not multiplied by `S.gm` |
| Endless | 209 average over 20 min (175 rising to 246) | `EGK=.9` (owner's 8.3 cut) |
| Graveyard (event until 8 Nov 2026) | ~460 | `EGK_GY 1.5 × GYK 1.35` |
| Beginner | ~120 | `BG_GOLD .5` |
| Astral L31–33 | prestige 0 ~260; prestige 10 ~1,235 | `astMul = 1+.5·prestige`, stacked with +5% per prestige on `S.gm` |
| **Lantern Caravan** | **~410 / ~830 / ~1,200** | measured 205–237 a run (22 s), 500–555 (26–35 s), 966–1,140 (35–49 s); no cap |
| Fishing | 102–208 *(unverified)*; bounties ~500–600 a day | |
| Arena | 60–120 *(unverified)* | trophy road 4,160 once |
| Dailies | Riddle up to 1,500 (+500 per 7-day streak); calendar 7,840–12,180 a month; Bounty Board 1,210–3,250 a day | |
| Casino return | Slots .946, Roulette .973, Dice/Mines/Plinko/Tower/Nebula .96, Wheel .95–.96, Rocket .95–1.00, Blackjack ~.99, **Higher or Lower 1.04–1.06**, Quiz knowledge-based (up to 2.5×, uncapped rounds) | |
| One-time | Bestiary mastery 193,500; achievements 70,025; codes 27,600 | |

**Sinks.**
- One-time purchases total about **316k**, plus the 175k Graveyard bundle while the event runs.
- Gallows Pass earns that in 4–6 hours.
- After that only crates (about 9% returned as duplicate gold), bait and the casino are left.

### 7.2 Targets (45 WPM)

- **Core typing** (campaign replays, Endless, Astral at prestige 0): **250–400 a minute.**
- **Side modes** (Caravan, Fishing, Arena): **200–350 a minute.**
- **Events:** at most **1.25×** core.
- **Prestige scaling:** at most **+50%** at prestige 10.
- **Casino:** return **0.94–0.97**; nothing at or above 1.00.
- **Dailies:** about **3–5k a day** in total.

### 7.3 Changes

| # | Change | Where | Effect | Owner decision? |
|---|---|---|---|---|
| E1 | **Caravan** (see D1): option A, *daily contracts* (recommended) | wrap `wrPayOf` / the result in `93c:117-125`; show "Contracts 2/3 today" on the route card, Ready panel and result | The first 3 completions of each route each day pay full route pay as now. Later runs that day pay 35% of route pay plus road coins. Per-run amounts stay as the owner set them; long grinding on Gallows drops from ~1,200 to ~420 a minute after the third run. | **Yes, D1** |
| E1b | Caravan "Up to N coins" text | `93j:182` (`wrReadyFill`), `93d:47` | Include the accuracy factor (×1.1) and typical road coins, so the shown maximum is reachable but not beaten. It shows 1,449 for Gallows today; a first run measured 1,604. | No |
| E2 | Higher or Lower `HLE` 1.075 → **1.00** | `65_casino.js:111` (const; replace `mHL` or edit with a backup) | Best-strategy return ≈ 0.953 (simulated) | Yes (D2: the owner tuned it once) |
| E3 | Quiz: `QZ.CAP` 2.5 → **1.5**, `QZ.QCAP` 1,000 → **500** | `67c_quiz.js:3` (`Object.assign(QZ,…)`) | At most about +250 a round | D2 |
| E4 | Game speed scales gold by `1+.25·(r−1)` instead of `r` | wrap `setSpeed` (`50_game.js:342`) and the level-clear bonus (`60_ui.js:147`) | 2× speed gives 1.25× gold per kill, so gold per minute stays close to 1× instead of 1.75–3.1× | No (it's an exploit) |
| E5 | Graveyard `GYK` 1.35 → **1.0** | const in `84c:7`; apply the factor where the Graveyard sets up `S.gm`, or wrap `gain` | ~340 a minute, about 1.6× Endless and inside 1.25× of core | D2 |
| E6 | Astral `astMul` `1+.5p` → **`1+.15p`** | `85_astral.js:316-319` (const; replace the `start` wrapper) | Prestige 10 earns about 2.5× prestige 0 instead of 6–9× | D2 |
| E7 | Prestige resets `P.ug` | B3 | Closes the 75% respec refund | No |
| E8 | Egg cap and surplus refund | B4 | — | No |
| E9 | Level-up gold from calendar and crate XP | B5 | Small | No |
| E10 | Wildcard first-win bonus only on staked games inside the cap | B6 | Small | No |
| E11 | Reward text matches payouts (Prospector, prestige, caravan "up to", shiny) | §5.5 | — | No |
| E12 | One number formatter | `fmtN`, §5.2 | — | No |
| E13 | **New late-game sinks** (pick some, D3) | new | Each worth 1–2 hours of play: **gold-only** convoy looks (3 per category, 6k–25k; medal looks stay medal-only); pet palettes and trims (5k–20k) in the Atelier; 3 gold-only rod looks; an "Eclipse pick" (choose one item from the Eclipse pool, 25k); a cosmetic hub "Trophy Hall plaque" upgrade. | **Yes, D3** |
| E14 | Daily resets ignore a backwards clock | wrap the date-key helpers (`dcKey` is a const; wrap the callers) | Keep the highest date seen in `P.dmax`; if today's key is earlier, daily boosts and claims stay spent. Low priority. | No |
| E15 | Leave Endless (`EGK .9`), Bounty Board, calendar and Riddle as they are | — | They already sit inside the bands | — |

**The gold ledger (`94c_ledger87.js`).**
- On every `load()` and `fresh()`, replace `P.gold` with an accessor (`Object.defineProperty` on the new `P`).
- The accessor records each change as `{t, d, bal, src}` in a ring of 100 in `P.ldg`. `src` is `S.mode` plus the
  current screen key (from `NAV`) or a label set by `ukSrc('crate')` around known grants.
- `JSON.stringify` stores the plain value: define `toJSON` on `P`, or keep the real number in `P._g` and serialize
  `gold` explicitly. Check `49_savesafe.js` and `sgPut` still round-trip.
- Show it as **Profile › Ledger**: today's earnings by source, plus the last 100 entries. Add a DEV › Economy monitor
  (coins a minute per source over the session).
- This is how M2 is verified, and how future modes can be checked against the bands.

**Migration (`P.m87`, once).**
- Never subtract gold.
- Refund surplus eggs (B4).
- If D1 option A is chosen, start everyone with today's contracts unused.
- Show one toast (not a bell notice): "The economy has been rebalanced — see Help › What's changed." Put a "What's
  changed" page in Help, so the owner can decide separately whether a bell notice is wanted.

**Acceptance:**
- `tools/econ/sim.py` before and after (commit both tables); every mode inside its band at 45 WPM.
- Casino returns re-simulated, all below 1.00.
- `t_econ87.py` checks E2–E10, the ledger round-trip through save and reload, and the migration running only once.

---

## 8. Decisions needed from the owner before M2 and M5

| # | Question | Options (recommended first) |
|---|---|---|
| D1 | Lantern Caravan earns ~410 / ~830 / ~1,200 coins a minute at the current pay | **A.** Daily contracts: 3 full-pay runs per route per day, then 35% (per-run pay unchanged). **B.** Lower pay to about 50 / 110 / 170 (audit suggestion). **C.** Pines 300, Gallows 520, no cap. **D.** Leave it as is. |
| D2 | Casino edges, Graveyard and Astral scaling (E2, E3, E5, E6) | **Apply all four** / apply only the casino fixes / leave them |
| D3 | Which late-game sinks to add (E13) | **Convoy looks + pet palettes + Eclipse pick** / all five / none |
| D4 | The 4 dead Daily Challenge trophies | **Remap to the Riddle** / retire them (total becomes 99) |
| D5 | The legacy corner buttons (Casino, Music, Fullscreen) | **Hide outside gameplay** / restyle them as a small tray |
| D6 | "Reset save" in the Profile header | **Move it to Settings › Data** / leave it |
| D7 | An Updates-tab notice for 8.7 | **None** (default; the rule says ask first) / one notice, after the owner approves its text |

---

## 9. M7 — Performance (`94m_perf87.js`)

Order by gain and risk. Measure each step with `tools/perf87/frames.py`, and keep a step only if it helps.

| # | Change | Where | Expected gain |
|---|---|---|---|
| P1 | Skip `draw()` while an opaque screen covers the stage | `88l:18` guards only the Casino and Wildcard; `#ov.fshx` (`90g:3`), `#ov.rrx` (`92c:5,141`), the caravan hub, the Daily vault | A whole background frame on every Fishing, Riddle and Caravan menu frame. Set `ov.dataset.opaque=1` in those screens and check it in a `draw` wrapper. |
| P2 | Bake the vignette always | `40_scenes.js:114` (`PFV`, baked at `88k:36`, is only used in Balanced) | A full-screen gradient a frame in campaign play |
| P3 | `live()` defaults to `slow:2`; add `slow` to the Daily vault (`72_daily.js:63-73`), `gvScene` (`68e:54`), `rrArchLive` and the host (`92h:105,140`) | — | Halves those canvases |
| P4 | One cached white radial sprite for `glow()` (499 call sites, a new gradient each time) | `20_monsters.js:11` | Fewer allocations in every scene |
| P5 | `drawEnemy`'s `ctx.filter` (tints, shinies, rainbow, hit flash, death) | `50_game.js:227,229` | Pre-bake tinted variants per monster id; flash with a `source-atop` white silhouette (as `wrSil` in `93g` does). Biggest gameplay gain, so test carefully (`t_fx`, `t_finishers`). |
| P6 | Word pill `shadowBlur` (10 per pill, `ra*7` on the target) and per-frame rainbow/gold gradients | `50_game.js:210-211` | Cache pill backgrounds per width bucket; an offset dark round-rect in place of blur |
| P7 | Bake `astMenuBG` (5 full-screen `lighter` fills, ~735 arcs a frame) and `astBG` (planet `shadowBlur=60`) | `85_astral.js:292-300,403-422` | Big on the Astral map |
| P8 | `dkDailyLive`: create the 12 ray gradients once and bake the medallion | `88b:234-266` | Home screen |
| P9 | Scope the body-wide `MutationObserver` (`myDecorate`) to `#ov` and skip text-only changes | `88g:65` | Stops work on every count-up frame |
| P10 | Write `#pb` / `#spb` text only when it changes (20 writes a second on the idle hub) | `50_game.js:175,344` | Small but constant |
| P11 | Shop crate reveal: pre-render glow sprites in place of `shadowBlur` up to 80 and per-letter blur | `68_crate.js:161-191` via `68c:214` | The climax frame. **Not** the Celestial (`85d`) or Graveyard (`84f`) chests. |
| P12 | Monster, boss and weapon art with live `shadowBlur` (20, 21, 25, 29*, 83b, 30_hero:72) | — | Bake glow sprites per asset, one family at a time; check against screenshots |
| P13 | Stage blend: snapshot the "from" scene once | `70b_blend.js:3-39` | 5.4 s of double scenes per stage change |
| P14 | Boot: decode the base64 images in old update notices (`88i` 140 KB, `89g9` 190 KB, `90v` 178 KB, `92e` 128 KB) and the chest audio (`85e` 154 KB) only when first needed | wrap their builders | Faster first paint (DCL ~0.9–1.3 s today, measured under load) |
| P15 | `getImageData` scans on first open (Arena gladiators: 21 reads of 900×800) | `84k:155`, `84j:44` | Precompute bounding boxes as data (like `GLAD_BB`) |

**Acceptance:**
- The home hub's mean frame time is at least 25% better than the M0 baseline (about 40–45 ms headless today, so the
  target is 30–33 ms or better).
- No screen gets worse by more than run-to-run noise (±2 ms).
- Results are recorded in HANDOFF.

---

## 10. Tests and QA (M8)

**New tests** (in `type-warriors-source`, added to `tools/regress.sh`, which goes from 36 to 41 tests):
- `t_fix87.py`: B1–B6, B9, B11, B13.
- `t_ui87.py`:
  - the back stack (More items from four screens);
  - modal focus traps and Esc;
  - badges after a purchase;
  - the dock keys 1–6 and arrows;
  - nothing important under the dock (the sweep's "covered by dock" check);
  - focus on `show`;
  - the Quick Switcher.
- `t_econ87.py`: E1–E10, the ledger, the migration.
- `t_motion87.py`: `anim_guard.js` on every swept screen reports 0, excluding the chests; modal exits actually play
  (opacity mid-exit between 0.2 and 0.8).
- `t_perf87.py`: a smoke test that the home and Fishing frame times aren't worse than the stored baseline × 1.15.

**Each milestone also runs:**
- `bash tools/bld.sh` → `CMP OK`, `SYNTAX_OK`;
- `t_wagon.py`, `t_riddle.py`, `tools/wr/ovl.py`, `tools/rr/ovl.py` and both `touch.py` scripts → no overlaps;
- `tools/ui/sweep.py` → no new issues;
- the full regression before delivery.

**Screenshots** at 1600×900 and 1280×720 (plus 390×844 for M3–M5) of every changed screen. Send a few with each
delivery.

**Known flaky tests:** `t_fishing` can time out under load, and `t_leaderboard` fails in a frozen copy; rerun either one
alone.

---

## 11. Risk notes

- **`show()` is wrapped dozens of times** (`dkAfter`, the shells, the screen hooks). Wrap it once more at the very end
  (`94l`), and keep it synchronous.
- **The gold accessor (ledger).** Some code may assign `P = {...}` or spread `P`. Search for `P=` and `Object.assign(P`
  and keep the accessor in place after each. If this is too risky, fall back to recording `P.gold` deltas in a `save`
  wrapper, comparing against the last saved value (coarser, but safe).
- **Focus changes must never steal focus from `#inp` during typing modes.** Gate on `ov.classList.contains('hide')`
  and `S.mode`.
- **Changing `kbWant`.** The const means editing `63_touch.js` or wrapping `kbShow`/`kbSync`. Check that the riddle and
  caravan touch keyboards don't get a second keyboard.
- **The economy migration** must be idempotent (`P.m87`) and must run after the pet normaliser (`petNorm`).
- **Wix iframe and Chromebook.** Re-test fit-to-screen (`88n`) and Big Screen (`88m`) after the dock-safe layout change.

---

## Appendix A — gameplay defects (bug hunt on 8.6d)

Repro scripts are in `tools/audit87/bugs/` (`h.py` is the helper). Severity is for players, not code size.

| # | Mode | Defect | Cause | Fix | Sev |
|---|---|---|---|---|---|
| A1 | Fishing | **Leaving during the catch show loses the fish.** Force a Legendary bite, type the three words, press Esc or Back while `FS.st==='show'`: the fish is neither kept nor sold. Legendary and Mythic shows last 5.2–7.6 s, so this is easy to hit. (`p_fish2.py`) | `fsLeave` (`90i_fish_hub.js:12`, the last definition) only handles `FS.st==='reveal'`; Esc reaches it from `90e_fish_game.js:283` | In `fsLeave`, when `FS.st==='show'`, finish the show first (`fsReveal()`, or take `FS.show.c` as the pending catch), then use the existing keep-or-sell code. | High |
| A2 | Fishing (touch) | **No way to type.** No on-screen keys, and `inp` has `inputmode="none"`, so the phone keyboard never opens either. Every fish escapes. (`p_touch.py`) | `kbWant` (`63_touch.js:18`) is play mode only; `inputmode` is set at `50_game.js:38` | A fishing keyboard built like `wrTouchKb`: keys go to `fsType`, Space to `fsCast`. Same for Trick-or-Treat (B1). | High (touch) |
| A3 | Riddle | **The result is saved before it is paid.** Enter the answer, reload within about 1.4 s: the save says solved, but no gold, stats or streak are recorded and reopening pays nothing. Same for the 25-coin loss payout. (`p_riddle.py`) | `rrEnter` (`92b_riddle.js:110`) sets `e.st` and saves; `rrFinish` (`:129`) pays after the tile-flip timeout | Do the bookkeeping (stats, streak, gold, `e.c`) in `rrEnter`, in the same save; keep only the visuals in the timeout. Also, on load, settle any entry with `st` set and no `c`, so saves already affected recover. | Medium |
| A4 | Fishing | **The reel timer runs while the window is blurred or the tab hidden** (3.80 → 2.48 s in 1.5 s). Campaign, Arena, Caravan and Trick-or-Treat all pause. | No blur handler for fish mode (`70_main.js:79` covers play mode); countdown at `90e_fish_game.js:189` | `FS.paused` on `blur`/`visibilitychange`, which skips the countdown, plus a small "Paused — press any key" note. | Medium |
| A5 | Wildcard | **The table keeps playing behind the "Game menu"** on solo and same-screen tables: bot turns advance, and bots can catch a missed WILD! call. | `wcMenu` (`89c_wc_table.js:107`) only shows a modal; moves are already queued by `wcStep` | `WX.paused` while the menu is open; `wcLater` callbacks and `wcPump` wait for Resume. Online rooms keep running (the other players are real). | Medium-low |
| A6 | Fishing | **Leaving can overfill the creel** (31/30), and the pushed entry lacks the `kp`/`t` fields `fsKeep` writes. (`p_creel.py`) | `fsLeave` pushes without a capacity check | Sell when the creel is full; otherwise go through `fsKeep`. | Low |
| A7 | Arena | **Enter does nothing on the result screen** (only Esc works), and the fight music keeps playing on pause and results. | `S.mode` stays `'arena'`, so `overKey` never runs; `mk()` (`70_main.js:12`) returns track `'c'` whenever the arena is active | Enter clicks `#wa1`; return the menu track when `S.wa.over` or `S.wa.pause`. | Low |
| A8 | Wildcard (reduced motion) | **Console error after leaving mid-animation:** `TypeError … reading 'querySelectorAll'` in `wcAnim`. | `89c_wc_table.js:179` uses `$('wcdisc')` after an `await` without checking it; the reduced-motion branch in `89y6:271` falls through to it | After each `await` in `wcAnim`, return if the table token changed or `$('wct')` is gone. | Low |
| A9 | Fishing | **Leaving mid-fight is inconsistent:** Back leaves at once, Esc needs two presses, and neither counts as an escape (streak and escape stat untouched). | Back skips the confirm; leaving skips `fsEscape` | Route Back through the same confirm, and count leaving mid-fight as an escape. | Low |
| A10 | Riddle | **Today's answer is stored in the save before it is solved** (readable in localStorage and in exported saves). | `rrCur` (`92b_riddle.js:47`) writes `e.w=rrWord(k)` | Don't store `w`; derive it with `rrWord(k)` when needed. Strip `w` from unsolved entries on load. | Low |

**Rechecked "known limits" from HANDOFF:**
- Fishing touch keyboard: still missing (A2).
- Big Screen ignores the caravan and fishing (B16).
- `czglow` and `twtabg` still animate box-shadow (§6).
- Casino first-open cost: 70–99 ms headless against 7–10 ms on later opens (pre-warm in §5.3).

**Checked and fine:**
- **Campaign:** stars and rewards granted once; pause freezes time and spawns; quitting and losing are correct; the
  900 ms double-Enter guard holds.
- **Endless and Monster Mash:** pause, End run, results and resume-after-reload work, with no double pay.
- **Caravan:** pause, quit, finish, double-Enter, a mid-run resize, and leaving (state, music and pause button cleared).
- **Arena:** pause, blur, resume, defeat and quit.
- **Riddle:** practice mode, and Esc during the tile flip.
- **Casino:** 11 games fuzzed with double clicks and leaving mid-round; gold matches net winnings.
- **Save:** two reloads in a row, with no changed fields and no NaN.
- **Leaks:** two laps through 8 modes left no animation loops, timers or live canvases behind.
- **Reduced motion:** 10 screens at 3 widths.
- **Touch keyboards:** present in Campaign, Riddle and Caravan.
- **Graveyard crate:** a double click opens only one crate.

**Not covered:** casino payout rules in depth, mid-round reloads in the casino, Trick-or-Treat gameplay, and timed
Wildcard rooms.
