# Audit scripts from the 8.7 planning round

Raw scripts used to produce the audits behind `UPDATE_8.7_PLAN.md`. They load
`type-warriors-source/out.html` by absolute path (`/home/user/type-warriors/...`); adjust `H` if the repo lives elsewhere.
They are starting points for the 8.7 tools (`tools/econ/`, `tools/ui/`), not polished tests.

| Script | What it does |
|---|---|
| `econ/ev.py FILE.js` | Runs FILE.js as an async function body inside the game and prints the JSON it returns. |
| `econ/combat_rates.js` | Bot (45 WPM, 95% accuracy, 0.35 s reaction, unlimited HP) through Endless, Graveyard, Beginner, Astral and a campaign replay; prints coins per minute. Run with `ev.py`. |
| `econ/wagon_rates.js` | Same bot through the three caravan routes at 30/45/60 WPM; prints pay, time and medal per run. Run with `ev.py`. |
| `econ/higher_lower_rtp.py` | Monte Carlo of the casino's Higher or Lower return to player (constants copied from `65_casino.js`). |
| `menus/sweep.py` | Opens 43 screens; records open time, Back handler, Esc, Tab focus, overlaps at 3 viewports; screenshots in `menus/shots/`. Uses `lib.py`. |
| `menus/kb.py`, `modal.py`, `scroll.py`, `touch.py`, `func.py`, `bell.py`, `help.py` | Keyboard, focus-trap, hidden-under-dock, touch keyboard, nested navigation, bell and help-text checks. |
| `bugs/h.py` + `bugs/p_*.py` | Gameplay bug-hunt probes (helper `h.py` loads `type-warriors-source/out.html`). `p_fish2.py` (leaving during a catch show), `p_touch.py` (touch keyboards per mode), `p_riddle.py` (result saved before payout), `p_creel.py` (creel overflow), `p_wc.py` (Wildcard keeps playing behind the menu), `p_arena.py`, `p_rm.py` (reduced motion), `p_leak.py` (loops and timers left behind), `p_save.py` (save round-trip). |
