(function () {
const U = CC.U;
const B = CC.Bait = {};
CC.INGREDIENTS = [
{ id: 'nen', name: 'หัวเชื้อพื้นฐาน รวงทอง', ngan: 'พื้นฐาน', kind: 'พื้นฐาน', vi: 'nen', price: 40, pack: 20, color: '#d8c08a',
diss: 0, stick: 0.2, dens: 0.3, cloud: 0.2, smell: { rophi: 0.35, dieuhong: 0.35, diec: 0.35, chep: 0.3, muong: 0.3, thebe: 0.3, tramden: 0.4, mehoa: 0.3, troi: 0.35, chimtrang: 0.3, tramco: 0.35 },
desc: 'ผงพื้นฐานกลิ่นกลาง ช่วยจับตัวเป็นก้อนเหยื่อ ควรใช้ประมาณครึ่งชาม' },
{ id: 'tanh', name: 'เหยื่อคาว กุ้งแดง', ngan: 'กุ้ง', kind: 'คาว', vi: 'tanh', price: 65, pack: 20, color: '#c9785a',
diss: -0.1, stick: 0.1, dens: 0.5, cloud: 0.1, smell: { rophi: 1.0, dieuhong: 0.95, diec: 0.5, chep: 0.55, muong: 0.5, thebe: 0.7, tramden: 0.75, mehoa: 0.3, troi: 0.45, chimtrang: 0.95, tramco: 0.35 },
desc: 'กลิ่นกุ้งคาว — ปลานิล ปลาทับทิม ปลาเปคูชอบมาก ปลานิลหน้าร้อนยิ่งกินคาว ส่วนปลาตะเพียนจีนและปลาไนชอบคาวช่วงน้ำเย็น' },
{ id: 'thom', name: 'เหยื่อหอม นมข้าวโพด', ngan: 'หอมนม', kind: 'หอม', vi: 'thom', price: 55, pack: 20, color: '#efd77a',
diss: 0.1, stick: 0, dens: 0.1, cloud: 0.4, smell: { rophi: 0.45, dieuhong: 0.55, diec: 0.9, chep: 1.0, muong: 0.6, thebe: 0.6, tramden: 0.6, mehoa: 0.4, troi: 0.6, chimtrang: 0.5, tramco: 1.0 },
desc: 'กลิ่นนมข้าวโพดหวาน — ปลาไน ปลาตะเพียนจีน ปลาเฉาชอบ ได้ผลดีที่สุดช่วงน้ำเย็นกำลังดี' },
{ id: 'soi', name: 'ผงสร้างใย', ngan: 'สร้างใย', kind: 'สร้างใย', price: 50, pack: 10, color: '#f2efe6',
diss: -0.8, stick: 1.0, dens: 0.1, cloud: -0.3, smell: {},
desc: 'สร้างใยเหนียวเกาะตัวเบ็ด เหยื่อทนและแตกตัวช้า ใส่เพียง 5–10% ของชาม — ใส่มากเกินไปเหยื่อจะเหนียวตาย กลิ่นไม่ออก' },
{ id: 'ra', name: 'ผงฟู เมฆลอย', ngan: 'ผงฟู', kind: 'แตกตัว', vi: 'trangthai', price: 50, pack: 20, color: '#bfae86',
diss: 1.0, stick: -0.5, dens: -0.6, cloud: 1.0, smell: { muong: 0.4, thebe: 0.6, mehoa: 0.8, troi: 0.6 },
desc: 'แตกตัวเร็วเป็นม่านฟุ้ง — ใช้สำหรับเหยื่ออ่อยเปิดหลุม หรือผสมนิดหน่อยให้เหยื่อตกนุ่มฟูขึ้น' },
{ id: 'cam', name: 'รำข้าวคั่ว', ngan: 'รำ', kind: 'รำ', vi: 'nen', price: 20, pack: 20, color: '#a7874f',
diss: 0.5, stick: -0.3, dens: -0.3, cloud: 0.7, smell: { rophi: 0.4, dieuhong: 0.4, diec: 0.5, chep: 0.5, muong: 0.9, thebe: 0.9, tramden: 0.3, mehoa: 0.7, troi: 0.8, chimtrang: 0.4, tramco: 0.6 },
desc: 'ราคาถูก ฟูฟุ้ง หอมรำ — สร้างหลุมอ่อยได้ดี แต่เรียกรวมปลารบกวนด้วย' },
{ id: 'chua', name: 'หัวเชื้อกลิ่นเปรี้ยว', ngan: 'เปรี้ยว', kind: 'สารเสริม', vi: 'chua', price: 30, pack: 10, color: '#d9e36a',
diss: 0, stick: 0, dens: 0, cloud: 0, smell: { rophi: 0.8, dieuhong: 0.7, mehoa: 0.6, troi: 0.95, tramco: 0.7, chimtrang: 0.3 }, hot: true,
desc: 'สารเสริมกลิ่นเปรี้ยว กระตุ้นปลานิลกินจัดเมื่ออากาศร้อน (เกิน 28°C) ปลายี่สกเทศชอบเหยื่อเปรี้ยว ปลาเฉาชอบรำหมักเปรี้ยว' },
{ id: 'mat', name: 'น้ำผึ้ง', ngan: 'น้ำผึ้ง', kind: 'สารเสริม', vi: 'ngot', price: 35, pack: 10, color: '#e0a63a',
diss: -0.2, stick: 0.4, dens: 0.1, cloud: 0, smell: { chep: 0.8, diec: 0.7, thebe: 0.3, tramden: 0.5, tramco: 0.5, troi: 0.4 }, cold: true,
desc: 'หวาน ช่วยเพิ่มความเกาะตัว ปลาไนและปลาตะเพียนจีนชอบ โดยเฉพาะวันอากาศเย็น' },
{ id: 'gan', name: 'ผงตับไก่', ngan: 'ตับ', kind: 'คาว', vi: 'tanh', to: 0.6, price: 70, pack: 20, color: '#8f4a3a',
diss: -0.1, stick: 0.15, dens: 0.45, cloud: 0, smell: { rophi: 0.95, dieuhong: 0.85, chimtrang: 0.8, tramden: 0.6, chep: 0.45, troi: 0.4, diec: 0.35, tramco: 0.25, mehoa: 0.2, muong: 0.35, thebe: 0.45 },
desc: 'กลิ่นตับเข้มข้น — เหยื่อหลักปลานิลใหญ่ ปลาทับทิม ปลาเปคู ปลาเล็กไม่ค่อยกวนเท่ากลิ่นกุ้ง: เน้นดึงดูดปลาใหญ่' },
{ id: 'oc', name: 'ผงหอยขม', ngan: 'หอย', kind: 'คาว', vi: 'tanh', to: 0.6, price: 70, pack: 20, color: '#6e6a4f',
diss: 0, stick: 0.1, dens: 0.55, cloud: 0, smell: { chep: 1.0, tramden: 1.0, chimtrang: 0.6, diec: 0.5, rophi: 0.4, troi: 0.4, dieuhong: 0.35, tramco: 0.3, mehoa: 0.15, muong: 0.3, thebe: 0.35 },
desc: 'กลิ่นหอยธรรมชาติ — ของโปรดปลาไนเก่าและปลาเฉาดำ เนื้อหนัก จมไว เน้นดึงดูดปลาใหญ่' },
{ id: 'trun', name: 'ไส้เดือนแดงอบแห้ง', ngan: 'ไส้เดือน', kind: 'คาว', vi: 'tanh', cold: true, price: 90, pack: 10, color: '#a5363a',
diss: 0.2, stick: 0, dens: 0.3, cloud: 0.2, smell: { diec: 1.0, chep: 0.7, rophi: 0.6, dieuhong: 0.6, troi: 0.6, chimtrang: 0.5, tramden: 0.4, tramco: 0.3, mehoa: 0.1, muong: 0.6, thebe: 0.65 },
desc: 'ไส้เดือนแดง — ปลาตะเพียนจีนชอบที่สุด โดยเฉพาะช่วงน้ำเย็น ปลารบกวนก็ชอบเช่นกัน อย่าใส่มากเมื่อบ่อมีปลาซิวเยอะ' },
{ id: 'bongtuyet', name: 'เกล็ดหิมะ (ป่นฟู)', ngan: 'เกล็ดหิมะ', kind: 'ปรับเนื้อ', price: 45, pack: 20, color: '#f6f3ea',
diss: 0.4, stick: -0.1, dens: -0.5, cloud: 0.6, smell: {},
desc: 'ผงปรับเนื้อเหยื่อ: ก้อนเหยื่อเบา นุ่ม ฟู ดูดน้ำได้มากขึ้น ใส่ประมาณ 10% ของชาม' },
{ id: 'dinh', name: 'ผงเหนียว', ngan: 'ผงเหนียว', kind: 'ยึดเกาะ', price: 40, pack: 10, color: '#e9e4d2',
diss: -0.5, stick: 0.7, dens: 0.2, cloud: -0.2, smell: {},
desc: 'สำหรับเหยื่อปั้น (ก้อนแน่น แข็ง ทนการตอดของปลาเล็ก) ใส่ประมาณ 5% ของชาม' },
{ id: 'camnhe', name: 'รำข้าวสาลีเบา', ngan: 'รำสาลี', kind: 'ปรับเนื้อ', vi: 'trangthai', price: 25, pack: 20, color: '#c9a86a',
diss: 0.7, stick: -0.4, dens: -0.7, cloud: 0.9, smell: { mehoa: 0.7, troi: 0.5, tramco: 0.3, chep: 0.3, muong: 0.6, thebe: 0.5 },
desc: 'รำสาลีคั่วเบามาก: แตกตัวเป็นม่านหมอก ฟูจัด — ส่วนผสมหลักของเหยื่อตกปลาซ่งและเหยื่ออ่อยฟุ้ง' },
{ id: 'ngochua', name: 'ข้าวโพดหมักเปรี้ยว', ngan: 'ข้าวโพดเปรี้ยว', kind: 'หมักดอง', vi: 'chua', hot: true, price: 45, pack: 20, color: '#d6b43c',
diss: 0.3, stick: -0.1, dens: 0.2, cloud: 0.5, smell: { mehoa: 1.0, tramco: 0.95, troi: 0.8, chep: 0.7, tramden: 0.5, rophi: 0.45, dieuhong: 0.4, diec: 0.35, chimtrang: 0.3, muong: 0.3, thebe: 0.3 },
desc: 'ข้าวโพดและถั่วหมักเปรี้ยว — ปลาซ่ง ปลาเฉา ปลายี่สกเทศชอบมาก กลิ่นออกแรงช่วงแดดร้อน' },
{ id: 'gaoruou', name: 'ข้าวสารหมักเหล้า', ngan: 'ข้าวหมัก', kind: 'เมล็ด', vi: 'ngot', chiXa: true, price: 35, pack: 20, color: '#efe6c8',
diss: -0.6, stick: -0.2, dens: 0.9, cloud: -0.4, smell: { chep: 0.9, tramden: 0.6, tramco: 0.6, diec: 0.6, troi: 0.5, rophi: 0.3, mehoa: 0.3, dieuhong: 0.3, muong: 0.4, thebe: 0.3 },
desc: 'ใช้เฉพาะเหยื่ออ่อย: เมล็ดข้าวแช่เหล้าจมก้นบ่อได้นาน ปลาเล็กกินไม่หมด — รักษาหลุมได้นาน เรียกปลาไนได้ดี' },
{ id: 'huong', name: 'หัวเชื้อกลิ่นดึงดูด (ฝา)', ngan: 'หัวเชื้อ', kind: 'สารเสริม', vi: 'huong', price: 40, pack: 10, color: '#b77ad1',
diss: 0, stick: 0, dens: 0, cloud: 0, smell: { rophi: 0.7, dieuhong: 0.7, diec: 0.6, chep: 0.7, tramden: 0.5, mehoa: 0.5, troi: 0.6, chimtrang: 0.6, tramco: 0.5, muong: 0.5, thebe: 0.6 },
desc: 'หัวเชื้อแบบน้ำ นับเป็นฝา ปลาเพิ่งปล่อยชอบเหยื่อกลิ่นแรง ส่วนปลาเก่าเคี่ยวถ้าใส่เกิน 1 ฝาจะระแวงไม่กล้ากิน' }
];
CC.ING_BY_ID = {};
CC.INGREDIENTS.forEach(i => { CC.ING_BY_ID[i.id] = i; });
B.MAC = { style: 'keo', vo: 1, hat: 'vua' };
B.VO = ['นวดน้อย (~10 ครั้ง)', 'นวดพอดี (~20 ครั้ง)', 'นวดนาน (~30 ครั้ง)', 'นวดละเอียดมาก'];
B.nuocVua = (kind, style, bongTuyet) => (kind === 'xa' ? 0.68 : style === 've' ? 0.75 : 0.9) + Math.min(0.3, (bongTuyet || 0) * 1.5);
const MEN_TANH = { rophi: 1, dieuhong: 1, chimtrang: 1, tramden: 1 };
B.mua = (vi, spId, wt) => {
if (vi !== 'tanh' && vi !== 'thom') return 1;
const f = CC.FISH_BY_ID && CC.FISH_BY_ID[spId], opt = (f && f.temp && f.temp.opt) || 26;
const lanh = U.clamp((opt - 2 - wt) / 8, 0, 1), nong = U.clamp((wt - opt - 1) / 5, 0, 1);
if (vi === 'tanh') return MEN_TANH[spId] ? 1 + 0.12 * lanh + 0.15 * nong : 1 + 0.35 * lanh - 0.3 * nong;
return 1 + 0.12 * (1 - lanh - nong) - 0.12 * lanh;
};
const nuoc = () => { const W = CC.world; return W.waterTemp != null ? W.waterTemp : W.temp - 1.5; };
B.uPhut = wt => { wt = wt == null ? nuoc() : wt; return wt >= 26 ? 5 : wt >= 20 ? 8 : 12; };
B.softness = m => U.clamp(0.45 + (0.62 - m.stick) * 1.3 + (80 - m.dissolve) / 160, 0, 1);
B.mix = function (parts, water, kind, opt) {
opt = Object.assign({}, B.MAC, opt || {});
const xa = kind === 'xa', ve = !xa && opt.style === 've';
let total = 0;
const avg = { diss: 0, stick: 0, dens: 0, cloud: 0 }, mass = {};
const smell = {};
CC.FISH.forEach(f => { smell[f.id] = 0; });
const temp = CC.world.temp, wt = nuoc();
let to = 0;
for (const id in parts) {
const p = parts[id], ing = CC.ING_BY_ID[id];
if (!p || !ing) continue;
const add = ing.kind === 'สารเสริม' ? 0.3 : 1;
mass[id] = p * add; total += p * add;
for (const k in avg) avg[k] += p * add * ing[k];
let boost = 1;
if (ing.hot) boost = temp > 28 ? 1.4 : temp < 24 ? 0.5 : 0.9;
if (ing.cold) boost = temp < 25 ? 1.3 : temp > 29 ? 0.7 : 1;
for (const f in ing.smell) if (f in smell) smell[f] += p * ing.smell[f] * boost * B.mua(ing.vi, f, wt);
if (ing.to) to += ing.to * p * add;
}
if (total <= 0) return null;
for (const k in avg) avg[k] /= total;
for (const f in smell) smell[f] /= total;
const fr = id => (mass[id] || 0) / total;
const soi = fr('soi'), dinh = fr('dinh'), bt = fr('bongtuyet'), gao = fr('gaoruou');
const vua = B.nuocVua(kind, opt.style, bt), wet = (water - vua) / 0.4;
const notes = [];
let dissolve, stick, dens, cloud, smellK = 1;
if (xa) {
dissolve = 80 * Math.pow(2, -(avg.diss * 1.2 + 0.3 - 1.2 * (water - vua)));
stick = U.clamp(0.62 + avg.stick * 0.5 - 1.6 * Math.max(0, 0.6 - water) - 0.4 * Math.max(0, water - 0.9), 0, 1);
dens = U.clamp(1 + avg.dens * 0.35, 0.6, 1.5);
cloud = U.clamp(0.5 + avg.cloud * 0.5 + 0.08 - 0.6 * Math.max(0, water - 0.8) - 0.8 * Math.max(0, 0.55 - water), 0.05, 1.3);
if (water > 0.85) notes.push('เหยื่ออ่อยแฉะไป — จับตัวเป็นก้อน ไม่ฟุ้ง ปลารวมหลุมช้า เหยื่ออ่อยควรร่วนแห้ง: น้ำ 0.6–0.7');
if (water < 0.55) notes.push('เหยื่ออ่อยแห้งเกินไป — ปั้นก้อนไม่อยู่ ร่วงหลุดกลางอากาศตอนตี');
} else {
dissolve = 80 * Math.pow(2, -(avg.diss * 1.2 + wet * 0.6));
stick = U.clamp(0.62 + avg.stick * 0.5 - wet * 0.35 - Math.max(0, -wet) * 0.35, 0, 1);
dens = U.clamp(1 + avg.dens * 0.35 - wet * 0.1, 0.6, 1.5);
cloud = U.clamp(0.5 + avg.cloud * 0.5 + wet * 0.15, 0.05, 1.3);
if (ve) {
stick = U.clamp(stick + 0.06 + Math.min(0.12, dinh * 1.6), 0, 1);
dissolve *= 1.15 * (1 + Math.min(0.2, dinh * 2));
dens = U.clamp(dens * 1.05, 0.6, 1.5); cloud = U.clamp(cloud - 0.08, 0.05, 1.3); smellK *= 0.95; to += 0.05 * total;
if (dinh < 0.02 && soi < 0.03) notes.push('เหยื่อปั้นควรใส่ผงเหนียวเล็กน้อย (~5%) ให้ก้อนแน่นพอดี');
} else if (soi < 0.04) {
stick = U.clamp(stick - 0.12, 0, 1);
notes.push('เหยื่อแตะขาดผงสร้างใย — ใยไม่ออก เกาะเบ็ดไม่อยู่ (ควรใส่ 5–10%)');
}
const d = U.clamp(opt.vo | 0, 0, 3) - 1;
dissolve *= 1 + 0.18 * d; stick = U.clamp(stick + 0.04 * d, 0, 1); cloud = U.clamp(cloud - 0.06 * d, 0.05, 1.3);
if (wet > 0.6) notes.push('เหยื่อแฉะเกินไป — หลุดจากตัวเบ็ดง่ายตอนตีเหยื่อ');
if (wet < -0.6) notes.push('เหยื่อแห้งเกินไป — ปั้นยาก เกาะเบ็ดไม่ดี แตกตัวช้า');
}
if (soi > 0.12) {
const k = soi - 0.12;
dissolve *= 1 + k * 6; smellK *= Math.max(0.55, 1 - k * 2.5); cloud = U.clamp(cloud - k * 1.5, 0.05, 1.3);
notes.push(`ผงสร้างใยมากเกินไป (${Math.round(soi * 100)}%) — ก้อนเหยื่อเหนียวตาย กลิ่นไม่ออก ควรใส่แค่ 5–10%`);
}
const big = sp => sp.max >= 4, hat = xa ? 'vua' : opt.hat;
if (hat === 'min') { cloud = U.clamp(cloud + 0.08, 0.05, 1.3); dens = U.clamp(dens * 0.96, 0.6, 1.5); dissolve *= 1.08; }
if (hat === 'tho') { cloud = U.clamp(cloud - 0.08, 0.05, 1.3); dens = U.clamp(dens * 1.06, 0.6, 1.5); dissolve *= 0.92; to += 0.08 * total; }
let smax = 0;
CC.FISH.forEach(sp => {
let k = smellK;
if (hat === 'min') k *= sp.tap ? 1.12 : sp.id === 'diec' ? 1.08 : big(sp) ? 0.95 : 1;
if (hat === 'tho') k *= sp.tap ? 0.88 : sp.id === 'diec' ? 0.95 : big(sp) ? 1.1 : 1;
smell[sp.id] = Math.min(1.15, smell[sp.id] * k);
smax = Math.max(smax, smell[sp.id]);
});
if (gao > 0 && !xa) notes.push('ข้าวสารหมักเหล้าใช้กับเหยื่ออ่อยเท่านั้น — เหยื่อตกเกี่ยวเมล็ดข้าวไม่ได้');
if (kind === 'xa' && cloud < 0.6) notes.push('เหยื่ออ่อยฟุ้งน้อยไป — ปลารวมหลุมช้า');
if (kind === 'cau' && dissolve < 35) notes.push('เหยื่อตกแตกตัวเร็วเกินไป — ต้องเปลี่ยนเหยื่อบ่อย');
if (kind === 'cau' && dissolve > (ve ? 190 : 150)) notes.push('เหยื่อตกแตกตัวช้าเกินไป — ปล่อยกลิ่นเรียกปลาน้อย');
if (kind !== 'xa' && B.softness({ stick, dissolve }) > 0.65) notes.push('เหยื่อนิ่ม แตกตัวไว — ดึงดูดปลาซิวและปลารบกวนง่าย');
if (Math.max(smell.muong || 0, smell.thebe || 0) > smax * 0.9) notes.push('กลิ่นเรียกรวมปลารบกวนเยอะ');
if (!notes.length) notes.push('ชามเหยื่อสูตรนี้ลงตัว — สมดุลดี');
return { dissolve, stick, dens, cloud, smell, wet, notes, total,
style: xa ? null : opt.style, vo: xa ? null : U.clamp(opt.vo | 0, 0, 3), hat,
to: U.clamp(to / total, 0, 0.35), gao: xa ? gao : 0, huong: +parts.huong || 0, nuocVua: vua };
};
B.makeBowl = function (parts, water, kind, opt) {
const m = B.mix(parts, water, kind, opt);
if (!m) return null;
let spoons = 0;
for (const id in parts) { const g = CC.ING_BY_ID[id]; if (g && g.kind !== 'สารเสริม') spoons += +parts[id] || 0; }
return Object.assign(m, { kind, parts: Object.assign({}, parts), water, portions: Math.round(Math.max(1, spoons) * (kind === 'xa' ? 3 : 12)) });
};
B.voThem = function (bowl) {
if (!bowl || bowl.kind === 'xa' || !bowl.parts || (bowl.vo != null ? bowl.vo : 1) >= 3) return null;
const vo = (bowl.vo != null ? bowl.vo : 1) + 1;
const m = B.mix(bowl.parts, bowl.water, 'cau', { style: bowl.style || 'keo', vo, hat: bowl.hat || 'vua' });
if (!m) return null;
['dissolve', 'stick', 'dens', 'cloud', 'wet', 'notes', 'vo'].forEach(k => { bowl[k] = m[k]; });
return bowl;
};
B.caMoi = () => {
const st = (CC.pond && CC.pond().stock) || [], now = CC.world.hour() * 60;
let k = 0;
for (const s of st) if (now >= s) k = Math.max(k, U.clamp(1 - (now - s) / 150, 0, 1));
return k;
};
B.heHuong = (h, moi) => {
if (!h) return 1;
return moi * (1 + 0.12 * Math.min(h, 4)) + (1 - moi) * (1 + 0.04 * Math.min(h, 1) - 0.1 * Math.max(0, h - 1));
};
let nho = null;
B.mui = bowl => {
if (!bowl || !bowl.smell) return null;
if (!bowl.huong) return bowl.smell;
const k = Math.round(B.heHuong(bowl.huong, B.caMoi()) * 50) / 50;
if (nho && nho.b === bowl && nho.k === k && nho.s === bowl.smell) return nho.v;
const v = {};
for (const f in bowl.smell) v[f] = Math.min(1.2, bowl.smell[f] * k);
nho = { b: bowl, k, s: bowl.smell, v };
return v;
};
B.smellText = m => CC.pondFish().filter(f => !f.tap).map(f => {
const v = m.smell[f.id] || 0;
return `${f.name.replace(/^ปลา/, '')} ${v > 0.75 ? '★★★' : v > 0.5 ? '★★' : v > 0.3 ? '★' : '·'}`;
}).join(' · ');
})();
