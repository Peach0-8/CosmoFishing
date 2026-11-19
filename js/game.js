(function () {
const U = CC.U, R = CC.Render, UI = CC.UI, A = CC.Audio, Rig = CC.Rig, Pond = CC.Pond;
const Game = CC.Game = { input: { down: false, up: false, dn: false, aim: null, holdPtr: false, holdKey: false, grabX: null, phi0: 0, left: false, right: false, px: 0, py: 0 } };
const inp = Game.input;
const DEG = Math.PI / 180, REST = 3 * DEG;
const G = CC.G = {
t: 0, state: 'hand', theta: REST, thetaTarget: REST, bend: 0, power: 0, powerDir: 1,
fly: null, floatX: 4, spotX: 4, sink: 0, sol: null, rig: null,
dyn: { v: 0, vel: 0, tilt: 0, wave: 0, tiltX: 0 },
fight: null, fightTime: 0, learn: false, saveT: 0, sigLog: []
};
function nuoiO(x, dx, xa) {
const bx = xa && CC.P.bowls ? CC.P.bowls.xa : null, g = bx && bx.gao > 0 ? Math.min(0.6, bx.gao * 2) : 0;
if (g) { Pond.gao = (Pond.gao || 0) + x * g * 1.3 * Math.exp(-((dx / 0.8) ** 2)); x *= 1 - g; }
Pond.addFood(x, dx);
}
const pondReset = Pond.reset;
Pond.reset = function () { Pond.gao = 0; return pondReset.apply(this, arguments); };
function start() {
CC.P = CC.load();
G.learn = !!CC.P.learn;
G.xa = !!CC.P.xa;
G.rig = { lead: CC.P.lead, set: CC.P.set, baits: [0, 0], baitLeft: [1, 1], baitAge: 0 };
CC.PondMap.applyPond();
Game.applySpot(CC.P.ca && CC.P.ca.o ? CC.P.ca.o : 17);
if (CC.P.ca && CC.P.ca.active) { CC.PondMap.newCa(CC.P.ca.o); Pond.reset(G.q); }
R.init(document.getElementById('cv'));
if (CC.P.view3d === true) Game.load3D(ok => { if (ok) { CC.View3D.setOn(true); UI.refresh(); } });
UI.init();
R.resize();
Game.updateSpot();
bindInput();
if (!CC.P.ca || !CC.P.ca.active) UI.open('pond');
pace.last = pace.prev = performance.now();
const loop = now => {
requestAnimationFrame(loop);
const paused = UI.isOpen(), since = Game.paceStep(now, paused);
if (since < 0) return;
frame(Math.min(0.05, since / 1000));
const V = CC.View3D, Dao = CC.Dao;
if (!paused && !(V && V.on) && !(Dao && Dao.on && !Dao.watch) && R.perfFrame) R.perfFrame(since);
};
requestAnimationFrame(loop);
document.addEventListener('visibilitychange', () => { if (R.perfReset) R.perfReset(30); });
}
const pace = Game.pace = { last: 0, prev: 0, iv: 1000 / 60 };
Game.paceStep = (now, paused) => {
const raw = now - pace.prev;
pace.prev = now;
if (raw > 2 && raw < 50) pace.iv += (raw - pace.iv) * 0.05;
const since = now - pace.last;
const k = Math.floor(1000 / 60 / pace.iv + 0.25);
if (paused ? since < 45 : k >= 2 && since < (k - 0.5) * pace.iv) return -1;
pace.last = now;
return since;
};
Game.applySpot = id => {
const sp = CC.PondMap.spot(id);
G.spot = sp;
CC.spotSeed = id * 1.37;
CC.spotDepth = sp.depth;
G.q = CC.PondMap.quality(sp);
if (G.rig) Game.updateSpot();
};
Game.updateSpot = () => {
const rod = CC.rod();
const tip = CC.rodTip(REST, rod.len);
const wind = rod.len - G.rig.set / 100 - 0.25;
G.spotX = wind > tip.y ? tip.x + Math.sqrt(wind * wind - tip.y * tip.y) : tip.x + 0.2;
G.tooDeep = wind <= tip.y;
if (G.state === 'hand') G.floatX = G.spotX;
R.setView(G.spotX);
};
Game.bottomCm = x => CC.bottomDepth(x) * 100;
const classic = () => !!(CC.P && CC.P.fightCtl === 'aim');
const fighting = () => G.state === 'fighting' && G.fight && !classic();
Game.sliding = () => inp.holdPtr && G.t - (inp.slideT == null ? -9 : inp.slideT) < 0.35;
Game.holding = () => ((inp.holdPtr && !Game.sliding()) || inp.holdKey) && !(G.state === 'fighting' && G.fightTime < (inp.carryUntil || 0));
function fightGrab(x) { inp.holdPtr = true; inp.grabX = x; inp.lastX = x; inp.phi0 = G.phiT || 0; inp.slideT = null; inp.carryUntil = 0; }
function fightSteer(x) {
const TU = CC.DaiFight.TUNE, max = TU.phiMax * DEG;
if (Math.abs(x - (inp.lastX == null ? x : inp.lastX)) >= 2) inp.slideT = G.t;
inp.lastX = x;
G.phiT = U.clamp(inp.phi0 + (x - inp.grabX) / Math.max(160, R.W * 0.22) * max, -max, max);
}
function letGo() { inp.holdPtr = false; inp.grabX = null; }
function bindInput() {
const cv = document.getElementById('cv');
const grab = e => { try { if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId); } catch (er) {   } };
cv.addEventListener('pointerdown', e => {
if (e.button !== 0) return;
inp.px = e.clientX; inp.py = e.clientY; inp.ptrDown = true;
if (fighting()) { A.init(); fightGrab(e.clientX); grab(e); return; }
aimFrom(e); press();
if (G.state === 'fighting') grab(e);
});
cv.addEventListener('pointermove', e => {
inp.px = e.clientX; inp.py = e.clientY;
if (fighting()) { if (inp.holdPtr && inp.grabX != null) fightSteer(e.clientX); return; }
aimFrom(e);
});
window.addEventListener('pointerup', () => { inp.ptrDown = false; letGo(); release(); });
window.addEventListener('pointercancel', () => { inp.ptrDown = false; letGo(); release(); });
cv.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('keydown', e => {
if (UI.isOpen()) { if (e.key === 'Escape') UI.close(); return; }
const k = e.key.toLowerCase();
if (e.code === 'Space') {
e.preventDefault(); inp.keyDown = true;
if (fighting()) { if (!e.repeat) inp.carryUntil = 0; inp.holdKey = true; } else if (!e.repeat) press();
return;
}
if (k === 'w' || k === 'arrowup') { inp.up = true; inp.aim = null; }
if (k === 's' || k === 'arrowdown') { inp.dn = true; inp.aim = null; }
if (G.state === 'fighting' && (k === 'a' || k === 'arrowleft')) inp.left = true;
if (G.state === 'fighting' && (k === 'd' || k === 'arrowright')) inp.right = true;
if (e.repeat) return;
if (k === 'e') Game.net();
if (k === 'c') Game.openSetup();
if (k === 'v') Game.toggleLearn();
if (k === 'x') Game.toggleXa();
if (k === 'b') Game.openMix();
if (k === 'm') UI.open('map');
if (k === 'g') Game.toggleView();
});
window.addEventListener('keyup', e => {
if (e.code === 'Space') { inp.keyDown = false; inp.holdKey = false; release(); }
const k = e.key.toLowerCase();
if (k === 'w' || k === 'arrowup') inp.up = false;
if (k === 's' || k === 'arrowdown') inp.dn = false;
if (k === 'a' || k === 'arrowleft') inp.left = false;
if (k === 'd' || k === 'arrowright') inp.right = false;
});
window.addEventListener('blur', () => { inp.down = inp.up = inp.dn = inp.left = inp.right = inp.holdKey = false; letGo(); });
}
function aimFrom(e) {
if (G.state !== 'fighting' || !classic()) return;
if (CC.View3D && CC.View3D.on) { inp.aim = CC.View3D.aimFromScreen(e.clientX, e.clientY); return; }
const bx = R.X(CC.ROD_BASE.x), by = R.Y(CC.ROD_BASE.y);
inp.aim = U.clamp(Math.atan2(by - e.clientY, Math.max(1, e.clientX - bx)), 0, 120 * DEG);
}
function press() {
if (UI.isOpen()) return;
A.init();
inp.down = true;
if (G.state === 'hand') {
if (!CC.P.ca || !CC.P.ca.active) { UI.open('pond'); return; }
if (!CC.P.ca.o) { UI.open('map', { draw: UI.drawSpots() }); return; }
if (G.tooDeep) { UI.toast('ทุ่นตั้งลึกเกินความยาวคัน — กด C เพื่อเปิดหน้าต่างตั้งทุ่น', 'bad'); return; }
G.state = 'charging'; G.power = 0; G.powerDir = 1;
} else if (G.state === 'waiting' || G.state === 'sinking') strike();
}
function release() {
if (!inp.down) return;
inp.down = false;
if (G.state === 'charging') cast();
}
function cast() {
const kind = G.xa ? 'xa' : 'cau';
if ((CC.P.leaders || 0) <= 0) {
G.state = 'hand'; G.thetaTarget = REST;
UI.toast('สายหน้าผูกสำเร็จหมดแล้ว! ไปซื้อเพิ่มที่ร้านค้า', 'bad');
return;
}
const bowl = CC.P.bowls && CC.P.bowls[kind];
if (!bowl || bowl.portions <= 0) {
G.state = 'hand'; G.thetaTarget = REST;
UI.toast(kind === 'xa' ? 'ยังไม่มี (หรือหมด) เหยื่ออ่อย — กด B เพื่อผสมเหยื่อ' : 'ยังไม่มี (หรือหมด) เหยื่อตก — กด B เพื่อผสมเหยื่อ', 'bad');
return;
}
bowl.portions--;
Rig.rebait(G.rig, bowl, kind);
if (CC.Quests) CC.Quests.emit('cast', { kind });
let lost = 0;
for (let i = 0; i < 2; i++) if (U.chance((1 - bowl.stick) * (kind === 'xa' ? 0.15 : 0.35))) { G.rig.baitLeft[i] = 0; G.rig.baits[i] = 0; lost++; }
if (lost) UI.toast(lost === 2 ? 'เหวี่ยงแรงจนเหยื่อหลุดทั้งสองเม็ด! ปรับความชื้นและเพิ่มผงใยประสาน' : 'เหยื่อหลุดไป 1 เม็ดตอนเหวี่ยงเบ็ด', 'bad');
UI.refresh();
const tip = CC.rodTip(G.theta, CC.rod().len);
let x = G.spotX + (G.power - 0.78) * 2.5 + U.gauss() * 0.05;
x = U.clamp(x, 0.8, G.spotX + 0.25);
G.fly = { t: 0, dur: 0.75, x0: tip.x, y0: tip.y, x1: x };
G.state = 'flying';
G.thetaTarget = REST;
A.whoosh();
}
function land() {
G.floatX = G.fly.x1;
G.state = 'sinking';
G.sink = 0; G.sinkH = 0;
G.dyn.v = CC.float().n + 6; G.dyn.vel = 0; G.dyn.tilt = 1.45; G.dyn.drift = 0; G.dyn.driftT = null;
R.splash(R.X(G.floatX), R.sy, 6, 0.35);
A.plop();
}
function strike() {
A.strike();
G.strikeT = G.t;
G.thetaTarget = 30 * DEG;
const xa = G.rig.kind === 'xa';
const r = Pond.strike(xa);
if (r) {
startFight(r);
if (CC.Quests) CC.Quests.emit('hook', { sp: r.sp, w: r.w });
return;
}
const hadSignal = G.lastAct && G.t - G.lastActT < 1.2 && G.lastAct !== 'pause';
const left = G.rig.baits[0] + G.rig.baits[1];
if (left > 0.001) nuoiO(left / CC.BAIT.w * (xa ? 0.25 : 0.12) * (G.rig.cloud || 0.5), G.floatX - G.spotX, xa);
G.state = 'hand';
G.sol = null;
if (xa) UI.status('วัดอ่อยเหยื่อ — เหยื่อกระจายลงจุดอ่อยแล้ว');
if (hadSignal && !xa) {
UI.toast('วัดเบ็ดพลาด! ' + (missTip(Pond.lastMiss) || 'ปลาในจุดอ่อยเริ่มระแวง'), 'bad');
if (U.chance(0.35)) { const s = CC.PondMap.say('miss', G.spot); if (s) UI.toast(s, 'info'); }
}
setTimeout(() => { if (G.state === 'hand') G.thetaTarget = REST; }, 350);
}
function missTip(lm) {
if (Pond.missTip) { const t = Pond.missTip(lm); if (t !== undefined) return t; }
if (!lm || !lm.sp || (lm.sp.bite !== 'diec' && lm.sp.bite !== 'jitter')) return null;
if (lm.act === 'jitter' || lm.act === 'grab' || lm.sp.bite === 'jitter') return 'ทุ่นเต้นรัวเป็นปลาซิว (ปลารบกวน) กวนเหยื่อ — อย่าไปวัดตาม ให้ปั้นเหยื่อแข็งและก้อนใหญ่ขึ้น ลดกลิ่นคาวลง';
if (lm.act === 'nod' || lm.act === 'tease') return 'ปลาตะเพียนจีนเพิ่งตอดลองเหยื่อ — รอให้ทุ่นถอนขึ้นหรือทุ่นตอกจมคมๆ แล้วค่อยวัด';
if (lm.act === 'snatch') return 'ทุ่นจมวูบทันทีเป็นลูกปลาตะเพียนจีนแย่งเหยื่อ — ปากเล็ก วัดสิบทีพลาดเก้า';
if (lm.mouth && lm.fit < 0.6) return 'จังหวะถูกแล้วแต่ตัวเบ็ดใหญ่เกินไป ปลาตะเพียนจีนอมไม่เข้า — เปลี่ยนเป็นตัวเบ็ดเบอร์เล็ก (เบอร์ 3)';
if (!lm.mouth && ['lift', 'hold', 'lie', 'dun', 'creep', 'shift', 'spit'].includes(lm.prev)) return 'ช้าไปแล้ว — ปลาตะเพียนจีนคายเหยื่อเร็วมาก พอทุ่นเด้งกลับข้อเดิมคือเหยื่อหลุดจากปากแล้ว';
if (lm.mouth) return 'จังหวะถูกแล้วแต่พลาด — ปลาตะเพียนจีนกินเบามาก ตัวเบ็ดยังไม่ติดปาก ใช้ทุ่นไวกับสายหน้าเล็กจะติดง่ายขึ้น';
return null;
}
function startFight(r) {
const depth = Math.min(G.sol ? G.sol.low : G.rig.set, Game.bottomCm(G.floatX)) / 100;
const ptype = CC.pond().type;
G.fight = new CC.DaiFight(r.sp, r.w, r.hold, G.floatX, depth, { lane: ptype === 'latvot' ? 3.7 : 2.9, yieldP: ptype === 'latvot' ? 0.9 : ptype === 'giai' ? 0.4 : 0.7, yieldKeep: ptype === 'latvot' });
G.state = 'fighting'; G.fightTime = 0;
G.phi = G.phiT = 0; G.hint = null; G.lastWarn = null; G.noHoldT = 0;
inp.aim = 30 * DEG;
inp.holdPtr = !!inp.ptrDown; inp.grabX = inp.ptrDown ? inp.px : null; inp.phi0 = 0; inp.holdKey = !!inp.keyDown;
inp.carryUntil = 1.1;
A.splash(0.5);
R.splash(R.X(G.floatX), R.sy, 8, 0.6);
UI.buzz(40);
document.body.classList.add('fighting');
if (classic()) UI.toast('ติดปลาแล้ว! รักษามุมคัน–สายประมาณ 90° ปลาวิ่งให้ลดคันตาม', 'good');
else if (!CC.P.fightTut || CC.P.fightTut < 3) {
CC.P.fightTut = (CC.P.fightTut || 0) + 1;
UI.toast(UI.touch ? 'ติดปลาแล้ว! แตะค้าง = งัดคัน · ปล่อย = คันช่วยซับแรง' : 'ติดปลาแล้ว! กด Space ค้าง = งัดคัน · ปล่อย = คันช่วยซับแรง', 'good', 3500);
setTimeout(() => { if (G.state === 'fighting') UI.toast(UI.touch ? 'ปลาวิ่งขวา → ลากนิ้วไปทางซ้าย' : 'ปลาวิ่งขวา → กด A / ←', 'info', 3500); }, 4000);
} else UI.toast('ติดปลาแล้ว!', 'good', 1200);
}
function lose(msg, kind) {
A.sad();
CC.P.stats.lost++;
if (kind === 'snap') {
CC.P.leaders = Math.max(0, (CC.P.leaders || 0) - 1);
CC.world.minutes += 2;
msg += ` เหลือสายหน้าอีก ${CC.P.leaders} ชุด`;
}
UI.toast(msg, 'bad', 4500);
if (/สายหน้า/.test(msg) && U.chance(0.35)) { const s = CC.PondMap.say('snap', G.spot); if (s) setTimeout(() => UI.toast(s, 'info'), 1200); }
G.fight = null;
G.state = 'hand'; G.thetaTarget = REST; G.bend = 0; G.phi = G.phiT = 0;
inp.holdKey = false; letGo();
UI.fightHud(false);
CC.save();
}
function landFish(how) {
const F = G.fight, P = CC.P;
const len = CC.fishLength(F.sp, F.w);
const j = P.journal[F.sp.id];
const first = !j, record = first || F.w > j.best;
P.journal[F.sp.id] = { count: (j ? j.count : 0) + 1, best: Math.max(j ? j.best : 0, F.w) };
P.stats.caught++;
if (P.ca) P.ca.caught = (P.ca.caught || 0) + 1;
const pond = CC.pond();
let tagged = false;
if (pond.tag && P.ca && P.ca.tags > 0 && !F.sp.tap && F.w >= pond.minW && U.chance(pond.tag.chance * (CC.Luck && CC.Luck.tag ? CC.Luck.tag() : 1))) {
tagged = true; P.ca.tags--;
if (pond.type !== 'latvot') { P.money += pond.tag.reward; P.stats.earned += pond.tag.reward; }
P.tagsCaught = (P.tagsCaught || 0) + 1;
}
const reward = pond.type === 'latvot' ? (tagged ? pond.tag.reward : F.w >= pond.minW ? CC.latvotReward(F.w) : 0) : 0;
if (F.sp.id === 'tramden' && F.w >= 20) P.bigTram = true;
A.jingle();
UI.buzz([30, 40, 30]);
G.state = 'landed'; G.fight = null; G.bend = 0; G.thetaTarget = REST; G.phi = G.phiT = 0;
inp.holdKey = false; letGo();
UI.fightHud(false);
UI.showCatch({ sp: F.sp, w: F.w, len, record, first, time: G.fightTime, how, tagged, reward, type: pond.type });
if (CC.Quests) CC.Quests.emit('catch', { sp: F.sp, w: F.w, pond: pond.id });
CC.save();
}
Game.net = () => {
if (G.state !== 'fighting' || !G.fight) return;
if (G.fight.tryNet()) landFish('ช้อนสวิง');
else UI.toast(G.fight.fx > 2.7 ? 'ปลายังอยู่ไกล ยกคันนำปลาเข้าใกล้ฝั่งก่อน!' : 'ปลายังมีแรง ไม่ยอมโผล่หัว — พุ่งหนีไปแล้ว!', 'bad');
};
Game.openSetup = () => {
if (G.state !== 'hand') { UI.toast('ยกคันขึ้นมาก่อนถึงจะตั้งทุ่นได้', 'info'); return; }
UI.open('setup');
};
Game.toggleXa = () => {
G.xa = CC.P.xa = !G.xa;
UI.toast(G.xa ? 'เปิดอ่อยเหยื่อ: ทุกครั้งที่ตีจะเป็นก้อนเหยื่ออ่อยขนาดใหญ่เพื่อเปิดจุดอ่อย' : 'กลับสู่โหมดตกปลา: เกี่ยวเม็ดเหยื่อตก', 'info');
UI.refresh();
};
Game.openMix = () => UI.open('mix');
Game.toggleLearn = () => {
G.learn = CC.P.learn = !G.learn;
UI.toast(G.learn ? 'เปิดดูใต้น้ำ (โหมดฝึกหัด)' : 'ปิดดูใต้น้ำ', 'info');
UI.refresh();
};
Game.load3D = done => {
if (CC.View3D && CC.View3D.ready) return done(true);
if (Game.loading3D) return;
Game.loading3D = true;
const files = ['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'js/v3d/core.js', 'js/v3d/anglers.js', 'js/v3d/rig.js'];
const next = i => {
if (i >= files.length) {
Game.loading3D = false;
const V = CC.View3D;
const ok = !!(V && V.ok && (V.ready || V.init()));
if (ok) R.resize();
return done(ok);
}
const s = document.createElement('script');
s.src = files[i];
s.onload = () => next(i + 1);
s.onerror = () => { Game.loading3D = false; done(false); };
document.body.appendChild(s);
};
next(0);
};
Game.toggleView = () => {
const V = CC.View3D;
if (!V || !V.ready) {
UI.toast('กำลังโหลดมุมกล้อง 3D…', 'info');
Game.load3D(ok => {
if (!ok) { UI.toast('เปิดมุมกล้อง 3D ไม่ได้: ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อโหลดไลบรารี 3D ครั้งแรก และเบราว์เซอร์ต้องรองรับ WebGL', 'bad'); return; }
Game.toggleView();
});
return;
}
V.setOn(!V.on);
CC.P.view3d = V.on;
UI.toast(V.on ? '🎥 มุมกล้อง 3D ที่นั่งตก · ลากคลิกขวาหรือกด A/D เพื่อหันมองรอบบ่อ เลื่อนลูกกลิ้งเมาส์เพื่อซูม' : '🎥 มุมกล้องหน้าตัด 2D (มองเห็นใต้น้ำ)', 'info');
UI.refresh();
};
Game.applyRig = () => {
G.rig.lead = CC.P.lead; G.rig.set = CC.P.set;
Game.updateSpot();
};
Game.simulate = (seconds, step) => {
step = step || 1 / 60;
for (let s = 0; s < seconds; s += step) { G.t += step; CC.world.update(step * CC.world.timeScale, step); update(step); }
};
function frame(dt) {
const paused = UI.isOpen();
G.t += dt;
if (!paused) { CC.world.update(dt * CC.world.timeScale, dt); update(dt); }
else A.fightSound(0, 0);
A.update(paused ? 0 : dt);
UI.tick();
R.draw(G, paused ? 0 : dt);
}
function update(dt) {
const rod = CC.rod();
switch (G.state) {
case 'hand':
UI.status(G.tooDeep ? 'ทุ่นตั้งลึกเกินความยาวคัน — กด C เพื่อตั้งทุ่นใหม่'
: 'กดเมาส์ค้าง / Space เพื่อเหวี่ยงเบ็ด ปล่อยเพื่อตีลงจุดอ่อย · C: ตั้งทุ่น · V: ดูใต้น้ำ · G: มุมกล้อง');
break;
case 'charging':
G.power += G.powerDir * dt * 0.8;
if (G.power >= 1) { G.power = 1; G.powerDir = -1; }
if (G.power <= 0) { G.power = 0; G.powerDir = 1; }
G.thetaTarget = REST + G.power * 50 * DEG;
UI.status(`แรงเหวี่ยง ${Math.round(G.power * 100)}% — ปล่อยเมื่อเข็มเข้าแถบสีเขียว`);
break;
case 'flying':
G.fly.t += dt;
if (G.fly.t >= G.fly.dur) land();
break;
case 'sinking':
case 'waiting':
updateInWater(dt);
break;
case 'fighting':
updateFight(dt, rod);
break;
case 'landed':
if (!UI.isOpen()) G.state = 'hand';
break;
}
if (G.state !== 'fighting') A.fightSound(0, 0);
if (G.state === 'fighting' && G.fight) {
const TU = CC.DaiFight.TUNE, pm = TU.phiMax * DEG;
inp.keyT = inp.left || inp.right ? (inp.keyT || 0) + dt : 0;
const kr = TU.phiRate * DEG * dt * (0.5 + 0.5 * Math.min(1, inp.keyT / 0.3));
if (inp.left) G.phiT = Math.max(-pm, (G.phiT || 0) - kr);
if (inp.right) G.phiT = Math.min(pm, (G.phiT || 0) + kr);
if (!inp.left && !inp.right && !inp.holdPtr && G.phiT) G.phiT -= Math.sign(G.phiT) * Math.min(Math.abs(G.phiT), 20 * DEG * dt);
const active = inp.left || inp.right || (inp.slideT != null && G.t - inp.slideT < 1.5);
G.phi = G.fight.steer(dt, G.phiT || 0, G.phi || 0, Game.holding(), CC.line(), active);
if (classic()) {
if (inp.up) inp.aim = Math.min(120 * DEG, (inp.aim != null ? inp.aim : G.theta) + 70 * DEG * dt);
if (inp.dn) inp.aim = Math.max(0, (inp.aim != null ? inp.aim : G.theta) - 70 * DEG * dt);
if (inp.aim != null && G.fightTime > 0.25) G.thetaTarget = inp.aim;
} else if (G.fightTime > 0.25) {
G.theta = G.fight.control(dt, { hold: Game.holding(), steady: Game.sliding(), fine: inp.up ? 1 : inp.dn ? -1 : 0 }, G.theta, rod, CC.line());
G.thetaTarget = G.theta;
}
}
const sp = (G.state === 'flying' ? 400 : rod.speed) * DEG * dt;
G.theta += U.clamp(G.thetaTarget - G.theta, -sp, sp);
if (G.state !== 'fighting') G.bend += ((G.state === 'waiting' || G.state === 'sinking' ? 0.04 : 0) - G.bend) * Math.min(1, dt * 6);
const ca = CC.P.ca;
if (ca && ca.active && CC.world.minutes + (CC.world.day - ca.day) * 1440 >= ca.end && G.state !== 'fighting' && G.state !== 'landed') {
ca.active = false;
G.state = 'hand'; G.thetaTarget = REST;
UI.toast('หมดเวลารอบตกปลาแล้ว! นำกระชังไปชั่งปลากับเจ้าของบ่อ', 'info');
UI.open('weigh');
}
G.qT = (G.qT || 0) - dt;
if (G.qT <= 0 && G.spot) { G.qT = 2; G.q = CC.PondMap.quality(G.spot); }
if (ca && ca.active && G.spot) {
Pond.tick(dt, G.q);
if (Pond.gao > 0.001) { const r = Pond.gao * Math.min(1, dt / 600); Pond.gao -= r; Pond.addFood(r); }
if (Pond.inWave && Pond.wave > 1.2 && G.annWave !== Pond.waveCount && G.state !== 'fighting') {
G.annWave = Pond.waveCount;
if (G.t - (G.waveToastT || -999) > 90) {
G.waveToastT = G.t;
UI.toast(['ฟองปลาผุดพรายรอบจุดอ่อย — ฝูงปลาเข้าจุดแล้ว!', 'ผิวน้ำตรงจุดอ่อยมีฟองเม็ดเล็ก — ปลากำลังคุ้ยหาเหยื่อที่ก้นบ่อ',
'ทุ่นเริ่มขยับแล้ว — ฝูงปลาน่าจะเพิ่งเข้าจุดอ่อย'][Pond.waveCount % 3], 'good');
}
}
const dMin = dt * CC.world.timeScale;
const now = CC.world.hour() * 60, prev = G.lastMin == null ? now : G.lastMin;
G.lastMin = now;
for (const st of CC.pond().stock || []) {
if (prev < st && now >= st) {
CC.PondMap.stock();
UI.toast(`${CC.world.clock()} น. — ทางบ่อปล่อยปลาเพิ่ม! ปลาใหม่กำลังหิว มักรวมตัวกันฝั่งซุ้ม (ฝั่งใต้)`, 'good');
}
}
for (const e of CC.PondMap.update(dMin, G.spot.id)) {
if (CC.View3D && CC.View3D.npcCatch) CC.View3D.npcCatch(e);
if (!e.notable) continue;
R.npcCatch && R.npcCatch(e);
const bw = CC.pond().bigW;
if (e.near || e.w > (bw ? bw[1] : CC.pond().type === 'latvot' ? 18 : 2.5)) {
const see = CC.View3D && CC.View3D.on ? ' · N: ดู' : '';
UI.toast(`ช่อง ${e.npc.id} – ${e.npc.name} ติดปลา${e.fish.name.replace(/^ปลา/, '').replace(' (ปลารบกวน)', '')} ${U.fmtKg(e.w)}${see}`, 'info');
}
}
if (U.chance(dMin * 0.025)) { const s = CC.PondMap.say('idle', G.spot); if (s) UI.toast(s, 'info'); }
if (Pond.food > 16 && G.t - (G.overT || -999) > 120) { G.overT = G.t; const s = CC.PondMap.say('over', G.spot); if (s) UI.toast(s, 'info'); }
const aer = CC.PondMap.aeratorOn();
if (aer !== G.aer) { if (G.aer != null) UI.toast(aer ? 'ทางบ่อเปิดเครื่องตีน้ำเติมอากาศแล้ว' : 'เครื่องตีน้ำปิดแล้ว', 'info'); G.aer = aer; }
}
UI.actions({ net: G.state === 'fighting' && G.fight && G.fight.fx < 3.4, ready: G.state === 'fighting' && G.fight && G.fight.landable });
G.saveT += dt;
if (G.saveT > 20) { G.saveT = 0; CC.save(); }
}
function updateInWater(dt) {
const rig = G.rig;
const bottom = Game.bottomCm(G.floatX);
const dx = G.floatX - G.spotX;
const xa = rig.kind === 'xa';
const before = rig.baits[0] + rig.baits[1];
Rig.updateBaits(rig, dt);
const melted = before - (rig.baits[0] + rig.baits[1]);
if (melted > 0) nuoiO(melted / CC.BAIT.w * (xa ? 0.25 : 0.12) * (rig.cloud || 0.5), dx, xa);
const bowl = CC.P.bowls && CC.P.bowls[xa ? 'xa' : 'cau'];
const to = bowl && bowl.to > 0 ? bowl.to : 0, rw = CC.rollWeight;
if (to) CC.rollWeight = function (sp) { const a = rw.apply(this, arguments); return U.chance(to) ? Math.max(a, rw.apply(this, arguments)) : a; };
let out;
try {
out = Pond.update(dt, {
rig, dx, sinking: G.state === 'sinking',
lineVis: CC.line().vis, hookTake: CC.hook().take,
smell: bowl ? (CC.Bait.mui ? CC.Bait.mui(bowl) : bowl.smell) : null, q: G.q, mud: G.spot && G.spot.mud, xa,
soft: bowl && CC.Bait.softness ? CC.Bait.softness(bowl) : null
});
} finally { if (to) CC.rollWeight = rw; }
if (out.act && out.act !== 'pause') { G.lastAct = out.act; G.lastActT = G.t; }
if (G.state === 'sinking' && !out.freeze) {
G.sink += (30 + rig.lead * 20) * dt;
const bk = Math.min(3, (rig.baits[0] + rig.baits[1]) / (2 * CC.BAIT.w));
G.sinkH = Math.min(G.sink + Rig.LEADER_LONG, (G.sinkH || 0) + (16 + 12 * bk) * dt);
}
const sol = Rig.solve(rig, bottom, { force: out.force, held: out.held, sink: G.sink, sinkH: G.sinkH });
if (G.state === 'sinking' && sol.fL >= 1 && sol.fB >= 1) { G.state = 'waiting'; G.sink = G.sinkH = Infinity; }
G.sol = sol;
G.dyn.tiltX = out.tiltX;
G.dyn.driftT = out.drift != null ? out.drift : null;
Rig.step(G.dyn, sol.v, dt, G.t);
const fv = G.ripV == null || dt <= 0 ? 0 : Math.abs(G.dyn.v - G.ripV) / dt;
G.ripV = G.dyn.v;
if (G.state === 'waiting' && fv > Game.RIP_V && G.t - (G.ripT || 0) > 0.45) {
G.ripT = G.t;
R.ripple(R.X(G.floatX + (G.dyn.drift || 0) * 2), U.clamp(fv / (Game.RIP_V * 6), 0.12, 0.8));
}
if (G.state === 'waiting') {
if (sol.leadOnBottom) UI.status('ตะกั่วแตะพื้น — ทุ่นนอนราบ ไม่แสดงอาการปลากิน ยกคันแล้วกด C เพื่อลดความลึกทุ่น');
else if (xa) UI.status(Rig.hasBait(rig) ? 'กำลังอ่อยเหยื่อ — ทุ่นจะค่อยๆ ลอยขึ้นเมื่อเหยื่อละลาย คลิก / Space เพื่อยกคันอ่อยต่อ' : 'ก้อนเหยื่ออ่อยละลายหมดแล้ว — ยกคันขึ้นแล้วอ่อยลูกใหม่');
else if (!Rig.hasBait(rig)) UI.status('ทุ่นกลับมาที่ข้อตั้ง — เหยื่อละลายหมดแล้ว คลิก / Space เพื่อยกคันแล้วตีใหม่');
else UI.status('ดูอาการทุ่น… ทุ่นตอกจมคมๆ หรือทุ่นถอนขึ้นแล้วหยุด คลิก / Space เพื่อวัดเบ็ด');
} else UI.status(xa ? 'ก้อนเหยื่ออ่อยกำลังจม — ทุ่นจะถูกดึงจมแล้วค่อยๆ ลอยขึ้นเมื่อเหยื่อละลาย'
: 'เหยื่อกำลังจมลงก้นบ่อ — ทุ่นจะตั้งตรงแล้วค่อยๆ จมทีละข้อไปที่ข้อตก หากหยุดชะงักระหว่างจมแปลว่าปลางับกลางน้ำ: วัดเบ็ดเลย!');
}
function fightHint(F, line) {
const TU = CC.DaiFight.TUNE, r = F.Ts / line.leader, touch = UI.touch, held = Game.holding(), old = classic();
const drag = d => touch ? `ลากนิ้วไปทาง${d > 0 ? 'ซ้าย' : 'ขวา'}` : `กด ${d > 0 ? 'A / ←' : 'D / →'} — วาดคันไปทาง${d > 0 ? 'ซ้าย' : 'ขวา'}`;
const letGoTxt = touch ? 'ปล่อยมือ' : old ? 'ลดคันลง' : 'ปล่อย Space';
const over = F.overAcc > 0.04 || r > 1;
if (F.landable) return [9, touch ? 'แตะ ช้อนปลา!' : 'กด E — ช้อนปลา!', 'good'];
if (over && F.laneWarn && !touch && !old) return [8, `ปล่อย Space · กด ${F.laneWarn > 0 ? 'A / ←' : 'D / →'} วาดคันไปทาง${F.laneWarn > 0 ? 'ซ้าย' : 'ขวา'}!`, 'bad'];
if (F.deep && r > 0.75) return [8, `${letGoTxt}! ปลาเปคูกลืนลึก — ฟันคมกำลังครูดสายหน้า`, 'bad'];
if (over) return [8, old ? 'ตึงเกินไป — เลื่อนเมาส์ลงเพื่อลดคันตามปลา!' : held ? `${letGoTxt}เลย — สายตึงเกินไป!` : 'ตึงเกินไป — คันกำลังซับแรงเอง อย่าเพิ่งงัด', 'bad'];
if (F.laneWarn) return [7, `⚠ ล้ำช่องข้างๆ — ${drag(F.laneWarn)}!`, 'bad'];
const calm = !held && !old, head = F.sp.id === 'diec' ? 'ผงกหัว' : 'สะบัดหัว';
if (F.fy > 0.05 && F.w > (F.hk || TU.handKg)) return [7, calm ? 'ปลาลอยพ้นน้ำ — อย่างัด รอให้ปลาลงน้ำก่อน' : `${letGoTxt} — อย่ายกปลาลอยพ้นน้ำ!`, 'bad'];
if (F.warn) return [6, F.warn === 'shake' ? (calm ? `ปลากำลังจะ${head} — ปล่อยให้ปลายคันซับแรง` : `${letGoTxt} — ปล่อยให้ปลายคันซับจังหวะ${head}`)
: (calm ? 'ปลากำลังจะพุ่ง — อย่างัด ปล่อยให้คันช่วยซับแรง' : `${letGoTxt} — ปลากำลังจะพุ่ง!`), 'warn'];
if (held && !old && F.arm < 0.35) return [6, touch ? 'เมื่อยแขน — ปล่อยมือสักครู่ให้คันซับแรง แขนจะได้พัก' : 'เมื่อยแขน — ปล่อย Space สักครู่ให้แขนฟื้นแรง', 'warn'];
if (F.pumpWarn && !old) return [6, 'สายหย่อนสลับตึงบ่อยเกิน — ตัวเบ็ดเริ่มคลาย รักษาแรงงัดให้สม่ำเสมอ!', 'bad'];
if (F.stretch < -0.05) return [5, old ? 'สายหย่อน — เลื่อนเมาส์ขึ้นเพื่อยกคัน' : touch ? 'แตะค้างเพื่อเก็บสายหย่อน' : 'กด Space ค้างเพื่อเก็บสายหย่อน', 'warn'];
if (!old && (G.noHoldT || 0) > 12 && F.stamina > 0.4) return [5, touch ? 'ปลากำลังพักฟื้นแรง — แตะค้างเพื่อกดดัน!' : 'ปลากำลังพักฟื้นแรง — กด Space ค้างเพื่อกดดัน!', 'warn'];
if (Math.abs(F.lat) > 0.8 && F.vz * F.lat > 0 && Math.abs(F.vz) > 0.25) return [4, `${drag(F.lat)} เพื่อบังคับหัวปลากลับ`, ''];
if (F.gulping) return [3, held || old ? 'งัดไว้ — ปลากำลังจิบน้ำหมดแรง' : touch ? 'ปลากำลังจิบน้ำ — แตะค้างเพื่อประคองเข้าฝั่ง' : 'ปลากำลังจิบน้ำ — กด Space ค้างเพื่อประคองเข้าฝั่ง', 'good'];
if (F.stamina < 0.45) return [3, old ? 'ปลาเริ่มหมดแรง — ยกคันให้ปลาโผล่หัว' : touch ? 'แตะค้างไว้ — ปลาหมดแรงแล้ว ประคองเข้าฝั่ง' : 'กด Space ค้างไว้ — ปลาหมดแรงแล้ว ประคองเข้าฝั่ง', ''];
if (!old && F.alpha < 40 * DEG && r < 0.8 && F.fy < -0.2) return [2, touch ? 'สายตรง — แตะค้างยกคันขึ้นให้คันช่วยซับแรง' : 'สายตรง — กด Space ค้างยกคันขึ้นให้คันช่วยซับแรง', ''];
if (F.state === 'shake') return [2, calm ? `ปลา${head} — ปล่อยให้ปลายคันซับแรง` : `${letGoTxt} — ให้ปลายคันซับแรง${head}`, ''];
return [1, old ? 'เลื่อนเมาส์รักษามุมคัน–สาย ~90° · A/D บังคับทิศ · E ช้อนปลา' : touch ? 'แตะค้าง = งัด · ลากซ้ายขวา = อัดปลา' : 'Space = งัด · A/D = อัดปลา · E = ช้อนปลา', ''];
}
Game.RIP_V = 1.2;
Game.fightFx = (G, F, dt) => {
G.fxT = (G.fxT || 0) - dt;
if (G.fxT > 0 || F.fy > 0.05) return;
const spd = Math.hypot(F.vx, F.vy, F.latV || 0);
if (F.fy > -0.3 && spd > 0.5) {
R.splash(R.X(F.fx), R.sy, 2 + Math.min(6, Math.round(F.w)), U.clamp(0.3 + spd * 0.2 + F.w * 0.02, 0.3, 1.1));
G.fxT = 0.2;
} else if (spd > 0.35) {
const tip = CC.RigDraw.tip, fx = R.X(F.fx), fy = R.Y(F.fy);
if (tip && tip.y < R.sy && fy > R.sy) R.ripple(tip.x + (fx - tip.x) * (R.sy - tip.y) / (fy - tip.y), 0.25);
G.fxT = 0.4;
}
};
function updateFight(dt, rod) {
const F = G.fight, line = CC.line();
G.fightTime += dt;
const ev = F.update(dt, G.theta, rod, line, G.phi || 0);
for (const e of ev) {
if (e === 'snap') {
UI.buzz([120, 60, 220]); A.snap();
const why = F.pullBase > line.leader ? `ปลาแรงเกินกำลังสายหน้า (~${line.leader} กก.) ปลาไซส์นี้ต้องใช้สายใหญ่กว่านี้`
: F.held ? 'งัดค้างจังหวะปลาพุ่ง พอแถบแดงให้รีบปล่อยมือ' : 'เสียทั้งปลาและชุดตัวเบ็ด';
return lose('ผึง! สายหน้าขาด — ' + why, 'snap');
}
if (e === 'tangle') { UI.buzz([60, 40, 60]); return lose('พันสายเพื่อนข้างบ่อ — ปลาหลุด! เวลาปลาวิ่งออกข้างให้วาดคันสวนทางกลับ'); }
if (e === 'rodpulled') {
const fee = Math.max(50, Math.round(rod.price * 0.3));
CC.P.money = Math.max(0, CC.P.money - fee);
UI.refresh();
return lose(`ปลาลากคันตกน้ำ! สายหน้าแข็งเกินกำลังคันเลยถูกกระชากหลุด — เลือกคันให้สมดุลกับสาย ค่าจ้างงมคัน ${fee} ฿`);
}
if (e === 'rodbreak') {
const fee = Math.round(rod.price * 0.2);
CC.P.money = Math.max(0, CC.P.money - fee);
UI.refresh();
return lose(`เป๊าะ! ปลายคันหักเพราะยกคันสูงเกินไป${fee ? ` ค่าซ่อมคัน ${fee} ฿` : ''}`);
}
if (e === 'thrown') return lose(F.pumped ? 'สายหย่อนสลับตึง — ตัวเบ็ดคลาย เบ็ดหลุดไปแล้ว!' : F.fy > 0.05 ? 'ยกปลาลอยพ้นน้ำ ปลาสะบัดเบ็ดหลุด!' : 'สายหย่อนนานเกินไป — เบ็ดหลุด!');
if (e === 'handland') return landFish('ยกขึ้นฝั่ง');
if (e === 'presurge') UI.buzz([20, 50, 20]);
if (e === 'surge') {
A.splash(Math.min(1.5, 0.5 + F.w * 0.15));
R.splash(R.X(F.fx), R.sy, 10, 0.8);
if (!F.surgeMsg) { F.surgeMsg = true; UI.toast('ปลาเห็นฝั่งแล้วพุ่งหนีกลับ! ปล่อยมือให้คันซับแรง อย่างัดค้าง', 'bad'); }
}
if (e === 'bolt') {
A.splash(0.7); R.splash(R.X(F.fx), R.sy, 8, 0.6);
if (!G.boltMsg) { G.boltMsg = true; UI.toast('ปลายังมีแรง — รอให้ปลาหมดแรงก่อนค่อยประคองเข้าฝั่ง', 'info', 3000); }
}
if (e === 'turned') { A.dragTick(); UI.buzz(15); G.turnFlash = 0.9; }
if (e === 'dodge') { A.dragTick(); G.dodgeFlash = 0.9; }
if (e === 'nbyield') {
const nb = (CC.PondMap.adjacent ? CC.PondMap.adjacent(G.spot) : []).filter(n => n.npc);
const who = nb.length ? nb[(Math.random() * nb.length) | 0].npc : null;
UI.toast(`${who ? who.name : 'เพื่อนข้างบ่อ'} ยกคันหลบทางให้ — ประคองปลาเข้ามาเลย!`, 'info', 2200);
}
}
G.bend = CC.rodBend(F.Ts, rod);
Game.fightFx(G, F, dt);
A.fightSound(U.clamp(Math.hypot(F.vx, F.vy, F.latV) / 2.2, 0, 1) * (F.fy > -1.2 ? 1 : 0.5), F.Ts / line.leader);
if (F.warn && F.warn !== G.lastWarn) { UI.buzz([15, 40, 15]); if (A.warn) A.warn(); }
G.lastWarn = F.warn;
if (F.overload) { G.buzzT = (G.buzzT || 0) - dt; if (G.buzzT <= 0) { UI.buzz(30); G.buzzT = 0.28; } } else G.buzzT = 0;
if (G.turnFlash > 0) G.turnFlash -= dt;
if (G.dodgeFlash > 0) G.dodgeFlash -= dt;
G.noHoldT = Game.holding() ? 0 : (G.noHoldT || 0) + dt;
const h = fightHint(F, line);
const minT = G.hint && G.hint[0] <= 4 ? 1.5 : 0.4;
if (!G.hint || h[0] > G.hint[0] || (h[0] === G.hint[0] && h[0] >= 5) || G.t - G.hintT > minT) { if (!G.hint || h[1] !== G.hint[1]) G.hintT = G.t; G.hint = h; }
const TU = CC.DaiFight.TUNE;
UI.fightHud(true, {
ratio: F.Ts / line.leader, over: F.overAcc / TU.over, stam: F.stamina, phase: F.phase(), warn: F.warn, laneWarn: F.laneWarn,
hint: G.hint[1], cls: G.hint[2], holding: Game.holding(), T: F.Ts, leader: line.leader, deg: G.theta / DEG, phi: (G.phi || 0) / DEG, alpha: F.alpha / DEG,
turned: G.turnFlash > 0, dodged: G.dodgeFlash > 0, classic: classic(), nod: F.sp.id === 'diec', arm: F.arm
});
UI.status('');
}
window.addEventListener('beforeunload', () => CC.save());
window.addEventListener('DOMContentLoaded', start);
})();
