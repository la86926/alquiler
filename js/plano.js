/* Geometría del terreno, choques entre muebles y acomodo automático. Todo en metros.
   El terreno ABCD es la mitad derecha del croquis completo: el nuevo A está sobre el AB del croquis con AB = 2.40 m
   y el nuevo D sobre su DC con CD = 2.40 m; los ángulos en B y C son los del croquis.
   Plano: A arriba a la izquierda, B arriba a la derecha (AB = portón, paralelo a la calle).
   x crece hacia la derecha, y crece hacia adentro de la casa (hacia el fondo NC). */

// Croquis completo ABCD (antes): de aquí salen M y N
export const CROQUIS = { AB: 4.55, BC: 6.55, CD: 4.58, DA: 5.48, AC: 6.90 };
// AB, BC, CD, DA y la diagonal AC (DA y AC calculadas con los ángulos del croquis)
export const PLANO_INICIAL = { AB: 2.40, BC: 6.55, CD: 2.40, DA: 5.984, AC: 6.342, muro: 0.15, alto: 2.8 };
export const ETQ = { A: 'A', B: 'B', C: 'C', D: 'D' };
// ¿Es el plano guardado el croquis viejo (terreno completo)?
export const esCroquisViejo = p => !!p && ['AB', 'BC', 'CD', 'DA', 'AC'].every(k => Math.abs((p[k] || 0) - CROQUIS[k]) < 0.005);

const rad = g => g * Math.PI / 180, deg = r => r * 180 / Math.PI;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = v => Math.hypot(v[0], v[1]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];

function angulo(p, q, r) {
  const v = sub(p, q), w = sub(r, q);
  return deg(Math.acos(Math.max(-1, Math.min(1, dot(v, w) / len(v) / len(w)))));
}
function cos3(a, b, c) { return (a * a + b * b - c * c) / (2 * a * b) } // ángulo opuesto a c

// Construye el cuadrilátero a partir de los 4 lados y la diagonal AC (dos triángulos LLL)
export function construir(p) {
  const { AB, BC, CD, DA, AC } = p;
  const ok = (a, b, c) => a + b > c + 1e-9 && a + c > b + 1e-9 && b + c > a + 1e-9;
  if (!ok(AB, BC, AC) || !ok(DA, CD, AC)) return null;
  const a1 = Math.acos(cos3(AB, AC, BC)), a2 = Math.acos(cos3(DA, AC, CD));
  const A = [0, 0], B = [AB, 0], C = [AC * Math.cos(a1), AC * Math.sin(a1)], D = [DA * Math.cos(a1 + a2), DA * Math.sin(a1 + a2)];
  const pts = [A, B, C, D];
  let s = 0;
  for (let i = 0; i < 4; i++) s += cross(pts[i], pts[(i + 1) % 4]);
  const area = Math.abs(s) / 2;
  const ang = { A: angulo(D, A, B), B: angulo(A, B, C), C: angulo(B, C, D), D: angulo(C, D, A) };
  const muros = [
    { id: 'AB', n: 'Portón', p: A, q: B, abierto: true },
    { id: 'BC', n: 'Pared derecha', p: B, q: C },
    { id: 'CD', n: 'Pared del fondo', p: C, q: D },
    { id: 'DA', n: 'Pared izquierda', p: D, q: A }
  ];
  const sg = Math.sign(s) || 1; // orientación (en este plano es horaria en pantalla)
  for (const m of muros) {
    m.et = ETQ[m.id[0]] + ETQ[m.id[1]];
    const v = sub(m.q, m.p), L = len(v);
    m.L = L; m.u = [v[0] / L, v[1] / L];
    m.out = sg > 0 ? [m.u[1], -m.u[0]] : [-m.u[1], m.u[0]]; // normal hacia afuera
    m.inn = [-m.out[0], -m.out[1]];
    m.rot = ((deg(Math.atan2(m.out[1], m.out[0])) - 90) % 360 + 360) % 360; // giro de un mueble con la espalda en este muro
  }
  const cx = pts.reduce((t, q) => t + q[0], 0) / 4, cy = pts.reduce((t, q) => t + q[1], 0) / 4;
  const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
  return {
    pts, A, B, C, D, area, ang, muros, centro: [cx, cy], BD: len(sub(D, B)),
    caja: { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
  };
}

/* Pone un mueble según una distribución guardada (ver catalogo.js):
   s.m = muro donde va la espalda ('BC', 'DA' o 'CD'), con s.u (fondo desde el portón) o s.t (distancia desde el inicio del muro);
   sin s.m, libre con s.u y s.v (distancia desde la pared derecha). s.r = giro extra. */
export function colocar(g, o, s) {
  const BC = g.muros[1], r = s.r || 0;
  const deLado = Math.abs(((r % 180) + 180) % 180 - 90) < 1;
  const giro = a => +((((a) % 360) + 360) % 360).toFixed(2);
  if (s.m) {
    const mu = g.muros.find(m => m.id === s.m);
    let t;
    if (s.u != null) { const pu = dot(sub(mu.p, g.B), BC.u); t = (s.u - pu) / dot(mu.u, BC.u) }
    else t = s.t < 0 ? mu.L + s.t : s.t;
    const k = (deLado ? o.w : o.d) / 2 + (s.sep ?? 0.003);
    o.x = mu.p[0] + mu.u[0] * t + mu.inn[0] * k; o.y = mu.p[1] + mu.u[1] * t + mu.inn[1] * k; o.rot = giro(mu.rot + r);
  } else {
    o.x = g.B[0] + BC.u[0] * s.u + BC.inn[0] * s.v; o.y = g.B[1] + BC.u[1] * s.u + BC.inn[1] * s.v; o.rot = giro(BC.rot + r);
  }
  o.x = +o.x.toFixed(4); o.y = +o.y.toFixed(4);
  return o;
}

// Polígono exterior de los muros (BC, CD, DA), sin muro en AB
export function anilloMuros(g, t) {
  const off = m => [m.p[0] + m.out[0] * t, m.p[1] + m.out[1] * t];
  const inter = (p1, d1, p2, d2) => { const c = cross(d1, d2); if (Math.abs(c) < 1e-9) return p1; const k = cross(sub(p2, p1), d2) / c; return [p1[0] + d1[0] * k, p1[1] + d1[1] * k] };
  const [AB, BC, CD, DA] = g.muros;
  const Bx = inter(off(BC), BC.u, g.A, AB.u);
  const Cx = inter(off(BC), BC.u, off(CD), CD.u);
  const Dx = inter(off(CD), CD.u, off(DA), DA.u);
  const Ax = inter(off(DA), DA.u, g.A, AB.u);
  return [g.A, Ax, Dx, Cx, Bx, g.B, g.C, g.D];
}

// Esquinas del rectángulo de un mueble (x, y = centro; rot en grados; w ancho, d fondo)
export function esquinas(o, extra = 0) {
  const c = Math.cos(rad(o.rot || 0)), s = Math.sin(rad(o.rot || 0));
  const hw = o.w / 2 + extra, hd = o.d / 2 + extra;
  return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([a, b]) => [o.x + a * c - b * s, o.y + a * s + b * c]);
}

const ejes = q => [sub(q[1], q[0]), sub(q[3], q[0])];
function separados(p, q) {
  for (const ax of [...ejes(p), ...ejes(q)]) {
    let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
    for (const v of p) { const k = dot(v, ax); a0 = Math.min(a0, k); a1 = Math.max(a1, k) }
    for (const v of q) { const k = dot(v, ax); b0 = Math.min(b0, k); b1 = Math.max(b1, k) }
    const tol = 0.004 * len(ax);
    if (a1 <= b0 + tol || b1 <= a0 + tol) return true;
  }
  return false;
}
export const chocanAltura = (a, b) => (a.e || 0) < (b.e || 0) + b.h - 0.005 && (b.e || 0) < (a.e || 0) + a.h - 0.005;
export function chocan(a, b, extra = 0) {
  if (!chocanAltura(a, b)) return false;
  return !separados(esquinas(a, extra), esquinas(b, extra));
}

// dentro del polígono convexo (con margen m hacia adentro)
export function dentro(g, o, m = 0) {
  const q = esquinas(o);
  for (const mu of g.muros) for (const v of q) if (dot(sub(v, mu.p), mu.out) > -m + 0.003) return false;
  return true;
}

export function distanciaMuros(g, o) {
  const q = esquinas(o);
  return g.muros.map(mu => ({ id: mu.id, n: mu.n, d: Math.min(...q.map(v => -dot(sub(v, mu.p), mu.out))) }));
}

// Estado de cada mueble colocado: 'ok', 'choca' o 'fuera'
export function revisar(g, items) {
  const r = {};
  const puestos = items.filter(o => o.x != null);
  for (const o of puestos) r[o.uid] = dentro(g, o) ? 'ok' : 'fuera';
  for (let i = 0; i < puestos.length; i++) for (let j = i + 1; j < puestos.length; j++) {
    const a = puestos[i], b = puestos[j];
    if (chocan(a, b)) { if (r[a.uid] === 'ok') r[a.uid] = 'choca'; if (r[b.uid] === 'ok') r[b.uid] = 'choca' }
  }
  for (const o of items) if (o.x == null) r[o.uid] = 'sin';
  return r;
}

const norm = a => ((a % 360) + 540) % 360 - 180;

// Imán: si la espalda del mueble queda cerca de un muro, lo pega y lo alinea
export function iman(g, o, dist = 0.25) {
  let mejor = null;
  for (const mu of g.muros) {
    const dr = Math.abs(norm((o.rot || 0) - mu.rot));
    if (dr > 30) continue;
    const t = dot(sub([o.x, o.y], mu.p), mu.u);
    if (t < -o.w / 2 || t > mu.L + o.w / 2) continue;
    const dc = -dot(sub([o.x, o.y], mu.p), mu.out); // distancia del centro al muro (positivo = adentro)
    const gap = dc - o.d / 2;
    if (gap < -o.d / 2 || gap > dist) continue;
    if (!mejor || Math.abs(gap) < Math.abs(mejor.gap)) mejor = { mu, gap, t };
  }
  if (!mejor) return false;
  const { mu, t } = mejor;
  const k = o.d / 2 + 0.002;
  o.rot = Math.round(mu.rot * 100) / 100;
  o.x = mu.p[0] + mu.u[0] * t + mu.inn[0] * k;
  o.y = mu.p[1] + mu.u[1] * t + mu.inn[1] * k;
  return mu.id;
}

/* Acomodo automático de una lista de muebles (los que no entran quedan sin ubicar, x = null) */
export function acomodar(g, lista, fijos = []) {
  const puestos = fijos.filter(o => o.x != null);
  const libre = (o, holgura) => dentro(g, o, 0) && puestos.every(p => !chocan(o, p, holgura));
  const [AB, BC, CD, DA] = g.muros;
  const enMuro = (o, mu, t) => { const k = o.d / 2 + 0.002; o.rot = mu.rot; o.x = mu.p[0] + mu.u[0] * t + mu.inn[0] * k; o.y = mu.p[1] + mu.u[1] * t + mu.inn[1] * k };

  const orden = { bano: 0, pared: 1, frente: 2, centro: 3 };
  const cola = [...lista].sort((a, b) => (orden[a.z] ?? 1) - (orden[b.z] ?? 1) || b.w * b.d - a.w * a.d);
  for (const o of cola) {
    let ok = false;
    if (o.z === 'bano') {
      // contra el fondo (CD), en la esquina C
      for (let t = 0.01; t < CD.L && !ok; t += 0.02) { enMuro(o, CD, t + o.w / 2); if (libre(o, 0)) ok = true }
    } else if (o.z === 'pared') {
      for (const mu of [CD, DA, BC]) {
        for (let t = o.w / 2 + 0.01; t <= mu.L - o.w / 2 && !ok; t += 0.05) { enMuro(o, mu, t); if (libre(o, 0.01)) ok = true }
        if (ok) break;
      }
    } else if (o.z === 'frente') {
      for (const hol of [0.35, 0.01]) for (let y = 0.6; y < 2.6 && !ok; y += 0.1) for (let x = g.caja.x0; x < g.caja.x1 && !ok; x += 0.05) {
        o.x = x; o.y = y; o.rot = 0;
        if (dentro(g, o, 0.25) && puestos.every(p => !chocan(o, p, hol))) ok = true;
      }
    } else { // centro: de atrás hacia adelante, con pasillos
      const [cx, cy] = g.centro;
      const cand = [];
      for (let y = g.caja.y1; y > g.caja.y0; y -= 0.1) for (let x = g.caja.x0; x < g.caja.x1; x += 0.1) cand.push([x, y]);
      cand.sort((a, b) => Math.abs(a[0] - cx) * 0.6 + (g.caja.y1 - a[1]) * 0.25 - (Math.abs(b[0] - cx) * 0.6 + (g.caja.y1 - b[1]) * 0.25));
      for (const [mg, hol] of [[0.35, 0.3], [0.15, 0.12]]) {
        for (const rot of [0, 90]) {
          for (const [x, y] of cand) {
            o.x = x; o.y = y; o.rot = rot;
            if (dentro(g, o, mg) && puestos.every(p => !chocan(o, p, hol))) { ok = true; break }
          }
          if (ok) break;
        }
        if (ok) break;
      }
    }
    if (ok) { o.x = +o.x.toFixed(3); o.y = +o.y.toFixed(3); puestos.push(o) }
    else { o.x = null; o.y = null }
  }
  return lista;
}

// Punto dentro del polígono más cercano a (x, y) donde cabe el mueble
export function buscarLugar(g, items, o) {
  const otros = items.filter(p => p.x != null && p.uid !== o.uid);
  const [cx, cy] = g.centro;
  const cand = [];
  for (let y = g.caja.y0; y < g.caja.y1; y += 0.1) for (let x = g.caja.x0; x < g.caja.x1; x += 0.1) cand.push([x, y]);
  const ox = o.x ?? cx, oy = o.y ?? cy;
  cand.sort((a, b) => Math.hypot(a[0] - ox, a[1] - oy) - Math.hypot(b[0] - ox, b[1] - oy));
  for (const rot of [o.rot || 0, (o.rot || 0) + 90]) for (const [x, y] of cand) {
    const t = Object.assign({}, o, { x, y, rot });
    if (dentro(g, t) && otros.every(p => !chocan(t, p, 0.02))) { o.x = x; o.y = y; o.rot = rot % 360; return true }
  }
  o.x = cx; o.y = cy; return false;
}

export function areaOcupada(items) {
  return items.filter(o => o.x != null && !(o.e > 0.3)).reduce((t, o) => t + o.w * o.d, 0);
}
