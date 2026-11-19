(function () {
const U = CC.U, UI = CC.UI, PN = UI.PANELS, M = CC.PondMap;
const $ = id => document.getElementById(id);
const RECIPES = [
{ name: 'ปลานิลอากาศร้อน', ho: ['rophi', 'giai'], kind: 'cau', style: 'keo', parts: { nen: 4, tanh: 4, ra: 1, soi: 1, chua: 1 }, water: 0.95,
mo: 'เหยื่อแตะกลิ่นคาว + เปรี้ยว น้ำ 1:0.95 อากาศเกิน 28°C' },
{ name: 'ปลานิลอากาศเย็น (ปั้น)', ho: ['rophi', 'giai'], kind: 'cau', style: 've', vo: 2, parts: { nen: 4, tanh: 4, thom: 1, dinh: 1 }, water: 0.75,
mo: 'เหยื่อปั้นก้อนแน่น ลดลูกปลานิลตอดกวน น้ำ 1:0.75' },
{ name: 'ปลานิลไซส์ใหญ่ (สูตรตับ)', ho: ['rophi', 'giai'], kind: 'cau', style: 'keo', parts: { nen: 3, gan: 3, tanh: 2, thom: 1, soi: 1, chua: 1 }, water: 0.95,
mo: 'สูตรตับเน้นปลานิลใหญ่ ปลาทับทิม และปลาเปคู' },
{ name: 'ปลาไนบ่อเก่า (สูตรหอย)', ho: ['rophi', 'giai', 'tram', 'diec'], kind: 'cau', style: 'keo', hat: 'tho', parts: { oc: 5, nen: 3, thom: 1, soi: 1 }, water: 0.95,
mo: 'หอย 50% + พื้น 30% + หอม เกล็ดหยาบจมเร็วเรียกปลาไนใหญ่' },
{ name: 'ปลาไนลงใหม่ (ธัญพืช)', ho: ['rophi', 'giai', 'tram', 'diec'], kind: 'cau', style: 'keo', parts: { thom: 4, nen: 3, cam: 2, soi: 1, mat: 1, huong: 1 }, water: 0.9,
mo: 'ธัญพืชหอมนม หวาน กลิ่นแรง — เหมาะหลังช่วงทางบ่อปล่อยปลา' },
{ name: 'ปลาตะเพียนจีนหน้าร้อน (รสอ่อน)', ho: ['diec'], kind: 'cau', style: 'keo', hat: 'min', parts: { nen: 3, thom: 5, bongtuyet: 1, soi: 1 }, water: 0.95,
mo: '"หน้าร้อนสูตรเบา": ธัญพืชหอมอ่อน เนื้อละเอียดฟุ้งลอยช่วยคุมฝูงตะเพียนจีน' },
{ name: 'ปลาตะเพียนจีนน้ำเย็น (คาวเข้ม)', ho: ['diec'], kind: 'cau', style: 'keo', hat: 'min', parts: { nen: 3, trun: 2, tanh: 2, thom: 2, soi: 1 }, water: 0.9,
mo: '"หน้าหนาวสูตรเข้ม": ไส้เดือนแดง + กุ้ง น้ำต่ำกว่า 22°C' },
{ name: 'ปลาตะเพียนจีนปั้นกันปลาซิว', ho: ['diec'], kind: 'cau', style: 've', vo: 2, parts: { nen: 5, thom: 3, dinh: 1, mat: 1 }, water: 0.72,
mo: 'เหยื่อปั้นก้อนแข็ง นวดแน่น ลดกลิ่นคาว — ปลาซิวกวนยาก' },
{ name: 'ปลาเฉาดำ (สูตรหอย, ปั้น)', ho: ['tram'], kind: 'cau', style: 've', hat: 'tho', parts: { oc: 5, tanh: 2, nen: 2, dinh: 1 }, water: 0.75,
mo: 'กลิ่นหอยเหมือนเหยื่อธรรมชาติของปลาเฉาดำ ปั้นแน่นจมเร็ว' },
{ name: 'ปลาซ่ง (เปรี้ยวฟุ้ง)', ho: ['tram'], kind: 'cau', style: 'keo', hat: 'min', parts: { ngochua: 4, camnhe: 2, nen: 3, soi: 1 }, water: 0.95,
mo: 'เหยื่อหมักเปรี้ยว ฟุ้งกระจายมาก — ปลาซ่งกินจากกลุ่มฝุ่นเหยื่อ' },
{ name: 'ปลาเฉา (ข้าวโพดหมักเปรี้ยว)', ho: ['rophi', 'giai', 'tram'], kind: 'cau', style: 'keo', parts: { ngochua: 3, thom: 3, nen: 3, soi: 1 }, water: 0.95,
mo: 'หอมนมข้าวโพด + ข้าวโพดหมักเปรี้ยว' },
{ name: 'ปลายี่สกเทศ (เปรี้ยวนุ่ม)', ho: ['rophi', 'giai'], kind: 'cau', style: 'keo', hat: 'min', parts: { nen: 4, ngochua: 2, cam: 2, tanh: 1, soi: 1, chua: 1 }, water: 0.95,
mo: 'ปลายี่สกเทศปากเล็ก ชอบเหยื่อเปรี้ยว เนื้อนุ่มฟุ้ง' },
{ name: 'อ่อยปลานิล (ร่วนฟุ้ง)', ho: ['rophi', 'giai'], kind: 'xa', parts: { cam: 4, ra: 3, tanh: 2, nen: 1 }, water: 0.65,
mo: 'เหยื่ออ่อยแห้ง 1:0.65 ขยี้ให้ร่วน — ลงน้ำแตกตัวเป็นม่านฟุ้งเร็ว' },
{ name: 'อ่อยปลาไนติดก้นบ่อ', ho: ['rophi', 'giai', 'tram', 'diec'], kind: 'xa', parts: { cam: 3, gaoruou: 3, oc: 2, ra: 2 }, water: 0.65,
mo: 'ข้าวหมักเหล้าติดก้นบ่อนาน จุดอ่อยอยู่ทน ลูกปลากินไม่หมด' },
{ name: 'อ่อยปลาตะเพียนจีน', ho: ['diec'], kind: 'xa', parts: { thom: 3, cam: 3, ra: 2, nen: 1, trun: 1 }, water: 0.65,
mo: 'รำหอม + ไส้เดือนแดงเล็กน้อย' },
{ name: 'อ่อยปลาซ่ง (ฟุ้งเปรี้ยว)', ho: ['tram'], kind: 'xa', parts: { camnhe: 4, ngochua: 3, ra: 2 }, water: 0.7,
mo: 'รำสาลีเบา + ข้าวโพดหมักเปรี้ยว: ม่านเหยื่อเรียกปลาซ่งเข้าจุดอ่อย' },
{ name: 'อ่อยปลาเฉาดำ (หอย)', ho: ['tram'], kind: 'xa', parts: { oc: 4, cam: 3, ngochua: 2, ra: 1 }, water: 0.65,
mo: 'หอยทุบ + รำหมัก — กลิ่นหอยล่อปลาเฉาดำเข้าจุดอ่อย' }
];
UI.mixState = { kind: 'cau', parts: {}, water: 0.9, style: 'keo', vo: 1, hat: 'vua', tatCa: false };
const opt = st => ({ style: st.style, vo: st.vo, hat: st.hat });
function bowlLine(b, kind) {
if (!b) return `<span class="dim">ยังไม่ผสม</span>`;
const kieu = kind === 'xa' ? '' : ` · ${b.style === 've' ? 'เหยื่อปั้น' : 'เหยื่อแตะ'}${b.vo != null ? ', ' + CC.Bait.VO[b.vo].split(' ')[0] : ''}`;
return `เหลือ <b>${b.portions}</b> ${kind === 'xa' ? 'ลูก' : 'ครั้ง'} · ละลาย ${Math.round(b.dissolve * (kind === 'xa' ? 0.35 : 1))} วิ · เกาะเบ็ด ${Math.round(b.stick * 100)}%${kieu}`;
}
const chon = (act, val, cur, txt) => `<button data-act="${act}" data-v="${val}" class="${String(cur) === String(val) ? 'good' : ''}">${txt}</button>`;
PN.mix = () => {
const P = CC.P, st = UI.mixState, B = CC.Bait, xa = st.kind === 'xa';
const m = B.mix(st.parts, st.water, st.kind, opt(st));
const rows = CC.INGREDIENTS.filter(i => !(i.chiXa && !xa) || st.parts[i.id]).map(i => {
const have = P.inv[i.id] || 0, n = st.parts[i.id] || 0, nap = i.kind === 'สารเสริม';
return `<tr><td><span class="dot" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${i.color}"></span> ${i.name} <span class="dim small">· ${i.kind}</span><div class="dim small">${i.desc}</div></td>
        <td class="num dim">${have} ${nap ? 'ฝา' : 'ช้อน'}</td>
        <td class="num"><button data-act="mpart" data-id="${i.id}" data-d="-1" ${n ? '' : 'disabled'}>−</button> <b>${n}</b> <button data-act="mpart" data-id="${i.id}" data-d="1" ${have > n ? '' : 'disabled'}>+</button></td></tr>`;
}).join('');
const bt = m ? (st.parts.bongtuyet || 0) / Math.max(1, m.total) : 0;
const vua = B.nuocVua(st.kind, st.style, bt), lech = st.water - vua;
const wetTxt = lech < -0.15 ? 'แห้ง' : lech < -0.06 ? 'ค่อนข้างแห้ง' : lech <= 0.06 ? 'พอดี' : lech <= 0.15 ? 'ค่อนข้างแฉะ' : 'แฉะ';
const wt = CC.world.waterTemp != null ? CC.world.waterTemp : CC.world.temp - 1.5, phut = B.uPhut(wt);
const moi = B.caMoi(), ho = CC.pond && CC.P.ca && CC.P.ca.active ? CC.pond().id : null;
const ds = RECIPES.map((r, i) => ({ r, i })).filter(x => st.tatCa || !ho || !x.r.ho || x.r.ho.includes(ho));
const prev = m ? `<div class="readout">
        <div>ละลาย: <b>${Math.round(m.dissolve * (xa ? 0.35 : 1))} วิ</b> · เกาะเบ็ด: <b>${Math.round(m.stick * 100)}%</b> · ความหนัก: <b>×${m.dens.toFixed(2)}</b> · ความฟุ้ง: <b>${m.cloud.toFixed(2)}</b>${m.to > 0.04 ? ` · <b>เน้นปลาใหญ่</b>` : ''}</div>
        <div>${B.smellText(m)}</div>
        <div>${m.notes.map(n => `<span class="${n.includes('ลงตัว') ? 'good' : 'warn'}">${n}</span>`).join('<br>')}</div></div>`
: '<div class="readout dim">เลือกส่วนผสมหรือกดสูตรแนะนำเพื่อดูคุณสมบัติชามเหยื่อ</div>';
const cachLam = xa ? `<div class="dim small" style="margin:6px 0">เหยื่ออ่อย: คลุกผงแห้งให้เข้ากัน เติมน้ำครั้งเดียว ขยี้ให้ร่วน — <b>น้ำ 0.6–0.7</b> กำลังดี</div>`
: `<div class="btnrow" style="margin:8px 0 4px"><span class="dim">รูปแบบเหยื่อตก:</span>
          ${chon('mstyle', 'keo', st.style, '🧵 เหยื่อแตะ (นุ่ม มีใย)')}${chon('mstyle', 've', st.style, '🟤 เหยื่อปั้น (ก้อนแน่น)')}</div>
        <div class="btnrow" style="margin:4px 0"><span class="dim">การนวด / ปั้น:</span>${[0, 1, 2, 3].map(v => chon('mvo', v, st.vo, B.VO[v])).join('')}</div>
        <div class="btnrow" style="margin:4px 0"><span class="dim">ขนาดเม็ดเหยื่อ:</span>
          ${chon('mhat', 'min', st.hat, 'ละเอียด (ลอยตัว, คุมฝูง)')}${chon('mhat', 'vua', st.hat, 'ปานกลาง')}${chon('mhat', 'tho', st.hat, 'หยาบ (จมเร็ว, ปลาใหญ่)')}</div>`;
const cauNow = P.bowls.cau;
const voBtn = cauNow && cauNow.parts && cauNow.portions > 0 && (cauNow.vo != null ? cauNow.vo : 1) < 3
? ` <button data-act="mvothem">🤲 นวดชามเหยื่อตกที่ใช้อยู่เพิ่ม</button> <span class="dim small">พอปลาเข้าจุดแล้วนวดให้แน่นขึ้นเพื่อให้เหยื่อละลายช้าลง</span>` : '';
return `<h2>🥣 ผสมเหยื่อ</h2>
      <div class="sub">ชามเหยื่อตก: ${bowlLine(P.bowls.cau, 'cau')}<br>ชามเหยื่ออ่อย: ${bowlLine(P.bowls.xa, 'xa')}${voBtn ? '<br>' + voBtn : ''}<br>
      น้ำในบ่อ ~<b>${Math.round(wt)}°C</b> — ${wt >= 28 ? 'อากาศร้อน: ปลานิลชอบกลิ่นคาว เปรี้ยว; ปลาตะเพียนจีนและปลาไนชอบเหยื่อรสอ่อน' : wt >= 22 ? 'อากาศเย็นสบาย: เหยื่อกลิ่นหอมกำลังดี' : 'น้ำเย็น: ปลากินน้อย ต้องใช้กลิ่นคาวเข้ม (ไส้เดือน กุ้ง) เรียกปลา'} · หมักเหยื่อ <b>${phut} นาที</b>
      ${ho && (CC.pond().stock || []).length ? `<br>${moi > 0.3 ? '🐟 ปลาปล่อยใหม่: ชอบเหยื่อกลิ่นแรงและธัญพืชเยอะ' : 'ปลาในบ่อเริ่ม "เขี้ยว": เหยื่อรสอ่อน ลดหัวเชื้อ (เกิน 1 ฝาปลาจะระแวง)'}` : ''}</div>
      <div class="btnrow"><button data-act="mkind" data-k="cau" class="${!xa ? 'good' : ''}">ชามเหยื่อตก</button>
      <button data-act="mkind" data-k="xa" class="${xa ? 'good' : ''}">ชามเหยื่ออ่อย</button></div>
      <div class="btnrow" style="margin-top:6px"><span class="dim">สูตรแนะนำ${ho && !st.tatCa ? ' (บ่อนี้)' : ''}:</span>
      ${ds.map(x => `<button data-act="mrecipe" data-i="${x.i}" title="${(x.r.mo || '').replace(/"/g, '&quot;')}">${x.r.kind === 'xa' ? '🌫 ' : ''}${x.r.name}</button>`).join('')}
      ${ho ? `<button data-act="mtatca">${st.tatCa ? 'เฉพาะสูตรเหมาะกับบ่อนี้' : 'ดูทุกสูตร'}</button>` : ''}</div>
      ${st.goiY ? `<div class="dim small" style="margin-top:4px">${st.goiY}</div>` : ''}
      ${cachLam}
      <table class="keep" style="margin-top:10px"><tr><th>วัตถุดิบ</th><th class="num">มีอยู่</th><th class="num">ใส่เพิ่ม</th></tr>${rows}</table>
      <div class="adjrow" style="margin:10px 0"><span>น้ำ / ผงเหยื่อ</span><button data-act="mwater" data-d="-0.05">−</button><b>${st.water.toFixed(2)} (${wetTxt})</b><button data-act="mwater" data-d="0.05">+</button>
        <span class="dim small">พอดี ≈ ${vua.toFixed(2)}</span></div>
      ${prev}
      <p><button class="good" data-act="mdo" ${m ? '' : 'disabled'}>ผสม &amp; หมักเหยื่อ (${phut} นาที)</button> <span class="dim">ชามใหม่จะแทนที่ชามเก่าประเภทเดียวกัน</span></p>`;
};
PN.map = d => {
const P = CC.P, ca = P.ca, mode = d && d.draw ? 'draw' : 'view';
UI.mapSel = UI.mapSel || (ca && ca.o) || 1;
const sel = M.spot(UI.mapSel);
const npc = M.npcAt(sel.id);
const me = ca && ca.o === sel.id;
const adj = M.adjacent(sel).map(a => a.npc ? `ช่อง ${a.spot.id}: ${a.npc.name} (${a.npc.n} ตัว · ${a.npc.kg.toFixed(1)} กก.)` : `ช่อง ${a.spot.id}: ว่าง`).join(' · ');
let head;
if (mode === 'draw') {
head = `<div class="sub">จับสลากได้ 2 ช่อง — ดูข้อมูลแล้วเลือก 1 ช่อง (เหมือน "สุ่ม 2 เลือก 1" ในบ่อตกปลาจริง)</div>
        <div class="btnrow">${d.draw.map(id => `<button class="good" data-act="pick" data-id="${id}">นั่งช่องที่ ${id}</button> <button data-act="mapsel" data-id="${id}">ดูช่อง ${id}</button>`).join('')}</div>`;
} else if (ca && ca.active && ca.o) {
head = `<div class="sub">คุณกำลังนั่งช่องที่ <b>${ca.o}</b> ${ca.swap > 0 && !ca.caught ? 'ย้ายที่ได้ 1 ครั้งก่อนได้ปลาตัวแรก' : 'ใช้สิทธิ์ย้ายที่หมดแล้ว'}</div>
        ${ca.swap > 0 && !ca.caught ? '<div class="btnrow"><button data-act="swap">ย้ายที่นั่ง (สุ่มช่องว่างใหม่ 2 ช่อง)</button></div>' : ''}`;
} else head = '<div class="sub">ซื้อตั๋วที่หน้าต่าง เลือกบ่อ เพื่อสุ่มจับสลากช่องตกปลา</div>';
return `<h2>🗺 แผนผังบ่อ ${CC.POND.name}</h2>${head}
      <canvas id="map-cv" style="width:100%;height:300px;display:block;border-radius:10px;margin:10px 0;cursor:pointer"></canvas>
      <div class="card"><div class="t">ช่องที่ ${sel.id} · ฝั่ง${sel.side} ${me ? '(ที่นั่งของคุณ)' : npc ? `· ${npc.name}` : '· ว่าง'}</div>
      <div class="d">${M.describe(sel).join(' · ')}${npc ? `<br>${npc.name}: ${npc.n} ตัว · ${npc.kg.toFixed(1)} กก.` : ''}<br>ข้างเคียง: ${adj}</div></div>
      <p class="dim small">ลม: ${CC.world.wind.toFixed(1)} ม./วิ (ลูกศร) · เครื่องตีน้ำ: ${M.aeratorOn() ? 'กำลังเปิด' : 'ปิด'} (เปิด 11:30, 17:30, 23:00–4:00 น.) · เส้นเขียว = ร่มไม้${M.spots.some(sp => sp.weed) ? ' · กอเขียวริมฝั่ง = แพผักบุ้ง' : ''}</p>`;
};
UI.afterOpen.map = d => {
const c = $('map-cv');
if (!c) return;
drawMap(c, d);
c.addEventListener('click', e => {
const r = c.getBoundingClientRect();
const k = Math.min((r.width - 40) / M.W, (r.height - 40) / M.H);
const ox = (r.width - M.W * k) / 2, oy = (r.height - M.H * k) / 2;
const x = (e.clientX - r.left - ox) / k, y = (e.clientY - r.top - oy) / k;
let best = null, bd = 1e9;
M.spots.forEach(sp => { const dd = Math.hypot(sp.x - x, sp.y - y); if (dd < bd) { bd = dd; best = sp; } });
if (best && bd < 6) { UI.mapSel = best.id; UI.rerender(); }
});
};
function drawMap(c, d) {
const r = c.getBoundingClientRect(), dp = Math.min(window.devicePixelRatio || 1, 2);
c.width = r.width * dp; c.height = r.height * dp;
const g = c.getContext('2d');
g.setTransform(dp, 0, 0, dp, 0, 0);
const k = Math.min((r.width - 40) / M.W, (r.height - 40) / M.H);
const ox = (r.width - M.W * k) / 2, oy = (r.height - M.H * k) / 2;
const X = x => ox + x * k, Y = y => oy + y * k;
g.fillStyle = '#3d5a2a'; g.fillRect(0, 0, r.width, r.height);
g.fillStyle = '#2f6f75'; g.fillRect(X(0), Y(0), M.W * k, M.H * k);
g.strokeStyle = '#7fd67a'; g.lineWidth = 4;
g.beginPath(); g.moveTo(X(0), Y(0) - 4); g.lineTo(X(28), Y(0) - 4); g.moveTo(X(M.W) + 4, Y(0)); g.lineTo(X(M.W) + 4, Y(18)); g.stroke();
const leaf = (x, y, rx, ry, rot, col) => {
if (!(rx > 0 && ry > 0)) return;
g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill();
};
M.spots.forEach(sp => {
if (!sp.weed) return;
const tx = -sp.ny, ty = sp.nx, rot = Math.atan2(ty, tx);
for (let j = 0; j < 4; j++) {
const h1 = Math.sin(sp.id * 12.9898 + j * 78.233), h2 = Math.sin(sp.id * 39.346 + j * 11.135);
const along = (j - 1.5) * 1.35 + h1 * 0.4, out = 1.6 + (0.5 + 0.5 * h2) * 1.4;
const x = X(sp.x + tx * along + sp.nx * out), y = Y(sp.y + ty * along + sp.ny * out);
leaf(x, y, (1.0 + 0.3 * h2) * k, (0.6 + 0.2 * h1) * k, rot + h1 * 0.5, j % 2 ? '#3f8a35' : '#4f9e3e');
leaf(x - 0.25 * k, y - 0.15 * k, 0.4 * k, 0.24 * k, rot - h2 * 0.6, 'rgba(160,214,110,0.75)');
}
});
const on = M.aeratorOn();
M.aerators.forEach(a => {
g.fillStyle = on ? '#bfe8ff' : '#6d8f99';
g.beginPath(); g.arc(X(a.x), Y(a.y), on ? 7 : 5, 0, 7); g.fill();
if (on) { g.strokeStyle = 'rgba(191,232,255,0.5)'; g.lineWidth = 1; g.beginPath(); g.arc(X(a.x), Y(a.y), 18 * k / 2, 0, 7); g.stroke(); }
});
g.fillStyle = '#9ad'; g.fillRect(X(0) - 6, Y(M.inlet.y) - 6, 6, 12);
g.fillStyle = '#9a6b3c'; g.fillRect(X(M.hut.x) - 12, Y(M.hut.y) + 3, 24, 10);
const ca = CC.P.ca, draws = d && d.draw ? d.draw : [];
M.spots.forEach(sp => {
const x = X(sp.x), y = Y(sp.y), npc = M.npcAt(sp.id);
let col = 'rgba(255,255,255,0.85)';
if (npc) col = '#8a8f94';
if (draws.includes(sp.id)) col = '#5fc46a';
if (ca && ca.o === sp.id) col = '#f2c14e';
g.fillStyle = col;
g.fillRect(x - 6, y - 6, 12, 12);
if (UI.mapSel === sp.id) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x - 8, y - 8, 16, 16); }
g.fillStyle = '#10202a'; g.font = '8px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText(sp.id, x, y + 3);
});
const a = CC.world.windAngle || 0, cx = X(M.W / 2), cy = Y(M.H / 2), L = 14 + CC.world.wind * 4;
g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 2;
g.beginPath(); g.moveTo(cx - Math.cos(a) * L, cy - Math.sin(a) * L); g.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L); g.stroke();
g.beginPath(); g.arc(cx + Math.cos(a) * L, cy + Math.sin(a) * L, 4, 0, 7); g.fill();
g.font = '11px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; g.fillText('ลม', cx, cy - L - 6);
}
UI.drawSpots = () => {
const free = M.spots.filter(sp => !M.npcAt(sp.id) && !(CC.P.ca && CC.P.ca.o === sp.id));
const a = free.splice((Math.random() * free.length) | 0, 1)[0];
const b = free[(Math.random() * free.length) | 0];
UI.mapSel = a.id;
return [a.id, b.id];
};
const base = UI.onAction;
UI.onAction = (act, btn) => {
const P = CC.P, d = btn.dataset, st = UI.mixState;
switch (act) {
case 'mkind': {
st.kind = d.k; st.goiY = '';
st.water = Math.round(CC.Bait.nuocVua(st.kind, st.style, 0) * 20) / 20;
if (st.kind !== 'xa') for (const id in st.parts) if (CC.ING_BY_ID[id] && CC.ING_BY_ID[id].chiXa) delete st.parts[id];
UI.rerender(); return;
}
case 'mpart': st.parts[d.id] = Math.max(0, Math.min(P.inv[d.id] || 0, (st.parts[d.id] || 0) + +d.d)); UI.rerender(); return;
case 'mwater': st.water = U.clamp(Math.round((st.water + +d.d) * 100) / 100, 0.5, 1.4); UI.rerender(); return;
case 'mstyle': {
const cu = CC.Bait.nuocVua('cau', st.style, 0);
st.style = d.v === 've' ? 've' : 'keo';
st.water = U.clamp(Math.round((st.water - cu + CC.Bait.nuocVua('cau', st.style, 0)) * 100) / 100, 0.5, 1.4);
UI.rerender(); return;
}
case 'mvo': st.vo = U.clamp(+d.v | 0, 0, 3); UI.rerender(); return;
case 'mhat': st.hat = ['min', 'vua', 'tho'].includes(d.v) ? d.v : 'vua'; UI.rerender(); return;
case 'mtatca': st.tatCa = !st.tatCa; UI.rerender(); return;
case 'mrecipe': {
const r = RECIPES[+d.i];
st.kind = r.kind; st.water = r.water; st.parts = {};
st.style = r.style || 'keo'; st.vo = r.vo != null ? r.vo : 1; st.hat = r.hat || 'vua';
st.goiY = `<b>${r.name}</b>: ${r.mo || ''}`;
const miss = [];
for (const id in r.parts) { st.parts[id] = Math.min(r.parts[id], P.inv[id] || 0); if ((P.inv[id] || 0) < r.parts[id]) miss.push(CC.ING_BY_ID[id].name); }
if (miss.length) UI.toast('ขาดวัตถุดิบ: ' + miss.join(', ') + ' — ไปซื้อเพิ่มได้ที่ร้านค้า', 'bad');
UI.rerender(); return;
}
case 'mdo': {
const bowl = CC.Bait.makeBowl(st.parts, st.water, st.kind, opt(st));
if (!bowl) return;
for (const id in st.parts) P.inv[id] = (P.inv[id] || 0) - st.parts[id];
P.bowls[st.kind] = bowl;
if (CC.Quests) CC.Quests.emit('mix', { kind: st.kind });
const phut = CC.Bait.uPhut();
CC.world.minutes += phut;
UI.toast(`ผสมชาม${st.kind === 'xa' ? 'เหยื่ออ่อย' : 'เหยื่อตก'}แล้ว: ${bowl.portions} ${st.kind === 'xa' ? 'ลูก' : 'ครั้ง'} · หมัก ${phut} นาที`, 'good');
st.parts = {}; st.goiY = '';
UI.rerender(); return;
}
case 'mvothem': {
const b = CC.Bait.voThem(P.bowls.cau);
if (!b) return;
CC.world.minutes += 1;
UI.toast(`นวดชามเหยื่อตกเพิ่มแล้ว (${CC.Bait.VO[b.vo]}): ละลาย ${Math.round(b.dissolve)} วิ, เกาะเบ็ด ${Math.round(b.stick * 100)}%`, 'good');
UI.rerender(); return;
}
case 'mapsel': UI.mapSel = +d.id; UI.rerender(); return;
case 'pick': {
P.ca.o = +d.id;
CC.Game.applySpot(+d.id);
CC.Pond.reset(CC.G.q);
UI.toast(`นั่งช่องที่ ${d.id} แล้ว วัดพื้น ตั้งทุ่น ผสมเหยื่อ แล้วเปิดอ่อยเหยื่อเพื่อเปิดจุดอ่อยได้เลย!`, 'good');
UI.data = null; UI.open('setup'); return;
}
case 'swap': {
if (!P.ca || P.ca.swap <= 0 || P.ca.caught) return;
P.ca.swap--;
UI.open('map', { draw: UI.drawSpots() });
return;
}
}
base(act, btn);
};
})();
