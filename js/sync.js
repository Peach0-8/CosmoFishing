(function () {
const SM = CC.SyncModel, UI = CC.UI;
const $ = id => document.getElementById(id);
const KEY = 'cauca_sync_v1';
const S = CC.Sync = { online: false, base: null, rev: 0, pending: [], inFlight: false, remote: null, client: Math.random().toString(36).slice(2) };
const player = () => (new URLSearchParams(location.search).get('p') || CC.SYNC.player || 'minh').toLowerCase();
const api = () => (CC.SYNC.url || (location.protocol.startsWith('http') ? '' : 'http://127.0.0.1:8787'));
S.enabled = !!CC.SYNC.url;
S.api = api; S.player = player;
function loadBase() {
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.player === player()) S.base = s.base; } catch (e) { S.base = null; }
}
function saveBase() { try { localStorage.setItem(KEY, JSON.stringify({ player: player(), base: S.base })); } catch (e) {   } }
function badge(txt, cls) {
const el = $('h-sync');
if (!el) return;
el.textContent = txt;
el.className = cls || 'dim';
}
S.note = ev => { if (!S.enabled) return; S.pending.push(ev); S.kick(); };
function adopt(server) {
const local = SM.pick(CC.P);
const mine = S.base ? SM.diff(local, S.base) : null;
const merged = mine ? SM.apply(server, mine) : server;
SM.store(CC.P, merged);
S.base = server;
S.rev = server.rev;
saveBase();
UI.refresh();
if (UI.isOpen() && UI.current && UI.current !== 'setup' && UI.current !== 'mix') UI.rerender();
}
async function post(body) {
const r = await fetch(api() + '/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
if (!r.ok) throw new Error('server ' + r.status);
return r.json();
}
S.kick = () => { clearTimeout(S.kickT); S.kickT = setTimeout(S.push, 400); };
S.push = async () => {
if (!S.online || S.inFlight || !CC.P) return;
const local = SM.pick(CC.P);
const events = S.pending.splice(0);
if (!S.base) return;
const delta = SM.diff(local, S.base);
if (delta.empty && !events.length) return;
S.inFlight = true;
try {
const r = await post({ p: player(), platform: 'web', base: S.base.rev, delta, events, client: S.client });
const after = SM.diff(SM.pick(CC.P), local);
SM.store(CC.P, SM.apply(r.profile, after));
S.base = r.profile; S.rev = r.profile.rev; saveBase();
UI.refresh();
badge('🟢 ซิงค์แล้ว', 'good-txt');
} catch (e) {
S.pending.unshift(...events);
setOffline();
} finally {
S.inFlight = false;
if (S.remote && S.remote.rev > S.rev) { const x = S.remote; S.remote = null; adopt(x); }
}
};
function setOffline() {
S.online = false;
badge('⚪ ออฟไลน์ — เล่นชั่วคราวบนเครื่องนี้', 'dim');
clearTimeout(S.retryT);
S.retryT = setTimeout(connect, 8000);
}
async function connect() {
if (S.es) { S.es.close(); S.es = null; }
try {
const r = await fetch(api() + '/api/profile?p=' + encodeURIComponent(player()), { cache: 'no-store' });
const j = await r.json();
S.online = true;
S.seq = j.seq || 0;
if (j.profile) {
if (!S.base) {
const merged = SM.mergeFirst(SM.pick(CC.P), j.profile);
SM.store(CC.P, merged);
S.base = j.profile; S.rev = j.profile.rev; saveBase(); UI.refresh();
UI.toast(`🔗 เชื่อมต่อโปรไฟล์ร่วม "${player()}" แล้ว — เงิน ${CC.U.fmtMoney(merged.money)} ฿`, 'good');
} else if (j.profile.rev !== S.rev) adopt(j.profile);
} else {
const r2 = await post({ p: player(), platform: 'web', seed: SM.pick(CC.P), client: S.client });
S.base = r2.profile; S.rev = r2.profile.rev; saveBase();
UI.toast(`🔗 สร้างโปรไฟล์ร่วม "${player()}" แล้ว — เวอร์ชัน PC จะใช้เงินและอุปกรณ์ตกปลาร่วมกัน`, 'good');
}
badge('🟢 ซิงค์แล้ว', 'good-txt');
listen();
S.push();
} catch (e) {
setOffline();
}
}
function listen() {
if (!window.EventSource) return;
const es = S.es = new EventSource(api() + '/api/stream?p=' + encodeURIComponent(player()));
es.addEventListener('profile', m => {
const d = JSON.parse(m.data);
if (!d.profile || d.client === S.client || d.profile.rev <= S.rev) return;
if (S.inFlight) S.remote = d.profile; else adopt(d.profile);
badge(`🟢 เพิ่งรับข้อมูลจากเวอร์ชัน ${d.by === 'pc' ? 'PC' : 'Web'}`, 'good-txt');
});
es.addEventListener('feed', m => {
const e = JSON.parse(m.data);
if (e.platform === 'web') return;
UI.toast(`📡 เวอร์ชัน PC: ${e.text}`, e.kind === 'catch' ? 'good' : 'info');
});
es.addEventListener('data', () => UI.toast('📦 ข้อมูลเกมเพิ่งได้รับการอัปเดต — รีเฟรชหน้าเว็บเพื่อใช้เวอร์ชันใหม่', 'info'));
es.onerror = () => { es.close(); if (S.es === es) S.es = null; setOffline(); };
}
const showCatch = UI.showCatch;
UI.showCatch = function (info) {
try { S.note({ type: 'catch', sp: info.sp.id, w: info.w }); } catch (e) {   }
return showCatch.apply(this, arguments);
};
const LABEL = {
buyticket: d => `ซื้อบัตร${(CC.PONDS_BY_ID && CC.PONDS_BY_ID[d.id] || {}).name || 'บ่อตกปลา'}`,
payout: () => 'ชั่งปลากับเจ้าของบ่อ', buying: () => 'ซื้อวัตถุดิบผสมเหยื่อ', buyleaders: () => 'ซื้อสายหน้า 10 ชุด',
buyskin: () => 'ซื้อของตกแต่ง', 'c-latvot': () => 'รางวัลตักปลาสวิง', cheat: () => 'เพิ่มเงินทดสอบ', work: () => 'ช่วยงานเจ้าของบ่อ'
};
const onAction = UI.onAction;
UI.onAction = function (act, el) {
const before = CC.P ? CC.P.money : 0;
const r = onAction.apply(this, arguments);
const dm = CC.P ? CC.P.money - before : 0;
if (Math.abs(dm) >= 1 && act !== 'buy') {
const lbl = LABEL[act] ? LABEL[act]((el && el.dataset) || {}) : 'เงิน';
S.note({ text: `${lbl} ${dm > 0 ? '+' : '−'}${CC.U.fmtMoney(Math.abs(dm))} ฿`, kind: 'money', money: true });
} else if (act === 'buy') S.note({ money: true });
return r;
};
const save = CC.save;
CC.save = function () { const r = save.apply(this, arguments); S.kick(); return r; };
window.addEventListener('DOMContentLoaded', () => {
if (!S.enabled) { badge('📱 บันทึกบนเครื่องนี้', 'dim'); return; }
loadBase();
badge('⚪ กำลังเชื่อมต่อเซิร์ฟเวอร์…', 'dim');
connect();
setInterval(S.push, 3000);
});
})();