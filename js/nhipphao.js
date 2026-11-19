(function () {
const U = CC.U, UI = CC.UI, PN = UI.PANELS;
const $ = id => document.getElementById(id);
const BOTTOM = 140, CAN = 4, CAU = 2, DT = 1 / 60;
function testRig() {
const F = CC.float(), w = CC.BAIT.w;
const rig = { lead: 1, set: 100, baits: [w, w], baitLeft: [1, 1], baitAge: 0, kind: 'cau', w0: w, dissolve: CC.BAIT.dissolve };
let lo = 0, hi = F.body * 3 + 3;
for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; rig.lead = mid; if (CC.Rig.canValue(rig) > CAN) lo = mid; else hi = mid; }
rig.lead = (lo + hi) / 2;
const at = s => { rig.set = s; return CC.Rig.solve(Object.assign({}, rig, { baits: [w, w] }), BOTTOM, {}).v; };
lo = 0; hi = BOTTOM + 40;
for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (at(mid) < CAU) lo = mid; else hi = mid; }
rig.set = (lo + hi) / 2;
return rig;
}
const P = d => ({ type: 'pause', dur: d });
const MID = (a, c) => (a + c) / 2;
const cat = (...xs) => [].concat(...xs);
function ctxOf(sc, b, rig) {
const Pd = CC.Pond, FB = CC.FISH_BY_ID || {}, sp = (sc.sp && FB[sc.sp]) || FB.diec || CC.FISH[0];
const [mn, mx] = CC.weightRange ? CC.weightRange(sp) : [sp.min, sp.max];
const w = sc.w || mn + (mx - mn) * (sc.s != null ? sc.s : 0.35);
if (sp.bite && Pd.loaiKinds && Pd.loaiKinds[sp.bite]) {
const T = Pd.loaiTraits(sp, sc.m || 0.6, w, { line: CC.line(), hook: CC.hook(), smell: 0.6, soft: 0.5, water: sc.water != null ? sc.water : 27 });
return { T, b, rig, w, D: Pd.loaiActs };
}
const T = Pd.diecTraits(sp, sc.m || 0.6, w, { line: CC.line(), hook: CC.hook(), smell: 0.6, soft: 0.5, bait: 1, water: sc.water != null ? sc.water : 24 });
return { T, b, rig, w, D: Pd.diecActs };
}
const nod = (c, k) => c.D.nod(c.T, c.b, (a, x) => (k == null ? MID(a, x) : a + (x - a) * k));
const spit = c => c.D.spit(c.T, MID);
const SCEN = [
{ id: 'xuong', name: 'เหยื่อจมลงพื้น', v: 'รอ', cls: 'wait', sink: true, tail: 2.5,
desc: 'ทุ่นนอนราบตอนตะกั่วยังจม → ตะกั่วถ่วงให้ทุ่นตั้งตรงและหยุดรอเล็กน้อยใกล้ข้อตั้ง → น้ำหนักเหยื่อดึงทุ่นค่อยๆ จมทีละข้อ → พอเบ็ดล่างแตะพื้น ทุ่นจะหยุดพอดีที่ข้อตก หากหยุดที่ข้อตกเดิมแปลว่าเหยื่อวางก้นบ่อแล้ว ยังไม่มีปลากิน',
acts: () => [] },
{ id: 'giuatang', name: 'งับเหยื่อกลางน้ำ', v: 'วัดเบ็ด', cls: 'go', sink: true, mid: true, tail: 2, m: 0.75, s: 0.1,
desc: 'ทุ่นตั้งตรงแล้วกำลังค่อยๆ จมทีละข้อ แต่จู่ๆ หยุดชะงักกลางคัน ไม่ยอมลงถึงข้อตก: ลูกปลาตะเพียนจีนใจร้อนงับเหยื่อขณะกำลังจม พอเห็นทุ่นหยุดนิ่งไม่จมต่อให้วัดเบ็ดเลย (จังหวะชะลอสั้นๆ ตอนทุ่นเพิ่งตั้งตัวถือเป็นเรื่องปกติ)',
acts: (c, tStar) => cat(c.D.mid(c.T, c.b, MID, c.rig).map(a => Object.assign(a, { atSink: tStar })), spit(c)) },
{ id: 'rung', name: 'ทุ่นสั่นยิบๆ', v: 'รอ', cls: 'wait', m: 0.6,
desc: 'ทุ่นสั่นเบาๆ ต่อเนื่องไม่กี่จังหวะ ไม่ถึง ¼ ข้อ มักมีฟองเม็ดเล็กผุดตาม: ปลาตะเพียนจีนสะบัดครีบหรือว่ายเฉียดสายรอบเหยื่อ ปลากำลังจะเข้ากิน — เตรียมมือให้พร้อม แต่อย่าเพิ่งวัด',
acts: c => cat([P(0.8)], c.D.quiver(c.T, c.b, MID), [P(0.9)], c.D.quiver(c.T, c.b, MID), [P(0.8)]) },
{ id: 'cham', name: 'ปลาตะเพียนจีนตอดจิ้มลองเหยื่อ', v: 'รอ', cls: 'wait', m: 0.55,
desc: 'ทุ่นขยับยุบเบาๆ ¼–½ ข้อแบบนุ่มๆ แล้วเด้งกลับข้อเดิมทันทีหลายครั้ง: ปลาตะเพียนจีนใช้ปากดันลองเหยื่อ ยังไม่อมเข้าปาก ต่างจากทุ่นตอกจริงตรงที่อาการเล็ก นุ่ม และเด้งคืนทันที วัดตอนนี้จะพลาดและทำให้ปลาตื่น',
acts: c => cat([P(0.8)], nod(c, 0.7), [P(1.0)], nod(c, 0.4), [P(0.9)], nod(c, 0.9), [P(0.8)]) },
{ id: 'dua', name: 'ทุ่นหยอก', v: 'รอ', cls: 'wait', m: 0.55,
desc: 'ทุ่นถอนลอยขึ้นประมาณครึ่งข้อแล้วตกลงคืนทันที: ปลาตะเพียนจีนดันเหยื่อขึ้นเบาๆ ยังไม่อมเต็มคำ อดใจรอจังหวะกินจริงก่อน',
acts: c => cat([P(0.7)], nod(c), [P(0.35)], c.D.tease(c.T, c.b, MID), [P(0.9)], c.D.tease(c.T, c.b, (a, x) => a + (x - a) * 0.3), [P(0.8)]) },
{ id: 'dothu', name: 'ถอนหลอก (ปลาเฉื่อย)', v: 'รอ', cls: 'wait', m: 0.3,
desc: 'ทุ่นถอนขึ้นเร็วประมาณครึ่งข้อ ชะงักนิดหน่อยแล้วตกลง: ปลาตะเพียนจีนช่วงเฉื่อย (น้ำเย็น แดดจัด) อมลองแล้วคายออก — เป็นกับดักทุ่นถอนหลอก อาการถอนจริงทุ่นจะลอยขึ้นสูงกว่า (1–2 ข้อ) อย่างช้าๆ แล้วหยุดนิ่ง',
acts: c => cat([P(0.8)], nod(c), [P(0.8)], c.D.testLift(c.T, c.b, MID), [P(1.2)]) },
{ id: 'do', name: 'ทุ่นถอนขึ้น 1–2 ข้อแล้วหยุด', v: 'วัดเบ็ด', cls: 'go', m: 0.6, s: 0.4,
desc: 'ปลาตะเพียนจีนอมเหยื่อแล้วเชิดหัวขึ้น: ทุ่นค่อยๆ ลอยสูงขึ้น 1–2 ข้อ (ตัวใหญ่ถึง 3 ข้อ) แล้วหยุดนิ่ง เป็นจังหวะมาตรฐานที่สุดของปลาตะเพียนจีน — วัดตอนทุ่นเพิ่งหยุด อย่ารอนานเพราะปลาคายเหยื่อเร็วมาก',
acts: c => cat([P(0.7)], nod(c), [P(0.9)], c.D.lift(c.T, c.b, MID, c.rig, false), spit(c), [P(1.0)]) },
{ id: 'nam', name: 'ตะเพียนจีนใหญ่ถอนจนทุ่นนอน', v: 'วัดทันที', cls: 'go', m: 0.7, s: 1, w: 0.5,
desc: 'ปลาตะเพียนจีนตัวใหญ่อมเหยื่อแล้วเชิดตัวขึ้นเต็มแรงจนยกตะกั่วลอย: ทุ่นถอนขึ้นสูงแล้วล้มนอนราบบนผิวน้ำ เห็นทุ่นเริ่มเอียงล้มให้วัดทันที',
acts: c => cat([P(0.7)], nod(c), [P(1.0)], c.D.lift(c.T, c.b, MID, c.rig, true), spit(c), [P(1.6)]) },
{ id: 'dun', name: 'ทุ่นตอกจมคม', v: 'วัดเบ็ด', cls: 'go', m: 0.6,
desc: 'ทุ่นตอกจมลง ½–1½ ข้ออย่างเฉียบคมในเสี้ยววินาทีแล้ว "หยุดนิ่ง": ปลาตะเพียนจีนอมเหยื่อแล้วก้มหัวลง ต่างจากอาการตอดลองตรงที่จมเร็ว ลึกกว่า และไม่เด้งคืน อากาศหนาวอาการนี้อาจเหลือแค่ ¼–½ ข้อแต่ยังคมชัด',
acts: c => cat([P(0.7)], nod(c), [P(0.9)], c.D.dun(c.T, c.b, MID), spit(c), [P(1.2)]) },
{ id: 'donhap', name: 'ถอนขึ้นแล้วตอกลง', v: 'วัดเบ็ด', cls: 'go', m: 0.65,
desc: 'ทุ่นถอนขึ้นเกือบ 1 ข้อแล้วตอกจมต่ำกว่าข้อตกแล้วหยุด: ปลาตะเพียนจีนอมเหยื่อเงยหัวขึ้นแล้วทิ่มหัวลง วัดเบ็ดจังหวะทุ่นตอกลงเลย',
acts: c => cat([P(0.7)], nod(c), [P(0.9)], c.D.liftDun(c.T, c.b, MID), spit(c), [P(1.2)]) },
{ id: 'cham2', name: 'จมซึมช้าๆ ครึ่งข้อ (เที่ยงร้อน)', v: 'วัดเบ็ด', cls: 'go', m: 0.2, water: 30,
desc: 'ตอนเที่ยงแดดจัด ปลาตะเพียนจีนอืดเฉื่อย: ทุ่นค่อยๆ ซึมจมช้าๆ ประมาณครึ่งข้อแล้วหยุด — สังเกตพลาดได้ง่าย เห็นทุ่นต่ำกว่าข้อตกแล้วหยุดนิ่งให้วัดเบาๆ ได้เลย',
acts: c => cat([P(1.0)], c.D.creep(c.T, c.b, MID), spit(c), [P(1.3)]) },
{ id: 'ngang', name: 'ทุ่นลากออกข้าง', v: 'วัดเบ็ด', cls: 'go', m: 0.6, s: 0.7,
desc: 'ทุ่นซึมลงเล็กน้อย เอียงตัวแล้วไถลวิ่งออกด้านข้างบนผิวน้ำ: ปลาตะเพียนจีนคาบเหยื่อว่ายหนี วัดเบ็ดสวนทิศทางที่ทุ่นลากไป',
acts: c => cat([P(0.8)], c.D.shift(c.T, c.b, (a, x) => (a < 0 && x > 0 ? 0.09 : MID(a, x))), spit(c), [P(1.6)]) },
{ id: 'keochim', name: 'ดึงจมมิดหาย', v: 'วัดทันที', cls: 'go', m: 0.85, s: 0.6,
desc: 'ทุ่นตอกคมแล้วจมมิดหายไป ไม่ลอยกลับขึ้นมา: ปลาตะเพียนจีนกินดุอมเหยื่อแน่นแล้วว่ายดิ่งลง วัดทันที — จังหวะนี้ติดชัวร์',
acts: c => cat([P(0.8)], nod(c), [P(0.9)], c.D.dive(c.T, c.b, MID), spit(c), [P(1.6)]) },
{ id: 'vut', name: 'ลูกตะเพียนจีนดึงจมวูบแล้วเด้งคืน', v: 'วัดเบ็ด — พลาดง่าย', cls: 'warn', m: 0.8, s: 0, w: 0.1,
desc: 'ทุ่นถูกดึงจมมิดในพริบตาแล้วเด้งลอยกลับทันที: ลูกปลาตะเพียนจีนแย่งเหยื่อกัน วัดติดได้แต่ปากปลาเล็กมาก วัดสิบทีพลาดเก้า — หากลูกปลาเยอะปล่อยผ่านไป รอตัวใหญ่ถอนทุ่นดีกว่า',
acts: c => cat([P(0.8)], nod(c, 0.3), [P(0.5)], c.D.snatch(c.T, c.b, MID), spit(c), [P(1.5)]) },
{ id: 'thebe', name: 'ปลาซิว (ปลารบกวน) กวนเหยื่อ', v: 'อย่าเพิ่งวัด', cls: 'stop', sp: 'thebe',
desc: 'ทุ่นกระโดดขึ้นลงมั่วซั่วต่อเนื่อง จมวูบแล้วเด้งคืนทันที: ฝูงปลารบกวนตัวจิ๋วรุมตอดเหยื่อ อย่าไปวัด — ปั้นเหยื่อให้แข็งขึ้น หรือย้ายช่องตก',
acts: c => { const j = (k, d) => ({ type: 'jitter', dur: d, force: k * c.b, bump: true, mouth: false });
return [P(0.5), j(-1.4, 0.1), j(2.2, 0.12), P(0.15), j(1.6, 0.08), j(-1.0, 0.1), j(2.6, 0.14), P(0.4), j(1.3, 0.09), j(-1.8, 0.12),
{ type: 'grab', dur: 0.24, force: 5.5 * c.b, bump: true, mouth: false }, P(0.2), j(2.0, 0.1), j(-1.2, 0.08), j(1.5, 0.12), P(0.3), j(-1.6, 0.11), j(2.3, 0.1), P(0.8)]; } },
{ id: 'quet', name: 'ปลาว่ายชนสายทุ่น', v: 'อย่าเพิ่งวัด', cls: 'stop', line: true,
desc: 'ทุ่นแกว่ง โยกเอียงไปมา ยุบเบาๆ แบบไร้จังหวะ: ปลาว่ายผ่านไปชนสายเมน ไม่ได้กินเหยื่อ',
acts: c => [P(0.6), { type: 'brush', dur: 0.55, force: 1.0 * c.b, tiltX: 0.26, mouth: false }, P(0.35),
{ type: 'brush', dur: 0.5, force: -0.6 * c.b, tiltX: -0.22, mouth: false }, P(0.5), { type: 'brush', dur: 0.4, force: 0.7 * c.b, tiltX: 0.18, mouth: false }, P(1.0)] },
{ id: 'ra', name: 'เหยื่อละลายหมดแล้ว', v: 'ยกคันเปลี่ยนเหยื่อ', cls: 'info', dissolve: 12, minT: 13.5,
desc: 'ทุ่นค่อยๆ ลอยกลับทีละนิดจากข้อตก (2) ขึ้นไปที่ข้อตั้ง (4): เหยื่อละลายหลุดจากตัวเบ็ดหมดแล้ว ยกคันเกี่ยวเหยื่อใหม่ (เร่งเวลาให้ดู — เหยื่อจริงละลายประมาณ ' + Math.round(CC.BAIT.dissolve) + ' วินาที)',
acts: () => [] }
];
const L = (c, name, ...args) => c.D[name](c.T, c.b, MID, ...args);
const lspit = (c, st) => c.D.spit(c.T, MID, st);
const noi = (x, y) => { if (y[0].rampT) y[0].f0 = x[x.length - 1].force; return cat(x, y); };
SCEN.push(
{ id: 'troi-nhay', name: 'ปลายี่สกเทศ: ทุ่นกระตุกยิบถี่ๆ', v: 'รอ', cls: 'wait', sp: 'troi', m: 0.5,
desc: 'ทุ่นกระตุกถี่ๆ เบามากราว ¼ ข้อ เหมือนเม็ดฝนตก: ฝูงปลายี่สกเทศดูดลองรอบเหยื่อ ยังไม่อมเข้าปาก — วัดตอนนี้จะพลาดและฝูงแตก อดใจรอจังหวะตอกคม',
acts: c => cat([P(0.8)], L(c, 'troiFlick'), [P(1.2)], L(c, 'troiFlick'), [P(1.0)]) },
{ id: 'troi-don', name: 'ปลายี่สกเทศ: ตอกเบาแล้วหยุด', v: 'วัดเบ็ด', cls: 'go', sp: 'troi', m: 0.6,
desc: 'หลังจากกระตุกยิบๆ สักพัก ทุ่นตอกลงสั้นๆ ครึ่ง–1 ข้อแล้วหยุด: ปลายี่สกเทศดูดเหยื่อเข้าปากแล้ว อาการเล็กแต่คม ต่างจากกระตุกเด้งคืน วัดทันทีเมื่อทุ่นหยุด',
acts: c => cat([P(0.7)], L(c, 'troiFlick'), [P(0.8)], L(c, 'troiDon'), lspit(c, 0.4), [P(1.2)]) },
{ id: 'troi-do', name: 'ปลายี่สกเทศ: ถอนทุ่นช้าๆ', v: 'วัดเบ็ด', cls: 'go', sp: 'troi', m: 0.45,
desc: 'ทุ่นลอยขึ้นช้ามาก 1–2 ข้อแล้วหยุด: ปลายี่สกเทศอมเหยื่อแล้วเชิดหัวขึ้น ช้ากว่าปลาตะเพียนจีนมาก — รอให้ทุ่นขึ้นสุดแล้วหยุดนิ่งค่อยวัด',
acts: c => cat([P(0.7)], L(c, 'troiFlick'), [P(0.9)], L(c, 'troiDo'), lspit(c, 0.4), [P(1.2)]) },
{ id: 'tc-keo', name: 'ปลาเฉา: ซึมช้าแล้วจมหาย', v: 'รอทุ่นเดินค่อยวัด', cls: 'warn', sp: 'tramco', m: 0.6,
desc: 'ทุ่นโยกเอียงแรง (ปลาเฉาใหญ่ว่ายชนสาย) แล้วซึมลงช้าๆ 1–2 ข้อ — ปลาเพิ่งคาบเหยื่อห่างๆ วัดตอนนี้มักพลาด (แถบสีส้ม) จากนั้นปลากลับตัวว่ายหนี ทุ่นจมมิดหาย: ตอนนั้นค่อยวัด — ติดแน่น',
acts: c => cat([P(0.7)], L(c, 'brush', true), [P(0.9)], noi(L(c, 'tcNgam'), L(c, 'tcKeo')), lspit(c, 0.75), [P(1.4)]) },
{ id: 'tc-ngang', name: 'ปลาเฉา: ซึมแล้วลากออกข้าง', v: 'รอทุ่นเดินค่อยวัด', cls: 'warn', sp: 'tramco', m: 0.6,
desc: 'ทุ่นซึมช้าๆ แล้วเอียงตัว ไถลออกข้างเป็นคืบ: ปลาเฉาคาบเหยื่อว่ายหนี พอทุ่นวิ่งออกข้างเต็มตัวให้วัดสวนทิศทาง',
acts: c => cat([P(0.8)], noi(L(c, 'tcNgam'), L(c, 'tcNgang')), lspit(c, 0.75), [P(1.6)]) },
{ id: 'tc-do', name: 'ปลาเฉา: ถอนสูงแล้วหยุด', v: 'รอทุ่นหยุดค่อยวัด', cls: 'warn', sp: 'tramco', m: 0.4,
desc: 'ทุ่นถอนสูงขึ้น 2–3 ข้อ — ปลาเฉาอมเหยื่อเชิดหัว ช่วงที่ทุ่นยังลอยขึ้นอยู่ปลายังคาบไม่เต็มปาก พอทุ่นขึ้นสุดและหยุดนิ่งค่อยวัด',
acts: c => cat([P(0.8)], L(c, 'tcDo'), lspit(c, 0.75), [P(1.4)]) },
{ id: 'chim-vut', name: 'ปลาเปคู: สั่นแล้วจมมิดทันที', v: 'วัดทันที', cls: 'go', sp: 'chimtrang', m: 0.7,
desc: 'ทุ่นสั่นกระตุกแรงหนึ่งสองที (ปลาโฉบเหยื่อ) แล้วถูกดึงจมมิดในเสี้ยววินาที วัดทันที: ช้าแค่ครึ่งวินาทีปลาเปคูจะกลืนลึก ฟันคมจะครูดสายหน้าขาดตอนอัด',
acts: c => cat([P(0.7)], L(c, 'chimDap'), L(c, 'chimVut'), lspit(c, 0.9), [P(1.4)]) },
{ id: 'chim-luot', name: 'ปลาเปคู: ลากพุ่งออกข้าง', v: 'วัดทันที', cls: 'go', sp: 'chimtrang', m: 0.6,
desc: 'ทุ่นซึมนิดเดียวแล้ววิ่งพุ่งออกข้างเร็วมาก เอียงตัวชัดเจน: ปลาเปคูคาบเหยื่อพุ่งออกข้าง วัดทันทีสวนทิศทางที่ไป',
acts: c => cat([P(0.8)], L(c, 'chimLuot'), lspit(c, 0.9), [P(1.4)]) }
);
const ACT = { nibble: 'ตอด / ดูดลองเหยื่อ', sink: 'อมเหยื่อ ทุ่นตอกจมคม', dip: 'อมเหยื่อ ตอกลงแล้วหยุด', slow: 'อมเหยื่อ ทุ่นซึมช้า',
run: 'อมเหยื่อลากหนี — ทุ่นจมหาย', pause: 'ปลาว่ายวนรอบเหยื่อ', nod: 'ตอดจิ้มลองทุ่น', tease: 'หยอกทุ่น / ถอนหลอก (ยังไม่อม)', lift: 'อมเหยื่อ ถอนทุ่นขึ้น',
hold: 'อมเหยื่อ ทุ่นหยุดนิ่ง', lie: 'เชิดหัวจนตะกั่วลอย — ทุ่นนอนราบ', dun: 'อมเหยื่อ ตอกจมคม', creep: 'ดูดเหยื่อ ทุ่นซึมช้า',
shift: 'อมเหยื่อว่ายออกข้าง', snatch: 'ลูกปลาตะเพียนจีนฉกเหยื่อจมวูบ', mid: 'งับเหยื่อกลางน้ำ', spit: 'คายเหยื่อ', jitter: 'ปลาซิวตอดกวนเหยื่อ',
grab: 'ปลาซิวกระชากเหยื่อ', brush: 'ว่ายชนสายทุ่น', quiver: 'สะบัดครีบ เฉียดสายรอบเหยื่อ', dive: 'อมแน่นว่ายดิ่งลง — ทุ่นจมหาย' };
function runSim(sc, rig, acts, maxT, w) {
const F = CC.float(), Rig = CC.Rig, Pond = CC.Pond;
const dyn = { v: CAU, vel: 0, tilt: 0, wave: 0, tiltX: 0, drift: 0, driftT: null };
let sinking = !!sc.sink, sink = Infinity, sinkH = Infinity;
if (sinking) { sink = 0; sinkH = 0; dyn.v = F.n + 6; dyn.tilt = 1.45; }
else { dyn.v = Rig.solve(rig, BOTTOM, {}).v; }
const list = (CC.FISH || []);
const sp = sc.line ? list[0] : list.find(f => f.id === (sc.sp || 'diec')) || list[0];
const frames = [];
let scriptEnd = acts.length ? null : 0, sinkEnd = sinking ? null : 0;
Pond.suitor = acts.length ? { sp, w: w || sc.w || 0.25, mood: sc.m || 0.6, lineOnly: !!sc.line, acts, i: 0, t: 0 } : null;
Pond.spook = 0; Pond.fish = 0; Pond.wave = 0;
Pond.sinkT = 0; Pond.wasSinking = false;
for (let t = 0; t < maxT; t += DT) {
if (sc.dissolve) Rig.updateBaits(rig, DT);
let out = { force: 0, held: -1, tiltX: 0, mouth: false, freeze: false, act: null }, hq = 1, fa = null, at = 0, su = Pond.suitor;
if (su) {
out = Pond.update(DT, { rig, dx: 0, sinking, lineVis: 1, hookTake: 1, smell: {}, xa: false });
const a = Pond.suitor && Pond.suitor.acts[Pond.suitor.i];
if (a) { hq = a.hookQ || 1; fa = a; at = Pond.suitor.t; }
if (!Pond.suitor && scriptEnd == null) scriptEnd = t;
}
if (sinking && !out.freeze) {
sink += (30 + rig.lead * 20) * DT;
const bk = Math.min(3, (rig.baits[0] + rig.baits[1]) / (2 * CC.BAIT.w));
sinkH = Math.min(sink + Rig.LEADER_LONG, (sinkH || 0) + (16 + 12 * bk) * DT);
}
const sol = Rig.solve(rig, BOTTOM, { force: out.force, held: out.held, sink, sinkH });
if (sinking && (sol.fL == null ? sink > BOTTOM + 60 : sol.fL >= 1 && sol.fB >= 1)) { sinking = false; sink = sinkH = Infinity; sinkEnd = t; }
dyn.tiltX = out.tiltX || 0;
dyn.driftT = out.drift != null ? out.drift : null;
Rig.step(dyn, sol.v, DT, t);
frames.push({ t, v: dyn.v, eq: sol.v, wave: dyn.wave || 0, tilt: dyn.tilt || 0, drift: dyn.drift || 0,
mouth: !!out.mouth, soon: !!(out.mouth && fa && fa.soon), hq, fa, at, act: out.act, sinking });
if (scriptEnd != null && sinkEnd != null && t > Math.max(scriptEnd, sinkEnd, sc.minT || 0) + (sc.tail || 1.2)) break;
}
return frames;
}
function simulate(sc) {
const Pond = CC.Pond, snap = {};
Object.keys(Pond).forEach(k => { if (typeof Pond[k] !== 'function') snap[k] = Pond[k]; });
try {
const F = CC.float(), rig = testRig();
if (sc.dissolve) rig.dissolve = sc.dissolve;
const c = ctxOf(sc, F.b, rig);
let tStar = 0;
if (sc.mid) {
const pre = runSim({ sink: true }, testRig(), [], 12);
const up = pre.find(fr => fr.t > 0.3 && fr.tilt < 0.15) || pre[0];
const vTop = up.v, vAt = vTop - 0.35 * Math.max(0.5, vTop - CAU);
const f = pre.find(fr => fr.t > up.t && fr.v <= vAt);
tStar = f ? f.t : up.t + 1;
}
const acts = sc.acts(c, tStar);
return { frames: runSim(sc, rig, acts, 30, c.w), rig, c };
} finally {
Object.keys(Pond).forEach(k => { if (typeof Pond[k] !== 'function' && !(k in snap)) delete Pond[k]; });
Object.assign(Pond, snap);
}
}
const VCOL = { go: '#5fc46a', wait: '#f2c14e', stop: '#ef6b4a', warn: '#f29a4e', info: '#7cc4f2' };
const badge = sc => `<b style="display:inline-block;padding:1px 7px;border-radius:9px;font-size:12px;white-space:nowrap;background:${VCOL[sc.cls]};color:#10161a">${sc.v}</b>`;
let run = null, raf = 0, sel = 'xuong';
PN.nhip = () => {
const F = CC.float();
const rows = SCEN.map(sc => `<tr data-row="${sc.id}">
        <td><b>${sc.name}</b> ${badge(sc)}<div class="dim small">${sc.desc}</div></td>
        <td class="num"><button data-nh="${sc.id}">▶ ดู</button></td></tr>`).join('');
return `<h2>📈 คลังอาการทุ่น</h2>
      <div class="sub">จำลองดูอาการทุ่นแต่ละแบบ (ปลาตะเพียนจีน รวมถึงปลายี่สกเทศ ปลาเฉา และปลาเปคูท้ายตาราง) ด้วยฟิสิกส์ทุ่นจริงของเกม: <b>${F.name}</b>, ตั้ง ${CAN} ตก ${CAU}, น้ำลึก 1.4 ม., เหยื่อใหม่,
      <b>${CC.line().name}</b>, <b>${CC.hook().name}</b> — สายหน้าเล็ก ตัวเบ็ดเล็ก ปลาตะเพียนจีนจะกินคมชัดขึ้น
      แถบสี<span style="color:#5fc46a">เขียว</span>บนกราฟคือช่วงที่ปลากำลังอมเหยื่อ (แถบสี<span style="color:#f29a4e">ส้ม</span>: เพิ่งคาบห่างๆ วัดตอนนี้พลาดง่าย) — กด <b>⚡ วัดเบ็ด!</b> ให้ตรงจังหวะเพื่อฝึกมือ คลิกบนกราฟเพื่อกรอเวลาได้</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start;margin:10px 0">
        <canvas id="nh-zoom" style="width:150px;height:300px;flex:0 0 150px;border-radius:10px;display:block"></canvas>
        <div style="flex:1 1 240px;min-width:220px">
          <div id="nh-title" style="font-weight:bold;margin-bottom:4px"></div>
          <div id="nh-now" class="readout" style="min-height:2.6em"></div>
          <canvas id="nh-chart" style="width:100%;height:160px;display:block;border-radius:8px;margin-top:6px"></canvas>
          <div class="btnrow" style="margin-top:6px"><button id="nh-strike" class="good">⚡ วัดเบ็ด!</button> <button id="nh-replay">↻ ดูซ้ำ</button></div>
          <div id="nh-res" class="small" style="min-height:1.4em;margin-top:4px"></div>
        </div>
      </div>
      <table class="keep"><tr><th>อาการทุ่น</th><th class="num"></th></tr>${rows}</table>
      <p class="dim small">ทุกครั้งที่กดดูเป็นการจำลองแยกต่างหาก ไม่กระทบกับรอบตกปลาที่เล่นอยู่ ระบบใช้ทุ่นและตัวเบ็ดตามชุดที่คุณใส่อยู่</p>`;
};
UI.afterOpen.nhip = () => {
document.querySelectorAll('#panel-body [data-nh]').forEach(b => b.addEventListener('click', () => play(b.dataset.nh)));
const st = $('nh-strike'), rp = $('nh-replay');
if (st) st.addEventListener('click', strike);
if (rp) rp.addEventListener('click', () => play(sel));
const cc = $('nh-chart');
if (cc) cc.addEventListener('click', e => {
if (!run) return;
const r = cc.getBoundingClientRect();
seek(U.clamp((e.clientX - r.left - 30) / Math.max(1, r.width - 36), 0, 1) * run.total);
});
play(sel);
};
function seek(t) {
if (!run) return;
run.t0 = performance.now() - t * 1000;
cancelAnimationFrame(raf);
loop();
}
function fit(c) {
const r = c.getBoundingClientRect(), dp = Math.min(window.devicePixelRatio || 1, 2);
c.width = Math.max(1, Math.round(r.width * dp)); c.height = Math.max(1, Math.round(r.height * dp));
const g = c.getContext('2d'); g.setTransform(dp, 0, 0, dp, 0, 0);
return { g, w: r.width, h: r.height };
}
function play(id) {
const sc = SCEN.find(s => s.id === id) || SCEN[0];
sel = sc.id;
let res;
try { res = simulate(sc); } catch (e) { console.error('คลังอาการทุ่น:', e); return; }
const fr = res.frames;
run = { sc, frames: fr, total: fr.length ? fr[fr.length - 1].t : 0, t0: performance.now(), struck: false, w: res.c ? res.c.w : 0.25 };
const zc = $('nh-zoom'), cc = $('nh-chart');
if (!zc || !cc) return;
run.z = fit(zc); run.c = fit(cc);
$('nh-title').innerHTML = `${sc.name} ${badge(sc)}`;
$('nh-res').innerHTML = '';
document.querySelectorAll('#panel-body tr[data-row]').forEach(tr => { tr.style.background = tr.dataset.row === sc.id ? 'rgba(255,255,255,0.07)' : ''; });
cancelAnimationFrame(raf);
loop();
}
function frameAt(t) {
const fr = run.frames;
return fr[U.clamp(Math.floor(t / DT), 0, fr.length - 1)];
}
function loop() {
const zc = $('nh-zoom');
if (!run || !zc || UI.current !== 'nhip' || !UI.isOpen()) { run = null; return; }
const t = Math.min(run.total, (performance.now() - run.t0) / 1000);
const f = frameAt(t);
drawZoom(run.z, f, performance.now() / 1000);
drawChart(run.c, t);
const now = $('nh-now');
if (now) {
const who = f.sinking ? (f.act === 'mid' ? ACT.mid : 'เหยื่อกำลังจม…') : f.act ? (ACT[f.act] || f.act) : (run.sc.dissolve ? 'เหยื่อกำลังละลาย' : 'ทุ่นหยุดนิ่ง');
now.innerHTML = `${t.toFixed(1)} วิ · ทุ่น: <b>${CC.Rig.fmt(f.v)}</b> · ${who}<br>` +
(f.soon ? '<span style="color:#f29a4e">◐ ปลาเพิ่งคาบห่างๆ — วัดตอนนี้พลาดง่าย รอทุ่นเดินเต็มตัว</span>' : f.mouth ? '<span style="color:#5fc46a">● ปลากำลังอมเหยื่อ — วัดเบ็ดตอนนี้ติดปลาแน่นอน</span>' : '<span class="dim">○ ปลายังไม่อมเหยื่อ</span>');
}
if (t < run.total) raf = requestAnimationFrame(loop);
else if (!run.struck) { const r = $('nh-res'); if (r && !r.innerHTML) r.innerHTML = `<span class="dim">จบจังหวะ สรุปผล: ${badge(run.sc)}</span>`; }
}
function strike() {
if (!run) return;
const t = Math.min(run.total, (performance.now() - run.t0) / 1000), f = frameAt(t), r = $('nh-res');
if (!r) return;
run.struck = true;
if (f.mouth) {
const sp = (CC.FISH_BY_ID || {})[run.sc.sp || 'diec'] || CC.FISH[0];
const p = CC.Pond.hookChance ? CC.Pond.hookChance(sp, run.w, f.fa, f.at, false).p : CC.hook().hold * (f.at < 0.07 ? 0.6 : 1) * f.hq;
const ok = Math.random() < p;
r.innerHTML = (ok ? '<span style="color:#5fc46a">🎣 ติดปลา! วัดตรงจังหวะพอดี</span>' : '<span style="color:#f29a4e">ปลากำลังอมอยู่แต่ตัวเบ็ดหลุดพลาด</span>') +
` <span class="dim">(โอกาสวัดติดช่วงนี้ ~${Math.round(p * 100)}%)</span>`;
} else {
r.innerHTML = '<span style="color:#ef6b4a">💨 วัดวืด — ช่วงนี้ปลายังไม่อมเหยื่อ</span>' + (run.sc.cls === 'stop' || run.sc.cls === 'wait' ? ' <span class="dim">' + (run.sc.cls === 'stop' ? 'จังหวะนี้ห้ามวัด' : 'จังหวะนี้ควรรออีกนิด') + '</span>' : '');
}
run.strikeT = t;
}
function tipColors() {
try { const s = CC.skin('tip'); if (s && s.colors && s.colors.length) return { c: s.colors, body: s.body || '#c0392b' }; } catch (e) {   }
return { c: ['#e8412c', '#f2c14e', '#e8412c', '#222'], body: '#c0392b' };
}
function drawZoom(z, f, now) {
const g = z.g, w = z.w, h = z.h, F = CC.float(), Rig = CC.Rig;
g.clearRect(0, 0, w, h);
const wl = h * 0.62;
const sky = g.createLinearGradient(0, 0, 0, wl);
sky.addColorStop(0, '#8fb8d0'); sky.addColorStop(1, '#cfe2e8');
g.fillStyle = sky; g.fillRect(0, 0, w, wl);
g.fillStyle = '#2f6f75'; g.fillRect(0, wl, w, h - wl);
const np = Math.min(17, (h * 0.55) / (F.n + 1));
g.setLineDash([4, 4]); g.lineWidth = 1; g.font = '10px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; g.textAlign = 'left';
[[CAU, 'ตก ' + CAU, 'rgba(95,196,106,0.9)'], [CAN, 'ตั้ง ' + CAN, 'rgba(124,196,242,0.9)']].forEach(([n, txt, col]) => {
const y = wl - n * np; g.strokeStyle = col; g.beginPath(); g.moveTo(4, y); g.lineTo(w * 0.34, y); g.stroke();
g.fillStyle = col; g.fillText(txt, 4, y - 3);
});
g.setLineDash([]);
const T = tipColors();
const cx = w * 0.58 + U.clamp((f.drift || 0) * 220, -30, 30);
const v = Rig.drawV(f.v, f.wave, 1.5), lie = Rig.lie(f.v);
const top = wl - v * np;
const fitK = Math.min(1, (w - 16) / ((F.n + 4.2) * np));
const sc = U.lerp(1, fitK, lie), px = U.lerp(cx, 8 + Math.max(0, v) * np * fitK, lie);
const ang = -f.tilt * U.lerp(0.8, 1, lie);
g.save();
g.translate(px, wl); g.rotate(ang); g.scale(sc, sc); g.translate(-cx, -wl);
for (let i = 0; i < F.n; i++) {
const yy = top + i * np;
g.fillStyle = T.c[i % T.c.length];
g.fillRect(cx - 3 * F.tip, yy, 6 * F.tip, np - 1);
if (lie < 0.4 && yy < wl - 2 && yy > 0) {
g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = '10px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; g.textAlign = 'right';
g.fillText(String(i + 1), cx - 9, yy + np * 0.7);
}
}
g.fillStyle = T.body; g.fillRect(cx - 7, top + F.n * np, 14, np * 3);
g.restore();
g.fillStyle = 'rgba(47,111,117,0.78)'; g.fillRect(0, wl + 1, w, h - wl);
g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 1.5;
g.beginPath();
for (let xx = 0; xx <= w; xx += 4) { const yy = wl + Math.sin(xx * 0.15 + now * 3) * 0.6; xx === 0 ? g.moveTo(xx, yy) : g.lineTo(xx, yy); }
g.stroke();
if (f.mouth) { g.strokeStyle = 'rgba(95,196,106,0.95)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3); }
g.fillStyle = 'rgba(10,16,20,0.7)'; g.fillRect(0, h - 22, w, 22);
g.fillStyle = '#fff'; g.font = '12px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; g.textAlign = 'center';
g.fillText('ทุ่น: ' + Rig.fmt(f.v), w / 2, h - 7);
}
function drawChart(z, tNow) {
const g = z.g, w = z.w, h = z.h, F = CC.float(), fr = run.frames, total = Math.max(0.5, run.total);
const L = 30, R = 6, Tp = 8, B = 18;
let lo = 0, hi = CAN;
for (let i = 0; i < fr.length; i++) { const v = CC.Rig.visV(fr[i].v); if (v < lo) lo = v; if (v > hi) hi = v; }
const vMax = Math.min(F.n + 1.5, Math.ceil(hi + 0.6)), vMin = Math.max(-1.5, Math.floor(lo - 0.4));
const X = t => L + (w - L - R) * t / total, Y = v => Tp + (h - Tp - B) * (vMax - U.clamp(v, vMin, vMax)) / (vMax - vMin);
g.clearRect(0, 0, w, h);
g.fillStyle = 'rgba(10,16,20,0.55)'; g.fillRect(0, 0, w, h);
g.fillStyle = 'rgba(95,196,106,0.28)';
let s0 = null;
for (let i = 0; i <= fr.length; i++) {
const m = i < fr.length && fr[i].mouth;
if (m && s0 == null) s0 = fr[i].t;
if (!m && s0 != null) { g.fillRect(X(s0), Tp, X(fr[i - 1].t) - X(s0) + 1, h - Tp - B); s0 = null; }
}
g.fillStyle = 'rgba(242,154,78,0.45)';
s0 = null;
for (let i = 0; i <= fr.length; i++) {
const m = i < fr.length && fr[i].soon;
if (m && s0 == null) s0 = fr[i].t;
if (!m && s0 != null) { g.fillRect(X(s0), Tp, X(fr[i - 1].t) - X(s0) + 1, h - Tp - B); s0 = null; }
}
g.font = '10px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; g.textAlign = 'right'; g.lineWidth = 1;
[0, CAU, CAN, F.n].filter(n => n >= vMin && n <= vMax).forEach(n => {
g.strokeStyle = n === CAU ? 'rgba(95,196,106,0.7)' : n === CAN ? 'rgba(124,196,242,0.7)' : 'rgba(255,255,255,0.15)';
g.setLineDash(n === CAU || n === CAN ? [4, 4] : []);
g.beginPath(); g.moveTo(L, Y(n)); g.lineTo(w - R, Y(n)); g.stroke();
g.fillStyle = 'rgba(255,255,255,0.7)';
g.fillText(n === CAU ? 'ตก ' + n : n === CAN ? 'ตั้ง ' + n : String(n), L - 3, Y(n) + 3);
});
g.setLineDash([]);
g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,0.55)';
for (let s = 0; s <= total; s += total > 12 ? 2 : 1) g.fillText(s + ' วิ', X(s), h - 5);
const line = (from, to, col, lw) => {
g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
let first = true;
for (let i = from; i < to; i++) { const p = fr[i], x = X(p.t), y = Y(CC.Rig.visV(p.v)); first ? g.moveTo(x, y) : g.lineTo(x, y); first = false; }
g.stroke();
};
const k = U.clamp(Math.floor(tNow / DT) + 1, 0, fr.length);
line(0, fr.length, 'rgba(242,193,78,0.25)', 1.5);
line(0, k, '#f2c14e', 2);
g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1;
g.beginPath(); g.moveTo(X(tNow), Tp); g.lineTo(X(tNow), h - B); g.stroke();
if (run.strikeT != null) {
g.strokeStyle = '#ef6b4a'; g.lineWidth = 2;
g.beginPath(); g.moveTo(X(run.strikeT), Tp); g.lineTo(X(run.strikeT), h - B); g.stroke();
g.fillStyle = '#ef6b4a'; g.fillText('วัด', X(run.strikeT), Tp + 9);
}
}
function measure() {
const r2 = x => (isFinite(x) ? Math.round(x * 100) / 100 : null);
return SCEN.map(sc => {
const fr = simulate(sc).frames;
const base = sc.sink ? CAU : fr[0].v;
let lo = Infinity, hi = -Infinity, mlo = Infinity, mhi = -Infinity, ngam = 0;
for (const f of fr) {
if (!f.sinking) { lo = Math.min(lo, f.v); hi = Math.max(hi, f.v); }
if (f.mouth) { ngam += DT; mlo = Math.min(mlo, f.v); mhi = Math.max(mhi, f.v); }
}
return { id: sc.id, nhip: sc.name, xuong: r2(base - lo), len: r2(hi - base), ngam: r2(ngam), ngamThap: r2(mlo), ngamCao: r2(mhi) };
});
}
CC.NhipPhao = { SCEN, simulate, testRig, play, seek, measure };
})();
