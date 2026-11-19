(function () {
const A = CC.Audio = { ctx: null, on: true };
let master, noiseBuf, waterGain, rainGain;
const wantRun = () => A.on && !document.hidden;
const sync = () => {
const c = A.ctx;
if (!c || c.state === 'closed') return;
try {
const p = wantRun() ? (c.state !== 'running' ? c.resume() : null) : (c.state === 'running' ? c.suspend() : null);
if (p && p.catch) p.catch(() => {   });
} catch (e) {   }
};
document.addEventListener('visibilitychange', sync);
A.init = () => {
if (A.ctx) { if (A.ctx.state !== 'running' && wantRun()) sync(); return; }
const AC = window.AudioContext || window.webkitAudioContext;
if (!AC) return;
const ctx = A.ctx = new AC();
master = ctx.createGain();
master.gain.value = A.on ? 0.8 : 0;
master.connect(ctx.destination);
noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
const d = noiseBuf.getChannelData(0);
let last = 0;
for (let i = 0; i < d.length; i++) {
const w = Math.random() * 2 - 1;
d[i] = w;
last = last * 0.97 + w * 0.03;
}
const water = loopNoise();
const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
waterGain = ctx.createGain(); waterGain.gain.value = 0.05;
water.connect(lp).connect(waterGain).connect(master);
const rain = loopNoise();
const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1800;
rainGain = ctx.createGain(); rainGain.gain.value = 0;
rain.connect(hp).connect(rainGain).connect(master);
const cut = loopNoise();
cutFilt = ctx.createBiquadFilter(); cutFilt.type = 'bandpass'; cutFilt.frequency.value = 2400; cutFilt.Q.value = 1.8;
cutGain = ctx.createGain(); cutGain.gain.value = 0;
cut.connect(cutFilt).connect(cutGain).connect(master);
whine = ctx.createOscillator(); whine.type = 'sine'; whine.frequency.value = 900;
whineGain = ctx.createGain(); whineGain.gain.value = 0;
whine.connect(whineGain).connect(master); whine.start();
sync();
};
let cutFilt, cutGain, whine, whineGain;
let fsCut = -1, fsStrain = -1, fsOn = -1;
A.fightSound = (cut, strain) => {
if (!A.ctx || !cutGain) return;
const on = A.on ? 1 : 0;
if (on === fsOn && Math.abs(cut - fsCut) < 0.004 && Math.abs(strain - fsStrain) < 0.004) return;
fsCut = cut; fsStrain = strain; fsOn = on;
const t = A.ctx.currentTime;
cutGain.gain.setTargetAtTime(on * cut * cut * 0.16, t, 0.06);
cutFilt.frequency.setTargetAtTime(1500 + cut * 3000, t, 0.06);
const s = Math.max(0, (strain - 0.72) / 0.28);
whineGain.gain.setTargetAtTime(on * s * s * 0.035, t, 0.05);
whine.frequency.setTargetAtTime(850 + strain * 900, t, 0.05);
};
function loopNoise() {
const s = A.ctx.createBufferSource();
s.buffer = noiseBuf; s.loop = true;
s.playbackRate.value = 0.5 + Math.random() * 0.2;
s.start();
return s;
}
function burst(dur, type, freq, q, vol, delay) {
if (!A.ctx || !A.on) return;
const ctx = A.ctx, t = ctx.currentTime + (delay || 0);
const s = ctx.createBufferSource(); s.buffer = noiseBuf;
const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 1;
const g = ctx.createGain();
g.gain.setValueAtTime(vol, t);
g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
s.connect(f).connect(g).connect(master);
s.start(t, Math.random() * 1.5, dur + 0.05);
}
function tone(type, f0, f1, dur, vol, delay) {
if (!A.ctx || !A.on) return;
const ctx = A.ctx, t = ctx.currentTime + (delay || 0);
const o = ctx.createOscillator(); o.type = type;
o.frequency.setValueAtTime(f0, t);
o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
const g = ctx.createGain();
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
o.connect(g).connect(master);
o.start(t); o.stop(t + dur + 0.05);
}
A.splash = (size = 1, vol = 1) => {
if (vol < 0.03) return;
burst(0.25 + 0.35 * size, 'bandpass', 700, 0.8, 0.35 * Math.min(1.5, size) * vol);
burst(0.12, 'lowpass', 300, 1, 0.3 * size * vol);
};
A.plop = () => { tone('sine', 420, 140, 0.12, 0.25); };
A.whoosh = () => { burst(0.35, 'bandpass', 1400, 0.6, 0.18); };
A.click = () => { burst(0.018, 'highpass', 3500, 1, 0.12); };
A.dragTick = () => { burst(0.022, 'bandpass', 5200, 4, 0.16); };
A.snap = () => { tone('triangle', 1100, 70, 0.3, 0.35); burst(0.05, 'highpass', 2500, 1, 0.4); };
A.strike = () => { burst(0.18, 'bandpass', 1800, 0.7, 0.2); };
A.warn = () => { tone('sine', 190, 110, 0.16, 0.16); burst(0.14, 'lowpass', 420, 1, 0.12); };
A.jingle = () => {
[523, 659, 784, 1046].forEach((f, i) => tone('triangle', f, f, 0.22, 0.18, i * 0.09));
};
A.sad = () => { [392, 330, 262].forEach((f, i) => tone('sine', f, f * 0.97, 0.25, 0.15, i * 0.12)); };
A.coin = () => { tone('square', 988, 988, 0.08, 0.08); tone('square', 1318, 1318, 0.2, 0.08, 0.08); };
function chirp() {
const base = 2400 + Math.random() * 1400, n = 2 + (Math.random() * 3 | 0);
for (let i = 0; i < n; i++) tone('sine', base, base * 1.35, 0.07, 0.035, i * 0.11);
}
function cricket() {
for (let i = 0; i < 3; i++) tone('square', 4300, 4250, 0.025, 0.012, i * 0.05);
}
function frog() { tone('sawtooth', 160, 110, 0.14, 0.04); }
let rainV = -1, waterV = -1;
A.update = dt => {
if (!A.ctx || !A.on) return;
const W = CC.world, light = W.light();
const rain = CC.WEATHERS[W.weather].rain;
const rv = rain * 0.09, wv = 0.035 + Math.min(W.wind, 9) * 0.006;
if (Math.abs(rv - rainV) > 0.0005) { rainV = rv; rainGain.gain.value = rv; }
if (Math.abs(wv - waterV) > 0.0005) { waterV = wv; waterGain.gain.value = wv; }
if (light > 0.5 && rain < 0.5 && Math.random() < dt * 0.25) chirp();
if (light < 0.3 && Math.random() < dt * 1.2) cricket();
if (light < 0.5 && Math.random() < dt * 0.15) frog();
};
A.toggle = () => {
A.on = !A.on;
if (master) master.gain.value = A.on ? 0.8 : 0;
sync();
return A.on;
};
})();
