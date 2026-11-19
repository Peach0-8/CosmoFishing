// Người câu 3D: dựng hình cần thủ; hàng xóm NPC thay mồi, quăng câu, giật, dắt cá, vớt cá, khoe cá
(function () {
  const V = CC.View3D;
  if (!V || !V.ok) return;
  const T = THREE, U = CC.U, DEG = Math.PI / 180;
  const SHIRTS = ['#3d6f9a', '#e8eef0', '#b83a2e', '#2a2a2e', '#5b6b3a', '#d98c2b', '#6a4c9c', '#2f8f83', '#c9c2b0', '#1f4f8f'];
  const UMBS = [['#2e8b57'], ['#c0392b'], ['#2f6fb8'], ['#e8b923'], ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'],
    ['#5b6b3a', '#3a3f22'], ['#1f3f6f', '#e8e8e8'], ['#7a3fb0'], ['#e07a1a']];
  const HATS = [{ type: 'nonla', color: '#e3cf94' }, { type: 'cap', color: '#2b2b2b' }, { type: 'cap', color: '#b03028' },
    { type: 'bucket', color: '#7a8a5a' }, { type: 'cap', color: '#e8e8e8' }, { type: 'bucket', color: '#d8d0b8' }, { type: 'nonla', color: '#e3cf94' }];
  const BOXES = [['#e8e4dc', '#2f6fb8'], ['#222428', '#c0392b'], ['#f0f0f0', '#e07a1a'], ['#5b6b3a', '#3a3f22'], ['#2f6fb8', '#e8e4dc'], ['#8a5a32', '#5a3a1e']];
  const SKINC = ['#c98e62', '#b07850', '#d9a77c', '#a86b45'];
  const ROD_C = ['#2b2b2b', '#3b2a2a', '#1f2b24', '#2f3a4a', '#4a2f2f', '#b08d3c'];
  const pick = a => a[(Math.random() * a.length) | 0];

  // Tán dù: các múi tam giác, nhiều màu
  function umbrellaGeo(colors) {
    const n = 12, R = 1.15, h = 0.42, pos = [], col = [], c = new T.Color();
    for (let i = 0; i < n; i++) {
      const t0 = i / n * Math.PI * 2, t1 = (i + 1) / n * Math.PI * 2;
      pos.push(0, h, 0, Math.cos(t1) * R, 0, Math.sin(t1) * R, Math.cos(t0) * R, 0, Math.sin(t0) * R);
      c.set(colors[i % colors.length]);
      for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }
  function hatMesh(h) {
    const g = new T.Group(), m = V.mat(h.color);
    if (h.type === 'nonla') {
      const c = new T.Mesh(new T.ConeGeometry(0.25, 0.16, 18), m); c.position.y = 0.1; c.castShadow = true; g.add(c);
    } else if (h.type === 'bucket') {
      const c = new T.Mesh(V.CYL16, m); c.scale.set(0.1, 0.09, 0.1); c.position.y = 0.07; g.add(c);
      const b = new T.Mesh(V.CYL16, m); b.scale.set(0.17, 0.012, 0.17); b.position.y = 0.03; g.add(b);
    } else {
      const c = new T.Mesh(new T.SphereGeometry(0.108, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), m); c.position.y = 0.02; g.add(c);
      const b = new T.Mesh(V.BOX, m); b.scale.set(0.16, 0.012, 0.13); b.position.set(0, 0.025, 0.12); g.add(b);
    }
    return g;
  }

  // Một cần thủ trong khung tọa độ riêng: +Z hướng ra hồ, mép bờ ở z = 0, mặt bờ y = 0.45
  V.buildAngler = o => {
    const g = new T.Group(), B = V.BANK;
    const add = (geo, mat, x, y, z, sx, sy, sz, shadow) => {
      const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz);
      if (shadow) m.castShadow = true;
      g.add(m); return m;
    };
    add(V.BOX, V.mat(o.box[0]), 0, B + 0.13, -0.95, 0.5, 0.26, 0.36, true);
    add(V.BOX, V.mat(o.box[1]), 0, B + 0.29, -0.95, 0.52, 0.06, 0.38, true);
    const pants = V.mat('#2c2c34'), shoe = V.mat('#1e1e1e');
    for (const s of [-1, 1]) {
      add(V.BOX, pants, s * 0.1, B + 0.38, -0.78, 0.12, 0.12, 0.36);
      add(V.BOX, pants, s * 0.1, B + 0.18, -0.6, 0.11, 0.36, 0.12);
      add(V.BOX, shoe, s * 0.1, B + 0.02, -0.55, 0.1, 0.05, 0.2);
    }
    const torso = add(V.BOX, V.mat(o.shirt), 0, B + 0.6, -0.98, 0.36, 0.5, 0.22, true);
    torso.rotation.x = 0.12;
    const head = add(V.SPH, V.mat(o.skin), 0, B + 0.96, -0.92, 0.1, 0.11, 0.1, true);
    add(V.SPH, V.mat('#1c1712'), 0, B + 0.975, -0.935, 0.104, 0.105, 0.098);                // tóc phía sau
    add(V.BOX, V.mat(o.skin), 0, B + 0.86, -0.93, 0.07, 0.06, 0.07);                         // cổ
    const hat = hatMesh(o.hat); hat.position.copy(head.position); hat.position.y += 0.05; g.add(hat);
    const arms = [0, 1].map(() => { const m = new T.Mesh(V.UNIT_CYL, V.mat(o.shirt)); g.add(m); return m; });
    const hands = [0, 1].map(() => { const m = new T.Mesh(V.SPH, V.mat(o.skin)); m.scale.setScalar(0.045); g.add(m); return m; });
    add(V.UNIT_CYL, V.mat('#555555'), 0, B + 0.2, -0.12, 0.012, 0.4, 0.012);       // gác cần
    add(V.CYL16, V.mat('#3a7bd5'), 0.34, B + 0.05, -0.4, 0.13, 0.1, 0.13);           // chậu mồi
    add(V.CYL16, V.mat('#c9a46a'), 0.34, B + 0.1, -0.4, 0.115, 0.01, 0.115);
    // Dù
    const pole = add(V.UNIT_CYL, V.mat('#444444'), 0.55, B + 1.05, -1.1, 0.015, 2.1, 0.015);
    pole.rotation.x = 0.12;
    const can = new T.Mesh(umbrellaGeo(o.umb), new T.MeshLambertMaterial({ vertexColors: true, side: T.DoubleSide }));
    can.position.set(0.55, B + 2.12, -0.98); can.rotation.x = 0.16; can.castShadow = true;
    g.add(can);
    // Rọng cá thả xuống nước
    const keep = add(V.CYL16, new T.MeshLambertMaterial({ color: new T.Color('#2f5a3a'), transparent: true, opacity: 0.6 }), -0.5, -0.25, 0.3, 0.17, 0.7, 0.17);
    keep.material.depthWrite = false;
    // Vợt
    const net = new T.Group();
    const netPole = new T.Mesh(V.UNIT_CYL, V.mat('#9a9a9a')); net.add(netPole);
    const ring = new T.Mesh(new T.TorusGeometry(0.24, 0.012, 6, 20), V.mat('#333333')); net.add(ring);
    const bag = new T.Mesh(new T.ConeGeometry(0.24, 0.35, 12, 1, true), new T.MeshLambertMaterial({ color: new T.Color('#2d2d2d'), transparent: true, opacity: 0.55, side: T.DoubleSide, depthWrite: false }));
    net.add(bag);
    g.add(net);
    return { g, torso, head, hat, arms, hands, net: { g: net, pole: netPole, ring, bag } };
  };

  const sh = new T.Vector3(), hd = new T.Vector3();
  // Tay đưa tới cán cần (tọa độ trong nhóm của người câu)
  V.setArms = (A, h1, h2) => {
    const B = V.BANK;
    sh.set(-0.17, B + 0.78, -0.95); V.segBetween(A.arms[0], sh, h1, 0.04); A.hands[0].position.copy(h1);
    sh.set(0.17, B + 0.78, -0.95); V.segBetween(A.arms[1], sh, h2, 0.04); A.hands[1].position.copy(h2);
  };
  // Vợt: từ tay tới miệng vợt (local)
  const nv = new T.Vector3();
  V.setNet = (A, from, to, visible) => {
    const N = A.net;
    N.g.visible = visible;
    if (!visible) return;
    V.segBetween(N.pole, from, to, 0.014);
    N.ring.position.copy(to); N.ring.rotation.set(Math.PI / 2, 0, 0);
    N.bag.position.copy(to); N.bag.position.y -= 0.17; N.bag.rotation.set(Math.PI, 0, 0);
    nv.copy(to);
  };
  V.randomLook = () => ({ shirt: pick(SHIRTS), umb: pick(UMBS), hat: pick(HATS), box: pick(BOXES), skin: pick(SKINC) });

  // Phao hàng xóm (đơn giản cho nhẹ máy): tăm 2 màu + thân phao, gốc ở đỉnh tăm
  function simpleFloat(color) {
    const g = new T.Group(), nl = 0.02;
    const t1 = new T.Mesh(V.UNIT_CYL, V.basic(color)); t1.scale.set(0.008, nl * 3, 0.008); t1.position.y = -nl * 1.5; g.add(t1);
    const t2 = new T.Mesh(V.UNIT_CYL, V.basic('#1b1b1b')); t2.scale.set(0.008, nl * 5, 0.008); t2.position.y = -nl * 5.5; g.add(t2);
    const b = new T.Mesh(V.SPH, V.mat('#d9d2c0')); b.scale.set(0.02, 0.1, 0.02); b.position.y = -nl * 8 - 0.1; g.add(b);
    g.userData = { nl, len: nl * 8 + 0.2 };
    return g;
  }

  // ---------- Hàng xóm ----------
  let npcSrc = null;
  const npcs = [];
  V.npcList = npcs;
  function clearNPCs() { for (const a of npcs) V.disposeGroup(a.A.g); npcs.length = 0; }
  function buildNPC(n, sp) {
    const look = V.randomLook();
    const A = V.buildAngler(look);
    A.g.position.set(sp.x, 0, sp.y);
    A.g.rotation.y = Math.atan2(sp.nx, sp.ny);
    V.scene.add(A.g);
    // Cần theo kiểu hồ: lật vợt cá khủng dùng cần dài; hồ diếc nông câu sát bè rau nên dùng cần ngắn 3,6–4,5 m
    const pond = CC.pond();
    const pondRod = pond.type === 'latvot' ? U.rand(6.3, 7.2) : pond.id === 'diec' ? pick([3.6, 3.6, 3.9, 4.5, 4.5]) : pick([3.6, 4.5, 4.5, 5.4, 5.4, 6.3]);
    const rod = V.makeRod(A.g, pick(ROD_C), 7, 0.011, 0.003);
    const line = V.makeLine(A.g, '#e8e8e8', 10, 0.6);
    const fl = simpleFloat(pick(['#ff3b2f', '#ffd21a', '#2fd16b', '#ff7a00']));
    A.g.add(fl);
    const glow = V.glowSprite('#ff6a50'); glow.scale.setScalar(0.25); A.g.add(glow);
    const a = {
      n, sp, A, rod, line, fl, glow, len: pondRod, th: 4 * DEG, thT: 4 * DEG, yaw: 0, bend: 0.03,
      state: 'wait', timer: U.rand(3, 60), floatX: pondRod + U.rand(0.6, 1.4), fp: new T.Vector3(), fish: null,
      ph: Math.random() * 10, rest: U.rand(2, 7) * DEG, skill: n.skill
    };
    V.setNet(A, null, null, false);
    npcs.push(a);
    return a;
  }
  function syncNPCs(G) {
    const src = CC.PondMap.npcs;
    if (src === npcSrc) return;
    npcSrc = src;
    clearNPCs();
    if (!src) return;
    for (const id in src) {
      if (G.spot && +id === G.spot.id) continue;
      buildNPC(src[id], CC.PondMap.spot(+id));
    }
  }

  // Sự kiện từ mô phỏng: một NPC vừa dính cá
  V.npcCatch = e => {
    const a = npcs.find(x => x.n === e.npc);
    if (!a || a.state === 'fight' || a.state === 'net' || a.state === 'show') return;
    const w = e.w, sp = e.fish;
    const D = U.clamp(5 + Math.pow(w, 0.85) * 3.4, 5, 75);
    a.state = 'fight'; a.timer = 0;
    a.f = { w, sp, D, t: 0, L: Math.max(0.12, CC.fishLength(sp, w) / 100), x: a.floatX, y: -0.8, lat: 0, splT: 0, near: e.near };
    a.fish = V.fishMesh(sp, a.f.L);
    a.fish.visible = false;
    a.A.g.add(a.fish);
    const d = distToCam(a);
    if (d < 25) CC.Audio.splash(0.6, U.clamp(5 / d, 0.05, 0.6));
    V.spray(worldOf(a, a.floatX, 0, 0), 8, 1.4, 0.2, 0.03);
  };

  const wv = new T.Vector3();
  function worldOf(a, x, y, lat) { return a.A.g.localToWorld(wv.set(-lat, y, x)); }
  function distToCam(a) { return V.camera.position.distanceTo(a.A.g.position) + 0.01; }

  const SHOW_M = new T.Matrix4(), XZ = new T.Vector3(0, 0, 1), XX = new T.Vector3(1, 0, 0), XY = new T.Vector3(0, 1, 0);
  const base = new T.Vector3(), axis = new T.Vector3(), end = new T.Vector3(), h2 = new T.Vector3(), tmp = new T.Vector3(), netTo = new T.Vector3();
  function updateNPC(a, dt, night) {
    const A = a.A, t = V.time + a.ph;
    a.timer -= dt;
    let floatMode = 'water', bendT = 0.03, yawT = 0;
    switch (a.state) {
      case 'wait':
        a.thT = a.rest + Math.sin(t * 0.3) * 0.5 * DEG;
        if (a.timer <= 0) { a.state = U.chance(0.3) ? 'jerk' : 'lift'; a.timer = a.state === 'jerk' ? 0.5 : 1.1; }
        break;
      case 'jerk': // giật hụt
        a.thT = 32 * DEG; bendT = 0.2;
        if (a.timer <= 0) { a.state = 'lift'; a.timer = 1.1; }
        break;
      case 'lift': // nhấc cần thay mồi
        a.thT = 58 * DEG; floatMode = 'hang';
        if (a.timer <= 0) { a.state = 'cast'; a.timer = 0.85; }
        break;
      case 'cast':
        a.thT = 8 * DEG; floatMode = 'fly';
        if (a.timer <= 0) {
          a.state = 'wait'; a.timer = U.rand(25, 110);
          const p = worldOf(a, a.floatX, 0, 0);
          V.ripple(p.x, p.z, 0.25, 0.4);
        }
        break;
      case 'fight': {
        const f = a.f;
        f.t += dt;
        const p = Math.min(1, f.t / f.D), str = U.clamp(0.35 + f.w * 0.35, 0.35, 1);
        f.x = U.lerp(a.floatX, 1.05, U.smooth(0, 1, Math.pow(p, 0.85))) + Math.sin(f.t * 0.8 + a.ph) * 0.7 * (1 - p) * str;
        f.lat = Math.sin(f.t * 0.55 + a.ph * 2) * Math.min(2.4, 0.5 + f.w * 0.3) * (1 - p * 0.85);
        f.y = -U.lerp(0.9, 0.04, U.smooth(0.35, 0.92, p)) + Math.sin(f.t * 2.3) * 0.05;
        a.thT = (40 + 14 * Math.sin(f.t * 1.4 + a.ph) + 8 * p) * DEG;
        bendT = (0.45 + 0.35 * Math.abs(Math.sin(f.t * 2.6))) * str * (1 - 0.35 * p);
        yawT = Math.atan2(f.lat, Math.max(0.6, f.x)) * 0.85;
        floatMode = 'fight';
        // Té nước khi cá lên gần mặt
        f.splT -= dt;
        if (f.y > -0.35 && f.splT <= 0) {
          f.splT = U.rand(0.25, 0.9) / (0.5 + str);
          const wp = worldOf(a, f.x, 0, f.lat);
          V.spray(wp, Math.round(6 + 14 * str), 1.2 + 1.6 * str, 0.12 + f.L * 0.3, 0.035);
          V.ripple(wp.x, wp.z, 0.3 + 0.4 * str, 0.5);
          const d = distToCam(a);
          if (d < 30 && Math.random() < 0.5) CC.Audio.splash(0.4 + 0.4 * str, U.clamp(4 / d, 0.04, 0.5));
        }
        if (p >= 1) { a.state = f.w < 0.3 ? 'handlift' : 'net'; a.timer = f.w < 0.3 ? 0.7 : 1.6; }
        break;
      }
      case 'handlift': {
        const f = a.f;
        a.thT = 75 * DEG; bendT = 0.25; floatMode = 'fight';
        f.y = U.lerp(f.y, 0.6, Math.min(1, dt * 4)); f.x = U.lerp(f.x, 0.5, Math.min(1, dt * 3)); f.lat *= 0.9;
        if (a.timer <= 0) startShow(a);
        break;
      }
      case 'net': {
        const f = a.f;
        a.thT = 62 * DEG; bendT = 0.35; floatMode = 'fight';
        const k = 1 - a.timer / 1.6;
        f.y = 0.02 + Math.sin(V.time * 14) * 0.03; f.x = U.lerp(f.x, 1.1, Math.min(1, dt * 2)); f.lat *= 0.95;
        if (Math.random() < dt * 8) { const wp = worldOf(a, f.x, 0, f.lat); V.spray(wp, 5, 1.4, 0.15, 0.03); V.ripple(wp.x, wp.z, 0.3, 0.5); }
        netTo.set(-f.lat, U.lerp(-0.1, 0.0, k), f.x);
        if (a.timer <= 0) { startShow(a); }
        break;
      }
      case 'show': {
        const f = a.f;
        a.thT = 20 * DEG; bendT = 0.03; floatMode = 'hang';
        if (a.timer <= 0) {
          const latvot = CC.pond().type === 'latvot';
          if (latvot || f.w < 0.2) { const wp = worldOf(a, 0.8, 0, -0.3); V.spray(wp, 12, 1.5, 0.2, 0.035); V.ripple(wp.x, wp.z, 0.4, 0.5); }
          V.disposeGroup(a.fish); a.fish = null; a.f = null;
          a.state = 'lift'; a.timer = U.rand(2, 5);
        }
        break;
      }
    }

    // Góc cần, uốn cần, xoay ngang
    const sp = (a.state === 'cast' ? 260 : a.state === 'jerk' ? 220 : 90) * DEG * dt;
    a.th += U.clamp(a.thT - a.th, -sp, sp);
    a.bend += (bendT - a.bend) * Math.min(1, dt * 5);
    a.yaw += (yawT - a.yaw) * Math.min(1, dt * 2);
    base.set(-0.05, 0.62, -0.35);
    const c = Math.cos(a.th);
    axis.set(-Math.sin(a.yaw) * c, Math.sin(a.th), Math.cos(a.yaw) * c).normalize();

    // Đầu dây: phao trên mặt nước, phao treo, phao bay, hoặc miệng cá
    if (floatMode === 'fight' && a.f) end.set(-a.f.lat, a.f.y, a.f.x);
    else if (floatMode === 'water') end.set(0, 0, a.floatX);
    else end.copy(base).addScaledVector(axis, a.len).add(tmp.set(0, -0.6, 0));
    let tip;
    if (floatMode === 'fly') {
      const k = 1 - U.clamp(a.timer / 0.85, 0, 1);
      tip = V.updateRod(a.rod, base, axis, a.len, null, 0);
      end.set(0, U.lerp(tip.y - 0.6, 0, k) + Math.sin(k * Math.PI) * 1.2, U.lerp(tip.z, a.floatX, k));
    } else tip = V.updateRod(a.rod, base, axis, a.len, end, a.bend);

    // Phao
    const fl = a.fl, ud = fl.userData;
    if (floatMode === 'water') {
      const bob = Math.sin(t * 2.1) * 0.006 + Math.sin(t * 0.7) * 0.004;
      fl.position.set(0, ud.nl * 2.5 + bob, a.floatX); fl.rotation.set(0, 0, 0);
      V.setLine(a.line, tip, tmp.set(0, fl.position.y, a.floatX), 0.15);
    } else if (floatMode === 'fight' && a.f) {
      // phao trượt trên dây, cách cá ~1 m
      tmp.subVectors(tip, end); const d = tmp.length() || 1;
      fl.position.copy(end).addScaledVector(tmp, Math.min(0.9, 1.1 / d));
      fl.rotation.set(0, 0, 0);
      V.setLine(a.line, tip, end, 0.02);
    } else {
      fl.position.copy(end).add(tmp.set(0, ud.len * 0.3, 0)); fl.rotation.set(0, 0, 0);
      V.setLine(a.line, tip, fl.position, 0);
    }
    a.glow.visible = night > 0.05 && floatMode === 'water';
    if (a.glow.visible) { a.glow.position.copy(fl.position); a.glow.material.opacity = night; }

    // Tay ôm cán cần
    h2.copy(base).addScaledVector(axis, 0.32);
    V.setArms(A, base, h2);

    // Cá và vợt
    if (a.fish && a.f) {
      const f = a.f, F = a.fish;
      F.visible = true;
      if (a.state === 'show') {
        // Giơ cá dọc trước ngực, mạn cá quay ra hồ cho mọi người thấy
        F.position.set(0.05, V.BANK + 0.62 + f.L * 0.3, -0.55);
        SHOW_M.makeBasis(XZ, XX, XY);
        F.quaternion.setFromRotationMatrix(SHOW_M);
        F.rotateY(Math.sin(V.time * 9) * 0.25);
        F.userData.tail.rotation.y = Math.sin(V.time * 16) * 0.5;
      } else {
        F.position.set(-f.lat, f.y, f.x);
        const ang = a.state === 'fight' ? Math.sin(V.time * 0.9 + a.ph) : 0;
        F.lookAt(F.parent.localToWorld(tmp.set(-f.lat - Math.cos(ang) * 0.5, f.y + 0.05, f.x + Math.sin(ang) * 0.5 + 0.3)));
        F.userData.tail.rotation.y = Math.sin(V.time * (a.state === 'net' ? 18 : 10)) * 0.45;
      }
    }
    if (a.state === 'net') {
      V.setNet(A, tmp.set(0.2, V.BANK + 0.5, -0.5), netTo, true);
    } else V.setNet(A, null, null, false);
  }

  function startShow(a) {
    a.state = 'show'; a.timer = 2.6;
    const f = a.f;
    const name = f.sp.name.replace(/^ปลา/, '').replace(' (ปลารบกวน)', '');
    const latvot = CC.pond().type === 'latvot';
    const txt = `<b>${a.n.name}</b> · ปลา${name} ${U.fmtKg(f.w)}${latvot ? ' · ชั่งปล่อย' : ''}`;
    const head = a.A.head, lp = new T.Vector3();
    const bigW = latvot ? 18 : CC.pond().bigW ? CC.pond().bigW[1] : 1.5; // hồ diếc: cá 5 lạng đã là cá to
    V.label(txt, () => head.getWorldPosition(lp).add(tmp.set(0, 0.55, 0)), 3.6, f.w > bigW ? 'big' : '');
    const d = distToCam(a);
    if (d < 40) CC.Audio.splash(0.5, U.clamp(3 / d, 0.03, 0.4));
  }

  V.updateNPCs = (G, dt) => {
    syncNPCs(G);
    const night = U.clamp((0.5 - CC.world.light()) / 0.5, 0, 1);
    for (const a of npcs) updateNPC(a, dt, night);
  };
})();
