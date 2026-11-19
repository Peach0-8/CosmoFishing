(function () {
const U = CC.U, R = CC.Render;
const D = CC.RigDraw = {};
const TIP = () => CC.skin('tip').colors;
const FK = 3;
function lineEnd(G, tip) {
if (G.state === 'fighting' && G.fight) return { x: R.X(G.fight.fx), y: R.Y(G.fight.fy) };
return floatPos(G, tip);
}
function floatPos(G, tip) {
if (G.state === 'hand' || G.state === 'charging' || G.state === 'setup' || G.state === 'landed') {
return { x: tip.x + Math.sin(G.t * 1.7) * 3, y: tip.y + 0.55 * R.s, hang: true };
}
if (G.state === 'flying') {
const f = G.fly, p = U.clamp(f.t / f.dur, 0, 1);
return { x: R.X(U.lerp(f.x0, f.x1, p)), y: R.Y(U.lerp(f.y0 - 0.55, 0, p) + Math.sin(p * Math.PI) * 1.1), hang: true };
}
const x = R.X(G.floatX + (G.dyn.drift || 0) * 2);
return { x, y: R.sy + R.wave(x, G.t), hang: false };
}
D.draw = function (ctx, G, light, t) {
const s = R.s, rod = CC.rod();
const base = { x: R.X(CC.ROD_BASE.x), y: R.Y(CC.ROD_BASE.y) };
const th = G.theta;
const len = rod.len * s;
const straightTip = { x: base.x + Math.cos(th) * len, y: base.y - Math.sin(th) * len };
const end = lineEnd(G, straightTip);
const a = -th;
let delta = Math.atan2(end.y - straightTip.y, end.x - straightTip.x) - a;
while (delta > Math.PI) delta -= 2 * Math.PI;
while (delta < -Math.PI) delta += 2 * Math.PI;
const soft = CC.rodSoft ? CC.rodSoft(rod) : 0;
const bend = U.clamp(G.bend || 0, 0, 1) * (0.85 + 0.15 * soft), curve = 2.2 - soft;
let x = base.x - Math.cos(a) * 0.25 * s, y = base.y - Math.sin(a) * 0.25 * s;
const N = 14, seg = (len + 0.25 * s) / N;
ctx.strokeStyle = U.rgb(U.mix(CC.skin('rod').color || rod.color || '#333', '#050505', 1 - light));
ctx.lineCap = 'round';
for (let i = 0; i < N; i++) {
const k = i / N;
const ang = a + delta * bend * Math.pow(k, curve);
const nx = x + Math.cos(ang) * seg, ny = y + Math.sin(ang) * seg;
ctx.lineWidth = Math.max(1, (0.045 - 0.04 * k) * s);
ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
x = nx; y = ny;
}
ctx.lineCap = 'butt';
const tip = { x, y };
D.tip = tip;
const lineCol = `rgba(${CC.skin('line').rgb},${0.35 + light * 0.4})`;
ctx.strokeStyle = lineCol; ctx.lineWidth = 1;
if (G.state === 'fighting' && G.fight) return drawFight(ctx, G, tip, light, t);
const fp = floatPos(G, tip);
const span = Math.hypot(fp.x - tip.x, fp.y - tip.y);
const ft = floatTopPt(G, fp);
ctx.beginPath(); ctx.moveTo(tip.x, tip.y);
ctx.quadraticCurveTo((tip.x + fp.x) / 2, Math.max(tip.y, fp.y) - span * 0.04 + (fp.hang ? 0 : span * 0.12), ft.x, ft.y);
ctx.stroke();
if (fp.hang) {
drawFloat(ctx, fp.x, fp.y, G.state === 'flying' ? 0.6 : 0, G, light, true);
ctx.beginPath(); ctx.moveTo(fp.x, fp.y + 12); ctx.lineTo(fp.x, fp.y + 0.35 * s); ctx.stroke();
drawHooks(ctx, fp.x, fp.y + 0.35 * s, G, 1);
return;
}
const sol = G.sol;
const vis = G.learn ? 0.95 : 0.16 + light * 0.08;
if (sol) {
const bottom = CC.bottomDepth(G.floatX) * 100;
const leadY = R.Y(-Math.min(sol.leadD, bottom) / 100);
const lowY = R.Y(-Math.min(sol.low, bottom) / 100);
const upY = R.Y(-Math.min(sol.up, bottom) / 100);
ctx.globalAlpha = vis;
ctx.strokeStyle = 'rgba(225,235,230,0.9)';
ctx.beginPath(); ctx.moveTo(fp.x, fp.y + 20); ctx.lineTo(fp.x, leadY); ctx.stroke();
ctx.fillStyle = '#9aa0a6';
ctx.fillRect(fp.x - 1.5, leadY - 0.08 * s, 3, 0.08 * s);
ctx.beginPath(); ctx.moveTo(fp.x, leadY); ctx.lineTo(fp.x + 4, lowY); ctx.moveTo(fp.x, leadY); ctx.lineTo(fp.x - 4, upY); ctx.stroke();
ctx.globalAlpha = 1;
drawHooks(ctx, fp.x, 0, G, vis, lowY, upY);
const left = G.rig.baits[0] + G.rig.baits[1];
if (G.rig.kind === 'xa' && left > 0.002) {
const k = Math.min(1, left / (G.rig.w0 * 2)), age = G.rig.baitAge;
ctx.fillStyle = `rgba(215,190,130,${0.25 + 0.35 * (G.learn ? 1 : 0.5)})`;
for (let i = 0; i < 22; i++) {
const r = (age * 6 + i * 3) % 40;
const ang = i * 2.4 + t * 0.2;
ctx.beginPath(); ctx.arc(fp.x + Math.cos(ang) * r * 0.9, lowY - Math.abs(Math.sin(ang)) * r * 0.7 * k - 2, 1.4, 0, 7); ctx.fill();
}
}
if (G.learn) {
ctx.font = '11px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'left';
ctx.fillText(sol.leadOnBottom ? 'ตะกั่วแตะพื้น!' : 'ตะกั่ว', fp.x + 8, leadY);
ctx.textAlign = 'right';
ctx.fillText('เบ็ดบน', fp.x - 8, upY);
ctx.textAlign = 'left';
ctx.fillText('เบ็ดล่าง', fp.x + 8, lowY + 4);
}
}
drawFloat(ctx, fp.x, fp.y, G.dyn.tilt, G, light, false);
}
function floatDims() {
const F = CC.float(), u = R.s * FK / 100;
return { F, u, tipLen: F.n * F.nl * u, bodyLen: 9 * u * (F.body / 1.2) ** 0.3, stemLen: 5 * u };
}
function drawV(G) {
const d = floatDims();
return CC.Rig.drawV(G.dyn.v, G.dyn.wave, d.bodyLen / 2 / (d.F.nl * d.u));
}
function floatTopPt(G, fp) {
if (fp.hang) return { x: fp.x, y: fp.y - 14 };
const d = floatDims(), a = G.dyn.tilt || 0;
const L = Math.max(0, drawV(G)) * d.F.nl * d.u;
return { x: fp.x - L * Math.sin(a), y: fp.y - L * Math.cos(a) };
}
function drawFloat(ctx, x, y, tilt, G, light, hang) {
const { F, u, tipLen, bodyLen, stemLen } = floatDims();
const v = hang ? F.n + 2 : drawV(G);
tilt = tilt || 0;
ctx.save();
ctx.translate(x, y);
ctx.rotate(-tilt);
const top = -v * F.nl * u;
for (let i = 0; i < F.n; i++) {
ctx.fillStyle = TIP()[i % TIP().length];
ctx.fillRect(-1.2 * F.tip, top + i * F.nl * u, 2.4 * F.tip, F.nl * u + 0.3);
}
const bTop = top + tipLen;
ctx.fillStyle = CC.skin('tip').body;
ctx.beginPath(); ctx.ellipse(0, bTop + bodyLen / 2, 2.6, bodyLen / 2, 0, 0, 7); ctx.fill();
ctx.fillStyle = '#c0392b'; ctx.fillRect(-2.6, bTop + bodyLen * 0.15, 5.2, 2);
ctx.strokeStyle = '#333'; ctx.lineWidth = 1.2;
ctx.beginPath(); ctx.moveTo(0, bTop + bodyLen); ctx.lineTo(0, bTop + bodyLen + stemLen); ctx.stroke();
ctx.restore();
if (!hang) {
const sub = Math.max(0, (tipLen + bodyLen + stemLen) - Math.max(0, -top));
ctx.fillStyle = U.rgb(R.waterTop(light), 0.7);
const sx = sub * Math.sin(tilt);
ctx.fillRect(x - 5 + Math.min(0, sx), R.sy + 1, 10 + Math.abs(sx), sub * Math.cos(tilt) + 4);
}
D.floatTipScreen = { x: x + top * Math.sin(tilt), y: y + top * Math.cos(tilt) };
}
function drawHooks(ctx, x, y, G, alpha, lowY, upY) {
const rig = G.rig;
const pts = lowY != null ? [[x - 4, upY, 0], [x + 4, lowY, 1]] : [[x - 3, y, 0], [x + 3, y + 0.04 * R.s, 1]];
ctx.globalAlpha = alpha;
for (const [hx, hy, i] of pts) {
ctx.strokeStyle = CC.skin('hook').color; ctx.lineWidth = 1.1;
ctx.beginPath(); ctx.moveTo(hx, hy - 4); ctx.lineTo(hx, hy + 1); ctx.arc(hx - 2, hy + 1, 2, 0, Math.PI); ctx.stroke();
if (rig && rig.baits[i] > 0.002) {
const r = 2 + 3 * Math.sqrt(rig.baits[i] / CC.BAIT.w);
ctx.fillStyle = CC.BAIT.color;
ctx.beginPath(); ctx.arc(hx - 1, hy + 1, r, 0, 7); ctx.fill();
}
}
ctx.globalAlpha = 1;
}
function drawFight(ctx, G, tip, light, t) {
const F = G.fight, s = R.s;
const fx = R.X(F.fx), fy = R.Y(F.fy);
const taut = U.clamp(F.stretch / 0.05 + 1, 0, 1);
const sag = (1 - taut) * 0.5 * s;
ctx.beginPath(); ctx.moveTo(tip.x, tip.y);
ctx.quadraticCurveTo((tip.x + fx) / 2, (tip.y + fy) / 2 + sag, fx, fy); ctx.stroke();
const setM = G.rig.set / 100;
const d = Math.hypot(tip.x - fx, tip.y - fy) || 1;
const k = Math.min(1, setM * s / d);
const px = fx + (tip.x - fx) * k, py = fy + (tip.y - fy) * k;
ctx.save(); ctx.translate(px, py); ctx.rotate(Math.atan2(tip.y - fy, tip.x - fx) + Math.PI / 2);
ctx.fillStyle = '#ff3b2f'; ctx.fillRect(-1.5, -12, 3, 9);
ctx.fillStyle = CC.skin('tip').body; ctx.fillRect(-2.5, -3, 5, 10);
ctx.restore();
const L = Math.max(18, CC.fishLength(F.sp, F.w) / 100 * s * 1.5);
const dir = F.vx >= 0 ? 1 : -1;
const inAir = F.fy > 0;
CC.drawFish(ctx, fx + dir * L * 0.42, fy, L, F.sp, dir, F.t * (F.state === 'run' ? 18 : 8), inAir ? 1 : 0.5 + light * 0.35);
if (!inAir && !G.learn) {
ctx.fillStyle = U.rgb(R.waterTop(light), 0.3);
ctx.fillRect(fx + dir * L * 0.42 - L * 0.6, fy - L * 0.35, L * 1.2, L * 0.7);
}
if (F.gulping) {
ctx.fillStyle = 'rgba(255,255,255,0.7)';
for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(fx + dir * L * 0.8 + Math.sin(t * 9 + i) * 4, R.sy - 3 - ((t * 30 + i * 7) % 12), 1.6, 0, 7); ctx.fill(); }
if (Math.random() < 0.1) R.ripple(fx + dir * L * 0.8, 0.5);
}
}
D.glows = function (ctx, G, light) {
if (light > 0.55 || !D.floatTipScreen || G.state === 'fighting') return;
const a = (0.55 - light) / 0.55, p = D.floatTipScreen;
const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 12);
const sk = CC.skin('tip'); g.addColorStop(0, `rgba(${sk.glow},${Math.min(1, 0.9 * a * (sk.bright || 1))})`); g.addColorStop(1, `rgba(${sk.glow},0)`);
ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, 7); ctx.fill();
};
let trBottom = null, trCls = null;
D.layoutChanged = () => { trBottom = null; };
window.addEventListener('resize', D.layoutChanged);
(function watch() {
const tr = document.getElementById('hud-tr');
if (!tr) { window.addEventListener('DOMContentLoaded', watch, { once: true }); return; }
if (window.ResizeObserver) new ResizeObserver(D.layoutChanged).observe(tr);
})();
function hudTrBottom() {
const cls = document.body ? document.body.className : '';
if (trBottom == null || cls !== trCls) {
const tr = document.getElementById('hud-tr');
trBottom = tr ? tr.getBoundingClientRect().bottom : 50; trCls = cls;
}
return trBottom;
}
D.zoom = function (ctx, G, light, t) {
const W = R.W, F = CC.float();
const y0 = hudTrBottom() + 10;
const fighting = G.state === 'fighting' && G.fight, sc = fighting ? U.clamp(W / 1280, 1, 1.5) : 1;
const w = 112 * sc, h = fighting ? Math.min(175 * sc, R.H * 0.42) : Math.min(320, R.H * 0.42), x0 = W - w - 14;
D.zoomRect = { x: x0, y: y0, w, h };
ctx.save();
ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0, y0, w, h, 10) : ctx.rect(x0, y0, w, h);
ctx.clip();
const wl = y0 + h * 0.62;
const sky = CC.world.sky();
ctx.fillStyle = U.rgb(sky.bot); ctx.fillRect(x0, y0, w, wl - y0);
ctx.fillStyle = U.rgb(R.waterTop(light)); ctx.fillRect(x0, wl, w, y0 + h - wl);
const inWater = G.state === 'waiting' || G.state === 'sinking';
const np = Math.min(17, (h * 0.55) / (F.n + 1));
const cx = x0 + w * 0.58 + (inWater ? U.clamp((G.dyn.drift || 0) * 220, -30, 30) : 0);
if (inWater) {
const v = CC.Rig.drawV(G.dyn.v, G.dyn.wave, 1.5), lie = CC.Rig.lie(G.dyn.v);
const top = wl - v * np;
const fit = Math.min(1, (w - 16) / ((F.n + 4.2) * np));
const sc = U.lerp(1, fit, lie), px = U.lerp(cx, x0 + 8 + Math.max(0, v) * np * fit, lie);
const ang = -G.dyn.tilt * U.lerp(0.8, 1, lie);
ctx.save();
ctx.translate(px, wl); ctx.rotate(ang); ctx.scale(sc, sc); ctx.translate(-cx, -wl);
for (let i = 0; i < F.n; i++) {
const yy = top + i * np;
ctx.fillStyle = TIP()[i % TIP().length];
ctx.fillRect(cx - 3 * F.tip, yy, 6 * F.tip, np - 1);
if (lie < 0.4 && yy < wl - 2 && yy > y0) {
ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '10px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'right';
ctx.fillText(String(i + 1), cx - 9, yy + np * 0.7);
}
}
ctx.fillStyle = CC.skin('tip').body; ctx.fillRect(cx - 7, top + F.n * np, 14, np * 3);
ctx.restore();
ctx.fillStyle = U.rgb(R.waterTop(light), 0.72); ctx.fillRect(x0, wl + 1, w, y0 + h - wl);
ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5;
ctx.beginPath();
for (let xx = x0; xx <= x0 + w; xx += 4) { const yy = wl + Math.sin(xx * 0.15 + t * 3) * 0.8 * CC.world.wind * 0.3; xx === x0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy); }
ctx.stroke();
if (light < 0.55) {
const a = (0.55 - light) / 0.55;
const d = sc * (top + 4 - wl), gx = px - d * Math.sin(ang), gy = wl + d * Math.cos(ang);
const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 18);
const sk = CC.skin('tip'); g.addColorStop(0, `rgba(${sk.glow},${Math.min(1, 0.8 * a * (sk.bright || 1))})`); g.addColorStop(1, `rgba(${sk.glow},0)`);
ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx, gy, 18, 0, 7); ctx.fill();
}
} else if (G.state === 'fighting' && G.fight) {
drawCompass(ctx, G, x0, y0, w, h, light, t);
} else {
ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '12px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'center';
ctx.fillText('ทุ่นอยู่ในมือ', x0 + w / 2, wl - 10);
}
ctx.restore();
const hold = G.state === 'fighting' && CC.Game && CC.Game.holding && CC.Game.holding();
ctx.strokeStyle = hold ? 'rgba(242,193,78,0.9)' : 'rgba(255,255,255,0.25)'; ctx.lineWidth = hold ? 2 : 1;
ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0, y0, w, h, 10) : ctx.rect(x0, y0, w, h); ctx.stroke();
ctx.fillStyle = 'rgba(10,16,20,0.75)'; ctx.fillRect(x0, y0 + h + 4, w, 20);
ctx.fillStyle = '#fff'; ctx.font = '12px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'center';
ctx.fillText(inWater ? 'ทุ่น: ' + CC.Rig.fmt(G.dyn.v) : G.state === 'fighting' ? 'อัดปลา' : 'ซูมดูทุ่น', x0 + w / 2, y0 + h + 18);
};
function drawCompass(ctx, G, x0, y0, w, h, light, t) {
const F = G.fight;
ctx.fillStyle = U.rgb(R.waterTop(light)); ctx.fillRect(x0, y0, w, h);
const bankH = 14;
ctx.fillStyle = 'rgba(128,116,92,0.95)'; ctx.fillRect(x0, y0 + h - bankH, w, bankH);
const lane = F.lane || F.laneW || 2.4;
const maxX = Math.max(6, F.fx + 1.5), span = lane * 1.45;
const sx = lat => x0 + w / 2 + U.clamp(lat / span, -1.1, 1.1) * (w / 2);
const sy = d => y0 + h - bankH - (d + 0.35) / (maxX + 0.35) * (h - bankH - 10);
for (const s of [-1, 1]) {
const warn = F.laneWarn === s;
ctx.strokeStyle = warn ? (Math.floor(t * 6) % 2 ? '#ff4a3a' : '#ffe0d8') : 'rgba(255,130,110,0.55)';
ctx.lineWidth = warn ? 3 : 1.2;
ctx.setLineDash([4, 4]);
ctx.beginPath(); ctx.moveTo(sx(s * lane), y0 + 16); ctx.lineTo(sx(s * lane), y0 + h - bankH); ctx.stroke();
}
ctx.setLineDash([]);
ctx.font = '10px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
ctx.textAlign = 'left'; ctx.fillText('หลุมข้าง', x0 + 4, y0 + 12);
ctx.textAlign = 'right'; ctx.fillText('หลุมข้าง', x0 + w - 4, y0 + 12);
const ax = sx(0), ay = y0 + h - bankH + 5;
const reach = Math.cos(G.theta) * CC.rod().len, phi = G.phi || 0;
const tx = sx(Math.sin(phi) * reach), ty = sy(CC.ROD_BASE.x + Math.cos(phi) * reach);
const strain = F.Ts / CC.line().leader;
ctx.strokeStyle = strain > 1 ? '#ff4a3a' : strain > 0.85 ? '#ef8a5a' : '#f2d58a'; ctx.lineWidth = 3;
ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(tx, ty); ctx.stroke();
const fxs = sx(F.lat), fys = sy(F.fx);
ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 1;
ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(fxs, fys); ctx.stroke();
ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.arc(ax, ay, 5, 0, 7); ctx.fill();
ctx.fillStyle = '#2a2010'; ctx.font = 'bold 10px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'left';
ctx.fillText(G.who || 'คุณ', ax + 8, y0 + h - 3);
if (F.laneWarn && Math.floor(t * 4) % 2) {
const d = -F.laneWarn, cy = y0 + h - bankH - 14, cx = x0 + w / 2 + d * w * 0.22;
ctx.fillStyle = '#ffd65a'; ctx.strokeStyle = '#1a1206'; ctx.lineWidth = 3; ctx.font = 'bold 13px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'center';
const s = d < 0 ? '◀ ดึง' : 'ดึง ▶';
ctx.strokeText(s, cx, cy); ctx.fillText(s, cx, cy);
}
if (F.warn) {
const k = (t * 2.5) % 1;
ctx.strokeStyle = `rgba(255,214,90,${1 - k})`; ctx.lineWidth = 2;
ctx.beginPath(); ctx.arc(fxs, fys, 5 + k * 12, 0, 7); ctx.stroke();
}
const vx = F.latV || 0, vy = F.vx || 0, v = Math.hypot(vx, vy);
const ang = v > 0.08 ? Math.atan2(-vy, vx) : -Math.PI / 2;
ctx.save(); ctx.translate(fxs, fys); ctx.rotate(ang);
ctx.fillStyle = F.landable ? '#7fdc8a' : '#dfe8e4';
ctx.beginPath(); ctx.ellipse(0, 0, 7, 3.6, 0, 0, 7); ctx.fill();
ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-11, -3.5); ctx.lineTo(-11, 3.5); ctx.closePath(); ctx.fill();
if (v > 0.25) {
const L = Math.min(26, 8 + v * 9);
ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.6;
ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(9 + L, 0); ctx.lineTo(9 + L - 4, -3); ctx.moveTo(9 + L, 0); ctx.lineTo(9 + L - 4, 3); ctx.stroke();
}
ctx.restore();
if (G.turnFlash > 0) {
ctx.fillStyle = 'rgba(160,240,170,0.95)'; ctx.font = 'bold 12px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'center';
ctx.fillText('งัดหัวปลาได้!', x0 + w / 2, y0 + 28);
}
}
D.holdRing = function (ctx, G) {
const inp = CC.Game && CC.Game.input;
if (G.state !== 'fighting' || !inp || !inp.holdPtr) return;
const x = inp.px, y = inp.py, r = UI_TOUCH() ? 32 : 22, slide = CC.Game.sliding && CC.Game.sliding();
const F = G.fight, over = F && (F.overAcc > 0.04 || F.Ts > CC.line().leader);
const tired = F && F.arm < 0.35 && CC.Game.holding();
const col = over ? '255,74,58' : slide ? '140,200,255' : tired ? '255,150,60' : '242,193,78';
ctx.strokeStyle = `rgba(${col},${over && Math.floor(G.t * 8) % 2 ? 0.45 : 0.9})`; ctx.lineWidth = 3;
ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
ctx.fillStyle = `rgba(${col},0.07)`; ctx.fill();
ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = 'bold 11px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'center';
ctx.fillText(over ? 'ปล่อย!' : slide ? 'ประคอง' : tired ? 'ล้าแล้ว' : CC.Game.holding() ? 'งัด' : '…', x, y + 4);
ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
for (const s of [-1, 1]) {
const ex = x + s * (r + 16);
ctx.beginPath(); ctx.moveTo(x + s * (r + 5), y); ctx.lineTo(ex, y); ctx.lineTo(ex - s * 5, y - 4); ctx.moveTo(ex, y); ctx.lineTo(ex - s * 5, y + 4); ctx.stroke();
}
};
const UI_TOUCH = () => !!(CC.UI && CC.UI.touch);
D.overlay = function (ctx, G) {
const s = R.s;
if (G.state === 'charging') {
const x = R.X(-1.3), y = R.Y(2.6), h = 1.4 * s, w = 10;
ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
ctx.fillStyle = 'rgba(95,196,106,0.45)';
ctx.fillRect(x, y + h * (1 - 0.78), w, h * 0.12);
ctx.fillStyle = '#f2c14e'; ctx.fillRect(x, y + h * (1 - G.power), w, h * G.power);
ctx.fillStyle = '#fff'; ctx.font = '12px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('แรงเหวี่ยง', x + w / 2, y - 6);
}
if (G.state === 'fighting' && G.fight) {
D.holdRing(ctx, G);
const cx = R.X(CC.ROD_BASE.x), cy = R.Y(CC.ROD_BASE.y), r = 0.9 * s;
const arc = (a0, a1, col) => { ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, r, -a1 * Math.PI / 180, -a0 * Math.PI / 180); ctx.stroke(); };
arc(0, 25, 'rgba(239,107,74,0.35)'); arc(25, 35, 'rgba(242,193,78,0.35)'); arc(35, 80, 'rgba(95,196,106,0.4)');
arc(80, 95, 'rgba(242,193,78,0.35)'); arc(95, 120, 'rgba(239,107,74,0.45)');
const th = G.theta;
ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
ctx.beginPath(); ctx.moveTo(cx + Math.cos(th) * (r - 8), cy - Math.sin(th) * (r - 8)); ctx.lineTo(cx + Math.cos(th) * (r + 8), cy - Math.sin(th) * (r + 8)); ctx.stroke();
}
if (G.state === 'waiting' && G.spotX != null) {
const dx = G.floatX - G.spotX;
ctx.font = '12px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'center';
ctx.fillStyle = Math.abs(dx) < 0.3 ? 'rgba(160,240,170,0.9)' : 'rgba(255,220,150,0.9)';
ctx.fillText(Math.abs(dx) < 0.3 ? 'ตรงจุดอ่อย' : `หลุดจุด ${dx > 0 ? '+' : ''}${dx.toFixed(1)} ม.`, R.X(G.floatX), R.sy - 0.55 * s);
}
};
})();
