/* Vista 2D (SVG) en metros. El portón (AB) queda arriba, como en el croquis. */
import { anilloMuros, esquinas, ETQ } from './plano.js?v=1.2.3';

const NS = 'http://www.w3.org/2000/svg';
const f2 = n => n.toFixed(2);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function crearVista2D(svg, cb) {
  const capa = document.createElementNS(NS, 'g');
  svg.appendChild(capa);
  let g = null, plano = null, items = [], estados = {}, sel = null, medir = null;
  const cam = { cx: 0, cy: 0, s: 60 }; // s = píxeles por metro

  function encuadrar() {
    if (!g) return;
    const W = svg.clientWidth || 300, H = svg.clientHeight || 300;
    const mx = 1.0, my = 1.0;
    const y0 = Math.min(g.caja.y0, -2.6);                     // que se vea el borde de la vereda (la calle)
    const w = g.caja.x1 - g.caja.x0 + mx * 2, h = g.caja.y1 - y0 + my * 2;
    cam.s = Math.min(W / w, H / h);
    cam.cx = (g.caja.x0 + g.caja.x1) / 2; cam.cy = (y0 + g.caja.y1) / 2;
    aplicarCam();
  }
  function aplicarCam() {
    const W = svg.clientWidth || 300, H = svg.clientHeight || 300;
    svg.setAttribute('viewBox', `${cam.cx - W / 2 / cam.s} ${cam.cy - H / 2 / cam.s} ${W / cam.s} ${H / cam.s}`);
    dibujar();
  }
  const aPlano = ev => {
    const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY;
    const q = p.matrixTransform(svg.getScreenCTM().inverse()); return [q.x, q.y];
  };

  function glifo(o) {
    const w = o.w, d = o.d, hw = w / 2, hd = d / 2, k = o.k;
    const r = (x, y, ww, hh, cls = 'gl', rx = 0) => `<rect class="${cls}" x="${f2(x)}" y="${f2(y)}" width="${f2(ww)}" height="${f2(hh)}" rx="${rx}"/>`;
    const l = (x1, y1, x2, y2, cls = 'gl') => `<line class="${cls}" x1="${f2(x1)}" y1="${f2(y1)}" x2="${f2(x2)}" y2="${f2(y2)}"/>`;
    const c = (x, y, rr, cls = 'gl') => `<circle class="${cls}" cx="${f2(x)}" cy="${f2(y)}" r="${f2(rr)}"/>`;
    const silla = (x, y, giro) => `<g transform="translate(${f2(x)} ${f2(y)}) rotate(${giro})">${r(-0.2, -0.2, 0.4, 0.4, 'gl2', 0.04)}${l(-0.2, 0.18, 0.2, 0.18, 'gl3')}</g>`;
    switch (k) {
      case 'estante': return l(-hw, -hd + d * 0.33, hw, -hd + d * 0.33) + l(-hw, -hd + d * 0.66, hw, -hd + d * 0.66);
      case 'gondola': return l(-hw, 0, hw, 0, 'gl3') + l(-hw, -hd / 2, hw, -hd / 2) + l(-hw, hd / 2, hw, hd / 2);
      case 'mostrador': case 'caja': case 'balanza': return r(-hw + 0.04, -hd + 0.04, w - 0.08, d - 0.08);
      case 'vitrina': case 'vitrinav': return r(-hw + 0.04, -hd + 0.04, w - 0.08, d - 0.08) + l(-hw + 0.04, -hd + 0.04, hw - 0.04, hd - 0.04);
      case 'refri': case 'refrigeradora': return r(-hw + 0.03, -hd + 0.02, w - 0.06, 0.06, 'gl3');
      case 'congeladora': return r(-hw + 0.05, -hd + 0.05, w - 0.1, d - 0.1) + l(0, -hd + 0.05, 0, hd - 0.05);
      case 'mesa': case 'escritorio': case 'mesatec': return r(-hw + 0.03, -hd + 0.03, w - 0.06, d - 0.06);
      case 'mesa2s': return r(-0.35, -0.35, 0.7, 0.7, 'gl') + silla(0, -0.55, 180) + silla(0, 0.55, 0);
      case 'mesar2s': return c(0, 0, 0.3) + silla(0, -0.5, 180) + silla(0, 0.5, 0);
      case 'comedor': return r(-hw, -0.4, w, 0.8) + silla(-0.28, -0.5, 180) + silla(0.28, -0.5, 180) + silla(-0.28, 0.5, 0) + silla(0.28, 0.5, 0);
      case 'reunion': return r(-hw, -0.45, w, 0.9) + [-0.6, 0, 0.6].map(x => silla(x, -0.72, 180) + silla(x, 0.72, 0)).join('');
      case 'silla': case 'sillaofi': return l(-hw + 0.04, hd - 0.05, hw - 0.04, hd - 0.05, 'gl3');
      case 'taburete': case 'tacho': case 'planta': case 'persona': return c(0, 0, Math.min(hw, hd) * 0.8);
      case 'sofa': return r(-hw, hd - 0.2, w, 0.2, 'gl2') + r(-hw, -hd, 0.18, d, 'gl2') + r(hw - 0.18, -hd, 0.18, d, 'gl2');
      case 'cama': return r(-hw, hd - 0.06, w, 0.06, 'gl3') + r(-hw + 0.08, hd - 0.45, w / 2 - 0.12, 0.33, 'gl2', 0.05) + r(0.04, hd - 0.45, w / 2 - 0.12, 0.33, 'gl2', 0.05) + l(-hw, -hd + d * 0.45, hw, -hd + d * 0.45);
      case 'inodoro': return r(-hw, hd - 0.17, w, 0.17) + `<ellipse class="gl" cx="0" cy="${f2(-0.085)}" rx="${f2(hw - 0.02)}" ry="${f2((d - 0.17) / 2 - 0.02)}"/>`;
      case 'lavatorio': return `<ellipse class="gl" cx="0" cy="${f2(-0.02)}" rx="${f2(hw - 0.06)}" ry="${f2(hd - 0.08)}"/>`;
      case 'bano': {
        const t = 0.1, pw = 0.7;
        const ino = `<g transform="translate(${f2(-hw + t + 0.25)} ${f2(hd - t - 0.33)})"><rect class="gl" x="-0.185" y="-0.33" width="0.37" height="0.66" fill="none" opacity="0"/>${glifo({ k: 'inodoro', w: 0.37, d: 0.66 })}</g>`;
        const lav = `<g transform="translate(${f2(hw - t - 0.205)} ${f2(hd - t - 0.4)}) rotate(-90)"><rect class="gl" x="-0.255" y="-0.205" width="0.51" height="0.41"/>${glifo({ k: 'lavatorio', w: 0.51, d: 0.41 })}</g>`;
        const mur = r(-hw, -hd, t, d, 'muroB') + r(hw - t, -hd, t, d, 'muroB') + r(-hw, hd - t, w, t, 'muroB') + r(-hw, -hd, w - t - pw, t, 'muroB');
        const arco = `<path class="gl3" d="M${f2(hw - t - pw)} ${f2(-hd)}A${pw} ${pw} 0 0 1 ${f2(hw - t)} ${f2(-hd - pw)}V${f2(-hd)}" fill="none" opacity=".45"/>`;
        return mur + arco + ino + lav;
      }
      case 'puestob': return r(-hw, hd - 0.4, w, 0.4, 'gl2') + r(-hw + 0.1, hd - 0.04, w - 0.2, 0.03, 'gl3') + c(0, -hd + 0.325, 0.26) + r(-0.25, -hd + 0.05, 0.5, 0.45, 'gl', 0.06);
      case 'sillonb': return r(-hw, -hd, w, d, 'gl', 0.06) + r(-hw, hd - 0.1, w, 0.1, 'gl2');
      case 'tocador': return r(-hw + 0.1, hd - 0.04, w - 0.2, 0.03, 'gl3');
      case 'lavacab': return c(0, hd - 0.22, 0.18) + r(-hw, -hd, w, d - 0.45, 'gl2', 0.05);
      case 'perchero': case 'barrap': return l(-hw, 0, hw, 0, 'gl3') + Array.from({ length: 6 }, (_, i) => l(-hw + 0.1 + i * (w - 0.2) / 5, -hd * 0.7, -hw + 0.1 + i * (w - 0.2) / 5, hd * 0.7)).join('');
      case 'probador': return `<path class="gl3" d="M${f2(-hw)} ${f2(-hd)}V${f2(hd)}H${f2(hw)}V${f2(-hd)}" fill="none"/>` + l(-hw, -hd + 0.03, hw, -hd + 0.03, 'gl4');
      case 'jaula': return Array.from({ length: 4 }, (_, i) => l(-hw + (i + 1) * w / 5, -hd, -hw + (i + 1) * w / 5, hd)).join('');
      case 'camilla': return r(-hw + 0.03, -hd + 0.03, 0.4, d - 0.06, 'gl2', 0.04);
      case 'biombo': return `<path class="gl3" d="M${f2(-hw)} 0L${f2(-w / 6)} ${f2(-hd)}L${f2(w / 6)} ${f2(hd)}L${f2(hw)} 0" fill="none"/>`;
      case 'escalonado': return l(-hw, -hd + d / 3, hw, -hd + d / 3) + l(-hw, -hd + 2 * d / 3, hw, -hd + 2 * d / 3);
      case 'jabas': return r(-hw + 0.04, -hd + 0.04, w - 0.08, d - 0.08);
      case 'barracafe': return r(-hw + 0.05, -hd + 0.03, Math.min(0.77, w * 0.45), d - 0.06, 'gl2');
      case 'cocina': return [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => c(a * w / 4, b * d / 4, 0.07)).join('');
      case 'lavadero': return r(-w * 0.42, -hd + 0.08, w * 0.45, d * 0.6, 'gl', 0.04);
      case 'ropero': case 'archivador': return l(0, -hd, 0, hd);
      default: return '';
    }
  }

  function dibujar() {
    if (!g) { capa.innerHTML = ''; return }
    const s = cam.s, fs = 12 / s, fsL = 11 / s;
    let h = '';
    // cuadrícula
    const m = 30;
    const x0 = Math.floor(g.caja.x0 - m), x1 = Math.ceil(g.caja.x1 + m), y0 = Math.floor(g.caja.y0 - m), y1 = Math.ceil(g.caja.y1 + m);
    let d1 = '', d2 = '';
    for (let x = x0; x <= x1; x += 0.5) (Number.isInteger(x) ? d2 += `M${x} ${y0}V${y1}` : d1 += `M${x} ${y0}V${y1}`);
    for (let y = y0; y <= y1; y += 0.5) (Number.isInteger(y) ? d2 += `M${x0} ${y}H${x1}` : d1 += `M${x0} ${y}H${x1}`);
    h += `<path class="g1" d="${d1}"/><path class="g2" d="${d2}"/>`;
    // calle
    // vereda (1.60 m), borde de la vereda, pista (7 m) con su línea al medio y el nombre de la calle; igual que en 3D
    h += `<rect class="vereda" x="${x0}" y="-1.6" width="${x1 - x0}" height="1.6"/>`;
    h += `<rect class="calle" x="${x0}" y="-8.6" width="${x1 - x0}" height="7"/>`;
    h += `<line class="borde" x1="${x0}" y1="-1.6" x2="${x1}" y2="-1.6"/><line class="eje" x1="${x0}" y1="-5.1" x2="${x1}" y2="-5.1"/>`;
    h += `<text class="tcalle" x="${f2((g.A[0] + g.B[0]) / 2)}" y="-2.2" font-size="${f2(fs * 1.1)}">${esc(plano.calle || 'Calle')}</text>`;
    // piso y muros
    h += `<polygon class="piso" points="${g.pts.map(p => p.map(f2).join(',')).join(' ')}"/>`;
    h += `<polygon class="muro" points="${anilloMuros(g, plano.muro).map(p => p.map(f2).join(',')).join(' ')}"/>`;
    h += `<line class="porton" x1="${f2(g.A[0])}" y1="${f2(g.A[1])}" x2="${f2(g.B[0])}" y2="${f2(g.B[1])}"/>`;
    // cotas de muros
    for (const mu of g.muros) {
      const sep = plano.muro + (mu.abierto ? 46 : 22) / s;   // la del portón, más arriba para no chocar con las letras A y B
      const mx = (mu.p[0] + mu.q[0]) / 2 + mu.out[0] * sep, my = (mu.p[1] + mu.q[1]) / 2 + mu.out[1] * sep;
      let a = Math.atan2(mu.u[1], mu.u[0]) * 180 / Math.PI; if (a > 90 || a < -90) a += 180;
      h += `<text class="cota" font-size="${f2(fs)}" transform="translate(${f2(mx)} ${f2(my)}) rotate(${a.toFixed(2)})" dy=".35em">${mu.et} = ${mu.L.toFixed(2)} m${mu.abierto ? ' · portón' : ''}</text>`;
    }
    for (const [n, p] of Object.entries({ A: g.A, B: g.B, C: g.C, D: g.D })) {
      const v = [p[0] - g.centro[0], p[1] - g.centro[1]], L = Math.hypot(...v);
      const q = [p[0] + v[0] / L * (plano.muro + 26 / s), p[1] + v[1] / L * (plano.muro + 26 / s)];
      h += `<text class="vert" x="${f2(q[0])}" y="${f2(q[1])}" font-size="${f2(fs * 1.25)}" dy=".35em">${ETQ[n]}</text>`;
      const qa = [p[0] - v[0] / L * 36 / s, p[1] - v[1] / L * 36 / s];
      h += `<text class="ang" x="${f2(qa[0])}" y="${f2(qa[1])}" font-size="${f2(fsL * 0.9)}" dy=".35em">${g.ang[n].toFixed(2)}°</text>`;
    }
    // muebles: primero los del piso, luego los colgados
    const orden = items.filter(o => o.x != null).sort((a, b) => (a.e > 0.3) - (b.e > 0.3) || (a.uid === sel) - (b.uid === sel));
    let textos = '';
    for (const o of orden) {
      const est = estados[o.uid] || 'ok';
      const cls = ['mb', est !== 'ok' ? 'mal' : '', o.uid === sel ? 'sel' : '', o.e > 0.3 ? 'colgado' : ''].join(' ');
      h += `<g class="${cls}" data-uid="${o.uid}" transform="translate(${f2(o.x)} ${f2(o.y)}) rotate(${(o.rot || 0).toFixed(2)})">` +
        `<rect class="cu" x="${f2(-o.w / 2)}" y="${f2(-o.d / 2)}" width="${f2(o.w)}" height="${f2(o.d)}" fill="${o.c}" rx="${o.k === 'bano' ? 0 : 0.02}"/>` +
        glifo(o) +
        (o.k !== 'bano' ? `<line class="frente" x1="${f2(-o.w / 2 + 0.02)}" y1="${f2(-o.d / 2)}" x2="${f2(o.w / 2 - 0.02)}" y2="${f2(-o.d / 2)}"/>` : '') +
        `</g>`;
      // nombre horizontal, si cabe
      const ancho = Math.min(o.w, o.d) * s;
      if (ancho > 26 || o.uid === sel) {
        const t = o.n.length > 18 && o.uid !== sel ? o.n.slice(0, 16) + '…' : o.n;
        const tam = Math.min(fs, Math.max(o.w, o.d) * 0.9 / Math.max(4, t.length) * 1.7);
        textos += `<text class="nom${o.uid === sel ? ' nsel' : ''}" x="${f2(o.x)}" y="${f2(o.y)}" font-size="${f2(o.uid === sel ? fs : tam)}" dy=".35em">${esc(t)}</text>`;
      }
    }
    h += textos;
    // mueble elegido: medidas y asa para girar
    const o = sel && items.find(i => i.uid === sel && i.x != null);
    if (o) {
      const q = esquinas(o);
      const fijo = cb.fijo && cb.fijo();
      const cotar = (p1, p2, txt) => {
        const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
        const v = [mx - o.x, my - o.y], L = Math.hypot(...v) || 1, off = 14 / s;
        let a = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI; if (a > 90 || a < -90) a += 180;
        return `<text class="cotasel" font-size="${f2(fsL)}" transform="translate(${f2(mx + v[0] / L * off)} ${f2(my + v[1] / L * off)}) rotate(${a.toFixed(2)})" dy=".35em">${txt}</text>`;
      };
      h += cotar(q[0], q[1], `${Math.round(o.w * 100)} cm`) + cotar(q[1], q[2], `${Math.round(o.d * 100)} cm`);
      const rr = 0.32 + 10 / s;
      if (!fijo) h += `<g transform="translate(${f2(o.x)} ${f2(o.y)}) rotate(${(o.rot || 0).toFixed(2)})"><line class="asa" x1="0" y1="${f2(-o.d / 2)}" x2="0" y2="${f2(-o.d / 2 - rr)}"/>` +
        `<circle class="giro" data-giro="1" cx="0" cy="${f2(-o.d / 2 - rr)}" r="${f2(11 / s)}"/>` +
        `<path class="giroi" transform="translate(0 ${f2(-o.d / 2 - rr)}) scale(${f2(1 / s)})" d="M-4.5 1.5a4.7 4.7 0 1 0 1.6-5.2M-3.5-6.2l.6 2.6 2.6-.7"/></g>`;
    }
    // regla
    if (medir && medir.a) {
      const b = medir.b || medir.a;
      const dd = Math.hypot(b[0] - medir.a[0], b[1] - medir.a[1]);
      h += `<line class="regla" x1="${f2(medir.a[0])}" y1="${f2(medir.a[1])}" x2="${f2(b[0])}" y2="${f2(b[1])}"/>`;
      h += `<circle class="reglap" cx="${f2(medir.a[0])}" cy="${f2(medir.a[1])}" r="${f2(5 / s)}"/>`;
      if (medir.b) h += `<circle class="reglap" cx="${f2(b[0])}" cy="${f2(b[1])}" r="${f2(5 / s)}"/><text class="reglat" font-size="${f2(fs * 1.1)}" x="${f2((medir.a[0] + b[0]) / 2)}" y="${f2((medir.a[1] + b[1]) / 2 - 14 / s)}">${dd.toFixed(2)} m</text>`;
    }
    capa.innerHTML = h;
    if (cb.dibujado) cb.dibujado();
  }

  // Interacción
  const ptrs = new Map();
  let modo = null; // {tipo:'mover'|'girar'|'pan'|'pinch', ...}
  svg.addEventListener('pointerdown', ev => {
    if (ev.button > 0) return;
    ptrs.set(ev.pointerId, [ev.clientX, ev.clientY]);
    try { svg.setPointerCapture(ev.pointerId) } catch (e) {}
    if (ptrs.size === 2) {
      if (modo && modo.tipo === 'mover' && modo.mov) cb.arrastrar(modo.uid, null, null, 'fin');
      const [a, b] = [...ptrs.values()];
      modo = { tipo: 'pinch', d0: Math.hypot(a[0] - b[0], a[1] - b[1]), s0: cam.s, c0: [cam.cx, cam.cy], m0: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] };
      return;
    }
    const p = aPlano(ev), t = ev.target;
    if (medir) { modo = { tipo: 'medir', x: ev.clientX, y: ev.clientY, p }; return }
    if (t.dataset && t.dataset.giro && sel) { modo = { tipo: 'girar', uid: sel }; return }
    const grupo = t.closest && t.closest('[data-uid]');
    if (grupo && cb.fijo && cb.fijo()) {
      const u = grupo.dataset.uid;
      if (sel !== u) cb.seleccionar(u);
      modo = { tipo: 'pan', x: ev.clientX, y: ev.clientY, c0: [cam.cx, cam.cy], mov: false, sobre: u };
      return;
    }
    if (grupo) {
      const o = cb.item(grupo.dataset.uid);
      modo = { tipo: 'mover', uid: o.uid, dx: o.x - p[0], dy: o.y - p[1], x: ev.clientX, y: ev.clientY, mov: false };
      if (sel !== o.uid) cb.seleccionar(o.uid);
      return;
    }
    modo = { tipo: 'pan', x: ev.clientX, y: ev.clientY, c0: [cam.cx, cam.cy], mov: false };
  });
  svg.addEventListener('pointermove', ev => {
    if (!ptrs.has(ev.pointerId)) return;
    ptrs.set(ev.pointerId, [ev.clientX, ev.clientY]);
    if (!modo) return;
    if (modo.tipo === 'pinch' && ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      const dn = Math.hypot(a[0] - b[0], a[1] - b[1]);
      cam.s = Math.max(15, Math.min(900, modo.s0 * dn / modo.d0));
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      cam.cx = modo.c0[0] - (m[0] - modo.m0[0]) / cam.s; cam.cy = modo.c0[1] - (m[1] - modo.m0[1]) / cam.s;
      aplicarCam(); return;
    }
    if (modo.tipo === 'pan') {
      if (!modo.mov && Math.hypot(ev.clientX - modo.x, ev.clientY - modo.y) < 4) return;
      if (!modo.mov && modo.sobre && cb.avisoFijo) cb.avisoFijo();
      modo.mov = true;
      cam.cx = modo.c0[0] - (ev.clientX - modo.x) / cam.s; cam.cy = modo.c0[1] - (ev.clientY - modo.y) / cam.s;
      aplicarCam(); return;
    }
    if (modo.tipo === 'medir') { if (medir.a && !medir.b) { medir.tmp = aPlano(ev) } return }
    const p = aPlano(ev);
    if (modo.tipo === 'mover') {
      if (!modo.mov && Math.hypot(ev.clientX - modo.x, ev.clientY - modo.y) < 3) return;
      modo.mov = true;
      cb.arrastrar(modo.uid, p[0] + modo.dx, p[1] + modo.dy, 'mueve');
    } else if (modo.tipo === 'girar') {
      const o = cb.item(modo.uid);
      const a = Math.atan2(p[1] - o.y, p[0] - o.x) * 180 / Math.PI + 90;
      cb.girar(modo.uid, a);
    }
  });
  const fin = ev => {
    ptrs.delete(ev.pointerId);
    if (!modo) return;
    if (modo.tipo === 'pinch') { if (ptrs.size < 2) modo = null; return }
    if (modo.tipo === 'mover' && modo.mov) cb.arrastrar(modo.uid, null, null, 'fin');
    if (modo.tipo === 'girar') cb.girar(modo.uid, null, 'fin');
    if (modo.tipo === 'pan' && !modo.mov && !modo.sobre && ev.type === 'pointerup') cb.seleccionar(null);
    if (modo.tipo === 'medir' && ev.type === 'pointerup') {
      const p = modo.p;
      if (!medir.a || medir.b) { medir.a = p; medir.b = null } else medir.b = p;
      dibujar(); cb.medida && cb.medida(medir.b ? Math.hypot(medir.b[0] - medir.a[0], medir.b[1] - medir.a[1]) : null);
    }
    modo = null;
  };
  svg.addEventListener('pointerup', fin);
  svg.addEventListener('pointercancel', fin);
  svg.addEventListener('wheel', ev => {
    ev.preventDefault();
    const p = aPlano(ev);
    const k = Math.exp(-ev.deltaY * (ev.ctrlKey ? 0.01 : 0.0015));
    const s1 = Math.max(15, Math.min(900, cam.s * k));
    cam.cx = p[0] - (p[0] - cam.cx) * cam.s / s1; cam.cy = p[1] - (p[1] - cam.cy) * cam.s / s1; cam.s = s1;
    aplicarCam();
  }, { passive: false });
  new ResizeObserver(() => aplicarCam()).observe(svg);

  return {
    poner(geo, p, lista, est, s) { const nuevo = !g; g = geo; plano = p; items = lista; estados = est; sel = s; if (nuevo) encuadrar(); else dibujar() },
    encuadrar,
    zoom(k) { cam.s = Math.max(15, Math.min(900, cam.s * k)); aplicarCam() },
    medir(on) { medir = on ? {} : null; dibujar() },
    get midiendo() { return !!medir },
    rectDe(u) { const el = u && capa.querySelector(`[data-uid="${u}"] .cu`); return el ? el.getBoundingClientRect() : null },
    redibujar: () => dibujar()
  };
}
