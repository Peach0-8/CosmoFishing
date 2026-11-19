(function () {
const U = CC.U, UI = CC.UI, PN = UI.PANELS;
const $ = id => document.getElementById(id);
const Q = CC.Quests = { MULT: 1, DAILY_N: 3, WORK_PAY: 300, MOI_PAY: 100, MOI_MAX: 0 };
const INTRO = [
{ id: 'tune', t: 'ตั้งทุ่นครั้งแรก (ตั้งทุ่น → ปุ่ม “ตั้ง 4 ตก 2”)', r: 50, ev: 'tune' },
{ id: 'mix', t: 'ผสมเหยื่อให้ครบทั้งชามเหยื่อตกและชามเหยื่ออ่อย', r: 50, ev: 'mix', ok: () => CC.P.bowls && CC.P.bowls.cau && CC.P.bowls.xa },
{ id: 'xa', t: 'เปิดโหมดอ่อยเหยื่อ ตีเหยื่ออ่อย 10 ลูกเพื่อเปิดจุดอ่อย', r: 80, ev: 'cast', n: 10, f: d => d.kind === 'xa' },
{ id: 'hook', t: 'อ่านทุ่นแล้ววัดเบ็ดติดปลา 3 ครั้ง', r: 80, ev: 'hook', n: 3 },
{ id: 'fish', t: 'ตกปลาตัวแรกขึ้นมาให้ได้', r: 100, ev: 'catch' },
{ id: 'diec', t: 'ตกปลาตะเพียนจีนให้ได้ 1 ตัว', r: 100, ev: 'catch', f: d => d.sp.id === 'diec' },
{ id: 'kg1', t: 'ตกปลาที่มีน้ำหนักตั้งแต่ 1 กก. ขึ้นไป 1 ตัว', r: 150, ev: 'catch', f: d => d.w >= 1 },
{ id: 'lai', t: 'จบรอบตกปลาแบบมีกำไร (เงินค่าปลาและรางวัล ≥ ค่าตั๋ว)', r: 150, ev: 'payout', f: d => d.profit >= 0 }
];
const MILES = [
{ id: 'c10', t: 'ตกปลารวม 10 ตัว', r: 200, of: c => c.fish, n: 10 },
{ id: 'c30', t: 'ตกปลารวม 30 ตัว', r: 400, of: c => c.fish, n: 30 },
{ id: 'c100', t: 'ตกปลารวม 100 ตัว', r: 1000, of: c => c.fish, n: 100 },
{ id: 'kg20', t: 'ตกปลารวมครบ 20 กก.', r: 500, of: c => c.kg, n: 20, unit: ' กก.' },
{ id: 'sp3', t: 'ตกปลาครบ 3 ชนิดที่แตกต่างกัน', r: 200, of: c => Object.keys(c.sp).length, n: 3 },
{ id: 'sp5', t: 'ตกปลาครบ 5 ชนิดที่แตกต่างกัน', r: 500, of: c => Object.keys(c.sp).length, n: 5 },
{ id: 'ca5', t: 'ตกครบ 5 รอบ (ชั่งปลากับเจ้าของบ่อ)', r: 300, of: c => c.ca, n: 5 }
];
const DAILY = [
{ id: 'n', t: n => `ตกปลาให้ได้ ${n} ตัว`, n: [4, 8], per: 25, ev: 'catch' },
{ id: 'kg', t: n => `ตกปลารวม ${n.toLocaleString('th-TH')} กก. ในวันนี้`, n: [2, 5], per: 60, ev: 'catch', add: d => d.w, unit: ' กก.' },
{ id: 'diec', t: n => `ตกปลาตะเพียนจีนให้ได้ ${n} ตัว`, n: [3, 6], per: 40, ev: 'catch', f: d => d.sp.id === 'diec' },
{ id: 'rophi', t: n => `ตกปลานิลหรือปลาทับทิมให้ได้ ${n} ตัว`, n: [3, 6], per: 35, ev: 'catch', f: d => d.sp.id === 'rophi' || d.sp.id === 'dieuhong' },
{ id: 'hook', t: n => `วัดเบ็ดติดปลา ${n} ครั้ง`, n: [5, 10], per: 15, ev: 'hook' },
{ id: 'xa', t: n => `ตีเหยื่ออ่อยเปิดจุดอ่อย ${n} ลูก`, n: [8, 14], per: 8, ev: 'cast', f: d => d.kind === 'xa' },
{ id: 'lai', t: () => 'จบรอบตกปลาแบบมีกำไร', n: [1, 1], per: 200, ev: 'payout', f: d => d.profit >= 0 },
{ id: 'troi', t: n => `ตกปลายี่สกเทศหรือปลาเปคูให้ได้ ${n} ตัว`, n: [2, 4], per: 45, ev: 'catch', f: d => d.sp.id === 'troi' || d.sp.id === 'chimtrang' },
{ id: 'tramco', t: () => 'ตกปลาเฉาขึ้นมาให้ได้ 1 ตัว', n: [1, 1], per: 150, ev: 'catch', f: d => d.sp.id === 'tramco' }
];
const DAILY_BY_ID = {};
DAILY.forEach(d => { DAILY_BY_ID[d.id] = d; });
const fmtN = (x, unit) => unit ? (Math.round(x * 100) / 100).toLocaleString('th-TH') : String(Math.floor(x));
function S() {
const P = CC.P;
if (!P.quests) P.quests = { day: -1, daily: [], done: {}, prog: {}, cnt: { fish: 0, kg: 0, sp: {}, ca: 0 }, fresh: 0 };
return P.quests;
}
function rollDaily(q) {
q.day = CC.world.day;
const pool = DAILY.slice();
q.daily = [];
while (q.daily.length < Q.DAILY_N && pool.length) {
const tp = pool.splice((Math.random() * pool.length) | 0, 1)[0];
const n = tp.add ? Math.round(U.rand(tp.n[0], tp.n[1]) * 2) / 2 : U.randi(tp.n[0], tp.n[1]);
const r = Math.round(Math.max(60, n * tp.per) * Q.MULT / 10) * 10;
q.daily.push({ id: tp.id, n, r, p: 0, done: false });
}
}
function ensureDay(q, quiet) {
if (q.day === CC.world.day) return;
const first = q.day < 0;
rollDaily(q);
if (!quiet && !first) UI.toast('📋 ภารกิจใหม่วันนี้: ' + q.daily.map(it => DAILY_BY_ID[it.id].t(it.n)).join(' · '), 'info', 6000);
}
function pay(q, text, r) {
const P = CC.P, k = Math.round(r);
P.money += k;
q.fresh = (q.fresh || 0) + 1;
if (CC.Audio && CC.Audio.coin) CC.Audio.coin();
UI.toast(`✅ ภารกิจสำเร็จ: ${text} — +${U.fmtMoney(k)} ฿`, 'good', 4500);
UI.refresh();
badge();
CC.save();
}
function finish(q, key, text, r) { q.done[key] = 1; pay(q, text, r * Q.MULT); }
Q.give = (text, r) => pay(S(), text, r);
Q.emit = (ev, d) => {
if (!CC.P) return;
const q = S();
d = d || {};
ensureDay(q);
if (ev === 'catch') { q.cnt.fish++; q.cnt.kg = Math.round((q.cnt.kg + (d.w || 0)) * 1000) / 1000; if (d.sp) q.cnt.sp[d.sp.id] = 1; }
if (ev === 'payout') q.cnt.ca++;
for (const it of INTRO) {
const key = 'i:' + it.id;
if (q.done[key] || it.ev !== ev || (it.f && !it.f(d)) || (it.ok && !it.ok())) continue;
const p = (q.prog[key] || 0) + 1;
if (p >= (it.n || 1)) { delete q.prog[key]; finish(q, key, it.t, it.r); } else q.prog[key] = p;
}
for (const it of q.daily) {
const tp = DAILY_BY_ID[it.id];
if (!tp || it.done || tp.ev !== ev || (tp.f && !tp.f(d))) continue;
it.p = Math.round((it.p + (tp.add ? tp.add(d) : 1)) * 100) / 100;
if (it.p >= it.n) { it.p = it.n; it.done = true; pay(q, tp.t(it.n), it.r); }
}
for (const m of MILES) {
const key = 'm:' + m.id;
if (!q.done[key] && m.of(q.cnt) >= m.n) finish(q, key, m.t, m.r);
}
};
const openPonds = () => CC.PONDS.filter(p => p.weekday == null || CC.weekday(CC.world.day) === p.weekday);
Q.minTicket = () => Math.min(...openPonds().map(p => p.ticket));
Q.broke = () => !(CC.P.ca && CC.P.ca.active) && CC.P.money < Q.minTicket();
Q.workBox = () => !Q.broke() ? '' : `<div class="qwork"><div><b>กระเป๋าแห้งแล้วเหรอ?</b> ช่วยงานเจ้าของบ่อหนึ่งวัน: ให้อาหารปลา กวาดริมบ่อ ช่วยลูกค้าช้อนปลา
    เจ้าของบ่อจ่ายให้ <b class="price">${U.fmtMoney(Q.WORK_PAY)} ฿</b> แล้วพรุ่งนี้เช้ามาตกต่อ</div><button class="good" data-act="work">🧹 ช่วยงานเจ้าของบ่อ (+${U.fmtMoney(Q.WORK_PAY)} ฿)</button></div>`;
Q.work = () => {
if (!Q.broke()) return;
const P = CC.P, Wd = CC.world, k = Math.round(Q.WORK_PAY);
P.money += k;
Wd.day++; Wd.minutes = 5 * 60 + 30; Wd.rollWeather();
CC.Pond.reset(1);
if (CC.Audio && CC.Audio.coin) CC.Audio.coin();
UI.toast(`ช่วยงานที่บ่อทั้งวัน: ให้อาหารปลา กวาดริมบ่อ ช่วยลูกค้าช้อนปลา เจ้าของบ่อจ่ายให้ ${U.fmtMoney(k)} ฿ เช้า${CC.weekdayName(Wd.day)} ${Wd.clock()} น. มาตกต่อกันเลย!`, 'good', 6000);
UI.rerender();
};
const bar = (p, n) => `<div class="qbar"><i style="width:${U.clamp(p / n * 100, 0, 100).toFixed(0)}%"></i></div>`;
function row(text, p, n, r, done, unit) {
const showP = n > 1 || unit;
if (done) p = n;
return `<div class="qrow${done ? ' done' : ''}"><span class="qi">${done ? '✅' : '⬜'}</span><span class="qt">${text}</span>
      <span class="qp">${showP ? `${fmtN(Math.min(p, n), unit)}/${fmtN(n, unit)}${unit || ''}` : ''}</span><b class="qr">+${U.fmtMoney(r)} ฿</b>
      ${showP && !done ? bar(p, n) : ''}</div>`;
}
PN.quest = () => {
const q = S();
ensureDay(q, true);
const daily = q.daily.map(it => { const tp = DAILY_BY_ID[it.id]; return tp ? row(tp.t(it.n), it.p, it.n, it.r, it.done, tp.unit) : ''; }).join('');
const introLeft = INTRO.filter(it => !q.done['i:' + it.id]).length;
const intro = INTRO.map(it => row(it.t, q.prog['i:' + it.id] || 0, it.n || 1, Math.round(it.r * Q.MULT), !!q.done['i:' + it.id])).join('');
const miles = MILES.map(m => row(m.t, m.of(q.cnt), m.n, Math.round(m.r * Q.MULT), !!q.done['m:' + m.id], m.unit)).join('');
const introSec = `<h3>เริ่มต้นใช้งาน${introLeft ? ` — เหลืออีก ${introLeft}` : ' — สำเร็จครบแล้ว'}</h3><div class="qlist">${intro}</div>`;
return `<h2>📋 ภารกิจ</h2>
      <div class="sub">ทำภารกิจเพื่อหาเงินเพิ่มไว้ซื้อตั๋ว เหยื่อ สายหน้า และอุปกรณ์ตกปลา ทำเสร็จรับเงินทันที เงิน: <b class="price">${U.fmtMoney(CC.P.money)} ฿</b></div>
      ${Q.workBox()}
      ${introLeft ? introSec : ''}
      <h3>วันนี้ · ${CC.weekdayName(CC.world.day)} <span class="dim" style="text-transform:none;letter-spacing:0;font-weight:400">— พรุ่งนี้เช้ามีภารกิจใหม่</span></h3><div class="qlist">${daily}</div>
      ${CC.Moi ? CC.Moi.questBox() : ''}
      <h3>เป้าหมายสะสม</h3><div class="qlist">${miles}</div>
      ${introLeft ? '' : introSec}`;
};
UI.afterOpen.quest = () => {
S().fresh = 0; badge();
const b = document.querySelector('[data-panel="quest"]');
if (b) b.classList.remove('glow');
};
Q.pondBox = () => {
const q = S();
ensureDay(q, true);
const left = q.daily.filter(it => !it.done);
const sum = left.length ? left.map(it => `${DAILY_BY_ID[it.id].t(it.n)} (+${U.fmtMoney(it.r)} ฿)`).join(' · ') : 'ทำครบหมดแล้ว พรุ่งนี้เช้ามีภารกิจใหม่';
return `${Q.workBox()}<div class="qsum">📋 <b>ภารกิจวันนี้:</b> ${sum} <button data-act="quests">ดูภารกิจ</button></div>${CC.Moi ? CC.Moi.pondBox() : ''}`;
};
function badge() {
const el = $('h-qbadge');
if (!el || !CC.P) return;
const n = (CC.P.quests && CC.P.quests.fresh) || 0;
el.textContent = n;
el.classList.toggle('hidden', !n);
}
Q.badge = badge;
const base = UI.onAction;
UI.onAction = function (act, btn) {
if (act === 'work') return Q.work();
if (act === 'quests') return UI.open('quest');
const P = CC.P;
let before = 0, pond = null, lv = 0;
if (act === 'payout') {
before = P.money; pond = CC.pond();
lv = ((P.ca && P.ca.log) || []).reduce((s, x) => s + (x.reward || 0), 0);
}
const r = base.apply(this, arguments);
if (act === 'auto' || act === 'setupdone') Q.emit('tune');
if (act === 'payout' && pond) {
const got = pond.type === 'latvot' ? lv : P.money - before;
Q.emit('payout', { pond: pond.id, total: got, profit: got - pond.ticket });
}
return r;
};
const tick = UI.tick;
UI.tick = function () {
const r = tick.apply(this, arguments);
if (CC.P && CC.P.quests && CC.P.quests.day !== CC.world.day) { ensureDay(CC.P.quests); badge(); }
return r;
};
window.addEventListener('DOMContentLoaded', () => setTimeout(() => {
if (!CC.P) return;
ensureDay(S(), true);
badge();
const b = document.querySelector('[data-panel="quest"]');
if (b && UI.firstRun) {
b.classList.add('glow');
setTimeout(() => UI.toast('📋 มือใหม่: ทำภารกิจเพื่อหาเงินเพิ่ม กดปุ่ม ภารกิจ ที่มุมบนเพื่อดูรายละเอียด', 'info', 7000), 1500);
}
}, 300));
})();
