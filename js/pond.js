(function () {
const U = CC.U;
const Pond = CC.Pond = { food: 0, fish: 0.25, spook: 0, suitor: null, q: 1,
wave: 0.6, waveTarget: 0.6, waveT: 25, inWave: false, waveCount: 0, bubbles: 0, suitorBubbles: 0 };
const RH = () => CC.RHYTHM;
const rr = a => U.rand(a[0], a[1]);
CC.fishLength = (sp, w) => Math.pow((w * 1000) / sp.a, 1 / 3);
CC.rollWeight = sp => {
const r = Math.pow(Math.random(), 2.8);
const [mn, mx] = CC.weightRange ? CC.weightRange(sp) : [sp.min, sp.max];
return Math.round((mn + (mx - mn) * r) * 1000) / 1000;
};
Pond.reset = q => {
Object.assign(Pond, { food: 0, fish: 0.25 * (q || 1), spook: 0, suitor: null, q: q || 1,
wave: 0.6, waveTarget: 0.6, waveT: U.rand(15, 45), inWave: false, waveCount: 0, bubbles: 0, suitorBubbles: 0 });
};
Pond.addFood = (x, dx) => { Pond.food += x * (dx == null ? 1 : Math.exp(-((dx / 0.8) ** 2))); };
Pond.hunger = () => 1.3 - 0.9 * Pond.food / (Pond.food + 10);
Pond.level = () => Pond.fish * Pond.hunger();
const fishList = () => (CC.pondFish ? CC.pondFish() : CC.FISH);
function buildScript(sp, sinking, m, b) {
b = b || CC.float().b;
const R = RH(), acts = [];
const tempo = 1.6 - 1.0 * m;
const pause = (a, c) => acts.push({ type: 'pause', dur: U.rand(a, c) * tempo });
const nb = U.randi(sp.pre.brush[0], sp.pre.brush[1] + (m < 0.4 ? 1 : 0));
for (let i = 0; i < nb; i++) {
pause(0.4, 2.2);
acts.push({ type: 'brush', dur: U.rand(0.35, 0.9), force: rr(R.brush) * b, tiltX: U.rand(-0.22, 0.22), mouth: false });
}
let nn = U.randi(sp.pre.nibble[0], sp.pre.nibble[1]);
if (!sp.tap) nn = Math.round(nn * (1.4 - 0.8 * m));
for (let i = 0; i < nn; i++) {
pause(0.25, 1.3);
if (U.chance(sp.tap ? 0.45 : 0.25)) {
const k = U.randi(3, 6);
for (let j = 0; j < k; j++) {
acts.push({ type: 'nibble', dur: U.rand(0.07, 0.12), force: rr(R.tremble) * b, mouth: false, erode: 0.005 });
acts.push({ type: 'pause', dur: U.rand(0.05, 0.16) });
}
} else {
acts.push({ type: 'nibble', dur: U.rand(0.11, 0.19), force: rr(R.nibble) * (sp.tap ? 1 : 0.6 + 0.6 * m) * b,
mouth: sp.tap ? U.chance(0.05) : false, erode: sp.tap ? 0.025 : 0.015 });
}
}
if (sp.tap) return acts;
const rh = sp.rhythm || { dip: 0.1, slow: 0, bubbly: 0 };
const addMain = () => {
pause(0.2, 0.9);
const kinds = ['sink', 'lift', 'run', 'dip', 'slow'];
const ws = [(sp.main.sink || 0) * (0.6 + 0.6 * m), sp.main.lift || 0, (sp.main.run || 0) * (0.3 + 1.4 * m),
rh.dip * (2.2 - 1.8 * m), rh.slow * (1.4 - 0.8 * m)];
let kind = U.pickWeighted(kinds, k => ws[kinds.indexOf(k)]) || 'sink';
if (sinking && U.chance(0.3 + 0.4 * m)) kind = 'mid';
const hold = 0.7 + 0.6 * m;
if (kind === 'sink') acts.push({ type: 'sink', dur: U.rand(0.35, 0.8) * (1 + sp.wary * 0.3) * hold, force: U.rand(1.4, 2.6) * (0.7 + 0.5 * m) * b, mouth: true });
else if (kind === 'lift') acts.push({ type: 'lift', dur: U.rand(0.5, 1.2) * hold * (1 + rh.slow), force: -U.rand(0.8, 1.8) * (0.6 + 0.6 * m) * b, held: 1, mouth: true });
else if (kind === 'run') acts.push({ type: 'run', dur: U.rand(1.2, 2.2), force: 14 * b, ramp: true, mouth: true });
else if (kind === 'dip') acts.push({ type: 'dip', dur: U.rand(0.3, 0.65) * hold, force: rr(R.dip) * b, mouth: true, hookQ: 0.75 });
else if (kind === 'slow') {
const d = U.rand(1.6, 3.2);
acts.push({ type: 'slow', dur: d, force: U.rand(3, 6) * b, rampT: d * 0.8, mouth: true });
if (U.chance(0.3 + 0.4 * m)) acts.push({ type: 'run', dur: U.rand(1.2, 2.0), force: 14 * b, ramp: true, mouth: true });
} else acts.push({ type: 'mid', dur: U.rand(0.6, 1.4) * hold, force: 0, mouth: true, freeze: true });
acts.push({ type: 'spit', dur: 0.25, force: 0, mouth: false, steal: 0.55 * (1.2 - 0.4 * m) });
};
addMain();
if (U.chance(0.2 + 0.35 * m)) addMain();
else if (m < 0.4 && U.chance(0.35)) {
pause(1.5, 3.5);
acts.push({ type: 'nibble', dur: U.rand(0.11, 0.17), force: U.rand(1.0, 2.0) * b, mouth: false, erode: 0.01 });
addMain();
}
return acts;
}
Pond.buildScript = buildScript;
const DK = { lift: 1.0, sink: 1.45, nod: 1.0 };
Pond.DK = DK;
Pond.tackleNat = (line, hook) => {
const ld = U.clamp((((line && line.leader) || 2) - 1.0) / 1.9, 0, 1);
const hk = U.clamp((((hook && hook.size) || 5) - 3) / 6, 0, 1);
return U.clamp(1 - 0.62 * ld - 0.38 * hk, 0, 1);
};
Pond.leaderFit = (sp, line) => {
if (!sp || sp.tap || (sp.mouth || 10) > 6) return 1;
return U.clamp(1.15 - 0.14 * (((line && line.leader) || 2) - 1.0), 0.6, 1.15);
};
Pond.diecTraits = function (sp, m, w, env) {
env = env || {};
const [mn, mx] = CC.weightRange ? CC.weightRange(sp) : [sp.min, sp.max];
const s = U.clamp((w - mn) / Math.max(0.01, mx - mn), 0, 1);
const nat = env.nat != null ? env.nat : Pond.tackleNat(env.line || CC.line(), env.hook || CC.hook());
const opt = (sp.temp && sp.temp.opt) || 22, wt = env.water != null ? env.water : CC.world.waterTemp;
const cold = U.clamp((opt - 3 - wt) / 6, 0, 1), hot = U.clamp((wt - opt - 5) / 6, 0, 1);
const smell = env.smell != null ? env.smell : 0.5, bait = env.bait != null ? U.clamp(env.bait, 0, 1) : 1;
const mm = U.clamp(m + 0.15 * (smell - 0.5) - 0.12 * (1 - nat), 0.05, 1);
return {
s, m: mm, nat, cold, hot, bait, soft: env.soft != null ? env.soft : 0.5,
amp: (0.55 + 0.6 * mm) * (0.7 + 0.3 * nat) * (1 - 0.4 * cold) * (0.7 + 0.3 * bait),
tempo: (1.5 - 0.9 * mm) * (1 + 0.3 * (1 - nat)),
hold: (0.5 + 0.55 * mm) * (0.62 + 0.38 * nat) * (1 - 0.25 * hot),
crisp: 0.55 + 0.45 * nat
};
};
const D = Pond.diecActs = {
pause: (T, r, a, c) => [{ type: 'pause', dur: r(a, c) * T.tempo }],
brush: (T, b, r) => [{ type: 'brush', dur: r(0.3, 0.7), force: r(-0.5, 0.9) * b, tiltX: (r(0, 1) < 0.5 ? -1 : 1) * r(0.08, 0.16), mouth: false }],
quiver: (T, b, r) => {
const acts = [], k = Math.round(r(3, 6));
for (let j = 0; j < k; j++) {
acts.push({ type: 'quiver', dur: r(0.15, 0.22), force: (j % 2 ? -0.7 : 1) * r(0.4, 0.65) * b, bump: true, mouth: false });
acts.push({ type: 'pause', dur: r(0.03, 0.1) });
}
return acts;
},
nod: (T, b, r) => [{ type: 'nod', dur: r(0.38, 0.6), force: r(0.42, 0.9) * (0.8 + 0.4 * T.m) * (1 - 0.3 * T.cold) * DK.nod * b,
bump: true, mouth: false, erode: 0.008 + 0.012 * T.soft }],
tease: (T, b, r) => [{ type: 'tease', dur: r(0.42, 0.62), force: -r(0.8, 1.3) * (0.8 + 0.4 * T.m) * DK.nod * b, bump: true, mouth: false }],
testLift: (T, b, r) => { const f = -r(0.95, 1.3) * DK.lift * b; return [{ type: 'tease', dur: r(0.34, 0.46), force: f, rampT: 0.13, mouth: false, test: true }]; },
lift: (T, b, r, rig, big) => {
const up = (r(0.9, 1.6) + 1.1 * T.s) * T.amp, d = r(0.5, 0.95) * (1 + 0.6 * T.s), f = -up * DK.lift * b;
const acts = [{ type: 'lift', dur: d, force: f, rampT: d * 0.9, held: 1, mouth: true, hookQ: 0.88 },
{ type: 'hold', dur: r(0.4, 0.9) * T.hold, force: f, held: 1, mouth: true, hookQ: 1, fade: true }];
if (big) acts.push({ type: 'lie', dur: r(0.5, 1.0) * (0.6 + 0.6 * T.m), force: -((rig ? rig.lead : 1.2) * 1.15 + 0.05),
rampT: 0.35, held: 1, mouth: true, hookQ: 0.9 });
return acts;
},
dun: (T, b, r) => [{ type: 'dun', dur: r(0.42, 0.85) * (0.55 + 0.55 * T.hold), force: r(0.55, 1.25) * T.amp * DK.sink * b,
snap: true, snapT: 0.075 - 0.035 * T.crisp, mouth: true, hookQ: 1, fade: true }],
liftDun: (T, b, r) => {
const up = r(0.6, 1.1) * T.amp, d = r(0.4, 0.7);
return [{ type: 'lift', dur: d, force: -up * DK.lift * b, rampT: d * 0.85, held: 1, mouth: true, hookQ: 0.85 },
{ type: 'dun', dur: r(0.4, 0.75) * (0.55 + 0.55 * T.hold), force: r(0.45, 0.9) * T.amp * DK.sink * b, snap: true,
snapT: 0.075 - 0.035 * T.crisp, mouth: true, hookQ: 1, fade: true, after: 'lift' }];
},
creep: (T, b, r) => { const d = r(1.0, 1.9); return [{ type: 'creep', dur: d + r(0.3, 0.7) * T.hold, force: r(0.4, 0.75) * (0.85 + 0.3 * T.s) * DK.sink * b,
rampT: d * 0.8, mouth: true, hookQ: 0.85, fade: true }]; },
shift: (T, b, r) => { const d = r(1.0, 1.8); return [{ type: 'shift', dur: d, force: r(0.25, 0.5) * DK.sink * b, rampT: d * 0.7,
drift: (r(0, 1) < 0.5 ? -1 : 1) * r(0.05, 0.12), tiltX: r(-0.12, 0.12), mouth: true, hookQ: 0.92 }]; },
dive: (T, b, r) => [{ type: 'dun', dur: r(0.18, 0.3), force: r(0.7, 1.2) * T.amp * DK.sink * b, snap: true, snapT: 0.05, mouth: true, hookQ: 0.95 },
{ type: 'dive', dur: r(0.9, 1.5), force: r(9, 13) * b, rampT: r(0.35, 0.6), mouth: true, hookQ: 0.92 }],
snatch: (T, b, r) => [{ type: 'snatch', dur: r(0.28, 0.48), force: r(10, 14) * b, ramp: true, mouth: true, hookQ: 0.22 }],
mid: (T, b, r, rig) => [{ type: 'mid', dur: r(0.75, 1.4) * T.hold, force: 0, mouth: true, freeze: true, needSink: true, hookQ: 0.85,
atSink: r(2.3, 3.6) * U.clamp(((rig && rig.set) || 140) / 140, 0.5, 2) }],
spit: (T, r) => [{ type: 'spit', dur: 0.2, force: 0, mouth: false, steal: 0.45 * (1.2 - 0.4 * T.m) }]
};
Pond.diecKinds = (T, school) => ({
lift: (0.45 + 0.35 * T.m + 0.3 * T.s) * (1 - 0.35 * T.cold),
dun: (0.38 + 0.25 * T.m) * (1 + 0.4 * T.cold),
liftDun: 0.08 + 0.12 * T.m,
creep: 0.5 * Math.pow(1 - T.m, 1.5) + 0.3 * T.hot + 0.08 * (1 - T.nat),
shift: (0.05 + 0.12 * T.s) * (0.4 + T.m) * (1 - T.cold),
dive: T.m > 0.5 ? 0.12 * (T.m - 0.3) * (0.4 + T.s) * (0.5 + 0.5 * T.nat) : 0,
snatch: 0.4 * Math.pow(1 - T.s, 2) * (0.3 + T.m) * (school || 1)
});
function buildDiec(sp, sinking, m, b, w, rig, env) {
const T = Pond.diecTraits(sp, m, w, env), acts = [], r = U.rand, add = a => { for (const x of a) acts.push(x); };
const pause = (a, c) => add(D.pause(T, r, a, c));
if (sinking && U.chance(0.15 + 0.35 * T.m * (1 - T.s))) {
acts.push({ type: 'pause', dur: r(0.1, 0.4) });
add(D.mid(T, b, r, rig));
acts.push({ type: 'spit', dur: 0.2, force: 0, mouth: false, steal: 0.5 });
if (!U.chance(0.4)) return acts;
sinking = false;
}
if (U.chance(0.22)) { pause(0.4, 1.4); add(D.brush(T, b, r)); }
if (U.chance(0.25 + 0.2 * T.m)) { pause(0.3, 1.1); add(D.quiver(T, b, r)); }
const tests = U.randi(1, 2) + (T.m < 0.45 ? 1 : 0) + (T.s > 0.6 && U.chance(0.5) ? 1 : 0) + (T.nat < 0.6 ? 1 : 0) + (T.bait < 0.4 ? 1 : 0);
for (let i = 0; i < Math.min(5, tests); i++) {
pause(0.5, 1.6); add(D.nod(T, b, r));
if (U.chance(0.18)) { pause(0.15, 0.45); add(D.tease(T, b, r)); }
}
if (U.chance(0.6 * T.cold + 0.18 * Math.max(0, 0.5 - T.m))) { pause(0.4, 1.0); add(D.testLift(T, b, r)); }
const take = () => {
pause(0.3, 1.1);
const ws = Pond.diecKinds(T, Pond.wave > 1.2 ? 1.6 : 1), kinds = Object.keys(ws);
const kind = U.pickWeighted(kinds, k => ws[k]) || 'lift';
add(kind === 'lift' ? D.lift(T, b, r, rig, T.s > 0.5 && U.chance(0.25 + 0.35 * T.m)) : D[kind](T, b, r, rig));
add(D.spit(T, r));
};
take();
if (U.chance(0.18 + 0.3 * T.m)) { pause(0.8, 2.2); if (U.chance(0.5)) add(D.nod(T, b, r)); take(); }
return acts;
}
Pond.buildDiec = buildDiec;
function buildJitter(sp, m, b) {
const acts = [], n = U.randi(5, 11);
for (let i = 0; i < n; i++) {
if (U.chance(0.3)) acts.push({ type: 'pause', dur: U.rand(0.08, 0.6) });
const up = U.chance(0.4);
acts.push({ type: 'jitter', dur: U.rand(0.06, 0.16), force: (up ? -U.rand(0.9, 2.0) : U.rand(1.1, 2.8)) * b, bump: true, mouth: false, erode: 0.02 });
if (U.chance(0.1)) acts.push({ type: 'grab', dur: U.rand(0.16, 0.3), force: U.rand(4, 7) * b, bump: true, mouth: U.chance(0.3), hookQ: 0.35, erode: 0.05 });
}
return acts;
}
Pond.buildJitter = buildJitter;
Pond.loaiTraits = function (sp, m, w, env) {
env = env || {};
const [mn, mx] = CC.weightRange ? CC.weightRange(sp) : [sp.min, sp.max];
const s = U.clamp((w - mn) / Math.max(0.01, mx - mn), 0, 1);
const opt = (sp.temp && sp.temp.opt) || 27, wt = env.water != null ? env.water : CC.world.waterTemp;
const cold = U.clamp((opt - 4 - wt) / 6, 0, 1);
const smell = env.smell != null ? env.smell : 0.5, soft = env.soft != null ? env.soft : 0.5;
const line = env.line || CC.line(), hook = env.hook || CC.hook();
const fine = U.clamp(1 - 0.6 * U.clamp((((line && line.leader) || 2) - 2.0) / 2.5, 0, 1) - 0.4 * U.clamp((((hook && hook.size) || 5) - 5) / 7, 0, 1), 0, 1);
const mm = U.clamp(m + 0.15 * (smell - 0.5), 0.05, 1);
return { s, m: mm, cold, soft, fine, smell,
amp: (0.62 + 0.5 * mm) * (1 - 0.4 * cold),
tempo: 1.5 - 0.9 * mm,
hold: (0.7 + 0.5 * mm) * (1 - 0.2 * cold) };
};
const LA = Pond.loaiActs = {
pause: (T, r, a, c) => [{ type: 'pause', dur: r(a, c) * T.tempo }],
spit: (T, r, steal) => [{ type: 'spit', dur: 0.25, force: 0, mouth: false, steal: steal * (1.2 - 0.4 * T.m) }],
brush: (T, b, r, big) => [{ type: 'brush', dur: r(0.35, 0.8) * (big ? 1.3 : 1), force: r(-0.5, 1.2) * (big ? 1.5 : 1) * b,
tiltX: (r(0, 1) < 0.5 ? -1 : 1) * r(0.1, 0.2) * (big ? 1.5 : 1), mouth: false }],
troiFlick: (T, b, r) => {
const acts = [], k = Math.round(r(3, 7));
for (let j = 0; j < k; j++) {
acts.push({ type: 'nibble', dur: r(0.1, 0.15), force: r(0.75, 1.35) * (1 - 0.3 * T.cold) * b, mouth: false, erode: 0.004 + 0.008 * T.soft });
acts.push({ type: 'pause', dur: r(0.08, 0.3) });
}
return acts;
},
troiDon: (T, b, r) => [{ type: 'dip', dur: r(0.6, 1.05) * T.hold * (0.85 + 0.3 * T.soft), force: r(0.75, 1.35) * T.amp * (0.75 + 0.25 * T.fine) * DK.sink * b,
snap: true, snapT: 0.07, mouth: true, hookQ: 0.95, fade: true }],
troiDo: (T, b, r) => {
const d = r(1.0, 1.7), f = -(r(1.1, 1.9) + 0.7 * T.s) * T.amp * (0.75 + 0.25 * T.fine) * b;
return [{ type: 'lift', dur: d, force: f, rampT: d * 0.92, held: 1, mouth: true, hookQ: 0.8 },
{ type: 'hold', dur: r(0.6, 1.1) * T.hold * (0.85 + 0.3 * T.soft), force: f, f0: f, rampT: 0.01, held: 1, mouth: true, hookQ: 1, fade: true }];
},
troiChim: (T, b, r) => [{ type: 'sink', dur: r(0.55, 0.95) * T.hold, force: r(1.9, 3.0) * T.amp * b, mouth: true, hookQ: 1 }],
troiLun: (T, b, r) => { const d = r(1.5, 2.4); return [{ type: 'slow', dur: d + r(0.3, 0.6) * T.hold, force: r(1.0, 1.7) * b, rampT: d * 0.8,
mouth: true, hookQ: 0.85, fade: true }]; },
tcThu: (T, b, r) => [{ type: 'nibble', dur: r(0.18, 0.26), force: r(1.8, 2.8) * b, mouth: false, erode: 0.02 }],
tcNgam: (T, b, r) => { const d = r(0.65, 1.05) * (1.25 - 0.4 * T.m); return [{ type: 'slow', dur: d, force: r(1.8, 3.0) * b, rampT: d, mouth: true, hookQ: 0.4, soon: true }]; },
tcKeo: (T, b, r) => [{ type: 'run', dur: r(1.8, 2.8) * (0.8 + 0.3 * T.hold), force: 14 * b, rampT: r(0.5, 0.9), mouth: true, hookQ: 1 }],
tcNgang: (T, b, r) => { const d = r(1.8, 2.8) * (0.8 + 0.3 * T.hold), sg = r(0, 1) < 0.5 ? -1 : 1;
return [{ type: 'shift', dur: d, force: r(1.6, 2.6) * b, rampT: 0.3, drift: sg * r(0.14, 0.28), tiltX: sg * r(0.15, 0.25), mouth: true, hookQ: 1 }]; },
tcDo: (T, b, r) => {
const d = r(0.9, 1.4), f = -r(2.0, 3.0) * b;
return [{ type: 'lift', dur: d, force: f, rampT: d * 0.9, held: 1, mouth: true, hookQ: 0.5, soon: true },
{ type: 'hold', dur: r(1.0, 1.6) * (0.8 + 0.3 * T.hold), force: f, f0: f, rampT: 0.01, held: 1, mouth: true, hookQ: 1 }];
},
tcMid: (T, b, r, rig) => [{ type: 'mid', dur: r(0.5, 0.8), force: 0, mouth: true, freeze: true, needSink: true, hookQ: 0.5, soon: true,
atSink: r(2.0, 3.2) * U.clamp(((rig && rig.set) || 140) / 140, 0.5, 2) }],
chimDap: (T, b, r) => {
const acts = [], k = r(0, 1) < 0.45 ? 2 : 1;
for (let j = 0; j < k; j++) {
acts.push({ type: 'nibble', dur: r(0.08, 0.12), force: r(2.2, 3.4) * b, mouth: false, erode: 0.03 });
acts.push({ type: 'pause', dur: r(0.1, 0.3) });
}
return acts;
},
chimVut: (T, b, r) => [{ type: 'run', dur: r(0.9, 1.4), force: r(15, 18) * b, rampT: r(0.1, 0.18), mouth: true, hookQ: 1, deepT: r(0.5, 0.65) }],
chimDon: (T, b, r) => { const f = r(3.2, 5) * b; return [{ type: 'sink', dur: r(0.28, 0.45), force: f, snap: true, snapT: 0.05, mouth: true, hookQ: 1 },
{ type: 'run', dur: r(0.7, 1.1), force: r(15, 18) * b, f0: f, rampT: r(0.1, 0.18), mouth: true, hookQ: 1, deepT: r(0.25, 0.4) }]; },
chimLuot: (T, b, r) => { const sg = r(0, 1) < 0.5 ? -1 : 1;
return [{ type: 'shift', dur: r(0.85, 1.25), force: r(1.9, 3.0) * b, rampT: 0.15, drift: sg * r(0.2, 0.34), tiltX: sg * r(0.2, 0.3), mouth: true, hookQ: 0.95, deepT: r(0.55, 0.7) }]; },
chimMid: (T, b, r, rig) => [{ type: 'mid', dur: r(0.35, 0.6), force: 0, mouth: true, freeze: true, needSink: true, hookQ: 0.9,
atSink: r(1.6, 3.0) * U.clamp(((rig && rig.set) || 140) / 140, 0.5, 2) }]
};
Pond.loaiKinds = {
troi: (T, school) => ({ troiDo: 0.5 + 0.2 * (1 - T.m), troiDon: (0.45 + 0.2 * T.m) * (1 + 0.5 * T.cold),
troiChim: 0.3 * T.m * (school || 1) * (1 - T.cold), troiLun: 0.22 * (1 - T.m) + 0.35 * T.cold }),
tramco: T => ({ tcKeo: 0.45 + 0.3 * T.m, tcNgang: 0.35, tcDo: 0.2 + 0.2 * (1 - T.m) }),
chim: T => ({ chimVut: 0.5 + 0.2 * T.m, chimDon: 0.25, chimLuot: 0.25 })
};
const pickKind = ws => { const ks = Object.keys(ws); return U.pickWeighted(ks, k => ws[k]) || ks[0]; };
function buildTroi(sp, sinking, m, b, w, rig, env) {
const T = Pond.loaiTraits(sp, m, w, env), acts = [], r = U.rand, add = a => { for (const x of a) acts.push(x); };
const pause = (a, c) => add(LA.pause(T, r, a, c));
if (U.chance(0.2)) { pause(0.4, 1.4); add(LA.brush(T, b, r)); }
const trains = U.randi(1, 2) + (T.m < 0.45 ? 1 : 0) + (T.fine < 0.6 ? 1 : 0);
for (let i = 0; i < trains; i++) { pause(0.4, 1.3); add(LA.troiFlick(T, b, r)); }
const take = () => {
pause(0.25, 0.9);
add(LA[pickKind(Pond.loaiKinds.troi(T, Pond.wave > 1.2 ? 1.7 : 1))](T, b, r, rig));
add(LA.spit(T, r, 0.4));
};
take();
if (U.chance(0.25 + 0.35 * T.m)) { pause(0.6, 1.6); if (U.chance(0.6)) add(LA.troiFlick(T, b, r)); take(); }
return acts;
}
function buildTramCo(sp, sinking, m, b, w, rig, env) {
const T = Pond.loaiTraits(sp, m, w, env), acts = [], r = U.rand, add = a => { for (const x of a) acts.push(x); };
const pause = (a, c) => add(LA.pause(T, r, a, c));
if (sinking && U.chance(0.15 + 0.3 * T.m)) {
acts.push({ type: 'pause', dur: r(0.1, 0.4) });
add(LA.tcMid(T, b, r, rig)); add(LA.tcKeo(T, b, r)); add(LA.spit(T, r, 0.75));
return acts;
}
const nb = U.randi(0, 2) + (T.m < 0.4 ? 1 : 0);
for (let i = 0; i < nb; i++) { pause(0.5, 2.0); add(LA.brush(T, b, r, true)); }
if (U.chance(0.45 - 0.2 * T.m)) { pause(0.5, 1.5); add(LA.tcThu(T, b, r)); }
pause(0.4, 1.2);
const kind = pickKind(Pond.loaiKinds.tramco(T));
const chain = x => { const p = acts[acts.length - 1]; if (p && p.mouth && p.force && x[0].rampT) x[0].f0 = p.force; add(x); };
if (kind !== 'tcDo') add(LA.tcNgam(T, b, r));
chain(LA[kind](T, b, r, rig));
if (kind === 'tcNgang' && U.chance(0.35 + 0.3 * T.m)) chain(LA.tcKeo(T, b, r));
add(LA.spit(T, r, 0.75));
return acts;
}
function buildChim(sp, sinking, m, b, w, rig, env) {
const T = Pond.loaiTraits(sp, m, w, env), acts = [], r = U.rand, add = a => { for (const x of a) acts.push(x); };
const pause = (a, c) => add(LA.pause(T, r, a, c));
const take = () => { add(LA[pickKind(Pond.loaiKinds.chim(T))](T, b, r, rig)); add(LA.spit(T, r, 0.9)); };
if (sinking && U.chance(0.3 + 0.4 * T.m)) {
acts.push({ type: 'pause', dur: r(0.05, 0.3) });
add(LA.chimMid(T, b, r, rig)); add(LA.chimVut(T, b, r)); add(LA.spit(T, r, 0.9));
return acts;
}
if (U.chance(0.15)) { pause(0.3, 1.0); add(LA.brush(T, b, r)); }
if (U.chance(0.5 - 0.2 * T.m)) { pause(0.2, 0.8); add(LA.chimDap(T, b, r)); } else pause(0.1, 0.5);
take();
if (U.chance(0.2 + 0.3 * T.m)) { pause(0.5, 1.2); take(); }
return acts;
}
const LOAI_BUILD = { troi: buildTroi, tramco: buildTramCo, chim: buildChim };
Pond.buildLoai = (sp, sinking, m, b, w, rig, env) => LOAI_BUILD[sp.bite](sp, sinking, m, b, w, rig, env);
CC.mouthFit = (sp, w, hook) => {
const [mn, mx] = CC.weightRange ? CC.weightRange(sp) : [sp.min, sp.max];
const s = U.clamp((w - mn) / Math.max(0.001, mx - mn), 0, 1);
const mouth = (sp.mouth || 10) * (0.75 + 0.5 * s), size = (hook && hook.size) || 5;
return size <= mouth ? 1 : Math.exp(-(size - mouth) / 2.5);
};
function lineBite(b) {
const R = RH(), acts = [{ type: 'pause', dur: U.rand(0.05, 0.3) }];
const n = U.chance(0.35) ? 2 : 1;
for (let i = 0; i < n; i++) {
acts.push({ type: 'brush', dur: U.rand(0.25, 0.7), force: rr(R.lineBite) * b, tiltX: U.rand(-0.3, 0.3), mouth: false });
if (i + 1 < n) acts.push({ type: 'pause', dur: U.rand(0.1, 0.5) });
}
return acts;
}
Pond.tick = function (dt, q) {
if (q != null) Pond.q = q;
const R = RH(), act = CC.world.meanActivity(fishList());
const eat = Pond.fish * 0.004 * Pond.food / (Pond.food + 0.5) * (0.6 + 0.4 * Pond.wave);
Pond.food = Math.max(0, Pond.food - (Pond.food / 420 + eat) * dt);
const target = Pond.q * (0.25 + 1.6 * Pond.food / (Pond.food + 3)) * (0.6 + 0.4 * Math.min(1.5, act));
Pond.fish += (target - Pond.fish) * Math.min(1, dt / 75);
Pond.waveT -= dt;
if (Pond.waveT <= 0) {
const bait = Pond.food / (Pond.food + 2), actK = U.clamp(act, 0.6, 1.4);
const PW = (CC.pond && CC.pond().wave) || {};
if (Pond.inWave) {
Pond.inWave = false;
Pond.waveTarget = rr(R.waveLull);
Pond.waveT = rr(PW.lull || R.lullLen) / Math.max(0.35, act * (0.5 + 0.7 * bait));
} else {
Pond.inWave = true;
Pond.waveCount++;
Pond.waveTarget = rr(PW.hot || R.waveHot) * (0.7 + 0.3 * bait) * actK;
Pond.waveT = rr(PW.len || R.waveLen) * (0.6 + 0.4 * bait) * actK;
}
}
Pond.wave += (Pond.waveTarget - Pond.wave) * Math.min(1, dt / (Pond.inWave ? 6 : 15));
if (Pond.spook > 0) Pond.spook -= dt;
if (!Pond.suitor) Pond.suitorBubbles = 0;
const waveB = U.clamp((Pond.wave - 0.8) * 0.7, 0, 1) * (0.3 + 0.7 * Pond.food / (Pond.food + 1)) * 0.6;
Pond.bubbles = U.clamp(waveB + Pond.suitorBubbles, 0, 1);
};
Pond.update = function (dt, ctx) {
const W = CC.world, b = ctx.b || CC.float().b;
Pond.clock = (Pond.clock || 0) + dt;
Pond.sinkT = ctx.sinking ? (Pond.wasSinking ? (Pond.sinkT || 0) + dt : 0) : 0;
Pond.wasSinking = !!ctx.sinking;
let su = Pond.suitor;
const spot = 0.2 + 0.8 * Math.exp(-((ctx.dx / 0.7) ** 2));
if (!su && CC.Rig.hasBait(ctx.rig)) {
const smell = ctx.smell || {};
let total = 0;
const pond = CC.pond(), list = fishList();
const ws = list.map(sp => {
let w = sp.abund * pond.fish[sp.id] * W.activity(sp) * (0.4 + (smell[sp.id] != null ? smell[sp.id] : 0.5));
if (ctx.mud) w *= sp.id === 'chep' || sp.id === 'diec' || sp.id === 'troi' ? 1.25 : 1;
else w *= sp.id === 'rophi' || sp.id === 'dieuhong' ? 1.1 : 1;
if (sp.tap) w *= (0.3 + Pond.food * 0.06) * (ctx.soft != null ? 0.55 + 0.9 * ctx.soft : 1);
else {
const big = sp.max > 10 ? 0.35 : 1;
w *= (1 - (1 - ctx.lineVis) * big) * (1 - (1 - ctx.hookTake) * big) * (1.15 - sp.wary * 0.3) * Pond.hunger();
}
total += w;
return w;
});
const luck = CC.Luck && CC.Luck.bite ? CC.Luck.bite() : 1;
const rate = 0.06 * pond.rate * total * Pond.fish * spot * Pond.wave * (Pond.spook > 0 ? 0.12 : 1) * (ctx.xa ? 0.5 : 1) * luck;
if (U.chance(rate * dt)) {
const sp = U.pickWeighted(list, f => ws[list.indexOf(f)]);
const mood = U.clamp(W.mood(sp) + 0.2 * (Pond.wave - 1) - (Pond.spook > 0 ? 0.2 : 0), 0.05, 1);
const fw = CC.rollWeight(sp);
const rg = ctx.rig, env = sp.bite === 'diec' ? { line: CC.line(), hook: CC.hook(), smell: smell[sp.id], soft: ctx.soft,
bait: rg && rg.baits ? (rg.baits[0] + rg.baits[1]) / (2 * (rg.w0 || CC.BAIT.w)) : 1 } : null;
const acts = sp.bite === 'diec' ? buildDiec(sp, ctx.sinking, mood, b, fw, ctx.rig, env)
: sp.bite === 'jitter' ? buildJitter(sp, mood, b)
: LOAI_BUILD[sp.bite] ? LOAI_BUILD[sp.bite](sp, ctx.sinking, mood, b, fw, ctx.rig, { line: CC.line(), hook: CC.hook(), smell: smell[sp.id], soft: ctx.soft })
: buildScript(sp, ctx.sinking, mood, b);
su = Pond.suitor = { sp, w: fw, mood, acts, i: 0, t: 0 };
}
}
if (!su && !ctx.sinking && U.chance(RH().lineBiteRate * Math.max(0, Pond.wave - 0.5) * Pond.fish * spot * dt)) {
su = Pond.suitor = { sp: fishList()[0], w: 0, mood: 0.5, lineOnly: true, acts: lineBite(b), i: 0, t: 0 };
}
const out = { force: 0, held: -1, tiltX: 0, mouth: false, freeze: false, act: null };
if (!su) return out;
let a = su.acts[su.i];
while (a && su.t >= a.dur) {
if (a.erode) { const k = U.randi(0, 1); ctx.rig.baitLeft[k] = Math.max(0, ctx.rig.baitLeft[k] - a.erode); }
if (a.steal && U.chance(a.steal)) ctx.rig.baitLeft[U.chance(0.7) ? 1 : 0] *= 0.15;
su.t -= a.dur; su.i++; a = su.acts[su.i];
}
while (a && a.needSink && !ctx.sinking) {
su.i++; if (su.acts[su.i] && su.acts[su.i].type === 'spit') su.i++;
su.t = 0; a = su.acts[su.i];
}
if (a && a.atSink && ctx.sinking && Pond.sinkT < a.atSink) { su.t = 0; return out; }
if (!a) {
const last = su.acts[su.acts.length - 1], prev = su.acts.slice().reverse().find(x => x.type !== 'pause' && x.type !== 'spit');
Pond.lastLeft = su.lineOnly ? null : { sp: su.sp, w: su.w, last: last && last.type, prev: prev && prev.type, at: Pond.clock };
Pond.suitor = null; Pond.suitorBubbles = 0; return out;
}
su.t += dt;
const p = U.clamp(su.t / a.dur, 0, 1);
out.act = a.type;
out.mouth = !!a.mouth;
out.held = a.held != null ? a.held : -1;
out.freeze = !!a.freeze;
out.lineOnly = !!su.lineOnly;
if (a.force) {
if (a.bump) out.force = a.force * Math.sin(p * Math.PI);
else if (a.snap) out.force = a.force * Math.min(1, su.t / (a.snapT || 0.08));
else if (a.rampT) out.force = (a.f0 || 0) + (a.force - (a.f0 || 0)) * Math.min(1, su.t / a.rampT);
else if (a.ramp) out.force = a.force * Math.min(1, p * 2.5);
else out.force = a.force * Math.sin(Math.min(1, p * 1.6) * Math.PI / 2);
}
if (a.type === 'nibble') out.force = a.force * Math.sin(p * Math.PI);
if (a.tiltX) out.tiltX = a.tiltX * Math.sin(p * Math.PI);
if (a.drift) out.drift = a.drift * Math.min(1, su.t / (a.rampT || a.dur));
const nosing = a.type === 'brush' || a.type === 'nibble' || a.type === 'pause' || a.type === 'nod' || a.type === 'tease' || a.type === 'quiver';
Pond.suitorBubbles = !su.lineOnly && nosing && su.sp.rhythm ? su.sp.rhythm.bubbly * 0.8 : 0;
return out;
};
Pond.hookChance = function (sp, w, a, t, xa) {
const H = CC.hook();
const fit = CC.mouthFit(sp, w, H);
const lfit = Pond.leaderFit(sp, CC.line());
if (!a || !a.mouth) return { p: 0, fit, lfit, early: false, late: false };
const early = t < 0.07 ? 0.6 : 1;
const fade = a.fade ? 1 - 0.3 * U.clamp((t / a.dur - 0.6) / 0.4, 0, 1) : 1;
let p = H.hold * early * fade * (a.hookQ || 1) * (xa ? 0.5 : 1) * fit * lfit;
if (lfit > 1) p = Math.min(0.95, p);
return { p, fit, lfit, early: early < 1, late: fade < 0.9 };
};
Pond.strike = function (xa) {
const su = Pond.suitor;
Pond.suitor = null;
Pond.suitorBubbles = 0;
Pond.lastMiss = null;
if (!su) {
const L = Pond.lastLeft;
if (L && Pond.clock - L.at < 1.5) Pond.lastMiss = { act: 'gone', prev: L.prev, last: L.last, sp: L.sp, mouth: false, w: L.w };
return null;
}
if (su.lineOnly) { Pond.spook = 2; Pond.lastMiss = { act: 'line' }; return null; }
const a = su.acts[su.i], H = CC.hook();
const hc = Pond.hookChance(su.sp, su.w, a, su.t, xa);
if (a && a.mouth && U.chance(hc.p)) {
const deep = a.deepT != null && su.t > a.deepT;
Pond.lastTake = { sp: su.sp, w: su.w, deep, at: Pond.clock };
if (deep && CC.UI && CC.UI.toast && !(CC.PondMap && CC.PondMap.watched))
CC.UI.toast('วัดช้าไปหน่อย — ปลาเปคูกลืนลึก ฟันคมกัดสายหน้า! ประคองเบามือ อย่าให้แถบแรงแดง!', 'bad', 3500);
return { sp: su.sp, w: su.w, hold: H.hold * U.rand(0.75, 1), deep };
}
const prev = su.acts[su.i - 1];
let sig = null;
for (let k = su.i - 1; k >= 0 && !sig; k--) if (su.acts[k].type !== 'pause') sig = su.acts[k].type;
Pond.lastMiss = { act: a ? a.type : null, prev: prev ? prev.type : null, sig, sp: su.sp, fit: hc.fit, lfit: hc.lfit, mouth: !!(a && a.mouth),
early: hc.early, late: hc.late, p: hc.p, test: !!(a && a.test), after: a && a.after, xa: !!xa, hook: H.size, w: su.w, soon: !!(a && a.soon) };
Pond.spook = 5 + su.sp.wary * 10;
Pond.fish *= 0.9;
if (Pond.inWave) Pond.waveT *= 0.7;
return null;
};
const TAKE_ACTS = ['lift', 'hold', 'lie', 'dun', 'creep', 'shift', 'dive', 'snatch', 'mid'];
const TAKE_NEW = ['lift', 'hold', 'dip', 'sink', 'slow', 'shift', 'run', 'mid'];
const afterTake = lm => lm.act === 'spit' || lm.act === 'gone' || (!lm.mouth && (lm.prev === 'spit' || TAKE_NEW.includes(lm.sig)));
const LOAI_TIP = {
troi: lm => {
if (afterTake(lm)) return 'สายไปแล้ว — ปลายี่สกเทศคายเหยื่อแล้ว อาการกินของปลายี่สกเทศละเอียด: ทุ่นตอกคมครึ่งข้อแล้วนิ่ง หรือทุ่นถอนขึ้นช้าๆ แล้วหยุด ต้องรีบวัด';
if (lm.act === 'nibble' || (!lm.mouth && lm.sig === 'nibble')) return 'ทุ่นกระตุกยิบๆ คือปลายี่สกเทศแค่ดูดลองรอบเหยื่อ ยังไม่อม — อย่าเพิ่งวัด รอให้ทุ่นตอกคมครึ่ง–หนึ่งข้อแล้วนิ่ง หรือทุ่นถอนขึ้นช้าๆ';
if (lm.act === 'brush' || lm.sig === 'brush') return 'ทุ่นโคลงเอียงคือปลายี่สกเทศว่ายเฉี่ยวสาย — ยังไม่กินเหยื่อ';
if (!lm.mouth) return null;
if (lm.fit < 0.6) return `ถูกจังหวะแต่ตัวเบ็ดเบอร์ ${lm.hook} ใหญ่เกินไป — ปลายี่สกเทศปากเล็ก ให้ใช้เบ็ดเบอร์ 3 หรือเบอร์ 5`;
if (lm.early) return 'วัดเร็วเกินไป — ทุ่นเพิ่งขยับ ปลายี่สกเทศยังไม่ทันดูดเหยื่อเข้าปาก';
if (lm.late) return 'วัดช้าไปหน่อย — ปลายี่สกเทศกำลังจะคายเหยื่อ เห็นทุ่นตอกลงแล้วหยุดให้วัดทันที';
if (lm.lfit != null && lm.lfit < 0.95) return 'ถูกจังหวะแต่วัดวืด — สายหน้าใหญ่และแข็งทำให้เบ็ดพลิกเข้าปากเล็กๆ ของปลายี่สกเทศยาก ใช้สายหน้าเล็กลงหน่อย';
if (lm.act === 'lift') return 'ถูกจังหวะทุ่นถอนแต่วัดตอนทุ่นยังลอยอยู่ — ปลายี่สกเทศยกทุ่นถอนช้ามาก รอให้ทุ่นลอยสุดแล้วนิ่งค่อยวัด';
return 'ถูกจังหวะแต่วัดวืด — ปลายี่สกเทศดูดเหยื่อเบามาก มีพลาดบ้างเป็นเรื่องปกติ คอยวัดตามจังหวะแบบนี้ต่อไป';
},
tramco: lm => {
if (afterTake(lm)) return 'ช้าเกินไป — ปลาเฉาอมเหยื่อนาน (2–3 วินาที) แต่สุดท้ายก็คาย เห็นทุ่นจมหายหรือลากออกข้างชัดหนึ่งจังหวะแล้วค่อยวัด';
if (lm.act === 'nibble' || (!lm.mouth && lm.sig === 'nibble')) return 'ทุ่นกระตุกหนึ่งทีชัดๆ แล้วคืนกลับคือปลาเฉาแค่กัดชิมหัวเหยื่อ — ยังไม่อม รอทุ่นจมช้าๆ แล้วเดินต่อค่อยวัด';
if (lm.act === 'brush' || lm.sig === 'brush') return 'ทุ่นโคลงเอียงแรงคือปลาเฉาว่ายปัดสาย — ตัวมันใหญ่ ยังไม่กินเหยื่อ รอต่อไป';
if (!lm.mouth) return null;
if (lm.soon) return 'รีบวัดไป — ปลาเฉาเพิ่งอมปลายเหยื่อ ยังไม่หันหัว รอให้ทุ่นเดินขาด (จมหาย ลากออกข้าง หรือทุ่นถอนสูงแล้วนิ่ง) เพิ่มอีกจังหวะค่อยวัด';
if (lm.fit < 0.6) return `ถูกจังหวะแต่ตัวเบ็ดเบอร์ ${lm.hook} ใหญ่เกินไปสำหรับปลาเฉาตัวนี้`;
if (lm.early) return 'วัดเร็วเกินไป — ทุ่นเพิ่งเริ่มขยับ';
return 'ถูกจังหวะแต่วัดวืด — เบ็ดยังไม่เกี่ยวริมฝีปาก ปลาเฉาอมเหยื่อนาน รอให้ทุ่นเดินขาดๆ แล้ววัดให้หนักแน่น';
},
chim: lm => {
if (afterTake(lm)) return 'สายไปแล้ว — ปลาเปคูฉกเหยื่อแล้วคายในพริบตา เห็นทุ่นจมหายวับหรือลากออกข้างให้วัดทันที อย่ารอ';
if (lm.act === 'nibble' || (!lm.mouth && lm.sig === 'nibble')) return 'ทุ่นสั่นกระตุกหนึ่งทีคือปลาเปคูตีเหยื่อ — ยังไม่อม จังหวะต่อไปทุ่นจมหายวับให้วัดทันที';
if (lm.act === 'brush' || lm.sig === 'brush') return 'ทุ่นโคลงเอียงคือปลาว่ายเฉี่ยวสาย — ยังไม่กินเหยื่อ';
if (!lm.mouth) return null;
if (lm.fit < 0.6) return `ถูกจังหวะแต่ตัวเบ็ดเบอร์ ${lm.hook} ใหญ่เกินไปสำหรับปลาเปคูตัวนี้`;
if (lm.early) return 'วัดเร็วเกินไป — ทุ่นเพิ่งเริ่มขยับ';
return 'ถูกจังหวะแต่วัดวืด — ปลาเปคูฉกเหยื่อไวมาก เบ็ดยังไม่ทันเกี่ยว เห็นทุ่นจมหายวับให้วัดทันที';
}
};
Pond.missTip = function (lm) {
if (!lm) return undefined;
const pd = CC.pond ? CC.pond() : null;
if (lm.act === 'line') return pd && pd.id === 'diec' ? 'ทุ่นโคลงเอียงแต่ไม่จมชัดคือปลาว่ายผ่านเฉี่ยวสายทุ่น — ยังไม่ใช่ปลากินเหยื่อ' : undefined;
const sp = lm.sp;
if (sp && LOAI_TIP[sp.bite]) return LOAI_TIP[sp.bite](lm);
if (!sp || (sp.bite !== 'diec' && sp.bite !== 'jitter')) return undefined;
if (sp.bite === 'jitter' || lm.act === 'jitter' || lm.act === 'grab')
return 'ทุ่นเด้งมั่วขึ้นลงคือปลาซิวกวนเหยื่อ — อย่าไปวัดตาม ปั้นเหยื่อให้แข็งและก้อนใหญ่ขึ้น ลดกลิ่นคาว อย่าอ่อยหลุมหนาเกินไป';
const late = 'สายไปแล้ว — ปลาตะเพียนจีนคายเหยื่อเร็วมาก (ไม่ถึงครึ่งวินาที) พอทุ่นคืนกลับมาข้อเดิมคือเหยื่อหลุดจากปากแล้ว เห็นทุ่นตอกคมหรือทุ่นถอนแล้วหยุดให้วัดทันที';
const smallHook = lm.hook != null && lm.hook > 3 ? ' ถ้าปลาตะเพียนเล็กเยอะให้ใช้เบ็ดเบอร์ 3' : '';
switch (lm.act) {
case 'nod': return 'ปลาตะเพียนจีนเพิ่งแตะทุ่นลองเหยื่อ (ย่อเบาๆ แล้วคืนกลับ) — รอจังหวะกินจริง: ทุ่นตอกคมแล้วนิ่ง หรือทุ่นถอนขึ้นแล้วหยุด';
case 'tease': return lm.test ? 'ปลาตะเพียนจีนซึม (น้ำเย็น แดดจัด) มัก "ถอนลอง": ทุ่นโผล่ไวครึ่งข้อ ชะงักนิดแล้วตอกกลับ — ยังไม่อมเหยื่อ ถ้าถอนจริงทุ่นจะขึ้น 1–2 ข้อแล้วนิ่งสนิท'
: 'ทุ่นโผล่นิดแล้วจมทันทีคือปลาตะเพียนจีนเล่นทุ่น ดุนลองเหยื่อ — ยังไม่อม รอดูต่อ';
case 'quiver': return 'ทุ่นสั่นระริกเบาๆ คือปลาตะเพียนจีนกำลังโบกครีบรอบเหยื่อ — ใกล้กินแล้ว อย่าเพิ่งรีบวัด';
case 'brush': return 'ทุ่นโคลงเอียงแต่ไม่จมคือปลาตะเพียนจีนเฉี่ยวสาย — ยังไม่กินเหยื่อ';
case 'snatch': return 'ทุ่นจมวูบแล้วลอยคืนทันทีคือปลาตะเพียนเล็กแย่งเหยื่อ — ปากเล็ก วัดสิบทีพลาดเก้า' + smallHook;
case 'spit': case 'gone': return late;
}
if (lm.mouth) {
if (lm.fit < 0.6) return `ถูกจังหวะแต่ตัวเบ็ดเบอร์ ${lm.hook} ใหญ่เกินไป ปลาตะเพียนจีนอมไม่เข้า — เปลี่ยนเป็นเบ็ดเล็ก (เบอร์ 3)`;
if (lm.early) return 'วัดเร็วเกินไป — ทุ่นเพิ่งขยับ เหยื่อยังไม่เข้าปากปลาตะเพียนจีนดี';
if (lm.late) return 'วัดช้าไปหน่อย — ปลาตะเพียนจีนกำลังจะคายเหยื่อ เห็นทุ่นหยุดให้วัดทันที อย่ารอ';
if (lm.lfit != null && lm.lfit < 0.95) return 'ถูกจังหวะแต่วัดวืด — สายหน้าใหญ่และแข็งทำให้เบ็ดพลิกเข้าปากปลาตะเพียนจีนยาก ชุดสายเมน 0.8 – สายหน้า 0.4 จะวัดติดคมกว่า';
if (lm.act === 'lift') return 'ถูกจังหวะทุ่นถอนแต่วัดตอนทุ่นกำลังลอยขึ้น — รอให้ทุ่นหยุดนิ่งก่อนวัดจะชัวร์กว่า';
if (lm.act === 'mid') return 'ถูกจังหวะฉกกลางน้ำแต่เบ็ดลื่น — ปลาตะเพียนจีนงับเหยื่อตอนกำลังจมแบบคาบหมิ่นๆ';
return 'ถูกจังหวะแต่วัดวืด — ปลาตะเพียนจีนปากเล็ก กินเบา มีพลาดบ้างเป็นธรรมดา คอยวัดตามจังหวะแบบนี้ต่อไป' +
(lm.lfit != null && lm.lfit < 1.1 ? ' สายหน้าเล็กกว่านี้ (สายเมน 0.8 – สายหน้า 0.4) จะวัดติดคมกว่า' : '');
}
if (lm.prev === 'spit' || TAKE_ACTS.includes(lm.sig)) return late;
if (lm.sig === 'nod' || lm.sig === 'tease') return 'วัดตามจังหวะแตะทุ่นลองเหยื่อ — ปลาตะเพียนจีนยังไม่อมเหยื่อ วัดไปปลาจะตกใจหนีไปพักหนึ่ง รอให้ทุ่นตอกคมแล้วนิ่ง หรือทุ่นถอนขึ้นแล้วหยุด';
if (lm.sig === 'quiver' || lm.sig === 'brush') return 'ทุ่นเพิ่งสั่นหรือเอียงเบาๆ — ปลาตะเพียนจีนยังวนอยู่รอบเหยื่อ ยังไม่กิน รออีกนิด';
return null;
};
Pond.simBites = function (minutes) {
const save = JSON.stringify({ food: Pond.food, fish: Pond.fish, spook: Pond.spook, wave: Pond.wave, waveTarget: Pond.waveTarget,
waveT: Pond.waveT, inWave: Pond.inWave, waveCount: Pond.waveCount });
const saveSu = Pond.suitor;
Pond.suitor = null;
Pond.food = Math.max(Pond.food, 4);
const rig = { lead: 1.2, set: 150, baits: [CC.BAIT.w, CC.BAIT.w], baitLeft: [1, 1], baitAge: 0, kind: 'cau' };
const dt = 0.05, n = Math.max(1, Math.round(minutes)), perMin = new Array(n).fill(0), kinds = {}, bySp = {};
let lineBites = 0, suitors = 0, tapSuitors = 0, moodSum = 0, waveTime = 0, prev = null, prevI = -1, prevMouth = false;
const w0 = Pond.waveCount;
for (let t = 0; t < n * 60; t += dt) {
Pond.tick(dt);
rig.baitLeft = rig.baitLeft.map(x => (x <= 0.15 ? 1 : x));
if (Pond.food < 2) Pond.food += 2;
Pond.update(dt, { rig, dx: 0, sinking: false, lineVis: CC.line().vis, hookTake: CC.hook().take, xa: false, soft: 0.5 });
if (Pond.inWave) waveTime += dt;
const su = Pond.suitor;
if (su && su !== prev) {
prevI = -1; prevMouth = false;
if (su.lineOnly) lineBites++; else if (su.sp.tap) tapSuitors++; else { suitors++; moodSum += su.mood; }
}
if (su && !su.lineOnly && su.i !== prevI && su.acts[su.i]) {
prevI = su.i;
const a = su.acts[su.i];
if (a.mouth && a.type !== 'nibble' && !prevMouth) {
kinds[a.type] = (kinds[a.type] || 0) + 1;
bySp[su.sp.id] = (bySp[su.sp.id] || 0) + 1;
perMin[Math.min(n - 1, Math.floor(t / 60))]++;
}
prevMouth = !!a.mouth;
}
prev = su;
}
const waves = Pond.waveCount - w0;
Object.assign(Pond, JSON.parse(save));
Pond.suitor = saveSu;
const bites = perMin.reduce((s, x) => s + x, 0);
return { weather: CC.world.weather, hour: +CC.world.hour().toFixed(1), water: +CC.world.waterTemp.toFixed(1),
act: +CC.world.meanActivity(fishList()).toFixed(2), bites, perMin: +(bites / n).toFixed(1), suitors, tapSuitors,
mood: suitors ? +(moodSum / suitors).toFixed(2) : 0, lineBites, kinds, bySp, waves,
waveShare: Math.round(waveTime / (n * 60) * 100), rhythm: perMin.join(' ') };
};
})();
