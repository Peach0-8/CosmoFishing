(function () {
const U = CC.U;
const M = CC.PondMap = {};
M.W = 60; M.H = 30;
function seeded(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
M.build = () => {
const rnd = seeded(2024), spots = [];
const add = (x, y, nx, ny, side) => {
const i = spots.length;
const deep = side === 'ตะวันออก' ? 0.25 : side === 'ตะวันตก' ? -0.2 : 0;
const raw = 2.05 + deep + 0.18 * Math.sin(i * 1.3) + (rnd() - 0.5) * 0.2;
spots.push({
id: i + 1, x, y, nx, ny, side,
dn: U.clamp((raw - 1.65) / 0.8, 0, 1), depth: raw,
mud: rnd() < 0.5,
shade: (side === 'เหนือ' && x < 28) || (side === 'ตะวันออก' && y < 18),
corner: false
});
};
for (let i = 0; i < 12; i++) add(2.5 + i * 5, 0, 0, 1, 'เหนือ');
for (let i = 0; i < 8; i++) add(M.W, 1.9 + i * 3.75, -1, 0, 'ตะวันออก');
for (let i = 0; i < 12; i++) add(M.W - 2.5 - i * 5, M.H, 0, -1, 'ใต้');
for (let i = 0; i < 8; i++) add(0, M.H - 1.9 - i * 3.75, 1, 0, 'ตะวันตก');
[1, 12, 13, 20, 21, 32, 33, 40].forEach(id => { spots[id - 1].corner = true; });
M.spots = spots;
M.aerators = [{ x: 15, y: 9 }, { x: 45, y: 21 }];
M.inlet = { x: 0, y: 15 };
M.hut = { x: 30, y: M.H };
};
M.build();
M.spot = id => M.spots[(id - 1 + 40) % 40];
M.applyPond = () => {
const pond = CC.pond(), [d0, d1] = pond.depth, weed = pond.weedSpots || [];
M.spots.forEach(sp => {
sp.depth = Math.round((d0 + (d1 - d0) * sp.dn) * 100) / 100;
sp.weed = weed.includes(sp.id);
});
};
M.stockT = 0;
M.stock = () => { M.stockT = 45; };
M.stockBoost = sp => M.stockT > 0 ? 1 + 0.5 * (M.stockT / 45) * (sp.side === 'ใต้' && sp.x > 18 && sp.x < 42 ? 1.5 : 1) : 1;
M.aeratorOn = () => {
const h = CC.world.hour();
return (h >= 11.5 && h < 12) || (h >= 17.5 && h < 18) || h >= 23 || h < 4;
};
function windVec() { const a = CC.world.windAngle || 0; return { x: Math.cos(a), y: Math.sin(a) }; }
M.windFace = sp => { const w = windVec(); return -(w.x * sp.nx + w.y * sp.ny); };
function fishPoint(sp) { return { x: sp.x + sp.nx * 5, y: sp.y + sp.ny * 5 }; }
const AD = [], INLET = [];
M.aerDist = sp => {
let d = AD[sp.id];
if (d == null) { const p = fishPoint(sp); d = AD[sp.id] = Math.min(...M.aerators.map(a => Math.hypot(a.x - p.x, a.y - p.y))); }
return d;
};
const nearInlet = sp => { let v = INLET[sp.id]; if (v == null) v = INLET[sp.id] = Math.hypot(sp.x - M.inlet.x, sp.y - M.inlet.y) < 8; return v; };
function qEnv() {
const Wd = CC.world, light = Wd.light(), a = Wd.windAngle || 0, dp = CC.pond().depth, sunny = Wd.weather === 'sunny';
return { wx: Math.cos(a), wy: Math.sin(a), wk: Math.min(1, Wd.wind / 4), heat: U.clamp((Wd.temp - 27) / 5, -1, 1),
dk: Math.min(1, (dp[1] - dp[0]) / 0.5), bright: sunny && light > 0.6, aer: M.aeratorOn() ? 0.45 : 0.08 };
}
function qOf(sp, e) {
let q = 1;
q *= 1 + 0.22 * -(e.wx * sp.nx + e.wy * sp.ny) * e.wk;
q *= 1 + 0.3 * e.heat * (sp.dn - 0.5) * 1.6 * e.dk;
q *= M.stockBoost(sp);
if (e.bright) q *= sp.shade ? 1.15 : 0.93;
if (sp.weed) {
q *= 1.12;
if (e.bright) q *= 1.08;
}
q *= 1 + e.aer * Math.max(0, 1 - M.aerDist(sp) / 18);
if (nearInlet(sp)) q *= 1.1;
if (sp.corner) q *= 1.08;
q *= 1 - M.neighborPull(sp.id);
return U.clamp(q, 0.55, 2.2);
}
M.quality = sp => qOf(sp, qEnv());
const baseQuality = M.quality;
M.describe = sp => {
const tags = [];
const wf = M.windFace(sp);
if (CC.world.wind > 1.5) tags.push(wf > 0.4 ? 'ลมตีเข้าหน้า (คลื่นพัดปลารวมตัว)' : wf < -0.4 ? 'ลมส่งหลัง (ผิวน้ำเรียบ)' : 'ลมขวาง');
tags.push(`ลึก ~${sp.depth.toFixed(1)} ม., ${sp.mud ? 'พื้นโคลน' : 'พื้นแข็ง'}`);
if (sp.shade) tags.push('มีร่มเงาไม้');
if (sp.weed) tags.push('ติดกอผักบุ้ง (ปลาตะเพียนจีนชอบซ่อน)');
const ad = M.aerDist(sp);
if (ad < 12) tags.push(`ใกล้กังหันตีน้ำ (${Math.round(ad)} ม.${M.aeratorOn() ? ', เปิดอยู่' : ''})`);
if (Math.hypot(sp.x - M.inlet.x, sp.y - M.inlet.y) < 8) tags.push('ใกล้ท่อน้ำเข้า');
if (sp.corner) tags.push('มุมบ่อ');
return tags;
};
const NAMES = ['น้าสมชาย', 'พี่เอก', 'ลุงวิทย์', 'ตั้ม ปลานิล', 'พี่ก้อง', 'ป้าพร', 'ตาบัติ', 'พี่โต้ง',
'มิน ชิงหลิว', 'น้าเดช', 'พี่บอย', 'พี่อาร์ต', 'ลุงดำ', 'อ้วน ทรงพลัง', 'พี่ต้น', 'น้าวัฒน์', 'เจ๊ต่าย', 'พี่นนท์',
'เจ๊แนน', 'พี่เอ็ม', 'น้าชัย', 'พี่เป้', 'ลุงน้อย', 'พี่เบียร์', 'โต้ง ตะกร้อ', 'น้าปู', 'พี่ตูน', 'พี่เจ',
'ลุงหมวด', 'พี่แบงค์', 'หลิว จอมทุ่น', 'น้าเข้ม', 'พี่กอล์ฟ', 'ป้าหน่อย'];
const LINES = {
miss: ['รีบวัดไปหน่อย รอทุ่นจมชัดๆ ก่อนสิ!', 'จังหวะเมื่อกี้แค่ปลาเล็กตอดชิม อย่ารีบวัด', 'ทุ่นกระตุกยิบๆ แบบนั้นปลารบกวนทั้งนั้น รอจังหวะมันอมจริงก่อน'],
snap: ['งัดแข็งเกินสายหน้าก็ขาดสิ ปลาวิ่งต้องลดคันตามมันหน่อย', 'สายหน้าเส้นเล็กต้องอัดเบามือเข้าไว้'],
chum: ['อ่อยให้สม่ำเสมอหน่อย ปลายังไม่เข้าหลุมเลย', 'ต้นรอบต้องอ่อยติดๆ กันสักสิบไม้ ปลาถึงจะเข้าหลุม'],
over: ['อ่อยหนักขนาดนั้น เดี๋ยวปลาก็อิ่มหมดพอดี!', 'หลุมแน่นเกินไปแล้ว ปลารบกวนยกโขยงมากันเต็มแน่'],
idle: ['วันนี้ปลากินกลางน้ำ ลองตั้งตกแบบลอยดูสิ', 'อากาศร้อนแบบนี้ปลาลงไปกบดานก้นบ่อหมด', 'พอกังหันตีน้ำเปิด เดี๋ยวปลาก็มาออกันแถวนี้แหละ', 'เหยื่อคาวเติมเปรี้ยวนิดนึง ปลานิลชอบนักแล']
};
M.say = (kind, sp) => {
const nb = M.adjacent(sp).filter(n => n.npc && !n.npc.real);
if (!nb.length) return null;
const n = nb[(Math.random() * nb.length) | 0].npc;
const own = (CC.pond().say || {})[kind] || [], common = LINES[kind] || [];
const arr = own.length && (kind === 'miss' || !common.length || Math.random() < 0.7) ? own : common;
if (!arr.length) return null;
return `${n.name} (ช่อง ${n.id}): “${arr[(Math.random() * arr.length) | 0]}”`;
};
M.newCa = playerId => {
const used = new Set();
const [s0, s1] = CC.pond().npcSkill;
M.applyPond();
M.stockT = 0;
M.npcs = {};
M.spots.forEach(sp => {
if (sp.id === playerId || Math.random() > 0.65) return;
let name, tries = 0;
do { name = NAMES[(Math.random() * NAMES.length) | 0]; } while (used.has(name) && ++tries < 60);
if (used.has(name)) name += ' ' + sp.id;
used.add(name);
M.npcs[sp.id] = { id: sp.id, name, skill: U.rand(s0, s1), chum: U.rand(0.3, 1), n: 0, kg: 0, big: 0 };
});
};
M.npcAt = id => (M.npcs || {})[id];
M.adjacent = sp => [M.spot(sp.id - 1), M.spot(sp.id + 1)].map(s => ({ spot: s, npc: M.npcAt(s.id) }));
M.neighborPull = id => {
let p = 0, n = M.npcAt(((id - 2 + 40) % 40) + 1);
if (n) p += 0.07 * n.skill * n.chum;
n = M.npcAt(((id + 40) % 40) + 1);
if (n) p += 0.07 * n.skill * n.chum;
return p;
};
M.update = (dtMin, playerId) => {
const ev = [];
if (!M.npcs) return ev;
if (M.stockT > 0) M.stockT -= dtMin;
const pond = CC.pond(), qf = M.quality !== baseQuality ? M.quality : null;
let list = null, env = null;
const bigW = pond.bigW ? pond.bigW[0] : pond.type === 'latvot' ? 18 : 1.5;
for (const id in M.npcs) {
if (+id === M.watched) continue;
const n = M.npcs[id], sp = M.spot(+id);
if (n.real) continue;
if (!qf && !env) env = qEnv();
const rate = 0.11 * (pond.npcRate || pond.rate) * n.skill * (qf ? qf(sp) : qOf(sp, env));
if (Math.random() < rate * dtMin) {
if (!list) list = CC.pondFish().filter(f => !f.tap);
const fish = U.pickWeighted(list, f => f.abund * pond.fish[f.id]);
const w = CC.rollWeight(fish);
if (w < pond.minW) continue;
n.n++; n.kg += w; n.big = Math.max(n.big, w);
const gap = Math.abs(+id - playerId), near = Math.min(gap, 40 - gap) <= 2;
ev.push({ npc: n, fish, w, near, notable: near || w > bigW });
}
}
return ev;
};
M.ranking = (playerKg, playerN) => {
const rows = Object.values(M.npcs || {}).map(n => ({ name: `${n.name} (ช่อง ${n.id})`, kg: n.kg, n: n.n }));
rows.push({ name: 'คุณ', kg: playerKg, n: playerN || 0, me: true });
return rows.sort((a, b) => b.kg - a.kg);
};
})();
