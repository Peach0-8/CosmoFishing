(function () {
const U = CC.U;
const Rig = CC.Rig = {};
CC.rod = () => CC.RODS.find(r => r.id === CC.P.rod) || CC.RODS[0];
CC.line = () => CC.LINES.find(l => l.id === CC.P.line) || CC.LINES[0];
CC.hook = () => CC.HOOKS.find(h => h.id === CC.P.hook) || CC.HOOKS[0];
CC.float = () => CC.FLOATS.find(f => f.id === CC.P.float) || CC.FLOATS[0];
Rig.LEADER_LONG = 24;
Rig.CHENH = 4;
function load(v, rig, F, H, bottom, ext) {
const tipBase = (F.n - v) * F.nl;
const geomLow = tipBase + rig.set;
const leadGeom = geomLow - Rig.LEADER_LONG;
const sinkH = ext.sinkH != null ? ext.sinkH : ext.sink;
const low = Math.min(geomLow, sinkH);
const up = low - Rig.CHENH;
const leadD = Math.min(leadGeom, ext.sink);
const fL = ext.sink >= leadGeom ? 1 : U.smooth(0.1, 0.8, ext.sink / Math.max(5, leadGeom));
const h0 = leadGeom * 0.55;
const fB = sinkH >= geomLow ? 1 : U.clamp((sinkH - h0) / Math.max(5, geomLow - h0), 0, 1);
const sLead = U.clamp((leadD - bottom) / 0.4, 0, 1);
const sLow = ext.held === 1 ? 1 : U.clamp((geomLow - bottom) / 1.0, 0, 1);
const sUp = ext.held === 0 ? 1 : U.clamp((geomLow - Rig.CHENH - bottom) / 1.0, 0, 1);
let W = rig.lead * (1 - sLead) * fL
+ ((H.w + rig.baits[1]) * (1 - sLow) + (H.w + rig.baits[0]) * (1 - sUp)) * fB;
W += ext.force || 0;
return { W, low, up, leadD, sLead, sLow, sUp, slack: fL, fL, fB };
}
Rig.solve = function (rig, bottom, ext) {
const F = CC.float(), H = CC.hook();
ext = ext || {};
if (ext.sink == null) ext.sink = Infinity;
let lo = -8, hi = F.n + 10;
for (let i = 0; i < 34; i++) {
const mid = (lo + hi) / 2;
const r = load(mid, rig, F, H, bottom, ext);
const g = F.n - (r.W - F.body) / F.b - mid;
if (g > 0) lo = mid; else hi = mid;
}
const v = (lo + hi) / 2;
const r = load(v, rig, F, H, bottom, ext);
r.v = v;
r.leadOnBottom = r.sLead > 0.5;
return r;
};
Rig.canValue = function (rig) {
const bare = Object.assign({}, rig, { baits: [0, 0] });
return Rig.solve(bare, 9999, {}).v;
};
Rig.cauW = () => CC.BAIT.w * (CC.P && CC.P.bowls && CC.P.bowls.cau ? CC.P.bowls.cau.dens : 1);
Rig.cauValue = function (rig, bottom) {
const w = Rig.cauW();
const fresh = Object.assign({}, rig, { baits: [w, w] });
return Rig.solve(fresh, bottom, {}).v;
};
Rig.findBottomSet = function (rig, bottom) {
const F = CC.float();
const v = Rig.canValue(rig);
return bottom - (F.n - v) * F.nl;
};
Rig.fmt = v => {
const n = CC.float().n;
if (v <= -0.5) return 'จมหาย';
if (v > n + 1.5) return 'ทุ่นนอน';
if (v > n + 0.5) return 'โผล่ทั้งตัว';
return (Math.round(v * 2) / 2).toFixed(1).replace('.0', '') + ' ข้อ';
};
Rig.visV = v => {
const n = CC.float().n;
return v <= n ? v : n + 1.2 * (1 - Math.exp(-(v - n) / 1.5));
};
Rig.lie = v => U.clamp((v - CC.float().n - 1.5) / 3, 0, 1);
Rig.drawV = (v, wave, halfBody) => U.lerp(Rig.visV(v + (wave || 0)), CC.float().n + halfBody, Rig.lie(v));
Rig.updateBaits = function (rig, dt) {
rig.baitAge += dt;
const k = Math.pow(Math.max(0, 1 - rig.baitAge / (rig.dissolve || CC.BAIT.dissolve)), 1.2);
for (let i = 0; i < 2; i++) {
if (rig.baitLeft[i] <= 0) { rig.baits[i] = 0; continue; }
rig.baits[i] = (rig.w0 || CC.BAIT.w) * k * rig.baitLeft[i];
}
};
Rig.rebait = function (rig, bowl, kind) {
rig.kind = kind || 'cau';
const xa = rig.kind === 'xa';
rig.dissolve = (bowl ? bowl.dissolve : CC.BAIT.dissolve) * (xa ? 0.35 : 1);
rig.w0 = CC.BAIT.w * (bowl ? bowl.dens : 1) * (xa ? 4 : 1);
rig.cloud = bowl ? bowl.cloud : 0.5;
rig.baitAge = 0;
rig.baitLeft = [1, 1];
rig.baits = [rig.w0, rig.w0];
};
Rig.hasBait = rig => rig.baits[0] + rig.baits[1] > CC.BAIT.w * 0.15;
Rig.step = function (dyn, vEq, dt, t) {
const w = 15, z = 0.55;
const acc = (vEq - dyn.v) * w * w - 2 * z * w * dyn.vel;
dyn.vel += acc * dt;
dyn.v += dyn.vel * dt;
const wind = CC.world.waveAmp ? CC.world.waveAmp() : CC.world.wind;
dyn.wave = Math.sin(t * 2.3) * 0.06 * wind + Math.sin(t * 5.1 + 1) * 0.03 * wind;
const n = CC.float().n;
const tiltT = dyn.v > n + 1.5 ? U.clamp((dyn.v - n - 1.5) / 3, 0, 1) * 1.45 : 0;
const tgt = tiltT + (dyn.tiltX || 0);
dyn.tilt += (tgt - dyn.tilt) * Math.min(1, dt * (tgt < dyn.tilt && dyn.tilt > 0.35 ? 3.2 : 8));
const dT = dyn.driftT != null ? dyn.driftT : 0;
dyn.drift = (dyn.drift || 0) + (dT - (dyn.drift || 0)) * Math.min(1, dt * (dyn.driftT != null ? 3 : 0.35));
};
})();
