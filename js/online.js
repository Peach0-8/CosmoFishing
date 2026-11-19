(function () {
const U = CC.U, UI = CC.UI, M = CC.PondMap, PN = UI.PANELS;
if (!U || !UI || !M) return;
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DEG = Math.PI / 180, REST = 3 * DEG;
const O = CC.Online = { on: false };
const KEY = 'cauca_online_v1';
const HO_ON = ['rophi', 'diec', 'tram'];
const HO_TEN = { rophi: 'บ่อปลานิล', diec: 'บ่อปลาตะเพียนจีน', tram: 'บ่อปลาเฉาดำ' };
const ID_RE = /^[a-z]{2,12}~\d{1,3}$/, MA_RE = /^[2-9A-HJ-NP-Z]{6}$/;
const TT_TXT = { tay: 'กำลังพักมือ', quang: 'กำลังตีเหยื่อ', cho: 'กำลังรอทุ่น', dinh: 'กำลังอัดปลา', vot: 'กำลังช้อนปลา', dao: 'กำลังเดินเล่น', vang: 'ไม่อยู่ชั่วคราว' };
const TT_ICO = { tay: '✋', quang: '🎯', cho: '⏳', dinh: '🎣', vot: '🥅', dao: '🚶', vang: '💤' };
const LY_TXT = { dut: 'สายหน้าขาด', tuot: 'เบ็ดหลุด', quan: 'พันสาย', khac: 'ปลาหลุด' };
const EMO = ['👋', '👍', '😂', '😮', '🎣', '🐟', '👏', '😭', '🔥'];
const CAU = ['สวัสดีทุกคนในบ่อ!', 'ปลากินดีไหมครับ?', 'ติดแล้ว!', 'ตัวใหญ่แน่ๆ!', 'สายหน้าขาดเลย…', 'ใช้เหยื่ออะไรกัน?', 'เข้าฝูงแล้ว!',
'สู้ๆ นะ!', 'มานั่งข้างๆ กันสิ!', 'ยินดีด้วยครับ!', 'ขอตัวกลับก่อนนะ พรุ่งนี้มาตกใหม่'];
const HANG = ['อันดับ 1', 'อันดับ 2', 'อันดับ 3'], HUY = ['🥇', '🥈', '🥉'];
const HUY_MAY = { kl: { b: '🏆', t: 'กำลังครองสถิติ' }, vd: { b: '👑', t: 'แชมป์การแข่งขันรอบชั่วโมง' }, t1: { b: '⭐', t: 'อันดับ 1 สัปดาห์ก่อน' } };
const fishName = f => (f && f.name ? f.name.replace(/ \(.*\)$/, '') : 'ปลา');
const kgTxt = w => (w < 1 ? Math.round(w * 1000) + ' กรัม' : w.toFixed(2) + ' กก.');
const kgNum = w => (+w || 0).toFixed(2);
const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const near = (a, b, k) => { const d = Math.abs(a - b); return Math.min(d, 40 - d) <= (k || 1); };
const isHidden = el => !el || el.classList.contains('hidden') || el.offsetParent === null;
let cfg = { bat: false, canh: '', ma: '', phong: null, tra: [], nhom: 0, an: 0, camDen: 0, camLy: '' };
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') cfg = Object.assign(cfg, s); } catch (e) {   }
if (!Array.isArray(cfg.tra)) cfg.tra = [];
cfg.nhom = Math.max(0, Math.min(3, cfg.nhom | 0));
const saveCfg = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {   } };
const QS = new URLSearchParams(location.search), HOST = location.hostname;
const LOCAL = location.protocol === 'file:' || HOST === 'localhost' || HOST === '127.0.0.1' || HOST === '[::1]' || /\.localhost$/.test(HOST);
const DEV_URL = LOCAL ? QS.get('online') || '' : '';
const DEV_THU = DEV_URL ? QS.get('thu') || '' : '';
if (DEV_THU && !cfg.bat) { cfg.bat = true; saveCfg(); }
function base() {
const u = String(DEV_URL || CC.ONLINE_URL || '').trim().replace(/\/+$/, '');
if (!/^(wss?|https?):\/\/[^\s/?#]+/i.test(u)) return null;
return { http: u.replace(/^ws/i, 'http'), ws: u.replace(/^http/i, 'ws') };
}
function me() {
if (DEV_THU) {
const m = /^(.{1,20}):([2-9A-HJ-NP-Z]{6})$/.exec(DEV_THU);
if (m) return { tk: `thu:${m[1]}:${m[2]}`, ten: m[1] };
}
const T = CC.TaiKhoan;
return { tk: (T && T.token && T.token()) || '', ten: (T && T.ten && T.ten()) || '', ve: (T && T.ve && T.ve()) || '' };
}
const C = { ws: null, st: 'tat', err: '', want: null, tries: 0, retryT: 0, gen: 0, rxAt: 0, txAt: 0, lostAt: 0, badTk: '', got: false, stopRetry: false, id: '', tru: [], sentCanh: '', sentNhom: 0 };
let room = null;
const inRoom = () => !!(room && C.st === 'vao' && C.ws && C.ws.readyState === 1);
const myMa = () => (room && room.toi && room.toi.ma) || '';
const sNow = () => Date.now() + (room ? room.skew : 0);
const pondName = ho => HO_TEN[ho || (room && room.ho) || (CC.P && CC.P.pondId)] || 'บ่อ';
O.inRoom = inRoom;
async function getJson(url, ms) {
const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
const tm = setTimeout(() => { if (ctl) ctl.abort(); }, ms || 7000);
try { const r = await fetch(url, { cache: 'no-store', signal: ctl ? ctl.signal : undefined }); return await r.json(); }
finally { clearTimeout(tm); }
}
function send(o) {
const ws = C.ws;
if (!ws || ws.readyState !== 1) return false;
try { ws.send(JSON.stringify(o)); C.txAt = Date.now(); return true; } catch (e) { return false; }
}
function setErr(e) { C.err = e; C.st = 'loi'; clearTimeout(C.retryT); dirty(); }
async function connect() {
clearTimeout(C.retryT); C.retryT = 0;
const w = C.want;
if (!w || C.ws) return;
const b = base(), who = me();
if (!b) return setErr('may');
if (!who.tk) return setErr('dangnhap');
if (!who.ten) return setErr('chuaten');
if (C.badTk && C.badTk === who.tk) return setErr('het');
C.err = '';
const gen = ++C.gen;
C.st = 'sanh'; dirty();
let id = '';
const old = cfg.phong;
if (old && old.ho === w.ho && ID_RE.test(old.id || '') && Date.now() - (old.luc || 0) < 15 * 60e3 && (!w.canh || old.canh === w.canh)) id = old.id;
if (!id) {
try {
const tru = C.tru.length ? '&tru=' + encodeURIComponent(C.tru.join(',')) : '';
const r = await getJson(`${b.http}/sanh?ho=${encodeURIComponent(w.ho)}${w.canh ? '&canh=' + encodeURIComponent(w.canh) : ''}${tru}`, 7000);
if (gen !== C.gen) return;
id = r && r.ok ? (typeof r.id === 'string' && ID_RE.test(r.id) ? r.id : typeof r.goiY === 'string' ? r.goiY : '') : '';
} catch (e) { if (gen !== C.gen) return; }
if (!ID_RE.test(id)) return retry();
}
const T = CC.TaiKhoan;
if (!DEV_THU && T && T.xinVe && (C.veHong || !who.ve)) { try { await T.xinVe(C.veHong); } catch (e) {   } C.veHong = false; if (gen !== C.gen) return; }
openWs(b.ws, id);
}
function openWs(wsBase, id) {
let ws;
try { ws = new WebSocket(`${wsBase}/phong/${encodeURIComponent(id)}`); } catch (e) { cfg.phong = null; return retry(); }
C.ws = ws; C.st = 'noi'; C.got = false; C.stopRetry = false; C.id = id; dirty();
ws.onopen = () => {
if (C.ws !== ws) return;
C.st = 'chao'; C.rxAt = Date.now();
const ca = CC.P && CC.P.ca, seated = !!(ca && ca.active && ca.o);
const canh = C.want && MA_RE.test(C.want.canh || '') && C.want.canh !== cfg.ma ? C.want.canh : '';
const nhom = !seated && cfg.nhom > 0 ? cfg.nhom : 0;
C.sentCanh = canh; C.sentNhom = nhom;
const who = me(), o = { t: 'chao', v: 2, tk: who.tk };
if (who.ve) o.ve = who.ve;
const dh = dhDeo();
C.sentDh = dh; C.sentAn = cfg.an ? 1 : 0;
if (dh) o.dh = dh;
if (cfg.an) o.an = 1;
if (seated && !canh) o.ghe = ca.o;
if (canh) o.canh = canh;
if (nhom) o.nhom = nhom;
send(o);
};
ws.onmessage = e => {
if (C.ws !== ws) return;
C.rxAt = Date.now();
let m = null;
try { m = JSON.parse(e.data); } catch (er) { return; }
if (!m || typeof m.t !== 'string') return;
try { onMsg(m); } catch (er) { console.error('[online]', er); }
};
ws.onclose = e => { if (C.ws !== ws) return; C.ws = null; onClose(e.code, e.reason || ''); };
ws.onerror = () => {   };
}
function onClose(code, reason) {
const had = C.got;
C.got = false;
if (C.stopRetry) { C.stopRetry = false; return; }
if (code === 4001) { setErr('thay'); dropRoom(); toast('🌐 คุณเพิ่งเข้าบ่อออนไลน์จากแท็บหรือเครื่องอื่น — แท็บนี้จึงออกจากโหมดออนไลน์', 'info', 6000); return; }
if (code === 4000 && (reason === 'tk' || reason === 'chuaten' || reason === 'cam')) { onLoi(reason); C.stopRetry = false; return; }
if (code === 4000 && reason === 'day') onLoi('day');
if (!had && code !== 4003) { cfg.phong = null; saveCfg(); }
retry();
}
function retry() {
if (C.ws) { const ws = C.ws; C.ws = null; try { ws.close(); } catch (e) {   } }
if (!C.want) { C.st = 'tat'; dirty(); return; }
C.st = 'cho'; C.tries++;
if (!C.lostAt) C.lostAt = Date.now();
const d = Math.min(30e3, 1000 * Math.pow(2, Math.min(C.tries - 1, 5))) * (0.75 + Math.random() * 0.5);
clearTimeout(C.retryT);
C.retryT = setTimeout(connect, document.hidden ? Math.max(d, 15e3) : d);
dirty();
}
function leave() {
C.want = null; C.gen++;
clearTimeout(C.retryT);
if (C.ws) { const ws = C.ws; send({ t: 'ra' }); C.ws = null; try { ws.close(1000, 'ra'); } catch (e) {   } }
C.st = 'tat'; C.tries = 0; C.lostAt = 0;
if (C.err === 'thay' || C.err === 'may') C.err = '';
dropRoom('ra');
}
function dropRoom(why) {
if (drv && CC.Xem && CC.Xem.on) CC.Xem.stop(why === 'ra' ? 'walk' : 'mang');
room = null; O.on = false;
troiRieng();
caBo();
placeAll();
dirty();
}
let lastCaAt = 0;
function syncWant() {
const P = CC.P, ca = P && P.ca, ho = P && P.pondId;
if (ca && ca.active) lastCaAt = Date.now();
const ok = cfg.bat && !!base() && HO_ON.indexOf(ho) >= 0 && ((ca && ca.active) || Date.now() - lastCaAt < 3 * 60e3);
if (!ok) { if (C.want || C.st !== 'tat') leave(); return; }
if (C.want && C.want.ho !== ho) leave();
if (!C.want) { C.want = { ho, canh: cfg.canh || '' }; C.tries = 0; C.st = C.st === 'loi' ? 'loi' : 'tat'; }
if (C.st === 'loi') {
const who = me();
if (C.err === 'thay') return;
if (C.err === 'may' && !base()) return;
if (C.err === 'dangnhap' && !who.tk) return;
if (C.err === 'chuaten' && !who.ten) return;
if (C.err === 'het' && (!who.tk || who.tk === C.badTk)) return;
if (C.err === 'cam' && Date.now() < (C.camDen || 0)) return;
C.err = ''; C.st = 'tat';
}
if (!C.ws && C.st === 'tat') connect();
}
function onMsg(m) {
switch (m.t) {
case 'phong': return onPhong(m);
case 'vao': return onVao(m.p);
case 'ra': return onRa(m.ma);
case 'ghe': return onGhe(m.ma, +m.so);
case 'tt': return onTt(m.ma, m.s);
case 'ca': return onCa(m);
case 'mat': return onMat(m);
case 'chat': return onChat(m);
case 'dua': return raceSet(m, false);
case 'giu': return onGiu(m);
case 'bo': if (drv && drv.n.ma === m.ma && m.d && typeof m.d === 'object') drv.push(m.d); return;
case 'nguoixem': return onXem(+m.n || 0);
case 'thoixem': if (drv && drv.n.ma === m.ma) { toast(`🌐 ${drv.n.ten} เพิ่งออกจากบ่อ — หยุดดู`, 'info'); stopWatch(); } return;
case 'pong': if (room && +m.luc) room.skew = +m.luc - Date.now(); return;
case 'loi': return onLoi(m.ly, m);
case 'the': return onThe(m);
case 'giaigio': return onGiaiGio(m);
case 'san': return onSan(m);
case 'gio': return onGio(m);
case 'thuong': return onThuong(m);
}
}
function onPhong(m) {
if (!m.toi || !m.toi.ma || typeof m.id !== 'string') return;
const again = !!(room && room.id === m.id);
const old = room;
room = { id: m.id, ho: String(m.ho || m.id.split('~')[0]), so: +m.id.split('~')[1] || 1, toi: m.toi, ds: new Map(), dua: null,
thuong: old && old.thuong, log: again ? old.log : [], skew: (+m.luc || Date.now()) - Date.now(), xem: 0, rank: -1, warned: false,
giu: new Map(), canh: C.sentCanh || (again ? old.canh : ''), goiY: null };
for (const p of m.ds || []) if (p && p.ma) room.ds.set(p.ma, p);
room.ds.set(m.toi.ma, m.toi);
room.v2 = parseFloat(m.gt) >= 1.2;
room.xh = m.xh === 1;
room.gg = null;
if (m.giaigio && typeof m.giaigio === 'object') onGiaiGio(m.giaigio, true);
caPhong(m);
if (m.gio) onGio(m.gio, true);
for (const h of Array.isArray(m.giu) ? m.giu : []) setHold(h);
C.st = 'vao'; C.got = true; C.tries = 0; C.lostAt = 0; C.err = ''; C.tru = []; O.on = true;
if (cfg.camDen) { cfg.camDen = 0; cfg.camLy = ''; C.camDen = 0; }
cfg.ma = m.toi.ma; cfg.phong = { id: room.id, ho: room.ho, luc: Date.now(), canh: room.canh || '' }; saveCfg();
if (C.want) C.want.canh = '';
if (!again && Array.isArray(m.nk)) for (const ev of m.nk) logEvent(ev);
sent = TT_TXT[m.toi.s] ? m.toi.s : ''; gheAt = 0; conflictAt = 0; giuReq = null; pendMove = null;
placeAll();
raceSet(m.dua, true);
if (m.thuong) onThuong(m.thuong);
if (drv) { if (room.ds.has(drv.n.ma)) send({ t: 'xem', ma: drv.n.ma }); else { toast(`🌐 ${drv.n.ten} ออกจากบ่อไปแล้ว — หยุดดู`, 'info'); stopWatch(); } }
const ca = CC.P && CC.P.ca;
if (C.sentCanh && room.ds.has(C.sentCanh) && ca && ca.active && ca.o && m.toi.so !== ca.o) friendMove();
seatSync(); snapshotSeat();
if (!again) {
const n = room.ds.size - 1, f = C.sentCanh && room.ds.get(C.sentCanh), h = myHold();
let s = `🌐 เข้าห้องออนไลน์${pondName()} #${room.so} — `;
if (f) s += `${f.ten} นั่งช่อง ${f.so}, เซิร์ฟเวอร์จัดให้คุณนั่งช่อง ${m.toi.so}${near(f.so, m.toi.so, 2) ? ' ติดกันเลย' : ' (ใกล้ที่สุดที่ว่างอยู่)'}`;
else s += (n ? `มีผู้เล่นอื่นอีก ${n} คนกำลังตกอยู่` : 'ยังไม่มีใคร ส่งรหัส ' + m.toi.ma + ' ชวนเพื่อนมาตกด้วยกันได้นะ') + (C.sentCanh ? ` · เพื่อนรหัส ${C.sentCanh} ยังไม่ได้เข้าห้องนี้` : '');
if (h) s += ` · 👥 จองช่อง ${h.ds.join(', ')} ไว้ให้เพื่อน 5 นาที`;
toast(s, 'good', 6500);
}
nhomCheck();
dirty();
}
function onVao(p) {
if (!room || !p || !p.ma) return;
const neu = !room.ds.has(p.ma), h = myHold(), lay = !!(h && p.ma !== myMa() && h.ds.indexOf(p.so) >= 0);
if (p.ma === myMa()) Object.assign(room.toi, p); else room.ds.set(p.ma, p);
for (const x of room.giu.values()) { const i = x.ds.indexOf(p.so); if (i >= 0) x.ds.splice(i, 1); }
placeAll(); dirty();
if (!neu || p.ma === myMa()) return;
logPush(`👋 ${p.ten} เข้าบ่อ นั่งช่อง ${p.so}${lay ? ' (ช่องที่คุณจองไว้)' : ''}`);
if (lay) quiet(`👥 ${p.ten} มานั่งช่อง ${p.so} — ช่องที่คุณจองไว้ให้เพื่อน`, 'good', 5000);
else if (room.ds.size <= 8 || p.ma === cfg.canh) quiet(`🌐 ${p.ten} เข้าบ่อ นั่งช่อง ${p.so}${p.ma === cfg.canh ? ' — เพื่อนของคุณมาแล้ว!' : ''}`, 'info');
}
function onRa(ma) {
const p = room && room.ds.get(ma);
if (!p || ma === myMa()) return;
room.ds.delete(ma);
room.giu.delete(ma);
if (drv && drv.n.ma === ma) { toast(`🌐 ${p.ten} ออกจากบ่อแล้ว — หยุดดู`, 'info'); stopWatch(); }
placeAll(); dirty();
logPush(`🚪 ${p.ten} ออกจากบ่อ`);
if (room.ds.size <= 8) quiet(`🌐 ${p.ten} ออกจากบ่อ`, 'info');
}
function onGhe(ma, so) {
const p = room && room.ds.get(ma);
if (!p || !(so >= 1 && so <= 40)) return;
p.so = so;
const h = myHold();
if (h && ma !== myMa() && h.ds.indexOf(so) >= 0) { logPush(`👥 ${p.ten} ย้ายมานั่งช่อง ${so} (ช่องที่คุณจองไว้)`); quiet(`👥 ${p.ten} ย้ายมานั่งช่อง ${so} — ช่องที่คุณจองไว้ให้เพื่อน`, 'good', 4500); }
for (const [k, x] of room.giu) { const i = x.ds.indexOf(so); if (i >= 0 && k !== ma) x.ds.splice(i, 1); }
room.giu.delete(ma);
if (ma === myMa()) { room.goiY = null; if (gheCanh && gheCanh.so === so) gheCanh = null; }
placeAll(); dirty();
if (ma === myMa()) nhomCheck();
}
function onTt(ma, s) {
const p = room && room.ds.get(ma);
if (!p || !TT_TXT[s]) return;
p.s = s;
const e = ents.get(ma);
if (e) e.s = s;
dirty();
}
function onCa(m) {
const p = room && room.ds.get(m.ma);
const w = +m.w || 0, fish = CC.FISH_BY_ID && CC.FISH_BY_ID[m.sp];
if (p && m.tinh) { p.n = (p.n || 0) + 1; p.kg = Math.round(((p.kg || 0) + w) * 1000) / 1000; p.big = Math.max(p.big || 0, w); }
if (p) { p.s = 'tay'; const e0 = ents.get(m.ma); if (e0) e0.s = 'tay'; }
if (m.dua && room && room.dua) raceScore(m);
logEvent(m);
if (!p) return;
if (m.ma === myMa()) {
if (room.v2 && m.tinh === false && LY_KHONG[m.ly]) quiet('🌐 ปลาตัวนี้ไม่นับคะแนนแข่ง: ' + LY_KHONG[m.ly], 'info', 5000);
dirty(); return;
}
const e = entOf(p);
if (M.npcAt(e.id) === e) {
try {
if (CC.Dao && CC.Dao.on && CC.Dao.noteCatch) CC.Dao.noteCatch(e, fish, w);
else if (!(CC.Xem && CC.Xem.on) && CC.Render && CC.Render.npcCatch) CC.Render.npcCatch({ npc: e, fish, w });
if (CC.View3D && CC.View3D.on && CC.View3D.npcCatch) CC.View3D.npcCatch({ npc: e, fish, w, near: near(e.id, (CC.P.ca && CC.P.ca.o) || 0, 2), notable: true });
} catch (er) {   }
}
if (drv && drv.n === e) drv.event('ca', m, fish);
const ca = CC.P && CC.P.ca, bw = CC.pond().bigW, big = bw ? bw[0] : CC.pond().type === 'latvot' ? 18 : 1.5;
const ganh = room.dua && room.dua.pha === 'dang' && (room.dua.bang || []).slice(0, 3).some(r => r.ma === m.ma);
if (room.ds.size <= 10 || (ca && ca.o && near(ca.o, p.so, 3)) || m.ma === cfg.canh || w >= big || ganh) {
quiet(`🎣 ${p.ten} (ช่อง ${p.so}) ได้${fishName(fish)} ${kgTxt(w)}`, 'good');
}
dirty();
}
function onMat(m) {
const p = room && room.ds.get(m.ma);
if (!p || m.ma === myMa()) return;
const ly = LY_TXT[m.ly] || LY_TXT.khac;
logPush(`😢 ${p.ten} ${ly}`);
const e = ents.get(m.ma);
p.s = 'tay'; if (e) e.s = 'tay';
if (drv && e && drv.n === e) drv.event('mat', m);
const ca = CC.P && CC.P.ca;
if ((ca && ca.o && near(ca.o, p.so, 2)) || m.ma === cfg.canh) quiet(`😢 ${p.ten} ${ly} — น่าเสียดาย!`, 'info');
}
const chatText = s => { const k = /^:e([1-9])$/.exec(String(s || '')); return k ? EMO[+k[1] - 1] : String(s || ''); };
function onChat(m) {
const p = room && room.ds.get(m.ma);
if (!p) return;
const txt = chatText(m.m), mine = m.ma === myMa();
p.chat = { m: txt, at: Date.now() };
logPush(`💬 ${mine ? 'คุณ' : p.ten}: ${txt}`, 'chat');
const D = CC.Dao;
if (D && D.on && !D.watch) {
if (mine) { if (D.meSay) D.meSay(txt, 3.5); }
else { const e = ents.get(m.ma); if (e && M.npcAt(e.id) === e && D.sayAt) D.sayAt(e.id, txt, 5); }
return;
}
const ca = CC.P && CC.P.ca;
if (mine || room.ds.size <= 12 || (ca && ca.o && near(ca.o, p.so, 5)) || m.ma === cfg.canh) quiet(`💬 ${mine ? 'คุณ' : p.ten}: ${txt}`, 'info', 3800);
}
function onXem(n) {
if (!room) return;
const was = room.xem;
room.xem = n;
if (n > was && Date.now() - (room.xemToast || 0) > 60e3) { room.xemToast = Date.now(); quiet(`👀 มี ${n} คนกำลังนั่งดูคุณตกปลา`, 'info'); }
dirty();
}
let giuReq = null;
const myHold = () => { const h = room && room.giu && room.giu.get(myMa()); return h && h.ds.length ? h : null; };
function setHold(h) {
if (!room || !h || !MA_RE.test(h.ma || '')) return;
const ds = Array.isArray(h.ds) ? h.ds.map(Number).filter(g => g >= 1 && g <= 40) : [];
if (ds.length) room.giu.set(h.ma, { ds, het: +h.het || 0 }); else room.giu.delete(h.ma);
}
function onGiu(m) {
if (!room || !MA_RE.test(m.ma || '')) return;
const mine = m.ma === myMa(), had = room.giu.get(m.ma);
setHold(m);
const h = room.giu.get(m.ma), n = h ? h.ds.length : 0;
if (mine && giuReq) {
const k = giuReq.k;
giuReq = null;
room.goiY = k > 0 && n < k && +m.goiY >= 1 && +m.goiY <= 40 ? { so: +m.goiY, k } : null;
if (!k) toast('👥 ยกเลิกการจองช่องแล้ว', 'info');
else if (n >= k) toast(`👥 กำลังจองช่อง ${h.ds.join(', ')} ให้เพื่อน 5 นาที — ส่งรหัส ${myMa()} ให้เพื่อน แล้วเข้าตามรหัสจะมานั่งตรงนี้ทันที`, 'good', 6500);
else {
const gy = room.goiY ? ` — ย้ายไปช่อง ${room.goiY.so} จะจองได้ครบ (กดปุ่มที่หน้าต่าง 🌐 ออนไลน์)` : '';
toast(n ? `👥 จองได้เฉพาะช่อง ${h.ds.join(', ')}: สองข้างช่องว่างไม่พอ${gy}` : `👥 สองข้างคุณไม่มีช่องว่างเหลือให้จองแล้ว${gy}`, 'info', 6500);
}
} else if (mine && had && had.ds.length && !n && had.het && sNow() >= had.het - 2000) quiet('👥 หมดเวลาจองช่อง 5 นาทีแล้ว — ช่องเหล่านั้นเปิดว่างให้ทุกคนตามปกติ', 'info');
placeAll(); dirty();
if (mine && UI.isOpen() && UI.current === 'pond') UI.rerender();
}
function sendGiu(k) {
k = Math.max(0, Math.min(3, k | 0));
if (!inRoom() || !send({ t: 'giu', k })) return false;
giuReq = { k, at: Date.now() };
if (cfg.nhom) { cfg.nhom = 0; saveCfg(); }
dirty();
return true;
}
function nhomCheck() {
const k = cfg.nhom, ca = CC.P && CC.P.ca;
if (!k || !inRoom() || !ca || !ca.active || !ca.o || ca.o !== room.toi.so || pendMove) return;
if (giuReq && Date.now() - giuReq.at < 10e3) return;
if (myHold()) { cfg.nhom = 0; saveCfg(); dirty(); return; }
sendGiu(k);
}
let pendMove = null;
function canMoveNow() {
const ca = CC.P && CC.P.ca, G = CC.G;
return !!(ca && ca.active && !ca.caught && G && G.state === 'hand' && !(CC.Dao && CC.Dao.on) && !(CC.Xem && CC.Xem.on) &&
(!UI.isOpen() || ['pond', 'online', 'map', 'setup'].indexOf(UI.current) >= 0));
}
function friendMove() {
const ca = CC.P.ca, f = room.ds.get(room.canh);
if (ca.caught) { toast(`🌐 ${f ? f.ten + ' นั่งช่อง ' + f.so : 'เพื่อนของคุณอยู่ในห้องนี้'} — คุณได้ปลาที่ช่อง ${ca.o} แล้ว จึงนั่งอยู่ช่องเดิม`, 'info', 6500); return; }
pendMove = { so: room.toi.so, until: Date.now() + 90e3 };
moveTick();
if (pendMove) toast(`🪑 เซิร์ฟเวอร์จัดให้คุณนั่งช่อง ${pendMove.so}${f ? ' ข้าง ' + f.ten : ''} — ยกคันขึ้นแล้วระบบจะย้ายให้ทันที`, 'info', 6000);
}
function moveTick() {
if (!pendMove) return;
const ca = CC.P && CC.P.ca, so = pendMove.so;
if (!inRoom() || !ca || !ca.active || ca.o === so || room.toi.so !== so) { pendMove = null; return; }
if (ca.caught || Date.now() > pendMove.until) {
pendMove = null;
toast(`🌐 ย้ายไปช่อง ${so} ไม่ได้ (${ca.caught ? 'ได้ปลาที่ช่องนี้แล้ว' : 'กำลังติดภารกิจตกอยู่'}) — นั่งช่อง ${ca.o} ตามเดิม`, 'info', 5000);
return;
}
if (!canMoveNow()) return;
const f = room.ds.get(room.canh);
pendMove = null;
pickSeat(so, '');
toast(`🪑 ย้ายไปช่อง ${so}${f ? ' ข้าง ' + f.ten : ''} (เซิร์ฟเวอร์จัดตามรหัสเพื่อน)`, 'good', 4500);
}
function onLoi(ly, m) {
if (ly === 'cam') {
const den = m && +m.den > Date.now() ? +m.den : (cfg.camDen > Date.now() ? cfg.camDen : Date.now() + 3600e3);
C.camDen = den; cfg.camDen = den; cfg.camLy = m && typeof m.lyDo === 'string' ? m.lyDo.slice(0, 120) : cfg.camLy || ''; saveCfg();
C.stopRetry = true; cfg.phong = null; setErr('cam'); dropRoom();
toast(camText(), 'bad', 9000);
return;
}
if (ly === 'tk') { C.badTk = me().tk; C.stopRetry = true; setErr('het'); dropRoom(); toast('🌐 เซสชันหมดอายุ — เข้าสู่ระบบใหม่ (หน้าต่าง 👤 บัญชี) เพื่อเล่นออนไลน์', 'bad', 6000); return; }
if (ly === 'chuaten') { C.stopRetry = true; setErr('chuaten'); dropRoom(); toast('🌐 กรุณาตั้งชื่อผู้เล่นก่อน (หน้าต่าง 👤 บัญชี)', 'info', 6000); return; }
if (ly === 'day') { cfg.phong = null; saveCfg(); if (C.id && C.tru.indexOf(C.id) < 0) C.tru.push(C.id); if (C.tru.length > 6) C.tru.shift(); return; }
if (ly === 'ghe') { conflictAt = 0; gheCanh = null; if (room) conflict(); return; }
if (ly === 've') { C.veHong = true; return; }
if (ly === 'mang') { quiet('🌐 เซิร์ฟเวอร์บัญชีไม่ว่าง — จะกลับเข้าห้องออนไลน์ให้อัตโนมัติสักครู่', 'info'); return; }
}
const hai = n => (n < 10 ? '0' : '') + n;
function camText() {
const d = new Date(cfg.camDen || Date.now());
return `🔒 บัญชีถูกระงับการเล่นออนไลน์ชั่วคราวถึง ${hai(d.getHours())}:${hai(d.getMinutes())} น. วันที่ ${d.getDate()}/${d.getMonth() + 1}` +
`${cfg.camLy ? ', เหตุผล: ' + cfg.camLy : ''} คุณยังสามารถเล่นคนเดียวได้ตามปกติ`;
}
function dhDeo() {
try { const d = CC.ThanhTich && CC.ThanhTich.deo && CC.ThanhTich.deo(); return d && typeof d.id === 'string' && /^[a-z0-9]{1,12}$/.test(d.id) ? d.id : ''; }
catch (e) { return ''; }
}
function dhInfo(id) {
if (!id) return null;
const ds = CC.ThanhTich && Array.isArray(CC.ThanhTich.DS) ? CC.ThanhTich.DS : [];
for (const d of ds) if (d && d.id === id) return { b: String(d.bieu || '🎖'), t: String(d.ten || '') };
return { b: '🎖', t: '' };
}
function nhanTen(p, dai) {
if (!p) return '';
let ten = String(p.ten || '');
if (dai && ten.length > dai) ten = ten.slice(0, dai - 1) + '…';
const huy = (Array.isArray(p.huy) ? p.huy : []).map(h => (HUY_MAY[h] ? HUY_MAY[h].b : '')).join('');
const dh = dhInfo(p.dh);
return `${p.the ? '[' + p.the + '] ' : ''}${ten}${huy || dh ? ' ' + huy + (dh ? dh.b : '') : ''}`;
}
function tenHtml(p, ten) {
const huy = (Array.isArray(p.huy) ? p.huy : []).filter(h => HUY_MAY[h]).map(h => `<span class="on-huy" title="${esc(HUY_MAY[h].t)}">${HUY_MAY[h].b}</span>`).join('');
const dh = dhInfo(p.dh);
return `${p.the ? `<span class="on-the">${esc(p.the)}</span>` : ''}<b>${esc(ten == null ? p.ten : ten)}</b>${huy}${dh ? `<span class="on-huy" title="${esc(dh.t)}">${esc(dh.b)}</span>` : ''}`;
}
function onThe(m) {
if (!room || !Array.isArray(m.ds)) return;
for (const x of m.ds) {
const p = x && room.ds.get(x.ma);
if (!p) continue;
p.the = typeof x.the === 'string' ? x.the.slice(0, 4) : '';
p.huy = Array.isArray(x.huy) ? x.huy.filter(h => HUY_MAY[h]) : [];
p.dh = typeof x.dh === 'string' ? x.dh.slice(0, 12) : '';
const e = ents.get(p.ma);
if (e) { e.the = p.the; e.huy = p.huy; e.dh = p.dh; }
}
dirty();
}
function onGiaiGio(m, init) {
if (!room || !m || typeof m.id !== 'string') return;
const cu = room.gg;
room.gg = m.pha === 'xong' ? null : m;
if (!init && (!cu || cu.id !== m.id || cu.pha !== m.pha)) {
const ten = String(m.ten || 'ศึกชิงรางวัลรอบชั่วโมง');
if (m.pha === 'sap') logPush(`⏱ ${ten} เริ่มเวลา ${hai(new Date(m.batDau).getHours())}:${hai(new Date(m.batDau).getMinutes())} น. — ใครที่กำลังตกในบ่อนี้จะนับคะแนนให้อัตโนมัติ`);
else if (m.pha === 'dang') logPush(`⏱ ${ten} เริ่มขึ้นแล้ว! ${m.kieu === 'to' ? 'นับตัวใหญ่สุด' : 'นับน้ำหนักรวม'}, รวมทุกห้องของบ่อ`);
else if (m.pha === 'xong') logPush(`⏱ ${ten} หมดเวลาแล้ว — ดูผลได้ที่ 👥 ชุมชน`);
}
for (const f of O.onGiaiGio) { try { f(m); } catch (e) { console.error('[online] onGiaiGio', e); } }
dirty();
}
function cdTick() {
if (!inRoom() || !room.xh) return;
const dh = dhDeo(), an = cfg.an ? 1 : 0, o = { t: 'cd' };
if (dh !== (C.sentDh || '')) o.dh = dh;
if (an !== (C.sentAn || 0)) o.an = an;
if (!('dh' in o) && !('an' in o)) return;
if (send(o)) { C.sentDh = dh; C.sentAn = an; if ('dh' in o && room.toi) { room.toi.dh = dh; dirty(); } }
}
O.nutNguoi = [];
O.onGiaiGio = [];
O.giaiGio = () => (room && room.gg ? Object.assign({}, room.gg) : null);
O.nguoi = () => {
if (!room || !inRoom()) return [];
const mine = myMa(), ra = [];
for (const p of room.ds.values()) if (p.ma !== mine) ra.push({ ma: p.ma, ten: p.ten, the: p.the || '', huy: Array.isArray(p.huy) ? p.huy.slice() : [], dh: p.dh || '', o: p.so });
return ra;
};
O.anViTri = () => !!cfg.an;
O.camDen = () => (cfg.camDen > Date.now() ? cfg.camDen : 0);
function nutKhac(p) {
let s = '';
const n = { ma: p.ma, ten: p.ten, the: p.the || '', huy: Array.isArray(p.huy) ? p.huy.slice() : [], dh: p.dh || '' };
for (const f of O.nutNguoi) { try { const h = f(n); if (typeof h === 'string') s += h; } catch (e) { console.error('[online] nutNguoi', e); } }
return s;
}
O.ngoiCanh = (ma, ho) => {
ma = String(ma || '').toUpperCase();
if (!MA_RE.test(ma)) return false;
if (ma === cfg.ma) { toast('นั่นรหัสของคุณเองนะ 😄', 'info'); return false; }
if (O.camDen()) { toast(camText(), 'bad', 7000); return false; }
cfg.canh = ma; canhNhap = null;
if (!cfg.bat) cfg.bat = true;
saveCfg();
const P = CC.P, ca = P && P.ca, ten = ho && HO_TEN[ho] ? HO_TEN[ho] : '';
if (room && room.ds.has(ma)) { UI.close(); sitNear(ma); return true; }
if (ca && ca.active && ho && P.pondId === ho && C.want) {
const h = C.want.ho; leave(); C.want = { ho: h, canh: ma }; cfg.phong = null; connect();
toast(`🪑 กำลังย้ายไปยังห้องของเพื่อน ${ma}…`, 'info', 4500);
UI.close(); return true;
}
UI.open('pond');
toast(ca && ca.active && ho && P.pondId !== ho ? `🪑 บันทึกรหัส ${ma} แล้ว เพื่อนกำลังตกอยู่ที่${ten} — จบรอบนี้แล้วซื้อบัตร${ten} เพื่อไปนั่งข้างๆ`
: `🪑 บันทึกรหัส ${ma} แล้ว${ten ? ` — ซื้อบัตร${ten} ก็จะได้นั่งข้างเพื่อนทันที` : ' — ซื้อบัตรบ่อเดียวกับเพื่อนเพื่อเข้าไปนั่งข้างๆ'}`, 'info', 6500);
return true;
};
function logPush(txt, k) {
if (!room) return;
room.log.push({ at: Date.now(), txt, k: k || '' });
if (room.log.length > 30) room.log.splice(0, room.log.length - 30);
dirty();
}
function logEvent(ev) {
if (!room || !ev) return;
const p = room.ds.get(ev.ma), who = ev.ma === myMa() ? 'คุณ' : p ? p.ten : typeof ev.ten === 'string' && ev.ten ? ev.ten.slice(0, 24) : 'ใครบางคน';
if (ev.t === 'ca') logPush(`🎣 ${who} ได้${fishName(CC.FISH_BY_ID && CC.FISH_BY_ID[ev.sp])} ${kgTxt(+ev.w || 0)}${ev.tinh === false ? ' (ไม่นับคะแนนแข่ง)' : ''}`, 'ca');
else if (ev.t === 'chat') logPush(`💬 ${who}: ${chatText(ev.m)}`, 'chat');
}
const ents = new Map();
const stash = {};
function entOf(p) {
let e = ents.get(p.ma);
if (!e || e.id !== p.so) { e = { id: p.so, real: true, ma: p.ma, skill: 1, chum: 0.6 }; ents.set(p.ma, e); }
e.ten = String(p.ten || ''); e.name = '🌐 ' + e.ten; e.s = p.s || 'tay';
e.the = p.the || ''; e.huy = Array.isArray(p.huy) ? p.huy : []; e.dh = p.dh || '';
e.n = +p.n || 0; e.kg = +p.kg || 0; e.big = +p.big || 0;
return e;
}
function mySeat() {
const ca = CC.P && CC.P.ca;
if (!ca || !ca.active) return 0;
return ca.o || (room && room.toi ? room.toi.so : 0);
}
const roomHere = () => !!(room && CC.P && room.ho === CC.P.pondId);
function placeAll() {
const npcs = M.npcs;
if (!npcs) return;
const mine = myMa(), seat = mySeat(), want = {}, held = new Set();
if (roomHere()) {
for (const p of room.ds.values()) if (p.ma !== mine && p.so >= 1 && p.so <= 40 && p.so !== seat) want[p.so] = entOf(p);
for (const h of room.giu.values()) for (const g of h.ds) if (!want[g] && g !== seat) held.add(g);
}
for (const id in npcs) { const n = npcs[id]; if (n && n.real && want[id] !== n) delete npcs[id]; }
if (seat && npcs[seat] && !npcs[seat].real) { stash[seat] = npcs[seat]; delete npcs[seat]; }
for (const g of held) if (npcs[g] && !npcs[g].real) { stash[g] = npcs[g]; delete npcs[g]; }
for (const id in want) { const cur = npcs[id]; if (cur && !cur.real) stash[id] = cur; npcs[id] = want[id]; }
for (const id in stash) if (!npcs[id] && +id !== seat && !held.has(+id)) { npcs[id] = stash[id]; delete stash[id]; }
if (!roomHere()) ents.clear();
else for (const ma of [...ents.keys()]) if (!room.ds.has(ma)) ents.delete(ma);
}
const occupied = g => { if (!room) return false; const mine = myMa(); for (const p of room.ds.values()) if (p.ma !== mine && p.so === g) return true; return false; };
const heldBy = g => { if (!room || !room.giu) return ''; for (const [ma, h] of room.giu) if (h.ds.indexOf(g) >= 0) return ma; return ''; };
const blocked = g => { const h = heldBy(g); return !!h && h !== myMa() && h !== cfg.canh && h !== (room && room.canh); };
const noDraw = g => { const h = heldBy(g); return !!h && (h === myMa() || blocked(g)); };
const tenOf = ma => { const p = room && room.ds.get(ma); return p ? p.ten : 'ผู้เล่นอื่น'; };
const kc = (a, b) => { const d = Math.abs(a - b); return Math.min(d, 40 - d); };
const baseNewCa = M.newCa;
M.newCa = function () {
const r = baseNewCa.apply(this, arguments);
for (const k in stash) delete stash[k];
ents.clear();
try { placeAll(); } catch (e) {   }
return r;
};
const baseDrawSpots = UI.drawSpots;
if (baseDrawSpots) UI.drawSpots = function () {
const tmp = [], npcs = M.npcs;
if (npcs && roomHere()) {
const own = CC.P.ca && CC.P.ca.o;
for (const h of room.giu.values()) for (const g of h.ds) if (!npcs[g] && g !== own && noDraw(g)) { npcs[g] = { id: g, giu: true, name: '', n: 0, kg: 0 }; tmp.push(g); }
let free = M.spots.filter(sp => !npcs[sp.id] && sp.id !== own).length;
for (const sp of M.spots) {
if (free >= 2) break;
const n = npcs[sp.id];
if (n && !n.real && !n.giu && sp.id !== own) { stash[sp.id] = n; delete npcs[sp.id]; free++; }
}
while (free < 2 && tmp.length) { delete npcs[tmp.pop()]; free++; }
}
try { return baseDrawSpots.apply(this, arguments); }
finally { for (const g of tmp) if (npcs[g] && npcs[g].giu) delete npcs[g]; }
};
let gheAt = 0, conflictAt = 0;
let gheCanh = null;
function seatSync() {
if (!inRoom() || pendMove) return;
const ca = CC.P && CC.P.ca, toi = room.toi;
if (!ca || !ca.active || !ca.o || toi.so === ca.o) return;
const h = heldBy(ca.o), viaCanh = gheCanh && gheCanh.so === ca.o ? gheCanh.ma : '';
if (occupied(ca.o) || (blocked(ca.o) && h !== viaCanh)) return conflict();
if (Date.now() - gheAt < 5000) return;
gheAt = Date.now();
const canh = viaCanh || (h && h !== myMa() ? h : '');
send(canh ? { t: 'ghe', so: ca.o, canh } : { t: 'ghe', so: ca.o });
}
function pickSeat(g, canh) {
gheCanh = canh ? { so: g, ma: canh } : null;
UI.onAction('pick', { dataset: { id: String(g) } });
}
function conflict() {
const now = Date.now();
if (now - conflictAt < 8000 || !room) return;
const P = CC.P, ca = P && P.ca, G = CC.G, toi = room.toi;
if (!ca || !ca.active) return;
if (UI.current === 'map' && UI.data && UI.data.draw) { conflictAt = now; UI.open('map', { draw: drawWith(toi.so) }); return; }
const idle = G && G.state === 'hand' && !(CC.Dao && CC.Dao.on) && !UI.isOpen();
if (!idle || !ca.o) return;
conflictAt = now;
if (!ca.caught) {
toast(`🌐 ช่อง ${ca.o} ${blocked(ca.o) ? 'กำลังถูกจองให้เพื่อนของ ' + tenOf(heldBy(ca.o)) : 'เพิ่งมีผู้เล่นอื่นมานั่งแล้ว'} — กรุณาเลือกช่องอื่น`, 'info', 5000);
UI.open('map', { draw: drawWith(toi.so) });
return;
}
const from = ca.o, why = blocked(from) ? 'กำลังถูกจองให้เพื่อนของ ' + tenOf(heldBy(from)) : 'มีผู้เล่นอื่นมานั่งแล้วตอนที่คุณเน็ตหลุด';
ca.o = toi.so;
CC.Game.applySpot(toi.so);
CC.Pond.reset(G.q);
placeAll(); UI.refresh(); CC.save();
toast(`🌐 ช่อง ${from} ${why} — ย้ายมาช่อง ${toi.so} แล้ว ลองอ่อยเหยื่อเปิดหลุมใหม่นะ`, 'info', 6500);
}
function drawWith(first) {
const d = UI.drawSpots();
if (first && !occupied(first) && !blocked(first)) { const i = d.indexOf(first); if (i > 0) d.splice(i, 1); if (i !== 0) d.unshift(first); d.length = 2; }
UI.mapSel = d[0];
return d;
}
let sent = '', cand = '', candT = 0, fighting = false, caughtF = false, lossText = '', boAt = 0, selfToast = false;
const HOLD = { dinh: 0, dao: 300, vang: 3000, cho: 1500, tay: 8000 };
function myState() {
if (document.hidden) return 'vang';
if ((CC.Xem && CC.Xem.on) || (CC.Dao && CC.Dao.on)) return 'dao';
const G = CC.G, st = G && G.state;
if (st === 'fighting') return 'dinh';
if (st === 'waiting' || st === 'sinking') return 'cho';
return 'tay';
}
function stateTick(now) {
const s = myState();
if (s !== cand) { cand = s; candT = now; }
if (!inRoom() || cand === sent) return;
const hold = cand === 'tay' && (sent === 'dao' || !sent) ? 1500 : HOLD[cand];
if (cand === 'dinh' || sent === 'vang' || now - candT >= hold) { if (send({ t: 'tt', s: cand })) { sent = cand; room.toi.s = cand; } }
}
function nowTay() { sent = 'tay'; if (room && room.toi) room.toi.s = 'tay'; }
function fightTick() {
const G = CC.G, f = G && G.state === 'fighting' && G.fight;
if (f) { if (!fighting) { fighting = true; caughtF = false; lossText = ''; } return; }
if (!fighting) return;
fighting = false;
if (!caughtF && !inRoom()) caMat();
if (caughtF || !inRoom()) return;
const t = lossText;
const id = caMat();
if (send({ t: 'mat', id: id || undefined, ly: /สายหน้าขาด|ขาดผึง/i.test(t) ? 'dut' : /พันสาย/i.test(t) ? 'quan' : /เบ็ดหลุด|หลุด/i.test(t) ? 'tuot' : 'khac' })) nowTay();
}
const r2 = x => Math.round((+x || 0) * 100) / 100;
function boTick(now) {
if (!inRoom() || !(room.xem > 0) || now - boAt < 250) return;
const G = CC.G, F = G && G.state === 'fighting' && G.fight;
if (!F) return;
boAt = now;
const TU = CC.DaiFight.TUNE, line = CC.line(), hold = !!(CC.Game && CC.Game.holding && CC.Game.holding());
send({ t: 'bo', d: { Ts: r2(F.Ts), fx: r2(F.fx), fy: r2(F.fy), lat: r2(F.lat), th: r2(G.theta), phi: r2(G.phi), st: r2(F.stamina), w: r2(F.w), ar: r2(F.arm),
sp: F.sp.id, fs: F.state, ld: line.leader, ov: r2(Math.min(1, F.overAcc / TU.over)), h: hold ? 1 : 0, L: F.landable ? 1 : 0, wa: F.warn || '', lw: F.laneWarn || 0 } });
}
const baseShowCatch = UI.showCatch;
UI.showCatch = function (d) {
caughtF = true;
try {
if (inRoom() && d && d.sp && d.w > 0) {
const id = caLen(d);
if (!room.v2 && sent !== 'dinh' && sent !== 'vot') { send({ t: 'tt', s: 'dinh' }); sent = 'dinh'; }
if (id) { if (send({ t: 'ca', id, len: d.len ? Math.round(d.len) : undefined })) nowTay(); }
else if (!room.v2 && send({ t: 'ca', sp: d.sp.id, w: Math.round(d.w * 1000) / 1000, len: d.len ? Math.round(d.len) : undefined })) nowTay();
}
} catch (e) {   }
return baseShowCatch.apply(this, arguments);
};
const baseToast = UI.toast;
UI.toast = function (msg, type) {
if (!selfToast && type === 'bad' && CC.G && CC.G.state === 'fighting') lossText = String(msg || '');
return baseToast.apply(this, arguments);
};
function toast(msg, type, ms) { selfToast = true; try { UI.toast(msg, type, ms); } finally { selfToast = false; } }
function quiet(msg, type, ms) { if (document.body.classList.contains('fighting')) return; toast(msg, type, ms); }
const LY_KHONG = { som: 'อัดปลาเร็วเกินจริงเมื่อเทียบกับน้ำหนักปลา', nhanh: 'ติดปลาเร็วติดกันเกินไป (ยังไม่ทันปั้นเหยื่อตีซ้ำ)', nhieu: 'เกินจำนวนปลาที่นับได้ในรอบ 10 / 60 นาที',
id: 'ไม่ใช่ปลาที่เซิร์ฟเวอร์สุ่มแจก', cu: 'เกมเวอร์ชันเก่า — กรุณารีเฟรชหน้าเว็บ', chon: 'เซิร์ฟเวอร์ตรวจพบว่าคุณเลือกทิ้งปลาเล็กเพื่อรอแต่ปลาใหญ่ — 2 ชั่วโมงต่อจากนี้ปลาจะไม่ถูกนับคะแนนแข่ง' };
let san = null, cur = null, dat = null, viAt = 0, viLast = null, viSent = '', hoanTu = 0;
const v2 = () => !!(room && room.v2 && inRoom() && roomHere());
const myRig = ctx => !!(ctx && CC.G && ctx.rig && ctx.rig === CC.G.rig);
function onSan(m) {
if (!room || !room.v2 || typeof m.id !== 'string' || !CC.FISH_BY_ID || !CC.FISH_BY_ID[m.sp] || !(+m.w > 0)) return;
if ((cur && cur.id === m.id) || (dat && dat.id === m.id)) return;
san = { id: m.id, sp: m.sp, w: +m.w }; hoanTu = 0;
}
function caPhong(m) {
if (!room.v2) { san = null; return; }
const ms = m.san, md = m.dat;
san = null;
if (ms && (!cur || cur.id !== ms.id)) onSan(ms);
if (cur && !(ms && ms.id === cur.id)) cur = null;
const G = CC.G;
if (md && !(dat && dat.id === md.id && G && G.state === 'fighting')) send({ t: 'mat', id: md.id, ly: 'khac' });
if (dat && !(md && md.id === dat.id)) dat = null;
}
function caBo() { san = null; cur = null; dat = null; }
function nha() { if (cur) { if (v2()) send({ t: 'nha', id: cur.id }); cur = null; } }
function caLen(d) {
const x = dat; dat = null;
return x && room && room.v2 && d.sp && d.sp.id === x.sp ? x.id : '';
}
function caMat() { const x = dat; dat = null; return x ? x.id : ''; }
function ghiVi(list, wfn) {
const pd = CC.pond(), W = CC.world, k = {};
for (const f of list) {
const base = (f.abund || 0) * ((pd.fish && pd.fish[f.id]) || 0) * W.activity(f);
const w = +wfn(f) || 0;
if (base > 0 && w > 0) k[f.id] = Math.round(w / base * 1000) / 1000;
}
viLast = k;
}
function viTick(now) {
if (!viLast || !v2() || now - viAt < 10.5e3) return;
const s = JSON.stringify(viLast);
if (s === viSent) return;
viAt = now; viSent = s;
send({ t: 'vi', k: viLast });
}
const isFishList = l => Array.isArray(l) && l.length > 0 && l[0] && typeof l[0] === 'object' && typeof l[0].abund === 'number' && typeof l[0].id === 'string';
const Pond = CC.Pond;
if (Pond && Pond.update && Pond.strike) {
const baseUpd = Pond.update, baseStrike = Pond.strike;
Pond.update = function (dt, ctx) {
if (!v2() || !myRig(ctx)) return baseUpd.apply(this, arguments);
if (cur && Pond.suitor !== cur.su) nha();
if (Pond.suitor) return baseUpd.apply(this, arguments);
const pw = U.pickWeighted, rw = CC.rollWeight, s0 = san;
U.pickWeighted = function (list, wfn) {
if (isFishList(list)) {
try { ghiVi(list, wfn); } catch (e) {   }
if (s0) { const f = list.find(x => x.id === s0.sp) || CC.FISH_BY_ID[s0.sp]; if (f) return f; }
}
return pw.apply(this, arguments);
};
if (s0) CC.rollWeight = function (sp) { return sp && sp.id === s0.sp ? s0.w : rw.apply(this, arguments); };
let out;
try { out = baseUpd.apply(this, arguments); } finally { U.pickWeighted = pw; CC.rollWeight = rw; }
const su = Pond.suitor;
if (su && !su.lineOnly) {
if (s0 && su.sp && su.sp.id === s0.sp) { cur = { id: s0.id, sp: s0.sp, w: s0.w, su }; su.w = s0.w; san = null; }
else {
const now = Date.now();
if (!hoanTu) hoanTu = now;
if (now - hoanTu < 25e3) {
Pond.suitor = null; Pond.suitorBubbles = 0;
return { force: 0, held: -1, tiltX: 0, mouth: false, freeze: false, act: null };
}
}
}
return out;
};
Pond.strike = function (xa) {
const su = Pond.suitor, mine = !!(cur && su === cur.su), x = cur;
const r = baseStrike.apply(this, arguments);
if (mine) {
cur = null;
if (r && v2()) { dat = { id: x.id, sp: x.sp, w: x.w }; send({ t: 'dinh', id: x.id }); sent = 'dinh'; if (room.toi) room.toi.s = 'dinh'; }
else if (v2()) send({ t: 'nha', id: x.id });
}
return r;
};
}
function caTick() {
if (!cur) return;
const G = CC.G;
if (CC.Xem && CC.Xem.on) return;
if (!v2()) { cur = null; return; }
if (G && G.state !== 'waiting' && G.state !== 'sinking' && G.state !== 'fighting' && Pond.suitor !== cur.su) nha();
}
function onThuong(m) {
if (!room || !m || typeof m.g !== 'string' || typeof m.i !== 'string') return;
if (cfg.tra.indexOf(m.i) >= 0) return;
cfg.tra.push(m.i); if (cfg.tra.length > 30) cfg.tra.splice(0, cfg.tra.length - 30); saveCfg();
const i = Math.max(0, Math.min(2, (m.r | 0) - 1)), k = +m.k || 0, T = CC.TaiKhoan;
if (!DEV_THU && T && T.thuong && T.thuong(m)) {
toast(`🏆 ${HUY[i]} คุณได้${HANG[i]} ศึกแข่งตกปลา${pondName()} #${room.so}! กำลังส่งรางวัล ${k} ฿ เข้าบัญชี`, 'good', 6500);
return;
}
toast(`🏆 ${HUY[i]} คุณได้${HANG[i]} ศึกแข่งตกปลา${pondName()} #${room.so}!`, 'good', 6000);
if (k && CC.Quests && CC.Quests.give) CC.Quests.give(`ศึกแข่งออนไลน์${pondName()} #${room.so} — ${HANG[i]}`, k);
}
const W = CC.world, TROI_K = ['weather', 'windBase', 'windAngle', 'windDir', 'nextWeather', 'cloud', 'rainAmt', 'preRain', 'waterTemp'];
let rieng = null;
const gioOn = () => !!(room && room.gio && room.v2 && roomHere());
function gioPhut() {
const g = room.gio, sp = g.kt - g.bd, Cg = g.c0 + (sNow() - g.g0) / g.mp;
return g.bd + (((Cg - g.bd) % sp) + sp) % sp;
}
O.gioPhong = () => (gioOn() ? gioPhut() : null);
const baseHour = W.hour, baseClock = W.clock;
W.hour = function () { return gioOn() ? gioPhut() / 60 : baseHour.apply(this, arguments); };
W.clock = function () {
if (!gioOn()) return baseClock.apply(this, arguments);
const m = gioPhut();
return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.floor(m % 60)).padStart(2, '0');
};
function onGio(g, dau) {
if (!room || !room.v2 || !g || !(+g.mp > 0) || !(+g.kt > +g.bd)) return;
const cu = room.gio;
room.gio = { g0: +g.g0, c0: +g.c0, bd: +g.bd, kt: +g.kt, mp: +g.mp, tt: String(g.tt || 'cloudy'), wb: +g.wb || 0, wa: +g.wa || 0,
cl: +g.cl || 0, ra: +g.ra || 0, pr: +g.pr || 0, wt: +g.wt || 25 };
if (!roomHere()) return;
if (!rieng) { rieng = {}; for (const k of TROI_K) rieng[k] = W[k]; }
const doi = W.weather !== room.gio.tt;
const x = room.gio;
W.weather = CC.WEATHERS[x.tt] ? x.tt : 'cloudy'; W.windBase = x.wb; W.windAngle = x.wa; W.windDir = Math.cos(x.wa) >= 0 ? 1 : -1;
W.cloud = x.cl; W.rainAmt = x.ra; W.preRain = x.pr; W.waterTemp = x.wt; W.nextWeather = 60;
if (doi && !dau && cu) { const I = W.info(); quiet(`${I.icon} ${I.name} — ${W.changeHint()} (สภาพอากาศรวมทั้งบ่อ)`, 'info', 4500); }
if (CC.UI && UI.refresh) try { UI.refresh(); } catch (e) {   }
}
function troiRieng() {
if (!rieng) return;
for (const k of TROI_K) W[k] = rieng[k];
rieng = null;
try { UI.refresh(); } catch (e) {   }
}
function gioTick() {
if (rieng && !gioOn()) troiRieng();
if (gioOn()) W.nextWeather = 60;
}
const baseSave = CC.save;
if (baseSave) CC.save = function () {
if (!rieng) return baseSave.apply(this, arguments);
const tam = {};
for (const k of TROI_K) { tam[k] = W[k]; W[k] = rieng[k]; }
try { return baseSave.apply(this, arguments); } finally { for (const k of TROI_K) W[k] = tam[k]; }
};
function raceSet(d, init) {
if (!room || !d || !d.pha) return;
const prev = room.dua;
room.dua = { pha: d.pha, bd: +d.bd || 0, kt: +d.kt || 0, bang: Array.isArray(d.bang) ? d.bang : [], thuong: d.thuong };
if (Array.isArray(d.thuong)) room.thuong = d.thuong;
if (!init && prev && prev.pha !== d.pha) racePhase(prev.pha, room.dua);
if (d.pha !== 'dang') { room.warned = false; room.rank = -1; }
if (d.pha === 'xong' && !room.v2) payout(room.dua);
if (d.pha === 'dang') rankCheck(init);
dirty();
}
const prizes = () => room.thuong || [300, 150, 80];
const prizeTxt = () => prizes().slice(0, 3).map((k, i) => `${HUY[i]} ${k} ฿`).join(' · ');
const scoreTxt = r => (room && room.ho === 'tram' ? `ตัวใหญ่สุด ${kgTxt(+r.big || 0)}` : `${kgNum(r.kg)} กก. · ${r.n} ตัว`);
function racePhase(from, d) {
const lv = room.ho === 'tram', dur = Math.max(1, Math.round((d.kt - d.bd) / 60e3));
if (d.pha === 'cho') toast(`🏁 การแข่งตกปลาใกล้เริ่มแล้ว — อีก ${mmss(d.bd - sNow())} ${lv ? 'ใครได้ตัวใหญ่ที่สุด' : 'ใครได้น้ำหนักรวมมากที่สุด'}ใน ${dur} นาทีเป็นฝ่ายชนะ`, 'info', 5500);
else if (d.pha === 'dang') toast(`🏁 เริ่มแข่งแล้ว! ${dur} นาที, ${lv ? 'นับตัวใหญ่ที่สุด' : 'นับน้ำหนักรวม'} · รางวัล ${prizeTxt()}`, 'good', 5500);
else if (d.pha === 'xong') toast(d.bang.length ? '🏁 หมดเวลาการแข่งขัน! ' + d.bang.slice(0, 3).map((r, i) => `${HUY[i]} ${r.ma === myMa() ? 'คุณ' : r.ten} ${lv ? kgTxt(+r.big || 0) : kgNum(r.kg) + ' กก.'}`).join(' · ')
: '🏁 หมดเวลาการแข่งขัน — ยังไม่มีใครได้ปลา รอบหน้าสู้ใหม่นะ!', 'info', 7000);
else if (d.pha === 'nghi' && from === 'cho') toast('🏁 เลื่อนการแข่งขัน — ในห้องเหลือผู้เล่นไม่ถึง 2 คน', 'info');
}
function rankCheck(init) {
const i = room.dua.bang.findIndex(r => r.ma === myMa());
if (!init && i === 0 && room.rank !== 0 && room.dua.bang.length > 1) quiet('🏁 คุณกำลังขึ้นนำอันดับ 1 ในการแข่งขัน!', 'good');
room.rank = i;
}
function raceScore(m) {
const d = room.dua, x = m.dua;
if (!d || d.pha !== 'dang' || !x || typeof x !== 'object') return;
let r = d.bang.find(y => y.ma === m.ma);
if (!r) { r = { ma: m.ma, ten: '' }; d.bang.push(r); }
const p = room.ds.get(m.ma);
if (p && p.ten) r.ten = p.ten;
r.kg = +x.kg || 0; r.n = +x.n || 0; r.big = +x.big || 0; r.luc = +x.luc || 0;
const lv = room.ho === 'tram';
d.bang.sort((a, b) => ((lv ? (+b.big || 0) - (+a.big || 0) : (+b.kg || 0) - (+a.kg || 0)) || (+a.luc || 0) - (+b.luc || 0)));
rankCheck(false);
dirty();
}
function payout(d) {
const i = d.bang.findIndex(r => r.ma === myMa());
if (i < 0 || i > 2 || !d.bd) return;
const key = room.id + '|' + d.bd;
if (cfg.tra.indexOf(key) >= 0) return;
cfg.tra.push(key);
if (cfg.tra.length > 30) cfg.tra.splice(0, cfg.tra.length - 30);
saveCfg();
const k = +prizes()[i] || 0;
if (!k || !CC.Quests || !CC.Quests.give) return;
toast(`🏆 ${HUY[i]} คุณได้${HANG[i]} ศึกแข่งตกปลา${pondName()} #${room.so}!`, 'good', 6000);
CC.Quests.give(`ศึกแข่งออนไลน์${pondName()} #${room.so} — ${HANG[i]}`, k);
}
function raceTick() {
const d = room && room.dua;
if (!d || d.pha !== 'dang' || room.warned) return;
if (d.kt - sNow() < 60e3) { room.warned = true; quiet('🏁 การแข่งขันเหลืออีก 1 นาที!', 'info'); }
}
let chatAt = 0;
function sendChat(m) {
closeChat();
if (!inRoom()) { toast('🌐 ยังไม่ได้เข้าห้องออนไลน์', 'info'); return; }
const now = Date.now();
if (now - chatAt < 2000) { toast('ใจเย็นๆ — ส่งข้อความห่างกันอย่างน้อย 2 วินาที', 'info', 1500); return; }
chatAt = now;
send({ t: 'chat', m: String(m).slice(0, 80) });
}
const chatHtml = attr => `<div class="on-emo">${EMO.map((e, i) => `<button type="button" ${attr(':e' + (i + 1))}>${e}</button>`).join('')}</div>
    <div class="on-cau">${CAU.map(c => `<button type="button" ${attr(c)}>${esc(c)}</button>`).join('')}</div>`;
function toggleChat() {
const pop = $('on-chat'), hud = $('on-hud');
if (!pop || !hud) return;
if (!pop.classList.contains('hidden')) return closeChat();
if (!inRoom()) { toast('🌐 ยังไม่ได้เข้าห้องออนไลน์ — รอเชื่อมต่อสักครู่', 'info'); return; }
pop.classList.remove('hidden');
const r = hud.getBoundingClientRect(), gr = ($('game') || document.body).getBoundingClientRect();
pop.style.left = Math.max(6, r.left - gr.left) + 'px';
pop.style.bottom = Math.max(6, gr.bottom - r.top + 6) + 'px';
pop.style.maxHeight = Math.max(120, r.top - gr.top - 12) + 'px';
}
function closeChat() { const pop = $('on-chat'); if (pop) pop.classList.add('hidden'); }
let drv = null;
O.watchStart = (n, api) => {
if (drv) { try { drv.stop('thay'); } catch (e) {   } }
drv = makeDriver(n, api);
send({ t: 'xem', ma: n.ma });
return drv;
};
function stopWatch() { if (CC.Xem && CC.Xem.on) CC.Xem.stop('walk'); }
const stateLine = (nm, s) => ({
cho: `${nm} กำลังจ้องทุ่น — ถ้าปลากินจะได้ชมการอัดปลาสดๆ`, tay: `${nm} กำลังปั้นเหยื่อ พักมือ…`, quang: `${nm} กำลังตีเหยื่อลงหลุม`,
dinh: `${nm} กำลังอัดปลา!`, vot: `${nm} กำลังช้อนปลา!`, dao: `${nm} กำลังเดินเล่นรอบบ่อ — เก้าอี้ว่าง`, vang: `${nm} ไม่อยู่ชั่วคราว (สลับหน้าต่างอยู่)`
}[s] || `${nm} กำลังตกปลา`);
function makeDriver(n, api) {
const S = api.S, WG = api.WG, say1 = api.say1, say2 = api.say2;
const TU = CC.DaiFight.TUNE, Rig = CC.Rig, pond = CC.pond(), nm = n.ten || n.name;
const lane = pond.type === 'latvot' ? 3.7 : 2.9;
const d = { n, fr: [], lastS: null, landT: 0, restV: null, offSaid: false, netSaid: false };
if (S.pond) S.pond.suitor = null;
S.fb = { holding: false };
WG.who = nm;
const guessSp = () => (CC.FISH_BY_ID && CC.FISH_BY_ID[{ rophi: 'rophi', diec: 'diec', tram: 'tramden' }[pond.id] || 'rophi']) || CC.FISH[0];
const splash = (x, k, p) => { const R = CC.Render; if (R && R.splash && R.X) R.splash(R.X(x), R.sy, k, p); };
function setLine(ld) {
let best = null, bd = Infinity;
for (const l of CC.LINES) { const x = Math.abs(l.leader - ld); if (x < bd) { bd = x; best = l; } }
if (best) { S.lineO = best; S.P.line = best.id; }
}
function settle() {
WG.floatX = WG.fly ? WG.fly.x1 : WG.spotX; WG.fly = null;
try { Rig.rebait(WG.rig, S.bowls.cau, 'cau'); } catch (e) {   }
WG.sol = Rig.solve(WG.rig, CC.bottomDepth(WG.floatX) * 100, { sink: Infinity, sinkH: Infinity });
d.restV = WG.sol.v;
Object.assign(WG.dyn, { v: CC.float().n + 6, vel: 0, tilt: 1.45, drift: 0, driftT: null, tiltX: 0 });
WG.state = 'waiting';
splash(WG.floatX, 6, 0.35);
}
function idle(dt, rod) {
const s = n.s;
if (s === 'cho' || s === 'quang') {
if (WG.state === 'hand') {
const tip = CC.rodTip(WG.theta, rod.len);
WG.fly = { t: 0, dur: 0.75, x0: tip.x, y0: tip.y, x1: WG.spotX + U.rand(-0.06, 0.06) };
WG.state = 'flying'; WG.thetaTarget = REST;
} else if (WG.state === 'flying') { WG.fly.t += dt; if (WG.fly.t >= WG.fly.dur) settle(); }
else if (WG.state === 'waiting' && d.restV != null) Rig.step(WG.dyn, d.restV, dt, WG.t);
return;
}
if (WG.state !== 'hand') { WG.state = 'hand'; WG.thetaTarget = REST; WG.fly = null; }
}
function fightOn() {
const f = Object.create(CC.DaiFight.prototype);
Object.assign(f, { sp: guessSp(), w: 1, fx: Math.max(2, WG.floatX || 4), fy: -0.6, lat: 0, vx: 0, vy: 0, vz: 0, latV: 0, Ts: 0, T: 0,
stamina: 1, arm: 1, state: 'shock', warn: null, laneWarn: 0, laneW: lane, lane, landable: false, overAcc: 0, gulping: false,
stretch: 0, alpha: Math.PI / 2, t: 0, held: null, overload: false });
WG.fight = f; WG.state = 'fighting'; WG.fightTime = 0; WG.fly = null; S.catchShow = null; d.netSaid = false;
say1(`⚡ ${nm} ติดปลาแล้ว — ชมการอัดปลาสดๆ`, 'good', 1.8);
splash(f.fx, 8, 0.6);
}
function fightOff() {
WG.fight = null; WG.state = 'hand'; WG.thetaTarget = REST; WG.bend = 0; WG.phi = WG.phiT = 0;
S.hand = null; S.fb = { holding: false }; d.fr = []; d.netSaid = false;
}
function fightUpd(dt, now, rod) {
const f = WG.fight, fr = d.fr, tR = now - 280;
let a = fr[0], b = fr[fr.length - 1];
for (let i = fr.length - 1; i > 0; i--) if (fr[i - 1].at <= tR) { a = fr[i - 1]; b = fr[i]; break; }
const span = b.at - a.at, k = span > 1 ? U.clamp((tR - a.at) / span, 0, 1.3) : 1;
const A = a.d, B = b.d, sec = Math.max(0.08, span / 1000);
const L = (key, def) => { const x = A[key], y = B[key]; if (typeof y !== 'number') return def; if (typeof x !== 'number') return y; return x + (y - x) * k; };
f.fx = L('fx', f.fx); f.fy = L('fy', f.fy); f.lat = L('lat', f.lat);
if (typeof A.fx === 'number' && typeof B.fx === 'number' && a !== b) {
f.vx = (B.fx - A.fx) / sec; f.vy = (B.fy - A.fy) / sec; f.vz = f.latV = ((B.lat || 0) - (A.lat || 0)) / sec;
}
f.Ts = f.T = Math.max(0, L('Ts', f.Ts));
f.stamina = U.clamp(L('st', f.stamina), 0, 1);
f.arm = U.clamp(L('ar', f.arm), 0, 1);
if (typeof B.w === 'number' && B.w > 0) f.w = B.w;
if (typeof B.sp === 'string' && CC.FISH_BY_ID && CC.FISH_BY_ID[B.sp]) f.sp = CC.FISH_BY_ID[B.sp];
f.state = typeof B.fs === 'string' && B.fs ? B.fs : Math.hypot(f.vx, f.vz) > 1.1 ? 'run' : f.stamina < 0.4 ? 'tired' : 'hold';
f.warn = typeof B.wa === 'string' && B.wa ? B.wa : null;
f.laneWarn = typeof B.lw === 'number' ? Math.sign(B.lw) : Math.abs(f.lat) > lane * 0.72 && f.fy < 0 ? Math.sign(f.lat) : 0;
f.landable = typeof B.L === 'number' ? !!B.L : f.fx < TU.netX && f.fy > -0.4 && f.stamina < TU.netStam && Math.abs(f.lat) < 1.4;
f.overAcc = typeof B.ov === 'number' ? B.ov * TU.over : 0;
f.held = typeof B.h === 'number' ? !!B.h : null;
f.gulping = f.fy > -0.15 && f.fy <= 0.05 && f.stamina < TU.gulpStam;
f.t += dt;
if (typeof B.ld === 'number' && B.ld > 0 && (!S.lineO || Math.abs(S.lineO.leader - B.ld) > 0.01)) setLine(B.ld);
WG.fightTime += dt;
WG.theta = U.clamp(L('th', WG.theta), -0.2, 2.2); WG.thetaTarget = WG.theta;
WG.phi = L('phi', WG.phi || 0); WG.phiT = WG.phi;
WG.bend = U.clamp(f.Ts / rod.power, 0, 1);
const ph = WG.phi || 0, ct = Math.cos(WG.theta), tip = CC.rodTip(WG.theta, rod.len, ph);
const lx = f.fx - tip.x, ly = f.fy - tip.y, lz = f.lat - (tip.z || 0), ll = Math.hypot(lx, ly, lz) || 1;
f.alpha = Math.acos(U.clamp((ct * Math.cos(ph) * lx + Math.sin(WG.theta) * ly + ct * Math.sin(ph) * lz) / ll, -1, 1));
f.stretch = f.Ts > 0.04 ? 0 : -0.1;
S.fb = { holding: f.held === true };
const phiD = (WG.phi || 0) / DEG, side = Math.abs(phiD) > 10 ? (phiD < 0 ? '⬅ วาดคันไปทางซ้าย' : 'วาดคันไปทางขวา ➡') : '';
const r = f.Ts / ((S.lineO && S.lineO.leader) || 2);
if (f.landable) S.hand = { main: '🥅 ปลาเอียงข้าง หมดแรงแล้ว — ช้อนสวิง', key: 'ช้อน', cls: 'good', hold: f.held === true, side };
else if (f.held === true) S.hand = { main: f.gulping ? '💧 ยกคันให้ปลาฮุบอากาศ' : '✊ งัดคัน — ดึงปลาเข้าฝั่ง', key: 'งัด', cls: f.gulping ? 'good' : '', hold: true, side };
else if (f.held === false) S.hand = { main: r > 0.85 ? '🖐 ปล่อยมือ — สายตึงมาก ให้คันช่วยผ่อนแรง' : '🖐 ผ่อนให้คันช่วยซับแรง', key: 'ปล่อย', cls: r > 0.85 ? 'bad' : '', hold: false, side };
else S.hand = { main: '🎣 กำลังอัดปลา', key: '🎣', cls: '', hold: false, side };
if (f.landable && !d.netSaid) { d.netSaid = true; say2(`ปลาหมดแรงแล้ว — ${nm} กำลังเตรียมช้อนปลา`, 'good', 1.6); }
}
d.push = fr => { const t = performance.now(); if (t < (d.muteTo || 0)) return; d.fr.push({ at: t, d: fr }); if (d.fr.length > 10) d.fr.shift(); };
d.step = dt => {
WG.t += dt;
const now = performance.now(), fr = d.fr, last = fr[fr.length - 1], rod = CC.rod();
const live = !!last && now - last.at < 1600;
if (live) { if (WG.state !== 'fighting') fightOn(); fightUpd(dt, now, rod); }
else {
if (WG.state === 'fighting' && (!(n.s === 'dinh' || n.s === 'vot') || !last || now - last.at > 8000)) fightOff();
if (WG.state === 'landed') { if (WG.t - d.landT > 3.2) { WG.state = 'hand'; WG.thetaTarget = REST; S.catchShow = null; } }
else if (WG.state !== 'fighting') idle(dt, rod);
}
if (n.s !== d.lastS) { if (d.lastS != null && WG.state !== 'fighting') say2(stateLine(nm, n.s), 'info', 1.4); d.lastS = n.s; }
if (WG.state !== 'fighting') {
const spd = (WG.state === 'flying' ? 400 : rod.speed) * DEG * dt;
WG.theta += U.clamp(WG.thetaTarget - WG.theta, -spd, spd);
WG.bend += ((WG.state === 'waiting' ? 0.04 : 0) - WG.bend) * Math.min(1, dt * 6);
}
if (!inRoom()) { if (!d.offSaid) { d.offSaid = true; say1('🌐 ขาดการเชื่อมต่อ — กำลังเชื่อมต่อใหม่…', 'bad', 2); } }
else d.offSaid = false;
};
d.event = (kind, m, fish) => {
d.muteTo = performance.now() + 1500;
d.lastS = n.s;
if (kind === 'ca') {
const sp = fish || (WG.fight && WG.fight.sp) || guessSp(), w = +m.w || 0;
fightOff();
WG.state = 'landed'; WG.thetaTarget = 12 * DEG; d.landT = WG.t;
S.catchShow = { sp, w, t0: WG.t };
say1(`🎣 ปลาขึ้นแล้ว! ${fishName(sp)} ${kgTxt(w)}`, 'good', 2.6);
say2(`${nm}: ${n.n} ตัว · ${kgNum(n.kg)} กก. ในห้องนี้`, 'good', 2.4);
splash(WG.floatX || 2, 8, 0.6);
} else if (kind === 'mat') {
fightOff();
say1({ dut: 'ผึง! สายหน้าขาด — ปลาหลุดไป', tuot: 'เบ็ดหลุด — เสียปลาไป', quan: 'ปลาพุ่งข้ามช่องพันสาย — ปลาหลุดไป' }[m.ly] || 'ปลาหลุด!', 'bad', 2.6);
say2(`${nm} เสียดายสุดๆ กำลังเกี่ยวเหยื่อตกต่อ…`, 'info', 2);
}
};
d.stop = (why, mins) => {
if (drv === d) drv = null;
send({ t: 'thoixem' });
if (why === 'walk') toast(`🚶 เดินต่อ — นั่งดู ${nm} ตกปลาไป ${Math.max(1, mins || 0)} นาที`, 'info', 3500);
else if (why === 'mang') toast('🌐 ขาดการเชื่อมต่อห้องออนไลน์ — หยุดดู', 'info');
};
d.gear = () => `🌐 ${nm} · ช่อง ${n.id} · ชมถ่ายทอดสดออนไลน์${inRoom() ? '' : ' · ขาดการเชื่อมต่อ กำลังต่อใหม่…'}`;
say1(`👀 มานั่งข้างหลัง ${nm} ชมการตกปลาสดๆ`, 'info', 2.2);
say2(stateLine(nm, n.s), 'info', 1.6);
d.lastS = n.s;
return d;
}
O.ttText = n => `${TT_ICO[n.s] || ''} ${TT_TXT[n.s] || ''}`.trim();
O.loiGanDay = n => { const p = room && room.ds.get(n.ma); return p && p.chat && Date.now() - p.chat.at < 25e3 ? p.chat.m : ''; };
O.cardText = n => `🌐 ผู้เล่นออนไลน์ · ${TT_TXT[n.s] || 'กำลังตกปลา'}\n${n.n ? `${n.n} ตัว · ${kgNum(n.kg)} กก. · ตัวใหญ่สุด ${kgTxt(n.big)}` : 'ยังไม่ได้ปลาสักตัว'} (ในห้องนี้)`;
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
O.daoTags = (g, a) => {
const holds = roomHere() ? [...room.giu] : [];
if (!ents.size && !holds.length) return;
const skip = new Set();
for (const l of a.labels || []) if (l.sp) skip.add(l.sp.id);
if (a.card) skip.add(a.card);
const fs = Math.max(10, a.FS - 1.5), h = fs + 8;
g.font = a.font(fs, true); g.textAlign = 'center'; g.textBaseline = 'middle';
const cw = g.canvas.clientWidth || 9999;
const put = (sp, txt, held) => {
const w = g.measureText(txt).width + 14;
let r = null, sx = 0, sy = 0;
for (const back of [4.7, 6.3]) {
const bx = sp.x - sp.nx * back, by = sp.y - sp.ny * back;
if (!a.seen(bx, by, 2)) continue;
sx = U.clamp(a.SX(bx), w / 2 + 4, Math.max(w / 2 + 4, cw - w / 2 - 4)); sy = a.SY(by);
const c = { x: sx - w / 2, y: sy - h / 2, w, h };
if (!(a.avoid && a.avoid.some(b => overlap(b, c)))) { r = c; break; }
}
if (!r) return;
g.fillStyle = held ? 'rgba(14,38,62,0.66)' : 'rgba(14,38,62,0.88)'; a.rrect(g, r.x, r.y, w, h, h / 2); g.fill();
g.strokeStyle = 'rgba(106,184,255,0.95)'; g.lineWidth = 1.2;
if (held && g.setLineDash) g.setLineDash([4, 3]);
g.stroke();
if (held && g.setLineDash) g.setLineDash([]);
g.fillStyle = held ? '#cfe6ff' : '#e6f2ff'; g.fillText(txt, sx, sy + 0.5);
if (a.avoid) a.avoid.push(r);
};
for (const n of ents.values()) {
if (M.npcAt(n.id) !== n || skip.has(n.id)) continue;
put(M.spot(n.id), `${nhanTen(n, 16)} ${TT_ICO[n.s] || ''}`.trim(), false);
}
const mine = myMa();
for (const [ma, x] of holds) for (const id of x.ds) {
if (M.npcAt(id) || skip.has(id)) continue;
const t = tenOf(ma);
put(M.spot(id), ma === mine ? '👥 ช่องที่คุณจองให้เพื่อน' : `👥 จองให้เพื่อนของ ${t.length > 10 ? t.slice(0, 9) + '…' : t}`, true);
}
};
function stText() {
if (C.st === 'loi') return { may: 'เซิร์ฟเวอร์ออนไลน์ยังไม่เปิดให้บริการ', dangnhap: 'เข้าสู่ระบบเพื่อเล่นออนไลน์', chuaten: 'ตั้งชื่อเพื่อเล่นออนไลน์',
het: 'เซสชันหมดอายุ — เข้าสู่ระบบใหม่', thay: 'กำลังเล่นออนไลน์ในแท็บอื่นอยู่', cam: 'บัญชีถูกระงับการเล่นออนไลน์ชั่วคราว' }[C.err] || 'ยังเข้าห้องไม่ได้';
if (C.st === 'cho') return 'เน็ตหลุด · กำลังเชื่อมต่อใหม่…';
if (C.st === 'sanh' || C.st === 'noi' || C.st === 'chao') return 'กำลังเข้าห้อง…';
if (room) return `${pondName()} #${room.so} · ${room.ds.size} คน`;
return 'ออนไลน์';
}
function raceLine() {
const d = room && room.dua;
if (!d || !inRoom()) return '';
const t = sNow();
if (d.pha === 'cho') return `🏁 แข่งในอีก ${mmss(d.bd - t)}`;
if (d.pha === 'dang') {
const i = d.bang.findIndex(r => r.ma === myMa());
return `🏁 ${i >= 0 ? `อันดับ ${i + 1}/${d.bang.length} · ${room.ho === 'tram' ? kgTxt(+d.bang[i].big || 0) : kgNum(d.bang[i].kg) + ' กก.'}` : 'ยังไม่มีปลา'} · เหลือ ${mmss(d.kt - t)}`;
}
if (d.pha === 'xong') return `🏁 ผลการแข่ง · รอบใหม่ใน ${mmss(d.kt - t)}`;
return '';
}
let dirtyF = true, lastRender = 0;
function dirty() { dirtyF = true; }
const setText = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };
const lastHtml = {};
const setHtml = (id, h) => { const el = $(id); if (el && lastHtml[id] !== h) { lastHtml[id] = h; el.innerHTML = h; } };
function render(now) {
const follow = document.body.classList.contains('dao-on') || document.body.classList.contains('xem-on');
if (!dirtyF && !follow && now - lastRender < 1000) return;
dirtyF = false; lastRender = now;
const hud = $('on-hud');
if (!hud) return;
const B = document.body, fight = B.classList.contains('fighting'), dao = B.classList.contains('dao-on'), xem = B.classList.contains('xem-on');
const active = cfg.bat && !!(C.want || C.st === 'loi');
const show = active && !(fight && !(room && room.xem > 0)) && !(UI.isOpen() && UI.current !== 'online');
hud.classList.toggle('hidden', !show);
if (show) {
hud.classList.toggle('fight', fight);
hud.classList.toggle('dao', dao && !xem);
hud.classList.toggle('xem', xem);
hud.classList.toggle('low', !fight && !dao && !xem && isHidden($('btn-dao')));
hud.classList.toggle('off', C.st !== 'vao');
const xemN = room && room.xem > 0 ? ` · 👀 ${room.xem}` : '';
setText($('on-l1'), fight ? `👀 มี ${room ? room.xem : 0} คนกำลังดูคุณอัดปลา` : `🌐 ${stText()}${xemN}`);
const l2 = fight ? '' : raceLine(), e2 = $('on-l2');
setText(e2, l2);
if (e2) e2.classList.toggle('hidden', !l2);
const cb = $('on-chat-b');
if (cb) cb.classList.toggle('hidden', fight || !inRoom());
const gr = ($('game') || B).getBoundingClientRect();
if (fight) {
const tl = $('hud-tl');
if (tl) hud.style.top = Math.round(tl.getBoundingClientRect().bottom - gr.top + 8) + 'px';
} else if (hud.style.top) hud.style.top = '';
const under = xem ? $('xem-bar') : dao ? $('dao-hint') : null, ub = under && under.textContent ? under.getBoundingClientRect() : null;
const bot = ub && ub.height ? Math.round(gr.bottom - ub.top + 6) + 'px' : '';
if (hud.style.bottom !== bot) hud.style.bottom = bot;
} else closeChat();
if (UI.current === 'online' && UI.isOpen()) refreshPanel();
}
function raceHtml() {
const d = room && room.dua;
if (!room) return '';
const lv = room.ho === 'tram', t = sNow();
if (!d || d.pha === 'nghi') return `<div class="on-dua"><b>🏁 ศึกแข่งตกปลา</b> — ต้องมีผู้เล่นในห้องอย่างน้อย 2 คน ส่งรหัส <b>${esc(myMa())}</b> ชวนเพื่อนมาตกด้วยกัน!</div>`;
const rule = lv ? 'ตัวใหญ่ที่สุด' : 'น้ำหนักปลารวม';
let head;
if (d.pha === 'cho') head = `<b>🏁 การแข่งขันจะเริ่มใน ${mmss(d.bd - t)}</b> · ${Math.round((d.kt - d.bd) / 60e3)} นาที, นับ${rule} · รางวัล ${prizeTxt()}`;
else if (d.pha === 'dang') head = `<b>🏁 กำลังแข่งขัน — เหลือ ${mmss(d.kt - t)}</b> · นับ${rule} · รางวัล ${prizeTxt()}`;
else head = `<b>🏁 ผลการแข่งขัน</b> · รอบใหม่ในอีก ${mmss(d.kt - t)}`;
const mine = myMa(), rows = d.bang.slice(0, 10);
const i = d.bang.findIndex(r => r.ma === mine);
if (i >= 10) rows.push(d.bang[i]);
const tb = rows.length ? `<table class="on-bang">${rows.map(r => {
const k = d.bang.indexOf(r);
return `<tr class="${r.ma === mine ? 'me' : ''}"><td>${k < 3 ? HUY[k] : k + 1}</td><td>${esc(r.ma === mine ? 'คุณ' : r.ten)}</td><td class="num">${esc(scoreTxt(r))}</td></tr>`;
}).join('')}</table>` : `<div class="dim">${d.pha === 'cho' ? 'ยังไม่เริ่ม' : 'ยังไม่มีใครตกปลาได้'}</div>`;
return `<div class="on-dua">${head}${tb}</div>`;
}
const canMoveSeat = () => { const ca = CC.P && CC.P.ca, G = CC.G; return !!(ca && ca.active && (!ca.o || (!ca.caught && G && G.state === 'hand'))); };
function dsHtml() {
if (!room) return '';
const mine = myMa(), P = CC.P, ca = P && P.ca;
const list = [...room.ds.values()].sort((a, b) => a.so - b.so);
const canMove = canMoveSeat();
return list.map(p => {
const me2 = p.ma === mine, e = ents.get(p.ma), seen = e && M.npcAt(e.id) === e;
const nb = !me2 && ca && ca.o && near(ca.o, p.so, 1), g = !me2 && canMove && !nb ? nearSeatFor(p) : 0, hd = room.giu.get(p.ma);
const btns = me2 ? '<span class="dim">(คุณ)</span>'
: `${seen ? `<button data-act="on-xem" data-ma="${esc(p.ma)}">👀 ดู</button>` : ''}${g ? `<button data-act="on-canh-ngoi" data-ma="${esc(p.ma)}">🪑 นั่งข้างๆ · ช่อง ${g}</button>` : ''}${nb ? '<span class="dim">นั่งข้างคุณ</span>' : ''}`;
const khac = me2 ? '' : nutKhac(p);
return `<div class="on-p${me2 ? ' me' : ''}"><span class="o">ช่อง ${p.so}</span><span class="t">${tenHtml(p, me2 ? p.ten + ' (คุณ)' : p.ten)} · ${TT_ICO[p.s] || ''} ${TT_TXT[p.s] || ''}<br>
        <span class="dim">${p.n ? `${p.n} ตัว · ${kgNum(p.kg)} กก. · ใหญ่สุด ${kgTxt(+p.big || 0)}` : 'ยังไม่ได้ปลา'}${hd && hd.ds.length ? ` · 👥 จองช่อง ${hd.ds.join(', ')} ให้เพื่อน` : ''}</span></span><span class="b">${btns}${khac}</span></div>`;
}).join('');
}
function giuHtml() {
if (!room) return '';
const ca = CC.P && CC.P.ca, mine = myMa(), h = myHold();
const seated = !!(ca && ca.active && ca.o && ca.o === room.toi.so);
let s;
if (h) s = `<b>👥 กำลังจองช่อง ${h.ds.join(', ')} ให้เพื่อน</b> · เหลือ ${mmss(h.het - sNow())} <button data-act="on-giu" data-k="0">เลิกจอง</button>
      <br><span class="dim">ให้เพื่อนกรอกรหัส <b class="on-ma">${esc(mine)}</b> ลงในช่อง "นั่งข้างเพื่อนที่มีรหัส" (หน้าต่าง 🎣 เลือกบ่อ) แล้วซื้อบัตร${esc(pondName())} ก็จะได้นั่งตรงที่จองไว้ ผู้เล่นอื่นจะสุ่มไม่เจอช่องนี้</span>`;
else s = `<b>👥 จองช่องให้เพื่อน</b> — เว้นช่องว่างข้างคุณไว้ 5 นาทีให้เพื่อนเข้าตามรหัส <b class="on-ma">${esc(mine)}</b>: ` +
(seated ? [1, 2, 3].map(k => `<button data-act="on-giu" data-k="${k}">${k} ช่อง</button>`).join(' ') : '<span class="dim">กรุณาเลือกช่องนั่งก่อน</span>');
const gy = room.goiY;
if (gy && seated) {
const why = ca.caught ? 'ได้ปลาที่ช่องนี้แล้วจึงย้ายที่ไม่ได้' : 'กรุณายกคันขึ้นก่อนจึงจะย้ายที่ได้';
s += `<br><span class="dim">ทั้งสองข้างของช่อง ${ca.o} ไม่มีช่องว่างติดกันถึง ${gy.k} ช่อง</span> ` +
(canMoveSeat() ? `<button class="good" data-act="on-giu-chuyen">ย้ายไปช่อง ${gy.so} เพื่อจองให้ครบ</button>` : `<span class="dim">(${why})</span>`);
}
return `<div class="on-giu">${s}</div>`;
}
function logHtml() {
if (!room || !room.log.length) return '<div class="dim">ยังไม่มีความเคลื่อนไหว</div>';
return room.log.slice(-14).reverse().map(x => `<div class="${x.k}">${esc(x.txt)}</div>`).join('');
}
function refreshPanel() {
setHtml('onp-st', esc(stText()));
setHtml('onp-dua', raceHtml());
setHtml('onp-giu', giuHtml());
setHtml('onp-ds', dsHtml());
setHtml('onp-log', logHtml());
}
PN.online = () => {
const who = me(), b = base();
const ca = CC.P && CC.P.ca, ho = CC.P && CC.P.pondId;
let note = '';
if (!b) note = 'เซิร์ฟเวอร์ออนไลน์ยังไม่เปิดให้บริการ — คุณยังตกปลาคู่กับนักตกปลาในบ่อแบบออฟไลน์ได้ตามปกติ';
else if (!cfg.bat) note = 'ปิดการเล่นออนไลน์อยู่';
else if (HO_ON.indexOf(ho) < 0) note = 'บ่อนี้ไม่มีห้องออนไลน์ (ศึกชิงแชมป์วันอาทิตย์เล่นคนเดียว) กรุณาเลือกบ่อปลานิล บ่อปลาตะเพียนจีน หรือบ่อปลาเฉาดำ';
else if (C.st === 'loi' && C.err === 'cam') note = camText();
else if (!(ca && ca.active) && !room) note = 'ซื้อบัตรเข้าบ่อเพื่อเข้าห้องออนไลน์ของบ่อนั้น';
const lk = lastHtml; delete lk['onp-st']; delete lk['onp-dua']; delete lk['onp-giu']; delete lk['onp-ds']; delete lk['onp-log'];
const tk = C.st === 'loi' && (C.err === 'dangnhap' || C.err === 'chuaten' || C.err === 'het') ? ' <button data-act="tk-mo">👤 บัญชี</button>' : '';
const noi = C.st === 'loi' && C.err === 'thay' ? ' <button class="good" data-act="on-noi">🔌 เล่นออนไลน์ในแท็บนี้</button>' : '';
return `<h2>🌐 เล่นออนไลน์${room ? ` — ${esc(pondName())} #${room.so}` : ''}</h2>
      <div class="sub"><span id="onp-st">${esc(stText())}</span>${tk}${noi}${who.ten ? ` · คุณ: <b>${esc(who.ten)}</b>` : ''}${cfg.ma ? ` · รหัสของคุณ <b class="on-ma">${esc(cfg.ma)}</b> (ส่งให้เพื่อนเพื่อมานั่งข้างๆ)` : ''}</div>
      ${note ? `<p class="dim">${esc(note)}</p>` : ''}
      <div id="onp-dua">${raceHtml()}</div>
      ${room ? `<div id="onp-giu">${giuHtml()}</div>` : ''}
      ${room ? `<h3>ผู้เล่นในห้อง</h3><div id="onp-ds" class="on-ds">${dsHtml()}</div>
      <h3>แชทด่วน</h3>${chatHtml(m => `data-act="on-chat" data-m="${esc(m)}"`)}
      <div id="onp-log" class="on-log">${logHtml()}</div>` : ''}
      <p class="btnrow" style="margin-top:14px"><button data-act="${cfg.bat ? 'on-tat' : 'on-bat'}">${cfg.bat ? '🔌 ปิดโหมดออนไลน์' : '🌐 เปิดโหมดออนไลน์'}</button>
      <button data-act="help">❔ คู่มือ</button></p>`;
};
function pondBox() {
const b = base(), who = me(), signed = !!(who.tk && who.ten);
let body;
if (!b) body = '<span class="dim">เซิร์ฟเวอร์ออนไลน์ยังไม่เปิดให้บริการ — คุณยังตกปลาคู่กับเพื่อนข้างบ่อในโหมดออฟไลน์ได้ตามปกติ</span>';
else if (!who.tk) body = 'ต้อง <b>เข้าสู่ระบบ Google</b> และตั้ง <b>ชื่อผู้เล่น</b> เพื่อให้เพื่อนเห็นคุณในบ่อ <button data-act="tk-mo">👤 บัญชี</button>';
else if (!who.ten) body = 'ตั้ง <b>ชื่อผู้เล่น</b> ก่อน (หนึ่งบัญชีต่อหนึ่งชื่อ ไม่ซ้ำใคร) <button data-act="tk-mo">👤 ตั้งชื่อ</button>';
else {
const inR = room ? ` · อยู่ในห้อง <b>${esc(pondName())} #${room.so}</b> (${room.ds.size} คน) <button data-act="on-mo">เปิดหน้าต่างออนไลน์</button>` : C.st === 'loi' ? ` · <span class="bad">${esc(stText())}</span>` : '';
body = `<div class="on-row"><button data-act="on-bat" class="${cfg.bat ? 'good' : ''}">${cfg.bat ? '🌐 ออนไลน์: เปิด' : '🌐 เปิดเล่นออนไลน์'}</button>
        <span>ชื่อ: <b>${esc(who.ten)}</b>${cfg.ma ? ` · รหัสของคุณ <b class="on-ma">${esc(cfg.ma)}</b>` : ''}</span></div>`;
if (cfg.bat) body += `<div class="on-row">นั่งข้างเพื่อนที่มีรหัส <input type="text" id="on-canh-in" maxlength="6" placeholder="เช่น ABC234" autocomplete="off" spellcheck="false" value="${esc(canhNhap != null ? canhNhap : cfg.canh)}">
          <button data-act="on-canh-luu">บันทึก</button>${cfg.canh ? ' <button data-act="on-canh-xoa">✕ ลบ</button>' : ''}</div>
        ${nhomRow()}
        <div class="on-row"><label class="on-an"><input type="checkbox" data-act="on-an"${cfg.an ? '' : ' checked'}> ให้เพื่อนเห็นว่าฉันกำลังตกอยู่ที่ไหน</label>
          <span class="dim on-small">${cfg.an ? 'ปิดอยู่: เพื่อนที่มีรหัสของคุณจะเห็นว่า "ไม่ได้ตกออนไลน์"' : 'คนที่มีรหัสของคุณจะเห็นว่าคุณตกอยู่บ่อไหน ห้องไหน'}</span></div>
        ${O.camDen() ? `<div class="on-row bad">${esc(camText())}</div>` : ''}
        <div class="dim on-small">ซื้อบัตรบ่อปลานิล บ่อปลาตะเพียนจีน หรือบ่อปลาเฉาดำ เพื่อเข้าห้องออนไลน์ของบ่อนั้น${inR} ศึกชิงแชมป์วันอาทิตย์เล่นคนเดียว</div>`;
else body += '<div class="dim on-small">เปิดใช้งานแล้วซื้อบัตรเข้าบ่อ: เพื่อนในบ่อเดียวกันจะเห็นชื่อกัน เห็นตอนอัดปลา และแข่งกันว่าใครได้น้ำหนักรวมมากกว่า</div>';
}
return `<div class="on-box${cfg.bat && b && signed ? ' on' : ''}"><div class="on-h">🌐 <b>เล่นออนไลน์</b> — ชวนเพื่อนเข้าบ่อเดียวกัน นั่งข้างกัน แข่งตกปลา</div>${body}</div>`;
}
function nhomRow() {
const h = myHold(), ca = CC.P && CC.P.ca, now = inRoom() && ca && ca.active && ca.o && ca.o === room.toi.so;
if (h) return `<div class="on-row">👥 กำลังจองช่อง ${h.ds.join(', ')} ให้เพื่อน · เหลือ ${mmss(h.het - sNow())} <button data-act="on-giu" data-k="0">เลิกจอง</button></div>`;
const b = k => `<button data-act="on-nhom" data-k="${k}" class="${!now && cfg.nhom === k ? 'good' : ''}">${k ? k + ' ช่อง' : 'ไม่จอง'}</button>`;
return `<div class="on-row">👥 ชวนเพื่อน: จองไว้ ${[0, 1, 2, 3].map(b).join(' ')}
      <span class="dim on-small">ช่องว่างข้างคุณ ${now ? 'ตอนนี้เลย' : 'ตอนเข้าห้อง'} (5 นาที) — เพื่อนที่เข้าด้วยรหัสของคุณจะได้นั่งตรงนั้น</span></div>`;
}
let canhNhap = null;
document.addEventListener('input', e => { if (e.target && e.target.id === 'on-canh-in') canhNhap = e.target.value; });
document.addEventListener('keydown', e => { if (e.target && e.target.id === 'on-canh-in' && e.key === 'Enter') { e.preventDefault(); luuCanh(); } });
function luuCanh() {
const el = $('on-canh-in'), v = String(el ? el.value : canhNhap || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
canhNhap = null;
if (v && !MA_RE.test(v)) { toast('รหัสผู้เล่นประกอบด้วย 6 ตัวอักษร/ตัวเลข เช่น ABC234 (เพื่อนดูได้ที่หน้าต่าง 👤 บัญชี หรือ 🌐 ออนไลน์)', 'bad', 5000); UI.rerender(); return; }
if (v && v === cfg.ma) { toast('นั่นรหัสของคุณเองนะ 😄', 'info'); UI.rerender(); return; }
cfg.canh = v; saveCfg();
toast(v ? `🪑 การเข้าห้องครั้งถัดไปจะไปนั่งข้าง ${v} (หากเพื่อนกำลังตกอยู่บ่อเดียวกัน)` : 'ลบรหัสเพื่อนออกแล้ว', 'info', 4500);
if (v && room && !room.ds.has(v) && C.want) { const ho = C.want.ho; leave(); C.want = { ho, canh: v }; cfg.phong = null; connect(); }
UI.rerender();
}
const basePond = PN.pond;
if (basePond) PN.pond = function () {
const html = basePond.apply(this, arguments);
try {
const box = pondBox(), i = html.indexOf('<div class="sub">'), j = i >= 0 ? html.indexOf('</div>', i) : -1;
return j >= 0 ? html.slice(0, j + 6) + box + html.slice(j + 6) : box + html;
} catch (e) { return html; }
};
function mapBox(d) {
if (!cfg.bat || !C.want) return '';
if (!roomHere()) return `<div class="card on-mapbox"><div class="t">🌐 ${esc(stText())}</div></div>`;
const mine = myMa(), ca = CC.P.ca, G = CC.G, draw = !!(d && d.draw);
const list = [...room.ds.values()].filter(p => p.ma !== mine).sort((a, b) => a.so - b.so);
const canMove = ca && ca.active && (draw || (!ca.caught && G && G.state === 'hand'));
const rows = list.map(p => {
const nb = ca && ca.o && near(ca.o, p.so, 1), g = canMove && !nb ? nearSeatFor(p) : 0;
return `<span class="on-mp">🌐 ${tenHtml(p)} ช่อง ${p.so} · ${TT_TXT[p.s] || ''}${nb ? ' · <i>นั่งข้างคุณ</i>' : ''}${g ? ` <button data-act="on-canh-ngoi" data-ma="${esc(p.ma)}">🪑 นั่งข้างๆ · ช่อง ${g}</button>` : ''}</span>`;
}).join('');
const holds = [...room.giu].filter(x => x[1].ds.length).map(([ma, h]) => `<span class="on-mp">👥 ${ma === mine ? 'คุณ' : `<b>${esc(tenOf(ma))}</b>`} จองช่อง ${h.ds.join(', ')} ให้เพื่อน</span>`).join('');
const sel = UI.mapSel, hs = sel ? heldBy(sel) : '';
const selNote = hs ? `<div class="d on-small">👥 ช่อง ${sel} กำลังถูกจองไว้ให้เพื่อนของ ${hs === mine ? 'คุณ' : esc(tenOf(hs))}${blocked(sel) ? ' — เฉพาะเพื่อนที่เข้าตามรหัสของคนนั้นจึงจะนั่งได้' : ''}</div>` : '';
return `<div class="card on-mapbox"><div class="t">🌐 ห้องออนไลน์${esc(pondName())} #${room.so} · ${room.ds.size} คน${ca && ca.o ? ` · คุณอยู่ช่อง ${ca.o}` : ''}</div>
      <div class="d">${rows || `ยังไม่มีผู้เล่นอื่น — ส่งรหัส <b>${esc(mine)}</b> ให้เพื่อนเพื่อเข้ามานั่งข้างๆ`}${holds ? ' ' + holds : ''}</div>${selNote}</div>`;
}
const baseMap = PN.map;
if (baseMap) PN.map = function (d) {
const html = baseMap.apply(this, arguments);
try { return html + mapBox(d); } catch (e) { return html; }
};
function drawMapOverlay(d) {
const c = $('map-cv');
if (!c || !roomHere()) return;
const r = c.getBoundingClientRect();
if (!r.width || !r.height || !c.width) return;
const g = c.getContext('2d'), dp = c.width / r.width;
g.setTransform(dp, 0, 0, dp, 0, 0);
const k = Math.min((r.width - 40) / M.W, (r.height - 40) / M.H);
if (!(k > 0)) return;
const ox = (r.width - M.W * k) / 2, oy = (r.height - M.H * k) / 2, mine = myMa();
const fs = r.width < 520 ? 9 : 10;
g.font = `600 ${fs}px "Sarabun", "Noto Sans Thai", "Tahoma", "Segoe UI", system-ui, sans-serif`; g.textBaseline = 'middle';
for (const p of room.ds.values()) {
if (p.ma === mine || !(p.so >= 1 && p.so <= 40)) continue;
const sp = M.spot(p.so), x = ox + sp.x * k, y = oy + sp.y * k;
g.fillStyle = '#4ea3ff'; g.fillRect(x - 6, y - 6, 12, 12);
g.strokeStyle = '#d8ecff'; g.lineWidth = 1; g.strokeRect(x - 6.5, y - 6.5, 13, 13);
g.fillStyle = '#06182a'; g.font = '8px "Sarabun", "Tahoma", sans-serif'; g.textAlign = 'center'; g.fillText(sp.id, x, y + 0.5);
const nm = `${nhanTen(p, 10)} ${TT_ICO[p.s] || ''}`.trim();
g.font = `600 ${fs}px "Sarabun", "Noto Sans Thai", "Tahoma", "Segoe UI", system-ui, sans-serif`;
const off = 14 + (p.so % 2) * (fs + 4), lx = x + sp.nx * off, ly = y + sp.ny * off;
g.textAlign = sp.nx > 0 ? 'left' : sp.nx < 0 ? 'right' : 'center';
const tw = g.measureText(nm).width, bx = g.textAlign === 'left' ? lx - 3 : g.textAlign === 'right' ? lx - tw - 3 : lx - tw / 2 - 3;
g.fillStyle = 'rgba(8,24,40,0.78)'; g.fillRect(bx, ly - fs / 2 - 2, tw + 6, fs + 4);
g.fillStyle = '#e6f2ff'; g.fillText(nm, lx, ly + 0.5);
}
const draws = d && d.draw ? d.draw : [];
for (const [ma, h] of room.giu) {
h.ds.forEach((id, i) => {
const sp = M.spot(id), x = ox + sp.x * k, y = oy + sp.y * k;
if (draws.indexOf(id) < 0) { g.fillStyle = 'rgba(78,163,255,0.3)'; g.fillRect(x - 6, y - 6, 12, 12); }
if (g.setLineDash) g.setLineDash([3, 2]);
g.strokeStyle = '#a8d6ff'; g.lineWidth = 1.5; g.strokeRect(x - 6.5, y - 6.5, 13, 13);
if (g.setLineDash) g.setLineDash([]);
g.fillStyle = '#e6f2ff'; g.font = '8px "Sarabun", "Tahoma", sans-serif'; g.textAlign = 'center'; g.fillText(sp.id, x, y + 0.5);
if (i) return;
const t = ma === mine ? '' : tenOf(ma), nm = ma === mine ? '👥 คุณจองให้เพื่อน' : `👥 จองให้เพื่อนของ ${t.length > 8 ? t.slice(0, 7) + '…' : t}`;
g.font = `600 ${fs}px "Sarabun", "Noto Sans Thai", "Tahoma", "Segoe UI", system-ui, sans-serif`;
const off = 14 + ((id + 1) % 2) * (fs + 4), lx = x + sp.nx * off, ly = y + sp.ny * off;
g.textAlign = sp.nx > 0 ? 'left' : sp.nx < 0 ? 'right' : 'center';
const tw = g.measureText(nm).width, bx = g.textAlign === 'left' ? lx - 3 : g.textAlign === 'right' ? lx - tw - 3 : lx - tw / 2 - 3;
g.fillStyle = 'rgba(8,24,40,0.7)'; g.fillRect(bx, ly - fs / 2 - 2, tw + 6, fs + 4);
g.fillStyle = '#cfe6ff'; g.fillText(nm, lx, ly + 0.5);
});
}
}
const baseAfterMap = UI.afterOpen.map;
UI.afterOpen.map = function (d) {
const r = baseAfterMap ? baseAfterMap.apply(this, arguments) : undefined;
try { drawMapOverlay(d); } catch (e) {   }
return r;
};
function sitNear(ma) {
const p = room && room.ds.get(ma), P = CC.P, ca = P && P.ca, G = CC.G;
if (!p || !ca || !ca.active) return;
if (ca.o && (ca.caught || !G || G.state !== 'hand')) {
toast(ca.caught ? 'ได้ปลาที่ช่องนี้แล้ว — ส่งรหัสของคุณให้เพื่อนย้ายมานั่งข้างๆ แทนนะ' : 'กรุณายกคันขึ้นก่อนจึงจะย้ายที่ได้', 'info', 5000);
return;
}
if (ca.o && near(ca.o, p.so, 1)) { toast(`คุณนั่งอยู่ข้าง ${p.ten} อยู่แล้ว`, 'info'); return; }
const g = nearSeatFor(p);
if (!g) { toast(ca.o && near(ca.o, p.so, 2) ? `คุณนั่งใกล้ ${p.ten} อยู่แล้ว (ห่าง 2 ช่อง)` : `ทั้งสองข้างของ ${p.ten} (ระยะ 1–2 ช่อง) เต็มหมดแล้ว`, 'info', 4500); return; }
pickSeat(g, p.ma);
toast(`🪑 นั่งช่อง ${g} ข้าง ${p.ten}`, 'good', 3500);
}
function seatNear(p) {
const mine = myMa();
let best = 0, bk = 99;
for (const k of [1, 2]) for (const s of [p.so + k, p.so - k]) {
const g = ((s - 1 + 40) % 40) + 1, h = heldBy(g);
if (occupied(g) || (h && h !== p.ma && h !== mine)) continue;
const sc = k * 2 - (h === p.ma ? 1 : 0);
if (sc < bk) { bk = sc; best = g; }
}
return best;
}
function nearSeatFor(p) {
const ca = CC.P && CC.P.ca, cur = (ca && ca.active && ca.o) || 0;
if (cur && kc(cur, p.so) <= 1) return 0;
const g = seatNear(p);
return g && (!cur || kc(g, p.so) < kc(cur, p.so)) ? g : 0;
}
function watchFromPanel(ma) {
const e = ents.get(ma), D = CC.Dao;
if (!e || M.npcAt(e.id) !== e || !D || !CC.Xem) return;
UI.close();
if (!D.on) D.start();
if (!D.on) return;
if (CC.Xem.on) CC.Xem.stop('quiet');
CC.Xem.start(e.id);
}
function doAct(act, d) {
if (act === 'on-bat') {
cfg.bat = !cfg.bat; saveCfg();
if (cfg.bat) { C.err = ''; C.badTk = ''; C.camDen = 0; if (C.st === 'loi') C.st = 'tat'; syncWant(); toast(base() ? '🌐 เปิดเล่นออนไลน์แล้ว — ซื้อบัตรบ่อปลานิล ตะเพียนจีน หรือเฉาดำเพื่อเข้าห้อง' : 'เซิร์ฟเวอร์ออนไลน์ยังไม่เปิดให้บริการ', 'info', 4500); }
else { leave(); toast('ปิดโหมดออนไลน์แล้ว — กลับไปตกกับเพื่อนข้างบ่อในเครื่องตามเดิม', 'info'); }
UI.rerender(); return;
}
if (act === 'on-tat') { cfg.bat = false; saveCfg(); leave(); toast('ปิดโหมดออนไลน์แล้ว', 'info'); UI.rerender(); return; }
if (act === 'on-mo') { UI.open('online'); return; }
if (act === 'on-an') {
cfg.an = cfg.an ? 0 : 1; saveCfg(); cdTick();
toast(cfg.an ? '🙈 เพื่อนจะไม่เห็นว่าคุณตกอยู่บ่อไหน (แต่ยังเห็นชื่อเมื่ออยู่ห้องเดียวกัน)' : '👀 เพื่อนที่มีรหัสของคุณจะเห็นว่าคุณตกอยู่บ่อไหน', 'info', 5000);
UI.rerender(); return;
}
if (act === 'on-noi') { C.err = ''; C.badTk = ''; C.camDen = 0; if (C.st === 'loi') C.st = 'tat'; syncWant(); UI.rerender(); return; }
if (act === 'on-canh-luu') { luuCanh(); return; }
if (act === 'on-canh-xoa') { canhNhap = null; cfg.canh = ''; saveCfg(); UI.rerender(); return; }
if (act === 'on-chat') { sendChat(d.m || ''); return; }
if (act === 'on-xem') { watchFromPanel(d.ma); return; }
if (act === 'on-canh-ngoi') { sitNear(d.ma); return; }
if (act === 'on-giu') {
const k = Math.max(0, Math.min(3, +d.k || 0)), ca = CC.P && CC.P.ca;
if (!inRoom()) { toast('🌐 ยังไม่ได้เข้าห้องออนไลน์', 'info'); return; }
if (k && !(ca && ca.active && ca.o && ca.o === room.toi.so)) { toast('กรุณาเลือกช่องนั่งก่อน', 'info'); return; }
room.goiY = null; cfg.nhom = 0; saveCfg();
sendGiu(k);
return;
}
if (act === 'on-giu-chuyen') {
const gy = room && room.goiY;
if (!gy || !inRoom()) return;
if (occupied(gy.so) || blocked(gy.so)) { room.goiY = null; toast(`ช่อง ${gy.so} เพิ่งมีคนมานั่ง — กดจองช่องใหม่อีกครั้งนะ`, 'info'); dirty(); return; }
if (!canMoveSeat()) { toast('กรุณายกคันขึ้นก่อนจึงจะย้ายที่ได้', 'info'); return; }
room.goiY = null;
cfg.nhom = gy.k; saveCfg();
pickSeat(gy.so, '');
return;
}
if (act === 'on-nhom') {
const k = Math.max(0, Math.min(3, +d.k || 0)), ca = CC.P && CC.P.ca;
if (k && inRoom() && ca && ca.active && ca.o && ca.o === room.toi.so) { cfg.nhom = 0; saveCfg(); sendGiu(k); UI.rerender(); return; }
cfg.nhom = k; saveCfg();
toast(k ? `👥 การเข้าห้องครั้งถัดไป: จองช่องว่างข้างคุณไว้ ${k} ช่อง 5 นาที ให้เพื่อนเข้าตามรหัส${cfg.ma ? ' ' + cfg.ma : ' ของคุณ'}` : 'ไม่จองช่องในการเข้าห้องครั้งถัดไป', 'info', 4500);
UI.rerender(); return;
}
}
const baseAct = UI.onAction;
UI.onAction = function (act, btn) {
if (typeof act === 'string' && act.indexOf('on-') === 0) { doAct(act, (btn && btn.dataset) || {}); return; }
const r = baseAct.apply(this, arguments);
try {
if (act === 'buyticket') {
syncWant(); placeAll();
if (roomHere() && inRoom() && UI.current === 'map' && UI.data && UI.data.draw) UI.open('map', { draw: drawWith(room.toi.so) });
} else if (act === 'pick') { pendMove = null; placeAll(); gheAt = 0; seatSync(); nhomCheck(); dirty(); }
} catch (e) { console.error('[online]', e); }
return r;
};
let snapAt = 0;
function snapshotSeat() {
const ca = CC.P && CC.P.ca;
if (inRoom() && ca && ca.active && !ca.o && UI.current === 'map' && UI.data && UI.data.draw) {
const toi = room.toi, d = UI.data.draw;
if (d.indexOf(toi.so) < 0 || (d.some(g => occupied(g) || noDraw(g)) && Date.now() - snapAt > 8000)) { snapAt = Date.now(); UI.open('map', { draw: drawWith(toi.so) }); }
}
}
const baseHelp = PN.help;
if (baseHelp) PN.help = function () {
const html = baseHelp.apply(this, arguments);
const sec = `<h3>เล่นออนไลน์</h3>
      <p>• หน้าต่าง <b>🎣 เลือกบ่อ</b> → <b>🌐 เปิดเล่นออนไลน์</b> (ต้องเข้าสู่ระบบ Google และตั้งชื่อผู้เล่นที่หน้าต่าง 👤 บัญชี) เมื่อซื้อบัตรบ่อปลานิล บ่อปลาตะเพียนจีน หรือบ่อปลาเฉาดำ จะเข้าสู่ <b>ห้องออนไลน์</b> ของบ่อนั้นร่วมกับผู้เล่นอื่น (ห้องละไม่เกิน 40 คน = 40 ช่อง) ศึกชิงแชมป์วันอาทิตย์เล่นคนเดียว</p>
      <p>• <b>นั่งข้างเพื่อน:</b> ส่ง <b>รหัสผู้เล่น</b> (6 ตัวอักษร ที่หน้าต่าง 🌐 ออนไลน์) ให้เพื่อน แล้วให้เพื่อนกรอกลงช่อง "นั่งข้างเพื่อนที่มีรหัส" ในหน้าต่าง เลือกบ่อ แล้วซื้อบัตรบ่อเดียวกัน — เซิร์ฟเวอร์จะจัดให้นั่งติดกัน (หากนั่งที่อื่นอยู่และยังไม่ได้ปลา ระบบจะย้ายให้อัตโนมัติ) ในแผนผังบ่อและหน้าต่าง 🌐 ออนไลน์ยังมีปุ่ม <b>🪑 นั่งข้างๆ</b> เมื่อมีช่องว่างห่าง 1–2 ช่อง (ก่อนได้ปลาตัวแรก)</p>
      <p>• <b>👥 จองช่องให้เพื่อน:</b> ชวนเพื่อนมาตกด้วยกันโดยก่อนซื้อบัตรให้เลือก "ชวนเพื่อน: จองไว้ 1–3 ช่อง" ในหน้าต่าง 🎣 เลือกบ่อ (หากกำลังตกอยู่กดได้ที่หน้าต่าง 🌐 ออนไลน์) ช่องข้างคุณจะถูกเว้นว่างไว้ 5 นาที เฉพาะเพื่อนที่เข้าตามรหัสของคุณเท่านั้นจึงจะนั่งได้ — บนแผนผังบ่อจะแสดงเส้นประสีฟ้า</p>
      <p>• ผู้เล่นจริงจะแสดงชื่อ <b>🌐 ชื่อ</b> (สีฟ้า) บนแผนผังบ่อและขณะเดินเล่น พร้อมสถานะ: ⏳ กำลังรอทุ่น, 🎣 กำลังอัดปลา, 🚶 เดินเล่น, 💤 ไม่อยู่ชั่วคราว ส่วนช่องที่เหลือจะมีนักตกปลาบอทคอยนั่งตก ใครได้ปลาจะแจ้งให้เห็นทั้งห้อง</p>
      <p>• <b>ดูเพื่อนอัดปลา:</b> เดินเล่นรอบบ่อแล้วแตะที่ผู้เล่นนั้น → <b>👀 นั่งดูตกปลา</b> (หรือกดปุ่ม 👀 ดู ในหน้าต่าง 🌐 ออนไลน์) เพื่อรับชมจังหวะอัดปลาแบบสดๆ</p>
      <p>• <b>ศึกแข่งตกปลา:</b> เมื่อห้องมีผู้เล่นตั้งแต่ 2 คนขึ้นไป จะเปิดแข่งอัตโนมัติ: นับถอยหลัง แล้วแข่ง ${CC.Online && CC.Online.thoiGianDua ? CC.Online.thoiGianDua() : 20} นาที ใครได้น้ำหนักรวมมากที่สุดชนะ (บ่อปลาเฉาดำนับตัวใหญ่สุด) ชิป 🌐 มุมซ้ายบอกอันดับและเวลาที่เหลือ อันดับ 1 / 2 / 3 รับรางวัล ${((room && room.thuong) || [300, 150, 80]).slice(0, 3).map(k => k + ' ฿').join(' / ')} ในเกม</p>
      <p>• <b>💬 แชทด่วน</b> (ปุ่มข้างชิป 🌐): ส่งอีโมจิและประโยคสำเร็จรูป ขณะเดินเล่นข้อความแชทจะลอยเป็นบอลลูนบนศีรษะผู้พูด</p>
      <p>• <b>แท็กชมรมและฉายา:</b> ข้างชื่อผู้เล่นจะแสดงแท็กชมรม <b>[BL]</b> และฉายาที่สวมอยู่; 🏆 ครองสถิติ, 👑 แชมป์รอบชั่วโมง, ⭐ อันดับ 1 สัปดาห์ก่อน หน้าต่าง 👥 ชุมชน มีสถิติ ศึกชิงรางวัล เพื่อน และชมรม หากไม่อยากให้เพื่อนเห็นว่าตกอยู่บ่อไหน ให้เอาเครื่องหมายถูกออกจาก "ให้เพื่อนเห็นว่าฉันกำลังตกอยู่ที่ไหน"</p>
      <p>• หากเน็ตหลุดยังตกต่อกับบอทข้างบ่อได้ตามปกติ และเกมจะเชื่อมต่อใหม่ให้อัตโนมัติ หากเปิดเกมในแท็บอื่น แท็บเดิมจะออกจากโหมดออนไลน์</p>`;
const at = html.indexOf('<h3>การหาเงิน</h3>');
return at >= 0 ? html.slice(0, at) + sec + html.slice(at) : html + sec;
};
function boot() {
const game = $('game');
if (!game || $('on-hud')) return;
const hud = document.createElement('div');
hud.id = 'on-hud'; hud.className = 'hud hidden';
hud.innerHTML = '<button id="on-chip" type="button" title="ห้องออนไลน์: ศึกแข่งตกปลา, ผู้เล่นในห้อง, แชท"><span id="on-l1"></span><span id="on-l2" class="hidden"></span></button>' +
'<button id="on-chat-b" type="button" class="hidden" title="แชทด่วนกับทุกคนในบ่อ">💬</button>';
game.appendChild(hud);
const pop = document.createElement('div');
pop.id = 'on-chat'; pop.className = 'hud hidden';
pop.innerHTML = chatHtml(m => `data-chat="${esc(m)}"`);
game.appendChild(pop);
$('on-chip').addEventListener('click', () => { closeChat(); if (!UI.locked && (!UI.isOpen() || UI.current === 'online')) UI.open('online'); });
$('on-chat-b').addEventListener('click', toggleChat);
pop.addEventListener('click', e => { const b = e.target.closest('[data-chat]'); if (b) sendChat(b.dataset.chat); });
[hud, pop].forEach(el => el.addEventListener('pointerdown', e => e.stopPropagation()));
document.addEventListener('pointerdown', e => { const p = $('on-chat'); if (p && !p.classList.contains('hidden') && !p.contains(e.target) && !$('on-hud').contains(e.target)) closeChat(); }, true);
document.addEventListener('visibilitychange', () => {
dirty();
if (!document.hidden && C.want && C.st === 'cho') { clearTimeout(C.retryT); C.tries = Math.min(C.tries, 1); connect(); }
});
window.addEventListener('online', () => { if (C.want && C.st === 'cho') { clearTimeout(C.retryT); connect(); } });
window.addEventListener('resize', dirty);
setInterval(() => {
const now = performance.now();
try { stateTick(Date.now()); fightTick(); boTick(Date.now()); caTick(); gioTick(); viTick(Date.now()); render(now); } catch (e) { console.error('[online]', e); }
}, 250);
setInterval(() => {
try {
syncWant(); moveTick(); seatSync(); snapshotSeat(); raceTick(); nhomCheck(); cdTick();
const now = Date.now();
if (giuReq && now - giuReq.at > 10e3) giuReq = null;
if (myHold()) dirty();
if (C.ws && C.ws.readyState === 1) {
if (!document.hidden && now - C.rxAt > 75e3) { try { C.ws.close(4002, 'im'); } catch (e) {   } }
else if (now - C.txAt > 25e3) send({ t: 'ping' });
}
if (C.st === 'cho' && room && C.lostAt && now - C.lostAt > 45e3) dropRoom();
if (room && room.dua && room.dua.pha !== 'nghi') dirty();
} catch (e) { console.error('[online]', e); }
}, 1000);
}
O.thoiGianDua = () => (room && room.dua && room.dua.kt && room.dua.bd && room.dua.pha !== 'xong' ? Math.max(1, Math.round((room.dua.kt - room.dua.bd) / 60e3)) : 20);
O.debug = () => ({
st: C.st, err: C.err, base: base(), want: C.want, sent, cand, tries: C.tries, sentCanh: C.sentCanh, sentNhom: C.sentNhom, nhom: cfg.nhom, pendMove, giuReq,
room: room && { id: room.id, ho: room.ho, toi: room.toi, n: room.ds.size, dua: room.dua, xem: room.xem, log: room.log.slice(-6), giu: [...room.giu], canh: room.canh, goiY: room.goiY },
ents: [...ents.values()].map(e => ({ id: e.id, ten: e.ten, s: e.s, tren: M.npcAt(e.id) === e })), stash: Object.keys(stash).map(Number), xem: !!drv,
v2: !!(room && room.v2), xh: !!(room && room.xh), gg: room && room.gg, an: cfg.an, camDen: cfg.camDen, sentDh: C.sentDh, san, cur: cur && { id: cur.id, sp: cur.sp, w: cur.w }, dat, vi: viLast, gio: room && room.gio, gioPhut: O.gioPhong(), rieng: !!rieng
});
O.cfg = () => JSON.parse(JSON.stringify(cfg));
O.thuMatMang = () => { if (C.ws) try { C.ws.close(4003, 'thu'); } catch (e) {   } };
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
else boot();
})();