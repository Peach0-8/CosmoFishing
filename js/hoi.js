(function () {
const UI = CC.UI, X = CC.XaHoi, CD = CC.CongDong, B = CC.BanBe;
if (!UI || !X || !CD || !B || !B.h) return;
const h = B.h, esc = X.esc;
const H = CC.Hoi = { MAX: 30 };
const $ = id => document.getElementById(id);
const KEY = 'cauca_hoi_v1', MA_OK = /^[2-9A-HJ-NP-Z]{6}$/, NHIP = 30e3, TUOI = 20e3;
const VAI = { truong: ['👑', 'หัวหน้าชมรม'], pho: ['⭐', 'รองหัวหน้าชมรม'], tv: ['', 'สมาชิก'] };
const HANG = ['🥇', '🥈', '🥉'];
const LOI = {
'co-hoi': 'คุณอยู่ในชมรมอื่นอยู่แล้ว หากต้องการย้ายชมรม กรุณาออกจากชมรมเดิมก่อน',
'trung-ten': 'ชื่อชมรมนี้มีชมรมอื่นใช้แล้ว กรุณาตั้งชื่ออื่น',
'trung-the': 'แท็กชมรมนี้มีชมรมอื่นใช้แล้ว กรุณาใช้แท็กอื่น',
ten: 'ชื่อชมรมยังใช้ไม่ได้: ต้องมีความยาว 3–24 ตัวอักษร และไม่มีคำต้องห้ามหรือชื่อสงวน',
the: 'แท็กชมรมประกอบด้วยตัวอักษร A–Z หรือตัวเลข 2–4 ตัว เช่น BL หรือ CAU8',
day: 'ชมรมนี้มีสมาชิกครบ 30 คนแล้ว',
'khong-co': 'ไม่พบข้อมูล — ชมรมหรือผู้เล่นนี้อาจเพิ่งออกหรือถูกลบไปแล้ว',
nhieu: 'คุณทำรายการเกี่ยวกับชมรมถี่เกินไป (สูงสุดประมาณ 20 ครั้งต่อชั่วโมง) กรุณารอสักครู่แล้วลองใหม่',
cam: 'บัญชีถูกระงับการเล่นออนไลน์ชั่วคราว จึงยังไม่สามารถใช้ระบบชมรมได้',
quyen: 'รายการนี้ทำได้เฉพาะหัวหน้าชมรม (หรือรองหัวหน้า) เท่านั้น',
vai: 'สิทธิ์ในชมรมของคุณไม่เพียงพอสำหรับรายการนี้ (เช่น รองหัวหน้าไม่สามารถเชิญรองหัวหน้าอื่นออกได้ มีเพียงหัวหน้าเท่านั้นที่เปลี่ยนตำแหน่งได้)',
sai: 'เซิร์ฟเวอร์ไม่ยอมรับคำขอนี้ กรุณารีเฟรชหน้าเว็บแล้วลองใหม่'
};
let camTin = null;
const gioNgay = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ' น. วันที่ ' + d.getDate() + '/' + (d.getMonth() + 1); };
const loiHoi = why => {
if (why === 'cam' && camTin && camTin.den > Date.now()) return 'บัญชีถูกระงับการเล่นออนไลน์ชั่วคราวจนถึง ' + gioNgay(camTin.den) + (camTin.lyDo ? ', เหตุผล: ' + camTin.lyDo : '') + ' ระหว่างนี้ยังไม่สามารถใช้ระบบชมรมได้ แต่ยังเล่นคนเดียวได้ตามปกติ';
return LOI[why] || X.loi(why);
};
const str = (s, n) => (typeof s === 'string' ? s.slice(0, n) : '');
const dai = s => Array.from(String(s || '')).length;
const gon = s => String(s || '').replace(/\s+/g, ' ').trim();
const hoiX = t => (/^ชมรม(\s|$)/i.test(String(t || '').normalize('NFC')) ? '' : 'ชมรม ') + (t || '');
const ngay = t => { const d = new Date(t); return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear(); };
let man = '';
let xemId = '', toi = null, ttToi = '', top = null, ttTop = '', xemDu = null, ttXem = '';
let dangToi = false, dangTop = false, dangXem = false, ban = false, tb = null, hoiLai = null, moMa = '', dongHo = 0, sigVe = '', tuRoi = false;
const f = { ten: '', the: '', gt: '', mo: 1 };
let fLoi = {}, suaGt = '', timNhap = '', giuXem = false;
const noi = (txt, k) => { tb = { txt, k: k || '' }; };
const vaiToi = () => { if (toi && toi.hoi && VAI[toi.vai]) return toi.vai; const me = X.toi(), hh = toi && toi.hoi, t = me && hh && hh.tv.find(x => x.ma === me.ma); return t ? t.vai : ''; };
let choSrv = null;
function choDs() {
const me = X.toi();
if (!me) return [];
if (choSrv) return choSrv;
try {
const o = JSON.parse(localStorage.getItem(KEY) || 'null');
if (!o || o.ma !== me.ma || !Array.isArray(o.cho)) return [];
return o.cho.filter(x => x && typeof x.id === 'string' && Date.now() - (+x.luc || 0) < 14 * 864e5).slice(0, 5)
.map(x => ({ id: x.id, ten: str(x.ten, 40), the: str(x.the, 4), luc: +x.luc || 0 }));
} catch (e) { return []; }
}
function choLuu(a) {
const me = X.toi();
if (!me) return;
try { if (a.length) localStorage.setItem(KEY, JSON.stringify({ ma: me.ma, cho: a.slice(-5) })); else localStorage.removeItem(KEY); } catch (e) {   }
}
function sachHoi(o) {
if (!o || typeof o !== 'object' || o.id == null) return null;
const tv = (Array.isArray(o.tv) ? o.tv : []).filter(t => t && typeof t.ma === 'string' && MA_OK.test(t.ma)).slice(0, 60)
.map(t => ({ ma: t.ma, ten: str(t.ten, 20), vai: VAI[t.vai] ? t.vai : 'tv', vao: +t.vao || 0, kgTuan: +t.kgTuan || 0, phong: typeof t.phong === 'string' && t.phong ? t.phong : null }));
return { id: String(o.id).slice(0, 64), ten: str(o.ten, 40), the: str(o.the, 4), gt: str(o.gt, 240), mo: o.mo ? 1 : 0, lap: +o.lap || 0, truong: str(o.truong, 6),
so: +o.so || tv.length, kgTuan: +o.kgTuan || 0, nTuan: +o.nTuan || 0, hangTuan: +o.hangTuan || 0, tv };
}
const sachXin = a => (Array.isArray(a) ? a : []).filter(x => x && typeof x.ma === 'string' && MA_OK.test(x.ma)).slice(0, 60).map(x => ({ ma: x.ma, ten: str(x.ten, 20), luc: +x.luc || 0 }));
async function goi(path, opt) { try { const r = await X.goi(path, opt); return r && typeof r === 'object' ? r : { ok: false, why: 'loi' }; } catch (e) { return { ok: false, why: 'loi' }; } }
function nhanToi(hh, xin, vai, dangXin) {
const truoc = toi && toi.hoi;
if (hh && !truoc) {
const c = choDs().find(x => x.id === hh.id);
if (c) UI.toast(`🎏 คุณได้รับการตอบรับเข้า ${hoiX(hh.ten)} แล้ว`, 'good', 5000);
choLuu([]);
if (man === 'lap' || man === 'xem') man = '';
}
if (!hh && truoc && !tuRoi) { noi(`คุณไม่ได้อยู่ใน ${hoiX(truoc.ten)} แล้ว: อาจถูกเชิญออก หรือชมรมถูกยุบไปแล้ว`, 'bad'); man = ''; }
if (!hh && man === 'sua') man = '';
tuRoi = false;
if (moMa && !(hh && hh.tv.some(t => t.ma === moMa))) moMa = '';
toi = { luc: Date.now(), hoi: hh, xin, vai: typeof vai === 'string' ? vai : '' };
choSrv = !hh && Array.isArray(dangXin) ? dangXin.filter(x => x && x.id != null).slice(0, 5).map(x => ({ id: String(x.id).slice(0, 64), ten: str(x.ten, 40), the: str(x.the, 4), luc: 0 })) : null;
ttToi = '';
}
async function taiToi(ep) {
if (dangToi) return;
if (!X.co()) { ttToi = 'tat'; return; }
if (!X.sanSang()) { ttToi = 've'; toi = null; return; }
if (!ep && toi && Date.now() - toi.luc < TUOI) return;
dangToi = true;
if (!toi) veLai();
const r = await goi('/hoi/toi', { ve: true });
dangToi = false;
if (r.ok) nhanToi(sachHoi(r.hoi), sachXin(r.xin), r.vai, r.dangXin); else ttToi = r.why || 'loi';
if (!(toi && toi.hoi)) taiTop();
veLai();
}
async function taiTop(ep) {
if (dangTop || !X.co()) return;
if (!ep && top && Date.now() - top.luc < TUOI) return;
dangTop = true;
if (!top) veLai();
const r = await goi('/hoi/top');
dangTop = false;
if (r.ok && Array.isArray(r.top)) {
top = { luc: Date.now(), top: r.top.filter(x => x && x.id != null).slice(0, 20).map(x => ({ id: String(x.id).slice(0, 64), ten: str(x.ten, 40), the: str(x.the, 4), so: +x.so || 0, kg: +x.kg || 0, n: +x.n || 0, mo: x.mo === 0 ? 0 : x.mo === 1 ? 1 : -1 })) };
ttTop = '';
} else ttTop = r.why || 'loi';
veLai();
}
async function taiXem(id, ep) {
if (dangXem || !X.co() || !id) return;
if (!ep && xemDu && xemDu.id === id && Date.now() - xemDu.luc < TUOI) return;
dangXem = true;
if (!xemDu || xemDu.id !== id) { xemDu = null; veLai(); }
const r = await goi(id.slice(0, 4) === 'the:' ? '/hoi?the=' + encodeURIComponent(id.slice(4)) : '/hoi?id=' + encodeURIComponent(id), { veNeuCo: true });
dangXem = false;
if (xemId !== id) return;
const hh = r.ok ? sachHoi(r.hoi) : null;
if (hh) { xemDu = { id, luc: Date.now(), hoi: hh }; ttXem = ''; } else ttXem = r.ok ? 'khong-co' : r.why || 'loi';
veLai();
}
function nhip() {
if (!CD.dangMo('hoi')) { clearInterval(dongHo); dongHo = 0; return; }
if (document.hidden || ban || man === 'lap' || man === 'sua') return;
taiToi(true);
if (man === 'xem') taiXem(xemId, true);
else if (man === 'top' || !(toi && toi.hoi)) taiTop(true);
}
async function lenh(path, gui, xong, khiLoi) {
if (ban) return;
ban = true; tb = null; hoiLai = null;
veLai();
const r = await goi(path, { ve: true, gui });
ban = false;
if (r.why === 'cam') camTin = { den: +r.den || 0, lyDo: str(r.lyDo, 200) };
if (r.ok) {
top = null;
const txt = xong(r);
if (txt) { noi(txt, 'good'); UI.toast('🎏 ' + txt, 'good', 4000); }
await taiToi(true);
if (man === 'xem') taiXem(xemId, true);
} else {
if (!khiLoi || !khiLoi(r.why)) noi(loiHoi(r.why), 'bad');
if (['khong-co', 'co-hoi', 'day', 'quyen', 'vai', 'sai'].indexOf(r.why) >= 0) { await taiToi(true); if (man === 'xem') taiXem(xemId, true); }
}
veLai();
}
const sig = () => JSON.stringify([man, xemId, toi && [toi.hoi, toi.xin], ttToi, top && top.top, ttTop, xemDu && xemDu.hoi, ttXem, dangToi && !toi, dangTop && !top, dangXem && !xemDu,
ban, tb, hoiLai, moMa, fLoi, f.mo, choDs(), (X.toi() || {}).ma, X.sanSang(), h.coNgoi(), B.ds().length]);
function veLai() {
if (CD.dangMo('hoi')) { if (sig() !== sigVe) h.veLai('hoi'); return; }
const a = document.activeElement;
if (UI.current === 'congdong' && soXin() !== soCu && !(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) { soCu = soXin(); CD.veLai(); }
}
let soCu = 0;
const soXin = () => (toi && toi.hoi && toi.xin ? toi.xin.length : 0);
const tbHtml = () => (ban ? '<p class="hoi-tb dim">⏳ กำลังส่ง…</p>' : tb ? `<p class="hoi-tb"><span class="${tb.k}">${esc(tb.txt)}</span></p>` : '');
const tenHoi = hh => `<b class="hoi-ten">${esc(hh.ten)}</b> ${h.the(hh.the)}`;
const khoa = hh => (hh.mo ? '<span class="hoi-mo">🔓 ทุกคนเข้าได้ทันที</span>' : '<span class="hoi-mo dong">🔒 ต้องรออนุมัติ</span>');
const xepTv = tv => tv.slice().sort((a, b) => (a.vai === 'truong' ? 0 : a.vai === 'pho' ? 1 : 2) - (b.vai === 'truong' ? 0 : b.vai === 'pho' ? 1 : 2) || b.kgTuan - a.kgTuan || a.vao - b.vao);
const thuLai = act => ` <button data-act="${act}">🔄 ลองใหม่</button>`;
function bao() {
if (!X.sanSang()) return h.moiDangNhap('ตั้งชมรมหรือขอเข้าร่วมชมรม');
if (ttToi === 've') return `<p class="hoi-tt"><span class="bad">${esc(X.loi('ve'))}</span> <button data-act="tk-mo">👤 บัญชี</button></p>`;
if (ttToi === 'cam') return `<p class="hoi-tt"><span class="bad">${esc(loiHoi('cam'))}</span> ยังสามารถดูอันดับชมรมได้ตามปกติ</p>`;
if (ttToi === 'nhieu') return toi ? '' : `<p class="hoi-tt dim">${esc(X.loi('nhieu'))}${thuLai('hoi-tai')}</p>`;
if (ttToi) return `<p class="hoi-tt"><span class="bad">${esc(X.loi(ttToi))}</span>${thuLai('hoi-tai')}</p>`;
if (dangToi && !toi) return '<p class="dim hoi-tt">กำลังโหลดข้อมูลชมรมของคุณ…</p>';
return '';
}
function hoiLaiHtml(k) {
const q = hoiLai;
if (!q || q.k !== k) return '';
const hh = toi && toi.hoi;
let txt, nut;
if (k === 'roi') {
const vai = vaiToi(), con = hh ? hh.tv.length : 0;
if (con <= 1) txt = `คุณเป็นสมาชิกคนสุดท้าย: หากออก <b>${esc(hoiX(hh.ten))}</b> จะถูกยุบทันที และแท็ก ${h.the(hh.the)} จะถูกคืนให้ผู้อื่นใช้ต่อ ไม่สามารถกู้คืนได้`;
else if (vai === 'truong') txt = `คุณเป็นหัวหน้าชมรมอยู่ หากออก <b>รองหัวหน้าชมรมที่อยู่มานานที่สุด</b> จะได้ขึ้นเป็นหัวหน้าแทน${hh.tv.some(t => t.vai === 'pho') ? '' : ' (ชมรมยังไม่มีรองหัวหน้า — ควรแต่งตั้งรองหัวหน้าหรือโอนตำแหน่งหัวหน้าก่อน)'} หากต้องการกลับเข้าใหม่ต้องยื่นคำขออีกครั้ง`;
else txt = `ต้องการออกจาก <b>${esc(hoiX(hh.ten))}</b> หรือไม่? หลังจากนั้นปลาที่คุณตกจะไม่ถูกนับให้ชมรม และหากต้องการเข้าใหม่ต้องยื่นคำขออีกครั้ง`;
nut = '🚪 ออกจากชมรม';
} else if (k === 'duoi') {
txt = `เชิญ <b>${h.ten(q.ten, q.ma)}</b> ออกจากชมรมหรือไม่? หากต้องการกลับเข้าใหม่ต้องยื่นคำขออีกครั้ง`;
nut = '🚪 เชิญออก';
} else {
txt = `โอนตำแหน่งหัวหน้าชมรมให้ <b>${h.ten(q.ten, q.ma)}</b> หรือไม่? คุณจะพ้นจากตำแหน่งหัวหน้าทันทีและไม่สามารถดึงคืนเองได้ — เฉพาะหัวหน้าคนใหม่เท่านั้นที่เปลี่ยนกลับได้`;
nut = '👑 โอนหัวหน้า';
}
return `<div class="hoi-hoilai"><span>${txt}</span><span class="btnrow"><button class="warn" data-act="hoi-ok">${nut}</button><button data-act="hoi-khong">ยกเลิก</button></span></div>`;
}
function dongTv(t, me, quanLy, vai) {
const toiDay = !!me && me.ma === t.ma, v = VAI[t.vai] || VAI.tv, mo = quanLy && moMa === t.ma && !toiDay;
const noiCau = t.phong ? `<span class="bb-cau">${h.noiCau(t.phong)}</span>` : '';
let nut = '';
if (mo) {
const a = [];
if (t.phong && h.coNgoi()) a.push(`<button class="good" data-act="hoi-ngoi" data-ma="${t.ma}" data-ho="${esc(h.hoCua(t.phong))}">🪑 เข้าไปนั่งข้างๆ</button>`);
a.push(B.laBan(t.ma) ? '<span class="bb-laban">✓ เพื่อน</span>' : `<button data-act="hoi-ban" data-ma="${t.ma}" data-ten="${esc(t.ten)}">➕ เพิ่มเพื่อน</button>`);
if (vai === 'truong') {
a.push(t.vai === 'pho' ? `<button data-act="hoi-vai" data-ma="${t.ma}" data-v="tv">ปลดรองหัวหน้า</button>` : `<button data-act="hoi-vai" data-ma="${t.ma}" data-v="pho">⭐ แต่งตั้งเป็นรองหัวหน้า</button>`);
a.push(`<button data-act="hoi-hoi" data-k="truong" data-ma="${t.ma}">👑 โอนหัวหน้า</button>`);
}
if ((vai === 'truong' && t.vai !== 'truong') || (vai === 'pho' && t.vai === 'tv')) a.push(`<button data-act="hoi-hoi" data-k="duoi" data-ma="${t.ma}">🚪 เชิญออกจากชมรม</button>`);
const q = hoiLai && hoiLai.ma === t.ma ? hoiLaiHtml(hoiLai.k) : '';
nut = `<div class="hoi-nut">${q || a.join('')}</div>`;
}
return `<div class="hoi-p${toiDay ? ' me' : ''}${t.phong ? ' on' : ''}${mo ? ' mo' : ''}">
      <div class="hoi-pd${quanLy && !toiDay ? ' bam' : ''}"${quanLy && !toiDay ? ` data-act="hoi-tv" data-ma="${t.ma}"` : ''}><span class="hoi-v" title="${v[1]}">${v[0] || '·'}</span>
        <span class="hoi-t"><b class="bb-ten">${h.ten(t.ten, t.ma)}</b>${toiDay ? ' <span class="dim">(คุณ)</span>' : ''}${t.vai !== 'tv' ? ` <span class="hoi-vt">${v[1]}</span>` : ''}${!toiDay && quanLy && B.laBan(t.ma) ? ' <span class="dim">· เพื่อน</span>' : ''}${noiCau ? '<br>' + noiCau : ''}</span>
        <span class="hoi-k">${t.kgTuan > 0 ? X.kg(t.kgTuan) : '<span class="dim">—</span>'}</span></div>${nut}</div>`;
}
function veHoiToi(me, hh) {
const vai = vaiToi(), xin = toi.xin || [], laTruong = vai === 'truong', duyet = vai === 'truong' || vai === 'pho';
const xinHtml = duyet && xin.length ? `<h3>คำขอเข้าร่วม (${xin.length})</h3><div class="hoi-ds">${xin.map(x => `<div class="hoi-p xin"><div class="hoi-pd"><span class="hoi-v">✋</span>
        <span class="hoi-t"><b class="bb-ten">${h.ten(x.ten, x.ma)}</b> <span class="bb-ma dim">${x.ma}</span>${x.luc ? `<br><span class="dim">ยื่นคำขอ ${esc(X.luc(x.luc))}</span>` : ''}</span>
        <span class="bb-b"><button class="good" data-act="hoi-duyet" data-ma="${x.ma}" data-n="1"${hh.tv.length >= H.MAX ? ' disabled' : ''}>✓ รับเข้า</button><button data-act="hoi-duyet" data-ma="${x.ma}" data-n="0">✕ ปฏิเสธ</button></span></div></div>`).join('')}</div>
        ${hh.tv.length >= H.MAX ? '<p class="dim bb-nho">ชมรมมีสมาชิกครบ 30 คนแล้ว จึงยังไม่สามารถรับเพิ่มได้</p>' : ''}` : '';
const dangCau = hh.tv.filter(t => t.phong).length;
return `<div class="hoi-dau"><div class="hoi-tieu">🎏 ${tenHoi(hh)} ${khoa(hh)}</div>
        <div class="readout hoi-so">อันดับสัปดาห์ <b class="price">${hh.hangTuan > 0 ? '#' + hh.hangTuan : '—'}</b> · น้ำหนักรวมสัปดาห์ <b class="price">${X.kg(hh.kgTuan)}</b>${hh.nTuan ? ` (${hh.nTuan} ตัว)` : ""} · <b>${hh.tv.length}</b>/${H.MAX} สมาชิก${dangCau ? ` · <span class="bb-dem">${dangCau} กำลังตก</span>` : ''}
          <br>ตำแหน่งของคุณ: <b>${(VAI[vai] || VAI.tv)[0]} ${(VAI[vai] || VAI.tv)[1]}</b>${hh.lap ? ` · ก่อตั้งเมื่อ ${ngay(hh.lap)}` : ''}</div>
        ${hh.gt ? `<p class="hoi-gt">“${esc(hh.gt)}”</p>` : (laTruong ? '<p class="dim hoi-gt">ชมรมยังไม่มีคำแนะนำ</p>' : '')}</div>
      ${bao()}${tbHtml()}${hoiLai && !hoiLai.ma ? hoiLaiHtml('roi') : ''}
      ${xinHtml}
      <h3>สมาชิก (${hh.tv.length})</h3>
      <div class="hoi-ds">${xepTv(hh.tv).map(t => dongTv(t, me, true, vai)).join('')}</div>
      <p class="dim bb-nho">คอลัมน์ด้านขวาคือน้ำหนักปลาที่ตกออนไลน์ในสัปดาห์นี้ นับตั้งแต่เข้าชมรม กดที่ชื่อสมาชิกเพื่อ${duyet ? 'เพิ่มเพื่อน นั่งข้างๆ หรือจัดการสมาชิก' : 'เพิ่มเพื่อนหรือนั่งข้างๆ'}</p>
      <p class="btnrow hoi-duoi"><button data-act="hoi-top">🏆 อันดับชมรมทั้งหมด</button>
        ${laTruong ? `<button data-act="hoi-sua">✏ แก้ไขคำแนะนำชมรม</button><button data-act="hoi-mo" data-m="${hh.mo ? 0 : 1}">${hh.mo ? '🔒 เปลี่ยนเป็นต้องรออนุมัติ' : '🔓 เปิดให้ทุกคนเข้าได้ทันที'}</button>` : ''}
        <button data-act="hoi-hoi" data-k="roi">🚪 ออกจากชมรม</button></p>`;
}
function veTop(me, co) {
let dau = '';
if (co) dau = '<p class="btnrow"><button data-act="hoi-ve">← ชมรมของฉัน</button></p>';
else {
const cho = choDs();
dau = bao() + tbHtml()
+ cho.map(c => `<div class="readout hoi-cho">⏳ คุณได้ขอเข้าร่วม <b>${esc(hoiX(c.ten))}</b> ${h.the(c.the)} — รอหัวหน้าหรือรองหัวหน้าชมรมอนุมัติ${c.luc ? ` (ขอเมื่อ ${esc(X.luc(c.luc))})` : ''}
            <span class="btnrow"><button data-act="hoi-xem" data-id="${esc(c.id)}">ดูชมรม</button><button data-act="hoi-cho-bo" data-id="${esc(c.id)}">ซ่อนแจ้งเตือน</button></span></div>`).join('')
+ (me && toi && !toi.hoi ? `<p class="hoi-moi">คุณยังไม่ได้สังกัดชมรมใด ขอเข้าร่วมชมรมด้านล่าง หรือ <button class="good" data-act="hoi-lap">🎏 ก่อตั้งชมรมใหม่</button></p>` : '');
}
let than;
if (top && top.top.length) {
than = `<div class="hoi-bang">${top.top.map((x, i) => `<div class="hoi-r${co && co.id === x.id ? ' me' : ''}" data-act="hoi-xem" data-id="${esc(x.id)}">
          <span class="hoi-h">${HANG[i] || i + 1}</span><span class="hoi-t"><b class="hoi-ten">${esc(x.ten)}</b> ${h.the(x.the)}</span>
          <span class="hoi-n dim">${x.mo === 0 ? '🔒 ' : ''}${x.so}/${H.MAX} คน</span><span class="hoi-k">${X.kg(x.kg)}</span></div>`).join('')}</div>`;
} else if (top) than = '<p class="dim">ยังไม่มีชมรมใดเลย ลองเป็นผู้ก่อตั้งชมรมแรกดูสิ!</p>';
else if (ttTop) than = `<p><span class="bad">${esc(X.loi(ttTop))}</span>${thuLai('hoi-tai')}</p>`;
else than = '<p class="dim">กำลังโหลดตารางอันดับ…</p>';
const tim = `<div class="hoi-tim"><label for="hoi-tim">ค้นหาชมรมด้วยแท็ก</label><input type="text" id="hoi-tim" maxlength="8" placeholder="เช่น BL" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" value="${esc(timNhap)}"><button data-act="hoi-tim">🔍 ค้นหา</button></div>`;
return `${dau}${tim}<h3>อันดับชมรมประจำสัปดาห์นี้</h3>
      <p class="dim bb-nho">จัดอันดับตามน้ำหนักรวมที่สมาชิกตกออนไลน์ในสัปดาห์นี้ (นับเฉพาะปลาที่เซิร์ฟเวอร์ตรวจสอบแล้ว ตั้งแต่เข้าชมรม) กดที่ชมรมเพื่อดูข้อมูล</p>${than}`;
}
function veXem(me, co) {
const lui = `<p class="btnrow"><button data-act="hoi-lui">← ${co ? 'อันดับชมรมทั้งหมด' : 'ตารางอันดับ'}</button></p>`;
const hh = xemDu && xemDu.id === xemId ? xemDu.hoi : null;
if (!hh) return lui + (ttXem ? `<p><span class="bad">${esc(ttXem === 'khong-co' ? (xemId.slice(0, 4) === 'the:' ? 'ไม่มีชมรมที่ใช้แท็ก [' + xemId.slice(4) + ']' : 'ไม่พบชมรมนี้ — ชมรมอาจเพิ่งถูกยุบไปแล้ว') : X.loi(ttXem))}</span>${ttXem === 'khong-co' ? '' : thuLai('hoi-tai')}</p>` : '<p class="dim">กำลังโหลด…</p>');
const day = hh.tv.length >= H.MAX, cho = choDs().some(c => c.id === hh.id);
let vao;
if (co) vao = co.id === hh.id ? '<p class="dim">นี่คือชมรมของคุณ</p>' : '<p class="dim">คุณอยู่ในชมรมอื่นอยู่แล้ว หากต้องการย้ายมาชมรมนี้กรุณาออกจากชมรมเดิมก่อน</p>';
else if (!X.sanSang()) vao = h.moiDangNhap('ขอเข้าร่วมชมรม');
else if (!toi) vao = bao();
else if (day) vao = '<p class="dim">ชมรมมีสมาชิกครบ 30 คนแล้ว ยังรับเพิ่มไม่ได้</p>';
else if (cho) vao = '<p>⏳ คุณได้ขอเข้าร่วมชมรมนี้แล้ว — รอหัวหน้าหรือรองหัวหน้าอนุมัติ</p>';
else vao = `<p class="btnrow"><button class="good" data-act="hoi-xin" data-id="${esc(hh.id)}">${hh.mo ? '🎏 เข้าชมรมทันที' : '✋ ขอเข้าร่วมชมรม'}</button></p>
        <p class="dim bb-nho">${hh.mo ? 'ชมรมเปิดกว้าง: กดเข้าได้ทันที' : 'ชมรมนี้ต้องให้หัวหน้าหรือรองหัวหน้าอนุมัติจึงจะเข้าได้'}</p>`;
return `${lui}<div class="hoi-dau"><div class="hoi-tieu">🎏 ${tenHoi(hh)} ${khoa(hh)}</div>
        <div class="readout hoi-so">อันดับสัปดาห์ <b class="price">${hh.hangTuan > 0 ? '#' + hh.hangTuan : '—'}</b> · น้ำหนักรวมสัปดาห์ <b class="price">${X.kg(hh.kgTuan)}</b>${hh.nTuan ? ` (${hh.nTuan} ตัว)` : ""} · <b>${hh.tv.length}</b>/${H.MAX} สมาชิก${hh.lap ? ` · ก่อตั้งเมื่อ ${ngay(hh.lap)}` : ''}</div>
        ${hh.gt ? `<p class="hoi-gt">“${esc(hh.gt)}”</p>` : ''}</div>
      ${tbHtml()}${vao}
      <h3>สมาชิก (${hh.tv.length})</h3>
      <div class="hoi-ds">${xepTv(hh.tv).map(t => dongTv(t, me, false, '')).join('')}</div>`;
}
const loiO = k => (fLoi[k] ? `<div class="hoi-loi bad">${esc(fLoi[k])}</div>` : '');
function veLap() {
const the = f.the || 'BL';
return `<h3>ก่อตั้งชมรมใหม่</h3>
      <div class="hoi-form">
        <label for="hoi-ten">ชื่อชมรม <span class="dim">(3–24 ตัวอักษร) · <span id="hoi-ten-dem">${dai(f.ten)}</span>/24</span></label>
        <input type="text" id="hoi-ten" maxlength="24" placeholder="เช่น ชมรมชิงหลิวสยาม" autocomplete="off" spellcheck="false" value="${esc(f.ten)}">${loiO('ten')}
        <label for="hoi-the">แท็กชมรม <span class="dim">(ตัวอักษร A–Z หรือตัวเลข 2–4 ตัว) · แสดงข้างชื่อ: ${h.ten((X.toi() || {}).ten, '')} <span class="bb-the">[<span id="hoi-the-xem">${esc(the)}</span>]</span></span></label>
        <input type="text" id="hoi-the" maxlength="8" placeholder="เช่น BL" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" value="${esc(f.the)}">${loiO('the')}
        <label for="hoi-gt">คำแนะนำชมรม <span class="dim">(ไม่บังคับ) · <span id="hoi-gt-dem">${dai(f.gt)}</span>/120</span></label>
        <textarea id="hoi-gt" maxlength="120" placeholder="ตกบ่อไหน แนวไหน รับสมาชิกแบบไหน…">${esc(f.gt)}</textarea>${loiO('gt')}
        <div class="hoi-chon"><span>ใครเข้าได้บ้าง?</span>
          <button data-act="hoi-lap-mo" data-m="1" class="${f.mo ? 'good' : ''}">🔓 ทุกคนเข้าได้ทันที</button>
          <button data-act="hoi-lap-mo" data-m="0" class="${f.mo ? '' : 'good'}">🔒 ต้องรออนุมัติ</button></div>
        ${loiO('chung')}${ban ? '<p class="hoi-tb dim">⏳ กำลังส่ง…</p>' : ''}
        <p class="btnrow"><button class="good" data-act="hoi-lap-gui"${ban ? ' disabled' : ''}>🎏 ก่อตั้งชมรม</button><button data-act="hoi-ve">ยกเลิก</button></p>
        <p class="dim bb-nho">คุณจะเป็นหัวหน้าชมรม 1 คนอยู่ได้เพียง 1 ชมรม สมาชิกสูงสุด 30 คน ชื่อและแท็กชมรมไม่สามารถแก้ไขได้หลังก่อตั้ง กรุณาเลือกให้ดี</p>
      </div>`;
}
function veSua(hh) {
return `<h3>แก้ไขคำแนะนำชมรม</h3>
      <div class="hoi-form"><label for="hoi-gt-sua">${tenHoi(hh)} <span class="dim">· <span id="hoi-gt-dem">${dai(suaGt)}</span>/120</span></label>
        <textarea id="hoi-gt-sua" maxlength="120" placeholder="ตกบ่อไหน แนวไหน รับสมาชิกแบบไหน…">${esc(suaGt)}</textarea>${loiO('gt')}
        ${ban ? '<p class="hoi-tb dim">⏳ กำลังส่ง…</p>' : ''}
        <p class="btnrow"><button class="good" data-act="hoi-sua-gui"${ban ? ' disabled' : ''}>บันทึก</button><button data-act="hoi-ve">ยกเลิก</button></p></div>`;
}
function ve() {
let than;
if (!X.co()) than = '<p class="dim">เซิร์ฟเวอร์ออนไลน์ยังไม่เปิดให้บริการ — ระบบชมรมจะใช้ได้เมื่อเซิร์ฟเวอร์เปิด ตอนนี้ตกปลาได้ตามปกติ</p>';
else {
const me = X.toi(), co = toi && toi.hoi;
if (man === 'lap' && !co && me) than = veLap();
else if (man === 'sua' && co) than = veSua(co);
else if (man === 'xem' && xemId) than = veXem(me, co);
else if (co && man !== 'top') than = veHoiToi(me, co);
else than = veTop(me, co);
}
sigVe = sig();
soCu = soXin();
return than;
}
CD.them({
id: 'hoi', ten: 'ชมรม', bieu: '🎏', thuTu: 50, ve,
mo: () => {
hoiLai = null; moMa = ''; tb = null;
if (man === 'top' || (man === 'xem' && !giuXem)) man = '';
giuXem = false;
if (!dongHo) dongHo = setInterval(nhip, NHIP);
if (!X.co()) return;
if (X.sanSang()) taiToi(); else { ttToi = 've'; toi = null; taiTop(); }
},
so: soXin
});
H.moThe = the => {
the = h.chuHoa(the, 4);
if (!/^[A-Z0-9]{2,4}$/.test(the)) return;
const co = toi && toi.hoi;
if (co && co.the === the) man = '';
else { man = 'xem'; xemId = 'the:' + the; ttXem = ''; giuXem = true; }
tb = null; hoiLai = null;
if (CD.dangMo('hoi')) { veLai(); if (man === 'xem') taiXem(xemId); } else { CD.mo('hoi'); if (man === 'xem') taiXem(xemId); }
const p = $('panel'); if (p) p.scrollTop = 0;
};
function timThe() {
const el = $('hoi-tim'), v = h.chuHoa(el ? el.value : timNhap, 4);
timNhap = v;
if (!/^[A-Z0-9]{2,4}$/.test(v)) { noi('กรุณากรอกแท็กชมรม 2–4 ตัวอักษรหรือตัวเลข เช่น BL', 'bad'); veLai(); return; }
H.moThe(v);
}
function docForm() {
const a = $('hoi-ten'), b = $('hoi-the'), c = $('hoi-gt');
if (a) f.ten = a.value;
if (b) f.the = h.chuHoa(b.value, 4);
if (c) f.gt = c.value;
}
function guiLap() {
docForm();
const ten = gon(f.ten).normalize('NFC'), gt = gon(f.gt).normalize('NFC'), n = dai(ten);
fLoi = {};
if (n < 3) fLoi.ten = 'ชื่อชมรมต้องมีอย่างน้อย 3 ตัวอักษร';
else if (n > 24) fLoi.ten = 'ชื่อชมรมต้องไม่เกิน 24 ตัวอักษร';
if (!/^[A-Z0-9]{2,4}$/.test(f.the)) fLoi.the = LOI.the;
if (dai(gt) > 120) fLoi.gt = 'คำแนะนำชมรมต้องไม่เกิน 120 ตัวอักษร';
if (fLoi.ten || fLoi.the || fLoi.gt) return veLai();
const gui = { ten, the: f.the, mo: f.mo ? 1 : 0 };
if (gt) gui.gt = gt;
lenh('/hoi/lap', gui, () => { man = ''; f.ten = f.the = f.gt = ''; f.mo = 1; return `ก่อตั้ง ${hoiX(ten)} [${gui.the}] แล้ว — คุณเป็นหัวหน้าชมรม`; }, why => {
if (why === 'trung-ten' || why === 'ten') fLoi.ten = LOI[why];
else if (why === 'trung-the' || why === 'the') fLoi.the = LOI[why];
else fLoi.chung = loiHoi(why);
return true;
});
}
function xin(id) {
const hh = xemDu && xemDu.hoi.id === id ? xemDu.hoi : null, ten = hh ? hoiX(hh.ten) : 'ชมรม';
lenh('/hoi/xin', { id }, r => {
if (r.vao) { man = ''; return `คุณเข้าร่วม ${ten} แล้ว`; }
const a = choDs().filter(x => x.id !== id);
a.push({ id, ten: hh ? hh.ten : '', the: hh ? hh.the : '', luc: Date.now() });
choLuu(a);
return `ส่งคำขอเข้า ${ten} แล้ว — รอหัวหน้าหรือรองหัวหน้าอนุมัติ`;
});
}
function lamHoiLai() {
const q = hoiLai, hh = toi && toi.hoi;
if (!q || !hh) return;
if (q.k === 'roi') { tuRoi = true; lenh('/hoi/roi', {}, () => { man = ''; return `คุณออกจาก ${hoiX(hh.ten)} แล้ว`; }, () => { tuRoi = false; return false; }); }
else if (q.k === 'duoi') lenh('/hoi/duoi', { ma: q.ma }, () => { moMa = ''; return `เชิญ ${q.ten || q.ma} ออกจากชมรมแล้ว`; });
else if (q.k === 'truong') lenh('/hoi/vai', { ma: q.ma, vai: 'truong' }, () => { moMa = ''; return `โอนตำแหน่งหัวหน้าชมรมให้ ${q.ten || q.ma} แล้ว`; });
}
document.addEventListener('input', e => {
const el = e.target, id = el && el.id;
if (!id || id.slice(0, 4) !== 'hoi-' || e.isComposing) return;
const k = id === 'hoi-ten' ? 'ten' : id === 'hoi-the' ? 'the' : 'gt';
if (fLoi[k]) { delete fLoi[k]; const n = el.nextElementSibling; if (n && n.classList.contains('hoi-loi')) n.remove(); }
if (id === 'hoi-tim') { const v = h.chuHoa(el.value, 4); if (v !== el.value) el.value = v; timNhap = v; return; }
if (id === 'hoi-ten') { f.ten = el.value; const d = $('hoi-ten-dem'); if (d) d.textContent = dai(gon(el.value)); }
else if (id === 'hoi-the') {
const v = h.chuHoa(el.value, 4);
if (v !== el.value) el.value = v;
f.the = v;
const d = $('hoi-the-xem'); if (d) d.textContent = v || 'BL';
} else if (id === 'hoi-gt' || id === 'hoi-gt-sua') {
if (id === 'hoi-gt') f.gt = el.value; else suaGt = el.value;
const d = $('hoi-gt-dem'); if (d) d.textContent = dai(el.value);
}
});
document.addEventListener('keydown', e => { if (e.target && e.target.id === 'hoi-tim' && e.key === 'Enter') { e.preventDefault(); timThe(); return; } if (e.target && (e.target.id === 'hoi-ten' || e.target.id === 'hoi-the') && e.key === 'Enter') { e.preventDefault(); if (!ban) guiLap(); } });
const baseAction = UI.onAction;
UI.onAction = function (act, btn) {
if (!act || act.slice(0, 4) !== 'hoi-') return baseAction.apply(this, arguments);
const d = (btn && btn.dataset) || {}, hh = toi && toi.hoi;
const cuon = () => { const p = $('panel'); if (p) p.scrollTop = 0; };
if (ban && act !== 'hoi-tv') return;
switch (act) {
case 'hoi-ve': if (man === 'lap' || man === 'sua') docForm(); man = ''; fLoi = {}; hoiLai = null; veLai(); cuon(); return;
case 'hoi-lui': man = hh ? 'top' : ''; hoiLai = null; tb = null; veLai(); cuon(); taiTop(); return;
case 'hoi-top': man = 'top'; hoiLai = null; tb = null; veLai(); cuon(); taiTop(); return;
case 'hoi-xem':
if (hh && hh.id === d.id) { man = ''; veLai(); cuon(); return; }
man = 'xem'; xemId = d.id || ''; ttXem = ''; tb = null; veLai(); cuon(); taiXem(xemId); return;
case 'hoi-tai': tb = null; ttToi = ttToi === 've' || ttToi === 'tat' ? ttToi : ''; ttTop = ''; ttXem = ''; veLai();
if (X.sanSang()) taiToi(true);
if (man === 'xem') taiXem(xemId, true); else taiTop(true);
return;
case 'hoi-lap': man = 'lap'; fLoi = {}; tb = null; veLai(); cuon(); setTimeout(() => { const i = $('hoi-ten'); if (i && !UI.touch) i.focus(); }, 30); return;
case 'hoi-lap-mo': docForm(); f.mo = d.m === '1' ? 1 : 0; veLai(); return;
case 'hoi-lap-gui': guiLap(); return;
case 'hoi-xin': xin(d.id || ''); return;
case 'hoi-tim': timThe(); return;
case 'hoi-the': H.moThe(d.the || ''); return;
case 'hoi-cho-bo': choLuu(choDs().filter(x => x.id !== d.id)); veLai(); return;
case 'hoi-tv': moMa = moMa === d.ma ? '' : d.ma || ''; if (hoiLai && hoiLai.ma) hoiLai = null; veLai(); return;
case 'hoi-duyet': {
const x = ((toi && toi.xin) || []).find(y => y.ma === d.ma), ten = (x && x.ten) || d.ma;
lenh('/hoi/duyet', { ma: d.ma, nhan: d.n === '1' ? 1 : 0 }, () => (d.n === '1' ? `รับ ${ten} เข้าชมรมแล้ว` : `ปฏิเสธ ${ten} แล้ว`));
return;
}
case 'hoi-vai': {
const t = hh && hh.tv.find(y => y.ma === d.ma), ten = (t && t.ten) || d.ma, v = d.v === 'pho' ? 'pho' : 'tv';
lenh('/hoi/vai', { ma: d.ma, vai: v }, () => (v === 'pho' ? `แต่งตั้ง ${ten} เป็นรองหัวหน้าชมรมแล้ว` : `ปลด ${ten} จากตำแหน่งรองหัวหน้าชมรมแล้ว`));
return;
}
case 'hoi-hoi': {
if (!hh) return;
if (d.k === 'roi') { hoiLai = { k: 'roi' }; moMa = ''; tb = null; veLai(); cuon(); return; }
const t = hh.tv.find(y => y.ma === d.ma);
if (t) { hoiLai = { k: d.k === 'truong' ? 'truong' : 'duoi', ma: t.ma, ten: t.ten }; veLai(); }
return;
}
case 'hoi-ok': lamHoiLai(); return;
case 'hoi-khong': hoiLai = null; veLai(); return;
case 'hoi-sua': if (hh) { man = 'sua'; suaGt = hh.gt; fLoi = {}; veLai(); cuon(); } return;
case 'hoi-sua-gui': {
const el = $('hoi-gt-sua'), gt = gon(el ? el.value : suaGt).normalize('NFC');
suaGt = gt; fLoi = {};
if (dai(gt) > 120) { fLoi.gt = 'คำแนะนำชมรมต้องไม่เกิน 120 ตัวอักษร'; veLai(); return; }
lenh('/hoi/doi', { gt }, () => { man = ''; return 'บันทึกคำแนะนำชมรมแล้ว'; }, why => { fLoi.gt = loiHoi(why); return true; });
return;
}
case 'hoi-mo': {
const m = d.m === '1' ? 1 : 0;
lenh('/hoi/doi', { mo: m }, () => (m ? 'เปิดชมรมให้ทุกคนเข้าได้ทันทีแล้ว' : 'เปลี่ยนชมรมเป็นต้องรออนุมัติก่อนเข้าแล้ว'));
return;
}
case 'hoi-ngoi': h.ngoi(d.ma, d.ho); return;
case 'hoi-ban': {
const r = B.them(d.ma, d.ten || '');
UI.toast(r.ok ? `👥 เพิ่ม ${d.ten || d.ma} ลงในรายชื่อเพื่อนแล้ว` : 'ยังไม่สามารถเพิ่มได้: ผู้เล่นนี้เป็นเพื่อนอยู่แล้ว หรือรายชื่อเพื่อนครบ 50 คนแล้ว', r.ok ? 'good' : 'info', 3500);
veLai(); return;
}
}
};
})();