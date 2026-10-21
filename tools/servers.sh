#!/bin/bash
# Start or stop the local MQTT broker and Nostr relay that the network tests need.
#   bash tools/servers.sh start | stop
# Servers are stopped by PID file only (never pkill -f). Needs amqtt in tools/pylib (see tools/README.md).
T="$(cd "$(dirname "$0")" && pwd)"; SRC="$T/../type-warriors-source"; mkdir -p "$T/logs"
case "$1" in
 start)
  (cd "$T" && PYTHONPATH=pylib nohup python3 -m amqtt.scripts.broker_script -c mq/broker.yaml > logs/broker.log 2>&1 & echo $! > "$T/logs/broker.pid")
  (cd "$SRC" && PYTHONPATH="$T/pylib" nohup python3 t_nostr_relay.py 18090 > "$T/logs/relay18090.log" 2>&1 & echo $! > "$T/logs/relay.pid")
  sleep 1; echo "broker $(cat "$T/logs/broker.pid")  relay $(cat "$T/logs/relay.pid")";;
 stop)
  for p in broker relay; do [ -f "$T/logs/$p.pid" ] && kill "$(cat "$T/logs/$p.pid")" 2>/dev/null; rm -f "$T/logs/$p.pid"; done; echo stopped;;
 *) echo "usage: $0 start|stop";;
esac
