(function () {
const U = CC.U, UI = CC.UI, PN = UI.PANELS;
const $ = id => document.getElementById(id);
const KEY = 'cauca_gopy_v1';
const VERSION = ((document.currentScript && document.currentScript.src.match(/[?&]v=(\d+)/)) || [])[1] || '?';
const HOST = location.hostname;
const IS_LOCAL = location.protocol === 'file:' || HOST === 'localhost' || HOST === '127.0.0.1' || HOST === '[::1]' || /\.localhost$/.test(HOST);
const KINDS = [['y', '💡 ไอเดีย / เสนอแนะ'], ['loi', '🐞 แจ้งบั๊ก / ปัญหา'], ['cau', '🎣 วิธีตก / อาการทุ่น'], ['tien', '💰 เงิน / ภารกิจ'], ['dt', '📱 มือถือ / หน้าจอ UI'], ['khac', '💬 อื่นๆ']];
const KIND_NAME = {};
KINDS.forEach(([k, t]) => { KIND_NAME[k] = t; });
const STAR_TXT = ['', 'ยังไม่ค่อยถูกใจ', 'พอใช้ได้', 'ดีพอสมควร', 'สนุกดี', 'ยอดเยี่ยมมาก'];
const st = UI.gopyState = { kind: 'y', star: 0, attach: true, draft: '', name: '' };
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
const store = list => { try { localStorage.setItem(KEY, JSON.stringify(list.slice(-30))); } catch (e) {   } };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function info() {
const P = CC.P, Wd = CC.world, q = P.quests || {};
const ua = navigator.userAgent, dev = (ua.match(/\(([^)]+)\)/) || [])[1] || '';
const app = /Zalo/i.test(ua) ? 'Zalo' : /FBAN|FBAV|FB_IAB|Messenger/i.test(ua) ? 'Facebook' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : /Firefox/.test(ua) ? 'Firefox' : 'อื่นๆ';
return [`v${VERSION}`, location.host || 'file', `${innerWidth}x${innerHeight}${UI.touch ? ' ทัชสกรีน' : ''}`, `${dev.slice(0, 60)} · ${app}`,
`บ่อ ${CC.pond().id}`, `วันที่ ${Wd.day} ${Wd.clock()}`, `เงิน ${Math.round(P.money)} ฿`, `ปลา ${P.stats.caught} ตัว`, `${P.stats.cas} รอบ`,
`${Object.keys(q.done || {}).length} ภารกิจ`].join(' · ');
}
async function deliver(it) {
const S = CC.Sync;
if (S && S.enabled) {
const r = await fetch(S.api() + '/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ p: S.player(), kind: it.kind, star: it.star, text: it.text, name: it.name, info: it.info, at: it.at }) });
if (!r.ok) throw new Error('server ' + r.status);
return 'เซิร์ฟเวอร์ส่วนตัว';
}
if (IS_LOCAL && !new URLSearchParams(location.search).get('gopy')) throw new Error('local-offline');
const body = new URLSearchParams({ 'form-name': 'gopy', 'bot-field': '', loai: KIND_NAME[it.kind] || it.kind, sao: it.star ? it.star + '/5' : '',
noidung: it.text, ten: it.name, thongtin: it.info, luc: it.at });
const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
if (!r.ok) throw new Error('page ' + r.status);
return 'Netlify';
}
let flushing = null;
function flush() {
if (flushing) return flushing;
flushing = (async () => {
const list = load();
for (const it of list) {
if (it.sent) continue;
try { it.via = await deliver(it); it.sent = true; delete it.err; } catch (e) { it.err = String(e.message || e); break; }
}
const now = load(), byId = {};
list.forEach(x => { byId[x.id] = x; });
store(now.map(x => byId[x.id] || x));
})().finally(() => { flushing = null; });
return flushing;
}
function history() {
const list = load().slice().reverse();
if (!list.length) return '';
return `<h3>ข้อเสนอแนะที่บันทึกไว้บนเครื่องนี้</h3>${list.slice(0, 8).map(it => `<div class="gy-item">
      <div class="gy-meta">${it.sent ? '✅ ส่งแล้ว' : '⏳ ยังส่งไม่สำเร็จ — บันทึกไว้ในเครื่อง'} · ${esc(KIND_NAME[it.kind] || '')}${it.star ? ' · ' + '★'.repeat(it.star) : ''} · <span class="dim">${esc(new Date(it.at).toLocaleString('th-TH'))}</span></div>
      <div class="gy-text">${esc(it.text)}</div>
      ${it.sent ? '' : `<button data-act="gopy-copy" data-id="${esc(it.id)}">📋 คัดลอกข้อความเพื่อส่ง</button>`}</div>`).join('')}`;
}
PN.gopy = () => `<h2>💬 ข้อเสนอแนะเกม</h2>
    <div class="sub">คุณรู้สึกอย่างไรกับเกมนี้? มีจุดไหนเล่นยาก เจอบั๊กอะไร อยากให้เพิ่มบ่อ เพิ่มปลา หรือเพิ่มระบบอะไร… เขียนบอกกันได้เลย เราอ่านทุกข้อความเพื่อพัฒนาเกมให้สนุกยิ่งขึ้น ขอบคุณครับ/ค่ะ!</div>
    <div class="gy-kinds">${KINDS.map(([k, t]) => `<button data-act="gopy-kind" data-k="${k}" class="${st.kind === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <div class="gy-stars"><span class="dim">ให้คะแนนเกม:</span>${[1, 2, 3, 4, 5].map(s => `<button data-act="gopy-star" data-s="${s}" class="${st.star >= s ? 'on' : ''}" aria-label="${s} ดาว">★</button>`).join('')}
      <span class="dim" id="gy-startxt">${STAR_TXT[st.star] || ''}</span></div>
    <textarea id="gy-text" maxlength="2000" rows="4" placeholder="เช่น ทุ่นบ่อปลาตะเพียนจีนอ่านยากจัง อยากให้มีบ่อปลาบึก ตัวหนังสือบนมือถือเล็กไปหน่อย…"></textarea>
    <input id="gy-name" type="text" maxlength="60" placeholder="ชื่อเล่น หรือช่องทางติดต่อกลับ (ไม่บังคับ)">
    <label class="gy-attach"><input id="gy-attach" type="checkbox" ${st.attach ? 'checked' : ''}>
      <span>แนบข้อมูลเครื่องและความคืบหน้าการเล่น (ช่วยในการแก้ไขบั๊ก): <span class="dim">${esc(info())}</span></span></label>
    <div class="btnrow" style="align-items:center"><button class="good" data-act="gopy-send">📨 ส่งข้อเสนอแนะ</button><span id="gy-msg" class="dim"></span></div>
    <div id="gy-hist">${history()}</div>`;
UI.afterOpen.gopy = () => {
const t = $('gy-text'), n = $('gy-name'), a = $('gy-attach');
t.value = st.draft; n.value = st.name;
t.addEventListener('input', () => { st.draft = t.value; });
n.addEventListener('input', () => { st.name = n.value; });
a.addEventListener('change', () => { st.attach = a.checked; });
};
async function send() {
const msg = $('gy-msg'), btn = document.querySelector('[data-act="gopy-send"]');
const text = ($('gy-text').value || '').trim();
if (text.length < 3) { msg.textContent = 'กรุณาพิมพ์ข้อเสนอแนะสักเล็กน้อยก่อนนะครับ'; msg.className = 'bad'; $('gy-text').focus(); return; }
const it = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: new Date().toISOString(), kind: st.kind, star: st.star,
text: text.slice(0, 2000), name: ($('gy-name').value || '').trim().slice(0, 60), info: st.attach ? info() : `v${VERSION}`, sent: false };
const list = load(); list.push(it); store(list);
btn.disabled = true; msg.textContent = 'กำลังส่ง…'; msg.className = 'dim';
await flush();
if (!IS_LOCAL && !(load().find(x => x.id === it.id) || {}).sent) await flush();
const done = load().find(x => x.id === it.id);
btn.disabled = false;
st.draft = ''; st.star = 0; $('gy-text').value = '';
document.querySelectorAll('[data-act="gopy-star"]').forEach(b => b.classList.remove('on'));
$('gy-startxt').textContent = '';
if (done && done.sent) {
msg.textContent = '✅ ส่งเรียบร้อยแล้ว ขอบคุณครับ/ค่ะ!'; msg.className = 'good';
UI.toast('💬 ส่งข้อเสนอแนะแล้ว — ขอบคุณครับ/ค่ะ!', 'good');
} else {
msg.textContent = IS_LOCAL ? '💾 บันทึกข้อเสนอแนะไว้ในเครื่องนี้แล้ว (โหมดออฟไลน์ไม่มีเซิร์ฟเวอร์รับข้อมูล — สามารถกดปุ่มคัดลอกด้านล่างได้)' : '⏳ ยังส่งไม่สำเร็จ (อินเทอร์เน็ตช้า?) บันทึกไว้ในเครื่องแล้ว จะลองส่งให้อัตโนมัติเมื่อเปิดเกมครั้งหน้า';
msg.className = 'warn';
}
$('gy-hist').innerHTML = history();
}
const base = UI.onAction;
UI.onAction = function (act, btn) {
const d = (btn && btn.dataset) || {};
switch (act) {
case 'gopy': UI.open('gopy'); return;
case 'gopy-kind':
st.kind = d.k;
document.querySelectorAll('[data-act="gopy-kind"]').forEach(b => b.classList.toggle('on', b.dataset.k === st.kind));
return;
case 'gopy-star':
st.star = st.star === +d.s ? 0 : +d.s;
document.querySelectorAll('[data-act="gopy-star"]').forEach(b => b.classList.toggle('on', +b.dataset.s <= st.star));
$('gy-startxt').textContent = STAR_TXT[st.star] || '';
return;
case 'gopy-send': send(); return;
case 'gopy-copy': {
const it = load().find(x => x.id === d.id);
if (!it) return;
const txt = `ข้อเสนอแนะเกมชิงหลิว (${KIND_NAME[it.kind] || ''}${it.star ? ', ' + it.star + '/5 ดาว' : ''}): ${it.text}${it.name ? ' — ' + it.name : ''} [${it.info}]`;
const ok = () => UI.toast('คัดลอกแล้ว — นำไปวางส่งให้ผู้พัฒนาได้เลย', 'good');
if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, () => window.prompt('คัดลอกข้อความนี้:', txt));
else window.prompt('คัดลอกข้อความนี้:', txt);
return;
}
}
const P = CC.P, wasCa = act === 'payout';
const r = base.apply(this, arguments);
if (wasCa && P && !P.gopyAsked && P.stats.cas >= 2) {
P.gopyAsked = true;
setTimeout(() => UI.toast('💬 เกมสนุกไหม? กด “ข้อเสนอแนะ” ในหน้าต่าง เลือกบ่อ เพื่อเขียนบอกเราได้นะ', 'info', 7000), 1200);
}
return r;
};
window.addEventListener('DOMContentLoaded', () => setTimeout(() => { if ((!IS_LOCAL || (CC.Sync && CC.Sync.enabled)) && load().some(x => !x.sent)) flush(); }, 4000));
})();