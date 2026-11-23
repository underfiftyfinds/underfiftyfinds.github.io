"""Self-learning pin planner (Thompson-sampling multi-armed bandit).

Decides what today's pins should be: which DESIGN STYLE, which GUIDE and which COLOR PALETTE each pin uses.
Reward = outbound clicks per impression (visits to our site), learned from _build/stats/*.json.
Guides also get a seasonal boost from _build/trend_weights.json (written by the weekly radar).

Usage: python3 _build/bandit.py --pins 3 [--seed N] [--dry-run]
Writes: _build/plan_today.json (the daily run follows it) and lab/data.json (dashboard).
"""
import argparse, glob, json, math, os, random, datetime as dt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

STYLES = {  # canonical arm -> words that identify it in pin_log "style"
    "canva photo pin": ["canva"],   # made by the separate Canva photo-pin task (1/day); tracked, never planned here
    "numbered list": ["list"],
    "dark quote": ["quote"],
    "3-item callout": ["callout"],
    "headline (X under $Y)": ["headline", "under $"],
    "single-product spotlight": ["spotlight", "single"],
    "teaser (curiosity gap)": ["teaser", "curiosity"],
    "minimal (big headline)": ["minimal"],   # added 2026-11-21: few words, one huge headline
}
# COLOR PALETTES (added 2026-11-20, Micah approved): every pin also gets a palette arm.
# Pins logged before 2026-11-20 (no "palette" field) count as "cream classic".
PALETTES = {
    "cream classic":   {"bg": "#F4EDE4", "ink": "#2B2420", "acc": "#B5634B", "card": "#FFFDF9"},
    "christmas red":   {"bg": "#B3202A", "ink": "#FFF7EE", "acc": "#F2C14E", "card": "#8E1820"},
    "evergreen gold":  {"bg": "#1F4D3A", "ink": "#FFF8EC", "acc": "#E0B252", "card": "#173B2C"},
    "candy pink":      {"bg": "#F7C6D4", "ink": "#3A1020", "acc": "#D6234A", "card": "#FFE4EC"},
    "midnight navy":   {"bg": "#14213D", "ink": "#FFFFFF", "acc": "#FCA311", "card": "#1E2F55"},
    "bold white":      {"bg": "#FFFFFF", "ink": "#111111", "acc": "#E63946", "card": "#F3F3F3"},
}
PALETTE_CAP = 0.35              # no single palette takes more than ~1/3 of pins while testing

PRIOR_A, PRIOR_B = 1.0, 200.0   # prior belief: ~0.5% outbound click rate
MIN_SHARE = 0.10                # never starve an arm completely (keeps exploring)
MAX_SHARE_EXPLORING = 0.35      # while exploring (<10 outbound clicks), one lucky click can't grab half the pins
MIN_CLICKS_TO_LEARN = 10        # 2026-11-22 review: switched gate from 500 impressions to 10 outbound clicks (1 click in 1,050 impressions is noise)
LAUNCH_PINS = 2                 # a newly launched guide gets its first 2 pins guaranteed (Micah approved 2026-11-17)


def canon_style(s):
    s = (s or "").lower()
    for arm, keys in STYLES.items():
        if any(k in s for k in keys):
            return arm
    return "other"


def canon_format(p):
    return p.get("format") if p.get("format") in ("short", "wordy") else "unlabeled"


def canon_palette(p):
    v = (p.get("palette") or "cream classic").lower()
    return v if v in PALETTES else "other"


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


def win_probs(table, weights=None, draws=4000, rng=random, cap=None):
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
    probs = {a: p / s for a, p in probs.items()}
    if cap and cap * len(probs) >= 1:
        for _ in range(10):  # clip at cap, hand the excess to the uncapped arms
            over = sum(max(p - cap, 0) for p in probs.values())
            if over < 1e-9:
                break
            free = [a for a, p in probs.items() if p < cap]
            fs = sum(probs[a] for a in free)
            probs = {a: (min(p, cap) if a not in free else p + over * p / fs) for a, p in probs.items()}
    return probs


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
    total_clk = sum(int(v.get("outbound_clicks", 0) or 0) for v in stats.values())
    exploring = total_clk < MIN_CLICKS_TO_LEARN
    cap = MAX_SHARE_EXPLORING if exploring else None
    PLANNABLE = [k for k in STYLES if k != "canva photo pin"]
    style_p = win_probs({k: style_t[k] for k in PLANNABLE}, rng=rng, cap=cap)
    # guides are few (3-6) and carry deliberate seasonal weights, so they get a looser cap
    guide_p = win_probs(guide_t, weights={g: tw.get(g, 1.0) for g in guides}, rng=rng, cap=(0.5 if cap else None))

    pal_t = arm_table(pins, stats, canon_palette, list(PALETTES))
    pal_p = win_probs(pal_t, rng=rng, cap=PALETTE_CAP)
    if exploring:
        # 2026-11-22 review: with under 10 outbound clicks the click data cannot tell arms apart, and Thompson
        # sampling was punishing the arms that got the MOST reach (e.g. white elephant, 377 impressions, 0 clicks,
        # fell to the 8% floor despite being the biggest search). Until 10 clicks: guides follow the seasonal
        # trend weights, styles and palettes are split evenly.
        tws = {g: tw.get(g, 1.0) for g in guides}
        t = sum(tws.values()) or 1.0
        guide_p = {g: v / t for g, v in tws.items()}
        style_p = {k: 1.0 / len(PLANNABLE) for k in PLANNABLE}
        pal_p = {k: 1.0 / len(PALETTES) for k in PALETTES}
    plan = [{"style": s, "guide": g, "palette": c, "colors": PALETTES[c]}
            for s, g, c in zip(allocate(style_p, a.pins, rng), allocate(guide_p, a.pins, rng), allocate(pal_p, a.pins, rng))]
    # FORMAT SPLIT (Micah 2026-11-21): half the pins "short" (3-second rule), half "wordy" (fuller list style).
    for i, slot in enumerate(plan):
        slot["format"] = "short" if i % 2 == 0 else "wordy"
    # Launch boost: a guide with fewer than LAUNCH_PINS pins takes the first slots (newest guides first),
    # so a new guide gets pins on launch day instead of waiting for a lucky draw.
    slot = 0
    for g in reversed(guides):
        need = max(LAUNCH_PINS - guide_t[g]["pins"], 0)
        for _ in range(need):
            if slot < len(plan):
                plan[slot]["guide"], plan[slot]["launch_boost"] = g, True
                slot += 1
    mode = "exploring (not enough clicks yet)" if exploring else "learning (shifting toward winners)"
    try:  # pin_log dates are Pacific dates
        from zoneinfo import ZoneInfo
        today = dt.datetime.now(ZoneInfo("America/Los_Angeles")).date().isoformat()
    except Exception:
        today = dt.date.today().isoformat()

    clean = lambda t: {k: {x: (round(y, 5) if isinstance(y, float) else y) for x, y in v.items() if x != "_ab"} for k, v in t.items()}
    data = load_json(P("lab", "data.json"), {"history": []})
    entry = {"date": today, "mode": mode, "plan": plan,
             "style_share": {k: round(v, 3) for k, v in style_p.items()},
             "guide_share": {k: round(v, 3) for k, v in guide_p.items()},
             "palette_share": {k: round(v, 3) for k, v in pal_p.items()}}
    data.update({"updated": today, "mode": mode, "total_pins": len(pins), "total_impressions": total_imp,
                 "total_clicks": sum(int(v.get("outbound_clicks", 0) or 0) for v in stats.values()),
                 "styles": clean(style_t), "guides": clean(guide_t), "trend_weights": tw,
                 "style_share": entry["style_share"], "guide_share": entry["guide_share"],
                 "palettes": clean(pal_t), "formats": clean(arm_table(pins, stats, canon_format, ["short", "wordy"])), "palette_share": entry["palette_share"], "today": plan})
    data["history"] = [h for h in data.get("history", []) if h.get("date") != today] + [entry]
    data["history"] = data["history"][-60:]

    print(json.dumps({"mode": mode, "plan": plan, "style_share": entry["style_share"], "guide_share": entry["guide_share"], "palette_share": entry["palette_share"]}, indent=1))
    if not a.dry_run:
        os.makedirs(P("lab"), exist_ok=True)
        with open(P("_build", "plan_today.json"), "w") as f:
            json.dump({"date": today, "mode": mode, "plan": plan}, f, indent=1)
        with open(P("lab", "data.json"), "w") as f:
            json.dump(data, f, indent=1)


if __name__ == "__main__":
    main()
