(function () {
const U = CC.U, UI = CC.UI, Rig = CC.Rig;
const $ = id => document.getElementById(id);
const PN = UI.PANELS;
const fmtW = w => w >= 1 ? `${w} กก.` : `${Math.round(w * 1000)} ก.`;
function payText(p) {
if (p.type === 'kg') return 'ทางบ่อรับซื้อปลา: ' + CC.FISH.filter(f => f.price && p.fish[f.id]).map(f => `${f.name.replace(/^ปลา/, '').replace(' (ปลารบกวน)', '')} ${f.price} ฿/กก.`).join(' · ');
if (p.type === 'latvot') return 'รางวัลชั่งปล่อย: ' + p.brackets.map(([lim, k], i) => `${lim < 99 ? 'ต่ำกว่า ' + lim + ' กก.' : 'ตั้งแต่ ' + p.brackets[i - 1][0] + ' กก.'}: ${k} ฿`).join(' · ');
return 'เงินรางวัล: ' + p.prizes.map((k, i) => `อันดับ ${i + 1}: ${U.fmtMoney(k)} ฿`).join(' · ');
}
PN.pond = () => {
const P = CC.P, ca = P.ca, Wd = CC.world;
const active = ca && ca.active;
const cards = CC.PONDS.map(p => {
const closed = p.weekday != null && CC.weekday(Wd.day) !== p.weekday;
const daysLeft = p.weekday != null ? (p.weekday - CC.weekday(Wd.day) + 7) % 7 : 0;
return `<div class="card ${active && P.pondId === p.id ? 'equipped' : ''}">
        <div class="t">${p.name}</div>
        <div class="d">${p.note}<br>${payText(p)}<br>ตั๋วรอบ ${p.caMinutes / 60} ชั่วโมง: <b class="price">${p.ticket} ฿</b></div>
        <div class="row">${active ? (P.pondId === p.id ? '<b>กำลังตกอยู่ที่นี่</b>' : '')
: closed ? `<span class="dim">เปิดเฉพาะวันอาทิตย์ (อีก ${daysLeft} วัน)</span>`
: `<button class="good" data-act="buyticket" data-id="${p.id}" ${P.money < p.ticket ? 'disabled' : ''}>ซื้อตั๋ว</button>`}</div></div>`;
}).join('');
return `<h2>🎣 เลือกบ่อ</h2><div class="sub">วันนี้${CC.weekdayName(Wd.day)} เวลา ${Wd.clock()} น. · เงิน: <b class="price">${U.fmtMoney(P.money)} ฿</b> · สายหน้าผูกสำเร็จ: ${P.leaders} ชุด</div>
      ${CC.Quests ? CC.Quests.pondBox() : ''}
      <div class="grid">${cards}</div>
      <p style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      <button data-act="help">❔ คู่มือ</button>
      <button data-act="gopy">💬 ข้อเสนอแนะ</button>
      ${active ? `<span>กำลังตกอยู่ช่องที่ <b>${ca.o || '?'}</b> — ${CC.pond().name}</span> <button data-act="endca">จบรอบก่อนเวลา → ชั่งปลา</button>`
: '<button data-act="sleep">🌙 กลับไปพักผ่อน พรุ่งนี้เช้าค่อยมาตก</button>'}
      </p>`;
};
PN.setup = () => `<h2>⚖ แท่นตั้งทุ่น</h2>
    <div class="sub">วิธีตั้งทุ่นสไตล์ชิงหลิว: <b>ตั้งทุ่น</b> = ตัดตะกั่วให้ทุ่นโผล่ N ข้อเมื่อตัวเบ็ดเปล่ายังไม่เกี่ยวเหยื่อลอยพ้นพื้น; <b>ระยะตก</b> = เลื่อนทุ่นขึ้น/ลงให้ตอนเกี่ยวเหยื่อ เหยื่อแตะพื้นพอดีและทุ่นโผล่ M ข้อ สูตรยอดนิยมคือ <b>ตั้ง 4 ข้อ · ตก 2 ข้อ</b></div>
    <div class="setup">
      <canvas id="setup-cv"></canvas>
      <div class="setup-ctl">
        <div class="adjrow"><span>ตะกั่วฟิวส์</span><button data-act="lead" data-d="-0.02">−−</button><button data-act="lead" data-d="-0.005">−</button><b id="s-lead"></b><button data-act="lead" data-d="0.005">+</button><button data-act="lead" data-d="0.02">++</button></div>
        <div class="adjrow"><span>ความลึกทุ่น</span><button data-act="set" data-d="-5">−−</button><button data-act="set" data-d="-0.5">−</button><b id="s-set"></b><button data-act="set" data-d="0.5">+</button><button data-act="set" data-d="5">++</button></div>
        <div class="readout" id="s-read"></div>
        <div class="btnrow">
          <button data-act="probe">📏 หยั่งพื้น (เบ็ดล่างแตะพื้น)</button>
          <button data-act="auto" data-n="4" data-m="2">ช่วยตั้ง: ตั้ง 4 ตก 2</button>
          <button data-act="auto" data-n="3" data-m="1">ช่วยตั้ง: ตั้ง 3 ตก 1</button>
        </div>
        <p><button class="good" data-act="setupdone">เรียบร้อย — ลงตกปลา</button></p>
      </div>
    </div>`;
UI.afterOpen.setup = () => UI.updateSetup();
UI.updateSetup = () => {
const P = CC.P, G = CC.G;
CC.Game.applyRig();
const bottom = CC.bottomDepth(G.spotX) * 100;
const can = Rig.canValue(G.rig), cau = Rig.cauValue(G.rig, bottom);
const fresh = Object.assign({}, G.rig, { baits: [CC.BAIT.w, CC.BAIT.w] });
const sol = Rig.solve(fresh, bottom, {});
const probe = Rig.findBottomSet(G.rig, bottom);
$('s-lead').textContent = P.lead.toFixed(3) + ' ก.';
$('s-set').textContent = P.set.toFixed(1) + ' ซม.';
let state;
if (G.tooDeep) state = '<span class="bad">ทุ่นตั้งลึกเกินความยาวคัน — ลดความลึกทุ่นลง</span>';
else if (sol.sLead > 0.5) state = '<span class="bad">ตะกั่วจมพื้น — ทุ่นแทบไม่แสดงอาการปลากิน ลดความลึกทุ่นลง</span>';
else if (sol.sLow < 0.05 && sol.sUp < 0.05) state = '<span class="warn">เหยื่อทั้งสองเม็ดลอยกลางน้ำ ยังไม่แตะพื้น (ตกบาลานซ์ลอย)</span>';
else if (sol.sLow > 0.95 && sol.sUp > 0.95) state = '<span class="warn">เหยื่อทั้งสองเม็ดนอนก้นบ่อเต็มที่ — ตกไม้ตาย อาการทุ่นจะช้า</span>';
else state = '<span class="good">เหยื่อแตะพื้นเบาๆ — ตกบาลานซ์แตะพื้น อาการทุ่นชัดเจน</span>';
$('s-read').innerHTML = `
      <div><b class="big">ตั้ง ${Rig.fmt(can)} · ตก ${Rig.fmt(cau)}</b></div>
      <div>ความลึกก้นบ่อที่จุดตก: <b>${(bottom / 100).toFixed(2)} ม.</b> · ห่างฝั่ง ${G.spotX.toFixed(1)} ม.</div>
      <div>ระดับหยั่งพื้น: ${(probe / 100).toFixed(2)} ม. (ตั้งไว้อยู่ ${(P.set / 100).toFixed(2)} ม., ${P.set - probe >= 0 ? '+' : ''}${(P.set - probe).toFixed(1)} ซม.)</div>
      <div>${state}</div>`;
drawSetup(can, cau);
UI.refresh();
};
function drawSetup(can, cau) {
const c = $('setup-cv');
if (!c) return;
const r = c.getBoundingClientRect(), dp = Math.min(window.devicePixelRatio || 1, 2);
c.width = r.width * dp; c.height = r.height * dp;
const g = c.getContext('2d');
g.setTransform(dp, 0, 0, dp, 0, 0);
const F = CC.float(), w = r.width, h = r.height, wl = h * 0.6;
g.fillStyle = '#9fc4d8'; g.fillRect(0, 0, w, wl);
g.fillStyle = '#2f5f55'; g.fillRect(0, wl, w, h - wl);
const np = Math.min(15, (h * 0.5) / (F.n + 1));
const colors = CC.skin('tip').colors;
[[can, 'ไม่ใส่เหยื่อ'], [cau, 'ใส่เหยื่อ']].forEach(([v, label], k) => {
const cx = w * (k ? 0.72 : 0.28);
const vv = U.clamp(v, -2, F.n + 3);
const top = wl - vv * np;
for (let i = 0; i < F.n; i++) { g.fillStyle = colors[i % colors.length]; g.fillRect(cx - 4, top + i * np, 8, np - 1); }
g.fillStyle = CC.skin('tip').body; g.fillRect(cx - 8, top + F.n * np, 16, np * 3);
g.fillStyle = 'rgba(47,95,85,0.75)'; g.fillRect(cx - 12, wl + 1, 24, h - wl);
g.fillStyle = '#10202a'; g.font = '12px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; g.textAlign = 'center';
g.fillText(label, cx, 16);
g.fillStyle = '#fff'; g.fillText(Rig.fmt(v), cx, h - 10);
});
g.strokeStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.moveTo(0, wl); g.lineTo(w, wl); g.stroke();
}
function autoTune(n, m) {
const P = CC.P, G = CC.G;
let lo = 0.2, hi = 4;
for (let i = 0; i < 40; i++) {
const mid = (lo + hi) / 2;
G.rig.lead = mid;
if (Rig.canValue(G.rig) > n) lo = mid; else hi = mid;
}
P.lead = Math.round(((lo + hi) / 2) / CC.LEAD_STEP) * CC.LEAD_STEP;
for (let pass = 0; pass < 14; pass++) {
const prev = P.set;
CC.Game.applyRig();
const bottom = CC.bottomDepth(G.spotX) * 100;
const base = Rig.findBottomSet(G.rig, bottom);
let best = P.set, err = 1e9;
const at = s => { G.rig.set = s; return Math.abs(Rig.cauValue(G.rig, bottom) - m); };
for (let s = base - 12; s <= base + 12; s += 0.1) {
const e = at(s) * 2 + at(s - 1.5) + at(s + 1.5);
if (e < err - 0.01) { err = e; best = s; }
}
P.set = Math.round(best * 10) / 10;
if (pass > 1 && Math.abs(P.set - prev) < 0.15) break;
}
}
const SHOP = [
['คันชิงหลิว', 'rods', 'rod', () => CC.RODS, r => `ยาว ${r.len} ม. · รับแรง ${r.power} กก.`],
['สายเมน – สายหน้า', 'lines', 'line', () => CC.LINES.slice().sort((a, b) => a.main - b.main), l => `สายเมน ${l.main} กก. · สายหน้า ${l.leader} กก.`],
['ตัวเบ็ด', 'hooks', 'hook', () => CC.HOOKS, h => `วัดติดแน่น ${Math.round(h.hold * 100)}% · ปลากล้ากิน ×${h.take}`],
['ทุ่น', 'floats', 'float', () => CC.FLOATS, f => `รับตะกั่ว ${f.body} ก. · ${f.n} ข้อ · ${f.b * 1000} มก./ข้อ`]
];
PN.shop = () => {
const P = CC.P;
const sec = SHOP.map(([title, ownKey, eqKey, list, spec]) => `<h3>${title}</h3><div class="grid">${list().map(it => {
const own = P[ownKey].includes(it.id), eq = P[eqKey] === it.id;
return `<div class="card ${eq ? 'equipped' : own ? 'owned' : ''}"><div class="t">${it.name}</div>
        <div class="d">${it.desc}<br>${spec(it)}</div>
        <div class="row">${own ? '<span class="dim">มีแล้ว</span>' : `<span class="price">${U.fmtMoney(it.price)} ฿</span>`}
        ${eq ? '<b>ใช้งานอยู่</b>' : own ? `<button data-act="equip" data-k="${eqKey}" data-id="${it.id}">ใช้</button>`
: `<button data-act="buy" data-k="${eqKey}" data-o="${ownKey}" data-id="${it.id}" data-p="${it.price}" ${P.money < it.price ? 'disabled' : ''}>ซื้อ</button>`}</div></div>`;
}).join('')}</div>`).join('');
const ings = `<h3>วัตถุดิบทำเหยื่อ</h3><div class="grid">${CC.INGREDIENTS.map(i => { const unit = i.kind === 'สารเสริม' ? 'ฝา' : 'ช้อน'; return `<div class="card">
        <div class="t"><span class="dot" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${i.color}"></span> ${i.name} <span class="dim">(มีอยู่ ${P.inv[i.id] || 0} ${unit})</span></div>
        <div class="d">${i.kind} · ${i.desc}</div>
        <div class="row"><span class="price">${i.price} ฿ / ${i.pack} ${unit}</span><button data-act="buying" data-id="${i.id}" ${P.money < i.price ? 'disabled' : ''}>ซื้อ</button></div></div>`; }).join('')}</div>`;
const leaders = `<h3>สายหน้าผูกสำเร็จ</h3><div class="grid"><div class="card"><div class="t">สายหน้า 2 ตะขอผูกสำเร็จ (10 ชุด) <span class="dim">(มีอยู่ ${P.leaders || 0})</span></div>
      <div class="d">ทุกครั้งที่สายหน้าขาดจะเสีย 1 ชุดและเวลาผูกใหม่ 2 นาที หากหมดจะตกปลาไม่ได้</div>
      <div class="row"><span class="price">40 ฿</span><button data-act="buyleaders" ${P.money < 40 ? 'disabled' : ''}>ซื้อ</button></div></div></div>`;
return `<h2>🛒 ร้านอุปกรณ์ตกปลาชิงหลิว</h2><div class="sub">เงิน: <b class="price">${U.fmtMoney(P.money)} ฿</b> · หากเปลี่ยนทุ่น ตัวเบ็ด หรือคัน ต้องตั้งทุ่นใหม่ทุกครั้ง</div>${leaders}${ings}${sec}`;
};
const kgSum = () => CC.P.keep.reduce((s, f) => s + f.w, 0);
PN.keep = () => {
const P = CC.P;
if (!P.keep.length) return `<h2>🧺 กระชังปลา</h2><p class="sub">กระชังยังว่างอยู่</p>`;
const rows = P.keep.map((f, i) => {
const sp = CC.FISH_BY_ID[f.id];
return `<tr><td>${sp.name}</td><td class="num">${U.fmtKg(f.w)}</td><td class="num">${f.len.toFixed(0)} ซม.</td><td><button data-act="release" data-i="${i}">ปล่อย</button></td></tr>`;
}).join('');
return `<h2>🧺 กระชังปลา</h2><div class="sub">${P.keep.length} ตัว · ${kgSum().toFixed(2)} กก. · จบรอบนำไปชั่งขายให้เจ้าของบ่อ</div>
      <table class="keep"><tr><th>ชนิดปลา</th><th class="num">น้ำหนัก</th><th class="num">ความยาว</th><th></th></tr>${rows}</table>`;
};
function weighBill() {
const P = CC.P, pond = CC.pond(), now = CC.world.minutes + CC.world.day * 1440, giai = pond.type === 'giai';
return P.keep.map(f => {
const sp = CC.FISH_BY_ID[f.id];
const counted = f.w >= pond.minW && sp.price > 0 && !giai;
const weak = now - (f.at || now) > 180;
const value = counted ? f.w * sp.price * (weak ? 0.8 : 1) : 0;
return { f, sp, counted, weak, value };
});
}
PN.weigh = () => {
const pond = CC.pond(), P = CC.P;
if (pond.type === 'latvot') {
const log = (P.ca && P.ca.log) || [];
const sum = log.reduce((s, r) => s + r.reward, 0);
return `<h2>⚖ สรุปผลงานรอบชั่งปล่อย</h2><div class="sub">ปลาถูกชั่งและปล่อยกลับบ่อทันทีที่จับได้ เงินรางวัลได้รับทันทีระหว่างรอบ</div>
        ${log.length ? `<table class="keep"><tr><th>ปลา</th><th class="num">น้ำหนัก</th><th class="num">รางวัล</th></tr>${log.map(r => `<tr><td>${r.name}${r.tagged ? ' 🏷' : ''}</td><td class="num">${U.fmtKg(r.w)}</td><td class="num">${U.fmtMoney(r.reward)} ฿</td></tr>`).join('')}</table>` : '<p>รอบนี้ยังช้อนไม่ติดสักตัว บ่อปลาไซส์ยักษ์หินเอาเรื่อง!</p>'}
        <p>รางวัลรวม: <b class="price">${U.fmtMoney(sum)} ฿</b> · ค่าตั๋ว: −${pond.ticket} ฿ → <b class="${sum - pond.ticket >= 0 ? 'good' : 'bad'}">${sum - pond.ticket >= 0 ? 'กำไร' : 'ขาดทุน'} ${U.fmtMoney(Math.abs(sum - pond.ticket))} ฿</b></p>
        ${rankTable(log.reduce((s, r) => s + r.w, 0), log.length)}
        <p><button class="good" data-act="payout">เสร็จสิ้น</button></p>`;
}
if (pond.type === 'giai') {
const kg = P.keep.filter(f => f.w >= pond.minW && CC.FISH_BY_ID[f.id].price > 0).reduce((s, f) => s + f.w, 0);
const rows = CC.PondMap.ranking(kg, P.keep.length);
const rank = rows.findIndex(r => r.me) + 1;
const prize = pond.prizes[rank - 1] || 0;
return `<h2>🏆 ผลการแข่งขัน</h2><div class="sub">กรรมการเดินชั่งกระชังทุกคน แล้วปล่อยปลากลับบ่อหลังชั่งเสร็จ</div>
        <p>คุณ: <b>${kg.toFixed(2)} กก.</b> (${P.keep.length} ตัว) — <b class="price">อันดับ ${rank}/${rows.length}</b>${prize ? ` · เงินรางวัล <b class="price">${U.fmtMoney(prize)} ฿</b>` : ''}</p>
        ${rankTable(kg, P.keep.length)}
        <p><button class="good" data-act="payout">${prize ? 'รับรางวัล' : 'เสร็จสิ้น'}</button></p>`;
}
const bill = weighBill();
const total = bill.reduce((s, b) => s + b.value, 0);
const counted = bill.filter(b => b.counted).reduce((s, b) => s + b.f.w, 0);
const rows = bill.map(b => `<tr><td>${b.sp.name}${b.weak ? ' <span class="warn">(อ่อนแรง −20%)</span>' : ''}</td><td class="num">${U.fmtKg(b.f.w)}</td>
      <td class="num">${b.counted ? b.sp.price + ' ฿/กก.' : '<span class="dim">ไม่นับราคา</span>'}</td><td class="num">${U.fmtMoney(b.value)} ฿</td></tr>`).join('');
const ticket = CC.POND.ticket;
return `<h2>⚖ ชั่งปลากับเจ้าของบ่อ</h2>
      <div class="sub">เจ้าของบ่อหักน้ำหนักกระชัง คัดปลาเล็กกว่า ${fmtW(pond.minW)} ออก และปลาที่ขังในกระชังเกิน 3 ชั่วโมงจะถูกตีเป็นปลาอ่อนแรง</div>
      ${bill.length ? `<table class="keep"><tr><th>ปลา</th><th class="num">น้ำหนัก</th><th class="num">ราคา</th><th class="num">รวมเงิน</th></tr>${rows}</table>` : '<p>กระชังว่าง — รอบนี้ไม่มีปลา</p>'}
      <p>ปลาที่นับน้ำหนัก: <b>${counted.toFixed(2)} กก.</b></p>
      <p>เจ้าของบ่อจ่าย: <b class="price">${U.fmtMoney(total)} ฿</b> · ค่าตั๋ว: −${ticket} ฿ → <b class="${total - ticket >= 0 ? 'good' : 'bad'}">${total - ticket >= 0 ? 'กำไร' : 'ขาดทุน'} ${U.fmtMoney(Math.abs(total - ticket))} ฿</b></p>
      ${rankTable(counted, bill.filter(b => b.counted).length)}
      <p><button class="good" data-act="payout">รับเงิน</button></p>`;
};
function rankTable(myKg, myN) {
const rows = CC.PondMap.ranking(myKg, myN);
const me = rows.findIndex(r => r.me);
const row = (r, i) => `<tr${r.me ? ' style="color:var(--accent);font-weight:700"' : ''}><td>${i + 1}</td><td>${r.name}</td><td class="num">${r.n || 0}</td><td class="num">${r.kg.toFixed(2)}</td></tr>`;
return `<h3>ตารางอันดับทั้งบ่อรอบนี้</h3><table class="keep"><tr><th>#</th><th>นักตกปลา</th><th class="num">ตัว</th><th class="num">กก.</th></tr>
      ${rows.slice(0, 6).map(row).join('')}${me >= 6 ? row(rows[me], me) : ''}</table>`;
}
const homeTest = () => !!(CC.Sync && CC.Sync.enabled);
PN.journal = () => {
const P = CC.P, st = P.stats;
const cards = CC.FISH.map(sp => {
const j = P.journal[sp.id];
if (!j) return `<div class="card unknown"><canvas data-fish="${sp.id}" data-sil="1"></canvas><div class="t">???</div><div class="d">ยังไม่เคยตกได้</div></div>`;
return `<div class="card owned"><canvas data-fish="${sp.id}"></canvas>
        <div class="t">${sp.name} <span class="dim" style="font-weight:400;font-style:italic">${sp.sci}</span></div>
        <div class="d">${sp.desc}</div>
        <div class="row"><span>ตกได้แล้ว: <b>${j.count}</b></span><span>สถิติใหญ่สุด: <b class="price">${U.fmtKg(j.best)}</b></span></div></div>`;
}).join('');
return `<h2>📖 สมุดบันทึก</h2><div class="sub">${st.cas} รอบ · ตกได้ ${st.caught} ตัว · ปล่อย ${st.released} · หลุด/ขาด ${st.lost} · รายได้รวม ${U.fmtMoney(st.earned)} ฿</div>
      <div class="grid">${cards}</div><p style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
      <button data-act="gopy">💬 ข้อเสนอแนะ</button>
      ${homeTest() ? '<button data-act="cheat">💰 โหมดทดสอบ: เพิ่ม 50,000 ฿</button>' : ''}
      <button data-act="reset">เริ่มเล่นใหม่ตั้งแต่ต้น</button></p>`;
};
UI.afterOpen.journal = () => document.querySelectorAll('#panel-body canvas[data-fish]').forEach(c =>
UI.drawFishCard(c, CC.FISH_BY_ID[c.dataset.fish], c.dataset.sil ? '#2c3a40' : null));
PN.help = () => `<h2>❔ คู่มือชิงหลิวบ่อตกปลา</h2>
    <p class="sub" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">มีข้อเสนอแนะ พบบั๊ก หรืออยากให้เพิ่มอะไรไหม? <button data-act="gopy">💬 ส่งข้อเสนอแนะ</button></p>
    <div class="keys">
      <span><kbd>C</kbd></span><span>แท่นตั้งทุ่น: ตัดตะกั่ว ปรับความลึกทุ่น หยั่งพื้น ทำก่อนตีเบ็ด</span>
      <span><kbd>กดเมาส์ค้าง</kbd><kbd>Space</kbd></span><span>สะสมแรงเหวี่ยง ปล่อยเมื่อเข็มเข้าแถบสีเขียวเพื่อให้เหยื่อลงตรงจุดอ่อย</span>
      <span><kbd>คลิก</kbd><kbd>Space</kbd></span><span>วัดเบ็ด (หรือยกคันเพื่อเปลี่ยนเหยื่อใหม่)</span>
      <span><kbd>กดเมาส์ค้าง</kbd><kbd>Space</kbd></span><span>ตอนติดปลา: <b>กดค้าง = งัดคัน</b> (ค่อยๆ ยกคันดึงปลาเข้าฝั่ง), <b>ปล่อย = ผ่อนมือ</b> (คันจะลดลงซับแรงตอนปลาวิ่ง และเก็บสายหย่อนให้อัตโนมัติ)</span>
      <span><kbd>A</kbd><kbd>D</kbd><kbd>←</kbd><kbd>→</kbd></span><span>อัดปลา: วาดคันไปทางซ้าย / ขวา (หรือกดค้างแล้วลากซ้ายขวา) ปลาวิ่งทางไหนให้วาดคันสวนทางตรงข้าม</span>
      <span><kbd>W</kbd><kbd>S</kbd></span><span>ปรับองศาคันด้วยตัวเองระหว่างอัดปลา</span>
      <span><kbd>E</kbd></span><span>ช้อนปลาเมื่อปลาโผล่หัว หมดแรง และเข้ามาใกล้ฝั่ง (ปุ่ม ช้อนปลา จะกะพริบ)</span>
      <span><kbd>V</kbd></span><span>เปิด/ปิดดูใต้น้ำ (โหมดฝึกหัด) เพื่อดูตะกั่ว ตัวเบ็ด และเหยื่อใต้น้ำ</span>
      <span><kbd>B</kbd></span><span>ผสมเหยื่อ: ชามเหยื่อตกและชามเหยื่ออ่อย</span>
      <span><kbd>X</kbd></span><span>เปิด/ปิดอ่อยเหยื่อ — ทุกครั้งที่ตีจะเป็นก้อนเหยื่ออ่อยขนาดใหญ่เพื่อเปิดจุดอ่อย</span>
      <span><kbd>M</kbd></span><span>แผนผังบ่อ: ดูข้อมูลช่อง ลม เครื่องตีน้ำ เพื่อนข้างบ่อ และย้ายที่นั่ง</span>
      <span><kbd>G</kbd></span><span>สลับมุมกล้อง: มุมนั่งตก 3D ↔ หน้าตัด 2D</span>
      <span><kbd>ลากคลิกขวา</kbd><kbd>A</kbd><kbd>D</kbd></span><span>(3D) หันมองรอบบ่อดูเพื่อนข้างบ่ออัดปลา กด <kbd>R</kbd> เพื่อรีเซ็ตมุมกล้อง และเลื่อนลูกกลิ้งเมาส์เพื่อซูมเข้า/ออก</span>
    </div>
    <h3>การเล่นบนมือถือ</h3>
    <p>• แตะค้างเพื่อสะสมแรงเหวี่ยง ปล่อยนิ้วเพื่อตีเบ็ด; แตะหน้าจอเพื่อวัดเบ็ด ตอนติดปลา: <b>แตะค้าง = งัดคัน</b>, <b>ปล่อยนิ้ว = คันช่วยซับแรง</b>, แตะค้างแล้ว<b>ลากซ้ายขวา = บังคับทิศ</b>; กดปุ่ม <b>ช้อนปลา</b> เมื่อปุ่มกะพริบ แนะนำหมุนจอแนวนอนเพื่อให้เห็นบ่อกว้างและทุ่นใหญ่ขึ้น</p>
    <p>• กด <b>เต็มจอ</b> (มุมขวาบน) เพื่อซ่อนแถบเบราว์เซอร์ เครื่อง Android จะหมุนเป็นแนวนอนให้อัตโนมัติ กด <b>ย่อจอ</b> หรือปัดจากขอบจอเพื่อออก</p>
    <p>• <b>iPhone</b>: Safari ไม่อนุญาตให้เว็บเปิดเต็มจอ กดปุ่มแชร์ → <b>“เพิ่มไปยังหน้าจอโฮม”</b> แล้วเปิดเกมจากไอคอนใหม่ (ความคืบหน้าของไอคอนนั้นแยกจาก Safari)</p>
    <p>• <b>Android</b>: เมนูสามจุดใน Chrome → <b>เพิ่มลงในหน้าจอหลัก</b> (หรือติดตั้งแอป) เปิดจากไอคอนจะเข้าเต็มจอแนวนอนทันที</p>
    <p>• ข้อมูลเกมบันทึกในเบราว์เซอร์ของเครื่อง หากล้างข้อมูลเบราว์เซอร์ความคืบหน้าจะหายไป หากเปิดลิงก์จาก LINE หรือ Messenger ควรเปิดด้วย Chrome หรือ Safari</p>
    <h3>การหาเงิน</h3>
    <p>• ขายปลาให้เจ้าของบ่อตอนจบรอบ (บ่อชั่งกิโล) รับโบนัสปลาติดแท็ก รางวัลชั่งปล่อย และเงินรางวัลศึกวันอาทิตย์</p>
    <p>• <b>📋 ภารกิจ</b>: ภารกิจเริ่มต้นสำหรับมือใหม่ (ตั้งทุ่น ผสมเหยื่อ อ่อยเปิดจุด ตกปลา…) ภารกิจรายวัน 3 ข้อใหม่ทุกวัน และเป้าหมายสะสม ทำเสร็จรับเงินทันที</p>
    <p>• <b>👥 ชวนเพื่อนตกปลา</b> (โหมดออนไลน์): หน้าต่าง ภารกิจ → <b>ส่งคำเชิญ</b> ผ่าน LINE หรือ Messenger เพื่อนใหม่ที่เข้าเล่นผ่านลิงก์คุณและตกปลาตัวแรกได้ → คุณรับ ${CC.Quests ? U.fmtMoney(CC.Quests.MOI_PAY) : 100} ฿ (${CC.Quests && CC.Quests.MOI_MAX > 0 ? 'สูงสุด ' + CC.Quests.MOI_MAX + ' คน' : 'ไม่จำกัดจำนวนเพื่อน'}) ชวนและรับรางวัลบนเบราว์เซอร์เดียวกัน</p>
    <p>• <b>กระเป๋าแห้ง</b> (เงินไม่พอซื้อตั๋วถูกที่สุด): ในหน้า เลือกบ่อ จะมีปุ่ม <b>ช่วยงานเจ้าของบ่อ</b> — ทำงานที่บ่อ 1 วัน รับ ${CC.Quests ? U.fmtMoney(CC.Quests.WORK_PAY) : 300} ฿ แล้วเช้าวันรุ่งขึ้นไปตกปลาต่อ</p>
    <h3>การงัดปลาและอัดปลา</h3>
    <p class="btnrow" style="align-items:center">รูปแบบการควบคุมตอนอัดปลา:
      <button data-act="fightctl" data-v="hold" class="${CC.P && CC.P.fightCtl === 'aim' ? '' : 'good'}">กดค้างเพื่ออัด (เล่นง่าย)</button>
      <button data-act="fightctl" data-v="aim" class="${CC.P && CC.P.fightCtl === 'aim' ? 'good' : ''}">เลื่อนเมาส์ปรับมุมคัน (คลาสสิก)</button></p>
    <p>• <b>แถบแรงตึงสาย</b> (ด้านบน): ขีดสีขาวคือความทนทานสายหน้า หากแถบพุ่งเป็นสีแดงและแถบฟิวส์ด้านล่างยาวขึ้นเรื่อยๆ แปลว่าสายหน้าใกล้ขาด — <b>รีบปล่อยมือทันที</b> คันจะลดลงช่วยซับแรง</p>
    <p>• เมื่อเห็นแจ้งเตือน <b>⚡ กำลังจะวิ่ง / กำลังจะสะบัดหัว</b> (ปลาตะเพียนจีน: <b>กำลังจะผงกหัว</b>) แปลว่าปลากำลังจะพุ่ง — ปล่อยมือก่อน พอปลาหยุดนิ่ง กลับหัว หรือหมดแรง ค่อยกดค้างเพื่อดึงปลาเข้ามา</p>
    <p>• <b>อัดปลาเลข 8</b>: ปลาวิ่งไปทางขวาให้วาดคันไปทางซ้าย (และกลับกัน) — ปลาจะหมดแรงเร็ว กลับหัวไว และไม่ล้ำเข้าช่องข้างๆ กรอบมุมขวาบนคือแผนที่จากมุมสูง: เส้นประคือแนวสายของเพื่อนข้างบ่อ หากปลาข้ามไปนานสายจะพันกันและปลาหลุด</p>
    <p>• ปลายังมีแรงอย่าเพิ่งรีบงัดพ้นน้ำ: ปลาจะสะบัดหลุดเบ็ดง่าย พอปลาหมดแรงให้งัดให้หัวโผล่ <b>จิบน้ำ</b> — ปลาจะหมดแรงเร็วมาก — แล้วค่อยพยุงเข้าฝั่ง พอกดปุ่ม <b>ช้อนปลา</b> กะพริบก็ช้อนได้เลย ปลาเล็ก (ต่ำกว่าครึ่งโล; สายหน้า 0.4 ต่ำกว่า ~3.5 ขีด) ยกขึ้นฝั่งได้เลย ตัวใหญ่กว่านั้นต้องช้อนสวิง</p>
    <p>• เลือกสายให้เหมาะกับขนาดปลา: สายหน้าเล็กติดปลาง่ายกว่า แต่เจอปลาใหญ่ต้องรู้จักผ่อนคันและอัดอย่างนุ่มนวลถึงจะเอาขึ้นได้</p>
    <p>• อัดปลาใหญ่ด้วยคันยาวแบบงัดค้างไม่ยอมปล่อยจะทำให้ <b>เมื่อยแขน</b> (วงงัดเปลี่ยนเป็นสีส้ม "ล้าแล้ว") แรงดึงลดลงและสู้ยืดเยื้อ: ปล่อยมือสัก 2–3 วินาทีจังหวะปลาวิ่งให้คันรับแรงแทน แขนจะได้พัก</p>
    <h3>มุมกล้อง 3D ที่นั่งตก</h3>
    <p>• ตอนติดปลา เลื่อนเมาส์ <b>ขึ้น / ลง</b> เพื่อยกหรือลดคัน มาตรวัดสีด้านซ้ายแสดงองศาคัน (พยายามรักษาให้อยู่ในแถบสีเขียว)</p>
    <p>• สังเกต <b>ฟองปลาเล็กๆ ในจุดอ่อย</b>: ยิ่งปลาเข้าจุดอ่อยเยอะ ฟองยิ่งถี่ ปลาสะบัดหัวปลายคันจะสั่นถี่ และเมื่อได้ยินเสียงสายหวีดแปลว่าแรงตึงจวนถึงขีดจำกัดสายหน้า — รีบลดคันลงเบาๆ</p>
    <p>• หากปลายังมีแรงแล้วเห็นฝั่ง มันจะพุ่งหนีกลับออกไปอีก — อย่าฝืนงัดค้างจังหวะนั้น</p>
    <h3>ข้อมูลบ่อตกปลา</h3>
    <p>• <b>บ่อปลานิล สายชล</b>: เจ้าของบ่อรับซื้อปลาคืนตามกิโล ปล่อยปลาเวลา 9:00 น. และ 15:00 น. — ปลาใหม่กินดุและมักรวมตัวแถวซุ้ม (ฝั่งใต้) มีปลาติดแท็กโบนัส 1 ตัว นอกจากปลานิลและปลาทับทิม ยังมีปลายี่สกเทศ ปลาเปคู และปลาเฉา</p>
    <p>• <b>บ่อปลาเฉาดำ ราชันย์ (ชั่งปล่อย)</b>: ปลาไซส์ 6–30 กก. ชั่งเสร็จปล่อยคืนบ่อ รับรางวัลตามช่วงน้ำหนัก มีปลา VIP ติดแท็ก 3 ตัว รางวัล 3,000 ฿ แนะนำคัน 7.2 ม. สายเมน 8 – สายหน้า 6 ตัวเบ็ดเบอร์ 12 หากปลาลากแรงจัดแล้วลดคันต่ำติดน้ำ <b>ปลาจะลากคันตกน้ำ</b></p>
    <p>• <b>ศึกชิงแชมป์วันอาทิตย์</b>: รอบ 4 ชั่วโมง จัดอันดับน้ำหนักรวมแข่งกับนักตกปลากว่า 30 คน รางวัลที่ 1 รับ 3,000 ฿ ในวันธรรมดากด "กลับไปพักผ่อน" เพื่อข้ามวันได้</p>
    <p>• <b>บ่อปลาตะเพียนจีน บึงบัว</b>: น้ำตื้น 1.2–1.6 ม. ฝั่งตะวันตกมีแพผักบุ้ง (แผนผัง M: กอสีเขียวริมฝั่ง) — ปลาตะเพียนจีนชอบหลบใต้ผักบุ้ง โดยเฉพาะตอนแดดจัด เจ้าของบ่อรับซื้อตามกิโล ปลาต่ำกว่า 1 ขีดไม่นับ ปล่อยปลาเวลา 8:30 น. และ 14:30 น. บ่อนี้ปลาซิว (ปลารบกวน) เยอะ ควรใช้ตัวเบ็ดเล็ก สายหน้าเล็ก ทุ่นไว — ดูรายละเอียดในหัวข้อ <b>อ่านอาการทุ่นปลาตะเพียนจีน</b></p>
    <p>• ทุกครั้งที่สายหน้าขาดจะเสียสายหน้าผูกสำเร็จ 1 ชุดและเวลาผูกใหม่ 2 นาที หมดแล้วต้องซื้อที่ร้านค้า</p>
    <p>• <b>ตกแต่ง</b>: สกินกล่องชิงหลิว ร่ม คัน สาย ตัวเบ็ด หางทุ่น หมวก เสื้อ — เปลี่ยนเฉพาะรูปลักษณ์ บางสกินปลดล็อกด้วยความสำเร็จ (ครบ 100 ตัว, แชมป์วันอาทิตย์, ช้อนปลาเฉาดำ 20 กก.)</p>
    <h3>การเปิดจุดอ่อยและผสมเหยื่อ</h3>
    <p>• ช่วงต้นรอบเปิด <b>อ่อยเหยื่อ (X)</b> ตีซ้ำจุดเดิม 10–15 ครั้ง: ทุ่นจะจมหายเพราะเหยื่อก้อนหนัก แล้วค่อยๆ ลอยขึ้นเมื่อเหยื่อละลาย — พอยกคันเหยื่อที่เหลือจะฟุ้งกระจายลงจุดอ่อย ฝูงปลาจะเข้าจุดภายในไม่กี่นาที</p>
    <p>• พอฝูงปลาเข้าจุดแล้วให้ปิดอ่อยเหยื่อ กลับมาใช้เหยื่อตก ค่อยอ่อยเติมเป็นระยะ การอ่อยมากเกินไปจะทำให้ปลาอิ่มและดึงดูดปลารบกวนจนทุ่นกระตุกไม่หยุด</p>
    <p>• สูตรชามเหยื่อตกมาตรฐาน: <b>เหยื่อพื้น ~60%</b>, กลิ่นเสริม (กุ้ง ตับ หอย นมหอม) ~30%, ผงปรับสภาพ (เกล็ดหิมะ รำเบา) ~10%, <b>ผงใยประสานแค่ 5–10%</b> — ใส่มากเกินไปเหยื่อจะเหนียวตายตัวและกลิ่นไม่ออก</p>
    <p>• สัดส่วนน้ำ: <b>เหยื่ออ่อยแห้งสุด (0.6–0.7)</b> ขยี้ให้ร่วนจะได้แตกตัวไว; <b>เหยื่อปั้น 0.7–0.8</b> (ก้อนแน่น กันปลาเล็กตอด); <b>เหยื่อแตะ 0.9–1.0</b> (นุ่ม มีใย ต้องใส่ผงใยประสาน) เหยื่อแฉะไปจะหลุดง่ายตอนตี แห้งไปจะเกาะเบ็ดยาก</p>
    <p>• กลิ่นตามอุณหภูมิน้ำ: <b>น้ำเย็นเน้นคาวเข้ม</b> (ไส้เดือนแดง กุ้ง), <b>อากาศร้อนเน้นรสอ่อน</b> สำหรับปลาตะเพียนจีนและปลาไน ส่วนปลานิลและปลาเปคูอากาศร้อนยังชอบกลิ่นคาวและเปรี้ยว น้ำเย็นสบายกลิ่นหอมจะเด่นสุด เวลาหมักเหยื่อ: อากาศร้อน 5 นาที อากาศหนาว 10–15 นาที</p>
    <p>• เมื่อปลาเข้าจุดแล้วให้ <b>นวดเพิ่ม</b> ที่ชามเหยื่อตกเพื่อให้ละลายช้าลง เม็ดละเอียดลอยตัวช่วยคุมฝูงตะเพียนจีน เม็ดหยาบจมเร็วเรียกปลาใหญ่ สูตรตับและสูตรหอยเน้นปลานิลใหญ่ ปลาไนใหญ่ และปลาเฉาดำ</p>
    <p>• หัวเชื้อเรียกปลา: ปลาปล่อยใหม่ (หลังช่วงทางบ่อปล่อยปลา) ชอบเหยื่อกลิ่นแรง ส่วนปลาเก่าเคี่ยว ถ้าใส่เกิน 1 ฝาปลาจะระแวง ข้าวหมักเหล้าในเหยื่ออ่อยจะติดก้นบ่อนาน จุดอ่อยอยู่ทน</p>
    <p>• การเลือกช่องตกปลา: จุดที่ลมพัดปะทะหน้าคลื่นจะพัดพากลิ่นและฝูงปลามารวม; แดดจัดปลาจะหลบใต้ร่มไม้และจุดน้ำลึก; ช่วงเปิดเครื่องตีน้ำปลาจะรวมตัวใกล้เครื่องตีน้ำ</p>
    <h3>วิธีอ่านอาการทุ่น</h3>
    <p>• ทุ่น<b>ค่อยๆ จมทีละข้อแล้วหยุดนิ่ง</b>: เหยื่อกำลังจมและแตะก้นบ่อแล้ว — รอดูอาการ</p>
    <p>• ขณะกำลังจมแล้ว<b>หยุดชะงัก ไม่ยอมลงถึงข้อตก</b>: ปลางับเหยื่อกลางน้ำ — วัดเลย</p>
    <p>• <b>กระตุกเบาๆ ต่อเนื่อง</b>: ปลาแปบหรือปลาเล็กตอดกวน — อย่าเพิ่งวัด <b>ทุ่นโยกเอียงไปมา</b>: ปลาว่ายชนสาย — อย่าเพิ่งวัด</p>
    <p>• <b>ทุ่นตอกจมคม 1–2 ข้อ</b> หรือ <b>ทุ่นถอนขึ้น 1–2 ข้อแล้วหยุด</b>: ปลาอมเหยื่อเข้าปากแล้ว — <b>วัดทันที</b></p>
    <p>• ทุ่น<b>ค่อยๆ ลอยกลับขึ้นมาที่ข้อตั้ง</b>: เหยื่อละลายหมดแล้ว — ยกคันแล้วตีใหม่ เหยื่อที่ละลายทุกครั้งจะช่วยเสริมจุดอ่อยให้เข้มข้นขึ้น</p>
    <h3>อาการทุ่นปลายี่สกเทศ ปลาเฉา และปลาเปคู</h3>
    <p>• <b>ปลายี่สกเทศ</b>: ทุ่นกระตุกยิบถี่ๆ คือฝูงยี่สกกำลังดูดลองเหยื่อ — อย่าเพิ่งวัด รอให้ทุ่น<b>ตอกสั้นๆ ครึ่งข้อแล้วหยุด</b> หรือ<b>ถอนขึ้นช้าๆ แล้วหยุด</b>ค่อยวัด ปากยี่สกเล็ก: ใช้ตัวเบ็ดเล็ก สายหน้าเล็ก เหยื่อเปรี้ยวนุ่ม</p>
    <p>• <b>ปลาเฉา</b>: ทุ่น<b>จมซึมช้าๆ</b> คือปลากำลังคาบเหยื่อห่างๆ — วัดตอนนี้มักพลาด รอให้ทุ่น<b>จมหายหรือวิ่งออกข้างเต็มตัว</b>แล้วค่อยวัด ชอบกลิ่นหอมข้าวโพด รำหมักเปรี้ยว ปลาเฉาใหญ่ทำสายหน้า 0.8 ขาดได้ง่าย แนะนำใช้สาย 2.0 ขึ้นไป</p>
    <p>• <b>ปลาเปคู</b>: ทุ่น<b>จมวูบหาย</b> หรือ<b>วิ่งพุ่งออกข้าง</b>ให้<b>วัดทันที</b> — ช้าไปปลาจะกลืนลึกและฟันคมจะครูดสายหน้าขาด กินดุช่วงแดดอุ่น ชอบกลิ่นคาว</p>
    <h3>อ่านอาการทุ่นปลาตะเพียนจีน</h3>
    <p>ปลาตะเพียนจีนกินเหยื่อเบามากและคายเหยื่อไวมาก: อาการทุ่นละเอียดอ่อน เห็นจังหวะใช่ให้วัดทันที ช้าไปเสี้ยววินาทีเหยื่อก็หลุดจากปากแล้ว</p>
    <p>• <b>ทุ่นตอดจิ้มเบาๆ แล้วเด้งคืน</b>: ปลาตะเพียนจีนแค่ใช้ปากดันลองเหยื่อ — รอ อย่าเพิ่งวัด</p>
    <p>• <b>ทุ่นถอนขึ้น 1–3 ข้อแล้วหยุด</b>: ปลาตะเพียนจีนอมเหยื่อแล้วเชิดหัวขึ้นจนตะกั่วลอย — <b>วัดทันที</b> จะวัดตั้งแต่ตอนทุ่นกำลังถอนขึ้นก็ได้</p>
    <p>• <b>ทุ่นตอกจมคมครึ่ง–1 ข้อแล้วหยุด</b>: ปลาตะเพียนจีนดูดเหยื่อเข้าปาก — วัดเลย</p>
    <p>• <b>ตอนเที่ยงแดดร้อน ทุ่นแค่ซึมลงช้าๆ ครึ่งข้อ</b>: ปลาตะเพียนจีนอืดเฉื่อย อมเหยื่อแล้วไม่ว่าย — นี่ก็เป็นอาการปลากิน วัดได้เลย</p>
    <p>• <b>ทุ่นลากวิ่งออกข้าง</b>: ปลาตะเพียนจีนคาบเหยื่อว่ายหนี — วัดเลย</p>
    <p>• <b>ปลาตะเพียนจีนใหญ่ถอนทุ่นจนทุ่นนอนราบ</b>: ปลายกตะกั่วพ้นพื้นเต็มที่แล้ว — <b>วัดทันที</b> อย่ารอช้า</p>
    <p>• <b>ทุ่นจมวูบพรวดเดียว</b>: ลูกปลาตะเพียนจีนแย่งเหยื่อ วัดสิบครั้งพลาดเก้า — แนะนำใช้ตัวเบ็ดเบอร์เล็ก</p>
    <p>• <b>ทุ่นเต้นกระโดดขึ้นลงมั่วซั่ว</b> หรือ <b>จมวูบแล้วเด้งคืนทันที</b>: ปลาซิว (ปลารบกวน) รุมกวนเหยื่อ — อย่าไปวัด ปั้นเหยื่อให้แข็ง ก้อนใหญ่ขึ้น ลดคาว และอย่าอ่อยหนาเกินไป</p>
    <p>• <b>ทุ่นเด้งกลับข้อเดิมอย่างรวดเร็ว</b>: ปลาตะเพียนจีนคายเหยื่อไปแล้ว — อย่าเพิ่งวัด รอจังหวะถัดไป</p>
    <p>• <b>ตัวเบ็ดใหญ่ไป</b> (เบอร์ 7, เบอร์ 12): ปากปลาตะเพียนจีนเล็ก อมตัวเบ็ดไม่เข้า วัดแล้วหลุดบ่อย — ใช้ตัวเบ็ดเบอร์เล็ก</p>
    <p>• ปลาตะเพียนจีนกินจัดช่วง <b>เช้าตรู่ เย็นแดดร่ม ฟ้าครึ้ม ฝนปรอย</b> ช่วงเที่ยงแดดจัดจะหลบนิ่งใต้แพผักบุ้ง</p>
    <h3>การอัดปลาโดยไม่มีรอก</h3>
    <p>• สายเบ็ดยาวคงที่ ตัวคันโค้งซับแรงเหมือนสปริง การตั้งคันให้ตั้งฉากกับสายจะช่วยรับแรงได้ดีที่สุด</p>
    <p>• ปลาวิ่งแรง: <b>ลดคันลง วาดตามปลา</b> เพื่อไม่ให้สายหน้าขาด พอสายเริ่มหย่อนให้รีบยกคันขึ้น — ตัวเบ็ดไร้เงี่ยงหลุดง่ายมาก</p>
    <p>• ยกคันหงายหลังเกิน 95° ปลายคันหักได้ง่าย ดึงหัวปลาขึ้นผิวน้ำให้ปลา "จิบน้ำ" จะหมดแรงเร็ว แล้วค่อยพยุงเข้าสวิง</p>`;
PN.catch = d => {
const sp = d.sp, pond = CC.pond(), small = d.w < pond.minW || (!sp.price && d.type !== 'latvot') || sp.tap;
const tag = d.tagged ? `<div class="record">🏷 ปลาติดแท็กของทางบ่อ! ${d.type === 'latvot' ? 'ปลา VIP' : `รับโบนัสทันที ${U.fmtMoney(pond.tag.reward)} ฿`}</div>` : '';
const value = d.type === 'latvot' ? `<div>รางวัลชั่งปล่อย<b class="price">${d.reward ? U.fmtMoney(d.reward) + ' ฿' : '—'}</b></div>`
: d.type === 'giai' ? `<div>คะแนนแข่งขัน<b class="price">${small ? '—' : U.fmtKg(d.w)}</b></div>`
: `<div>ทางบ่อรับซื้อ<b class="price">${small ? '—' : U.fmtMoney(d.w * sp.price) + ' ฿'}</b></div>`;
const btns = d.type === 'latvot'
? `<button class="good" data-act="c-latvot">${d.reward ? 'รับรางวัล &amp; ชั่งปล่อยกลับบ่อ' : 'ปล่อยปลากลับบ่อ'}</button>`
: `<button data-act="c-release">🌊 ปล่อยกลับบ่อ</button><button class="good" data-act="c-keep">🧺 เก็บลงกระชัง</button>`;
return `<div class="catch"><h2>🎣 ${sp.name}!</h2><div class="sub"><i>${sp.sci}</i> · ${d.how === 'ช้อนสวิง' ? 'ช้อนขึ้นสวิง' : 'ยกคันขึ้นฝั่ง'}</div>
      ${d.record ? `<div class="record">${d.first ? '★ ชนิดใหม่ในสมุดบันทึก!' : '★ สถิติใหม่!'}</div>` : ''}${tag}
      <canvas id="catch-cv"></canvas>
      <div class="stats"><div>น้ำหนัก<b>${U.fmtKg(d.w)}</b></div><div>ความยาว<b>${d.len.toFixed(0)} ซม.</b></div>
      ${value}<div>เวลาอัดปลา<b>${d.time.toFixed(0)} วิ</b></div></div>
      ${small ? `<p class="dim">ปลาต่ำกว่าเกณฑ์หรือปลารบกวน — ทางบ่อไม่นับราคา</p>` : ''}
      <div class="btns">${btns}</div></div>`;
};
UI.showCatch = d => {
UI.locked = false;
UI.open('catch', d);
UI.lock();
requestAnimationFrame(() => { const c = $('catch-cv'); if (c) UI.drawFishCard(c, d.sp, null); });
};
UI.onAction = (act, btn) => {
const P = CC.P, G = CC.G, d = btn.dataset;
switch (act) {
case 'sleep': {
const Wd = CC.world;
Wd.day++; Wd.minutes = 5 * 60 + 30; Wd.rollWeather();
CC.Pond.reset(1);
UI.toast(`เช้า${CC.weekdayName(Wd.day)} เวลา ${Wd.clock()} น. — ${CC.WEATHERS[Wd.weather].name}`, 'info');
UI.rerender(); break;
}
case 'buyticket': {
const pond = CC.PONDS_BY_ID[d.id];
if (!pond || P.money < pond.ticket) return;
P.pondId = pond.id;
P.money -= pond.ticket;
const Wd = CC.world;
P.ca = { active: true, day: Wd.day, start: Wd.minutes, end: Wd.minutes + pond.caMinutes, o: null, swap: 1, caught: 0, tags: pond.tag ? pond.tag.n : 0, log: [] };
P.keep = [];
P.bowls = { cau: null, xa: null };
P.stats.cas++;
CC.PondMap.newCa(-1);
CC.Audio.coin();
UI.open('map', { draw: UI.drawSpots() });
break;
}
case 'gomix': UI.open('mix'); break;
case 'buying': {
const ing = CC.ING_BY_ID[d.id];
if (P.money < ing.price) return;
P.money -= ing.price; P.inv[d.id] = (P.inv[d.id] || 0) + ing.pack;
CC.Audio.coin();
UI.rerender(); break;
}
case 'endca': P.ca.active = false; UI.open('weigh'); break;
case 'help': UI.open('help'); break;
case 'lead': P.lead = Math.max(0.1, Math.round((P.lead + +d.d) / CC.LEAD_STEP) * CC.LEAD_STEP); UI.updateSetup(); break;
case 'set': P.set = U.clamp(Math.round((P.set + +d.d) * 2) / 2, 30, 600); UI.updateSetup(); break;
case 'probe': CC.Game.applyRig(); P.set = Math.round(Rig.findBottomSet(G.rig, CC.bottomDepth(G.spotX) * 100) * 2) / 2; UI.updateSetup(); break;
case 'auto': autoTune(+d.n, +d.m); UI.updateSetup(); UI.toast(`ตั้งทุ่นเรียบร้อย: ตั้ง ${d.n} ข้อ · ตก ${d.m} ข้อ`, 'info'); break;
case 'setupdone':
if (!P.bowls || !P.bowls.cau || !P.bowls.xa) { UI.toast('ต่อไปผสมเหยื่อ: เตรียมชามเหยื่ออ่อยสำหรับเปิดจุด และชามเหยื่อตกสำหรับเกี่ยวเบ็ด', 'info'); UI.open('mix'); }
else UI.close();
break;
case 'buy': {
const price = +d.p;
if (P.money < price) return;
P.money -= price; P[d.o].push(d.id); P[d.k] = d.id;
CC.Audio.coin(); CC.Game.applyRig();
UI.toast('ซื้อเรียบร้อย — อย่าลืมตั้งทุ่นใหม่ (C)', 'good');
UI.rerender(); break;
}
case 'equip': P[d.k] = d.id; CC.Game.applyRig(); UI.toast('เปลี่ยนอุปกรณ์แล้ว — อย่าลืมตั้งทุ่นใหม่ (C)', 'info'); UI.rerender(); break;
case 'release': {
const f = P.keep.splice(+d.i, 1)[0];
if (f) P.stats.released++;
UI.rerender(); break;
}
case 'payout': {
const pond = CC.pond();
let total = 0;
if (pond.type === 'kg') total = Math.round(weighBill().reduce((s, b) => s + b.value, 0));
if (pond.type === 'giai') {
const kg = P.keep.filter(f => f.w >= pond.minW && CC.FISH_BY_ID[f.id].price > 0).reduce((s, f) => s + f.w, 0);
const rank = CC.PondMap.ranking(kg, P.keep.length).findIndex(r => r.me) + 1;
total = pond.prizes[rank - 1] || 0;
if (rank === 1) P.giaiWins = (P.giaiWins || 0) + 1;
P.stats.released += P.keep.length;
}
P.money += total; P.stats.earned += total; P.keep = [];
if (total) { CC.Audio.coin(); UI.toast(`ได้รับเงิน ${U.fmtMoney(total)} ฿`, 'good'); }
UI.open('pond'); UI.refresh(); CC.save(); break;
}
case 'c-latvot': {
const c = UI.data;
if (c.reward) { P.money += c.reward; P.stats.earned += c.reward; CC.Audio.coin(); }
if (P.ca) (P.ca.log = P.ca.log || []).push({ name: c.sp.name, w: c.w, reward: c.reward, tagged: c.tagged });
P.stats.released++;
UI.unlockClose();
CC.Render.splash(CC.Render.X(0.6), CC.Render.sy, 14, 1);
UI.toast(c.reward ? `ชั่งปล่อย ${c.sp.name} ${U.fmtKg(c.w)} — รับรางวัล ${U.fmtMoney(c.reward)} ฿` : `ปล่อย ${c.sp.name} กลับบ่อแล้ว`, 'good');
break;
}
case 'fightctl':
P.fightCtl = btn && btn.dataset.v === 'aim' ? 'aim' : 'hold';
UI.toast(P.fightCtl === 'aim' ? 'อัดปลาแบบคลาสสิก: เลื่อนเมาส์ (หรือนิ้ว) เพื่อควบคุมมุมคัน' : 'อัดปลาแบบใหม่: กดค้าง = งัดคัน, ปล่อย = คันซับแรงเอง, ลากซ้ายขวา = คุมทิศ', 'info');
UI.rerender(); break;
case 'cheat':
if (!homeTest()) return;
P.money += 50000;
CC.Audio.coin();
UI.toast('เพิ่มเงินทดสอบ 50,000 ฿ แล้ว', 'good');
UI.rerender(); break;
case 'buyleaders':
if (P.money < 40) return;
P.money -= 40; P.leaders = (P.leaders || 0) + 10; CC.Audio.coin();
UI.rerender(); break;
case 'reset':
if (confirm('ลบข้อมูลทั้งหมดและเริ่มเล่นใหม่ตั้งแต่ต้นใช่หรือไม่?')) {
CC.save = () => {};
try { localStorage.removeItem(UI.SAVE_KEY); } catch (e) {   }
location.reload();
}
break;
case 'c-keep': {
const c = UI.data;
P.keep.push({ id: c.sp.id, w: c.w, len: c.len, at: CC.world.minutes + CC.world.day * 1440 });
UI.unlockClose();
CC.Render.splash(CC.Render.X(0.35), CC.Render.sy, 6, 0.4);
UI.toast(`เก็บ ${c.sp.name} ลงกระชังแล้ว`, 'good');
break;
}
case 'c-release':
P.stats.released++;
UI.unlockClose();
CC.Render.splash(CC.Render.X(0.6), CC.Render.sy, 8, 0.6);
UI.toast(`ปล่อย ${UI.data.sp.name} กลับบ่อแล้ว`, 'info');
break;
}
};
})();
