/* Texturas (fotos hechas con ChatGPT) y modelos 3D reales. Se cargan solo cuando se abre el 3D. */
import * as THREE from 'three';

const V = '?v=1.4.0';
const cargador = new THREE.TextureLoader();
const cache = new Map();
let aviso = () => {};
export const alCargar = f => { aviso = f };

// Textura por nombre; rep = [metros por repetición en x, en y] para las que se repiten (piso, pared, madera)
export function tex(nombre, rep) {
  const k = nombre + (rep ? rep.join('x') : '');
  if (cache.has(k)) return cache.get(k);
  const t = cargador.load(`tex/${nombre}.webp${V}`, () => aviso());
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (rep) t.repeat.set(1 / rep[0], 1 / rep[1]);
  cache.set(k, t);
  return t;
}

/* Qué productos van en cada mueble según el negocio */
const MED = new Set(['botica', 'vitaminas', 'consultorio', 'vet', 'masajes', 'barberia']);
const LIB = new Set(['libreria', 'oficina', 'casa']);
export function productosDe(o, neg) {
  if (o.id === 'librero') return 'libros';
  if (MED.has(neg)) return 'medicinas';
  if (LIB.has(neg)) return 'libros';
  if (neg === 'ferre' || neg === 'tecnico') return 'ferreteria';
  return 'abarrotes';
}
export function banda(tipo, nivel) {
  return tipo === 'libros' ? tex('libros' + (1 + (nivel % 3))) : tex(tipo);
}

/* Modelos 3D reales (.glb) */
let gltf = null;
const modelos = new Map();
async function loader() {
  if (gltf) return gltf;
  const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/libs/meshopt_decoder.module.js')
  ]);
  gltf = new GLTFLoader(); gltf.setMeshoptDecoder(MeshoptDecoder);
  return gltf;
}
export function modelo(nombre) {
  if (!modelos.has(nombre)) modelos.set(nombre, loader().then(l => l.loadAsync(`glb/${nombre}.glb${V}`)).then(g => {
    g.scene.traverse(m => {
      if (!m.isMesh) return;
      m.castShadow = true; m.receiveShadow = true;
      const mt = m.material;
      if (mt.name === 'wings') m.visible = false; // la planta trae mariposas: se quitan
      if (mt.emissive) { mt.emissive.set(0); mt.emissiveMap = null }
    });
    return g.scene;
  }));
  return modelos.get(nombre);
}
// Pone una copia del modelo dentro de "grupo", escalada para medir exactamente w × h × d
export function ponerModelo(grupo, nombre, w, d, h, alListo) {
  modelo(nombre).then(base => {
    const m = base.clone(true);
    const caja = new THREE.Box3().setFromObject(m), tam = caja.getSize(new THREE.Vector3()), c = caja.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -caja.min.y, -c.z);
    const s = new THREE.Group(); s.add(m); s.scale.set(w / tam.x, h / tam.y, d / tam.z);
    if (alListo) alListo();
    grupo.add(s); aviso();
  }).catch(() => {});
}
