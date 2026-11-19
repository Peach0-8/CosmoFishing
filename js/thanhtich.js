(function () {
const DS = [
{ id: 'canthu', ten: 'นักตกปลามือใหม่', bieu: '🎣', tu: 'ca', bac: 1 },
{ id: 'taycau', ten: 'มือฉมัง', bieu: '💪', tu: 'ca', bac: 2 },
{ id: 'laolang', ten: 'เซียนชิงหลิว', bieu: '🧓', tu: 'ca', bac: 3 },
{ id: 'nghinky', ten: 'กระชังพันโล', bieu: '⚖', tu: 'kg', bac: 3 },
{ id: 'khachruot', ten: 'ขาประจำบ่อ', bieu: '🎫', tu: 'cs', bac: 3 },
{ id: 'daigia', ten: 'เถ้าแก่บ่อตกปลา', bieu: '💰', tu: 'tn', bac: 3 },
{ id: 'phongsinh', ten: 'ใจบุญปล่อยปลา', bieu: '🕊', tu: 'th', bac: 3 },
{ id: 'mattay', ten: 'มือขึ้นสุดๆ', bieu: '🍀', tu: 'la', bac: 3 },
{ id: 'boithu', ten: 'เต็มกระชัง', bieu: '🧺', tu: 'mc', bac: 3 },
{ id: 'chactay', ten: 'มือชัวร์ไม่พลาด', bieu: '🤝', tu: 'ch', bac: 3 },
{ id: 'vuarophi', ten: 'ราชันย์ปลานิล', bieu: '👑', tu: 'rp', bac: 3 },
{ id: 'vuadiec', ten: 'ราชันย์ตะเพียนจีน', bieu: '🥇', tu: 'di', bac: 3 },
{ id: 'chepvuong', ten: 'เจ้าสมุทรปลาไน', bieu: '🐉', tu: 'cp', bac: 3 },
{ id: 'santram', ten: 'นักล่าเฉาดำ', bieu: '🎯', tu: 'td', bac: 2 },
{ id: 'tramvuong', ten: 'ราชันย์เฉาดำ', bieu: '🦈', tu: 'td', bac: 3 },
{ id: 'mevuong', ten: 'ราชันย์ปลาซ่ง', bieu: '🐋', tu: 'mh', bac: 3 },
{ id: 'covuong', ten: 'เจ้าบึงปลาเฉา', bieu: '🌿', tu: 'tc', bac: 3 },
{ id: 'bachkhoa', ten: 'สารานุกรมปลา', bieu: '📖', tu: 'lo', bac: 3 },
{ id: 'satdiec', ten: 'มือปราบตะเพียนจีน', bieu: '⚡', tu: 'sd', bac: 3 },
{ id: 'trumrophi', ten: 'เจ้าพ่อปลานิล', bieu: '🐟', tu: 'sr', bac: 3 },
{ id: 'trumtram', ten: 'เจ้าพ่อเฉาดำ', bieu: '🖤', tu: 'st', bac: 3 },
{ id: 'chuacatap', ten: 'ราชาปลารบกวน', bieu: '🐠', tu: 'tp', bac: 3 },
{ id: 'cudem', ten: 'นกฮูกกลางคืน', bieu: '🦉', tu: 'de', bac: 3 },
{ id: 'daysom', ten: 'นักตกปลารุ่งสาง', bieu: '🌅', tu: 'sm', bac: 3 },
{ id: 'doimua', ten: 'นักสู้สายฝน', bieu: '🌧', tu: 'mu', bac: 3 },
{ id: 'dongio', ten: 'ท้าลมแรง', bieu: '🌬', tu: 'gi', bac: 3 },
{ id: 'domanh', ten: 'สายเล็กพิชิตยักษ์', bieu: '🧵', tu: 'dm', bac: 3 },
{ id: 'lidon', ten: 'อึดถึกทน', bieu: '🥊', tu: 'dl', bac: 3 },
{ id: 'santhe', ten: 'นักล่าปลาติดแท็ก', bieu: '🏷', tu: 'tg', bac: 2 },
{ id: 'quanquan', ten: 'แชมป์วันอาทิตย์', bieu: '🏅', tu: 'gc', bac: 1 },
{ id: 'vuagiai', ten: 'ราชันย์สนามแข่ง', bieu: '🏆', tu: 'gc', bac: 3 },
{ id: 'khapho', ten: 'ตะลุยครบทุกบ่อ', bieu: '🗺', tu: 'kh', bac: 1 },
{ id: 'dubocan', ten: 'ครบเครื่องเรื่องคัน', bieu: '🎋', tu: 'dc', bac: 3 },
{ id: 'choidep', ten: 'นักแต่งบัลลังก์', bieu: '🎨', tu: 'tr', bac: 3 }
];
const T = CC.ThanhTich = { DS, deo: () => null };
if (!CC.UI || !CC.U) return;
const U = CC.U, UI = CC.UI;
const BAC = ['', 'ทองแดง', 'เงิน', 'ทอง'], HUY = ['', '🥉', '🥈', '🥇'];
const THUONG = [0, 100, 250, 600], THUONG_MOT = 300;
T.THUONG = THUONG; T.THUONG_MOT = THUONG_MOT;
const HO = { rophi: 1, tram: 2, giai: 4, diec: 8 };
const NHOM = [['cham', 'ขยันตกปลา'], ['cato', 'ปลาไซส์ยักษ์'], ['sotay', 'สมุดบันทึกปลา'], ['troi', 'เวลาและสภาพอากาศ'], ['nghe', 'ฝีมือและเทคนิค'], ['khac', 'การแข่งขัน บ่อ และอุปกรณ์']];
const n0 = x => (typeof x === 'number' && isFinite(x) && x > 0 ? x : 0);
const jn = (P, id) => { const j = P.journal && P.journal[id]; return j ? n0(+j.count) : 0; };
const jb = (P, id) => { const j = P.journal && P.journal[id]; return j ? n0(+j.best) : 0; };
const st = (P, k) => n0(+(P.stats && P.stats[k]));
const bits = x => { let n = 0; for (x = x | 0; x; x >>= 1) n += x & 1; return n; };
const soLoai = P => Object.keys(P.journal || {}).filter(id => CC.FISH_BY_ID[id] && jn(P, id) > 0).length;
const TONG_LOAI = Math.max(10, (CC.FISH || []).length);
const big = (id, ma, b, ten, m) => ({ id: ma, g: 'cato', b, t: ten, mt: `${CC.FISH_BY_ID[id] ? CC.FISH_BY_ID[id].name.replace(/ \(.*$/, '') : id} ตัวใหญ่ที่สุดของคุณ`, m, k: 'kg', of: P => jb(P, id) });
const TT = T.TT = [
{ id: 'ca', g: 'cham', b: '🎣', t: 'นักตกปลาขยัน', mt: 'จำนวนปลาทั้งหมดที่ตกขึ้นฝั่งได้', m: [50, 250, 1000], dv: 'ตัว', of: P => st(P, 'caught') },
{ id: 'kg', g: 'cham', b: '⚖', t: 'กระชังหนักอึ้ง', mt: 'น้ำหนักปลาทั้งหมดที่ตกขึ้นฝั่งได้', m: [50, 300, 1000], k: 'kg', of: (P, c) => n0(c.kg) },
{ id: 'cs', g: 'cham', b: '🎫', t: 'ขาประจำบ่อตกปลา', mt: 'จำนวนรอบที่ซื้อบัตรเข้าบ่อ', m: [10, 50, 200], dv: 'รอบ', of: P => st(P, 'cas') },
{ id: 'tn', g: 'cham', b: '💰', t: 'รวยด้วยคันเบ็ด', mt: 'รายได้รวมจากการขายปลาและรางวัลจากบ่อ', m: [5000, 50000, 300000], k: 'tien', of: P => st(P, 'earned') },
{ id: 'la', g: 'cham', b: '🍀', t: 'ตกได้กำไร', mt: 'จำนวนรอบที่จบแบบมีกำไร (ค่าปลา + รางวัล ≥ ค่าบัตร)', m: [3, 15, 50], dv: 'รอบ', of: (P, c) => n0(c.la) },
{ id: 'mc', g: 'cham', b: '🧺', t: 'รอบเดียวเต็มกระชัง', mt: 'จำนวนปลาที่ตกได้ในรอบเดียว', m: [15, 30, 50], dv: 'ตัว', of: (P, c) => Math.max(n0(c.mc), n0(+(P.ca && P.ca.caught))) },
{ id: 'th', g: 'cham', b: '🕊', t: 'ปล่อยปลากลับบ่อ', mt: 'จำนวนปลาที่ปล่อยกลับลงบ่อ', m: [20, 150, 600], dv: 'ตัว', of: P => st(P, 'released') },
big('rophi', 'rp', '🐟', 'ปลานิลไซส์ยักษ์', [0.9, 1.25, 1.5]),
big('dieuhong', 'dh', '🌺', 'ปลาทับทิมไซส์ยักษ์', [0.85, 1.15, 1.4]),
big('diec', 'di', '✨', 'ปลาตะเพียนจีนจานเปล', [0.3, 0.45, 0.6]),
big('chep', 'cp', '🐉', 'ปลาไนยักษ์', [3, 6, 10]),
big('tramden', 'td', '🦈', 'ปลาเฉาดำยักษ์', [12, 20, 28]),
big('mehoa', 'mh', '🐋', 'ปลาซ่งยักษ์', [8, 12, 16]),
big('tramco', 'tc', '🌿', 'ปลาเฉายักษ์', [3, 7, 12]),
big('chimtrang', 'ct', '🦷', 'ปลาเปคูไซส์ใหญ่', [1, 1.5, 1.9]),
big('troi', 'to', '🌊', 'ปลายี่สกเทศไซส์ใหญ่', [0.9, 1.4, 1.7]),
{ id: 'lo', g: 'sotay', b: '📖', t: 'สมุดบันทึกฉบับสมบูรณ์', mt: 'จำนวนชนิดปลาที่บันทึกในสมุดบันทึก', m: [6, 9, TONG_LOAI], dv: 'ชนิด', of: soLoai },
{ id: 'bm', g: 'sotay', b: '🆕', t: 'สามสายพันธุ์ใหม่', mt: 'ตกได้ครบทั้งปลาเฉา ปลาเปคู และปลายี่สกเทศ', m: [3], dv: 'ชนิด', of: P => ['tramco', 'chimtrang', 'troi'].filter(id => jn(P, id) > 0).length },
{ id: 'sd', g: 'sotay', b: '⚡', t: 'มือปราบตะเพียนจีน', mt: 'จำนวนปลาตะเพียนจีนที่ตกได้', m: [30, 150, 500], dv: 'ตัว', of: P => jn(P, 'diec') },
{ id: 'sr', g: 'sotay', b: '🐟', t: 'เจ้าพ่อปลานิล', mt: 'จำนวนปลานิลและปลาทับทิมที่ตกได้', m: [50, 250, 800], dv: 'ตัว', of: P => jn(P, 'rophi') + jn(P, 'dieuhong') },
{ id: 'st', g: 'sotay', b: '🖤', t: 'นักล่าปลาเฉาดำ', mt: 'จำนวนปลาเฉาดำที่ตักสวิงสำเร็จ', m: [3, 15, 50], dv: 'ตัว', of: P => jn(P, 'tramden') },
{ id: 'tp', g: 'sotay', b: '🐠', t: 'ราชาปลารบกวน', mt: 'จำนวนปลาแปบและปลาซิวที่ตกได้', m: [20, 100, 300], dv: 'ตัว', of: P => jn(P, 'muong') + jn(P, 'thebe') },
{ id: 'de', g: 'troi', b: '🦉', t: 'นกฮูกกลางคืน', mt: 'ตกปลาได้ตอนกลางคืน ตั้งแต่ 19:00 ถึง 05:00 น.', m: [5, 40, 150], dv: 'ตัว', of: (P, c) => n0(c.de) },
{ id: 'sm', g: 'troi', b: '🌅', t: 'เช้าตรู่รับอรุณ', mt: 'ตกปลาได้ช่วงเช้า 05:00 ถึง 07:00 น.', m: [5, 40, 150], dv: 'ตัว', of: (P, c) => n0(c.sm) },
{ id: 'mu', g: 'troi', b: '🌧', t: 'ลุยสายฝน', mt: 'ตกปลาได้ขณะฝนปรอยหรือฝนตกหนัก', m: [5, 40, 150], dv: 'ตัว', of: (P, c) => n0(c.mu) },
{ id: 'gi', g: 'troi', b: '🌬', t: 'ลมแรงก็ยังได้ตัว', mt: 'ตกปลาได้ขณะลมแรงจนทุ่นโคลงเคลงตลอดเวลา', m: [3, 20, 80], dv: 'ตัว', of: (P, c) => n0(c.gi) },
{ id: 'ch', g: 'nghe', b: '🤝', t: 'มือชัวร์ต่อเนื่อง', mt: 'ตกปลาขึ้นฝั่งติดต่อกันหลายตัวโดยไม่หลุดเลย', m: [10, 25, 50], dv: 'ตัว', of: (P, c) => Math.max(n0(c.cm), n0(c.ch)) },
{ id: 'dm', g: 'nghe', b: '🧵', t: 'สายเล็กพิชิตยักษ์', mt: 'ปลาตัวใหญ่ที่สุดที่ตกได้ด้วยสายเล็ก (สายหน้า 0.6 ลงมา)', m: [0.8, 1.4, 2], k: 'kg', of: (P, c) => n0(c.dm) / 1000 },
{ id: 'dl', g: 'nghe', b: '🥊', t: 'ศึกยืดเยื้อสุดมัน', mt: 'อัดปลานานที่สุดแล้วเอาขึ้นฝั่งได้สำเร็จ', m: [60, 120, 240], k: 'giay', of: (P, c) => n0(c.dl) },
{ id: 'tg', g: 'nghe', b: '🏷', t: 'ปลาติดแท็กพิเศษ', mt: 'จำนวนปลาติดแท็กของบ่อที่ตกได้', m: [1, 5, 15], dv: 'ตัว', of: P => n0(+P.tagsCaught) },
{ id: 'gc', g: 'khac', b: '🏆', t: 'แชมป์วันอาทิตย์', mt: 'จำนวนครั้งที่คว้าแชมป์ศึกชิงแชมป์วันอาทิตย์', m: [1, 3, 10], dv: 'ครั้ง', of: P => n0(+P.giaiWins) },
{ id: 'kh', g: 'khac', b: '🗺', t: 'ตะลุยครบทุกบ่อ', mt: 'ตกปลาได้ครบทั้งสี่บ่อ: บ่อปลานิล บ่อปลาเฉาดำ บ่อปลาตะเพียนจีน และบ่อชิงแชมป์วันอาทิตย์', m: [4], dv: 'บ่อ', of: (P, c) => bits(n0(c.ho) & 15) },
{ id: 'dc', g: 'khac', b: '🎋', t: 'ครบเครื่องเรื่องคัน', mt: 'จำนวนคันชิงหลิวที่มีในครอบครอง', m: [2, 4, 5], dv: 'คัน', of: P => (Array.isArray(P.rods) ? P.rods.length : 0) },
{ id: 'tr', g: 'khac', b: '🎨', t: 'แต่งหล่อริมบ่อ', mt: 'จำนวนของตกแต่งที่ซื้อแล้ว', m: [3, 8, 15], dv: 'ชิ้น', of: P => (P.skins && Array.isArray(P.skins.owned) ? P.skins.owned.length : 0) },
{ id: 'qn', g: 'khac', b: '🥫', t: 'ขาประจำร้านน้ำ', mt: 'จำนวนกระป๋องเครื่องดื่มชูกำลังปลาไนทอง (น้ำเสริมดวง) ที่ดื่มที่ซุ้มน้ำริมบ่อ', m: [3, 15, 50], dv: 'กระป๋อง', of: P => n0(+(P.dao && P.dao.total)) }
];
const BY = {};
TT.forEach(a => { BY[a.id] = a; });
const DS_BY = {};
DS.forEach(d => { DS_BY[d.id] = d; });
const TONG_BAC = TT.reduce((s, a) => s + a.m.length, 0);
const la = o => !!o && typeof o === 'object' && !Array.isArray(o);
function S(tao) {
const P = CC.P;
if (!P) return null;
let t = P.tt;
if (!la(t) || t.v !== 1) { if (!tao) return null; t = P.tt = { v: 1, d: {}, c: {} }; }
if (!la(t.d)) t.d = {};
if (!la(t.c)) t.c = {};
return t;
}
const bacDa = (t, a) => { const b = t && a ? t.d[a.id] | 0 : 0; return b > 0 ? Math.min(b, a.m.length) : 0; };
const giaTri = (a, P, c) => { try { return n0(+a.of(P, c)); } catch (e) { return 0; } };
const bacCua = (a, v) => { let b = 0; while (b < a.m.length && v >= a.m[b] - 1e-9) b++; return b; };
const thuong = (a, b) => (a.m.length === 1 ? THUONG_MOT : THUONG[b] || 0);
const tenBac = (a, b) => (a.m.length === 1 ? '' : 'ระดับ' + BAC[b]);
const moDuoc = (t, d) => bacDa(t, BY[d.tu]) >= d.bac;
T.size = () => { const P = CC.P; return P && P.tt ? encodeURIComponent(JSON.stringify(P.tt)).replace(/%[0-9A-F]{2}/g, 'x').length + 5 : 0; };
T.deo = () => {
const t = S(false), d = t && typeof t.deo === 'string' ? DS_BY[t.deo] : null;
return d && moDuoc(t, d) ? { id: d.id, ten: d.ten, bieu: d.bieu } : null;
};
T.moDS = () => { const t = S(false); return t ? DS.filter(d => moDuoc(t, d)) : []; };
T.tinh = () => {
const P = CC.P, t = S(false) || { d: {}, c: {} };
return TT.map(a => ({ id: a.id, v: giaTri(a, P, t.c), bac: bacDa(t, a), m: a.m }));
};
const cho = [];
let hen = 0;
const ban = () => (CC.G && CC.G.state === 'fighting') || document.body.classList.contains('fighting') || (CC.P && CC.P.dd === 2);
function xa() {
if (hen || !cho.length) return;
if (ban()) { hen = setTimeout(() => { hen = 0; xa(); }, 1500); return; }
const m = cho.shift();
UI.toast(m[0], m[1] || 'good', m[2] || 5200);
if (cho.length) hen = setTimeout(() => { hen = 0; xa(); }, 1300);
}
const bao = (msg, type, ms) => { cho.push([msg, type, ms]); xa(); };
T.moi = {};
function xet(tra) {
const P = CC.P, t = S(true);
if (!t) return 0;
const moi = [];
for (const a of TT) {
const b = bacCua(a, giaTri(a, P, t.c)), cu = bacDa(t, a);
if (b > cu) { t.d[a.id] = b; moi.push({ a, cu, b }); }
}
if (!moi.length) return 0;
if (tra) {
let tien = 0, bacMoi = 0;
moi.forEach(x => { for (let b = x.cu + 1; b <= x.b; b++) { tien += thuong(x.a, b); bacMoi++; } T.moi[x.a.id] = 1; });
P.money += tien;
t.n = n0(t.n) + bacMoi;
if (CC.Audio && CC.Audio.coin) CC.Audio.coin();
const k = U.fmtMoney(tien);
if (moi.length === 1) {
const x = moi[0], dh = DS.filter(d => d.tu === x.a.id && d.bac > x.cu && d.bac <= x.b).pop();
bao(`🎖 ความสำเร็จ: ${x.a.t}${x.a.m.length > 1 ? ' — ' + tenBac(x.a, x.b) : ''} · +${k} ฿${dh ? ` · ปลดล็อกฉายา “${dh.ten}”` : ''}`);
} else bao(`🎖 ความสำเร็จใหม่ ${moi.length} รายการ: ${moi.slice(0, 3).map(x => x.a.t).join(', ')}${moi.length > 3 ? '…' : ''} · +${k} ฿`);
UI.refresh();
if (CC.CongDong) CC.CongDong.veLai('thanhtich');
}
CC.save();
return moi.length;
}
T.xet = xet;
function hapThu() {
if (!CC.P) return;
if (!S(false)) { sanSang(); return; }
const n = xet(false);
if (n) bao(`🎖 บันทึกความสำเร็จเพิ่ม ${n} รายการ — ดูได้ที่ 👥 ชุมชน`, 'info');
}
const gioNay = () => { const W = CC.world; let h = W && typeof W.hour === 'function' ? +W.hour() : (W ? W.minutes / 60 : 12); h = ((h % 24) + 24) % 24; return isFinite(h) ? h : 12; };
const laDem = h => h >= 19 || h < 5, laSom = h => h >= 5 && h < 7;
const laMua = w => w === 'rain' || w === 'drizzle';
const dayManh = id => { const l = (CC.LINES || []).find(x => x.id === id); return !!l && l.leader <= 1.4; };
const them = (c, k, n) => { c[k] = n0(c[k]) + (n == null ? 1 : n); };
const lon = (c, k, v) => { v = Math.round(n0(+v)); if (v > n0(c[k])) c[k] = v; };
function ghiCa(d) {
const P = CC.P, t = S(true), c = t.c, W = CC.world || {};
c.kg = Math.round((n0(c.kg) + d.w) * 1000) / 1000;
const lost = st(P, 'lost');
if (c.ls != null && lost > n0(c.ls)) c.ch = 0;
c.ls = lost;
them(c, 'ch');
lon(c, 'cm', c.ch);
lon(c, 'mc', P.ca && P.ca.caught);
const h = gioNay();
if (laDem(h)) them(c, 'de'); else if (laSom(h)) them(c, 'sm');
if (laMua(W.weather)) them(c, 'mu'); else if (W.weather === 'windy') them(c, 'gi');
if (dayManh(P.line)) lon(c, 'dm', d.w * 1000);
lon(c, 'dl', d.time);
c.ho = (n0(c.ho) | (HO[P.pondId] || 0)) & 15;
}
function demTuHoSo(c) {
const P = CC.P;
let es = [];
try { es = CC.NhatKy && CC.NhatKy.entries ? CC.NhatKy.entries() : []; } catch (e) { es = []; }
let kg = 0;
for (const e of es) {
if (!e || !(e.w > 0)) continue;
kg += e.w;
const h = ((e.min / 60) % 24 + 24) % 24;
if (laDem(h)) them(c, 'de'); else if (laSom(h)) them(c, 'sm');
if (laMua(e.weather)) them(c, 'mu'); else if (e.weather === 'windy') them(c, 'gi');
if (dayManh(e.line)) lon(c, 'dm', e.w * 1000);
lon(c, 'dl', e.time);
if (HO[e.pond]) c.ho = n0(c.ho) | HO[e.pond];
}
const q = P.quests;
kg = Math.max(kg, q && q.cnt ? n0(+q.cnt.kg) : 0);
if (kg > 0) c.kg = Math.round(kg * 1000) / 1000;
if (q && q.done && q.done['i:lai']) c.la = 1;
lon(c, 'mc', P.ca && P.ca.caught);
c.ls = st(P, 'lost');
}
function sanSang() {
if (!CC.P || S(false)) return;
const t = S(true);
try { demTuHoSo(t.c); } catch (e) {   }
const n = xet(false);
if (n) bao(`🎖 คุณมีความสำเร็จที่ทำไว้แล้ว ${n} รายการ — ดูได้ที่ 👥 ชุมชน`, 'info', 6500);
CC.save();
}
const baseShow = UI.showCatch;
UI.showCatch = function (d) {
const r = baseShow.apply(this, arguments);
try { if (CC.P && d && d.sp && d.w > 0) { sanSang(); ghiCa(d); xet(true); } } catch (e) { console.error('[thanhtich]', e); }
return r;
};
const baseAction = UI.onAction;
UI.onAction = function (act, btn) {
if (act && act.slice(0, 3) === 'tt-') return hanh(act, btn);
const P = CC.P;
let e0 = 0, pond = null, lv = 0;
try {
if (P) {
hapThu();
if (act === 'payout') {
pond = CC.pond(); e0 = st(P, 'earned');
lv = ((P.ca && P.ca.log) || []).reduce((s, x) => s + (+x.reward || 0), 0);
}
}
} catch (e) { pond = null; }
const r = baseAction.apply(this, arguments);
try {
if (CC.P && CC.P === P) {
if (pond) {
const got = pond.type === 'latvot' ? lv : st(P, 'earned') - e0;
if (got - pond.ticket >= 0) them(S(true).c, 'la');
}
xet(true);
}
} catch (e) { console.error('[thanhtich]', e); }
return r;
};
window.addEventListener('DOMContentLoaded', () => setTimeout(() => {
hapThu();
const t = S(false);
if (t && t.deo != null && !T.deo()) { delete t.deo; CC.save(); }
setInterval(hapThu, 15000);
}, 1200));
T.loc = 'tat';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const so = x => (Math.round(x * 100) / 100).toLocaleString('th-TH');
const giay = s => { s = Math.round(s); const m = Math.floor(s / 60), r = s % 60; return m ? `${m} นาที${r ? ' ' + r + ' วินาที' : ''}` : `${r} วินาที`; };
function tienDo(a, v, moc) {
if (a.k === 'kg') return `${so(Math.min(v, 99999))} / ${so(moc)} กก.`;
if (a.k === 'tien') return `${U.fmtMoney(v)} ฿ / ${U.fmtMoney(moc)} ฿`;
if (a.k === 'giay') return `${giay(v)} / ${giay(moc)}`;
return `${so(Math.floor(v))} / ${so(moc)} ${a.dv || ''}`;
}
const coSo = (a, v) => (a.k === 'kg' ? so(v) + ' กก.' : a.k === 'tien' ? U.fmtMoney(v) + ' ฿' : a.k === 'giay' ? giay(v) : `${so(Math.floor(v))} ${a.dv || ''}`);
const mocTxt = a => a.m.map(m => (a.k === 'giay' ? giay(m) : a.k === 'tien' ? U.fmtMoney(m) + ' ฿' : so(m))).join(' · ') + (a.k === 'kg' ? ' กก.' : a.k || !a.dv ? '' : ' ' + a.dv);
function o(a, P, t) {
const v = giaTri(a, P, t.c), b = bacDa(t, a), het = b >= a.m.length, moc = a.m[Math.min(b, a.m.length - 1)];
const huy = a.m.length === 1 ? `<i class="${b ? 'co' : ''}">🏅</i>` : a.m.map((_, i) => `<i class="${i < b ? 'co' : ''}" title="ระดับ${BAC[i + 1]}">${HUY[i + 1]}</i>`).join('');
const dh = DS.filter(d => d.tu === a.id);
const dhTxt = dh.map(d => `${moDuoc(t, d) ? '✔' : '🔒'} ${a.m.length > 1 ? 'ระดับ' + BAC[d.bac] + ' ปลดล็อก' : 'ปลดล็อก'}ฉายา “${esc(d.bieu)} ${esc(d.ten)}”`).join('<br>');
return `<div class="tt-o${het ? ' xong' : ''}${T.moi[a.id] ? ' moi' : ''}">
      <div class="tt-h"><span class="tt-b">${a.b}</span><b class="tt-t">${esc(a.t)}</b>${T.moi[a.id] ? '<span class="tt-new">ใหม่</span>' : ''}<span class="tt-huy">${huy}</span></div>
      <div class="tt-mt">${esc(a.mt)}${a.m.length > 1 ? ` <span class="tt-moc">(${mocTxt(a)})</span>` : ''}</div>
      <div class="qbar"><i style="width:${het ? 100 : U.clamp(v / moc * 100, 0, 100).toFixed(0)}%"></i></div>
      <div class="tt-td"><span>${het ? '✔ สำเร็จครบแล้ว · ' + coSo(a, v) : tienDo(a, v, moc)}</span>${het ? '' : `<span class="tt-tg">${a.m.length > 1 ? 'ระดับ' + BAC[b + 1] + ': ' : 'รางวัล: '}<b class="price">+${U.fmtMoney(thuong(a, b + 1))} ฿</b></span>`}</div>
      ${dhTxt ? `<div class="tt-dhm">${dhTxt}</div>` : ''}
    </div>`;
}
function ve() {
const P = CC.P, t = S(true);
if (!P || !t) return '<p class="dim">ยังไม่มีโปรไฟล์</p>';
const dat = TT.reduce((s, a) => s + bacDa(t, a), 0), deo = T.deo(), mo = DS.filter(d => moDuoc(t, d));
const xong = a => bacDa(t, a) >= a.m.length;
const nXong = TT.filter(xong).length;
const loc = T.loc === 'lam' ? a => !xong(a) : T.loc === 'xong' ? xong : () => true;
const nut = (k, ten) => `<button data-act="tt-loc" data-k="${k}" class="${T.loc === k ? 'on' : ''}">${ten}</button>`;
const dhNut = mo.length
? `<button data-act="tt-deo" data-id="" class="${deo ? '' : 'on'}">ไม่สวมฉายา</button>` +
mo.map(d => `<button data-act="tt-deo" data-id="${d.id}" class="${deo && deo.id === d.id ? 'on' : ''}">${esc(d.bieu)} ${esc(d.ten)}</button>`).join('')
: '<span class="dim">ยังไม่มีฉายาที่ปลดล็อก ความสำเร็จที่มีสัญลักษณ์ 🔒 เมื่อผ่านระดับนั้นจะปลดล็อกฉายาให้ใช้งาน</span>';
const nhom = NHOM.map(g => {
const ds = TT.filter(a => a.g === g[0] && loc(a));
return ds.length ? `<h3>${g[1]}</h3><div class="tt-luoi">${ds.map(a => o(a, P, t)).join('')}</div>` : '';
}).join('');
return `<div class="readout tt-dau">🎖 สำเร็จแล้ว <b>${dat}</b> / ${TONG_BAC} ระดับ · ปลดล็อก <b>${mo.length}</b> / ${DS.length} ฉายา
        ผ่านแต่ละระดับจะได้รับรางวัลครั้งเดียว: ทองแดง +${THUONG[1]} ฿ · เงิน +${THUONG[2]} ฿ · ทอง +${THUONG[3]} ฿<br>
        ฉายาที่สวมใส่อยู่: ${deo ? `<b class="tt-deo">${esc(deo.bieu)} ${esc(deo.ten)}</b>` : '<span class="dim">ยังไม่ได้สวม</span>'}
        <span class="dim">— แสดงข้างชื่อของคุณเมื่อเล่นออนไลน์</span></div>
      <div class="btnrow tt-dh">${dhNut}</div>
      <div class="btnrow tt-loc">${nut('tat', `ทั้งหมด (${TT.length})`)}${nut('lam', `กำลังทำ (${TT.length - nXong})`)}${nut('xong', `สำเร็จครบ (${nXong})`)}</div>
      ${nhom || '<p class="dim tt-trong">ยังไม่มีความสำเร็จในหมวดนี้</p>'}
      <p class="dim tt-nho">รางวัลจะจ่ายเฉพาะเมื่อทำสำเร็จขณะเล่นบนเครื่องนี้ ความสำเร็จที่มีอยู่เดิมหรือทำจากเครื่องอื่นจะบันทึกไว้ให้แต่ไม่จ่ายรางวัลซ้ำ</p>`;
}
function hanh(act, btn) {
const d = (btn && btn.dataset) || {}, t = S(true);
if (!t) return;
if (act === 'tt-loc') { T.loc = d.k === 'lam' || d.k === 'xong' ? d.k : 'tat'; if (CC.CongDong) CC.CongDong.veLai('thanhtich'); return; }
if (act === 'tt-deo') {
const dh = DS_BY[d.id];
if (dh && moDuoc(t, dh)) { t.deo = dh.id; UI.toast(`สวมฉายา ${dh.bieu} ${dh.ten} แล้ว`, 'good'); }
else if (!d.id) { delete t.deo; UI.toast('ถอดฉายาออกแล้ว', 'info'); }
else return;
CC.save();
if (CC.CongDong) CC.CongDong.veLai('thanhtich');
}
}
if (CC.CongDong) CC.CongDong.them({
id: 'thanhtich', ten: 'ความสำเร็จ', bieu: '🎖', thuTu: 10,
ve,
sau: () => { const t = S(false); if (t && t.n) { delete t.n; CC.save(); } T.moi = {}; },
so: () => { const t = S(false); return t ? n0(t.n) : 0; }
});
})();