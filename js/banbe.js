(function () {
const UI = CC.UI, X = CC.XaHoi, CD = CC.CongDong;
if (!UI || !X || !CD) return;
const B = CC.BanBe = { MAX: 50 };
const $ = id => document.getElementById(id);
const esc = X.esc;
const MA_OK = /^[2-9A-HJ-NP-Z]{6}$/;
const MA_GO = /^[2-9A-HJKMNP-Z]{6}$/;
const GIAN = 21e3, NHIP = 30e3;
const HO_TEN = { rophi: 'บ่อปลานิล', diec: 'บ่อปลาตะเพียนจีน', tram: 'บ่อปลาเฉาดำ' };
B.HUY = { kl: ['🏅', 'กำลังครองสถิติอยู่'], vd: ['🏆', 'แชมป์ศึกชิงรางวัลรอบล่าสุด'], t1: ['🥇', 'อันดับ 1 สัปดาห์ก่อน'] };
const h = B.h = {};
h.the = t => (t && typeof t === 'string' ? `<span class="bb-the">[${esc(t.slice(0, 4))}]</span>` : '');
h.theNut = t => (t && typeof t === 'string' && /^[A-Z0-9]{2,4}$/.test(t) && CC.Hoi && CC.Hoi.moThe
? `<button class="bb-the bb-the-nut" data-act="hoi-the" data-the="${t}" title="ดูชมรม [${t}]">[${t}]</button>` : h.the(t));
h.huy = a => (Array.isArray(a) ? a.map(k => (B.HUY[k] ? `<span class="bb-huy" title="${esc(B.HUY[k][1])}">${B.HUY[k][0]}</span>` : '')).join('') : '');
h.tenHo = ho => HO_TEN[ho] || (CC.PONDS_BY_ID && CC.PONDS_BY_ID[ho] && CC.PONDS_BY_ID[ho].name) || 'บ่ออื่นๆ';
h.hoCua = phong => String(phong || '').split('~')[0];
h.soPhong = phong => { const n = parseInt(String(phong || '').split('~')[1], 10); return n > 0 ? n : 1; };
h.noiCau = (phong, ho, so) => `🎣 ${esc(h.tenHo(ho || h.hoCua(phong)))} · ห้อง ${h.soPhong(phong)}${so > 0 ? ` · ${Math.round(so)} คน` : ''}`;
h.ten = (ten, ma) => (ten ? esc(ten) : `ผู้เล่น ${esc(ma || '')}`);
h.coNgoi = () => !!(CC.Online && typeof CC.Online.ngoiCanh === 'function');
h.ngoi = (ma, ho) => { try { if (h.coNgoi() && MA_OK.test(ma)) CC.Online.ngoiCanh(ma, HO_TEN[ho] ? ho : undefined); } catch (e) { UI.toast('ยังเข้าไปนั่งข้างๆ ไม่ได้ — ลองใหม่ที่หน้าต่าง 🎣 เลือกบ่อ', 'bad'); } };
h.veLai = id => {
if (!CD.dangMo(id)) return;
const a = document.activeElement;
const giu = a && a.id && /^(bb|hoi)-/.test(a.id) ? { id: a.id, s: a.selectionStart, e: a.selectionEnd } : null;
CD.veLai(id);
if (!giu) return;
const el = $(giu.id);
if (!el) return;
try { el.focus({ preventScroll: true }); if (giu.s != null) el.setSelectionRange(giu.s, giu.e); } catch (e) {   }
};
h.moiDangNhap = viec => `<div class="readout bb-moi">🔑 ต้อง <b>เข้าสู่ระบบ Google</b> และตั้ง <b>ชื่อผู้เล่น</b> เพื่อ${viec} <button data-act="tk-mo">👤 บัญชี</button></div>`;
h.chuHoa = (s, n) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u0111\u0110]/g, 'D').toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, n);
B.ds = () => {
const P = CC.P;
if (!P || P.bb == null) return [];
const a = P.bb, out = [], seen = {};
let hong = !Array.isArray(a);
if (!hong) for (let i = 0; i < a.length; i++) {
const x = a[i];
if (!x || typeof x !== 'object' || typeof x.ma !== 'string' || !MA_OK.test(x.ma) || seen[x.ma] || out.length >= B.MAX) { hong = true; continue; }
seen[x.ma] = 1;
const ten = typeof x.ten === 'string' ? x.ten.slice(0, 20) : '';
if (ten !== x.ten || Object.keys(x).length !== 2) hong = true;
out.push(hong ? { ma: x.ma, ten } : x);
}
if (hong) P.bb = out;
return P.bb;
};
B.laBan = ma => B.ds().some(x => x.ma === ma);
const LY_DO = {
ma: 'รหัสผู้เล่นประกอบด้วยตัวอักษรและตัวเลข 6 หลัก เช่น ABC234 (ไม่มีเลข 0, เลข 1, ตัว O, ตัว I, ตัว L)',
minh: 'นั่นรหัสของคุณเองนะ 😄',
trung: 'คนนี้อยู่ในรายชื่อเพื่อนของคุณอยู่แล้ว',
day: `รายชื่อเพื่อนเต็ม ${B.MAX} คนแล้ว ลบออกบางคนก่อนจึงจะเพิ่มต่อได้`
};
B.them = (ma, ten) => {
const P = CC.P, me = X.toi();
ma = String(ma || '');
if (!P || !MA_OK.test(ma)) return { ok: false, why: 'ma' };
if (me && me.ma === ma) return { ok: false, why: 'minh' };
const a = B.ds();
if (a.some(x => x.ma === ma)) return { ok: false, why: 'trung' };
if (a.length >= B.MAX) return { ok: false, why: 'day' };
if (!Array.isArray(P.bb)) P.bb = [];
P.bb.push({ ma, ten: typeof ten === 'string' ? ten.slice(0, 20) : '' });
CC.save();
taiSom();
return { ok: true };
};
B.xoa = ma => {
const P = CC.P, a = B.ds(), i = a.findIndex(x => x.ma === ma);
if (i < 0) return false;
P.bb.splice(i, 1);
if (du) delete du.m[ma];
CC.save();
return true;
};
let du = null;
let dangTai = false, tt = '', lucGoi = 0, henT = 0, dongHo = 0;
let camDen = 0;
let nhap = '', coDau = false, arm = '', tb = null, sigVe = '';
B.dangCau = () => { if (!du) return 0; let n = 0; const a = B.ds(); for (let i = 0; i < a.length; i++) { const d = du.m[a[i].ma]; if (d && d.phong) n++; } return n; };
function hen(ms) {
clearTimeout(henT);
henT = setTimeout(() => { henT = 0; if (CD.dangMo('banbe')) tai(); }, Math.max(300, ms));
}
function taiSom() { if (CD.dangMo('banbe')) hen(lucGoi + GIAN - Date.now()); }
async function tai() {
if (dangTai) return;
const me = X.toi(), a = B.ds().filter(x => !me || x.ma !== me.ma);
if (!a.length) { tt = ''; return; }
if (!X.co()) { tt = 'tat'; return veLai(); }
if (!X.sanSang()) { tt = 've'; return veLai(); }
const t = Date.now();
if (t - lucGoi < GIAN) { hen(lucGoi + GIAN - t); return; }
dangTai = true; lucGoi = t;
if (!du) veLai();
let r;
try { r = await X.goi('/ban?ma=' + a.map(x => x.ma).join(','), { ve: true }); } catch (e) { r = { ok: false, why: 'loi' }; }
dangTai = false;
if (r && r.ok && Array.isArray(r.ban)) {
const m = {};
let doi = false;
r.ban.forEach(d => {
if (!d || typeof d.ma !== 'string' || !MA_OK.test(d.ma)) return;
m[d.ma] = { ten: typeof d.ten === 'string' ? d.ten.slice(0, 20) : '', the: typeof d.the === 'string' ? d.the : '', huy: Array.isArray(d.huy) ? d.huy.slice(0, 3) : [],
phong: typeof d.phong === 'string' && d.phong ? d.phong : null, ho: typeof d.ho === 'string' ? d.ho : '', so: +d.so || 0, thay: +d.thay || 0 };
});
B.ds().forEach(x => { const d = m[x.ma]; if (d && d.ten && d.ten !== x.ten) { x.ten = d.ten; doi = true; } });
if (doi) CC.save();
du = { luc: Date.now(), m };
tt = '';
} else {
tt = (r && r.why) || 'loi';
if (tt === 'nhieu') hen(GIAN);
if (tt === 'cam' || tt === 've') du = null;
camDen = tt === 'cam' && +r.den > Date.now() ? +r.den : 0;
}
veLai();
}
function nhip() {
if (!CD.dangMo('banbe')) { clearInterval(dongHo); dongHo = 0; return; }
if (!document.hidden) tai();
}
function cungPhong() {
const O = CC.Online;
if (!O || typeof O.nguoi !== 'function') return [];
let a;
try { a = O.nguoi(); } catch (e) { a = null; }
if (!Array.isArray(a)) return [];
const me = X.toi();
return a.filter(p => p && typeof p.ma === 'string' && MA_OK.test(p.ma) && !(me && me.ma === p.ma)).slice(0, 40);
}
function nutNguoi(p) {
if (!p || typeof p.ma !== 'string' || !MA_OK.test(p.ma)) return '';
const me = X.toi();
if (me && me.ma === p.ma) return '';
if (B.laBan(p.ma)) return '<button class="bb-laban" data-act="bb-mo">✓ เพื่อน</button>';
return `<button data-act="bb-them-ng" data-ma="${esc(p.ma)}" data-ten="${esc(p.ten || '')}">➕ เพิ่มเพื่อน</button>`;
}
let daGan = false;
function gan() {
const O = CC.Online;
if (daGan || !O || !Array.isArray(O.nutNguoi)) return;
daGan = true;
O.nutNguoi.push(nutNguoi);
}
gan();
const sig = () => JSON.stringify([B.ds(), du && du.m, tt, dangTai && !du, arm, tb, coDau, cungPhong().map(p => p.ma + (p.o || '')), (X.toi() || {}).ma, h.coNgoi()]);
function veLai() { if (CD.dangMo('banbe') && sig() !== sigVe) h.veLai('banbe'); else if (UI.current === 'congdong') capSo(); }
let soCu = 0;
function capSo() {
const n = B.dangCau();
if (n === soCu) return;
soCu = n;
const a = document.activeElement, go = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
if (!go && !CD.dangMo('banbe')) CD.veLai();
}
function dong(b) {
const d = du && du.m[b.ma], cau = !!(d && d.phong);
let noi;
if (cau) noi = `<span class="bb-cau">${h.noiCau(d.phong, d.ho, d.so)}</span>`;
else if (d) noi = `<span class="dim">${d.thay ? 'ล่าสุด ' + esc(X.luc(d.thay)) : 'ยังไม่พบการตกออนไลน์'}</span>`;
else noi = `<span class="dim">${dangTai ? 'กำลังโหลด…' : ''}</span>`;
const nut = arm === b.ma
? `<span class="bb-hoilai">ลบออกจากรายชื่อเพื่อน?</span><button class="warn" data-act="bb-xoa-ok" data-ma="${esc(b.ma)}">ลบ</button><button data-act="bb-xoa-thoi">ยกเลิก</button>`
: `${cau && h.coNgoi() ? `<button class="good" data-act="bb-ngoi" data-ma="${esc(b.ma)}" data-ho="${esc(d.ho || h.hoCua(d.phong))}">🪑 เข้าไปนั่งข้างๆ</button>` : ''}<button class="bb-x" data-act="bb-xoa" data-ma="${esc(b.ma)}" title="ลบเพื่อน" aria-label="ลบเพื่อน">✕</button>`;
return `<div class="bb-p${cau ? ' on' : ''}"><span class="bb-t"><b class="bb-ten">${h.ten(b.ten, b.ma)}</b> ${d ? h.theNut(d.the) + h.huy(d.huy) : ''} <span class="bb-ma dim">${esc(b.ma)}</span><br>${noi}</span>
      <span class="bb-b">${nut}</span></div>`;
}
function thongBaoTren() {
if (!B.ds().length) return '';
if (tt === 'tat' || !X.co()) return '<p class="dim bb-tt">เซิร์ฟเวอร์ออนไลน์ยังไม่เปิดให้บริการ — รายชื่อเพื่อนของคุณยังถูกเก็บไว้ เมื่อเซิร์ฟเวอร์เปิดคุณจะเห็นได้ว่าเพื่อนกำลังตกอยู่บ่อไหน</p>';
if (!X.toi()) return '';
if (tt === 've') return `<p class="bb-tt"><span class="bad">${esc(X.loi('ve'))}</span> <button data-act="tk-mo">👤 บัญชี</button></p>`;
if (tt === 'cam') { const d = camDen ? new Date(camDen) : null; return `<p class="bb-tt"><span class="bad">บัญชีนี้ถูกระงับการเล่นออนไลน์ชั่วคราว${d ? ` จนถึง ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} น. วันที่ ${d.getDate()}/${d.getMonth() + 1}` : ''}</span> จึงยังไม่สามารถดูได้ว่าเพื่อนกำลังตกอยู่ที่ไหน รายชื่อเพื่อนของคุณยังอยู่ครบ</p>`; }
if (tt === 'nhieu') return du ? '' : '<p class="dim bb-tt">เพิ่งสอบถามเซิร์ฟเวอร์ไปเมื่อครู่ — อีกไม่กี่วินาทีรายการจะอัปเดตอัตโนมัติ</p>';
if (tt) return `<p class="bb-tt"><span class="bad">${esc(X.loi(tt))}</span> <button data-act="bb-tai">🔄 ลองใหม่</button></p>`;
return '';
}
function ve() {
gan();
const me = X.toi(), a = B.ds().filter(x => !me || x.ma !== me.ma);
const xep = a.map((b, i) => { const d = du && du.m[b.ma]; return { b, i, k: d && d.phong ? 0 : d && d.thay ? 1 : 2, t: (d && d.thay) || 0 }; })
.sort((p, q) => p.k - q.k || q.t - p.t || p.i - q.i);
const nCau = xep.filter(x => x.k === 0).length;
let an = false;
try { an = !!(CC.Online && CC.Online.anViTri && CC.Online.anViTri()); } catch (e) { an = false; }
const toi = me
? `<div class="bb-toi">รหัสของคุณ: <b class="bb-mato" id="bb-mato">${esc(me.ma)}</b> <button data-act="bb-chep">📋 คัดลอกรหัส</button>
          <span class="dim">${an ? '🙈 คุณกำลัง <b>ซ่อนตำแหน่งบ่อ</b>: เพื่อนจะไม่เห็นว่าคุณตกอยู่ที่ไหน (เปลี่ยนได้ที่หน้าต่าง 🌐 ออนไลน์)' : 'ส่งรหัสนี้ให้เพื่อน: เมื่อเพื่อนเพิ่มคุณ จะเห็นได้ทันทีว่าคุณกำลังตกอยู่บ่อไหน'}</span></div>`
: (X.co() ? h.moiDangNhap('มีรหัสผู้เล่นของคุณและดูได้ว่าเพื่อนกำลังตกอยู่บ่อไหน') : '');
const day = a.length >= B.MAX;
const them = `<div class="bb-them"><label for="bb-in">เพิ่มเพื่อนด้วยรหัส</label>
        <input type="text" id="bb-in" maxlength="12" placeholder="เช่น ABC234" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" value="${esc(nhap)}"${day ? ' disabled' : ''}>
        <button class="good" data-act="bb-them"${day ? ' disabled' : ''}>➕ เพิ่มเพื่อน</button></div>
      ${coDau ? '<p class="dim bb-nho">แป้นพิมพ์อักขระพิเศษหรือภาษาอื่นอาจทำให้รหัสผิดเพี้ยน หากเพิ่มไม่ได้ให้สลับเป็นแป้นภาษาอังกฤษแล้วพิมพ์ใหม่</p>' : ''}
      ${tb ? `<p class="bb-tb"><span class="${tb.k}">${esc(tb.txt)}</span></p>` : ''}`;
const list = a.length
? `<div class="bb-ds">${xep.map(x => dong(x.b)).join('')}</div>`
: `<p class="dim bb-trong">ยังไม่มีเพื่อนเลย ลองถามรหัสผู้เล่น 6 หลักจากเพื่อน (ดูได้ในหน้าต่าง 👤 บัญชี หรือ 🌐 ออนไลน์) แล้วกรอกลงในช่องด้านบน${cungPhong().length ? ' หรือเพิ่มผู้เล่นที่อยู่ในห้องเดียวกันด้านล่างได้เลย' : ''}</p>`;
const cp = cungPhong();
const phong = cp.length ? `<h3>ผู้เล่นที่กำลังตกอยู่ในห้องเดียวกัน</h3><div class="bb-ds bb-cp">${cp.map(p => `<div class="bb-p"><span class="bb-t"><b class="bb-ten">${h.ten(p.ten, p.ma)}</b> ${h.theNut(p.the)}${h.huy(p.huy)}${p.o ? ` <span class="dim">ช่อง ${+p.o || ''}</span>` : ''}</span>
        <span class="bb-b">${B.laBan(p.ma) ? '<span class="bb-laban">✓ เพื่อน</span>' : `<button data-act="bb-them-ng" data-ma="${esc(p.ma)}" data-ten="${esc(p.ten || '')}"${day ? ' disabled' : ''}>➕ เพิ่มเพื่อน</button>`}</span></div>`).join('')}</div>` : '';
sigVe = sig();
soCu = B.dangCau();
return `${toi}${them}
      <h3>เพื่อน (${a.length}/${B.MAX})${nCau ? ` · <span class="bb-dem">${nCau} กำลังตก</span>` : ''}</h3>
      ${thongBaoTren()}${list}${phong}
      <p class="dim bb-nho">การเพิ่มเพื่อนไม่ต้องรออีกฝ่ายกดยืนยัน ใครที่มีรหัสของคุณก็จะเห็นว่าคุณกำลังตกอยู่บ่อไหน — หากต้องการซ่อน ให้ปิดตัวเลือก "ให้เพื่อนเห็นว่าฉันกำลังตกอยู่ที่ไหน" ในหน้าต่าง 🌐 ออนไลน์</p>`;
}
CD.them({
id: 'banbe', ten: 'เพื่อน', bieu: '👥', thuTu: 40, ve,
mo: () => {
arm = ''; tb = null;
if (!dongHo) dongHo = setInterval(nhip, NHIP);
if (!du || Date.now() - du.luc > 20e3 || B.ds().some(x => !du.m[x.ma])) tai();
},
so: () => B.dangCau()
});
const noi = (txt, k) => { tb = { txt, k: k || '' }; };
function themTuO() {
const el = $('bb-in'), v = h.chuHoa(el ? el.value : nhap, 12);
if (!v) { noi('กรุณากรอกรหัสผู้เล่นของเพื่อนในช่องก่อน', 'bad'); return veLai(); }
if (!MA_GO.test(v)) { nhap = v; noi(LY_DO.ma, 'bad'); return veLai(); }
const r = B.them(v, '');
if (r.ok) { nhap = ''; coDau = false; noi(`เพิ่ม ${v} ลงในรายชื่อเพื่อนแล้ว`, 'good'); UI.toast(`👥 เพิ่มเพื่อน ${v} แล้ว`, 'good'); } else { nhap = v; noi(LY_DO[r.why] || LY_DO.ma, 'bad'); }
veLai();
}
function chep() {
const me = X.toi();
if (!me) return;
const xong = ok => UI.toast(ok ? `📋 คัดลอกรหัส ${me.ma} แล้ว — ส่งให้เพื่อนได้เลย` : `รหัสของคุณ: ${me.ma} (ระบบไม่อนุญาตให้คัดลอกอัตโนมัติ กรุณาพิมพ์ตามนี้)`, ok ? 'good' : 'info', 4000);
const lui = () => {
let ok = false;
try {
const ta = document.createElement('textarea');
ta.value = me.ma; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-99px;top:0;opacity:0';
document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, 6);
ok = document.execCommand('copy');
ta.remove();
} catch (e) { ok = false; }
xong(ok);
};
try {
if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(me.ma).then(() => xong(true), lui);
else lui();
} catch (e) { lui(); }
}
document.addEventListener('input', e => {
const el = e.target;
if (!el || el.id !== 'bb-in' || e.isComposing) return;
if (/[^\x00-\x7f]/.test(el.value)) coDau = true;
const v = h.chuHoa(el.value, 12);
if (v !== el.value) el.value = v;
nhap = v;
});
document.addEventListener('keydown', e => { if (e.target && e.target.id === 'bb-in' && e.key === 'Enter') { e.preventDefault(); themTuO(); } });
const baseAction = UI.onAction;
UI.onAction = function (act, btn) {
if (!act || act.slice(0, 3) !== 'bb-') return baseAction.apply(this, arguments);
const d = (btn && btn.dataset) || {};
switch (act) {
case 'bb-them': themTuO(); return;
case 'bb-chep': chep(); return;
case 'bb-tai': {
const con = lucGoi + GIAN - Date.now();
if (con > 0) UI.toast(`เพิ่งสอบถามเซิร์ฟเวอร์ไป — จะรีเฟรชอัตโนมัติใน ${Math.ceil(con / 1000)} วินาที`, 'info');
tai(); return;
}
case 'bb-xoa': arm = d.ma || ''; tb = null; veLai(); return;
case 'bb-xoa-thoi': arm = ''; veLai(); return;
case 'bb-xoa-ok': {
const b = B.ds().find(x => x.ma === d.ma);
arm = '';
if (b && B.xoa(b.ma)) noi(`ลบ ${b.ten || b.ma} ออกจากรายชื่อเพื่อนแล้ว`, 'good');
veLai(); return;
}
case 'bb-ngoi': h.ngoi(d.ma, d.ho); return;
case 'bb-mo': CD.mo('banbe'); return;
case 'bb-them-ng': {
const r = B.them(d.ma, d.ten || '');
UI.toast(r.ok ? `👥 เพิ่ม ${d.ten || d.ma} ลงในรายชื่อเพื่อนแล้ว` : (LY_DO[r.why] || LY_DO.ma), r.ok ? 'good' : 'info', 3500);
if (CD.dangMo('banbe')) veLai();
else if (UI.current && !UI.locked) UI.rerender();
return;
}
}
};
})();