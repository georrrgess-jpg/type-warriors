#!/bin/bash
# Full regression: 48 Playwright tests, run one after another against type-warriors-source/out.html.
# Start the servers first (bash tools/servers.sh start) and stop them after. Logs land in tools/logs/r_<test>.log.
# Tip: to keep editing while it runs, copy type-warriors-source to a frozen folder and point SRC at it;
# t_leaderboard then fails on a relative log path, so rerun that one in the real folder.
T="$(cd "$(dirname "$0")" && pwd)"; SRC="${SRC:-$T/../type-warriors-source}"; mkdir -p "$T/logs"; cd "$SRC" || exit 1
for t in t_riddle t_wagon t_time_alert t_leaderboard t_ranked t_ranked_net t_wc_school t_perf_casino t_fs_bigscreen t_fit_screen t_wildcard t_wc_pp t_wc_scan t_access t_code81 t_petclick t_loadout_polish t_loadouts t_flow t_pe t_pdet t_entry t_misc t_trail t_modes t_start6 t_stuck2 t_dkacc t_audit t_sort t_fx t_dock t_dkanim t_fishing t_finishers t_wc_code t_fix87_fish t_fix87_modes t_fix87_menus t_econ87 t_ui87 t_ramparts t_rpboard t_ui92 t_td96 t_cas93 t_pool t_pool96; do
  echo "=== $t"; PYTHONPATH="$T/pylib" timeout 900 python3 -u $t.py > "$T/logs/r_$t.log" 2>&1; echo "EXIT $t $?"
done
echo ALLDONE
