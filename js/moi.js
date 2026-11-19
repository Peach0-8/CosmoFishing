(function () {
const U = CC.U, UI = CC.UI, Q = CC.Quests;
const $ = id => document.getElementById(id);
const KEY = 'cauca_moi_v1', API = '/api/moi';
const QS = new URLSearchParams(location.search), HOST = location.hostname;
const IS_LOCAL = location.protocol === 'file:' || HOST === 'localhost' || HOST === '127.0.0.1' || HOST === '[::1]' || /\.localhost$/.test(HOST);
const CODE_RE = /^[2-9A-HJKMNP-Z]{6}$/;
const POLL_MS = 10 * 60e3, POLL_FOR = 3 * 3600e3, MIN_GAP = 60e3;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cleanName = s => String(s == null ? '' : s).normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f<>"'&\\`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
const rid = n => { const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, x => 'abcdefghijklmnopqrstuvwxyz0123456789'[x % 36]).join(''); };
const pay = () => U.fmtMoney(Q.MOI_PAY);
const pad = x => String(x).padStart(2, '0');
const fmtAt = at => { if (!at) return ''; const d = new Date(at); return `${pad(d.getHours())}:${pad(d.getMinutes())} ${d.getDate()}/${d.getMonth() + 1}`; };
const st = (() => {
let s = null;
try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
s = Object.assign({ id: '', code: '', of: '', ten: '', tenSrv: '', by: '', byTen: '', sent: 0, why: '', n: 0, paid: 0, got: 0, ban: [], shared: 0, seen: 0 }, s || {});
if (!/^[a-z0-9]{12,32}$/.test(s.id)) s.id = rid(16);
if (s.code && !s.of) s.of = s.code;
return s;
})();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {   } };
const M = CC.Moi = { st, msg: '', msgCls: '', err: '' };
M.on = () => !(CC.Sync && CC.Sync.enabled) && location.protocol.indexOf('http') === 0 && (!IS_LOCAL || QS.get('moi') === '1');
const TK = () => CC.TaiKhoan || {};
const myName = () => (TK().ten && TK().ten()) || '';
const myTk = () => (TK().token && TK().token()) || '';
const ERR = {
chuabat: 'เซิร์ฟเวอร์เชิญเพื่อนยังไม่ได้เปิดใช้งานบนหน้านี้',
mang: 'อินเทอร์เน็ตช้าหรือเซิร์ฟเวอร์ไม่ว่าง ยังเชื่อมต่อไม่ได้ กด “ตรวจสอบ” เพื่อลองใหม่'
};
const WHY = { tuminh: 'ไม่สามารถเชิญตัวเองได้', daco: 'เครื่องนี้เคยนับคำเชิญของคนอื่นไปแล้ว', khongco: 'ไม่พบรหัสเชิญนี้แล้ว', sai: 'รหัสเชิญไม่ถูกต้อง' };
async function call(body) {
let r;
try {
r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' });
} catch (e) { throw Object.assign(new Error('network'), { kind: 'mang' }); }
let j = null;
try { j = await r.json(); } catch (e) { j = null; }
if (!j || typeof j !== 'object') throw Object.assign(new Error('disabled'), { kind: r.status === 404 || r.status === 405 ? 'chuabat' : 'mang' });
if (r.status >= 500) throw Object.assign(new Error('server error'), { kind: 'mang' });
return j;
}
function useCode(code) {
if (st.of !== code) { st.n = 0; st.paid = 0; st.ban = []; st.of = code; }
st.code = code;
}
let regP = null;
function ensureCode() {
if (st.code) return Promise.resolve(st.code);
if (!regP) {
const n = myName();
regP = call({ a: 'tao', id: st.id, tk: myTk() }).then(j => {
if (!j.ok || !CODE_RE.test(j.code)) throw Object.assign(new Error(j.why || 'sai'), { kind: 'mang' });
useCode(j.code); st.tenSrv = n; save();
return j.code;
}).finally(() => { regP = null; });
}
return regP;
}
function register() {
if (!M.on() || st.code) return;
M.err = ''; live();
ensureCode().then(() => { M.err = ''; live(); }, e => { M.err = e.kind || 'mang'; live(); });
}
M.syncName = () => {
if (!st.code || !M.on()) return;
const n = myName();
if (n === st.tenSrv) return;
call({ a: 'tao', id: st.id, tk: myTk() }).then(j => {
if (!j.ok || !CODE_RE.test(j.code)) return;
useCode(j.code); st.tenSrv = n; save(); live();
}, () => {   });
};
const link = () => st.code ? location.origin + location.pathname.replace(/[^/]*$/, '') + '?moi=' + st.code : '';
const inviteText = () => { const n = myName(); return `${n ? n + ' ชวนคุณ' : 'ชวนคุณ'}มาเล่นเกม ชิงหลิว บ่อตกปลา 🎣 — เกมตกปลาชิงหลิวบ่อเหมา เล่นได้ทันทีบนมือถือและคอม ไม่ต้องติดตั้ง กดลิงก์เพื่อเข้าบ่อได้เลย:`; };
function needCode() {
live('กำลังขอรหัสเชิญ…');
ensureCode().then(() => { M.err = ''; live('ได้รหัสเชิญแล้ว — กดปุ่มอีกครั้งเพื่อส่ง', 'good-txt'); }, e => { M.err = e.kind || 'mang'; live(''); });
}
function share() {
if (!st.code) return needCode();
st.shared = Date.now(); save();
const url = link(), text = inviteText();
if (navigator.share) {
navigator.share({ title: 'ชิงหลิว บ่อตกปลา', text, url }).then(
() => live('ส่งคำเชิญแล้ว เมื่อเพื่อนเข้าเล่นและตกปลาตัวแรกได้ คุณจะได้รับรางวัล', 'good-txt'),
e => { if (!e || e.name !== 'AbortError') copy(text + ' ' + url); });
return;
}
copy(text + ' ' + url);
}
function copy(txt) {
st.shared = Date.now(); save();
const done = () => UI.toast('📋 คัดลอกคำเชิญแล้ว — นำไปวางส่งให้เพื่อนใน LINE หรือ Messenger ได้เลย', 'good', 4500);
const old = () => {
const ta = document.createElement('textarea');
ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, txt.length);
let ok = false;
try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
ta.remove();
if (ok) done(); else window.prompt('คัดลอกข้อความเชิญนี้แล้วส่งให้เพื่อน:', txt);
};
if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, old);
else old();
}
let pollP = null;
function poll(force) {
if (!M.on() || !st.code) return Promise.resolve();
if (pollP) return pollP;
if (!force && Date.now() - st.seen < MIN_GAP) return Promise.resolve();
pollP = call({ a: 'xem', code: st.code, id: st.id }).then(j => {
st.seen = Date.now(); M.err = '';
if (!j.ok) {
if (j.why === 'khongco' || j.why === 'khongphai') st.code = '';
save(); return;
}
st.n = Math.max(0, j.n | 0);
st.ban = (Array.isArray(j.ban) ? j.ban : []).slice(-50).map(x => ({ t: cleanName(x.t), at: +x.at || 0 }));
save();
payNew();
}, e => { M.err = e.kind || 'mang'; }).finally(() => { pollP = null; live(); });
return pollP;
}
M.poll = poll;
function payNew() {
const cap = Q.MOI_MAX > 0 ? Q.MOI_MAX : Infinity;
const due = Math.min(st.n, cap) - st.paid;
if (due <= 0 || !CC.P) return;
const names = st.ban.slice(-due).map(b => b.t || 'เพื่อนใหม่');
const k = due * Q.MOI_PAY;
st.paid += due; st.got += k; save();
const who = due === 1 ? names[names.length - 1] || 'เพื่อนใหม่คนหนึ่ง'
: `${due} เพื่อนใหม่${names.length ? ' (' + names.slice(-3).join(', ') + (due > 3 ? '…' : '') + ')' : ''}`;
Q.give(`${who} เข้ามาเล่นจากคำเชิญของคุณ`, k);
if (UI.isOpen() && UI.current === 'quest') UI.rerender();
}
const isNew = () => { const P = CC.P, s = (P && P.stats) || {}; return !!P && !(s.caught > 0) && !(s.cas > 0) && !(st.n > 0); };
function readLink() {
let sp;
try { sp = new URLSearchParams(location.search); } catch (e) { return null; }
if (!sp.has('moi')) return null;
const raw = sp.get('moi') || '';
sp.delete('moi');
const rest = sp.toString();
try { history.replaceState(history.state, '', location.pathname + (rest ? '?' + rest : '') + location.hash); } catch (e) {   }
const code = raw.toUpperCase().replace(/[^0-9A-Z]/g, '');
return CODE_RE.test(code) ? code : '';
}
const showPond = () => { if (UI.isOpen() && UI.current === 'pond' && !UI.locked) UI.open('pond'); };
function arrive(code) {
if (!code) return UI.toast('ลิงก์เชิญไม่ครบ — ขอให้เพื่อนส่งลิงก์มาใหม่อีกครั้งนะ คุณยังเล่นต่อได้ตามปกติ', 'info', 6000);
if (code === st.code) return UI.toast(`นี่คือลิงก์เชิญของคุณเอง ส่งลิงก์นี้ให้เพื่อน: เพื่อนใหม่แต่ละคนที่เข้าตกปลาจะได้รางวัลคนละ ${pay()} ฿`, 'info', 7000);
if (st.by) { if (st.by !== code) UI.toast('เครื่องนี้เคยรับคำเชิญจากผู้เล่นคนอื่นมาก่อนแล้ว', 'info', 5000); return; }
if (!isNew()) return UI.toast('สิทธิ์คำเชิญใช้ได้เฉพาะผู้เล่นใหม่ — เครื่องนี้เคยเล่นมาก่อนแล้ว ขอให้สนุกกับการตกปลานะ!', 'info', 6000);
st.by = code; st.byTen = ''; st.sent = 0; st.why = ''; save();
showPond();
call({ a: 'ai', code }).then(j => {
if (j.ok) { st.byTen = cleanName(j.ten); save(); }
else if (j.why === 'khongco' || j.why === 'sai') {
st.by = ''; save(); showPond();
return UI.toast('ไม่พบรหัสเชิญในลิงก์นี้ คุณยังเล่นต่อได้ตามปกติ!', 'info', 6000);
}
welcome();
}, () => welcome());
}
function welcome() {
const n = st.byTen;
UI.toast(n ? `🎣 ${n} ชวนคุณมาตกปลาด้วยกัน! ตกปลาตัวแรกได้แล้ว ${n} จะได้รับโบนัสชวนเพื่อน ${pay()} ฿`
: `🎣 มีเพื่อนชวนคุณมาตกปลา! ตกปลาตัวแรกได้แล้วผู้ชวนจะได้รับโบนัส ${pay()} ฿`, 'good', 9000);
showPond();
}
let repP = null;
function report() {
if (!st.by || st.sent || !M.on() || repP) return;
repP = call({ a: 'xong', code: st.by, id: st.id, tk: myTk() }).then(j => {
if (j.ok) {
st.sent = Date.now(); if (j.ten) st.byTen = cleanName(j.ten); save();
if (!j.again) setTimeout(() => UI.toast(`🎉 ปลาตัวแรกขึ้นแล้ว! ${st.byTen || 'ผู้ชวนของคุณ'} ได้รับโบนัสชวนเพื่อน ${pay()} ฿ คุณเองก็มีลิงก์เชิญส่วนตัวเช่นกัน: 📋 ภารกิจ → ชวนเพื่อนมาตกปลาด้วยกัน`, 'good', 8000), 1800);
} else if (WHY[j.why]) { st.sent = -1; st.why = j.why; save(); }
}, () => {   }).finally(() => { repP = null; });
}
const emit = Q.emit;
Q.emit = function (ev) {
const r = emit.apply(this, arguments);
if (ev === 'catch') report();
return r;
};
function liveHtml() {
const out = [];
if (st.code) out.push(`<div class="moi-link"><span class="dim">ลิงก์เชิญของคุณ (รหัส <b>${st.code}</b>):</span><input id="moi-url" type="text" readonly value="${esc(link())}"></div>`);
else if (!M.err) out.push('<div class="dim">กำลังขอรหัสเชิญ…</div>');
const cap = Q.MOI_MAX > 0 ? Q.MOI_MAX : 0;
if (st.n) {
out.push(`<div class="moi-stat">มีเพื่อนเข้ามาเล่นจากคำเชิญของคุณแล้ว <b>${st.n}</b> คน · รับเงินแล้ว <b class="price">${U.fmtMoney(st.got)} ฿</b>${cap && st.paid >= cap ? ` · ครบโควตาสูงสุด ${cap} คนแล้ว` : ''}</div>`);
const list = st.ban.slice().reverse().slice(0, 8).map(b => `<span>${esc(b.t || 'เพื่อนใหม่')} <span class="dim">${fmtAt(b.at)}</span></span>`).join('');
if (list) out.push(`<div class="moi-list">${list}${st.n > 8 ? `<span class="dim">และอีก ${st.n - 8} คน</span>` : ''}</div>`);
} else if (st.code) out.push('<div class="dim">ยังไม่มีเพื่อนเข้ามาเล่น ลองส่งลิงก์ให้เพื่อนทาง LINE หรือ Messenger ดูนะ</div>');
if (M.err) out.push(`<div class="moi-msg"><span class="bad">${esc(ERR[M.err] || ERR.mang)}</span></div>`);
else if (M.msg) out.push(`<div class="moi-msg"><span class="${M.msgCls || 'dim'}">${esc(M.msg)}</span></div>`);
return out.join('');
}
function live(msg, cls) {
if (msg !== undefined) { M.msg = msg; M.msgCls = cls || 'dim'; }
const el = $('moi-live');
if (el) el.innerHTML = liveHtml();
}
function inviteeLine() {
if (!st.by) return '';
const who = st.byTen ? `<b>${esc(st.byTen)}</b>` : 'เพื่อน', name = st.byTen ? esc(st.byTen) : 'ผู้ชวน';
const s = st.sent > 0 ? `✅ แจ้งยอดแล้ว — ${name} ได้รับโบนัสชวนเพื่อนแล้ว` : st.sent < 0 ? `ไม่สามารถนับคำเชิญได้ (${WHY[st.why] || WHY.sai})`
: `⏳ ตกปลาตัวแรกให้ได้ แล้ว ${name} จะได้รับ ${pay()} ฿`;
return `<div class="moi-by">🎁 คุณได้รับคำเชิญจาก ${who} ให้มาเล่นเกม ${s}</div>`;
}
const limitTxt = () => Q.MOI_MAX > 0 ? `สูงสุด ${Q.MOI_MAX} คน` : 'ไม่จำกัดจำนวน';
function tenLine() {
const n = myName();
if (n) return `<div class="moi-ten">เพื่อนจะเห็นว่า: “<b>${esc(n)}</b> ชวนคุณมาตกปลาด้วยกัน” <button data-act="tk-mo">👤 ชื่อของคุณ</button></div>`;
if (myTk()) return `<div class="moi-ten">คุณยังไม่ได้ตั้งชื่อผู้เล่น — เพื่อนจะเห็นเพียง “เพื่อนชวนคุณมาตกปลาด้วยกัน” <button class="good" data-act="tk-mo">✏️ ตั้งชื่อ</button></div>`;
return `<div class="moi-ten">อยากให้เพื่อนเห็นชื่อของคุณ: เข้าสู่ระบบ Google แล้วตั้งชื่อผู้เล่น (ชื่อไม่ซ้ำใคร) <button data-act="tk-mo">👤 เข้าสู่ระบบ</button></div>`;
}
M.questBox = () => {
const head = `<h3 id="moi-box">👥 ชวนเพื่อนมาตกปลาด้วยกัน <span class="dim moi-h">— +${pay()} ฿ ต่อคน, ${limitTxt()}</span></h3>`;
if (!M.on()) return `${head}<div class="moi">มีให้ใช้งานในเวอร์ชันออนไลน์: เพื่อนใหม่ที่เข้าเล่นผ่านลิงก์เชิญของคุณและตกปลาตัวแรกได้ → คุณรับโบนัส ${pay()} ฿</div>`;
return `${head}<div class="moi">${inviteeLine()}
      <div>ส่งลิงก์เชิญให้เพื่อน เมื่อเพื่อน<b>ใหม่</b>เปิดลิงก์และตกปลาตัวแรกได้ → คุณรับ <b class="price">+${pay()} ฿</b> ยิ่งชวนมากยิ่งได้เงินมาก</div>
      ${tenLine()}
      <div class="btnrow"><button class="good" data-act="moi-share">📤 ส่งคำเชิญ</button><button data-act="moi-copy">📋 คัดลอกลิงก์</button><button data-act="moi-check">🔄 ตรวจสอบ</button></div>
      <div id="moi-live">${liveHtml()}</div></div>`;
};
M.pondBox = () => {
if (!M.on()) return '';
if (st.by && !st.sent) {
const who = st.byTen ? `<b>${esc(st.byTen)}</b>` : 'เพื่อน', name = st.byTen ? esc(st.byTen) : 'ผู้ชวน';
const me = myName();
return `<div class="moi-note">🎁 ${who} ชวนคุณมาตกปลาด้วยกัน! ตกปลาตัวแรกได้แล้ว ${name} จะรับโบนัส ${pay()} ฿
        ${me ? `<span class="dim">${name} จะเห็นชื่อของคุณ: <b>${esc(me)}</b></span>` : `<span class="dim">อยากให้ ${name} เห็นชื่อของคุณ: เข้าสู่ระบบ Google แล้วตั้งชื่อผู้เล่น</span> <button data-act="tk-mo">👤 ตั้งชื่อ</button>`}</div>`;
}
return `<div class="qsum moi-sum">👥 <b>ชวนเพื่อนมาตกปลาด้วยกัน:</b> เพื่อนใหม่ที่เข้าเล่นจากลิงก์ของคุณ → +${pay()} ฿, ${limitTxt()} <button data-act="moi-open">📤 ชวนเพื่อน</button></div>`;
};
const aoQ = UI.afterOpen.quest;
UI.afterOpen.quest = function () {
const r = aoQ ? aoQ.apply(this, arguments) : undefined;
if (M.on()) { if (!st.code) register(); else poll(Date.now() - st.seen > 15e3); }
return r;
};
document.addEventListener('focusin', e => { if (e.target && e.target.id === 'moi-url') e.target.select(); });
const base = UI.onAction;
UI.onAction = function (act) {
switch (act) {
case 'moi-share': share(); return;
case 'moi-copy': if (!st.code) needCode(); else copy(inviteText() + ' ' + link()); return;
case 'moi-check':
M.msg = ''; M.err = '';
if (!st.code) { register(); return; }
live('กำลังสอบถามเซิร์ฟเวอร์…');
poll(true).then(() => { if (!M.err) live(st.n ? `อัปเดตเมื่อเวลา ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}` : ''); });
return;
case 'moi-open':
UI.open('quest');
setTimeout(() => { const el = $('moi-box'); if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 30);
return;
}
return base.apply(this, arguments);
};
const fresh = () => st.code && Date.now() - st.shared < POLL_FOR;
setInterval(() => { if (!document.hidden && fresh()) poll(); }, POLL_MS);
document.addEventListener('visibilitychange', () => { if (!document.hidden && fresh() && Date.now() - st.seen > 2 * 60e3) poll(); });
window.addEventListener('DOMContentLoaded', () => setTimeout(() => {
if (!CC.P || !M.on()) return;
const code = readLink();
if (code != null) arrive(code);
if (st.by && !st.sent && CC.P.stats.caught > 0) report();
if (st.code) { poll(); M.syncName(); }
}, 900));
})();