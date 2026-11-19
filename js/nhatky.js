(function () {
const U = CC.U, UI = CC.UI, PN = UI.PANELS;
const NK = CC.NhatKy = { MAX: 300, MAX_BYTES: 11500, tab: 'ca', loai: null, xem: null, trang: 1 };
const A64 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
const REC = 18, DAY0 = Date.UTC(2026, 0, 1) / 864e5, PAGE = 40;
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const enc = (n, w) => {
n = Math.round(+n) || 0;
const max = Math.pow(64, w) - 1;
n = n < 0 ? 0 : n > max ? max : n;
let s = '';
for (let i = 0; i < w; i++) { s = A64[n % 64] + s; n = Math.floor(n / 64); }
return s;
};
const dec = s => { let n = 0; for (let i = 0; i < s.length; i++) n = n * 64 + A64.indexOf(s[i]); return n; };
const safe = s => String(s == null ? '' : s).replace(/[^\w-]/g, '').slice(0, 24);
const strs = a => Array.isArray(a) && a.every(x => typeof x === 'string');
const blank = () => ({ v: 1, c: [], s: [], w: [], e: '' });
const ok = k => !!k && typeof k === 'object' && k.v === 1 && strs(k.c) && strs(k.s) && strs(k.w) &&
typeof k.e === 'string' && k.e.length % REC === 0 && /^[\w-]*$/.test(k.e);
const store = () => { const P = CC.P; return P && ok(P.nk) ? P.nk : null; };
const today = () => Math.max(0, Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5) - DAY0);
const baitStr = b => {
if (!b || !b.parts) return '';
const a = [];
for (const id in b.parts) { const n = Math.round(+b.parts[id]); if (n > 0 && safe(id)) a.push(safe(id) + '=' + Math.min(n, 99)); }
return a.length ? a.join('.') + '@' + Math.round(U.clamp(+b.water || 0.9, 0, 3) * 100) : '';
};
const baitOf = s => {
if (!s) return null;
const at = s.lastIndexOf('@'), parts = {};
(at >= 0 ? s.slice(0, at) : s).split('.').forEach(p => { const i = p.indexOf('='); if (i > 0) parts[p.slice(0, i)] = +p.slice(i + 1) || 0; });
return { parts, water: at >= 0 ? (+s.slice(at + 1) || 90) / 100 : 0.9 };
};
const ctxStr = e => [safe(e.pond), Math.round(+e.seat) || 0, Math.round(+e.day) || 0, Math.round(+e.real) || 0,
safe(e.rod), safe(e.line), safe(e.hook), safe(e.float), baitStr(e.bait)].join('|');
const intern = (arr, s) => { let i = arr.lastIndexOf(s); if (i < 0) { i = arr.length; arr.push(s); } return i; };
function pack(k, e) {
const ci = intern(k.c, ctxStr(e)), si = intern(k.s, safe(e.id)), wi = intern(k.w, safe(e.weather));
const fl = (e.how === 'vot' ? 1 : 0) | (e.record ? 2 : 0) | (e.first ? 4 : 0) | (e.tagged ? 8 : 0) | (e.xa ? 16 : 0);
return enc(ci, 2) + enc(si, 1) + enc(e.w * 1000, 3) + enc(e.len * 10, 2) + enc(e.min, 2) + enc(wi, 1) +
enc(e.wind * 5, 1) + enc((e.temp - 10) * 2, 1) + enc(e.set * 2, 2) + enc(e.time, 2) + enc(fl, 1);
}
function compact(k) {
const src = [k.c, k.s, k.w], map = [{}, {}, {}], out = [[], [], []];
const re = (t, i) => { if (map[t][i] == null) { map[t][i] = out[t].length; out[t].push(src[t][i] != null ? src[t][i] : ''); } return map[t][i]; };
let e = '';
for (let p = 0; p < k.e.length; p += REC) {
const r = k.e.substr(p, REC);
e += enc(re(0, dec(r.slice(0, 2))), 2) + enc(re(1, dec(r[2])), 1) + r.slice(3, 10) + enc(re(2, dec(r[10])), 1) + r.slice(11);
}
k.e = e; k.c = out[0]; k.s = out[1]; k.w = out[2];
}
const drop = (k, n) => { k.e = k.e.slice(Math.max(0, Math.round(n)) * REC); compact(k); };
const count = k => k.e.length / REC;
NK.size = () => { const k = store(); return k ? JSON.stringify(k).length + 6 : 0; };
NK.count = () => { const k = store(); return k ? count(k) : 0; };
function unpack(k, r, i) {
const c = (k.c[dec(r.slice(0, 2))] || '').split('|'), fl = dec(r[17]), id = k.s[dec(r[2])] || '';
return {
i, id, sp: NK.loaiCa(id), w: dec(r.slice(3, 6)) / 1000, len: dec(r.slice(6, 8)) / 10, min: dec(r.slice(8, 10)),
weather: k.w[dec(r[10])] || '', wind: dec(r[11]) / 5, temp: dec(r[12]) / 2 + 10, set: dec(r.slice(13, 15)) / 2, time: dec(r.slice(15, 17)),
how: fl & 1 ? 'vot' : 'tay', record: !!(fl & 2), first: !!(fl & 4), tagged: !!(fl & 8), xa: !!(fl & 16),
pond: c[0] || '', seat: +c[1] || 0, day: +c[2] || 1, real: +c[3] || 0, rod: c[4] || '', line: c[5] || '', hook: c[6] || '', float: c[7] || '',
bait: baitOf(c[8]), baitKey: c[8] || ''
};
}
NK.entries = () => {
const k = store(), a = [];
if (!k) return a;
for (let p = 0, i = 0; p < k.e.length; p += REC, i++) a.push(unpack(k, k.e.substr(p, REC), i));
return a;
};
NK.snapshot = d => {
const P = CC.P, G = CC.G || {}, W = CC.world, rig = G.rig || {};
const xa = rig.kind === 'xa', bowl = P.bowls && P.bowls[xa ? 'xa' : 'cau'];
const e = {
id: d.sp.id, sp: d.sp, w: +d.w || 0, len: d.len != null ? +d.len : CC.fishLength(d.sp, d.w),
pond: P.pondId || 'rophi', seat: (P.ca && P.ca.o) || 0, day: W.day, min: Math.floor(W.minutes), real: today(),
weather: W.weather, wind: +W.wind || 0, temp: +W.waterTemp || 0,
bait: bowl && bowl.parts ? { parts: Object.assign({}, bowl.parts), water: bowl.water } : null, xa,
set: +P.set || 0, rod: P.rod, line: P.line, hook: P.hook, float: P.float,
time: +d.time || 0, how: d.how === 'ช้อนสวิง' ? 'vot' : 'tay', record: !!d.record, first: !!d.first, tagged: !!d.tagged
};
e.baitKey = baitStr(e.bait);
return e;
};
NK.add = e => {
const P = CC.P;
if (!P || !e) return;
const k = store() || (P.nk = blank());
while ((k.s.length >= 64 || k.w.length >= 64 || k.c.length >= 4096) && count(k) > 0) drop(k, Math.max(1, count(k) >> 2));
k.e += pack(k, e);
if (count(k) > NK.MAX) drop(k, count(k) - NK.MAX);
while (JSON.stringify(k).length + 6 > NK.MAX_BYTES && count(k) > 1) drop(k, Math.min(10, count(k) - 1));
};
NK.record = d => { const e = NK.snapshot(d); NK.add(e); return e; };
const baseShowCatch = UI.showCatch;
UI.showCatch = function (d) {
try { if (d && d.sp && d.w > 0) d.nk = NK.record(d); } catch (err) {   }
return baseShowCatch.apply(this, arguments);
};
NK.loaiCa = id => CC.FISH_BY_ID[id] || { id, name: 'ปลาไม่ทราบชนิด', sci: '', shape: 'carp', a: 0.02, col: { body: '#8a9396', back: '#4b5558', belly: '#dfe3e0', fin: '#6f787b' } };
NK.tenHo = id => { const p = CC.PONDS_BY_ID[id]; return p ? p.name : 'บ่ออื่น'; };
NK.gio = min => String(Math.floor(min / 60) % 24).padStart(2, '0') + ':' + String(Math.floor(min % 60)).padStart(2, '0');
NK.ngayThat = (real, short) => {
const d = new Date((DAY0 + (+real || 0)) * 864e5);
return d.getUTCDate() + '/' + (d.getUTCMonth() + 1) + (short ? '' : '/' + d.getUTCFullYear());
};
NK.troi = (id, icon) => { const w = CC.WEATHERS[id]; return w ? (icon ? w.icon + ' ' : '') + w.name : 'ไม่ทราบ'; };
const ingName = id => { const g = CC.ING_BY_ID && CC.ING_BY_ID[id]; return g ? (g.ngan || (g.kind === 'สารเสริม' ? g.name : g.kind)) : id; };
NK.moi = (b, xa, noWater) => {
if (!b) return 'เหยื่อผงพื้นฐาน';
const ids = Object.keys(b.parts).filter(id => b.parts[id] > 0).sort((x, y) => b.parts[y] - b.parts[x]);
if (!ids.length) return 'เหยื่อผงพื้นฐาน';
return (xa ? 'เหยื่ออ่อย: ' : '') + ids.map(id => `${ingName(id)} ${b.parts[id]}`).join(' · ') + (noWater ? '' : ` (น้ำ ${b.water.toFixed(2)})`);
};
const byId = (list, id) => { const it = (list || []).find(x => x.id === id); return it ? it.name : (id || '—'); };
NK.doCau = e => ({ rod: byId(CC.RODS, e.rod), line: byId(CC.LINES, e.line), hook: byId(CC.HOOKS, e.hook), float: byId(CC.FLOATS, e.float) });
NK.datCa = s => (s >= 90 ? `${Math.floor(s / 60)} นาที ${String(Math.round(s % 60)).padStart(2, '0')} วิ` : `${Math.round(s)} วิ`);
NK.cachLen = e => (e.how === 'vot' ? 'ช้อนด้วยสวิง' : 'ยกขึ้นฝั่งด้วยมือ');
const ngayGame = e => `${CC.weekdayName(Math.max(1, e.day))} (วันที่ ${e.day})`;
const BUOI = [[5, 7, 'เช้ามืด', '5–7 น.'], [7, 10, 'ช่วงเช้า', '7–10 น.'], [10, 14, 'ช่วงสาย–เที่ยง', '10–14 น.'],
[14, 17, 'ช่วงบ่าย', '14–17 น.'], [17, 19, 'ช่วงเย็น', '17–19 น.'], [19, 29, 'ค่ำ–กลางคืน', '19–5 น.']];
const buoiOf = min => { let h = (min / 60) % 24; if (h < 5) h += 24; for (let i = 0; i < BUOI.length; i++) if (h >= BUOI[i][0] && h < BUOI[i][1]) return i; return 5; };
function nhom(list, keyFn, labelFn, tenFn) {
const m = {}, out = [];
list.forEach(e => {
const key = keyFn(e);
if (!m[key]) { m[key] = { key, n: 0, sum: 0, max: 0, label: labelFn(e, key), ten: tenFn(e, key) }; out.push(m[key]); }
const g = m[key];
g.n++; g.sum += e.w; if (e.w > g.max) g.max = e.w;
});
return out;
}
const best = gs => gs.reduce((a, g) => (!a || g.n > a.n || (g.n === a.n && g.sum > a.sum) ? g : a), null);
NK.kinhNghiem = id => {
const list = NK.entries().filter(e => e.id === id);
if (!list.length) return null;
const gio = nhom(list, e => buoiOf(e.min), (e, k) => `${BUOI[k][2]} <span class="dim">(${BUOI[k][3]})</span>`, (e, k) => BUOI[k][2].toLowerCase()).sort((a, b) => a.key - b.key);
const troi = nhom(list, e => e.weather, e => esc(NK.troi(e.weather, true)), e => esc(NK.troi(e.weather).toLowerCase())).sort((a, b) => b.n - a.n || b.sum - a.sum);
const moi = nhom(list, e => (e.xa ? 'x' : '') + e.baitKey, e => esc(NK.moi(e.bait, e.xa)), e => esc(NK.moi(e.bait, e.xa, true))).sort((a, b) => b.n - a.n || b.sum - a.sum);
const big = list.reduce((a, e) => (e.w > a.w ? e : a), list[0]);
return { n: list.length, tb: list.reduce((s, e) => s + e.w, 0) / list.length, big, gio, troi, moi, bGio: best(gio), bTroi: best(troi), bMoi: best(moi) };
};
function bars(gs, top, limit) {
const max = gs.reduce((m, g) => Math.max(m, g.n), 1);
return gs.slice(0, limit || 8).map(g => `<div class="nk-bar${g === top ? ' top' : ''}"><span class="nk-bl">${g.label}</span>
      <span class="nk-bt"><i style="width:${Math.max(3, Math.round(g.n / max * 100))}%"></i></span>
      <span class="nk-bn"><b>${g.n}</b> ตัว · เฉลี่ย ${U.fmtKg(g.sum / g.n)}</span></div>`).join('');
}
const dong = e => `<div class="nk-row" data-act="nk-xem" data-i="${e.i}">
      <div class="nk-r1"><b>${esc(e.sp.name)}</b> <span class="price">${U.fmtKg(e.w)}</span> <span class="dim">· ${e.len.toFixed(0)} ซม.</span>
        ${e.record ? `<span class="nk-kl">★ ${e.first ? 'สายพันธุ์ใหม่' : 'สถิติใหม่'}</span>` : ''}${e.tagged ? '<span class="nk-kl">🏷 ติดป้ายรางวัล</span>' : ''}</div>
      <div class="nk-r2 dim">${NK.ngayThat(e.real, true)} · ${CC.weekdayName(Math.max(1, e.day))} ${NK.gio(e.min)} · ${esc(NK.troi(e.weather, true))} · ลม ${e.wind.toFixed(1)} ม./วิ · น้ำ ${Math.round(e.temp)}°C · ${esc(NK.tenHo(e.pond))}${e.seat ? ', ช่อง ' + e.seat : ''}</div>
    </div>`;
function chips(all, withAll) {
const cnt = {};
all.forEach(e => { cnt[e.id] = (cnt[e.id] || 0) + 1; });
const ids = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]);
return { ids, html: `<div class="btnrow nk-chips">${withAll ? `<button data-act="nk-loai" data-id="" class="${NK.loai ? '' : 'on'}">ทั้งหมด (${all.length})</button>` : ''}
      ${ids.map(id => `<button data-act="nk-loai" data-id="${esc(id)}" class="${NK.loai === id ? 'on' : ''}">${esc(NK.loaiCa(id).name.replace(/ \(.*\)$/, ''))} (${cnt[id]})</button>`).join('')}</div>` };
}
function chiTiet(e) {
const g = NK.doCau(e);
const o = (a, b) => `<div><span>${a}</span><b>${b}</b></div>`;
return `<h2>🐟 ${esc(e.sp.name)} — ${U.fmtKg(e.w)}</h2>
      <div class="sub">${e.sp.sci ? `<i>${esc(e.sp.sci)}</i> · ` : ''}ตกวันที่ ${NK.ngayThat(e.real)} · ${esc(NK.tenHo(e.pond))}${e.seat ? ', ช่อง ' + e.seat : ''}
        ${e.record ? `<b class="nk-kl">★ ${e.first ? 'สายพันธุ์ใหม่ในสมุดบันทึก' : 'สถิติใหม่ตอนนั้น'}</b>` : ''}${e.tagged ? '<b class="nk-kl">🏷 ปลาติดป้ายรางวัล</b>' : ''}</div>
      <canvas id="nk-cv" class="nk-cv" data-fish="${esc(e.id)}"></canvas>
      <div class="nk-ct">
        ${o('น้ำหนัก', U.fmtKg(e.w))}${o('ความยาว', e.len.toFixed(0) + ' ซม.')}${o('เวลาอัดปลา', NK.datCa(e.time))}${o('วิธีนำขึ้น', NK.cachLen(e))}
        ${o('เวลาในเกม', `${NK.gio(e.min)} · ${ngayGame(e)}`)}${o('สภาพอากาศ', esc(NK.troi(e.weather, true)))}${o('ลม', e.wind.toFixed(1) + ' ม./วิ')}${o('อุณหภูมิน้ำ', e.temp.toFixed(1) + ' °C')}
        ${o('ความลึกทุ่น', (e.set / 100).toFixed(2) + ' ม.')}${o('คันเบ็ด', esc(g.rod))}${o('สายเอ็น', esc(g.line))}${o('ตัวเบ็ด', esc(g.hook))}${o('ทุ่น', esc(g.float))}
        <div class="nk-rong"><span>เหยื่อ</span><b>${esc(NK.moi(e.bait, e.xa))}</b></div>
      </div>
      <p class="btnrow"><button data-act="nk-ve">← กลับรายการ</button>${CC.KhoeCa ? '<button class="good" data-act="nk-khoe">📸 สร้างการ์ดอวดปลา</button>' : ''}</p>`;
}
function kinhNghiemHtml(all) {
const ch = chips(all, false);
if (!NK.loai || !ch.ids.includes(NK.loai)) NK.loai = ch.ids[0];
const k = NK.kinhNghiem(NK.loai), sp = NK.loaiCa(NK.loai), ten = esc(sp.name), b = k.big;
const tom = k.n >= 5
? `<b>${ten}</b>ของคุณกินดีที่สุดช่วง<b>${k.bGio.ten}</b> ตอนอากาศ<b>${k.bTroi.ten}</b> เหยื่อที่ได้ปลาบ่อยสุด: <b>${k.bMoi.ten}</b>`
: `เพิ่งบันทึก${ten}ไป <b>${k.n}</b> ตัว — ตกเพิ่มอีกสักหน่อยจึงจะเห็นแนวโน้มชัดเจน`;
return `${ch.html}
      <div class="readout nk-tom">${tom}<br>บันทึกแล้ว <b>${k.n}</b> ตัว · เฉลี่ย <b>${U.fmtKg(k.tb)}</b> · ตัวใหญ่สุด <b class="price">${U.fmtKg(b.w)}</b> (${b.len.toFixed(0)} ซม.)</div>
      <h3>ตัวที่ใหญ่ที่สุด</h3>
      ${dong(b)}
      <h3>ช่วงเวลาที่ปลากิน</h3>${bars(k.gio, k.bGio)}
      <h3>สภาพอากาศตอนปลาขึ้น</h3>${bars(k.troi, k.bTroi)}
      <h3>เหยื่อที่ได้ปลา</h3>${bars(k.moi, k.bMoi, 5)}
      <p class="dim nk-nho">นับจากปลาที่ตกได้ ${NK.MAX} ตัวล่าสุด ช่วงเวลาหรือสภาพอากาศที่คุณนั่งตกบ่อยจำนวนปลาก็มักจะเยอะกว่า — แนะนำให้ดูค่าน้ำหนักเฉลี่ยเทียบควบคู่กัน</p>`;
}
PN.nhatky = () => {
const all = NK.entries();
if (NK.xem != null && all[NK.xem]) return chiTiet(all[NK.xem]);
NK.xem = null;
const head = `<h2>📒 สมุดบันทึกการตก</h2>
      <div class="sub nk-gt">ปลาทุกตัวที่ตกได้จะถูกบันทึกเวลา สภาพอากาศ เหยื่อ และระดับความลึกทุ่นไว้ให้อัตโนมัติ เก็บข้อมูล ${NK.MAX} ตัวล่าสุด${all.length ? ` · บันทึกแล้ว <b>${all.length}</b> ตัว` : ''}</div>
      <div class="btnrow nk-tabs"><button data-act="nk-tab" data-t="ca" class="${NK.tab === 'ca' ? 'good' : ''}">🐟 ปลาที่ตกได้</button>
        <button data-act="nk-tab" data-t="kn" class="${NK.tab === 'kn' ? 'good' : ''}">💡 สถิติและประสบการณ์</button>
        <button data-act="nk-sotay">📖 สารานุกรมปลา</button></div>`;
if (!all.length) return head + '<p class="nk-trong">ยังไม่มีบันทึกการตก เมื่อตกปลาได้ระบบจะจดบันทึกให้อัตโนมัติ</p>';
if (NK.tab === 'kn') return head + kinhNghiemHtml(all);
const ch = chips(all, true);
if (NK.loai && !ch.ids.includes(NK.loai)) NK.loai = null;
const list = (NK.loai ? all.filter(e => e.id === NK.loai) : all).reverse(), show = list.slice(0, NK.trang * PAGE);
return `${head}${ch.html}<div class="nk-list">${show.map(dong).join('')}</div>
      ${list.length > show.length ? `<p><button data-act="nk-them">ดูเพิ่มเติม (อีก ${list.length - show.length} ตัว)</button></p>` : ''}
      <p class="dim nk-nho">แตะที่รายการเพื่อดูรายละเอียดสภาพแวดล้อมตอนตก และสร้างการ์ดอวดปลา</p>`;
};
UI.afterOpen.nhatky = () => {
const c = $('nk-cv');
if (c) UI.drawFishCard(c, NK.loaiCa(c.dataset.fish), null);
};
NK.open = () => { NK.xem = null; NK.trang = 1; UI.open('nhatky'); };
const baseJournal = PN.journal;
PN.journal = function () {
const h = baseJournal.apply(this, arguments), n = NK.count();
const vao = `<p class="nk-vao"><button data-act="nk-mo">📒 สมุดบันทึกการตก${n ? ` (${n} ตัว)` : ''}</button>
      <span class="dim">ดูรายละเอียดปลาที่ตกได้แต่ละตัว พร้อมเวลา อากาศ เหยื่อ และสถิติแยกตามสายพันธุ์</span></p>`;
const i = h.indexOf('<div class="grid">');
return i >= 0 ? h.slice(0, i) + vao + h.slice(i) : vao + h;
};
const baseAction = UI.onAction;
UI.onAction = function (act, btn) {
if (!act || act.slice(0, 3) !== 'nk-') return baseAction.apply(this, arguments);
const d = (btn && btn.dataset) || {};
switch (act) {
case 'nk-mo': NK.open(); return;
case 'nk-sotay': UI.open('journal'); return;
case 'nk-tab': NK.tab = d.t === 'kn' ? 'kn' : 'ca'; NK.trang = 1; UI.rerender(); return;
case 'nk-loai': NK.loai = d.id || null; NK.trang = 1; UI.rerender(); return;
case 'nk-them': NK.trang++; UI.rerender(); return;
case 'nk-xem': NK.xem = +d.i; UI.rerender(); { const p = $('panel'); if (p) p.scrollTop = 0; } return;
case 'nk-ve': NK.xem = null; UI.rerender(); return;
case 'nk-khoe': { const e = NK.entries()[NK.xem]; if (e && CC.KhoeCa) CC.KhoeCa.mo(e); return; }
}
};
})();
