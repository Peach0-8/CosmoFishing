window.CC = window.CC || {};
CC.RODS = [
{ id: 'd36', name: 'คันชิงหลิว 3.6ม. 2H', len: 3.6, k: 1.0, power: 2.4, speed: 160, price: 0, color: '#3b3b3b', desc: 'คันอ่อน เบามือ เหมาะกับปลานิลขนาดกลาง ระวังสายหน้าขาดหากอัดปลาใหญ่แรงเกินไป' },
{ id: 'd45', name: 'คันชิงหลิว 4.5ม. 4H', len: 4.5, k: 1.5, power: 3.8, speed: 140, price: 900, color: '#2f4a3a', desc: 'คันมาตรฐานประจำบ่อเหมา ส่งสายได้ไกลขึ้น งัดปลา 1–2 กก. ได้สบายมือ' },
{ id: 'd54', name: 'คันชิงหลิว 5.4ม. 6H', len: 5.4, k: 2.2, power: 5.8, speed: 120, price: 2200, color: '#4a2f2f', desc: 'คันเวทแข็ง ส่งสายได้ไกล รับมือปลาไนใหญ่ได้ แต่น้ำหนักคันจะหนักมือหน่อยเวลาอัดปลา' },
{ id: 'd63', name: 'คันชิงหลิว 6.3ม. 8H', len: 6.3, k: 3.0, power: 8.5, speed: 100, price: 4800, color: '#2f3a4a', desc: 'คันใหญ่สำหรับบ่อปลาบิ๊กไซส์ ตีได้ไกลมาก พาวเวอร์ลิฟต์สูง แต่ยกคันช้า' },
{ id: 'd72', name: 'คันชิงหลิว 7.2ม. 12H', len: 7.2, k: 4.2, power: 14, speed: 85, price: 9500, color: '#1f2b24', desc: 'คันเฉพาะทางสำหรับปลาเฉาดำบ่อชิงรางวัล น้ำหนักมาก ต้องใจเย็นค่อยๆ อัดปลา' }
];
CC.LINES = [
{ id: 'l15', name: 'สายเมน 1.5 – สายหน้า 0.8', main: 3.2, leader: 2.0, vis: 0.95, price: 0, desc: 'ชุดมาตรฐานสำหรับปลานิลและปลาทับทิม' },
{ id: 'l10', name: 'สายเมน 1.0 – สายหน้า 0.6', main: 2.2, leader: 1.4, vis: 1.0, price: 60, desc: 'สายเล็ก ปลาเขี้ยวก็ยังกล้ากิน แต่ตอนอัดปลาต้องประคองมือให้ดี' },
{ id: 'l20', name: 'สายเมน 2.0 – สายหน้า 1.2', main: 4.4, leader: 2.9, vis: 0.86, price: 160, desc: 'เหนียวมั่นใจ อัดปลาไน 2–3 กก. ได้ดี' },
{ id: 'l30', name: 'สายเมน 3.0 – สายหน้า 2.0', main: 6.5, leader: 4.5, vis: 0.74, price: 320, desc: 'สายใหญ่สำหรับปลาไซส์ใหญ่ แต่ปลาจะระแวงสายมากขึ้น' },
{ id: 'l50', name: 'สายเมน 5.0 – สายหน้า 4.0', main: 11, leader: 8.5, vis: 0.62, price: 650, desc: 'สายสำหรับบ่อปลาใหญ่: ปลาไนยักษ์ ปลาเฉาดำไซส์กลาง' },
{ id: 'l80', name: 'สายเมน 8.0 – สายหน้า 6.0', main: 16, leader: 12.5, vis: 0.5, price: 1200, desc: 'สาย "ลากช้าง" สำหรับปลาเฉาดำเกิน 15 กก. ปลาเล็กแทบไม่เข้ากิน' },
{ id: 'l08', name: 'สายเมน 0.8 – สายหน้า 0.4', main: 1.8, leader: 1.0, vis: 1.05, price: 120, desc: 'สายเฉพาะทางตกปลาตะเพียนจีน: เส้นเล็กที่สุด ปลาดูดเหยื่อเป็นธรรมชาติ อาการทุ่นชัด วัดถูกจังหวะติดง่าย แต่เจอปลาใหญ่สายหน้าขาดง่ายมาก ต้องอัดอย่างนุ่มนวล' }
];
CC.HOOKS = [
{ id: 'i3', name: 'ตัวเบ็ด Iseama เบอร์ 3', size: 3, hold: 0.74, take: 1.12, w: 0.006, price: 0, desc: 'เบ็ดเล็ก ปลากินง่ายแต่เกี่ยวไม่ลึก เหมาะกับปลาตะเพียนจีนปากเล็ก' },
{ id: 'i5', name: 'ตัวเบ็ด Iseama เบอร์ 5', size: 5, hold: 0.86, take: 1.0, w: 0.009, price: 40, desc: 'ขนาดยอดนิยมสำหรับปลานิล 0.5–1 กก.' },
{ id: 'i7', name: 'ตัวเบ็ด Iseama เบอร์ 7', size: 7, hold: 0.94, take: 0.84, w: 0.013, price: 60, desc: 'เบ็ดใหญ่ วัดติดแน่น แต่ปลาเคี่ยวจะระแวงและกินน้อยลง ปลาตะเพียนเล็กอมไม่เข้า' },
{ id: 'i12', name: 'ตัวเบ็ด Iseama เบอร์ 12', size: 12, hold: 0.97, take: 0.7, w: 0.024, price: 90, desc: 'เบ็ดปลาใหญ่ ก้านหนาแข็งแรง ใช้สำหรับบ่อปลาเฉาดำ' }
];
CC.FLOATS = [
{ id: 'nano08', name: 'ทุ่นนาโน 0.8g', body: 0.8, n: 11, b: 0.010, nl: 0.7, tip: 1.0, price: 120, desc: 'ไวมาก เหมาะกับปลาเคี่ยวและน้ำนิ่ง แต่ลมแรงจะมองยาก' },
{ id: 'nano12', name: 'ทุ่นนาโน 1.2g', body: 1.2, n: 11, b: 0.013, nl: 0.8, tip: 1.0, price: 0, desc: 'ทุ่นนาโนมาตรฐาน สมดุลระหว่างความไวและความนิ่ง' },
{ id: 'lau18', name: 'ทุ่นก้านกก 1.8g', body: 1.8, n: 13, b: 0.016, nl: 0.9, tip: 1.2, price: 160, desc: 'นิ่งสู้ลมได้ดี หางทุ่นยาว 13 ข้อ' },
{ id: 'cong25', name: 'ทุ่นขนนกยูง 2.5g', body: 2.5, n: 9, b: 0.024, nl: 1.1, tip: 1.5, price: 280, desc: 'หางใหญ่เห็นชัด ความไวน้อยลง เหมาะกับตกไกลและตกปลาใหญ่' }
];
CC.BAIT = { name: 'เหยื่อป่นปลานิล (คาว)', w: 0.026, dissolve: 85, color: '#c9a46a' };
CC.LEAD_STEP = 0.005;
CC.POND = {
name: 'บ่อปลานิล สายชล', ticket: 200, caMinutes: 300,
note: 'บ่อตกชิงหลิวเชิงพาณิชย์: ค่าคันรอบ 5 ชั่วโมง เจ้าของบ่อรับซื้อปลาคืนตาม กก. ปลาต่ำกว่า 200 กรัมไม่นับ'
};
CC.FISH = [
{ id: 'rophi', name: 'ปลานิล', sci: 'Oreochromis niloticus', min: 0.22, max: 1.6, a: 0.022, mouth: 9,
str: 1.15, stam: 1.0, price: 35, abund: 1.0, wary: 0.45,
time: { dawn: 1.1, day: 0.9, dusk: 1.1, night: 0.4 },
rhythm: { dip: 0.15, slow: 0.05, bubbly: 0.1 }, temp: { opt: 29, tol: 6 },
pre: { brush: [0, 2], nibble: [1, 4] }, main: { sink: 0.6, lift: 0.22, run: 0.18 },
style: 'runner', shape: 'perch', stripes: true,
col: { body: '#7f8c8a', back: '#3f4f52', belly: '#d8dccd', fin: '#a65a4f' },
desc: 'ปลาหลักประจำบ่อตกปลา มักตอดชิมไม่กี่ทีแล้วดูดเหยื่อให้ทุ่นจมตอกคมๆ 1–2 ข้อ' },
{ id: 'dieuhong', name: 'ปลาทับทิม', sci: 'Oreochromis sp. (ปลานิลแดง)', min: 0.25, max: 1.5, a: 0.022, mouth: 9,
str: 1.1, stam: 1.0, price: 50, abund: 0.75, wary: 0.4,
time: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 0.4 },
rhythm: { dip: 0.15, slow: 0.05, bubbly: 0.1 }, temp: { opt: 28, tol: 6 },
pre: { brush: [0, 1], nibble: [0, 3] }, main: { sink: 0.5, lift: 0.32, run: 0.18 },
style: 'runner', shape: 'perch',
col: { body: '#e07a5a', back: '#b24a3a', belly: '#f6d6bc', fin: '#d0604a' },
desc: 'ปลานิลแดง ราคารับซื้อสูงกว่า กินเหยื่อไม่ค่อยตอด มักยกทุ่นถอนเบาๆ' },
{ id: 'diec', name: 'ปลาตะเพียนจีน', sci: 'Carassius auratus', min: 0.08, max: 0.55, a: 0.021, mouth: 4, bite: 'diec',
str: 0.75, stam: 0.85, price: 70, abund: 0.35, wary: 0.5,
time: { dawn: 1.25, day: 0.75, dusk: 1.2, night: 0.35 },
rhythm: { dip: 0.35, slow: 0, bubbly: 0.6 }, temp: { opt: 22, tol: 7 },
pre: { brush: [0, 1], nibble: [0, 2] }, main: { sink: 0.35, lift: 0.6, run: 0.05 },
style: 'runner', shape: 'carp',
col: { body: '#9c9a6a', back: '#5f6a44', belly: '#e3dcb0', fin: '#8b7d55' },
desc: 'กินเบามาก: แตะทุ่นลองเหยื่อก่อนแล้วค่อยทุ่นถอนขึ้น 1–3 ข้อ หรือทุ่นตอกคมๆ ครึ่ง–1 ข้อแล้วนิ่ง — เห็นแล้ววัดทันที ปลาตะเพียนจีนคายเหยื่อเร็วมาก หากทุ่นจมหายวับมักเป็นตัวเล็กแย่งเหยื่อ วัดสิบครั้งพลาดเก้า ปากเล็กควรใช้เบ็ดเบอร์เล็ก' },
{ id: 'chep', name: 'ปลาไน', sci: 'Cyprinus carpio', min: 0.6, max: 4.5, a: 0.017, mouth: 11,
str: 1.6, stam: 1.35, price: 85, abund: 0.12, wary: 0.7,
time: { dawn: 1.2, day: 0.5, dusk: 1.2, night: 0.8 },
rhythm: { dip: 0.3, slow: 0.5, bubbly: 1.0 }, temp: { opt: 25, tol: 7 },
pre: { brush: [1, 3], nibble: [0, 1] }, main: { sink: 0.35, lift: 0.45, run: 0.2 },
style: 'runner', shape: 'carp', barbels: true, scales: true,
col: { body: '#b38a3e', back: '#5e4a22', belly: '#ecd79c', fin: '#b0603a' },
desc: 'ปลาใหญ่และฉลาด มักว่ายชนสายให้ทุ่นโคลงก่อนเข้ากิน เมื่อติดเบ็ดจะวิ่งแรงมาก' },
{ id: 'tramden', name: 'ปลาเฉาดำ', sci: 'Mylopharyngodon piceus', min: 6, max: 32, a: 0.0115, mouth: 16,
str: 1.9, stam: 3.0, price: 0, abund: 1.0, wary: 0.75,
time: { dawn: 1.1, day: 0.7, dusk: 1.2, night: 1.0 },
rhythm: { dip: 0.3, slow: 0.4, bubbly: 0.5 }, temp: { opt: 26, tol: 7 },
pre: { brush: [1, 3], nibble: [0, 1] }, main: { sink: 0.35, lift: 0.4, run: 0.25 },
style: 'runner', shape: 'long', scales: true,
col: { body: '#3e4038', back: '#1c1d19', belly: '#8b8a78', fin: '#25261f' },
desc: 'ปลายักษ์ประจำบ่อชิงรางวัล ฉลาดมาก: ชนสายหลายครั้ง ยกทุ่นถอนเบาๆ แล้วค่อยกิน ติดเบ็ดทีสู้กันเป็นนาที' },
{ id: 'mehoa', name: 'ปลาซ่ง', sci: 'Hypophthalmichthys nobilis', min: 4, max: 18, a: 0.013, mouth: 16,
str: 1.3, stam: 1.4, price: 0, abund: 0.45, wary: 0.5,
time: { dawn: 0.9, day: 1.0, dusk: 0.9, night: 0.5 },
rhythm: { dip: 0.2, slow: 0.2, bubbly: 0.2 }, temp: { opt: 27, tol: 7 },
pre: { brush: [0, 2], nibble: [0, 1] }, main: { sink: 0.3, lift: 0.6, run: 0.1 },
style: 'bulldog', shape: 'bighead', spots: true,
col: { body: '#8e959a', back: '#4c5458', belly: '#e1e4e0', fin: '#6e7477' },
desc: 'หัวโต กินกลางน้ำ มักยกทุ่นถอน ดึงหนักหน่วงตื้อๆ มือ' },
{ id: 'muong', name: 'ปลาแปบ (ปลารบกวน)', sci: 'Hemiculter leucisculus', min: 0.02, max: 0.07, a: 0.009, mouth: 2.5,
str: 0.6, stam: 0.5, price: 0, abund: 0.6, wary: 0.2, tap: true,
time: { dawn: 1.0, day: 1.2, dusk: 1.0, night: 0.2 },
rhythm: { dip: 0, slow: 0, bubbly: 0 }, temp: { opt: 26, tol: 8 },
pre: { brush: [0, 0], nibble: [3, 8] }, main: {},
style: 'runner', shape: 'long',
col: { body: '#c0c8cc', back: '#6f7c84', belly: '#eef0ee', fin: '#9aa4a8' },
desc: 'ปลารบกวนตัวเล็ก ตอดถี่จนทุ่นกระตุกยิบ อย่าไปวัดตาม — เปลืองเหยื่อเปล่าๆ' },
{ id: 'thebe', name: 'ปลาซิว (ปลารบกวน)', sci: 'Acheilognathus tonkinensis', min: 0.008, max: 0.035, a: 0.024, mouth: 1.5, bite: 'jitter',
str: 0.4, stam: 0.4, price: 0, abund: 0.8, wary: 0.15, tap: true,
time: { dawn: 0.8, day: 1.3, dusk: 1.0, night: 0.1 },
rhythm: { dip: 0, slow: 0, bubbly: 0 }, temp: { opt: 28, tol: 7 },
pre: { brush: [0, 0], nibble: [5, 10] }, main: {},
style: 'runner', shape: 'disc',
col: { body: '#b9c3c8', back: '#5f7a8c', belly: '#f1e6e6', fin: '#d77f8e' },
desc: 'ปลารบกวนตัวจิ๋ว ลำตัวแบนเหลือบฟ้าชมพู เข้าฝูงกวนเหยื่อ: ทุ่นเด้งมั่วขึ้นลง จมวูบแล้วดีดกลับทันที อย่าไปวัด — ปั้นเหยื่อให้แข็งและก้อนใหญ่ขึ้น ลดกลิ่นคาว และอย่าอ่อยหนาเกินไป' },
{ id: 'tramco', name: 'ปลาเฉา', sci: 'Ctenopharyngodon idella', min: 1.2, max: 12, a: 0.0135, mouth: 13, bite: 'tramco',
str: 1.5, stam: 1.1, price: 60, abund: 0.08, wary: 0.6,
time: { dawn: 1.1, day: 1.0, dusk: 1.15, night: 0.35 },
rhythm: { dip: 0.1, slow: 0.35, bubbly: 0.15 }, temp: { opt: 27, tol: 6 },
pre: { brush: [0, 2], nibble: [0, 1] }, main: { sink: 0.3, lift: 0.2, run: 0.5 },
style: 'runner', shape: 'grass', net: true, fork: 0.35,
col: { body: '#a8a45c', back: '#56602f', belly: '#f0ead0', fin: '#6b6d42' },
desc: 'ลำตัวยาวกลม เกล็ดใหญ่ขอบเข้ม อมเหยื่อแล้วค่อยหันหัวว่ายออก: ทุ่นจมช้าๆ แล้วลากออกข้างหรือจมหาย — อย่ารีบวัด รอให้ทุ่นเดินชัดๆ หนึ่งจังหวะแล้วค่อยวัด ชอบเหยื่อหอมข้าวโพด รำเปรี้ยว ติดเบ็ดแล้วพุ่งยาว พอเข้าใกล้ตลิ่งยังส่ายหัวสะบัดหนีอีกรอบ' },
{ id: 'chimtrang', name: 'ปลาเปคู', sci: 'Piaractus brachypomus', min: 0.4, max: 3, a: 0.025, mouth: 9, bite: 'chim',
str: 1.5, stam: 1.1, price: 30, abund: 0.15, wary: 0.25,
time: { dawn: 0.85, day: 1.2, dusk: 1.0, night: 0.3 },
rhythm: { dip: 0.05, slow: 0, bubbly: 0 }, temp: { opt: 30, tol: 5 },
pre: { brush: [0, 1], nibble: [0, 1] }, main: { sink: 0.35, lift: 0.05, run: 0.6 },
style: 'runner', shape: 'pacu', redBelly: true, fork: 0.2,
col: { body: '#b7bfc2', back: '#4a545b', belly: '#eed3c4', fin: '#c8513a' },
desc: 'ตัวแบนกลม อกและครีบแดง ฟันคมเหมือนฟันคน ตะกละ กินจัดช่วงแดดอุ่น: ทุ่นสั่นหนึ่งทีแล้วจมหายวับหรือลากออกข้าง — วัดทันที ปล่อยไว้นานปลากลืนลึก ฟันจะกัดสายหน้าขาด ดึงแรงมากและวนเป็นวงกลม ชอบเหยื่อคาว' },
{ id: 'troi', name: 'ปลายี่สกเทศ', sci: 'Cirrhinus mrigala · Labeo rohita', min: 0.3, max: 2.6, a: 0.014, mouth: 6, bite: 'troi',
str: 1.3, stam: 1.5, price: 40, abund: 0.2, wary: 0.55,
time: { dawn: 1.0, day: 0.8, dusk: 1.15, night: 0.9 },
rhythm: { dip: 0.5, slow: 0.25, bubbly: 0.5 }, temp: { opt: 28, tol: 6 },
pre: { brush: [0, 1], nibble: [2, 5] }, main: { sink: 0.3, lift: 0.55, run: 0.15 },
style: 'runner', shape: 'rohu', rows: true, fork: 0.6,
col: { body: '#adb4b1', back: '#525d68', belly: '#f0efe6', fin: '#b56f5a' },
desc: 'ยี่สกเทศ: ตัวเพรียว หัวเล็ก หางแฉกลึก ครีบอมแดง เดินฝูงดูดเหยื่อติดก้นบ่อ: ทุ่นกระตุกยิบๆ สักพัก (อย่าเพิ่งวัด) แล้วค่อยทุ่นตอกคมๆ ครึ่ง–หนึ่งข้อแล้วนิ่ง หรือทุ่นถอนขึ้นช้าๆ — จังหวะนั้นค่อยวัด ปากเล็ก เหมาะกับเบ็ดเล็ก เหยื่อเปรี้ยวนุ่ม อัดตื้อ กดก้นบ่ออึดมาก' }
];
CC.FISH_BY_ID = {};
CC.FISH.forEach(f => { CC.FISH_BY_ID[f.id] = f; });
CC.WEATHERS = {
sunny: { name: 'แดดจัด', icon: '☀', bite: 0.85, rain: 0, cloud: 0.1, wind: [0.5, 3], tempOfs: 1.5, dur: [60, 160],
hint: 'ฟ้าเปิดแดดส่อง — น้ำใส ปลาค่อนข้างระแวง', hintNoon: 'แดดแรงจ้า — ปลาซึม ทุ่นขยับแค่เบาๆ อดทนรอจังหวะที่ชัดเจน' },
cloudy: { name: 'เมฆมาก', icon: '⛅', bite: 1.15, rain: 0, cloud: 0.55, wind: [1, 4], tempOfs: 0, dur: [60, 150],
hint: 'เมฆบังแดด — ปลากล้าเข้ากินมากขึ้น อาการทุ่นชัดขึ้น' },
overcast: { name: 'ครึ้ม อบอ้าว', icon: '🌥', bite: 1.3, rain: 0, cloud: 0.85, wind: [0, 1.2], tempOfs: 0.5, dur: [25, 50],
hint: 'ฟ้าครึ้ม ลมสงบ อากาศอบอ้าว — ปลามักฉวยจัดก่อนฝนตก!' },
drizzle: { name: 'ฝนปรอย', icon: '🌦', bite: 1.25, rain: 0.35, cloud: 0.9, wind: [1, 3], tempOfs: -2, dur: [40, 120],
hint: 'ฝนตกปรอยๆ — ปลานิลชอบมาก ทุ่นมักตอกจมคมๆ' },
rain: { name: 'ฝนซู่', icon: '🌧', bite: 0.9, rain: 1.0, cloud: 1.0, wind: [3, 6], tempOfs: -4, dur: [30, 80],
hint: 'ฝนตกหนัก — ผิวน้ำกระเพื่อม อ่านทุ่นยาก ปลากินช้าลง' },
windy: { name: 'ลมแรง', icon: '🌬', bite: 0.9, rain: 0, cloud: 0.4, wind: [6, 9], tempOfs: -1, dur: [40, 110],
hint: 'ลมกระโชกแรง — ทุ่นโคลงตลอด วัดเฉพาะจังหวะที่ทุ่นเดินขาดๆ' }
};
CC.WEATHER_ORDER = ['sunny', 'cloudy', 'overcast', 'drizzle', 'rain', 'windy'];
CC.WEATHER_NEXT = {
sunny: { sunny: 3, cloudy: 3, overcast: 0.5, windy: 1 },
cloudy: { sunny: 2, cloudy: 1.5, overcast: 2, drizzle: 0.5, windy: 1 },
overcast: { cloudy: 1, drizzle: 3, rain: 2.5 },
drizzle: { sunny: 0.5, cloudy: 3, drizzle: 1, rain: 1 },
rain: { cloudy: 2, drizzle: 2, rain: 0.5 },
windy: { sunny: 2, cloudy: 2, windy: 0.5 }
};
CC.RHYTHM = {
brush: [-0.8, 1.4],
nibble: [1.3, 3.0],
tremble: [0.9, 1.5],
dip: [1.1, 1.9],
lineBite: [-0.8, 1.6],
lineBiteRate: 0.035,
waveHot: [1.4, 2.4],
waveLull: [0.12, 0.45],
waveLen: [35, 110],
lullLen: [45, 160],
leaderOverload: 0.25,
leaderSpike: 1.3,
slackGrace: 1.2
};
CC.SYNC = { player: 'minh' };
