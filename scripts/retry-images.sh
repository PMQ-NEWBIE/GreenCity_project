#!/bin/bash
# Retry failed searches in smaller batches (3 parallel max)
OUT=/home/z/my-project/scripts/img

run() {
  local q="$1"; local f="$2"; local c="${3:-2}"
  z-ai image-search -q "$q" -c $c --gl us --no-rank > $OUT/$f.json 2>/dev/null
  echo "done: $f"
}

# Batch 1
run "colorful sorted recyclable materials plastic bottles paper cans for recycling" hero-recycle 3 &
run "stack of clean cardboard boxes and paper for recycling" cat-paper &
run "transparent plastic PET bottles collected for recycling" cat-plastic &
wait
sleep 2
# Batch 2
run "green glass bottles and jars sorted for recycling" cat-glass &
run "old electronics laptop keyboard e-waste for recycling" cat-electronic &
run "old wooden table and vintage furniture second hand" cat-furniture 3 &
wait
sleep 2
# Batch 3
run "stack of old newspapers tied for recycling" prod-newspaper &
run "recycling collection truck and workers collecting waste" service-truck &
run "fresh green leaves plant sprout growing closeup nature" auth-leaves &
wait
echo "ALL RETRIES DONE"
