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
 <div class="foot" style="color:#D9A08C;bottom:90px">underfiftyfinds.github.io</div>`
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
