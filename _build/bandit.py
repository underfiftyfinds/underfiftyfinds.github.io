"""Self-learning pin planner (Thompson-sampling multi-armed bandit).

Decides what today's pins should be: which DESIGN STYLE and which GUIDE each pin uses.
Reward = outbound clicks per impression (visits to our site), learned from _build/stats/*.json.
Guides also get a seasonal boost from _build/trend_weights.json (written by the weekly radar).

Usage: python3 _build/bandit.py --pins 3 [--seed N] [--dry-run]
Writes: _build/plan_today.json (the daily run follows it) and lab/data.json (dashboard).
"""
import argparse, glob, json, math, os, random, datetime as dt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

STYLES = {  # canonical arm -> words that identify it in pin_log "style"
    "numbered list": ["list"],
    "dark quote": ["quote"],
    "3-item callout": ["callout"],
    "headline (X under $Y)": ["headline", "under $"],
    "single-product spotlight": ["spotlight", "single"],
}
PRIOR_A, PRIOR_B = 1.0, 200.0   # prior belief: ~0.5% outbound click rate
MIN_SHARE = 0.10                # never starve an arm completely (keeps exploring)


def canon_style(s):
    s = (s or "").lower()
    for arm, keys in STYLES.items():
        if any(k in s for k in keys):
            return arm
    return "other"


def load_json(path, default):
    try:
        with open(path) as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def latest_stats():
    """Merge stats files; newest value per pin wins. Format: {"pins": {pin_id: {"impressions":..,"outbound_clicks":..,"saves":..}}}"""
    merged = {}
    for fp in sorted(glob.glob(P("_build", "stats", "*.json"))):
        for pid, v in load_json(fp, {}).get("pins", {}).items():
            merged[pid] = v
    return merged


def arm_table(pins, stats, key_fn, arms):
    t = {a: {"pins": 0, "impressions": 0, "clicks": 0, "saves": 0} for a in arms}
    for p in pins:
        a = key_fn(p)
        if a not in t:
            continue
        s = stats.get(str(p.get("pin_id")), {})
        t[a]["pins"] += 1
        t[a]["impressions"] += int(s.get("impressions", 0) or 0)
        t[a]["clicks"] += int(s.get("outbound_clicks", 0) or 0)
        t[a]["saves"] += int(s.get("saves", 0) or 0)
    for a, r in t.items():
        A, B = PRIOR_A + r["clicks"], PRIOR_B + max(r["impressions"] - r["clicks"], 0)
        r["post_mean"] = A / (A + B)
        sd = math.sqrt(A * B / ((A + B) ** 2 * (A + B + 1)))
        r["post_lo"], r["post_hi"] = max(r["post_mean"] - 1.645 * sd, 0), r["post_mean"] + 1.645 * sd
        r["_ab"] = (A, B)
    return t


def win_probs(table, weights=None, draws=4000, rng=random):
    arms = list(table)
    wins = {a: 0 for a in arms}
    for _ in range(draws):
        best, bv = None, -1
        for a in arms:
            A, B = table[a]["_ab"]
            v = rng.betavariate(A, B) * (weights.get(a, 1.0) if weights else 1.0)
            if v > bv:
                best, bv = a, v
        wins[best] += 1
    probs = {a: wins[a] / draws for a in arms}
    # floor so nothing is starved, then renormalize
    probs = {a: max(p, MIN_SHARE) for a, p in probs.items()}
    s = sum(probs.values())
    return {a: p / s for a, p in probs.items()}


def allocate(probs, n, rng=random):
    out = []
    for _ in range(n):
        r, acc = rng.random(), 0
        for a, p in probs.items():
            acc += p
            if r <= acc:
                out.append(a)
                break
        else:
            out.append(list(probs)[-1])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pins", type=int, default=3)
    ap.add_argument("--seed", type=int)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    rng = random.Random(a.seed)

    pins = load_json(P("_build", "pin_log.json"), {}).get("pins", [])
    guides = [g["slug"] for g in load_json(P("_build", "guides.json"), [])]
    tw = load_json(P("_build", "trend_weights.json"), {}).get("weights", {})
    stats = latest_stats()
    total_imp = sum(int(v.get("impressions", 0) or 0) for v in stats.values())

    style_t = arm_table(pins, stats, lambda p: canon_style(p.get("style")), list(STYLES))
    guide_t = arm_table(pins, stats, lambda p: (p.get("link") or "").strip("/"), guides)
    style_p = win_probs(style_t, rng=rng)
    guide_p = win_probs(guide_t, weights={g: tw.get(g, 1.0) for g in guides}, rng=rng)

    plan = [{"style": s, "guide": g} for s, g in zip(allocate(style_p, a.pins, rng), allocate(guide_p, a.pins, rng))]
    mode = "exploring (not enough data yet)" if total_imp < 500 else "learning (shifting toward winners)"
    today = dt.date.today().isoformat()

    clean = lambda t: {k: {x: (round(y, 5) if isinstance(y, float) else y) for x, y in v.items() if x != "_ab"} for k, v in t.items()}
    data = load_json(P("lab", "data.json"), {"history": []})
    entry = {"date": today, "mode": mode, "plan": plan,
             "style_share": {k: round(v, 3) for k, v in style_p.items()},
             "guide_share": {k: round(v, 3) for k, v in guide_p.items()}}
    data.update({"updated": today, "mode": mode, "total_pins": len(pins), "total_impressions": total_imp,
                 "total_clicks": sum(int(v.get("outbound_clicks", 0) or 0) for v in stats.values()),
                 "styles": clean(style_t), "guides": clean(guide_t), "trend_weights": tw,
                 "style_share": entry["style_share"], "guide_share": entry["guide_share"], "today": plan})
    data["history"] = [h for h in data.get("history", []) if h.get("date") != today] + [entry]
    data["history"] = data["history"][-60:]

    print(json.dumps({"mode": mode, "plan": plan, "style_share": entry["style_share"], "guide_share": entry["guide_share"]}, indent=1))
    if not a.dry_run:
        os.makedirs(P("lab"), exist_ok=True)
        with open(P("_build", "plan_today.json"), "w") as f:
            json.dump({"date": today, "mode": mode, "plan": plan}, f, indent=1)
        with open(P("lab", "data.json"), "w") as f:
            json.dump(data, f, indent=1)


if __name__ == "__main__":
    main()
