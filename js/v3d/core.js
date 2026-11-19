// Góc ngồi câu 3D (Three.js): renderer, trời, mặt nước, bờ kè, cây, chòi chủ hồ, máy sục, hiệu ứng nước
(function () {
  const U = CC.U;
  const V = CC.View3D = { on: false, ok: typeof THREE !== 'undefined', ready: false, look: { yaw: 0, pitch: 0 }, zoom: 1 };
  if (!V.ok) return;
  const T = THREE;
  V.T = T;
  const PW = 60, PH = 30; // kích thước hồ (m), khớp CC.PondMap
  const BANK = 0.45;      // mặt bờ kè cao hơn mặt nước (m)
  V.BANK = BANK;
  let renderer, scene, camera, cv3, time = 0;
  let sky, water, sun, moon, hemi, hutLight, bottom, signTex, signCtx, lampMat, winMat;
  const sunDir = new T.Vector3(), moonDir = new T.Vector3(), sunCol = new T.Color();

  // ---------- Tiện ích dùng chung ----------
  const mats = {};
  V.mat = (c, opt) => {
    const key = c + (opt ? JSON.stringify(opt) : '');
    return mats[key] || (mats[key] = new T.MeshLambertMaterial(Object.assign({ color: new T.Color(c) }, opt || {})));
  };
  const basics = {};
  V.basic = c => basics[c] || (basics[c] = new T.MeshBasicMaterial({ color: new T.Color(c) }));
  V.UNIT_CYL = new T.CylinderGeometry(1, 1, 1, 7, 1);
  V.CYL16 = new T.CylinderGeometry(1, 1, 1, 16, 1);
  V.BOX = new T.BoxGeometry(1, 1, 1);
  V.SPH = new T.SphereGeometry(1, 14, 10);
  const UP = new T.Vector3(0, 1, 0), DOWN = new T.Vector3(0, -1, 0);
  const tv = new T.Vector3();
  // Đặt khối trụ đơn vị nối hai điểm a → b
  V.segBetween = (mesh, a, b, r) => {
    tv.subVectors(b, a);
    const len = tv.length() || 1e-4;
    mesh.position.addVectors(a, b).multiplyScalar(0.5);
    mesh.scale.set(r, len, r);
    mesh.quaternion.setFromUnitVectors(UP, tv.divideScalar(len));
  };
  // Khung tọa độ của một ô câu: gx = ra xa bờ, gy = độ cao so với mặt nước, gl = sang phải người câu
  V.frame = sp => ({ ox: sp.x, oz: sp.y, fx: sp.nx, fz: sp.ny, rx: -sp.ny, rz: sp.nx });
  V.toWorld = (fr, gx, gy, gl, out) => (out || new T.Vector3()).set(fr.ox + fr.fx * gx + fr.rx * gl, gy, fr.oz + fr.fz * gx + fr.rz * gl);
  V.dirWorld = (fr, dx, dy, dl, out) => (out || new T.Vector3()).set(fr.fx * dx + fr.rx * dl, dy, fr.fz * dx + fr.rz * dl);
  V.rgb = a => new T.Color(a[0] / 255, a[1] / 255, a[2] / 255);

  // Cần: chuỗi đốt trụ thuôn dần, uốn về phía dây theo lực căng
  V.makeRod = (parent, color, n, r0, r1) => {
    const m = new T.MeshLambertMaterial({ color: new T.Color(color) });
    const segs = [];
    for (let i = 0; i < n; i++) { const s = new T.Mesh(V.UNIT_CYL, m); s.castShadow = i < n * 0.6; parent.add(s); segs.push(s); }
    return { segs, mat: m, r0, r1, tip: new T.Vector3() };
  };
  const a0 = new T.Vector3(), a1 = new T.Vector3(), ld = new T.Vector3(), dd = new T.Vector3();
  V.updateRod = (rod, base, axis, len, end, bend) => {
    const n = rod.segs.length, butt = 0.25, seg = (len + butt) / n;
    a0.copy(base).addScaledVector(axis, -butt);
    if (end) { ld.copy(base).addScaledVector(axis, len); ld.subVectors(end, ld).normalize(); }
    for (let i = 0; i < n; i++) {
      const k = (i + 0.5) / n;
      const w = end ? U.clamp(bend * 0.92 * Math.pow(k, 1.7), 0, 1) : 0;
      dd.copy(axis).multiplyScalar(1 - w);
      if (end) dd.addScaledVector(ld, w);
      dd.addScaledVector(DOWN, 0.05 * k * k * len / 5).normalize(); // cần dài tự võng
      a1.copy(a0).addScaledVector(dd, seg);
      V.segBetween(rod.segs[i], a0, a1, U.lerp(rod.r0, rod.r1, k));
      a0.copy(a1);
    }
    rod.tip.copy(a0);
    return rod.tip;
  };

  V.makeLine = (parent, color, n, opacity) => {
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(n * 3), 3));
    const l = new T.Line(g, new T.LineBasicMaterial({ color: new T.Color(color), transparent: true, opacity: opacity || 0.85 }));
    l.frustumCulled = false; l.userData.n = n;
    parent.add(l);
    return l;
  };
  V.setLine = (line, a, b, sag) => {
    const n = line.userData.n, p = line.geometry.attributes.position.array;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      p[i * 3] = a.x + (b.x - a.x) * t;
      p[i * 3 + 1] = a.y + (b.y - a.y) * t - sag * 4 * t * (1 - t);
      p[i * 3 + 2] = a.z + (b.z - a.z) * t;
    }
    line.geometry.attributes.position.needsUpdate = true;
  };

  // Phao: gốc tọa độ ở đỉnh tăm, tăm chia nấc màu, thân phao bên dưới
  V.makeFloat = (fl, tip, scale, thick) => {
    const g = new T.Group();
    const nl = fl.nl / 100 * scale, r = (thick || 0.007) * fl.tip;
    for (let i = 0; i < fl.n; i++) {
      const m = new T.Mesh(V.UNIT_CYL, V.basic(tip.colors[i % tip.colors.length]));
      m.scale.set(r, nl * 0.97, r); m.position.y = -(i + 0.5) * nl;
      g.add(m);
    }
    const bodyLen = 0.1 * scale * Math.pow(fl.body / 1.2, 0.3);
    const body = new T.Mesh(V.SPH, V.mat(tip.body));
    body.scale.set(r * 2.6, bodyLen / 2, r * 2.6); body.position.y = -fl.n * nl - bodyLen / 2;
    g.add(body);
    const band = new T.Mesh(V.UNIT_CYL, V.mat('#c0392b'));
    band.scale.set(r * 2.65, bodyLen * 0.08, r * 2.65); band.position.y = -fl.n * nl - bodyLen * 0.2;
    g.add(band);
    const stem = new T.Mesh(V.UNIT_CYL, V.mat('#333333'));
    stem.scale.set(r * 0.5, 0.05 * scale, r * 0.5); stem.position.y = -fl.n * nl - bodyLen - 0.025 * scale;
    g.add(stem);
    g.userData = { nl, body: bodyLen, len: fl.n * nl + bodyLen + 0.05 * scale };
    return g;
  };

  // Ánh sáng đầu tăm ban đêm
  let glowTex;
  V.glowSprite = color => {
    if (!glowTex) {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      glowTex = new T.CanvasTexture(c);
    }
    const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: new T.Color(color), transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
    s.renderOrder = 5;
    return s;
  };

  // ---------- Cá 3D ----------
  // Mũi cá hướng +Z (để dùng lookAt), dài L mét
  const SHAPE = { perch: [0.36, 0.13], carp: [0.32, 0.15], long: [0.22, 0.14], bighead: [0.3, 0.16], disc: [0.42, 0.1] }; // disc: thè be thân cao, dẹt
  V.fishMesh = (sp, L) => {
    const g = new T.Group();
    const [hR, wR] = SHAPE[sp.shape] || [0.3, 0.14];
    const geo = new T.SphereGeometry(0.5, 18, 12);
    const pos = geo.attributes.position, cols = [];
    const cBack = new T.Color(sp.col.back), cBody = new T.Color(sp.col.body), cBelly = new T.Color(sp.col.belly), tmp = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y > 0.12) tmp.copy(cBody).lerp(cBack, U.clamp((y - 0.12) / 0.3, 0, 1));
      else tmp.copy(cBody).lerp(cBelly, U.clamp((0.05 - y) / 0.3, 0, 1));
      cols.push(tmp.r, tmp.g, tmp.b);
    }
    geo.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
    const body = new T.Mesh(geo, new T.MeshLambertMaterial({ vertexColors: true }));
    body.scale.set(L * wR, L * hR, L * 0.8);
    body.castShadow = true;
    g.add(body);
    if (sp.shape === 'bighead') { const hd = new T.Mesh(V.SPH, V.mat(sp.col.body)); hd.scale.set(L * 0.1, L * 0.14, L * 0.15); hd.position.set(0, 0.01 * L, 0.3 * L); g.add(hd); }
    const finM = new T.MeshLambertMaterial({ color: new T.Color(sp.col.fin), side: T.DoubleSide });
    // Đuôi (xoay quanh cuống đuôi để quẫy)
    const tail = new T.Group();
    const ts = new T.Shape();
    ts.moveTo(0, 0); ts.lineTo(-0.2 * L, 0.15 * L); ts.lineTo(-0.15 * L, 0); ts.lineTo(-0.2 * L, -0.15 * L); ts.lineTo(0, 0);
    const tm = new T.Mesh(new T.ShapeGeometry(ts), finM);
    tm.rotation.y = Math.PI / 2; // mặt phẳng đuôi đứng dọc theo thân
    tail.add(tm);
    tail.position.z = -0.38 * L;
    g.add(tail);
    // Vây lưng
    const ds = new T.Shape();
    ds.moveTo(-0.12 * L, 0); ds.lineTo(0.02 * L, 0.11 * L); ds.lineTo(0.12 * L, 0); ds.lineTo(-0.12 * L, 0);
    const dm = new T.Mesh(new T.ShapeGeometry(ds), finM);
    dm.rotation.y = Math.PI / 2; dm.position.y = L * hR * 0.42;
    g.add(dm);
    // Mắt
    const eyeM = V.mat('#111111');
    for (const s of [-1, 1]) { const e = new T.Mesh(V.SPH, eyeM); e.scale.setScalar(L * 0.022); e.position.set(s * L * wR * 0.42, L * 0.04, L * 0.3); g.add(e); }
    g.userData = { tail, L, body };
    return g;
  };
  V.disposeGroup = g => {
    if (!g) return;
    if (g.parent) g.parent.remove(g);
    g.traverse(o => { if (o.geometry && ![V.UNIT_CYL, V.CYL16, V.BOX, V.SPH].includes(o.geometry)) o.geometry.dispose(); });
  };

  // ---------- Hiệu ứng: hạt nước, gợn tròn, chữ nổi ----------
  const PMAX = 1600;
  let pGeo, pMat, pts = [];
  function buildParticles() {
    pGeo = new T.BufferGeometry();
    pGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(PMAX * 3), 3));
    pGeo.setAttribute('size', new T.BufferAttribute(new Float32Array(PMAX), 1));
    pGeo.setAttribute('alpha', new T.BufferAttribute(new Float32Array(PMAX), 1));
    pMat = new T.ShaderMaterial({
      uniforms: { scale: { value: 600 }, color: { value: new T.Color(1, 1, 1) } },
      vertexShader: `attribute float size; attribute float alpha; uniform float scale; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = max(1.5, size * scale / -mv.z); vA = alpha; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 color; varying float vA;
        void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard; gl_FragColor = vec4(color, vA * smoothstep(0.5, 0.12, d)); }`,
      transparent: true, depthWrite: false
    });
    const p = new T.Points(pGeo, pMat);
    p.frustumCulled = false; p.renderOrder = 6;
    scene.add(p);
  }
  // Té nước: n giọt bắn lên quanh pos, power ~ độ mạnh (m/s)
  V.spray = (pos, n, power, spread, size) => {
    for (let i = 0; i < n && pts.length < PMAX; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * (spread || 0.15);
      pts.push({
        x: pos.x + Math.cos(a) * r, y: Math.max(0.01, pos.y), z: pos.z + Math.sin(a) * r,
        vx: Math.cos(a) * U.rand(0.2, 1) * power * 0.45, vy: U.rand(0.5, 1.3) * power, vz: Math.sin(a) * U.rand(0.2, 1) * power * 0.45,
        life: U.rand(0.5, 1.1), max: 1, size: (size || 0.035) * U.rand(0.6, 1.4), g: 9.8, float: false
      });
    }
  };
  // Bọt khí nổi lên mặt nước (sủi tăm ở ổ) hoặc bọt trắng nổi
  V.bubbles = (pos, n, spread, size, life) => {
    for (let i = 0; i < n && pts.length < PMAX; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * (spread || 0.4);
      pts.push({ x: pos.x + Math.cos(a) * r, y: 0.005, z: pos.z + Math.sin(a) * r, vx: 0, vy: 0, vz: 0,
        life: life || U.rand(0.8, 2.2), max: 1, size: (size || 0.018) * U.rand(0.6, 1.4), g: 0, float: true });
    }
  };
  function updateParticles(dt) {
    const P = pGeo.attributes.position.array, S = pGeo.attributes.size.array, A = pGeo.attributes.alpha.array;
    let j = 0;
    for (const p of pts) {
      p.life -= dt;
      if (!p.float) {
        p.vy -= p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        if (p.y < 0 && p.vy < 0) { p.life = Math.min(p.life, 0); if (Math.random() < 0.05) V.ripple(p.x, p.z, 0.08, 0.3); }
      }
      if (p.life <= 0) continue;
      pts[j] = p;
      P[j * 3] = p.x; P[j * 3 + 1] = p.y; P[j * 3 + 2] = p.z;
      S[j] = p.size; A[j] = Math.min(1, p.life * 2) * (p.float ? 0.7 : 0.9);
      j++;
    }
    pts.length = j;
    pGeo.setDrawRange(0, j);
    pGeo.attributes.position.needsUpdate = pGeo.attributes.size.needsUpdate = pGeo.attributes.alpha.needsUpdate = true;
  }

  const RMAX = 24, ripples = [];
  V.ripple = (x, z, amp, speed) => {
    if (ripples.length >= RMAX) {
      // Thay gợn yếu nhất / xa camera nhất
      let worst = 0, ws = Infinity;
      ripples.forEach((r, i) => { const s = r.a / (1 + Math.hypot(r.x - camera.position.x, r.z - camera.position.z) * 0.1); if (s < ws) { ws = s; worst = i; } });
      ripples.splice(worst, 1);
    }
    ripples.push({ x, z, r: 0.03, a: amp, sp: speed || 0.4 });
  };
  function updateRipples(dt) {
    for (const r of ripples) { r.r += r.sp * dt; r.a *= Math.exp(-dt * 1.1); }
    for (let i = ripples.length - 1; i >= 0; i--) if (ripples[i].a < 0.01) ripples.splice(i, 1);
    const u = water.material.uniforms.rip.value;
    for (let i = 0; i < RMAX; i++) {
      const r = ripples[i];
      if (r) u[i].set(r.x, r.z, r.r, r.a); else u[i].set(0, 0, 0, 0);
    }
  }

  // Chữ nổi trên đầu người câu (DOM để chữ sắc nét)
  let labelBox;
  const labels = [];
  V.label = (html, pos, dur, cls) => {
    const el = document.createElement('div');
    el.className = 'lbl3d ' + (cls || '');
    el.innerHTML = html;
    labelBox.appendChild(el);
    const L = { el, pos, t: 0, dur };
    labels.push(L);
    return L;
  };
  const pv = new T.Vector3();
  V.project = (p, out) => {
    pv.copy(p).project(camera);
    out = out || {};
    out.x = (pv.x * 0.5 + 0.5) * window.innerWidth;
    out.y = (-pv.y * 0.5 + 0.5) * window.innerHeight;
    out.ok = pv.z < 1 && pv.z > -1;
    return out;
  };
  function updateLabels(dt) {
    for (let i = labels.length - 1; i >= 0; i--) {
      const L = labels[i];
      L.t += dt;
      if (L.t > L.dur) { L.el.remove(); labels.splice(i, 1); continue; }
      const p = V.project(typeof L.pos === 'function' ? L.pos() : L.pos);
      const a = Math.min(1, L.t * 4, (L.dur - L.t) * 2);
      L.el.style.display = p.ok ? '' : 'none';
      L.el.style.opacity = a;
      L.el.style.transform = `translate(${p.x.toFixed(1)}px, ${(p.y - L.t * 6).toFixed(1)}px) translate(-50%, -100%)`;
    }
  }

  // ---------- Kết cấu vẽ bằng canvas ----------
  function canvasTex(w, h, draw, rx, ry) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.anisotropy = 4;
    return t;
  }
  function blotch(x, w, h, base, cols, n, rmax) {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      x.fillStyle = cols[i % cols.length];
      x.globalAlpha = U.rand(0.15, 0.45);
      const px = Math.random() * w, py = Math.random() * h, r = U.rand(1, rmax);
      for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { x.beginPath(); x.arc(px + ox, py + oy, r, 0, 7); x.fill(); }
    }
    x.globalAlpha = 1;
  }

  // ---------- Trời ----------
  const SKY_V = `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const NOISE = `
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
    float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }`;
  const SKY_F = `
    uniform vec3 top, bot, sunDir, sunCol, moonDir; uniform float night, cloud, time, light, wind;
    varying vec3 vDir;
    ${NOISE}
    void main(){
      vec3 d = normalize(vDir); float h = d.y;
      vec3 c = mix(bot, top, pow(clamp(h, 0.0, 1.0), 0.55));
      if (h < 0.0) c = bot * 0.8;
      float sd = max(dot(d, sunDir), 0.0);
      float sv = (1.0 - cloud * 0.8) * smoothstep(-0.08, 0.02, sunDir.y);
      c += sunCol * (smoothstep(0.9991, 0.9996, sd) * 2.2 + pow(sd, 90.0) * 0.45 + pow(sd, 8.0) * 0.12) * sv;
      float md = max(dot(d, moonDir), 0.0);
      c += vec3(0.86, 0.88, 0.8) * (smoothstep(0.9993, 0.9996, md) + pow(md, 200.0) * 0.2) * night * (1.0 - cloud * 0.7);
      vec3 q = floor(d * 420.0);
      float r = hash(q.xy + q.z * 17.0);
      c += vec3(step(0.9984, r) * night * (1.0 - cloud) * smoothstep(0.03, 0.25, h) * (0.55 + 0.45 * sin(time * 2.0 + r * 80.0)));
      if (h > 0.0) {
        vec2 uv = d.xz / (h + 0.12) * 1.1 + vec2(time * 0.006, time * 0.003) * (1.0 + wind);
        float n = fbm(uv);
        float cl = smoothstep(0.62 - cloud * 0.35, 0.95 - cloud * 0.2, n) * smoothstep(0.0, 0.18, h);
        vec3 cc = mix(vec3(1.0, 0.98, 0.95), vec3(0.42, 0.45, 0.5), cloud * 0.75) * (0.16 + 0.84 * light);
        cc += sunCol * pow(sd, 6.0) * 0.3 * sv;
        c = mix(c, cc, cl * 0.9);
      }
      gl_FragColor = vec4(c, 1.0);
    }`;

  // ---------- Mặt nước ----------
  const WATER_V = `
    uniform float time, wamp; uniform vec2 wdir; varying vec3 vPos;
    void main(){
      vec4 wp = modelMatrix * vec4(position, 1.0);
      wp.y += (sin(dot(wp.xz, wdir) * 1.7 + time * 2.1) * 0.6 + sin(dot(wp.xz, vec2(-wdir.y, wdir.x)) * 1.1 + time * 1.3) * 0.4) * wamp * 0.012;
      vPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`;
  const WATER_F = `
    uniform float time, wamp, rain, opacity, light, fogNear, fogFar;
    uniform vec2 wdir;
    uniform vec3 deep, top, bot, sunDir, sunCol, fogCol, bankCol;
    uniform vec4 rip[${RMAX}];
    varying vec3 vPos;
    ${NOISE}
    void wave(inout vec2 g, vec2 p, vec2 d, float f, float s, float a){ g += d * (f * a * cos(dot(p, d) * f + time * s)); }
    void main(){
      vec2 p = vPos.xz, g = vec2(0.0);
      vec2 w1 = wdir, w2 = vec2(-wdir.y, wdir.x);
      float A = 0.0035 + 0.011 * wamp;
      wave(g, p, w1, 2.3, 2.6, A);
      wave(g, p, normalize(w1 + w2 * 0.6), 3.7, 3.4, A * 0.7);
      wave(g, p, normalize(w1 - w2 * 0.5), 5.9, 4.4, A * 0.5);
      wave(g, p, normalize(w2 + w1 * 0.3), 9.3, 5.8, A * 0.35);
      wave(g, p, normalize(-w1 * 0.2 + w2), 15.1, 7.9, A * 0.25);
      wave(g, p, normalize(w1 + w2 * 1.7), 23.0, 9.7, A * 0.18);
      for (int i = 0; i < ${RMAX}; i++) {
        vec4 r = rip[i];
        if (r.w > 0.0) {
          vec2 dv = p - r.xy; float d = length(dv) + 1e-4; float x = d - r.z;
          g += (dv / d) * cos(x * 38.0) * exp(-x * x * 45.0) * r.w;
        }
      }
      if (rain > 0.0) {
        vec2 q = p * 2.2; vec2 cell = floor(q); vec2 f = fract(q) - 0.5;
        float h = hash(cell);
        if (h < rain * 0.7) {
          float tt = fract(time * 1.1 + h * 7.0);
          vec2 o = vec2(hash(cell + 3.1), hash(cell + 9.7)) - 0.5;
          vec2 dv = f - o * 0.4; float d = length(dv) + 1e-4; float x = d - tt * 0.42;
          g += (dv / d) * cos(x * 70.0) * exp(-x * x * 500.0) * (1.0 - tt) * 0.5;
        }
      }
      vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
      vec3 Vd = normalize(cameraPosition - vPos);
      float fr = 0.02 + 0.98 * pow(1.0 - max(dot(N, Vd), 0.0), 5.0);
      vec3 R = reflect(-Vd, N);
      float ry = max(R.y, 0.0);
      vec3 sk = mix(bot, top, pow(ry, 0.6));
      sk = mix(bankCol, sk, smoothstep(0.012, 0.085, ry));
      float spec = pow(max(dot(R, sunDir), 0.0), 220.0) * smoothstep(-0.02, 0.05, sunDir.y);
      vec3 base = deep * (0.22 + 0.78 * light) * (0.9 + 0.2 * noise(p * 0.15));
      vec3 col = mix(base, sk, clamp(fr * 0.9, 0.0, 1.0)) + sunCol * spec * 2.2;
      col = mix(col, fogCol, smoothstep(fogNear, fogFar, length(vPos - cameraPosition)));
      gl_FragColor = vec4(col, opacity);
    }`;

  // ---------- Dựng cảnh ----------
  function buildWorld() {
    // Trời
    sky = new T.Mesh(new T.SphereGeometry(450, 32, 16), new T.ShaderMaterial({
      uniforms: { top: { value: new T.Color() }, bot: { value: new T.Color() }, sunDir: { value: sunDir }, sunCol: { value: sunCol },
        moonDir: { value: moonDir }, night: { value: 0 }, cloud: { value: 0 }, time: { value: 0 }, light: { value: 1 }, wind: { value: 1 } },
      vertexShader: SKY_V, fragmentShader: SKY_F, side: T.BackSide, depthWrite: false, fog: false
    }));
    sky.renderOrder = -10;
    scene.add(sky);

    // Mặt nước
    const wg = new T.PlaneGeometry(PW, PH, 120, 60);
    wg.rotateX(-Math.PI / 2);
    const rip = []; for (let i = 0; i < RMAX; i++) rip.push(new T.Vector4());
    water = new T.Mesh(wg, new T.ShaderMaterial({
      uniforms: { time: { value: 0 }, wamp: { value: 0.5 }, wdir: { value: new T.Vector2(1, 0) }, rain: { value: 0 }, opacity: { value: 1 },
        light: { value: 1 }, deep: { value: new T.Color('#33503a') }, top: { value: new T.Color() }, bot: { value: new T.Color() },
        sunDir: { value: sunDir }, sunCol: { value: sunCol }, fogCol: { value: new T.Color() }, bankCol: { value: new T.Color('#24331f') },
        fogNear: { value: 60 }, fogFar: { value: 220 }, rip: { value: rip } },
      vertexShader: WATER_V, fragmentShader: WATER_F, transparent: false
    }));
    water.position.set(PW / 2, 0, PH / 2);
    water.renderOrder = 1;
    scene.add(water);

    // Đáy hồ (chỉ thấy khi bật nhìn dưới nước)
    bottom = new T.Mesh(new T.PlaneGeometry(PW, PH), V.mat('#4d3f2a'));
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.set(PW / 2, -2.2, PH / 2);
    scene.add(bottom);

    // Bãi cỏ quanh hồ (có lỗ khoét đúng mặt hồ + lối đi)
    const grass = canvasTex(256, 256, (x, w, h) => blotch(x, w, h, '#4f7a35', ['#5d8a3e', '#43692c', '#6a9447', '#3d5f28', '#7a8f45'], 900, 6), 0.25, 0.25);
    const outer = new T.Shape();
    outer.moveTo(-160, -170); outer.lineTo(220, -170); outer.lineTo(220, 160); outer.lineTo(-160, 160); outer.lineTo(-160, -170);
    const hole = new T.Path();
    hole.moveTo(-2.5, -PH - 2.5); hole.lineTo(-2.5, 2.5); hole.lineTo(PW + 2.5, 2.5); hole.lineTo(PW + 2.5, -PH - 2.5); hole.lineTo(-2.5, -PH - 2.5);
    outer.holes.push(hole);
    const gg = new T.ShapeGeometry(outer); gg.rotateX(-Math.PI / 2);
    const ground = new T.Mesh(gg, new T.MeshLambertMaterial({ map: grass }));
    ground.position.y = BANK - 0.01; ground.receiveShadow = true;
    scene.add(ground);

    // Lối đi bê tông quanh hồ
    const conc = canvasTex(256, 256, (x, w, h) => {
      blotch(x, w, h, '#a39e92', ['#8f8a7f', '#b3aea2', '#98938a'], 500, 5);
      x.strokeStyle = 'rgba(40,40,40,0.35)'; x.lineWidth = 3; x.strokeRect(0, 0, w, h);
    }, 0.5, 0.5);
    const wk = new T.Shape();
    wk.moveTo(-2.5, -PH - 2.5); wk.lineTo(PW + 2.5, -PH - 2.5); wk.lineTo(PW + 2.5, 2.5); wk.lineTo(-2.5, 2.5); wk.lineTo(-2.5, -PH - 2.5);
    const wh = new T.Path();
    wh.moveTo(0, -PH); wh.lineTo(0, 0); wh.lineTo(PW, 0); wh.lineTo(PW, -PH); wh.lineTo(0, -PH);
    wk.holes.push(wh);
    const wkg = new T.ShapeGeometry(wk); wkg.rotateX(-Math.PI / 2);
    const walk = new T.Mesh(wkg, new T.MeshLambertMaterial({ map: conc }));
    walk.position.y = BANK; walk.receiveShadow = true;
    scene.add(walk);

    // Thành kè đứng (phần dưới mặt nước bám rêu tối màu)
    const wallTex = canvasTex(64, 256, (x, w, h) => {
      blotch(x, w, h, '#9a958a', ['#8a857a', '#aaa598'], 120, 4);
      const wl = h * BANK / 3.45;
      const g = x.createLinearGradient(0, wl - 6, 0, wl + 30);
      g.addColorStop(0, 'rgba(40,60,40,0)'); g.addColorStop(0.2, 'rgba(40,60,40,0.85)'); g.addColorStop(1, 'rgba(20,35,25,0.95)');
      x.fillStyle = g; x.fillRect(0, wl - 6, w, h);
    }, 1, 1);
    const addWall = (len, x, z, ry) => {
      const t = wallTex.clone(); t.needsUpdate = true; t.repeat.set(len / 2, 1);
      const m = new T.Mesh(new T.PlaneGeometry(len, 3.45), new T.MeshLambertMaterial({ map: t }));
      m.position.set(x, BANK - 3.45 / 2, z); m.rotation.y = ry;
      scene.add(m);
    };
    addWall(PW, PW / 2, 0, 0); addWall(PW, PW / 2, PH, Math.PI);
    addWall(PH, 0, PH / 2, Math.PI / 2); addWall(PH, PW, PH / 2, -Math.PI / 2);

    buildTrees();
    buildHut();
    buildAerators();
    buildLamps();
    // Ống cấp nước bờ Tây
    const M = CC.PondMap;
    const pipe = new T.Mesh(V.CYL16, V.mat('#5a5f66'));
    pipe.scale.set(0.12, 0.8, 0.12); pipe.rotation.z = Math.PI / 2; pipe.position.set(M.inlet.x + 0.2, 0.25, M.inlet.y);
    scene.add(pipe);
  }

  function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

  function buildTrees() {
    const r = rnd(99), list = [];
    const ok = (x, z) => {
      if (x > -3 && x < PW + 3 && z > -3 && z < PH + 3) return false;           // không mọc trong hồ / lối đi
      if (x > 22 && x < 38 && z > PH + 1 && z < PH + 12) return false;           // sân chòi chủ hồ
      return !list.some(t => Math.hypot(t.x - x, t.z - z) < 3.2);
    };
    for (let i = 0; i < 900 && list.length < 170; i++) {
      const side = (r() * 4) | 0, d = 5 + Math.pow(r(), 1.6) * 38;
      let x, z;
      if (side === 0) { x = -20 + r() * (PW + 40); z = -2.5 - d; }
      else if (side === 1) { x = -20 + r() * (PW + 40); z = PH + 2.5 + d; }
      else if (side === 2) { x = -2.5 - d; z = -15 + r() * (PH + 30); }
      else { x = PW + 2.5 + d; z = -15 + r() * (PH + 30); }
      if (ok(x, z)) list.push({ x, z, palm: r() < 0.22, s: 0.75 + r() * 0.7, c: r() });
    }
    const trunk = new T.InstancedMesh(V.UNIT_CYL, V.mat('#5a4330'), list.length);
    const crown = new T.InstancedMesh(new T.IcosahedronGeometry(1, 1), new T.MeshLambertMaterial({ color: 0xffffff }), list.length);
    trunk.castShadow = crown.castShadow = true;
    const m = new T.Matrix4(), q = new T.Quaternion(), p = new T.Vector3(), sc = new T.Vector3(), col = new T.Color();
    const greens = ['#2f5a2a', '#3a6b30', '#466f2c', '#2a4f2e', '#557a35'];
    list.forEach((t, i) => {
      const th = t.palm ? 6.5 * t.s : 2.4 * t.s;
      p.set(t.x, BANK + th / 2, t.z); sc.set(t.palm ? 0.13 : 0.2 * t.s, th, t.palm ? 0.13 : 0.2 * t.s);
      m.compose(p, q, sc); trunk.setMatrixAt(i, m);
      if (t.palm) { p.set(t.x, BANK + th + 0.3, t.z); sc.set(1.7 * t.s, 0.55 * t.s, 1.7 * t.s); }
      else { p.set(t.x, BANK + th + 1.6 * t.s, t.z); sc.set(2.3 * t.s, 2.0 * t.s, 2.3 * t.s); }
      m.compose(p, q, sc); crown.setMatrixAt(i, m);
      crown.setColorAt(i, col.set(greens[(t.c * greens.length) | 0]));
    });
    scene.add(trunk, crown);
    // Nhà dân phía xa
    const hr = rnd(7);
    for (let i = 0; i < 12; i++) {
      const a = hr() * Math.PI * 2, d = 55 + hr() * 40;
      const x = PW / 2 + Math.cos(a) * d * 1.2, z = PH / 2 + Math.sin(a) * d;
      const w = 5 + hr() * 4, h = 3 + hr() * 4;
      const b = new T.Mesh(V.BOX, V.mat(['#d8cfb8', '#c9b79a', '#e3d9c6', '#b9c4c9'][i % 4]));
      b.scale.set(w, h, 6); b.position.set(x, BANK + h / 2, z); b.rotation.y = a;
      const roof = new T.Mesh(new T.ConeGeometry(w * 0.8, 1.8, 4), V.mat(i % 3 ? '#9b3a2a' : '#5a4a3a'));
      roof.position.set(x, BANK + h + 0.9, z); roof.rotation.y = a + Math.PI / 4;
      scene.add(b, roof);
    }
  }

  function buildHut() {
    const M = CC.PondMap, x = M.hut.x, z = M.hut.y + 6;
    const g = new T.Group(); g.position.set(x, BANK, z);
    const wood = V.mat('#8a5a32'), floor = V.mat('#b08a5a');
    const add = (geo, mat, px, py, pz, sx, sy, sz) => { const m = new T.Mesh(geo, mat); m.position.set(px, py, pz); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
    add(V.BOX, floor, 0, 0.15, 0, 8, 0.3, 5);
    for (const [px, pz] of [[-3.8, -2.3], [3.8, -2.3], [-3.8, 2.3], [3.8, 2.3]]) add(V.BOX, wood, px, 1.6, pz, 0.2, 2.9, 0.2);
    add(V.BOX, V.mat('#c8b48e'), 0, 1.5, 2.4, 7.8, 2.6, 0.12);        // vách sau
    add(V.BOX, V.mat('#c8b48e'), -3.9, 1.5, 0.6, 0.12, 2.6, 3.6);     // vách hông
    add(V.BOX, V.mat('#c8b48e'), 3.9, 1.5, 0.6, 0.12, 2.6, 3.6);
    winMat = new T.MeshLambertMaterial({ color: new T.Color('#3a3a30'), emissive: new T.Color('#000000') });
    add(V.BOX, winMat, -1.8, 1.7, 2.33, 1.4, 0.9, 0.05);
    add(V.BOX, winMat, 1.8, 1.7, 2.33, 1.4, 0.9, 0.05);
    const roof = new T.Mesh(new T.ConeGeometry(6.2, 2.2, 4, 1), V.mat('#a8432d'));
    roof.rotation.y = Math.PI / 4; roof.scale.set(1.05, 1, 0.68); roof.position.y = 4.1; roof.castShadow = true;
    g.add(roof);
    // Bàn cân cá
    add(V.BOX, V.mat('#6a4a2a'), 1.5, 0.75, -1.2, 1.8, 0.08, 0.9);
    add(V.BOX, V.mat('#d0d4d8'), 1.5, 0.85, -1.2, 0.5, 0.12, 0.4);
    // Biển tên hồ
    const c = document.createElement('canvas'); c.width = 512; c.height = 96;
    signCtx = c.getContext('2d');
    signTex = new T.CanvasTexture(c);
    const sign = new T.Mesh(new T.PlaneGeometry(6, 1.1), new T.MeshLambertMaterial({ map: signTex }));
    sign.position.set(0, 3.25, -2.45); sign.rotation.y = Math.PI;
    g.add(sign);
    // Loa nhà hồ
    add(V.UNIT_CYL, V.mat('#555'), -4.6, 2.2, -2.6, 0.05, 4.4, 0.05);
    const horn = new T.Mesh(new T.ConeGeometry(0.25, 0.5, 10, 1, true), V.mat('#d8d8d8', { side: T.DoubleSide }));
    horn.position.set(-4.6, 4.3, -2.75); horn.rotation.x = -Math.PI / 2 - 0.3;
    g.add(horn);
    hutLight = new T.PointLight(0xffd9a0, 0, 22, 2);
    hutLight.position.set(0, 2.6, -1.5);
    g.add(hutLight);
    scene.add(g);
  }
  function drawSign() {
    const x = signCtx, pond = CC.pond();
    x.fillStyle = '#1d4f8f'; x.fillRect(0, 0, 512, 96);
    x.strokeStyle = '#f2c14e'; x.lineWidth = 6; x.strokeRect(4, 4, 504, 88);
    x.fillStyle = '#fff'; x.font = 'bold 40px "Sarabun", "Tahoma", "Segoe UI", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(pond.name.toUpperCase(), 256, 50, 480);
    signTex.needsUpdate = true;
  }

  const aer = [];
  function buildAerators() {
    for (const a of CC.PondMap.aerators) {
      const g = new T.Group(); g.position.set(a.x, 0, a.y);
      const pont = V.mat('#e8e0c8');
      for (const s of [-1, 1]) { const p = new T.Mesh(V.CYL16, pont); p.scale.set(0.16, 1.6, 0.16); p.rotation.x = Math.PI / 2; p.position.set(s * 0.55, 0.06, 0); g.add(p); }
      const motor = new T.Mesh(V.BOX, V.mat('#e3b82a')); motor.scale.set(0.5, 0.35, 0.6); motor.position.set(0, 0.35, -0.3); motor.castShadow = true; g.add(motor);
      const wheel = new T.Group(); wheel.position.set(0, 0.2, 0.45);
      const hub = new T.Mesh(V.UNIT_CYL, V.mat('#555')); hub.scale.set(0.05, 1.1, 0.05); hub.rotation.z = Math.PI / 2; wheel.add(hub);
      for (let i = 0; i < 6; i++) {
        const pd = new T.Mesh(V.BOX, V.mat('#2f6fb8')); pd.scale.set(0.9, 0.04, 0.22);
        const ang = i / 6 * Math.PI * 2; pd.position.set(0, Math.sin(ang) * 0.22, Math.cos(ang) * 0.22); pd.rotation.x = -ang;
        wheel.add(pd);
      }
      g.add(wheel);
      g.rotation.y = Math.random() * Math.PI * 2;
      scene.add(g);
      aer.push({ g, wheel });
    }
  }

  const lampBulbs = [];
  function buildLamps() {
    lampMat = new T.MeshBasicMaterial({ color: new T.Color('#777') });
    const spots = [[-1.6, -1.6], [PW / 2, -1.6], [PW + 1.6, -1.6], [PW + 1.6, PH / 2], [PW + 1.6, PH + 1.6], [PW / 2 - 9, PH + 1.6], [-1.6, PH + 1.6], [-1.6, PH / 2]];
    for (const [x, z] of spots) {
      const pole = new T.Mesh(V.UNIT_CYL, V.mat('#4a4a4a')); pole.scale.set(0.05, 4, 0.05); pole.position.set(x, BANK + 2, z);
      const bulb = new T.Mesh(V.SPH, lampMat); bulb.scale.setScalar(0.16); bulb.position.set(x, BANK + 4.05, z);
      const gl = V.glowSprite('#ffd890'); gl.scale.setScalar(2.2); gl.position.copy(bulb.position); gl.visible = false;
      scene.add(pole, bulb, gl);
      lampBulbs.push(gl);
    }
  }

  // ---------- Bè rau muống (hồ có weedSpots, ví dụ hồ diếc) ----------
  // Mỗi bè nằm sát bờ, giữa hai ô câu cạnh nhau (bên hông người ngồi) nên không chắn tầm nhìn ra phao.
  // Khung tre nổi, thảm gốc rau, thân rau vươn lên với lá mũi mác; lá bèo nổi quanh bè. Dùng InstancedMesh cho nhẹ máy.
  let weedG = null, weedRes = null;
  function weedResources() {
    if (weedRes) return weedRes;
    const s = new T.Shape(); // lá rau muống: cuống ở gốc tọa độ, mũi lá theo +Y (trước khi xoay nằm)
    s.moveTo(0, 0); s.lineTo(0.26, -0.14); s.lineTo(0.2, 0.18);
    s.quadraticCurveTo(0.14, 0.62, 0, 1); s.quadraticCurveTo(-0.14, 0.62, -0.2, 0.18);
    s.lineTo(-0.26, -0.14); s.lineTo(0, 0);
    const leaf = new T.ShapeGeometry(s, 3); leaf.rotateX(-Math.PI / 2);
    const pad = new T.CircleGeometry(1, 10); pad.rotateX(-Math.PI / 2);
    const tint = side => new T.MeshLambertMaterial({ color: 0xffffff, side: side || T.FrontSide });
    weedRes = { leaf, pad, leafM: tint(T.DoubleSide), padM: tint(T.DoubleSide), matM: tint(), stemM: V.mat('#86a356'), bamM: V.mat('#b39a5c') };
    return weedRes;
  }
  function clearWeeds() {
    if (!weedG) return;
    scene.remove(weedG);
    weedG.children.forEach(o => { if (o.dispose) o.dispose(); });
    weedG = null; V.weedRafts = 0;
  }
  function buildWeeds() {
    clearWeeds();
    const ids = CC.pond().weedSpots || [];
    if (!ids.length) return;
    const M = CC.PondMap, r = rnd(4242), rafts = [];
    // Tâm bè: điểm giữa ô có rau và ô bên cạnh (cùng một bờ), không trùng nhau
    const addRaft = (a, b) => {
      if (a.side !== b.side) return;
      const x = (a.x + b.x) / 2, z = (a.y + b.y) / 2;
      if (rafts.some(c => Math.hypot(c.x - x, c.z - z) < 0.5)) return;
      const gap = Math.hypot(a.x - b.x, a.y - b.y);
      rafts.push({ x, z, fx: a.nx, fz: a.ny, rx: -a.ny, rz: a.nx, w: Math.min(2, gap * 0.42), L: 2.1 + r() * 1.1 });
    };
    ids.forEach(id => { const sp = M.spot(id); addRaft(sp, M.spot(id - 1)); addRaft(sp, M.spot(id + 1)); });
    if (!rafts.length) return;
    const R = weedResources();
    const at = (c, gx, gl, y, out) => (out || new T.Vector3()).set(c.x + c.fx * gx + c.rx * gl, y, c.z + c.fz * gx + c.rz * gl);
    const blobs = [], bams = [], stems = [], leaves = [], pads = [];
    const LEAF_C = ['#3f7d2c', '#4c8c33', '#5a9a3b', '#357028', '#66a543'], MAT_C = ['#2e4d22', '#38592a', '#2a4420'], PAD_C = ['#5b8c37', '#6e9e45', '#4a7a2e'];
    const pickC = a => a[(r() * a.length) | 0];
    for (const c of rafts) {
      const g0 = 0.12, g1 = g0 + c.L, hw = c.w / 2;
      // Thảm gốc rau dày nổi sát mặt nước
      const rows = Math.ceil(c.L / 0.55);
      for (let i = 0; i < rows; i++) for (const sd of [-1, 1]) {
        blobs.push({ p: at(c, g0 + (i + 0.5) * c.L / rows + (r() - 0.5) * 0.15, sd * hw * 0.48 + (r() - 0.5) * 0.15, 0.012),
          s: [hw * (0.5 + r() * 0.15), 0.035 + r() * 0.015, 0.36 + r() * 0.12], yaw: Math.atan2(c.fx, c.fz) + (r() - 0.5) * 0.5, c: pickC(MAT_C) });
      }
      // Khung tre: hai cây dọc, hai cây ngang nổi trên nước; hai cọc cắm giữ bè ở phía ngoài
      const y = 0.03;
      bams.push([at(c, g0 - 0.05, -hw, y), at(c, g1 + 0.05, -hw, y), 0.035], [at(c, g0 - 0.05, hw, y), at(c, g1 + 0.05, hw, y), 0.035],
        [at(c, g0, -hw - 0.08, y), at(c, g0, hw + 0.08, y), 0.03], [at(c, g1, -hw - 0.08, y), at(c, g1, hw + 0.08, y), 0.03],
        [at(c, g1 + 0.1, -hw - 0.1, -1.3), at(c, g1 + 0.1, -hw - 0.1, 0.5 + r() * 0.15), 0.022],
        [at(c, g1 + 0.1, hw + 0.1, -1.3), at(c, g1 + 0.1, hw + 0.1, 0.45 + r() * 0.15), 0.022]);
      // Rau muống: thân xiên lên, mỗi ngọn một lá, vài cây thêm lá ở lưng chừng
      const n = Math.round(c.w * c.L * 24);
      for (let i = 0; i < n; i++) {
        const gx = g0 + 0.05 + r() * (c.L - 0.1), gl = (r() - 0.5) * (c.w - 0.1);
        const h = 0.05 + Math.pow(r(), 0.8) * 0.32;
        const b = at(c, gx, gl, 0.02), top = at(c, gx + (r() - 0.5) * 0.1, gl + (r() - 0.5) * 0.1, h);
        stems.push([b, top, 0.0045 + r() * 0.002]);
        leaves.push({ p: top, yaw: r() * Math.PI * 2, pitch: -0.5 + r() * 1.3, s: 0.07 + r() * 0.06, c: pickC(LEAF_C) });
        if (r() < 0.45) {
          const k = 0.35 + r() * 0.35;
          leaves.push({ p: new T.Vector3().lerpVectors(b, top, k), yaw: r() * Math.PI * 2, pitch: -0.2 + r() * 0.9, s: 0.06 + r() * 0.05, c: pickC(LEAF_C) });
        }
      }
      // Lá bèo nổi lác đác quanh bè
      for (let i = 0, k = 0; i < 16 && k < 80; k++) {
        const gx = g0 + r() * (c.L + 0.7), gl = (r() - 0.5) * (c.w + 1.1);
        if (gx < g1 + 0.05 && Math.abs(gl) < hw + 0.05) continue;
        pads.push({ p: at(c, gx, gl, 0.016), s: 0.045 + r() * 0.07, yaw: r() * 6.3, c: pickC(PAD_C) });
        i++;
      }
    }
    weedG = new T.Group();
    const m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(0, 0, 0, 'YXZ'), sc = new T.Vector3(), col = new T.Color(), d = new T.Vector3(), mid = new T.Vector3();
    const inst = (geo, mat, list, fill) => {
      const im = new T.InstancedMesh(geo, mat, list.length);
      list.forEach((o, i) => { fill(o, i); im.setMatrixAt(i, m4); if (o.c) im.setColorAt(i, col.set(o.c)); });
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.frustumCulled = false; // r128 chỉ xét khung bao của hình gốc, bè nằm rải quanh hồ
      weedG.add(im);
    };
    const segM = ([a, b, rad]) => {
      d.subVectors(b, a); const len = d.length() || 1e-4;
      q.setFromUnitVectors(UP, d.divideScalar(len));
      m4.compose(mid.addVectors(a, b).multiplyScalar(0.5), q, sc.set(rad, len, rad));
    };
    inst(V.SPH, R.matM, blobs, o => { q.setFromEuler(e.set(0, o.yaw, 0)); m4.compose(o.p, q, sc.set(o.s[0], o.s[1], o.s[2])); });
    inst(V.UNIT_CYL, R.bamM, bams, segM);
    inst(V.UNIT_CYL, R.stemM, stems, segM);
    inst(R.leaf, R.leafM, leaves, o => { q.setFromEuler(e.set(o.pitch, o.yaw, 0)); m4.compose(o.p, q, sc.setScalar(o.s)); });
    inst(R.pad, R.padM, pads, o => { q.setFromEuler(e.set(0, o.yaw, 0)); m4.compose(o.p, q, sc.setScalar(o.s)); });
    scene.add(weedG);
    V.weedRafts = rafts.length;
  }

  // ---------- Mưa ----------
  let rain;
  const RAIN_N = 900;
  function buildRain() {
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(RAIN_N * 6), 3));
    rain = new T.LineSegments(g, new T.LineBasicMaterial({ color: 0xc8d4e0, transparent: true, opacity: 0.35 }));
    rain.frustumCulled = false;
    rain.userData.drops = [];
    for (let i = 0; i < RAIN_N; i++) rain.userData.drops.push({ x: U.rand(-12, 12), y: U.rand(0, 9), z: U.rand(-12, 12), v: U.rand(7, 10) });
    scene.add(rain);
  }
  function updateRain(dt, amount) {
    rain.visible = amount > 0;
    if (!amount) return;
    const n = Math.round(RAIN_N * amount), P = rain.geometry.attributes.position.array;
    const W = CC.world, wx = Math.cos(W.windAngle || 0) * W.wind * 0.12, wz = Math.sin(W.windAngle || 0) * W.wind * 0.12;
    const c = camera.position;
    for (let i = 0; i < n; i++) {
      const d = rain.userData.drops[i];
      d.y -= d.v * dt;
      if (d.y < -c.y) { d.y = U.rand(6, 9); d.x = U.rand(-12, 12); d.z = U.rand(-12, 12); }
      const x = c.x + d.x, y = c.y + d.y, z = c.z + d.z;
      P[i * 6] = x; P[i * 6 + 1] = y; P[i * 6 + 2] = z;
      P[i * 6 + 3] = x - wx * 0.35; P[i * 6 + 4] = y + 0.35; P[i * 6 + 5] = z - wz * 0.35;
    }
    rain.geometry.setDrawRange(0, n * 2);
    rain.geometry.attributes.position.needsUpdate = true;
  }

  // ---------- Thời gian trong ngày, thời tiết ----------
  let lastPond = null;
  function updateEnv(G, dt) {
    const W = CC.world, light = W.light(), sk = W.sky(), wx = CC.WEATHERS[W.weather], h = W.hour();
    const a = (h - 6) / 12 * Math.PI;
    sunDir.set(Math.cos(a), Math.sin(a), 0.35).normalize();
    moonDir.set(-Math.cos(a), -Math.sin(a), 0.25).normalize();
    const warm = 1 - U.smooth(0, 0.45, sunDir.y);
    sunCol.setRGB(1, 0.95 - 0.33 * warm, 0.86 - 0.55 * warm);
    const night = U.clamp((0.45 - light) / 0.45, 0, 1);
    const top = V.rgb(sk.top), bot = V.rgb(sk.bot);
    const su = sky.material.uniforms;
    su.top.value.copy(top); su.bot.value.copy(bot); su.night.value = night; su.cloud.value = wx.cloud;
    su.time.value = time; su.light.value = light; su.wind.value = W.wind * 0.3;
    sky.position.copy(camera.position);

    sun.position.copy(sunDir).multiplyScalar(90).add(sun.target.position);
    sun.intensity = U.smooth(-0.04, 0.18, sunDir.y) * (1.0 - wx.cloud * 0.6);
    sun.color.copy(sunCol);
    moon.position.copy(moonDir).multiplyScalar(90).add(sun.target.position);
    moon.intensity = night * 0.28 * (1 - wx.cloud * 0.6);
    hemi.color.copy(top).lerp(new T.Color(1, 1, 1), 0.35 * light);
    hemi.groundColor.setRGB(0.22 * light + 0.03, 0.27 * light + 0.04, 0.16 * light + 0.03);
    hemi.intensity = 0.32 + 0.5 * light;

    const fogC = bot.clone().multiplyScalar(0.55 + 0.45 * light).lerp(new T.Color(0.6, 0.62, 0.66), wx.rain * 0.4 * light);
    scene.fog.color.copy(fogC);
    scene.fog.near = 50 - wx.rain * 25; scene.fog.far = 230 - wx.rain * 110;
    renderer.setClearColor(fogC);

    const wu = water.material.uniforms;
    wu.time.value = time; wu.light.value = light; wu.rain.value = wx.rain;
    wu.wamp.value = U.clamp(W.wind / 4, 0.15, 2.2);
    wu.wdir.value.set(Math.cos(W.windAngle || 0), Math.sin(W.windAngle || 0));
    wu.top.value.copy(top); wu.bot.value.copy(bot); wu.fogCol.value.copy(fogC);
    wu.fogNear.value = scene.fog.near; wu.fogFar.value = scene.fog.far;
    wu.bankCol.value.setRGB(0.1 + 0.08 * light, 0.14 + 0.1 * light, 0.09 + 0.06 * light);
    const learn = !!G.learn;
    wu.opacity.value = learn ? 0.55 : 1;
    water.material.transparent = learn;
    pMat.uniforms.color.value.setRGB(0.55 + 0.45 * light, 0.6 + 0.4 * light, 0.62 + 0.38 * light);

    // Đèn đêm
    const lampOn = light < 0.35;
    lampBulbs.forEach(l => { l.visible = lampOn; });
    lampMat.color.set(lampOn ? '#fff1c0' : '#888888');
    winMat.emissive.set(lampOn ? '#ffcf7a' : '#000000');
    hutLight.intensity = lampOn ? 1.1 : 0;

    // Máy sục
    const on = CC.PondMap.aeratorOn();
    for (const A of aer) {
      if (on) {
        A.wheel.rotation.x -= dt * 9;
        const p = A.g.localToWorld(tv.set(0, 0.05, 0.8));
        if (Math.random() < dt * 30) V.spray(p, 3, 1.6, 0.35, 0.03);
        if (Math.random() < dt * 4) V.ripple(p.x, p.z, 0.35, 0.6);
        if (Math.random() < dt * 20) V.bubbles(A.g.localToWorld(tv.set(U.rand(-0.6, 0.6), 0, U.rand(0.6, 2.2))), 2, 0.3, 0.03, 1.5);
      }
    }
    // Nước chảy từ ống cấp
    const M = CC.PondMap;
    if (Math.random() < dt * 25) {
      pts.length < PMAX && pts.push({ x: M.inlet.x + 0.62, y: 0.25, z: M.inlet.y + U.rand(-0.05, 0.05), vx: U.rand(0.6, 0.9), vy: U.rand(0, 0.2), vz: U.rand(-0.05, 0.05), life: 0.6, max: 1, size: 0.05, g: 9.8, float: false });
    }
    if (Math.random() < dt * 2) V.ripple(M.inlet.x + 0.7, M.inlet.y, 0.25, 0.5);

    // Đổi hồ: đáy, biển tên, bè rau muống
    if (lastPond !== CC.P.pondId) {
      lastPond = CC.P.pondId;
      bottom.position.y = -CC.pond().depth[1];
      drawSign();
      buildWeeds();
    }
    updateRain(dt, wx.rain);
  }

  // ---------- Điều khiển nhìn quanh ----------
  const keys = { l: false, r: false };
  function bindInput() {
    const top = document.getElementById('cv');
    let drag = null;
    top.addEventListener('pointerdown', e => { if (V.on && e.button === 2) drag = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('pointermove', e => {
      if (!drag) return;
      V.look.yaw = U.clamp(V.look.yaw - (e.clientX - drag.x) * 0.0045, -2.6, 2.6);
      V.look.pitch = U.clamp(V.look.pitch - (e.clientY - drag.y) * 0.0035, -0.5, 0.6);
      drag = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointerup', e => { if (e.button === 2) drag = null; });
    top.addEventListener('wheel', e => {
      if (!V.on) return;
      e.preventDefault();
      V.zoom = U.clamp(V.zoom * (e.deltaY > 0 ? 1.1 : 0.9), 0.3, 1.4);
    }, { passive: false });
    window.addEventListener('keydown', e => {
      if (!V.on || (CC.UI && CC.UI.isOpen())) return;
      const k = e.key.toLowerCase();
      const fight = CC.G && CC.G.state === 'fighting'; // lúc kéo cá A / D là đưa cần ngang (dòng cá), không xoay camera
      if (!fight && (k === 'a' || k === 'arrowleft')) keys.l = true;
      if (!fight && (k === 'd' || k === 'arrowright')) keys.r = true;
      if (k === 'r') { V.look.yaw = 0; V.look.pitch = 0; V.zoom = 1; V.watchA = null; }
      if (k === 'n' && !e.repeat) {
        if (CC.G.state === 'fighting') return;
        V.toggleWatch();
      }
    });
    window.addEventListener('keyup', e => {
      const k = e.key.toLowerCase();
      if (k === 'a' || k === 'arrowleft') keys.l = false;
      if (k === 'd' || k === 'arrowright') keys.r = false;
    });
    window.addEventListener('blur', () => { keys.l = keys.r = false; drag = null; });
  }
  // ---------- Khởi tạo ----------
  function resize() {
    if (!renderer) return;
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  V.init = () => {
    cv3 = document.getElementById('cv3d');
    try {
      renderer = new T.WebGLRenderer({ canvas: cv3, antialias: true, powerPreference: 'high-performance' });
    } catch (e) { console.warn('WebGL ไม่พร้อมใช้งาน', e); V.ok = false; return false; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    scene = new T.Scene();
    scene.fog = new T.Fog(0x9fb8c8, 50, 230);
    camera = new T.PerspectiveCamera(45, 1, 0.05, 1000);
    V.scene = scene; V.camera = camera; V.renderer = renderer;

    hemi = new T.HemisphereLight(0xbfd8ff, 0x3a4a2a, 0.7);
    scene.add(hemi);
    sun = new T.DirectionalLight(0xffffff, 0.9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -48; sc.right = 48; sc.top = 40; sc.bottom = -40; sc.near = 10; sc.far = 200;
    sun.shadow.bias = -0.0006;
    sun.target.position.set(PW / 2, 0, PH / 2);
    scene.add(sun, sun.target);
    moon = new T.DirectionalLight(0x9fb4ff, 0);
    moon.target = sun.target;
    scene.add(moon);

    buildWorld();
    buildParticles();
    buildRain();
    labelBox = document.getElementById('lbl3d');
    bindInput();
    window.addEventListener('resize', resize);
    resize();
    V.initActors && V.initActors();
    V.ready = true;
    return true;
  };

  V.setOn = on => {
    V.on = !!on && V.ready;
    if (V.on) V.hintT = 14;
    cv3.style.display = V.on ? 'block' : 'none';
    if (labelBox) labelBox.style.display = V.on ? '' : 'none';
    document.body.classList.toggle('v3d', V.on);
  };

  V.draw = (G, dt) => {
    if (!V.ready) return;
    time += dt;
    V.time = time;
    if (keys.l) V.look.yaw = Math.min(2.6, V.look.yaw + dt * 1.2);
    if (keys.r) V.look.yaw = Math.max(-2.6, V.look.yaw - dt * 1.2);
    V.updateNPCs && V.updateNPCs(G, dt);
    V.updateRig && V.updateRig(G, dt); // đặt camera
    updateEnv(G, dt);
    updateParticles(dt);
    updateRipples(dt);
    updateLabels(dt);
    const H = renderer.getDrawingBufferSize(new T.Vector2()).y;
    pMat.uniforms.scale.value = H / (2 * Math.tan(camera.fov * Math.PI / 360));
    renderer.render(scene, camera);
  };
})();
