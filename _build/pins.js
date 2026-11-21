const { chromium } = require('playwright');
const out = __dirname + '/';
const css = `
*{box-sizing:border-box;margin:0}
body{width:1000px;height:1500px;background:#F4EDE4;color:#2B2420;font-family:Inter;position:relative;overflow:hidden}
.serif{font-family:Lora;font-weight:700;letter-spacing:-.02em}
.foot{position:absolute;left:0;right:0;bottom:56px;text-align:center;font:600 26px Inter;letter-spacing:.12em;color:#954C37;text-transform:uppercase}
.kicker{font:700 30px Inter;letter-spacing:.18em;text-transform:uppercase;color:#B5634B}
.pill{display:inline-block;background:#B5634B;color:#fff;font:700 34px Inter;padding:16px 34px;border-radius:999px}
`;
const pins = {
 pin1_list: `
 <div style="padding:90px 80px 0">
  <div class="kicker">Gift guide</div>
  <div class="serif" style="font-size:118px;line-height:1.02;margin:22px 0 18px">Gifts for Him<br>Under $50</div>
  <div style="font-size:40px;color:#6E625A;margin-bottom:46px">12 he'll actually use</div>
  <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:36px;padding:52px 56px;font-size:43px;line-height:1.9">
   ${['Instant-read meat thermometer','Heavy-duty BBQ tool set','Slim RFID leather wallet','Ratchet leather belt','Magnetic tool wristband','Wood phone docking station','Solar power bank','Shiatsu neck massager'].map((t,i)=>`<div><span style="color:#B5634B;font-weight:700;display:inline-block;width:70px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div style="color:#6E625A">+ 4 more inside</div>
  </div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin2_quote: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:70px;border:3px solid #B5634B;border-radius:40px"></div>
 <div style="position:relative;padding:210px 130px 0;color:#F4EDE4;text-align:center">
  <div class="serif" style="font-size:210px;line-height:.6;color:#B5634B">&ldquo;</div>
  <div class="serif" style="font-size:96px;line-height:1.1;margin-top:20px">I don't<br>need<br>anything.</div>
  <div style="font-size:44px;line-height:1.45;margin:70px auto 0;color:#D9CBBE;max-width:700px">Gifts for the guy who says that, all under $50</div>
  <div style="margin-top:80px"><span class="pill">See the list</span></div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:110px">underfiftyfinds.github.io</div>`,
 pin3_grill: `
 <div style="position:absolute;left:0;right:0;top:0;height:640px;background:#B5634B"></div>
 <div style="position:relative;padding:110px 80px 0;color:#FFF6EE">
  <div class="kicker" style="color:#FFE2D6">For the grill guy</div>
  <div class="serif" style="font-size:112px;line-height:1.03;margin-top:24px">3 grill gifts<br>under $50</div>
  <div style="font-size:40px;margin-top:22px;color:#FFE2D6">He'll use them every weekend</div>
 </div>
 <div style="position:absolute;left:80px;right:80px;top:560px">
  ${[['Instant-read thermometer','No more guessing if it is done'],['Heavy-duty BBQ tool set','Stainless tools in a carry case'],['Wireless meat probe','Checks the temp from his phone']].map((r,i)=>`
   <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:30px;padding:38px 46px;margin-bottom:28px;display:flex;gap:34px;align-items:center">
    <div class="serif" style="font-size:84px;color:#B5634B;width:80px">${i+1}</div>
    <div><div style="font:700 44px Inter">${r[0]}</div><div style="font-size:34px;color:#6E625A;margin-top:8px">${r[1]}</div></div>
   </div>`).join('')}
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin4_stocking_list: `
 <div style="position:absolute;left:0;right:0;top:0;height:22px;background:#B5634B"></div>
 <div style="padding:92px 80px 0">
  <div class="kicker">Holiday gift guide</div>
  <div class="serif" style="font-size:116px;line-height:1.02;margin:22px 0 18px">Stocking Stuffers<br>Under $15</div>
  <div style="font-size:40px;color:#6E625A;margin-bottom:44px">Small gifts that won't end up in a drawer</div>
  <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:36px;padding:44px 56px;font-size:41px;line-height:1.78">
   ${['Chenille cozy socks','Clip-on book light','Lip balm holiday minis','Dutch Blitz card game','Cooling under-eye patches','Mini screwdriver set','Ribbed cuff beanie','Pickle birthday candles'].map((t,i)=>`<div><span style="color:#B5634B;font-weight:700;display:inline-block;width:70px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div style="color:#6E625A">+ 5 more inside</div>
  </div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin5_stocking_under10: `
 <div style="position:absolute;inset:0;background:#B5634B"></div>
 <div style="position:absolute;inset:60px;background:#F4EDE4;border-radius:44px"></div>
 <div style="position:relative;padding:170px 120px 0;text-align:center">
  <div class="kicker">Cheap stocking stuffers</div>
  <div class="serif" style="font-size:150px;line-height:1;margin-top:40px">Under</div>
  <div class="serif" style="font-size:420px;line-height:.9;color:#B5634B">$10</div>
  <div style="font-size:46px;line-height:1.45;margin:40px auto 0;max-width:720px;color:#4A3F38">Tiny gifts adults actually love: lip balm minis, stress balls, pickle candles and more</div>
  <div style="margin-top:70px"><span class="pill">See all 13 ideas</span></div>
 </div>
 <div class="foot" style="bottom:110px">underfiftyfinds.github.io</div>`,
 pin6_him_dock: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:relative;padding:120px 90px 0;color:#F4EDE4">
  <div class="kicker" style="color:#D9A08C">Gift spotlight &middot; for him</div>
  <div class="serif" style="font-size:104px;line-height:1.05;margin-top:30px">The nightstand gift he didn't know he needed</div>
  <div style="margin-top:70px;background:#3A312C;border:3px solid #B5634B;border-radius:36px;padding:60px 60px">
   <div style="font:700 60px Inter;color:#fff">Wood phone docking station</div>
   <div style="font-size:40px;line-height:1.5;color:#D9CBBE;margin-top:22px">Phone, keys, wallet and watch in one spot. Handsome, practical, and usually under $50.</div>
  </div>
  <div style="font-size:40px;color:#D9CBBE;margin-top:60px">+ 11 more gifts for him under $50</div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:90px">underfiftyfinds.github.io</div>`,
 pin7_stocking_men_spotlight: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;left:0;right:0;top:0;height:22px;background:#B5634B"></div>
 <div style="position:relative;padding:130px 90px 0;color:#F4EDE4">
  <div class="kicker" style="color:#D9A08C">Stocking stuffers for men</div>
  <div class="serif" style="font-size:108px;line-height:1.05;margin-top:30px">The tiny gift he'll use all year</div>
  <div style="margin-top:70px;background:#3A312C;border:3px solid #B5634B;border-radius:36px;padding:60px 60px">
   <div style="font:700 60px Inter;color:#fff">Mini multi-bit screwdriver</div>
   <div style="font-size:40px;line-height:1.5;color:#D9CBBE;margin-top:22px">Pocket-size, tons of bits, fixes glasses, toys and remotes. Fits right in the stocking toe, usually under $15.</div>
  </div>
  <div style="font-size:40px;color:#D9CBBE;margin-top:60px">+ 12 more stocking stuffers under $15</div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:90px">underfiftyfinds.github.io</div>`,
 pin8_white_elephant_list: `
 <div style="position:absolute;left:0;right:0;top:0;height:22px;background:#B5634B"></div>
 <div style="padding:88px 80px 0">
  <div class="kicker">Party season</div>
  <div class="serif" style="font-size:108px;line-height:1.02;margin:22px 0 18px">White Elephant<br>Gift Ideas<br>Under $25</div>
  <div style="font-size:40px;color:#6E625A;margin-bottom:40px">The ones that get stolen twice</div>
  <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:36px;padding:42px 56px;font-size:41px;line-height:1.75">
   ${['Mini waffle maker','Candle warmer lamp','Giant tortilla blanket','Positive pickle night light','Bad People party game','Electric drink chiller','Emoji desktop vacuum'].map((t,i)=>`<div><span style="color:#B5634B;font-weight:700;display:inline-block;width:70px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div style="color:#6E625A">+ 8 more inside</div>
  </div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin9_him_everyday_callout: `
 <div style="position:absolute;left:0;right:0;top:0;height:640px;background:#B5634B"></div>
 <div style="position:relative;padding:110px 80px 0;color:#FFF6EE">
  <div class="kicker" style="color:#FFE2D6">Gifts for him under $50</div>
  <div class="serif" style="font-size:108px;line-height:1.03;margin-top:24px">3 gifts he'll<br>use every day</div>
  <div style="font-size:40px;margin-top:22px;color:#FFE2D6">Practical, handsome, never re-gifted</div>
 </div>
 <div style="position:absolute;left:80px;right:80px;top:560px">
  ${[['Slim RFID leather wallet','Fits a front pocket, blocks card skimmers'],['Ratchet leather belt','No holes, perfect fit every time'],['Magnetic tool wristband','Holds screws and bits while he works']].map((r,i)=>`
   <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:30px;padding:38px 46px;margin-bottom:28px;display:flex;gap:34px;align-items:center">
    <div class="serif" style="font-size:84px;color:#B5634B;width:80px">${i+1}</div>
    <div><div style="font:700 44px Inter">${r[0]}</div><div style="font-size:34px;color:#6E625A;margin-top:8px">${r[1]}</div></div>
   </div>`).join('')}
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin10_stocking_men_list: `
 <div style="position:absolute;left:0;right:0;top:0;height:22px;background:#2B2420"></div>
 <div style="padding:92px 80px 0">
  <div class="kicker">For the guys</div>
  <div class="serif" style="font-size:112px;line-height:1.02;margin:22px 0 18px">Stocking Stuffers<br>for Men<br>Under $15</div>
  <div style="font-size:40px;color:#6E625A;margin-bottom:40px">Little gifts he'll actually keep</div>
  <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:36px;padding:42px 56px;font-size:41px;line-height:1.75">
   ${['Mini multi-bit screwdriver','Ribbed cuff beanie','Funny food crew socks','Clip-on book light','Grippy cozy socks','Dutch Blitz card game','Squishy stress ball'].map((t,i)=>`<div><span style="color:#B5634B;font-weight:700;display:inline-block;width:70px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div style="color:#6E625A">+ more inside</div>
  </div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin11_him_tech_callout: `
 <div style="position:absolute;left:0;right:0;top:0;height:640px;background:#2B2420"></div>
 <div style="position:relative;padding:110px 80px 0;color:#F4EDE4">
  <div class="kicker" style="color:#D9A08C">Gifts for him under $50</div>
  <div class="serif" style="font-size:108px;line-height:1.03;margin-top:24px">3 tech gifts<br>he'll love</div>
  <div style="font-size:40px;margin-top:22px;color:#D9A08C">Feel way more expensive than they are</div>
 </div>
 <div style="position:absolute;left:80px;right:80px;top:560px">
  ${[['Wood phone docking station','Phone, keys and watch in one spot'],['Solar power bank','Rugged backup battery for trips'],['Over-ear headphones','Trusted audio brand, all-day comfy']].map((r,i)=>`
   <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:30px;padding:38px 46px;margin-bottom:28px;display:flex;gap:34px;align-items:center">
    <div class="serif" style="font-size:84px;color:#B5634B;width:80px">${i+1}</div>
    <div><div style="font:700 44px Inter">${r[0]}</div><div style="font-size:34px;color:#6E625A;margin-top:8px">${r[1]}</div></div>
   </div>`).join('')}
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin12_white_elephant_funny_callout: `
 <div style="position:absolute;left:0;right:0;top:0;height:640px;background:#B5634B"></div>
 <div style="position:relative;padding:110px 80px 0;color:#FFF6EE">
  <div class="kicker" style="color:#FFE2D6">White elephant gift ideas</div>
  <div class="serif" style="font-size:108px;line-height:1.03;margin-top:24px">3 funny gifts<br>under $25</div>
  <div style="font-size:40px;margin-top:22px;color:#FFE2D6">They get the laugh, then get stolen</div>
 </div>
 <div style="position:absolute;left:80px;right:80px;top:560px">
  ${[['Giant tortilla blanket','A soft, round, very real-looking burrito'],['Positive pickle night light','A smiling pickle nobody can resist'],['Emoji desktop vacuum','Silly-looking, cleans crumbs for real']].map((r,i)=>`
   <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:30px;padding:38px 46px;margin-bottom:28px;display:flex;gap:34px;align-items:center">
    <div class="serif" style="font-size:84px;color:#B5634B;width:80px">${i+1}</div>
    <div><div style="font:700 44px Inter">${r[0]}</div><div style="font-size:34px;color:#6E625A;margin-top:8px">${r[1]}</div></div>
   </div>`).join('')}
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin13_mom_under25: `
 <div style="position:absolute;inset:0;background:#B5634B"></div>
 <div style="position:absolute;inset:60px;background:#F4EDE4;border-radius:44px"></div>
 <div style="position:relative;padding:150px 110px 0;text-align:center">
  <div class="kicker">Christmas gifts for mom</div>
  <div class="serif" style="font-size:120px;line-height:1.02;margin-top:36px">Gifts for Mom</div>
  <div class="serif" style="font-size:96px;line-height:1;margin-top:10px">under</div>
  <div class="serif" style="font-size:380px;line-height:.92;color:#B5634B">$25</div>
  <div style="font-size:44px;line-height:1.45;margin:36px auto 0;max-width:740px;color:#4A3F38">Satin pillowcase, spa shower steamers, a cozy tea sampler and more she'd never buy herself</div>
  <div style="margin-top:60px"><span class="pill">See the full list</span></div>
 </div>
 <div class="foot" style="bottom:100px">underfiftyfinds.github.io</div>`,
 pin14_mom_quote: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:70px;border:3px solid #B5634B;border-radius:40px"></div>
 <div style="position:relative;padding:190px 120px 0;color:#F4EDE4;text-align:center">
  <div class="kicker" style="color:#D9A08C">Gifts for mom</div>
  <div class="serif" style="font-size:210px;line-height:.6;color:#B5634B;margin-top:60px">&ldquo;</div>
  <div class="serif" style="font-size:100px;line-height:1.1;margin-top:20px">Oh, honey,<br>I don't want<br>anything.</div>
  <div style="font-size:44px;line-height:1.45;margin:64px auto 0;color:#D9CBBE;max-width:720px">Cozy gifts she'd never buy for herself, all under $50</div>
  <div style="margin-top:70px"><span class="pill">See the list</span></div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:110px">underfiftyfinds.github.io</div>`,
 pin15_stocking_quote: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:70px;border:3px solid #B5634B;border-radius:40px"></div>
 <div style="position:relative;padding:190px 120px 0;color:#F4EDE4;text-align:center">
  <div class="kicker" style="color:#D9A08C">Stocking stuffer ideas</div>
  <div class="serif" style="font-size:210px;line-height:.6;color:#B5634B;margin-top:60px">&ldquo;</div>
  <div class="serif" style="font-size:100px;line-height:1.1;margin-top:20px">Wait, there's<br>more in<br>the stocking?</div>
  <div style="font-size:44px;line-height:1.45;margin:64px auto 0;color:#D9CBBE;max-width:720px">13 small gifts adults actually use, all under $15</div>
  <div style="margin-top:70px"><span class="pill">See the ideas</span></div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:110px">underfiftyfinds.github.io</div>`,
 pin16_white_elephant_under20: `
 <div style="position:absolute;inset:0;background:#B5634B"></div>
 <div style="position:absolute;inset:60px;background:#F4EDE4;border-radius:44px"></div>
 <div style="position:relative;padding:120px 100px 0;text-align:center">
  <div class="kicker">Office party &middot; gift exchange</div>
  <div class="serif" style="font-size:112px;line-height:1.03;margin-top:28px">White Elephant<br>Gift Ideas</div>
  <div class="serif" style="font-size:96px;line-height:1;margin-top:14px">under</div>
  <div class="serif" style="font-size:300px;line-height:.92;color:#B5634B">$20</div>
  <div style="font-size:44px;line-height:1.45;margin:30px auto 0;max-width:740px;color:#4A3F38">A Magic 8 Ball, a desk vacuum, a luggage scale and more gifts people actually try to steal</div>
  <div style="margin-top:44px"><span class="pill">See all 15 ideas</span></div>
 </div>
 <div class="foot" style="bottom:100px">underfiftyfinds.github.io</div>`,
 pin17_cheap_christmas_under10: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:60px;background:#F4EDE4;border-radius:44px"></div>
 <div style="position:relative;padding:120px 100px 0;text-align:center">
  <div class="kicker">Stocking stuffer ideas</div>
  <div class="serif" style="font-size:118px;line-height:1.03;margin-top:28px">Cheap Christmas<br>Gifts</div>
  <div class="serif" style="font-size:96px;line-height:1;margin-top:14px">under</div>
  <div class="serif" style="font-size:300px;line-height:.92;color:#B5634B">$10</div>
  <div style="font-size:44px;line-height:1.45;margin:30px auto 0;max-width:740px;color:#4A3F38">Lip balm minis, a squishy stress ball, a password logbook and other tiny gifts that still feel thoughtful</div>
  <div style="margin-top:44px"><span class="pill">See the full list</span></div>
 </div>
 <div class="foot" style="bottom:100px">underfiftyfinds.github.io</div>`,
 pin18_stocking_booklight_spotlight: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;left:0;right:0;top:0;height:22px;background:#B5634B"></div>
 <div style="position:relative;padding:130px 90px 0;color:#F4EDE4">
  <div class="kicker" style="color:#D9A08C">Stocking stuffer ideas</div>
  <div class="serif" style="font-size:108px;line-height:1.05;margin-top:30px">The stocking stuffer every reader wants</div>
  <div style="margin-top:70px;background:#3A312C;border:3px solid #B5634B;border-radius:36px;padding:60px 60px">
   <div style="font:700 60px Inter;color:#fff">Clip-on book light</div>
   <div style="font-size:40px;line-height:1.5;color:#D9CBBE;margin-top:22px">Rechargeable, warm light, clips onto any book. Read in bed without waking anyone up. Usually under $15.</div>
  </div>
  <div style="font-size:40px;color:#D9CBBE;margin-top:60px">+ 12 more stocking stuffers under $15</div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:90px">underfiftyfinds.github.io</div>`,
 pin19_teacher_quote: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:70px;border:3px solid #B5634B;border-radius:40px"></div>
 <div style="position:relative;padding:190px 120px 0;color:#F4EDE4;text-align:center">
  <div class="kicker" style="color:#D9A08C">Teacher Christmas gifts</div>
  <div class="serif" style="font-size:210px;line-height:.6;color:#B5634B;margin-top:60px">&ldquo;</div>
  <div class="serif" style="font-size:100px;line-height:1.1;margin-top:20px">Please, no<br>more mugs.</div>
  <div style="font-size:44px;line-height:1.45;margin:64px auto 0;color:#D9CBBE;max-width:740px">14 gifts teachers actually want: Flair pens, a mini label maker, a name stamp and more, all under $25</div>
  <div style="margin-top:70px"><span class="pill">See the list</span></div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:110px">underfiftyfinds.github.io</div>`,
 pin20_stocking_men_under15: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:60px;background:#F4EDE4;border-radius:44px"></div>
 <div style="position:relative;padding:120px 100px 0;text-align:center">
  <div class="kicker">For the guys</div>
  <div class="serif" style="font-size:112px;line-height:1.03;margin-top:28px">Stocking Stuffers<br>for Men</div>
  <div class="serif" style="font-size:96px;line-height:1;margin-top:14px">under</div>
  <div class="serif" style="font-size:300px;line-height:.92;color:#B5634B">$15</div>
  <div style="font-size:44px;line-height:1.45;margin:30px auto 0;max-width:740px;color:#4A3F38">A pocket screwdriver, a cuff beanie, funny food socks and more little gifts he'll actually keep</div>
  <div style="margin-top:44px"><span class="pill">See all 13 ideas</span></div>
 </div>
 <div class="foot" style="bottom:100px">underfiftyfinds.github.io</div>`,
 pin21_secret_santa_list: `
 <div style="position:absolute;left:0;right:0;top:0;height:22px;background:#2B2420"></div>
 <div style="padding:88px 80px 0">
  <div class="kicker">Gift exchange season</div>
  <div class="serif" style="font-size:112px;line-height:1.02;margin:22px 0 18px">Secret Santa<br>Gifts Under $25</div>
  <div style="font-size:40px;color:#6E625A;margin-bottom:40px">Safe picks for coworkers you barely know</div>
  <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:36px;padding:42px 56px;font-size:41px;line-height:1.75">
   ${['Candle warmer lamp','Electric drink chiller','Rechargeable luggage scale','Cozy wearable blanket','Sushi Go Party card game','Scalp massager','Classic Magic 8 Ball'].map((t,i)=>`<div><span style="color:#B5634B;font-weight:700;margin-right:22px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div style="color:#6E625A">+ 8 more inside</div>
  </div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin22_men_socks_quote: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:70px;border:3px solid #B5634B;border-radius:40px"></div>
 <div style="position:relative;padding:190px 120px 0;color:#F4EDE4;text-align:center">
  <div class="kicker" style="color:#D9A08C">Gift ideas for men</div>
  <div class="serif" style="font-size:210px;line-height:.6;color:#B5634B;margin-top:60px">&ldquo;</div>
  <div class="serif" style="font-size:100px;line-height:1.1;margin-top:20px">Just get me<br>socks or<br>something.</div>
  <div style="font-size:44px;line-height:1.45;margin:64px auto 0;color:#D9CBBE;max-width:740px">12 better ideas he'll actually use: a meat thermometer, a phone dock, a neck massager and more, all under $50</div>
  <div style="margin-top:70px"><span class="pill">See the list</span></div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:110px">underfiftyfinds.github.io</div>`,
 pin23_white_elephant_steal_list: `
 <div style="position:absolute;left:0;right:0;top:0;height:22px;background:#B5634B"></div>
 <div style="padding:88px 80px 0">
  <div class="kicker">Gift exchange season</div>
  <div class="serif" style="font-size:108px;line-height:1.02;margin:22px 0 18px">White Elephant Gift Ideas People Steal</div>
  <div style="font-size:40px;color:#6E625A;margin-bottom:40px">Funny, useful and all under $25</div>
  <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:36px;padding:42px 56px;font-size:41px;line-height:1.75">
   ${['Mini waffle maker','Giant tortilla blanket','Emoji desktop vacuum','Positive pickle light','Classic Magic 8 Ball','Tapple word game','Electric drink chiller'].map((t,i)=>`<div><span style="color:#B5634B;font-weight:700;margin-right:22px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div style="color:#6E625A">+ 8 more inside</div>
  </div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin24_stocking_nogifts_quote: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:70px;border:3px solid #B5634B;border-radius:40px"></div>
 <div style="position:relative;padding:190px 120px 0;color:#F4EDE4;text-align:center">
  <div class="kicker" style="color:#D9A08C">Stocking stuffer ideas</div>
  <div class="serif" style="font-size:210px;line-height:.6;color:#B5634B;margin-top:60px">&ldquo;</div>
  <div class="serif" style="font-size:96px;line-height:1.1;margin-top:20px">We said no gifts.<br>Stockings<br>don't count.</div>
  <div style="font-size:44px;line-height:1.45;margin:64px auto 0;color:#D9CBBE;max-width:740px">13 small gifts for adults, all under $15: a clip-on book light, grip socks, a mini screwdriver and more</div>
  <div style="margin-top:70px"><span class="pill">See the ideas</span></div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:110px">underfiftyfinds.github.io</div>`,
 pin25_stocking_women_under15: `
 <div style="position:absolute;inset:0;background:#B5634B"></div>
 <div style="position:absolute;inset:60px;background:#F4EDE4;border-radius:44px"></div>
 <div style="position:relative;padding:160px 110px 0;text-align:center">
  <div class="kicker">Stocking stuffers for women</div>
  <div class="serif" style="font-size:104px;line-height:1.05;margin-top:40px">Little luxuries<br>she'll use</div>
  <div class="serif" style="font-size:120px;line-height:1;margin-top:40px">under</div>
  <div class="serif" style="font-size:360px;line-height:.9;color:#B5634B">$15</div>
  <div style="font-size:44px;line-height:1.45;margin:40px auto 0;max-width:720px;color:#4A3F38">Grip socks, cooling eye patches, a clip-on book light and more</div>
  <div style="margin-top:60px"><span class="pill">See all 13 ideas</span></div>
 </div>
 <div class="foot" style="bottom:110px">underfiftyfinds.github.io</div>`,
 pin26_stocking_men_callout: `
 <div style="position:absolute;left:0;right:0;top:0;height:640px;background:#2B2420"></div>
 <div style="position:relative;padding:110px 80px 0;color:#F4EDE4">
  <div class="kicker" style="color:#D9A08C">Stocking stuffers for men</div>
  <div class="serif" style="font-size:108px;line-height:1.03;margin-top:24px">3 he won't<br>toss in a drawer</div>
  <div style="font-size:40px;margin-top:22px;color:#D9CBBE">All under $15, all actually useful</div>
 </div>
 <div style="position:absolute;left:80px;right:80px;top:560px">
  ${[['Mini multi-bit screwdriver','Fixes glasses, toys and remotes'],['Ribbed cuff beanie','Goes with every coat he owns'],['Funny food crew socks','Pizza or bacon socks he will wear']].map((r,i)=>`
   <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:30px;padding:38px 46px;margin-bottom:28px;display:flex;gap:34px;align-items:center">
    <div class="serif" style="font-size:84px;color:#B5634B;width:80px">${i+1}</div>
    <div><div style="font:700 44px Inter">${r[0]}</div><div style="font-size:34px;color:#6E625A;margin-top:8px">${r[1]}</div></div>
   </div>`).join('')}
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin27_cheap_christmas_callout: `
 <div style="position:absolute;left:0;right:0;top:0;height:640px;background:#B5634B"></div>
 <div style="position:relative;padding:110px 80px 0;color:#FFF6EE">
  <div class="kicker" style="color:#FFE2D6">Cheap Christmas gifts</div>
  <div class="serif" style="font-size:104px;line-height:1.03;margin-top:24px">3 that don't<br>look cheap</div>
  <div style="font-size:40px;margin-top:22px;color:#FFE2D6">Under $15 each, loved by everyone</div>
 </div>
 <div style="position:absolute;left:80px;right:80px;top:560px">
  ${[['Clip-on book light','Warm, rechargeable, for night readers'],['Chenille grip socks','Plush socks that work as slippers'],['Dutch Blitz card game','Fast, loud family game night']].map((r,i)=>`
   <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:30px;padding:38px 46px;margin-bottom:28px;display:flex;gap:34px;align-items:center">
    <div class="serif" style="font-size:84px;color:#B5634B;width:80px">${i+1}</div>
    <div><div style="font:700 44px Inter">${r[0]}</div><div style="font-size:34px;color:#6E625A;margin-top:8px">${r[1]}</div></div>
   </div>`).join('')}
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin28_white_elephant_coworkers_list: `
 <div style="position:absolute;left:0;top:0;bottom:0;width:22px;background:#B5634B"></div>
 <div style="padding:88px 80px 0 96px">
  <div class="kicker">Office gift exchange</div>
  <div class="serif" style="font-size:104px;line-height:1.02;margin:22px 0 18px">White Elephant Gifts for Coworkers</div>
  <div style="font-size:40px;color:#6E625A;margin-bottom:40px">Office-safe, actually useful, all under $25</div>
  <div style="background:#2B2420;color:#F4EDE4;border-radius:36px;padding:42px 56px;font-size:41px;line-height:1.75">
   ${['Candle warmer lamp','Electric drink chiller','Emoji desktop vacuum','Sarcastic office pens','Classic Magic 8 Ball','Rechargeable luggage scale','Shower scalp massager'].map((t,i)=>`<div><span style="color:#D9A08C;font-weight:700;margin-right:22px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div style="color:#D9CBBE">+ 8 more inside</div>
  </div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin29_mom_massager_spotlight: `
 <div style="position:absolute;left:0;right:0;bottom:0;height:22px;background:#B5634B"></div>
 <div style="position:relative;padding:130px 90px 0">
  <div class="kicker">Christmas gifts for mom</div>
  <div class="serif" style="font-size:110px;line-height:1.05;margin-top:30px">The gift she'll use every single night</div>
  <div style="margin-top:70px;background:#FFFDF9;border:3px solid #B5634B;border-radius:36px;padding:60px 60px">
   <div style="font:700 58px Inter;color:#2B2420">Heated shiatsu neck massager</div>
   <div style="font-size:40px;line-height:1.5;color:#6E625A;margin-top:22px">Kneading rollers and gentle heat for a sore neck and shoulders. The thing she'd never buy herself. Usually under $50.</div>
  </div>
  <div style="font-size:40px;color:#6E625A;margin-top:60px">+ 13 more gifts for mom under $50</div>
 </div>
 <div class="foot" style="bottom:80px">underfiftyfinds.github.io</div>`,
 pin30_dad_callout: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:relative;padding:110px 80px 0;color:#F4EDE4">
  <div class="kicker" style="color:#D9A08C">Gifts for dad under $50</div>
  <div class="serif" style="font-size:108px;line-height:1.03;margin-top:24px">3 he'll actually<br>use this winter</div>
  <div style="font-size:40px;margin-top:22px;color:#D9CBBE">For the dad who "doesn't need anything"</div>
 </div>
 <div style="position:absolute;left:80px;right:80px;top:560px">
  ${[['Indoor putting green','Golf practice in the living room'],['Smash burger kit','Press, spatula and seasoning'],['Back and shoulder heat pad','Big, warm, auto shut-off']].map((r,i)=>`
   <div style="background:#F4EDE4;border-radius:30px;padding:38px 46px;margin-bottom:28px;display:flex;gap:34px;align-items:center">
    <div class="serif" style="font-size:84px;color:#B5634B;width:80px">${i+1}</div>
    <div><div style="font:700 44px Inter;color:#2B2420">${r[0]}</div><div style="font-size:34px;color:#6E625A;margin-top:8px">${r[1]}</div></div>
   </div>`).join('')}
 </div>
 <div class="foot" style="color:#D9A08C">underfiftyfinds.github.io</div>`,
 pin31_teacher_flair_quote: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:70px;border:3px solid #B5634B;border-radius:40px"></div>
 <div style="position:relative;padding:190px 120px 0;color:#F4EDE4;text-align:center">
  <div class="kicker" style="color:#D9A08C">Teacher Christmas gifts</div>
  <div class="serif" style="font-size:210px;line-height:.6;color:#B5634B;margin-top:60px">&ldquo;</div>
  <div class="serif" style="font-size:96px;line-height:1.1;margin-top:20px">I ran out of<br>good pens<br>in October.</div>
  <div style="font-size:44px;line-height:1.45;margin:64px auto 0;color:#D9CBBE;max-width:740px">Gifts teachers actually use: Flair pens, erasable gel pens, a cozy tumbler and more, all under $25</div>
  <div style="margin-top:70px"><span class="pill">See all 14</span></div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:110px">underfiftyfinds.github.io</div>`,
 pin32_stocking_ideas_callout: `
 <div style="position:absolute;left:0;right:0;top:0;height:640px;background:#B5634B"></div>
 <div style="position:relative;padding:110px 80px 0;color:#FFF6EE">
  <div class="kicker" style="color:#FFE2D6">Stocking stuffer ideas</div>
  <div class="serif" style="font-size:106px;line-height:1.03;margin-top:24px">3 small gifts<br>everyone opens first</div>
  <div style="font-size:40px;margin-top:22px;color:#FFE2D6">All under $15, none end up in a drawer</div>
 </div>
 <div style="position:absolute;left:80px;right:80px;top:600px">
  ${[['Cooling under-eye patches','A tiny spa moment for tired eyes'],['Weekly planner notepad','Tear-off pages for the list makers'],['Funny food crew socks','The laugh-out-loud stocking pull']].map((r,i)=>`
   <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:30px;padding:38px 46px;margin-bottom:28px;display:flex;gap:34px;align-items:center">
    <div class="serif" style="font-size:84px;color:#B5634B;width:80px">${i+1}</div>
    <div><div style="font:700 44px Inter">${r[0]}</div><div style="font-size:34px;color:#6E625A;margin-top:8px">${r[1]}</div></div>
   </div>`).join('')}
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin33_stocking_adults_under15: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:60px;background:#F4EDE4;border-radius:44px"></div>
 <div style="position:relative;padding:120px 100px 0;text-align:center">
  <div class="kicker">Grown-up stockings</div>
  <div class="serif" style="font-size:112px;line-height:1.03;margin-top:28px">Stocking Stuffers<br>for Adults</div>
  <div class="serif" style="font-size:96px;line-height:1;margin-top:14px">under</div>
  <div class="serif" style="font-size:300px;line-height:.92;color:#B5634B">$15</div>
  <div style="font-size:44px;line-height:1.45;margin:30px auto 0;max-width:740px;color:#4A3F38">Book lights, sheet masks, a fast card game and more little gifts grown-ups actually use</div>
  <div style="margin-top:44px"><span class="pill">See all 13 ideas</span></div>
 </div>
 <div class="foot" style="bottom:100px">underfiftyfinds.github.io</div>`,
 pin34_stocking_family_list: `
 <div style="position:absolute;left:0;top:0;bottom:0;width:22px;background:#B5634B"></div>
 <div style="padding:88px 80px 0 96px">
  <div class="kicker">Fill every stocking</div>
  <div class="serif" style="font-size:104px;line-height:1.02;margin:22px 0 18px">Stocking Stuffer Ideas for the Whole Family</div>
  <div style="font-size:40px;color:#6E625A;margin-bottom:40px">13 small gifts, all under $15</div>
  <div style="background:#2B2420;color:#F4EDE4;border-radius:36px;padding:42px 56px;font-size:41px;line-height:1.75">
   ${['Dutch Blitz card game','Clip-on book light','Squishy stress ball','Sheet mask variety pack','Ribbed cuff beanie','Password logbook','Pickle birthday candles'].map((t,i)=>`<div><span style="color:#D9A08C;font-weight:700;margin-right:22px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div style="color:#D9CBBE">+ 6 more inside</div>
  </div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin35_mom_robe_quote: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:70px;border:3px solid #B5634B;border-radius:40px"></div>
 <div style="position:relative;padding:190px 120px 0;color:#F4EDE4;text-align:center">
  <div class="kicker" style="color:#D9A08C">Christmas gifts for mom</div>
  <div class="serif" style="font-size:210px;line-height:.6;color:#B5634B;margin-top:60px">&ldquo;</div>
  <div class="serif" style="font-size:92px;line-height:1.1;margin-top:20px">Don't get me<br>anything.<br><span style="color:#D9A08C">...okay, maybe<br>a cozy robe.</span></div>
  <div style="font-size:44px;line-height:1.45;margin:56px auto 0;color:#D9CBBE;max-width:740px">14 gifts for mom she'd never buy herself, all under $50</div>
  <div style="margin-top:60px"><span class="pill">See the list</span></div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:110px">underfiftyfinds.github.io</div>`,
 pin36_stocking_dutchblitz_spotlight: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;left:0;right:0;top:0;height:22px;background:#B5634B"></div>
 <div style="position:relative;padding:130px 90px 0;color:#F4EDE4">
  <div class="kicker" style="color:#D9A08C">Stocking stuffer ideas</div>
  <div class="serif" style="font-size:90px;line-height:1.05;margin-top:30px">The one the whole family plays on Christmas morning</div>
  <div style="margin-top:50px;background:#3A312C;border:3px solid #B5634B;border-radius:36px;padding:60px 60px">
   <div style="font:700 60px Inter;color:#fff">Dutch Blitz card game</div>
   <div style="font-size:40px;line-height:1.5;color:#D9CBBE;margin-top:22px">Fast, loud, easy to learn, and small enough for the stocking toe. Kids and grandparents both get hooked. Usually under $15.</div>
  </div>
  <div style="font-size:40px;color:#D9CBBE;margin-top:56px">+ 12 more stocking stuffers under $15</div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:90px">underfiftyfinds.github.io</div>`,
 pin37_mom_quietnight_quote: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:70px;border:3px solid #B5634B;border-radius:40px"></div>
 <div style="position:relative;padding:190px 120px 0;color:#F4EDE4;text-align:center">
  <div class="kicker" style="color:#D9A08C">Gifts for mom</div>
  <div class="serif" style="font-size:210px;line-height:.6;color:#B5634B;margin-top:60px">&ldquo;</div>
  <div class="serif" style="font-size:96px;line-height:1.1;margin-top:20px">All I want is<br>one quiet night<br><span style="color:#D9A08C">to myself.</span></div>
  <div style="font-size:44px;line-height:1.45;margin:60px auto 0;color:#D9CBBE;max-width:740px">Spa robe, shower steamers, a weighted sleep mask: gifts for mom under $50 that make it happen</div>
  <div style="margin-top:56px"><span class="pill">See the list</span></div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:110px">underfiftyfinds.github.io</div>`,
 pin38_christmas_mom_under50: `
 <div style="position:absolute;inset:0;background:#B5634B"></div>
 <div style="position:absolute;inset:60px;background:#F4EDE4;border-radius:44px"></div>
 <div style="position:relative;padding:130px 100px 0;text-align:center">
  <div class="kicker">She'd never buy these herself</div>
  <div class="serif" style="font-size:116px;line-height:1.03;margin-top:30px">Christmas Gifts<br>for Mom</div>
  <div class="serif" style="font-size:96px;line-height:1;margin-top:14px">under</div>
  <div class="serif" style="font-size:300px;line-height:.92;color:#B5634B">$50</div>
  <div style="font-size:44px;line-height:1.45;margin:30px auto 0;max-width:740px;color:#4A3F38">Heated massager, LEGO flowers, a tea sampler and 11 more she'll actually use</div>
  <div style="margin-top:44px"><span class="pill">See all 14 gifts</span></div>
 </div>
 <div class="foot" style="bottom:100px">underfiftyfinds.github.io</div>`,
 pin39_men_haseverything_callout: `
 <div style="position:absolute;left:0;right:0;top:0;height:640px;background:#2B2420"></div>
 <div style="position:relative;padding:110px 80px 0;color:#F4EDE4">
  <div class="kicker" style="color:#D9A08C">Gifts for men who have everything</div>
  <div class="serif" style="font-size:104px;line-height:1.03;margin-top:24px">3 he still<br>doesn't have</div>
  <div style="font-size:40px;margin-top:22px;color:#D9A08C">All under $50, none of them socks</div>
 </div>
 <div style="position:absolute;left:80px;right:80px;top:580px">
  ${[['Shiatsu neck massager','Heated knots-be-gone after long days'],['Moon lamp','A cool desk light he would never buy'],['Wood phone docking station','Keys, wallet, watch, phone: one spot']].map((r,i)=>`
   <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:30px;padding:38px 46px;margin-bottom:28px;display:flex;gap:34px;align-items:center">
    <div class="serif" style="font-size:84px;color:#B5634B;width:80px">${i+1}</div>
    <div><div style="font:700 44px Inter">${r[0]}</div><div style="font-size:34px;color:#6E625A;margin-top:8px">${r[1]}</div></div>
   </div>`).join('')}
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin40_stocking_teens_under15: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:60px;background:#F4EDE4;border-radius:44px"></div>
 <div style="position:relative;padding:120px 100px 0;text-align:center">
  <div class="kicker">They're too cool for candy canes</div>
  <div class="serif" style="font-size:112px;line-height:1.03;margin-top:28px">Stocking Stuffers<br>for Teens</div>
  <div class="serif" style="font-size:96px;line-height:1;margin-top:14px">under</div>
  <div class="serif" style="font-size:300px;line-height:.92;color:#B5634B">$15</div>
  <div style="font-size:44px;line-height:1.45;margin:30px auto 0;max-width:740px;color:#4A3F38">Funny socks, a cuff beanie, a clip-on book light and more they won't roll their eyes at</div>
  <div style="margin-top:44px"><span class="pill">See all 13 ideas</span></div>
 </div>
 <div class="foot" style="bottom:100px">underfiftyfinds.github.io</div>`,
 pin41_mom_haseverything_under50: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:60px;background:#F4EDE4;border-radius:44px"></div>
 <div style="position:relative;padding:200px 100px 0;text-align:center">
  <div class="kicker">She says she has it all</div>
  <div class="serif" style="font-size:104px;line-height:1.04;margin-top:30px">Gifts for Mom<br>Who Has<br>Everything</div>
  <div class="serif" style="font-size:90px;line-height:1;margin-top:14px">under <span style="color:#B5634B">$50</span></div>
  <div style="width:140px;height:6px;background:#B5634B;margin:56px auto 0;border-radius:3px"></div>
  <div style="font-size:44px;line-height:1.45;margin:50px auto 0;max-width:760px;color:#4A3F38">LEGO flowers, a heated massager, a spa robe and more she'd never buy herself</div>
  <div style="margin-top:56px"><span class="pill">See all 14 gifts</span></div>
 </div>
 <div class="foot" style="bottom:100px">underfiftyfinds.github.io</div>`,
 pin42_whiteelephant_waffle_quote: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:70px;border:3px solid #B5634B;border-radius:40px"></div>
 <div style="position:relative;padding:220px 120px 0;color:#F4EDE4;text-align:center">
  <div class="serif" style="font-size:210px;line-height:.6;color:#B5634B">&ldquo;</div>
  <div class="serif" style="font-size:100px;line-height:1.1;margin-top:20px">Wait,<br>who stole the<br>waffle maker?</div>
  <div style="font-size:44px;line-height:1.45;margin:70px auto 0;color:#D9CBBE;max-width:720px">White elephant gift ideas under $25 that everyone fights over</div>
  <div style="margin-top:80px"><span class="pill">See all 15 ideas</span></div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:110px">underfiftyfinds.github.io</div>`,
 pin43_christmas_dad_under50: `
 <div style="position:absolute;left:0;right:0;top:0;height:860px;background:#B5634B"></div>
 <div style="position:relative;padding:130px 90px 0;color:#FFF6EE;text-align:center">
  <div class="kicker" style="color:#FFE2D6">Dad-approved, all under budget</div>
  <div class="serif" style="font-size:120px;line-height:1.03;margin-top:30px">Christmas Gifts<br>for Dad</div>
  <div class="serif" style="font-size:96px;line-height:1;margin-top:18px">under $50</div>
 </div>
 <div style="position:absolute;left:90px;right:90px;top:780px;background:#FFFDF9;border:2px solid #E4D8CB;border-radius:36px;padding:56px 60px;text-align:center">
  <div style="font-size:46px;line-height:1.5;color:#2B2420">Indoor putting green<br>Smash burger kit<br>Heating pad<br>Leather sling bag</div>
  <div style="font-size:38px;color:#6E625A;margin-top:24px">+ 9 more he'll actually use</div>
  <div style="margin-top:40px"><span class="pill">See all 13 gifts</span></div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin44_stocking_mom_under25: `
 <div style="position:absolute;inset:0;background:#B5634B"></div>
 <div style="position:absolute;inset:60px;background:#F4EDE4;border-radius:44px"></div>
 <div style="position:relative;padding:130px 100px 0;text-align:center">
  <div class="kicker">Little luxuries she'll use daily</div>
  <div class="serif" style="font-size:112px;line-height:1.03;margin-top:30px">Stocking Stuffers<br>for Mom</div>
  <div class="serif" style="font-size:96px;line-height:1;margin-top:14px">under</div>
  <div class="serif" style="font-size:300px;line-height:.92;color:#B5634B">$25</div>
  <div style="font-size:44px;line-height:1.45;margin:30px auto 0;max-width:760px;color:#4A3F38">Satin pillowcase, shower steamers, a lip mask, a tea sampler and more</div>
  <div style="margin-top:44px"><span class="pill">See the full list</span></div>
 </div>
 <div class="foot" style="bottom:100px">underfiftyfinds.github.io</div>`,
 pin45_funny_whiteelephant_under25: `
 <div style="position:absolute;left:0;right:0;top:0;height:22px;background:#B5634B"></div>
 <div style="padding:120px 90px 0;text-align:center">
  <div class="kicker">Laughs first, then it gets stolen</div>
  <div class="serif" style="font-size:124px;line-height:1.02;margin-top:30px">Funny<br>White Elephant<br>Gifts</div>
  <div class="serif" style="font-size:96px;line-height:1;margin-top:20px">under <span style="color:#B5634B">$25</span></div>
  <div style="display:flex;flex-wrap:wrap;gap:22px;justify-content:center;margin:70px auto 0;max-width:820px">
   ${['Giant tortilla blanket','Pickle squishy light','Magic 8 Ball','Emoji desk vacuum','Sarcastic pen set'].map(t=>`<span style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:999px;padding:18px 34px;font:600 36px Inter">${t}</span>`).join('')}
  </div>
  <div style="margin-top:70px"><span class="pill">See all 15 ideas</span></div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin46_stocking_teaser_no7: `
 <div style="position:absolute;left:0;right:0;top:0;height:22px;background:#B5634B"></div>
 <div style="padding:96px 80px 0">
  <div class="kicker">Stocking stuffers under $15</div>
  <div class="serif" style="font-size:88px;line-height:1.04;margin:22px 0 10px">13 stocking stuffers.<br><span style="color:#B5634B">#7</span> is the one everyone asks about.</div>
  <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:36px;padding:36px 56px;font-size:40px;line-height:1.75;margin-top:30px">
   ${['Chenille cozy socks','Ribbed cuff beanie','Funny food socks'].map((t,i)=>`<div><span style="color:#B5634B;font-weight:700;display:inline-block;width:76px">0${i+1}</span>${t}</div>`).join('')}
   ${[4,5,6,7].map(n=>`<div style="display:flex;align-items:center"><span style="color:#B5634B;font-weight:700;display:inline-block;width:76px">0${n}</span><span style="display:inline-block;height:30px;width:${n==7?420:300+n*20}px;border-radius:15px;background:${n==7?'#E9C9BC':'#E9E0D6'}"></span>${n==7?'<span style="margin-left:22px;font:700 30px Inter;color:#B5634B">?</span>':''}</div>`).join('')}
   <div style="color:#6E625A;margin-top:8px">+ 6 more inside</div>
  </div>
  <div style="text-align:center;margin-top:40px"><span class="pill">Reveal the full list</span></div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin47_cheap_stocking_3under10: `
 <div style="position:absolute;inset:0;background:#B5634B"></div>
 <div style="position:relative;padding:110px 80px 0;color:#FFF6EE;text-align:center">
  <div class="kicker" style="color:#FFE2D6">Cheap stocking stuffers</div>
  <div class="serif" style="font-size:112px;line-height:1.03;margin-top:26px">3 under $10<br>nobody will guess<br>were cheap</div>
 </div>
 <div style="position:absolute;left:80px;right:80px;top:700px">
  ${[['Lip balm holiday minis','A little set that looks like a splurge'],['Password logbook','The gift your parents will actually use'],['Pickle birthday candles','A laugh at every birthday next year']].map((r,i)=>`
   <div style="background:#FFFDF9;border-radius:30px;padding:36px 46px;margin-bottom:26px">
    <div style="font:700 44px Inter">${r[0]}</div><div style="font-size:34px;color:#6E625A;margin-top:8px">${r[1]}</div>
   </div>`).join('')}
 </div>
 <div class="foot" style="color:#FFE2D6">underfiftyfinds.github.io</div>`,
 pin48_dad_putting_spotlight: `
 <div style="padding:120px 90px 0;text-align:center">
  <div class="kicker">Christmas gifts for dad</div>
  <div class="serif" style="font-size:108px;line-height:1.04;margin-top:30px">The gift he'll<br>play with all<br>Christmas Day</div>
  <div style="margin:80px auto 0;background:#FFFDF9;border:2px solid #E4D8CB;border-radius:40px;padding:70px 60px;max-width:820px">
   <div style="width:520px;height:46px;margin:0 auto 46px;border-radius:23px;background:#7E9A6B;position:relative"><span style="position:absolute;right:30px;top:8px;width:30px;height:30px;border-radius:50%;background:#2B2420"></span><span style="position:absolute;left:40px;top:11px;width:24px;height:24px;border-radius:50%;background:#fff"></span></div>
   <div class="serif" style="font-size:66px">Indoor putting green</div>
   <div style="font-size:38px;color:#6E625A;margin-top:18px;line-height:1.4">Rolls out in the living room or office. Under $50.</div>
  </div>
  <div style="margin-top:70px"><span class="pill">12 more gifts for dad</span></div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin49_mom_pillowcase_spotlight: `
 <div style="position:absolute;left:0;right:0;top:0;height:560px;background:#2B2420"></div>
 <div style="position:relative;padding:120px 90px 0;color:#F4EDE4;text-align:center">
  <div class="kicker" style="color:#D9A08C">Gifts for mom</div>
  <div class="serif" style="font-size:100px;line-height:1.05;margin-top:28px">She'll thank you<br>every morning</div>
 </div>
 <div style="position:absolute;left:90px;right:90px;top:500px;background:#FFFDF9;border:2px solid #E4D8CB;border-radius:40px;padding:80px 60px;text-align:center">
  <div class="serif" style="font-size:72px">Satin pillowcase</div>
  <div style="font-size:40px;color:#6E625A;margin-top:24px;line-height:1.45">Softer on hair and skin, feels like a hotel. Usually under $25.</div>
  <div style="height:2px;background:#E4D8CB;margin:56px 0"></div>
  <div style="font-size:36px;color:#2B2420">Plus a spa robe, weighted sleep mask and 11 more under $50</div>
 </div>
 <div style="position:absolute;left:0;right:0;bottom:170px;text-align:center"><span class="pill">See the gifts for mom</span></div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin50_useful_whiteelephant_list: `
 <div style="padding:96px 80px 0">
  <div class="kicker">White elephant gift ideas</div>
  <div class="serif" style="font-size:100px;line-height:1.04;margin:24px 0 18px">Useful gifts they'll be glad to take home</div>
  <div style="font-size:40px;color:#6E625A;margin-bottom:44px">All under $25, no gag gifts</div>
  <div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:36px;padding:44px 56px;font-size:42px;line-height:1.85">
   ${['Mini waffle maker','Candle warmer lamp','Electric beverage chiller','Rechargeable luggage scale','Wearable cozy blanket','Scalp massager','Freezer soup cubes'].map((t,i)=>`<div><span style="color:#B5634B;font-weight:700;display:inline-block;width:76px">0${i+1}</span>${t}</div>`).join('')}
  </div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin51_stocking_teaser_nobody_buys: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;left:0;right:0;top:0;height:22px;background:#B5634B"></div>
 <div style="position:relative;padding:130px 90px 0;color:#F4EDE4;text-align:center">
  <div class="kicker" style="color:#D9A08C">Stocking stuffer ideas</div>
  <div class="serif" style="font-size:96px;line-height:1.06;margin-top:30px">The stocking stuffer nobody thinks to buy</div>
  <div style="font-size:44px;color:#D9CBBE;margin-top:26px">(but everyone ends up needing)</div>
  <div style="margin:70px auto 0;background:#3A312C;border:3px dashed #B5634B;border-radius:36px;padding:64px 60px">
   <div class="serif" style="font-size:150px;line-height:1;color:#B5634B">?</div>
   <div style="display:flex;justify-content:center;gap:16px;margin-top:30px">${[220,160,240].map(w=>`<span style="display:inline-block;height:34px;width:${w}px;border-radius:17px;background:#5A4C44"></span>`).join('')}</div>
   <div style="font-size:38px;line-height:1.5;color:#D9CBBE;margin-top:40px">Hint: it's under $10 and fixes a problem they have every single week</div>
  </div>
  <div style="margin-top:70px"><span class="pill">Find out what it is</span></div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:80px">underfiftyfinds.github.io</div>`,
 pin52_stocking_whos_who: `
 <div style="padding:80px 80px 0">
  <div class="kicker">Stocking stuffers under $15</div>
  <div class="serif" style="font-size:96px;line-height:1.03;margin:18px 0 12px">One for everyone<br>on your list</div>
  <div style="font-size:40px;color:#6E625A;margin-bottom:34px">Small gifts under $15 that get used</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
   ${[['For her','Chenille grip socks'],['For him','Mini screwdriver set'],['For teens','Sheet mask pack'],['For readers','Clip-on book light'],['For laughs','Pickle birthday candles'],['For game night','Dutch Blitz cards']].map(r=>`<div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:30px;padding:28px 32px;min-height:168px"><div style="font:700 28px Inter;letter-spacing:.14em;text-transform:uppercase;color:#B5634B">${r[0]}</div><div class="serif" style="font-size:44px;line-height:1.12;margin-top:10px">${r[1]}</div></div>`).join('')}
  </div>
  <div style="text-align:center;margin-top:34px"><span class="pill">See all 13 ideas</span></div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin53_secretsanta_frother_spotlight: `
 <div style="position:absolute;left:0;right:0;top:0;height:600px;background:#B5634B"></div>
 <div style="position:relative;padding:120px 90px 0;color:#FFF6EE;text-align:center">
  <div class="kicker" style="color:#FFE2D6">Secret Santa gifts for coworkers</div>
  <div class="serif" style="font-size:100px;line-height:1.05;margin-top:28px">The one everyone<br>tries to steal</div>
 </div>
 <div style="position:absolute;left:90px;right:90px;top:540px;background:#FFFDF9;border:2px solid #E4D8CB;border-radius:40px;padding:80px 60px;text-align:center">
  <div class="serif" style="font-size:76px">Handheld milk frother</div>
  <div style="font-size:40px;color:#6E625A;margin-top:24px;line-height:1.45">Turns sad office coffee into a latte in 20 seconds. Usually under $15.</div>
  <div style="height:2px;background:#E4D8CB;margin:56px 0"></div>
  <div style="font-size:36px;color:#2B2420">Plus 12 more coworker gifts under $25 that don't feel generic</div>
 </div>
 <div style="position:absolute;left:0;right:0;bottom:170px;text-align:center"><span class="pill">See the full list</span></div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin54_coworker_quote: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:absolute;inset:70px;border:3px solid #B5634B;border-radius:40px"></div>
 <div style="position:relative;padding:200px 120px 0;color:#F4EDE4;text-align:center">
  <div class="serif" style="font-size:210px;line-height:.6;color:#B5634B">&ldquo;</div>
  <div class="serif" style="font-size:88px;line-height:1.12;margin-top:20px">You drew<br>the new guy<br>from accounting.</div>
  <div style="font-size:44px;line-height:1.45;margin:70px auto 0;color:#D9CBBE;max-width:720px">Christmas gifts for coworkers you barely know, all under $25</div>
  <div style="margin-top:80px"><span class="pill">See the safe bets</span></div>
 </div>
 <div class="foot" style="color:#D9A08C;bottom:110px">underfiftyfinds.github.io</div>`,
 pin55_giftbasket_headline: `
 <div style="position:absolute;inset:0;background:#B5634B"></div>
 <div style="position:absolute;inset:60px;background:#F4EDE4;border-radius:44px"></div>
 <div style="position:relative;padding:150px 120px 0;text-align:center">
  <div class="kicker">Christmas gift basket ideas</div>
  <div class="serif" style="font-size:118px;line-height:1;margin-top:34px">4 DIY baskets</div>
  <div class="serif" style="font-size:118px;line-height:1;color:#B5634B">under $50</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:64px;text-align:left">
   ${[['Cozy night in','Throw, socks, candle'],['Movie night','Popcorn, seasoning, a game'],['Coffee lover','Travel mug, syrups, biscotti'],['Spa night','Bath bombs, masks, sleep mask']].map(r=>`<div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:28px;padding:34px 34px"><div class="serif" style="font-size:48px">${r[0]}</div><div style="font-size:32px;color:#6E625A;margin-top:10px;line-height:1.35">${r[1]}</div></div>`).join('')}
  </div>
  <div style="margin-top:60px"><span class="pill">Get the filler lists</span></div>
 </div>
 <div class="foot" style="bottom:110px">underfiftyfinds.github.io</div>`,
 pin56_her_headline: `
 <div style="position:absolute;left:0;right:0;top:0;height:22px;background:#B5634B"></div>
 <div style="padding:120px 90px 0;text-align:center">
  <div class="kicker">Gifts for girlfriend</div>
  <div class="serif" style="font-size:150px;line-height:.98;margin-top:40px">Gifts<br>for Her</div>
  <div class="serif" style="font-size:150px;line-height:1;color:#B5634B">under $50</div>
  <div style="font-size:44px;line-height:1.4;color:#6E625A;margin:46px auto 0;max-width:760px">Little luxuries she'd never buy herself (but uses every day)</div>
  <div style="margin:70px auto 0;display:flex;flex-wrap:wrap;gap:18px;justify-content:center;max-width:820px">
   ${['Lip mask','Satin pillowcase','Initial necklace','Chunky scarf','Belt bag','Wood wick candle'].map(t=>`<span style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:999px;padding:16px 30px;font:600 34px Inter">${t}</span>`).join('')}
  </div>
  <div style="margin-top:70px"><span class="pill">See all 14</span></div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin57_her_teaser: `
 <div style="padding:100px 80px 0">
  <div class="kicker">Gift ideas for women</div>
  <div class="serif" style="font-size:96px;line-height:1.05;margin-top:26px">14 gifts for her under $50.</div>
  <div class="serif" style="font-size:72px;line-height:1.12;margin-top:20px;color:#B5634B">#6 is the one she'll wear every day until March.</div>
  <div style="margin-top:56px;background:#FFFDF9;border:2px solid #E4D8CB;border-radius:36px;padding:40px 52px;font-size:42px;line-height:1.85">
   ${['Overnight lip sleeping mask','Satin pillowcase set','Contoured sleep mask'].map((t,i)=>`<div><span style="color:#B5634B;font-weight:700;display:inline-block;width:76px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   ${['04','05','06','07'].map(n=>`<div style="color:#C9BBAE"><span style="font-weight:700;display:inline-block;width:76px">${n}</span><span style="display:inline-block;width:${n==='06'?520:380}px;height:30px;border-radius:15px;background:${n==='06'?'#E9C9BC':'#EDE3D8'};vertical-align:middle"></span></div>`).join('')}
   <div style="color:#6E625A;font-weight:600">+ 7 more inside</div>
  </div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin58_giftbasket_list: `
 <div style="position:absolute;inset:0;background:#2B2420"></div>
 <div style="position:relative;padding:100px 80px 0;color:#F4EDE4">
  <div class="kicker" style="color:#E3A48E">Christmas gift basket ideas</div>
  <div class="serif" style="font-size:104px;line-height:1.03;margin-top:24px">Fill a gift basket<br>for under $50</div>
  <div style="font-size:40px;color:#D9CBBE;margin-top:22px">The fillers that make it look expensive</div>
  <div style="margin-top:48px;background:#3A312C;border:2px solid #5A4B42;border-radius:36px;padding:44px 54px;font-size:41px;line-height:1.8">
   ${['Woven basket with handles','Crinkle paper shred','Plaid fleece throw','Fuzzy socks multipack','Soy candle in a jar','Popcorn seasoning set','Bath bomb gift set','Satin sleep mask'].map((t,i)=>`<div><span style="color:#E3A48E;font-weight:700;display:inline-block;width:70px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div style="color:#BFAFA2">+ 6 more, sorted into 4 baskets</div>
  </div>
 </div>
 <div class="foot" style="color:#E3A48E">underfiftyfinds.github.io</div>`,
 pin59_stocking_teaser_stolen: `
 <div style="position:absolute;inset:0;background:#B5634B"></div>
 <div style="position:relative;padding:130px 90px 0;color:#FFF6EE;text-align:center">
  <div class="kicker" style="color:#FFE2D6">Cheap stocking stuffers</div>
  <div class="serif" style="font-size:104px;line-height:1.05;margin-top:34px">The stocking stuffer that gets "borrowed" by noon</div>
  <div style="margin:70px auto 0;width:420px;height:420px;border-radius:50%;background:#F4EDE4;display:flex;align-items:center;justify-content:center"><div class="serif" style="font-size:300px;color:#B5634B;line-height:1">?</div></div>
  <div style="font-size:42px;line-height:1.4;margin:60px auto 0;max-width:760px;color:#FFE2D6">Under $15. Fits in any stocking. Everyone at the table wants one.</div>
 </div>
 <div class="foot" style="color:#FFE2D6;bottom:80px">See it at underfiftyfinds.github.io</div>`,
 pin60_stocking_zero_filler: `
 <div style="padding:110px 80px 0">
  <div class="kicker">Stocking stuffer ideas</div>
  <div class="serif" style="font-size:124px;line-height:1;margin-top:28px">Under $15.</div>
  <div class="serif" style="font-size:124px;line-height:1;color:#B5634B">Zero filler.</div>
  <div style="font-size:42px;color:#6E625A;margin-top:30px;line-height:1.4">13 small gifts people actually keep</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:56px">
   ${[['For the cold','Grip socks, cuff beanie'],['For self-care','Lip minis, eye patches'],['For the desk','Book light, planner pad'],['For laughs','Card game, pickle candles']].map(r=>`<div style="background:#FFFDF9;border:2px solid #E4D8CB;border-radius:28px;padding:34px"><div style="font:700 40px Inter">${r[0]}</div><div style="font-size:33px;color:#6E625A;margin-top:10px">${r[1]}</div></div>`).join('')}
  </div>
 </div>
 <div class="foot">underfiftyfinds.github.io</div>`,
 pin61_dad_quote_red: `
 <div style="position:absolute;inset:0;background:#B3202A"></div>
 <div style="position:absolute;inset:60px;border:4px solid #F2C14E;border-radius:40px"></div>
 <div style="position:relative;padding:170px 120px 0;color:#FFF7EE;text-align:center">
  <div class="kicker" style="color:#F2C14E">Christmas gifts for dad</div>
  <div class="serif" style="font-size:220px;line-height:.6;color:#F2C14E;margin-top:50px">&ldquo;</div>
  <div class="serif" style="font-size:104px;line-height:1.08;margin-top:10px">Don't spend<br>money on me.</div>
  <div style="font-size:46px;line-height:1.4;margin:60px auto 0;color:#FFF7EE;max-width:740px">13 gifts for dad under $50 he'll actually use (and won't return)</div>
  <div style="font-size:42px;margin-top:40px;color:#F2C14E;font-weight:600">Putting green, burger kit + 11 more</div>
  <div style="margin-top:60px"><span class="pill" style="background:#F2C14E;color:#B3202A;font-size:42px">Tap for the full list + links</span></div>
 </div>
 <div class="foot" style="color:#FFF7EE;bottom:96px;font-size:30px">underfiftyfinds.github.io</div>`,
 pin62_mom_teaser_pink: `
 <div style="position:absolute;inset:0;background:#F7C6D4"></div>
 <div style="position:relative;padding:100px 80px 0;color:#3A1020">
  <div class="kicker" style="color:#D6234A">Gifts for mom</div>
  <div class="serif" style="font-size:100px;line-height:1.04;margin-top:26px">14 gifts for mom under $50.</div>
  <div class="serif" style="font-size:70px;line-height:1.12;margin-top:22px;color:#D6234A">#3 is the one she'll live in all winter.</div>
  <div style="margin-top:56px;background:#FFE4EC;border-radius:36px;padding:42px 52px;font-size:44px;line-height:1.85">
   ${['Heated neck massager','Satin pillowcase'].map((t,i)=>`<div><span style="color:#D6234A;font-weight:700;display:inline-block;width:80px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   ${['03','04'].map(n=>`<div><span style="color:#D6234A;font-weight:700;display:inline-block;width:80px">${n}</span><span style="display:inline-block;width:${n==='03'?540:400}px;height:32px;border-radius:16px;background:${n==='03'?'#D6234A':'#F2A9BD'};opacity:${n==='03'?0.55:1};vertical-align:middle"></span></div>`).join('')}
   <div style="color:#3A1020;font-weight:700;font-size:42px">+ 10 more on the list</div>
  </div>
  <div style="margin-top:56px;text-align:center"><span class="pill" style="background:#D6234A;color:#F7C6D4;font-size:42px">See what #3 is</span></div>
 </div>
 <div class="foot" style="color:#3A1020;bottom:60px;font-size:30px">underfiftyfinds.github.io</div>`,
 pin63_dad_teaser_pink: `
 <div style="position:absolute;inset:0;background:#F7C6D4"></div>
 <div style="position:relative;padding:120px 90px 0;color:#3A1020;text-align:center">
  <div class="kicker" style="color:#D6234A">Gifts for dad under $50</div>
  <div class="serif" style="font-size:104px;line-height:1.05;margin-top:30px">13 gifts for dad.</div>
  <div class="serif" style="font-size:76px;line-height:1.12;margin-top:22px;color:#D6234A">The #1 pick keeps him busy all winter (indoors).</div>
  <div style="margin:64px auto 0;width:380px;height:380px;border-radius:50%;background:#FFE4EC;display:flex;align-items:center;justify-content:center"><div class="serif" style="font-size:250px;color:#D6234A;line-height:1">#1</div></div>
  <div style="font-size:44px;line-height:1.4;margin:50px auto 0;max-width:760px;font-weight:600">+ 12 more he'll actually use</div>
  <div style="margin-top:46px"><span class="pill" style="background:#D6234A;color:#F7C6D4;font-size:42px">Tap to see all 13</span></div>
 </div>
 <div class="foot" style="color:#3A1020;bottom:60px;font-size:30px">underfiftyfinds.github.io</div>`,
 pin64_stocking_teaser_navy: `
 <div style="position:absolute;inset:0;background:#14213D"></div>
 <div style="position:relative;padding:100px 80px 0;color:#FFFFFF">
  <div class="kicker" style="color:#FCA311">Stocking stuffers under $15</div>
  <div class="serif" style="font-size:98px;line-height:1.04;margin-top:26px">13 stocking stuffers under $15.</div>
  <div class="serif" style="font-size:68px;line-height:1.14;margin-top:22px;color:#FCA311">#9 sounds silly. They'll use it every week.</div>
  <div style="margin-top:52px;background:#1E2F55;border-radius:36px;padding:42px 52px;font-size:44px;line-height:1.85">
   ${['Chenille grip socks','Clip-on book light','Dutch Blitz card game'].map((t,i)=>`<div><span style="color:#FCA311;font-weight:700;display:inline-block;width:80px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div><span style="color:#FCA311;font-weight:700;display:inline-block;width:80px">09</span><span style="display:inline-block;width:500px;height:32px;border-radius:16px;background:#FCA311;opacity:.5;vertical-align:middle"></span></div>
   <div style="color:#FFFFFF;font-weight:700;font-size:42px">+ 9 more on the list</div>
  </div>
  <div style="margin-top:54px;text-align:center"><span class="pill" style="background:#FCA311;color:#14213D;font-size:42px">Tap to see #9</span></div>
 </div>
 <div class="foot" style="color:#FFFFFF;bottom:60px;font-size:30px">underfiftyfinds.github.io</div>`,
 pin65_stocking_cheap_white: `
 <div style="position:absolute;inset:0;background:#FFFFFF"></div>
 <div style="position:absolute;left:0;right:0;top:0;height:26px;background:#E63946"></div>
 <div style="position:relative;padding:100px 80px 0;color:#111111">
  <div class="kicker" style="color:#E63946">Cheap stocking stuffers</div>
  <div class="serif" style="font-size:104px;line-height:1.03;margin-top:24px">13 Cheap Stocking Stuffers</div>
  <div style="font:600 46px Inter;margin-top:22px;color:#111111">(that won't end up in a drawer)</div>
  <div style="margin-top:52px;background:#F3F3F3;border-radius:36px;padding:44px 54px;font-size:44px;line-height:1.8">
   ${['Rechargeable book light','Mini multi-bit screwdriver','Cooling under-eye patches','Pickle birthday candles'].map((t,i)=>`<div><span style="color:#E63946;font-weight:700;display:inline-block;width:80px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div style="color:#E63946;font-weight:700;font-size:42px">+ 9 more, all under $15</div>
  </div>
  <div style="margin-top:60px;text-align:center"><span class="pill" style="background:#E63946;color:#FFFFFF;font-size:42px">Full list + Amazon links</span></div>
 </div>
 <div class="foot" style="color:#111111;bottom:60px;font-size:30px">underfiftyfinds.github.io</div>`,
 pin66_grandma_quote_white: `
 <div style="position:absolute;inset:0;background:#FFFFFF"></div>
 <div style="position:absolute;inset:60px;border:4px solid #E63946;border-radius:40px"></div>
 <div style="position:relative;padding:170px 120px 0;color:#111111;text-align:center">
  <div class="kicker" style="color:#E63946">Gifts for grandma</div>
  <div class="serif" style="font-size:200px;line-height:.6;color:#E63946;margin-top:50px">&ldquo;</div>
  <div class="serif" style="font-size:104px;line-height:1.08;margin-top:10px">Oh honey,<br>you didn't<br>have to.</div>
  <div style="font:600 48px Inter;line-height:1.4;margin:60px auto 0;max-width:720px">14 gifts for grandma under $50 she'll use every day</div>
  <div style="font:700 42px Inter;margin-top:34px;color:#E63946">Cozy throws, reading lights + keepsakes</div>
  <div style="margin-top:70px"><span class="pill" style="background:#E63946;color:#FFFFFF;font-size:44px">See all 14 picks</span></div>
 </div>
 <div class="foot" style="color:#111111;bottom:100px;font-size:30px">underfiftyfinds.github.io</div>`,
 pin67_grandma_teaser_pink: `
 <div style="position:absolute;inset:0;background:#F7C6D4"></div>
 <div style="position:relative;padding:100px 80px 0;color:#3A1020">
  <div class="kicker" style="color:#D6234A">Gifts for grandma under $50</div>
  <div class="serif" style="font-size:98px;line-height:1.04;margin-top:26px">14 gifts for grandma under $50.</div>
  <div class="serif" style="font-size:66px;line-height:1.14;margin-top:22px;color:#D6234A">#1 is the one she'll use every single night.</div>
  <div style="margin-top:52px;background:#FFE4EC;border-radius:36px;padding:42px 52px;font-size:44px;line-height:1.85">
   <div><span style="color:#D6234A;font-weight:700;display:inline-block;width:80px">01</span><span style="display:inline-block;width:500px;height:32px;border-radius:16px;background:#D6234A;opacity:.45;vertical-align:middle"></span></div>
   ${['Towel warmer bucket','Neck reading light','Grandma memory journal'].map((t,i)=>`<div><span style="color:#D6234A;font-weight:700;display:inline-block;width:80px">${String(i+2).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div style="color:#3A1020;font-weight:700;font-size:42px">+ 10 more on the list</div>
  </div>
  <div style="margin-top:54px;text-align:center"><span class="pill" style="background:#D6234A;color:#F7C6D4;font-size:42px">Tap to see #1</span></div>
 </div>
 <div class="foot" style="color:#3A1020;bottom:60px;font-size:30px">underfiftyfinds.github.io</div>`,
 pin68_stocking_callout_white: `
 <div style="position:absolute;inset:0;background:#FFFFFF"></div>
 <div style="position:absolute;left:0;right:0;top:0;height:560px;background:#E63946"></div>
 <div style="position:relative;padding:100px 80px 0;color:#FFFFFF">
  <div class="kicker" style="color:#FFFFFF">Stocking stuffer ideas</div>
  <div class="serif" style="font-size:100px;line-height:1.04;margin-top:24px">3 stocking stuffers they'll actually keep</div>
  <div style="font:600 44px Inter;margin-top:20px">From our 13 picks under $15</div>
 </div>
 <div style="position:absolute;left:70px;right:70px;top:610px">
  ${[['Password logbook','The one every parent secretly needs'],['Sheet mask variety pack','A spa night, stocking-sized'],['Funny food crew socks','Guaranteed laugh at 7 AM']].map((r,i)=>`
   <div style="background:#F3F3F3;border-radius:30px;padding:34px 44px;margin-bottom:24px;display:flex;gap:34px;align-items:center;color:#111111">
    <div class="serif" style="font-size:84px;color:#E63946;width:70px">${i+1}</div>
    <div><div style="font:700 44px Inter">${r[0]}</div><div style="font:500 36px Inter;margin-top:8px">${r[1]}</div></div>
   </div>`).join('')}
  <div style="text-align:center;font:700 42px Inter;color:#E63946;margin-top:8px">+ 10 more, all under $15</div>
  <div style="margin-top:34px;text-align:center"><span class="pill" style="background:#E63946;color:#FFFFFF;font-size:42px">Tap for the full list + links</span></div>
 </div>
 <div class="foot" style="color:#111111;bottom:50px;font-size:30px">underfiftyfinds.github.io</div>`,
 pin69_grandma_headline_navy: `
 <div style="position:absolute;inset:0;background:#14213D"></div>
 <div style="position:relative;padding:100px 80px 0;color:#FFFFFF">
  <div class="kicker" style="color:#FCA311">Christmas gifts for grandma</div>
  <div class="serif" style="font-size:94px;line-height:1.03;margin-top:24px">14 Christmas Gifts for Grandma under $50</div>
  <div style="font:600 46px Inter;margin-top:22px;color:#FCA311">Cozy, useful + a little sentimental</div>
  <div style="margin-top:40px;background:#1E2F55;border-radius:36px;padding:44px 54px;font-size:44px;line-height:1.8">
   ${['Heated throw blanket','Mug warmer','Heated lavender slippers','Letters to my grandchild book'].map((t,i)=>`<div><span style="color:#FCA311;font-weight:700;display:inline-block;width:80px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div style="color:#FFFFFF;font-weight:700;font-size:42px">+ 10 more picks on the list</div>
  </div>
  <div style="margin-top:44px;text-align:center"><span class="pill" style="background:#FCA311;color:#14213D;font-size:42px">Full list + Amazon links</span></div>
 </div>
 <div class="foot" style="color:#FFFFFF;bottom:60px;font-size:30px">underfiftyfinds.github.io</div>`,
 pin70_stocking_teaser_green: `
 <div style="position:absolute;inset:0;background:#1F4D3A"></div>
 <div style="position:relative;padding:100px 80px 0;color:#FFF8EC">
  <div class="kicker" style="color:#E0B252">Cheap stocking stuffers</div>
  <div class="serif" style="font-size:98px;line-height:1.04;margin-top:26px">13 stocking stuffers under $15.</div>
  <div class="serif" style="font-size:68px;line-height:1.14;margin-top:22px;color:#E0B252">Save the last one for the end. It wins Christmas morning.</div>
  <div style="margin-top:50px;background:#173B2C;border-radius:36px;padding:42px 52px;font-size:44px;line-height:1.85">
   ${['Ribbed cuff beanie','Lip balm holiday minis','Weekly planner notepad'].map((t,i)=>`<div><span style="color:#E0B252;font-weight:700;display:inline-block;width:80px">${String(i+1).padStart(2,'0')}</span>${t}</div>`).join('')}
   <div><span style="color:#E0B252;font-weight:700;display:inline-block;width:80px">13</span><span style="display:inline-block;width:500px;height:32px;border-radius:16px;background:#E0B252;opacity:.5;vertical-align:middle"></span></div>
   <div style="color:#FFF8EC;font-weight:700;font-size:42px">+ 9 more in between</div>
  </div>
  <div style="margin-top:50px;text-align:center"><span class="pill" style="background:#E0B252;color:#1F4D3A;font-size:42px">Tap to see #13</span></div>
 </div>
 <div class="foot" style="color:#FFF8EC;bottom:60px;font-size:30px">underfiftyfinds.github.io</div>`
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1500 } });
  const only=process.argv.slice(2);
  for (const [name, body] of Object.entries(pins)) {
    if (only.length && !only.includes(name)) continue;
    await p.setContent(`<html><head><style>${css}</style></head><body>${body}</body></html>`);
    await p.waitForTimeout(300);
    await p.screenshot({ path: out + name + '.png' });
  }
  await b.close();
})();
