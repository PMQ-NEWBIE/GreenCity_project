#!/usr/bin/env python3
"""Extract clean JSON from search outputs and print URL inventory."""
import json, re, os

DIR = "/home/z/my-project/scripts/img"
inventory = {}
for fname in sorted(os.listdir(DIR)):
    if not fname.endswith(".json"):
        continue
    raw = open(os.path.join(DIR, fname)).read()
    m = re.search(r'\{.*\}', raw, re.S)
    if not m:
        inventory[fname] = []
        continue
    try:
        d = json.loads(m.group())
        inventory[fname] = [r["original_url"] for r in d.get("results", [])]
    except Exception:
        inventory[fname] = []

out = {}
for k, urls in inventory.items():
    out[k] = urls
    print(f"{k}: {len(urls)}")
    for u in urls:
        print(f"  {u}")

with open("/home/z/my-project/scripts/img-inventory.json", "w") as f:
    json.dump(out, f, indent=2)
