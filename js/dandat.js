(function () {
if (typeof window === 'undefined' || !window.CC || !CC.UI || !CC.Game || !CC.Pond) return;
const U = CC.U, UI = CC.UI, Game = CC.Game, Pond = CC.Pond;
const $ = id => document.getElementById(id);
const REST = 3 * Math.PI / 180;
const FISH_W = 0.7, FISH_STAM = 0.8;
const MIN_HOLD = 0.25;
const T = CC.DanDat = { on: false, ph: '', loc: false, tries: 0, q: [] };
const touch = () => !!UI.touch;
const L = {
chaoT: '🎣 ยินดีต้อนรับสู่บ่อตกปลา!',
chaoP: 'เพิ่งมาตกปลาที่บ่อครั้งแรกใช่ไหม? ทางบ่อแจก <b>ตั๋วทดลองตกฟรี 1 ใบ</b> ที่บ่อปลานิล สายชล: คัน ทุ่น และเหยื่อเตรียมไว้ครบแล้ว ทำตาม <b>4 ขั้นตอน</b> ประมาณ 2 นาทีก็ได้ปลาตัวแรกแล้ว',
di: '🎣 ทดลองตกปลาเลย',
thoi: 'ข้ามไปก่อน ฉันตกเป็นแล้ว',
bo: '✕ ข้าม',
quang: () => touch() ? '<b>แตะค้าง</b> บนผิวน้ำเพื่อสะสมแรงเหวี่ยง แล้ว<b>ปล่อยนิ้ว</b>เพื่อตีเบ็ด' : '<b>กดเมาส์ซ้ายค้าง</b> (หรือ Space) เพื่อสะสมแรงเหวี่ยง แล้ว<b>ปล่อย</b>เพื่อตีเบ็ด',
giu: 'กดค้างไว้…',
tha: () => touch() ? '<b>ปล่อยนิ้ว</b> เพื่อตีเบ็ดเลย!' : '<b>ปล่อย</b> เพื่อตีเบ็ดเลย!',
non: () => touch() ? 'ปล่อยเร็วเกินไป <b>แตะค้างให้นานขึ้นอีกนิด</b> แล้วค่อยปล่อยนิ้ว' : 'ปล่อยเร็วเกินไป <b>กดค้างให้นานขึ้นอีกนิด</b> แล้วค่อยปล่อย',
lai: {
doi: 'ยังไม่ทันมีปลากินก็ยกคันขึ้นแล้ว ลองตีใหม่อีกครั้ง คราวนี้<b>รอให้ทุ่นจมลง</b>นะ',
ria: 'วัดเร็วไปหน่อย: ทุ่นแค่กระตุกเบาๆ คือปลากำลังตอด ลองตีใหม่ <b>รอให้ทุ่นจมชัดๆ</b>',
nha: 'ช้าไปนิด ปลาคายเหยื่อไปแล้ว ตีใหม่เลย พอเห็น<b>ทุ่นจมให้รีบวัดทันที</b>',
mat: 'ปลาหลุดไปแล้ว ไม่เป็นไร! <b>ตีเบ็ดใหม่อีกครั้ง</b> เดี๋ยวปลาก็เข้ามากินอีก'
},
chim: 'เหยื่อกำลังจมลงก้นบ่อ ดูที่ <b>กรอบซูมทุ่น</b> มุมขวาบนได้เลย 👉',
cho: 'ทุ่นยังนิ่งอยู่แปลว่ายังไม่กินเหยื่อ รอให้ทุ่น<b>จมลง</b>แล้วค่อยวัดเบ็ด',
ria: 'ทุ่นกระตุกเบาๆ: ปลากำลังตอดเหยื่อ <b>อย่าเพิ่งวัด</b> รอให้ทุ่นจมชัดๆ ก่อน',
giat: () => touch() ? '<b>ทุ่นจมแล้ว!</b> แตะหน้าจอเพื่อ<b>วัดเบ็ด</b>เลย!' : '<b>ทุ่นจมแล้ว!</b> คลิกเมาส์ (หรือ Space) เพื่อ<b>วัดเบ็ด</b>เลย!',
nha: 'ปลาเพิ่งคายเหยื่อออก เดี๋ยวจะกลับมากินใหม่ ทุ่น<b>จมเมื่อไหร่ให้วัดทันที</b>!',
ghi: () => touch() ? 'ติดปลาแล้ว! <b>แตะหน้าจอค้างไว้</b> เพื่อดึงคันงัดปลาเข้าฝั่ง' : 'ติดปลาแล้ว! <b>กดเมาส์ซ้ายค้าง</b> (หรือ Space) เพื่อดึงคันงัดปลาเข้าฝั่ง',
do: () => touch() ? 'แถบแรงตึงเป็น<b>สีแดง</b>แล้ว: <b>ปล่อยนิ้ว</b>ให้คันช่วยซับแรง!' : 'แถบแรงตึงเป็น<b>สีแดง</b>แล้ว: <b>ปล่อยมือ</b>ให้คันช่วยซับแรง!',
tot: () => touch() ? 'ดีมาก แตะ<b>ค้าง</b>ไว้! พอแถบแรงตึงด้านบนเป็น<b>สีแดง</b>ให้<b>ปล่อยนิ้ว</b>สักครู่' : 'ดีมาก กด<b>ค้าง</b>ไว้! พอแถบแรงตึงด้านบนเป็น<b>สีแดง</b>ให้<b>ปล่อยมือ</b>สักครู่',
gan: 'ปลาเข้ามาใกล้แล้ว กด<b>ค้าง</b>ไว้ให้ปลาหมดแรง พอปุ่ม <b>ช้อนปลา</b> สว่างขึ้นให้กดเลย',
vung: () => touch() ? '⚡ ปลากำลังจะพุ่งหนี: <b>ปล่อยนิ้ว</b>ให้คันซับแรง พอปลาหยุดวิ่งค่อย<b>แตะค้าง</b>ใหม่' : '⚡ ปลากำลังจะพุ่งหนี: <b>ปล่อยมือ</b>ให้คันซับแรง พอปลาหยุดวิ่งค่อย<b>กดค้าง</b>ใหม่',
vot: () => touch() ? 'ปลาหมดแรงแล้ว! แตะปุ่ม <b>🥅 ช้อนปลา</b> 👉' : 'ปลาหมดแรงแล้ว! กดปุ่ม <b>🥅 ช้อนปลา</b> (หรือปุ่ม E) 👉',
chuc: '🎉 ปลาตัวแรกของคุณมาแล้ว! กด <b>เก็บลงกระชัง</b> เพื่อเก็บไว้ขายให้เจ้าของบ่อตอนจบรอบ',
boXong: 'ข้ามการแนะนำแล้ว หากต้องการดูวิธีเล่นอีกครั้ง กดปุ่ม ❔ คู่มือ',
tiep: 'ถัดไป ▸',
xong: '🎣 เริ่มตกปลากันเลย!'
};
const BUOC = ['', '1/4 · ตีเบ็ด', '2/4 · ดูอาการทุ่น', '3/4 · อัดปลา', '4/4 · ช้อนปลา'];
const meoList = () => {
const pc = !touch();
const list = [
{ el: 'btn-mix', t: `<b>🥣 ผสมเหยื่อ${pc ? ' (ปุ่ม B)' : ''}</b>: เหยื่อเหมาะกับอากาศปลาจะกินดีขึ้น กดเลือก<b>สูตรแนะนำ</b>แล้วกดผสมได้เลย` },
{ el: 'btn-setup', t: `<b>⚖ ตั้งทุ่น${pc ? ' (ปุ่ม C)' : ''}</b>: เปลี่ยนหลุมหรือเปลี่ยนทุ่นต้องตั้งทุ่นใหม่ มีปุ่มลัด <b>ช่วยตั้งอัตโนมัติ: ตั้ง 4 ตก 2</b> ให้ใช้ด้วย` }
];
if (CC.Online) list.push({ sel: '[data-panel="pond"]', t: '<b>🌐 ตกปลากับเพื่อน</b>: กด <b>🎣 เลือกบ่อ</b> → แถบ <b>เล่นออนไลน์</b> เข้าบ่อเดียวกัน นั่งข้างกัน แข่งตกปลาได้เลย' });
else list.push({ sel: '[data-panel="quest"]', t: '<b>📋 ภารกิจ</b>: ทำภารกิจหาเงินเพิ่มไว้ซื้อตั๋ว เหยื่อ และอุปกรณ์ตกปลา' });
return list;
};
let box = null, buocEl = null, loiEl = null, boBtn = null, tiepBtn = null, vong = null, tay = null, chan = null, chao = null;
let sayKey = null, sayAt = -9, ringKey = null, tayKey = null, boxShown = null;
const mk = (tag, id, cls) => { const e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; return e; };
const stop = e => e.stopPropagation();
function build() {
const game = $('game') || document.body;
if (box) return;
box = mk('div', 'dd-box', 'hidden');
buocEl = mk('span', 'dd-buoc'); loiEl = mk('span', 'dd-loi');
boBtn = mk('button', 'dd-bo'); boBtn.type = 'button'; boBtn.textContent = L.bo; boBtn.title = L.thoi;
tiepBtn = mk('button', 'dd-tiep', 'good hidden'); tiepBtn.type = 'button';
box.append(buocEl, loiEl, tiepBtn, boBtn);
vong = mk('div', 'dd-vong', 'hidden');
tay = mk('div', 'dd-tay', 'hidden');
chan = mk('div', 'dd-chan', 'hidden');
game.append(chan, vong, tay, box);
[boBtn, tiepBtn, chan].forEach(el => el.addEventListener('pointerdown', stop));
boBtn.addEventListener('click', () => skip());
tiepBtn.addEventListener('click', () => nextTip());
}
function unbuild() {
[box, vong, tay, chan, chao].forEach(el => { if (el && el.parentNode) el.parentNode.removeChild(el); });
box = buocEl = loiEl = boBtn = tiepBtn = vong = tay = chan = chao = null;
sayKey = ringKey = tayKey = boxShown = null;
}
function showBox(on) {
if (!box || boxShown === on) return;
boxShown = on;
box.classList.toggle('hidden', !on);
if (!on) { ring(null); finger(null); }
}
function say(buoc, html, cls) {
if (!box) return;
const key = buoc + '|' + html + '|' + (cls || ''), G = CC.G, now = G ? G.t : 0;
if (key === sayKey) return;
if (!cls && sayKey && sayKey.split('|')[0] === String(buoc) && now - sayAt < 1.2 && now >= sayAt) return;
sayKey = key; sayAt = now;
buocEl.textContent = BUOC[buoc] || '';
buocEl.classList.toggle('hidden', !BUOC[buoc]);
loiEl.innerHTML = html;
box.classList.toggle('gap', cls === 'gap');
}
function ring(r, gap) {
if (!vong) return;
const key = r ? [Math.round(r.x), Math.round(r.y), Math.round(r.w), Math.round(r.h), gap ? 1 : 0].join(',') : '';
if (key === ringKey) return;
ringKey = key;
vong.classList.toggle('hidden', !r);
if (!r) return;
const p = 5;
vong.style.left = (r.x - p) + 'px'; vong.style.top = (r.y - p) + 'px';
vong.style.width = (r.w + 2 * p) + 'px'; vong.style.height = (r.h + 2 * p) + 'px';
vong.classList.toggle('gap', !!gap);
}
const rectOf = el => { if (!el) return null; const b = el.getBoundingClientRect(); return b.width > 0 ? { x: b.left, y: b.top, w: b.width, h: b.height } : null; };
const zoomRect = () => { const z = CC.RigDraw && CC.RigDraw.zoomRect; return z ? { x: z.x, y: z.y, w: z.w, h: z.h + 24 } : null; };
function finger(txt) {
if (!tay) return;
const key = txt || '';
if (key === tayKey) return;
tayKey = key;
tay.classList.toggle('hidden', !txt);
if (txt) tay.innerHTML = `<i>${touch() ? '👆' : '🖱'}</i><b>${txt}</b>`;
}
const layout = () => { if (CC.RigDraw && CC.RigDraw.layoutChanged) CC.RigDraw.layoutChanged(); };
const baseToast = UI.toast;
UI.toast = function (msg, type) {
if (T.on && !T.mine) {
if (T.mute) return;
if (T.ph === 'chao' || T.ph === 'len' || T.ph === 'meo') {
if (T.ph !== 'chao' && /^(เก็บ|ปล่อย)/.test(String(msg || ''))) return;
if (T.q.length < 8) T.q.push(Array.prototype.slice.call(arguments));
return;
}
if (T.loc && type !== 'bad' && !/^✅/.test(String(msg || ''))) return;
}
return baseToast.apply(this, arguments);
};
function toast(msg, type, ms) { T.mine = true; try { UI.toast(msg, type, ms); } finally { T.mine = false; } }
function replay() {
T.q.splice(0).forEach((a, i) => setTimeout(() => { try { UI.toast.apply(UI, a); } catch (e) {   } }, 700 + i * 1300));
}
const basePU = Pond.update;
Pond.update = function () {
if (T.loc && Pond.suitor && !Pond.suitor.dd) Pond.suitor = null;
return basePU.apply(this, arguments);
};
const baseStrike = Pond.strike;
Pond.strike = function () {
if (T.loc && Pond.suitor && !Pond.suitor.dd) Pond.suitor = null;
const r = baseStrike.apply(this, arguments);
if (T.loc && r) r.hold = 1;
return r;
};
function inject() {
const b = CC.float().b, acts = [];
if (T.tries === 0) {
acts.push({ type: 'nibble', dur: 0.2, force: 2.4 * b, mouth: false }, { type: 'pause', dur: 0.8 },
{ type: 'nibble', dur: 0.2, force: 2.8 * b, mouth: false }, { type: 'pause', dur: 1.0 });
}
for (let i = 0; i < 6; i++) {
acts.push({ type: 'sink', dur: 6, force: 6 * b, snap: true, snapT: 0.2, mouth: true, hookQ: 3 }, { type: 'pause', dur: 1.3 });
}
T.su = Pond.suitor = { sp: CC.FISH_BY_ID.rophi, w: FISH_W, mood: 0.9, acts, i: 0, t: 0, dd: 1 };
T.bz = false;
}
function onRelease(e) {
const G = CC.G;
if (!T.loc || T.ph !== 'quang' || !G || G.state !== 'charging') return;
if (e && e.type === 'keyup' && e.code !== 'Space') return;
if (T.ct == null || G.t - T.ct < MIN_HOLD) {
G.state = 'hand'; G.power = 0; G.thetaTarget = REST; T.non = true; T.ct = null;
return;
}
if (G.power < 0.72 || G.power > 0.84) G.power = U.rand(0.75, 0.81);
}
['pointerup', 'pointercancel', 'keyup'].forEach(ev => window.addEventListener(ev, onRelease, true));
window.addEventListener('keydown', e => {
if (!T.loc || UI.isOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
const k = (e.key || '').toLowerCase();
if ('cbmxgvnt'.indexOf(k) >= 0 && k.length === 1) e.stopImmediatePropagation();
}, true);
if (CC.Dao && CC.Dao.start) {
const baseDao = CC.Dao.start;
CC.Dao.start = function () { if (T.loc) return; return baseDao.apply(this, arguments); };
}
function act(name, data) {
const b = document.createElement('button');
b.dataset.act = name;
for (const k in data) b.dataset[k] = String(data[k]);
UI.onAction(name, b);
}
function giftBowl() {
const P = CC.P, hot = CC.world.temp >= 27;
const bowl = CC.Bait.makeBowl(hot ? { nen: 4, tanh: 4, ra: 1, soi: 1, chua: 1 } : { nen: 4, tanh: 4, thom: 1, soi: 1 }, hot ? 0.95 : 0.9, 'cau');
bowl.ddStick = bowl.stick; bowl.stick = 1;
P.bowls = P.bowls || { cau: null, xa: null };
P.bowls.cau = bowl;
}
function setup() {
const P = CC.P, G = CC.G, M = CC.PondMap, pond = CC.PONDS_BY_ID.rophi;
UI.locked = false;
if (!(P.ca && P.ca.active)) {
const m0 = P.money;
P.money = Math.max(m0, pond.ticket);
act('buyticket', { id: 'rophi' });
P.money = m0;
}
if (!P.ca || !P.ca.active) throw new Error('ไม่สามารถเริ่มรอบตกปลาได้');
const free = M.spots.filter(sp => !M.npcAt(sp.id)).map(sp => ({ sp, q: M.quality(sp) - (sp.depth > 2.2 ? 1 : 0) })).sort((a, b) => b.q - a.q);
const Q = CC.Quests, emit = Q && Q.emit;
if (Q) Q.emit = function () {};
try {
for (let i = 0; i < Math.min(5, free.length); i++) {
act('pick', { id: free[i].sp.id });
act('auto', { n: 4, m: 2 });
const cau = CC.Rig.cauValue(G.rig, CC.bottomDepth(G.spotX) * 100);
if (!G.tooDeep && cau > 0.8 && cau < 4.5) break;
}
} finally { if (Q) Q.emit = emit; }
giftBowl();
G.xa = P.xa = false;
UI.locked = false;
UI.close();
}
function eligible() {
const P = CC.P;
if (!P || P.dd || !P.stats || P.stats.caught > 0 || (P.journal && Object.keys(P.journal).length)) return false;
try { if (CC.Online && CC.Online.cfg && CC.Online.cfg().bat) return false; } catch (e) {   }
return !!UI.firstRun || (!P.ca && !(P.stats.cas > 0));
}
function welcome() {
T.on = true; T.ph = 'chao'; T.loc = false; T.tries = 0;
build();
chao = mk('div', 'dd-chao');
chao.innerHTML = `<div class="dd-the"><h2>${L.chaoT}</h2><p>${L.chaoP}</p>
      <div class="dd-nut"><button id="dd-di" type="button" class="good">${L.di}</button><button id="dd-thoi" type="button">${L.thoi}</button></div></div>`;
($('game') || document.body).appendChild(chao);
chao.addEventListener('pointerdown', stop);
$('dd-di').addEventListener('click', () => begin());
$('dd-thoi').addEventListener('click', () => skip());
document.body.classList.add('dd-on');
T.iv = setInterval(step, 250);
}
function coach() {
const P = CC.P;
T.on = true; T.loc = true; T.ph = 'quang'; T.caught0 = P.stats.caught; T.ct = null; T.non = false; T.why = '';
build();
if (chao) { chao.remove(); chao = null; }
document.body.classList.add('dd-on', 'dd-an');
layout();
if (!T.iv) T.iv = setInterval(step, 250);
if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
step();
}
function begin() {
const P = CC.P;
if (!T.on || T.ph !== 'chao' || !P) return;
if (CC.Audio && CC.Audio.init) CC.Audio.init();
let ok = true;
T.mute = true;
try { setup(); } catch (e) { ok = false; if (typeof console !== 'undefined') console.error('[แนะนำการเล่น]', e); }
T.mute = false;
if (!ok) { finish(); if (!UI.isOpen() && !(P.ca && P.ca.active)) UI.open('pond'); return; }
P.dd = 2;
coach();
CC.save();
}
function resume() {
const P = CC.P, G = CC.G, ca = P.ca;
if (!(ca && ca.active && ca.o && P.pondId === 'rophi' && P.stats.caught === 0 && !G.tooDeep)) { P.dd = 1; return; }
if (!P.bowls || !P.bowls.cau || P.bowls.cau.portions <= 0) giftBowl();
G.xa = P.xa = false;
coach();
}
function finish(quiet) {
const P = CC.P;
T.on = false; T.loc = false; T.ph = '';
clearInterval(T.iv); T.iv = null;
if (P) {
P.dd = 1;
const b = P.bowls && P.bowls.cau;
if (b && b.ddStick != null) { b.stick = b.ddStick; delete b.ddStick; }
}
unbuild();
document.body.classList.remove('dd-on', 'dd-an', 'dd-meo');
layout();
if (P && !quiet) CC.save();
replay();
}
function skip() {
if (!T.on) return;
const coaching = T.loc;
finish();
if (coaching) toast(L.boXong, 'info', 5000);
}
T.skip = skip;
const baseShow = UI.showCatch;
UI.showCatch = function () {
const r = baseShow.apply(this, arguments);
if (T.on && T.loc) { try { landed(); } catch (e) {   } }
return r;
};
function landed() {
const P = CC.P;
T.loc = false; T.ph = 'len';
if (P) P.dd = 1;
showBox(false);
document.body.classList.remove('dd-an');
layout();
const c = document.querySelector('#panel-body .catch'), btns = c && c.querySelector('.btns');
if (c) {
const d = mk('div', null, 'dd-chuc'); d.innerHTML = L.chuc;
c.classList.add('dd-co');
c.insertBefore(d, btns || null);
const pn = $('panel');
if (pn && pn.scrollHeight > pn.clientHeight + 4) pn.scrollTop = pn.scrollHeight;
}
}
let tips = null, tipI = 0;
function startTips() {
T.ph = 'meo'; tips = meoList(); tipI = -1;
document.body.classList.add('dd-meo');
chan.classList.remove('hidden');
boBtn.classList.add('hidden'); tiepBtn.classList.remove('hidden');
nextTip();
}
function nextTip() {
if (T.ph !== 'meo' || !tips) return;
tipI++;
if (tipI >= tips.length) { finish(); return; }
const tp = tips[tipI];
sayKey = null;
buocEl.textContent = `เคล็ดลับ ${tipI + 1}/${tips.length}`; buocEl.classList.remove('hidden');
loiEl.innerHTML = tp.t;
box.classList.remove('gap');
tiepBtn.textContent = tipI === tips.length - 1 ? L.xong : L.tiep;
boxShown = null; showBox(true);
ring(rectOf(tp.el ? $(tp.el) : document.querySelector(tp.sel)));
}
let netAt = -9, netRect = null;
function step() {
const P = CC.P, G = CC.G;
if (!T.on || !P || !G || !box) return;
if (T.ph === 'chao') { if (P.dd || P.stats.caught > 0) finish(true); return; }
if (T.loc && (P.stats.caught > T.caught0 || !P.ca || !P.ca.active)) { finish(); return; }
if ((CC.Dao && CC.Dao.on) || (CC.Xem && CC.Xem.on)) { showBox(false); return; }
if (T.ph === 'len') { if (!UI.isOpen()) startTips(); return; }
if (T.ph === 'meo') {
const open = UI.isOpen();
if (open === !!boxShown) { chan.classList.toggle('hidden', open); if (open) showBox(false); else { tipI--; nextTip(); } }
return;
}
if (UI.isOpen()) { showBox(false); return; }
showBox(true);
const dt = Math.max(0, Math.min(0.25, G.t - (T.lt == null ? G.t : T.lt)));
T.lt = G.t;
if (G.state === 'fighting' && G.fight && T.ph !== 'keo') { T.ph = 'keo'; T.heldT = 0; finger(null); }
switch (T.ph) {
case 'quang':
if (G.xa) G.xa = P.xa = false;
if (!(P.leaders > 0)) P.leaders = 3;
if (G.state === 'hand') {
T.ct = null;
say(1, T.non ? L.non() : T.why ? L.lai[T.why] : L.quang(), T.non ? 'nhac' : '');
finger('กดค้าง'); ring(null);
} else if (G.state === 'charging') {
if (T.ct == null) T.ct = G.t;
const ok = G.t - T.ct >= MIN_HOLD;
say(1, ok ? L.tha() : L.giu, 'nhac'); finger(ok ? 'ปล่อย' : 'กดค้าง');
} else { T.ph = 'chim'; T.non = false; T.why = ''; T.last = 'doi'; finger(null); }
break;
case 'chim':
if (G.state === 'flying' || G.state === 'sinking') { say(2, L.chim); ring(zoomRect()); }
else if (G.state === 'waiting') { T.ph = 'cho'; T.t0 = G.t; T.su = null; T.last = 'doi'; }
else again('doi');
break;
case 'cho': {
if (G.state !== 'waiting' && G.state !== 'sinking') { again(T.last); break; }
const su = Pond.suitor, mine = su && su === T.su;
if (!mine) {
if (T.su) { T.su = null; T.t0 = G.t - 1.5; }
if (G.state === 'waiting' && G.t - T.t0 >= (T.tries ? 2 : 3.5)) inject();
else { say(2, L.cho); ring(zoomRect()); T.last = 'doi'; }
break;
}
const a = su.acts[su.i];
if (a && a.mouth) {
say(2, L.giat(), 'gap'); ring(zoomRect(), true); T.last = 'chim';
if (!T.bz) { T.bz = true; UI.buzz([40, 60, 40]); }
} else if (a && a.type === 'nibble') { say(2, L.ria, 'nhac'); ring(zoomRect()); T.last = 'ria'; }
else if (T.last === 'chim' || T.last === 'nha') { say(2, L.nha, 'nhac'); ring(zoomRect()); T.last = 'nha'; T.bz = false; }
else if (T.last !== 'ria') { say(2, L.cho); ring(zoomRect()); }
break;
}
case 'keo': {
const F = G.fight;
if (G.state !== 'fighting' || !F) { again('mat'); break; }
if (!F.dd) { F.dd = 1; F.yieldP = 1; F.stamina = Math.min(F.stamina, FISH_STAM); T.heldT = 0; }
if (Game.holding()) T.heldT += dt;
const over = F.overAcc > 0.04 || F.Ts > CC.line().leader;
if (F.landable) {
say(4, L.vot(), 'nhac');
if (!netRect || G.t - netAt > 0.4 || G.t < netAt) { netAt = G.t; netRect = rectOf($('a-net')); }
ring(netRect, true);
} else {
netRect = null; ring(null);
if (over) say(3, L.do(), 'gap');
else if (F.warn && T.heldT >= 1.5) say(3, L.vung(), 'nhac');
else if (T.heldT < 1.5) say(3, L.ghi(), 'nhac');
else if (F.fx < 3.2 && F.stamina < 0.6) say(3, L.gan);
else say(3, L.tot());
}
break;
}
}
}
function again(why) {
T.why = why === 'chim' ? 'nha' : why; T.tries++; T.ph = 'quang'; T.su = null; T.ct = null;
ring(null); sayKey = null;
}
const baseTick = Pond.tick;
Pond.tick = function () {
const r = baseTick.apply(this, arguments);
if (T.on && T.loc) { try { step(); } catch (e) { if (typeof console !== 'undefined') console.error('[แนะนำการเล่น]', e); } }
return r;
};
window.addEventListener('resize', () => { if (T.on) { ringKey = null; netRect = null; if (T.ph === 'meo') { tipI--; nextTip(); } } });
function boot() {
const P = CC.P;
if (!P || !CC.G || !$('game')) return;
if (P.dd === 2) { resume(); return; }
if (eligible()) welcome();
}
T.thu = () => { if (T.on) finish(true); if (CC.P) { delete CC.P.dd; } T.q.length = 0; welcome(); };
T.step = step;
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
else setTimeout(boot, 0);
})();
