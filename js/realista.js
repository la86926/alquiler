/* Vista 4D: los mismos muebles y medidas que en 3D, pero con acabados reales
   (madera, tela, cuero, piedra, metal, vidrio, porcelanato), bordes redondeados y luz de ambiente.
   Todas las texturas se dibujan aquí mismo: no se descarga ninguna imagen. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/* ---------- utilidades ---------- */
function azar(semilla) {   // números al azar repetibles (mulberry32)
  let a = semilla >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 };
}
const cacheTex = new Map();
function textura(clave, n, dibujar, color = true) {
  if (cacheTex.has(clave)) return cacheTex.get(clave);
  const c = document.createElement('canvas'); c.width = c.height = n;
  dibujar(c.getContext('2d'), n);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  cacheTex.set(clave, t); return t;
}
/* ruido suave que se repite sin costuras (para manchas grandes) */
function ruidoSuave(n, celdas, r) {
  const g = []; for (let i = 0; i < celdas * celdas; i++) g.push(r());
  const v = (i, j) => g[((j % celdas + celdas) % celdas) * celdas + ((i % celdas + celdas) % celdas)];
  const s = t => t * t * (3 - 2 * t);
  return (x, y) => {
    const fx = x / n * celdas, fy = y / n * celdas, i = Math.floor(fx), j = Math.floor(fy), u = s(fx - i), w = s(fy - j);
    return (v(i, j) * (1 - u) + v(i + 1, j) * u) * (1 - w) + (v(i, j + 1) * (1 - u) + v(i + 1, j + 1) * u) * w;
  };
}
function pixeles(x, n, f) {
  const im = x.createImageData(n, n), d = im.data;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const k = (j * n + i) * 4, c = f(i, j); d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = 255 }
  x.putImageData(im, 0, 0);
}
const lim = v => Math.max(0, Math.min(255, v));

/* ---------- texturas ---------- */
// Madera: vetas a lo largo (la imagen es casi blanca; el color lo pone el material)
const texMadera = () => textura('madera', 512, (x, n) => {
  const r = azar(7), m = ruidoSuave(n, 6, r);
  pixeles(x, n, (i, j) => { const v = 238 + m(i, j) * 17; return [v, v, v] });
  for (let k = 0; k < 340; k++) {
    const y0 = r() * n, amp = 0.4 + r() * 2.2, per = 1 + Math.floor(r() * 2), fase = r() * 6.28, a = 0.03 + r() * 0.08;
    x.strokeStyle = `rgba(92,58,28,${a})`; x.lineWidth = 0.4 + r() * 1.8;
    for (const dy of [-n, 0, n]) {
      x.beginPath();
      for (let i = 0; i <= n; i += 8) { const y = y0 + dy + Math.sin(i / n * Math.PI * 2 * per + fase) * amp; i ? x.lineTo(i, y) : x.moveTo(i, y) }
      x.stroke();
    }
  }
});
// Tela: tejido fino
const texTela = () => textura('tela', 256, (x, n) => {
  const r = azar(11), m = ruidoSuave(n, 8, r);
  pixeles(x, n, (i, j) => { const t = ((i >> 1) + (j >> 1)) % 2 ? 9 : -9, v = lim(228 + t + (r() - 0.5) * 16 + m(i, j) * 14); return [v, v, v] });
});
// Cuero: poros y manchas suaves
const texCuero = () => textura('cuero', 256, (x, n) => {
  const r = azar(13), m = ruidoSuave(n, 10, r), m2 = ruidoSuave(n, 32, r);
  pixeles(x, n, (i, j) => { const v = lim(222 + m(i, j) * 22 + m2(i, j) * 14 - (r() < 0.04 ? 18 : 0)); return [v, v, v] });
});
// Piedra (cuarzo de los mostradores): granitos claros y oscuros
const texPiedra = () => textura('piedra', 512, (x, n) => {
  const r = azar(17), m = ruidoSuave(n, 5, r);
  pixeles(x, n, (i, j) => { const v = 238 + m(i, j) * 14; return [v, v - 1, v - 4] });
  for (let k = 0; k < 2600; k++) { const g = r() < 0.6 ? 150 + r() * 60 : 255; x.fillStyle = `rgba(${g},${g - 6},${g - 14},${0.25 + r() * 0.5})`; x.fillRect(r() * n, r() * n, 1 + r() * 2.4, 1 + r() * 2.4) }
});
// Laminado / pintura: casi liso
const texLaminado = () => textura('laminado', 256, (x, n) => {
  const r = azar(19), m = ruidoSuave(n, 6, r);
  pixeles(x, n, (i, j) => { const v = lim(246 + m(i, j) * 8 + (r() - 0.5) * 5); return [v, v, v] });
});
// Metal cepillado (rugosidad): rayitas horizontales
const texCepillado = () => textura('cepillado', 256, (x, n) => {
  const r = azar(23), fila = []; for (let j = 0; j < n; j++) fila.push(110 + r() * 70);
  pixeles(x, n, (i, j) => { const v = lim(fila[j] + (r() - 0.5) * 30); return [v, v, v] });
}, false);
// Piso porcelanato 60 × 60 cm (la imagen mide 1.20 m: cuatro piezas distintas)
export const texPiso = () => textura('piso', 1024, (x, n) => {
  const r = azar(29), m = ruidoSuave(n, 7, r), m2 = ruidoSuave(n, 23, r);
  pixeles(x, n, (i, j) => { const t = ((i < n / 2) ^ (j < n / 2)) ? 3 : -2, v = 236 + t + m(i, j) * 10 + m2(i, j) * 5; return [lim(v), lim(v - 2), lim(v - 6)] });
  for (let k = 0; k < 40; k++) {   // vetas suaves
    x.strokeStyle = `rgba(150,140,128,${0.04 + r() * 0.06})`; x.lineWidth = 0.6 + r() * 1.6;
    let px = r() * n, py = r() * n; x.beginPath(); x.moveTo(px, py);
    for (let s = 0; s < 12; s++) { px += (r() - 0.3) * 60; py += (r() - 0.5) * 40; x.lineTo(px, py) }
    x.stroke();
  }
  x.fillStyle = '#c9c1b5';   // fragua
  for (const p of [0, n / 2]) { x.fillRect(p, 0, 3, n); x.fillRect(0, p, n, 3) }
});
// Pared tarrajeada y pintada
export const texPared = () => textura('pared', 512, (x, n) => {
  const r = azar(31), m = ruidoSuave(n, 9, r), m2 = ruidoSuave(n, 40, r);
  pixeles(x, n, (i, j) => { const v = lim(242 + m(i, j) * 9 + m2(i, j) * 6 + (r() - 0.5) * 6); return [v, v, v] });
});
// Pista de asfalto
export const texAsfalto = () => textura('asfalto', 512, (x, n) => {
  const r = azar(37), m = ruidoSuave(n, 8, r);
  pixeles(x, n, (i, j) => { const v = lim(112 + m(i, j) * 14 + (r() - 0.5) * 34 + (r() < 0.03 ? 40 : 0)); return [v, v + 1, v + 3] });
});
// Vereda de concreto en paños de 1 m
export const texVereda = () => textura('vereda', 512, (x, n) => {
  const r = azar(41), m = ruidoSuave(n, 6, r);
  pixeles(x, n, (i, j) => { const v = lim(206 + m(i, j) * 16 + (r() - 0.5) * 14); return [v, v - 1, v - 5] });
  x.fillStyle = 'rgba(90,86,80,.55)'; x.fillRect(0, 0, n, 3); x.fillRect(0, 0, 3, n);
});
// Etiquetas genéricas de productos (sin marcas)
const PALETA = [['#d6453d', '#ffffff', '#f2c14e'], ['#2f6fdb', '#ffffff', '#9fd0ff'], ['#2e9a62', '#f6f2e6', '#e5c45a'], ['#f2c14e', '#1d2433', '#d6453d'],
  ['#7a4fb5', '#ffffff', '#f3c6cf'], ['#ef8a3c', '#ffffff', '#4a2a12'], ['#f4f3ee', '#2f6fdb', '#d6453d'], ['#1d2433', '#f2c14e', '#ffffff']];
const texEtiqueta = i => textura('etq' + i, 128, (x, n) => {
  const [a, b, c] = PALETA[i % PALETA.length], r = azar(100 + i);
  x.fillStyle = a; x.fillRect(0, 0, n, n);
  x.fillStyle = b; x.fillRect(0, n * 0.34, n, n * 0.32);
  x.fillStyle = c; x.beginPath(); x.arc(n * (0.3 + r() * 0.4), n * 0.5, n * 0.12, 0, 7); x.fill();
  x.fillStyle = a; for (let k = 0; k < 3; k++) x.fillRect(n * 0.12, n * (0.4 + k * 0.07), n * (0.3 + r() * 0.4), n * 0.035);
});

/* ---------- coordenadas de textura en metros (para que nada se estire) ---------- */
export function uvMundo(geo, tam, largo) {
  geo.computeBoundingBox();
  const b = geo.boundingBox, dim = [b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z];
  const p = geo.attributes.position, nr = geo.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const n = [Math.abs(nr.getX(i)), Math.abs(nr.getY(i)), Math.abs(nr.getZ(i))], q = [p.getX(i), p.getY(i), p.getZ(i)];
    let ej = n[1] >= n[0] && n[1] >= n[2] ? [0, 2] : n[0] >= n[2] ? [2, 1] : [0, 1];
    if (largo && dim[ej[1]] > dim[ej[0]]) ej = [ej[1], ej[0]];   // la veta corre por el lado más largo
    uv[i * 2] = q[ej[0]] / tam; uv[i * 2 + 1] = q[ej[1]] / tam;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

/* ---------- materiales ---------- */
const TAM = { madera: 1.1, tela: 0.14, cuero: 0.3, piedra: 0.5, laminado: 0.5, metal: 0.4, negro: 0.5, esmalte: 0.5 };
const MADERAS = { dcc9b2: '#bd9264', e8dccb: '#cdb18c', c9a98a: '#a37650', d8cfc4: '#a98460' };
const OSCUROS = new Set(['4a4f57', '3f4650', '3e4650', '1d2433']);
const TAPIZ = { sofa: 'tela', banca: 'tela', sillaofi: 'tela', cama: 'tela', sillonb: 'cuero', colchoneta: 'cuero', camilla: 'cuero', lavacab: 'cuero' };
const cacheMat = new Map();
function material(ac, m0) {
  const hex = m0.color.getHexString(), clave = ac + hex + (m0.emissive ? m0.emissive.getHexString() + m0.emissiveIntensity : '');
  if (cacheMat.has(clave)) return cacheMat.get(clave);
  let m;
  switch (ac) {
    case 'vidrio': m = new THREE.MeshPhysicalMaterial({ color: '#eef7fa', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.18, depthWrite: false, envMapIntensity: 1.6, clearcoat: 1 }); break;
    case 'espejo': m = new THREE.MeshStandardMaterial({ color: '#eef3f6', roughness: 0.03, metalness: 1 }); break;
    case 'metal': m = new THREE.MeshStandardMaterial({ color: m0.color.clone().lerp(new THREE.Color('#d7dce1'), 0.4), metalness: 0.92, roughness: 0.42, roughnessMap: texCepillado() }); break;
    case 'negro': m = new THREE.MeshStandardMaterial({ color: '#2c3036', metalness: 0.35, roughness: 0.5 }); break;
    case 'luz': m = new THREE.MeshStandardMaterial({ color: m0.color, emissive: m0.emissive, emissiveIntensity: m0.emissiveIntensity * 1.6, roughness: 0.3 }); break;
    case 'madera': m = new THREE.MeshPhysicalMaterial({ color: MADERAS[hex] || m0.color, map: texMadera(), roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.45 }); break;
    case 'piedra': m = new THREE.MeshPhysicalMaterial({ color: '#f1ede6', map: texPiedra(), roughness: 0.28, clearcoat: 0.5, clearcoatRoughness: 0.2 }); break;
    case 'tela': m = new THREE.MeshStandardMaterial({ color: hex === 'e6d4e8' ? '#a8a1a9' : hex === 'ffffff' ? '#f4f2ee' : m0.color.clone().multiplyScalar(0.86), map: texTela(), bumpMap: texTela(), bumpScale: 0.6, roughness: 0.95 }); break;
    case 'cuero': m = new THREE.MeshStandardMaterial({ color: m0.color.clone().multiplyScalar(0.9), map: texCuero(), bumpMap: texCuero(), bumpScale: 0.5, roughness: 0.55 }); break;
    case 'esmalte': m = new THREE.MeshPhysicalMaterial({ color: m0.color, roughness: 0.18, clearcoat: 0.8, clearcoatRoughness: 0.1 }); break;
    default: m = new THREE.MeshStandardMaterial({ color: m0.color, map: texLaminado(), roughness: 0.5, metalness: 0 });
  }
  cacheMat.set(clave, m); return m;
}
function acabado(m0, o) {
  const hex = m0.color.getHexString();
  if (m0.transparent && m0.opacity < 0.5) return 'vidrio';
  if (m0.emissive && m0.emissiveIntensity > 0 && m0.emissive.getHex() !== 0) return 'luz';
  if (m0.metalness >= 0.5) return m0.roughness <= 0.1 ? 'espejo' : 'metal';
  if (OSCUROS.has(hex)) return 'negro';
  if (MADERAS[hex]) return 'madera';
  if (hex === 'ece7df') return 'piedra';
  const tapiz = TAPIZ[o.k] || (o.k === 'silla' && o.c === '#e6d4e8' ? 'tela' : null);
  if (tapiz && o.c && hex === o.c.slice(1).toLowerCase()) return tapiz;
  if (o.k === 'cama' && (hex === 'ffffff' || hex === 'f6f1ea' || hex === 'efe0ef')) return 'tela';
  if (o.k === 'sofa' && hex === 'efe0ef') return 'tela';
  if (hex === 'e6d4e8' || hex === 'efe2d0') return 'tela';
  if (m0.roughness <= 0.45) return 'esmalte';
  return 'laminado';
}

/* Convierte un mueble armado en 3D a su versión 4D */
export function realzar(g, o) {
  g.traverse(me => {
    if (!me.isMesh || !me.material || !me.material.isMeshStandardMaterial || me.material.userData.real || me.userData.real) return;
    const m0 = me.material, ac = acabado(m0, o), geo = me.geometry;
    if (geo.type === 'BoxGeometry' && ac !== 'vidrio' && ac !== 'espejo') {
      const { width: w, height: h, depth: d } = geo.parameters, min = Math.min(w, h, d);
      if (min >= 0.012) me.geometry = new RoundedBoxGeometry(w, h, d, 2, Math.min(0.012, min * 0.3));
    }
    if (TAM[ac]) uvMundo(me.geometry, TAM[ac], ac === 'madera');
    me.material = material(ac, m0);
    me.castShadow = ac !== 'vidrio'; me.receiveShadow = true;
  });
  return g;
}

/* ---------- productos de verdad en los estantes: cajas con etiqueta, botellas y latas ---------- */
const matProd = new Map();
function mProd(clave, crear) { if (!matProd.has(clave)) { const m = crear(); m.userData.real = 1; matProd.set(clave, m) } return matProd.get(clave) }
const geos = new Map();
function geo(clave, crear) { if (!geos.has(clave)) geos.set(clave, crear()); return geos.get(clave) }
function pieza(g, gm, m, x, y, z) { const me = new THREE.Mesh(gm, m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; me.userData.real = 1; g.add(me); return me }

export function productosReales(g, w, d, y, h, semilla) {
  if (h < 0.05) return;
  const filas = d > 0.3 ? 2 : 1;
  for (let f = 0; f < filas; f++) {
    const z = d / 2 - 0.05 - f * Math.min(0.14, d / 2);
    let x = -w / 2, i = semilla * 3 + f;
    while (x < w / 2 - 0.06) {
      const tipo = (i * 7 + semilla) % 4, et = (i * 5 + f) % PALETA.length;
      if (tipo === 0 || tipo === 3) {   // caja
        const bw = 0.07 + ((i * 37) % 4) * 0.02, bh = Math.min(h, 0.1 + ((i * 13) % 4) * 0.035), bd = Math.min(0.09, d / filas - 0.02);
        if (x + bw > w / 2) break;
        pieza(g, geo(`c${bw}|${bh}|${bd}`, () => new THREE.BoxGeometry(bw - 0.008, bh, bd)), mProd('e' + et, () => new THREE.MeshStandardMaterial({ map: texEtiqueta(et), roughness: 0.6 })), x + bw / 2, y + bh / 2, z);
        x += bw;
      } else if (tipo === 1) {   // botella
        const bh = Math.min(h, 0.2 + ((i * 3) % 3) * 0.04), r = 0.032;
        if (x + 0.075 > w / 2) break;
        const cuerpo = mProd('b' + et, () => new THREE.MeshPhysicalMaterial({ map: texEtiqueta(et), roughness: 0.25, clearcoat: 0.6 }));
        pieza(g, geo(`b${bh}`, () => new THREE.CylinderGeometry(r, r, bh * 0.68, 14)), cuerpo, x + 0.037, y + bh * 0.34, z);
        pieza(g, geo(`h${bh}`, () => new THREE.CylinderGeometry(0.012, r, bh * 0.2, 14)), mProd('bt' + (et % 3), () => new THREE.MeshPhysicalMaterial({ color: ['#cfe9f5', '#f4f3ee', '#d6453d'][et % 3], roughness: 0.15, clearcoat: 1, transparent: et % 3 === 0, opacity: 0.7 })), x + 0.037, y + bh * 0.78, z);
        pieza(g, geo('tapa', () => new THREE.CylinderGeometry(0.013, 0.013, 0.025, 10)), mProd('tp' + (et % 4), () => new THREE.MeshStandardMaterial({ color: PALETA[et % 4][0], roughness: 0.4 })), x + 0.037, Math.min(y + h - 0.013, y + bh * 0.88 + 0.0125), z);
        x += 0.075;
      } else {   // lata
        const bh = Math.min(h, 0.12);
        if (x + 0.07 > w / 2) break;
        pieza(g, geo(`l${bh}`, () => new THREE.CylinderGeometry(0.032, 0.032, bh, 16)), mProd('l' + et, () => new THREE.MeshStandardMaterial({ map: texEtiqueta(et), metalness: 0.55, roughness: 0.3 })), x + 0.035, y + bh / 2, z);
        x += 0.07;
      }
      i++;
    }
  }
}

/* ---------- planta con hojas ---------- */
export function plantaReal(g, w, h) {
  const r = azar(Math.round(w * 1000 + h * 100));
  const mm = mProd('maceta', () => new THREE.MeshPhysicalMaterial({ color: '#efe9df', roughness: 0.35, clearcoat: 0.4 }));
  const hm = 0.35, rm = w / 2 * 0.7;
  pieza(g, new THREE.CylinderGeometry(rm, rm * 0.78, hm, 28), mm, 0, hm / 2, 0);
  pieza(g, new THREE.CylinderGeometry(rm * 0.94, rm * 0.94, 0.02, 24), mProd('tierra', () => new THREE.MeshStandardMaterial({ color: '#4a3527', roughness: 1 })), 0, hm - 0.02, 0);
  const verdes = ['#3f7f4c', '#4f9158', '#356f42', '#5c9d5f'].map((c, k) => mProd('hoja' + k, () => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, side: THREE.DoubleSide })));
  const tallo = mProd('tallo', () => new THREE.MeshStandardMaterial({ color: '#5b6b3a', roughness: 0.8 }));
  const alto = h - hm, n = 26;
  const hoja = geo('hoja', () => { const s = new THREE.SphereGeometry(1, 10, 6); s.scale(0.35, 0.05, 1); return s });
  for (let k = 0; k < n; k++) {
    const a = k * 2.399 + r() * 0.4, t = 0.25 + (k / n) * 0.75, lh = 0.09 + r() * 0.07 + alto * 0.06;
    const rr = (w / 2) * (0.25 + 0.75 * Math.sin(t * Math.PI * 0.9)) * 0.8;
    const yy = hm + alto * t * 0.92;
    const tl = pieza(g, geo('tl', () => new THREE.CylinderGeometry(0.005, 0.007, 1, 5)), tallo, Math.cos(a) * rr / 2, hm + (yy - hm) / 2, Math.sin(a) * rr / 2);
    tl.scale.y = Math.hypot(rr, yy - hm); tl.lookAt(Math.cos(a) * rr, yy, Math.sin(a) * rr); tl.rotateX(Math.PI / 2);
    const hj = pieza(g, hoja, verdes[k % 4], Math.cos(a) * (rr + lh * 0.7), yy + lh * 0.15, Math.sin(a) * (rr + lh * 0.7));
    hj.scale.setScalar(lh); hj.rotation.set(-0.35 - r() * 0.5, -a + Math.PI / 2, (r() - 0.5) * 0.4, 'YXZ');
  }
}
