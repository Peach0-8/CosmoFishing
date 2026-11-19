(function (root) {
const KINDS = ['rods', 'lines', 'hooks', 'floats'];
const EQUIP = { rods: 'rod', lines: 'line', hooks: 'hook', floats: 'float' };
const STATS = ['caught', 'lost', 'earned'];
const M = {
KINDS, EQUIP, STATS,
pick(P) {
const s = { money: +(P.money || 0), leaders: +(P.leaders || 0), stats: {}, journal: {} };
for (const k of KINDS) { s[k] = (P[k] || []).slice(); s[EQUIP[k]] = P[EQUIP[k]] || null; }
for (const k of STATS) s.stats[k] = +((P.stats && P.stats[k]) || 0);
for (const id in P.journal || {}) {
const j = P.journal[id];
if (j) s.journal[id] = { count: +(j.count || 0), best: +(j.best || 0) };
}
return s;
},
empty() { return M.pick({}); },
diff(a, b) {
const d = { money: a.money - b.money, leaders: a.leaders - b.leaders, stats: {}, own: {}, equip: {}, journal: {} };
let n = (Math.abs(d.money) > 1e-9 ? 1 : 0) + (d.leaders ? 1 : 0);
for (const k of STATS) { const x = (a.stats[k] || 0) - (b.stats[k] || 0); if (x) { d.stats[k] = x; n++; } }
for (const k of KINDS) {
const add = (a[k] || []).filter(id => !(b[k] || []).includes(id));
if (add.length) { d.own[k] = add; n++; }
if (a[EQUIP[k]] && a[EQUIP[k]] !== b[EQUIP[k]]) { d.equip[EQUIP[k]] = a[EQUIP[k]]; n++; }
}
for (const id in a.journal) {
const ja = a.journal[id], jb = b.journal[id] || { count: 0, best: 0 };
const dc = ja.count - jb.count;
if (dc || ja.best > jb.best) { d.journal[id] = { count: dc, best: ja.best }; n++; }
}
d.empty = n === 0;
return d;
},
apply(s, d) {
const r = JSON.parse(JSON.stringify(s));
if (!d) return r;
r.money = Math.max(0, Math.round((r.money + (d.money || 0)) * 1000) / 1000);
r.leaders = Math.max(0, r.leaders + (d.leaders || 0));
for (const k of STATS) r.stats[k] = Math.max(0, (r.stats[k] || 0) + ((d.stats && d.stats[k]) || 0));
for (const k of KINDS) {
r[k] = r[k] || [];
for (const id of (d.own && d.own[k]) || []) if (!r[k].includes(id)) r[k].push(id);
const eq = d.equip && d.equip[EQUIP[k]];
if (eq && r[k].includes(eq)) r[EQUIP[k]] = eq;
}
for (const id in (d.journal || {})) {
const j = r.journal[id] || { count: 0, best: 0 }, x = d.journal[id];
r.journal[id] = { count: Math.max(0, j.count + (x.count || 0)), best: Math.max(j.best, x.best || 0) };
}
return r;
},
mergeFirst(local, server) {
const r = JSON.parse(JSON.stringify(server));
r.money = Math.max(local.money, server.money);
r.leaders = Math.max(local.leaders, server.leaders);
for (const k of STATS) r.stats[k] = Math.max(local.stats[k] || 0, server.stats[k] || 0);
for (const k of KINDS) for (const id of local[k] || []) if (!r[k].includes(id)) r[k].push(id);
for (const id in local.journal) {
const a = local.journal[id], b = r.journal[id] || { count: 0, best: 0 };
r.journal[id] = { count: Math.max(a.count, b.count), best: Math.max(a.best, b.best) };
}
return r;
},
store(P, s) {
P.money = s.money; P.leaders = s.leaders;
P.stats = Object.assign(P.stats || {}, s.stats);
for (const k of KINDS) { P[k] = s[k].slice(); if (s[EQUIP[k]]) P[EQUIP[k]] = s[EQUIP[k]]; }
P.journal = P.journal || {};
for (const id in s.journal) P.journal[id] = Object.assign(P.journal[id] || {}, s.journal[id]);
return P;
}
};
if (typeof module !== 'undefined' && module.exports) module.exports = M;
else { root.CC = root.CC || {}; root.CC.SyncModel = M; }
})(typeof self !== 'undefined' ? self : this);
