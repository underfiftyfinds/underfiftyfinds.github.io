// Renders a slideshow video pin. Usage: node _build/video.js spec.json out.mp4
// spec: {kicker, title, sub, items:[[name, line],...], cta}
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = path.resolve(process.argv[3]);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vid-'));
const css = `*{box-sizing:border-box;margin:0}body{width:1000px;height:1500px;background:#F4EDE4;color:#2B2420;font-family:Inter;display:flex;flex-direction:column;justify-content:center;padding:0 90px;position:relative;overflow:hidden}
.serif{font-family:Lora;font-weight:700;letter-spacing:-.02em}.k{font:700 32px Inter;letter-spacing:.18em;text-transform:uppercase;color:#B5634B}
.foot{position:absolute;left:0;right:0;bottom:70px;text-align:center;font:600 28px Inter;letter-spacing:.12em;color:#954C37;text-transform:uppercase}`;
const slides = [];
slides.push(`<div class="k">${spec.kicker}</div><div class="serif" style="font-size:130px;line-height:1.02;margin:26px 0">${spec.title}</div><div style="font-size:46px;color:#6E625A">${spec.sub}</div>`);
spec.items.forEach((it, i) => slides.push(`<div class="serif" style="font-size:200px;color:#B5634B;line-height:1">${i + 1}</div><div class="serif" style="font-size:96px;line-height:1.05;margin:30px 0 26px">${it[0]}</div><div style="font-size:48px;line-height:1.4;color:#6E625A">${it[1]}</div>`));
slides.push(`<div class="serif" style="font-size:110px;line-height:1.05">${spec.cta}</div><div style="margin-top:50px"><span style="background:#B5634B;color:#fff;font:700 44px Inter;padding:22px 44px;border-radius:999px">Tap to see the list</span></div>`);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1500 } });
  for (let i = 0; i < slides.length; i++) {
    await p.setContent(`<html><head><style>${css}</style></head><body>${slides[i]}<div class="foot">underfiftyfinds.github.io</div></body></html>`);
    await p.waitForTimeout(150);
    await p.screenshot({ path: `${tmp}/s${i}.png` });
  }
  await b.close();
  const D = 2.6, X = 0.4, args = [];
  slides.forEach((_, i) => args.push('-loop', '1', '-framerate', '30', '-t', String(D), '-i', `${tmp}/s${i}.png`));
  let f = slides.map((_, i) => `[${i}:v]zoompan=z='1+0.0010*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1000x1500:fps=30,setsar=1[v${i}]`).join(';');
  let last = 'v0', off = D - X;
  for (let i = 1; i < slides.length; i++) {
    f += `;[${last}][v${i}]xfade=transition=${i % 2 ? 'slideleft' : 'fade'}:duration=${X}:offset=${off.toFixed(2)}[x${i}]`;
    last = `x${i}`; off += D - X;
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args, '-filter_complex', f, '-map', `[${last}]`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  console.log('wrote', out, fs.statSync(out).size, 'bytes');
})();
