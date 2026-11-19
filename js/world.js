(function () {
const U = CC.U = {};
U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
U.lerp = (a, b, t) => a + (b - a) * t;
U.rand = (a, b) => a + Math.random() * (b - a);
U.randi = (a, b) => Math.floor(U.rand(a, b + 1));
U.chance = p => Math.random() < p;
U.smooth = (a, b, x) => { const t = U.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
U.gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
U.pickWeighted = (list, wfn) => {
let tot = 0; const ws = list.map(x => { const w = Math.max(0, wfn(x)); tot += w; return w; });
if (tot <= 0) return null;
let r = Math.random() * tot;
for (let i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return list[i]; }
return list[list.length - 1];
};
const hexCache = {};
U.hex = h => {
if (hexCache[h]) return hexCache[h];
const n = parseInt(h.slice(1), 16);
return (hexCache[h] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
};
U.mix = (c1, c2, t) => {
const a = U.hex(c1), b = U.hex(c2);
return [U.lerp(a[0], b[0], t), U.lerp(a[1], b[1], t), U.lerp(a[2], b[2], t)];
};
U.rgb = (c, alpha) => alpha == null
? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
: `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${alpha})`;
U.fmtKg = w => (w < 1 ? Math.round(w * 1000) + ' g' : w.toFixed(2) + ' kg');
U.fmtMoney = k => Math.round(k).toLocaleString('th-TH');
CC.MAXD = 9.5;
CC.MAXDEPTH = 2.6;
CC.spotSeed = 1.7;
CC.spotDepth = 2.2;
CC.bottomDepth = d => {
d = Math.max(0, d);
const s = CC.spotSeed;
return CC.spotDepth - 0.85 + 0.85 * U.smooth(0, 6, d) + 0.03 * Math.sin(d * 2.1 + s) + 0.015 * Math.sin(d * 5.3 + s * 2);
};
CC.WEEDS = [];
CC.isWeed = d => CC.WEEDS.some(w => d >= w[0] && d <= w[1]);
const W = CC.world = {
minutes: 5 * 60 + 30, day: 1,
weather: 'sunny', wind: 2, windDir: 1, temp: 27, nextWeather: 180,
timeScale: 0.2
};
W.hour = () => W.minutes / 60;
W.clock = () => {
const h = Math.floor(W.minutes / 60), m = Math.floor(W.minutes % 60);
return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
};
W.timeWeights = () => {
const h = W.hour();
const g = (c, w) => { let dh = Math.abs(h - c); dh = Math.min(dh, 24 - dh); return Math.exp(-(dh * dh) / (2 * w * w)); };
const raw = {
dawn: g(6, 0.9),
dusk: g(18, 0.9),
day: U.smooth(6.8, 8, h) * (1 - U.smooth(16.2, 17.4, h)),
night: U.clamp(1 - U.smooth(4.2, 5.4, h) + U.smooth(19.2, 20.4, h), 0, 1)
};
const s = raw.dawn + raw.dusk + raw.day + raw.night || 1;
for (const k in raw) raw[k] /= s;
return raw;
};
W.periodName = () => {
const t = W.timeWeights();
let best = 'day', v = -1;
for (const k in t) if (t[k] > v) { v = t[k]; best = k; }
return { dawn: 'รุ่งสาง', day: 'กลางวัน', dusk: 'พลบค่ำ', night: 'กลางคืน' }[best];
};
W.light = () => {
const h = W.hour();
const elev = Math.sin(((h - 6) / 12) * Math.PI);
return U.smooth(-0.28, 0.3, elev);
};
const SKY = [
[0, '#060b1c', '#142039'], [4.5, '#0b1230', '#25284a'], [5.5, '#3b3b70', '#e08a6a'],
[6.6, '#6aa0d8', '#f4c48a'], [8, '#5aa6e6', '#b8dcf2'], [12, '#3f8fde', '#a9d6f5'],
[16, '#5a9ad8', '#c7def0'], [17.4, '#6a7fc0', '#f2b27a'], [18.4, '#3d3f78', '#e8735a'],
[19.5, '#141a3a', '#3a2f50'], [21, '#060b1c', '#142039'], [24, '#060b1c', '#142039']
];
W.sky = () => {
const h = W.hour();
let i = 0;
while (i < SKY.length - 2 && SKY[i + 1][0] <= h) i++;
const a = SKY[i], b = SKY[i + 1];
const t = (h - a[0]) / (b[0] - a[0]);
let top = U.mix(a[1], b[1], t), bot = U.mix(a[2], b[2], t);
const cl = CC.WEATHERS[W.weather].cloud * 0.55;
const grey = (c, k) => c.map(v => U.lerp(v, (c[0] + c[1] + c[2]) / 3 * 0.9, k));
top = grey(top, cl); bot = grey(bot, cl);
return { top, bot };
};
Object.assign(W, { windBase: 2, cloud: 0.1, rainAmt: 0, preRain: 0, waterTemp: 25.5, gustT: 0 });
W.info = () => CC.WEATHERS[W.weather] || CC.WEATHERS.sunny;
W.setWeather = w => {
W.weather = CC.WEATHERS[w] ? w : 'cloudy';
const I = W.info();
W.windBase = U.rand(I.wind[0], I.wind[1]);
W.windAngle = U.rand(0, Math.PI * 2);
W.windDir = Math.cos(W.windAngle) >= 0 ? 1 : -1;
W.nextWeather = U.rand(I.dur[0], I.dur[1]);
};
W.rollWeather = () => {
const opts = CC.WEATHER_NEXT[W.weather] || CC.WEATHER_NEXT.cloudy;
const keys = Object.keys(opts);
W.setWeather(U.pickWeighted(keys, k => opts[k]));
};
W.sunLight = () => U.smooth(-0.28, 0.3, Math.sin(((W.hour() - 6) / 12) * Math.PI));
W.update = (dtGame, dtReal) => {
W.minutes += dtGame;
if (W.minutes >= 1440) { W.minutes -= 1440; W.day++; }
W.nextWeather -= dtGame;
if (W.nextWeather <= 0) {
const old = W.weather;
W.rollWeather();
if (old !== W.weather && CC.UI) CC.UI.toast(`${W.info().icon} ${W.info().name} — ${W.changeHint()}`, 'info');
}
const I = W.info();
const k = Math.min(1, dtGame / 20);
W.cloud += (I.cloud - W.cloud) * k;
W.rainAmt += (I.rain - W.rainAmt) * k;
W.preRain = W.weather === 'overcast' ? Math.min(1, W.preRain + dtGame / 30) : Math.max(0, W.preRain - dtGame / 20);
W.gustT += dtReal != null ? dtReal : dtGame / W.timeScale;
const T = W.gustT, gust = 0.75 + 0.25 * Math.sin(T * 0.37) + 0.15 * Math.sin(T * 1.13 + 1.7) + 0.1 * Math.sin(T * 2.9 + 0.4);
W.wind = W.windBase * Math.max(0.2, gust);
const h = W.hour();
W.temp = 27 + 5 * Math.sin(((h - 9) / 24) * 2 * Math.PI) + I.tempOfs + 2 * W.sunLight() * (1 - W.cloud);
W.waterTemp += (W.temp - 1.5 - W.waterTemp) * Math.min(1, dtGame / 240);
};
W.comfort = sp => { const t = sp.temp || { opt: 27, tol: 6 }; return Math.exp(-(((W.waterTemp - t.opt) / t.tol) ** 2)); };
W.activity = sp => {
const tw = W.timeWeights();
const tod = tw.dawn * sp.time.dawn + tw.day * sp.time.day + tw.dusk * sp.time.dusk + tw.night * sp.time.night;
return tod * W.info().bite * (0.35 + 0.65 * W.comfort(sp)) * (1 + 0.6 * W.preRain) * (W.rainAmt > 0.7 ? 0.85 : 1);
};
W.meanActivity = list => {
let s = 0, wt = 0;
for (const sp of list || CC.FISH) { if (sp.tap) continue; s += W.activity(sp) * sp.abund; wt += sp.abund; }
return wt > 0 ? s / wt : 1;
};
W.mood = sp => {
const dim = 1 - W.sunLight() * (1 - 0.7 * W.cloud);
let m = 0.15 + 0.45 * W.comfort(sp) + 0.2 * dim + 0.25 * W.preRain;
if (W.weather === 'drizzle') m += 0.1;
if (W.weather === 'windy') m -= 0.05;
if (W.rainAmt > 0.7) m -= 0.08;
return U.clamp(m, 0.05, 1);
};
W.waveAmp = () => 0.5 + W.wind * 0.3 + W.rainAmt * 0.9;
W.changeHint = () => {
const I = W.info(), h = W.hour();
return I.hintNoon && h > 10 && h < 15 ? I.hintNoon : I.hint;
};
})();
