(function () {
const UI = CC.UI, PN = UI.PANELS;
const $ = id => document.getElementById(id);
const C = CC.CongDong = { tabs: [], cur: null };
C.them = t => {
if (!t || !t.id || typeof t.ve !== 'function' || C.tabs.some(x => x.id === t.id)) return;
C.tabs.push(t);
C.tabs.sort((a, b) => (a.thuTu || 50) - (b.thuTu || 50));
if (UI.current === 'congdong') UI.rerender();
};
const goi = (t, k) => { try { return typeof t[k] === 'function' ? t[k]() : undefined; } catch (e) { console.error('[congdong] ' + t.id + '.' + k, e); return undefined; } };
const hien = () => C.tabs.filter(t => !goi(t, 'an'));
const dang = () => { const ts = hien(); return ts.find(x => x.id === C.cur) || ts[0] || null; };
C.dangMo = id => UI.current === 'congdong' && (!id || (dang() || {}).id === id);
C.mo = id => {
const dangO = UI.current === 'congdong', doi = !!id && id !== C.cur;
if (id) C.cur = id;
if (!dangO) { UI.open('congdong'); return; }
UI.rerender();
if (doi) { const t = dang(); if (t) goi(t, 'mo'); }
};
C.veLai = id => {
if (!C.dangMo(id)) return;
const p = $('panel'), y = p ? p.scrollTop : 0;
UI.rerender();
if (p) p.scrollTop = y;
};
PN.congdong = () => {
const ts = hien(), t = dang();
if (!t) return '<h2>👥 ชุมชน</h2><p class="dim">ยังไม่มีรายการ</p>';
C.cur = t.id;
const nut = ts.map(x => {
const n = +goi(x, 'so') || 0;
return `<button data-act="cd-tab" data-id="${x.id}" class="${x.id === t.id ? 'good' : ''}">${x.bieu || ''} ${x.ten}${n ? ` <b class="cd-so">${n}</b>` : ''}</button>`;
}).join('');
let than = goi(t, 've');
if (typeof than !== 'string') than = '<p class="dim">หมวดนี้กำลังมีปัญหา ลองปิดหน้าต่างแล้วเปิดใหม่อีกครั้ง</p>';
return `<h2>👥 ชุมชน</h2><div class="btnrow cd-tabs">${nut}</div><div class="cd-than" data-tab="${t.id}">${than}</div>`;
};
UI.afterOpen.congdong = () => { const t = dang(); if (t) goi(t, 'sau'); };
const baseOpen = UI.open;
UI.open = function (name) {
const truoc = UI.current;
const r = baseOpen.apply(this, arguments);
if (name === 'congdong' && UI.current === 'congdong' && truoc !== 'congdong') { const t = dang(); if (t) goi(t, 'mo'); }
return r;
};
const baseAction = UI.onAction;
UI.onAction = function (act, btn) {
if (act !== 'cd-tab') return baseAction.apply(this, arguments);
const id = btn && btn.dataset && btn.dataset.id;
if (!id || id === C.cur) return;
C.cur = id;
UI.rerender();
const p = $('panel'); if (p) p.scrollTop = 0;
const t = dang(); if (t) goi(t, 'mo');
};
})();