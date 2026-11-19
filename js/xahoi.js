(function () {
const X = CC.XaHoi = {};
const QS = new URLSearchParams(location.search), HOST = location.hostname;
const LOCAL = location.protocol === 'file:' || HOST === 'localhost' || HOST === '127.0.0.1' || HOST === '[::1]' || /\.localhost$/.test(HOST);
const DEV_URL = LOCAL ? QS.get('online') || '' : '';
const DEV_THU = DEV_URL ? QS.get('thu') || '' : '';
const thu = () => { const m = /^(.{1,20}):([2-9A-HJ-NP-Z]{6})$/.exec(DEV_THU); return m ? { ten: m[1], ma: m[2] } : null; };
function goc() {
const u = String(DEV_URL || CC.ONLINE_URL || '').trim().replace(/\/+$/, '');
return /^(wss?|https?):\/\/[^\s/?#]+/i.test(u) ? u.replace(/^ws/i, 'http') + '/xh' : '';
}
X.co = () => !!goc();
X.thu = () => !!thu();
function docVe(v) {
try {
const p = String(v || '').split('.');
if (p.length !== 3) return null;
const s = atob(p[1].replace(/-/g, '+').replace(/_/g, '/'));
const o = JSON.parse(decodeURIComponent(Array.prototype.map.call(s, c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
return o && typeof o.m === 'string' ? { ma: o.m, ten: typeof o.n === 'string' ? o.n : '' } : null;
} catch (e) { return null; }
}
X.toi = () => {
const t = thu();
if (t) return t;
const T = CC.TaiKhoan, v = T && T.ve && T.ve(), o = v && docVe(v);
if (o) return { ma: o.ma, ten: (T.ten && T.ten()) || o.ten };
return null;
};
X.sanSang = () => !!thu() || !!(CC.TaiKhoan && CC.TaiKhoan.ten && CC.TaiKhoan.ten());
async function layVe(moi) {
const t = thu();
if (t) return `thu:${encodeURIComponent(t.ten)}:${t.ma}`;
const T = CC.TaiKhoan;
if (!T || !T.xinVe) return '';
try { return (await T.xinVe(!!moi)) || ''; } catch (e) { return ''; }
}
X.goi = async (path, opt) => {
opt = opt || {};
const g = goc();
if (!g) return { ok: false, why: 'tat' };
const h = {};
if (opt.ve || opt.veNeuCo) {
const v = opt.ve ? await layVe(opt._veMoi) : (thu() ? await layVe() : (CC.TaiKhoan && CC.TaiKhoan.ve && CC.TaiKhoan.ve()) || '');
if (v) h['x-ve'] = v;
else if (opt.ve) return { ok: false, why: 've' };
}
const init = { method: opt.gui ? 'POST' : 'GET', headers: h, cache: 'no-store' };
if (opt.gui) { h['content-type'] = 'application/json'; init.body = JSON.stringify(opt.gui); }
let hen = null;
if (typeof AbortController === 'function') { const ac = new AbortController(); init.signal = ac.signal; hen = setTimeout(() => ac.abort(), opt.cho || 9000); }
try {
const r = await fetch(g + path, init);
if (r.status === 404) return { ok: false, why: 'cu' };
let j = null;
try { j = await r.json(); } catch (e) { j = null; }
if (!j || typeof j !== 'object') return { ok: false, why: 'loi' };
if (j.ok === false && j.why === 've' && h['x-ve'] && opt.ve && !opt._veMoi && !thu()) return X.goi(path, Object.assign({}, opt, { _veMoi: true }));
return j;
} catch (e) {
return { ok: false, why: 'mang' };
} finally {
if (hen) clearTimeout(hen);
}
};
const LOI = {
tat: 'เซิร์ฟเวอร์ออนไลน์ยังไม่เปิดให้บริการ',
cu: 'เซิร์ฟเวอร์ออนไลน์ยังไม่ได้อัปเดตสำหรับฟีเจอร์นี้ ผู้พัฒนากำลังปรับปรุง กรุณากลับมาใหม่ภายหลัง',
mang: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง',
ve: 'ต้องเข้าสู่ระบบ Google และตั้งชื่อผู้เล่น (ในหน้าต่าง 👤 บัญชี) จึงจะใช้ฟีเจอร์นี้ได้',
sai: 'ข้อมูลที่ส่งไม่ถูกต้อง',
nhieu: 'คุณดำเนินการถี่เกินไป กรุณารอสักครู่แล้วลองใหม่',
cam: 'บัญชีนี้ถูกระงับการเล่นออนไลน์ชั่วคราว',
'khong-co': 'ไม่พบข้อมูล',
quyen: 'ฟีเจอร์นี้สำหรับผู้ดูแลเกมเท่านั้น',
loi: 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ในอีกสักครู่'
};
X.loi = why => LOI[why] || LOI.loi;
X.kg = w => (w >= 10 ? w.toFixed(1) : w.toFixed(2)) + ' กก.';
X.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
X.luc = t => {
if (!t) return '';
const d = Date.now() - t, m = Math.floor(d / 60e3);
if (m < 1) return 'เมื่อสักครู่';
if (m < 60) return m + ' นาทีที่แล้ว';
if (m < 24 * 60) return Math.floor(m / 60) + ' ชั่วโมงที่แล้ว';
if (m < 48 * 60) return 'เมื่อวาน';
const x = new Date(t);
return x.getDate() + '/' + (x.getMonth() + 1);
};
})();