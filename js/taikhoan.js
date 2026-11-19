(function () {
const UI = CC.UI, SM = CC.SyncModel;
const U$ = k => (CC.U && CC.U.fmtMoney ? CC.U.fmtMoney(k) : String(Math.round(k)));
const $ = id => document.getElementById(id);
const KEY = 'cauca_tk_v1', MSG = 'cauca_tk_msg', HOI_TEN = 'cauca_tk_hoiten', API = '/api/tk', GSI = 'https://accounts.google.com/gsi/client';
const QS = new URLSearchParams(location.search), HOST = location.hostname;
const IS_LOCAL = location.protocol === 'file:' || HOST === 'localhost' || HOST === '127.0.0.1' || HOST === '[::1]' || /\.localhost$/.test(HOST);
const SHARED = ['money', 'leaders', 'rods', 'rod', 'lines', 'line', 'hooks', 'hook', 'floats', 'float'];
const LOCAL = ['view3d', 'fightCtl', 'haptic'];
const PUSH_MS = 60e3, PULL_MS = 20e3;
const T = CC.TaiKhoan = { on: false, busy: false, cfg: null };
let st = {};
let lastRest = null, pushedAt = 0, pulledAt = 0, frozen = false, bad = false, delArm = 0, outArm = 0;
const rid = n => { const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, x => 'abcdefghijklmnopqrstuvwxyz0123456789'[x % 36]).join(''); };
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtDate = t => { const d = new Date(t); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; };
async function idle() { for (let i = 0; i < 80 && T.busy; i++) await new Promise(r => setTimeout(r, 100)); return !T.busy; }
function loadSt() {
try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
if (!st.may) { st.may = rid(16); saveSt(); }
}
function saveSt() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {   } }
const signed = () => !!(st.token && st.base);
const ready = () => T.on && signed() && !frozen && !bad && CC.P;
T.ten = () => (T.on && signed() && st.ten) || '';
T.token = () => (T.on && signed() && st.token) || '';
T.ve = () => (T.on && signed() && st.ve && (st.veHet || 0) - Date.now() > 30 * 60e3 ? st.ve : '');
let xinVeP = null;
T.xinVe = moi => {
if (!T.on || !signed()) return Promise.resolve('');
if (!moi && T.ve()) return Promise.resolve(T.ve());
if (!xinVeP) xinVeP = call({ a: 've', token: st.token }).then(r => {
if (r && r.ok) { setVe(r); saveSt(); return st.ve || ''; }
if (r && r.why === 'het') lost();
return '';
}, () => '').finally(() => { xinVeP = null; });
return xinVeP;
};
function setVe(r) { if (r && typeof r.ve === 'string') { st.ve = r.ve; st.veHet = +r.veHet || 0; } }
T.thuong = o => {
if (!o || typeof o.g !== 'string' || !T.on || !signed()) return false;
st.giai = Array.isArray(st.giai) ? st.giai : [];
if (!st.giai.some(x => x.g === o.g)) { st.giai.push({ g: o.g, i: String(o.i || ''), k: +o.k || 0 }); if (st.giai.length > 12) st.giai.shift(); saveSt(); }
setTimeout(() => push(), 300);
return true;
};
function setTenSt(r) {
if (!r || typeof r.ten !== 'string') return;
const changed = (st.ten || '') !== r.ten;
st.ten = r.ten; st.doiLuc = +r.doiLuc || 0;
if (r.doiNgay != null) st.doiNgay = +r.doiNgay || 0;
if (changed && CC.Moi && CC.Moi.syncName) setTimeout(() => CC.Moi.syncName(), 0);
}
function restOf(P) {
const r = {};
for (const k in P) if (!SHARED.includes(k) && !LOCAL.includes(k)) r[k] = P[k];
return JSON.parse(JSON.stringify(r));
}
const restKey = r => { if (!r) return ''; const c = Object.assign({}, r); delete c.world; delete c.stats; delete c.journal; return JSON.stringify(c); };
function buildP(shared, rest) {
const P = rest ? JSON.parse(JSON.stringify(rest)) : restOf(CC.newProfile());
for (const k of LOCAL) if (CC.P && CC.P[k] !== undefined) P[k] = CC.P[k];
return SM.store(P, shared);
}
function pristine(P) {
const d = SM.diff(SM.pick(P), SM.pick(CC.newProfile()));
return d.empty && !(P.stats && P.stats.cas) && !(P.ca && P.ca.active) && !(P.keep && P.keep.length) && !(P.skins && P.skins.owned && P.skins.owned.length);
}
function mergeRest(srv, loc) {
const r = JSON.parse(JSON.stringify(srv));
r.skins = Object.assign({ owned: [], eq: {} }, r.skins || {});
for (const id of (loc.skins && loc.skins.owned) || []) if (!r.skins.owned.includes(id)) r.skins.owned.push(id);
return r;
}
function reloadWith(P, msg) {
frozen = true;
CC.save = () => {};
try { localStorage.setItem(UI.SAVE_KEY, JSON.stringify(P)); } catch (e) {   }
try { if (msg) sessionStorage.setItem(MSG, msg); } catch (e) {   }
location.reload();
}
async function call(body, keepalive) {
const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: !!keepalive, cache: 'no-store' });
let j = null;
try { j = await r.json(); } catch (e) {   }
if (!j) throw new Error('server ' + r.status);
return j;
}
const WHY = {
google: 'Google ยังไม่ยืนยันการเข้าสู่ระบบครั้งนี้ — กรุณาลองใหม่',
chuabat: 'ผู้ดูแลเกมยังไม่ได้เปิดใช้งานการเข้าสู่ระบบ Google',
het: 'เซสชันหมดอายุแล้ว — กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
sai: 'เซิร์ฟเวอร์บัญชีไม่ยอมรับข้อมูลนี้',
loi: 'เซิร์ฟเวอร์บัญชีขัดข้อง — กรุณาลองใหม่ภายหลัง'
};
const outText = () => (UI.touch ? '📱 บันทึกบนเครื่องนี้ · เข้าสู่ระบบ' : '📱 บันทึกบนเครื่องนี้ · เข้าสู่ระบบ Google');
function badge(txt, cls) {
const el = $('h-sync');
if (!el || !T.on) return;
el.textContent = txt;
el.className = (cls || 'dim') + ' tk-link';
}
const okBadge = () => badge(st.ten ? `☁ ${st.ten} · บันทึกแล้ว` : '☁ บันทึกในบัญชีแล้ว', 'good-txt');
function lost() {
st = { may: st.may };
saveSt();
lastRest = null;
badge(outText(), 'dim');
if (CC.Moi && CC.Moi.syncName) CC.Moi.syncName();
UI.toast('เซสชันบัญชีหมดอายุ — กด "เข้าสู่ระบบ" ที่มุมซ้ายบนเพื่อบันทึกต่อ', 'info', 6000);
if (UI.current === 'tk') UI.rerender();
}
async function push(opt = {}) {
if (!ready() || T.busy) return false;
if (!st.inflight) {
if (opt.resendOnly) return true;
const local = SM.pick(CC.P), delta = SM.diff(local, st.base);
const rest = restOf(CC.P), rk = restKey(rest), sendRest = opt.force || rk !== lastRest;
if (delta.empty && !sendRest && !(st.giai && st.giai.length)) return true;
st.inflight = { pid: rid(12), delta: delta.empty ? null : delta, rest: sendRest ? rest : null, rk, base0: st.base };
if (!delta.empty) st.base = Object.assign(SM.apply(st.base, delta), { rev: st.base.rev });
saveSt();
}
const f = st.inflight;
T.busy = true;
if (!opt.keepalive) badge('☁ กำลังบันทึก…', 'dim');
try {
const giai = st.giai && st.giai.length ? st.giai.slice(0, 6) : null;
const r = await call({ a: 'luu', token: st.token, may: st.may, pid: f.pid, delta: f.delta || undefined, rest: f.rest || undefined, restBase: st.restAt || 0,
giai: giai ? giai.map(x => x.g) : undefined }, opt.keepalive);
if (r && r.ok && giai && Array.isArray(r.giai)) {
const xet = new Set(r.giai.map(x => x && x.i));
for (const x of r.giai) if (x && x.ok) setTimeout(() => UI.toast(`🏆 ได้รับรางวัลการแข่งขันออนไลน์: +${U$(x.t)} ฿ เข้าบัญชีแล้ว`, 'good', 6000), 400);
st.giai = st.giai.filter(x => !xet.has(x.i));
}
if (!r.ok) {
if (r.why === 'het') { lost(); return false; }
if (r.why === 'sai') { st.base = f.base0 || st.base; st.inflight = null; saveSt(); bad = true; badge('⚠ บันทึกบัญชีผิดพลาด — รีเฟรชหน้าเว็บ', 'dim'); return false; }
badge('⚠ ยังบันทึกไม่ได้ — จะลองใหม่อีกครั้ง', 'dim');
return false;
}
const fresh = SM.diff(SM.pick(CC.P), st.base);
st.base = r.shared; st.inflight = null; pushedAt = Date.now();
SM.store(CC.P, SM.apply(r.shared, fresh));
if (r.conflict && r.rest) {
st.restAt = r.restAt; saveSt();
reloadWith(buildP(SM.pick(CC.P), r.rest), '☁ คุณเพิ่งเล่นจากเครื่องอื่น — โหลดความคืบหน้าล่าสุดแล้ว');
return true;
}
if (f.rest) lastRest = f.rk;
st.restAt = r.restAt || st.restAt; st.at = pushedAt;
saveSt(); baseSave(); UI.refresh();
okBadge();
return true;
} catch (e) {
badge('⚠ ยังบันทึกขึ้นบัญชีไม่ได้ — จะลองใหม่อีกครั้ง', 'dim');
return false;
} finally {
T.busy = false;
}
}
async function pull() {
if (!ready() || T.busy) return;
T.busy = true;
try {
const r = await call({ a: 'tai', token: st.token });
pulledAt = Date.now();
if (!r.ok) { if (r.why === 'het') lost(); return; }
st.ma = r.ma || st.ma;
setTenSt(r); setVe(r);
const mine = SM.diff(SM.pick(CC.P), st.base);
const shared = SM.apply(r.shared, mine);
if (r.rest && (r.restAt || 0) > (st.restAt || 0) && r.restBy !== st.may) {
if (!st.inflight) st.base = r.shared;
st.restAt = r.restAt; saveSt();
reloadWith(buildP(shared, r.rest), '☁ โหลดความคืบหน้าล่าสุดจากเครื่องอื่นแล้ว');
return;
}
if (!st.inflight && r.shared.rev !== st.base.rev) {
SM.store(CC.P, shared);
st.base = r.shared; saveSt(); baseSave(); UI.refresh();
if (UI.isOpen() && UI.current && UI.current !== 'setup' && UI.current !== 'mix') UI.rerender();
}
if (lastRest === null) lastRest = r.rest ? restKey(r.rest) : '';
okBadge();
} catch (e) {
badge('⚠ ยังเชื่อมบัญชีไม่ได้ — เล่นชั่วคราวบนเครื่องนี้', 'dim');
} finally {
T.busy = false;
}
}
T.push = push; T.pull = pull;
function inApp() { return /FBAN|FBAV|FB_IAB|FBIOS|Messenger|Instagram|Zalo|Line\/|MicroMessenger|TikTok|musical_ly|BytedanceWebview|; wv\)/i.test(navigator.userAgent || ''); }
function note(html, cls) { const el = $('tk-note'); if (el) { el.innerHTML = html || ''; el.className = 'tk-note' + (cls ? ' ' + cls : ''); } }
async function cfg() {
if (T.cfg) return T.cfg;
const r = await fetch(API, { cache: 'no-store' });
const j = await r.json();
if (j && j.ok) T.cfg = j;
return j;
}
function loadGsi() {
if (window.google && google.accounts && google.accounts.id) return Promise.resolve();
if (T.gsiP) return T.gsiP;
T.gsiP = new Promise((res, rej) => {
const s = document.createElement('script');
s.src = GSI; s.async = true;
s.onload = () => (window.google && google.accounts && google.accounts.id ? res() : rej(new Error('gsi')));
s.onerror = () => rej(new Error('gsi'));
document.head.appendChild(s);
setTimeout(() => rej(new Error('gsi timeout')), 15000);
});
T.gsiP.catch(() => { T.gsiP = null; });
return T.gsiP;
}
const IN_APP = '⚠ คุณกำลังเปิดเกมผ่านเบราว์เซอร์ในแอป (LINE, Facebook, Messenger…): Google มักไม่อนุญาตให้เข้าสู่ระบบที่นี่ กรุณากดปุ่ม <b>⋮</b> หรือ <b>⋯</b> ที่มุมจอ → <b>เปิดในเบราว์เซอร์</b> (Chrome / Safari) แล้วค่อยเข้าสู่ระบบ';
async function mountGoogle() {
const box = $('tk-g');
if (!box) return;
note(inApp() ? IN_APP : 'กำลังโหลดปุ่มเข้าสู่ระบบ Google…', inApp() ? 'warn' : 'dim');
let c;
try { c = await cfg(); } catch (e) { note('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์บัญชีได้ เกมเวอร์ชันนี้อาจยังไม่มีเซิร์ฟเวอร์ — โปรดแจ้งผู้พัฒนาเกม', 'bad'); return; }
if (!c || !c.ok) { note(WHY.loi, 'bad'); return; }
if (!c.google) { note(WHY.chuabat, 'warn'); return; }
try { await loadGsi(); } catch (e) { note('ไม่สามารถโหลดปุ่ม Google ได้ — ตรวจสอบอินเทอร์เน็ตแล้วเปิดหน้าต่างนี้ใหม่', 'bad'); return; }
if (UI.current !== 'tk' || !$('tk-g')) return;
if (T.inited !== c.google) {
google.accounts.id.initialize({ client_id: c.google, callback: onCred, ux_mode: 'popup', auto_select: false, cancel_on_tap_outside: true, context: 'signin' });
T.inited = c.google;
}
const b = $('tk-g');
b.innerHTML = '';
google.accounts.id.renderButton(b, { type: 'standard', theme: 'filled_blue', size: 'large', text: 'signin_with', shape: 'pill', logo_alignment: 'left', locale: 'th', width: Math.max(200, Math.min(300, b.clientWidth || 260)) });
note(inApp() ? IN_APP : '', inApp() ? 'warn' : '');
}
async function onCred(resp) {
if (!resp || !resp.credential || frozen) return;
if (!(await idle())) { note('กำลังบันทึกข้อมูลอยู่ — กดเข้าสู่ระบบใหม่อีกครั้งในอีกสักครู่', 'warn'); return; }
T.busy = true;
note('กำลังเข้าสู่ระบบ…', 'dim');
let r;
try { r = await call({ a: 'vao', cred: resp.credential, may: st.may }); } catch (e) { r = null; }
T.busy = false;
if (!r) { note('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์บัญชีได้ — ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่', 'bad'); return; }
if (!r.ok) { note(WHY[r.why] || WHY.loi, 'bad'); return; }
const P = CC.P, wasOut = !!st.prev;
st = { may: st.may, token: r.token, ma: r.ma, base: r.shared, restAt: r.restAt || 0, at: Date.now() };
setTenSt(r); setVe(r);
T.nhacTen = !r.ten;
bad = false;
if (r.moi) {
saveSt(); lastRest = null;
const ok = await push({ force: true });
UI.toast(ok ? `☁ สร้างบัญชี ${r.ma} และบันทึกความคืบหน้าแล้ว — ตั้งชื่อผู้เล่นได้เลย!` : '☁ เข้าสู่ระบบแล้ว — จะบันทึกความคืบหน้าขึ้นคลาวด์เมื่อเชื่อมต่อได้', 'good', 6000);
if (UI.current === 'tk') UI.rerender(); else if (!UI.locked) UI.open('tk');
return;
}
saveSt();
try { if (!r.ten) sessionStorage.setItem(HOI_TEN, '1'); } catch (e) {   }
if (!wasOut && !pristine(P)) {
reloadWith(buildP(SM.mergeFirst(SM.pick(P), r.shared), r.rest ? mergeRest(r.rest, restOf(P)) : restOf(P)),
`☁ เข้าสู่ระบบบัญชี ${r.ma} แล้ว — รวมความคืบหน้าบนเครื่องนี้เข้ากับบัญชีเรียบร้อย`);
} else {
reloadWith(buildP(r.shared, r.rest || restOf(P)), `☁ เข้าสู่ระบบบัญชี ${r.ma} แล้ว — โหลดความคืบหน้าเรียบร้อย`);
}
}
async function signOut() {
if (frozen || !(await idle())) return;
const ok = await push({ force: true });
if (!ok) { UI.toast('ยังบันทึกขึ้นบัญชีไม่สำเร็จ — ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่ เพื่อไม่ให้ความคืบหน้าล่าสุดหาย', 'bad', 6000); return; }
try { await call({ a: 'ra', token: st.token }); } catch (e) {   }
try { if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); } catch (e) {   }
st = { may: st.may, prev: 1 };
saveSt();
const P = CC.newProfile();
for (const k of LOCAL) if (CC.P && CC.P[k] !== undefined) P[k] = CC.P[k];
reloadWith(P, '🚪 ออกจากระบบแล้ว เครื่องนี้จะรีเซ็ตเหมือนเริ่มใหม่ — ข้อมูลยังอยู่ในบัญชี เข้าสู่ระบบใหม่ได้ทุกเมื่อ');
}
async function delAcc() {
if (frozen || !st.token || !(await idle())) return;
let r = null;
try { r = await call({ a: 'xoa', token: st.token }); } catch (e) { r = null; }
if (!r || (!r.ok && r.why !== 'het')) { UI.toast('ยังลบไม่ได้ — ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่', 'bad'); return; }
st = { may: st.may };
saveSt(); lastRest = null;
badge(outText(), 'dim');
if (CC.Moi && CC.Moi.syncName) CC.Moi.syncName();
UI.toast('🗑 ลบบัญชีบนเซิร์ฟเวอร์แล้ว (ชื่อผู้เล่นถูกปล่อยคืนแล้ว) ความคืบหน้ายังคงอยู่บนเครื่องนี้ (โหมดผู้เยี่ยมชม)', 'info', 6000);
if (UI.current === 'tk') UI.rerender();
}
function ago(t) {
if (!t) return 'ยังไม่มี';
const s = Math.max(0, (Date.now() - t) / 1000);
return s < 50 ? 'เมื่อสักครู่' : s < 3600 ? `${Math.round(s / 60)} นาทีที่แล้ว` : s < 86400 ? `${Math.round(s / 3600)} ชั่วโมงที่แล้ว` : `${Math.round(s / 86400)} วันที่แล้ว`;
}
const WHY_TEN = {
trong: 'กรุณากรอกชื่อก่อน',
dodai: 'ชื่อต้องมีความยาว 3 ถึง 20 ตัวอักษร',
kytu: 'ชื่อต้องประกอบด้วยตัวอักษร ตัวเลข ช่องว่าง และ . _ - โดยต้องมีตัวอักษรอย่างน้อย 2 ตัว',
trung: 'ชื่อนี้มีผู้เล่นอื่นใช้แล้ว — ลองชื่ออื่น (หรือเติมตัวอักษร/ตัวเลขเพิ่ม)',
giurieng: 'ชื่อนี้สงวนไว้สำหรับผู้ดูแลเกม — กรุณาเลือกชื่ออื่น',
cam: 'ชื่อมีคำไม่เหมาะสม — กรุณาเลือกชื่ออื่น'
};
function tenHtml() {
const ngay = st.doiNgay || 30;
if (!st.ten || T.doiTen) {
return `<div class="tk-ten">
        <label for="tk-ten-in"><b>${st.ten ? '✏️ เปลี่ยนชื่อผู้เล่น' : '✏️ ตั้งชื่อผู้เล่น'}</b> — เพื่อนจะเห็นชื่อนี้เมื่อคุณชวนมาตกปลาด้วยกัน</label>
        <div class="tk-ten-row"><input id="tk-ten-in" type="text" maxlength="20" autocomplete="off" spellcheck="false" placeholder="เช่น เซียนชิงหลิว" value="${esc(T.tenNhap != null ? T.tenNhap : st.ten || '')}">
          <button class="good" data-act="tk-ten">${st.ten ? 'เปลี่ยนชื่อ' : 'ตั้งชื่อ'}</button>${st.ten ? '<button data-act="tk-tenhuy">ยกเลิก</button>' : ''}</div>
        <p class="tk-note${T.tenLoi ? ' bad' : ''}" id="tk-ten-note">${esc(T.tenLoi || '')}</p>
        <p class="dim tk-small">3–20 ตัวอักษร: ตัวอักษร ตัวเลข ช่องว่าง และ . _ - หนึ่งบัญชีมีหนึ่งชื่อไม่ซ้ำใคร (ตัวพิมพ์เล็ก/ใหญ่ถือว่าซ้ำกัน) หลังตั้งชื่อแล้วสามารถแก้ไขได้ทันทีหนึ่งครั้ง จากนั้นต้องรอ ${ngay} วันจึงจะเปลี่ยนได้อีก</p></div>`;
}
const can = !st.doiLuc || st.doiLuc <= Date.now();
return `<div class="tk-ten">👤 ชื่อผู้เล่น: <b class="tk-ten-b">${esc(st.ten)}</b>
      ${can ? '<button class="tk-doi" data-act="tk-doiten">เปลี่ยนชื่อ</button>' : `<span class="dim tk-small">· เปลี่ยนชื่อได้อีกครั้งวันที่ ${fmtDate(st.doiLuc)}</span>`}</div>`;
}
async function datTen() {
const inp = $('tk-ten-in');
const v = inp ? inp.value : '';
T.tenNhap = v;
if (frozen || !st.token || !(await idle())) return;
T.busy = true;
const nt = $('tk-ten-note');
if (nt) { nt.textContent = 'กำลังตรวจสอบชื่อ…'; nt.className = 'tk-note dim'; }
let r = null;
try { r = await call({ a: 'ten', token: st.token, ten: v }); } catch (e) { r = null; }
T.busy = false;
if (!r) { T.tenLoi = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ — ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่'; if (UI.current === 'tk') UI.rerender(); return; }
if (!r.ok) {
if (r.why === 'het') { lost(); return; }
T.tenLoi = r.why === 'chuadoi' ? `ยังไม่สามารถเปลี่ยนชื่อได้ — เปลี่ยนได้อีกครั้งตั้งแต่วันที่ ${fmtDate(r.doiLuc)}` : (WHY_TEN[r.why] || WHY[r.why] || WHY.loi);
if (UI.current === 'tk') UI.rerender();
return;
}
setTenSt(r); setVe(r); saveSt();
T.tenLoi = ''; T.tenNhap = null; T.doiTen = false; T.nhacTen = false;
okBadge();
UI.toast(`👤 ชื่อผู้เล่นของคุณคือ: ${r.ten}`, 'good', 5000);
if (UI.current === 'tk') UI.rerender();
}
document.addEventListener('keydown', e => { if (e.target && e.target.id === 'tk-ten-in' && e.key === 'Enter') { e.preventDefault(); datTen(); } });
document.addEventListener('input', e => { if (e.target && e.target.id === 'tk-ten-in') T.tenNhap = e.target.value; });
UI.PANELS.tk = () => {
if (!T.on) {
if (CC.Sync && CC.Sync.enabled) {
return `<h2>👤 บัญชี</h2><p>คุณกำลังเล่นผ่านเซิร์ฟเวอร์ส่วนตัว: ความคืบหน้าจะซิงค์อัตโนมัติตามโปรไฟล์ <b>${esc((CC.Sync && CC.Sync.player && CC.Sync.player()) || 'minh')}</b> โดยไม่ต้องเข้าสู่ระบบ</p>`;
}
return `<h2>👤 บัญชี</h2><p>📱 <b>บันทึกบนเครื่องนี้</b> — ความคืบหน้าทั้งหมด (เงิน อุปกรณ์ตกปลา สมุดบันทึกปลา เหยื่อ ของตกแต่ง และภารกิจ) จะถูกบันทึกไว้ในเบราว์เซอร์ของเครื่องนี้โดยอัตโนมัติ ไม่ต้องเข้าสู่ระบบ</p>`;
}
if (signed()) {
return `<h2>👤 บัญชี</h2>
        <div class="sub">เข้าสู่ระบบ Google แล้ว · รหัสผู้เล่น <b class="tk-ma">${st.ma || ''}</b></div>
        ${tenHtml()}
        <p>☁ ความคืบหน้าจะบันทึกลงบัญชีอัตโนมัติประมาณทุก 1 นาที และทุกครั้งที่ออกจากเกม บันทึกล่าสุด: <b>${ago(st.at)}</b></p>
        <p class="dim">เล่นบนเครื่องอื่น: เปิดเกมแล้วกดแถบ <b>📱 บันทึกบนเครื่องนี้ · เข้าสู่ระบบ</b> ที่มุมซ้ายบน จากนั้นเข้าสู่ระบบด้วยบัญชี Google เดียวกัน แนะนำให้เล่นทีละเครื่อง: เครื่องที่บันทึกทีหลังจะเป็นฝ่ายกำหนดกระชัง เหยื่อ และรอบตกปลาปัจจุบัน (ส่วนเงิน อุปกรณ์ และสมุดบันทึกจะทบยอดให้ครบเสมอ)</p>
        <div class="btnrow"><button class="good" data-act="tk-luu">☁ บันทึกตอนนี้</button><button data-act="tk-ra">${outArm > Date.now() ? 'กดอีกครั้งเพื่อออกจากระบบ' : '🚪 ออกจากระบบ'}</button></div>
        <p class="dim tk-small">ออกจากระบบ: เครื่องนี้จะรีเซ็ตเหมือนเริ่มใหม่ แต่ความคืบหน้ายังอยู่ในบัญชี <a href="riengtu.html" target="_blank" rel="noopener">ความเป็นส่วนตัว</a> ·
          <button class="tk-del" data-act="tk-xoa">${delArm > Date.now() ? 'กดอีกครั้งเพื่อลบถาวร' : 'ลบบัญชีออกจากเซิร์ฟเวอร์'}</button></p>`;
}
return `<h2>👤 บัญชี</h2>
      <div class="sub">เข้าสู่ระบบ Google เพื่อเก็บความคืบหน้า — เงิน อุปกรณ์ตกปลา สมุดบันทึกปลา เหยื่อ ของตกแต่ง และภารกิจ เปลี่ยนมือถือ เล่นบนคอม หรือเผลอล้างข้อมูลเบราว์เซอร์ก็ยังกลับมาเล่นต่อได้</div>
      <div class="tk-g" id="tk-g"></div>
      <p class="tk-note" id="tk-note"></p>
      <p class="dim tk-small">ไม่บังคับ: หากไม่เข้าสู่ระบบก็ยังเล่นได้ตามปกติ โดยบันทึกไว้บนเครื่องนี้ เกมจะเก็บเฉพาะรหัสอ้างอิงแบบไม่ระบุตัวตนจากบัญชี Google — ไม่เก็บอีเมล ชื่อจริง หรือรูปโปรไฟล์ของคุณ <a href="riengtu.html" target="_blank" rel="noopener">ความเป็นส่วนตัว</a></p>`;
};
UI.afterOpen.tk = () => { if (T.on && !signed()) mountGoogle(); };
const baseAct = UI.onAction;
UI.onAction = function (act, btn) {
if (act === 'tk-ten') { datTen(); return; }
if (act === 'tk-doiten') { T.doiTen = true; T.tenNhap = null; T.tenLoi = ''; UI.rerender(); setTimeout(() => { const i = $('tk-ten-in'); if (i) i.focus(); }, 30); return; }
if (act === 'tk-tenhuy') { T.doiTen = false; T.tenNhap = null; T.tenLoi = ''; UI.rerender(); return; }
if (act === 'tk-mo') { if (!UI.locked) UI.open('tk'); return; }
if (act === 'tk-luu') {
idle().then(() => push({ force: true })).then(ok => { UI.toast(ok ? '☁ บันทึกลงบัญชีเรียบร้อยแล้ว' : 'ยังบันทึกไม่ได้ — ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่', ok ? 'good' : 'bad'); if (UI.current === 'tk') UI.rerender(); });
return;
}
if (act === 'tk-ra') {
if (outArm > Date.now()) { outArm = 0; signOut(); } else { outArm = Date.now() + 6000; UI.rerender(); }
return;
}
if (act === 'tk-xoa') {
if (delArm > Date.now()) { delArm = 0; delAcc(); } else { delArm = Date.now() + 6000; UI.rerender(); }
return;
}
if (act === 'reset' && T.on && signed()) {
if (confirm('คุณกำลังเข้าสู่ระบบบัญชี Google อยู่ การเริ่มเล่นใหม่จะเป็นการออกจากระบบบนเครื่องนี้และรีเซ็ตเครื่องนี้ใหม่ทั้งหมด แต่ข้อมูลในบัญชียังอยู่ครบ (เข้าสู่ระบบใหม่เพื่อเล่นต่อได้) หากต้องการลบบัญชีถาวรให้ไปที่หน้าต่าง 👤 บัญชี ต้องการดำเนินการต่อหรือไม่?')) signOut();
return;
}
return baseAct.apply(this, arguments);
};
const PN = UI.PANELS, baseHelp = PN.help;
if (baseHelp) PN.help = function () {
const html = baseHelp.apply(this, arguments);
if (!T.on) return html;
const sec = `<h3>บัญชี Google</h3>
      <p>• ไม่เข้าสู่ระบบก็เล่นได้ตามปกติ ความคืบหน้าจะบันทึกไว้บนเครื่องนี้ (หากเปลี่ยนเครื่องหรือล้างข้อมูลเบราว์เซอร์ข้อมูลจะหาย)</p>
      <p>• กดแถบ <b>📱 บันทึกบนเครื่องนี้ · เข้าสู่ระบบ</b> ที่มุมซ้ายบน → <b>เข้าสู่ระบบด้วย Google</b> จากนั้นความคืบหน้าจะซิงค์ขึ้นบัญชีอัตโนมัติทุกนาทีและก่อนออกจากเกม ไปเครื่องอื่นก็เข้าสู่ระบบบัญชีเดิมเพื่อเล่นต่อได้เลย</p>
      <p>• หากเปิดเกมผ่านแอป LINE / Facebook แล้วเข้าสู่ระบบ Google ไม่ได้ ให้กด <b>⋮</b> → <b>เปิดในเบราว์เซอร์</b> ก่อน</p>
      <p>• <b>ชื่อผู้เล่น:</b> หลังเข้าสู่ระบบให้ตั้งชื่อในหน้าต่าง 👤 บัญชี ชื่อจะไม่ซ้ำกับใคร (ตัวพิมพ์เล็ก/ใหญ่ถือว่าซ้ำกัน) เพื่อนจะเห็นชื่อนี้เวลาคุณชวนมาตกปลา หลังตั้งแล้วแก้ได้ทันที 1 ครั้ง จากนั้นต้องรอ ${st.doiNgay || 30} วัน</p>
      <p>• เกมเก็บเฉพาะรหัสอ้างอิงแบบไม่ระบุตัวตน ไม่เก็บอีเมล ชื่อจริง หรือรูปโปรไฟล์ มีปุ่มออกจากระบบและลบบัญชีในหน้าต่าง 👤 บัญชี</p>`;
const at = html.indexOf('<h3>การหาเงิน</h3>');
return at >= 0 ? html.slice(0, at) + sec + html.slice(at) : html + sec;
};
function hoiTen() {
let f = null;
try { f = sessionStorage.getItem(HOI_TEN); if (f) sessionStorage.removeItem(HOI_TEN); } catch (e) { f = null; }
if (f && signed() && !st.ten) setTimeout(() => { if (!UI.locked && !frozen) UI.open('tk'); }, 1500);
}
const baseSave = CC.save;
function tick() {
if (!ready() || T.busy || document.hidden) return;
if (st.inflight || Date.now() - pushedAt >= PUSH_MS) push();
}
function boot() {
T.on = !(CC.Sync && CC.Sync.enabled) && location.protocol.indexOf('http') === 0 && (!IS_LOCAL || QS.get('tk') === '1');
if (!T.on) {
const el = $('h-sync');
if (el && !(CC.Sync && CC.Sync.enabled)) { el.textContent = '📱 บันทึกบนเครื่องนี้'; el.className = 'dim'; }
return;
}
loadSt();
const el = $('h-sync');
if (el) {
el.title = 'บัญชี Google: เก็บความคืบหน้าไว้เล่นข้ามเครื่อง';
el.setAttribute('role', 'button');
el.addEventListener('click', () => { if (!UI.locked && !frozen) UI.open('tk'); });
}
try { const m = sessionStorage.getItem(MSG); if (m) { sessionStorage.removeItem(MSG); setTimeout(() => UI.toast(m, 'good', 7000), 700); } } catch (e) {   }
if (signed()) {
badge('☁ กำลังเชื่อมต่อบัญชี…', 'dim');
pushedAt = Date.now();
push({ resendOnly: true }).then(() => pull()).then(() => push()).then(hoiTen);
} else badge(outText(), 'dim');
setInterval(tick, 15e3);
document.addEventListener('visibilitychange', () => {
if (!ready()) return;
if (document.hidden) push({ keepalive: true });
else if (Date.now() - pulledAt > PULL_MS) pull();
});
window.addEventListener('pagehide', () => { if (ready()) push({ keepalive: true }); });
}
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
else boot();
})();