(function () {
const U = CC.U, UI = CC.UI, PN = UI.PANELS, NK = CC.NhatKy;
if (!NK) return;
const KC = CC.KhoeCa = { W: 1080, H: 1350, WEB: 'ชิงหลิว บ่อตกปลา', GAME: 'ชิงหลิว บ่อตกปลา' };
const FONT = '"Sarabun", "Tahoma", "Segoe UI", system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif';
const RATIO = { carp: 0.36, perch: 0.42, long: 0.25, bighead: 0.3, disc: 0.62, cat: 0.2, snake: 0.17 };
const $ = id => document.getElementById(id);
const font = (g, px, wt, it) => { g.font = `${it ? 'italic ' : ''}${wt || 400} ${px}px ${FONT}`; };
function fit(g, s, x, y, maxW, px, min, wt, it) {
s = String(s == null ? '' : s);
let p = px;
font(g, p, wt, it);
while (p > min && g.measureText(s).width > maxW) { p -= 2; font(g, p, wt, it); }
if (g.measureText(s).width > maxW) {
while (s.length > 1 && g.measureText(s + '…').width > maxW) s = s.slice(0, -1);
s = s.replace(/[\s·,–-]+$/, '') + '…';
}
g.fillText(s, x, y);
return g.measureText(s).width;
}
function rr(g, x, y, w, h, r) {
g.beginPath();
g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
g.closePath();
}
const rgba = (hex, a) => U.rgb(U.hex(hex), a);
const seed = n => { let s = (Math.abs(Math.round(n)) % 2147483646) + 1; return () => (s = (s * 48271) % 2147483647) / 2147483647; };
const CANH = {
ngay: { sky: ['#2f7fd0', '#bfe3f7'], water: ['#2c8f96', '#0d3a48'], bank: '#2c5a3c', orb: '#fff6cf', cloud: '#ffffff', glow: [255, 255, 255, 0.46] },
som: { sky: ['#3a4380', '#f7bd8c'], water: ['#6b7f95', '#13283a'], bank: '#24364a', orb: '#ffe2ae', cloud: '#ffeadb', glow: [255, 236, 205, 0.4] },
chieu: { sky: ['#3c3b7a', '#f08d60'], water: ['#75607c', '#171f36'], bank: '#2a2a48', orb: '#ffbe85', cloud: '#ffd8c4', glow: [255, 224, 196, 0.38] },
dem: { sky: ['#040917', '#1c2c4e'], water: ['#12263f', '#050b16'], bank: '#0a1424', orb: '#eef3ff', cloud: '#7f93b8', glow: [170, 200, 255, 0.42] }
};
KC.canh = e => { const h = ((((+e.min || 0) / 60) % 24) + 24) % 24; return h < 4.75 || h >= 19.25 ? 'dem' : h < 7 ? 'som' : h < 16.5 ? 'ngay' : 'chieu'; };
function phao(g, x, y) {
g.strokeStyle = '#fff'; g.lineWidth = 3; g.lineCap = 'round';
g.beginPath(); g.moveTo(x, y - 38); g.lineTo(x, y + 38); g.stroke();
['#ef4b3a', '#f2c14e', '#5fc46a', '#ef4b3a'].forEach((c, i) => { g.fillStyle = c; g.fillRect(x - 3.5, y - 38 + i * 7, 7, 6); });
g.fillStyle = '#f2c14e'; g.beginPath(); g.ellipse(x, y + 12, 9, 20, 0, 0, 7); g.fill();
g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(x + 3, y + 12, 4, 17, 0, 0, 7); g.fill();
g.lineCap = 'butt';
}
function ghim(g, x, y) {
g.fillStyle = '#f2c14e';
g.beginPath(); g.arc(x, y - 6, 11, Math.PI * 0.85, Math.PI * 0.15); g.lineTo(x, y + 14); g.closePath(); g.fill();
g.fillStyle = '#0a141b'; g.beginPath(); g.arc(x, y - 6, 4.2, 0, 7); g.fill();
}
function nguoi(g, x, y) {
g.fillStyle = '#f2c14e';
g.beginPath(); g.arc(x, y - 10, 7.5, 0, 7); g.fill();
g.beginPath(); g.ellipse(x, y + 13, 12.5, 12, 0, Math.PI, Math.PI * 2); g.fill();
}
function huyHieu(g, x, y, r, l1, l2) {
g.save();
g.translate(x, y); g.rotate(-0.2);
g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
g.beginPath();
for (let i = 0; i < 44; i++) { const a = i / 44 * Math.PI * 2, q = i % 2 ? r * 0.88 : r; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); }
g.closePath();
const gr = g.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.55, '#f6c53c'); gr.addColorStop(1, '#d9930f');
g.fillStyle = gr; g.fill();
g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0;
g.strokeStyle = 'rgba(110,62,0,0.55)'; g.lineWidth = 3;
g.beginPath(); g.arc(0, 0, r * 0.76, 0, 7); g.stroke();
g.fillStyle = '#5a3100'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
g.beginPath();
for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.075 : r * 0.17; g.lineTo(Math.cos(a) * q, -r * 0.44 + Math.sin(a) * q); }
g.closePath(); g.fill();
fit(g, l1, 0, r * 0.08, r * 1.3, r * 0.36, r * 0.2, 800);
fit(g, l2, 0, r * 0.42, r * 1.1, r * 0.31, r * 0.2, 800);
g.restore();
}
KC.ve = (e, opt) => {
opt = opt || {};
const W = KC.W, H = KC.H, HZ = 590, CX = W / 2, FY = 470;
const cv = document.createElement('canvas');
cv.width = W; cv.height = H;
const g = cv.getContext('2d');
const sp = e.sp || NK.loaiCa(e.id), buoi = KC.canh(e), T = CANH[buoi];
const wi = CC.WEATHERS[e.weather] || { cloud: 0.3, rain: 0 };
const cl = U.clamp(+wi.cloud || 0, 0, 1), gk = cl * 0.6, oa = 1 - cl * 0.65;
const rnd = seed(Math.round((+e.w || 0) * 1000) * 7 + (+e.min || 0) + 13);
const grey = (hex, k) => { const c = U.hex(hex), m = (c[0] + c[1] + c[2]) / 3 * 0.92; return U.rgb(c.map(v => U.lerp(v, m, k))); };
g.textBaseline = 'alphabetic';
let gr = g.createLinearGradient(0, 0, 0, HZ);
gr.addColorStop(0, grey(T.sky[0], gk)); gr.addColorStop(1, grey(T.sky[1], gk));
g.fillStyle = gr; g.fillRect(0, 0, W, HZ);
if (buoi === 'dem') {
g.fillStyle = '#fff';
for (let i = 0; i < 90; i++) {
const x = rnd() * W, y = rnd() * (HZ - 70), r = 0.8 + rnd() * 1.8;
g.globalAlpha = (0.25 + rnd() * 0.6) * (1 - cl * 0.8);
g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
}
g.globalAlpha = 1;
}
const orb = { ngay: [200, 262, 62], som: [215, HZ - 16, 76], chieu: [862, HZ - 12, 80], dem: [188, 258, 52] }[buoi];
let rg = g.createRadialGradient(orb[0], orb[1], orb[2] * 0.4, orb[0], orb[1], orb[2] * 4.2);
rg.addColorStop(0, rgba(T.orb, 0.55 * oa)); rg.addColorStop(1, rgba(T.orb, 0));
g.fillStyle = rg; g.fillRect(0, 0, W, HZ);
g.globalAlpha = 0.35 + 0.65 * oa; g.fillStyle = T.orb;
g.beginPath(); g.arc(orb[0], orb[1], orb[2], 0, 7); g.fill();
if (buoi === 'dem') {
g.fillStyle = 'rgba(120,140,180,0.35)';
[[-14, -10, 11], [16, 8, 8], [-4, 20, 6]].forEach(c => { g.beginPath(); g.arc(orb[0] + c[0], orb[1] + c[1], c[2], 0, 7); g.fill(); });
}
g.globalAlpha = 1;
for (let i = 0, n = 1 + Math.round(cl * 7); i < n; i++) {
const x = rnd() * W, y = 150 + rnd() * 300, s = 60 + rnd() * 70;
g.fillStyle = rgba(T.cloud, 0.1 + 0.16 * cl);
for (let j = 0; j < 5; j++) {
g.beginPath(); g.ellipse(x + (j - 2) * s * 0.62, y + (((j * 7) % 3) - 1) * s * 0.14, s * (0.75 + ((j * 5) % 3) * 0.14), s * 0.42, 0, 0, 7); g.fill();
}
}
const rs = rnd() * 6;
g.fillStyle = grey(T.bank, gk * 0.5);
g.beginPath(); g.moveTo(0, HZ + 2);
for (let x = 0; x <= W + 18; x += 18) g.lineTo(x, HZ - 26 - 14 * Math.sin(x * 0.021 + 1) - 9 * Math.sin(x * 0.067 + rs) - 5 * Math.sin(x * 0.19));
g.lineTo(W, HZ + 2); g.closePath(); g.fill();
gr = g.createLinearGradient(0, HZ, 0, H);
gr.addColorStop(0, grey(T.water[0], gk)); gr.addColorStop(0.5, grey(T.water[1], gk * 0.6)); gr.addColorStop(1, grey(T.water[1], gk * 0.6));
g.fillStyle = gr; g.fillRect(0, HZ, W, H - HZ);
g.fillStyle = rgba(T.orb, 0.1 * oa + 0.03);
for (let i = 0; i < 9; i++) { const w = orb[2] * (2.2 - i * 0.12) * (0.7 + rnd() * 0.6); g.fillRect(orb[0] - w / 2 + (rnd() - 0.5) * 30, HZ + 14 + i * 22, w, 4); }
g.strokeStyle = 'rgba(255,255,255,0.1)'; g.lineWidth = 2;
for (let i = 0; i < 16; i++) { const y = HZ + 20 + rnd() * 190, x = rnd() * W, w = 40 + rnd() * 120; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.stroke(); }
if (wi.rain > 0) {
g.strokeStyle = `rgba(220,235,255,${0.16 + 0.2 * wi.rain})`; g.lineWidth = 2;
g.beginPath();
for (let i = 0, n = 60 + wi.rain * 160; i < n; i++) { const x = rnd() * (W + 100), y = rnd() * 770; g.moveTo(x, y); g.lineTo(x - 9, y + 30); }
g.stroke();
}
rg = g.createRadialGradient(CX, FY, 30, CX, FY, 500);
rg.addColorStop(0, `rgba(${T.glow[0]},${T.glow[1]},${T.glow[2]},${T.glow[3]})`); rg.addColorStop(1, `rgba(${T.glow[0]},${T.glow[1]},${T.glow[2]},0)`);
g.fillStyle = rg; g.fillRect(0, 0, W, 790);
g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 3;
for (let i = 0; i < 3; i++) { g.globalAlpha = 1 - i * 0.3; g.beginPath(); g.ellipse(CX, 742, 190 + i * 110, 16 + i * 9, 0, 0, 7); g.stroke(); }
g.globalAlpha = 1;
const len = Math.max(1, +e.len || CC.fishLength(sp, e.w));
const k = U.clamp((Math.log(len) - Math.log(6)) / (Math.log(130) - Math.log(6)), 0, 1);
const ratio = RATIO[sp.shape] || 0.33;
const L = Math.min(400 + 500 * k, 400 / (1.45 * ratio));
const tmp = document.createElement('canvas');
tmp.width = W; tmp.height = 800;
CC.drawFish(tmp.getContext('2d'), CX, FY, L, sp, -1, 0.6, 1, '#000');
g.globalAlpha = 0.22; g.drawImage(tmp, 12, 20); g.globalAlpha = 1;
CC.drawFish(g, CX, FY, L, sp, -1, 0.6, 1, null);
const ry = FY + L * ratio * 0.72 + 30, rx0 = CX - L * 0.5, rx1 = CX + L * 0.49, pc = (rx1 - rx0) / len;
g.fillStyle = 'rgba(0,0,0,0.25)'; rr(g, rx0 - 10, ry + 5, rx1 - rx0 + 28, 50, 8); g.fill();
g.fillStyle = '#f6e7a8'; rr(g, rx0 - 14, ry, rx1 - rx0 + 28, 50, 8); g.fill();
const minor = [1, 2, 5, 10].find(s => s * pc >= 13) || 20, major = { 1: 5, 2: 10, 5: 10, 10: 50, 20: 100 }[minor];
g.strokeStyle = '#4a3a12'; g.fillStyle = '#4a3a12'; g.lineWidth = 2;
g.beginPath();
for (let c = 0; c <= len + 1e-6; c += minor) { const x = rx0 + c * pc; g.moveTo(x, ry); g.lineTo(x, ry + (c % major === 0 ? 22 : 12)); }
g.stroke();
g.lineWidth = 4; g.beginPath(); g.moveTo(rx1, ry); g.lineTo(rx1, ry + 50); g.stroke();
g.textAlign = 'right'; font(g, 24, 800);
const endTxt = len.toFixed(0) + ' ซม.', endW = g.measureText(endTxt).width;
g.fillText(endTxt, rx1 - 8, ry + 43);
g.textAlign = 'center'; font(g, 20, 700);
if (major * pc >= 34) for (let c = major; c < len; c += major) { const x = rx0 + c * pc; if (rx1 - 8 - endW - x > 30) g.fillText(c, x, ry + 43); }
gr = g.createLinearGradient(0, 0, 0, 160);
gr.addColorStop(0, 'rgba(0,0,0,0.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
g.fillStyle = gr; g.fillRect(0, 0, W, 160);
phao(g, 74, 68);
g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 8;
g.fillStyle = '#fff'; g.textAlign = 'left';
fit(g, KC.GAME.toUpperCase(), 108, 84, 610, 40, 26, 800);
if (e.real != null) { g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,0.94)'; fit(g, NK.ngayThat(e.real), W - 50, 84, 280, 34, 24, 600); }
g.shadowColor = 'transparent'; g.shadowBlur = 0;
if (e.record) huyHieu(g, 902, 256, 108, e.first ? 'ปลาใหม่' : 'สถิติ', e.first ? 'สมุดบันทึก' : 'ใหม่!');
const PX = 46, PY = 792, PW = W - 92, PH = 478, ix = PX + 40, iw = PW - 80;
g.fillStyle = 'rgba(6,14,20,0.68)'; rr(g, PX, PY, PW, PH, 28); g.fill();
g.strokeStyle = 'rgba(255,255,255,0.16)'; g.lineWidth = 2; rr(g, PX, PY, PW, PH, 28); g.stroke();
g.textAlign = 'left';
g.fillStyle = '#fff'; fit(g, sp.name, ix, PY + 74, iw, 68, 36, 800);
if (sp.sci) { g.fillStyle = 'rgba(255,255,255,0.6)'; fit(g, sp.sci, ix, PY + 112, iw, 28, 20, 400, true); }
g.fillStyle = '#f2c14e';
const ww = fit(g, U.fmtKg(e.w), ix, PY + 238, iw * 0.6, 136, 80, 800);
const cx2 = ix + ww + 38, cw2 = ix + iw - cx2;
g.fillStyle = '#fff'; fit(g, `ยาว ${len.toFixed(0)} ซม.`, cx2, PY + 186, cw2, 52, 30, 700);
g.fillStyle = 'rgba(255,255,255,0.74)'; fit(g, `อัดปลา ${NK.datCa(+e.time || 0)} · ${NK.cachLen(e)}`, cx2, PY + 234, cw2, 30, 18, 500);
g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(ix, PY + 286, iw, 2);
const ten = String(opt.ten || '').trim(), step = ten ? 44 : 52;
let y = PY + 334 + (ten ? 0 : 6);
ghim(g, ix + 13, y - 12);
g.fillStyle = '#fff'; fit(g, NK.tenHo(e.pond) + (e.seat ? ' · ช่อง ' + e.seat : '') + (e.tagged ? ' · ปลาติดป้ายรางวัล' : ''), ix + 42, y, iw - 42, 36, 22, 700);
y += step;
const dh = opt.dh && opt.dh.ten ? ' · ' + (opt.dh.bieu ? opt.dh.bieu + ' ' : '') + opt.dh.ten : '';
if (ten) { nguoi(g, ix + 13, y - 12); g.fillStyle = '#fff'; fit(g, 'นักตกปลา ' + ten + dh, ix + 42, y, iw - 42, 34, 22, 600); y += step; }
const g2 = NK.doCau(e);
g.fillStyle = 'rgba(255,255,255,0.76)';
fit(g, `เวลาในเกม ${NK.gio(+e.min || 0)} · ${NK.troi(e.weather)} · ลม ${(+e.wind || 0).toFixed(1)} ม./วิ · น้ำ ${Math.round(+e.temp || 0)}°C`, ix, y, iw, 28, 18, 500);
y += step - 4;
fit(g, [g2.rod, g2.line, g2.hook].join(' · '), ix, y, iw, 28, 18, 500);
const a = 'มาตกด้วยกันที่  ';
font(g, 30, 500); const aw = g.measureText(a).width;
font(g, 36, 800); const bw = g.measureText(KC.WEB).width;
const fx = (W - aw - bw) / 2;
g.textAlign = 'left';
font(g, 30, 500); g.fillStyle = 'rgba(255,255,255,0.78)'; g.fillText(a, fx, 1322);
font(g, 36, 800); g.fillStyle = '#f2c14e'; g.fillText(KC.WEB, fx + aw, 1322);
return cv;
};
let cur = null;
KC.tenTep = e => `chingliu-${String(e.id || 'fish').replace(/[^\w-]/g, '')}-${Math.round((+e.w || 0) * 1000)}g.png`;
KC.loiKhoe = e => {
const sp = e.sp || NK.loaiCa(e.id);
return `เพิ่งตกได้${sp.name} ${U.fmtKg(e.w)} (ยาว ${(+e.len || 0).toFixed(0)} ซม.) ที่${NK.tenHo(e.pond)}! มาเล่น ${KC.GAME} ด้วยกัน`;
};
const note = (s, cls) => { const el = $('kc-meo'); if (el) { el.textContent = s; el.className = 'kc-meo ' + (cls || 'dim'); } };
const MEO = 'เคล็ดลับ: กดค้างที่ภาพเพื่อบันทึกหรือส่งต่อให้เพื่อนได้เช่นกัน';
function box() {
let b = $('kc-xem');
if (b) return b;
b = document.createElement('div');
b.id = 'kc-xem'; b.className = 'hidden';
b.innerHTML = `<div class="kc-hop"><img id="kc-anh" alt="การ์ดอวดปลา">
      <div class="kc-ben"><b class="kc-td">📸 การ์ดอวดปลา</b>
        <button class="good" id="kc-chiase">📤 แชร์</button>
        <button id="kc-tai">⬇ บันทึกลงเครื่อง</button>
        <button id="kc-dong">ปิด</button>
        <p id="kc-meo" class="kc-meo dim"></p></div></div>`;
(document.getElementById('game') || document.body).appendChild(b);
b.addEventListener('pointerdown', ev => ev.stopPropagation());
b.addEventListener('click', ev => { if (ev.target === b) KC.dong(); });
$('kc-chiase').addEventListener('click', () => KC.chiaSe());
$('kc-tai').addEventListener('click', () => KC.tai());
$('kc-dong').addEventListener('click', () => KC.dong());
return b;
}
const blobOf = url => {
try {
const bin = atob(url.slice(url.indexOf(',') + 1)), a = new Uint8Array(bin.length);
for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
return new Blob([a], { type: 'image/png' });
} catch (err) { return null; }
};
const tep = () => { try { return cur && cur.blob ? new File([cur.blob], cur.name, { type: 'image/png' }) : null; } catch (err) { return null; } };
const chiaSeDuoc = f => { try { return !!(f && navigator.share && navigator.canShare && navigator.canShare({ files: [f] })); } catch (err) { return false; } };
KC.dangMo = () => { const b = $('kc-xem'); return !!b && !b.classList.contains('hidden'); };
KC.mo = e => {
if (!e) return;
const ten = (CC.TaiKhoan && CC.TaiKhoan.ten && CC.TaiKhoan.ten()) || '';
let dh = null;
try { dh = CC.ThanhTich && CC.ThanhTich.deo ? CC.ThanhTich.deo() : null; } catch (err) { dh = null; }
  let cv;
  try { cv = KC.ve(e, { ten, dh }); } catch (err) { UI.toast('อุปกรณ์นี้ไม่สามารถสร้างการ์ดอวดปลาได้', 'bad'); return; }
  const b = box();
  let url;
  try { url = cv.toDataURL('image/png'); } catch (err) { UI.toast('อุปกรณ์นี้ไม่สามารถสร้างการ์ดอวดปลาได้', 'bad'); cur = null; return; }
  cur = { e, cv, blob: blobOf(url), name: KC.tenTep(e) };
  $('kc-anh').src = url;
  $('kc-chiase').classList.toggle('hidden', !chiaSeDuoc(tep()));
  note(MEO);
  b.classList.remove('hidden');
};
KC.dong = () => { const b = $('kc-xem'); if (b) b.classList.add('hidden'); const im = $('kc-anh'); if (im) im.removeAttribute('src'); cur = null; };
KC.tai = () => {
  if (!cur) return;
  let url, made = false;
  try {
    if (cur.blob) { url = URL.createObjectURL(cur.blob); made = true; } else url = cur.cv.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = cur.name; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    if (made) setTimeout(() => URL.revokeObjectURL(url), 15000);
    note('✅ บันทึกรูปลงเครื่องแล้ว (โฟลเดอร์ดาวน์โหลด) หากเบราว์เซอร์ไม่โหลดให้กดค้างที่รูปเพื่อบันทึก', 'kc-ok');
  } catch (err) { note('เบราว์เซอร์นี้ไม่รองรับการดาวน์โหลด — กดค้างที่รูปเพื่อบันทึกแทน', 'kc-loi'); }
};
KC.chiaSe = () => {
  const f = tep(), mine = cur;
  if (!chiaSeDuoc(f)) return KC.tai();
  let p;
  try { p = navigator.share({ files: [f], title: KC.GAME, text: KC.loiKhoe(mine.e) }); } catch (err) { return KC.tai(); }
  Promise.resolve(p).then(() => { if (cur === mine) note('✅ ส่งไปยังแอปที่เลือกเรียบร้อยแล้ว', 'kc-ok'); },
    err => { if (cur === mine && !(err && err.name === 'AbortError')) KC.tai(); });
};
window.addEventListener('keydown', ev => { if (ev.key === 'Escape' && KC.dangMo()) { ev.stopImmediatePropagation(); ev.preventDefault(); KC.dong(); } }, true);
const baseCatch = PN.catch;
PN.catch = function () {
  const h = baseCatch.apply(this, arguments), nut = '<button data-act="kc-khoe">📸 อวดปลา</button>', mark = '<div class="btns">';
const i = h.lastIndexOf(mark);
return i >= 0 ? h.slice(0, i + mark.length) + nut + h.slice(i + mark.length) : h + `<p>${nut}</p>`;
};
const baseAction = UI.onAction;
UI.onAction = function (act) {
if (act !== 'kc-khoe') return baseAction.apply(this, arguments);
const d = UI.data;
if (!d || !d.sp) return;
let e = d.nk;
if (!e) { try { e = NK.snapshot(d); } catch (err) { e = null; } }
KC.mo(e);
};
})();
