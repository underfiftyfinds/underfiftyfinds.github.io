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
<nav><a href="/">Gift guides</a><a href="/gift-finder/">Gift Finder</a><a href="https://www.pinterest.com/underfiftyfinds/" rel="noopener">Pinterest</a></nav></div></header>
<main class="wrap">"""
DISC = '<p class="disclosure">As an Amazon Associate I earn from qualifying purchases. This page contains affiliate links, so if you buy through them I may earn a small commission at no extra cost to you. Prices change often; check Amazon for the current price.</p>'
FOOT = """</main><footer><div class="wrap">© 2026 Under Fifty Finds. As an Amazon Associate I earn from qualifying purchases. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates. <a href="/privacy/">Privacy policy</a>.</div></footer></body></html>"""

SITE = "https://underfiftyfinds.github.io"

# Visitor counter (GoatCounter, free, no cookies). Off until Micah creates an account and
# puts its code in _build/site.json as {"goatcounter": "<code>"}. When on, every page counts
# views and every "See it on Amazon" button counts clicks (event amazon/<guide>/<nn>).
try:
    GC = json.loads((pathlib.Path(__file__).resolve().parent / "site.json").read_text()).get("goatcounter", "").strip()
except Exception:
    GC = ""
if GC:
    FOOT = FOOT.replace("</body>", f'<script data-goatcounter="https://{GC}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script></body>')

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
    out.append(f"<h1>{html.escape(g['h1'])}</h1><p class='lede'>{html.escape(g['lede'])}</p><p class='finder-tip'>Shopping for more than one person? <a href='/gift-finder/'>Use the Gift Finder</a>: every pick in one place, sorted by who and budget.</p>{DISC}")
    n = 0
    for sec in g["sections"]:
        out.append(f"<h2>{html.escape(sec['name'])}</h2><p class='section-note'>{html.escape(sec['note'])}</p>")
        for it in sec["items"]:
            n += 1
            out.append(f"""<article class="card"><div class="num">{n:02d}</div><h3>{html.escape(it['name'])}</h3>
<span class="tier">{html.escape(it['tier'])}</span><p>{html.escape(it['why'])}</p>
<a class="btn" href="{html.escape(link(it, g['tag']))}"{(f' data-goatcounter-click="amazon/{g["slug"]}/{n:02d}" data-goatcounter-title="{html.escape(it["name"])}"' if GC else '')} rel="sponsored nofollow noopener" target="_blank">See it on Amazon</a></article>""")
    out.append(FOOT)
    d = ROOT / g["slug"]; d.mkdir(exist_ok=True)
    (d / "index.html").write_text("\n".join(out))


WHO = {"gifts-for-him-under-50": "Him", "stocking-stuffers-under-15": "Stocking stuffers", "white-elephant-gifts-under-25": "White elephant",
       "gifts-for-mom": "Mom", "teacher-christmas-gifts": "Teachers", "gifts-for-dad-under-50": "Dad", "gift-basket-ideas": "Gift baskets",
       "coworker-secret-santa-gifts-under-25": "Coworkers & Secret Santa", "gifts-for-her-under-50": "Her", "gifts-for-grandma-under-50": "Grandma",
       "neighbor-christmas-gifts-under-15": "Neighbors", "gifts-for-sister-brother-under-30": "Sister & brother"}

def build_finder(guides):
    """One page with every pick from every guide, filterable by who it's for and budget."""
    import re
    title = "Gift Finder: Every Gift Idea Under $50, Sorted by Who and Budget"
    desc = "Every gift idea from our guides in one place. Pick who you're shopping for and your budget, and see only the gifts that fit. All under $50."
    out = [HEAD.format(title=html.escape(title) + " | Under Fifty Finds", desc=html.escape(desc), og=og_tags(title, desc, "gift-finder"))]
    out.append("<h1>Gift Finder</h1><p class='lede'>Every pick from every guide in one place. Choose who you're shopping for and your budget, and the list sorts itself.</p>" + DISC)
    chips = "".join(f"<button class='chip' data-who='{s}'>{html.escape(w)}</button>" for s, w in WHO.items() if any(g['slug'] == s for g in guides))
    out.append("<div class='filters'><p class='flabel'>Who</p><div class='chips' id='who'><button class='chip on' data-who='all'>Everyone</button>" + chips + "</div>"
               "<p class='flabel'>Budget</p><div class='chips' id='budget'>" + "".join(f"<button class='chip{' on' if b==50 else ''}' data-max='{b}'>Under ${b}</button>" for b in (10, 15, 25, 50)) + "</div>"
               "<p class='count' id='count'></p></div><div id='list'>")
    for g in guides:
        n = 0
        for sec in g["sections"]:
            for it in sec["items"]:
                n += 1
                m = re.search(r"(\d+)", it.get("tier", ""))
                price = int(m.group(1)) if m else 50
                out.append(f"""<article class="card f" data-who="{g['slug']}" data-max="{price}"><h3>{html.escape(it['name'])}</h3>
<span class="tier">{html.escape(it['tier'])}</span> <a class="from" href="/{g['slug']}/">{html.escape(WHO.get(g['slug'], g['h1']))}</a><p>{html.escape(it['why'])}</p>
<a class="btn" href="{html.escape(link(it, g['tag']))}"{(f' data-goatcounter-click="amazon/gift-finder/{g["slug"]}-{n:02d}" data-goatcounter-title="{html.escape(it["name"])}"' if GC else '')} rel="sponsored nofollow noopener" target="_blank">See it on Amazon</a></article>""")
    out.append("""</div><script>
(function(){var who='all',max=50;var cards=[].slice.call(document.querySelectorAll('.card.f'));
function apply(){var n=0;cards.forEach(function(c){var ok=(who==='all'||c.dataset.who===who)&&(+c.dataset.max<=max);c.style.display=ok?'':'none';if(ok)n++;});
document.getElementById('count').textContent=n+(n===1?' gift':' gifts')+' match';}
function wire(id,fn){var box=document.getElementById(id);box.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
[].forEach.call(box.querySelectorAll('button'),function(x){x.classList.remove('on')});b.classList.add('on');fn(b);apply();});}
var q=new URLSearchParams(location.search);if(q.get('who')){who=q.get('who');}if(q.get('max')){max=+q.get('max');}
[].forEach.call(document.querySelectorAll('#who button'),function(b){b.classList.toggle('on',b.dataset.who===who)});
[].forEach.call(document.querySelectorAll('#budget button'),function(b){b.classList.toggle('on',+b.dataset.max===max)});
wire('who',function(b){who=b.dataset.who});wire('budget',function(b){max=+b.dataset.max});apply();})();
</script>""" + FOOT)
    d = ROOT / "gift-finder"; d.mkdir(exist_ok=True)
    (d / "index.html").write_text("\n".join(out))

def build_home(guides):
    out = [HEAD.format(title="Under Fifty Finds | Gift ideas and Amazon finds under $50", desc="Hand-picked gift ideas and Amazon finds under $50 that look and feel more expensive.", og=og_tags("Under Fifty Finds: gift ideas and Amazon finds under $50", "Hand-picked gift ideas and Amazon finds under $50 that look and feel more expensive.", "", "website"))]
    out.append("<h1>Gifts that look like more than they cost.</h1><p class='lede'>Hand-picked gift ideas and Amazon finds under $50, sorted by who you're shopping for.</p>")
    out.append("<a class='finder-cta' href='/gift-finder/'><strong>Gift Finder</strong><span>Every pick in one place. Choose who and your budget.</span></a>")
    out.append("<div class='guides'>")
    for g in guides:
        out.append(f"<a class='guide' href='/{g['slug']}/'><span class='tag'>Gift guide</span><h3>{html.escape(g['h1'])}</h3><p>{html.escape(g['card'])}</p></a>")
    for s in ["Last-Minute Amazon Gifts Under $25", "New Year's Eve Party Finds Under $25", "Living Room Decor on a Budget"]:
        out.append(f"<div class='guide soon'><span class='tag'>Coming soon</span><h3>{s}</h3></div>")
    out.append("</div>" + DISC + FOOT)
    (ROOT / "index.html").write_text("\n".join(out))

guides = json.loads((ROOT / "_build" / "guides.json").read_text())
for g in guides: build_guide(g)
build_finder(guides)
build_home(guides)
print("built", [g["slug"] for g in guides])
