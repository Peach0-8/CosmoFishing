(function () {
const Q = CC.QuanTri = {};
if (!CC.UI || !CC.XaHoi) return;
const UI = CC.UI, PN = UI.PANELS, X = CC.XaHoi, esc = X.esc;
const $ = id => document.getElementById(id);
const MA_RE = /^[2-9A-HJ-NP-Z]{6}$/, GIO = 3600e3, GIO_MAX = 8760;
const so = n => Math.round(+n || 0).toLocaleString('th-TH');
const arr = x => (Array.isArray(x) ? x : []);
const obj = x => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
const chu = x => (typeof x === 'string' ? x : '');
const p2 = n => String(n).padStart(2, '0');
const lucNao = t => { const d = new Date(t), n = new Date(); return `${p2(d.getHours())}:${p2(d.getMinutes())} น. วันที่ ${d.getDate()}/${d.getMonth() + 1}${d.getFullYear() !== n.getFullYear() ? '/' + d.getFullYear() : ''}`; };
const conLai = ms => {
const m = Math.max(0, Math.round(ms / 60e3)), h = Math.floor(m / 60);
if (m < 60) return m + ' นาที';
if (h < 48) return `${h} ชั่วโมง${m % 60 ? ' ' + (m % 60) + ' นาที' : ''}`;
return `${Math.floor(h / 24)} วัน${h % 24 ? ' ' + (h % 24) + ' ชั่วโมง' : ''}`;
};
const thoiHan = gio => (gio % 24 === 0 ? gio / 24 + ' วัน' : gio < 48 ? gio + ' ชั่วโมง' : `${Math.floor(gio / 24)} วัน ${gio % 24} ชั่วโมง`);
const ai = (ma, ten) => `<b>${esc(ten || 'ไม่ทราบชื่อ')}</b> <span class="qt-ma">${esc(ma)}</span>`;
const aiTxt = (ma, ten) => `${ten || 'ผู้เล่น'} (${ma})`;
const docMa = s => String(s || '').toUpperCase().replace(/\s+/g, '');
const MA_SAI = 'รหัสผู้เล่นประกอบด้วยตัวอักษรและตัวเลข 6 หลัก (ไม่มีเลข 0, เลข 1, ตัว I, L, O) โดยรหัสจะแสดงอยู่ข้างชื่อในรายการต่างๆ';
const LY = [['gian', '🎣 โกงเกม', 'ตกปลาเร็วหรือจำนวนมากผิดปกติ'], ['ten', '🔤 ชื่อไม่เหมาะสม', 'ชื่อหยาบคาย ดูหมิ่น หรือแอบอ้าง'],
['chat', '💬 แชทไม่เหมาะสม', 'พูดจาหยาบคาย ก่อกวน'], ['khac', '❓ เรื่องอื่นๆ', 'ระบุรายละเอียดในช่องหมายเหตุ']];
const LY_TEN = { gian: 'โกงเกม', ten: 'ชื่อไม่เหมาะสม', chat: 'แชทไม่เหมาะสม', khac: 'เรื่องอื่นๆ' };
const BC_LOI = {
nhieu: 'วันนี้คุณได้รายงานผู้เล่นคนนี้ไปแล้ว หรือใช้สิทธิ์รายงานครบ 5 ครั้งต่อวันแล้ว พรุ่งนี้ค่อยรายงานใหม่ได้',
ve: 'ต้องเข้าสู่ระบบ Google และตั้งชื่อผู้เล่น (ในหน้าต่าง 👤 บัญชี) ก่อนจึงจะส่งรายงานได้',
mang: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วกด ส่งอีกครั้ง — ข้อความที่คุณพิมพ์ไว้ยังอยู่',
sai: 'เซิร์ฟเวอร์ไม่รับรายงานนี้ (รหัสผู้เล่นหรือหมายเหตุไม่ถูกต้อง)',
cam: 'บัญชีของคุณถูกระงับการเล่นออนไลน์ชั่วคราว จึงยังส่งรายงานไม่ได้'
};
let B = null;
Q.baoCao = (ma, ten) => {
ma = docMa(ma);
if (!MA_RE.test(ma)) return false;
const toi = X.toi();
if (toi && toi.ma === ma) { UI.toast('ไม่สามารถรายงานตัวเองได้', 'info'); return false; }
if (UI.locked) return false;
const truoc = UI.isOpen() && UI.current && UI.current !== 'baocao' ? { n: UI.current, d: UI.data } : (B && UI.current === 'baocao' ? B.ve : null);
B = { ma, ten: chu(ten).slice(0, 20), xong: false, gui: false, ve: truoc };
UI.open('baocao');
return true;
};
PN.baocao = () => {
if (!B) return '<h2>🚩 รายงานผู้เล่น</h2><p class="dim">ยังไม่ได้เลือกผู้เล่น</p>';
if (B.xong) return `<h2>🚩 รายงานผู้เล่น</h2>
      <div class="readout qt-kq ok"><span>✅ ส่งรายงานเกี่ยวกับ ${ai(B.ma, B.ten)} เรียบร้อยแล้ว ขอบคุณครับ — ผู้ดูแลเกมจะตรวจสอบและดำเนินการ</span></div>
      <p class="btnrow"><button class="good" data-act="qt-bc-dong">ปิด</button></p>`;
return `<h2>🚩 รายงานผู้เล่น</h2>
      <div class="sub">คุณกำลังรายงาน ${ai(B.ma, B.ten)} ผู้ดูแลเกมจะตรวจสอบและดำเนินการ โดยผู้ถูกรายงานจะไม่ทราบว่าใครเป็นผู้รายงาน</div>
      <h3>สาเหตุใด?</h3>
      <div class="qt-lys">${LY.map(l => `<label class="qt-ly"><input type="radio" name="qt-ly" value="${l[0]}"><span><b>${l[1]}</b><i>${l[2]}</i></span></label>`).join('')}</div>
      <h3>หมายเหตุ <span class="qt-nho">(ไม่บังคับ)</span></h3>
      <textarea id="qt-ghi" maxlength="200" placeholder="เช่น 5 นาทีตกปลาเฉาดำได้ 30 ตัวที่ช่อง 12"></textarea>
      <div class="dim qt-dem"><span id="qt-dem">0</span> / 200 ตัวอักษร</div>
      <div id="qt-bc-loi" class="qt-loi hidden"></div>
      <p class="btnrow"><button class="good" id="qt-bc-gui" data-act="qt-bc-gui">ส่งรายงาน</button><button data-act="qt-bc-dong">ยกเลิก</button></p>
      <p class="dim qt-nho">รายงานได้สูงสุดวันละ 5 ครั้ง และคนละ 1 ครั้งต่อวัน กรุณารายงานเฉพาะเมื่อพบปัญหาจริงเท่านั้น</p>`;
};
UI.afterOpen.baocao = () => {
const ta = $('qt-ghi'), dem = $('qt-dem');
if (ta && dem) ta.addEventListener('input', () => { dem.textContent = ta.value.length; });
document.querySelectorAll('#panel-body input[name="qt-ly"]').forEach(r => r.addEventListener('change', () => bcLoi('')));
};
function bcLoi(msg) { const el = $('qt-bc-loi'); if (el) { el.textContent = msg ? '⚠ ' + msg : ''; el.classList.toggle('hidden', !msg); } }
function bcDong() {
const v = B && B.ve;
B = null;
if (v && v.n && PN[v.n]) UI.open(v.n, v.d); else UI.close();
}
async function bcGui() {
const b = B;
if (!b || b.gui || b.xong) return;
const r0 = document.querySelector('#panel-body input[name="qt-ly"]:checked'), ta = $('qt-ghi');
const ly = r0 ? r0.value : '', ghi = (ta ? ta.value : '').trim().slice(0, 200);
if (!LY_TEN[ly]) return bcLoi('กรุณาเลือกสาเหตุด้านบนก่อน');
if (ly === 'khac' && !ghi) return bcLoi('หากเลือก “เรื่องอื่นๆ” กรุณาเขียนรายละเอียดสั้นๆ ให้ผู้ดูแลทราบ');
bcLoi('');
b.gui = true;
const nut = $('qt-bc-gui');
if (nut) { nut.disabled = true; nut.textContent = 'กำลังส่ง…'; }
const g = { ma: b.ma, ly };
if (ghi) g.ghi = ghi;
const r = await X.goi('/baocao', { ve: true, gui: g });
b.gui = false;
if (B !== b || UI.current !== 'baocao') { if (r && r.ok) UI.toast('✅ ส่งรายงานแล้ว', 'good'); return; }
if (r && r.ok) { b.xong = true; UI.rerender(); return; }
const n2 = $('qt-bc-gui');
if (n2) { n2.disabled = false; n2.textContent = 'ส่งอีกครั้ง'; }
bcLoi(r && r.why === 'cam' && +r.den > Date.now() ? `บัญชีของคุณถูกระงับการเล่นออนไลน์ชั่วคราวจนถึง ${lucNao(+r.den)}${chu(r.lyDo) ? ', เหตุผล: ' + chu(r.lyDo) : ''} — ยังส่งรายงานไม่ได้` : BC_LOI[r && r.why] || X.loi(r && r.why));
}
const nutBaoCao = p => {
if (!p || !MA_RE.test(chu(p.ma))) return '';
const toi = X.toi();
if (toi && toi.ma === p.ma) return '';
return `<button data-act="qt-baocao" data-ma="${esc(p.ma)}" data-ten="${esc(chu(p.ten))}">🚩 รายงาน</button>`;
};
function ganNut() { const O = CC.Online; if (O && Array.isArray(O.nutNguoi) && O.nutNguoi.indexOf(nutBaoCao) < 0) O.nutNguoi.push(nutBaoCao); }
ganNut();
window.addEventListener('DOMContentLoaded', ganNut);
const A = Q.A = { chu: null, ma: '', dangHoi: false, hoiLuc: 0, dl: null, luc: 0, tai: false, loi: '', muc: 'tq', cot: 'mo', tam: 14, ngay: -1, them: {}, xn: null, kq: null, lam: false, hoi: null, hoiLoi: '', hoiTai: false, cuLoi: '' };
const KHO = 'cauca_qt_chu';
const veLai = () => { if (CC.CongDong) CC.CongDong.veLai('quantri'); };
const nho = (ma, co) => { try { sessionStorage.setItem(KHO, ma + ':' + (co ? 1 : 0)); } catch (e) {   } };
const daNho = ma => { try { const s = sessionStorage.getItem(KHO) || ''; return s.slice(0, 7) === ma + ':' ? s.slice(7) === '1' : null; } catch (e) { return null; } };
function hoiQuyen() {
if (!X.co()) return;
const toi = X.toi();
if (!toi) return;
if (toi.ma !== A.ma) { A.ma = toi.ma; A.chu = daNho(toi.ma); A.dl = null; A.xn = null; A.kq = null; }
if (A.chu !== null || A.dangHoi || Date.now() - A.hoiLuc < 60e3) return;
A.dangHoi = true; A.hoiLuc = Date.now();
const ma = toi.ma;
const xong = co => {
A.chu = co; nho(ma, co);
if (co && CC.CongDong) { CC.CongDong.veLai(); if (!A.dl) tai(false); }
};
X.goi('/toi', { ve: true }).then(r => {
if (A.ma !== ma) { A.dangHoi = false; return; }
if (r && r.ok && typeof r.chu === 'boolean') { A.dangHoi = false; xong(r.chu); return; }
if (r && (r.why === 'mang' || r.why === 'tat' || r.why === 've' || r.why === 'nhieu')) { A.dangHoi = false; return; }
return X.goi('/quantri', { ve: true }).then(q => {
A.dangHoi = false;
if (A.ma !== ma) return;
if (q && q.ok) { nhan(q); xong(true); }
else if (q && q.why === 'quyen') xong(false);
});
});
}
function nhan(r) { A.dl = r; A.luc = Date.now(); A.loi = ''; }
async function tai(ep) {
if (A.tai || A.chu !== true) return;
if (!ep && A.dl && Date.now() - A.luc < 25e3) return;
A.tai = true;
if (!A.dl) { A.loi = ''; veLai(); }
const ma = A.ma, r = await X.goi('/quantri', { ve: true });
A.tai = false;
if (A.ma !== ma) return;
if (r && r.ok) nhan(r);
else if (r && r.why === 'quyen') { A.chu = false; nho(ma, false); A.dl = null; if (CC.CongDong) CC.CongDong.veLai(); return; }
else A.loi = X.loi(r && r.why);
veLai();
}
const LOAI = {
nhanh: ['อัดปลาเร็วเกินไป', 'เอาปลาขึ้นเร็วกว่าคนจริงทำได้ หรือได้ปลาสองตัวติดกันถี่เกินไป'],
tran: ['เกินเพดานจำนวนปลา', 'ส่งจำนวนปลามากกว่าที่ผู้เล่นมือโปรจะทำได้ในช่วงเวลาเดียวกัน'],
chon: ['เลือกเฉพาะปลาใหญ่', 'มักทิ้งปลาเล็ก รับเฉพาะปลาตัวใหญ่ที่เซิร์ฟเวอร์จ่ายให้'],
la: ['ปลาแปลกปลอม', 'ส่งปลาที่ไม่ใช่ปลาที่เซิร์ฟเวอร์สุ่มให้'],
cu: ['เกมเวอร์ชันเก่า', 'เครื่องผู้เล่นยังใช้เกมเวอร์ชันเก่าอยู่ — มักไม่ใช่การโกง รีเฟรชหน้าเว็บก็หาย']
};
const LOAI_KHAC = { som: 'nhanh', nhieu: 'tran', id: 'la' };
const loaiCua = l => {
const o = {};
for (const k in obj(l)) { const n = Math.round(+l[k]) || 0; if (n > 0) { const kk = LOAI_KHAC[k] || k; o[kk] = (o[kk] || 0) + n; } }
return o;
};
const tongLoai = (o, boCu) => Object.keys(o).reduce((s, k) => s + (boCu && k === 'cu' ? 0 : o[k]), 0);
const loaiTxt = o => Object.keys(o).sort((a, b) => o[b] - o[a]).map(k => `${esc(LOAI[k] ? LOAI[k][0] : k)} <b>${so(o[k])}</b>`).join(' · ');
const tenCua = ma => {
const d = obj(A.dl);
for (const ds of [d.cam, d.nghi, d.baoCao]) for (const x of arr(ds)) if (x && x.ma === ma && chu(x.ten)) return x.ten;
return '';
};
const camCua = ma => arr(obj(A.dl).cam).find(c => c && c.ma === ma && +c.den > Date.now()) || null;
function nhomBaoCao(ds) {
const m = {}, out = [];
for (const b of arr(ds)) {
if (!b || !MA_RE.test(chu(b.ma))) continue;
let g = m[b.ma];
if (!g) { g = m[b.ma] = { ma: b.ma, ten: chu(b.ten), ds: [], ly: {}, luc: 0, soLan: 0 }; out.push(g); }
g.ds.push(b);
const ly = LY_TEN[b.ly] ? b.ly : 'khac';
g.ly[ly] = (g.ly[ly] || 0) + 1;
g.luc = Math.max(g.luc, +b.luc || 0);
g.soLan = Math.max(g.soLan, +b.soLan || 0, g.ds.length);
if (!g.ten) g.ten = chu(b.ten);
}
return out.sort((a, b) => b.soLan - a.soLan || b.luc - a.luc);
}
const hon = (m, n) => `<p><button data-act="qt-them" data-m="${m}">ดูเพิ่มเติม (${so(n)} รายการ)</button></p>`;
const trang = m => 12 + (A.them[m] || 0);
const COT = { mo: ['เปิดเกม', 'คนเปิดเกม'], dd: ['เช็คอิน', 'คนเช็คอิน'], dinh: ['ออนไลน์สูงสุด', 'คนพร้อมกัน'],
nguoiKhac: ['ผู้เล่นออนไลน์', 'ผู้เล่นออนไลน์ไม่ซ้ำหน้า'], ca: ['ปลาออนไลน์', 'ตัว'] };
const TAM = [14, 30, 90];
function gopNgay(d) {
const m = new Map();
for (const x of arr(obj(d.mo).ngay)) if (x && docNgay(x.ngay)) m.set(x.ngay, Object.assign({}, x));
for (const x of arr(d.ngay)) if (x && docNgay(x.ngay)) m.set(x.ngay, Object.assign(m.get(x.ngay) || {}, x));
return [...m.values()].sort((a, b) => (a.ngay < b.ngay ? -1 : 1));
}
const gon = n => (n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : so(n));
const THU = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
const docNgay = s => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(chu(s)); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
function tongQuan(d) {
const nay = obj(d.nay), hn = obj(d.homNay), th = obj(nay.theoHo);
const o = (v, t) => `<div><b>${v}</b><span>${t}</span></div>`;
const ho = Object.keys(th).sort((a, b) => th[b] - th[a]).map(id => `${esc(CC.PONDS_BY_ID && CC.PONDS_BY_ID[id] ? CC.PONDS_BY_ID[id].name : id)} <b>${so(th[id])}</b>`).join(' · ');
const tam = TAM.includes(A.tam) ? A.tam : 14, ng = gopNgay(d).slice(-tam), mo = obj(d.mo), coMo = d.mo != null;
let bd = '<p class="dim">ยังไม่มีข้อมูลรายวัน</p>';
if (ng.length) {
const k = COT[A.cot] ? A.cot : 'mo', max = Math.max(1, ...ng.map(x => +x[k] || 0));
const chon = A.ngay >= 0 && A.ngay < ng.length ? A.ngay : ng.length - 1, iMax = ng.reduce((bi, x, i) => ((+x[k] || 0) > (+ng[bi][k] || 0) ? i : bi), 0);
const c = ng[chon], cd = docNgay(c.ngay);
const ctNgay = x => {
const p = [];
if (x.mo != null) p.push(`<b>${so(x.mo)}</b> คนเปิดเกม${x.tk ? ` (${so(x.tk)} เข้าสู่ระบบแล้ว)` : ''}`, `<b>${so(x.dd)}</b> เช็คอิน`);
if (x.tuan != null) p.push(`<b>${so(x.tuan)}</b> คนไม่ซ้ำใน 7 วันถึงวันนั้น, <b>${so(x.thang)}</b> ใน 30 วัน`);
if (x.dinh != null) p.push(`ออนไลน์สูงสุด <b>${so(x.dinh)}</b> คนพร้อมกัน, <b>${so(x.nguoiKhac)}</b> คนไม่ซ้ำ, <b>${so(x.ca)}</b> ตัว`);
return p.length ? p.join(' · ') : '<span class="dim">ไม่มีข้อมูล</span>';
};
bd = `<div class="btnrow qt-cot">${Object.keys(COT).map(x => `<button data-act="qt-cot" data-c="${x}" class="${x === k ? 'on' : ''}">${COT[x][0]}</button>`).join('')}</div>
        <div class="btnrow qt-cot">${TAM.map(n => `<button data-act="qt-tam" data-n="${n}" class="${n === tam ? 'on' : ''}">${n} วัน</button>`).join('')}</div>
        <div class="qt-bd${tam > 30 ? ' qt-day' : ''}" role="img" aria-label="กราฟ ${tam} วัน: ${COT[k][0]}">${ng.map((x, i) => {
const v = +x[k] || 0, dn = docNgay(x.ngay), nhan = i === chon || i === iMax;
return `<button class="qt-c${i === chon ? ' on' : ''}" data-act="qt-ngay" data-i="${i}" title="${THU[dn.getDay()]} ${dn.getDate()}/${dn.getMonth() + 1}: ${so(v)} ${COT[k][1]}">
            <span class="qt-cv">${nhan ? gon(v) : ''}</span><i style="height:${Math.max(2, Math.round(v / max * 100))}%"></i>
            <span class="qt-cn">${tam > 30 ? (dn.getDate() === 1 ? dn.getDate() + '/' + (dn.getMonth() + 1) : '') : dn.getDay() === 0 ? 'อา.' : dn.getDate()}</span></button>`;
}).join('')}</div>
        <div class="qt-bdct"><b>${THU[cd.getDay()]} ${cd.getDate()}/${cd.getMonth() + 1}${chon === ng.length - 1 ? ' (วันนี้ ยังไม่จบวัน)' : ''}:</b>
          ${ctNgay(c)} <span class="dim">กดที่แท่งกราฟเพื่อดูข้อมูลวันนั้น</span></div>`;
}
const nguoiChoi = coMo
? `<h3>ผู้เล่น (รวมผู้เล่นคนเดียว)</h3>
        <div class="qt-so">${o(so(mo.mo), 'เปิดเกมวันนี้')}${o(so(mo.dd), 'เช็คอินวันนี้')}${o(so(mo.tk), 'เข้าสู่ระบบแล้ว')}
          ${o(so(mo.tuan), 'ไม่ซ้ำหน้าใน 7 วัน')}${o(so(mo.thang), 'ไม่ซ้ำหน้าใน 30 วัน')}</div>
        <p class="dim small">นับเมื่อเปิดเกม (วันละครั้งต่อคน): หากเข้าสู่ระบบจะนับตามรหัสผู้เล่น หากไม่เข้าสู่ระบบจะนับตามเครื่อง — ผู้เล่นที่ไม่เข้าสู่ระบบและใช้ 2 เครื่องจะถูกนับ 2 ครั้ง วันที่คำนวณตามเวลาไทย (UTC+7)</p>`
: '<p class="dim">เซิร์ฟเวอร์ยังไม่มีสถิติผู้เปิดเกม (ต้องอัปเดตเซิร์ฟเวอร์ออนไลน์เวอร์ชันใหม่)</p>';
return `${nguoiChoi}
      <h3>เล่นออนไลน์</h3>
      <div class="qt-so">${o(so(nay.nguoi), 'กำลังเล่นออนไลน์')}${o(so(nay.phong), 'ห้องที่เปิดอยู่')}${o(so(hn.dinh), 'ออนไลน์สูงสุดวันนี้')}
        ${o(so(hn.nguoiKhac), 'ผู้เล่นออนไลน์วันนี้')}${o(so(hn.ca), 'ปลาออนไลน์วันนี้')}${o(so(hn.kg) + ' กก.', 'น้ำหนักปลาออนไลน์วันนี้')}</div>
      <p>${ho ? 'กำลังเล่นแยกตามบ่อ: ' + ho : '<span class="dim">ขณะนี้ยังไม่มีผู้เล่นออนไลน์</span>'}
        <span class="dim">ทั้งเซิร์ฟเวอร์มี ${so(obj(d.hoi).so)} ชมรม และ ${so(obj(d.kyLuc).so)} สถิติที่ถูกบันทึกอยู่</span></p>
      <h3>รายวัน</h3>${bd}
      <p class="dim small">ข้อมูล "เปิดเกม" และ "เช็คอิน" เก็บย้อนหลัง 90 วัน; ข้อมูลเล่นออนไลน์เก็บย้อนหลัง 14 วัน</p>`;
}
function nghiGian(d) {
const ds = arr(d.nghi).filter(x => x && MA_RE.test(chu(x.ma))).map(x => { const l = loaiCua(x.loai); return { x, l, tong: tongLoai(l), nang: tongLoai(l, true) }; })
.filter(r => r.tong > 0).sort((a, b) => b.nang - a.nang || b.tong - a.tong);
const giai = `<details class="qt-giai"><summary>วิธีอ่านรายการนี้</summary>
      <p>ปลาทุกตัวที่ผู้เล่นส่งขึ้นเซิร์ฟเวอร์จะถูกตรวจสอบ ตัวที่ไม่สมเหตุสมผลจะ<b>ถูกคัดออก</b>: ไม่นับเข้าสถิติ รางวัล หรือคะแนนชมรม นี่คือ 30 อันดับผู้ถูกคัดออกมากที่สุดใน 24 ชั่วโมงที่ผ่านมา</p>
      <p>${Object.keys(LOAI).map(k => `• <b>${LOAI[k][0]}</b>: ${LOAI[k][1]}`).join('<br>')}</p>
      <p>ถูกคัดออกไม่กี่ตัวถือเป็นเรื่องปกติ (เน็ตช้า กดรีบ) ที่น่าสงสัยคือถูกคัดออก<b>หลายสิบตัว</b> โดยเฉพาะ “อัดปลาเร็วเกินไป” และ “ปลาแปลกปลอม” — แถวเหล่านั้นจะมีเครื่องหมาย ⚠ (ตั้งแต่ 20 ตัวขึ้นไป ไม่นับเวอร์ชันเก่า)
        หากจับได้ว่าโกงควร<b>แบน</b>และ<b>ลบสถิติ</b>ของผู้เล่นนั้น</p></details>`;
if (!ds.length) return giai + '<p class="dim">24 ชั่วโมงที่ผ่านมาไม่มีใครถูกคัดออกปลา ปกติดี</p>';
const n = trang('ng');
return giai + ds.slice(0, n).map(r => {
const x = r.x, c = camCua(x.ma);
return `<div class="qt-dong${r.nang >= 20 ? ' nang' : ''}">
        <div class="qt-ai">${r.nang >= 20 ? '⚠ ' : ''}${ai(x.ma, chu(x.ten))}${c ? ` <span class="qt-the">ถูกแบนอยู่ เหลือ ${conLai(c.den - Date.now())}</span>` : ''}</div>
        <div class="qt-ct">ถูกคัดออก <b>${so(r.tong)}</b> ตัว: ${loaiTxt(r.l)} <span class="dim">ตั้งแต่ถูกคัดออกครั้งแรกวันนี้ยังนับได้ ${so(x.ca)} ตัว${+x.luc ? ' · ล่าสุด ' + esc(X.luc(+x.luc)) : ''}</span></div>
        <div class="btnrow"><button data-act="qt-cam" data-ma="${esc(x.ma)}" data-ly="โกงเกม: ตกปลาผิดปกติ">⛔ แบน…</button><button data-act="qt-xkl" data-ma="${esc(x.ma)}">🗑 ลบสถิติ</button></div>
      </div>`;
}).join('') + (ds.length > n ? hon('ng', ds.length - n) : '');
}
function baoCaoHtml(d) {
const gs = nhomBaoCao(d.baoCao);
if (!gs.length) return '<p class="dim">ไม่มีรายงานที่รอตรวจสอบ ปกติดี</p>';
const n = trang('bc');
const dong = b => `<li>${chu(b.ghi) ? `“${esc(b.ghi)}”` : '<span class="dim">(ไม่มีหมายเหตุ)</span>'}
      <span class="dim">— ${esc(LY_TEN[b.ly] || 'เรื่องอื่นๆ')} · ${esc(chu(obj(b.tu).ten) || 'ไม่ระบุชื่อ')} รายงาน ${esc(X.luc(+b.luc))}</span></li>`;
return `<p class="dim qt-nho">รวมตามผู้ถูกรายงาน คนที่ถูกรายงานมากที่สุดจะอยู่ด้านบน “จัดการแล้ว” เป็นการเก็บรายงานออกจากคิวโดยไม่ลงโทษใคร</p>` + gs.slice(0, n).map(g => {
const ly = Object.keys(g.ly).sort((a, b) => g.ly[b] - g.ly[a]), lyChinh = LY_TEN[ly[0]] || 'ละเมิดกฎ', c = camCua(g.ma);
const lyCam = lyChinh + ` (ถูกรายงาน ${g.soLan} ครั้ง)`;
const nut = (gio, ten) => `<button data-act="qt-cam" data-ma="${esc(g.ma)}" data-gio="${gio}" data-ly="${esc(lyCam)}">${ten}</button>`;
return `<div class="qt-dong${g.soLan >= 5 ? ' nang' : ''}">
        <div class="qt-ai">${ai(g.ma, g.ten)} · <b>${so(g.soLan)}</b> ครั้งที่ถูกรายงาน${c ? ` <span class="qt-the">ถูกแบนอยู่ เหลือ ${conLai(c.den - Date.now())}</span>` : ''}</div>
        <div class="qt-ct">สาเหตุ: ${ly.map(k => `${esc(LY_TEN[k])} <b>${g.ly[k]}</b>`).join(' · ')} <span class="dim">· ล่าสุด ${esc(X.luc(g.luc))}</span></div>
        <ul class="qt-ghi">${g.ds.slice(0, 2).map(dong).join('')}</ul>
        ${g.ds.length > 2 ? `<details class="qt-nua"><summary>ดูอีก ${g.ds.length - 2} รายงาน</summary><ul class="qt-ghi">${g.ds.slice(2).map(dong).join('')}</ul></details>` : ''}
        <div class="btnrow">${nut(24, '⛔ แบน 24 ชม.')}${nut(168, '7 วัน')}${nut(720, '30 วัน')}${nut('tuy', 'กำหนดเอง…')}
          <button data-act="qt-xkl" data-ma="${esc(g.ma)}">🗑 ลบสถิติ</button><button data-act="qt-xong" data-ma="${esc(g.ma)}">✔ จัดการแล้ว</button></div>
      </div>`;
}).join('') + (gs.length > n ? hon('bc', gs.length - n) : '');
}
function dangCam(d) {
const ds = arr(d.cam).filter(c => c && MA_RE.test(chu(c.ma)) && +c.den > Date.now()).sort((a, b) => a.den - b.den);
if (!ds.length) return '<p class="dim">ไม่มีผู้เล่นที่ถูกแบนอยู่</p><p class="dim qt-nho">หากต้องการแบนผู้เล่น: ใช้แท็บ “น่าสงสัย”, “รายงาน”, หรือกรอกรหัสที่แท็บ “เครื่องมือ”</p>';
const n = trang('cam');
return '<p class="dim qt-nho">ผู้ถูกแบนจะเข้าห้องออนไลน์ไม่ได้ ปลาไม่นับเข้าสถิติ รางวัล หรือคะแนนชมรม แต่ยังเล่นคนเดียวได้ตามปกติ เมื่อครบกำหนดจะปลดแบนอัตโนมัติ</p>' +
ds.slice(0, n).map(c => `<div class="qt-dong">
        <div class="qt-ai">${ai(c.ma, chu(c.ten))} · เหลือ <b>${conLai(c.den - Date.now())}</b> <span class="dim">(ถึง ${lucNao(+c.den)})</span></div>
        <div class="qt-ct">เหตุผล: ${chu(c.ly) ? esc(c.ly) : '<span class="dim">ไม่ระบุ</span>'}${+c.luc ? ` <span class="dim">· แบนเมื่อ ${esc(X.luc(+c.luc))}</span>` : ''}</div>
        <div class="btnrow"><button data-act="qt-bocam" data-ma="${esc(c.ma)}">🔓 ปลดแบน</button><button data-act="qt-cam" data-ma="${esc(c.ma)}" data-gio="tuy" data-ly="${esc(chu(c.ly))}">เปลี่ยนระยะเวลา…</button></div>
      </div>`).join('') + (ds.length > n ? hon('cam', ds.length - n) : '');
}
function congCu() {
const hoi = A.hoi
? (A.hoi.length ? A.hoi.map(h => `<div class="qt-dong gon"><div class="qt-ai"><b>${esc(h.ten)}</b> <span class="qt-ma">[${esc(h.the)}]</span> <span class="dim">· ${so(h.so)} คน · สัปดาห์นี้ ${esc(X.kg(+h.kg || 0))}</span></div>
          <div class="btnrow"><button data-act="qt-xhoi" data-id="${esc(h.id)}">🗑 ลบชมรม</button></div></div>`).join('') : '<p class="dim">ยังไม่มีชมรมในตารางอันดับสัปดาห์นี้</p>')
: '';
return `<div id="qt-cu-loi" class="qt-loi${A.cuLoi ? '' : ' hidden'}">${A.cuLoi ? '⚠ ' + esc(A.cuLoi) : ''}</div>
      <h3>แบนหรือลบสถิติด้วยรหัสผู้เล่น</h3>
      <p class="dim qt-nho">ใช้เมื่อผู้เล่นไม่อยู่ในรายการข้างต้น รหัสผู้เล่นคือตัวอักษรและตัวเลข 6 หลักข้างชื่อ (เช่น <span class="qt-ma">AAAA22</span>)</p>
      <div class="qt-hang"><input type="text" id="qt-ma-in" maxlength="8" placeholder="รหัส 6 หลัก" autocomplete="off" autocapitalize="characters" spellcheck="false">
        <button data-act="qt-ma-cam">⛔ แบน…</button><button data-act="qt-ma-xkl">🗑 ลบสถิติ…</button><button data-act="qt-ma-bocam">🔓 ปลดแบน…</button></div>
      <h3>ลบชมรม</h3>
      <p class="dim qt-nho">ใช้เมื่อชื่อชมรมหยาบคายหรือไม่เหมาะสม เมื่อลบแล้วสมาชิกทุกคนจะกลับเป็นไม่มีชมรมและไม่สามารถกู้คืนได้</p>
      <div class="btnrow"><button data-act="qt-hoi-tai">${A.hoiTai ? 'กำลังโหลด…' : A.hoi ? '⟳ โหลดรายชื่อชมรมใหม่' : '📋 ดู 20 ชมรมอันดับต้นสัปดาห์นี้'}</button></div>
      ${A.hoiLoi ? `<div class="qt-loi">⚠ ${esc(A.hoiLoi)}</div>` : ''}${hoi}
      <p class="dim qt-nho">ชมรมที่ไม่อยู่ในรายการด้านบน: กรอกรหัสชมรม (แสดงอยู่ท้ายหน้าชมรมในแท็บ 🎏 ชมรม) แล้วกด ค้นหา</p>
      <div class="qt-hang"><input type="text" id="qt-hoi-in" maxlength="40" placeholder="รหัสชมรม" autocomplete="off" spellcheck="false"><button data-act="qt-hoi-tim">ค้นหาชมรม…</button></div>`;
}
const GIO_NHANH = [[24, '24 ชั่วโมง'], [168, '7 วัน'], [720, '30 วัน']];
function gioDangChon() {
const x = A.xn;
if (!x) return 0;
if (!x.tuy) return x.gio;
const s = $('qt-so'), dv = $('qt-dv');
const n = s ? +String(s.value).trim().replace(',', '.') : x.soTuy, k = dv ? +dv.value : x.dvTuy;
const gio = Math.round(n * k);
return isFinite(gio) && gio >= 1 && gio <= GIO_MAX && n * k === gio ? gio : 0;
}
function noiCam(gio) {
const x = A.xn, c = camCua(x.ma);
if (!gio) return `<span class="qt-loi">ระยะเวลาแบนต้องอยู่ระหว่าง 1 ชั่วโมง ถึง 365 วัน โดยระบุเป็นจำนวนเต็ม</span>`;
return `${esc(x.ten || 'ผู้เล่นนี้')} จะถูกนำออกจากห้องภายใน 30 วินาที และ<b>ไม่สามารถเล่นออนไลน์ได้จนถึง ${lucNao(Date.now() + gio * GIO)}</b> (${thoiHan(gio)})
      ระหว่างถูกแบน ปลาที่ตกได้จะไม่นับเข้าสถิติ รางวัล หรือคะแนนชมรม แต่<b>ยังเล่นคนเดียวได้ตามปกติ</b>และจะเห็นเหตุผลที่คุณระบุไว้
      ${c ? `<br>ผู้เล่นนี้ถูกแบนอยู่แล้วจนถึง ${lucNao(+c.den)} คำสั่งใหม่จะแทนที่คำสั่งเดิม` : ''}<br><span class="dim">หากเปลี่ยนใจสามารถปลดแบนได้ทุกเมื่อที่แท็บ “ถูกแบนอยู่”</span>`;
}
function xacNhan() {
const x = A.xn, ten = ai(x.ma || '', x.ten);
const duoi = (nut, nguy) => `<div id="qt-xn-loi" class="qt-loi${x.loi ? '' : ' hidden'}">${x.loi ? '⚠ ' + esc(x.loi) : ''}</div>
      <p class="btnrow"><button class="${nguy ? 'warn' : 'good'}" id="qt-lam" data-act="qt-lam"${A.lam ? ' disabled' : ''}>${A.lam ? 'กำลังดำเนินการ…' : nut}</button><button data-act="qt-thoi"${A.lam ? ' disabled' : ''}>ยกเลิก ไม่ทำ</button></p>`;
if (x.kieu === 'cam') {
const g = x.tuy ? 0 : x.gio;
return `<h3>⛔ แบนการเล่นออนไลน์</h3><p>ผู้ที่จะถูกแบน: ${ten}</p>
        <div class="qt-nhan">แบนนานเท่าไร?</div>
        <div class="btnrow qt-gio">${GIO_NHANH.map(k => `<button data-act="qt-gio" data-g="${k[0]}" class="${g === k[0] ? 'on' : ''}">${k[1]}</button>`).join('')}<button data-act="qt-gio" data-g="tuy" class="${x.tuy ? 'on' : ''}">กำหนดเอง</button></div>
        ${x.tuy ? `<div class="qt-hang qt-tuy"><input type="text" id="qt-so" inputmode="numeric" maxlength="4" value="${esc(x.soTuy)}" autocomplete="off">
          <select id="qt-dv"><option value="1"${x.dvTuy === 1 ? ' selected' : ''}>ชั่วโมง</option><option value="24"${x.dvTuy === 24 ? ' selected' : ''}>วัน</option></select></div>` : ''}
        <div class="qt-nhan">เหตุผล <span class="qt-nho">(ผู้ถูกแบนจะเห็นข้อความนี้)</span></div>
        <input type="text" id="qt-ly" maxlength="80" value="${esc(x.ly)}" placeholder="เช่น โกงเกม ตกปลาเร็วผิดปกติ" autocomplete="off">
        <div class="readout qt-noi" id="qt-noi">${noiCam(x.tuy ? Math.round(x.soTuy * x.dvTuy) || 0 : x.gio)}</div>${duoi('⛔ แบนผู้เล่นนี้', true)}`;
}
if (x.kieu === 'bocam') return `<h3>🔓 ปลดแบน</h3><p>ปลดแบนให้: ${ten}</p>
      <div class="readout qt-noi">ผู้เล่นนี้<b>จะกลับมาเล่นออนไลน์ได้ทันที</b> ปลาที่ตกได้นับจากนี้จะนับเข้าสถิติ รางวัล และคะแนนชมรมตามปกติ สถิติที่เคยถูกลบไป (ถ้ามี) จะไม่กลับคืนมา</div>${duoi('🔓 ปลดแบน')}`;
if (x.kieu === 'xkl') return `<h3>🗑 ลบสถิติของผู้เล่น</h3><p>ลบสถิติของ: ${ten}</p>
      <div class="readout qt-noi">สถิติทั้งหมดและคะแนนประจำสัปดาห์ของผู้เล่นนี้<b>จะถูกลบออกจากตารางอันดับทั้งหมด</b> และ<b>ไม่สามารถกู้คืนได้</b> การลบนี้ไม่ได้แบนผู้เล่น:
        ปลาที่ตกหลังจากนี้จะเริ่มนับใหม่ หากพบการโกงควรแบนก่อนแล้วค่อยลบสถิติ</div>${duoi('🗑 ลบสถิติ', true)}`;
if (x.kieu === 'xhoi') return `<h3>🗑 ลบชมรม</h3><p>ชมรมที่จะลบ: <b>${esc(x.ten)}</b> ${x.the ? `<span class="qt-ma">[${esc(x.the)}]</span>` : ''}${x.so ? ` <span class="dim">· ${so(x.so)} สมาชิก</span>` : ''}</p>
      <div class="readout qt-noi">ชมรมนี้จะ<b>ถูกลบถาวร</b>: สมาชิกทุกคนจะกลายเป็นไม่มีชมรม คะแนนสัปดาห์ของชมรมจะหายไป และ<b>ไม่สามารถกู้คืนได้</b> สมาชิกไม่ถูกแบนและสามารถตั้งหรือเข้าชมรมใหม่ได้ทันที</div>${duoi('🗑 ลบชมรมนี้', true)}`;
if (x.kieu === 'xong') return `<h3>✔ จัดการรายงานแล้ว</h3><p>เก็บรายงาน <b>${x.ids.length}</b> ฉบับเกี่ยวกับ: ${ten}</p>
      <div class="readout qt-noi">รายงานเหล่านี้จะ<b>ถูกนำออกจากคิว</b> ผู้ถูกรายงานไม่ถูกลงโทษ และผู้รายงานจะไม่ได้รับการแจ้งเตือน หากมีรายงานใหม่เข้ามาจะแสดงขึ้นอีกครั้ง</div>${duoi('✔ เก็บรายงานเหล่านี้')}`;
return '';
}
function moXn(x) {
A.xn = Object.assign({ loi: '' }, x); A.kq = null; A.cuLoi = '';
veLai();
const p = $('panel'); if (p) p.scrollTop = 0;
}
function moCam(ma, gio, ly) {
const toi = X.toi();
if (toi && toi.ma === ma) { A.kq = { ok: false, msg: 'ไม่สามารถแบนตัวเองได้' }; veLai(); return; }
const tuy = gio === 'tuy', g = tuy ? 72 : (GIO_NHANH.some(k => k[0] === +gio) ? +gio : 24);
moXn({ kieu: 'cam', ma, ten: tenCua(ma), gio: g, tuy, soTuy: 3, dvTuy: 24, ly: chu(ly).slice(0, 80) });
}
function giuO() {
const x = A.xn;
if (!x || x.kieu !== 'cam') return;
const ly = $('qt-ly'), s = $('qt-so'), dv = $('qt-dv');
if (ly) x.ly = ly.value.slice(0, 80);
if (s) x.soTuy = s.value.trim().slice(0, 4);
if (dv) x.dvTuy = +dv.value === 1 ? 1 : 24;
}
const LOI_LENH = {
cam: { sai: 'เซิร์ฟเวอร์ไม่รับคำสั่งแบนนี้: รหัสผู้เล่นผิด ระยะเวลาไม่อยู่ในช่วง 1 ชม. – 365 วัน เหตุผลยาวเกินไป หรือกำลังแบนตัวเอง' },
bocam: { sai: 'เซิร์ฟเวอร์ไม่รับคำสั่งปลดแบนนี้ (รหัสผู้เล่นไม่ถูกต้อง)', 'khong-co': 'ผู้เล่นนี้ไม่ได้ถูกแบนอยู่แล้ว' },
xkl: { sai: 'เซิร์ฟเวอร์ไม่รับคำสั่งนี้ (รหัสผู้เล่นไม่ถูกต้อง)', 'khong-co': 'ผู้เล่นนี้ไม่มีสถิติให้ลบ' },
xhoi: { 'khong-co': 'ไม่พบชมรมนี้ — อาจถูกลบหรือยุบไปแล้ว', sai: 'รหัสชมรมไม่ถูกต้อง' },
xong: { 'khong-co': 'รายงานนี้ถูกจัดเก็บไปแล้วก่อนหน้านี้' }
};
const loiLenh = (kieu, why) => (LOI_LENH[kieu] && LOI_LENH[kieu][why]) || (why === 'quyen' ? 'เซิร์ฟเวอร์ไม่ถือว่าบัญชีนี้เป็นผู้ดูแลเกมอีกต่อไป' : X.loi(why));
async function lam() {
const x = A.xn;
if (!x || A.lam) return;
giuO();
let gio = 0, ly = '';
if (x.kieu === 'cam') {
gio = gioDangChon(); ly = x.ly.trim();
if (!gio) { x.loi = 'ระยะเวลาแบนต้องอยู่ระหว่าง 1 ชั่วโมง ถึง 365 วัน โดยระบุเป็นจำนวนเต็ม'; return veLai(); }
if (!ly) { x.loi = 'กรุณาระบุเหตุผลเพื่อให้ผู้ถูกแบนทราบ'; return veLai(); }
}
x.loi = ''; A.lam = true; veLai();
const goi = (duong, g) => X.goi(duong, { ve: true, gui: g });
let r = null, msg = '', soXong = 0;
if (x.kieu === 'cam') { r = await goi('/quantri/cam', { ma: x.ma, gio, ly }); if (r.ok) msg = `แบน ${aiTxt(x.ma, x.ten)} ถึง ${lucNao(+obj(r.cam).den || Date.now() + gio * GIO)} แล้ว ผู้เล่นจะถูกนำออกจากห้องภายใน 30 วินาที`; }
else if (x.kieu === 'bocam') { r = await goi('/quantri/cam', { ma: x.ma, gio: 0, ly: '' }); if (r.ok) msg = `ปลดแบน ${aiTxt(x.ma, x.ten)} แล้ว สามารถกลับเข้าเล่นออนไลน์ได้ทันที`; }
else if (x.kieu === 'xkl') { r = await goi('/quantri/xoa-kyluc', { ma: x.ma }); if (r.ok) msg = `ลบสถิติและคะแนนสัปดาห์ของ ${aiTxt(x.ma, x.ten)} แล้ว`; }
else if (x.kieu === 'xhoi') { r = await goi('/quantri/xoa-hoi', { id: x.id }); if (r.ok) { msg = `ลบชมรม “${x.ten}” แล้ว`; if (A.hoi) A.hoi = A.hoi.filter(h => h.id !== x.id); } }
else if (x.kieu === 'xong') {
r = await goi('/quantri/xong', { ma: x.ma });
if (r.ok) soXong = +r.so || x.ids.length;
else if (r.why === 'sai' || r.why === 'khong-co') {
for (const id of x.ids) { r = await goi('/quantri/xong', { id }); if (r.ok || r.why === 'khong-co') { soXong++; r = { ok: true }; } else break; }
}
if (r && r.ok) msg = `เก็บรายงาน ${soXong} ฉบับเกี่ยวกับ ${aiTxt(x.ma, x.ten)} เรียบร้อยแล้ว`;
else if (soXong) x.ids = x.ids.slice(soXong);
}
A.lam = false;
if (A.xn !== x) return;
if (r && r.ok) { A.xn = null; A.kq = { ok: true, msg }; veLai(); tai(true); return; }
if (r && r.why === 'quyen') { A.chu = false; nho(A.ma, false); A.xn = null; A.dl = null; if (CC.CongDong) CC.CongDong.veLai(); return; }
x.loi = 'ดำเนินการไม่สำเร็จ: ' + loiLenh(x.kieu, r && r.why) + (soXong ? ` (เก็บได้แล้ว ${soXong} ฉบับ กดซ้ำเพื่อทำส่วนที่เหลือ)` : '');
veLai();
}
function ve() {
if (!A.dl && !A.tai && !A.loi) setTimeout(() => tai(false), 0);
if (!A.dl) return A.loi ? `<p class="qt-loi">⚠ ${esc(A.loi)}</p><p><button data-act="qt-tai">ลองใหม่</button></p>` : '<p class="dim">กำลังโหลดข้อมูล…</p>';
if (A.xn) return `<div class="qt-xn">${xacNhan()}</div>`;
const d = A.dl, nNghi = arr(d.nghi).filter(x => x && tongLoai(loaiCua(x.loai)) > 0).length, nBc = nhomBaoCao(d.baoCao).length, nCam = arr(d.cam).filter(c => c && +c.den > Date.now()).length;
const MUC = [['tq', '📊 ภาพรวม', 0], ['ng', '🕵 น่าสงสัย', nNghi], ['bc', '🚩 รายงาน', nBc], ['cam', '⛔ ถูกแบนอยู่', nCam], ['cu', '🧰 เครื่องมือ', 0]];
if (!MUC.some(m => m[0] === A.muc)) A.muc = 'tq';
const than = A.muc === 'ng' ? nghiGian(d) : A.muc === 'bc' ? baoCaoHtml(d) : A.muc === 'cam' ? dangCam(d) : A.muc === 'cu' ? congCu() : tongQuan(d);
return `${A.kq ? `<div class="readout qt-kq ${A.kq.ok ? 'ok' : 'hong'}"><span>${A.kq.ok ? '✅' : '⚠'} ${esc(A.kq.msg)}</span><button data-act="qt-kq-x" title="ซ่อนข้อความนี้">✕</button></div>` : ''}
      <div class="btnrow qt-muc">${MUC.map(m => `<button data-act="qt-muc" data-m="${m[0]}" class="${A.muc === m[0] ? 'on' : ''}">${m[1]}${m[2] ? ` <b class="cd-so">${m[2]}</b>` : ''}</button>`).join('')}</div>
      <div class="qt-luc dim">${A.loi ? `<span class="qt-loi">⚠ โหลดซ้ำไม่สำเร็จ: ${esc(A.loi)}</span> ` : ''}ข้อมูลเมื่อ ${lucNao(A.luc).split(' วันที่')[0]} (${esc(X.luc(A.luc))}) <button data-act="qt-tai"${A.tai ? ' disabled' : ''}>${A.tai ? 'กำลังโหลด…' : '⟳ โหลดใหม่'}</button></div>
      ${than}`;
}
function sau() {
const capNhat = () => { const el = $('qt-noi'); if (el && A.xn && A.xn.kieu === 'cam') el.innerHTML = noiCam(gioDangChon()); };
['qt-so', 'qt-dv'].forEach(id => { const el = $(id); if (el) { el.addEventListener('input', capNhat); el.addEventListener('change', capNhat); } });
}
async function taiHoi() {
if (A.hoiTai) return;
A.hoiTai = true; A.hoiLoi = ''; veLai();
const r = await X.goi('/hoi/top');
A.hoiTai = false;
if (r && r.ok) A.hoi = arr(r.top).filter(h => h && chu(h.id)).map(h => ({ id: h.id, ten: chu(h.ten), the: chu(h.the), so: +h.so || 0, kg: +h.kg || 0 }));
else A.hoiLoi = X.loi(r && r.why);
veLai();
}
async function timHoi() {
const o = $('qt-hoi-in'), id = (o ? o.value : '').trim();
if (!id) { A.cuLoi = 'กรุณากรอกรหัสชมรมในช่องก่อน'; return veLai(); }
A.cuLoi = '';
const r = await X.goi('/hoi?id=' + encodeURIComponent(id));
if (!CC.CongDong || !CC.CongDong.dangMo('quantri') || A.xn) return;
if (r && r.ok && r.hoi) return moXn({ kieu: 'xhoi', id: chu(r.hoi.id) || id, ten: chu(r.hoi.ten), the: chu(r.hoi.the), so: +r.hoi.so || 0 });
A.cuLoi = r && r.why === 'khong-co' ? `ไม่พบชมรมที่ใช้รหัส “${id}”` : X.loi(r && r.why);
veLai();
}
function maTuO() {
const o = $('qt-ma-in'), ma = docMa(o ? o.value : '');
if (!MA_RE.test(ma)) { A.cuLoi = MA_SAI; veLai(); const o2 = $('qt-ma-in'); if (o2) o2.value = ma; return ''; }
return ma;
}
const baseAction = UI.onAction;
UI.onAction = function (act, btn) {
if (!act || act.slice(0, 3) !== 'qt-') return baseAction.apply(this, arguments);
const d = (btn && btn.dataset) || {};
switch (act) {
case 'qt-baocao': Q.baoCao(d.ma, d.ten); return;
case 'qt-bc-gui': bcGui(); return;
case 'qt-bc-dong': bcDong(); return;
}
if (A.chu !== true) return;
const ma = docMa(d.ma);
switch (act) {
case 'qt-tai': tai(true); if (A.dl) veLai(); return;
case 'qt-muc': A.muc = d.m; A.kq = null; A.cuLoi = ''; veLai(); { const p = $('panel'); if (p) p.scrollTop = 0; } tai(false); return;
case 'qt-cot': A.cot = d.c; veLai(); return;
case 'qt-tam': A.tam = +d.n; A.ngay = -1; veLai(); return;
case 'qt-ngay': A.ngay = +d.i; veLai(); return;
case 'qt-them': A.them[d.m] = (A.them[d.m] || 0) + 20; veLai(); return;
case 'qt-kq-x': A.kq = null; veLai(); return;
case 'qt-cam': if (MA_RE.test(ma)) moCam(ma, d.gio, d.ly); return;
case 'qt-bocam': if (MA_RE.test(ma)) moXn({ kieu: 'bocam', ma, ten: tenCua(ma) }); return;
case 'qt-xkl': if (MA_RE.test(ma)) moXn({ kieu: 'xkl', ma, ten: tenCua(ma) }); return;
case 'qt-xong': {
const g = nhomBaoCao(obj(A.dl).baoCao).find(x => x.ma === ma);
if (g) moXn({ kieu: 'xong', ma, ten: g.ten, ids: g.ds.map(b => b.id).filter(id => id != null) });
return;
}
case 'qt-xhoi': { const h = arr(A.hoi).find(x => x.id === d.id); if (h) moXn({ kieu: 'xhoi', id: h.id, ten: h.ten, the: h.the, so: h.so }); return; }
case 'qt-ma-cam': { const m = maTuO(); if (m) moCam(m, 24, ''); return; }
case 'qt-ma-xkl': { const m = maTuO(); if (m) moXn({ kieu: 'xkl', ma: m, ten: tenCua(m) }); return; }
case 'qt-ma-bocam': { const m = maTuO(); if (m) moXn({ kieu: 'bocam', ma: m, ten: tenCua(m) }); return; }
case 'qt-hoi-tai': taiHoi(); return;
case 'qt-hoi-tim': timHoi(); return;
case 'qt-gio': {
const x = A.xn;
if (!x || x.kieu !== 'cam' || A.lam) return;
giuO();
if (d.g === 'tuy') x.tuy = true; else { x.tuy = false; x.gio = GIO_NHANH.some(k => k[0] === +d.g) ? +d.g : 24; }
x.loi = ''; veLai(); return;
}
case 'qt-lam': lam(); return;
case 'qt-thoi': if (!A.lam) { A.xn = null; veLai(); } return;
}
};
if (CC.CongDong) CC.CongDong.them({
id: 'quantri', ten: 'ผู้ดูแล', bieu: '🛠', thuTu: 90,
ve, sau,
mo: () => { tai(false); },
an: () => { hoiQuyen(); return A.chu !== true; },
so: () => (A.chu === true && A.dl ? nhomBaoCao(A.dl.baoCao).length : 0)
});
})();