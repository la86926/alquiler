/* Vista 4D: los mismos muebles y medidas que en 3D, pero con acabados reales
   (madera, tela, cuero, piedra, metal, vidrio, porcelanato), bordes redondeados y luz de ambiente.
   Las texturas de tela, cuero, piedra y metal se dibujan aquí; las fotos (productos, piso, paredes, madera) están en texturas.js. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { tex } from './texturas.js?v=1.4.0';

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
const TAM = { madera: 0.9, tela: 0.14, cuero: 0.3, piedra: 0.5, laminado: 0.5, metal: 0.4, negro: 0.5, esmalte: 0.5 };
const MADERAS = { dcc9b2: '#bd9264', e8dccb: '#cdb18c', c9a98a: '#a37650', d8cfc4: '#a98460' };
const OSCUROS = new Set(['4a4f57', '3f4650', '3e4650', '1d2433']);
const TAPIZ = { sofa: 'tela', banca: 'tela', sillaofi: 'tela', cama: 'tela', sillonb: 'cuero', colchoneta: 'cuero', camilla: 'cuero', lavacab: 'cuero' };
const cacheMat = new Map();
function material(ac, m0) {
  const hex = m0.color.getHexString(), clave = ac + hex + (m0.emissive ? m0.emissive.getHexString() + m0.emissiveIntensity : '');
  if (cacheMat.has(clave)) return cacheMat.get(clave);
  let m;
  switch (ac) {
    case 'vidrio': m = new THREE.MeshPhysicalMaterial({ color: '#eef7fa', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.1, depthWrite: false, envMapIntensity: 0.5, clearcoat: 0.3 }); break;
    case 'espejo': m = new THREE.MeshStandardMaterial({ color: '#eef3f6', roughness: 0.03, metalness: 1 }); break;
    case 'metal': m = new THREE.MeshStandardMaterial({ color: m0.color.clone().lerp(new THREE.Color('#d7dce1'), 0.4), metalness: 0.92, roughness: 0.42, roughnessMap: texCepillado() }); break;
    case 'negro': m = new THREE.MeshStandardMaterial({ color: '#2c3036', metalness: 0.35, roughness: 0.5 }); break;
    case 'luz': m = new THREE.MeshStandardMaterial({ color: m0.color, emissive: m0.emissive, emissiveIntensity: m0.emissiveIntensity * 1.6, roughness: 0.3 }); break;
    case 'madera': m = new THREE.MeshPhysicalMaterial({ color: hex === 'dcc9b2' ? '#ffffff' : new THREE.Color(MADERAS[hex] || m0.color).lerp(new THREE.Color('#ffffff'), 0.5), map: tex('madera'), roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.45 }); break;   // foto de melamina roble
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
