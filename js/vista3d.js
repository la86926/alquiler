/* Vista 3D (three.js). Mapeo: x del plano → x, altura → y, y del plano → −z. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { anilloMuros } from './plano.js?v=1.1.7';
import { construirModelo } from './modelos.js?v=1.1.7';

const rad = g => g * Math.PI / 180;

export function crearVista3D(cont, cb) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = false;   // sin sombras: se ve más limpio
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  cont.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'none';

  const escena = new THREE.Scene();
  const fondo = () => getComputedStyle(document.documentElement).getPropertyValue('--sky').trim() || '#eef2f6';
  escena.background = new THREE.Color(fondo());
  const camara = new THREE.PerspectiveCamera(45, 1, 0.05, 300);
  const ctl = new OrbitControls(camara, renderer.domElement);
  ctl.enableDamping = true; ctl.dampingFactor = 0.12; ctl.screenSpacePanning = true;
  ctl.maxPolarAngle = Math.PI / 2 - 0.02; ctl.minDistance = 0.6; ctl.maxDistance = 40;

  escena.add(new THREE.HemisphereLight('#ffffff', '#ddd6cb', 1.35));
  const sol = new THREE.DirectionalLight('#fff6ea', 1.5);
  sol.castShadow = false;
  escena.add(sol, sol.target);
  escena.add(new THREE.AmbientLight('#ffffff', 0.25));

  const casa = new THREE.Group(), muebles = new THREE.Group();
  escena.add(casa, muebles);
  let g = null, plano = null, mallaMuros = null, altoMuros = 1;
  const mapa = new Map(); // uid → { grupo, firma, borde }
  let seleccion = null, visible = false, sucio = true;

  function texturaPiso() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = '#f1ece4'; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = 'rgba(120,110,95,.22)'; x.lineWidth = 3; x.strokeRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }

  /* Letrero que siempre mira a la cámara (letras de las esquinas y nombre de la calle) */
  function letrero(texto, { alto = 0.42, fondo = 'rgba(255,255,255,.94)', color = '#16202a', borde = 'rgba(22,32,42,.25)' } = {}) {
    const c = document.createElement('canvas'), x = c.getContext('2d'), H = 96;
    x.font = '800 56px "Plus Jakarta Sans", system-ui, sans-serif';
    const W = Math.max(H, Math.ceil(x.measureText(texto).width) + 52);
    c.width = W; c.height = H;
    x.font = '800 56px "Plus Jakarta Sans", system-ui, sans-serif';
    const r = H / 2 - 4;
    x.fillStyle = fondo; x.strokeStyle = borde; x.lineWidth = 4;
    x.beginPath(); x.moveTo(4 + r, 4); x.lineTo(W - 4 - r, 4); x.arc(W - 4 - r, H / 2, r, -Math.PI / 2, Math.PI / 2); x.lineTo(4 + r, H - 4); x.arc(4 + r, H / 2, r, Math.PI / 2, Math.PI * 1.5); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(texto, W / 2, H / 2 + 3);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
    sp.scale.set(alto * W / H, alto, 1); sp.renderOrder = 20;
    return sp;
  }
  let letras = [];

  function armarCasa(geo, p) {
    g = geo; plano = p;
    casa.clear();
    const forma = pts => { const s = new THREE.Shape(); pts.forEach((q, i) => i ? s.lineTo(q[0], q[1]) : s.moveTo(q[0], q[1])); s.closePath(); return s };
    // suelo exterior y vereda
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#e7e3dc', roughness: 1 }));
    suelo.rotation.x = -Math.PI / 2; suelo.position.set(g.centro[0], -0.02, -g.centro[1]); suelo.receiveShadow = true; casa.add(suelo);
    const vx0 = g.caja.x0 - 3, vx1 = g.caja.x1 + 3;
    const vereda = new THREE.Mesh(new THREE.BoxGeometry(vx1 - vx0, 0.12, 1.6), new THREE.MeshStandardMaterial({ color: '#d9d6cf', roughness: 1 }));
    vereda.position.set((vx0 + vx1) / 2, 0.04 - 0.1, 0.8 + p.muro * 0); vereda.receiveShadow = true; casa.add(vereda);
    const pista = new THREE.Mesh(new THREE.PlaneGeometry(vx1 - vx0 + 30, 7), new THREE.MeshStandardMaterial({ color: '#c6c9ce', roughness: 1 }));
    pista.rotation.x = -Math.PI / 2; pista.position.set((vx0 + vx1) / 2, -0.015, 1.6 + 3.5); pista.receiveShadow = true; casa.add(pista);
    for (let i = -6; i < 7; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.12), new THREE.MeshBasicMaterial({ color: '#f4f4f0' })); l.rotation.x = -Math.PI / 2; l.position.set((vx0 + vx1) / 2 + i * 2.6, -0.01, 5.1); casa.add(l) }
    // borde de la vereda: la línea que marca el lado de la calle
    const borde = new THREE.Mesh(new THREE.PlaneGeometry(vx1 - vx0 + 30, 0.1), new THREE.MeshBasicMaterial({ color: '#7d848d' }));
    borde.rotation.x = -Math.PI / 2; borde.position.set((vx0 + vx1) / 2, 0.003, 1.6); casa.add(borde);
    // nombre de la calle
    const nom = letrero(p.calle || 'Calle', { alto: 0.5, fondo: 'rgba(22,32,42,.82)', color: '#ffffff', borde: 'rgba(0,0,0,0)' });
    nom.position.set((g.A[0] + g.B[0]) / 2, 0.45, 2.4); casa.add(nom);
    // letras de las esquinas
    letras = [];
    for (const k of ['A', 'B', 'C', 'D']) {
      const q = g[k], v = [q[0] - g.centro[0], q[1] - g.centro[1]], L = Math.hypot(...v) || 1;
      const sp = letrero(k, { alto: 0.46 }); sp.userData.base = [q[0] + v[0] / L * 0.35, -(q[1] + v[1] / L * 0.35)];
      casa.add(sp); letras.push(sp);
    }
    // piso
    const piso = new THREE.Mesh(new THREE.ShapeGeometry(forma(g.pts)), new THREE.MeshStandardMaterial({ map: texturaPiso(), roughness: 0.85 }));
    piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; casa.add(piso);
    // muros
    const geoM = new THREE.ExtrudeGeometry(forma(anilloMuros(g, p.muro)), { depth: p.alto, bevelEnabled: false });
    geoM.rotateX(-Math.PI / 2);
    mallaMuros = new THREE.Mesh(geoM, [new THREE.MeshStandardMaterial({ color: '#c9b9a6', roughness: 0.95 }), new THREE.MeshStandardMaterial({ color: '#f7f5f0', roughness: 0.92 })]);
    mallaMuros.castShadow = true; mallaMuros.receiveShadow = true; mallaMuros.scale.y = altoMuros; casa.add(mallaMuros);
    // portón enrollable (rieles y caja arriba)
    const metal = new THREE.MeshStandardMaterial({ color: '#d3d8de', roughness: 0.45, metalness: 0.25 });
    for (const q of [g.A, g.B]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.06, p.alto, 0.08), metal); r.position.set(q[0] + (q === g.A ? 0.03 : -0.03), p.alto / 2, 0.04); r.castShadow = true; casa.add(r); r.userData.porton = 1 }
    const cajaP = new THREE.Mesh(new THREE.BoxGeometry(g.muros[0].L, 0.22, 0.24), metal);
    cajaP.position.set(g.muros[0].L / 2, p.alto - 0.11, 0.12); cajaP.castShadow = true; cajaP.userData.porton = 1; casa.add(cajaP);
    // sol según el tamaño
    const R = Math.max(g.caja.x1 - g.caja.x0, g.caja.y1 - g.caja.y0);
    sol.position.set(g.centro[0] + R * 0.8, 9, -g.centro[1] + R * 1.1); sol.target.position.set(g.centro[0], 0, -g.centro[1]);
    const sc = sol.shadow.camera; sc.left = sc.bottom = -R; sc.right = sc.top = R; sc.near = 0.5; sc.far = 30; sc.updateProjectionMatrix();
    alturaMuros(altoMuros);
    sucio = true;
  }

  function alturaMuros(f) {
    altoMuros = f;
    if (mallaMuros) mallaMuros.scale.y = f;
    for (const sp of letras) sp.position.set(sp.userData.base[0], (plano ? plano.alto : 2.8) * f + 0.4, sp.userData.base[1]);
    casa.children.forEach(c => { if (c.userData.porton) c.visible = f > 0.9 });
    sucio = true;
  }

  const firma = o => [o.k, o.w, o.d, o.h, o.c, o.niv, o.cerrado].join('|');
  function ponerMuebles(items, estados, sel) {
    const vivos = new Set();
    for (const o of items) {
      if (o.x == null) continue;
      vivos.add(o.uid);
      let r = mapa.get(o.uid);
      const f = firma(o);
      if (!r || r.firma !== f) {
        if (r) muebles.remove(r.grupo);
        const grupo = new THREE.Group();
        const m = construirModelo(o); grupo.add(m);
        const caja = new THREE.Mesh(new THREE.BoxGeometry(o.w, o.h, o.d), new THREE.MeshBasicMaterial({ visible: false }));
        caja.position.y = o.h / 2; caja.userData.uid = o.uid; grupo.add(caja);
        const borde = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(o.w + 0.01, o.h + 0.01, o.d + 0.01)), new THREE.LineBasicMaterial({ color: '#2f6fdb' }));
        borde.position.y = o.h / 2; borde.visible = false; grupo.add(borde);
        grupo.userData.uid = o.uid;
        r = { grupo, firma: f, borde, caja };
        mapa.set(o.uid, r); muebles.add(grupo);
      }
      r.grupo.position.set(o.x, o.e || 0, -o.y);
      r.grupo.rotation.y = rad(o.rot || 0);
      const est = estados[o.uid];
      r.borde.visible = o.uid === sel || est === 'choca' || est === 'fuera';
      r.borde.material.color.set(est === 'choca' || est === 'fuera' ? '#e5483f' : '#2f6fdb');
    }
    for (const [uid, r] of mapa) if (!vivos.has(uid)) { muebles.remove(r.grupo); mapa.delete(uid) }
    seleccion = sel; sucio = true;
  }

  function vista(tipo, suave = true) {
    if (!g) return;
    if (tipo === 'dentro') { entrar(); return }
    if (paseo) salir(false);
    const [cx, cy] = g.centro, t = new THREE.Vector3(cx, 0.9, -cy);
    const R = Math.max(g.caja.x1 - g.caja.x0, g.caja.y1 - g.caja.y0);
    let pos;
    const radio = 0.5 * Math.hypot(g.caja.x1 - g.caja.x0, g.caja.y1 - g.caja.y0) + 0.35;
    const hv = camara.fov * Math.PI / 360, hh = Math.atan(Math.tan(hv) * camara.aspect);
    const dist = radio * 0.92 / Math.sin(Math.min(hv, hh));
    if (tipo === 'calle') { pos = new THREE.Vector3((g.A[0] + g.B[0]) / 2, 1.6, 4.2); t.set((g.A[0] + g.B[0]) / 2 - 0.5, 1.0, -cy) }
    else if (tipo === 'arriba') { pos = new THREE.Vector3(cx, dist * 0.95, -cy + 0.01); t.set(cx, 0, -cy) }
    else if (tipo === 'dentro') { pos = new THREE.Vector3((g.A[0] + g.B[0]) / 2, 1.6, -0.6); t.set(cx - 0.4, 1.2, -cy - 1) }
    else { t.set(cx, 0.4, -cy); pos = new THREE.Vector3(0.32, 1.35, 0.95).normalize().multiplyScalar(dist).add(t) }
    if (!suave) { camara.position.copy(pos); ctl.target.copy(t); ctl.update(); sucio = true; return }
    const p0 = camara.position.clone(), t0 = ctl.target.clone(), ini = performance.now();
    const paso = now => {
      const k = Math.min(1, (now - ini) / 550), e = 1 - Math.pow(1 - k, 3);
      camara.position.lerpVectors(p0, pos, e); ctl.target.lerpVectors(t0, t, e); ctl.update(); sucio = true;
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }

  // Arrastrar muebles
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), suelo0 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let drag = null, toque = null;
  function rayo(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camara);
  }
  function tocado(ev) {
    rayo(ev);
    const cajas = []; for (const r of mapa.values()) cajas.push(r.caja);
    const hit = ray.intersectObjects(cajas, false)[0];
    return hit ? hit.object.userData.uid : null;
  }
  function enSuelo(ev, alto = 0) {
    rayo(ev); suelo0.constant = -alto;
    const p = new THREE.Vector3();
    return ray.ray.intersectPlane(suelo0, p) ? p : null;
  }
  cont.addEventListener('pointerdown', ev => {
    if (!visible || ev.button > 0 || paseo) return;
    toque = { x: ev.clientX, y: ev.clientY, n: (toque && toque.activo ? toque.n + 1 : 1), activo: true };
    if (toque.n > 1) { if (drag) { cb.arrastrar(drag.uid, null, null, 'fin'); drag = null; ctl.enabled = true } return }
    const uid = tocado(ev);
    if (uid && cb.fijo && cb.fijo()) { toque.uid = uid; return } // fijo: el dedo gira la cámara; un toque solo elige
    if (uid) {
      const o = cb.item(uid); if (!o) return;
      const p = enSuelo(ev, 0);
      drag = { uid, dx: p ? o.x - p.x : 0, dy: p ? o.y + p.z : 0, mov: false, id: ev.pointerId };
      ctl.enabled = false;
      try { renderer.domElement.setPointerCapture(ev.pointerId) } catch (e) {}
      cb.seleccionar(uid);
    }
  }, true);
  cont.addEventListener('pointermove', ev => {
    if (!drag || ev.pointerId !== drag.id) return;
    if (!drag.mov && Math.hypot(ev.clientX - toque.x, ev.clientY - toque.y) < 4) return;
    drag.mov = true;
    const p = enSuelo(ev, 0); if (!p) return;
    cb.arrastrar(drag.uid, p.x + drag.dx, -p.z + drag.dy, 'mueve');
  });
  const soltar = ev => {
    if (toque) toque.activo = false;
    if (drag) { if (drag.mov) cb.arrastrar(drag.uid, null, null, 'fin'); drag = null; ctl.enabled = true; return }
    if (toque && ev.type === 'pointerup' && Math.hypot(ev.clientX - toque.x, ev.clientY - toque.y) < 5 && toque.n === 1) cb.seleccionar(toque.uid || null);
  };
  cont.addEventListener('pointerup', soltar);
  cont.addEventListener('pointercancel', soltar);
  ctl.addEventListener('change', () => { sucio = true });

  // Etiqueta del mueble elegido
  const etiqueta = document.createElement('div'); etiqueta.className = 'et3d'; etiqueta.hidden = true; cont.appendChild(etiqueta);
  function moverEtiqueta() {
    const r = seleccion && mapa.get(seleccion), o = seleccion && cb.item(seleccion);
    const ang = cb.anguloEl;
    if (!r || !o) { etiqueta.hidden = true; if (ang) ang.style.visibility = 'hidden'; return }
    if (ang) {
      const b = new THREE.Vector3(o.x, o.e || 0, -o.y).project(camara);
      const px = (b.x + 1) / 2 * cont.clientWidth, py = Math.min((1 - b.y) / 2 * cont.clientHeight + 18, cont.clientHeight - 190);
      ang.style.visibility = b.z > 1 ? 'hidden' : 'visible';
      ang.style.transform = `translate(${Math.round(px)}px, ${Math.round(py)}px) translate(-50%, 0)`;
    }
    const v = new THREE.Vector3(o.x, (o.e || 0) + o.h + 0.12, -o.y).project(camara);
    if (v.z > 1) { etiqueta.hidden = true; return }
    etiqueta.hidden = false;
    const t = `${o.n}<span>${Math.round(o.w * 100)} × ${Math.round(o.d * 100)} × ${Math.round(o.h * 100)} cm</span>`;
    if (etiqueta.innerHTML !== t) etiqueta.innerHTML = t;
    etiqueta.style.transform = `translate(${(v.x + 1) / 2 * cont.clientWidth}px, ${(1 - v.y) / 2 * cont.clientHeight}px) translate(-50%, -100%)`;
  }

  function tam() {
    const w = cont.clientWidth, h = cont.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); renderer.domElement.style.width = w + 'px'; renderer.domElement.style.height = h + 'px';
    camara.aspect = w / h; camara.updateProjectionMatrix(); sucio = true;
  }
  new ResizeObserver(tam).observe(cont);

  /* ---------- Caminar por dentro: un muñequito que entra desde la vereda ----------
     Flechas (o teclado) para avanzar y girar; arrastrar el dedo para mirar alrededor.
     La cámara va detrás del muñequito o «con sus ojos». No atraviesa paredes ni muebles. */
  let paseo = null;
  const UI = document.createElement('div'); UI.className = 'paseo'; UI.hidden = true;
  const flecha = (d, rot) => `<button class="pf" data-m="${d}" aria-label="${{ f: 'Avanzar', b: 'Retroceder', l: 'Girar a la izquierda', r: 'Girar a la derecha' }[d]}"><svg viewBox="0 0 24 24" style="transform:rotate(${rot}deg)"><path d="M12 5l7 9H5z"/></svg></button>`;
  UI.innerHTML = `<div class="pad">${flecha('f', 0)}${flecha('l', -90)}${flecha('r', 90)}${flecha('b', 180)}</div>
    <div class="pbtn"><button class="pb" data-a="ojos"><svg viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg><span>Sus ojos</span></button><button class="pb" data-a="salir"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg><span>Salir</span></button></div>
    <p class="phint">Usa las flechas para caminar. Arrastra para mirar.</p>`;
  cont.appendChild(UI);
  const teclas = new Set();
  UI.querySelectorAll('.pf').forEach(b => {
    const on = ev => { ev.preventDefault(); teclas.add(b.dataset.m); b.classList.add('on'); try { b.setPointerCapture(ev.pointerId) } catch (e) {} };
    const off = () => { teclas.delete(b.dataset.m); b.classList.remove('on') };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
    b.addEventListener('contextmenu', ev => ev.preventDefault());
  });
  UI.querySelector('[data-a="salir"]').onclick = () => salir(true);
  UI.querySelector('[data-a="ojos"]').onclick = () => {
    if (!paseo) return; paseo.ojos = !paseo.ojos; paseo.avatar.visible = !paseo.ojos;
    UI.querySelector('[data-a="ojos"] span').textContent = paseo.ojos ? 'Desde atrás' : 'Sus ojos'; sucio = true;
  };
  const MAPA_TECLAS = { ArrowUp: 'f', KeyW: 'f', ArrowDown: 'b', KeyS: 'b', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };
  addEventListener('keydown', ev => { if (paseo && visible && MAPA_TECLAS[ev.code] && !ev.target.closest?.('input,textarea')) { ev.preventDefault(); ev.stopPropagation(); teclas.add(MAPA_TECLAS[ev.code]) } }, true);
  addEventListener('keyup', ev => { if (MAPA_TECLAS[ev.code]) teclas.delete(MAPA_TECLAS[ev.code]) }, true);
  addEventListener('blur', () => teclas.clear());
  // mirar arrastrando
  let mira = null;
  renderer.domElement.addEventListener('pointerdown', ev => { if (!paseo) return; mira = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, yaw: paseo.yaw, pitch: paseo.pitch }; try { renderer.domElement.setPointerCapture(ev.pointerId) } catch (e) {} });
  renderer.domElement.addEventListener('pointermove', ev => {
    if (!paseo || !mira || ev.pointerId !== mira.id) return;
    paseo.yaw = mira.yaw + (ev.clientX - mira.x) * 0.006;
    paseo.pitch = Math.max(-0.6, Math.min(0.5, mira.pitch - (ev.clientY - mira.y) * 0.004));
    UI.classList.add('usado');
  });
  const finMira = ev => { if (mira && ev.pointerId === mira.id) mira = null };
  renderer.domElement.addEventListener('pointerup', finMira); renderer.domElement.addEventListener('pointercancel', finMira);

  const RADIO = 0.2;
  function libre(x, y) {
    if (y < 0) { if (y < -1.45 || x < g.caja.x0 - 2.5 || x > g.caja.x1 + 2.5) return false }   // en la vereda
    else for (const mu of g.muros) { if (mu.abierto) continue; if ((x - mu.p[0]) * mu.out[0] + (y - mu.p[1]) * mu.out[1] > -RADIO) return false }
    for (const o of cb.items ? cb.items() : []) {
      if (o.x == null || (o.e || 0) > 1.2 || o.h < 0.12) continue;    // lo colgado alto y lo que está a ras del piso no estorba
      const c = Math.cos(rad(o.rot || 0)), sn = Math.sin(rad(o.rot || 0)), dx = x - o.x, dy = y - o.y;
      const lx = dx * c + dy * sn, ly = -dx * sn + dy * c;
      const qx = Math.max(-o.w / 2, Math.min(o.w / 2, lx)), qy = Math.max(-o.d / 2, Math.min(o.d / 2, ly));
      if (Math.hypot(lx - qx, ly - qy) < RADIO) return false;
    }
    return true;
  }
  // la cámara puede quedar sobre la vereda o la pista, pero no detrás de una pared
  function camLibre(x, y) {
    if (y < 0) return y > -8 && x > g.caja.x0 - 4 && x < g.caja.x1 + 4;
    for (const mu of g.muros) { if (mu.abierto) continue; if ((x - mu.p[0]) * mu.out[0] + (y - mu.p[1]) * mu.out[1] > -0.12) return false }
    return true;
  }
  function entrar() {
    if (paseo) return;
    const avatar = construirModelo({ k: 'persona', w: 0.5, d: 0.3, h: 1.7, c: '#a8b8d8' });
    const visera = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.08), new THREE.MeshStandardMaterial({ color: '#2f6fdb' }));
    visera.position.set(0, 1.62, -0.12); avatar.add(visera);
    escena.add(avatar);
    paseo = { x: (g.A[0] + g.B[0]) / 2, y: -0.75, yaw: 0, pitch: -0.05, ojos: false, avatar, t: performance.now() };
    ctl.enabled = false; UI.hidden = false; UI.classList.remove('usado'); UI.querySelector('[data-a="ojos"] span').textContent = 'Sus ojos';
    if (cb.paseo) cb.paseo(true);
    sucio = true;
  }
  function salir(volver) {
    if (!paseo) return;
    escena.remove(paseo.avatar); paseo = null; teclas.clear(); mira = null;
    ctl.enabled = true; UI.hidden = true;
    if (cb.paseo) cb.paseo(false);
    if (volver) vista('iso');
  }
  function andar(now) {
    const dt = Math.min(0.1, (now - paseo.t) / 1000); paseo.t = now;
    const giro = (teclas.has('r') ? 1 : 0) - (teclas.has('l') ? 1 : 0), paso = (teclas.has('f') ? 1 : 0) - (teclas.has('b') ? 0.7 : 0);
    if (giro || paso) UI.classList.add('usado');
    paseo.yaw += giro * 1.7 * dt;
    if (paso) {
      const v = paso * 1.15 * dt, nx = paseo.x + Math.sin(paseo.yaw) * v, ny = paseo.y + Math.cos(paseo.yaw) * v;
      if (libre(nx, ny)) { paseo.x = nx; paseo.y = ny }
      else if (libre(nx, paseo.y)) paseo.x = nx;       // se desliza junto a la pared
      else if (libre(paseo.x, ny)) paseo.y = ny;
    }
    const fx = Math.sin(paseo.yaw), fy = Math.cos(paseo.yaw);
    paseo.avatar.position.set(paseo.x, 0, -paseo.y); paseo.avatar.rotation.y = -paseo.yaw;
    if (paseo.ojos) {
      camara.position.set(paseo.x, 1.58, -paseo.y);
    } else {
      let d = 1.9;                                        // detrás del muñequito, sin meterse en la pared
      while (d > 0.45 && !camLibre(paseo.x - fx * d, paseo.y - fy * d)) d -= 0.1;
      camara.position.set(paseo.x - fx * d, 2.05 + (1.9 - d) * 0.25, -(paseo.y - fy * d));
    }
    const ly = (paseo.ojos ? 1.58 : 1.05) + Math.tan(paseo.pitch) * 2.5;
    camara.lookAt(paseo.x + fx * 2.5, ly, -(paseo.y + fy * 2.5));
    renderer.render(escena, camara); sucio = false;
  }

  function bucle(now) {
    if (!visible) return;
    requestAnimationFrame(bucle);
    if (paseo) { andar(now || performance.now()); return }
    if (ctl.update() || sucio) { renderer.render(escena, camara); sucio = false }
    moverEtiqueta();
  }

  return {
    armarCasa, ponerMuebles, vista, alturaMuros,
    get altoMuros() { return altoMuros },
    tema() { escena.background = new THREE.Color(fondo()); sucio = true },
    mostrar(on) { const antes = visible; visible = on; if (!on && paseo) salir(false); if (on && !antes) { tam(); sucio = true; requestAnimationFrame(bucle) } },
    get caminando() { return !!paseo },
    get dondeCamina() { return paseo ? [+paseo.x.toFixed(2), +paseo.y.toFixed(2)] : null },
    salirPaseo() { salir(true) },
    foto() { renderer.render(escena, camara); return renderer.domElement.toDataURL('image/png') }
  };
}
