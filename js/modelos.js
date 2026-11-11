/* Modelos 3D de los muebles, armados con piezas simples para que la caja total mida exactamente
   ancho × fondo × alto. Ejes locales: x = ancho, y = alto, z = fondo; el frente mira hacia +z. */
import * as THREE from 'three';
import { realzar, productosReales, plantaReal } from './realista.js?v=1.3.0';

let REAL = false;   // 4D: acabados reales

const mats = new Map();
function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.75, metalness: 0.02 }, o)));
  return mats.get(key);
}
const VIDRIO = () => mat('#cfe9f5', { transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.1, depthWrite: false });
const METAL = () => mat('#b9c0c8', { roughness: 0.35, metalness: 0.6 });
const OSCURO = () => mat('#4a4f57', { roughness: 0.6 });
const BLANCO = () => mat('#f4f3ee', { roughness: 0.4 });

function caja(g, w, h, d, x, y, z, m) {
  if (w <= 0 || h <= 0 || d <= 0) return;
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  me.position.set(x, y + h / 2, z); me.castShadow = true; me.receiveShadow = true; g.add(me); return me;
}
function cil(g, r, h, x, y, z, m, seg = 20) {
  const me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
  me.position.set(x, y + h / 2, z); me.castShadow = true; me.receiveShadow = true; g.add(me); return me;
}
function patas(g, w, d, h, t, m, inset = 0) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) caja(g, t, h, t, sx * (w / 2 - t / 2 - inset), 0, sz * (d / 2 - t / 2 - inset), m);
}
function silla(g, x, z, giro, col, w = 0.42, d = 0.45, h = 0.85) {
  const s = new THREE.Group(); const m = mat(col);
  patas(s, w, d, 0.45, 0.03, OSCURO());
  caja(s, w, 0.04, d, 0, 0.45, 0, m);
  caja(s, w, h - 0.49, 0.03, 0, 0.49, -d / 2 + 0.015, m);
  s.position.set(x, 0, z); s.rotation.y = giro; g.add(s);
}
function mesa(g, w, d, h, col, x = 0, z = 0) {
  const m = mat(col);
  caja(g, w, 0.03, d, x, h - 0.03, z, m);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) caja(g, 0.04, h - 0.03, 0.04, x + sx * (w / 2 - 0.05), 0, z + sz * (d / 2 - 0.05), OSCURO());
}
function estante(g, w, d, h, niv, col, cerrado) {
  const m = mat(col), t = 0.025;
  if (cerrado) {
    caja(g, t, h, d, -w / 2 + t / 2, 0, 0, m); caja(g, t, h, d, w / 2 - t / 2, 0, 0, m);
    caja(g, w, h, 0.012, 0, 0, -d / 2 + 0.006, m);
  } else for (const sx of [-1, 1]) for (const sz of [-1, 1]) caja(g, 0.035, h, 0.035, sx * (w / 2 - 0.0175), 0, sz * (d / 2 - 0.0175), METAL());
  for (let i = 0; i < niv; i++) {
    const y = i === niv - 1 ? h - t : 0.08 + i * (h - 0.08 - t) / (niv - 1);
    caja(g, w, t, d, 0, y, 0, m);
    if (i < niv - 1) productos(g, w - 0.06, d - 0.06, y + t, Math.min(0.22, (h - 0.1) / niv - 0.08), i);
  }
}
const TONOS = ['#f3c6cf', '#c7dcf3', '#f2e2a8', '#cfe6d2', '#e2d3f0', '#f5d2b8', '#d6dde4'];
function productos(g, w, d, y, h, semilla) {
  if (REAL) return productosReales(g, w, d, y, h, semilla);
  if (h < 0.05) return;
  let x = -w / 2, i = semilla;
  while (x < w / 2 - 0.06) {
    const bw = 0.07 + ((i * 37) % 5) * 0.025, bh = h * (0.65 + ((i * 13) % 4) * 0.1);
    if (x + bw > w / 2) break;
    caja(g, bw - 0.01, bh, d * 0.8, x + bw / 2, y, 0, mat(TONOS[i % TONOS.length]));
    x += bw; i++;
  }
}
function ropa(g, w, y, z, n, larga = 0.7) {
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + 0.06 + i * (w - 0.12) / Math.max(1, n - 1);
    caja(g, 0.035, larga, 0.4, x, y - larga, z, mat(TONOS[i % TONOS.length], { roughness: 0.9 }));
  }
}
function vitrina(g, w, d, h, col, frio) {
  const m = mat(col === '#cfe7f2' ? '#e9edf0' : col), t = 0.04;
  caja(g, w, 0.12, d, 0, 0, 0, m);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) caja(g, 0.025, h - 0.12, 0.025, sx * (w / 2 - 0.0125), 0.12, sz * (d / 2 - 0.0125), METAL());
  caja(g, w - 0.05, h - 0.12 - t, d - 0.05, 0, 0.12, 0, VIDRIO());
  caja(g, w, 0.012, d, 0, h - 0.012, 0, VIDRIO());
  const niv = h > 1.2 ? 4 : 2;
  for (let i = 1; i < niv; i++) {
    const y = 0.12 + i * (h - 0.12) / niv;
    caja(g, w - 0.06, 0.008, d - 0.06, 0, y, 0, VIDRIO());
    productos(g, w - 0.1, d - 0.12, y + 0.008, 0.12, i + 3);
  }
  if (frio) caja(g, w, 0.04, d, 0, h - 0.05, 0, mat('#ffffff', { emissive: '#dbeeff', emissiveIntensity: 0.4 }));
}

/* Letrero discreto «Baño» colgado en la puerta, centrado y casi arriba */
let texBano = null;
function letreroBano(g, x, y, z) {
  if (!texBano) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 80; const k = c.getContext('2d');
    // plaquita clara con borde suave, como las que se cuelgan en la puerta
    k.fillStyle = '#f7f6f2'; k.strokeStyle = '#cfc8bb'; k.lineWidth = 5;
    k.beginPath(); if (k.roundRect) k.roundRect(3, 3, 250, 74, 14); else k.rect(3, 3, 250, 74); k.fill(); k.stroke();
    k.fillStyle = '#9aa3ad'; k.font = '600 40px "Plus Jakarta Sans", system-ui, sans-serif'; k.textAlign = 'center'; k.textBaseline = 'middle';
    k.fillText('Baño', 128, 42);
    texBano = new THREE.CanvasTexture(c); texBano.colorSpace = THREE.SRGBColorSpace; texBano.anisotropy = 4;
  }
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.075), new THREE.MeshBasicMaterial({ map: texBano, toneMapped: false, transparent: true }));
  p.position.set(x, y, z); g.add(p);
}
export function construirModelo(o, real = false) {
  REAL = real;
  const g = new THREE.Group();
  const w = o.w, d = o.d, h = o.h, c = o.c || '#dddddd', m = mat(c);
  switch (o.k) {
    case 'estante': estante(g, w, d, h, o.niv || 5, c, o.cerrado); break;
    case 'gondola': {
      caja(g, w, h, 0.03, 0, 0, 0, m);
      caja(g, w, 0.1, d, 0, 0, 0, m);
      const niv = o.niv || 4;
      for (let i = 0; i < niv; i++) {
        const y = 0.1 + i * (h - 0.15) / niv;
        for (const s of [-1, 1]) {
          const dd = (d / 2 - 0.02) * (1 - i * 0.08);
          caja(g, w, 0.02, dd, 0, y, s * (0.015 + dd / 2), m);
          productos(g, w - 0.04, dd - 0.04, y + 0.02, 0.2, i * 3 + (s > 0 ? 1 : 0));
        }
      }
      break;
    }
    case 'panel': {
      caja(g, w, h, d * 0.4, 0, 0, -d * 0.3, m);
      for (let i = 0; i < 8; i++) caja(g, w, 0.008, 0.01, 0, 0.1 + i * (h - 0.2) / 7, -d * 0.1 + 0.005, mat('#c9c9c4'));
      for (let i = 0; i < 10; i++) caja(g, 0.03, 0.18, 0.06, -w / 2 + 0.1 + (i % 5) * (w - 0.2) / 4, 0.25 + Math.floor(i / 5) * 0.6, d / 2 - 0.06, mat(TONOS[i % 7]));
      break;
    }
    case 'repisa': caja(g, w, h, d, 0, 0, 0, m); break;
    case 'mostrador': {
      caja(g, w - 0.04, h - 0.04, d - 0.06, 0, 0, -0.03, m);
      caja(g, w, 0.04, d, 0, h - 0.04, 0, mat('#ece7df', { roughness: 0.4 }));
      caja(g, w - 0.04, 0.08, 0.01, 0, 0, d / 2 - 0.065, OSCURO());
      break;
    }
    case 'vitrina': vitrina(g, w, d, h, c, o.frio); break;
    case 'vitrinav': {
      caja(g, w, 0.1, d, 0, 0, 0, mat('#e9edf0'));
      caja(g, w, 0.06, d, 0, h - 0.06, 0, mat('#e9edf0'));
      caja(g, 0.02, h - 0.16, d, -w / 2 + 0.01, 0.1, 0, METAL()); caja(g, 0.02, h - 0.16, d, w / 2 - 0.01, 0.1, 0, METAL());
      caja(g, w - 0.04, h - 0.16, d - 0.02, 0, 0.1, 0, VIDRIO());
      for (let i = 1; i < 5; i++) { const y = 0.1 + i * (h - 0.16) / 5; caja(g, w - 0.04, 0.008, d - 0.04, 0, y, 0, VIDRIO()); productos(g, w - 0.1, d - 0.12, y, 0.14, i) }
      break;
    }
    case 'caja': {
      caja(g, w, h - 0.03, d, 0, 0, 0, m);
      caja(g, w, 0.03, d, 0, h - 0.03, 0, mat('#ece7df'));
      caja(g, 0.35, 0.12, 0.3, -w / 2 + 0.25, h, -0.05, OSCURO());
      break;
    }
    case 'refri': {
      caja(g, w, h, d - 0.02, 0, 0, -0.01, mat('#3e4650', { roughness: 0.5 }));
      caja(g, w - 0.08, h - 0.32, 0.02, 0, 0.12, d / 2 - 0.01, VIDRIO());
      caja(g, w - 0.08, h - 0.32, 0.005, 0, 0.12, d / 2 - 0.035, mat('#ffffff', { emissive: '#e3f1ff', emissiveIntensity: 0.55 }));
      for (let i = 0; i < 5; i++) productos(g, w - 0.12, d - 0.15, 0.16 + i * (h - 0.4) / 5, 0.2, i + 2);
      caja(g, w, 0.18, 0.02, 0, h - 0.18, d / 2 - 0.01, mat('#cfe3f7', { emissive: '#cfe3f7', emissiveIntensity: 0.3 }));
      break;
    }
    case 'congeladora': {
      caja(g, w, h - 0.05, d, 0, 0, 0, BLANCO());
      caja(g, w, 0.05, d, 0, h - 0.05, 0, mat('#e7ecef'));
      caja(g, w * 0.3, 0.02, 0.04, 0, h - 0.12, d / 2, OSCURO());
      break;
    }
    case 'refrigeradora': {
      caja(g, w, h, d, 0, 0, 0, BLANCO());
      if (h > 1.2) caja(g, w - 0.01, 0.006, 0.005, 0, h * 0.68, d / 2 + 0.002, mat('#cfcfca'));
      caja(g, 0.02, h * 0.25, 0.03, w / 2 - 0.06, h * 0.4, d / 2 + 0.015, METAL());
      break;
    }
    case 'barracafe': {
      const bh = 1.05;
      caja(g, w - 0.04, bh - 0.04, d - 0.06, 0, 0, -0.03, m);
      caja(g, w, 0.04, d, 0, bh - 0.04, 0, mat('#ece7df', { roughness: 0.4 }));
      const cw = Math.min(0.77, w * 0.45), cd = Math.min(0.633, d);
      caja(g, cw, h - bh - 0.06, cd - 0.05, -w / 2 + cw / 2 + 0.05, bh, -0.02, METAL());
      caja(g, cw, 0.06, cd, -w / 2 + cw / 2 + 0.05, h - 0.06, 0, mat('#d55f6b'));
      caja(g, 0.18, 0.4, 0.18, w / 2 - 0.25, bh, -d / 4, OSCURO());
      break;
    }
    case 'cafetera': {
      caja(g, w, h - 0.06, d - 0.05, 0, 0, -0.025, METAL());
      caja(g, w, 0.06, d, 0, h - 0.06, 0, mat('#d55f6b'));
      break;
    }
    case 'mesa': mesa(g, w, d, h, c); if (o.n === 'Mesa exhibidora') productos(g, w - 0.1, d - 0.2, h, 0.08, 2); break;
    case 'mesa2s': {
      mesa(g, w, 0.7, 0.74, c);
      silla(g, 0, -0.55, 0, '#e6d4e8'); silla(g, 0, 0.55, Math.PI, '#e6d4e8');
      break;
    }
    case 'mesar2s': {
      cil(g, 0.3, 0.03, 0, 0.71, 0, mat(c), 32); cil(g, 0.03, 0.71, 0, 0, 0, OSCURO()); cil(g, 0.22, 0.02, 0, 0, 0, OSCURO());
      silla(g, 0, -0.5, 0, '#e6d4e8', 0.4, 0.4); silla(g, 0, 0.5, Math.PI, '#e6d4e8', 0.4, 0.4);
      break;
    }
    case 'comedor': {
      mesa(g, w, 0.8, 0.75, c);
      for (const sx of [-0.28, 0.28]) { silla(g, sx, -0.5, 0, '#efe2d0'); silla(g, sx, 0.5, Math.PI, '#efe2d0') }
      break;
    }
    case 'reunion': {
      mesa(g, w, 0.9, 0.75, c);
      for (const sx of [-0.6, 0, 0.6]) { silla(g, sx, -0.72, 0, '#d9d9d6', 0.45, 0.46); silla(g, sx, 0.72, Math.PI, '#d9d9d6', 0.45, 0.46) }
      break;
    }
    case 'silla': silla(g, 0, 0, Math.PI, c, w, d, h); break;
    case 'taburete': {
      cil(g, w / 2, 0.04, 0, h - 0.04, 0, m); cil(g, 0.025, h - 0.04, 0, 0, 0, METAL()); cil(g, w / 2 - 0.02, 0.02, 0, 0.25, 0, METAL());
      break;
    }
    case 'sillaofi': {
      for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; const p = caja(g, 0.04, 0.04, w / 2 - 0.02, Math.sin(a) * w / 4, 0.02, Math.cos(a) * w / 4, OSCURO()); p.rotation.y = a }
      cil(g, 0.03, 0.42, 0, 0.04, 0, METAL());
      caja(g, w - 0.08, 0.08, d - 0.1, 0, 0.46, 0.02, m);
      caja(g, w - 0.12, h - 0.56, 0.06, 0, 0.56, -d / 2 + 0.08, m);
      break;
    }
    case 'banca': {
      caja(g, w, 0.04, 0.03, 0, 0.3, 0, METAL());
      for (const sx of [-1, 1]) caja(g, 0.04, 0.45, d - 0.05, sx * (w / 2 - 0.15), 0, 0, METAL());
      const n = 3;
      for (let i = 0; i < n; i++) {
        const x = -w / 2 + w / n / 2 + i * w / n;
        caja(g, w / n - 0.04, 0.06, d - 0.08, x, 0.42, 0.02, m);
        caja(g, w / n - 0.04, h - 0.5, 0.05, x, 0.5, -d / 2 + 0.05, m);
      }
      break;
    }
    case 'escritorio': {
      caja(g, w, 0.03, d, 0, h - 0.03, 0, m);
      caja(g, 0.025, h - 0.03, d, -w / 2 + 0.0125, 0, 0, m); caja(g, 0.025, h - 0.03, d, w / 2 - 0.0125, 0, 0, m);
      caja(g, w - 0.05, 0.35, 0.02, 0, h - 0.38, -d / 2 + 0.02, m);
      caja(g, 0.5, 0.32, 0.02, -0.1, h, -d / 2 + 0.12, OSCURO());
      break;
    }
    case 'mesatec': {
      caja(g, w, 0.04, d, 0, h - 0.04, 0, mat('#9fb0a6'));
      patas(g, w, d, h - 0.04, 0.04, METAL(), 0.02);
      caja(g, w - 0.1, 0.02, d - 0.1, 0, 0.2, 0, METAL());
      caja(g, 0.34, 0.02, 0.24, -0.2, h, 0, OSCURO());
      caja(g, 0.07, 0.15, 0.01, 0.3, h, 0, OSCURO());
      break;
    }
    case 'archivador': {
      caja(g, w, h, d, 0, 0, 0, m);
      for (let i = 0; i < 4; i++) { caja(g, w - 0.04, 0.004, 0.004, 0, (i + 1) * h / 4 - 0.01, d / 2 + 0.002, OSCURO()); caja(g, 0.1, 0.02, 0.02, 0, (i + 0.6) * h / 4, d / 2 + 0.01, METAL()) }
      break;
    }
    case 'fotocop': {
      caja(g, w, h - 0.2, d, 0, 0, 0, m);
      caja(g, w, 0.2, d * 0.8, 0, h - 0.2, -d * 0.1, mat('#eaeae6'));
      break;
    }
    case 'sofa': {
      caja(g, w, 0.42, d, 0, 0, 0, m);
      caja(g, w, h - 0.42, 0.2, 0, 0.42, -d / 2 + 0.1, m);
      for (const sx of [-1, 1]) caja(g, 0.18, 0.62 - 0.42, d, sx * (w / 2 - 0.09), 0.42, 0, m);
      for (let i = 0; i < 3; i++) caja(g, (w - 0.36) / 3 - 0.02, 0.12, d - 0.25, -w / 2 + 0.18 + (w - 0.36) / 6 + i * (w - 0.36) / 3, 0.42, 0.08, mat('#efe0ef'));
      break;
    }
    case 'cama': {
      caja(g, w, 0.32, d - 0.06, 0, 0, 0.03, mat('#d8cfc4'));
      caja(g, w - 0.04, 0.22, d - 0.1, 0, 0.32, 0.04, mat('#ffffff'));
      caja(g, w, h, 0.06, 0, 0, -d / 2 + 0.03, m);
      for (const sx of [-1, 1]) caja(g, w / 2 - 0.12, 0.1, 0.35, sx * w / 4, 0.54, -d / 2 + 0.3, mat('#f6f1ea'));
      caja(g, w - 0.02, 0.04, d * 0.55, 0, 0.54, d * 0.2, m);
      break;
    }
    case 'velador': caja(g, w, h, d, 0, 0, 0, m); caja(g, 0.1, 0.02, 0.02, 0, h * 0.7, d / 2 + 0.01, METAL()); cil(g, 0.08, 0.3, 0, h, 0, mat('#f7efd6', { emissive: '#f7e7b5', emissiveIntensity: 0.3 })); break;
    case 'ropero': {
      caja(g, w, h, d, 0, 0, 0, m);
      caja(g, 0.006, h - 0.04, 0.004, 0, 0.02, d / 2 + 0.002, OSCURO());
      for (const sx of [-1, 1]) caja(g, 0.02, 0.3, 0.02, sx * 0.05, h * 0.5, d / 2 + 0.01, METAL());
      break;
    }
    case 'rack': caja(g, w, h, d, 0, 0, 0, m); caja(g, w - 0.04, h * 0.4, 0.01, 0, h * 0.3, d / 2, OSCURO()); break;
    case 'tv': {
      caja(g, w, h, d * 0.5, 0, 0, -d * 0.2, OSCURO());
      caja(g, w - 0.02, h - 0.02, 0.005, 0, 0.01, d * 0.06, mat('#1d2433', { roughness: 0.15, metalness: 0.3 }));
      break;
    }
    case 'cocina': {
      caja(g, w, h - 0.02, d, 0, 0, 0, BLANCO());
      caja(g, w, 0.02, d, 0, h - 0.02, 0, OSCURO());
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) cil(g, 0.07, 0.015, sx * w / 4, h, sz * d / 4, METAL());
      caja(g, w - 0.08, h * 0.45, 0.01, 0, 0.12, d / 2, OSCURO());
      break;
    }
    case 'lavadero': {
      caja(g, w, h - 0.03, d, 0, 0, 0, m);
      caja(g, w, 0.03, d, 0, h - 0.03, 0, METAL());
      caja(g, w * 0.45, 0.012, d * 0.6, -w * 0.2, h - 0.004, 0, mat('#8e979f', { metalness: 0.7 }));
      cil(g, 0.015, 0.25, -w * 0.2, h, -d / 2 + 0.06, METAL());
      break;
    }
    case 'inodoro': inodoro(g, 0, 0, 0, w, d, h); break;
    case 'lavatorio': lavatorio(g, 0, 0, 0, w, d, h); break;
    case 'bano': {
      const t = 0.1, pared = mat('#f7f6f2', { roughness: 0.9 });
      const pw = 0.7; // puerta
      caja(g, t, h, d, -w / 2 + t / 2, 0, 0, pared);
      caja(g, t, h, d, w / 2 - t / 2, 0, 0, pared);
      caja(g, w, h, t, 0, 0, -d / 2 + t / 2, pared);
      const resto = w - pw - 2 * t;
      caja(g, resto, h, t, -w / 2 + t + resto / 2, 0, d / 2 - t / 2, pared);
      caja(g, pw, h - 2.1, t, w / 2 - t - pw / 2, 2.1, d / 2 - t / 2, pared);
      caja(g, pw - 0.02, 2.08, 0.04, w / 2 - t - pw / 2, 0, d / 2 - t / 2, mat('#e8dccb'));
      caja(g, w - 2 * t, 0.006, d - 2 * t, 0, 0, 0, mat('#e3eef3'));
      letreroBano(g, w / 2 - t - pw / 2, 1.78, d / 2 - t / 2 + 0.024);   // sobre la cara de la puerta
      inodoro(g, -w / 2 + t + 0.25, 0, -d / 2 + t + 0.33, 0.37, 0.66, 0.71);
      lavatorio(g, w / 2 - t - 0.205, 0, -d / 2 + t + 0.4, 0.51, 0.41, 0.83, -Math.PI / 2);
      break;
    }
    case 'sillonb': sillonb(g, 0, 0, w, d, h, c); break;
    case 'tocador': tocador(g, 0, w, d, h, c); break;
    case 'puestob': {
      tocador(g, -d / 2 + 0.2, w, 0.4, h, c);
      sillonb(g, 0, d / 2 - 0.325, 0.51, 0.65, 0.81, '#3f4650', true);
      break;
    }
    case 'lavacab': {
      caja(g, 0.5, 0.85, 0.45, 0, 0, -d / 2 + 0.225, mat('#3f4650'));
      caja(g, 0.5, 0.15, 0.4, 0, 0.75, -d / 2 + 0.2, BLANCO());
      caja(g, w, 0.45, d - 0.45, 0, 0, d / 2 - (d - 0.45) / 2, m);
      caja(g, w, 0.5, 0.12, 0, 0.45, -d / 2 + 0.5, m);
      break;
    }
    case 'espejo': caja(g, w, h, d, 0, 0, 0, mat('#dfeef6', { roughness: 0.05, metalness: 0.6 })); break;
    case 'perchero': {
      for (const sx of [-1, 1]) { caja(g, 0.03, h - 0.06, 0.03, sx * (w / 2 - 0.015), 0.06, 0, METAL()); caja(g, 0.04, 0.03, d, sx * (w / 2 - 0.02), 0.03, 0, METAL()) }
      caja(g, w, 0.025, 0.025, 0, h - 0.025, 0, METAL());
      caja(g, w - 0.06, 0.02, d - 0.04, 0, 0.18, 0, METAL());
      ropa(g, w - 0.1, h - 0.06, 0, 10, 0.75);
      break;
    }
    case 'barrap': {
      caja(g, w, 0.025, 0.025, 0, h - 0.04, d / 2 - 0.05, METAL());
      for (const sx of [-1, 1]) caja(g, 0.02, 0.05, d, sx * (w / 2 - 0.01), h - 0.05, 0, METAL());
      ropa(g, w - 0.1, h - 0.06, d / 2 - 0.05, 8, 0.8);
      break;
    }
    case 'probador': {
      const t = 0.03, pm = mat(c);
      caja(g, t, h, d, -w / 2 + t / 2, 0, 0, pm); caja(g, t, h, d, w / 2 - t / 2, 0, 0, pm); caja(g, w, h, t, 0, 0, -d / 2 + t / 2, pm);
      caja(g, w, 0.02, 0.02, 0, h - 0.05, d / 2 - 0.02, METAL());
      caja(g, w * 0.4, h - 0.3, 0.02, -w * 0.28, 0.2, d / 2 - 0.03, mat('#cbbfe8', { roughness: 1 }));
      caja(g, 0.4, 1.2, 0.01, 0, 0.5, -d / 2 + 0.04, mat('#dfeef6', { metalness: 0.6, roughness: 0.05 }));
      break;
    }
    case 'maniqui': {
      cil(g, 0.15, 0.02, 0, 0, 0, OSCURO()); cil(g, 0.015, 0.8, 0, 0.02, 0, METAL());
      const t = cil(g, 0.13, 0.62, 0, 0.82, 0, m); t.scale.set(w / 0.3, 1, d / 0.3);
      cil(g, 0.05, 0.1, 0, 1.44, 0, m);
      const cab = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 16), m); cab.position.set(0, h - 0.12, 0); cab.castShadow = true; g.add(cab);
      break;
    }
    case 'mesavet': {
      caja(g, w, 0.04, d, 0, h - 0.04, 0, mat('#dfe5ea', { metalness: 0.5, roughness: 0.3 }));
      for (const sx of [-1, 1]) caja(g, 0.06, h - 0.04, d - 0.2, sx * (w / 2 - 0.15), 0, 0, METAL());
      caja(g, w - 0.3, 0.03, d - 0.2, 0, 0.15, 0, METAL());
      break;
    }
    case 'jaula': {
      caja(g, w, 0.03, d, 0, 0, 0, METAL()); caja(g, w, 0.02, d, 0, h - 0.02, 0, METAL());
      caja(g, 0.02, h, d, -w / 2 + 0.01, 0, 0, METAL()); caja(g, 0.02, h, d, w / 2 - 0.01, 0, 0, METAL()); caja(g, w, h, 0.02, 0, 0, -d / 2 + 0.01, METAL());
      for (let i = 0; i < 9; i++) caja(g, 0.006, h - 0.05, 0.006, -w / 2 + 0.04 + i * (w - 0.08) / 8, 0.03, d / 2 - 0.01, METAL());
      break;
    }
    case 'banera': {
      patas(g, w, d, h - 0.35, 0.04, METAL(), 0.03);
      caja(g, w, 0.35, d, 0, h - 0.35, 0, mat('#dfe5ea', { metalness: 0.5, roughness: 0.3 }));
      caja(g, w - 0.08, 0.01, d - 0.08, 0, h - 0.005, 0, mat('#aab4bc'));
      break;
    }
    case 'camilla': {
      const ph = h - 0.1;
      patas(g, w, d, ph, 0.04, o.k === 'camilla' && c === '#f6d3ba' ? mat('#c9a98a') : METAL(), 0.06);
      caja(g, w, 0.1, d, 0, ph, 0, m);
      if (w > 1.5) caja(g, 0.4, 0.04, d * 0.85, -w / 2 + 0.25, h, 0, mat('#ffffff'));
      break;
    }
    case 'biombo': {
      for (let i = 0; i < 3; i++) { const p = caja(g, w / 3 - 0.01, h - 0.05, 0.02, -w / 3 + i * w / 3, 0.05, (i % 2 ? -1 : 1) * 0.005, mat('#f3f0ea', { transparent: true, opacity: 0.9 })); }
      for (let i = 0; i < 4; i++) caja(g, 0.02, h, d, -w / 2 + 0.01 + i * (w - 0.02) / 3, 0, 0, METAL());
      break;
    }
    case 'carrito': {
      patas(g, w, d, h, 0.02, METAL());
      for (const y of [0.12, 0.47, h - 0.02]) caja(g, w, 0.02, d, 0, y, 0, mat('#e8edf0'));
      break;
    }
    case 'espaldera': {
      for (const sx of [-1, 1]) caja(g, 0.05, h, d, sx * (w / 2 - 0.025), 0, 0, m);
      for (let i = 0; i < 16; i++) { const b = cil(g, 0.016, w - 0.1, 0, 0.12 + i * (h - 0.2) / 15, 0, m, 10); b.rotation.z = Math.PI / 2; b.position.y = 0.12 + i * (h - 0.2) / 15 }
      break;
    }
    case 'colchoneta': caja(g, w, h, d, 0, 0, 0, m); break;
    case 'escalonado': {
      for (let i = 0; i < 3; i++) {
        const hh = h * (i + 1) / 3, dd = d / 3;
        caja(g, w, hh, dd, 0, 0, d / 2 - dd / 2 - (2 - i) * dd, m);
        for (let j = 0; j < 4; j++) caja(g, w / 4 - 0.03, 0.08, dd - 0.06, -w / 2 + w / 8 + j * w / 4, hh, d / 2 - dd / 2 - (2 - i) * dd, mat(['#f3c6cf', '#f2e2a8', '#cfe6d2', '#f6d3ba'][(i + j) % 4], { roughness: 0.9 }));
      }
      break;
    }
    case 'jabas': {
      const n = Math.max(1, Math.round(h / 0.3));
      for (let i = 0; i < n; i++) {
        caja(g, w, h / n - 0.01, d, 0, i * h / n, 0, mat(c, { roughness: 0.95 }));
        caja(g, w - 0.06, 0.05, d - 0.06, 0, (i + 1) * h / n - 0.06, 0, mat(['#f3c6cf', '#f2e2a8', '#cfe6d2'][i % 3]));
      }
      break;
    }
    case 'balanza': {
      caja(g, w - 0.04, h - 0.18, d - 0.06, 0, 0, -0.03, m);
      caja(g, w, 0.04, d, 0, h - 0.22, 0, mat('#ece7df'));
      caja(g, 0.3, 0.08, 0.3, -w / 4, h - 0.18, 0, METAL()); caja(g, 0.18, 0.1, 0.03, -w / 4, h - 0.1, -0.12, OSCURO());
      break;
    }
    case 'persona': {
      const piel = mat('#e9c9a8'), ropa1 = mat('#a8b8d8'), pant = mat('#5d6675');
      const esc = h / 1.7;
      for (const sx of [-1, 1]) caja(g, 0.13 * esc, 0.8 * esc, 0.15 * esc, sx * 0.075 * esc, 0, 0, pant);
      caja(g, Math.min(w, 0.42 * esc), 0.6 * esc, Math.min(d, 0.22 * esc), 0, 0.8 * esc, 0, ropa1);
      const cab = new THREE.Mesh(new THREE.SphereGeometry(0.11 * esc, 20, 16), piel); cab.position.set(0, h - 0.13 * esc, 0); cab.castShadow = true; g.add(cab);
      cil(g, 0.05 * esc, 0.08 * esc, 0, 1.4 * esc, 0, piel);
      break;
    }
    case 'planta': {
      if (REAL) { plantaReal(g, w, h); break }
      cil(g, w / 2 * 0.7, 0.35, 0, 0, 0, mat('#e8d8c8'));
      const hoja = new THREE.Mesh(new THREE.SphereGeometry(w / 2, 16, 12), mat('#9fc7a6', { roughness: 0.9 }));
      hoja.scale.set(1, (h - 0.35) / w, 1); hoja.position.y = 0.35 + (h - 0.35) / 2; hoja.castShadow = true; g.add(hoja);
      break;
    }
    case 'tacho': cil(g, w / 2, h, 0, 0, 0, m); break;
    case 'dispensador': caja(g, w, h * 0.65, d, 0, 0, 0, BLANCO()); cil(g, w * 0.38, h * 0.35, 0, h * 0.65, 0, mat('#bfe0f5', { transparent: true, opacity: 0.6 })); break;
    default: caja(g, w, h, d, 0, 0, 0, m);
  }
  if (REAL) realzar(g, o);
  REAL = false;
  return g;
}

function inodoro(g, x, y, z, w, d, h) {
  const b = BLANCO();
  caja(g, w, h - 0.3, 0.17, x, y + 0.3, z - d / 2 + 0.085, b);
  const taza = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2 - 0.04, 0.4, 24), b);
  taza.scale.set(1, 1, (d - 0.17) / w); taza.position.set(x, y + 0.2, z + 0.085); taza.castShadow = true; g.add(taza);
}
function lavatorio(g, x, y, z, w, d, h, giro = 0) {
  const s = new THREE.Group(), b = BLANCO();
  cil(s, 0.09, h - 0.18, 0, 0, -d / 2 + 0.14, b);
  caja(s, w, 0.18, d, 0, h - 0.18, 0, b);
  caja(s, w - 0.12, 0.01, d - 0.14, 0, h - 0.008, 0.02, mat('#dfe5ea'));
  cil(s, 0.012, 0.12, 0, h, -d / 2 + 0.05, METAL());
  s.position.set(x, y, z); s.rotation.y = giro; g.add(s);
}
function sillonb(g, x, z, w, d, h, col, conPie) {
  const s = new THREE.Group(), m = mat(col);
  cil(s, 0.25, 0.04, 0, 0, 0, METAL()); cil(s, 0.05, 0.4, 0, 0.04, 0, METAL());
  caja(s, w, 0.12, d - 0.1, 0, 0.44, 0.03, m);
  caja(s, w, h - 0.56, 0.1, 0, 0.56, -d / 2 + 0.05, m);
  for (const sx of [-1, 1]) caja(s, 0.06, 0.06, d - 0.2, sx * (w / 2 - 0.03), 0.66, 0.02, OSCURO());
  if (conPie) caja(s, w * 0.6, 0.03, 0.1, 0, 0.12, d / 2 - 0.05, METAL());
  s.position.set(x, 0, z); g.add(s);
}
function tocador(g, z, w, d, h, col) {
  const m = mat(col);
  caja(g, w, 0.8, d, 0, 0, z, m);
  caja(g, w, 0.03, d, 0, 0.8, z, mat('#ffffff'));
  caja(g, w * 0.8, h - 0.95, 0.02, 0, 0.9, z - d / 2 + 0.03, mat('#dfeef6', { roughness: 0.05, metalness: 0.65 }));
  caja(g, w, 0.04, 0.06, 0, h - 0.04, z - d / 2 + 0.03, m);
}
