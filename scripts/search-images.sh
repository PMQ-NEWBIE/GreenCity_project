#!/bin/bash
# Green City - image search batch (parallel, stdout -> file)
OUT=/home/z/my-project/scripts/img
mkdir -p $OUT

z-ai image-search -q "aerial view of a modern green city with many trees and sustainable buildings" -c 3 --gl us --no-rank > $OUT/hero-city.json 2>/dev/null &
z-ai image-search -q "colorful sorted recyclable materials plastic bottles paper cans for recycling" -c 3 --gl us --no-rank > $OUT/hero-recycle.json 2>/dev/null &
z-ai image-search -q "stack of clean cardboard boxes and paper for recycling" -c 2 --gl us --no-rank > $OUT/cat-paper.json 2>/dev/null &
z-ai image-search -q "transparent plastic PET bottles collected for recycling" -c 2 --gl us --no-rank > $OUT/cat-plastic.json 2>/dev/null &
z-ai image-search -q "crushed aluminum cans and scrap metal for recycling" -c 2 --gl us --no-rank > $OUT/cat-metal.json 2>/dev/null &
z-ai image-search -q "green glass bottles and jars sorted for recycling" -c 2 --gl us --no-rank > $OUT/cat-glass.json 2>/dev/null &
z-ai image-search -q "old electronics laptop keyboard e-waste for recycling" -c 2 --gl us --no-rank > $OUT/cat-electronic.json 2>/dev/null &
z-ai image-search -q "old wooden table and vintage furniture second hand" -c 3 --gl us --no-rank > $OUT/cat-furniture.json 2>/dev/null &
z-ai image-search -q "stack of old newspapers tied for recycling" -c 2 --gl us --no-rank > $OUT/prod-newspaper.json 2>/dev/null &
z-ai image-search -q "vintage old electric standing fan retro" -c 2 --gl us --no-rank > $OUT/prod-fan.json 2>/dev/null &
z-ai image-search -q "recycling collection truck and workers collecting waste" -c 2 --gl us --no-rank > $OUT/service-truck.json 2>/dev/null &
z-ai image-search -q "worker sorting waste at recycling facility conveyor" -c 2 --gl us --no-rank > $OUT/service-worker.json 2>/dev/null &
z-ai image-search -q "fresh green leaves plant sprout growing closeup nature" -c 2 --gl us --no-rank > $OUT/auth-leaves.json 2>/dev/null &

wait
echo "ALL SEARCHES DONE"
ls -la $OUT
