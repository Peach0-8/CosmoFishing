(function () {
const U = CC.U;
const RATIO = { carp: 0.36, perch: 0.42, long: 0.25, bighead: 0.3, disc: 0.62, cat: 0.2, snake: 0.17,
grass: 0.24, pacu: 0.46, rohu: 0.3 };
CC.FISH_RATIO = RATIO;
CC.drawFish = function (ctx, x, y, L, sp, dir, t, alpha, silhouette) {
const H = L * (RATIO[sp.shape] || 0.33);
const nose = L * 0.5, tb = -L * 0.32;
const flat = sp.shape === 'cat' || sp.shape === 'snake';
ctx.save();
ctx.translate(x, y);
ctx.scale(dir, 1);
ctx.globalAlpha = alpha == null ? 1 : alpha;
const col = sp.col;
const sil = silhouette ? silhouette : null;
const detail = !sil && L > 26;
const wig = Math.sin(t || 0) * 0.28;
ctx.save();
ctx.translate(tb, 0);
ctx.rotate(wig);
ctx.beginPath();
if (flat) {
ctx.moveTo(0, -H * 0.35);
ctx.quadraticCurveTo(-L * 0.24, -H * 0.5, -L * 0.2, 0);
ctx.quadraticCurveTo(-L * 0.24, H * 0.5, 0, H * 0.35);
} else {
const sp2 = sp.shape === 'disc' ? 0.5 : sp.shape === 'pacu' ? 0.4 : sp.shape === 'grass' ? 0.55 : sp.shape === 'rohu' ? 0.5 : 0.42;
const notch = -L * (0.1 - 0.07 * (sp.fork || 0));
ctx.moveTo(L * 0.02, -H * 0.12);
ctx.quadraticCurveTo(-L * 0.08, -H * 0.2, -L * 0.17, -H * sp2);
ctx.quadraticCurveTo(notch, 0, -L * 0.17, H * sp2);
ctx.quadraticCurveTo(-L * 0.08, H * 0.2, L * 0.02, H * 0.12);
}
ctx.closePath();
ctx.fillStyle = sil || col.fin;
ctx.fill();
ctx.restore();
ctx.beginPath();
if (flat) {
ctx.moveTo(L * 0.2, -H * 0.42);
ctx.quadraticCurveTo(0, -H * 0.85, tb + L * 0.02, -H * 0.38);
ctx.lineTo(tb, -H * 0.2);
} else if (sp.shape === 'pacu') {
ctx.moveTo(L * 0.05, -H * 0.47);
ctx.quadraticCurveTo(L * 0.0, -H * 0.66, -L * 0.04, -H * 0.72);
ctx.lineTo(-L * 0.12, -H * 0.4);
} else {
ctx.moveTo(L * 0.14, -H * 0.46);
ctx.quadraticCurveTo(L * 0.06, -H * 0.62, L * 0.02, -H * (sp.shape === 'disc' || sp.shape === 'pacu' ? 0.66 : sp.shape === 'rohu' ? 0.85 : 0.74));
ctx.lineTo(sp.shape === 'grass' ? -L * 0.04 : -L * 0.2, -H * 0.24);
}
ctx.closePath();
ctx.fillStyle = sil || col.fin;
ctx.fill();
ctx.beginPath();
if (flat) {
ctx.moveTo(L * 0.05, H * 0.4);
ctx.quadraticCurveTo(-L * 0.1, H * 0.75, tb + L * 0.02, H * 0.3);
} else {
const pk = sp.shape === 'pacu' ? 0.56 : 0.68;
ctx.moveTo(-L * 0.08, H * 0.38);
ctx.lineTo(-L * 0.16, H * pk);
ctx.lineTo(-L * 0.22, H * 0.28);
ctx.moveTo(L * 0.14, H * 0.42);
ctx.lineTo(L * 0.06, H * (pk - 0.02));
ctx.lineTo(L * 0.02, H * 0.42);
}
ctx.closePath();
ctx.fill();
if (sp.shape === 'pacu') {
ctx.beginPath();
ctx.moveTo(-L * 0.01, H * 0.4);
ctx.quadraticCurveTo(-L * 0.16, H * 0.6, -L * 0.27, H * 0.24);
ctx.closePath(); ctx.fill();
ctx.beginPath();
ctx.moveTo(-L * 0.19, -H * 0.3);
ctx.quadraticCurveTo(-L * 0.23, -H * 0.52, -L * 0.27, -H * 0.2);
ctx.closePath(); ctx.fill();
}
ctx.beginPath();
ctx.moveTo(nose, flat ? H * 0.05 : 0);
if (flat) {
ctx.bezierCurveTo(nose, -H * 0.5, L * 0.25, -H * 0.55, 0, -H * 0.5);
ctx.bezierCurveTo(-L * 0.15, -H * 0.45, tb, -H * 0.35, tb, -H * 0.2);
ctx.lineTo(tb, H * 0.2);
ctx.bezierCurveTo(tb, H * 0.35, -L * 0.15, H * 0.5, 0, H * 0.52);
ctx.bezierCurveTo(L * 0.25, H * 0.55, nose, H * 0.45, nose, H * 0.05);
} else {
ctx.bezierCurveTo(nose * 0.92, -H * 0.58, L * 0.04, -H * 0.66, tb, -H * 0.14);
ctx.lineTo(tb, H * 0.14);
ctx.bezierCurveTo(L * 0.04, H * 0.66, nose * 0.92, H * 0.52, nose, 0);
}
ctx.closePath();
if (sil) {
ctx.fillStyle = sil;
} else {
const g = ctx.createLinearGradient(0, -H * 0.55, 0, H * 0.55);
g.addColorStop(0, col.back);
g.addColorStop(0.45, col.body);
g.addColorStop(1, col.belly);
ctx.fillStyle = g;
}
ctx.fill();
if (!sil && L > 40) {
ctx.strokeStyle = 'rgba(0,0,0,0.25)';
ctx.lineWidth = Math.max(1, L * 0.005);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(nose - L * 0.22, -H * 0.08);
ctx.quadraticCurveTo(0, -H * 0.02, tb, 0);
ctx.strokeStyle = 'rgba(0,0,0,0.15)';
ctx.stroke();
}
if (detail) {
ctx.save();
if (!flat) {
ctx.beginPath();
ctx.moveTo(nose, 0);
ctx.bezierCurveTo(nose * 0.92, -H * 0.58, L * 0.04, -H * 0.66, tb, -H * 0.14);
ctx.lineTo(tb, H * 0.14);
ctx.bezierCurveTo(L * 0.04, H * 0.66, nose * 0.92, H * 0.52, nose, 0);
ctx.closePath();
}
ctx.clip();
ctx.globalAlpha *= 0.35;
ctx.strokeStyle = col.back;
ctx.fillStyle = col.back;
if (sp.stripes) {
ctx.lineWidth = L * 0.025;
for (let i = 0; i < 7; i++) {
const sx = L * 0.25 - i * L * 0.085;
ctx.beginPath(); ctx.moveTo(sx, -H * 0.6); ctx.lineTo(sx - L * 0.02, H * 0.4); ctx.stroke();
}
}
if (sp.scales) {
ctx.lineWidth = Math.max(0.6, L * 0.006);
const s = L * 0.055;
for (let gx = L * 0.28; gx > tb; gx -= s) {
for (let gy = -H * 0.45; gy < H * 0.3; gy += s * 0.8) {
ctx.beginPath(); ctx.arc(gx, gy + ((gx / s) % 2 ? s * 0.4 : 0), s * 0.5, -1.2, 1.2); ctx.stroke();
}
}
}
if (sp.spots) {
for (let i = 0; i < 14; i++) {
const px = L * 0.3 - ((i * 37) % 60) / 60 * L * 0.6, py = -H * 0.35 + ((i * 53) % 40) / 40 * H * 0.5;
ctx.beginPath(); ctx.arc(px, py, L * 0.018, 0, 6.3); ctx.fill();
}
}
if (sp.blotches) {
ctx.globalAlpha *= 1.6;
for (let i = 0; i < 6; i++) {
const px = L * 0.22 - i * L * 0.1;
ctx.beginPath(); ctx.ellipse(px, -H * 0.05 + (i % 2) * H * 0.1, L * 0.035, H * 0.28, 0.4, 0, 6.3); ctx.fill();
}
}
ctx.restore();
ctx.strokeStyle = 'rgba(0,0,0,0.25)';
ctx.lineWidth = Math.max(1, L * 0.008);
ctx.beginPath(); ctx.arc(nose - L * 0.22, 0, H * 0.4, -1.1, 1.1); ctx.stroke();
}
if (detail && (sp.net || sp.redBelly || sp.rows)) {
ctx.save();
ctx.beginPath();
ctx.moveTo(nose, 0);
ctx.bezierCurveTo(nose * 0.92, -H * 0.58, L * 0.04, -H * 0.66, tb, -H * 0.14);
ctx.lineTo(tb, H * 0.14);
ctx.bezierCurveTo(L * 0.04, H * 0.66, nose * 0.92, H * 0.52, nose, 0);
ctx.closePath();
ctx.clip();
if (sp.redBelly) {
const g = ctx.createLinearGradient(0, H * 0.02, 0, H * 0.5);
g.addColorStop(0, 'rgba(214,92,62,0)');
g.addColorStop(1, 'rgba(214,92,62,0.75)');
ctx.fillStyle = g;
ctx.fillRect(-L * 0.5, 0, L, H * 0.6);
}
if (sp.net) {
ctx.strokeStyle = col.back; ctx.globalAlpha *= 0.5;
ctx.lineWidth = Math.max(0.7, L * 0.007);
const s = L * 0.07;
for (let gx = L * 0.3, k = 0; gx > tb; gx -= s * 0.8, k++) {
for (let gy = -H * 0.5; gy < H * 0.45; gy += s * 0.75) {
ctx.beginPath(); ctx.arc(gx, gy + (k % 2 ? s * 0.37 : 0), s * 0.5, -1.3, 1.3); ctx.stroke();
}
}
}
if (sp.rows) {
ctx.fillStyle = col.fin; ctx.globalAlpha *= 0.4;
const st = L * 0.045;
for (let r = -2; r <= 2; r++) {
for (let x = L * 0.28 - (r % 2 ? st / 2 : 0); x > tb + L * 0.02; x -= st) {
ctx.beginPath(); ctx.arc(x, r * H * 0.13, L * 0.0065, 0, 6.3); ctx.fill();
}
}
}
ctx.restore();
}
if (!sil || L > 30) {
const er = Math.max(1.2, L * 0.026);
const ex = nose - L * (flat ? 0.12 : 0.1), ey = -H * (flat ? 0.18 : 0.12);
ctx.fillStyle = sil ? 'rgba(200,220,210,0.35)' : '#f2efe0';
ctx.beginPath(); ctx.arc(ex, ey, er, 0, 6.3); ctx.fill();
if (!sil) {
ctx.fillStyle = '#111';
ctx.beginPath(); ctx.arc(ex + er * 0.15, ey, er * 0.6, 0, 6.3); ctx.fill();
}
}
if ((sp.whiskers || sp.barbels) && L > 14) {
ctx.strokeStyle = sil || col.back;
ctx.lineWidth = Math.max(0.8, L * 0.007);
const wl = sp.longWhiskers ? L * 0.4 : sp.whiskers ? L * 0.22 : L * 0.06;
const wv = Math.sin((t || 0) * 0.5) * 0.08;
ctx.beginPath();
ctx.moveTo(nose - L * 0.01, H * 0.08);
ctx.quadraticCurveTo(nose + wl * 0.5, H * 0.15, nose + wl * 0.7, H * (0.4 + wv));
if (sp.whiskers) {
ctx.moveTo(nose - L * 0.02, -H * 0.05);
ctx.quadraticCurveTo(nose + wl * 0.6, -H * 0.25, nose + wl, H * (0.1 + wv));
ctx.moveTo(nose - L * 0.04, H * 0.15);
ctx.quadraticCurveTo(nose + wl * 0.2, H * 0.5, nose + wl * 0.35, H * 0.7);
}
ctx.stroke();
}
ctx.restore();
};
})();
