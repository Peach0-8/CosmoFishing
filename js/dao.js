(function () {
const U = CC.U, UI = CC.UI, M = CC.PondMap, PN = UI.PANELS;
const $ = id => document.getElementById(id);
const D = CC.Dao = { on: false };
const TAU = Math.PI * 2, PW = M.W, PH = M.H;
const seeded = seed => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; };
const pick = a => a[(Math.random() * a.length) | 0];
const fishName = f => (f && f.name ? f.name.replace(/^ปลา/, '').replace(/ \(.*\)$/, '') : 'ปลา');
const LUCK = D.LUCK = { price: 20, min1: 50, min2: 30, maxMin: 60, cans: 2, bite: 1.4, tag: 1.8, big: 0.35 };
const nowAbs = () => CC.world.day * 1440 + CC.world.minutes;
const caKey = () => { const ca = CC.P && CC.P.ca; return ca && ca.active ? ca.day + ':' + (+ca.start || 0).toFixed(2) : ''; };
function S() {
const P = CC.P;
if (!P) return null;
let s = P.dao;
if (!s || typeof s !== 'object') s = P.dao = { ca: '', cans: 0, until: 0, total: 0 };
const key = caKey();
if (s.ca !== key) { s.ca = key; s.cans = 0; s.until = 0; }
return s;
}
const luckLeft = () => { const s = S(); return s && s.ca ? U.clamp(s.until - nowAbs(), 0, LUCK.maxMin) : 0; };
const luckOn = () => luckLeft() > 0;
let nativeBite = false;
CC.Luck = {
active: () => luckOn(),
bite: () => { nativeBite = true; return luckOn() ? LUCK.bite : 1; },
tag: () => (luckOn() ? LUCK.tag : 1),
big: () => (luckOn() ? LUCK.big : 0),
left: () => luckLeft()
};
const dbg = D.debug = { bigRolls: 0, bigWins: 0, extraBites: 0, native: () => nativeBite };
let mine = 0;
const baseRoll = CC.rollWeight;
if (baseRoll) CC.rollWeight = function () {
const w = baseRoll.apply(this, arguments);
if (!mine || !luckOn() || Math.random() >= LUCK.big) return w;
const w2 = baseRoll.apply(this, arguments);
dbg.bigRolls++;
if (w2 > w) dbg.bigWins++;
return Math.max(w, w2);
};
const Pond = CC.Pond, baseUpdate = Pond && Pond.update;
if (baseUpdate) Pond.update = function (dt, ctx) {
const G = CC.G;
if (!ctx || !G || !ctx.rig || ctx.rig !== G.rig) return baseUpdate.apply(this, arguments);
const had = !!Pond.suitor;
mine++;
try {
let out = baseUpdate.apply(this, arguments);
if (!nativeBite && !had && !Pond.suitor && LUCK.bite > 1 && luckOn() && CC.Rig && CC.Rig.hasBait(ctx.rig)) {
out = baseUpdate.call(this, dt * (LUCK.bite - 1), ctx);
if (Pond.suitor) dbg.extraBites++;
}
return out;
} finally { mine--; }
};
const OFF = 3.0, SEAT = 0.8;
const SEGS = [];
(function () {
const A = Math.PI / 2;
const add = g => { g.len = g.k === 'l' ? Math.hypot(g.x1 - g.x0, g.y1 - g.y0) : OFF * (g.a1 - g.a0); SEGS.push(g); };
add({ k: 'l', x0: 0, y0: -OFF, x1: PW, y1: -OFF });
add({ k: 'a', cx: PW, cy: 0, a0: -A, a1: 0 });
add({ k: 'l', x0: PW + OFF, y0: 0, x1: PW + OFF, y1: PH });
add({ k: 'a', cx: PW, cy: PH, a0: 0, a1: A });
add({ k: 'l', x0: PW, y0: PH + OFF, x1: 0, y1: PH + OFF });
add({ k: 'a', cx: 0, cy: PH, a0: A, a1: 2 * A });
add({ k: 'l', x0: -OFF, y0: PH, x1: -OFF, y1: 0 });
add({ k: 'a', cx: 0, cy: 0, a0: 2 * A, a1: 3 * A });
let acc = 0;
for (const g of SEGS) { g.s0 = acc; acc += g.len; }
D.LOOP = acc;
})();
const LOOP = D.LOOP;
const wrapS = s => ((s % LOOP) + LOOP) % LOOP;
const sdist = (a, b) => { let d = wrapS(b - a); if (d > LOOP / 2) d -= LOOP; return d; };
function pathAt(s) {
s = wrapS(s);
let g = SEGS[SEGS.length - 1];
for (const x of SEGS) if (s <= x.s0 + x.len) { g = x; break; }
const u = U.clamp((s - g.s0) / g.len, 0, 1);
if (g.k === 'l') {
const dx = g.x1 - g.x0, dy = g.y1 - g.y0;
return { x: g.x0 + dx * u, y: g.y0 + dy * u, tx: dx / g.len, ty: dy / g.len };
}
const a = g.a0 + (g.a1 - g.a0) * u;
return { x: g.cx + OFF * Math.cos(a), y: g.cy + OFF * Math.sin(a), tx: -Math.sin(a), ty: Math.cos(a) };
}
function project(x, y) {
let best = 0, bd = Infinity;
for (const g of SEGS) {
let px, py, s;
if (g.k === 'l') {
const dx = g.x1 - g.x0, dy = g.y1 - g.y0;
const u = U.clamp(((x - g.x0) * dx + (y - g.y0) * dy) / (g.len * g.len), 0, 1);
px = g.x0 + dx * u; py = g.y0 + dy * u; s = g.s0 + u * g.len;
} else {
let a = Math.atan2(y - g.cy, x - g.cx);
while (a < g.a0 - Math.PI) a += TAU;
while (a > g.a1 + Math.PI) a -= TAU;
a = U.clamp(a, g.a0, g.a1);
px = g.cx + OFF * Math.cos(a); py = g.cy + OFF * Math.sin(a); s = g.s0 + (a - g.a0) * OFF;
}
const d = Math.hypot(x - px, y - py);
if (d < bd) { bd = d; best = s; }
}
return { s: wrapS(best), d: bd };
}
const SPOT_S = {};
M.spots.forEach(sp => { SPOT_S[sp.id] = project(sp.x - sp.nx * OFF, sp.y - sp.ny * OFF).s; });
const seatOf = sp => ({ x: sp.x - sp.nx * SEAT, y: sp.y - sp.ny * SEAT });
const HUT = { x: M.hut.x - 4.5, y: PH + OFF + 2.8, w: 9, h: 5.2 };
const HUT_S = project(M.hut.x, PH + OFF).s;
const OWNER = { name: 'เจ๊ไพ ซุ้มน้ำ', x: M.hut.x - 0.8, y: HUT.y - 0.5 };
const outside = (x, y) => Math.hypot(Math.max(-x, 0, x - PW), Math.max(-y, 0, y - PH));
const inYard = (x, y) => x > 22 && x < 52 && y > PH + OFF && y < PH + 30;
const TREES = [];
(function () {
const rnd = seeded(77);
const ok = (x, y, r) => !TREES.some(t => Math.hypot(t.x - x, t.y - y) < (t.r + r) * 0.75);
const add = (x, y, r) => { if (ok(x, y, r)) TREES.push({ x, y, r, c: rnd(), ph: rnd() * TAU }); };
for (let x = -5; x <= 30; x += 3.6 + rnd() * 1.6) add(x, -OFF - 2.7 - rnd() * 1.1, 2.1 + rnd() * 1.0);
for (let y = -5; y <= 19; y += 3.6 + rnd() * 1.4) add(PW + OFF + 2.7 + rnd() * 1.1, y, 2.0 + rnd() * 1.0);
for (let i = 0; i < 140 && TREES.length < 70; i++) {
const x = -15 + rnd() * (PW + 30), y = -14 + rnd() * (PH + 34), r = 1.5 + rnd() * 1.6;
if (outside(x, y) < OFF + 1.6 + r * 0.8 || inYard(x, y)) continue;
add(x, y, r);
}
})();
const LAMPS = [];
for (let s = 6; s < LOOP; s += 17) {
const p = pathAt(s), x = p.x + p.ty * 1.3, y = p.y - p.tx * 1.3;
if (!inYard(x, y)) LAMPS.push({ x, y });
}
const RIPPLES = [];
(function () { const rnd = seeded(5); for (let i = 0; i < 70; i++) RIPPLES.push({ x: rnd() * PW, y: rnd() * PH, l: 0.6 + rnd() * 1.4, ph: rnd() * TAU }); })();
const BIKES = [['#c0392b', 0], ['#2c3e50', 0.08], ['#7f8c8d', -0.05], ['#e5b100', 0.04], ['#1d6fa5', -0.08]].map(([c, a], i) => ({ x: 38.3 + i * 1.6, y: PH + OFF + 3.3, c, a }));
const UMB = ['#2e8b57', '#c0392b', '#2f7fd1', '#f2b632', '#8a4fd1', '#e86f2c', '#1f9e9a', '#d94f8a'];
const SHIRT = ['#3d6f9a', '#e8eef0', '#5b6b3a', '#b83a2e', '#2a2a2e', '#7a5a3a', '#e0b030', '#4a8a6a'];
const BOXC = [['#e8e4dc', '#2f6fb8'], ['#222428', '#c0392b'], ['#e8e4dc', '#3aa66b'], ['#f2f2f2', '#e86f2c'], ['#3a3f44', '#f2c14e']];
const HATS = [['cap', '#2b2b2b'], ['nonla', '#e3cf94'], ['bucket', '#7a8a5a'], ['cap', '#b03028'], ['none', ''], ['cap', '#e8e8e8']];
const looks = new WeakMap();
function look(n) {
let L = looks.get(n);
if (L) return L;
const h = hash(n.real ? 'online|' + n.ma : n.name + '|' + n.id), hat = HATS[(h >>> 8) % HATS.length];
L = { umb: UMB[h % UMB.length], umb2: (h >>> 3) % 3 === 0 ? '#f4f1e8' : null, shirt: SHIRT[(h >>> 5) % SHIRT.length],
hat: hat[0], hatC: hat[1], box: BOXC[(h >>> 11) % BOXC.length], rod: [3.6, 3.9, 4.5, 4.5, 5.4][(h >>> 14) % 5],
ang: (((h >>> 17) % 100) / 100 - 0.5) * 0.3, ph: ((h >>> 20) % 628) / 100, hair: /^(ป้า|เจ๊)/.test(n.name) };
looks.set(n, L);
return L;
}
D.look = look;
const npcFx = new WeakMap();
const baseMapUpdate = M.update;
M.update = function () {
const ev = baseMapUpdate.apply(this, arguments);
try { for (const e of ev || []) if (e && e.npc) npcFx.set(e.npc, { w: e.w, fish: e.fish, at: nowAbs(), t: D.on ? WK.t : -99 }); } catch (err) {   }
return ev;
};
D.noteCatch = (n, fish, w) => { if (n) npcFx.set(n, { w, fish, at: nowAbs(), t: D.on ? WK.t - 2.5 : -99 }); };
const baseSay = M.say;
M.say = function (kind, sp) {
if (D.on && CC.G && sp === CC.G.spot) return null;
return baseSay.apply(this, arguments);
};
const SPEED = 4.2;
const FAST = 10;
const MIN_PER_M = 0.05;
const WK = D.walk = { s: 0, dest: null, act: null, fast: false, face: 0, faceD: 0, phase: 0, moving: false, keys: {}, drag: null,
t: 0, dist: 0, startMin: 0, greeted: new Set(), said: new Set(), focus: 0, focusId: 0, focusT: 0, focusRoll: false, hover: 0,
nearHut: false, nearSeat: false, hutHi: false, rings: [], bubbles: [], tip: '', destT: 0, card: 0 };
let root, cv, ctx, VW = 1, VH = 1, dpr = 1, K = 22, FS = 12, raf = 0, lastT = 0;
const cam = { x: 30, y: 0 };
const CAMY = 0.56;
function liftRod() {
const G = CC.G;
if (CC.Pond) { CC.Pond.suitor = null; CC.Pond.suitorBubbles = 0; }
G.lastAct = null;
try {
const o = { code: 'Space', key: ' ', bubbles: true, cancelable: true };
window.dispatchEvent(new KeyboardEvent('keydown', o));
window.dispatchEvent(new KeyboardEvent('keyup', o));
} catch (e) {   }
}
D.start = () => {
if (D.on || !root) return;
const P = CC.P, G = CC.G, ca = P && P.ca;
if (!P || !G || UI.isOpen()) return;
if (!ca || !ca.active) { UI.toast('ต้องซื้อตั๋วเข้าตกก่อน จึงจะเดินเล่นรอบบ่อได้', 'info'); UI.open('pond'); return; }
if (!ca.o) { UI.toast('จับสลากเลือกช่องตกปลาก่อนนะ', 'info'); UI.open('map', { draw: UI.drawSpots() }); return; }
if (G.state === 'fighting') { UI.toast('กำลังอัดปลาอยู่ จะเดินไปไหนเล่า!', 'bad'); return; }
if (G.state === 'charging' || G.state === 'flying' || G.state === 'landed') { UI.toast('รอให้ตีเหยื่อเสร็จก่อน…', 'info'); return; }
let lifted = false;
if (G.state === 'sinking' || G.state === 'waiting') {
liftRod();
if (G.state !== 'hand') { UI.toast('ยกคันขึ้นก่อน (แตะ / Space) แล้วค่อยเดินเล่น', 'info'); return; }
lifted = true;
}
if (CC.Audio && CC.Audio.init) CC.Audio.init();
D.on = true;
Object.assign(WK, { s: SPOT_S[ca.o], dest: null, act: null, fast: false, moving: false, keys: {}, drag: null, dist: 0,
startMin: nowAbs(), greeted: new Set(), said: new Set(), focus: 0, focusId: 0, hover: 0, nearHut: false, nearSeat: true, hutHi: false,
bubbles: [], tip: '', t0: WK.t, card: 0 });
D.watch = 0;
const p = pathAt(WK.s);
WK.face = WK.faceD = Math.atan2(p.ty, p.tx);
root.classList.remove('hidden');
document.body.classList.add('dao-on');
resize();
domDirty(); cardSz = null;
const ct = camTarget(p);
cam.x = ct.x; cam.y = ct.y; clampCam();
UI.toast(lifted ? '🚶 ยกคันวางพักแล้ว เดินยืดเส้นยืดสายรอบบ่อ…' : '🚶 วางคันแล้ว เดินยืดเส้นยืดสายรอบบ่อ…', 'info');
lastT = performance.now();
cancelAnimationFrame(raf);
raf = requestAnimationFrame(loop);
hud(true);
};
D.stop = why => {
if (!D.on) return;
if (D.watch) { D.watch = 0; if (CC.Xem && CC.Xem.on) CC.Xem.stop('quiet'); }
D.on = false;
cancelAnimationFrame(raf); raf = 0;
root.classList.add('hidden');
document.body.classList.remove('dao-on');
WK.keys = {}; WK.dest = null; WK.act = null; WK.drag = null; WK.card = 0;
const xc = $('dao-xem');
if (xc) xc.classList.add('hidden');
const P = CC.P, ca = P && P.ca;
if (why === 'sit' && ca) {
const mins = Math.round(nowAbs() - WK.startMin), left = Math.ceil(luckLeft());
UI.toast(`🎣 กลับถึงช่อง ${ca.o}${mins >= 1 ? ` หลังเดินเล่น ${mins} นาที (${Math.round(WK.dist)} ม.)` : ''}${left ? ` · ⚡ โชคดียังเหลือ ${left} นาที` : ''} — ตีเหยื่อตกต่อได้เลย!`, 'good', 4200);
}
UI.refresh();
hudTick(true);
if (CC.save) CC.save();
};
D.watch = 0;
D.setWatch = id => {
D.watch = id || 0;
WK.card = 0; WK.keys = {}; WK.drag = null; WK.dest = null; WK.act = null; WK.hover = 0;
const xc = $('dao-xem');
if (xc) xc.classList.add('hidden');
if (!root || !D.on) return;
root.classList.toggle('hidden', !!D.watch);
document.body.classList.toggle('dao-on', !D.watch);
if (!D.watch) {
lastT = performance.now();
resize(); clampCam(); domDirty(); cardSz = null;
if (!raf) raf = requestAnimationFrame(loop);
}
};
function showCard(id) { if (CC.Xem && CC.Xem.start && M.npcAt(id)) WK.card = id; }
D.showCard = showCard;
function watchCard() {
const id = WK.card;
if (!id || !CC.Xem || UI.isOpen()) return;
CC.Xem.start(id);
}
function setDest(s, act, fast) { WK.dest = wrapS(s); WK.act = act || null; WK.fast = !!fast; WK.destT = WK.t; }
const goShop = () => (WK.nearHut ? openShop() : setDest(HUT_S, 'shop'));
const goHome = () => (WK.nearSeat && !WK.dest ? D.stop('sit') : setDest(SPOT_S[CC.P.ca.o], 'sit', true));
D.goShop = goShop; D.goHome = goHome;
function arrive() {
const act = WK.act;
WK.dest = null; WK.act = null; WK.fast = false;
if (act === 'shop') openShop();
else if (act === 'sit') D.stop('sit');
else if (act && act.indexOf('npc:') === 0) { chat(+act.slice(4)); showCard(+act.slice(4)); }
}
function interact() {
if (WK.nearHut) return openShop();
if (WK.nearSeat) return D.stop('sit');
if (WK.focus && M.npcAt(WK.focus)) {
if (WK.card === WK.focus) return watchCard();
showCard(WK.focus);
return chat(WK.focus);
}
if (WK.card) return watchCard();
UI.toast('ซุ้มน้ำอยู่ที่ศาลาเจ้าของบ่อ (ฝั่งใต้) — กด Q เพื่อเดินไปที่นั่น', 'info');
}
function openShop() {
if (UI.isOpen()) return;
WK.dest = null; WK.act = null;
UI.open('dao');
}
function update(dt) {
WK.t += dt;
let ds = 0, arrived = false;
const kx = (WK.keys.r ? 1 : 0) - (WK.keys.l ? 1 : 0), ky = (WK.keys.d ? 1 : 0) - (WK.keys.u ? 1 : 0);
if (kx || ky) {
WK.dest = null; WK.act = null; WK.fast = false;
const p = pathAt(WK.s), v = (kx * p.tx + ky * p.ty) / Math.hypot(kx, ky);
if (Math.abs(v) > 0.15) ds = Math.sign(v) * Math.min(1, Math.abs(v) * 1.5) * SPEED * dt;
} else if (WK.dest != null) {
const d = sdist(WK.s, WK.dest), st = (WK.fast ? FAST : SPEED) * dt;
if (Math.abs(d) <= st) { ds = d; arrived = true; } else ds = Math.sign(d) * st;
}
if (ds) {
WK.s = wrapS(WK.s + ds);
const m = Math.abs(ds);
WK.dist += m;
const extra = m * MIN_PER_M - dt * (CC.world.timeScale || 0.2);
if (extra > 0) CC.world.minutes += extra;
WK.phase += m * 4.5;
const p = pathAt(WK.s), sg = ds > 0 ? 1 : -1;
WK.face = Math.atan2(p.ty * sg, p.tx * sg);
WK.moving = true;
} else WK.moving = false;
let df = WK.face - WK.faceD;
df = Math.atan2(Math.sin(df), Math.cos(df));
WK.faceD += df * Math.min(1, dt * 12);
let best = 0, bd = 1e9;
for (const sp of M.spots) { const d = Math.abs(sdist(WK.s, SPOT_S[sp.id])); if (d < bd) { bd = d; best = sp.id; } }
WK.focus = bd < 3 ? best : 0;
const n = WK.focus ? M.npcAt(WK.focus) : null;
if (n) {
if (WK.focusId !== n.id) { WK.focusId = n.id; WK.focusT = WK.t; WK.focusRoll = Math.random() < 0.5; }
const age = WK.t - WK.focusT;
if (!WK.greeted.has(n.id) && ((WK.focusRoll && age > 0.35) || (!WK.moving && age > 1.3))) chat(n.id);
} else WK.focusId = 0;
const ca = CC.P.ca;
WK.nearHut = Math.abs(sdist(WK.s, HUT_S)) < 3.2;
WK.nearSeat = !!(ca && ca.o) && Math.abs(sdist(WK.s, SPOT_S[ca.o])) < 2.6;
if (WK.nearHut && !WK.hutHi) { WK.hutHi = true; ownerSay(); }
if (!WK.nearHut && Math.abs(sdist(WK.s, HUT_S)) > 12) WK.hutHi = false;
const rain = CC.world.rainAmt || 0;
if (Math.random() < dt * (0.8 + rain * 4)) WK.rings.push({ x: 1 + Math.random() * (PW - 2), y: 1 + Math.random() * (PH - 2), t: WK.t, big: Math.random() < 0.18 });
while (WK.rings.length && WK.t - WK.rings[0].t > 2.2) WK.rings.shift();
WK.bubbles = WK.bubbles.filter(b => WK.t - b.t0 < b.dur);
if (WK.card && (!M.npcAt(WK.card) || (Math.abs(sdist(WK.s, SPOT_S[WK.card])) > 9 && WK.act !== 'npc:' + WK.card))) WK.card = 0;
if (arrived) arrive();
}
function checkState() {
const P = CC.P, ca = P && P.ca, G = CC.G;
if (!ca || !ca.active || !ca.o) return D.stop('ca');
if (G && G.state === 'fighting') return D.stop('fight');
if (G && CC.Pond) G.annWave = CC.Pond.waveCount;
}
const pace = { prev: 0, iv: 1000 / 60 };
function paceSkip(now) {
const raw = now - pace.prev;
pace.prev = now;
if (raw > 2 && raw < 50) pace.iv += (raw - pace.iv) * 0.05;
const since = now - lastT, k = Math.floor(1000 / 60 / pace.iv + 0.25);
return UI.isOpen() ? since < 45 : k >= 2 && since < (k - 0.5) * pace.iv;
}
function loop(now) {
raf = 0;
if (!D.on) return;
raf = requestAnimationFrame(loop);
if (paceSkip(now)) return;
const dt = U.clamp((now - lastT) / 1000, 0, 0.05);
lastT = now;
if (!D.watch && !UI.isOpen()) update(dt);
checkState();
if (!D.on) return;
if (!D.watch) { draw(dt); hud(); }
}
D.simulate = (sec, step) => {
step = step || 1 / 30;
for (let s = 0; s < sec && D.on; s += step) {
if (CC.Game && CC.Game.simulate) CC.Game.simulate(step, step);
if (!UI.isOpen() && !D.watch) update(step);
checkState();
}
if (D.on && !D.watch) { const c = camTarget(pathAt(WK.s)); cam.x = c.x; cam.y = c.y; draw(1); hud(); }
};
const ZERO = ['ยังไม่ได้เปิดบิลสักตัวเลย จุดอ่อยเงียบมาก', 'ตั้งแต่เริ่มรอบยังไม่ได้ปลาเลย สงสัยต้องเปลี่ยนเหยื่อ', 'วันนี้ปลากินยากจริง เดินยืดเส้นแก้เซ็งเหรอ?'];
const DRINK = ['แวะซุ้มเจ๊ไพจัดน้ำปลาไนทองสักกระป๋องสิ ดื่มแล้ววัดเป็นติด!', 'ไปไหนน่ะ? แวะซุ้มน้ำเหรอ?', 'ชาเย็นซุ้มเจ๊ไพชื่นใจมากนะ ไปจัดสักแก้วสิ'];
const LUCKY = ['ดื่มปลาไนทองมาแล้วเหรอ? หน้าตาสดใสแบบนี้เดี๋ยวมีไซส์ใหญ่แน่!', 'มีดวงเสริมแล้ว รีบกลับไปตกเร็ว เดี๋ยวหมดเวลา!'];
const NIGHT = ['ดึกป่านนี้แล้วยังเดินเล่นอีกเหรอ? กลางคืนปลามักกินลอยนะ', 'กลางคืนอากาศเย็นสบาย ปลากินเรื่อยๆ ดีกว่าตอนเที่ยงอีก'];
function pondLine(id) {
const s = baseSay.call(M, 'idle', { id: id + 1 });
const m = s && s.match(/“(.+)”/);
return m ? m[1] : null;
}
function lineFor(n) {
const fx = npcFx.get(n), out = [], h = CC.world.hour();
if (fx && nowAbs() - fx.at < 20) {
const f = fishName(fx.fish), fn = f === 'ปลา' ? 'ปลา' : 'ปลา' + f, w = U.fmtKg(fx.w);
out.push(`เพิ่งได้${fn} ${w} เลยน่ะ!`, `เห็น${fn} ${w} เมื่อกี้ไหม? มันส์สุดๆ!`, `เพิ่งขึ้น${fn} ${w} ฝูงเข้าจุดแล้ว!`);
} else if (n.n === 0) out.push(...ZERO);
else if (n.n >= 6 || n.kg >= 4) out.push(`จุดกำลังเข้าเรื่อยๆ ได้มา ${n.n} ตัวแล้ว!`, `${n.kg.toFixed(1)} กก. แล้วนะ รอบนี้มีกำไรแน่`);
else out.push(`ได้มา ${n.n} ตัวแล้ว ปลากินประปราย`, `เพิ่งได้ ${n.n} ตัว จุดอ่อยยังไม่เข้าเท่าไหร่`);
out.push(...(luckOn() ? LUCKY : DRINK));
const p = pondLine(n.id);
if (p) out.push(p, p);
if (h >= 19.5 || h < 4.5) out.push(...NIGHT);
const fresh = out.filter(x => !WK.said.has(x)), line = pick(fresh.length ? fresh : out);
WK.said.add(line);
return line;
}
function say(x, y, who, text, dur, o) {
WK.bubbles = WK.bubbles.filter(b => b.who !== who);
WK.bubbles.push(Object.assign({ x, y, who, text, t0: WK.t, dur: dur || 4.8, nx: 0, ny: -1 }, o || {}));
if (WK.bubbles.length > 3) WK.bubbles.shift();
}
function chat(id) {
const n = M.npcAt(id);
if (!n) return;
WK.greeted.add(id);
const sp = M.spot(id), q = seatOf(sp);
if (n.real) { const m = CC.Online && CC.Online.loiGanDay ? CC.Online.loiGanDay(n) : ''; if (m) say(q.x, q.y, n.name, m, 4.8, { sid: id, nx: sp.nx, ny: sp.ny }); return; }
say(q.x, q.y, n.name, lineFor(n), 4.8, { sid: id, nx: sp.nx, ny: sp.ny });
}
const meSay = (text, dur) => say(0, 0, 'คุณ', text, dur || 3, { me: true });
const ownerLine = () => {
const s = S(), h = CC.world.hour();
if (s && s.cans >= LUCK.cans) return 'ดื่มไป 2 กระป๋องแล้ว เดี๋ยวนอนไม่หลับเอานะ!';
if (luckOn()) return 'กำลังมีดวงเลย รีบกลับไปตกเร็ว!';
if (h >= 19.5 || h < 4.5) return 'ดึกแล้ว จัดปลาไนทองสักกระป๋อง จะได้ตาสว่างเฝ้าทุ่น!';
return pick(['น้ำเย็นๆ มาแล้วจ้า! ปลาไนทองดื่มแล้ววัดเป็นติด!', 'ชาดำเย็น 3 บาท นั่งพักขาให้หายเมื่อยก่อนสิ', 'วันนี้บ่อคึกคักดีนะ ปลากินดีไหม?']);
};
const ownerSay = () => say(OWNER.x, OWNER.y, OWNER.name, ownerLine(), 4.2, { nx: -1, ny: 0 });
D.sayAt = (id, text, dur) => {
const n = D.on ? M.npcAt(id) : null;
if (!n) return;
const sp = M.spot(id), q = seatOf(sp);
say(q.x, q.y, n.name, text, dur || 5, { sid: id, nx: sp.nx, ny: sp.ny });
};
D.meSay = (text, dur) => { if (D.on) meSay(text, dur); };
function resize() {
if (!root) return;
const r = root.getBoundingClientRect();
VW = Math.max(1, r.width); VH = Math.max(1, r.height);
dpr = Math.min(window.devicePixelRatio || 1, 2);
cv.width = Math.round(VW * dpr); cv.height = Math.round(VH * dpr);
K = U.clamp(Math.min(VW / 32, VH / 17), 15, 40);
FS = VH < 460 || VW < 700 ? 12 : 13.5;
}
function clampCam() {
const hw = VW / 2 / K, hh = VH / K;
const x0 = -14, x1 = PW + 14, y0 = -13, y1 = PH + 17;
cam.x = hw * 2 >= x1 - x0 ? (x0 + x1) / 2 : U.clamp(cam.x, x0 + hw, x1 - hw);
cam.y = hh >= y1 - y0 ? (y0 + y1) / 2 : U.clamp(cam.y, y0 + hh * CAMY, y1 - hh * (1 - CAMY));
TX = Math.round(dpr * (VW / 2 - cam.x * K)); TY = Math.round(dpr * (VH * CAMY - cam.y * K));
}
let TX = 0, TY = 0;
const SX = x => (x * K * dpr + TX) / dpr, SY = y => (y * K * dpr + TY) / dpr;
const WX = sx => (sx * dpr - TX) / (K * dpr), WY = sy => (sy * dpr - TY) / (K * dpr);
const seen = (x, y, r) => Math.abs(x - cam.x) < VW / 2 / K + r && y - cam.y > -VH * CAMY / K - r && y - cam.y < VH * (1 - CAMY) / K + r;
const worldT = g => g.setTransform(dpr * K, 0, 0, dpr * K, TX, TY);
const screenT = g => g.setTransform(dpr, 0, 0, dpr, 0, 0);
const font = (px, b) => `${b ? '700 ' : ''}${px}px "Sarabun", "Tahoma", "Segoe UI", system-ui, -apple-system, Roboto, sans-serif`;
function rrect(g, x, y, w, h, r) {
r = Math.max(0, Math.min(r, w / 2, h / 2));
g.beginPath();
g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r); g.lineTo(x + w, y + h - r);
g.arcTo(x + w, y + h, x + w - r, y + h, r); g.lineTo(x + r, y + h); g.arcTo(x, y + h, x, y + h - r, r);
g.lineTo(x, y + r); g.arcTo(x, y, x + r, y, r); g.closePath();
}
function loopPath(g, off) {
g.beginPath();
g.moveTo(0, -off); g.lineTo(PW, -off); g.arc(PW, 0, off, -Math.PI / 2, 0);
g.lineTo(PW + off, PH); g.arc(PW, PH, off, 0, Math.PI / 2);
g.lineTo(0, PH + off); g.arc(0, PH, off, Math.PI / 2, Math.PI);
g.lineTo(-off, 0); g.arc(0, 0, off, Math.PI, Math.PI * 1.5);
g.closePath();
}
let grassPat = null;
function grass() {
if (grassPat) return grassPat;
const c = document.createElement('canvas'), N = 128;
c.width = c.height = N;
const g = c.getContext('2d'), rnd = seeded(13);
g.fillStyle = '#4b7a35'; g.fillRect(0, 0, N, N);
for (const [col, n, w, h] of [['#426e2e', 160, 3, 3], ['#568a3d', 140, 2, 4], ['#5f9444', 70, 1.5, 5], ['#3b6429', 60, 4, 2]]) {
g.fillStyle = col;
for (let i = 0; i < n; i++) g.fillRect(rnd() * N, rnd() * N, w * (0.6 + rnd()), h * (0.6 + rnd()));
}
g.fillStyle = 'rgba(240,230,120,0.7)';
for (let i = 0; i < 6; i++) g.fillRect(rnd() * N, rnd() * N, 2, 2);
return (grassPat = ctx.createPattern(c, 'repeat'));
}
const WATER = { rophi: ['#3c7468', '#326357'], diec: ['#477b58', '#3a6a49'], tram: ['#2c5d61', '#244e52'], giai: ['#3a6f66', '#305e57'] };
function camTarget(p) {
const hk = U.clamp(1 - (Math.abs(sdist(WK.s, HUT_S)) - 3) / 9, 0, 1), k = 2.6 * (1 - hk) - 3.4 * hk;
return { x: p.x - p.ty * k, y: p.y + p.tx * k };
}
const LB = { c: null, g: null, key: '', tx: 0, ty: 0, m: 96 }, LN = { c: null, g: null, key: '', tx: 0, ty: 0, m: 96 };
const layerFresh = (L, key) => L.key === key && Math.abs(TX - L.tx) <= L.m && Math.abs(TY - L.ty) <= L.m;
function layerPrep(L, key) {
const m = L.m, w = cv.width + 2 * m, h = cv.height + 2 * m;
if (!L.c) { L.c = document.createElement('canvas'); L.g = L.c.getContext('2d'); L.c.addEventListener('contextrestored', () => { L.key = ''; }); }
if (L.c.width !== w || L.c.height !== h) { L.c.width = w; L.c.height = h; }
else { L.g.setTransform(1, 0, 0, 1, 0, 0); L.g.globalCompositeOperation = 'source-over'; L.g.clearRect(0, 0, w, h); }
L.key = key; L.tx = TX; L.ty = TY;
const k = K * dpr, x0 = (-m - TX) / k, x1 = (cv.width + m - TX) / k, y0 = (-m - TY) / k, y1 = (cv.height + m - TY) / k;
L.vis = (x, y, r) => x + r > x0 && x - r < x1 && y + r > y0 && y - r < y1;
return L.g;
}
function blitLayer(L) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(L.c, TX - L.tx - L.m, TY - L.ty - L.m); }
function paintBase(g, ox, oy, w, h, vis) {
g.setTransform(1, 0, 0, 1, 0, 0);
const N = 128, px = (ox % N + N) % N, py = (oy % N + N) % N;
g.save(); g.translate(px, py); g.fillStyle = grass(); g.fillRect(-px, -py, w, h); g.restore();
g.setTransform(dpr * K, 0, 0, dpr * K, ox, oy);
drawGround(g);
drawWaterBase(g);
drawYard(g, vis);
}
const SKIN_ID = new WeakMap();
let skinN = 0;
const oid = o => { if (!o || typeof o !== 'object') return String(o); let v = SKIN_ID.get(o); if (!v) SKIN_ID.set(o, v = ++skinN); return v; };
function draw(dt) {
const g = ctx, t = WK.t, light = CC.world.light();
const p = pathAt(WK.s), ct = camTarget(p), a = 1 - Math.exp(-Math.min(dt, 0.1) * 5);
cam.x += (ct.x - cam.x) * a; cam.y += (ct.y - cam.y) * a;
clampCam();
if (dbg.direct) paintBase(g, TX, TY, cv.width, cv.height, seen);
else {
const key = cv.width + '|' + cv.height + '|' + K + '|' + dpr + '|' + CC.pond().id;
if (!layerFresh(LB, key)) { layerPrep(LB, key); paintBase(LB.g, LB.tx + LB.m, LB.ty + LB.m, LB.c.width, LB.c.height, LB.vis); }
blitLayer(LB);
}
worldT(g);
drawWater(g, t, light);
drawTrees(g, t);
const labels = drawSpots(g, t);
drawWalker(g, t, p);
screenT(g);
drawNight(g, light);
drawRain(g, t);
drawPlates(g, light);
drawSigns(g);
const cards = drawCards(g, labels);
if (CC.Online && CC.Online.daoTags) { try { CC.Online.daoTags(g, { SX, SY, seen, seatOf, K, FS, font, rrect, avoid: cards.avoid, labels, card: WK.card }); } catch (e) {   } }
drawMini(g, t);
placeCard(cards);
}
function drawGround(g) {
g.fillStyle = '#a99474'; g.fillRect(46.2, PH + OFF, 4, 26);
g.fillStyle = '#9e8a69'; g.fillRect(37.2, PH + OFF + 1.1, 9.2, 4.6);
g.fillStyle = '#c2b394'; g.fillRect(24.6, PH + OFF + 0.9, 12.4, 7.6);
loopPath(g, OFF); g.strokeStyle = '#b39a70'; g.lineWidth = 1.9; g.stroke();
loopPath(g, OFF); g.strokeStyle = 'rgba(214,195,152,0.55)'; g.lineWidth = 0.7; g.stroke();
loopPath(g, 1.5); g.fillStyle = '#a8a497'; g.fill();
g.strokeStyle = 'rgba(80,76,68,0.32)'; g.lineWidth = 0.05;
g.beginPath();
for (let x = 0; x <= PW; x += 2.5) { g.moveTo(x, -1.5); g.lineTo(x, 0); g.moveTo(x, PH); g.lineTo(x, PH + 1.5); }
for (let y = 0; y <= PH; y += 2.5) { g.moveTo(-1.5, y); g.lineTo(0, y); g.moveTo(PW, y); g.lineTo(PW + 1.5, y); }
g.stroke();
}
function drawWaterBase(g) {
const pond = CC.pond(), col = WATER[pond.id] || WATER.rophi;
const gr = g.createLinearGradient(0, 0, 0, PH);
gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]);
g.fillStyle = gr; g.fillRect(0, 0, PW, PH);
g.save();
g.beginPath(); g.rect(0, 0, PW, PH); g.clip();
g.strokeStyle = 'rgba(15,35,30,0.35)'; g.lineWidth = 0.5; g.strokeRect(0.25, 0.25, PW - 0.5, PH - 0.5);
g.restore();
}
function drawWater(g, t, light) {
g.save();
g.beginPath(); g.rect(0, 0, PW, PH); g.clip();
const wa = CC.world.windAngle || 0, wsp = 0.25 + (CC.world.wind || 0) * 0.12, cx = Math.cos(wa), cy = Math.sin(wa);
const dx = cx * wsp * t, dy = cy * wsp * t;
g.strokeStyle = `rgba(255,255,255,${(0.08 + 0.1 * light).toFixed(3)})`; g.lineWidth = 0.07;
g.beginPath();
for (const r of RIPPLES) {
const x = ((r.x + dx) % PW + PW) % PW, y = ((r.y + dy) % PH + PH) % PH, L = r.l * (0.7 + 0.3 * Math.sin(t * 1.2 + r.ph));
if (!seen(x, y, 2)) continue;
g.moveTo(x + cy * L / 2, y - cx * L / 2);
g.quadraticCurveTo(x + cx * 0.18, y + cy * 0.18, x - cy * L / 2, y + cx * L / 2);
}
g.stroke();
for (const r of WK.rings) {
const k = (t - r.t) / 2.2;
if (k < 0 || !seen(r.x, r.y, 3)) continue;
g.strokeStyle = `rgba(230,245,240,${(0.35 * (1 - k)).toFixed(3)})`; g.lineWidth = 0.06;
g.beginPath(); g.arc(r.x, r.y, 0.15 + k * (r.big ? 1.6 : 0.8), 0, TAU); g.stroke();
if (r.big && k < 0.25) { g.fillStyle = 'rgba(235,245,240,0.7)'; for (let i = 0; i < 5; i++) { const an = i * 1.3 + r.x; g.fillRect(r.x + Math.cos(an) * 0.3 * (1 + k * 4) - 0.04, r.y + Math.sin(an) * 0.3 * (1 + k * 4) - 0.04, 0.08, 0.08); } }
}
for (const sp of M.spots) {
if (!sp.weed || !seen(sp.x, sp.y, 6)) continue;
const tx = -sp.ny, ty = sp.nx, rot = Math.atan2(ty, tx);
g.strokeStyle = '#b59a5c'; g.lineWidth = 0.09;
g.beginPath();
for (const o of [1.4, 3.7]) { g.moveTo(sp.x + tx * -2.6 + sp.nx * o, sp.y + ty * -2.6 + sp.ny * o); g.lineTo(sp.x + tx * 2.6 + sp.nx * o, sp.y + ty * 2.6 + sp.ny * o); }
g.stroke();
for (let j = 0; j < 14; j++) {
const h1 = Math.sin(sp.id * 12.9898 + j * 78.233), h2 = Math.sin(sp.id * 39.346 + j * 11.135);
const along = (j - 6.5) * 0.38 + h1 * 0.3, out = 1.6 + (0.5 + 0.5 * h2) * 1.9;
const x = sp.x + tx * along + sp.nx * out, y = sp.y + ty * along + sp.ny * out, sw = Math.sin(t * 0.9 + j) * 0.05;
g.fillStyle = j % 3 ? '#3f8a35' : '#4f9e3e';
g.beginPath(); g.ellipse(x, y, 0.55 + 0.2 * h2, 0.32 + 0.1 * h1, rot + h1 * 0.6 + sw, 0, TAU); g.fill();
g.fillStyle = 'rgba(160,214,110,0.8)';
g.beginPath(); g.ellipse(x - 0.12, y - 0.08, 0.24, 0.14, rot - h2 * 0.6, 0, TAU); g.fill();
if (j % 4 === 1) { g.fillStyle = '#f3e6f2'; g.beginPath(); g.arc(x + 0.2, y + 0.1, 0.09, 0, TAU); g.fill(); g.fillStyle = '#b77fb4'; g.beginPath(); g.arc(x + 0.2, y + 0.1, 0.035, 0, TAU); g.fill(); }
}
}
const on = M.aeratorOn();
for (const a of M.aerators) {
if (!seen(a.x, a.y, 5)) continue;
if (on) {
for (let i = 0; i < 3; i++) {
const k = (t * 0.45 + i / 3) % 1;
g.strokeStyle = `rgba(230,245,255,${(0.45 * (1 - k)).toFixed(3)})`; g.lineWidth = 0.1;
g.beginPath(); g.arc(a.x, a.y, 0.8 + k * 3.6, 0, TAU); g.stroke();
}
g.fillStyle = 'rgba(235,248,255,0.85)'; g.beginPath(); g.arc(a.x, a.y, 0.8, 0, TAU); g.fill();
g.fillStyle = '#ffffff';
for (let i = 0; i < 12; i++) { const an = i / 12 * TAU + t * 1.7, rr = 0.5 + ((t * 2.6 + i * 0.37) % 1) * 1.0; g.fillRect(a.x + Math.cos(an) * rr - 0.06, a.y + Math.sin(an) * rr - 0.06, 0.12, 0.12); }
} else {
g.fillStyle = '#6d8790'; g.beginPath(); g.arc(a.x, a.y, 0.45, 0, TAU); g.fill();
g.fillStyle = '#e0e6e8'; g.beginPath(); g.arc(a.x, a.y, 0.17, 0, TAU); g.fill();
}
}
const iy = M.inlet.y;
g.strokeStyle = 'rgba(235,248,255,0.45)'; g.lineWidth = 0.08;
for (let i = 0; i < 4; i++) { const k = (t * 0.6 + i / 4) % 1; g.beginPath(); g.arc(0.5, iy, 0.4 + k * 2.4, -0.9, 0.9); g.stroke(); }
g.restore();
g.fillStyle = '#8a8f93'; g.fillRect(-1.6, iy - 0.42, 2.1, 0.84);
g.fillStyle = '#5d6266'; g.fillRect(0.3, iy - 0.42, 0.2, 0.84);
g.strokeStyle = '#7d786c'; g.lineWidth = 0.12; g.strokeRect(0, 0, PW, PH);
}
function drawYard(g, vis) {
const x0 = HUT.x, y0 = HUT.y, w = HUT.w, h = HUT.h, t = 0;
for (const b of BIKES) {
if (!vis(b.x, b.y, 2)) continue;
g.save(); g.translate(b.x, b.y); g.rotate(b.a);
g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(-0.24, -0.86, 0.6, 1.86);
g.fillStyle = '#1d1d1f'; g.fillRect(-0.09, -0.95, 0.18, 0.3); g.fillRect(-0.09, 0.62, 0.18, 0.32);
g.fillStyle = b.c; rrect(g, -0.26, -0.7, 0.52, 1.45, 0.2); g.fill();
g.fillStyle = '#222'; rrect(g, -0.17, -0.12, 0.34, 0.66, 0.12); g.fill();
g.strokeStyle = '#bbb'; g.lineWidth = 0.07; g.beginPath(); g.moveTo(-0.38, -0.66); g.lineTo(0.38, -0.66); g.stroke();
g.restore();
}
for (const l of LAMPS) {
if (!vis(l.x, l.y, 2)) continue;
g.fillStyle = 'rgba(0,0,0,0.2)'; g.beginPath(); g.arc(l.x + 0.15, l.y + 0.15, 0.22, 0, TAU); g.fill();
g.fillStyle = '#55595c'; g.beginPath(); g.arc(l.x, l.y, 0.16, 0, TAU); g.fill();
g.fillStyle = '#fff1bf'; g.beginPath(); g.arc(l.x, l.y, 0.09, 0, TAU); g.fill();
}
if (!vis(x0 + w / 2, y0 + h / 2, 10)) return;
g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x0 + 0.1, y0 + 0.5, w + 0.8, h + 0.6);
g.fillStyle = '#a8442f'; g.fillRect(x0 - 0.4, y0 - 0.4, w + 0.8, h + 0.8);
g.fillStyle = '#bb523b'; g.fillRect(x0 - 0.4, y0 - 0.4, w + 0.8, (h + 0.8) / 2);
g.strokeStyle = 'rgba(90,30,20,0.35)'; g.lineWidth = 0.05;
g.beginPath();
for (let y = y0 - 0.4 + 0.42; y < y0 + h + 0.4; y += 0.42) { g.moveTo(x0 - 0.4, y); g.lineTo(x0 + w + 0.4, y); }
for (let x = x0 - 0.4 + 0.5; x < x0 + w + 0.4; x += 0.5) { g.moveTo(x, y0 - 0.4); g.lineTo(x, y0 + h + 0.4); }
g.stroke();
g.fillStyle = '#7a2f20'; g.fillRect(x0 - 0.4, y0 + h / 2 - 0.13, w + 0.8, 0.26);
const cy = y0 - 1.5;
g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x0 + 1.7, cy + 0.15, 4.2, 0.75);
g.fillStyle = '#8a5a32'; g.fillRect(x0 + 1.5, cy, 4.2, 0.7);
g.fillStyle = '#a7703f'; g.fillRect(x0 + 1.5, cy, 4.2, 0.16);
const cans = ['#e8b923', '#e8b923', '#d33c2c', '#2f7fd1', '#e8b923', '#3aa66b'];
cans.forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(x0 + 1.85 + i * 0.36, cy + 0.42, 0.11, 0, TAU); g.fill(); });
g.fillStyle = 'rgba(220,240,255,0.8)'; g.beginPath(); g.arc(x0 + 4.4, cy + 0.42, 0.12, 0, TAU); g.arc(x0 + 4.75, cy + 0.42, 0.12, 0, TAU); g.fill();
g.fillStyle = '#e8eef0'; g.fillRect(x0 + 6.1, cy - 0.1, 1.05, 0.9);
g.fillStyle = '#2f6fb8'; g.fillRect(x0 + 6.1, cy - 0.1, 1.05, 0.22);
g.fillStyle = '#d9d4c4'; g.fillRect(x0 + 7.6, cy + 0.05, 1.1, 0.75);
[[7.35, 0.15, '#d23c2c'], [7.35, 0.6, '#2f7fd1'], [8.95, 0.15, '#d23c2c'], [8.95, 0.6, '#d23c2c']].forEach(([x, y, c]) => {
g.fillStyle = c; rrect(g, x0 + x - 0.18, cy + y - 0.12, 0.36, 0.36, 0.08); g.fill();
});
person(g, OWNER.x, OWNER.y, -Math.PI / 2, { shirt: '#d9546a', hat: 'none', hair: true, s: 1.25, t });
}
function drawTrees(g, t) {
for (const tr of TREES) {
if (!seen(tr.x, tr.y, tr.r + 1)) continue;
g.fillStyle = 'rgba(0,0,0,0.2)'; g.beginPath(); g.arc(tr.x + 0.55, tr.y + 0.6, tr.r * 0.95, 0, TAU); g.fill();
const sway = Math.sin(t * 0.7 + tr.ph) * 0.04 * tr.r;
g.fillStyle = tr.c < 0.5 ? '#2f5a26' : '#34622a';
g.beginPath(); g.arc(tr.x + sway, tr.y, tr.r, 0, TAU); g.fill();
g.fillStyle = tr.c < 0.5 ? '#3c6e2e' : '#447634';
for (let i = 0; i < 5; i++) { const an = tr.ph + i * 1.26; g.beginPath(); g.arc(tr.x + sway + Math.cos(an) * tr.r * 0.45, tr.y + Math.sin(an) * tr.r * 0.45, tr.r * 0.48, 0, TAU); g.fill(); }
g.fillStyle = 'rgba(120,170,80,0.45)';
g.beginPath(); g.arc(tr.x + sway - tr.r * 0.3, tr.y - tr.r * 0.3, tr.r * 0.38, 0, TAU); g.fill();
}
}
function person(g, x, y, face, o) {
g.save(); g.translate(x, y); g.rotate(face); g.scale(o.s || 1, o.s || 1);
g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(0.07, 0.09, 0.32, 0.36, 0, 0, TAU); g.fill();
const w = o.walk;
g.fillStyle = '#2c2c34';
if (w != null) { const k = Math.sin(w) * 0.2; g.beginPath(); g.ellipse(k, -0.11, 0.13, 0.07, 0, 0, TAU); g.ellipse(-k, 0.11, 0.13, 0.07, 0, 0, TAU); g.fill(); }
else if (o.sit) { g.fillRect(0.02, -0.17, 0.34, 0.13); g.fillRect(0.02, 0.04, 0.34, 0.13); }
const sw = w != null ? Math.sin(w) * 0.16 : 0, fwd = o.sit ? 0.2 : 0;
g.fillStyle = '#c98e62';
g.beginPath(); g.arc(fwd - sw, -0.27, 0.075, 0, TAU); g.arc(fwd + sw, 0.27, 0.075, 0, TAU); g.fill();
g.fillStyle = o.shirt; g.beginPath(); g.ellipse(0, 0, 0.17, 0.27, 0, 0, TAU); g.fill();
if (o.hair) { g.fillStyle = '#1e1712'; g.beginPath(); g.arc(-0.12, 0, 0.1, 0, TAU); g.fill(); }
g.fillStyle = '#2a2018'; g.beginPath(); g.arc(0.02, 0, 0.14, 0, TAU); g.fill();
if (o.hat === 'nonla') {
g.fillStyle = o.hatC || '#e3cf94'; g.beginPath(); g.arc(0.02, 0, 0.34, 0, TAU); g.fill();
g.strokeStyle = 'rgba(120,95,45,0.45)'; g.lineWidth = 0.025;
g.beginPath(); g.arc(0.02, 0, 0.22, 0, TAU); g.moveTo(0.13, 0); g.arc(0.02, 0, 0.11, 0, TAU); g.stroke();
} else if (o.hat === 'bucket') {
g.fillStyle = o.hatC; g.beginPath(); g.arc(0.02, 0, 0.24, 0, TAU); g.fill();
g.fillStyle = 'rgba(0,0,0,0.15)'; g.beginPath(); g.arc(0.02, 0, 0.15, 0, TAU); g.fill();
} else if (o.hat === 'cap') {
g.fillStyle = o.hatC; g.beginPath(); g.arc(0.02, 0, 0.15, 0, TAU); g.fill();
g.beginPath(); g.ellipse(0.17, 0, 0.09, 0.12, 0, -Math.PI / 2, Math.PI / 2); g.fill();
} else { g.fillStyle = '#c98e62'; g.beginPath(); g.arc(0.1, 0, 0.05, 0, TAU); g.fill(); }
g.restore();
}
function umbrella(g, x, y, r, cols, alpha) {
g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.arc(x + 0.4, y + 0.45, r, 0, TAU); g.fill();
g.globalAlpha = alpha;
const n = 8;
for (let i = 0; i < n; i++) {
g.fillStyle = cols[i % cols.length];
g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, i / n * TAU, (i + 1) / n * TAU); g.closePath(); g.fill();
}
g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 0.03;
g.beginPath(); for (let i = 0; i < n; i++) { g.moveTo(x, y); g.lineTo(x + Math.cos(i / n * TAU) * r, y + Math.sin(i / n * TAU) * r); } g.stroke();
g.globalAlpha = 1;
g.fillStyle = '#ddd'; g.beginPath(); g.arc(x, y, 0.07, 0, TAU); g.fill();
}
const SPR = new Map();
const slotOf = (id, part) => { let s = SPR.get(id); if (!s) SPR.set(id, s = {}); return s[part] || (s[part] = { key: '', c: null, g: null, x: 0, y: 0 }); };
function sprite(g, slot, key, x0, y0, x1, y1, paint) {
if (dbg.direct) { paint(g); return; }
if (slot.key !== key) {
const k = K * dpr, dx = Math.floor(x0 * k), dy = Math.floor(y0 * k);
const w = Math.max(1, Math.ceil(x1 * k) - dx), h = Math.max(1, Math.ceil(y1 * k) - dy);
if (!slot.c) { slot.c = document.createElement('canvas'); slot.g = slot.c.getContext('2d'); slot.c.addEventListener('contextrestored', () => { slot.key = ''; }); }
if (slot.c.width !== w || slot.c.height !== h) { slot.c.width = w; slot.c.height = h; }
else { slot.g.setTransform(1, 0, 0, 1, 0, 0); slot.g.clearRect(0, 0, w, h); }
slot.g.setTransform(k, 0, 0, k, -dx, -dy);
paint(slot.g);
slot.key = key; slot.x = dx; slot.y = dy;
}
g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(slot.c, slot.x + TX, slot.y + TY); worldT(g);
}
function paintOwn(g, sp, q, face, tx, ty, lw, umbS, boxS, rodC, L) {
g.strokeStyle = 'rgba(242,193,78,0.9)'; g.lineWidth = 0.12; g.setLineDash([0.35, 0.25]);
g.beginPath(); g.arc(q.x - sp.nx * 0.3, q.y - sp.ny * 0.3, 1.75, 0, TAU); g.stroke(); g.setLineDash([]);
umbrella(g, q.x - sp.nx * 0.5, q.y - sp.ny * 0.5, 1.1, umbS.colors, 0.92);
g.save(); g.translate(q.x, q.y); g.rotate(face);
g.fillStyle = boxS.c1; g.fillRect(-0.28, -0.22, 0.5, 0.44); g.fillStyle = boxS.c2; g.fillRect(-0.28, -0.22, 0.12, 0.44);
g.restore();
const hx = q.x + sp.nx * 0.45 + tx * 0.25, hy = q.y + sp.ny * 0.45 + ty * 0.25;
g.strokeStyle = rodC; g.lineWidth = lw * 1.3;
g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + sp.nx * L, hy + sp.ny * L); g.stroke();
g.fillStyle = '#ff3b2f'; g.beginPath(); g.arc(hx + sp.nx * (L - 0.1) + tx * 0.12, hy + sp.ny * (L - 0.1) + ty * 0.12, 0.07, 0, TAU); g.fill();
g.fillStyle = '#3a7bd5'; g.beginPath(); g.arc(q.x + tx * -0.75, q.y + ty * -0.75, 0.2, 0, TAU); g.fill();
const rx = sp.x + sp.nx * 0.55 + tx * -1.0, ry = sp.y + sp.ny * 0.55 + ty * -1.0;
g.fillStyle = 'rgba(30,60,40,0.75)'; g.beginPath(); g.arc(rx, ry, 0.38, 0, TAU); g.fill();
g.strokeStyle = 'rgba(200,220,200,0.5)'; g.lineWidth = 0.04; g.beginPath(); g.arc(rx, ry, 0.38, 0, TAU); g.stroke();
}
function paintSeat(g, sp, n, L, q, face, tx, ty) {
if (n.real) { g.strokeStyle = 'rgba(78,163,255,0.9)'; g.lineWidth = 0.1; g.beginPath(); g.arc(q.x - sp.nx * 0.3, q.y - sp.ny * 0.3, 1.6, 0, TAU); g.stroke(); }
umbrella(g, q.x - sp.nx * 0.5, q.y - sp.ny * 0.5, 1.05, L.umb2 ? [L.umb, L.umb2] : [L.umb], 0.9);
g.save(); g.translate(q.x, q.y); g.rotate(face);
g.fillStyle = L.box[0]; g.fillRect(-0.3, -0.22, 0.5, 0.44); g.fillStyle = L.box[1]; g.fillRect(-0.3, -0.22, 0.12, 0.44);
g.restore();
g.fillStyle = '#3a7bd5'; g.beginPath(); g.arc(q.x + tx * -0.75, q.y + ty * -0.75, 0.19, 0, TAU); g.fill();
}
function drawSpots(g, t) {
const labels = [], ca = CC.P.ca, lw = Math.max(0.05, 1.2 / K), night = CC.world.light() < 0.35, kd = K + '|' + dpr + '|';
for (const sp of M.spots) {
if (!seen(sp.x, sp.y, 7)) continue;
const n = M.npcAt(sp.id), own = ca && ca.o === sp.id, q = seatOf(sp), tx = -sp.ny, ty = sp.nx;
const face = Math.atan2(sp.ny, sp.nx);
if (!n && !own) continue;
if (own) {
const umbS = CC.skin ? CC.skin('umb') : { colors: ['#2e8b57'] }, boxS = CC.skin ? CC.skin('box') : { c1: '#e8e4dc', c2: '#2f6fb8' };
const rodC = (CC.skin && CC.skin('rod').color) || (CC.rod && CC.rod().color) || '#3b3b3b';
const L = (CC.rod && CC.rod().len) || 3.6, ex = sp.nx * (L + 0.8), ey = sp.ny * (L + 0.8);
sprite(g, slotOf(sp.id, 'own'), kd + oid(umbS) + '|' + oid(boxS) + '|' + rodC + '|' + L,
Math.min(q.x - 2.4, q.x + ex - 0.5), Math.min(q.y - 2.4, q.y + ey - 0.5), Math.max(q.x + 2.4, q.x + ex + 0.5), Math.max(q.y + 2.4, q.y + ey + 0.5),
gg => paintOwn(gg, sp, q, face, tx, ty, lw, umbS, boxS, rodC, L));
const kn = CC.P.keep ? CC.P.keep.length : 0;
if (WK.focus === sp.id || WK.hover === sp.id) labels.push({ x: q.x, y: q.y, own: true, sp, kn });
continue;
}
const L = look(n), fx = npcFx.get(n), age = fx ? t - fx.t : 99;
const fight = n.real ? n.s === 'dinh' || n.s === 'vot' : age < 2.4, show = !fight && age < 5.6, away = !!n.real && n.s === 'dao';
sprite(g, slotOf(sp.id, 'seat'), kd + oid(n) + '|' + (n.real ? 1 : 0), q.x - 2.4, q.y - 2.4, q.x + 2.4, q.y + 2.4,
gg => paintSeat(gg, sp, n, L, q, face, tx, ty));
const da = L.ang + Math.sin(t * 0.3 + L.ph) * 0.02, dx = Math.cos(face + da), dy = Math.sin(face + da);
const hx = q.x + dx * 0.45, hy = q.y + dy * 0.45, tipX = hx + dx * L.rod, tipY = hy + dy * L.rod;
if (fight) {
const fxp = tipX + dx * 1.2 + Math.sin(t * 5 + L.ph) * 0.8, fyp = tipY + dy * 1.2 + Math.cos(t * 4.3 + L.ph) * 0.8;
g.strokeStyle = '#2b2b2b'; g.lineWidth = lw * 1.3;
g.beginPath(); g.moveTo(hx, hy); g.quadraticCurveTo(hx + dx * L.rod * 0.7, hy + dy * L.rod * 0.7, (tipX * 0.6 + fxp * 0.4), (tipY * 0.6 + fyp * 0.4)); g.stroke();
g.strokeStyle = 'rgba(235,235,235,0.75)'; g.lineWidth = lw * 0.6;
g.beginPath(); g.moveTo(tipX * 0.6 + fxp * 0.4, tipY * 0.6 + fyp * 0.4); g.lineTo(fxp, fyp); g.stroke();
for (let i = 0; i < 2; i++) {
const k = (t * 1.8 + i * 0.5) % 1;
g.strokeStyle = `rgba(240,250,245,${(0.6 * (1 - k)).toFixed(3)})`; g.lineWidth = 0.07;
g.beginPath(); g.arc(fxp, fyp, 0.2 + k * 0.9, 0, TAU); g.stroke();
}
g.fillStyle = 'rgba(240,250,245,0.8)';
for (let i = 0; i < 4; i++) g.fillRect(fxp + Math.sin(t * 9 + i * 2) * 0.35, fyp + Math.cos(t * 7 + i) * 0.35, 0.09, 0.09);
} else {
g.strokeStyle = '#2b2b2b'; g.lineWidth = lw;
g.beginPath(); g.moveTo(hx, hy); g.lineTo(tipX, tipY); g.stroke();
const fxp = tipX + dx * 0.55, fyp = tipY + dy * 0.55, bob = Math.sin(t * 2 + L.ph) * 0.02;
g.strokeStyle = 'rgba(235,235,235,0.4)'; g.lineWidth = lw * 0.5;
g.beginPath(); g.moveTo(tipX, tipY); g.lineTo(fxp, fyp); g.stroke();
if (night) { g.fillStyle = 'rgba(120,255,140,0.35)'; g.beginPath(); g.arc(fxp, fyp, 0.28, 0, TAU); g.fill(); }
g.fillStyle = '#f2f2f2'; g.beginPath(); g.arc(fxp, fyp + bob, 0.07, 0, TAU); g.fill();
g.fillStyle = night ? '#7dff8a' : '#ff3b2f'; g.beginPath(); g.arc(fxp, fyp + bob, 0.045, 0, TAU); g.fill();
}
if (!away) {
const px = q.x + sp.nx * (fight ? -0.05 : 0.05), py = q.y + sp.ny * (fight ? -0.05 : 0.05);
sprite(g, slotOf(sp.id, 'man'), kd + oid(n) + '|' + (fight ? 1 : 0), px - 0.8, py - 0.8, px + 0.8, py + 0.8,
gg => person(gg, px, py, face, { shirt: L.shirt, hat: L.hat, hatC: L.hatC, hair: L.hair, sit: !fight, s: 1.2, t }));
}
if (show) {
const fxp = q.x + sp.nx * 0.75 + tx * 0.35, fyp = q.y + sp.ny * 0.75 + ty * 0.35, sz = U.clamp(0.25 + Math.sqrt(fx.w) * 0.3, 0.3, 1.1);
g.save(); g.translate(fxp, fyp); g.rotate(Math.atan2(ty, tx) + Math.sin(t * 6) * 0.25);
g.fillStyle = (fx.fish && fx.fish.col && fx.fish.col.body) || '#9aa';
g.beginPath(); g.ellipse(0, 0, sz, sz * 0.38, 0, 0, TAU); g.fill();
g.beginPath(); g.moveTo(-sz * 0.9, 0); g.lineTo(-sz * 1.35, -sz * 0.3); g.lineTo(-sz * 1.35, sz * 0.3); g.closePath(); g.fill();
g.restore();
if (seen(q.x, q.y, 0.5)) labels.push({ x: q.x, y: q.y, catchOf: fx, n, sp });
} else if (WK.focus === sp.id || WK.hover === sp.id || WK.card === sp.id) labels.push({ x: q.x, y: q.y, n, sp, fx });
}
return labels;
}
function drawWalker(g, t, p) {
if (WK.dest != null) {
const d = pathAt(WK.dest), k = (t * 1.6) % 1;
g.strokeStyle = `rgba(255,240,170,${(0.85 * (1 - k)).toFixed(3)})`; g.lineWidth = 0.09;
g.beginPath(); g.arc(d.x, d.y, 0.3 + k * 0.6, 0, TAU); g.stroke();
g.fillStyle = 'rgba(255,240,170,0.9)'; g.beginPath(); g.arc(d.x, d.y, 0.12, 0, TAU); g.fill();
}
const shirt = (CC.skin && CC.skin('shirt').color) || '#3d6f9a', hat = CC.skin ? CC.skin('hat') : { type: 'cap', color: '#2b2b2b' };
const hatType = hat.type === 'nonla' ? 'nonla' : hat.type === 'bucket' ? 'bucket' : 'cap';
const bob = WK.moving ? Math.abs(Math.sin(WK.phase)) * 0.03 : 0;
g.strokeStyle = 'rgba(255,230,120,0.75)'; g.lineWidth = 0.07;
g.beginPath(); g.ellipse(p.x, p.y, 0.62, 0.62, 0, 0, TAU); g.stroke();
person(g, p.x, p.y - bob, WK.faceD, { shirt, hat: hatType, hatC: hat.color, walk: WK.moving ? WK.phase : 0, s: 1.4, t });
}
let nightCv = null;
function hole(n, ox, oy, vis, x, y, r, a) {
if (!vis(x, y, r)) return;
const k = K * dpr, sx = x * k + ox, sy = y * k + oy, sr = r * k;
const gr = n.createRadialGradient(sx, sy, 0, sx, sy, sr);
gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
n.fillStyle = gr; n.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
}
function paintNight(n, w, h, ox, oy, vis, dk, holes, walker) {
n.setTransform(1, 0, 0, 1, 0, 0);
n.globalCompositeOperation = 'source-over';
n.clearRect(0, 0, w, h);
n.fillStyle = `rgba(5,9,26,${dk})`; n.fillRect(0, 0, w, h);
if (!holes) return;
n.globalCompositeOperation = 'destination-out';
for (const l of LAMPS) hole(n, ox, oy, vis, l.x, l.y, 6, 0.85);
hole(n, ox, oy, vis, HUT.x + HUT.w / 2, HUT.y - 1, 8, 0.95);
if (walker) { const p = pathAt(WK.s); hole(n, ox, oy, vis, p.x, p.y, 3, 0.7); }
for (const id in M.npcs || {}) { const q = seatOf(M.spot(+id)); hole(n, ox, oy, vis, q.x, q.y, 1.6, 0.55); }
n.globalCompositeOperation = 'source-over';
}
function drawNight(g, light) {
const dark = (1 - light) * 0.56 + (CC.world.cloud || 0) * 0.06;
if (dark < 0.04) return;
if (!nightCv) nightCv = document.createElement('canvas');
if (nightCv.width !== cv.width || nightCv.height !== cv.height) { nightCv.width = cv.width; nightCv.height = cv.height; }
const n = nightCv.getContext('2d'), dk = U.clamp(dark, 0, 0.8).toFixed(3), holes = light < 0.55;
if (dbg.direct) paintNight(n, nightCv.width, nightCv.height, TX, TY, seen, dk, holes, true);
else {
const key = cv.width + '|' + cv.height + '|' + K + '|' + dpr + '|' + dk + '|' + holes + '|' + (holes ? Object.keys(M.npcs || {}).join(',') : '');
if (!layerFresh(LN, key)) { layerPrep(LN, key); paintNight(LN.g, LN.c.width, LN.c.height, LN.tx + LN.m, LN.ty + LN.m, LN.vis, dk, holes, false); }
n.setTransform(1, 0, 0, 1, 0, 0);
n.globalCompositeOperation = 'source-over';
n.clearRect(0, 0, nightCv.width, nightCv.height);
n.drawImage(LN.c, TX - LN.tx - LN.m, TY - LN.ty - LN.m);
if (holes) { n.globalCompositeOperation = 'destination-out'; const p = pathAt(WK.s); hole(n, TX, TY, seen, p.x, p.y, 3, 0.7); n.globalCompositeOperation = 'source-over'; }
}
g.setTransform(1, 0, 0, 1, 0, 0);
g.drawImage(nightCv, 0, 0);
screenT(g);
}
function drawRain(g, t) {
const k = CC.world.rainAmt || 0;
if (k < 0.05) return;
const n = Math.round(140 * k), slant = (CC.world.wind || 0) * 1.5;
g.strokeStyle = 'rgba(200,215,230,0.35)'; g.lineWidth = 1;
g.beginPath();
for (let i = 0; i < n; i++) {
const x = ((i * 97.13 + t * slant * 18) % VW + VW) % VW, y = (i * 53.7 + t * (520 + (i % 7) * 50)) % (VH + 30) - 15;
g.moveTo(x, y); g.lineTo(x + slant, y + 11);
}
g.stroke();
}
function paintPlate(g, sx, sy, fs, dim, own, id) {
g.font = font(fs, true); g.textAlign = 'center'; g.textBaseline = 'middle';
const w = fs * 1.9, h = fs * 1.35;
g.fillStyle = `rgba(245,245,240,${0.92 * dim})`; rrect(g, sx - w / 2, sy - h / 2, w, h, 3); g.fill();
g.fillStyle = own ? '#b07a00' : '#10202a'; g.fillText(id, sx, sy + 0.5);
}
function drawPlates(g, light) {
if (K < 13) return;
const fs = U.clamp(K * 0.42, 8, 13), dim = light < 0.35 ? 0.75 : 1, k = K * dpr;
for (const sp of M.spots) {
const x = sp.x - sp.nx * 0.3 - sp.ny * 1.45, y = sp.y - sp.ny * 0.3 + sp.nx * 1.45;
if (!seen(x, y, 1)) continue;
const own = !!(CC.P.ca && CC.P.ca.o === sp.id);
if (dbg.direct) { paintPlate(g, SX(x), SY(y), fs, dim, own, sp.id); continue; }
const slot = slotOf(sp.id, 'plate'), key = K + '|' + dpr + '|' + fs + '|' + dim + '|' + own;
if (slot.key !== key) {
const cx = x * k, cy = y * k, w2 = fs * 0.95 * dpr + 3, h2 = fs * 0.675 * dpr + 3;
const dx = Math.floor(cx - w2), dy = Math.floor(cy - h2), w = Math.ceil(cx + w2) - dx, h = Math.ceil(cy + h2) - dy;
if (!slot.c) { slot.c = document.createElement('canvas'); slot.g = slot.c.getContext('2d'); slot.c.addEventListener('contextrestored', () => { slot.key = ''; }); }
if (slot.c.width !== w || slot.c.height !== h) { slot.c.width = w; slot.c.height = h; }
else { slot.g.setTransform(1, 0, 0, 1, 0, 0); slot.g.clearRect(0, 0, w, h); }
slot.g.setTransform(dpr, 0, 0, dpr, -dx, -dy);
paintPlate(slot.g, x * K, y * K, fs, dim, own, sp.id);
slot.key = key; slot.x = dx; slot.y = dy;
}
g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(slot.c, slot.x + TX, slot.y + TY);
}
screenT(g);
}
function drawSigns(g) {
const x = HUT.x + HUT.w / 2;
if (!seen(x, HUT.y, 10)) return;
g.textAlign = 'center'; g.textBaseline = 'middle';
g.font = font(U.clamp(K * 0.55, 10, 18), true);
g.fillStyle = 'rgba(255,240,220,0.9)'; g.fillText('ศาลาบ่อ', SX(x), SY(HUT.y + HUT.h * 0.73));
const sx = SX(HUT.x + 3.6), sy = SY(HUT.y - 2.35), fs = U.clamp(K * 0.5, 10, 16);
g.font = font(fs, true);
const txt = '🥤 ซุ้มน้ำ', w = g.measureText(txt).width + 14, h = fs + 9;
g.fillStyle = WK.nearHut ? 'rgba(242,193,78,0.95)' : 'rgba(25,40,48,0.88)'; rrect(g, sx - w / 2, sy - h / 2, w, h, 6); g.fill();
g.strokeStyle = 'rgba(242,193,78,0.9)'; g.lineWidth = 1.5; g.stroke();
g.fillStyle = WK.nearHut ? '#2a1e00' : '#ffe9a8'; g.fillText(txt, sx, sy + 1);
}
const INK = {
dark: { bg: 'rgba(10,16,20,0.86)', name: '#eef3ef', info: '#c9d6d0', good: '#9fe0a8', gold: '#f2c14e', text: '#eef3ef' },
light: { bg: 'rgba(255,252,240,0.96)', name: '#8a5a00', info: '#4f5f66', good: '#2e7d32', gold: '#8a5a00', text: '#1b2328' }
};
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
function card(g, cands, lines, theme, border, avoid) {
const ink = INK[theme] || INK.dark, pad = 7, lh = FS + 4;
let w = 0;
for (const l of lines) { g.font = font(FS, l.b); w = Math.max(w, g.measureText(l.t).width); }
w += pad * 2;
const h = lines.length * lh + pad * 2 - 4;
let pickC = null, rect = null, why = [];
for (const c of cands) {
const ext = Math.abs(c.nx) * w / 2 + Math.abs(c.ny) * h / 2, gap = c.gap != null ? c.gap : 0.6 * K;
const r = { x: c.sx + c.nx * (gap + ext) - w / 2, y: c.sy + c.ny * (gap + ext) - h / 2, w, h };
if (!rect) { pickC = c; rect = { x: U.clamp(r.x, 6, VW - w - 6), y: U.clamp(r.y, 6, VH - h - 6), w, h }; }
const inside = r.x >= 6 && r.y >= 6 && r.x + w <= VW - 6 && r.y + h <= VH - 6, hitA = avoid.findIndex(a => overlap(a, r));
if (inside && hitA < 0) { pickC = c; rect = r; break; }
why.push(inside ? 'ทับ ' + hitA : 'ออกนอกจอ');
}
if (dbg.cards) dbg.cards.push({ t: lines[0] && lines[0].t, why, rect });
avoid.push(rect);
const { x, y } = rect;
g.fillStyle = ink.bg; rrect(g, x, y, w, h, 8); g.fill();
g.strokeStyle = border || (theme === 'light' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.18)'); g.lineWidth = 1; g.stroke();
const c = pickC;
if (c && c.tx != null) {
g.fillStyle = ink.bg; g.beginPath();
if (Math.abs(c.ny) >= Math.abs(c.nx)) {
const ex = U.clamp(c.tx, x + 12, x + w - 12), ey = c.ty < y ? y : y + h, dy = c.ty < y ? -1 : 1;
if (c.ty < y - 3 || c.ty > y + h + 3) { g.moveTo(ex - 6, ey); g.lineTo(ex + 6, ey); g.lineTo(ex + (c.tx - ex) * 0.4, ey + dy * Math.min(10, Math.abs(ey - c.ty))); }
} else {
const ey = U.clamp(c.ty, y + 10, y + h - 10), ex = c.tx < x ? x : x + w, dx = c.tx < x ? -1 : 1;
if (c.tx < x - 3 || c.tx > x + w + 3) { g.moveTo(ex, ey - 6); g.lineTo(ex, ey + 6); g.lineTo(ex + dx * Math.min(10, Math.abs(ex - c.tx)), ey + (c.ty - ey) * 0.4); }
}
g.fill();
}
g.textAlign = 'left'; g.textBaseline = 'top';
lines.forEach((l, i) => { g.font = font(FS, l.b); g.fillStyle = ink[l.r] || ink.text; g.fillText(l.t, x + pad, y + pad + i * lh); });
}
function spotCands(sp) {
const q = seatOf(sp), qx = SX(q.x), qy = SY(q.y), bx = SX(sp.x - sp.nx * OFF), by = SY(sp.y - sp.ny * OFF), tx = -sp.ny, ty = sp.nx;
const out = { sx: bx, sy: by, nx: -sp.nx, ny: -sp.ny, gap: 0.95 * K };
const inn = { sx: qx, sy: qy, nx: sp.nx, ny: sp.ny, gap: 0.6 * K, tx: qx, ty: qy };
const s1 = { sx: qx, sy: qy, nx: tx, ny: ty, gap: 1.3 * K, tx: qx, ty: qy }, s2 = Object.assign({}, s1, { nx: -tx, ny: -ty });
return Math.abs(sdist(SPOT_S[sp.id], HUT_S)) < 12 ? [inn, s1, s2, out] : [out, inn, s1, s2];
}
function wrapText(g, text, maxW) {
const words = text.split(' '), out = [];
let cur = '';
for (const w of words) {
const t = cur ? cur + ' ' + w : w;
if (cur && g.measureText(t).width > maxW) { out.push(cur); cur = w; } else cur = t;
}
if (cur) out.push(cur);
return out;
}
const AVOID_IDS = ['dao-top', 'dao-hint', 'dao-btns', 'toasts', 'on-hud'];
let domRects = null, domObs = null;
const domDirty = () => { domRects = null; };
function domAvoid() {
if (!domObs && window.ResizeObserver && window.MutationObserver) {
domObs = { ro: new ResizeObserver(domDirty), mo: new MutationObserver(domDirty), seen: new WeakSet() };
window.addEventListener('resize', domDirty);
}
if (domObs) {
for (const id of AVOID_IDS) {
const el = $(id);
if (el && !domObs.seen.has(el)) { domObs.seen.add(el); domObs.ro.observe(el); domObs.mo.observe(el, { attributes: true, childList: true, characterData: true, subtree: true }); domRects = null; }
}
if (domRects) return domRects;
}
const cr = cv.getBoundingClientRect(), out = [];
for (const id of AVOID_IDS) {
const el = $(id), b = el && el.getBoundingClientRect();
if (b && b.width && b.height) out.push({ x: b.left - cr.left - 4, y: b.top - cr.top - 4, w: b.width + 8, h: b.height + 8, hard: id !== 'toasts' });
}
return (domRects = out);
}
function drawCards(g, labels) {
const maxW = Math.min(VW * 0.42, FS * 19), used = new Set();
let anchor = null;
const speech = b => { g.font = font(FS); return wrapText(g, b.text, maxW).map(t => ({ t, r: 'text' })); };
const fade = b => { const k = WK.t - b.t0; return U.clamp(k < 0.2 ? k / 0.2 : k > b.dur - 0.4 ? (b.dur - k) / 0.4 : 1, 0, 1); };
const p = pathAt(WK.s), px = SX(p.x), py = SY(p.y), m = mini(), avoid = [{ x: px - 0.85 * K, y: py - 0.85 * K, w: 1.7 * K, h: 1.7 * K, hard: true }, { x: m.x - 4, y: m.y - 4, w: m.w + 8, h: m.h + 8, hard: true }];
for (const r of domAvoid()) avoid.push(r);
for (const L of labels) {
const sp = L.sp, b = WK.bubbles.find(x => x.sid === sp.id);
if (L.n && L.n.id === WK.card && !b && !L.catchOf) continue;
let lines, border;
if (L.own) {
lines = [{ t: `ช่อง ${sp.id} · ที่นั่งของคุณ`, b: true, r: 'gold' }, { t: `กระชัง ${L.kn} ตัว${WK.nearSeat ? ' · กด “นั่งตกปลา” เพื่อกลับมานั่ง' : ''}`, r: 'info' }];
border = 'rgba(242,193,78,0.7)';
} else if (L.catchOf) {
const f = fishName(L.catchOf.fish), fn = f === 'ปลา' ? 'ปลา' : 'ปลา' + f;
lines = [{ t: `🎣 ${L.n.name} ได้${fn} ${U.fmtKg(L.catchOf.w)}!`, b: true, r: 'good' }];
border = 'rgba(95,196,106,0.8)';
} else {
const n = L.n;
lines = [{ t: `ช่อง ${sp.id} · ${n.name}`, b: true, r: 'name' },
{ t: n.n ? `${n.n} ตัว · ${n.kg.toFixed(1)} กก. · ใหญ่สุด ${U.fmtKg(n.big)}` : 'ยังไม่ได้ปลาเลย', r: 'info' }];
if (n.real && CC.Online && CC.Online.ttText) lines.splice(1, 0, { t: CC.Online.ttText(n), r: 'good' });
if (!b && L.fx && nowAbs() - L.fx.at < 20) {
const f = fishName(L.fx.fish), fn = f === 'ปลา' ? 'ปลา' : 'ปลา' + f;
lines.push({ t: `เพิ่งได้${fn} ${U.fmtKg(L.fx.w)}`, r: 'good' });
}
}
if (b) { used.add(b); g.globalAlpha = Math.max(0.35, fade(b)); }
card(g, spotCands(sp), b ? lines.concat(speech(b)) : lines, b ? 'light' : 'dark', border, avoid);
g.globalAlpha = 1;
if (L.n && L.n.id === WK.card) anchor = avoid[avoid.length - 1];
}
for (const b of WK.bubbles) {
if (used.has(b)) continue;
g.globalAlpha = fade(b);
const lines = [{ t: b.who, b: true, r: 'name' }].concat(speech(b));
let cands;
if (b.me) cands = [{ sx: px, sy: py, nx: p.ty, ny: -p.tx, gap: 0.9 * K }, { sx: px, sy: py, nx: 0, ny: -1, gap: 0.9 * K }, { sx: px, sy: py, nx: 0, ny: 1, gap: 0.9 * K }];
else if (b.sid) cands = spotCands(M.spot(b.sid));
else { const sx = SX(b.x), sy = SY(b.y); cands = [[b.nx, b.ny], [1, 0], [0, 1], [0, -1]].map(([nx, ny]) => ({ sx, sy, nx, ny, gap: 0.6 * K, tx: sx, ty: sy })); }
card(g, cands, lines, 'light', null, avoid);
g.globalAlpha = 1;
}
return { anchor, avoid };
}
let cardSz = null;
window.addEventListener('resize', () => { cardSz = null; });
function placeCard(info) {
const el = $('dao-xem');
if (!el) return;
const n = WK.card && !D.watch ? M.npcAt(WK.card) : null;
if (!n || !CC.Xem) { if (!el.classList.contains('hidden')) el.classList.add('hidden'); return; }
const T = CC.Xem.tier(n);
const t1 = `${n.name} · ช่อง ${n.id}`;
const t2 = n.real && CC.Online && CC.Online.cardText ? CC.Online.cardText(n)
: `ฝีมือ: ${T.name} ${CC.Xem.stars(n)}\n${n.n ? `${n.n} ตัว · ${n.kg.toFixed(1)} กก. · ใหญ่สุด ${U.fmtKg(n.big)}` : 'ยังไม่ได้ปลาเลย'}`;
if (!cardSz || cardSz.t1 !== t1 || cardSz.t2 !== t2 || el.classList.contains('hidden')) {
setText($('dao-xem-t'), t1); setText($('dao-xem-d'), t2);
el.classList.remove('hidden');
cardSz = { t1, t2, w: el.offsetWidth, h: el.offsetHeight };
}
const w = cardSz.w, h = cardSz.h, q = seatOf(M.spot(n.id)), sx = SX(q.x), sy = SY(q.y);
const a = info && info.anchor ? info.anchor : { x: sx - 0.7 * K, y: sy - 0.7 * K, w: 1.4 * K, h: 1.4 * K };
const avoid = (info && info.avoid) || [], gap = 6;
const cands = [{ x: a.x, y: a.y + a.h + gap }, { x: a.x, y: a.y - h - gap }, { x: a.x + a.w + gap, y: a.y }, { x: a.x - w - gap, y: a.y },
{ x: a.x + a.w - w, y: a.y + a.h + gap }, { x: a.x + a.w - w, y: a.y - h - gap }, { x: a.x + a.w + gap, y: a.y + a.h - h }, { x: a.x - w - gap, y: a.y + a.h - h },
{ x: sx - w / 2, y: sy - h - 1.2 * K }, { x: sx - w / 2, y: sy + 1.2 * K }];
const area = (b, r) => Math.max(0, Math.min(b.x + b.w, r.x + r.w) - Math.max(b.x, r.x)) * Math.max(0, Math.min(b.y + b.h, r.y + r.h) - Math.max(b.y, r.y));
let best = null, bestS = Infinity;
for (const c of cands) {
const r = { x: U.clamp(c.x, 6, VW - w - 6), y: U.clamp(c.y, 6, VH - h - 6), w, h };
let sc = (Math.abs(r.x - c.x) + Math.abs(r.y - c.y)) * 20;
for (const b of avoid) if (b !== a) sc += area(b, r) * (b.hard ? 6 : 1);
if (sc < bestS) { bestS = sc; best = r; if (sc === 0) break; }
}
const tr = `translate(${Math.round(best.x)}px, ${Math.round(best.y)}px)`;
if (el.style.transform !== tr) el.style.transform = tr;
}
function mini() {
const w = Math.round(U.clamp(VW * 0.21, 120, 210)), h = Math.round(w * 0.64);
const k = Math.min((w - 10) / (PW + 14), (h - 10) / (PH + 20));
const x = VW - w - 8, y = 8;
const ox = x + (w - (PW + 14) * k) / 2 + 7 * k, oy = y + (h - (PH + 20) * k) / 2 + 6 * k;
return { x, y, w, h, k, mx: wx => ox + wx * k, my: wy => oy + wy * k, wx: sx => (sx - ox) / k, wy: sy => (sy - oy) / k };
}
function drawMini(g, t) {
const m = mini();
g.fillStyle = 'rgba(10,16,20,0.78)'; rrect(g, m.x, m.y, m.w, m.h, 8); g.fill();
g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1; g.stroke();
g.save(); g.translate(m.mx(0), m.my(0)); g.scale(m.k, m.k);
loopPath(g, OFF); g.strokeStyle = 'rgba(190,165,120,0.9)'; g.lineWidth = Math.max(1.4, 2 / m.k); g.stroke();
const col = WATER[CC.pond().id] || WATER.rophi;
g.fillStyle = col[0]; g.fillRect(0, 0, PW, PH);
g.fillStyle = '#b5523b'; g.fillRect(HUT.x, HUT.y, HUT.w, HUT.h);
const ca = CC.P.ca;
for (const sp of M.spots) {
const n = M.npcAt(sp.id), own = ca && ca.o === sp.id;
if (!n && !own) continue;
const q = seatOf(sp);
g.fillStyle = own ? '#f2c14e' : n && n.real ? '#4ea3ff' : n && WK.greeted.has(sp.id) ? '#c9d6d0' : '#8a8f94';
const r = own ? 2.2 : n && n.real ? 1.8 : 1.3;
g.fillRect(q.x - r, q.y - r, r * 2, r * 2);
}
if (WK.dest != null) { const d = pathAt(WK.dest); g.strokeStyle = '#ffe9a8'; g.lineWidth = 1.2 / m.k * 1.5; g.beginPath(); g.arc(d.x, d.y, 2.2, 0, TAU); g.stroke(); }
g.restore();
g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 1;
const vx0 = m.mx(WX(0)), vy0 = m.my(WY(0)), vx1 = m.mx(WX(VW)), vy1 = m.my(WY(VH));
g.save(); rrect(g, m.x, m.y, m.w, m.h, 8); g.clip(); g.strokeRect(vx0, vy0, vx1 - vx0, vy1 - vy0); g.restore();
const p = pathAt(WK.s), px = m.mx(p.x), py = m.my(p.y), pulse = 3 + (t * 2 % 1) * 4;
g.strokeStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(px, py, pulse, 0, TAU); g.stroke();
g.fillStyle = '#ffffff'; g.beginPath(); g.arc(px, py, 2.8, 0, TAU); g.fill();
g.font = font(11); g.textAlign = 'center'; g.textBaseline = 'middle';
g.fillText('🥤', m.mx(HUT.x + HUT.w / 2), m.my(HUT.y + HUT.h + 3.2));
}
function hitTest(wx, wy) {
if (wx > HUT.x - 1 && wx < HUT.x + HUT.w + 1.5 && wy > HUT.y - 2.4 && wy < HUT.y + HUT.h + 0.6) return { s: HUT_S, act: 'shop' };
const ca = CC.P.ca;
let best = null, bd = 2.1;
for (const sp of M.spots) {
const own = ca && ca.o === sp.id, n = M.npcAt(sp.id);
if (!own && !n) continue;
const q = seatOf(sp), d = Math.hypot(q.x - sp.nx * 0.4 - wx, q.y - sp.ny * 0.4 - wy);
if (d < bd) { bd = d; best = { s: SPOT_S[sp.id], act: own ? 'sit' : 'npc:' + sp.id, id: sp.id }; }
}
return best;
}
function pointerWorld(e) {
const r = cv.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top, m = mini();
if (sx >= m.x && sx <= m.x + m.w && sy >= m.y && sy <= m.y + m.h) return { x: m.wx(sx), y: m.wy(sy), mini: true };
return { x: WX(sx), y: WY(sy), mini: false };
}
function onDown(e) {
if (!D.on || UI.isOpen()) return;
if (e.button != null && e.button !== 0) return;
e.preventDefault();
if (CC.Audio && CC.Audio.init) CC.Audio.init();
const w = pointerWorld(e), hit = hitTest(w.x, w.y);
if (hit) {
setDest(hit.s, hit.act, hit.act === 'sit');
if (hit.id && hit.act !== 'sit') { WK.hover = hit.id; showCard(hit.id); }
return;
}
setDest(project(w.x, w.y).s, null);
if (!w.mini) { WK.drag = e.pointerId; try { cv.setPointerCapture(e.pointerId); } catch (err) {   } }
}
function onMove(e) {
if (!D.on) return;
const w = pointerWorld(e);
if (WK.drag === e.pointerId) { if (!UI.isOpen()) setDest(project(w.x, w.y).s, null); return; }
if (e.pointerType === 'mouse') {
const hit = w.mini ? null : hitTest(w.x, w.y);
WK.hover = hit && hit.id ? hit.id : 0;
cv.style.cursor = hit || w.mini ? 'pointer' : 'default';
}
}
function onUp(e) { if (WK.drag === e.pointerId) WK.drag = null; }
dbg.screen = (x, y) => [Math.round(SX(x)), Math.round(SY(y))];
dbg.hit = (sx, sy) => { const w = { x: WX(sx), y: WY(sy) }; return { w, hit: hitTest(w.x, w.y) }; };
const KEYMAP = { arrowleft: 'l', a: 'l', arrowright: 'r', d: 'r', arrowup: 'u', w: 'u', arrowdown: 'd', s: 'd' };
function onKey(e) {
if (e.ctrlKey || e.metaKey || e.altKey) return;
const tg = e.target;
if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return;
const k = (e.key || '').toLowerCase();
if (!D.on) {
if (k === 't' && !e.repeat && CC.P && !UI.isOpen()) { e.preventDefault(); e.stopImmediatePropagation(); D.start(); }
return;
}
if (UI.isOpen()) return;
e.stopImmediatePropagation();
if (D.watch) { if (CC.Xem && CC.Xem.key) CC.Xem.key(e); return; }
if (KEYMAP[k]) { e.preventDefault(); WK.keys[KEYMAP[k]] = true; return; }
if (e.repeat) return;
if (k === 'enter' || k === 'e' || e.code === 'Space') { e.preventDefault(); interact(); }
else if (k === 'escape' || k === 't') { e.preventDefault(); goHome(); }
else if (k === 'q') { e.preventDefault(); goShop(); }
}
function onKeyUp(e) { const k = (e.key || '').toLowerCase(); if (KEYMAP[k]) WK.keys[KEYMAP[k]] = false; }
const HINT_TOUCH = 'แตะจุดที่ต้องการเดินไป · แตะนักตกปลาข้างบ่อเพื่อทักทายและดูเขาตก · แตะแผนที่ย่อเพื่อเดินไปไกลๆ';
const HINT_PC = 'คลิกจุดที่ต้องการไป หรือกดลูกศร / WASD · คลิกนักตกปลา: นั่งดูเขาตก · Q: ไปซุ้มน้ำ · Enter: เข้าร้าน / นั่งตก · Esc: กลับช่อง';
const setText = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
function hud(force) {
const P = CC.P, ca = P && P.ca, Wd = CC.world;
if (!P) return;
setText($('dao-clock'), Wd.clock());
if (ca && ca.active) {
const left = Math.max(0, ca.end - (Wd.minutes + (Wd.day - ca.day) * 1440));
setText($('dao-ca'), `รอบเหลือ ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`);
}
setText($('dao-money'), U.fmtMoney(P.money));
const ll = luckLeft(), le = $('dao-luck');
if (le) { le.classList.toggle('hidden', !(ll > 0)); if (ll > 0) setText(le, `⚡ โชคดี ${Math.ceil(ll)}′`); }
const bs = $('dao-b-shop'), bh = $('dao-b-home');
setText(bs, WK.nearHut ? '🥤 เข้าร้านน้ำ' : '🥤 ไปซุ้มน้ำ');
if (bs) bs.classList.toggle('hot', WK.nearHut);
setText(bh, WK.nearSeat ? '🎣 นั่งตกปลา' : '🪑 กลับช่อง');
if (bh) bh.classList.toggle('good', WK.nearSeat);
let tip;
if (WK.t - (WK.t0 || 0) < 7 && !WK.dist) tip = UI.touch ? HINT_TOUCH : HINT_PC;
else if (WK.nearHut) tip = '🥤 ซุ้มน้ำเจ้าของบ่อ — มีเครื่องดื่มชูกำลังปลาไนทอง (⚡ เสริมดวงตกปลา)';
else if (WK.dest != null && WK.act === 'shop') tip = '🥤 กำลังเดินไปซุ้มน้ำที่ศาลาบ่อ…';
else if (WK.dest != null && WK.act === 'sit') tip = `🪑 กำลังเดินกลับช่อง ${ca ? ca.o : ''}…`;
else if (WK.card && M.npcAt(WK.card)) tip = `👀 “นั่งดูเพื่อนตก”: ดู ${M.npcAt(WK.card).name} ${M.npcAt(WK.card).real ? 'อัดปลาแบบสดๆ ออนไลน์' : 'อ่านทุ่นและอัดปลา'}`;
else if (WK.nearSeat && WK.dist > 5) tip = '🎣 เดินกลับมาถึงที่นั่งแล้ว — กด “นั่งตกปลา”';
else tip = `เดินเล่นใช้เวลาในเกม: ประมาณ 1 นาที ต่อ 20 ม.${UI.touch ? '' : ' · Q: ไปซุ้มน้ำ · Esc: กลับช่อง'}`;
setText($('dao-hint'), tip);
if (force) hudTick(true);
}
let hudT = 0, wasOn = false;
function hudTick(force) {
const now = performance.now();
if (!force && now - hudT < 300) return;
hudT = now;
if (!CC.P) return;
const ll = luckLeft(), on = ll > 0, el = $('h-luck');
if (el) { el.classList.toggle('hidden', !on); if (on) setText(el, `⚡ โชคดี · เหลือ ${Math.ceil(ll)} นาที`); }
const b = $('btn-dao'), s = S(), ca = CC.P.ca, st = CC.G && CC.G.state;
if (b) {
b.classList.toggle('on', on);
b.classList.toggle('hidden', D.on || !(ca && ca.active && ca.o) || st === 'fighting' || st === 'landed');
}
if (wasOn && !on && ca && ca.active) UI.toast(s && s.cans < LUCK.cans ? '⚡ ปลาไนทองหมดฤทธิ์แล้ว แวะซุ้มน้ำจัดอีกสักกระป๋องไหม?' : '⚡ โชคดีหมดแล้ว — รอบนี้ดื่มครบ 2 กระป๋องแล้ว', 'info', 4500);
wasOn = on;
const G = CC.G;
if (s && !s.hint && !D.on && ca && ca.active && ca.o && G && (G.state === 'hand' || G.state === 'waiting') && !UI.isOpen() &&
CC.world.minutes + (CC.world.day - ca.day) * 1440 - ca.start > 25) {
s.hint = 1;
UI.toast(`🚶 นั่งนานเมื่อยหลังไหม? กด “เดินเล่น”${UI.touch ? '' : ' (ปุ่ม T)'} แวะซุ้มน้ำจัดเครื่องดื่มปลาไนทอง — ช่วยเสริมดวงตกปลา!`, 'info', 7000);
if (b) { b.classList.add('glow'); setTimeout(() => b.classList.remove('glow'), 7000); }
}
}
const baseTick = UI.tick;
UI.tick = function () {
const r = baseTick.apply(this, arguments);
try { hudTick(); } catch (e) {   }
return r;
};
const R = CC.Render, baseDraw = R && R.draw;
if (baseDraw) R.draw = function () { if (D.on && !D.watch) return; return baseDraw.apply(this, arguments); };
const ITEMS = [
{ id: 'tangluc', icon: '🥫', name: 'เครื่องดื่มชูกำลังปลาไนทอง (น้ำเสริมดวง)', price: LUCK.price, min: 2, luck: true },
{ id: 'trada', icon: '🧊', name: 'ชาดำเย็น', price: 3, min: 2, desc: 'ชาดำเย็นร้านริมบ่อ เย็นชื่นใจ', say: '🧊 ชาดำเย็นชื่นใจ — หายเหนื่อยเป็นปลิดทิ้ง!', me: 'สดชื่นสุดๆ!' },
{ id: 'nuocsuoi', icon: '💧', name: 'น้ำดื่มแช่เย็น', price: 5, min: 1, desc: 'น้ำดื่มเย็นเจี๊ยบแก้กระหาย', say: '💧 อึกๆ… หายคอแห้งเลย', me: 'หายกระหายเลย' },
{ id: 'caphe', icon: '☕', name: 'กาแฟเย็นโบราณ', price: 15, min: 3, desc: 'เข้มข้น หวานมัน นั่งจิบชิลๆ', say: '☕ กาแฟเย็นเข้มข้น — ตาสว่างเลย!', me: 'ตาสว่างเลย!' }
];
const ITEM_BY_ID = {};
ITEMS.forEach(it => { ITEM_BY_ID[it.id] = it; });
PN.dao = () => {
const P = CC.P, s = S(), ll = Math.ceil(luckLeft()), cans = s ? s.cans : 0;
const cards = ITEMS.map(it => {
if (it.luck) {
const full = cans >= LUCK.cans, label = full ? 'ครบ 2 กระป๋องแล้ว' : cans ? `ดื่มกระป๋องที่สอง (+${LUCK.min2} นาที)` : 'ซื้อ & ดื่ม';
return `<div class="card dao-can"><div class="t">${it.icon} ${it.name}</div>
          <div class="d">ดื่มแล้วได้ ⚡ <b>โชคดี ${LUCK.min1} นาที</b>: ปลากินถี่ขึ้นราว ${Math.round((LUCK.bite - 1) * 100)}%, มีโอกาสเจอปลาไซส์ใหญ่ขึ้น,
          และเจอปลาติดป้ายรางวัลง่ายขึ้นเกือบเท่าตัว<br>รอบละไม่เกิน ${LUCK.cans} กระป๋อง — กระป๋องที่สองเพิ่มอีก ${LUCK.min2} นาที สะสมได้สูงสุด ${LUCK.maxMin} นาที (ควรดื่มตอนใกล้หมด) จบรอบจะหมดผลทันที</div>
          <div class="row"><span class="price">${it.price} ฿</span><button class="good" data-act="dao-buy" data-id="${it.id}" ${full || P.money < it.price ? 'disabled' : ''}>${label}</button></div></div>`;
}
return `<div class="card"><div class="t">${it.icon} ${it.name}</div><div class="d">${it.desc} <span class="dim">ดื่มเพื่อความเพลิดเพลิน</span></div>
        <div class="row"><span class="price">${it.price} ฿</span><button data-act="dao-buy" data-id="${it.id}" ${P.money < it.price ? 'disabled' : ''}>ดื่ม</button></div></div>`;
}).join('');
return `<h2>🥤 ซุ้มน้ำเจ้าของบ่อ</h2>
      <div class="sub">${OWNER.name}: “${ownerLine()}”<br>เงิน: <b class="price">${U.fmtMoney(P.money)} ฿</b></div>
      <div class="dao-st${ll ? ' on' : ''}">${ll ? `⚡ <b>กำลังโชคดี</b> — เหลืออีก <b>${ll} นาที</b>` : 'ยังไม่มีผลโชคดี'} · รอบนี้ดื่มน้ำเสริมดวงแล้ว <b>${cans}/${LUCK.cans}</b> กระป๋อง</div>
      <div class="grid">${cards}</div>
      <p class="dao-note dim">ซื้อเครื่องดื่มและนั่งจิบใช้เวลา 1–3 นาที เดินเล่นใช้เวลาประมาณ 1 นาทีต่อ 20 ม.</p>
      <div class="btnrow"><button class="good" data-act="dao-home">🪑 กลับช่องนั่งตก</button><button data-act="dao-walk">🚶 เดินเล่นต่อ</button></div>`;
};
function buy(id) {
const it = ITEM_BY_ID[id], P = CC.P, s = S();
if (!it || !s || !P) return;
if (P.money < it.price) { UI.toast('เงินไม่พอ!', 'bad'); return; }
if (it.luck && !s.ca) { UI.toast('ต้องอยู่ในรอบตกปลาก่อน จึงจะดื่มเสริมดวงได้', 'info'); return; }
if (it.luck && s.cans >= LUCK.cans) { UI.toast(`${OWNER.name}: “ดื่มไป 2 กระป๋องแล้ว เดี๋ยวนอนไม่หลับเอานะ!”`, 'info'); return; }
P.money -= it.price;
CC.world.minutes += it.min;
if (it.luck) {
const now = nowAbs(), left = U.clamp(s.until - now, 0, LUCK.maxMin), add = s.cans ? LUCK.min2 : LUCK.min1;
const after = Math.min(LUCK.maxMin, left + add);
s.until = now + after;
s.cans++; s.total = (s.total || 0) + 1;
wasOn = true;
const tot = Math.round(after);
UI.toast(s.cans === 1 ? `🥫 อึก… ปลาไนทองเย็นชื่นใจ! ⚡ โชคดี ${tot} นาที: ปลากินจัดขึ้น เจอปลาใหญ่และปลาติดป้ายง่ายขึ้น`
: `🥫 กระป๋องที่สอง — ⚡ ${left + add > LUCK.maxMin ? `โชคดีเต็มเพดาน ${tot} นาที` : `เพิ่มอีก ${add} นาที รวมเหลือ ${tot} นาที`} รอบนี้ครบ ${LUCK.cans} กระป๋องแล้วนะ`, 'good', 5000);
if (D.on) meSay('อา… ตาสว่างขึ้นมาเลย!');
} else {
UI.toast(it.say, 'good');
if (D.on) meSay(it.me);
}
if (CC.Audio && CC.Audio.coin) CC.Audio.coin();
if (UI.current === 'dao') UI.rerender(); else UI.refresh();
hudTick(true);
if (CC.save) CC.save();
}
const baseAct = UI.onAction;
UI.onAction = function (act, btn) {
if (typeof act === 'string' && act.indexOf('dao-') === 0) {
const d = (btn && btn.dataset) || {};
if (act === 'dao-buy') buy(d.id);
else if (act === 'dao-home') { UI.close(); if (D.on) goHome(); }
else if (act === 'dao-walk') UI.close();
return;
}
return baseAct.apply(this, arguments);
};
const baseHelp = PN.help;
if (baseHelp) PN.help = function () {
let html = baseHelp.apply(this, arguments);
const key = '<span><kbd>T</kbd></span><span>เดินเล่นรอบบ่อ (เมื่ออยู่ในรอบตกปลา): แวะซุ้มน้ำเจ้าของบ่อ หรือนั่งดูเพื่อนข้างบ่อตกปลา</span>';
const g = '<span><kbd>G</kbd></span>';
html = html.includes(g) ? html.replace(g, key + g) : html;
const sec = `<h3>เดินเล่น และซุ้มน้ำ</h3>
      <p>• กดปุ่ม <b>🚶 เดินเล่น</b> (มุมซ้าย เหนือแถวปุ่มด้านล่าง หรือปุ่ม <kbd>T</kbd>) ขณะอยู่ในรอบตกปลา: วางคันแล้วลุกเดินเลียบริมบ่อ ผ่านช่องนักตกปลาข้างบ่อจะเห็นชื่อ จำนวนตัว น้ำหนัก และบางทีพวกเขาก็ทักทายหรืออวดปลาให้ดู</p>
      <p>• มือถือ: แตะจุดที่ต้องการเดินไป (แตะค้างแล้วลากเพื่อเดินตาม) แตะแผนที่ย่อมุมบนเพื่อเดินไปไกลๆ · คอมพิวเตอร์: คลิก หรือใช้ปุ่มลูกศร / WASD</p>
      <p>• การเดินเล่นใช้เวลาในเกมประมาณ 1 นาทีต่อ 20 ม. หากเดินห่างจากจุดอ่อยนาน ปลาในจุดจะค่อยๆ จางลง กด <b>🪑 กลับช่อง</b> (<kbd>Esc</kbd>) เพื่อเดินกลับมานั่งที่เดิมอัตโนมัติ</p>
      <p>• <b>นั่งดูเพื่อนข้างบ่อตกปลา</b>: แตะ (คลิก) ที่นักตกปลาข้างบ่อ → การ์ดแสดงชื่อ ระดับฝีมือ (มือใหม่ · พอตัว · ฝีมือดี · ระดับเซียน) และสถิติ → กด <b>👀 นั่งดูเพื่อนตก</b> (คอมพิวเตอร์: <kbd>Enter</kbd>) จอจะตัดเข้ามุมมองด้านข้างด้านหลังเขา ใช้คัน สาย ทุ่น และเหยื่อจริงของคนนั้น</p>
      <p>• แถวบนสุดบอก <b>อาการทุ่นและความหมาย</b> ("ทุ่นแตะเบาๆ แล้วดีดคืน — ปลาตะเพียนจีนแตะลองเหยื่อ ยังไม่วัด", "ทุ่นจมคมๆ 1 ข้อ — ปลานิลฮุบเหยื่อ: วัดเบ็ด!") แถวล่างบอก <b>สิ่งที่คนนั้นทำ</b> กราฟ <b>📈 อาการทุ่น</b> แสดงเส้นทุ่น 12 วินาทีล่าสุด: แถบสีเขียวคือช่วงปลาอมเหยื่อ, ⚡ คือจังหวะที่เขาวัดเบ็ด (ติด / วืด)</p>
      <p>• ระดับเซียนจะนิ่งรอจังหวะทุ่นลองเชิง แล้ววัดแม่นตอนจังหวะกินจริง ส่วนมือใหม่มักรีบวัดตามจังหวะลองหรือวัดช้าจนวืดบ่อย เมื่อติดปลาดูการ <b>อัดปลา</b>: แถบแรงตึง แรงปลา และข้อความแสดงสถานะมือ <b>งัด</b>, <b>ผ่อนให้ปลาวิ่ง</b>, <b>ดึงเบี่ยงซ้าย / ขวา</b>, <b>ยกหัวให้ปลากลืนอากาศ</b>, <b>ช้อน</b></p>
      <p>• <b>🐢 ช้า ×0.5</b> (<kbd>Space</kbd>) ดูแบบสโลว์โมชัน, <b>👁 ดูใต้น้ำ</b> (<kbd>V</kbd>) มองทะลุน้ำเห็นตะกั่ว ตัวเบ็ด และปลาตอดเหยื่อ <b>🚶 เดินต่อ</b> (<kbd>Esc</kbd>) ลุกเดินต่อจากจุดนั้น เวลาในรอบยังเดินปกติขณะดู และปลาที่เพื่อนตกได้ตอนคุณดูจะถูกนับลงสถิติบ่อด้วย</p>
      <p>• <b>ซุ้มน้ำ</b> อยู่ตรงศาลาเจ้าของบ่อ (ฝั่งใต้ กด <kbd>Q</kbd> เพื่อเดินไป): <b>เครื่องดื่มชูกำลังปลาไนทอง (น้ำเสริมดวง)</b> ${LUCK.price} ฿ ให้ผล <b>⚡ โชคดี ${LUCK.min1} นาที</b> — ปลากินถี่ขึ้น เจอปลาใหญ่และปลาติดป้ายรางวัลบ่อยขึ้น รอบละไม่เกิน ${LUCK.cans} กระป๋อง กระป๋องที่สองเพิ่ม ${LUCK.min2} นาที จบรอบหมดผลทันที ส่วนชาดำเย็น น้ำดื่ม กาแฟ เป็นเมนูเติมบรรยากาศ</p>`;
const at = html.indexOf('<h3>การหาเงิน</h3>');
return at >= 0 ? html.slice(0, at) + sec + html.slice(at) : html + sec;
};
function boot() {
if (root) return;
const b = document.createElement('button');
b.id = 'btn-dao'; b.type = 'button'; b.className = 'hud hidden';
b.textContent = UI.touch ? '🚶 เดินเล่น' : '🚶 เดินเล่น (T)';
b.title = 'เดินเล่นรอบบ่อ แวะซุ้มน้ำเจ้าของบ่อซื้อเครื่องดื่มเสริมดวง';
b.addEventListener('click', () => D.start());
($('game') || document.body).appendChild(b);
const tl = $('hud-tl');
if (tl) { const row = document.createElement('div'); row.id = 'h-luck'; row.className = 'row hidden'; tl.appendChild(row); }
root = document.createElement('div');
root.id = 'dao'; root.className = 'hidden';
root.innerHTML = `<canvas id="dao-cv"></canvas>
      <div id="dao-top"><div><b>🚶 เดินเล่น</b> · <span id="dao-clock"></span> · <span id="dao-ca" class="dim"></span></div>
        <div><span class="money">💰 <span id="dao-money"></span> ฿</span> <span id="dao-luck" class="hidden"></span></div></div>
      <div id="dao-hint"></div>
      <div id="dao-btns"><button id="dao-b-shop" type="button">🥤 ไปซุ้มน้ำ</button><button id="dao-b-home" type="button">🪑 กลับช่อง</button></div>
      <div id="dao-xem" class="hidden"><div id="dao-xem-t"></div><div id="dao-xem-d"></div>
        <button id="dao-xem-go" type="button" class="good">👀 นั่งดูเพื่อนตก${UI.touch ? '' : ' (Enter)'}</button></div>`;
($('game') || document.body).appendChild(root);
cv = $('dao-cv'); ctx = cv.getContext('2d');
$('dao-xem-go').addEventListener('click', () => { if (D.on && !D.watch) watchCard(); });
cv.addEventListener('pointerdown', onDown);
cv.addEventListener('pointermove', onMove);
cv.addEventListener('pointerup', onUp);
cv.addEventListener('pointercancel', onUp);
cv.addEventListener('contextmenu', e => e.preventDefault());
$('dao-b-shop').addEventListener('click', () => { if (D.on && !UI.isOpen()) goShop(); });
$('dao-b-home').addEventListener('click', () => { if (D.on && !UI.isOpen()) goHome(); });
window.addEventListener('keydown', onKey, true);
window.addEventListener('keyup', onKeyUp, true);
window.addEventListener('blur', () => { WK.keys = {}; });
window.addEventListener('resize', () => { if (D.on) { resize(); clampCam(); } });
}
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
else boot();
})();
