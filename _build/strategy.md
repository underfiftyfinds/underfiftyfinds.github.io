# Under Fifty Finds strategy (read by the daily pin run; updated by the weekly review)

## Guide build order (UPDATED 2026-11-09 from trend radar, see _build/trends/2026-11-01.md)
Live: Gifts for Him Under $50, Stocking Stuffers Under $15, White Elephant Gifts Under $25 (2026-11-07), Gifts for Mom (2026-11-09), Teacher Christmas Gifts Under $25 (2026-11-11), Gifts for Dad Under $50 (2026-11-13).
Next, in this order (one new guide every ~2-3 days, all before Dec 7):
1. [LIVE 2026-11-07] White Elephant Gifts Under $25 -> board "White Elephant Gift Ideas" (biggest search of the season, peaks Dec 14; ~12x our anchor at peak). Funny + useful picks.
2. [LIVE 2026-11-09] Gifts for Mom -> board "Gifts for Mom" (peak Dec 21, growing +20% YoY). 14 picks.
3. [LIVE 2026-11-11] Teacher Christmas Gifts Under $25 -> board "Teacher Christmas Gifts" (peak Dec 21, big; +50% week over week). 14 picks.
4. [LIVE 2026-11-13] Gifts for Dad Under $50 -> board "Gifts for Him Under $50" (peak Dec 21). 13 picks.
5. BUILD NEXT (~2026-11-15 or 16): Gift Basket Ideas (DIY gift baskets with Amazon fillers) -> board "Gifts for Her Under $50" or best fit.
Deprioritized (small or shrinking searches): Gifts for Her, Kitchen Gifts, Cozy Home, housewarming. Build only after the above.
Optional small add-on: a "Secret Santa / cheap Christmas gifts" section inside the White Elephant guide (both +200-300% month over month; no new guide needed).
After Christmas (from Dec 26): Living Room Decor on a Budget (NEW 2026-11-09: peaks Jan 11 at ~3.9x anchor, though -20% YoY), Kitchen/Home Organization (peaks Jan 4, +20%), Galentine's gifts (late Jan, small but +400% YoY), Amazon Finds Under $25 (+70% YoY, peaks Dec 28), Apartment Decor on a Budget (+90% YoY, peaks Mar 1), Valentine's Gifts for Him (peaks Feb 15, +70%), then bedroom/bathroom decor ideas (spring, growing fast).

## Pin mix
- Also make pins for existing guides with stronger search phrasing: "stocking stuffers for men", "white elephant gift ideas", "gifts for mom", "teacher christmas gifts". Put the exact search phrase in the pin headline and the first words of the description.
- Push this week (2026-11-09): "white elephant gift ideas" (rising fast), "stocking stuffer ideas" (+300% MoM), "stocking stuffers for men", "cheap christmas gifts", "secret santa gifts". Fewer plain "gifts for him" pins (6 pins, 53 impressions, 0 site clicks so far; small search).
- 3 pins/day until 2026-11-19, then 5/day if healthy.

## What's working (fill in from weekly reviews)
- 2026-11-09 (first 4 days, 12 pins): 86 impressions, 6 saves, 3 pin clicks, 1 outbound click. Followers 0. Far too early to call any winner.
- The only site click came from "Stocking stuffers under $10" (X under $Y headline style, 11 impressions). One click is luck-sized; keep testing all styles.
- By guide: Gifts for Him 53 impr / 0 clicks; Stocking Stuffers 25 impr / 1 click, 3 saves; White Elephant 8 impr / 2 saves (newest).
- Distribution is slow on a brand-new account (~1-2 impressions per pin per day). Keep posting; judge styles from ~2026-12-03 onward.

## Decisions log
- 2026-11-05: Launched. 8 boards, site live, first 3 pins (Gifts for Him).
- 2026-11-05: Daily run added Stocking Stuffers Under $15 guide + 3 pins.
- 2026-11-05: Trend radar: re-ordered guides (white elephant, mom, teacher, dad first); created boards "White Elephant Gift Ideas" and "Teacher Christmas Gifts".
- 2026-11-07: Added White Elephant Gifts Under $25 guide (15 picks). Stats now readable via UserActivityPinsResource creator_analytics (impressions, pin/outbound clicks, saves).
- 2026-11-07: Titles: all 9 pins titled via the page's own PinResource/update (options {id,title}) from a logged-in pinterest.com tab; works reliably, use it for new pins. Note: Pages takes >2 min to refresh a changed image; give new PNGs a new filename instead of overwriting.
- 2026-11-08: Claimed website underfiftyfinds.github.io on Pinterest (p:domain_verify meta tag in build.py HEAD; keep it). Skipped Conversions API / Pinterest tag (ads only).
- 2026-11-11: Added Teacher Christmas Gifts Under $25 guide (14 picks).
- 2026-11-09: Weekly review. 12 pins, 86 impressions, 1 outbound click; too early for winners. Bandit now caps any one style at 35% (guides 50%) while exploring (<500 impressions) so one lucky click can't take half the pins. Trend weights: white elephant 2.2, mom 1.8, teacher 1.6, stocking stuffers 1.5. Build Gifts for Mom next, then Teacher. Stay at 3 pins/day until 2026-11-19.
- 2026-11-13: Added Gifts for Dad Under $50 guide (13 picks).
