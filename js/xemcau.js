(function () {
const U = CC.U, M = CC.PondMap, Pond = CC.Pond, Rig = CC.Rig;
const DEG = Math.PI / 180, REST = 3 * DEG, CHART_SEC = 12;
const X = CC.Xem = { on: false, slow: false, id: 0 };
const hasDom = typeof document !== 'undefined' && !!document.createElement;
const $ = id => (hasDom ? document.getElementById(id) : null);
const UIx = () => CC.UI || {};
const Rn = () => CC.Render;
const nowAbs = () => CC.world.day * 1440 + CC.world.minutes;
const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; };
const rnd = (m, s) => Math.max(0.05, m + U.gauss() * s);
const byId = (list, id) => list.find(x => x.id === id) || list[0];
const SPN = { rophi: 'ปลานิล', dieuhong: 'ปลาทับทิม', diec: 'ปลาตะเพียนจีน', chep: 'ปลาไน', tramden: 'ปลาเฉาดำ', mehoa: 'ปลาซ่ง', muong: 'ปลาแปบ', thebe: 'ปลาซิว', tramco: 'ปลาเฉา', chimtrang: 'ปลาเปคู', troi: 'ปลายี่สกเทศ' };
const spName = sp => (sp && SPN[sp.id]) || (sp && sp.name ? sp.name.replace(/^ปลา/, '').replace(/ \(.*\)$/, '') : 'ปลา');
const num = (x, d) => x.toFixed(d == null ? 1 : d);
const half = x => { const r = Math.round(x * 2) / 2; return r % 1 ? r.toFixed(1) : String(r); };
function nac(x) {
if (x < 0.12) return 'แผ่วๆ';
const r = Math.round(x * 4) / 4;
const W = { 0.25: '¼ ข้อ', 0.5: 'ครึ่งข้อ', 0.75: '¾ ข้อ', 1: '1 ข้อ', 1.5: '1 ข้อครึ่ง', 2: '2 ข้อ', 3: '3 ข้อ' };
return W[r] || (num(r, r % 0.5 ? 2 : 1).replace(/\.0$/, '') + ' ข้อ');
}
const TIERS = [
{ name: 'มือใหม่', stars: 1, reader: 'moi', react: [0.28, 0.55], aim: 0.11, soak: [80, 120], bare: [6, 14], rebait: [6, 9.5],
fight: { react: [0.55, 0.15], lapse: 0.08, netDelay: [0.9, 0.3], skill: 0 } },
{ name: 'พอตัว', stars: 2, reader: 'kha', react: [0.3, 0.5], aim: 0.06, soak: [60, 90], bare: [3, 7], rebait: [4.5, 7],
fight: { react: [0.42, 0.1], lapse: 0.04, netDelay: [0.6, 0.2], skill: 1 } },
{ name: 'ฝีมือดี', stars: 3, reader: 'gioi', react: [0.2, 0.32], aim: 0.035, soak: [45, 70], bare: [1.5, 3.5], rebait: [3.5, 5.5],
fight: { react: [0.28, 0.06], lapse: 0.02, netDelay: [0.4, 0.1], skill: 2 } },
{ name: 'ระดับเซียน', stars: 4, reader: 'cao', react: [0.18, 0.28], aim: 0.02, soak: [40, 60], bare: [1, 2.5], rebait: [3, 4.5],
fight: { react: [0.2, 0.04], lapse: 0.01, netDelay: [0.3, 0.08], skill: 3 } }
];
const tierIdx = n => (!n ? 0 : n.skill < 0.8 ? 0 : n.skill < 1.05 ? 1 : n.skill < 1.25 ? 2 : 3);
X.TIERS = TIERS;
X.tier = n => TIERS[tierIdx(n)];
X.stars = n => { const T = X.tier(n); return '★'.repeat(T.stars) + '☆'.repeat(4 - T.stars); };
function gearFor(n, pond, ti) {
const h = hash(n.name + '#' + n.id), L = CC.Dao && CC.Dao.look ? CC.Dao.look(n) : null;
const rl = L ? L.rod : [3.6, 4.5, 5.4][h % 3];
const pick = (a, k) => a[(h >>> k) % a.length];
let rod, line, hook, float, recipe, can = 4, cau = 2;
if (pond.type === 'latvot') {
rod = ti >= 2 || rl >= 5 ? 'd72' : 'd63'; line = ti >= 2 ? 'l80' : pick(['l50', 'l80'], 3); hook = 'i12'; float = 'cong25';
recipe = { nen: 2, tanh: 2, thom: 2, soi: 1 }; can = 3;
} else if (pond.id === 'diec') {
rod = rl >= 4.4 ? 'd45' : 'd36';
line = ['l15', 'l10', 'l08', 'l08'][ti];
hook = ti === 0 ? pick(['i3', 'i5'], 5) : 'i3';
float = ti >= 3 ? 'nano08' : ti === 2 ? pick(['nano08', 'nano12'], 7) : 'nano12';
recipe = ti === 0 ? { nen: 2, tanh: 3, cam: 2 } : { nen: 3, thom: 3, mat: 1, soi: 1 };
} else {
rod = rl >= 5 ? 'd54' : rl >= 4.4 ? 'd45' : 'd36';
if (pond.type === 'giai') { line = ti >= 2 ? 'l20' : pick(['l15', 'l20'], 3); hook = ti >= 2 ? 'i5' : pick(['i5', 'i7'], 5); }
else { line = ti === 0 ? pick(['l15', 'l15', 'l20'], 3) : ti === 3 ? pick(['l15', 'l10'], 3) : 'l15'; hook = ti === 0 ? pick(['i5', 'i5', 'i7'], 5) : 'i5'; }
float = ti >= 2 ? pick(['nano12', 'nano08', 'lau18'], 7) : pick(['nano12', 'lau18'], 7);
recipe = (CC.world.temp || 27) > 28 ? { nen: 3, tanh: 3, chua: 1, soi: 1 } : { nen: 3, tanh: 2, thom: 1, soi: 1 };
}
return { rod, line, hook, float, recipe, can, cau };
}
function makeBowls(g, pond) {
const B = CC.Bait, def = { dens: 1, dissolve: 85, stick: 0.62, cloud: 0.5, smell: {} };
let cau = null, xa = null;
try {
if (B && B.makeBowl) {
cau = B.makeBowl(g.recipe, 0.9, 'cau');
xa = B.makeBowl(pond.id === 'diec' ? { cam: 3, ra: 3, nen: 2, thom: 1 } : { cam: 3, ra: 3, nen: 2, tanh: 1 }, 0.65, 'xa');
}
} catch (e) {   }
cau = cau || Object.assign({}, def);
xa = xa || Object.assign({}, def, { cloud: 0.9, dissolve: 60 });
cau.portions = xa.portions = 9999;
return { cau, xa };
}
function npcSkin(n) {
const SK = CC.SKINS || {}, L = CC.Dao && CC.Dao.look ? CC.Dao.look(n)
: { umb: '#2e8b57', shirt: '#3d6f9a', hat: 'cap', hatC: '#2b2b2b', box: ['#e8e4dc', '#2f6fb8'] };
const tips = SK.tip || [], h = hash(n.name);
const own = {
box: { c1: L.box[0], c2: L.box[1], pat: 'plain' },
umb: { colors: L.umb2 ? [L.umb, L.umb2] : [L.umb] },
shirt: { color: L.shirt },
hat: L.hat === 'none' ? { type: 'cap', color: '#1e1712' } : { type: L.hat, color: L.hatC },
tip: tips.length ? tips[h % Math.min(4, tips.length)] : null
};
return cat => {
if (cat === 'tip' && tips[4] && CC.world.light() < 0.4) return tips[4];
return own[cat] || (SK[cat] ? SK[cat][0] : {});
};
}
function snapPond() { const s = {}; for (const k of Object.keys(Pond)) if (typeof Pond[k] !== 'function') s[k] = Pond[k]; return s; }
function loadPond(s) {
for (const k of Object.keys(Pond)) if (typeof Pond[k] !== 'function' && !(k in s)) delete Pond[k];
Object.assign(Pond, s);
}
let S = null;
const WG = X.G = {};
const NO_LUCK = { active: () => false, bite: () => 1, tag: () => 1, big: () => 0, left: () => 0 };
function withNpc(fn) {
const P = CC.P;
if (!S || !P) return undefined;
const keep = { rod: P.rod, line: P.line, hook: P.hook, float: P.float, bowls: P.bowls };
const pond = snapPond(), seed = CC.spotSeed, depth = CC.spotDepth, skin = CC.skin, luck = CC.Luck;
const Gm = CC.Game, hold = Gm && Gm.holding, slide = Gm && Gm.sliding;
try {
Object.assign(P, S.P);
loadPond(S.pond);
CC.spotSeed = S.seed; CC.spotDepth = S.depth;
CC.skin = S.skin; CC.Luck = NO_LUCK;
if (Gm) { Gm.holding = () => WG.state === 'fighting' && !!(S.fb && S.fb.holding); Gm.sliding = () => false; }
return fn();
} finally {
S.pond = snapPond();
loadPond(pond);
Object.assign(P, keep);
CC.spotSeed = seed; CC.spotDepth = depth; CC.skin = skin; CC.Luck = luck;
if (Gm) { Gm.holding = hold; Gm.sliding = slide; }
}
}
function newReader(kind, react) {
return { kind, react, hist: [], base: null, baseT: -9, pending: null, why: null, check: null, ignoreUntil: 0, downT: 0,
stallT: 0, settleT: 0, cool: 0, ref: 0, descT: 0, ignored: null, belowCan: false, trig: null };
}
function yAgo(o, back, t) { const h = o.hist; for (let i = h.length - 1; i >= 0; i--) if (h[i].t <= t - back) return h[i].y; return h.length ? h[0].y : null; }
function yMean(o, t, a, c) { let s = 0, n = 0; for (const p of o.hist) if (p.t >= t - a && p.t <= t - c) { s += p.y; n++; } return n ? s / n : null; }
function yMedian(o, t, a, c) { const v = []; for (const p of o.hist) if (p.t >= t - a && p.t <= t - c) v.push(p.y); if (!v.length) return null; v.sort((x, y) => x - y); return v[v.length >> 1]; }
function reversals(o, t, win, step) {
const h = o.hist; let n = 0, dir = 0, ref = null;
for (let i = 0; i < h.length; i++) {
if (h[i].t < t - win) continue;
if (ref == null) { ref = h[i].y; continue; }
const d = h[i].y - ref;
if (Math.abs(d) >= step) { const nd = d > 0 ? 1 : -1; if (dir && nd !== dir) n++; dir = nd; ref = h[i].y; }
}
return n;
}
function schedule(o, t, why, check) { o.pending = t + U.rand(o.react[0], o.react[1]); o.why = why; o.check = check || null; o.looks = U.chance(0.7); }
function watch(o, s, dt) {
const t = s.t, n = s.n, y = s.y;
o.hist.push({ t, y });
while (o.hist.length && o.hist[0].t < t - 7) o.hist.shift();
const sharp = o.kind === 'gioi' || o.kind === 'cao';
if (s.sinking) {
o.base = null; o.settleT = t;
if (o.pending != null) { if (t >= o.pending) { o.pending = null; return o.why; } return null; }
if (s.tilt < 0.3 && y < n - 0.3) {
const y0 = yAgo(o, 0.2, t);
if (y < s.can - 0.35) o.belowCan = true;
if (y0 != null && y0 - y > 0.12 && o.belowCan) o.descT += dt;
if (o.belowCan && o.descT > 0.3 && y > s.cau + 0.5 && y0 != null && Math.abs(y - y0) < 0.06) {
o.stallT += dt;
const need = sharp ? 0.1 : o.kind === 'kha' ? 0.25 : 0.45;
if (o.stallT > need && (sharp || U.chance(o.kind === 'kha' ? 0.08 : 0.03))) schedule(o, t, 'ชะงัก');
} else o.stallT = 0;
}
return null;
}
if (t - o.settleT < 0.9) { o.base = y; o.hist.length = 0; o.hist.push({ t, y }); return null; }
if (o.base == null) o.base = y;
if (t - o.baseT > 0.25 && t - o.settleT > 2.2) { const md = yMedian(o, t, 6, 1.2); if (md != null) o.base = md; o.baseT = t; }
const y1 = yAgo(o, 0.1, t), vel = y1 == null ? 0 : (y - y1) / 0.1;
const dev = y - o.base;
const jit = reversals(o, t, 1.0, 0.3) >= 3;
if (o.pending != null) {
const look = sharp || (o.kind === 'kha' && o.looks);
if (look && o.check) {
const bad = jit || (o.check === 'down' && y > o.ref - 0.12) || (o.check === 'up' && dev < 0.45) || (o.check === 'under' && y > -0.2);
if (bad) { o.pending = null; o.ignoreUntil = t + (jit ? 0.8 : 0.3); o.ignored = o.why; return null; }
if (t >= o.pending && o.check === 'down') {
if (vel > 0.6) { o.pending = null; o.ignoreUntil = t + 0.4; o.ignored = o.why; return null; }
if (Math.abs(vel) > 1.5) { if (t < o.pending + 0.15) return null; o.pending = null; o.ignoreUntil = t + 0.5; o.ignored = o.why; return null; }
}
}
if (t >= o.pending) { o.pending = null; return o.why; }
return null;
}
if (t < o.ignoreUntil || t < o.cool) return null;
if (o.kind !== 'moi') {
if (jit && (sharp || U.chance(0.7))) { o.ignoreUntil = t + 0.8; return null; }
if (Math.abs(s.drift) > 0.03) { schedule(o, t, 'ไหลข้าง'); return null; }
if (Math.abs(s.tilt) > 0.1 && y < n + 1) { o.ignoreUntil = t + 0.45; return null; }
if (y < -0.4) { schedule(o, t, 'มิดหาย', 'under'); return null; }
if (y > n + 1.2) { schedule(o, t, 'ทุ่นนอน'); return null; }
const y12 = yAgo(o, 0.12, t), ref = yMean(o, t, 0.6, 0.25);
if (ref != null && ref - y >= 0.28 && y12 != null && y12 - y >= 0.22 && dev <= -0.12) { o.ref = ref; schedule(o, t, 'กระตุก', 'down'); return null; }
if (dev >= 0.8 && (Math.abs(vel) < 1.2 || dev >= 1.1)) { schedule(o, t, 'ถอน', 'up'); return null; }
if (dev <= -0.25) { o.downT += dt; if (o.downT > 0.5) { o.ref = o.base; schedule(o, t, 'จมซึม', 'down'); o.downT = 0; } } else o.downT = 0;
return null;
}
if (jit && U.chance(0.4)) { o.ignoreUntil = t + 1.0; return null; }
if (Math.abs(dev) >= 0.4 || y < 0 || y > n + 1 || Math.abs(s.drift) > 0.05) {
if (U.chance(0.8)) schedule(o, t, dev < 0 ? 'ลง' : 'ขึ้น');
else { o.cool = t + 1.0; o.ignored = 'ลังเล'; }
}
return null;
}
const NOTICE = [0.4, 0.75, 0.9, 0.98], STEER = [0, 0.5, 0.95, 1], ARMLO = [0.2, 0.25, 0.3, 0.35];
function newFightBot(P) {
return { P, sk: P.skill, hist: [], holding: true, why: 'lift', phiT: 0, netAt: -1, lapseT: 0, nextLook: 0, t: 0,
lastWarn: null, noticed: false, steerOn: false, lastRunSign: 0, laneSeen: 0, laneReact: false, restUntil: 0 };
}
function botStep(B, F, line, dt) {
const P = B.P, sk = B.sk;
B.t += dt;
const t = B.t;
B.hist.push({ t, ratio: F.Ts / line.leader, over: F.overAcc, warn: F.warn, phase: F.phase().k, slack: F.stretch < -0.05, landable: F.landable,
lat: F.lat, vz: F.vz, stam: F.stamina, fy: F.fy, laneWarn: F.laneWarn, arm: F.arm == null ? 1 : F.arm });
if (B.hist.length > 240) B.hist.splice(0, B.hist.length - 240);
if (B.lapseT > 0) B.lapseT -= dt; else if (Math.random() < (P.lapse || 0) * dt) B.lapseT = 0.6;
if (t >= B.nextLook && B.lapseT <= 0) {
B.nextLook = t + 0.06;
const lag = rnd(P.react[0], P.react[1]);
let o = null;
for (let i = B.hist.length - 1; i >= 0; i--) if (B.hist[i].t <= t - lag) { o = B.hist[i]; break; }
if (o) {
if (o.warn !== B.lastWarn) { B.lastWarn = o.warn; B.noticed = !!o.warn && Math.random() < NOTICE[sk]; }
if (o.landable && B.netAt < 0) B.netAt = t + rnd(P.netDelay[0], P.netDelay[1]);
if (o.landable) { B.holding = false; B.why = 'net'; }
else {
const hi = [0.75, 0.82, 0.85, 0.88][sk], lo = [0.55, 0.6, 0.65, 0.68][sk];
if (o.over > 0.02 || o.ratio > hi) { B.holding = false; B.why = 'red'; }
else if (B.noticed && (o.warn === 'run' || o.warn === 'surge' || o.warn === 'shake')) { B.holding = false; B.why = 'warn'; }
else if (o.phase === 'run' && sk >= 1 && o.ratio > 0.5) { B.holding = false; B.why = 'run'; }
else if (o.slack) { B.holding = true; B.why = 'slack'; }
else if (o.ratio < lo) { B.holding = true; B.why = 'lift'; }
if (sk >= 2 && o.stam < 0.4 && o.fy > -0.6 && o.ratio < 0.8) { B.holding = true; B.why = 'gulp'; }
if (o.arm < ARMLO[sk] && t >= B.restUntil) B.restUntil = t + rnd(3, 1);
if (t < B.restUntil) { B.holding = false; B.why = 'rest'; }
}
if (o.laneWarn) {
if (o.laneWarn !== B.laneSeen) { B.laneSeen = o.laneWarn; B.laneReact = Math.random() < [0.6, 0.85, 0.97, 1][sk]; }
if (B.laneReact) B.phiT = -o.laneWarn * 40 * DEG;
} else B.laneSeen = 0;
if (sk > 0 && !(o.laneWarn && B.laneReact)) {
const rs = Math.abs(o.vz) > 0.25 ? Math.sign(o.vz) : 0;
if (rs && rs !== B.lastRunSign) { B.lastRunSign = rs; B.steerOn = Math.random() < STEER[sk]; }
if (B.steerOn && rs) B.phiT = -rs * (sk >= 2 ? 45 : 35) * DEG;
else if (Math.abs(o.lat) > 1.6 && sk >= 2) B.phiT = -Math.sign(o.lat) * 40 * DEG;
else if (!rs) B.phiT *= 0.97;
}
}
}
if (B.netAt > 0 && t >= B.netAt) { B.netAt = -1; return true; }
return false;
}
const PR = { go: 3, bad: 3, good: 3, warn: 2, stop: 2, wait: 1, info: 0 };
function put(k, text, cls, min, extra) {
if (!S) return null;
const now = WG.t, c = S[k], pr = PR[cls] || 0;
if (c && c.text === text) { c.t0 = Math.max(c.t0, now - 0.3); return c; }
const it = Object.assign({ text, cls: cls || 'info', pr, min: min || 1.2, t0: now }, extra || {});
if (c && now - c.t0 < c.min && pr < c.pr) { S[k + 'q'] = it; return it; }
S[k] = it; S[k + 'q'] = null;
return it;
}
const say1 = (text, cls, min, extra) => put('c1', text, cls, min, extra);
const say2 = (text, cls, min) => put('c2', text, cls, min);
function flushCaps() {
for (const k of ['c1', 'c2']) {
const q = S[k + 'q'], c = S[k];
if (q && (!c || WG.t - c.t0 >= c.min)) { q.t0 = WG.t; S[k] = q; S[k + 'q'] = null; }
}
}
const who = () => (S ? S.n.name.charAt(0).toUpperCase() + S.n.name.slice(1) : '');
function actInfo(su, a) {
const sp = su.sp, nm = spName(sp), d = sp.bite === 'diec';
if (su.lineOnly) return { head: 'ทุ่นสั่น เอียงเล็กน้อย', tail: 'ปลาว่ายเฉียดสายทุ่น ยังไม่ได้กิน อย่าเพิ่งวัด', cls: 'stop' };
if (a.soon) return { head: 'ทุ่นซึมลงช้าๆ', tail: `${nm} เพิ่งอมปลายเหยื่อเบาๆ — รอทุ่นเดินต่อค่อยวัด`, cls: 'wait', amp: 'down' };
if (sp.bite === 'troi' && a.type === 'nibble') return { head: 'ทุ่นกระตุกถี่ยิบ', tail: 'ฝูงปลายี่สกเทศกำลังดูดลองเหยื่อ ยังไม่วัด', cls: 'wait', amp: 'down' };
if (sp.bite === 'troi' && a.type === 'dip') return { head: 'ทุ่นตอกเบาๆ', post: 'แล้วนิ่ง', tail: 'ปลายี่สกเทศดูดเหยื่อเข้าปากแล้ว: วัดเบ็ด!', cls: 'go', amp: 'down' };
if (sp.bite === 'chim' && a.type === 'nibble') return { head: 'ทุ่นสั่นกระตุก', tail: 'ปลาเปคูตบเหยื่อ ยังไม่อม', cls: 'wait', amp: 'down' };
if (sp.bite === 'chim' && (a.type === 'run' || a.type === 'shift')) return { head: a.type === 'run' ? 'ทุ่นจมหายวับ' : 'ทุ่นลากออกข้าง', tail: 'ปลาเปคูฮุบเหยื่อแล้ว: วัดเลย!', cls: 'go' };
switch (a.type) {
case 'brush': return { head: 'ทุ่นสั่น เอียงเล็กน้อย', tail: `${nm} ว่ายวนเฉียดสาย ยังไม่กิน`, cls: 'wait' };
case 'quiver': return { head: 'ทุ่นสั่นระริกแผ่วๆ', tail: 'ปลาตะเพียนจีนพัดครีบรอบเหยื่อ กำลังจะกิน — รอก่อน', cls: 'wait' };
case 'nibble': return sp.tap ? { head: 'ทุ่นกระตุกถี่ไม่หยุด', tail: `${nm} ตอดเหยื่อ อย่าเพิ่งวัด`, cls: 'stop' }
: { head: 'ทุ่นกระตุกเบาๆ', tail: `${nm} ตอดลองเหยื่อ ยังไม่วัด`, cls: 'wait', amp: 'down' };
case 'nod': return { head: 'ทุ่นแตะเบาๆ', post: 'แล้วดีดคืน', tail: 'ปลาตะเพียนจีนแตะลองเหยื่อ ยังไม่วัด', cls: 'wait', amp: 'down' };
case 'tease': return a.test ? { head: 'ทุ่นลอยขึ้นเร็ว', post: 'แล้วร่วงกลับ', tail: 'ปลาตะเพียนจีนถอนลองเชิง ยังไม่อม — อย่าเพิ่งวัด', cls: 'wait', amp: 'up' }
: { head: 'ทุ่นยกขึ้น', post: 'แล้วร่วงลง', tail: 'ปลาตะเพียนจีนเล่นทุ่น ยังไม่อม — รอก่อน', cls: 'wait', amp: 'up' };
case 'jitter': return { head: 'ทุ่นเต้นขึ้นลงมั่วไปหมด', tail: 'ปลาซิวกวนเหยื่อ อย่าเพิ่งวัด', cls: 'stop' };
case 'grab': return { head: 'ทุ่นจมวูบแล้วดีดคืน', tail: 'ปลาซิวกระชากเหยื่อ อย่าเพิ่งวัด', cls: 'stop' };
case 'lift': return { head: 'ทุ่นถอนขึ้น', post: 'แล้วหยุดนิ่ง', tail: d ? 'ปลาตะเพียนจีนอมเหยื่อเงยหัวขึ้น: วัดเบ็ด!' : `${nm} อมเหยื่อเงยหัวขึ้น: วัดเบ็ด!`, cls: 'go', amp: 'up' };
case 'lie': return { head: 'ทุ่นล้มนอนราบกับน้ำ', tail: 'ปลาตะเพียนจีนตัวใหญ่ยกตะกั่วขึ้นแล้ว: วัดเลย!', cls: 'go' };
case 'dun': return a.after === 'lift' ? { head: 'ถอนขึ้นแล้วตอกลง', tail: 'วัดเบ็ดจังหวะทุ่นตอก!', cls: 'go', amp: 'down' }
: { head: 'ทุ่นตอกจมคมๆ', post: 'แล้วนิ่ง', tail: 'ปลาตะเพียนจีนอมเหยื่อแล้ว: วัดเบ็ด!', cls: 'go', amp: 'down' };
case 'sink': return { head: 'ทุ่นจมคมๆ', tail: `${nm} ฮุบเหยื่อ: วัดเบ็ด!`, cls: 'go', amp: 'down' };
case 'dip': return { head: 'ทุ่นตอกลง', tail: `${nm} กินระแวง: วัดได้`, cls: 'go', amp: 'down' };
case 'slow': return { head: 'ทุ่นจมช้าๆ ต่อเนื่อง', tail: `${nm} ดูดเหยื่อ: วัดเบ็ด`, cls: 'go', amp: 'down' };
case 'creep': return { head: 'ทุ่นซึมลงช้าๆ', tail: 'ปลาตะเพียนจีนดูดเหยื่อแบบเนือยๆ: วัดเบาๆ', cls: 'go', amp: 'down' };
case 'shift': return { head: 'ทุ่นซึมเบาๆ แล้วลากออกข้าง', tail: 'ปลาอมเหยื่อว่ายออกแล้ว: วัดเบ็ด', cls: 'go' };
case 'run': case 'dive': return { head: 'ทุ่นจมมิดหาย', tail: `${nm} อมแน่นลากไปแล้ว: วัดเลย!`, cls: 'go' };
case 'snatch': return { head: 'ทุ่นจมวูบ', tail: 'ปลาตะเพียนจีนตัวเล็กฉกเหยื่อ — วัดสิบพลาดเก้า', cls: 'warn' };
case 'mid': return { head: 'ทุ่นชะงักค้างระหว่างจม', tail: 'ปลางับเหยื่อกลางน้ำ: วัดเบ็ด!', cls: 'go' };
}
return null;
}
const capText = (I, amp) => `${I.head}${amp ? ' ' + amp : ''}${I.post ? ' ' + I.post : ''} — ${I.tail}`;
const TAKE = ['lift', 'hold', 'lie', 'dun', 'creep', 'shift', 'dive', 'snatch', 'mid', 'sink', 'run', 'dip', 'slow'];
const QUIET = ['nod', 'tease', 'quiver', 'nibble', 'jitter', 'grab', 'brush'];
function trackActs() {
const su = Pond.suitor, i = su ? su.i : -1, a = su && su.acts[i];
const A = S.act;
if (A && su === A.su && i !== A.i && a && a.type === 'hold' && A.type === 'lift') A.i = i;
if (A && (A.su !== su || A.i !== i)) { endAct(A); S.act = null; }
if (a && !S.act && a.type !== 'pause' && a.type !== 'spit') {
let I = actInfo(su, a);
const v = WG.dyn.v;
if (a.type === 'mid' && v > S.canV - 0.4) I = { head: 'ทุ่นค้างอยู่ที่ข้อตั้ง ยังไม่จมต่อ', tail: 'ปลางับเหยื่อขณะกำลังจม — สังเกตยากมาก', cls: 'warn', hidden: true };
const N = S.act = { su, i, type: a.type, a, I, v0: v, lo: v, hi: v, t0: WG.t, struck: false, cap: null,
take: !!(a.mouth && !su.lineOnly && !su.sp.tap) };
if (I) N.cap = say1(capText(I), I.cls, I.cls === 'go' ? 1.6 : 1.1);
if (N.take && S.c2 && (S.c2.cls === 'wait' || S.c2.cls === 'info')) { S.c2 = null; S.c2q = null; }
}
if (S.act) { const v = WG.dyn.v; if (v < S.act.lo) S.act.lo = v; if (v > S.act.hi) S.act.hi = v; }
}
function endAct(A) {
A.tEnd = WG.t; S.lastAct = A;
if (A.I && A.I.amp && A.cap) {
const amp = A.I.amp === 'up' ? A.hi - A.v0 : A.v0 - A.lo;
A.cap.text = capText(A.I, nac(Math.max(0, amp)));
}
if (A.struck) return;
const nx = A.su.acts[A.i + 1];
if (A.take) {
if (nx && nx.mouth) return;
if (A.type === 'snatch' && S.ti >= 2) { say2(`${who()} ปล่อยปลาตะเพียนตัวเล็กฉกเหยื่อไป — วัดไปสิบทีก็พลาดเก้า`, 'wait', 1.6); return; }
S.stats.missedTakes++;
S.stats.missedKinds[A.type] = (S.stats.missedKinds[A.type] || 0) + 1;
if (A.I && A.I.hidden) say2(`${who()} ไม่ทันเห็น — ปลางับเหยื่อตอนทุ่นยังรอค้างอยู่แถวข้อตั้ง แล้วคายทิ้ง`, 'info', 1.8);
else say2(S.ti <= 1 ? `${who()} วัดช้าไป — ปลาคายเหยื่อทิ้งแล้ว` : `${who()} พลาดจังหวะนี้ — ปลาคายเหยื่อเร็วมาก`, 'bad', 1.8);
} else if (S.ti >= 2 && QUIET.includes(A.type) && WG.t - S.quietT > 5) {
S.quietT = WG.t;
say2(`${who()} นั่งนิ่ง — ยังไม่ใช่จังหวะกิน`, 'wait', 1.4);
}
}
function missWhy(lm) {
const tip = Pond.missTip ? Pond.missTip(lm) : undefined;
if (typeof tip === 'string') return tip;
if (!lm) return 'ไม่มีปลากินเหยื่อ — วัดลมไปเอง';
if (lm.act === 'line') return 'ปลาแค่ว่ายเฉียดสายทุ่น ยังไม่ได้กิน';
if (lm.act === 'gone' || lm.act === 'spit') return 'ช้าไป — ปลาเพิ่งคายเหยื่อทิ้ง';
if (lm.act === 'nibble') return lm.sp && lm.sp.tap ? 'ปลารบกวนตอดเหยื่อ ไม่ได้อมตัวเบ็ด' : 'ปลาแค่ตอดลองเชิง ยังไม่อมเหยื่อ — วัดไปทำเอาปลาตกใจหนี';
if (lm.act === 'brush') return 'ปลาแค่ว่ายเฉียดสาย ยังไม่ได้กิน';
if (lm.mouth) return lm.early ? 'วัดเร็วเกินไป เหยื่อยังไม่เข้าปากปลาเต็มที่' : lm.fit < 0.6 ? 'ตัวเบ็ดใหญ่เกินปากปลา' : 'ถูกจังหวะแล้วแต่ตัวเบ็ดลื่นหลุด — มีหลุดบ้างเป็นเรื่องปกติ';
if (lm.prev === 'spit' || TAKE.includes(lm.sig)) return 'ช้าไป — ปลาคายเหยื่อออกไปแล้ว';
return 'ปลายังว่ายวนรอบเหยื่อ ยังไม่กิน — วัดไปทำให้ปลาตกใจ';
}
function spotXOf(rod, set) {
const tip = CC.rodTip(REST, rod.len), wind = rod.len - set / 100 - 0.25;
return wind > tip.y ? tip.x + Math.sqrt(wind * wind - tip.y * tip.y) : tip.x + 0.2;
}
function tune(bottom, can, cau, bowl) {
const F = CC.float(), w = CC.BAIT.w * (bowl ? bowl.dens : 1);
const rig = { lead: 1, set: 100, baits: [w, w], baitLeft: [1, 1], baitAge: 0, kind: 'cau', w0: w, dissolve: bowl ? bowl.dissolve : CC.BAIT.dissolve, cloud: bowl ? bowl.cloud : 0.5 };
let lo = 0, hi = F.body * 3 + 3;
for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; rig.lead = mid; if (Rig.canValue(rig) > can) lo = mid; else hi = mid; }
rig.lead = (lo + hi) / 2;
const at = s => { rig.set = s; return Rig.solve(Object.assign({}, rig, { baits: [w, w] }), bottom, {}).v; };
lo = 0; hi = bottom + 40;
for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (at(mid) < cau) lo = mid; else hi = mid; }
rig.set = (lo + hi) / 2;
return rig;
}
function tuneRig() {
const rod = CC.rod(), bowl = S.bowls.cau;
let x = Math.max(2.5, rod.len - 1), rig = null;
for (let k = 0; k < 3; k++) { rig = tune(CC.bottomDepth(x) * 100, S.g.can, S.g.cau, bowl); x = spotXOf(rod, rig.set); }
rig = tune(CC.bottomDepth(x) * 100, S.g.can, S.g.cau, bowl);
rig.baits = [0, 0]; rig.baitLeft = [1, 1]; rig.baitAge = 0;
WG.rig = rig; WG.spotX = WG.floatX = x;
S.bottom = CC.bottomDepth(x) * 100;
S.canV = Rig.canValue(rig); S.cauV = Rig.cauValue(rig, S.bottom);
}
function setupNpc(n) {
const pond = CC.pond(), ti = tierIdx(n), T = TIERS[ti], g = gearFor(n, pond, ti), sp = M.spot(n.id), bw = makeBowls(g, pond);
S = {
n, ti, T, g, sp, seed: n.id * 1.37, depth: sp.depth, bowls: bw,
P: { rod: g.rod, line: g.line, hook: g.hook, float: g.float, bowls: { cau: bw.cau, xa: bw.xa } },
rodO: byId(CC.RODS, g.rod), lineO: byId(CC.LINES, g.line), hookO: byId(CC.HOOKS, g.hook), floatO: byId(CC.FLOATS, g.float),
skin: npcSkin(n), pond: snapPond(),
stats: { casts: 0, xa: 0, strikes: 0, onTake: 0, onTest: 0, hooked: 0, landed: 0, lost: 0, kg: 0, best: null, missedTakes: 0, missedKinds: {}, fights: [] },
samples: [], marks: [], c1: null, c2: null, c1q: null, c2q: null, act: null, quietT: -99, qT: 0, wait: 1.5,
soak: 0, soakMax: 60, bareT: 0, bareLag: 2, bareSaid: false, liftT: 0, nextXa: false, reader: null, fb: null, hand: null,
catchShow: null, annWave: -1, calmT: 0, mute: false, sampT: 0, startMin: nowAbs(), log: []
};
Object.assign(WG, { t: 0, state: 'hand', theta: REST, thetaTarget: REST, bend: 0, power: 0, powerDir: 1, fly: null,
floatX: 4, spotX: 4, sink: 0, sinkH: 0, sol: null, rig: null, dyn: { v: 0, vel: 0, tilt: 0, wave: 0, tiltX: 0, drift: 0, driftT: null },
fight: null, fightTime: 0, learn: !!(CC.P && CC.P.learn), spot: sp, q: 1, phi: 0, phiT: 0, turnFlash: 0, dodgeFlash: 0, who: n.name, xa: false });
withNpc(() => {
WG.q = M.quality(sp);
Pond.reset(WG.q);
Pond.food = 2 + 3.5 * n.chum;
for (let t = 0; t < 200; t += 0.5) { Pond.tick(0.5, WG.q); if (Pond.food < 1.2 + 2.5 * n.chum) Pond.food += 1.5; }
Pond.clock = 0; Pond.sinkT = 0; Pond.wasSinking = false; Pond.lastLeft = null; Pond.lastMiss = null;
S.annWave = Pond.waveCount;
tuneRig();
});
S.fN = S.floatO.n;
}
function sfx(k) {
const A = CC.Audio;
if (!A || !hasDom || !X.on || (S && S.mute)) return;
try {
if (k === 'plop') A.plop(); else if (k === 'whoosh') A.whoosh(); else if (k === 'strike') A.strike();
else if (k === 'splash') A.splash(0.5, 0.6); else if (k === 'snap') A.snap();
} catch (e) {   }
}
function splash(x, n, p) { const R = Rn(); if (R && R.splash && R.X && !(S && S.mute)) R.splash(R.X(x), R.sy, n, p); }
function wantXa() {
const f = Pond.food, ch = S.n.chum;
if (S.ti === 0) return f < 3.2 && U.chance(0.22 + 0.15 * ch);
return f < 1.0 + 2.0 * ch && U.chance(0.6);
}
function step(dt) {
const rod = CC.rod();
WG.t += dt;
S.qT -= dt;
if (S.qT <= 0) { S.qT = 2; WG.q = M.quality(WG.spot); }
Pond.tick(dt, WG.q);
if (S.liftT > 0) { S.liftT -= dt; if (S.liftT <= 0 && WG.state === 'hand') WG.thetaTarget = REST; }
switch (WG.state) {
case 'hand':
S.wait -= dt;
if (S.wait <= 0) { WG.state = 'charging'; WG.power = 0; S.aim = U.clamp(0.78 + U.gauss() * S.T.aim, 0.45, 0.99); }
break;
case 'charging':
WG.power = Math.min(1, WG.power + dt * 0.8);
WG.thetaTarget = REST + WG.power * 50 * DEG;
if (WG.power >= S.aim) cast();
break;
case 'flying':
WG.fly.t += dt;
if (WG.fly.t >= WG.fly.dur) land();
break;
case 'sinking': case 'waiting': inWater(dt); break;
case 'fighting': fightStep(dt, rod); break;
case 'landed':
S.wait -= dt;
if (S.wait <= 0) { WG.state = 'hand'; WG.thetaTarget = REST; S.catchShow = null; S.wait = U.rand(S.T.rebait[0], S.T.rebait[1]); say2(`${who()} เก็บปลาลงกระชัง ปั้นเหยื่อใหม่…`, 'info'); }
break;
}
if (WG.state !== 'fighting') {
const spd = (WG.state === 'flying' ? 400 : rod.speed) * DEG * dt;
WG.theta += U.clamp(WG.thetaTarget - WG.theta, -spd, spd);
WG.bend += ((WG.state === 'waiting' || WG.state === 'sinking' ? 0.04 : 0) - WG.bend) * Math.min(1, dt * 6);
}
if (Pond.inWave && Pond.wave > 1.2 && S.annWave !== Pond.waveCount && WG.state !== 'fighting') {
S.annWave = Pond.waveCount;
say1('ฟองอากาศผุดรอบจุดอ่อย — ฝูงปลาเข้าจุดแล้ว ทุ่นกำลังจะมีอาการ', 'info', 1.6);
}
sample(dt);
flushCaps();
}
function cast() {
const rig = WG.rig, xa = !!S.nextXa, bowl = S.bowls[xa ? 'xa' : 'cau'];
Rig.rebait(rig, bowl, xa ? 'xa' : 'cau');
WG.xa = xa;
let lost = 0;
for (let i = 0; i < 2; i++) if (U.chance((1 - bowl.stick) * (xa ? 0.15 : 0.35) * (S.ti >= 2 ? 0.5 : 1))) { rig.baitLeft[i] = 0; rig.baits[i] = 0; lost++; }
const tip = CC.rodTip(WG.theta, CC.rod().len);
let x = WG.spotX + (WG.power - 0.78) * 2.5 + U.gauss() * [0.05, 0.04, 0.025, 0.018][S.ti];
x = U.clamp(x, 0.8, WG.spotX + 0.25);
WG.fly = { t: 0, dur: 0.75, x0: tip.x, y0: tip.y, x1: x };
WG.state = 'flying'; WG.thetaTarget = REST;
S.stats.casts++; if (xa) S.stats.xa++;
if (xa) say2(`${who()} อ่อยเหยื่อ — ปั้นก้อนใหญ่โยนเลี้ยงจุด`, 'info', 1.6);
else say2(`${who()} ตีเหยื่อเข้าจุด${lost ? ` — เหยื่อหลุดกลางอากาศ ${lost === 2 ? 'ทั้งสองก้อน' : 'หนึ่งก้อน'}` : ''}`, 'info');
sfx('whoosh');
}
function land() {
WG.floatX = WG.fly.x1;
WG.state = 'sinking'; WG.sink = 0; WG.sinkH = 0;
Object.assign(WG.dyn, { v: CC.float().n + 6, vel: 0, tilt: 1.45, drift: 0, driftT: null });
S.reader = newReader(S.T.reader, S.T.react);
S.soak = 0; S.soakMax = U.rand(S.T.soak[0], S.T.soak[1]); S.bareT = 0; S.bareSaid = false; S.calmT = 0; S.recastAt = null; S.restV = null;
S.bareLag = U.rand(S.T.bare[0], S.T.bare[1]);
S.nextXa = false;
splash(WG.floatX, 6, 0.35); sfx('plop');
const dx = WG.floatX - WG.spotX;
if (WG.rig.kind === 'xa') say1('เหยื่ออ่อยก้อนใหญ่ดึงทุ่นจมมิด — เหยื่อค่อยๆ แตกฟุ้งเลี้ยงจุด ทุ่นจะค่อยๆ ลอยขึ้น', 'info', 2);
else say1(Math.abs(dx) < 0.3 ? 'เหยื่อตกตรงจุดอ่อย — ทุ่นนอน แล้วตั้งขึ้น ค่อยๆ จมทีละข้อ'
: `เหยื่อคลาดจุดอ่อย ${dx > 0 ? '+' : ''}${num(dx)} ม. — ทุ่นนอน แล้วตั้งขึ้น ค่อยๆ จมทีละข้อ`, 'info', 1.6);
}
function inWater(dt) {
const rig = WG.rig, xa = rig.kind === 'xa', line = CC.line(), hook = CC.hook(), F = CC.float();
const bottom = CC.bottomDepth(WG.floatX) * 100, dx = WG.floatX - WG.spotX;
const before = rig.baits[0] + rig.baits[1];
Rig.updateBaits(rig, dt);
const melted = before - (rig.baits[0] + rig.baits[1]);
if (melted > 0) Pond.addFood(melted / CC.BAIT.w * (xa ? 0.25 : 0.12) * (rig.cloud || 0.5), dx);
const bowl = S.bowls[xa ? 'xa' : 'cau'], sinking = WG.state === 'sinking';
const out = Pond.update(dt, { rig, dx, sinking, lineVis: line.vis, hookTake: hook.take, smell: bowl.smell, q: WG.q, mud: WG.spot.mud, xa,
soft: CC.Bait && CC.Bait.softness ? CC.Bait.softness(bowl) : null });
if (sinking && !out.freeze) {
WG.sink += (30 + rig.lead * 20) * dt;
const bk = Math.min(3, (rig.baits[0] + rig.baits[1]) / (2 * CC.BAIT.w));
WG.sinkH = Math.min(WG.sink + Rig.LEADER_LONG, (WG.sinkH || 0) + (16 + 12 * bk) * dt);
}
const sol = Rig.solve(rig, bottom, { force: out.force, held: out.held, sink: WG.sink, sinkH: WG.sinkH });
let settled = false;
if (WG.state === 'sinking' && sol.fL >= 1 && sol.fB >= 1) { WG.state = 'waiting'; WG.sink = WG.sinkH = Infinity; settled = true; }
WG.sol = sol;
WG.dyn.tiltX = out.tiltX;
WG.dyn.driftT = out.drift != null ? out.drift : null;
Rig.step(WG.dyn, sol.v, dt, WG.t);
S.soak += dt;
if (!xa) trackActs();
if (settled && !xa) {
const v = Rig.solve(rig, bottom, {}).v, c = half(S.cauV);
S.restV = v; S.recastAt = null;
if (!Rig.hasBait(rig)) say1(`ทุ่นหยุดที่ ${Rig.fmt(v)} — เหยื่อหลุดตอนตี เบ็ดเปล่า`, 'info', 1.4);
else if (v > S.cauV + 0.6) say1(`ทุ่นหยุดที่ ${Rig.fmt(v)} สูงกว่าข้อตก ${c} — จุดนี้พื้นตื้นกว่าจุดอ่อย เหยื่อจมกองบนพื้น`, 'info', 1.8);
else if (v < S.cauV - 0.6) say1(`ทุ่นหยุดที่ ${Rig.fmt(v)} ต่ำกว่าข้อตก ${c} — จุดนี้พื้นลึกกว่า เหยื่อลอยจากพื้น`, 'info', 1.8);
else say1(`ทุ่นหยุดที่ ${Rig.fmt(v)} — เหยื่อแตะพื้นแล้ว รอปลากิน`, 'info', 1.4);
if (S.ti >= 2 && Rig.hasBait(rig) && Math.abs(v - S.cauV) > 1.2) S.recastAt = WG.t + U.rand(1.8, 3);
}
if (xa) {
if (WG.state === 'waiting' && (WG.dyn.v > S.cauV - 0.5 || S.soak > 22 || !Rig.hasBait(rig))) strike('อ่อยเหยื่อ');
return;
}
const r = S.reader;
const why = watch(r, { t: WG.t, y: WG.dyn.v + (WG.dyn.wave || 0), tilt: WG.dyn.tilt, drift: WG.dyn.drift || 0, sinking: WG.state === 'sinking',
n: F.n, cau: S.cauV, can: S.canV }, dt);
if (r.pending != null && !r.trig) {
r.trig = truthNow();
if (r.kind === 'cao' && !r.trig.take && U.chance(0.9)) { r.pending = null; r.ignoreUntil = WG.t + 0.45; r.ignored = r.why; r.trig = null; }
} else if (r.pending == null && !why) r.trig = null;
if (r.ignored) {
const g = r.ignored; r.ignored = null;
if (WG.t - S.quietT > 3) {
S.quietT = WG.t;
say2(g === 'ลังเล' ? `${who()} ลังเล ยังไม่กล้าวัด…` : `${who()} เกือบจะวัดแล้ว เห็นทุ่นดีดกลับพอดี — แค่จังหวะลองเชิง นั่งนิ่งไว้`, 'wait', 1.6);
}
}
if (why) return strike(why);
if (WG.state !== 'waiting') return;
if (S.recastAt != null && WG.t >= S.recastAt && !Pond.suitor) return strike('ตีเหยื่อใหม่');
if (!Rig.hasBait(rig)) {
if (!S.bareSaid) { S.bareSaid = true; say1('ทุ่นค่อยๆ ลอยกลับไปที่ข้อตั้ง — เหยื่อละลายหมดจากตัวเบ็ดแล้ว', 'info', 1.6); }
S.bareT += dt;
if (S.bareT > S.bareLag) return strike('เปลี่ยนเหยื่อ');
} else if (S.soak > S.soakMax && !Pond.suitor) return strike('เปลี่ยนเหยื่อ');
S.calmT = Pond.suitor ? 0 : S.calmT + dt;
if (S.calmT > 9 && (!S.c1 || WG.t - S.c1.t0 > 8)) {
S.calmT = 0;
say1(Pond.bubbles > 0.35 ? 'ฟองอากาศผุดที่จุดอ่อย — ปลากำลังคุ้ยเหยื่ออยู่ก้นบ่อ รออาการทุ่น'
: `ทุ่นนิ่งอยู่ที่ ${Rig.fmt(WG.dyn.v)} — ยังไม่มีปลาเข้ามากินเหยื่อ`, 'info', 1.2);
}
}
function truthNow() {
const A = S.act || (S.lastAct && WG.t - S.lastAct.tEnd < 0.35 ? S.lastAct : null);
if (A) return { type: A.type, take: A.take, quiet: !A.take, sp: A.su.sp.id };
const su = Pond.suitor;
return { type: su ? 'pause' : null, take: false, quiet: false, sp: su ? su.sp.id : null };
}
function strike(why) {
const rig = WG.rig, xa = rig.kind === 'xa', lift = why === 'เปลี่ยนเหยื่อ' || why === 'อ่อยเหยื่อ' || why === 'ตีเหยื่อใหม่';
WG.thetaTarget = 30 * DEG; S.liftT = 0.35;
const su = Pond.suitor, a = su && su.acts[su.i];
const take = !!(su && !su.lineOnly && !su.sp.tap && a && a.mouth);
const tr = (S.reader && S.reader.trig) || truthNow();
if (S.act) S.act.struck = true;
if (!lift) {
S.stats.strikes++;
if (tr.take) S.stats.onTake++; else if (tr.quiet) S.stats.onTest++;
sfx('strike');
}
const r = Pond.strike(xa);
if (!lift) S.marks.push({ t: WG.t, hit: !!r, take });
S.log.push({ t: +WG.t.toFixed(2), why, act: a ? a.type : su ? 'pause' : null, trig: tr.type, sp: su ? su.sp.id : tr.sp, take, hit: !!r });
if (r) { S.stats.hooked++; startFight(r, lift); return; }
const left = rig.baits[0] + rig.baits[1];
if (left > 0.001) Pond.addFood(left / CC.BAIT.w * (xa ? 0.25 : 0.12) * (rig.cloud || 0.5), WG.floatX - WG.spotX);
WG.state = 'hand'; WG.sol = null; S.act = null;
S.wait = why === 'ตีเหยื่อใหม่' ? U.rand(1.2, 2) : U.rand(S.T.rebait[0], S.T.rebait[1]);
S.nextXa = why === 'ตีเหยื่อใหม่' ? false : wantXa();
if (why === 'ตีเหยื่อใหม่') { say2(`${who()} เห็นทุ่นไม่ตรงข้อตก — ยกคันตีเหยื่อใหม่ให้ตรงจุดอ่อย`, 'info', 1.6); return; }
if (lift) { say2(xa ? `${who()} สะบัดอ่อย — เหยื่อส่วนที่เหลือแตกกระจายลงจุดอ่อย` : `${who()} ยกคันเปลี่ยนเหยื่อใหม่`, 'info', 1.4); return; }
say2(`⚡ ${who()} วัด — วืด! ${missWhy(Pond.lastMiss)}`, 'bad', 2.8);
}
function startFight(r, lift) {
const depth = Math.min(WG.sol ? WG.sol.low : WG.rig.set, CC.bottomDepth(WG.floatX) * 100) / 100;
const ptype = CC.pond().type;
WG.fight = new CC.DaiFight(r.sp, r.w, r.hold, WG.floatX, depth, { lane: ptype === 'latvot' ? 3.7 : 2.9, yieldP: ptype === 'latvot' ? 0.9 : ptype === 'giai' ? 0.4 : 0.7, yieldKeep: ptype === 'latvot' });
WG.state = 'fighting'; WG.fightTime = 0; WG.phi = WG.phiT = 0; WG.turnFlash = WG.dodgeFlash = 0;
S.fb = newFightBot(S.T.fight); S.act = null; S.hand = null;
splash(WG.floatX, 8, 0.6); sfx('splash');
say2(lift ? `${who()} ยกคันจังหวะปลาอมเหยื่อพอดี — ติดปลา!` : `⚡ ${who()} วัด — ติดปลา!`, 'good', 1.6);
}
function fightStep(dt, rod) {
const F = WG.fight, line = CC.line();
WG.fightTime += dt;
const ev = F.update(dt, WG.theta, rod, line, WG.phi || 0);
for (const e of ev) {
if (e === 'snap') return endFight('snap', F.pullBase > line.leader ? 'ปลาแรงเกินสายหน้า ไซส์นี้ต้องใช้สายใหญ่กว่านี้' : F.held ? 'ฝืนงัดจังหวะปลาพุ่งพอดี' : 'ปลาสะบัดแรงเกินไป');
if (e === 'tangle') return endFight('tangle');
if (e === 'rodpulled') return endFight('rodpulled');
if (e === 'rodbreak') return endFight('rodbreak');
if (e === 'thrown') return endFight('thrown', F.pumped ? 'สายหย่อนสลับตึง จนเบ็ดหลุด' : F.fy > 0.05 ? 'ยกปลาลอยพ้นน้ำ ปลาสะบัดเบ็ดหลุด' : 'ปล่อยสายหย่อนนานเกินไป');
if (e === 'handland') return landFish('ยกขึ้นฝั่ง');
if (e === 'surge') { splash(F.fx, 10, 0.8); say2('ปลาเห็นขอบฝั่งเลยพุ่งหนีออก — ผ่อนมือให้คันรับแรง', 'warn', 1.4); }
if (e === 'bolt') splash(F.fx, 8, 0.6);
if (e === 'turned') WG.turnFlash = 0.9;
if (e === 'dodge') WG.dodgeFlash = 0.9;
if (e === 'nbyield') say2('คนข้างช่องยกคันหลบสายให้ — ดึงปลากลับมาได้', 'info', 1.6);
}
const B = S.fb, net = botStep(B, F, line, dt);
if (net) {
if (F.tryNet()) return landFish('ช้อนสวิง');
say2(`${who()} ยื่นสวิงเร็วไป — ปลาพุ่งหนี!`, 'bad', 1.4);
}
WG.phiT = B.phiT;
WG.phi = F.steer(dt, B.phiT, WG.phi || 0, B.holding, line, (B.sk > 0 && B.steerOn) || B.laneReact);
if (WG.fightTime > 0.25) { WG.theta = F.control(dt, { hold: B.holding }, WG.theta, rod, line); WG.thetaTarget = WG.theta; }
else { const spd = rod.speed * DEG * dt; WG.theta += U.clamp(30 * DEG - WG.theta, -spd, spd); }
WG.bend = CC.rodBend(F.Ts, rod);
if (WG.turnFlash > 0) WG.turnFlash -= dt;
if (WG.dodgeFlash > 0) WG.dodgeFlash -= dt;
hands(F, B, line);
}
function hands(F, B, line) {
const r = F.Ts / line.leader, phi = (WG.phi || 0) / DEG;
let main, cls = '', key;
if (F.landable) { main = '🥅 ปลาตะแคงตัว หมดแรงแล้ว — ยื่นสวิง'; cls = 'good'; key = 'ช้อน'; }
else if (B.holding) {
key = 'งัด';
if (F.gulping) { main = '💧 ยกหัวให้ปลากลืนอากาศ'; cls = 'good'; }
else if (B.why === 'slack') main = '✊ ยกคันเก็บสายหย่อน';
else if (F.stamina < 0.45) main = '✊ งัด — พาปลาหมดแรงเข้าฝั่ง';
else main = '✊ งัด — ยกคันดึงปลากลับมา';
} else {
key = 'ผ่อน';
if (r > 0.85 || F.overAcc > 0.02) { main = '🖐 ผ่อนมือ — สายตึงมาก ปล่อยคันซับแรง'; cls = 'bad'; }
else if (B.why === 'warn') { main = '🖐 ผ่อนให้ปลาวิ่ง — เห็นปลากำลังจะพุ่ง'; cls = 'warn'; }
else if (B.why === 'run' || F.state === 'run') { main = '🖐 ผ่อนให้ปลาวิ่ง — ให้คันโค้งรับแรง'; cls = 'warn'; }
else if (B.why === 'rest') main = '🖐 พักมือ — ให้คันรับแรงช่วยคลายล้า';
else main = '🖐 ผ่อนสบายๆ — คันช่วยซับแรงเอง';
}
const side = Math.abs(phi) > 10 ? (phi < 0 ? '⬅ ดึงเบี่ยงซ้าย' : 'ดึงเบี่ยงขวา ➡') : '';
S.hand = { main, side, cls, key, hold: B.holding };
}
function endFight(kind, why) {
S.stats.lost++;
S.stats.fights.push({ r: kind, t: +WG.fightTime.toFixed(1), sp: WG.fight.sp.id, w: WG.fight.w });
const T = { snap: `ผึง! สายหน้าขาด — ${why}`, tangle: 'ปลาวิ่งล้ำช่องข้างๆ พันสายเพื่อนบ้าน — หลุด', thrown: `เบ็ดหลุด — ${why}`,
rodpulled: 'ปลากระชากคันหลุดมือตกน้ำ!', rodbreak: 'กร๊อบ! ปลายคันหักเพราะยกคันสูงเกินไป' }[kind] || 'ปลาหลุด';
say1(T, 'bad', 2.6);
say2(`${who()} ${kind === 'snap' ? 'นั่งผูกสายหน้าใหม่…' : kind === 'rodpulled' ? 'ลุยน้ำไปงมคัน…' : kind === 'rodbreak' ? 'เปลี่ยนปลายคันใหม่…' : 'เสียดายสุดๆ เกี่ยวเหยื่อตกต่อ…'}`, 'info', 2);
WG.fight = null; WG.state = 'hand'; WG.thetaTarget = REST; WG.bend = 0; WG.phi = WG.phiT = 0; S.fb = null; S.hand = null;
S.wait = kind === 'snap' ? U.rand(14, 22) : kind === 'rodpulled' ? 35 : kind === 'rodbreak' ? 30 : U.rand(4, 7);
S.nextXa = wantXa();
sfx(kind === 'snap' ? 'snap' : null);
}
function landFish(how) {
const F = WG.fight, n = S.n, pond = CC.pond(), w = F.w, sp = F.sp;
const counted = w >= pond.minW && !sp.tap;
if (counted) { n.n++; n.kg += w; n.big = Math.max(n.big, w); S.stats.kg += w; }
S.stats.landed++;
S.stats.fights.push({ r: 'land', t: +WG.fightTime.toFixed(1), sp: sp.id, w, how });
if (!S.stats.best || w > S.stats.best.w) S.stats.best = { sp, w };
if (CC.Dao && CC.Dao.noteCatch) CC.Dao.noteCatch(n, sp, w);
S.catchShow = { sp, w, t0: WG.t };
WG.fight = null; WG.state = 'landed'; WG.bend = 0; WG.thetaTarget = 12 * DEG; WG.phi = WG.phiT = 0; S.fb = null; S.hand = null;
S.wait = U.rand(2.6, 3.4);
say1(`🎣 ปลาขึ้นแล้ว! ${spName(sp)} ${U.fmtKg(w)} — ${how === 'ช้อนสวิง' ? 'ช้อนด้วยสวิง' : 'ยกขึ้นฝั่งด้วยมือ'}${counted ? '' : ' · ต่ำกว่าเกณฑ์ ปล่อยกลับบ่อ'}`, 'good', 2.6);
say2(`${who()}: ${n.n} ตัว · ${num(n.kg)} กก. รอบนี้`, 'good', 2.4);
sfx('splash');
S.nextXa = wantXa();
}
function sample(dt) {
S.sampT += dt;
if (S.sampT < 1 / 30) return;
S.sampT = 0;
const inW = WG.state === 'sinking' || WG.state === 'waiting', su = Pond.suitor, a = su && su.acts[su.i];
S.samples.push({ t: WG.t, y: inW ? WG.dyn.v + (WG.dyn.wave || 0) : null, m: !!(inW && su && !su.lineOnly && !su.sp.tap && a && a.mouth), s: WG.state === 'sinking' });
while (S.samples.length && S.samples[0].t < WG.t - CHART_SEC) S.samples.shift();
while (S.marks.length && S.marks[0].t < WG.t - CHART_SEC) S.marks.shift();
}
function tick(dt) {
if (!S || !(dt > 0)) return;
const ca = CC.P && CC.P.ca;
if (!ca || !ca.active || M.npcAt(S.n.id) !== S.n) { X.stop('ca'); return; }
const sdt = Math.min(0.05, dt) * (X.slow ? 0.5 : 1);
try { withNpc(() => (S.remote ? S.remote.step(sdt) : step(sdt))); } catch (e) { if (typeof console !== 'undefined') console.error('[ดูเพื่อนตก]', e); X.stop('err'); }
}
function finishFight() {
if (!S || WG.state !== 'fighting' || !WG.fight) return;
S.mute = true;
withNpc(() => { const rod = CC.rod(); for (let k = 0; k < 420 * 60 && WG.state === 'fighting'; k++) fightStep(1 / 60, rod); });
S.mute = false;
}
X.start = id => {
if (X.on) return false;
const n = M.npcAt(id), ca = CC.P && CC.P.ca, UI = UIx();
if (!n || !ca || !ca.active) return false;
if (UI.isOpen && UI.isOpen()) return false;
setupNpc(n);
if (n.real && CC.Online && CC.Online.watchStart) S.remote = CC.Online.watchStart(n, { S, WG, say1, say2 });
X.on = true; X.id = id; M.watched = id;
const V = CC.View3D;
X.was3D = !!(V && V.on && V.setOn);
if (X.was3D) V.setOn(false);
if (CC.Dao && CC.Dao.setWatch) CC.Dao.setWatch(id);
if (hasDom) {
boot();
if (root) { lastDom = {}; chartSize = null; chartAt = -1; root.classList.remove('hidden'); }
document.body.classList.add('xem-on');
}
const R = Rn();
if (R && R.setView && hasDom) R.setView(WG.spotX);
S.wait = U.rand(1.6, 2.6);
if (!S.remote) {
say1(`👀 นั่งดู ${n.name} ตกปลาอยู่ข้างหลัง — ฝีมือ${S.T.name}`, 'info', 2.2);
say2(`${who()} กำลังปั้นเหยื่อ เกี่ยวเบ็ด…`, 'info', 1.6);
}
return true;
};
X.stop = why => {
if (!X.on || !S) { X.on = false; return; }
const rem = S.remote;
if (why !== 'err' && !rem) finishFight();
const st = S.stats, n = S.n, mins = Math.round(nowAbs() - S.startMin);
X.last = { name: n.name, tier: S.T.name, mins, stats: st, log: S.log.slice(-40) };
X.on = false; X.id = 0; M.watched = null;
S = null;
if (hasDom) {
if (root) root.classList.add('hidden');
document.body.classList.remove('xem-on');
const R = Rn();
if (R && R.setView && CC.G && CC.G.spotX != null) R.setView(CC.G.spotX);
}
if (X.was3D && CC.View3D && CC.View3D.setOn) { X.was3D = false; CC.View3D.setOn(true); }
if (CC.Dao && CC.Dao.watch && CC.Dao.setWatch) CC.Dao.setWatch(null);
const UI = UIx();
if (rem) { try { rem.stop(why, mins); } catch (e) {   } }
else if (why === 'walk' && hasDom && UI.toast) {
const fish = st.best ? ` (ใหญ่สุด ${spName(st.best.sp)} ${U.fmtKg(st.best.w)})` : '';
UI.toast(`🚶 เดินต่อ — นั่งดู ${n.name} ${Math.max(1, mins)} นาที: วัดเบ็ด ${st.strikes} ครั้ง, ติด ${st.hooked}, ได้ปลา ${st.landed} ตัว${fish}`, 'info', 4500);
}
};
X.key = e => {
const k = (e.key || '').toLowerCase();
if (e.repeat) return;
if (k === 'escape' || k === 't') { e.preventDefault(); X.stop('walk'); }
else if (e.code === 'Space' || k === 'z') { e.preventDefault(); toggleSlow(); }
else if (k === 'v') { e.preventDefault(); toggleLearn(); }
};
function toggleSlow() { X.slow = !X.slow; lastDom['xem-slow'] = null; }
function toggleLearn() { if (S) WG.learn = !WG.learn; lastDom['xem-learn'] = null; }
X.toggleSlow = toggleSlow; X.toggleLearn = toggleLearn;
X.debug = () => (S ? { name: S.n.name, tier: S.T.name, gear: S.g, state: WG.state, can: S.canV, cau: S.cauV, spotX: WG.spotX, food: S.pond.food, fish: S.pond.fish,
wave: S.pond.wave, stats: S.stats, c1: S.c1 && S.c1.text, c2: S.c2 && S.c2.text, log: S.log.slice(-12) } : X.last || null);
X._t = { setupNpc, withNpc, step, tick, getS: () => S, WG, gearFor, watch, newReader, botStep, newFightBot, finishFight };
let root = null, lastDom = {};
function setText(id, s) { if (lastDom[id] === s) return; lastDom[id] = s; const el = $(id); if (el) el.textContent = s; }
function setCls(id, c) { const k = id + '|c'; if (lastDom[k] === c) return; lastDom[k] = c; const el = $(id); if (el) el.className = c; }
function setSt(id, prop, v) { const k = id + '|' + prop; if (lastDom[k] === v) return; lastDom[k] = v; const el = $(id); if (el) el.style[prop] = v; }
const scaleX = v => 'scaleX(' + (Math.round(U.clamp(v, 0, 1) * 1000) / 1000) + ')';
function boot() {
if (!hasDom || root) return;
const game = $('game');
if (!game) return;
const touch = !!(CC.UI && CC.UI.touch);
root = document.createElement('div');
root.id = 'xem'; root.className = 'hidden';
root.innerHTML = `<div id="xem-head">
        <div id="xem-top"><div><b id="xem-name"></b> <span id="xem-tier"></span></div><div id="xem-stat" class="dim"></div><div id="xem-clock" class="dim"></div></div>
        <div id="xem-mid">
          <div id="xem-cap"><div id="xem-c1"></div><div id="xem-c2"></div></div>
          <canvas id="xem-chart"></canvas>
          <div id="xem-fb" class="hidden">
            <div class="fb-top"><span id="xfb-phase"></span><span id="xfb-warn"></span></div>
            <div class="fb-track"><div id="xfb-fill" style="width:100%;transform:scaleX(0);transform-origin:0 50%"></div><div id="xfb-mark"></div></div>
            <div class="fb-fuse"><i id="xfb-over"></i></div>
            <div class="fb-row"><span class="dim">แรงปลา</span><div class="fb-stam"><i id="xfb-stam" style="transform-origin:0 50%"></i></div><span class="dim" id="xfb-num"></span></div>
            <div id="xem-hands"><span id="xh-main"></span><span id="xh-side" class="hidden"></span></div>
            <div id="xfb-c2"></div>
          </div>
        </div>
      </div>
      <div id="xem-bar"><div id="xem-gear"></div><div class="xem-btns">
        <button id="xem-slow" type="button">🐢 ช้า ×0.5${touch ? '' : ' (Space)'}</button>
        <button id="xem-learn" type="button">👁 ดูใต้น้ำ${touch ? '' : ' (V)'}</button>
        <button id="xem-exit" type="button" class="good">🚶 เดินต่อ${touch ? '' : ' (Esc)'}</button></div></div>`;
game.appendChild(root);
$('xem-exit').addEventListener('click', () => X.stop('walk'));
$('xem-slow').addEventListener('click', toggleSlow);
$('xem-learn').addEventListener('click', toggleLearn);
root.addEventListener('contextmenu', e => e.preventDefault());
}
function gearText() {
const r = S.rodO, l = S.lineO, h = S.hookO, f = S.floatO, rc = S.g.recipe || {};
const bait = rc.thom >= (rc.tanh || 0) ? 'เหยื่อหอม' : 'เหยื่อคาว';
return `🎣 คัน ${r.name.replace(/^คันชิงหลิว /, '')} · ${l.name} · เบ็ดเบอร์ ${h.size} · ${f.name} · ตั้ง ${half(S.canV)} ตก ${half(S.cauV)} · ${bait}`;
}
function updateDom() {
if (!hasDom || !root || !S) return;
const n = S.n, st = S.stats, Wd = CC.world, ca = CC.P && CC.P.ca;
setText('xem-name', `${n.name} · ช่อง ${n.id}`);
setText('xem-tier', S.remote ? '🌐 ออนไลน์' : `${S.T.name} ${'★'.repeat(S.T.stars)}`);
setText('xem-stat', `${n.n} ตัว · ${num(n.kg)} กก. รอบนี้`);
let left = '';
if (ca && ca.active) { const l = Math.max(0, ca.end - (Wd.minutes + (Wd.day - ca.day) * 1440)); left = ` · เหลือเวลารอบ ${Math.floor(l / 60)}:${String(Math.floor(l % 60)).padStart(2, '0')}`; }
setText('xem-clock', `🕐 ${Wd.clock()}${left}${X.slow ? ' · 🐢 ×0.5' : ''}`);
setText('xem-gear', S.remote && S.remote.gear ? S.remote.gear() : gearText());
const slowT = (X.slow ? '🐢 กำลังช้า ×0.5' : '🐢 ช้า ×0.5') + (CC.UI && CC.UI.touch ? '' : ' (Space)');
setText('xem-slow', slowT); setCls('xem-slow', X.slow ? 'on' : '');
setCls('xem-learn', WG.learn ? 'on' : '');
const fight = WG.state === 'fighting' && WG.fight;
const c1 = S.c1, c2 = S.c2;
setText('xem-c1', c1 ? c1.text : ''); setCls('xem-c1', c1 ? 'xc-' + c1.cls : '');
setText('xem-c2', c2 ? c2.text : ''); setCls('xem-c2', c2 ? 'xc-' + c2.cls : '');
const zr = CC.RigDraw && CC.RigDraw.zoomRect, R = Rn();
if (zr && R && R.W) { const xr = Math.round(R.W - zr.x + 10) + 'px'; if (lastDom.xr !== xr) { lastDom.xr = xr; root.style.setProperty('--xr', xr); chartSize = null; } }
$('xem-cap').classList.toggle('hidden', !!fight);
const hideChart = !!fight || !!S.remote;
if (lastDom.chartHid !== hideChart) { lastDom.chartHid = hideChart; chartSize = null; chartAt = -1; }
$('xem-chart').classList.toggle('hidden', hideChart);
$('xem-fb').classList.toggle('hidden', !fight);
if (fight) fightDom(WG.fight); else if (!S.remote) drawChart();
}
function fightDom(F) {
const line = S.lineO, TU = CC.DaiFight.TUNE, r = F.Ts / line.leader, SCALE = 1.25, blink = Math.floor(performance.now() / 160) % 2 === 0;
setSt('xfb-fill', 'transform', scaleX(r / SCALE));
setSt('xfb-fill', 'background', r > 1 ? (blink ? '#ff2a1a' : '#b8160c') : r > 0.8 ? '#ef6b4a' : r > 0.55 ? '#f2c14e' : '#5fc46a');
setSt('xfb-over', 'width', (U.clamp(F.overAcc / TU.over, 0, 1) * 100).toFixed(1) + '%');
setSt('xfb-mark', 'left', (100 / SCALE).toFixed(1) + '%');
setSt('xfb-stam', 'transform', scaleX(F.stamina));
setSt('xfb-stam', 'background', F.stamina < 0.38 ? '#5fc46a' : F.stamina < 0.6 ? '#f2c14e' : '#ef8a5a');
const ph = F.phase();
setText('xfb-phase', `${ph.i} ${ph.t}`);
const nod = F.sp.id === 'diec';
const w = F.warn === 'surge' ? '⚡ กำลังจะพุ่งหนี!' : F.warn === 'run' ? '⚡ กำลังจะวิ่ง!' : F.warn === 'shake' ? (nod ? '⚡ กำลังจะพยักหัว!' : '⚡ กำลังจะสะบัดหัว!')
: WG.turnFlash > 0 ? '✔ ดักทางหัวปลาได้!' : WG.dodgeFlash > 0 ? '✔ ผ่อนรับจังหวะพอดี!' : '';
setText('xfb-warn', w); setCls('xfb-warn', w ? (F.warn ? 'on' : 'ok') : '');
setText('xfb-num', `${spName(F.sp)} ${U.fmtKg(F.w)} · ${num(F.Ts)}/${num(line.leader)} กก. · คัน ${Math.round(WG.theta / DEG)}° · คัน–สาย ${Math.round(F.alpha / DEG)}°${F.arm < 0.95 ? ` · แรงมือ ${Math.round(F.arm * 100)}%` : ''}`);
const H = S.hand;
setText('xh-main', H ? H.main : '✊ งัด — ยกคัน');
setCls('xh-main', H ? (H.hold ? 'hold ' : '') + (H.cls || '') : 'hold');
setText('xh-side', H && H.side ? H.side : '');
setCls('xh-side', H && H.side ? 'side' : 'hidden');
const c2 = S.c2 && WG.t - S.c2.t0 < 3 ? S.c2 : null;
setText('xfb-c2', c2 ? c2.text : ''); setCls('xfb-c2', c2 ? 'xc-' + c2.cls : '');
$('xem-fb').classList.toggle('holding', !!(H && H.hold));
}
let chartAt = -1, chartSize = null;
if (hasDom) window.addEventListener('resize', () => { chartSize = null; chartAt = -1; });
function drawChart() {
const c = $('xem-chart');
if (!c) return;
const now = performance.now();
if (chartSize && chartAt >= 0 && now - chartAt < 66) return;
if (!chartSize) chartSize = { w: c.clientWidth, h: c.clientHeight };
const w = chartSize.w, h = chartSize.h;
if (!w || !h) { chartSize = null; return; }
chartAt = now;
const dp = Math.min(window.devicePixelRatio || 1, 2);
if (c.width !== Math.round(w * dp) || c.height !== Math.round(h * dp)) { c.width = Math.round(w * dp); c.height = Math.round(h * dp); }
const g = c.getContext('2d');
g.setTransform(dp, 0, 0, dp, 0, 0);
g.clearRect(0, 0, w, h);
g.fillStyle = 'rgba(10,16,20,0.78)';
g.beginPath(); if (g.roundRect) g.roundRect(0, 0, w, h, 8); else g.rect(0, 0, w, h); g.fill();
const fs = h < 60 ? 10 : 11, top = fs + 6, bot = 4, n = S.fN, cau = S.restV != null ? S.restV : S.cauV, can = S.canV;
const vMin = Math.max(-1, cau - 2.6), vMax = Math.min(n + 1.5, Math.max(can + 1.2, cau + 3.2));
const t1 = WG.t, t0 = t1 - CHART_SEC, X0 = 34, X1 = w - 6;
const px = t => X0 + (t - t0) / CHART_SEC * (X1 - X0);
const py = v => top + (1 - (U.clamp(v, vMin, vMax) - vMin) / (vMax - vMin)) * (h - top - bot);
g.fillStyle = 'rgba(95,196,106,0.28)';
let m0 = null;
const sm = S.samples;
for (let i = 0; i <= sm.length; i++) {
const p = sm[i], on = p && p.m;
if (on && m0 == null) m0 = p.t;
if (!on && m0 != null) { const e = p ? p.t : t1; g.fillRect(px(m0), top - 2, Math.max(2, px(e) - px(m0)), h - top - bot + 2); m0 = null; }
}
g.lineWidth = 1;
g.setLineDash([4, 3]); g.strokeStyle = 'rgba(242,193,78,0.75)';
g.beginPath(); g.moveTo(X0, py(cau)); g.lineTo(X1, py(cau)); g.stroke();
g.setLineDash([2, 4]); g.strokeStyle = 'rgba(255,255,255,0.35)';
g.beginPath(); g.moveTo(X0, py(can)); g.lineTo(X1, py(can)); g.stroke();
g.setLineDash([]);
g.font = `${fs - 1}px "Sarabun", "Tahoma", "Segoe UI", sans-serif`; g.textAlign = 'right'; g.textBaseline = 'middle';
g.fillStyle = 'rgba(242,193,78,0.9)'; g.fillText(`ตก ${half(cau)}`, X0 - 3, py(cau));
g.fillStyle = 'rgba(255,255,255,0.55)'; if (Math.abs(py(can) - py(cau)) > fs) g.fillText(`ตั้ง ${half(can)}`, X0 - 3, py(can));
g.lineWidth = 1.8; g.lineJoin = 'round';
let open = false, sinkSeg = null;
for (const p of sm) {
if (p.y == null) { if (open) { g.stroke(); open = false; } continue; }
if (!open || sinkSeg !== p.s) {
if (open) g.stroke();
g.strokeStyle = p.s ? 'rgba(200,215,225,0.45)' : '#f4f7f5';
g.beginPath(); g.moveTo(px(p.t), py(p.y)); open = true; sinkSeg = p.s;
} else g.lineTo(px(p.t), py(p.y));
}
if (open) g.stroke();
g.font = `bold ${fs}px "Sarabun", "Tahoma", "Segoe UI", sans-serif`; g.textBaseline = 'bottom';
for (const mk of S.marks) {
const x = px(mk.t);
g.strokeStyle = mk.hit ? 'rgba(127,220,138,0.9)' : 'rgba(255,120,100,0.9)'; g.lineWidth = 1.5;
g.beginPath(); g.moveTo(x, top); g.lineTo(x, h - bot); g.stroke();
const label = mk.hit ? '⚡ติด' : '⚡วืด', lw = g.measureText(label).width;
g.textAlign = x + lw / 2 > w - 4 ? 'right' : 'center';
g.fillStyle = mk.hit ? '#9ff0a8' : '#ffb4a6'; g.fillText(label, g.textAlign === 'right' ? x - 2 : x, h - 2);
}
const st = S.stats;
g.font = `${fs}px "Sarabun", "Tahoma", "Segoe UI", sans-serif`; g.textAlign = 'left'; g.textBaseline = 'top';
g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillText(`📈 อาการทุ่น 12 วินาที${st.strikes ? ` · วัด ${st.strikes}, ติด ${st.hooked}, ขึ้น ${st.landed}` : ''}`, 6, 3);
g.fillStyle = 'rgba(159,240,168,0.9)'; g.textAlign = 'right'; g.fillText(w < 420 ? 'เขียว = ปลากำลังอมเหยื่อ' : 'สีเขียว = จังหวะปลากำลังอมเหยื่อ', w - 6, 3);
}
function drawExtras() {
const R = Rn(), ctx = R && R.ctx;
if (!ctx) return;
const s = R.s, t = WG.t, light = CC.world.light();
const su = Pond.suitor;
if (WG.learn && su && !su.lineOnly && WG.sol && (WG.state === 'waiting' || WG.state === 'sinking')) {
const a = su.acts[su.i], ty = a ? a.type : 'pause', sp = su.sp;
const bottom = CC.bottomDepth(WG.floatX) * 100;
const hx = R.X(WG.floatX + (WG.dyn.drift || 0) * 2) + 4, hy = R.Y(-Math.min(WG.sol.low, bottom) / 100);
const L = U.clamp(CC.fishLength(sp, Math.max(0.02, su.w || 0.05)) / 100 * s * 1.9, 12, 2.2 * s);
const p = a ? U.clamp(su.t / (a.dur || 1), 0, 1) : 0;
let gap = 0.22 * s, ang = 0, dy = 0;
if (ty === 'brush' || ty === 'quiver') gap = 0.12 * s + Math.sin(t * 7) * 2;
else if (ty === 'nibble' || ty === 'nod' || ty === 'tease' || ty === 'jitter' || ty === 'grab') gap = Math.sin(p * Math.PI) * -0.02 * s + 0.04 * s;
else if (a && a.mouth) {
gap = -0.02 * s;
if (ty === 'lift' || ty === 'hold' || ty === 'lie') { ang = 0.35; dy = -0.05 * s * Math.min(1, su.t / 0.4); }
else if (ty === 'dun' || ty === 'sink' || ty === 'creep' || ty === 'dip' || ty === 'slow') ang = -0.3;
else if (ty === 'run' || ty === 'dive' || ty === 'snatch') { gap = -0.02 * s + p * 0.4 * s; ang = -0.25; dy = p * 0.08 * s; }
} else gap = 0.25 * s + Math.sin(t * 0.9 + su.w * 9) * 0.06 * s;
const cx = hx + gap + L * 0.5, cy = hy - L * 0.12 + dy;
ctx.save(); ctx.translate(hx + gap, cy); ctx.rotate(ang); ctx.translate(-(hx + gap), -cy);
ctx.fillStyle = 'rgba(210,240,255,0.16)';
ctx.beginPath(); ctx.ellipse(cx, cy, L * 0.62, L * 0.3, 0, 0, 7); ctx.fill();
CC.drawFish(ctx, cx, cy, L, sp, -1, t * (a && a.mouth ? 10 : 6), 0.95);
ctx.restore();
}
if (WG.state === 'landed' && S.catchShow) {
const L = U.clamp(CC.fishLength(S.catchShow.sp, S.catchShow.w) / 100 * s * 2, 18, 3 * s);
const hx = R.X(CC.ROD_BASE.x) + 0.05 * s, hy = R.Y(CC.ROD_BASE.y) - 0.35 * s;
ctx.save(); ctx.translate(hx + L * 0.45, hy); ctx.rotate(Math.sin(t * 7) * 0.22);
CC.drawFish(ctx, 0, 0, L, S.catchShow.sp, 1, t * 12, 1);
ctx.restore();
if (Math.floor(t * 3) % 2) { ctx.fillStyle = 'rgba(255,240,170,0.9)'; ctx.fillRect(hx + L * 1.05, hy - L * 0.3, 2, 2); ctx.fillRect(hx + L * 0.2, hy - L * 0.4, 2, 2); }
}
if (WG.state === 'fighting' && S.hand) {
const H = S.hand, x = R.X(CC.ROD_BASE.x) - 0.15 * s, y = R.Y(CC.ROD_BASE.y) + 0.55 * s;
const txt = H.key + (H.side ? (H.side.charAt(0) === '⬅' ? ' ◀' : ' ▶') : '');
ctx.font = `bold ${Math.round(U.clamp(s * 0.26, 11, 16))}px "Sarabun", "Tahoma", "Segoe UI", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
const tw = ctx.measureText(txt).width + 14, th = Math.round(U.clamp(s * 0.36, 16, 22));
ctx.fillStyle = H.key === 'งัด' ? 'rgba(242,193,78,0.92)' : H.key === 'ช้อน' ? 'rgba(95,196,106,0.95)' : 'rgba(235,240,238,0.9)';
ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x - tw / 2, y - th / 2, tw, th, th / 2); else ctx.rect(x - tw / 2, y - th / 2, tw, th); ctx.fill();
ctx.fillStyle = '#16120a'; ctx.fillText(txt, x, y + 1);
}
const nx = R.X(-0.7), ny = R.Y(0.45) - 1.12 * s;
ctx.font = `600 ${Math.round(U.clamp(s * 0.22, 10, 14))}px "Sarabun", "Tahoma", "Segoe UI", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
ctx.fillStyle = `rgba(0,0,0,${0.35 + 0.15 * light})`; ctx.fillText(S.n.name, nx + 1, ny + 1);
ctx.fillStyle = 'rgba(255,248,225,0.95)'; ctx.fillText(S.n.name, nx, ny);
}
const Wd = CC.world, baseWU = Wd && Wd.update;
if (baseWU) Wd.update = function (dtGame, dtReal) {
const r = baseWU.apply(this, arguments);
if (X.on && S) tick(dtReal != null ? dtReal : dtGame / (Wd.timeScale || 0.2));
return r;
};
const baseMapUpdate = M.update;
if (baseMapUpdate) M.update = function () {
const ev = baseMapUpdate.apply(this, arguments);
if (X.on && ev && ev.length) {
const bw = CC.pond().bigW, big = bw ? bw[1] : CC.pond().type === 'latvot' ? 18 : 2.5;
for (const e of ev) if (e && e.near) { e.near = false; e.notable = e.w > big; }
}
return ev;
};
const Rd = CC.Render, baseDraw = Rd && Rd.draw;
if (baseDraw) Rd.draw = function (G, dt) {
if (!X.on || !S) return baseDraw.apply(this, arguments);
const self = this, sdt = (dt || 0) * (X.slow ? 0.5 : 1);
try { withNpc(() => { baseDraw.call(self, WG, sdt); drawExtras(); }); } catch (e) { if (typeof console !== 'undefined') console.error('[ดูเพื่อนตก]', e); }
updateDom();
};
if (hasDom) {
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
else boot();
}
})();
