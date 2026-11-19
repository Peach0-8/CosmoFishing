// Người chơi trong 3D: cần – dây – phao – bộ lưỡi, cá đang dắt, té nước, camera góc ngồi câu, thước góc cần
(function () {
  const V = CC.View3D;
  if (!V || !V.ok) return;
  const T = THREE, U = CC.U, DEG = Math.PI / 180;
  V.FS = 2.6; // phóng đại phao của mình cho dễ nhìn (khung phóng to vẫn đúng tỉ lệ)
  let P = null, spotId = null, sig = '', prevState = null;
  const cam = { pos: new T.Vector3(), tgt: new T.Vector3(), init: false, shake: 0, kick: 0, lastTs: 0, fov: 44 };
  const vBase = new T.Vector3(), vAxis = new T.Vector3(), vEnd = new T.Vector3(), vTmp = new T.Vector3(), vTmp2 = new T.Vector3();
  const vFish = new T.Vector3(), vHead = new T.Vector3(), vMouth = new T.Vector3(), vRight = new T.Vector3(), q = new T.Quaternion();
  const UP = new T.Vector3(0, 1, 0), vLie = new T.Vector3();

  function skinSig() {
    return ['box', 'umb', 'hat', 'shirt', 'rod', 'line', 'tip', 'hook'].map(c => CC.skin(c).id).join() + CC.P.float + CC.P.rod;
  }

  function buildPlayer(G) {
    if (P) {
      V.disposeGroup(P.A.g);
      for (const s of P.rod.segs) V.scene.remove(s);
      for (const o of [P.line, P.uline, P.flt, P.glow, P.under]) V.disposeGroup(o);
      V.disposeGroup(P.fish);
    }
    const hat = CC.skin('hat'), box = CC.skin('box');
    const A = V.buildAngler({ shirt: CC.skin('shirt').color, umb: CC.skin('umb').colors, hat: { type: hat.type, color: hat.color }, box: [box.c1, box.c2], skin: '#c98e62' });
    const sp = G.spot;
    A.g.position.set(sp.x, 0, sp.y);
    A.g.rotation.y = Math.atan2(sp.nx, sp.ny);
    V.scene.add(A.g);
    const rod = V.makeRod(V.scene, CC.skin('rod').color || CC.rod().color, 18, 0.013, 0.0032);
    const lc = 'rgb(' + CC.skin('line').rgb + ')';
    const line = V.makeLine(V.scene, lc, 28, 0.9);
    const uline = V.makeLine(V.scene, lc, 2, 0.7);
    const flt = V.makeFloat(CC.float(), CC.skin('tip'), V.FS, 0.0075);
    V.scene.add(flt);
    const glow = V.glowSprite('rgb(' + CC.skin('tip').glow + ')');
    glow.scale.setScalar(0.32);
    V.scene.add(glow);
    // Bộ lưỡi dưới nước (thấy khi bật nhìn dưới nước)
    const under = new T.Group();
    const lead = new T.Mesh(V.UNIT_CYL, V.mat('#9aa0a6')); lead.scale.set(0.006, 0.03, 0.006); under.add(lead);
    const snoods = [0, 1].map(() => V.makeLine(under, '#e6ece8', 2, 0.8));
    const hookC = CC.skin('hook').color;
    const hooks = [0, 1].map(() => { const m = new T.Mesh(new T.TorusGeometry(0.008, 0.0015, 4, 10, Math.PI * 1.3), V.mat(hookC)); under.add(m); return m; });
    const baits = [0, 1].map(() => { const m = new T.Mesh(V.SPH, V.mat(CC.BAIT.color)); under.add(m); return m; });
    V.scene.add(under);
    P = { A, rod, line, uline, flt, glow, under, lead, snoods, hooks, baits, fish: null, fightRef: null, yaw: 0, fx: { splT: 0, ripT: 0, cutT: 0, sndT: 0, bubT: 0, rip2: 0 } };
  }

  // ---------- Cập nhật mỗi khung hình ----------
  V.updateRig = (G, dt) => {
    if (!G.spot) return;
    if (!P || spotId !== G.spot.id || sig !== skinSig()) { buildPlayer(G); spotId = G.spot.id; sig = skinSig(); cam.init = false; }
    const fr = V.frame(G.spot), rodD = CC.rod(), F = G.fight, fight = G.state === 'fighting' && F;
    vRight.set(fr.rx, 0, fr.rz);
    const t = V.time;

    // Cần: góc nâng theo G.theta, đưa ngang theo G.phi (người chơi dòng cá); cách điều khiển cũ thì tự xoay theo cá
    const yawT = fight ? (CC.P && CC.P.fightCtl === 'aim' ? Math.atan2(F.lat, Math.max(0.6, F.fx)) * 0.9 : G.phi || 0) : 0;
    P.yaw += (yawT - P.yaw) * Math.min(1, dt * 3);
    V.toWorld(fr, CC.ROD_BASE.x, CC.ROD_BASE.y, 0.06, vBase);
    const c = Math.cos(G.theta);
    V.dirWorld(fr, c * Math.cos(P.yaw), Math.sin(G.theta), c * Math.sin(P.yaw), vAxis).normalize();

    // Đầu dây
    const fl = P.flt, nl = fl.userData.nl, flen = fl.userData.len;
    let floatMode, bend = G.bend || 0;
    if (fight) {
      floatMode = 'fight';
      V.toWorld(fr, F.fx, F.fy, F.lat, vFish);
      // Lực căng tức thời làm đọt rung bần bật (nhất là lúc cá giật đầu)
      P.bendFast = (P.bendFast || 0) + ((F.T / rodD.power) - (P.bendFast || 0)) * Math.min(1, dt * 18);
      bend = U.clamp(0.55 * bend + 0.45 * P.bendFast, 0, 1);
    } else if (G.state === 'flying') floatMode = 'fly';
    else if (G.state === 'sinking' || G.state === 'waiting') floatMode = 'water';
    else floatMode = 'hang';

    let tip;
    if (floatMode === 'fight') {
      fishOrient(G, F, fr, dt);
      tip = V.updateRod(P.rod, vBase, vAxis, rodD.len, vMouth, bend);
    } else if (floatMode === 'water') {
      vEnd.copy(V.toWorld(fr, G.floatX, 0, 0, vTmp));
      tip = V.updateRod(P.rod, vBase, vAxis, rodD.len, vEnd, bend);
    } else if (floatMode === 'fly') {
      tip = V.updateRod(P.rod, vBase, vAxis, rodD.len, null, 0);
      const f = G.fly, p = U.clamp(f.t / f.dur, 0, 1);
      V.toWorld(fr, U.lerp(f.x0, f.x1, p), U.lerp(f.y0 - 0.55, 0, p) + Math.sin(p * Math.PI) * 1.1 + flen, 0, vEnd);
    } else {
      vEnd.copy(vBase).addScaledVector(vAxis, rodD.len);
      vEnd.y -= 0.55;
      tip = V.updateRod(P.rod, vBase, vAxis, rodD.len, vEnd, 0.04);
      vEnd.copy(tip); vEnd.y -= 0.5 - flen * 0.4;
      vEnd.addScaledVector(vRight, Math.sin(t * 1.7) * 0.05);
    }

    // Phao
    P.glow.visible = false;
    if (floatMode === 'water') {
      const v = G.dyn.v + G.dyn.wave, lie = CC.Rig.lie(G.dyn.v);
      // nấc để vẽ: không cho phao "bay" khỏi mặt nước; nằm hẳn thì giữa thân phao ở ngay mặt nước
      const vv = CC.Rig.drawV(G.dyn.v, G.dyn.wave, fl.userData.body / 2 / nl);
      const wp = V.toWorld(fr, G.floatX, 0, (G.dyn.drift || 0) * 2, vTmp2); // cá ngậm mồi bơi ngang: phao đi ngang
      // Đứng thì nghiêng tới/lui theo hướng quăng; đổ nằm thì nằm chéo trên mặt nước
      // (nằm dọc hướng nhìn thì từ chỗ ngồi chỉ thấy một chấm)
      vLie.copy(vRight).applyAxisAngle(UP, 0.75 * lie);
      q.setFromAxisAngle(vLie, -(G.dyn.tilt || 0));
      fl.quaternion.copy(q);
      fl.position.copy(vTmp.set(0, vv * nl, 0).applyQuaternion(q)).add(wp);
      V.setLine(P.line, tip, fl.position, 0.03 + 0.012 * rodD.len);
      const night = U.clamp((0.55 - CC.world.light()) / 0.55, 0, 1);
      if (night > 0.03 && v > -0.3) {
        P.glow.visible = true; P.glow.position.copy(fl.position);
        P.glow.material.opacity = Math.min(1, night * (CC.skin('tip').bright || 1));
      }
      // Phao nhấp tạo gợn nước
      P.fx.ripT -= dt;
      if (Math.abs(G.dyn.vel) > 6 && P.fx.ripT <= 0) { P.fx.ripT = 0.3; V.ripple(wp.x, wp.z, U.clamp(Math.abs(G.dyn.vel) / 40, 0.05, 0.3), 0.35); }
    } else if (floatMode === 'fight') {
      vTmp.subVectors(tip, vMouth); const d = vTmp.length() || 1; vTmp.divideScalar(d);
      fl.position.copy(vMouth).addScaledVector(vTmp, Math.min(G.rig.set / 100, d * 0.85) + flen);
      fl.quaternion.setFromUnitVectors(UP, vTmp);
      V.setLine(P.line, tip, vMouth, U.clamp(-F.stretch, 0, 0.6));
    } else {
      fl.quaternion.identity();
      fl.position.copy(vEnd);
      V.setLine(P.line, tip, fl.position, 0);
    }
    P.flt.visible = true;

    // Bộ lưỡi dưới nước
    updateUnder(G, fr, floatMode);
    // Tay cầm cần
    const A = P.A;
    const h1 = A.g.worldToLocal(vTmp.copy(vBase)), h2 = A.g.worldToLocal(vTmp2.copy(vBase).addScaledVector(vAxis, 0.32));
    V.setArms(A, h1.clone(), h2.clone());
    // Vợt chờ sẵn khi cá vào gần
    if (fight && F.fx < 3.2) {
      const to = A.g.worldToLocal(V.toWorld(fr, Math.min(F.fx, 2.8) * 0.9, F.landable ? -0.05 : 0.25, F.lat * 0.9, vTmp));
      V.setNet(A, new T.Vector3(0.25, V.BANK + 0.55, -0.55), to.clone(), true);
    } else V.setNet(A, null, null, false);

    effects(G, fr, dt, floatMode, tip);
    stateFx(G, fr);
    camera(G, fr, dt, floatMode, tip);
  };

  // Hướng cá, quẫy đuôi; đặt vMouth
  function fishOrient(G, F, fr, dt) {
    if (P.fightRef !== F) {
      V.disposeGroup(P.fish);
      P.fish = V.fishMesh(F.sp, Math.max(0.1, CC.fishLength(F.sp, F.w) / 100));
      V.scene.add(P.fish);
      P.fightRef = F;
      P.heading = V.dirWorld(fr, 1, -0.2, 0, new T.Vector3()).normalize();
    }
    const L = P.fish.userData.L;
    const sp = Math.hypot(F.vx, F.vy, F.latV);
    if (sp > 0.15) {
      V.dirWorld(fr, F.vx, F.vy * 0.6, F.latV, vHead).normalize();
      P.heading.lerp(vHead, Math.min(1, dt * 5)).normalize();
    }
    const rodTip = P.rod.tip;
    vHead.copy(P.heading);
    if (F.fy > 0.02) vHead.subVectors(rodTip, vFish).normalize();                         // treo trên không
    else if (F.fy > -0.15) vHead.lerp(vTmp.subVectors(rodTip, vFish).normalize(), 0.55).normalize(); // nổi đầu, uống nước
    if (F.state === 'shake') vHead.applyAxisAngle(UP, Math.sin(F.t * 22) * 0.4);
    P.fish.position.copy(vFish);
    P.fish.lookAt(vTmp.copy(vFish).add(vHead));
    vMouth.copy(vFish).addScaledVector(vHead, L * 0.42);
    const freq = F.state === 'run' ? 16 : F.state === 'shake' ? 22 : F.state === 'tired' ? 5 : 10;
    P.fish.userData.tail.rotation.y = Math.sin(F.t * freq) * (F.fy > 0.02 ? 0.7 : 0.4);
    P.fish.visible = true;
  }

  function updateUnder(G, fr, mode) {
    const show = G.learn && mode === 'water' && G.sol;
    P.under.visible = !!show;
    P.uline.visible = !!show;
    if (!show) return;
    const sol = G.sol, bottom = CC.bottomDepth(G.floatX) * 100;
    const leadD = Math.min(sol.leadD, bottom) / 100, low = Math.min(sol.low, bottom) / 100, up = Math.min(sol.up, bottom) / 100;
    const top = V.toWorld(fr, G.floatX, -0.05, 0, vTmp);
    const lead = V.toWorld(fr, G.floatX, -leadD, 0, vTmp2);
    V.setLine(P.uline, top, lead, 0);
    P.lead.position.copy(lead); P.lead.position.y += 0.015;
    const hk = [V.toWorld(fr, G.floatX + 0.04, -up, -0.03), V.toWorld(fr, G.floatX + 0.06, -low, 0.03)];
    for (let i = 0; i < 2; i++) {
      V.setLine(P.snoods[i], lead, hk[i], 0);
      P.hooks[i].position.copy(hk[i]);
      const b = G.rig.baits[i];
      P.baits[i].visible = b > 0.002;
      P.baits[i].position.copy(hk[i]);
      P.baits[i].scale.setScalar(0.006 + 0.012 * Math.sqrt(b / CC.BAIT.w));
    }
  }

  // ---------- Hiệu ứng nước quanh mình ----------
  function effects(G, fr, dt, mode, tip) {
    const fx = P.fx, ca = CC.P.ca;
    // Sủi tăm ở ổ: cá về ổ đông thì bọt li ti nổi lên nhiều
    if (ca && ca.active && mode !== 'fight') {
      fx.bubT -= dt;
      // đàn cá vào ổ ăn rộ thì tăm sủi dày (CC.Pond.bubbles: cùng cách tính với bản PC)
      const rate = 0.08 * CC.Pond.fish + 4 * (CC.Pond.bubbles || 0);
      if (fx.bubT <= 0) {
        fx.bubT = U.rand(0.4, 1.6) / Math.max(0.05, rate);
        const p = V.toWorld(fr, G.spotX + U.gauss() * 0.35, 0, U.gauss() * 0.4);
        V.bubbles(p, U.randi(2, 6), 0.05, 0.011, U.rand(1.2, 2.4));
      }
    }
    // Nắm xả đang rã: bọt mồi sủi quanh phao
    if (mode === 'water' && G.rig.kind === 'xa' && G.rig.baits[0] + G.rig.baits[1] > 0.002 && Math.random() < dt * 6) {
      V.bubbles(V.toWorld(fr, G.floatX + U.gauss() * 0.1, 0, U.gauss() * 0.1), 2, 0.05, 0.012, 1.5);
    }
    if (mode !== 'fight') return;
    const F = G.fight, L = P.fish.userData.L;
    const speed = Math.hypot(F.vx, F.vy, F.latV);
    const depth = -F.fy;
    const sz = U.clamp(0.4 + F.w * 0.25, 0.4, 2.2);
    // Cá vùng vẫy sát mặt nước
    if (depth < 0.22 + L * 0.25) {
      const thrash = (F.state === 'shake' ? 1.1 : 0) + speed * 0.55 + (F.gulping ? 0.5 : 0) + (F.state === 'run' ? 0.4 : 0);
      fx.splT -= dt;
      if (thrash > 0.25 && fx.splT <= 0) {
        fx.splT = U.rand(0.08, 0.22) + 0.25 / thrash;
        const sp = vTmp.copy(vFish); sp.y = 0;
        V.spray(sp, Math.round((5 + 10 * thrash) * Math.min(1.6, sz)), 0.9 + 1.4 * thrash * Math.min(1.4, sz), 0.08 + L * 0.3, 0.03 + 0.012 * sz);
        V.ripple(sp.x, sp.z, U.clamp(0.25 + 0.3 * thrash, 0.2, 0.9), 0.5 + 0.2 * thrash);
        fx.sndT -= 1;
        if (fx.sndT <= 0) { fx.sndT = 2; CC.Audio.splash(U.clamp(0.3 + 0.35 * thrash * sz, 0.3, 1.5), 0.8); cam.kick = Math.max(cam.kick, 0.012 * sz); }
      }
      if (F.gulping && Math.random() < dt * 10) V.bubbles(vMouth.clone().setY(0), 3, 0.06, 0.016, 1.2);
    } else if (Math.random() < dt * 1.5 * (1.4 - Math.min(1.2, depth))) {
      // cá ở sâu: chỉ thấy bọt và vệt gợn
      const sp = vTmp.copy(vFish); sp.y = 0;
      V.bubbles(sp, 3, 0.15, 0.012, 1.4);
    }
    // Dây xé nước khi cá chạy ngang
    if (tip && F.fy < -0.02) {
      const s = tip.y / (tip.y - vMouth.y);
      if (s > 0 && s < 1) {
        const cut = vTmp2.copy(tip).lerp(vMouth, s);
        const lat = Math.abs(F.latV) + Math.abs(F.vx) * 0.6;
        fx.cutT -= dt;
        if (lat > 0.5 && fx.cutT <= 0) {
          fx.cutT = 0.12;
          V.spray(cut, Math.round(2 + lat * 3), 0.5 + lat * 0.4, 0.04, 0.022);
          V.ripple(cut.x, cut.z, U.clamp(lat * 0.18, 0.1, 0.4), 0.45);
        }
      }
    }
  }

  // Hiệu ứng khi đổi trạng thái: phao chạm nước, giật dính, mất cá, nhấc cần
  function stateFx(G, fr) {
    const s = G.state;
    if (s === prevState) return;
    const fp = P.flt.position;
    if (prevState === 'flying' && s === 'sinking') {
      const w = V.toWorld(fr, G.floatX, 0, 0);
      V.spray(w, 10, 1.1, 0.08, 0.025);
      V.ripple(w.x, w.z, 0.45, 0.45);
      if (G.rig.kind === 'xa') V.ripple(w.x, w.z, 0.3, 0.3);
    }
    if (s === 'fighting') {
      V.look.yaw = 0; V.look.pitch = 0; V.watchA = null;
      cam.kick = 0.05;
      const w = V.toWorld(fr, G.floatX, 0, 0);
      V.spray(w, 22, 1.8, 0.15, 0.035);
      V.ripple(w.x, w.z, 0.8, 0.6);
    }
    if (prevState === 'fighting' && s !== 'fighting' && s !== 'landed') {
      cam.kick = 0.05;
      if (P.fish) { const w = P.fish.position.clone(); if (w.y > -0.6) { w.y = 0; V.spray(w, 18, 1.6, 0.2, 0.035); V.ripple(w.x, w.z, 0.7, 0.6); } }
    }
    if ((prevState === 'waiting' || prevState === 'sinking') && s === 'hand') {
      const w = V.toWorld(fr, G.floatX, 0, 0);
      V.spray(w, 8, 1.4, 0.05, 0.022);
      V.ripple(w.x, w.z, 0.3, 0.45);
    }
    if (s !== 'fighting' && P.fish) { V.disposeGroup(P.fish); P.fish = null; P.fightRef = null; }
    prevState = s;
  }

  // ---------- Camera góc ngồi câu ----------
  const cPos = new T.Vector3(), cTgt = new T.Vector3(), cDir = new T.Vector3(), cSide = new T.Vector3();
  function camera(G, fr, dt, mode, tip) {
    const C = V.camera, F = G.fight;
    V.toWorld(fr, -3.0, 2.05, 1.0, cPos);
    let fovT;
    if (V.watchA && (V.watchA.state === 'wait' || !V.watchA.A.g.parent)) V.watchA = null; // họ câu lại rồi: quay về phao mình
    if (mode === 'fight') {
      cTgt.copy(vFish); cTgt.y = Math.max(-0.25, cTgt.y);
      cTgt.lerp(tip, 0.3);
      cPos.addScaledVector(vRight, U.clamp(F.lat * 0.18, -0.6, 0.6));
      fovT = 58;
      V.look.yaw *= Math.exp(-dt * 2); V.look.pitch *= Math.exp(-dt * 2);
    } else if (V.watchA && V.watchA.A.g.parent) {
      // Xem hàng xóm dắt cá: vẫn ngồi ở ô mình, quay đầu và nheo mắt nhìn sang
      const a = V.watchA;
      if (a.f && a.fish) a.fish.getWorldPosition(cTgt).lerp(a.A.head.getWorldPosition(vTmp2), 0.45);
      else a.A.head.getWorldPosition(cTgt);
      cTgt.y = Math.max(0.3, cTgt.y);
      const d = cTgt.distanceTo(cPos);
      fovT = U.clamp(2 * Math.atan(4.5 / d) / DEG, 7, 50) / V.zoom;
    } else if (mode === 'fly') {
      V.toWorld(fr, G.spotX * 1.25, 0.3, 0.15, cTgt).lerp(P.flt.position, 0.3);
      fovT = 46;
    } else {
      V.toWorld(fr, G.spotX * (mode === 'water' ? 1.12 : 1.3), mode === 'water' ? 0.12 : 0.35, 0.15, cTgt);
      fovT = mode === 'water' ? 36 : 46;
    }
    fovT *= V.zoom;
    const k = cam.init ? 1 - Math.exp(-dt * 3) : 1, kt = cam.init ? 1 - Math.exp(-dt * (mode === 'fight' ? 5 : 3)) : 1;
    cam.pos.lerp(cPos, k); cam.tgt.lerp(cTgt, kt);
    cam.fov += (fovT - cam.fov) * (cam.init ? 1 - Math.exp(-dt * 3) : 1);
    cam.init = true;

    // Rung máy: cá giật mạnh, lực căng sát sức thẻo
    let shake = cam.kick;
    if (mode === 'fight') {
      const strain = F.Ts / CC.line().leader;
      const dTs = dt > 0 ? Math.max(0, F.Ts - cam.lastTs) / dt : 0;
      cam.lastTs = F.Ts;
      shake += Math.max(0, strain - 0.6) * 0.03 + Math.min(0.03, dTs * 0.004) + (F.state === 'shake' ? 0.006 : 0);
    }
    cam.kick *= Math.exp(-dt * 6);
    // Nhìn quanh
    cDir.subVectors(cam.tgt, cam.pos);
    cDir.applyAxisAngle(UP, V.look.yaw);
    cSide.crossVectors(cDir, UP).normalize();
    cDir.applyAxisAngle(cSide, V.look.pitch);
    C.position.copy(cam.pos);
    if (shake > 0.0005 && dt > 0) C.position.add(vTmp.set(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1)).multiplyScalar(shake));
    C.lookAt(vTmp.copy(C.position).add(cDir));
    if (Math.abs(C.fov - cam.fov) > 0.01) { C.fov = cam.fov; C.updateProjectionMatrix(); }
  }

  // Lần lượt xem các hàng xóm đang dắt / vớt / khoe cá; hết lượt thì quay về phao mình
  V.watchNext = () => {
    const busy = V.npcList.filter(a => a.state === 'fight' || a.state === 'net' || a.state === 'handlift' || a.state === 'show');
    if (!busy.length) { V.watchA = null; return null; }
    busy.sort((a, b) => a.n.id - b.n.id);
    const i = V.watchA ? busy.indexOf(V.watchA) : -1;
    V.watchA = i + 1 < busy.length ? busy[i + 1] : null;
    V.look.yaw = 0; V.look.pitch = 0;
    return V.watchA;
  };
  V.toggleWatch = () => {
    if (!V.on || CC.G.state === 'fighting') return;
    const had = !!V.watchA;
    if (!V.watchNext() && !had) CC.UI.toast('ตอนนี้ยังไม่มีนักตกปลาข้างบ่อคนไหนติดปลา', 'info');
  };

  // ---------- Lớp 2D phủ trên cảnh 3D ----------
  // Thước góc cần nằm giữa khung HUD trên và thanh HUD dưới; chuột ở độ cao nào thì cần nghiêng góc đó
  const AIMMAX = 115;
  function aimRange() {
    const H = window.innerHeight;
    const bar = document.getElementById('hud-bottom'), tl = document.getElementById('hud-tl');
    const y0 = (bar ? bar.getBoundingClientRect().top : H * 0.85) - 70;
    const y1 = Math.max((tl ? tl.getBoundingClientRect().bottom : 0) + 40, H * 0.18);
    return { y0, y1: Math.min(y1, y0 - 120) };
  }
  V.aimFromScreen = (x, y) => { const r = aimRange(); return U.clamp((r.y0 - y) / (r.y0 - r.y1), 0, 1) * AIMMAX * DEG; };
  let rangeCache = null;
  const yOfDeg = d => rangeCache.y0 - d / AIMMAX * (rangeCache.y0 - rangeCache.y1);
  const pj = {};
  V.overlay = (ctx, G) => {
    const W = window.innerWidth, H = window.innerHeight;
    if (G.state === 'charging') {
      const x = 26, y = H * 0.3, h = H * 0.32, w = 12;
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
      ctx.fillStyle = 'rgba(95,196,106,0.55)'; ctx.fillRect(x, y + h * (1 - 0.84), w, h * 0.12);
      ctx.fillStyle = '#f2c14e'; ctx.fillRect(x, y + h * (1 - G.power), w, h * G.power);
      ctx.fillStyle = '#fff'; ctx.font = '12px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('แรง', x + w / 2, y - 8);
    }
    if (G.state === 'fighting' && G.fight) {
      // Thước góc cần dọc mép trái: chuột cao/thấp = nâng/hạ cần
      rangeCache = aimRange();
      const x = 10, w = 10;
      const zone = (a, b, col) => { const y1 = yOfDeg(b), y0 = yOfDeg(a); ctx.fillStyle = col; ctx.fillRect(x, y1, w, y0 - y1); };
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(x - 4, yOfDeg(AIMMAX) - 4, w + 8, yOfDeg(0) - yOfDeg(AIMMAX) + 8);
      zone(0, 25, 'rgba(239,107,74,0.75)'); zone(25, 35, 'rgba(242,193,78,0.75)'); zone(35, 80, 'rgba(95,196,106,0.8)');
      zone(80, 95, 'rgba(242,193,78,0.75)'); zone(95, AIMMAX, 'rgba(239,107,74,0.8)');
      const deg = G.theta / DEG, yy = yOfDeg(deg);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x + w + 3, yy); ctx.lineTo(x + w + 13, yy - 6); ctx.lineTo(x + w + 13, yy + 6); ctx.fill();
      ctx.fillRect(x - 3, yy - 1.5, w + 6, 3);
      const aim = CC.Game.input.aim;
      if (aim != null) { const ya = yOfDeg(aim / DEG); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5; ctx.strokeRect(x - 3, ya - 4, w + 6, 8); }
      ctx.fillStyle = '#fff'; ctx.font = '11px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('องศาคัน', x - 4, yOfDeg(0) + 18);
      ctx.fillText(Math.round(deg) + '°', x + w + 16, yy + 4);
    }
    if (G.state === 'waiting' && G.spotX != null && P) {
      const dx = G.floatX - G.spotX;
      V.project(vTmp.copy(P.flt.position).setY(Math.max(0.2, P.flt.position.y + 0.15)), pj);
      if (pj.ok) {
        ctx.font = '12px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = Math.abs(dx) < 0.3 ? 'rgba(160,240,170,0.95)' : 'rgba(255,220,150,0.95)';
        ctx.fillText(Math.abs(dx) < 0.3 ? 'ตรงจุดอ่อย' : `คลาดจุด ${dx > 0 ? '+' : ''}${dx.toFixed(1)} ม.`, pj.x, pj.y - 6);
      }
    }
    CC.Render.vignette(ctx, G);
    if (V.watchA) {
      const a = V.watchA, f = a.f;
      const what = a.state === 'show' && f ? `ได้ปลา${f.sp.name.replace(/^ปลา/, '').replace(' (ปลารบกวน)', '')} ${U.fmtKg(f.w)}` : a.state === 'net' ? 'กำลังช้อนปลา' : 'กำลังอัดปลา';
      const msg = `👀 ${a.n.name} (ช่อง ${a.n.id}) ${what} · N: ดูคนอื่น · R: กลับมามุมทุ่นตัวเอง`;
      ctx.font = '13px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'center';
      const tw = ctx.measureText(msg).width, y = H * 0.27;
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(W / 2 - tw / 2 - 12, y - 17, tw + 24, 25);
      ctx.fillStyle = '#fff'; ctx.fillText(msg, W / 2, y);
    }
    if (V.hintT > 0) {
      V.hintT -= 1 / 60;
      const bar = document.getElementById('hud-bottom');
      const y = (bar ? bar.getBoundingClientRect().top : H - 100) - 52;
      ctx.font = '12px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(0,0,0,${0.4 * Math.min(1, V.hintT)})`;
      const msg = 'คลิกขวาค้างแล้วลาก หรือกด A/D: มองรอบบ่อ · เลื่อนลูกกลิ้ง: ซูม · R: รีเซ็ตมุมมอง · G: สลับมุมมอง 2D';
      const tw = ctx.measureText(msg).width;
      ctx.fillRect(W / 2 - tw / 2 - 10, y - 15, tw + 20, 22);
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, V.hintT)})`;
      ctx.fillText(msg, W / 2, y);
    }
  };
})();
