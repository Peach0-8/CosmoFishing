(function () {
const UI = CC.UI, X = CC.XaHoi, CD = CC.CongDong;
if (!UI || !X || !CD) return;
const $ = id => document.getElementById(id);
const esc = X.esc;
const PHUT = 60e3, GIO = 3600e3, NGAY = 864e5;
const HO = [{ id: 'rophi', ten: 'บ่อปลานิล', ngan: 'ปลานิล' }, { id: 'diec', ten: 'บ่อปลาตะเพียนจีน', ngan: 'ตะเพียนจีน' }, { id: 'tram', ten: 'บ่อปลาเฉาดำ', ngan: 'เฉาดำ' }];
const HO_ID = HO.map(h => h.id);
const HUY = ['🥇', '🥈', '🥉'], THU = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
const TEN_GIAI = { trua: 'ศึกเที่ยงวัน', toi: 'ศึกค่ำคืน', diec: 'ศึกตะเพียนจีน', khung: 'ศึกปลาไซส์ยักษ์' };
const THUONG0 = [2000, 1000, 500, 200, 200, 200, 200, 200, 200, 200];
const bangThuong = () => { const a = arr(GG.d && GG.d.thuong).map(x => Math.max(0, Math.round(+x || 0))); return a.length && a[0] > 0 ? a.slice(0, 20) : THUONG0; };
const thuong = h => bangThuong()[h - 1] || 0;
const thuongTxt = () => {
const a = bangThuong(), out = [];
for (let i = 0; i < a.length && a[i] > 0;) {
let j = i; while (j + 1 < a.length && a[j + 1] === a[i]) j++;
out.push(i < 3 && j === i ? `${HUY[i]} <b>${tien(a[i])}</b>` : `อันดับ ${i + 1}${j > i ? '–' + (j + 1) : ''}: <b>${tien(a[i])}</b>`);
i = j + 1;
}
return out.join(' · ');
};
const canNguoi = () => { const n = Math.round(+(GG.d && GG.d.canNguoi)); return n >= 1 && n <= 99 ? n : 5; };
const K = CC.KyLuc = { ho: 'rophi', muc: 'loai' };
const arr = a => (Array.isArray(a) ? a : []);
const so = (x, d) => { x = +x; return isFinite(x) ? x : (d || 0); };
const kg = w => X.kg(Math.max(0, so(w)));
const tien = k => Math.round(so(k)).toLocaleString('th-TH') + ' ฿';
const pad = n => String(n).padStart(2, '0');
const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + pad(s % 60); };
const tenHo = id => { const h = HO.find(x => x.id === id); return h ? h.ten : id === 'giai' ? 'บ่อชิงแชมป์วันอาทิตย์' : 'บ่ออื่นๆ'; };
const loaiCa = id => CC.FISH_BY_ID[id] || { id, name: 'ปลาแปลก', sci: '', shape: 'carp', a: 0.02, col: { body: '#8a9396', back: '#4b5558', belly: '#dfe3e0', fin: '#6f787b' } };
const tenLoai = id => loaiCa(id).name.replace(/ \(.*\)$/, '');
const tenLoaiNgan = id => tenLoai(id).replace(/^ปลา/, '');
const khoang = ms => {
const m = Math.max(1, Math.ceil(ms / PHUT));
if (m >= 2880) return Math.floor(m / 1440) + ' วัน' + (Math.floor((m % 1440) / 60) ? ' ' + Math.floor((m % 1440) / 60) + ' ชั่วโมง' : '');
if (m >= 60) return Math.floor(m / 60) + ' ชั่วโมง' + (m % 60 ? ' ' + (m % 60) + ' นาที' : '');
return m + ' นาที';
};
const gioMay = t => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
const dauNgay = t => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
const ngayMay = t => {
const k = Math.round((dauNgay(t) - dauNgay(Date.now())) / NGAY), d = new Date(t);
return k === 0 ? 'วันนี้' : k === 1 ? 'พรุ่งนี้' : k === -1 ? 'เมื่อวาน' : THU[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1);
};
const toi = () => { try { return X.toi(); } catch (e) { return null; } };
const banBe = () => { const s = new Set(); arr(CC.P && CC.P.bb).forEach(b => { if (b && typeof b.ma === 'string') s.add(b.ma); }); return s; };
const noiCau = () => { const O = CC.Online; return O && O.inRoom && O.inRoom() && CC.P && HO_ID.indexOf(CC.P.pondId) >= 0 ? CC.P.pondId : null; };
const batOnline = () => { try { const O = CC.Online; return !!(O && O.cfg && O.cfg().bat); } catch (e) { return false; } };
const KEY = 'cauca_kyluc_v1';
let luu = { ph: [], gl: [], ho: 'rophi', muc: 'loai' };
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') luu = Object.assign(luu, s); } catch (e) {   }
luu.ph = arr(luu.ph).filter(x => typeof x === 'string').slice(-80);
luu.gl = arr(luu.gl).filter(x => typeof x === 'string').slice(-40);
const ghi = () => { try { localStorage.setItem(KEY, JSON.stringify(luu)); } catch (e) {   } };
K.ho = HO_ID.indexOf(luu.ho) >= 0 || luu.ho === 'tatca' ? luu.ho : 'rophi';
K.muc = luu.muc === 'tuan' ? 'tuan' : 'loai';
async function goiCK(path, nen) {
let r = null, cam = false;
if (nen || X.sanSang()) {
r = await X.goi(path, nen ? { veNeuCo: true } : { ve: true });
if (r && !r.ok && (r.why === 've' || r.why === 'cam')) { cam = r.why === 'cam' ? { den: so(r.den), ly: typeof r.lyDo === 'string' ? r.lyDo : '' } : false; r = null; }
}
if (!r) r = await X.goi(path);
return { r: r && typeof r === 'object' ? r : { ok: false, why: 'loi' }, cam };
}
function loiHtml(why, act, cu) {
const thu = why === 'tat' ? '' : ` <button data-act="${act}">↻ ลองใหม่</button>`;
if (cu) return `<p class="kl-loi">⚠ ยังโหลดซ้ำไม่สำเร็จ (${esc(X.loi(why))}) กำลังดูข้อมูลเมื่อเวลา ${gioMay(cu)} น.${thu}</p>`;
return `<div class="readout kl-loi">${esc(X.loi(why))}${why === 'tat' ? ' ตารางสถิติและการแข่งขันรอบชั่วโมงจะเปิดให้ใช้งานเมื่อเซิร์ฟเวอร์ออนไลน์เปิดให้บริการ' : ''}${thu}</div>`;
}
const moiDangNhap = viec => `<p class="kl-moi">👤 <b>เข้าสู่ระบบ Google และตั้งชื่อผู้เล่น</b> เพื่อ${viec}${UI.PANELS.tk ? ' <button data-act="kl-tk">เปิดหน้าต่างบัญชี</button>' : ''}</p>`;
const TOI = { cam: null, hoi: 0, dang: false };
async function hoiToi() {
const now = Date.now();
if (TOI.dang || !X.co() || !X.sanSang() || now - TOI.hoi < 5 * PHUT) return;
TOI.dang = true; TOI.hoi = now;
const r = await X.goi('/toi', { ve: true });
TOI.dang = false;
if (!r || !r.ok) return;
const c = r.cam && typeof r.cam === 'object' ? { den: so(r.cam.den), ly: typeof r.cam.lyDo === 'string' ? r.cam.lyDo : '' } : null;
const doi = JSON.stringify(c) !== JSON.stringify(TOI.cam);
TOI.cam = c;
if (doi) { CD.veLai('kyluc'); CD.veLai('giaigio'); }
}
const camPhong = () => {
if (TOI.cam && TOI.cam.den > Date.now()) return TOI.cam;
try {
const O = CC.Online, den = O && O.camDen ? +O.camDen() || 0 : 0;
return den > Date.now() ? { den, ly: (O.cfg && O.cfg().camLy) || '' } : null;
} catch (e) { return null; }
};
const camHtml = c => {
const den = c && so(c.den) > Date.now() ? ` จนถึง <b>${gioMay(c.den)} น. ${ngayMay(c.den)}</b>` : '', ly = c && c.ly ? `, เหตุผล: ${esc(String(c.ly).slice(0, 200))}` : '';
return `<p class="kl-cam">⛔ บัญชีนี้ถูกระงับการเล่นออนไลน์ชั่วคราว${den}${ly} ระหว่างนี้ชื่อของคุณจะไม่ถูกบันทึกขึ้นตารางสถิติ แต่ยังสามารถดูตารางและเล่นคนเดียวได้ตามปกติ</p>`;
};
const kl = {};
const nguong = {};
async function taiKyLuc(ho, nen, ep) {
const e = kl[ho] || (kl[ho] = { d: null, luc: 0, hoi: 0, dang: false, loi: '', cam: false });
const now = Date.now();
if (e.dang || (!ep && e.d && now - e.luc < 25e3) || (nen && now - e.hoi < 60e3)) return;
if (!X.co()) { e.loi = 'tat'; return; }
e.dang = true; e.hoi = now;
if (!nen) CD.veLai('kyluc');
const { r, cam } = await goiCK('/kyluc?ho=' + ho, nen);
e.dang = false;
if (r.ok) {
e.d = r; e.luc = Date.now(); e.loi = ''; e.cam = cam;
if (ho !== 'tatca') { const n = nguong[ho] = {}; arr(r.loai).forEach(l => { if (l && typeof l.sp === 'string') n[l.sp] = so(arr(l.top)[0] && arr(l.top)[0].w); }); }
} else e.loi = r.why || 'loi';
CD.veLai('kyluc');
}
function tenHtml(r, me, bb) {
const the = r.the ? `<span class="kl-the">[${esc(String(r.the).slice(0, 6))}]</span>` : '';
return `<div class="kl-tn"><span class="kl-ten">${bb ? '👥 ' : ''}${esc(r.ten || 'ผู้เล่น')}</span>${the}${me ? '<span class="kl-toi">(คุณ)</span>' : ''}</div>`;
}
function dong(hang, r, gia, T, BB) {
const me = !!(T && r.ma === T.ma), bb = !me && BB.has(r.ma);
return `<tr class="${me ? 'me' : bb ? 'bb' : ''}"><td class="h">${hang >= 1 && hang <= 3 ? HUY[hang - 1] : hang}</td><td class="t">${tenHtml(r, me, bb)}</td><td class="num">${gia}</td></tr>`;
}
const bang = rows => `<table class="kl-bang">${rows.join('')}</table>`;
function loaiHtml(d, ho, T, BB) {
const thuTu = id => { const i = CC.FISH.findIndex(f => f.id === id); return i < 0 ? 99 : i; };
const ds = arr(d.loai).filter(l => l && typeof l.sp === 'string' && arr(l.top).length).sort((a, b) => thuTu(a.sp) - thuTu(b.sp));
if (!ds.length) return '<p class="kl-trong">ยังไม่มีสถิติในบ่อนี้ เข้าตกปลาในห้องออนไลน์แล้วเอาปลาตัวแรกขึ้นฝั่งให้เป็นสถิติแรก!</p>';
const co = new Set(ds.map(l => l.sp)), thieu = [];
(ho === 'tatca' ? HO_ID : [ho]).forEach(h => { const p = CC.PONDS_BY_ID[h]; if (p) Object.keys(p.fish).forEach(sp => { if (!co.has(sp) && thieu.indexOf(sp) < 0 && !/ปลารบกวน/.test(loaiCa(sp).name)) thieu.push(sp); }); });
const the = ds.map(l => {
const top = arr(l.top).slice(0, 5), a = top[0], me = !!(T && a.ma === T.ma), bb = !me && BB.has(a.ma);
const phu = top.slice(1).map((r, i) => {
const m2 = !!(T && r.ma === T.ma), b2 = !m2 && BB.has(r.ma);
return `<div class="kl-p ${m2 ? 'me' : b2 ? 'bb' : ''}"><span class="h">${i + 2}</span>${tenHtml(r, m2, b2)}<span class="num">${kg(r.w)}</span></div>`;
}).join('');
return `<div class="kl-loai">
        <div class="kl-dau"><canvas class="kl-cv" data-fish="${esc(l.sp)}"></canvas>
          <div class="kl-nhat ${me ? 'me' : bb ? 'bb' : ''}"><div class="kl-lt"><b>${esc(tenLoai(l.sp))}</b> <span class="price">${kg(a.w)}</span></div>
            <div class="kl-l1">🥇 ${tenHtml(a, me, bb)}</div>
            <div class="kl-l2 dim">${ho === 'tatca' && a.ho ? esc(tenHo(a.ho)) + ' · ' : ''}${esc(X.luc(so(a.luc)))}</div></div></div>
        ${phu ? `<div class="kl-phu">${phu}</div>` : ''}</div>`;
}).join('');
return `<div class="kl-luoi">${the}</div>${thieu.length ? `<p class="dim kl-nho">ยังไม่มีใครทำสถิติ: ${thieu.map(sp => esc(tenLoaiNgan(sp))).join(', ')} — ตกได้ตัวแรกก็มีชื่อขึ้นทันที</p>` : ''}`;
}
function tuanHtml(d, ho, e, T, BB) {
const tn = d.tuanNay || {}, tt = d.tuanTruoc || {}, me = d.toi, con = so(d.tuanHet) - Date.now();
const kgRows = arr(tn.kg).slice(0, 20).map((r, i) => dong(i + 1, r, `${kg(r.kg)}<small> · ${so(r.n)} ตัว</small>`, T, BB));
const toRows = arr(tn.to).slice(0, 10).map((r, i) => dong(i + 1, r, `<small>${esc(tenLoaiNgan(r.sp))} </small>${kg(r.w)}`, T, BB));
let toiDong;
if (e.cam || camPhong()) toiDong = camHtml(e.cam || camPhong());
else if (me && so(me.hangKg) > 0) toiDong = `<div class="kl-toidong">คุณอยู่อันดับ <b>${so(me.hangKg)}</b> ในสัปดาห์นี้ · <b>${kg(me.kg)}</b> · ${so(me.n)} ตัว${me.toNhat && me.toNhat.sp ? ` · ตัวใหญ่สุด: ${esc(tenLoaiNgan(me.toNhat.sp))} ${kg(me.toNhat.w)}` : ''}</div>`;
else if (T) toiDong = '<div class="kl-toidong dim">สัปดาห์นี้คุณยังไม่มีปลาที่ถูกนับ เปิด 🌐 เล่นออนไลน์ในหน้าต่าง 🎣 เลือกบ่อ แล้วเข้าตกปลาก็จะมีชื่อขึ้นตาราง</div>';
else toiDong = moiDangNhap('ดูอันดับของคุณบนตารางประจำสัปดาห์');
const truoc = (ten, rows) => (rows.length ? `<div class="kl-cot"><div class="kl-tt">${ten}</div>${bang(rows)}</div>` : '');
const tk = arr(tt.kg).slice(0, 3).map((r, i) => dong(i + 1, r, kg(r.kg), T, BB)), tto = arr(tt.to).slice(0, 3).map((r, i) => dong(i + 1, r, `<small>${esc(tenLoaiNgan(r.sp))} </small>${kg(r.w)}`, T, BB));
return `<div class="readout kl-tuan">📅 ${con > 0 ? `สัปดาห์นี้เหลือเวลาอีก <b id="kl-dem">${khoang(con)}</b>` : '<b>เข้าสัปดาห์ใหม่แล้ว</b>: กด ↻ เพื่อดูตารางใหม่'} · ตารางประจำสัปดาห์รีเซ็ตทุกวันจันทร์เวลา 00:00 น. (เวลาไทย)${toiDong}</div>
      ${kgRows.length || toRows.length ? `<div class="kl-2cot">
        <div class="kl-cot"><div class="kl-tt">น้ำหนักรวมสัปดาห์นี้ <span class="dim">(20 อันดับแรก)</span></div>${kgRows.length ? bang(kgRows) : '<p class="dim">ยังไม่มีผู้เล่น</p>'}</div>
        <div class="kl-cot"><div class="kl-tt">ตัวใหญ่สุดประจำสัปดาห์</div>${toRows.length ? bang(toRows) : '<p class="dim">ยังไม่มีผู้เล่น</p>'}</div>
      </div>` : '<p class="kl-trong">สัปดาห์นี้ยังไม่มีใครขึ้นตาราง — มาเป็นคนแรกกันเลย!</p>'}
      ${tk.length || tto.length ? `<h3>สัปดาห์ก่อน</h3><div class="kl-2cot">${truoc('น้ำหนักรวม', tk)}${truoc('ตัวใหญ่สุด', tto)}</div>` : ''}`;
}
function veKyLuc() {
const ho = K.ho, e = kl[ho] || {}, T = toi(), BB = banBe();
const nutHo = HO.concat([{ id: 'tatca', ngan: 'ทั้งหมด' }]).map(h => `<button data-act="kl-ho" data-id="${h.id}" class="${h.id === ho ? 'on' : ''}">${h.ngan}</button>`).join('');
const nutMuc = `<button data-act="kl-muc" data-id="loai" class="${K.muc === 'loai' ? 'on' : ''}">🐟 ใหญ่ที่สุดตลอดกาล</button><button data-act="kl-muc" data-id="tuan" class="${K.muc === 'tuan' ? 'on' : ''}">📅 ตารางประจำสัปดาห์</button>`;
const dau = `<div class="kl-chon"><div class="btnrow kl-chips">${nutHo}</div><div class="btnrow kl-chips">${nutMuc}<button data-act="kl-tai" title="รีเฟรช">↻</button></div></div>`;
let than;
if (!X.co()) than = loiHtml('tat', 'kl-tai');
else if (!e.d) than = e.loi ? loiHtml(e.loi, 'kl-tai') : '<p class="kl-trong">กำลังโหลด…</p>';
else {
than = (e.loi ? loiHtml(e.loi, 'kl-tai', e.luc) : '') + (K.muc === 'tuan' ? tuanHtml(e.d, ho, e, T, BB) : loaiHtml(e.d, ho, T, BB)) +
`<p class="dim kl-nho">นับเฉพาะปลาที่ตกในห้องออนไลน์ (เซิร์ฟเวอร์สุ่มและตรวจสอบปลา) ${ho === 'tatca' ? 'รวมทั้งสามบ่อ' : 'เฉพาะ' + tenHo(ho)} แถวสีทองคือคุณ${BB.size ? ', แถวสีฟ้า 👥 คือเพื่อน' : ''}</p>`;
}
return dau + than;
}
function veCa() {
document.querySelectorAll('#panel-body canvas.kl-cv').forEach(c => { try { UI.drawFishCard(c, loaiCa(c.dataset.fish), null); } catch (e) {   } });
}
const GG = { d: null, luc: 0, lech: 0, hoi: 0, cho: Date.now() + 3000 + Math.random() * 6000, thua: PHUT, dang: false, loi: '', cam: false, khoa: '' };
const PH = { d: null, luc: 0, hoi: 0, dang: false, loi: '', vua: 0 };
const gioMC = () => Date.now() + GG.lech;
const laGiai = g => !!g && typeof g === 'object' && typeof g.id === 'string' && so(g.batDau) > 0 && so(g.ketThuc) > so(g.batDau);
const tinPhong = () => {
try {
const O = CC.Online, g = O && O.giaiGio && O.giaiGio();
return laGiai(g) && (g.pha === 'sap' || g.pha === 'dang') ? g : null;
} catch (e) { return null; }
};
function tinh() {
const tp = tinPhong();
let d = GG.d;
if (!d && !tp) return null;
d = d || {};
const t = gioMC(), sapAll = arr(d.sap).filter(laGiai);
if (tp && t < tp.ketThuc && ![d.dang].concat(arr(d.dangThem), sapAll).some(g => g && g.id === tp.id)) sapAll.push({ id: tp.id, ten: tp.ten, ho: tp.ho, kieu: tp.kieu, batDau: tp.batDau, ketThuc: tp.ketThuc });
sapAll.sort((a, b) => a.batDau - b.batDau);
let dang = laGiai(d.dang) && t < d.dang.ketThuc ? d.dang : null, moi = false;
if (!dang) { const g = sapAll.find(x => x.batDau <= t && t < x.ketThuc); if (g) { dang = g; moi = true; } }
const them = arr(d.dangThem).filter(g => laGiai(g) && g.batDau <= t && t < g.ketThuc && (!dang || g.id !== dang.id));
if (!dang && them.length) dang = them.shift();
const ca = dang ? [dang].concat(them) : [];
return { t, dang, them, ca, moi, sap: sapAll.filter(g => g.batDau > t && !ca.some(x => x.id === g.id)), truoc: laGiai(d.truoc) ? d.truoc : null, cu: (laGiai(d.dang) && t >= d.dang.ketThuc) || moi };
}
function datLich(ok) {
const now = Date.now();
if (!ok) { GG.thua = Math.min(GG.thua * 2, 10 * PHUT); GG.cho = now + GG.thua; return; }
GG.thua = PHUT;
const s = tinh(), rung = Math.random() * 10e3;
let han = now + 30 * PHUT;
if (s) s.ca.forEach(g => { han = Math.min(han, g.ketThuc - GG.lech + 4000 + rung); });
if (s && s.sap[0]) han = Math.min(han, s.sap[0].batDau - GG.lech + 2000 + rung);
GG.cho = Math.max(now + PHUT, han);
}
async function taiGiai(nen) {
if (GG.dang) return;
if (!X.co()) { GG.loi = 'tat'; return; }
GG.dang = true; GG.hoi = Date.now();
const o = noiCau() || (CC.P && HO_ID.indexOf(CC.P.pondId) >= 0 ? CC.P.pondId : '');
const { r, cam } = await goiCK('/giaigio' + (o ? '?ho=' + o : ''), nen);
GG.dang = false;
let doi = true;
if (r.ok) {
const khoa = JSON.stringify([r.dang, r.dangThem, r.sap, r.truoc, cam]);
doi = khoa !== GG.khoa || !!GG.loi; GG.khoa = khoa;
GG.d = r; GG.luc = Date.now(); GG.lech = so(r.luc, GG.luc) - GG.luc; GG.loi = ''; GG.cam = cam;
} else GG.loi = r.why || 'loi';
datLich(r.ok);
if (doi) CD.veLai('giaigio');
chipVe();
}
async function taiPhieu(ep) {
const now = Date.now();
if (PH.dang || !X.co() || !X.sanSang() || (!ep && now - PH.hoi < PHUT)) return;
PH.dang = true; PH.hoi = now;
const r = await X.goi('/giaigio/phieu', { ve: true });
PH.dang = false;
if (r && r.ok) { PH.d = arr(r.phieu).filter(p => p && typeof p.g === 'string' && typeof p.i === 'string'); PH.luc = Date.now(); PH.loi = ''; }
else { PH.loi = (r && r.why) || 'loi'; if (PH.loi === 'cam') GG.cam = { den: so(r.den), ly: typeof r.lyDo === 'string' ? r.lyDo : '' }; }
CD.veLai('giaigio'); chipVe();
}
const khoa = s => { const T = toi(); return (T ? T.ma : '') + '~' + s; };
const daLinh = id => luu.gl.indexOf(khoa(id)) >= 0;
const chuaLinh = () => arr(PH.d).filter(p => luu.ph.indexOf(khoa(p.i)) < 0);
function tenGiai(id) {
const d = GG.d || {}, g = [d.dang, d.truoc].concat(arr(d.dangThem), arr(d.sap)).find(x => x && x.id === id);
if (g && g.ten) return String(g.ten);
const m = /^([a-z]+)-(\d{4})(\d\d)(\d\d)/.exec(String(id || ''));
return m ? (TEN_GIAI[m[1]] || 'ศึกชิงรางวัลรอบชั่วโมง') + ' ' + (+m[4]) + '/' + (+m[3]) : 'ศึกชิงรางวัลรอบชั่วโมง';
}
function linh() {
const T = CC.TaiKhoan, ds = chuaLinh().slice(0, 6);
let n = 0;
if (!ds.length) return;
for (const p of ds) {
const ten = tenGiai(p.giai), hang = so(p.hang), k = so(p.k);
let ok, baoRoi = false;
if (X.thu && X.thu()) { ok = true; if (k && CC.Quests && CC.Quests.give) { CC.Quests.give(`🏆 อันดับ ${hang} ${ten}`, k); baoRoi = true; } }
else ok = !!(T && T.thuong && T.thuong({ g: p.g, i: p.i, k }));
if (!ok) break;
luu.ph.push(khoa(p.i)); if (p.giai && !daLinh(p.giai)) luu.gl.push(khoa(p.giai));
if (!baoRoi) setTimeout(() => UI.toast(`🏆 อันดับ ${hang} ${ten}: +${tien(k)}`, 'good', 6000), 150 + n * 900);
n++;
}
if (luu.ph.length > 80) luu.ph.splice(0, luu.ph.length - 80);
if (luu.gl.length > 40) luu.gl.splice(0, luu.gl.length - 40);
ghi();
if (n) PH.vua = n;
else UI.toast('ไม่สามารถส่งใบรับรางวัลได้ — เปิดหน้าต่าง 👤 บัญชี แล้วเข้าสู่ระบบใหม่จากนั้นลองอีกครั้ง', 'bad', 5000);
CD.veLai('giaigio'); chipVe();
}
const kieuTxt = g => (g.kieu === 'to' ? 'นับตัวใหญ่สุด' : 'นับน้ำหนักรวม');
const diemTxt = (g, r) => (g.kieu === 'to' ? kg(r.to) : `${kg(r.kg)}<small> · ${so(r.n)} ตัว</small>`);
function bangGiai(g, T, BB, soDong) {
const top = arr(g.top).slice(0, soDong), rows = top.map((r, i) => dong(so(r.hang, i + 1), r, diemTxt(g, r), T, BB));
const me = g.toi;
if (me && T && so(me.hang) > 0 && !top.some(r => r.ma === T.ma)) rows.push('<tr class="sep"><td></td><td colspan="2">…</td></tr>', dong(so(me.hang), Object.assign({ ma: T.ma, ten: T.ten }, me), diemTxt(g, me), T, BB));
return rows.length ? bang(rows) : '';
}
function phieuHtml() {
const cho = chuaLinh();
if (cho.length) {
const ds = cho.slice(0, 4).map(p => `อันดับ ${so(p.hang)} ${esc(tenGiai(p.giai))} (+${tien(p.k)})`).join(', ') + (cho.length > 4 ? ` และอีก ${cho.length - 4} รายการ` : '');
return `<div class="gg-qua">🎁 คุณมีรางวัลที่ยังไม่ได้รับ <b>${cho.length}</b> รายการ: ${ds} <button class="good" data-act="gg-linh">รับรางวัล</button></div>`;
}
if (PH.vua) return `<div class="gg-qua xong">✅ ส่งใบรับรางวัล <b>${PH.vua}</b> ใบแล้ว${X.thu && X.thu() ? '' : ' ไปยังบัญชี — เงินจะเข้าภายในไม่กี่วินาที (ต้องเชื่อมต่ออินเทอร์เน็ต)'}</div>`;
return '';
}
function veGiai() {
if (!X.co()) return loiHtml('tat', 'gg-tai');
const d = GG.d;
if (!d) return GG.loi ? loiHtml(GG.loi, 'gg-tai') : '<p class="kl-trong">กำลังโหลด…</p>';
const s = tinh(), T = toi(), BB = banBe(), o = noiCau();
let h = GG.loi ? loiHtml(GG.loi, 'gg-tai', GG.luc) : '';
h += phieuHtml();
if (GG.cam || camPhong()) h += camHtml(GG.cam || camPhong());
else if (!T) h += moiDangNhap('ดูอันดับของตัวเองและรับรางวัลการแข่งขัน');
const khoiDang = (g, soDong) => {
const me = g.toi, dung = o === g.ho;
let toiDong = '';
if (!GG.cam && !camPhong() && T) {
if (me && so(me.hang) > 0) toiDong = `<div class="kl-toidong">คุณอยู่อันดับ <b>${so(me.hang)}</b>${so(g.soNguoi) ? ' / ' + so(g.soNguoi) : ''} · ${g.kieu === 'to' ? 'ตัวใหญ่สุด ' + kg(me.to) : `${kg(me.kg)} · ${so(me.n)} ตัว`}</div>`;
else toiDong = `<div class="kl-toidong dim">${dung ? 'คุณอยู่ในบ่อที่ถูกต้องแล้ว — ตกปลาตัวแรกขึ้นฝั่งก็มีชื่อขึ้นตาราง' : `คุณยังไม่มีปลาในการแข่งขันนี้ เปิด 🌐 เล่นออนไลน์ แล้วซื้อบัตร <b>${esc(tenHo(g.ho))}</b> ระบบจะนับให้อัตโนมัติ`}</div>`;
}
const b = bangGiai(g, T, BB, soDong);
return `<div class="gg-dang"><div class="gg-dau"><span><b>⏱ ${esc(g.ten || 'ศึกชิงรางวัลรอบชั่วโมง')}</b> กำลังแข่ง · ${esc(tenHo(g.ho))} · ${kieuTxt(g)}${so(g.soNguoi) ? ` · ${so(g.soNguoi)} คน` : ''}</span>
        <span class="gg-dh">เหลือ <b class="gg-con" data-t="${so(g.ketThuc)}">${mmss(g.ketThuc - s.t)}</b></span></div>${toiDong}
        ${b || `<p class="dim">${s.moi && g === s.dang ? 'การแข่งขันเพิ่งเริ่มต้น — กำลังดึงตารางอันดับ…' : 'ยังไม่มีใครตกปลาได้'}</p>`}</div>`;
};
if (s.dang) {
h += khoiDang(s.dang, 20);
if (s.them.length) h += `<h3>แข่งพร้อมกันที่บ่ออื่น</h3>${s.them.map(g => khoiDang(g, 10)).join('')}`;
} else {
const n = s.sap[0];
h += `<div class="readout">ขณะนี้ยังไม่มีการแข่งขันที่กำลังดำเนินอยู่${n ? ` การแข่งขันถัดไป: <b>${esc(n.ten || 'ศึกชิงรางวัลรอบชั่วโมง')}</b> ที่${esc(tenHo(n.ho))}, เวลา <b>${gioMay(n.batDau)} น.</b> ${ngayMay(n.batDau)} (<span class="gg-sau" data-t="${n.batDau}">อีก ${khoang(n.batDau - s.t)}</span>)` : ''}</div>`;
}
if (s.sap.length) {
h += `<h3>ตารางแข่งที่กำลังจะมาถึง</h3><div class="gg-lich">${s.sap.slice(0, 3).map(x => `<div class="gg-l"><b class="gg-gio">${gioMay(x.batDau)} น.</b><span class="gg-ngay">${ngayMay(x.batDau)}</span>
        <span class="gg-ten"><b>${esc(x.ten || 'ศึกชิงรางวัลรอบชั่วโมง')}</b> · ${esc(tenHo(x.ho))} · ${kieuTxt(x)} · ${Math.round((x.ketThuc - x.batDau) / PHUT)} นาที</span>
        <span class="gg-sau dim" data-t="${x.batDau}">อีก ${khoang(x.batDau - s.t)}</span></div>`).join('')}</div>
        <p class="dim kl-nho">เวลาที่แสดงอ้างอิงตามนาฬิกาบนเครื่องของคุณ ใครที่กำลังตกออนไลน์ในบ่อที่กำหนดในช่วงเวลาแข่ง ระบบจะนับคะแนนให้อัตโนมัติทุกห้อง</p>`;
}
h += `<h3>เงินรางวัล</h3><div class="readout gg-thuong">${thuongTxt()} <span class="dim">(เงินในเกม) ต้องมีผู้ตกปลาได้อย่างน้อย ${canNguoi()} คนจึงจะแจกรางวัล รับรางวัลได้ที่แท็บนี้ภายใน 7 วัน</span></div>`;
const tr = s.truoc;
if (tr) {
const me = tr.toi, b = bangGiai(tr, T, BB, 10);
let kq = '';
if (me && so(me.hang) > 0 && T) kq = `คุณจบที่ <b>อันดับ ${so(me.hang)}</b>${tr.coThuong && thuong(so(me.hang)) ? ` — รางวัล <b class="price">${tien(thuong(so(me.hang)))}</b>` : ''} `;
h += `<h3>ผลการแข่งขันรอบก่อน</h3><div class="gg-truoc"><div class="gg-dau"><span><b>${esc(tr.ten || 'ศึกชิงรางวัลรอบชั่วโมง')}</b> · ${esc(tenHo(tr.ho))} · ${gioMay(tr.batDau)} น. ${ngayMay(tr.batDau)}${so(tr.soNguoi) ? ` · ${so(tr.soNguoi)} คน` : ''}</span></div>
        <div class="kl-toidong">${kq}${tr.coThuong ? '' : `<span class="dim">รอบนี้มีผู้ตกปลาได้ไม่ถึง ${canNguoi()} คน จึงไม่ได้แจกรางวัล</span>`}</div>${b || '<p class="dim">ไม่มีใครตกปลาได้</p>'}</div>`;
}
return h;
}
let nhipT = 0;
const datChu = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };
function nhip() {
const moKL = CD.dangMo('kyluc'), moGG = CD.dangMo('giaigio');
if (!moKL && !moGG) { clearInterval(nhipT); nhipT = 0; return; }
if (document.hidden) return;
const now = Date.now();
if (moKL) { const e = kl[K.ho], el = $('kl-dem'); if (el && e && e.d) datChu(el, khoang(Math.max(0, so(e.d.tuanHet) - now))); }
if (moGG) {
const s = tinh(), t = gioMC();
document.querySelectorAll('#panel-body .gg-con').forEach(el => datChu(el, mmss(so(el.dataset.t) - t)));
document.querySelectorAll('#panel-body .gg-sau').forEach(el => datChu(el, 'อีก ' + khoang(so(el.dataset.t) - t)));
const ky = s && s.cu ? 5000 : s && s.dang ? 17e3 : PHUT;
if (!GG.dang && now - GG.hoi >= (GG.loi ? Math.max(ky, 20e3) : ky)) taiGiai(false);
const tr = s && s.truoc;
if (tr && tr.coThuong && tr.toi && so(tr.toi.hang) >= 1 && so(tr.toi.hang) <= 10 && !daLinh(tr.id) && !chuaLinh().length) taiPhieu(false);
}
}
const batNhip = () => { if (!nhipT) nhipT = setInterval(() => { try { nhip(); } catch (e) { console.error('[kyluc]', e); } }, 1000); };
let chipLast = '';
function chipChu() {
const s = tinh();
if (!s) return '';
const o = noiCau(), g = s.ca.find(x => x.ho === o) || s.dang;
if (g) {
const con = mmss(g.ketThuc - s.t);
if (o === g.ho) return `⏱ ${g.ten || 'ศึกชิงรางวัล'} · ${g.toi && so(g.toi.hang) > 0 ? 'อันดับ ' + so(g.toi.hang) : 'ยังไม่มีปลา'} · เหลือ ${con}`;
if (s.t - g.batDau < 10 * PHUT) return `⏱ ${g.ten || 'ศึกชิงรางวัล'} กำลังแข่งที่${tenHo(g.ho)} · เหลือ ${con}`;
}
const n = s.sap[0];
if (n && n.batDau - s.t <= 10 * PHUT) return `⏱ ${n.ten || 'ศึกชิงรางวัล'} จะเริ่มในอีก ${khoang(n.batDau - s.t)} — ${o === n.ho ? 'คุณอยู่ถูกบ่อแล้ว' : 'เข้า' + tenHo(n.ho)}`;
const tr = s.truoc, cho = chuaLinh();
if (cho.length) return `🎁 คุณมีรางวัลการแข่งขัน ${cho.length} รายการ — กดเพื่อรับ`;
if (tr && tr.coThuong && tr.toi && so(tr.toi.hang) >= 1 && so(tr.toi.hang) <= 10 && !daLinh(tr.id) && s.t - tr.ketThuc < 7 * NGAY && X.sanSang())
return `🎁 ${tr.ten || 'ศึกชิงรางวัล'}: คุณได้อันดับ ${so(tr.toi.hang)} — กดเพื่อรับรางวัล`;
return '';
}
const hienRa = el => !!el && !el.classList.contains('hidden') && el.offsetParent !== null && !!el.getBoundingClientRect().height;
function chipVe() {
const el = $('kl-chip');
if (!el) return;
const chu = !document.body.classList.contains('fighting') && !UI.isOpen() && batOnline() ? chipChu() : '';
if (!chu) { if (chipLast !== '') { chipLast = ''; el.classList.add('hidden'); } return; }
if (chu !== chipLast) { chipLast = chu; el.textContent = chu; el.classList.remove('hidden'); }
const B = document.body, game = $('game'), on = $('on-hud');
const moc = hienRa(on) ? on : B.classList.contains('xem-on') ? $('xem-bar') : B.classList.contains('dao-on') ? $('dao-hint') : null;
let bot = '', left = '';
if (game && hienRa(moc)) { const gr = game.getBoundingClientRect(), r = moc.getBoundingClientRect(); bot = Math.round(gr.bottom - r.top + 6) + 'px'; if (moc === on) left = Math.round(r.left - gr.left) + 'px'; }
if (el.style.bottom !== bot) el.style.bottom = bot;
if (el.style.left !== left) el.style.left = left;
}
function chipTick() {
if (document.hidden) return;
const now = Date.now();
if (batOnline() && X.co()) {
const s = tinh(), o = noiCau();
if (!GG.dang && now - GG.hoi >= PHUT && (now >= GG.cho || (s && o && s.ca.some(g => g.ho === o)))) taiGiai(true);
if (o) { const e = kl[o]; if (!e || (!e.dang && now - e.hoi > 10 * PHUT)) taiKyLuc(o, true, true); }
}
chipVe();
}
let tinHen = 0;
function nhanTin(m) {
chipVe();
CD.veLai('giaigio');
if (tinHen) return;
const xong = m && m.pha === 'xong';
tinHen = setTimeout(() => {
tinHen = 0;
if (document.hidden || !X.co()) return;
taiGiai(true);
if (xong) setTimeout(() => { const s = tinh(), tr = s && s.truoc; if (tr && tr.coThuong && tr.toi && so(tr.toi.hang) >= 1 && so(tr.toi.hang) <= 10 && !daLinh(tr.id)) taiPhieu(true); }, 4000);
}, Math.max(xong ? 3000 : 1000, 15e3 - (Date.now() - GG.hoi)) + Math.random() * 4000);
}
function xetKyLuc(d) {
if (!d || !d.sp || !(d.w > 0) || (CC.P && CC.P.dd === 2)) return;
const ho = noiCau(), n = ho && nguong[ho], pond = ho && CC.PONDS_BY_ID[ho];
if (!n || !pond || d.w < so(pond.minW)) return;
const cu = so(n[d.sp.id]);
if (d.w <= cu + 0.004) return;
n[d.sp.id] = d.w;
if (kl[ho]) kl[ho].luc = 0;
if (kl.tatca) kl.tatca.luc = 0;
const chu = `🏆 ปลา${tenLoaiNgan(d.sp.id)} ตัวนี้หนัก ${kg(d.w)} อาจติดตารางสถิติ${tenHo(ho)}แล้ว — เปิด 👥 ชุมชน เพื่อดู`;
setTimeout(() => UI.toast(chu, 'good', 8000), 1600);
}
const baseShowCatch = UI.showCatch;
UI.showCatch = function (d) {
try { xetKyLuc(d); } catch (e) {   }
return baseShowCatch.apply(this, arguments);
};
CD.them({
id: 'kyluc', ten: 'สถิติ', bieu: '🏆', thuTu: 20,
ve: veKyLuc,
sau: () => { veCa(); batNhip(); },
mo: () => { taiKyLuc(K.ho, false); hoiToi(); }
});
CD.them({
id: 'giaigio', ten: 'ศึกชิงรางวัล', bieu: '⏱', thuTu: 30,
ve: veGiai,
sau: batNhip,
mo: () => { if (Date.now() - GG.hoi > 12e3) taiGiai(false); taiPhieu(false); hoiToi(); },
so: () => chuaLinh().length
});
const baseAction = UI.onAction;
UI.onAction = function (act, btn) {
if (!act || (act.slice(0, 3) !== 'kl-' && act.slice(0, 3) !== 'gg-')) return baseAction.apply(this, arguments);
const id = (btn && btn.dataset && btn.dataset.id) || '';
switch (act) {
case 'kl-ho': if (HO_ID.indexOf(id) < 0 && id !== 'tatca') return; K.ho = luu.ho = id; ghi(); UI.rerender(); taiKyLuc(id, false); return;
case 'kl-muc': K.muc = luu.muc = id === 'tuan' ? 'tuan' : 'loai'; ghi(); UI.rerender(); { const p = $('panel'); if (p) p.scrollTop = 0; } return;
case 'kl-tai': taiKyLuc(K.ho, false, true); return;
case 'kl-tk': if (UI.PANELS.tk) UI.open('tk'); return;
case 'gg-tai': taiGiai(false); taiPhieu(true); return;
case 'gg-linh': linh(); return;
}
};
const baseHelp = UI.PANELS.help;
if (baseHelp) UI.PANELS.help = function () {
const html = baseHelp.apply(this, arguments);
const sec = `<h3>สถิติและการแข่งขันรอบชั่วโมง</h3>
      <p>• หน้าต่าง <b>👥 ชุมชน</b> → <b>🏆 สถิติ</b>: ปลาตัวใหญ่สุดตลอดกาลของแต่ละชนิดในแต่ละบ่อ รวมถึงตารางน้ำหนักรวมและตัวใหญ่สุดประจำสัปดาห์ของทั้งเซิร์ฟเวอร์ นับเฉพาะปลาที่ตกในห้องออนไลน์ ตารางสัปดาห์รีเซ็ตทุกวันจันทร์เวลา 00:00 น.</p>
      <p>• <b>⏱ ศึกชิงรางวัลรอบชั่วโมง</b> (รอบละ 30 นาที เวลาไทย): ศึกเที่ยงวัน 12:30 น. และศึกค่ำคืน 20:30 น. ทุกวัน ที่บ่อปลานิล, ศึกตะเพียนจีน 21:15 น. วันอังคารและพฤหัสบดี, ศึกปลาไซส์ยักษ์ 20:30 น. วันเสาร์ ที่บ่อปลาเฉาดำ เพียงตกออนไลน์ในบ่อที่กำหนดช่วงเวลาแข่งระบบจะนับคะแนนให้ทันที อันดับ 1–10 มีรางวัล (${tien(2000)} / ${tien(1000)} / ${tien(500)} / ${tien(200)}) รับได้ที่แท็บศึกชิงรางวัลภายใน 7 วัน</p>`;
const at = html.indexOf('<h3>การหาเงิน</h3>');
return at >= 0 ? html.slice(0, at) + sec + html.slice(at) : html + sec;
};
function boot() {
const game = $('game');
if (!game || $('kl-chip')) return;
const b = document.createElement('button');
b.id = 'kl-chip'; b.type = 'button'; b.className = 'hud hidden'; b.title = 'การแข่งขันรอบชั่วโมง: กดเพื่อดูตารางอันดับ กำหนดการ และรางวัล';
game.appendChild(b);
b.addEventListener('click', () => { if (!UI.locked && !UI.isOpen()) CD.mo('giaigio'); });
b.addEventListener('pointerdown', e => e.stopPropagation());
if (CC.Online && Array.isArray(CC.Online.onGiaiGio)) CC.Online.onGiaiGio.push(m => { try { nhanTin(m); } catch (e) {   } });
setInterval(() => { try { chipTick(); } catch (e) { console.error('[kyluc]', e); } }, 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { try { chipVe(); } catch (e) {   } } });
}
K.debug = () => ({ ho: K.ho, muc: K.muc, kl: Object.keys(kl).map(h => ({ ho: h, co: !!kl[h].d, loi: kl[h].loi, luc: kl[h].luc })), nguong, luu,
gg: { co: !!GG.d, loi: GG.loi, lech: GG.lech, hoi: GG.hoi, cho: GG.cho, cam: GG.cam, tinh: tinh() }, phieu: PH.d && PH.d.length, chuaLinh: chuaLinh().length, chip: chipLast });
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
else boot();
})();