(function () {
const U = CC.U, UI = CC.UI;
const S = CC.SKINS = {
box: [
{ id: 'box_def', name: 'กล่องขาว-น้ำเงิน', price: 0, c1: '#e8e4dc', c2: '#2f6fb8', pat: 'plain' },
{ id: 'box_den', name: 'กล่องคาร์บอนดำ-แดง', price: 450, c1: '#222428', c2: '#c0392b', pat: 'carbon' },
{ id: 'box_camo', name: 'กล่องลายพราง', price: 600, c1: '#5b6b3a', c2: '#3a3f22', pat: 'camo' },
{ id: 'box_hong', name: 'กล่องชมพูพาสเทล', price: 350, c1: '#f3b8c8', c2: '#ffffff', pat: 'plain' },
{ id: 'box_go', name: 'กล่องไม้คลาสสิก', price: 700, c1: '#8a5a32', c2: '#5a3a1e', pat: 'wood' },
{ id: 'box_vang', name: 'กล่องทอง "เจ้าสนาม"', price: 0, c1: '#e8b923', c2: '#7a5a00', pat: 'gold', unlock: { giai: 1, text: 'คว้าแชมป์วันอาทิตย์ 1 ครั้ง' } }
],
rod: [
{ id: 'rod_def', name: 'สีเดิมของคัน', price: 0, color: null },
{ id: 'rod_do', name: 'สีแดงไวน์', price: 300, color: '#7a1f2b' },
{ id: 'rod_xanh', name: 'สีเขียวมอส', price: 300, color: '#2f5a3a' },
{ id: 'rod_tim', name: 'สีม่วงเข้ม', price: 350, color: '#3d2a5a' },
{ id: 'rod_trang', name: 'สีขาวมุก', price: 400, color: '#e8e6df' },
{ id: 'rod_kim', name: 'สีทองเมทัลลิก', price: 800, color: '#b08d3c' }
],
line: [
{ id: 'line_def', name: 'สายใส', price: 0, rgb: '235,235,235' },
{ id: 'line_vang', name: 'สายเหลืองสะท้อนแสง', price: 120, rgb: '240,230,60' },
{ id: 'line_hong', name: 'สายชมพู', price: 120, rgb: '255,140,190' },
{ id: 'line_cam', name: 'สายส้ม', price: 120, rgb: '255,160,60' },
{ id: 'line_xanh', name: 'สายเขียว', price: 120, rgb: '110,230,120' }
],
hook: [
{ id: 'hook_def', name: 'ตัวเบ็ดสีเงิน', price: 0, color: '#c7ccd0' },
{ id: 'hook_vang', name: 'ตัวเบ็ดเคลือบทอง', price: 80, color: '#e0b33a' },
{ id: 'hook_den', name: 'ตัวเบ็ดสีดำด้าน', price: 80, color: '#3a3a3a' },
{ id: 'hook_do', name: 'ตัวเบ็ดสีแดง', price: 80, color: '#d03a2a' }
],
tip: [
{ id: 'tip_def', name: 'หางทุ่นแดง–ดำ–เหลือง', price: 0, colors: ['#ff3b2f', '#1b1b1b', '#ffd21a', '#1b1b1b'], body: '#d9d2c0', glow: '255,90,70' },
{ id: 'tip_xanh', name: 'หางทุ่นเขียว–ส้ม', price: 150, colors: ['#2fd16b', '#1b1b1b', '#ff8a1a', '#1b1b1b'], body: '#cfe0c8', glow: '80,255,120' },
{ id: 'tip_hong', name: 'หางทุ่นชมพู–ขาว', price: 150, colors: ['#ff5fa0', '#f5f5f5'], body: '#f0d0dc', glow: '255,120,180' },
{ id: 'tip_cam', name: 'หางทุ่นส้มสะท้อนแสง', price: 150, colors: ['#ff7a00', '#111111'], body: '#e8d0b0', glow: '255,150,40' },
{ id: 'tip_da', name: 'หางทุ่นเรืองแสง (ตกกลางคืน)', price: 300, colors: ['#c8ff3a', '#1b1b1b', '#c8ff3a', '#ff3b2f'], body: '#e0e0d0', glow: '200,255,60', bright: 1.6 }
],
umb: [
{ id: 'umb_def', name: 'ร่มเขียว', price: 0, colors: ['#2e8b57'] },
{ id: 'umb_do', name: 'ร่มแดง', price: 250, colors: ['#c0392b'] },
{ id: 'umb_cauvong', name: 'ร่มสีรุ้ง', price: 500, colors: ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'] },
{ id: 'umb_camo', name: 'ร่มลายพราง', price: 450, colors: ['#5b6b3a', '#3a3f22', '#6f7a48'] },
{ id: 'umb_vang', name: 'ร่มทอง "ราชันย์เฉาดำ"', price: 0, colors: ['#e8b923', '#7a5a00'], unlock: { bigTram: true, text: 'ช้อนปลาเฉาดำ 20 กก. ขึ้นไป' } }
],
hat: [
{ id: 'hat_def', name: 'หมวกแก๊ปดำ', price: 0, type: 'cap', color: '#2b2b2b' },
{ id: 'hat_nonla', name: 'หมวกงอบใบลาน', price: 100, type: 'nonla', color: '#e3cf94' },
{ id: 'hat_taibeo', name: 'หมวกบักเก็ตเดินป่า', price: 150, type: 'bucket', color: '#7a8a5a' },
{ id: 'hat_do', name: 'หมวกแก๊ปแดง', price: 120, type: 'cap', color: '#b03028' },
{ id: 'hat_vua', name: 'หมวก "ราชันย์ปลานิล"', price: 0, type: 'cap', color: '#e8b923', unlock: { caught: 100, text: 'ตกปลาครบ 100 ตัว' } }
],
shirt: [
{ id: 'shirt_def', name: 'เสื้อฟ้า', price: 0, color: '#3d6f9a' },
{ id: 'shirt_trang', name: 'เสื้อกันแดดสีขาว', price: 150, color: '#e8eef0' },
{ id: 'shirt_camo', name: 'เสื้อลายพราง', price: 250, color: '#5b6b3a' },
{ id: 'shirt_do', name: 'เสื้อชมรมสีแดง', price: 200, color: '#b83a2e' },
{ id: 'shirt_den', name: 'เสื้อดำ', price: 150, color: '#2a2a2e' }
]
};
const CATS = { box: 'กล่องชิงหลิว', umb: 'ร่มตกปลา', rod: 'สีคัน', line: 'สีสาย', hook: 'สีตัวเบ็ด', tip: 'หางทุ่น', hat: 'หมวก', shirt: 'เสื้อ' };
CC.skin = cat => {
const id = CC.P && CC.P.skins && CC.P.skins.eq[cat];
return S[cat].find(s => s.id === id) || S[cat][0];
};
const owned = s => !s.price && !s.unlock || (CC.P.skins.owned || []).includes(s.id);
const unlocked = s => {
const u = s.unlock, P = CC.P;
if (!u) return true;
if (u.giai) return (P.giaiWins || 0) >= u.giai;
if (u.bigTram) return !!P.bigTram;
if (u.caught) return P.stats.caught >= u.caught;
return false;
};
const D = CC.SkinDraw = {};
D.box = (g, x, y, w, h, s, tone) => {
tone = tone || (c => c);
g.fillStyle = tone(s.c1); g.fillRect(x, y, w, h);
g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
if (s.pat === 'carbon') { g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 2; for (let i = -h; i < w; i += 5) { g.beginPath(); g.moveTo(x + i, y + h); g.lineTo(x + i + h, y); g.stroke(); } }
if (s.pat === 'camo') { g.fillStyle = tone(s.c2); for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(x + ((i * 37) % 100) / 100 * w, y + ((i * 53) % 100) / 100 * h, w * 0.14, h * 0.18, i, 0, 7); g.fill(); } }
if (s.pat === 'wood') { g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x, y + h * i / 5); g.lineTo(x + w, y + h * i / 5); g.stroke(); } }
if (s.pat === 'gold') { const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, 'rgba(255,255,255,0.45)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0.25)'); g.fillStyle = gr; g.fillRect(x, y, w, h); }
g.restore();
g.fillStyle = tone(s.c2); g.fillRect(x, y, w, h * 0.22);
};
D.umb = (g, cx, cy, rx, ry, rot, s, tone) => {
tone = tone || (c => c);
const n = s.colors.length > 1 ? 8 : 1;
for (let i = 0; i < n; i++) {
g.fillStyle = tone(s.colors[i % s.colors.length]);
g.beginPath(); g.moveTo(cx, cy);
g.ellipse(cx, cy, rx, ry, rot, Math.PI + (i / n) * Math.PI, Math.PI + ((i + 1) / n) * Math.PI);
g.closePath(); g.fill();
}
};
D.hat = (g, cx, cy, r, s, tone) => {
tone = tone || (c => c);
g.fillStyle = tone(s.color);
if (s.type === 'nonla') { g.beginPath(); g.moveTo(cx - r * 2, cy); g.lineTo(cx, cy - r * 1.8); g.lineTo(cx + r * 2, cy); g.closePath(); g.fill(); }
else if (s.type === 'bucket') { g.beginPath(); g.ellipse(cx, cy - r * 0.4, r * 1.05, r * 0.75, 0, Math.PI, 0); g.fill(); g.fillRect(cx - r * 1.6, cy - r * 0.45, r * 3.2, r * 0.35); }
else { g.beginPath(); g.ellipse(cx, cy - r * 0.3, r * 1.05, r * 0.7, 0, Math.PI, 0); g.fill(); g.fillRect(cx, cy - r * 0.42, r * 1.7, r * 0.28); }
};
function preview(c, cat, s) {
const r = c.getBoundingClientRect(), dp = Math.min(window.devicePixelRatio || 1, 2);
c.width = r.width * dp; c.height = r.height * dp;
const g = c.getContext('2d'); g.setTransform(dp, 0, 0, dp, 0, 0);
const w = r.width, h = r.height;
g.fillStyle = '#2b4f4a'; g.fillRect(0, 0, w, h);
if (cat === 'box') D.box(g, w / 2 - 34, h / 2 - 20, 68, 42, s);
if (cat === 'umb') { D.umb(g, w / 2, h * 0.7, w * 0.38, h * 0.55, 0, s); g.strokeStyle = '#333'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, h * 0.7); g.lineTo(w / 2, h); g.stroke(); }
if (cat === 'rod' || cat === 'line') {
const rodCol = cat === 'rod' ? (s.color || '#3b3b3b') : '#3b3b3b';
g.strokeStyle = rodCol; g.lineCap = 'round';
for (let i = 0; i < 10; i++) { const k = i / 10; g.lineWidth = 6 - 5 * k; g.beginPath(); g.moveTo(10 + k * (w - 40), h - 12 - k * k * (h - 30)); g.lineTo(10 + (k + 0.1) * (w - 40), h - 12 - (k + 0.1) ** 2 * (h - 30)); g.stroke(); }
if (cat === 'line') { g.strokeStyle = `rgb(${s.rgb})`; g.lineWidth = 2; g.beginPath(); g.moveTo(w - 30, 18); g.quadraticCurveTo(w - 18, h * 0.5, w - 22, h - 6); g.stroke(); }
}
if (cat === 'hook') { g.strokeStyle = s.color; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2 + 8, 12); g.lineTo(w / 2 + 8, h - 26); g.arc(w / 2, h - 26, 8, 0, Math.PI); g.lineTo(w / 2 - 8, h - 34); g.stroke(); }
if (cat === 'tip') {
const np = (h - 20) / 11;
for (let i = 0; i < 9; i++) { g.fillStyle = s.colors[i % s.colors.length]; g.fillRect(w / 2 - 4, 6 + i * np, 8, np - 1); }
g.fillStyle = s.body; g.fillRect(w / 2 - 8, 6 + 9 * np, 16, np * 2);
}
if (cat === 'hat') D.hat(g, w / 2, h * 0.65, 18, s);
if (cat === 'shirt') {
g.fillStyle = s.color;
g.beginPath(); g.moveTo(w / 2 - 22, 14); g.lineTo(w / 2 - 40, 30); g.lineTo(w / 2 - 30, 40); g.lineTo(w / 2 - 22, 34); g.lineTo(w / 2 - 22, h - 8);
g.lineTo(w / 2 + 22, h - 8); g.lineTo(w / 2 + 22, 34); g.lineTo(w / 2 + 30, 40); g.lineTo(w / 2 + 40, 30); g.lineTo(w / 2 + 22, 14); g.lineTo(w / 2 + 8, 14); g.lineTo(w / 2, 22); g.lineTo(w / 2 - 8, 14); g.closePath(); g.fill();
}
}
UI.PANELS.skins = () => {
const P = CC.P;
const secs = Object.keys(CATS).map(cat => `<h3>${CATS[cat]}</h3><div class="grid">${S[cat].map(s => {
const own = owned(s), eq = CC.skin(cat).id === s.id, ok = unlocked(s);
let btn;
if (eq) btn = '<b>ใช้งานอยู่</b>';
else if (own || (s.unlock && ok)) btn = `<button data-act="eqskin" data-c="${cat}" data-id="${s.id}">ใช้</button>`;
else if (s.unlock) btn = `<span class="dim">🔒 ${s.unlock.text}</span>`;
else btn = `<button data-act="buyskin" data-c="${cat}" data-id="${s.id}" ${P.money < s.price ? 'disabled' : ''}>ซื้อ ${s.price} ฿</button>`;
return `<div class="card ${eq ? 'equipped' : own ? 'owned' : ''}"><canvas data-skin="${cat}:${s.id}" style="height:64px"></canvas>
        <div class="t">${s.name}</div><div class="row">${own && !eq ? '<span class="dim">มีแล้ว</span>' : '<span></span>'}${btn}</div></div>`;
}).join('')}</div>`).join('');
return `<h2>🎨 ตกแต่ง</h2><div class="sub">สกินเปลี่ยนเฉพาะรูปลักษณ์ ไม่เพิ่มค่าพลังการตก เงิน: <b class="price">${U.fmtMoney(P.money)} ฿</b> · บางสกินปลดล็อกด้วยความสำเร็จ</div>${secs}`;
};
UI.afterOpen.skins = () => document.querySelectorAll('#panel-body canvas[data-skin]').forEach(c => {
const [cat, id] = c.dataset.skin.split(':');
preview(c, cat, S[cat].find(s => s.id === id));
});
const base = UI.onAction;
UI.onAction = (act, btn) => {
const P = CC.P, d = btn.dataset;
if (act === 'buyskin') {
const s = S[d.c].find(x => x.id === d.id);
if (!s || P.money < s.price) return;
P.money -= s.price; P.skins.owned.push(s.id); P.skins.eq[d.c] = s.id;
CC.Audio.coin(); UI.toast(`ซื้อ ${s.name} แล้ว`, 'good'); UI.rerender(); return;
}
if (act === 'eqskin') { P.skins.eq[d.c] = d.id; UI.rerender(); return; }
base(act, btn);
};
})();
