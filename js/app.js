import { CAT, NEGOCIOS, FUENTES, COL } from './catalogo.js?v=1.4.0';
import { PLANO_INICIAL, ETQ, colocar, construir, revisar, chocan, iman, acomodar, buscarLugar, areaOcupada, distanciaMuros } from './plano.js?v=1.4.0';
import { crearVista2D } from './vista2d.js?v=1.4.0';
import { generarDXF } from './dxf.js?v=1.4.0';

const VERSION = '1.4.0';
const LS = 'alq-estado-v1';
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cm = m => Math.round(m * 1000) / 10;
const fmtCm = m => (Math.round(m * 1000) / 10).toString();
const dims = o => `${fmtCm(o.w)} × ${fmtCm(o.d)} × ${fmtCm(o.h)} cm`;
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : NaN };
let nUid = 0; const uid = () => 'u' + Date.now().toString(36) + (nUid++).toString(36) + Math.random().toString(36).slice(2, 5);

/* ---------- Íconos ---------- */
const IC = {
  casa: '<path d="M3.5 9.5L10 4l6.5 5.5v7h-13z"/><path d="M8 16.5v-4h4v4"/>',
  bodega: '<path d="M3 8l1.4-4.5h11.2L17 8"/><path d="M3 8a2.3 2.3 0 0 0 4.7 0 2.3 2.3 0 0 0 4.6 0A2.3 2.3 0 0 0 17 8"/><path d="M4.2 10.2v6.3h11.6v-6.3"/>',
  carrito: '<path d="M2.5 4h2l1.8 8.5h8.2l1.8-6.2H5.5"/><circle cx="8" cy="15.5" r="1.1"/><circle cx="13.5" cy="15.5" r="1.1"/>',
  llave: '<path d="M12.6 3.4a3.8 3.8 0 0 0-4.7 4.9L3.6 12.6a1.6 1.6 0 0 0 2.3 2.3l4.3-4.3a3.8 3.8 0 0 0 4.9-4.7l-2.3 2.3-2.2-.6-.6-2.2z"/>',
  laptop: '<rect x="4.5" y="4.5" width="11" height="7.5" rx="1"/><path d="M2.5 15.5h15"/>',
  gancho: '<path d="M10 7.8V7c0-1.1 1.6-1.4 1.6-2.6a1.6 1.6 0 0 0-3.2 0"/><path d="M10 7.8L3 13.5h14z"/>',
  huella: '<circle cx="6.2" cy="8" r="1.4"/><circle cx="9" cy="5.3" r="1.4"/><circle cx="12.5" cy="5.6" r="1.4"/><circle cx="14.8" cy="8.6" r="1.4"/><path d="M7 14.5c0-2.4 1.6-4.3 3.4-4.3s3.4 1.9 3.4 4.3c0 1.2-1 1.6-1.9 1.4-1-.2-1.4-.5-1.5-.5s-.5.3-1.5.5c-.9.2-1.9-.2-1.9-1.4z"/>',
  capsula: '<rect x="3" y="7.3" width="14" height="5.4" rx="2.7" transform="rotate(-35 10 10)"/><path d="M8.4 7.7l3.2 4.6"/>',
  taza: '<path d="M4 8h10v3.5a4.5 4.5 0 0 1-4.5 4.5h-1A4.5 4.5 0 0 1 4 11.5z"/><path d="M14 9.2h1.2a2 2 0 0 1 0 4H14M7.5 3.5v2M10.5 3.5v2"/>',
  cruz: '<rect x="3.5" y="3.5" width="13" height="13" rx="3"/><path d="M10 6.8v6.4M6.8 10h6.4"/>',
  tijera: '<circle cx="5.5" cy="14.5" r="2"/><circle cx="14.5" cy="14.5" r="2"/><path d="M7 13l8-9.5M13 13L5 3.5"/>',
  estetoscopio: '<path d="M5 3.5v4a3.5 3.5 0 0 0 7 0v-4"/><path d="M8.5 11v1.5a3.5 3.5 0 0 0 7 0V11"/><circle cx="15.5" cy="9.5" r="1.5"/>',
  maletin: '<rect x="3" y="6.5" width="14" height="9.5" rx="1.6"/><path d="M7.5 6.5V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5M3 10.5h14"/>',
  libro: '<path d="M10 5.5C8.5 4.3 6 4 3.5 4.5v11c2.5-.5 5 0 6.5 1.2 1.5-1.2 4-1.7 6.5-1.2v-11C14 4 11.5 4.3 10 5.5zM10 5.5v11.2"/>',
  mano: '<path d="M7 10V5a1.2 1.2 0 0 1 2.4 0v4.5M9.4 9V3.8a1.2 1.2 0 0 1 2.4 0V9M11.8 9V4.8a1.2 1.2 0 0 1 2.4 0V11c0 3.2-2 5.5-5 5.5-2 0-3.2-1-4.3-2.6L3.6 11.5a1.2 1.2 0 0 1 2-1.3L7 12"/>',
  fruta: '<path d="M10 6.5c-1.2-.9-4.8-1.3-5.6 2.5-.6 3 1.6 7.5 3.8 7.5 1 0 1.2-.5 1.8-.5s.8.5 1.8.5c2.2 0 4.4-4.5 3.8-7.5-.8-3.8-4.4-3.4-5.6-2.5z"/><path d="M10 6.5c0-1.5.5-2.6 1.8-3.2"/>'
};
const icono = k => `<svg viewBox="0 0 20 20" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${IC[k] || IC.casa}</svg>`;

/* ---------- Estado ---------- */
function nuevoEstado() { return { v: 1, ter: 4, plano: Object.assign({}, PLANO_INICIAL), cur: 'casa', negs: {}, extra: [], vista: '2d', iman: true, fijo2d: false, fijo3d: true, tuto: 0, t: Date.now() } }
/* Terreno nuevo ABCD (la mitad derecha del croquis): si lo guardado tiene el croquis completo,
   se cambia el terreno y se vuelven a ubicar todos los muebles. */
function migrar(e) {
  if (!e || (e.ter || 1) >= 4) return false;
  // v1.4.0: se empieza de nuevo con el terreno ABCD y la distribución propuesta de cada negocio
  e.ter = 4;
  e.plano = Object.assign({}, PLANO_INICIAL, { muro: e.plano?.muro || PLANO_INICIAL.muro, alto: e.plano?.alto || PLANO_INICIAL.alto }, e.plano?.calle ? { calle: e.plano.calle } : {});
  const g = construir(e.plano);
  const propios = new Set((e.extra || []).map(d => d.id));
  const reacomodar = items => { for (const o of items) { o.x = null; o.y = null; o.rot = 0 } acomodar(g, items); return items.filter(o => o.x != null) };
  for (const id of Object.keys(e.negs || {})) {
    if (!propios.has(id)) { delete e.negs[id]; continue }   // los negocios de la web vuelven a su propuesta
    e.negs[id].items = reacomodar(e.negs[id].items || []); // los propios: se reubican y se quita lo que no entra
  }
  for (const d of e.extra || []) if (d.base) d.base = reacomodar(d.base);
  e.t = Date.now();
  return true;
}
let migrado = false;
function cargar() {
  try { const e = JSON.parse(localStorage.getItem(LS)); if (e && e.plano && e.negs) { migrado = migrar(e); return Object.assign(nuevoEstado(), e) } } catch (e) {}
  return null;
}
let E = cargar() || nuevoEstado();
let G = construir(E.plano) || construir(PLANO_INICIAL);
let sel = null, est = {}, v3d = null, cargando3d = null;

const defs = () => NEGOCIOS.concat(E.extra || []);
const def = id => defs().find(n => n.id === id) || NEGOCIOS[0];
function nuevoItem(id, z) {
  const c = CAT[id];
  const o = { uid: uid(), id, n: c.n, k: c.k, w: c.w / 100, d: c.d / 100, h: c.h / 100, e: (c.e || 0) / 100, c: c.c, z: z || zonaDe(id), x: null, y: null, rot: 0 };
  if (c.niv) o.niv = c.niv; if (c.cerrado) o.cerrado = 1; if (c.frio) o.frio = 1;
  return o;
}
const PARED = new Set(['estante', 'refri', 'congeladora', 'refrigeradora', 'panel', 'repisa', 'tocador', 'puestob', 'lavacab', 'espejo', 'barrap', 'probador', 'jaula', 'banera', 'archivador', 'ropero', 'rack', 'tv', 'cocina', 'lavadero', 'inodoro', 'lavatorio', 'sofa', 'cama', 'velador', 'escritorio', 'mesatec', 'fotocop', 'escalonado', 'jabas', 'barracafe', 'banca', 'espaldera', 'vitrinav', 'dispensador', 'carrito']);
const zonaDe = id => id === 'bano' ? 'bano' : PARED.has(CAT[id].k) ? 'pared' : 'centro';
function propuesta(id) {
  const d = def(id);
  if (d.base) return { items: d.base.map(o => Object.assign({}, o, { uid: uid() })) };
  if (d.lay) {                                               // distribución hecha a mano para este terreno
    const items = d.lay.map(s => colocar(G, nuevoItem(s.id, s.id === 'bano' ? 'bano' : s.m ? 'pared' : 'centro'), s));
    const r = revisar(G, items), malos = items.filter(o => r[o.uid] !== 'ok');
    if (malos.length) {                                      // con otras medidas del terreno: lo que no calce se acomoda solo
      const buenos = items.filter(o => r[o.uid] === 'ok');
      for (const o of malos) { o.x = null; o.y = null; o.rot = 0 }
      acomodar(G, malos, buenos);
    }
    return { items: items.filter(o => o.x != null) };
  }
  const items = [];
  for (const p of d.items) for (let i = 0; i < p.n; i++) items.push(nuevoItem(p.id, p.z));
  acomodar(G, items);
  return { items: items.filter(o => o.x != null) };          // la propuesta solo trae lo que entra en este terreno
}
function neg(id = E.cur) {
  if (!E.negs[id]) E.negs[id] = propuesta(id);
  return E.negs[id];
}
const item = u => neg().items.find(o => o.uid === u);

let tGuardar = 0;
function guardar(ya) {
  E.t = Date.now();
  clearTimeout(tGuardar);
  const f = () => { try { localStorage.setItem(LS, JSON.stringify(E)) } catch (e) {} ; if (window.ALQ.onChange) window.ALQ.onChange() };
  if (ya) f(); else tGuardar = setTimeout(f, 250);
}

/* ---------- Vistas ---------- */
const v2d = crearVista2D($('v2d'), {
  item, seleccionar: u => seleccionar(u), arrastrar, girar,
  medida: d => { if (d != null) toast(`${d.toFixed(2)} m`) },
  fijo: () => fijo(), avisoFijo: () => avisoFijo(), dibujado: () => posAng()
});

/* ---------- Candado (fijar muebles): memoria propia en 2D y en 3D ---------- */
const fijo = () => E.vista !== '2d' ? E.fijo3d : E.fijo2d;   // 3D y 4D comparten el candado
function pintarFijo() {
  const f = fijo();
  $('bFijo').setAttribute('aria-pressed', f);
  $('bFijo').setAttribute('aria-label', f ? 'Muebles fijos. Toca para poder moverlos' : 'Fijar todos los muebles');
  $('fijoTx').textContent = f ? 'Fijo' : 'Mover';
  document.body.classList.toggle('fijo-on', f);
  if (f && arrastrando()) for (const u in arr) arrastrar(u, null, null, 'fin');
}
const arrastrando = () => Object.keys(arr).length > 0;
$('bFijo').onclick = () => {
  if (E.vista !== '2d') E.fijo3d = !E.fijo3d; else E.fijo2d = !E.fijo2d;
  guardar(); pintarFijo(); pintar();
  const nom = { '2d': '2D', '3d': '3D', '4d': '3D-2' }[E.vista];
  toast(fijo() ? `Todo fijo en ${nom}` : `Ya puedes mover los muebles en ${nom}`);
};
let tAviso = 0;
function avisoFijo() {
  const b = $('bFijo'); b.classList.remove('late'); void b.offsetWidth; b.classList.add('late');
  if (Date.now() - tAviso > 2500) { tAviso = Date.now(); toast('Está fijo. Toca el candado para mover') }
}

/* ---------- Botón de ángulo junto al mueble ---------- */
function posAng() {
  if (E.vista !== '2d' || !sel) return;
  const r = v2d.rectDe(sel); const b = $('bAng');
  if (!r) return;
  if (r.right < 0 || r.left > innerWidth || r.bottom < 60 || r.top > innerHeight - 150) { b.style.visibility = 'hidden'; return }
  const x = Math.max(56, Math.min(innerWidth - 56, r.left + r.width / 2));
  const y = Math.max(118, Math.min(innerHeight - 200, r.bottom + 10));
  b.style.visibility = '';
  b.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, 0)`;
}
const SUG = [-90, -45, -15, 15, 45, 90, 180];
function abrirAng() {
  const o = item(sel); if (!o) return;
  if (fijo()) { avisoFijo(); return }
  $('angAhora').textContent = `Ahora: ${(+(o.rot || 0).toFixed(1))}°`;
  $('angIn').value = '';
  $('angSug').innerHTML = SUG.map(a => `<button type="button" data-a="${a}">${a > 0 ? '+' : ''}${a}°</button>`).join('');
  $('angSug').querySelectorAll('button').forEach(b => b.onclick = () => girarAng(+b.dataset.a));
  $('angPop').hidden = false;
  setTimeout(() => $('angIn').focus(), 30);
}
function cerrarAng() { $('angPop').hidden = true; $('angIn').blur() }
function girarAng(a) {
  const o = item(sel); if (!o || !isFinite(a) || !a) return;
  o.rot = +((((o.rot || 0) - a) % 360 + 360) % 360).toFixed(2); // + antihorario en pantalla
  guardar(); pintar(); if (abierta === 'hEdit') llenarEdit();
  $('angAhora').textContent = `Ahora: ${(+o.rot.toFixed(1))}°`;
  toast(`Girado ${a > 0 ? '+' : ''}${a}° · ${a > 0 ? 'antihorario' : 'horario'}`);
}
$('bAng').onclick = abrirAng;
$('angX').onclick = cerrarAng;
$('angPm').onclick = () => { const v = $('angIn').value.trim(); $('angIn').value = v.startsWith('-') ? v.slice(1) : '-' + v; $('angIn').focus() };
$('angPop').onsubmit = ev => { ev.preventDefault(); const a = num($('angIn').value); if (!isFinite(a)) { $('angIn').focus(); return } girarAng(a); cerrarAng() };
const arr = {};
function arrastrar(u, x, y, fase) {
  const o = item(u); if (!o) return;
  if (fase !== 'fin' && fijo()) return;
  if (fase === 'fin') {
    delete arr[u];
    o.x = +o.x.toFixed(4); o.y = +o.y.toFixed(4); o.rot = +((o.rot || 0) % 360).toFixed(2);
    guardar(); pintar(); return;
  }
  if (!(u in arr)) arr[u] = o.rot || 0;
  o.x = x; o.y = y; o.rot = arr[u];
  if (E.iman) iman(G, o);
  pedirPintar();
}
function girar(u, a, fase) {
  const o = item(u); if (!o) return;
  if (fase !== 'fin' && fijo()) return;
  if (fase === 'fin') { guardar(); pintar(); return }
  a = ((a % 360) + 360) % 360;
  let r = Math.round(a / 15) * 15;
  for (const mu of G.muros) { const mr = ((mu.rot % 360) + 360) % 360; if (Math.abs(((a - mr + 540) % 360) - 180) < 5) r = mr }
  o.rot = +(r % 360).toFixed(2);
  pedirPintar();
}
function seleccionar(u) {
  sel = u && item(u) ? u : null;
  if (!sel && abierta === 'hEdit') cerrarHoja();
  pintar();
  if (sel && abierta === 'hEdit') llenarEdit();
}

let pend = false;
function pedirPintar() { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; pintar() }) }
function pintar() {
  const N = neg();
  est = revisar(G, N.items);
  v2d.poner(G, E.plano, N.items, est, sel);
  if (v3d && E.vista !== '2d') v3d.ponerMuebles(N.items, est, sel, E.cur);
  // título
  const d = def(E.cur);
  $('titTx').textContent = d.n; $('titIc').innerHTML = icono(d.ic);
  // estado general
  const c = { choca: 0, fuera: 0, sin: 0 };
  for (const k in est) if (c[est[k]] != null) c[est[k]]++;
  const partes = [];
  if (c.choca) partes.push(`${c.choca} ${c.choca === 1 ? 'choca' : 'chocan'}`);
  if (c.fuera) partes.push(`${c.fuera} fuera`);
  if (c.sin) partes.push(`${c.sin} no ${c.sin === 1 ? 'entró' : 'entraron'}`);
  const pct = Math.round(areaOcupada(N.items) / G.area * 100);
  $('pillTx').textContent = partes.length ? partes.join(' · ') : `Todo cabe · ${pct}% del piso`;
  $('pill').classList.toggle('mal', partes.length > 0);
  // barra del elegido
  const o = sel && item(sel);
  $('selbar').hidden = !o || o.x == null;
  $('bAng').hidden = !o || o.x == null || v2d.midiendo;
  $('bAng').classList.toggle('off', fijo());
  if (!o && !$('angPop').hidden) cerrarAng();
  if (o && o.x != null) {
    $('sbNom').textContent = o.n;
    const e = est[o.uid];
    $('sbDim').textContent = dims(o) + (e === 'choca' ? ' · choca' : e === 'fuera' ? ' · se sale' : '');
  }
  if (abierta === 'hLista') pintarLista();
  if (abierta === 'hEdit' && o) pintarDist(o);
}

/* ---------- 2D / 3D / 3D-2 (el 3D-2, internamente «4d», es el mismo 3D con acabados reales) ---------- */
async function modo(m) {
  E.vista = m; guardar();
  const tres = m !== '2d';
  $('b2d').setAttribute('aria-selected', m === '2d'); $('b3d').setAttribute('aria-selected', m === '3d'); $('b4d').setAttribute('aria-selected', m === '4d');
  $('v2d').hidden = tres; $('v3d').hidden = !tres;
  $('ctl2d').hidden = tres; $('ctl3d').hidden = !tres;
  document.body.classList.toggle('v4d', m === '4d');
  pintarFijo(); $('bAng').style.visibility = tres ? 'hidden' : '';
  if (tres) {
    if (v2d.midiendo) { v2d.medir(false); $('bMedir').setAttribute('aria-pressed', 'false') }
    await asegurar3D();
    if (!v3d || E.vista !== m) return;
    v3d.realista(m === '4d');
    v3d.mostrar(true); pintar();
  } else if (v3d) v3d.mostrar(false);
}
async function asegurar3D() {
  if (v3d) return v3d;
  if (!cargando3d) cargando3d = import('./vista3d.js?v=1.4.0').then(m => {
    v3d = m.crearVista3D($('v3d'), { item, seleccionar: u => seleccionar(u), arrastrar, fijo: () => fijo(), anguloEl: $('bAng'),
      items: () => neg().items, estatura: () => E.estatura || 1.65, fijarEstatura: h => { E.estatura = h; guardar() }, paseo: on => { document.body.classList.toggle('paseo-on', on); if (on) { seleccionar(null); cerrarHoja() } } });
    v3d.armarCasa(G, E.plano); v3d.mostrar(true); v3d.vista('iso', false);
    return v3d;
  }).catch(() => { cargando3d = null; toast('No se pudo cargar el 3D. Revisa tu conexión.'); modo('2d') });
  return cargando3d;
}
$('b2d').onclick = () => modo('2d');
$('b3d').onclick = () => modo('3d');
$('b4d').onclick = () => modo('4d');
document.querySelectorAll('#ctl3d [data-v]').forEach(b => b.onclick = () => v3d && v3d.vista(b.dataset.v));
$('bMuros').onclick = () => { if (!v3d) return; const a = v3d.altoMuros > 0.9 ? 0.36 : 1; v3d.alturaMuros(a); $('bMuros').setAttribute('aria-pressed', a < 1) };
$('zIn').onclick = () => v2d.zoom(1.25); $('zOut').onclick = () => v2d.zoom(0.8); $('zFit').onclick = () => v2d.encuadrar();
$('bMedir').onclick = () => { const on = !v2d.midiendo; v2d.medir(on); $('bMedir').setAttribute('aria-pressed', on); if (on) { seleccionar(null); toast('Toca dos puntos para medir') } };
$('bIman').onclick = () => { E.iman = !E.iman; $('bIman').setAttribute('aria-pressed', E.iman); guardar(); toast(E.iman ? 'Imán activado: se pegan a las paredes' : 'Imán desactivado') };
$('pill').onclick = () => abrir('hLista');

/* ---------- Barra del mueble elegido ---------- */
function rotar(da) { const o = item(sel); if (!o) return; if (fijo()) { avisoFijo(); return } o.rot = (((o.rot || 0) + da) % 360 + 360) % 360; guardar(); pintar(); if (abierta === 'hEdit') llenarEdit() }
$('sbIzq').onclick = () => rotar(-15); $('sbDer').onclick = () => rotar(15);
$('sbMed').onclick = $('sbInfo').onclick = () => abrir('hEdit');
$('sbDup').onclick = () => {
  const o = item(sel); if (!o) return;
  const c = Object.assign({}, o, { uid: uid() });
  c.x = o.x + 0.2; c.y = o.y + 0.2;
  const N = neg(); N.items.push(c);
  acomodarUno(c, N, o);
  sel = c.uid; guardar(); pintar();
};
$('sbDel').onclick = () => { const N = neg(); N.items = N.items.filter(o => o.uid !== sel); sel = null; cerrarHoja(); guardar(); pintar() };

function acomodarUno(o, N, cerca) {
  const otros = N.items.filter(p => p.uid !== o.uid);
  const prueba = Object.assign({}, o);
  if (o.z !== 'centro' || !cerca) { acomodar(G, [prueba], otros); if (prueba.x != null) { Object.assign(o, prueba); return true } }
  if (cerca) { o.x = cerca.x; o.y = cerca.y; o.rot = cerca.rot }
  const ok = buscarLugar(G, N.items, o);
  if (!ok) toast('No hay espacio libre: quedó en rojo. Muévelo o quita algo.');
  return ok;
}

/* ---------- Hojas ---------- */
let abierta = null;
function abrir(id) {
  cerrarMenu();
  if (abierta && abierta !== id) $(abierta).hidden = true;
  abierta = id; $(id).hidden = false;
  // Medidas del terreno no tapa el plano: se puede mover y acercar mientras se escribe; se cierra con la X
  const libre = id === 'hTer';
  $('hojaBg').hidden = libre; document.body.classList.toggle('ter-on', libre);
  if (libre) requestAnimationFrame(() => ponerTer());
  if (id === 'hCat') llenarCat();
  if (id === 'hEdit') llenarEdit();
  if (id === 'hLista') { marcados.clear(); pintarLista() }
  if (id === 'hNeg') pintarNegs();
  if (id === 'hTer') llenarTer();
  if (id === 'hCero') { const N = neg(); $('ceroTx').textContent = `Se quitan los ${N.items.length} muebles de «${def(E.cur).n}». Los otros negocios no cambian.`; $('ceroBano').hidden = !N.items.some(o => o.k === 'bano') }
  if (id === 'hExp') $('exDxfS').textContent = `${def(E.cur).n}: muros, baño y muebles`;
  if (id === 'hId' && window.ALQ.onIdView) window.ALQ.onIdView();
}
function cerrarHoja() {
  if (abierta) $(abierta).hidden = true; abierta = null; $('hojaBg').hidden = true; if (document.activeElement) document.activeElement.blur?.();
  document.body.classList.remove('ter-on');
}
$('hojaBg').onclick = cerrarHoja;
document.querySelectorAll('[data-cerrar]').forEach(b => b.onclick = cerrarHoja);

/* Ventana flotante de Medidas del terreno: se arrastra por su título y recuerda dónde quedó (en este dispositivo) */
const TPOS = 'alq-ter-pos';
function ponerTer(x, y) {
  const el = $('hTer'), w = el.offsetWidth, h = el.offsetHeight;
  if (x == null) {
    let g = null; try { g = JSON.parse(localStorage.getItem(TPOS)) } catch (e) {}
    if (g && isFinite(g.x)) { x = g.x * innerWidth; y = g.y * innerHeight }
    else if (innerWidth >= 860) { x = innerWidth - w - 76; y = 72 }
    else { x = 12; y = innerHeight - h - 12 }
  }
  const top = 56, x1 = Math.max(8, innerWidth - w - 8), y1 = Math.max(top, innerHeight - Math.min(h, 120));
  x = Math.max(8, Math.min(x1, x)); y = Math.max(top, Math.min(y1, y));
  el.style.setProperty('--tx', Math.round(x) + 'px'); el.style.setProperty('--ty', Math.round(y) + 'px');
  return [x, y];
}
(() => {
  const el = $('hTer'), asa = el.querySelector('.h-top');
  let ini = null;
  asa.addEventListener('pointerdown', ev => {
    if (!document.body.classList.contains('ter-on') || ev.target.closest('button')) return;
    const r = el.getBoundingClientRect();
    ini = { id: ev.pointerId, dx: ev.clientX - r.left, dy: ev.clientY - r.top };
    el.classList.add('arrastra'); try { asa.setPointerCapture(ev.pointerId) } catch (e) {} ev.preventDefault();
  });
  asa.addEventListener('pointermove', ev => { if (ini && ev.pointerId === ini.id) ponerTer(ev.clientX - ini.dx, ev.clientY - ini.dy) });
  const fin = ev => {
    if (!ini || ev.pointerId !== ini.id) return;
    ini = null; el.classList.remove('arrastra');
    const r = el.getBoundingClientRect();
    try { localStorage.setItem(TPOS, JSON.stringify({ x: r.left / innerWidth, y: r.top / innerHeight })) } catch (e) {}
  };
  asa.addEventListener('pointerup', fin); asa.addEventListener('pointercancel', fin);
  addEventListener('resize', () => { if (document.body.classList.contains('ter-on')) { const r = el.getBoundingClientRect(); ponerTer(r.left, r.top) } });
})();

/* Catálogo */
const GRUPOS = ['Este negocio', 'Estantes', 'Mostradores', 'Frío', 'Cafetería', 'Barbería', 'Ropa', 'Salud', 'Oficina', 'Frutas', 'Casa', 'General'];
let grupo = 'Este negocio';
function mini(c) {
  const k = 44 / Math.max(c.w, c.d), w = Math.max(6, c.w * k), d = Math.max(4, c.d * k);
  return `<svg viewBox="0 0 48 48" width="48" height="48"><rect x="${(48 - w) / 2}" y="${(48 - d) / 2}" width="${w}" height="${d}" rx="2" fill="${c.c}" stroke="rgba(22,32,42,.4)" stroke-width="1"/><line x1="${(48 - w) / 2 + 1}" y1="${(48 - d) / 2}" x2="${(48 + w) / 2 - 1}" y2="${(48 - d) / 2}" stroke="rgba(22,32,42,.6)" stroke-width="2" stroke-linecap="round"/></svg>`;
}
function llenarCat() {
  $('catG').innerHTML = GRUPOS.map(g => `<button aria-pressed="${g === grupo}" data-g="${g}">${g}</button>`).join('');
  $('catG').querySelectorAll('button').forEach(b => b.onclick = () => { grupo = b.dataset.g; $('catQ').value = ''; llenarCat() });
  const q = $('catQ').value.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  let ids = Object.keys(CAT);
  const d = def(E.cur);
  if (q) ids = ids.filter(id => CAT[id].n.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').includes(q));
  else if (grupo === 'Este negocio') ids = d.items ? [...new Set(d.items.map(p => p.id).filter(i => i !== 'bano'))].concat(['persona', 'planta', 'tacho'].filter(i => !d.items.some(p => p.id === i))) : ids;
  else ids = ids.filter(id => CAT[id].g === grupo);
  $('catL').innerHTML = ids.map(id => { const c = CAT[id]; return `<button class="ci" data-id="${id}"><span class="sw">${mini(c)}</span><b>${esc(c.n)}</b><span>${c.w} × ${c.d} × ${c.h} cm</span></button>` }).join('');
  $('catL').querySelectorAll('.ci').forEach(b => b.onclick = () => agregar(b.dataset.id));
}
$('catQ').oninput = () => llenarCat();
function agregar(id) {
  const N = neg();
  const dz = (def(E.cur).items || []).find(p => p.id === id);
  const o = nuevoItem(id, dz ? dz.z : undefined);
  N.items.push(o);
  acomodarUno(o, N);
  sel = o.uid; cerrarHoja(); guardar(); pintar();
  toast(`${o.n} · ${dims(o)}`);
}
$('bAdd').onclick = () => abrir('hCat');
$('bLista').onclick = () => abrir('hLista');

/* Medidas del mueble */
const COLORES = Object.values(COL);
function llenarEdit() {
  const o = item(sel); if (!o) { cerrarHoja(); return }
  $('edTit').textContent = 'Medidas';
  $('edN').value = o.n;
  $('edW').value = fmtCm(o.w); $('edD').value = fmtCm(o.d); $('edH').value = fmtCm(o.h);
  $('edE').value = fmtCm(o.e || 0); $('edR').value = (+(o.rot || 0).toFixed(1)).toString();
  const cols = COLORES.includes(o.c) ? COLORES : [o.c].concat(COLORES);
  $('edC').innerHTML = cols.map(c => `<button style="background:${c}" data-c="${c}" aria-pressed="${c === o.c}" aria-label="Color"></button>`).join('');
  $('edC').querySelectorAll('button').forEach(b => b.onclick = () => { o.c = b.dataset.c; guardar(); pintar(); llenarEdit() });
  const c = CAT[o.id] || {};
  const f = FUENTES[c.f] || FUENTES.tipica;
  const tienda = c.w ? `${c.w} × ${c.d} × ${c.h} cm` : '';
  $('edF').innerHTML = c.f && c.f !== 'tipica'
    ? `Medida de tienda: ${tienda} · ${f[1] ? `<a href="${f[1]}" target="_blank" rel="noopener">${esc(f[0])}</a>` : esc(f[0])}${c.nota ? `<br>${esc(c.nota)}` : ''}`
    : `Medida típica: ${tienda}. Revísala con el mueble que vayas a comprar.${c.nota ? `<br>${esc(c.nota)}` : ''}`;
  $('edCopia').innerHTML = defs().filter(n => n.id !== E.cur).map(n => `<button data-n="${n.id}">${esc(n.n)}</button>`).join('');
  $('edCopia').querySelectorAll('button').forEach(b => b.onclick = () => copiarA([o], b.dataset.n));
  pintarDist(o);
}
function pintarDist(o) {
  if (o.x == null) { $('edDist').innerHTML = ''; return }
  const ds = distanciaMuros(G, o).filter(x => x.id !== 'AB' || x.d < 1.5);
  $('edDist').innerHTML = ds.map(x => `<span class="${x.d < 0.6 ? 'cerca' : ''}">${x.id === 'AB' ? 'Portón' : x.n.replace('Pared ', '')}: ${x.d < 0 ? 'se sale ' + Math.abs(x.d * 100).toFixed(0) + ' cm' : (x.d * 100).toFixed(0) + ' cm'}</span>`).join('');
}
function campo(idEl, fn) {
  $(idEl).addEventListener('input', () => { const o = item(sel); if (!o) return; fn(o, $(idEl).value); pintar() });
  $(idEl).addEventListener('change', () => { guardar(); const o = item(sel); if (o) llenarEdit() });
}
campo('edN', (o, v) => { o.n = v.trim() || (CAT[o.id] || {}).n || 'Mueble' });
campo('edW', (o, v) => { const n = num(v); if (n >= 1 && n <= 2000) o.w = n / 100 });
campo('edD', (o, v) => { const n = num(v); if (n >= 1 && n <= 2000) o.d = n / 100 });
campo('edH', (o, v) => { const n = num(v); if (n >= 1 && n <= 400) o.h = n / 100 });
campo('edE', (o, v) => { const n = num(v); if (n >= 0 && n <= 350) o.e = n / 100 });
campo('edR', (o, v) => { const n = num(v); if (isFinite(n)) o.rot = ((n % 360) + 360) % 360 });
$('edAlin').onclick = () => {
  const o = item(sel); if (!o || o.x == null) return;
  let mejor = null;
  for (const mu of G.muros) {
    const t = (o.x - mu.p[0]) * mu.u[0] + (o.y - mu.p[1]) * mu.u[1];
    const dd = Math.abs((o.x - mu.p[0]) * mu.out[0] + (o.y - mu.p[1]) * mu.out[1]);
    if (!mejor || dd < mejor.dd) mejor = { mu, t, dd };
  }
  const { mu } = mejor, t = Math.max(o.w / 2, Math.min(mu.L - o.w / 2, mejor.t)), k = o.d / 2 + 0.002;
  o.rot = mu.rot; o.x = mu.p[0] + mu.u[0] * t + mu.inn[0] * k; o.y = mu.p[1] + mu.u[1] * t + mu.inn[1] * k;
  guardar(); pintar(); llenarEdit();
};
$('edRest').onclick = () => {
  const o = item(sel), c = o && CAT[o.id]; if (!c) return;
  Object.assign(o, { n: c.n, w: c.w / 100, d: c.d / 100, h: c.h / 100, e: (c.e || 0) / 100, c: c.c });
  guardar(); pintar(); llenarEdit();
};

function copiarA(lista, destino) {
  const N = neg(destino), nombre = def(destino).n;
  for (const o of lista) {
    const c = Object.assign({}, o, { uid: uid() });
    N.items.push(c);
    const libre = c.x != null && revisarUno(N, c);
    if (!libre) { c.x = null; c.y = null; const prueba = Object.assign({}, c); acomodar(G, [prueba], N.items.filter(p => p.uid !== c.uid)); if (prueba.x != null) Object.assign(c, prueba); else buscarLugar(G, N.items, c) }
  }
  guardar();
  toast(`${lista.length === 1 ? lista[0].n : lista.length + ' muebles'} → ${nombre}`);
}
function revisarUno(N, c) { const r = revisar(G, N.items); return r[c.uid] === 'ok' }

/* Lista */
const marcados = new Set();
const ESTXT = { ok: 'Cabe', choca: 'Choca', fuera: 'Se sale', sin: 'No entró' };
function pintarLista() {
  const N = neg();
  const area = areaOcupada(N.items);
  const malos = N.items.filter(o => est[o.uid] !== 'ok').length;
  $('lsRes').textContent = `${N.items.length} muebles · ocupan ${area.toFixed(2)} de ${G.area.toFixed(2)} m² · ${malos ? malos + ' con problema' : 'todo cabe'}`;
  const orden = { sin: 0, fuera: 1, choca: 2, ok: 3 };
  const filas = [...N.items].sort((a, b) => orden[est[a.uid]] - orden[est[b.uid]] || a.n.localeCompare(b.n));
  $('lsL').innerHTML = filas.map(o => `<div class="lr"><input type="checkbox" data-u="${o.uid}" ${marcados.has(o.uid) ? 'checked' : ''} aria-label="Marcar"><i class="sw" style="background:${o.c}"></i><button class="tx" data-u="${o.uid}"><b>${esc(o.n)}</b><small>${dims(o)}</small></button><span class="tag ${est[o.uid]}">${ESTXT[est[o.uid]]}</span></div>`).join('');
  $('lsL').querySelectorAll('input').forEach(i => i.onchange = () => { i.checked ? marcados.add(i.dataset.u) : marcados.delete(i.dataset.u); pintarAcc() });
  $('lsL').querySelectorAll('button.tx').forEach(b => b.onclick = () => {
    const o = item(b.dataset.u);
    if (o.x == null) { const ok = acomodarUno(o, neg()); guardar() }
    sel = o.uid; cerrarHoja(); pintar();
  });
  pintarAcc();
}
function pintarAcc() {
  $('lsAcc').hidden = !marcados.size;
  $('lsN').textContent = `${marcados.size} marcado${marcados.size === 1 ? '' : 's'} · copiar a:`;
  $('lsCopia').innerHTML = defs().filter(n => n.id !== E.cur).map(n => `<button data-n="${n.id}">${esc(n.n)}</button>`).join('');
  $('lsCopia').querySelectorAll('button').forEach(b => b.onclick = () => copiarA(neg().items.filter(o => marcados.has(o.uid)), b.dataset.n));
}
$('lsDel').onclick = () => { const N = neg(); N.items = N.items.filter(o => !marcados.has(o.uid)); if (marcados.has(sel)) sel = null; marcados.clear(); guardar(); pintar() };

/* Negocios */
function resumenNeg(id) {
  const N = neg(id), r = revisar(G, N.items);
  const malos = N.items.filter(o => r[o.uid] !== 'ok').length;
  return { n: N.items.length, malos, pct: Math.round(areaOcupada(N.items) / G.area * 100) };
}
function pintarNegs() {
  $('ngL').innerHTML = defs().map(d => {
    const r = resumenNeg(d.id);
    return `<button class="ng" data-n="${d.id}" aria-current="${d.id === E.cur}">${icono(d.ic)}<b>${esc(d.n)}</b><span>${r.n} muebles · ${r.pct}% del piso</span><span class="${r.malos ? 'mal' : 'okk'}">${r.malos ? r.malos + ' no caben' : 'Todo cabe'}</span></button>`;
  }).join('');
  $('ngL').querySelectorAll('.ng').forEach(b => b.onclick = () => irNegocio(b.dataset.n));
  guardar();
}
function irNegocio(id) { E.cur = id; sel = null; cerrarHoja(); guardar(); pintar(); v2d.encuadrar() }
$('titBtn').onclick = () => abrir('hNeg');
$('ngRe').onclick = () => { if (!confirm(`¿Volver a la propuesta de «${def(E.cur).n}»? Se pierden los cambios de este negocio.`)) return; E.negs[E.cur] = propuesta(E.cur); sel = null; guardar(); pintar(); pintarNegs() };
$('ngVac').onclick = () => abrir('hCero');
/* Empezar de cero: quita los muebles que vienen por defecto para armar el plano propio */
function vaciar(dejarBano) {
  const N = neg(), antes = N.items.length;
  N.items = dejarBano ? N.items.filter(o => o.k === 'bano') : [];
  sel = null; cerrarHoja(); guardar(); pintar();
  if (antes) toast(dejarBano ? 'Solo quedó el baño. Toca Agregar para poner tus muebles.' : 'Plano vacío. Toca Agregar para poner tus muebles.');
  const b = $('bAdd'); b.classList.remove('late'); void b.offsetWidth; b.classList.add('late');
}
$('lsCero').onclick = () => abrir('hCero');
$('ceroTodo').onclick = () => vaciar(false);
$('ceroBano').onclick = () => vaciar(true);
$('ngNew').onclick = () => { $('ngForm').hidden = !$('ngForm').hidden; if (!$('ngForm').hidden) { $('ngNom').value = ''; $('ngNom').focus() } };
$('ngForm').onsubmit = ev => {
  ev.preventDefault();
  const n = $('ngNom').value.trim(); if (!n) return;
  const id = 'x' + uid();
  const base = neg().items.map(o => Object.assign({}, o));
  E.extra.push({ id, n, ic: def(E.cur).ic, base });
  E.negs[id] = { items: base.map(o => Object.assign({}, o, { uid: uid() })) };
  $('ngForm').hidden = true; irNegocio(id); toast(`Creado «${n}»`);
};

/* Terreno */
const TER = { tAB: 'AB', tBC: 'BC', tCD: 'CD', tDA: 'DA', tAC: 'AC', tAl: 'alto' };
function llenarTer() {
  for (const [i, k] of Object.entries(TER)) $(i).value = E.plano[k].toFixed(2);
  $('tMu').value = Math.round(E.plano.muro * 100);
  $('tCalle').value = E.plano.calle || '';
  datosTer();
}
function datosTer() {
  const a = G.ang;
  $('tDat').innerHTML = `<div><b>${G.area.toFixed(2)} m²</b><span>Área interior</span></div><div><b>${(G.BD).toFixed(2)} m</b><span>Diagonal BD que debería salir</span></div>` +
    ['A', 'B', 'C', 'D'].map(k => `<div><b>${a[k].toFixed(2)}°</b><span>Ángulo en ${ETQ[k]}</span></div>`).join('') +
    `<div class="ancho"><span>Mide la otra diagonal, de B a D. Si te sale ${G.BD.toFixed(2)} m, el plano es exacto; si no, revisa AC.</span></div>`;
}
let tTer = 0;
Object.keys(TER).concat('tMu').forEach(i => $(i).addEventListener('input', () => {
  const p = Object.assign({}, E.plano);
  for (const [j, k] of Object.entries(TER)) { const n = num($(j).value); if (n > 0) p[k] = n }
  const mu = num($('tMu').value); if (mu >= 5 && mu <= 60) p.muro = mu / 100;
  if (p.alto < 1.8 || p.alto > 6) { $('tErr').textContent = 'La altura debe estar entre 1.80 y 6 m.'; return }
  const geo = construir(p);
  if (!geo) { $('tErr').textContent = 'Con esas medidas el terreno no se puede cerrar. Revisa los lados y la diagonal AC.'; return }
  $('tErr').textContent = '';
  E.plano = p; G = geo; datosTer();
  clearTimeout(tTer);
  tTer = setTimeout(() => { reubicarFuera(); if (v3d) v3d.armarCasa(G, E.plano); pintar(); guardar() }, 400);   // la vista no se reencuadra: el usuario la mueve a su gusto
}));
/* Nombre de la calle (opcional): se ve en 2D y en 3D */
let tCal = 0;
$('tCalle').addEventListener('input', () => {
  E.plano.calle = $('tCalle').value.replace(/\s+/g, ' ').trim().slice(0, 40);
  if (!E.plano.calle) delete E.plano.calle;
  pintar(); clearTimeout(tCal);
  tCal = setTimeout(() => { if (v3d) v3d.armarCasa(G, E.plano); guardar() }, 350);
});
/* Si el terreno cambia, lo que quedó fuera de las paredes se vuelve a ubicar (en todos los negocios) */
function reubicarFuera() {
  for (const N of Object.values(E.negs)) {
    const r = revisar(G, N.items);
    let mover = N.items.filter(o => r[o.uid] === 'fuera' || r[o.uid] === 'sin');
    if (!mover.length) continue;
    // el baño primero (va al fondo); lo que quede encima de él también se mueve
    const bano = mover.find(o => o.k === 'bano');
    if (bano) {
      bano.x = null; bano.y = null; bano.rot = 0; acomodar(G, [bano], []);
      if (bano.x != null) mover = mover.concat(N.items.filter(o => o !== bano && !mover.includes(o) && o.x != null && chocan(o, bano)));
    }
    const resto = mover.filter(o => o !== bano);
    for (const o of resto) { o.x = null; o.y = null; o.rot = 0 }
    acomodar(G, resto, N.items.filter(o => !resto.includes(o) && o.x != null));
    for (const o of resto) if (o.x == null) { const t = Object.assign({}, o); if (buscarLugar(G, N.items, t)) Object.assign(o, t); else { o.x = null; o.y = null } }
  }
}
$('tRest').onclick = () => { E.plano = Object.assign({}, PLANO_INICIAL, E.plano.calle ? { calle: E.plano.calle } : {}); G = construir(E.plano); reubicarFuera(); if (v3d) v3d.armarCasa(G, E.plano); llenarTer(); v2d.encuadrar(); pintar(); guardar() };

/* Exportar */
function bajar(nombre, datos, tipo) {
  const b = datos instanceof Blob ? datos : new Blob([datos], { type: tipo });
  const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nombre;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 1500);
}
const slug = s => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
$('exDxf').onclick = () => { const d = def(E.cur); bajar(`plano-${slug(d.n)}.dxf`, generarDXF(G, E.plano, neg().items, `Alquiler - ${d.n}`), 'application/dxf') };
$('exDxf0').onclick = () => bajar('croquis.dxf', generarDXF(G, E.plano, [], 'Alquiler - croquis'), 'application/dxf');
$('exPng').onclick = async () => {
  if (E.vista === '2d') await modo('3d');
  if (!v3d) return;
  setTimeout(() => { const url = v3d.foto(); fetch(url).then(r => r.blob()).then(b => bajar(`3d-${slug(def(E.cur).n)}.png`, b)) }, 600);
};
$('exJson').onclick = () => bajar(`alquiler-respaldo.json`, JSON.stringify(E), 'application/json');
$('exIn').onchange = ev => {
  const f = ev.target.files[0]; if (!f) return;
  f.text().then(t => { const v = JSON.parse(t); if (!v.plano || !v.negs) throw 0; aplicarExterno(v); guardar(true); toast('Respaldo cargado'); cerrarHoja() })
    .catch(() => toast('Ese archivo no es un respaldo de Alquiler'));
  ev.target.value = '';
};

/* ---------- Mi ID ---------- */
function aplicarExterno(v) {
  const local = { vista: E.vista, tuto: E.tuto, iman: E.iman, fijo2d: E.fijo2d, fijo3d: E.fijo3d };
  const mig = migrar(v);
  E = Object.assign(nuevoEstado(), v, local);
  G = construir(E.plano) || construir(PLANO_INICIAL);
  if (!defs().some(d => d.id === E.cur)) E.cur = 'casa';
  if (sel && !item(sel)) sel = null;
  if (v3d) v3d.armarCasa(G, E.plano);
  try { localStorage.setItem(LS, JSON.stringify(E)) } catch (e) {}
  pintar();
  if (mig) { v2d.encuadrar(); guardar(true) }               // lo migrado también se sube a tu ID
}
window.ALQ = {
  v3d: () => v3d,
  get: () => { const c = Object.assign({}, E); delete c.vista; delete c.tuto; delete c.iman; delete c.fijo2d; delete c.fijo3d; return c },
  set: v => { if (v && v.plano && v.negs) aplicarExterno(v) },
  onChange: null, onIdView: null
};

/* ---------- Menú ---------- */
function abrirMenu() { $('menu').classList.add('open'); $('scrim').hidden = false; $('menuBtn').setAttribute('aria-expanded', 'true') }
function cerrarMenu() { $('menu').classList.remove('open'); $('scrim').hidden = true; $('menuBtn').setAttribute('aria-expanded', 'false') }
$('menuBtn').onclick = abrirMenu; $('scrim').onclick = cerrarMenu;
document.querySelectorAll('[data-ir]').forEach(b => b.onclick = () => {
  const ir = b.dataset.ir;
  cerrarMenu();
  if (ir === 'plano') cerrarHoja();
  else if (ir === 'negocios') abrir('hNeg');
  else if (ir === 'terreno') abrir('hTer');
  else if (ir === 'exportar') abrir('hExp');
  else if (ir === 'mi-id') abrir('hId');
  else if (ir === 'tutorial') { cerrarHoja(); tutorial() }
});

/* ---------- Avisos ---------- */
let tToast = 0;
function toast(t) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(tToast); tToast = setTimeout(() => { el.hidden = true }, 2400) }

/* ---------- Teclado (Mac / PC) ---------- */
document.addEventListener('keydown', ev => {
  if (ev.target.closest && ev.target.closest('input,textarea')) return;
  if ((ev.metaKey || ev.ctrlKey) && ['+', '-', '=', '0'].includes(ev.key)) { ev.preventDefault(); return }
  const o = sel && item(sel);
  if (ev.key === 'Escape') { if (v3d && v3d.caminando) v3d.salirPaseo(); else if (!$('angPop').hidden) cerrarAng(); else if (abierta) cerrarHoja(); else seleccionar(null); return }
  if (!o) return;
  const p = ev.shiftKey ? 0.1 : 0.01;
  const mov = { ArrowLeft: [-p, 0], ArrowRight: [p, 0], ArrowUp: [0, -p], ArrowDown: [0, p] }[ev.key];
  if ((mov || ev.key === 'r' || ev.key === 'R') && fijo()) { ev.preventDefault(); avisoFijo(); return }
  if (mov) { ev.preventDefault(); o.x += mov[0]; o.y += mov[1]; guardar(); pintar(); return }
  if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); $('sbDel').click() }
  if (ev.key === 'r' || ev.key === 'R') rotar(ev.shiftKey ? -90 : 90);
});

/* ---------- Sin zoom y aviso al recargar ---------- */
['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
document.addEventListener('touchmove', e => { if (e.scale && e.scale !== 1) e.preventDefault() }, { passive: false });
document.addEventListener('wheel', e => { if (e.ctrlKey && !e.target.closest('#v2d,#v3d')) e.preventDefault() }, { passive: false });
window.addEventListener('beforeunload', e => { guardar(true); e.preventDefault(); e.returnValue = 'Si recargas, tal vez pierdas el avance que no se guardó.'; return e.returnValue });

/* ---------- Tutorial ---------- */
function tutorial() {
  if (E.vista !== '2d') modo('2d');
  if (E.fijo2d) { E.fijo2d = false; pintarFijo() }
  v2d.encuadrar();
  const ej = () => neg().items.find(o => o.x != null && o.k !== 'bano' && o.w * o.d > 0.25) || neg().items.find(o => o.x != null);
  const elDe = o => o && document.querySelector(`#v2d [data-uid="${o.uid}"]`);
  const pasos = [
    { tx: 'Arrastra los muebles con el dedo o el mouse.', el: () => elDe(ej()), anim: 'arrastra' },
    { tx: 'Tócalo para ver sus medidas y cambiarlas.', el: () => elDe(ej()), anim: 'toca', antes: () => { const o = ej(); if (o) seleccionar(o.uid) } },
    { tx: 'Gíralo con estos botones o con el círculo azul.', el: () => $('sbDer'), anim: 'toca' },
    { tx: 'O toca aquí y escribe el ángulo: positivo gira antihorario, negativo horario.', el: () => $('bAng'), anim: 'toca' },
    { tx: 'El candado fija todos los muebles. En 2D empieza abierto para moverlos; en 3D empieza cerrado para que no muevas nada sin querer.', el: () => $('bFijo'), anim: 'toca' },
    { tx: 'En 3D ves lo mismo, en el mismo lugar. Para mover ahí, abre el candado. Con el botón de la persona entras y caminas por dentro con las flechas.', el: () => $('b3d'), anim: 'toca', antes: () => seleccionar(null) },
    { tx: 'En 3D-2 ves los mismos muebles con fotos reales: productos según el negocio, bebidas, frutas, madera, piso y paredes.', el: () => $('b4d'), anim: 'toca' },
    { tx: 'Elige un negocio y mira si todo cabe.', el: () => $('titBtn'), anim: 'toca' },
    { tx: '¿Prefieres armarlo tú? En la Lista, «Empezar de cero» quita los muebles que vienen por defecto.', el: () => $('lsCero'), anim: 'toca', antes: () => abrir('hLista') },
    { tx: 'Luego agrega los tuyos, con medidas de Sodimac, Promart y otras tiendas.', el: () => $('bAdd'), anim: 'toca', antes: () => cerrarHoja() }
  ];
  let i = 0;
  const T = $('tuto'), M = $('mano'), Gl = $('globo');
  T.hidden = false;
  const paso = () => {
    const p = pasos[i]; if (p.antes) p.antes();
    requestAnimationFrame(() => {
      const el = p.el(); const r = el ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      M.style.transform = `translate(${cx - 22}px, ${cy - 9}px)`;
      M.className = 'mano ' + p.anim;
      $('globoTx').textContent = p.tx;
      Gl.style.bottom = cy > innerHeight * 0.55 ? 'auto' : ''; Gl.style.top = cy > innerHeight * 0.55 ? `calc(70px + env(safe-area-inset-top,0px))` : '';
      $('tSig').textContent = i === pasos.length - 1 ? 'Listo' : 'Siguiente';
    });
  };
  const fin = () => { T.hidden = true; E.tuto = 1; cerrarHoja(); guardar() };
  $('tSig').onclick = () => { i++; if (i >= pasos.length) fin(); else paso() };
  $('tSalta').onclick = fin;
  paso();
}

/* ---------- Inicio ---------- */
$('bIman').setAttribute('aria-pressed', E.iman);
neg();
pintar();
modo(E.vista === '3d' || E.vista === '4d' ? E.vista : '2d');
if (migrado) { guardar(true); setTimeout(() => toast('Terreno nuevo: cada negocio empezó de nuevo con muebles que caben.'), 600) }
import('../sync.js?v=' + VERSION).catch(() => {});
if (!E.tuto) setTimeout(tutorial, 450);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => v3d && v3d.tema());
