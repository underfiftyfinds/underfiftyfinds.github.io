"""Builds the gift-guide pages from guides.json. Run: python3 _build/build.py"""
import json, html, pathlib, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
HEAD = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="p:domain_verify" content="dceb09e46252e908b2a283bb8a5bf025"/>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}">{og}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css"></head><body>
<header class="site"><div class="wrap"><a class="logo" href="/">Under <span>Fifty</span> Finds</a>
<nav><a href="/">Gift guides</a><a href="https://www.pinterest.com/underfiftyfinds/" rel="noopener">Pinterest</a></nav></div></header>
<main class="wrap">"""
DISC = '<p class="disclosure">As an Amazon Associate I earn from qualifying purchases. This page contains affiliate links, so if you buy through them I may earn a small commission at no extra cost to you. Prices change often; check Amazon for the current price.</p>'
FOOT = """</main><footer><div class="wrap">© 2026 Under Fifty Finds. As an Amazon Associate I earn from qualifying purchases. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates. <a href="/privacy/">Privacy policy</a>.</div></footer></body></html>"""

SITE = "https://underfiftyfinds.github.io"

def og_tags(title, desc, path, kind="article"):
    """Open Graph tags: Pinterest uses these for rich pins (bold title + site name)."""
    img = ""
    try:
        log = json.loads((ROOT / "_build" / "pin_log.json").read_text()).get("pins", [])
        hit = [p for p in log if (p.get("link") or "").strip("/") == path.strip("/") and p.get("image")]
        if hit:
            img = f'<meta property="og:image" content="{SITE}/{hit[0]["image"]}">'
    except (OSError, ValueError):
        pass
    e = html.escape
    return (f'\n<meta property="og:type" content="{kind}"><meta property="og:site_name" content="Under Fifty Finds">'
            f'<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}">'
            f'<meta property="og:url" content="{SITE}/{path.strip("/") + "/" if path.strip("/") else ""}">{img}')

def link(item, tag):
    if item.get("asin"):
        return f"https://www.amazon.com/dp/{item['asin']}?tag={tag}"
    return "https://www.amazon.com/s?" + urllib.parse.urlencode({"k": item["search"], "tag": tag})

def build_guide(g):
    out = [HEAD.format(title=html.escape(g["title"]) + " | Under Fifty Finds", desc=html.escape(g["desc"]), og=og_tags(g["title"], g["desc"], g["slug"]))]
    out.append(f"<h1>{html.escape(g['h1'])}</h1><p class='lede'>{html.escape(g['lede'])}</p>{DISC}")
    n = 0
    for sec in g["sections"]:
        out.append(f"<h2>{html.escape(sec['name'])}</h2><p class='section-note'>{html.escape(sec['note'])}</p>")
        for it in sec["items"]:
            n += 1
            out.append(f"""<article class="card"><div class="num">{n:02d}</div><h3>{html.escape(it['name'])}</h3>
<span class="tier">{html.escape(it['tier'])}</span><p>{html.escape(it['why'])}</p>
<a class="btn" href="{html.escape(link(it, g['tag']))}" rel="sponsored nofollow noopener" target="_blank">See it on Amazon</a></article>""")
    out.append(FOOT)
    d = ROOT / g["slug"]; d.mkdir(exist_ok=True)
    (d / "index.html").write_text("\n".join(out))

def build_home(guides):
    out = [HEAD.format(title="Under Fifty Finds | Gift ideas and Amazon finds under $50", desc="Hand-picked gift ideas and Amazon finds under $50 that look and feel more expensive.", og=og_tags("Under Fifty Finds: gift ideas and Amazon finds under $50", "Hand-picked gift ideas and Amazon finds under $50 that look and feel more expensive.", "", "website"))]
    out.append("<h1>Gifts that look like more than they cost.</h1><p class='lede'>Hand-picked gift ideas and Amazon finds under $50, sorted by who you're shopping for.</p>")
    out.append("<div class='guides'>")
    for g in guides:
        out.append(f"<a class='guide' href='/{g['slug']}/'><span class='tag'>Gift guide</span><h3>{html.escape(g['h1'])}</h3><p>{html.escape(g['card'])}</p></a>")
    for s in ["Gifts for Dad Under $50", "Gift Basket Ideas", "Living Room Decor on a Budget", "Kitchen Organization Finds"]:
        out.append(f"<div class='guide soon'><span class='tag'>Coming soon</span><h3>{s}</h3></div>")
    out.append("</div>" + DISC + FOOT)
    (ROOT / "index.html").write_text("\n".join(out))

guides = json.loads((ROOT / "_build" / "guides.json").read_text())
for g in guides: build_guide(g)
build_home(guides)
print("built", [g["slug"] for g in guides])
