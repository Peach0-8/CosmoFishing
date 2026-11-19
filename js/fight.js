(function () {
const U = CC.U;
const DEG = Math.PI / 180;
const BASE = { x: -0.35, y: 0.62 };
CC.rodTip = (theta, len, phi) => {
const c = Math.cos(theta) * len, p = phi || 0;
return { x: BASE.x + c * Math.cos(p), y: BASE.y + Math.sin(theta) * len, z: c * Math.sin(p) };
};
CC.ROD_BASE = BASE;
const TUNE = {
pullC: 0.718, pullExp: 0.55,
runMult: 1.35, shakeAmp: 0.42,
drain: 0.68,
bolt: 0.48,
sound: 0.5,
over: 0.7, overDecay: 0.8, spike: 1.5,
slackGrace: 1.5,
handKg: 0.5,
airDrop: 0.03, airRate: 35, airGain: 150,
airHigh: 0.8,
turnDrain: 0.05, sideDrain: 1.4,
rodSoft: 0.7, rodStiffK: 4.2,
lane: 2.9, laneT: 2.5,
netX: 3.0, netStam: 0.38,
lift: 0.2, liftMax: 32, maxLift: 86,
yieldAt: 0.55, yieldGain: 240, take: 22, floor: 6,
holdGive: 1.0,
armTorque: 45,
armTire: 120, armRest: 12, armMin: 0.5,
gulpStam: 0.55,
sizeExp: 0.2,
pumpAt: 2.2,
laneAssist: 45,
nbYield: 1.6, nbYieldT: 10,
phiMax: 45, phiRate: 70,
phiYield: 0.9,
turnSide: 0.45, turnT: 0.5,
warn: 0.7,
burst: 1.6, burstT: 0.45,
dodge: 0.07
};
const STYLE = {
rophi: { run: [3.2, 0.8, 2], turn: [1.5], dive: [1.0], shake: [1.0], hold: [0.6] },
dieuhong: { run: [3.0, 0.8, 2], turn: [1.5], dive: [1.0], shake: [1.0], hold: [0.7] },
diec: { shake: [2.6, 1, 2], dive: [1.3], run: [0.8], turn: [1.0], hold: [0.6] },
chep: { run: [2.4, 2, 4.5], dive: [1.6], hold: [1.5, 1.2, 2.8], shake: [1.4], turn: [0.9] },
tramden: { hold: [2.6, 2, 5], run: [1.5, 3, 7], dive: [1.4], shake: [0.7], turn: [0.8] },
mehoa: { turn: [1.8, 1.5, 3], run: [1.0, 2, 5], shake: [0.4], dive: [1.0], hold: [1.0] },
tramco: { run: [3.0, 2.5, 5.5], shake: [1.5, 1, 2.2], dive: [1.0], hold: [0.7], turn: [0.8] },
chimtrang: { run: [3.2, 0.7, 1.6], turn: [2.6, 0.6, 1.3], shake: [1.2], dive: [0.8], hold: [0.3] },
troi: { hold: [2.4, 1.4, 3], dive: [1.8, 1.2, 2.6], run: [1.1, 1, 2.2], shake: [1.2], turn: [0.7] }
};
const DUR = { run: [1.2, 3], dive: [1, 2.4], hold: [1, 2.2], turn: [0.7, 1.6], tired: [1.5, 3], shake: [0.8, 1.8] };
const Fight = CC.DaiFight = function (sp, w, hold, x, depth, opts) {
this.sp = sp; this.w = w; this.hold = hold;
this.laneW = (opts && opts.lane) || TUNE.lane;
this.yieldP = opts && opts.yieldP != null ? opts.yieldP : 0.7;
this.yieldKeep = !!(opts && opts.yieldKeep);
const base = sp.stam * (1 + 0.45 * Math.log(1 + w)) * (1 + 0.08 * Math.log(1 + w));
this.cap = sp.id === 'tramden' ? base * 0.45 * Math.pow(Math.max(1, Math.min(w, 30) / 1.5), 0.3)
: base * Math.pow(Math.max(1, Math.min(w, sp.id === 'tramco' ? 16 : 6) / 1.5), TUNE.sizeExp);
this.shakeHz = 22 / (1 + 0.25 * Math.log(1 + w));
this.fx = x; this.fy = -depth; this.lat = 0;
this.vx = 0; this.vy = 0; this.vz = 0; this.latV = 0;
this.pullBase = sp.str * TUNE.pullC * Math.pow(w, TUNE.pullExp) + 0.04;
this.runMult = TUNE.runMult - 0.3 * U.clamp((w - 5) / 20, 0, 1);
this.stamina = 1;
this.arm = 1;
this.state = 'shock'; this.stateT = 0.35; this.dur = 0.35;
this.dir = { x: 1, y: -0.2, z: 0 };
this.T = 0; this.Ts = 0; this.alpha = Math.PI / 2; this.stretch = 0;
this.slackT = 0; this.airT = 0; this.breakAcc = 0; this.overAcc = 0; this.pullAcc = 0; this.laneAcc = 0; this.t = 0;
this.sideAcc = 0; this.side = 0; this.turns = 0;
this.gulping = false; this.landable = false; this.overload = false;
this.lastSurge = -9; this.surgeIn = 0;
const lt = CC.Pond && CC.Pond.lastTake;
this.deep = sp.id === 'chimtrang' && (opts && opts.deep != null ? !!opts.deep : !!(lt && lt.sp === sp && lt.deep));
if (lt && lt.sp === sp) CC.Pond.lastTake = null;
this.next = { state: Math.random() < 0.5 ? 'dive' : 'hold', dur: U.rand(0.9, 1.5) };
};
Fight.TUNE = TUNE;
const F = Fight.prototype;
const softOf = rod => 1 - U.clamp(Math.log(Math.max(1, rod.k)) / Math.log(TUNE.rodStiffK), 0, 1);
CC.rodSoft = softOf;
CC.rodBend = (Ts, rod) => U.clamp(Ts / rod.power * (1 + 0.5 * softOf(rod)), 0, 1);
F.makeState = function () {
const st = this.stamina, sp = this.sp, sty = STYLE[sp.id];
const shaker = sp.shape === 'carp' || sp.id === 'tramden' ? 1.2 : 0.8;
let o, spec = {};
if (st < 0.25) o = { tired: 5, run: 0.6, dive: 0.4, shake: 0.5 };
else if (sty) { o = {}; for (const k in sty) { o[k] = sty[k][0]; if (sty[k].length > 1) spec[k] = [sty[k][1], sty[k][2]]; } }
else o = { run: sp.style === 'runner' ? 3 : 1.5, dive: 1.6, hold: 1.2, turn: 0.9, shake: shaker };
if (sp.id === 'tramco' && st >= 0.25 && this.fx < 4) o.shake *= 2.5;
const s = U.pickWeighted(Object.keys(o), k => o[k]);
const r = spec[s] || DUR[s];
return { state: s, dur: U.rand(r[0], r[1]) };
};
F.applyState = function (n) {
this.state = n.state; this.stateT = n.dur; this.dur = n.dur;
if (n.state === 'run') {
this.burstT = TUNE.burstT;
if (this.warned && !this.held && this.t - (this.lastHoldT == null ? -9 : this.lastHoldT) < 1.5 && this.stamina > 0.2) {
this.stamina = Math.max(0, this.stamina - TUNE.dodge / this.cap);
this.dodged = true;
}
}
this.warned = false;
const j = U.rand(-0.25, 0.25), lat = this.lat, L = this.laneW;
let side = Math.random() < 0.5 ? -1 : 1;
if (Math.abs(lat) > 0.3 * L && Math.random() < 0.6) side = Math.sign(lat);
const a = (this.w > 5 ? U.rand(15, 45) : U.rand(22, 55)) * DEG;
let d;
if (n.state === 'run') d = { x: Math.cos(a), y: -0.25 + j, z: side * Math.sin(a) };
else if (n.state === 'turn' && this.sp.id === 'chimtrang') d = { x: -0.2, y: -0.2 + j, z: -(Math.sign(lat) || side) * 0.95 };
else if (n.state === 'turn') d = { x: -0.7, y: -0.15 + j, z: -(Math.sign(lat) || side) * 0.6 };
else if (n.state === 'dive') d = { x: 0.3 + j, y: -1, z: side * 0.25 };
else if (n.state === 'hold') d = { x: 0.2, y: -1, z: 0 };
else if (n.state === 'shake') d = { x: 0.45 + j, y: -0.55, z: side * 0.2 };
else d = { x: 0.2, y: 0.7, z: -lat * 0.25 };
const m = Math.hypot(d.x, d.y, d.z) || 1;
this.dir = { x: d.x / m, y: d.y / m, z: d.z / m };
this.next = this.makeState();
};
F.control = function (dt, inp, theta, rod, line) {
const deg = theta / DEG, r = this.Ts / line.leader;
this.held = !!inp.hold;
if (this.held) this.lastHoldT = this.t;
let lift = Math.min(TUNE.liftMax, rod.speed * TUNE.lift);
const hk = this.hk = Math.min(TUNE.handKg, 0.35 * line.leader);
if (this.w > hk) {
if (this.fx < TUNE.netX + 0.3 && this.fy > -0.35) lift = 0;
else if (this.fy > -0.12) lift = this.stamina < TUNE.netStam + 0.12 ? 9 : 0;
else if (this.stamina > 0.45 && this.alpha > 120 * DEG) lift = 0;
}
const lever = Math.max(0.6, rod.len * Math.sin(this.alpha));
if (this.held) this.arm = Math.max(0, this.arm - dt * Math.pow(Math.min(1.3, this.Ts * lever / TUNE.armTorque), 2) / TUNE.armTire);
else this.arm = Math.min(1, this.arm + dt / TUNE.armRest);
const armMax = TUNE.armTorque * (TUNE.armMin + (1 - TUNE.armMin) * this.arm) / lever;
const give = Math.max(r - TUNE.holdGive, (this.Ts - armMax) / line.leader);
const air = this.w > hk && this.fy > TUNE.airDrop ? Math.min(TUNE.airRate, TUNE.airGain * (this.fy - TUNE.airDrop)) : 0;
let rate;
if (inp.fine) rate = inp.fine * 60;
else if (inp.hold) rate = give > 0 ? -60 * give / 0.3 : air > 0 ? -air : this.stretch < -0.03 ? Math.max(lift, TUNE.take) : lift;
else if (inp.steady) rate = r > 0.85 ? -TUNE.yieldGain * (r - 0.85) : 0;
else if (r > TUNE.yieldAt) rate = -TUNE.yieldGain * (r - TUNE.yieldAt);
else if (air > 0) rate = -Math.max(air, 25);
else if (this.stretch < -0.03) rate = TUNE.take;
else rate = 0;
rate = U.clamp(rate, -rod.speed, rod.speed);
const top = inp.fine ? 120 : Math.max(TUNE.maxLift, Math.min(deg, 120));
return U.clamp(deg + rate * dt, TUNE.floor, top) * DEG;
};
F.steer = function (dt, phiT, phi, held, line, active) {
const r = this.Ts / line.leader, lim = held ? 1 : TUNE.phiYield, max = TUNE.phiMax * DEG;
let target = U.clamp(phiT, -max, max), rate = TUNE.phiRate * DEG;
if (this.laneWarn && !active && Math.abs(target) < TUNE.laneAssist * DEG) target = -this.laneWarn * TUNE.laneAssist * DEG;
if (r > lim) {
target = U.clamp(Math.atan2(this.lat, Math.max(0.5, this.fx - BASE.x)), -max, max);
rate *= 0.6 + 2 * (r - lim);
}
return phi + U.clamp(target - phi, -rate * dt, rate * dt);
};
F.update = function (dt, theta, rod, line, phi) {
const ev = [];
phi = phi || 0;
this.t += dt;
this.stateT -= dt;
const tc = this.sp.id === 'tramco';
if (this.surgeIn > 0) {
this.surgeIn -= dt;
if (this.surgeIn <= 0) {
this.applyState({ state: 'run', dur: U.rand(1.2, 2) });
this.dir = { x: 0.93, y: -0.3, z: (Math.random() < 0.5 ? -1 : 1) * 0.2 };
if (tc) this.next = { state: 'shake', dur: U.rand(1, 1.8) };
ev.push('surge');
}
} else if (this.fx < (tc ? 3.2 : 2.6) && this.stamina > (tc ? 0.22 : 0.3) && this.state !== 'run' && this.t - this.lastSurge > 4 && U.chance(dt * (tc ? 0.9 : 0.6))) {
this.surgeIn = TUNE.warn; this.lastSurge = this.t; ev.push('presurge');
}
if (this.stateT <= 0) this.applyState(this.next);
if (this.dodged) { this.dodged = false; ev.push('dodge'); }
const m = this.w, mEff = m * 1.3 + 0.05;
const vigor = 0.25 + 0.75 * this.stamina;
let mult = { shock: 0.6, run: this.runMult, dive: 1.0, hold: 0.85, turn: 0.7, tired: 0.35, shake: 0.9 }[this.state];
if (this.burstT > 0) { mult *= 1 + (TUNE.burst - 1) * (this.burstT / TUNE.burstT); this.burstT -= dt; }
const Lline = rod.len;
const n = Math.max(1, Math.ceil(dt / (1 / 240)));
const h = dt / n;
const cp = Math.cos(phi), spp = Math.sin(phi), ct = Math.cos(theta), stt = Math.sin(theta);
const rd = { x: ct * cp, y: stt, z: ct * spp };
const tip = CC.rodTip(theta, rod.len, phi);
let T = 0, alpha = this.alpha, stretch = 0, ux = 1, uy = 0, uz = 0;
for (let i = 0; i < n; i++) {
const dx = this.fx - tip.x, dy = this.fy - tip.y, dz = this.lat - tip.z;
const dist = Math.hypot(dx, dy, dz) || 0.001;
ux = dx / dist; uy = dy / dist; uz = dz / dist;
alpha = Math.acos(U.clamp(rd.x * ux + rd.y * uy + rd.z * uz, -1, 1));
const kRod = rod.k / (0.15 + 0.85 * Math.sin(alpha));
const kLine = line.main / (0.22 * Lline);
const k = 1 / (1 / kRod + 1 / kLine);
stretch = dist - Lline;
const vr = this.vx * ux + this.vy * uy + this.vz * uz;
T = stretch > 0 ? Math.max(0, k * stretch + 0.35 * vr) : 0;
const inWater = this.fy < 0;
let fx = -T * ux, fy = -T * uy, fz = -T * uz;
if (inWater) {
const pulse = this.state === 'shake' ? 1 + TUNE.shakeAmp * Math.sin((this.t - dt + (i + 1) * h) * this.shakeHz) : 1;
const P = this.pullBase * vigor * mult * pulse;
fx += P * this.dir.x; fy += P * this.dir.y; fz += P * this.dir.z;
const up = -T * uy;
if (up > 0) fy -= Math.min(up, this.pullBase * vigor) * TUNE.sound * U.clamp((this.stamina - 0.3) / 0.6, 0, 1);
} else fy -= m;
const area = Math.pow(m, 2 / 3);
const v = Math.hypot(this.vx, this.vy, this.vz);
const cd = inWater ? 0.6 * area * v + 0.15 * area : 0.02 * v;
fx -= cd * this.vx; fy -= cd * this.vy; fz -= cd * this.vz;
this.vx += fx * 9.8 / mEff * h; this.vy += fy * 9.8 / mEff * h; this.vz += fz * 9.8 / mEff * h;
this.fx += this.vx * h; this.fy += this.vy * h; this.lat += this.vz * h;
if (this.fx < 0.12) { this.fx = 0.12; this.vx = Math.max(0, this.vx); }
const bottom = -CC.bottomDepth(this.fx) + 0.05;
if (this.fy < bottom) { this.fy = bottom; this.vy = Math.max(0, this.vy); }
if (this.fx > 30) { this.fx = 30; this.vx = Math.min(0, this.vx); }
if (Math.abs(this.lat) > 12) { this.lat = Math.sign(this.lat) * 12; this.vz = 0; }
}
this.latV = this.vz;
this.T = T; this.alpha = alpha; this.stretch = stretch;
this.Ts += (T - this.Ts) * Math.min(1, dt / 0.08);
const lr = this.Ts / line.leader;
const fray = this.deep ? 1.8 : 1;
if (lr > 1) this.overAcc += dt * lr * lr * fray;
else this.overAcc = Math.max(0, this.overAcc - dt * TUNE.overDecay / fray);
this.overload = lr > 1;
if (this.overAcc > TUNE.over || lr > TUNE.spike) ev.push('snap');
const deg = theta / DEG;
if (deg < 12 && this.Ts > rod.power * 1.05) this.pullAcc += dt; else this.pullAcc = Math.max(0, this.pullAcc - dt);
if (this.pullAcc > 0.6) ev.push('rodpulled');
if (deg > 95 && this.Ts > rod.power * 0.5) this.breakAcc += dt * (this.Ts / rod.power) * 1.6;
else this.breakAcc = Math.max(0, this.breakAcc - dt);
if (this.breakAcc > 1 || this.Ts > rod.power * 1.5) ev.push('rodbreak');
if (stretch < -0.08) this.slackT += dt; else this.slackT = Math.max(0, this.slackT - dt * 2);
if (this.slackT > TUNE.slackGrace && U.chance(dt * 1.3 * (1.1 - this.hold))) ev.push('thrown');
if (stretch < -0.03) { this.lowT = this.t; this.jerkArmed = true; }
if (this.jerkArmed && T > 0.9 * this.pullBase && this.t - this.lowT < 0.8) { this.pump = (this.pump || 0) + 1; this.jerkArmed = false; }
this.pump = (this.pump || 0) * Math.exp(-dt / 4);
this.pumpWarn = this.pump > TUNE.pumpAt - 0.8;
if (this.pump > TUNE.pumpAt && U.chance(dt * 0.35 * (this.pump - TUNE.pumpAt) * (1.1 - this.hold))) { this.pumped = true; ev.push('thrown'); }
const hk = this.hk = Math.min(TUNE.handKg, 0.35 * line.leader);
if (this.fy > 0.05) this.airT += dt; else this.airT = 0;
if (this.airT > 0.35 + 2 * Math.max(0, m - hk) && m <= hk + 0.5) ev.push('handland');
else if (this.airT > 0.4 && m > hk && U.chance(dt * 0.9 * (1.15 - this.hold) * U.clamp((m - hk) / 3, 0.25, 1) * U.clamp((this.fy - 0.05) / TUNE.airHigh, 0.05, 1))) ev.push('thrown');
if (this.fy > -0.15 && this.fy < 0.02 && this.stamina > TUNE.bolt && this.t - (this.lastBolt || -9) > 2.5 && U.chance(dt * 1.5)) {
this.applyState({ state: U.chance(0.5) ? 'dive' : 'run', dur: U.rand(1, 1.8) });
this.lastBolt = this.t;
ev.push('bolt');
}
if (this.laneWarn && !this.nbAsked) {
this.nbAsked = true;
if (U.chance(this.yieldP)) this.nbYieldIn = U.rand(1, 2.5);
}
if (this.nbYieldIn > 0) {
this.nbYieldIn -= dt;
if (this.nbYieldIn <= 0) { this.nbT = this.yieldKeep ? Infinity : TUNE.nbYieldT; this.nbSide = Math.sign(this.lat) || 1; ev.push('nbyield'); }
}
if (this.nbT > 0) this.nbT -= dt;
const lane = this.laneW + (this.nbT > 0 ? TUNE.nbYield : 0) + 0.15 * Math.max(0, this.fx - 4);
this.lane = lane;
if (Math.abs(this.lat) > lane && this.fy < 0) this.laneAcc += dt; else this.laneAcc = Math.max(0, this.laneAcc - dt * 1.5);
if (this.laneAcc > TUNE.laneT) ev.push('tangle');
const sidePull = -T * uz;
const opp = Math.abs(this.vz) > 0.15 && Math.sign(sidePull) !== Math.sign(this.vz) ? Math.abs(sidePull) / this.pullBase : 0;
this.side += (U.clamp(opp, 0, 1.5) - this.side) * Math.min(1, dt / 0.25);
if ((this.state === 'run' || this.state === 'hold' || this.state === 'shake') && this.side > TUNE.turnSide) this.sideAcc += dt;
else this.sideAcc = Math.max(0, this.sideAcc - dt);
if (this.sideAcc > TUNE.turnT) {
this.sideAcc = 0; this.turns++;
this.applyState({ state: 'turn', dur: U.rand(0.7, 1.3) });
this.dir.z = -Math.sign(this.vz) * 0.6; this.stamina = Math.max(0, this.stamina - TUNE.turnDrain);
ev.push('turned');
}
this.gulping = this.fy > -0.15 && this.fy <= 0.05 && T > 0.25 * this.pullBase && this.stamina < TUNE.gulpStam;
const load = T / this.pullBase;
const drain = TUNE.drain * (0.008 + 0.036 * load * (this.state === 'run' ? 1.4 : 1)) * (this.gulping ? 2.6 : 1)
* (1 + TUNE.sideDrain * Math.min(1, this.side) * Math.min(1, load)) / this.cap
* (1 - (1 - TUNE.rodSoft) * softOf(rod));
this.stamina = U.clamp(this.stamina - drain * dt + (load < 0.2 ? 0.01 * dt : 0), 0, 1);
this.landable = this.fx < TUNE.netX && this.fy > -0.4 && this.stamina < TUNE.netStam && Math.abs(this.lat) < 1.4;
this.laneWarn = Math.abs(this.lat) > lane * 0.72 && this.fy < 0 ? Math.sign(this.lat) : 0;
const nx = this.next && this.next.state;
this.warn = this.surgeIn > 0 ? 'surge' : this.stateT < TUNE.warn && (nx === 'run' || (nx === 'shake' && m > 3)) && this.stamina > 0.2 ? nx : null;
if (this.warn === 'run' || this.warn === 'surge') this.warned = true;
return ev;
};
F.tryNet = function () {
if (this.landable) return true;
if (this.fx < 3.4) { this.applyState({ state: 'run', dur: U.rand(1.2, 2) }); this.dir = { x: 0.93, y: -0.3, z: this.dir.z * 0.5 }; this.stamina = Math.min(1, this.stamina + 0.05); }
return false;
};
F.phase = function () {
if (this.landable) return { k: 'net', t: 'ปลาเอียงตัว หมดแรงแล้ว — ช้อนเลย!', i: '🥅' };
if (this.fy > 0.05) return { k: 'air', t: 'ปลายกตัวพ้นน้ำแล้ว', i: '⚠' };
if (this.gulping) return { k: 'gulp', t: 'ปลากำลังฮุบอากาศ — หมดแรงไว', i: '💧' };
const right = this.vz > 0.2, left = this.vz < -0.2;
switch (this.state) {
case 'run': return { k: 'run', t: right ? 'ปลาวิ่งไปทางขวา' : left ? 'ปลาวิ่งไปทางซ้าย' : 'ปลาพุ่งออกไกล', i: right ? '➡' : left ? '⬅' : '⬆' };
case 'dive': return { k: 'dive', t: 'ปลามุดก้นบ่อ', i: '⬇' };
case 'hold': return { k: 'hold', t: 'ปลากดตัวนิ่งติดก้นบ่อ', i: '⏸' };
case 'shake': return { k: 'shake', t: this.sp.id === 'diec' ? 'ปลาพยักหัวสู้' : 'ปลาสะบัดหัว', i: '〰' };
case 'turn': return { k: 'turn', t: this.sp.id === 'mehoa' ? 'ปลาว่ายตีวงโค้ง' : this.sp.id === 'chimtrang' ? 'ปลาหมุนวนสลับฝั่ง' : 'ปลากลับตัว', i: '↩' };
case 'tired': return { k: 'tired', t: 'ปลาเริ่มหมดแรง ลอยตัวขึ้น', i: '😓' };
}
return { k: 'shock', t: 'ติดเบ็ดแล้ว!', i: '❗' };
};
})();
