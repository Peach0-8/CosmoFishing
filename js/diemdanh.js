(function () {
const U = CC.U, UI = CC.UI, PN = UI.PANELS;
const $ = id => document.getElementById(id);
const D = CC.DiemDanh = { NGAY: 50, MOC: { 7: 400, 14: 900, 21: 400, 30: 2000 }, VONG: 30 };
const homNay = () => Math.floor((Date.now() + 7 * 3600e3) / 86400e3);
function st() {
const P = CC.P;
let s = P && P.diem;
if (!s || typeof s !== 'object' || !Number.isFinite(+s.n)) s = { n: -1, c: 0, t: 0, k: 0 };
s.n = +s.n; s.c = Math.max(0, +s.c | 0); s.t = Math.max(0, +s.t | 0); s.k = Math.max(0, +s.k || 0);
if (P) P.diem = s;
return s;
}
D.daDiem = () => st().n === homNay();
D.chuoi = () => { const s = st(), h = homNay(); return s.n === h || s.n === h - 1 ? s.c : 0; };
D.viTri = c => ((Math.max(1, c) - 1) % D.VONG) + 1;
D.thuong = pos => D.NGAY + (D.MOC[pos] || 0);
D.trangThai = () => {
const c = D.chuoi(), da = D.daDiem();
const xong = da ? D.viTri(c) : c % D.VONG;
return { c, da, xong, toi: da ? D.viTri(c + 1) : xong + 1 };
};
const tien = k => U.fmtMoney(k) + ' ฿';
D.diem = () => {
const P = CC.P, s = st(), h = homNay();
if (s.n === h) { UI.toast('วันนี้คุณเช็คอินไปแล้ว — พรุ่งนี้แวะมาใหม่นะ', 'info'); return null; }
if (s.n > h) { UI.toast('วันเวลาบนเครื่องย้อนหลังไปก่อนการเช็คอินครั้งล่าสุด — กรุณาตั้งเวลาเครื่องให้ถูกต้องก่อนเช็คอิน', 'bad', 6000); return null; }
s.c = s.n === h - 1 ? s.c + 1 : 1;
s.n = h; s.t++;
const pos = D.viTri(s.c), k = D.thuong(pos);
s.k += k;
P.money += k;
if (CC.Audio && CC.Audio.coin) CC.Audio.coin();
const moc = D.MOC[pos];
UI.toast(moc ? `📅 เช็คอินวันที่ ${pos}: +${tien(D.NGAY)} และโบนัสต่อเนื่อง ${pos} วัน +${tien(moc)}!` : `📅 เช็คอินวันที่ ${pos}: +${tien(k)}`, 'good', moc ? 6500 : 4000);
if (s.c > 1 && pos === 1) setTimeout(() => UI.toast(`🔁 ครบรอบ 30 วันแล้ว! เช็คอินต่อเนื่อง ${s.c} วัน — เริ่มรอบใหม่`, 'good', 5000), 700);
UI.refresh();
if (CC.save) CC.save();
cham();
baoMayChu(true);
return { pos, k };
};
const KHOA_MAY = 'cauca_may_v1', KHOA_MO = 'cauca_mo_v1';
function maMay() {
let m = '';
try { m = localStorage.getItem(KHOA_MAY) || ''; } catch (e) { m = ''; }
if (/^m[a-z2-7]{10}$/.test(m)) return m;
const ab = 'abcdefghijklmnopqrstuvwxyz234567', r = new Uint8Array(10);
if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(r); else for (let i = 0; i < 10; i++) r[i] = Math.random() * 256;
m = 'm' + Array.from(r, x => ab[x & 31]).join('');
try { localStorage.setItem(KHOA_MAY, m); } catch (e) {   }
return m;
}
const daGui = () => { try { return JSON.parse(localStorage.getItem(KHOA_MO) || '{}') || {}; } catch (e) { return {}; } };
const dangGui = {};
async function baoMayChu(dd) {
const X = CC.XaHoi, loai = dd ? 'dd' : 'mo';
if (!X || !X.co || !X.co() || dangGui[loai]) return;
const h = homNay(), g = daGui();
if (dd ? g.dd === h : g.mo === h || g.dd === h) return;
let r = null;
dangGui[loai] = true;
try { r = await X.goi('/mo', { veNeuCo: true, gui: dd ? { may: maMay(), dd: 1 } : { may: maMay() } }); } catch (e) { r = null; }
dangGui[loai] = false;
if (!r || !r.ok) return;
const g2 = daGui(); g2.mo = h; if (dd) g2.dd = h;
try { localStorage.setItem(KHOA_MO, JSON.stringify(g2)); } catch (e) {   }
}
D.baoMayChu = baoMayChu;
function luoi(tt) {
let h = '';
for (let i = 1; i <= D.VONG; i++) {
const moc = D.MOC[i], xong = i <= tt.xong, nay = !tt.da && i === tt.toi;
h += `<div class="dd-o${xong ? ' xong' : ''}${nay ? ' nay' : ''}${moc ? ' moc' : ''}" title="วันที่ ${i}: +${tien(D.thuong(i))}">
        <span class="dd-so">${i}</span><span class="dd-k">${xong ? '✔' : moc ? '🎁' : ''}${moc ? '+' + U.fmtMoney(D.thuong(i)) + '฿' : xong ? '' : '+' + D.NGAY + '฿'}</span></div>`;
}
return `<div class="dd-luoi">${h}</div>`;
}
function tiepTheo(tt) {
const ds = Object.keys(D.MOC).map(Number).sort((a, b) => a - b);
const tu = tt.da ? tt.xong + 1 : tt.toi;
const m = ds.find(x => x >= tu);
if (!m) return '';
const con = m - tt.xong;
return `ยังเหลืออีก <b>${con}</b> วันถึงโบนัส <b>${m} วัน</b>: รับเพิ่ม <b class="price">+${tien(D.MOC[m])}</b>`;
}
PN.diemdanh = () => {
const tt = D.trangThai(), s = st();
const nut = tt.da
? `<p class="dd-xong">✅ วันนี้เช็คอินเรียบร้อยแล้ว พรุ่งนี้กลับมาใหม่รับ <b class="price">+${tien(D.thuong(tt.toi))}</b>${D.MOC[tt.toi] ? ' (มีโบนัสต่อเนื่อง)' : ''}</p>`
: `<p><button class="good dd-nut" data-act="dd-diem">📅 เช็คอินวันนี้ +${tien(D.thuong(tt.toi))}</button></p>`;
return `<h2>📅 เช็คอินรายวัน</h2>
      <div class="sub">เข้าเกมกดเช็คอินวันละครั้ง: <b>+${tien(D.NGAY)}</b> เช็คอินต่อเนื่องรับโบนัสเพิ่ม:
        วันที่ 7 <b>+${tien(D.MOC[7])}</b> · วันที่ 14 <b>+${tien(D.MOC[14])}</b> · วันที่ 21 <b>+${tien(D.MOC[21])}</b> · วันที่ 30 <b>+${tien(D.MOC[30])}</b></div>
      <div class="readout dd-tt">สถิติต่อเนื่อง: <b>${tt.c}</b> วันติด${tt.c > D.VONG ? ` (รอบที่ ${Math.ceil(tt.c / D.VONG)})` : ''} · เช็คอินแล้ว <b>${s.t}</b> ครั้ง · รับรวม <b class="price">${tien(s.k)}</b>
        <br>${tiepTheo(tt)}</div>
      ${nut}
      ${luoi(tt)}
      <p class="dim small">นับวันตามเวลาประเทศไทย (UTC+7) หลังเที่ยงคืน 0:00 น. จะขึ้นวันใหม่ — ไม่ใช่วันในเกม หากขาด 1 วันสถิติต่อเนื่องจะกลับไปเริ่มวันที่ 1 ใหม่ เมื่อครบ 30 วันจะเริ่มรอบใหม่และรีเซ็ตโบนัสตามรอบ</p>`;
};
const baseQuest = PN.quest;
if (baseQuest) PN.quest = function () {
const h = baseQuest.apply(this, arguments), tt = D.trangThai();
const o = tt.da
? `<div class="dd-the da">📅 เช็คอินวันนี้แล้ว · ต่อเนื่อง <b>${tt.c}</b> วัน · พรุ่งนี้ <b class="price">+${tien(D.thuong(tt.toi))}</b> <button data-act="dd-mo">ดูปฏิทิน</button></div>`
: `<div class="dd-the">📅 <b>ยังไม่ได้เช็คอินวันนี้</b> — วันที่ ${tt.toi}/${D.VONG}: <b class="price">+${tien(D.thuong(tt.toi))}</b>
          <button class="good" data-act="dd-diem">เช็คอิน</button> <button data-act="dd-mo">ดูปฏิทิน</button></div>`;
const i = h.indexOf('</h2>');
return i >= 0 ? h.slice(0, i + 5) + o + h.slice(i + 5) : o + h;
};
const baseAction = UI.onAction;
UI.onAction = function (act, btn) {
if (act === 'dd-diem') { D.diem(); if (UI.current) UI.rerender(); return; }
if (act === 'dd-mo') { UI.open('diemdanh'); return; }
return baseAction.apply(this, arguments);
};
function cham() {
const b = document.querySelector('#hud-tr [data-panel="quest"]');
if (!b || !CC.P) return;
let d = b.querySelector('.dd-cham');
if (!d) { d = document.createElement('i'); d.className = 'dd-cham'; d.title = 'ยังไม่ได้เช็คอินวันนี้'; b.appendChild(d); }
d.classList.toggle('hidden', D.daDiem());
}
D.cham = cham;
const vao = Date.now(), ngayVao = homNay();
let moRoi = -1, homTruoc = -1;
function ranh() {
const G = CC.G;
return CC.P && !UI.current && !UI.locked && (!G || G.state === 'hand') && CC.P.dd !== 2
&& !document.body.classList.contains('fighting');
}
function kiem() {
if (!CC.P) return;
const h = homNay();
const sangNgay = homTruoc >= 0 && h !== homTruoc;
if (h !== homTruoc) { homTruoc = h; cham(); }
if (Date.now() - vao > 18e3) baoMayChu(false);
if (D.daDiem() || moRoi === h) return;
if ((Date.now() - vao < 180e3 || sangNgay || h !== ngayVao) && ranh()) { moRoi = h; UI.open('diemdanh'); }
}
setTimeout(() => { kiem(); setInterval(kiem, 15000); }, 2500);
setTimeout(() => baoMayChu(false), 20000);
})();
