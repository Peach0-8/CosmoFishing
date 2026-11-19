(function () {
const U = CC.U;
const $ = id => document.getElementById(id);
const UI = CC.UI = { PANELS: {} };
const SAVE_KEY = 'cauca_dai_v1';
UI.SAVE_KEY = SAVE_KEY;
CC.newProfile = () => ({
money: 500,
rods: ['d36'], rod: 'd36', lines: ['l15'], line: 'l15',
hooks: ['i3'], hook: 'i3', floats: ['nano12'], float: 'nano12',
lead: 1.2, set: 150, learn: true, xa: false, pondId: 'rophi', leaders: 12,
skins: { owned: [], eq: {} },
inv: { nen: 12, tanh: 8, thom: 4, soi: 4, ra: 8, cam: 12, chua: 2, mat: 0, dinh: 2, bongtuyet: 2 },
bowls: { cau: null, xa: null },
keep: [], journal: {}, ca: null,
stats: { caught: 0, released: 0, lost: 0, earned: 0, cas: 0 },
world: null
});
CC.save = () => {
const P = CC.P, Wd = CC.world;
P.world = { minutes: Wd.minutes, day: Wd.day, weather: Wd.weather, wind: Wd.wind, windDir: Wd.windDir, windAngle: Wd.windAngle,
windBase: Wd.windBase, nextWeather: Wd.nextWeather, cloud: Wd.cloud, rainAmt: Wd.rainAmt, preRain: Wd.preRain, waterTemp: Wd.waterTemp };
try { localStorage.setItem(SAVE_KEY, JSON.stringify(P)); } catch (e) {   }
};
CC.load = () => {
let P = null;
try { const s = localStorage.getItem(SAVE_KEY); if (s) P = JSON.parse(s); } catch (e) { P = null; }
UI.firstRun = !P;
const base = CC.newProfile();
if (!P) { CC.world.minutes = 6 * 60 + 30; return base; }
P = Object.assign(base, P);
P.inv = Object.assign(CC.newProfile().inv, P.inv || {});
P.bowls = P.bowls || { cau: null, xa: null };
P.skins = Object.assign({ owned: [], eq: {} }, P.skins || {});
if (P.leaders == null) P.leaders = 12;
if (P.world) {
Object.assign(CC.world, P.world);
if (!CC.WEATHERS[CC.world.weather]) CC.world.setWeather('cloudy');
if (P.world.windBase == null) CC.world.windBase = P.world.wind || 2;
}
return P;
};
UI.init = () => {
document.querySelectorAll('[data-panel]').forEach(b => b.addEventListener('click', () => UI.open(b.dataset.panel)));
$('btn-sound').addEventListener('click', () => {
CC.Audio.init();
$('btn-sound').textContent = CC.Audio.toggle() ? '🔊' : '🔈';
});
$('btn-setup').addEventListener('click', () => CC.Game.openSetup());
$('btn-learn').addEventListener('click', () => CC.Game.toggleLearn());
$('btn-mix').addEventListener('click', () => CC.Game.openMix());
$('btn-xa').addEventListener('click', () => CC.Game.toggleXa());
$('btn-map').addEventListener('click', () => UI.open('map'));
$('btn-view').addEventListener('click', () => CC.Game.toggleView());
$('btn-watch').addEventListener('click', () => CC.View3D && CC.View3D.toggleWatch && CC.View3D.toggleWatch());
$('a-net').addEventListener('click', () => CC.Game.net());
$('btn-fs').addEventListener('click', () => UI.toggleFullscreen());
['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, () => UI.fsUpdate()));
UI.fsUpdate(true);
$('panel-close').addEventListener('click', () => UI.close());
$('overlay').addEventListener('pointerdown', e => { if (e.target.id === 'overlay' && !UI.locked) UI.close(); });
$('panel-body').addEventListener('click', e => {
const b = e.target.closest('[data-act]');
if (b) UI.onAction(b.dataset.act, b);
});
document.addEventListener('click', e => { const b = e.target.closest('button'); if (b) b.blur(); });
document.querySelectorAll('.hud, #overlay').forEach(el => el.addEventListener('pointerdown', e => e.stopPropagation()));
UI.refresh();
};
UI.refresh = () => {
const P = CC.P;
$('h-money').textContent = U.fmtMoney(P.money);
$('g-rod').textContent = CC.rod().name;
$('g-line').textContent = CC.line().name;
$('g-hook').textContent = CC.hook().name;
$('g-float').textContent = CC.float().name;
const G = CC.G;
if (G && G.rig) {
const can = CC.Rig.canValue(G.rig);
const cau = CC.Rig.cauValue(G.rig, CC.bottomDepth(G.spotX) * 100);
$('g-rig').textContent = `ตั้ง ${CC.Rig.fmt(can)} · ตก ${CC.Rig.fmt(cau)}`;
$('g-depth').textContent = `ทุ่น ${(P.set / 100).toFixed(2)} ม. · ก้นหลุม ${CC.bottomDepth(G.spotX).toFixed(2)} ม.`;
}
$('btn-learn').classList.toggle('on', !!P.learn);
$('btn-xa').classList.toggle('on', !!P.xa);
$('btn-view').classList.toggle('on', !!(CC.View3D && CC.View3D.on));
const b = P.bowls || {};
$('g-bowls').textContent = `ชามเหยื่อตก: ${b.cau ? b.cau.portions : '–'} · ชามเหยื่ออ่อย: ${b.xa ? b.xa.portions : '–'} · สายหน้า: ${P.leaders}`;
const ca = P.ca;
$('g-spot').textContent = ca && ca.active && ca.o ? `ช่อง ${ca.o}` : '';
const kg = P.keep.reduce((s, f) => s + f.w, 0);
$('h-keep').textContent = `${P.keep.length} ตัว · ${kg.toFixed(2)} กก.`;
lastClock = '';
lastMin = null;
};
let lastClock = '', lastMin = null;
UI.tick = () => {
const Wd = CC.world, m = Math.floor(Wd.minutes);
if (m === lastMin) return;
lastMin = m;
const c = Wd.clock();
if (c === lastClock) return;
lastClock = c;
$('h-clock').textContent = c;
$('h-day').textContent = `${CC.weekdayName(Wd.day)} · ${Wd.periodName()}`;
const w = CC.WEATHERS[Wd.weather];
$('h-weather').textContent = `${w.icon} ${w.name} · ${Math.round(Wd.temp)}°C`;
$('h-wind').textContent = `ลม ${Wd.wind.toFixed(1)} ม./วิ`;
const ca = CC.P.ca;
if (ca && ca.active) {
const left = Math.max(0, ca.end - (Wd.minutes + (Wd.day - ca.day) * 1440));
$('h-ca').textContent = `เหลือเวลา ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`;
} else $('h-ca').textContent = 'ยังไม่เริ่มรอบ';
};
UI.touch = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
const touchText = txt => txt
.replace(/ · C: ตั้งทุ่น · V: ดูใต้น้ำ · G: มุมกล้อง/, '')
.replace(/กดเมาส์ค้าง \/ Space/g, 'แตะค้าง')
.replace(/คลิก \/ Space/g, 'แตะหน้าจอ')
.replace(/กด C/g, 'แตะ ตั้งทุ่น')
.replace(/ขยับเมาส์ \(หรือ W\/S\) ปรับมุมคัน/g, 'ลากนิ้วเพื่อปรับทิศทางปลายคัน')
.replace(/กด E \(ช้อนปลา\)/g, 'แตะ ช้อนปลา');
UI.touchText = touchText;
let stIn = null, stOut = null;
UI.status = txt => {
if (txt === stIn) { if (stOut === $('status').textContent) return; } else { stIn = txt; stOut = UI.touch ? touchText(txt) : txt; }
const el = $('status'); if (el.textContent !== stOut) el.textContent = stOut;
};
const later = [];
UI.toast = (msg, type, ms) => {
if (document.body.classList.contains('fighting') && /^✅ ภารกิจ/.test(msg)) { later.push([msg, type, ms]); return; }
const box = $('toasts');
for (const t of box.children) if (t.textContent === msg && !t.classList.contains('out')) return;
const el = document.createElement('div');
el.className = 'toast ' + (type || '');
el.textContent = msg;
box.appendChild(el);
const max = document.body.classList.contains('fighting') ? 2 : 3;
while (box.children.length > max) box.removeChild(box.firstChild);
setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 450); }, ms || 2800);
};
const root = document.documentElement;
const fsNow = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
const fsCan = () => !!((document.fullscreenEnabled || document.webkitFullscreenEnabled) && (root.requestFullscreen || root.webkitRequestFullscreen));
const fromIcon = () => navigator.standalone === true ||
!!(window.matchMedia && window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches);
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const FS_TIP = {
ios: 'iPhone: กดปุ่มแชร์ของ Safari (สี่เหลี่ยมมีลูกศรชี้ขึ้น) → “เพิ่มไปยังหน้าจอโฮม” แล้วเปิดเกมจากไอคอนใหม่เพื่อเล่นแบบเต็มจอไร้แถบ Safari',
app: 'เบราว์เซอร์นี้ไม่รองรับโหมดเต็มจอ ลองเปิดลิงก์ด้วย Chrome (ใน LINE / Messenger: กดปุ่มสามจุด → เปิดด้วยเบราว์เซอร์) แล้วกดใหม่อีกครั้ง'
};
let fsWas = false;
UI.fsUpdate = first => {
const b = $('btn-fs');
if (!b) return;
const on = fsNow();
b.classList.toggle('hidden', !UI.touch || fromIcon());
b.innerHTML = `<span class="fs-ico"></span>${on ? 'ย่อจอ' : 'เต็มจอ'}`;
if (first === true) b.classList.toggle('glow', !on && !b.classList.contains('hidden'));
if (fsWas && !on && screen.orientation && screen.orientation.unlock) { try { screen.orientation.unlock(); } catch (e) {   } }
fsWas = on;
};
UI.toggleFullscreen = () => {
const tip = () => UI.toast(isIOS() ? FS_TIP.ios : FS_TIP.app, 'info', 9000);
$('btn-fs').classList.remove('glow');
if (fsNow()) { const ex = document.exitFullscreen || document.webkitExitFullscreen; if (ex) ex.call(document); return; }
if (!fsCan()) return tip();
let req;
try { req = root.requestFullscreen ? root.requestFullscreen({ navigationUI: 'hide' }) : root.webkitRequestFullscreen(); } catch (e) { req = Promise.reject(e); }
Promise.resolve(req).then(() => {
if (screen.orientation && screen.orientation.lock) return screen.orientation.lock('landscape').catch(() => {   });
}, tip);
};
let hudLast = {};
const setTxt = (id, s) => { if (hudLast[id] !== s) { hudLast[id] = s; $(id).textContent = s; } };
const setSt = (id, prop, v) => { const k = id + '.' + prop; if (hudLast[k] !== v) { hudLast[k] = v; $(id).style[prop] = v; } };
const setCls = (id, c) => { const k = id + '.cls'; if (hudLast[k] !== c) { hudLast[k] = c; $(id).className = c; } };
const scaleX = v => 'scaleX(' + (Math.round(U.clamp(v, 0, 1) * 1000) / 1000) + ')';
UI.fightHud = (show, d) => {
const fb = $('fightbar');
fb.classList.toggle('hidden', !show);
if (document.body.classList.contains('fighting') !== !!show) {
document.body.classList.toggle('fighting', !!show);
if (CC.RigDraw && CC.RigDraw.layoutChanged) CC.RigDraw.layoutChanged();
}
if (!show) {
hudLast = {};
['fb-phase', 'fb-warn', 'fb-hint'].forEach(id => { $(id).textContent = ''; });
later.splice(0).forEach((a, i) => setTimeout(() => UI.toast(a[0], a[1], a[2]), 900 + i * 700));
return;
}
const SCALE = 1.25;
const blink = Math.floor(performance.now() / 160) % 2 === 0;
const r = d.ratio;
setSt('fb-fill', 'transform', scaleX(r / SCALE));
setSt('fb-fill', 'background', r > 1 ? (blink ? '#ff2a1a' : '#b8160c') : r > 0.8 ? '#ef6b4a' : r > 0.55 ? '#f2c14e' : '#5fc46a');
setSt('fb-over', 'width', (U.clamp(d.over, 0, 1) * 100).toFixed(1) + '%');
setSt('fb-mark', 'left', (100 / SCALE).toFixed(1) + '%');
setSt('fb-stam', 'transform', scaleX(d.stam));
setSt('fb-stam', 'background', d.stam < 0.38 ? '#5fc46a' : d.stam < 0.6 ? '#f2c14e' : '#ef8a5a');
setTxt('fb-phase', `${d.phase.i} ${d.phase.t}`);
const w = d.warn === 'surge' ? '⚡ กำลังจะพุ่ง!' : d.warn === 'run' ? '⚡ กำลังจะวิ่ง!' : d.warn === 'shake' ? (d.nod ? '⚡ กำลังจะผงกหัว!' : '⚡ กำลังจะสะบัดหัว!') : d.warn === 'dive' ? '⚡ กำลังจะมุด!'
: d.turned ? '✔ งัดหัวปลากลับได้แล้ว!' : d.dodged ? '✔ ผ่อนรับจังหวะได้สวย!' : '';
setTxt('fb-warn', w);
setCls('fb-warn', w ? (d.warn ? 'on' : 'ok') : '');
setTxt('fb-num', `${d.T.toFixed(1)}/${d.leader.toFixed(1)} กก. · คัน ${Math.round(d.deg)}° · คัน–สาย ${Math.round(d.alpha || 0)}°${Math.abs(d.phi) > 3 ? (d.phi > 0 ? ' ➡' : ' ⬅') + Math.round(Math.abs(d.phi)) + '°' : ''}${d.arm != null && d.arm < 0.95 ? ` · แรงแขน ${Math.round(d.arm * 100)}%` : ''}`);
setTxt('fb-hint', d.hint);
setCls('fb-hint', 'fb-hint ' + (d.cls || ''));
fb.classList.toggle('holding', !!d.holding);
};
UI.fightBar = show => UI.fightHud(show);
UI.buzz = p => {
const act = navigator.userActivation ? navigator.userActivation.hasBeenActive : true;
try { if (act && UI.touch && navigator.vibrate && !(CC.P && CC.P.haptic === false)) navigator.vibrate(p); } catch (e) {   }
};
UI.actions = a => {
const b = $('a-net');
b.classList.toggle('hidden', !a.net);
b.classList.toggle('ready', !!a.ready);
const t = a.ready ? (UI.touch ? '🥅 ช้อนปลา!' : '🥅 ช้อนปลา! (E)') : (UI.touch ? '🥅 ช้อนปลา' : '🥅 ช้อนปลา (E)');
if (b.textContent !== t) b.textContent = t;
};
UI.isOpen = () => !$('overlay').classList.contains('hidden');
UI.open = (name, data) => {
if (UI.locked) return;
UI.current = name; UI.data = data;
$('panel-body').innerHTML = (UI.PANELS[name] || (() => ''))(data);
$('overlay').classList.remove('hidden');
$('panel-close').classList.remove('hidden');
if (UI.afterOpen[name]) UI.afterOpen[name](data);
};
UI.afterOpen = {};
UI.rerender = () => { const n = UI.current, d = UI.data; UI.locked = false; UI.open(n, d); UI.refresh(); CC.save(); };
UI.close = () => {
if (UI.locked) return;
$('overlay').classList.add('hidden');
UI.current = null;
UI.refresh();
CC.save();
};
UI.lock = () => { UI.locked = true; $('panel-close').classList.add('hidden'); };
UI.unlockClose = () => { UI.locked = false; UI.close(); };
UI.drawFishCard = (c, sp, sil) => {
const r = c.getBoundingClientRect();
const dp = Math.min(window.devicePixelRatio || 1, 2);
c.width = r.width * dp; c.height = r.height * dp;
const g = c.getContext('2d');
g.setTransform(dp, 0, 0, dp, 0, 0);
const ratio = (CC.FISH_RATIO && sp && CC.FISH_RATIO[sp.shape]) || 0.33;
const L = Math.min(r.width * 0.78, r.height * 2.4, r.height * 0.92 / (ratio * 1.45));
CC.drawFish(g, r.width / 2, r.height / 2, L, sp, 1, 0.6, 1, sil);
};
})();
