(function () {
const U = CC.U;
const R = CC.Render = { particles: [], ripples: [], ambient: [] };
let cv, ctx, W, H, dpr, scenery, sceneV = 0;
const SKY_M = 3.4;
R.q = 1;
R.init = canvas => {
cv = canvas; ctx = cv.getContext('2d'); R.ctx = ctx;
R.resize();
window.addEventListener('resize', R.resize);
for (let i = 0; i < 6; i++) R.ambient.push(newAmbient());
};
R.resize = () => {
const base = Math.min(window.devicePixelRatio || 1, 2);
dpr = base > 1 ? Math.max(1, base * R.q) : base;
W = window.innerWidth; H = window.innerHeight;
cv.width = W * dpr; cv.height = H * dpr;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
R.W = W; R.H = H; R.dpr = dpr; R.baseDpr = base;
const bar = document.getElementById('hud-bottom');
const reserve = (bar ? bar.offsetHeight : 90) + 20;
document.documentElement.style.setProperty('--bar-h', (bar ? bar.offsetHeight + 12 : 90) + 'px');
CC.MAXD = Math.max(9.5, (R.viewX || 0) + 2.5);
CC.MAXDEPTH = Math.max(2.6, CC.pond ? CC.pond().depth[1] + 0.35 : 2.6);
const viewW = CC.MAXD + 1.5;
R.s = Math.max(1, Math.min((W - 150) / viewW, (H - reserve - 20) / (SKY_M + CC.MAXDEPTH + 0.1)));
R.ox = Math.max(20, (W - 150 - viewW * R.s) / 2) + 1.3 * R.s;
R.sy = Math.max(20 + SKY_M * R.s, (H - reserve) * 0.42);
buildScenery();
if (R.perfReset) R.perfReset(30);
};
R.setView = x => {
if (!ctx) return;
const depth = CC.pond().depth[1];
if (Math.abs((R.viewX || 0) - x) > 0.3 || R.viewDepth !== depth) { R.viewX = x; R.viewDepth = depth; R.resize(); }
};
R.X = x => R.ox + x * R.s;
R.Y = y => R.sy - y * R.s;
R.xOf = R.X;
R.surfaceY = 0;
Object.defineProperty(R, 'surfaceY', { get: () => R.sy });
R.wave = (x, t) => {
const a = 0.5 + CC.world.wind * 0.25;
return Math.sin(x * 0.03 + t * 1.4) * a + Math.sin(x * 0.07 - t * 0.9) * a * 0.4;
};
function seeded(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function buildScenery() {
const rnd = seeded(7);
const trees = [], stars = [], clouds = [], anglers = [];
for (let x = -10; x < W + 20; x += 12 + rnd() * 22) trees.push({ x, h: (16 + rnd() * 26) * Math.min(1.2, R.s / 90), round: rnd() < 0.6 });
for (let i = 0; i < 90; i++) stars.push([rnd() * W, rnd() * R.sy * 0.8, rnd() * 1.4 + 0.3, rnd() * 6]);
for (let i = 0; i < 9; i++) clouds.push({ x: rnd() * W * 1.3, y: 20 + rnd() * R.sy * 0.4, w: (90 + rnd() * 150), k: rnd() });
const cols = ['#d94141', '#2f7fd1', '#f2b632', '#3aa66b', '#8a4fd1', '#e86f2c'];
for (let x = W * 0.12; x < W - 30; x += 46 + rnd() * 50) anglers.push({ x, c: cols[(rnd() * cols.length) | 0], ph: rnd() * 6 });
scenery = { trees, stars, clouds, anglers };
sceneV++;
}
function newAmbient() {
const pond = CC.pond && CC.pond(), list = pond && CC.pondFish ? CC.pondFish() : [];
const sp = !list.length ? CC.FISH[(Math.random() * CC.FISH.length) | 0]
: U.pickWeighted ? U.pickWeighted(list, f => pond.fish[f.id] || 0) || list[0] : list[(Math.random() * list.length) | 0];
const x = U.rand(1, CC.MAXD - 0.5);
return { sp, x, y: -U.rand(0.5, CC.bottomDepth(x) - 0.15), dir: Math.random() < 0.5 ? 1 : -1, sp2: U.rand(0.15, 0.4), t: Math.random() * 9, turn: U.rand(3, 9),
L: sp.max < 0.1 ? 0.1 : 0.22 };
}
let ambPond;
function syncAmbient() {
const id = CC.P && CC.P.pondId;
if (id === ambPond) return;
ambPond = id;
R.ambient.length = 0;
for (let i = 0; i < 6; i++) R.ambient.push(newAmbient());
}
R.splash = (x, y, n, power) => {
for (let i = 0; i < n; i++) R.particles.push({ x, y, vx: U.rand(-1, 1) * 50 * power, vy: -U.rand(50, 140) * power, life: U.rand(0.4, 0.8) });
R.ripple(x, 1 + power);
};
R.ripple = (x, size) => { R.ripples.push({ x, r: 2, max: 14 * size + 8, a: 0.7 }); };
R.npcCatch = () => {
const list = scenery.anglers;
const a = list[(Math.random() * list.length) | 0];
if (a) a.catchT = 2.5;
};
function updateFx(dt) {
for (const a of scenery.anglers) if (a.catchT > 0) a.catchT -= dt;
for (const p of R.particles) { p.vy += 380 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
R.particles = R.particles.filter(p => p.life > 0 && p.y < R.sy + 4);
for (const r of R.ripples) { r.r += 24 * dt; r.a -= 0.6 * dt; }
R.ripples = R.ripples.filter(r => r.a > 0);
syncAmbient();
for (const f of R.ambient) {
f.t += dt * 6; f.x += f.dir * f.sp2 * dt; f.turn -= dt;
if (f.turn <= 0 || f.x < 0.6 || f.x > CC.MAXD - 0.2) { f.dir *= -1; f.turn = U.rand(4, 10); }
f.y = U.clamp(f.y, -CC.bottomDepth(f.x) + 0.15, -0.3);
}
}
function layer() {
const c = document.createElement('canvas');
const L = { c, g: c.getContext('2d'), key: null, x: 0, y: 0 };
c.addEventListener('contextrestored', () => { L.key = null; });
return L;
}
const BG = layer(), FAR = layer(), BANK = layer();
R.layers = { BG, FAR, BANK };
function prep(L, x0, y0, x1, y1) {
const dx = Math.floor(x0 * dpr), dy = Math.floor(y0 * dpr);
const w = Math.max(1, Math.ceil(x1 * dpr) - dx), h = Math.max(1, Math.ceil(y1 * dpr) - dy);
const g = L.g;
if (L.c.width !== w || L.c.height !== h) { L.c.width = w; L.c.height = h; }
else { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); }
L.x = dx; L.y = dy;
g.setTransform(dpr, 0, 0, dpr, -dx, -dy);
return g;
}
function blit(L) {
ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.drawImage(L.c, L.x, L.y);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
const skinIds = new WeakMap();
let skinN = 0;
const sid = o => { if (!o || typeof o !== 'object') return String(o); let v = skinIds.get(o); if (!v) skinIds.set(o, v = ++skinN); return v; };
R.draw = (G, dt) => {
updateFx(dt);
const V = CC.View3D;
if (V && V.on) {
ctx.clearRect(0, 0, W, H);
V.draw(G, dt);
V.overlay(ctx, G);
CC.RigDraw.zoom(ctx, G, CC.world.light(), G.t);
if (CC.RigDraw.holdRing) CC.RigDraw.holdRing(ctx, G);
return;
}
const t = G.t, light = CC.world.light(), sky = CC.world.sky();
const wx = CC.WEATHERS[CC.world.weather];
drawBackground(sky, light);
drawSky(light, t, wx);
drawFarBank(light, t);
drawWater(sky, light, t, G);
drawBank(light);
drawAngler(light, G, dt);
CC.RigDraw.draw(ctx, G, light, t);
drawFx(light);
if (wx.rain > 0) drawRain(wx.rain, t);
const dark = (1 - light) * 0.42 + wx.cloud * 0.06;
if (dark > 0.01) { ctx.fillStyle = `rgba(4,8,26,${dark})`; ctx.fillRect(0, 0, W, H); }
CC.RigDraw.glows(ctx, G, light, t);
CC.RigDraw.zoom(ctx, G, light, t);
CC.RigDraw.overlay(ctx, G);
R.vignette(ctx, G);
};
R.vignette = (ctx, G) => {
const F = G.fight;
if (G.state !== 'fighting' || !F) return;
if (F.laneWarn) {
const right = F.laneWarn > 0, wd = Math.min(70, W * 0.08);
const g2 = ctx.createLinearGradient(right ? W : 0, 0, right ? W - wd : wd, 0);
g2.addColorStop(0, `rgba(255,40,20,${0.5 * (0.6 + 0.4 * Math.sin(G.t * 12))})`);
g2.addColorStop(1, 'rgba(255,40,20,0)');
ctx.fillStyle = g2; ctx.fillRect(right ? W - wd : 0, 0, wd, H);
}
const k = U.clamp((F.Ts / CC.line().leader - 0.7) / 0.3, 0, 1);
if (k <= 0.01) return;
const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72);
g.addColorStop(0, 'rgba(200,20,10,0)');
g.addColorStop(1, `rgba(200,20,10,${0.5 * k * (0.75 + 0.25 * Math.sin(G.t * 18))})`);
ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
};
const WATER = { def: ['#4e7f6e', '#355e4c', '#1d3a2c'], diec: ['#57875d', '#3b6844', '#21422a'] };
const waterCols = () => WATER[CC.pond ? CC.pond().id : ''] || WATER.def;
function waterTop(light) { return U.mix(waterCols()[0], '#0b2226', 1 - light); }
R.waterTop = waterTop;
const bgCol = { grad: null };
function drawBackground(sky, light) {
const skyTop = U.rgb(sky.top), skyBot = U.rgb(sky.bot);
const top = waterTop(light), wc = waterCols();
const w0 = U.rgb(top.map((v, i) => U.lerp(v, sky.bot[i], 0.25)));
const w1 = U.rgb(U.mix(wc[1], '#06171a', 1 - light));
const w2 = U.rgb(U.mix(wc[2], '#020a0b', 1 - light));
const bot = U.rgb(U.mix('#4d3f2a', '#120e08', 1 - light));
const key = W + '|' + H + '|' + dpr + '|' + R.sy + '|' + R.s + '|' + R.ox + '|' + CC.MAXD + '|' + CC.spotSeed + '|' + CC.spotDepth +
'|' + skyTop + skyBot + w0 + w1 + w2 + bot;
if (BG.key !== key) {
BG.key = key;
const g = prep(BG, 0, 0, W, H);
const gs = g.createLinearGradient(0, 0, 0, R.sy);
gs.addColorStop(0, skyTop); gs.addColorStop(1, skyBot);
g.fillStyle = gs; g.fillRect(0, 0, W, R.sy + 2);
const gw = bgCol.grad = g.createLinearGradient(0, R.sy, 0, H);
gw.addColorStop(0, w0); gw.addColorStop(0.4, w1); gw.addColorStop(1, w2);
const wy = Math.ceil(R.sy * dpr) / dpr;
g.save(); g.beginPath(); g.rect(0, wy, W, H - wy + 1); g.clip();
g.fillStyle = gw; g.fillRect(0, R.sy, W, H - R.sy);
g.restore();
g.fillStyle = bot;
g.beginPath(); g.moveTo(R.X(0), H);
for (let x = 0; x <= CC.MAXD + 2; x += 0.1) g.lineTo(R.X(x), R.Y(-CC.bottomDepth(x)));
g.lineTo(W, H); g.closePath(); g.fill();
}
blit(BG);
}
function waterEdge(low, x0, x1) {
const wy = Math.ceil(R.sy * dpr), by = Math.floor(R.sy * dpr);
if (low * dpr > wy) {
const sx = Math.max(0, Math.floor(x0 * dpr)), ex = Math.min(BG.c.width, Math.ceil(x1 * dpr));
const h = Math.min(BG.c.height, Math.ceil(low * dpr) + 1) - wy;
if (ex > sx && h > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(BG.c, sx, wy, ex - sx, h, sx, wy, ex - sx, h); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
}
if (wy > by && bgCol.grad) {
ctx.save();
ctx.beginPath(); ctx.rect(0, by / dpr, W, (wy - by) / dpr); ctx.clip();
ctx.fillStyle = bgCol.grad; ctx.fillRect(0, R.sy, W, H - R.sy);
ctx.restore();
}
}
function drawSky(light, t, wx) {
if (light < 0.6) {
const a = (0.6 - light) / 0.6 * (1 - wx.cloud);
ctx.fillStyle = '#fff';
for (const s of scenery.stars) { ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(t * 1.5 + s[3])); ctx.fillRect(s[0], s[1], s[2], s[2]); }
ctx.globalAlpha = 1;
}
const h = CC.world.hour(), isSun = h >= 5 && h < 19;
const p = isSun ? (h - 5) / 14 : ((h + 24 - 19) % 24) / 10;
const cx = W * (0.08 + 0.84 * p), cy = R.sy - Math.sin(p * Math.PI) * R.sy * 0.85 + 16;
let low = -1, lx0 = 0, lx1 = 0;
if (isSun) {
const warm = 1 - Math.sin(p * Math.PI);
ctx.fillStyle = U.rgb(U.mix('#fff6d8', '#ff9a5a', warm), 1 - wx.cloud * 0.75);
ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 7); ctx.fill();
if (cy + 21 > R.sy) { low = cy + 21; lx0 = cx - 21; lx1 = cx + 21; }
} else if (p > 0 && p < 1) {
ctx.fillStyle = `rgba(240,240,225,${0.9 - wx.cloud * 0.7})`;
ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.fill();
if (cy + 15 > R.sy) { low = cy + 15; lx0 = cx - 15; lx1 = cx + 15; }
}
const n = Math.round(2 + wx.cloud * 7);
const cc = U.mix('#ffffff', '#59606b', wx.cloud * 0.7 + (1 - light) * 0.3);
for (let i = 0; i < n && i < scenery.clouds.length; i++) {
const c = scenery.clouds[i];
const x = ((c.x + t * (3 + CC.world.wind * 2) * CC.world.windDir) % (W + 400) + W + 400) % (W + 400) - 200;
ctx.fillStyle = U.rgb(cc, 0.55 + wx.cloud * 0.35);
for (let k = 0; k < 5; k++) {
ctx.beginPath();
ctx.ellipse(x + (k - 2) * c.w * 0.18, c.y - Math.sin(k * 1.3 + c.k * 5) * c.w * 0.08, c.w * 0.22, c.w * 0.12, 0, 0, 7);
ctx.fill();
}
const cb = c.y + c.w * 0.21;
if (cb > R.sy) { if (low < 0) { lx0 = x - c.w * 0.6; lx1 = x + c.w * 0.6; } else { lx0 = Math.min(lx0, x - c.w * 0.6); lx1 = Math.max(lx1, x + c.w * 0.6); } low = Math.max(low, cb); }
}
waterEdge(low > R.sy ? low + 2 : -1, Math.max(0, lx0 - 2), Math.min(W, lx1 + 2));
}
function drawFarBank(light, t) {
const y0 = R.sy - 2;
const tc = U.rgb(U.mix('#2c4a30', '#07100a', 1 - light));
const key = W + '|' + dpr + '|' + R.sy + '|' + sceneV + '|' + tc + '|' + Math.round(light * 1024);
if (FAR.key !== key) { FAR.key = key; buildFar(light, tc, y0); }
blit(FAR);
const hx = W * 0.78;
ctx.strokeStyle = `rgba(30,30,30,${0.5 + light * 0.3})`; ctx.lineWidth = 1;
ctx.beginPath();
for (const a of scenery.anglers) {
if (Math.abs(a.x - hx - 23) < 50) continue;
ctx.moveTo(a.x + 2, y0 - 14);
if (a.catchT > 0) ctx.quadraticCurveTo(a.x + 18, y0 - 40, a.x + 30, y0 - 22);
else ctx.lineTo(a.x + 2 + 30, y0 - 20 + Math.sin(t * 0.5 + a.ph));
}
ctx.stroke();
for (const a of scenery.anglers) {
if (!(a.catchT > 0) || Math.abs(a.x - hx - 23) < 50) continue;
if (Math.random() < 0.3) { ctx.fillStyle = 'rgba(230,240,240,0.8)'; ctx.fillRect(a.x + 28 + Math.random() * 6, y0 - 4 - Math.random() * 6, 2, 2); }
}
}
function buildFar(light, tc, y0) {
let top = y0 - 52;
for (const tr of scenery.trees) top = Math.min(top, y0 - 10 - tr.h * (tr.round ? 1.05 : 1.55));
const ctx = prep(FAR, 0, top - 3, W, y0 + 1);
ctx.fillStyle = tc;
for (const tr of scenery.trees) {
ctx.beginPath();
if (tr.round) ctx.ellipse(tr.x, y0 - 10 - tr.h * 0.5, tr.h * 0.6, tr.h * 0.55, 0, 0, 7);
else ctx.ellipse(tr.x, y0 - 10 - tr.h * 0.7, tr.h * 0.3, tr.h * 0.85, 0, 0, 7);
ctx.fill();
}
ctx.fillStyle = U.rgb(U.mix('#8a8577', '#1c1b18', 1 - light));
ctx.fillRect(0, y0 - 10, W, 10);
const hx = W * 0.78;
ctx.fillStyle = U.rgb(U.mix('#9a6b3c', '#1f150c', 1 - light));
ctx.fillRect(hx, y0 - 34, 46, 24);
ctx.fillStyle = U.rgb(U.mix('#b5452f', '#250d08', 1 - light));
ctx.beginPath(); ctx.moveTo(hx - 8, y0 - 33); ctx.lineTo(hx + 23, y0 - 50); ctx.lineTo(hx + 54, y0 - 33); ctx.fill();
for (const a of scenery.anglers) {
if (Math.abs(a.x - hx - 23) < 50) continue;
ctx.fillStyle = U.rgb(U.mix(a.c, '#0a0a0a', (1 - light) * 0.8));
ctx.beginPath(); ctx.ellipse(a.x, y0 - 24, 14, 6, 0, Math.PI, 0); ctx.fill();
ctx.strokeStyle = tc; ctx.lineWidth = 1;
ctx.beginPath(); ctx.moveTo(a.x, y0 - 24); ctx.lineTo(a.x, y0 - 10); ctx.stroke();
ctx.fillStyle = tc; ctx.fillRect(a.x - 3, y0 - 18, 5, 8);
}
}
let wavePath = null;
function drawWater(sky, light, t, G) {
const silC = U.rgb(U.mix('#163628', '#020808', 1 - light));
const alpha = G.learn ? 0.35 : 0.1 + light * 0.06;
for (const f of R.ambient) CC.drawFish(ctx, R.X(f.x), R.Y(f.y), (f.L || 0.22) * R.s, f.sp, f.dir, f.t, alpha, silC);
const a = 0.5 + CC.world.wind * 0.25, wp = wavePath = new Path2D();
for (let x = 0; x <= W; x += 6) {
const y = R.sy + (Math.sin(x * 0.03 + t * 1.4) * a + Math.sin(x * 0.07 - t * 0.9) * a * 0.4);
x ? wp.lineTo(x, y) : wp.moveTo(x, y);
}
const fp = new Path2D(wp);
fp.lineTo(W, R.sy + 6); fp.lineTo(0, R.sy + 6); fp.closePath();
ctx.fillStyle = U.rgb(sky.bot, 0.3);
ctx.fill(fp);
ctx.strokeStyle = `rgba(255,255,255,${0.12 + light * 0.2})`; ctx.lineWidth = 1.2;
ctx.stroke(wp);
if (light > 0.25) {
const drift = t * (10 + CC.world.wind * 6) * (CC.world.windDir || 1), span = W + 60;
ctx.strokeStyle = `rgba(255,255,255,${0.1 + light * 0.3})`; ctx.lineWidth = 1.4;
ctx.beginPath();
for (let i = 0; i < 9; i++) {
const x = ((i * 211.7 + drift * (0.6 + (i % 3) * 0.25)) % span + span) % span - 30;
const len = 6 + (i * 7) % 11, k = 0.5 + 0.5 * Math.sin(t * 1.7 + i * 2.1);
if (k < 0.35) continue;
const y = R.sy + 2.5 + (i % 4) * 1.6 + R.wave(x, t) * 0.6;
ctx.moveTo(x, y); ctx.lineTo(x + len * k, y);
}
ctx.stroke();
}
drawWeed2D(light, t, G);
if (CC.Pond && G.spotX != null) {
const o = U.clamp(CC.Pond.food / 8, 0, 1.2);
const bx = R.X(G.spotX), by = R.Y(-CC.bottomDepth(G.spotX));
ctx.fillStyle = `rgba(200,170,110,${0.05 + o * 0.12})`;
ctx.beginPath(); ctx.ellipse(bx, by - 6, 0.7 * R.s, 0.25 * R.s, 0, 0, 7); ctx.fill();
drawBubbles2D(G, t);
}
}
const bub = { list: [], acc: 0, lastT: null };
function drawBubbles2D(G, t) {
const dt = bub.lastT == null ? 0 : U.clamp(t - bub.lastT, 0, 0.1);
bub.lastT = t;
const ca = CC.P && CC.P.ca;
if (ca && ca.active && G.state !== 'fighting') bub.acc += (CC.Pond.bubbles || 0) * 7 * dt;
while (bub.acc >= 1) {
bub.acc -= 1;
if (bub.list.length > 60) break;
const x = G.spotX + U.gauss() * 0.35, d = CC.bottomDepth(x);
bub.list.push({ x, y: -d + 0.05, r: U.rand(1, 2.4), vy: U.rand(0.22, 0.4), pop: 0, wob: U.rand(0, 6) });
}
ctx.lineWidth = 1;
for (let i = bub.list.length - 1; i >= 0; i--) {
const b = bub.list[i];
if (b.y < 0) { b.y += b.vy * dt; b.x += Math.sin(t * 6 + b.wob) * 0.02 * dt; }
else b.pop += dt;
if (b.pop > 0.8) { bub.list.splice(i, 1); continue; }
const px = R.X(b.x), py = b.y < 0 ? R.Y(b.y) : R.sy + R.wave(R.X(b.x), t) - 1;
ctx.strokeStyle = `rgba(235,245,255,${b.y < 0 ? 0.55 : 0.8 * (1 - b.pop / 0.8)})`;
ctx.beginPath(); ctx.arc(px, py, b.r * (b.y < 0 ? 1 : 1.3), 0, 7); ctx.stroke();
}
}
function weedHere(G) {
const pond = CC.pond && CC.pond(), sp = G.spot;
if (!pond || !sp) return false;
return pond.weedSpots ? pond.weedSpots.includes(sp.id) : !!sp.weed;
}
let weed2D = null;
function weedPlants() {
if (weed2D) return weed2D;
const r = seeded(31), plants = [], roots = [], duck = [];
const greens = ['#4f8f35', '#5fa03e', '#3f7a2c', '#6aa847'];
for (let i = 0; i < 30; i++) {
const right = r() < 0.5;
plants.push({ u: r(), h: 0.05 + Math.pow(r(), 0.75) * 0.3, lean: (r() - 0.5) * 0.12, len: 0.07 + r() * 0.06,
ang: (right ? -0.3 : Math.PI + 0.3) + (r() - 0.5) * 1.1, c: greens[(r() * greens.length) | 0], ph: r() * 6 });
}
for (let i = 0; i < 16; i++) roots.push({ u: 0.04 + r() * 0.92, d: 0.1 + r() * 0.28, ph: r() * 6 });
for (let i = 0; i < 22; i++) duck.push({ u: -0.3 + r() * 1.6, s: 0.6 + r() });
return (weed2D = { plants, roots, duck });
}
function leaf2D(x, y, L, a) {
ctx.save(); ctx.translate(x, y); ctx.rotate(a);
ctx.beginPath(); ctx.moveTo(-L * 0.16, -L * 0.14);
ctx.lineTo(0, 0); ctx.lineTo(-L * 0.16, L * 0.1);
ctx.quadraticCurveTo(L * 0.3, L * 0.22, L, 0);
ctx.quadraticCurveTo(L * 0.3, -L * 0.3, -L * 0.16, -L * 0.14);
ctx.fill(); ctx.restore();
}
function drawWeed2D(light, t, G) {
if (!weedHere(G)) return;
const s = R.s, d = 1 - light, P = weedPlants();
const len = 1.6, x0 = Math.max(7.5, (G.spotX || 0) + 1.8), x1 = x0 + len;
const sway = Math.sin(t * 0.8) * (0.012 + (CC.world.wind || 0) * 0.005);
const wy = x => R.sy + R.wave(R.X(x), t);
ctx.strokeStyle = U.rgb(U.mix('#3d4a2a', '#080c06', d), 0.4); ctx.lineWidth = 1;
ctx.beginPath();
for (const rt of P.roots) {
const x = x0 + rt.u * len, y = wy(x) + 2;
ctx.moveTo(R.X(x), y);
ctx.quadraticCurveTo(R.X(x + Math.sin(t * 0.6 + rt.ph) * 0.05), y + rt.d * s * 0.55, R.X(x + 0.04 * Math.sin(rt.ph)), y + rt.d * s);
}
ctx.stroke();
const bam = U.rgb(U.mix('#b59a5c', '#1a150c', d));
ctx.strokeStyle = bam; ctx.lineWidth = Math.max(1.5, 0.03 * s);
ctx.beginPath();
for (const x of [x0 - 0.04, x1 + 0.04]) { ctx.moveTo(R.X(x), R.Y(-0.45)); ctx.lineTo(R.X(x), R.Y(0.4)); }
ctx.stroke();
ctx.fillStyle = U.rgb(U.mix('#2f5224', '#060c05', d));
ctx.beginPath(); ctx.ellipse(R.X(x0 + len / 2), wy(x0 + len / 2), len * s * 0.52, 0.05 * s, 0, Math.PI, 0); ctx.fill();
ctx.fillStyle = bam;
ctx.fillRect(R.X(x0 - 0.08), wy(x0 + len / 2) - 0.02 * s, (len + 0.16) * s, Math.max(2, 0.035 * s));
ctx.fillStyle = U.rgb(U.mix('#7fae4a', '#0e1809', d), 0.85);
for (const k of P.duck) { const x = x0 + k.u * len; ctx.fillRect(R.X(x), wy(x) - 1, 2.2 * k.s, 1.4); }
ctx.strokeStyle = U.rgb(U.mix('#8aa75a', '#10170b', d)); ctx.lineWidth = Math.max(1, 0.012 * s);
ctx.beginPath();
for (const p of P.plants) {
const bx = x0 + p.u * len, tx = bx + p.lean + sway * p.h * 4;
ctx.moveTo(R.X(bx), wy(bx) - 1);
ctx.quadraticCurveTo(R.X(bx + p.lean * 0.2), R.Y(p.h * 0.6), R.X(tx), R.Y(p.h));
}
ctx.stroke();
for (const p of P.plants) {
const tx = x0 + p.u * len + p.lean + sway * p.h * 4;
ctx.fillStyle = U.rgb(U.mix(p.c, '#091107', d));
leaf2D(R.X(tx), R.Y(p.h), p.len * s, p.ang + sway * 3 + Math.sin(t * 1.3 + p.ph) * 0.06);
}
}
function drawBank(light) {
const key = W + '|' + H + '|' + dpr + '|' + R.s + '|' + R.ox + '|' + R.sy + '|' + CC.bottomDepth(0) + '|' + Math.round(light * 1024) +
'|' + sid(CC.skin('box')) + '|' + sid(CC.skin('hat')) + '|' + sid(CC.skin('umb')) + '|' + sid(CC.skin('shirt'));
if (BANK.key !== key) { BANK.key = key; buildBank(light); }
blit(BANK);
}
function buildBank(light) {
const s = R.s, bankTop = R.Y(0.45);
const ctx = prep(BANK, 0, Math.max(0, R.Y(3.1) - 3), Math.min(W, R.X(0.75) + 3), H);
const conc = U.mix('#9b968a', '#1d1c19', 1 - light);
ctx.fillStyle = U.rgb(U.mix('#4a6b34', '#0b120a', 1 - light));
ctx.fillRect(0, bankTop - 4, R.X(0), 6);
ctx.fillStyle = U.rgb(conc);
ctx.fillRect(0, bankTop, R.X(0), H - bankTop);
ctx.fillStyle = U.rgb(conc.map(v => v * 0.8));
ctx.fillRect(R.X(0) - 6, bankTop, 6, R.Y(-CC.bottomDepth(0)) - bankTop);
const rx = R.X(0.35);
ctx.strokeStyle = `rgba(30,60,40,${0.5 + light * 0.3})`; ctx.lineWidth = 1;
ctx.beginPath(); ctx.moveTo(R.X(-0.05), bankTop); ctx.lineTo(rx, R.sy); ctx.stroke();
ctx.fillStyle = `rgba(40,80,50,${0.25 + light * 0.2})`;
ctx.fillRect(rx - 0.14 * s, R.sy, 0.28 * s, 0.7 * s);
const bx = R.X(-0.95), bw = 0.5 * s, bh = 0.32 * s;
const tone = c => U.rgb(U.mix(c, '#0a0a0a', (1 - light) * 0.85));
CC.SkinDraw.box(ctx, bx, bankTop - bh, bw, bh, CC.skin('box'), tone);
ctx.fillStyle = U.rgb(U.mix('#3a7bd5', '#0a1424', 1 - light));
ctx.beginPath(); ctx.ellipse(R.X(-0.25), bankTop - 4, 0.13 * s, 0.05 * s, 0, 0, 7); ctx.fill();
const hip = { x: bx + bw * 0.5, y: bankTop - bh };
const pants = U.rgb(U.mix('#2c2c34', '#08080c', 1 - light));
ctx.strokeStyle = pants; ctx.lineWidth = 0.09 * s; ctx.lineCap = 'round';
ctx.beginPath(); ctx.moveTo(hip.x, hip.y); ctx.lineTo(hip.x + 0.32 * s, hip.y); ctx.lineTo(hip.x + 0.34 * s, bankTop); ctx.stroke();
ctx.lineCap = 'butt';
ctx.strokeStyle = U.rgb(U.mix('#555', '#111', 1 - light)); ctx.lineWidth = 2;
ctx.beginPath(); ctx.moveTo(R.X(-0.12), bankTop); ctx.lineTo(R.X(-0.02), R.Y(0.85)); ctx.stroke();
const ux = R.X(-0.7), uy = R.Y(2.5);
ctx.strokeStyle = U.rgb(U.mix('#444', '#0a0a0a', 1 - light)); ctx.lineWidth = 2;
ctx.beginPath(); ctx.moveTo(ux, uy); ctx.lineTo(R.X(-1.05), bankTop); ctx.stroke();
CC.SkinDraw.umb(ctx, ux, uy, 1.15 * s, 0.38 * s, -0.12, CC.skin('umb'), tone);
}
let lean = 0;
function drawAngler(light, G, dt) {
const s = R.s, bankTop = R.Y(0.45), bx = R.X(-0.95), bw = 0.5 * s, bh = 0.32 * s;
const hip = { x: bx + bw * 0.5, y: bankTop - bh };
const fighting = G.state === 'fighting' && G.fight;
let target = 0;
if (G.state === 'charging') target = -0.05 - 0.17 * (G.power || 0);
else if (G.state === 'flying') target = 0.2;
else if (fighting) target = -(0.07 + 0.2 * (G.bend || 0));
else if (G.strikeT != null && G.t - G.strikeT >= 0 && G.t - G.strikeT < 0.45) target = -0.26;
if (dt > 0) lean += (target - lean) * Math.min(1, dt * 9);
const tone = c => U.rgb(U.mix(c, '#0a0a0a', (1 - light) * 0.85));
const skin = U.rgb(U.mix('#c98e62', '#2a1d14', 1 - light));
const shirt = tone(CC.skin('shirt').color);
ctx.save();
ctx.translate(hip.x, hip.y); ctx.rotate(lean);
ctx.fillStyle = shirt;
ctx.beginPath(); ctx.moveTo(-0.1 * s, 0); ctx.lineTo(0.08 * s, 0); ctx.lineTo(0.04 * s, -0.48 * s); ctx.lineTo(-0.12 * s, -0.45 * s); ctx.fill();
ctx.fillStyle = skin;
ctx.beginPath(); ctx.arc(-0.03 * s, -0.58 * s, 0.09 * s, 0, 7); ctx.fill();
CC.SkinDraw.hat(ctx, -0.03 * s, -0.6 * s, 0.09 * s, CC.skin('hat'), tone);
ctx.restore();
const shx = hip.x + 0.4 * s * Math.sin(lean), shy = hip.y - 0.4 * s * Math.cos(lean);
const hand = { x: R.X(CC.ROD_BASE.x), y: R.Y(CC.ROD_BASE.y) };
ctx.strokeStyle = shirt; ctx.lineWidth = 0.06 * s; ctx.lineCap = 'round';
ctx.beginPath(); ctx.moveTo(shx, shy); ctx.lineTo(hand.x, hand.y);
if (fighting || G.state === 'charging') {
const th = G.theta || 0, g = 0.28 * s;
ctx.moveTo(shx + 0.03 * s, shy + 0.04 * s); ctx.lineTo(hand.x + Math.cos(th) * g, hand.y - Math.sin(th) * g);
}
ctx.stroke();
ctx.lineCap = 'butt';
}
function drawFx(light) {
ctx.strokeStyle = 'rgba(255,255,255,0.5)';
for (const r of R.ripples) {
ctx.globalAlpha = r.a * (0.4 + light * 0.6);
ctx.beginPath(); ctx.ellipse(r.x, R.sy + 1, r.r, r.r * 0.22, 0, 0, 7); ctx.stroke();
}
ctx.globalAlpha = 1;
ctx.fillStyle = 'rgba(220,240,240,0.8)';
for (const p of R.particles) ctx.fillRect(p.x, p.y, 2, 2);
}
function drawRain(k, t) {
const n = Math.round(150 * k), slant = CC.world.wind * CC.world.windDir * 2;
ctx.strokeStyle = 'rgba(200,215,230,0.35)'; ctx.lineWidth = 1;
ctx.beginPath();
for (let i = 0; i < n; i++) {
const sp = 600 + (i % 7) * 60;
const x = ((i * 97.13 + t * slant * 20) % W + W) % W;
const y = (i * 53.7 + t * sp) % (R.sy + 40);
ctx.moveTo(x, y); ctx.lineTo(x + slant, y + 12);
}
ctx.stroke();
if (Math.random() < k * 0.8) R.ripples.push({ x: Math.random() * W, r: 1, max: 6, a: 0.4 });
}
const QS = [1, 0.75, 0.625, 0.5], WIN = 90;
const pf = R.perf = { n: 0, slow: 0, sum: 0, lvl: 0, mode: 'run', base: 0, from: 0, bad: 0, good: 0, lock: false, skip: 120, log: [] };
function setLevel(l, why) {
pf.lvl = l; R.q = QS[l];
pf.log.push(`${why} → ระดับ ${l} (×${QS[l]})`); if (pf.log.length > 12) pf.log.shift();
R.resize();
pf.skip = 20;
}
R.perfReset = skip => { pf.n = pf.slow = pf.sum = 0; pf.skip = Math.max(pf.skip, skip || 30); };
R.perfFrame = ms => {
if (pf.lock || !(R.baseDpr > 1)) return;
if (pf.skip > 0) { pf.skip--; return; }
if (ms > 250) { R.perfReset(30); return; }
pf.n++; pf.sum += ms; if (ms > 22) pf.slow++;
if (pf.n < WIN) return;
const mean = pf.sum / pf.n, slowF = pf.slow / pf.n;
pf.n = pf.slow = pf.sum = 0;
pf.last = { mean: +mean.toFixed(1), slow: +slowF.toFixed(2) };
if (pf.mode === 'down') {
if (mean < pf.base * 0.85) { pf.mode = 'run'; return; }
if (pf.lvl - pf.from < 2 && pf.lvl < QS.length - 1) { setLevel(pf.lvl + 1, 'ยังไม่ลื่นขึ้น ลดระดับเพิ่ม'); return; }
pf.mode = 'run'; pf.lock = true; setLevel(pf.from, 'ลดความคมแล้วไม่ลื่นขึ้น คืนค่าเดิม'); return;
}
if (pf.mode === 'up') {
pf.mode = 'run';
if (slowF > 0.3) { pf.lock = true; setLevel(pf.from, 'เพิ่มระดับแล้วช้าลง ปรับลดกลับ'); }
return;
}
if (slowF > 0.3) {
pf.good = 0;
if (++pf.bad >= 2 && pf.lvl < QS.length - 1) { pf.bad = 0; pf.mode = 'down'; pf.from = pf.lvl; pf.base = mean; setLevel(pf.lvl + 1, `เฟรมช้า (${mean.toFixed(1)} ms/เฟรม)`); }
} else {
pf.bad = 0;
if (pf.lvl > 0 && slowF < 0.05) { if (++pf.good >= 20) { pf.good = 0; pf.mode = 'up'; pf.from = pf.lvl; setLevel(pf.lvl - 1, 'ลื่นต่อเนื่อง ลองเพิ่มระดับ'); } }
else pf.good = 0;
}
};
})();
