/* Catálogo de muebles. Medidas en centímetros: w = ancho (frente), d = fondo, h = alto, e = altura desde el piso.
   f = fuente de la medida. Las que dicen «Medida típica» no se tomaron de una ficha: revísalas antes de comprar. */

export const FUENTES = {
  sodpe: ['Sodimac Perú', 'https://www.sodimac.com.pe'],
  falpe: ['Falabella Perú', 'https://www.falabella.com.pe'],
  promart: ['Promart', 'https://www.promart.pe'],
  sodcl: ['Sodimac Chile', 'https://www.sodimac.cl'],
  homecenter: ['Homecenter (Sodimac Colombia)', 'https://www.homecenter.com.co'],
  trebol: ['Celima Trébol, ficha técnica', 'https://www.celima-trebol.com'],
  holity: ['Holity, ficha técnica', 'https://www.holity.es'],
  ggm: ['GGM Möbel', 'https://www.ggmmoebel.com'],
  astoria: ['Astoria AB200 (Espresso Coffee Shop)', 'https://www.espressocoffeeshop.com'],
  decathlon: ['Decathlon', 'https://www.decathlon.es'],
  liverpool: ['Liverpool', 'https://www.liverpool.com.mx'],
  manomano: ['ManoMano', 'https://www.manomano.es'],
  firplak: ['Firplak', 'https://firplak.com'],
  easy: ['Easy / Paris', 'https://www.easy.cl'],
  tipica: ['Medida típica', '']
};

// Colores pastel por material
export const COL = {
  madera: '#dcc9b2', metal: '#c8d0d9', vidrio: '#cfe7f2', frio: '#d3e2f6', tela: '#e6d4e8',
  blanco: '#f2f1ec', salvia: '#cfe3d5', rosa: '#f3d5dc', melon: '#f6d3ba', amarillo: '#f2e6b2',
  gris: '#d9d9d6', azul: '#cddcf3', lila: '#dcd6f2'
};

const I = (n, k, w, d, h, c, f, extra = {}) => Object.assign({ n, k, w, d, h, e: 0, c: COL[c] || c, f }, extra);

export const CAT = {
  // Generales
  bano: I('Baño (inodoro + lavatorio)', 'bano', 120, 140, 280, 'blanco', 'tipica', { g: 'General', fijo: 1, nota: 'Tabiques de 10 cm. Inodoro Trébol Pro 36.5×66×71 y lavatorio Savona Lux 50.5×41×82.5 (fichas Celima Trébol).' }),
  persona: I('Persona de referencia', 'persona', 50, 30, 170, 'lila', 'tipica', { g: 'General' }),
  planta: I('Planta en macetero', 'planta', 40, 40, 110, 'salvia', 'tipica', { g: 'General' }),
  tacho: I('Tacho de basura', 'tacho', 35, 35, 65, 'gris', 'tipica', { g: 'General' }),
  dispensador: I('Dispensador de agua', 'dispensador', 32, 32, 100, 'azul', 'tipica', { g: 'General' }),
  banca3: I('Banca de espera (3 asientos)', 'banca', 160, 55, 80, 'tela', 'tipica', { g: 'General' }),
  silla: I('Silla', 'silla', 45, 50, 85, 'madera', 'tipica', { g: 'General' }),
  taburete: I('Taburete alto', 'taburete', 40, 40, 75, 'madera', 'tipica', { g: 'General' }),
  sillaofi: I('Silla de oficina', 'sillaofi', 60, 60, 100, 'gris', 'tipica', { g: 'General' }),

  // Estantería (Sodimac, Promart, Falabella)
  estm90: I('Estante metálico 5 niveles', 'estante', 90, 40, 180, 'metal', 'homecenter', { g: 'Estantes', niv: 5 }),
  estm90b: I('Estante metálico 5 niveles (angosto)', 'estante', 90, 30, 180, 'metal', 'falpe', { g: 'Estantes', niv: 5 }),
  estm120: I('Estante metálico 4 repisas', 'estante', 120, 45, 176, 'metal', 'sodcl', { g: 'Estantes', niv: 4 }),
  estmm100: I('Estante metal y madera 5 niveles', 'estante', 100, 50, 192, 'madera', 'promart', { g: 'Estantes', niv: 5 }),
  estofi: I('Estante de oficina 5 niveles', 'estante', 80, 30, 200, 'madera', 'sodpe', { g: 'Estantes', niv: 5, cerrado: 1 }),
  gondola: I('Góndola central (doble cara)', 'gondola', 100, 50, 165, 'blanco', 'ggm', { g: 'Estantes', niv: 4 }),
  gondolap: I('Góndola de pared', 'estante', 100, 40, 180, 'blanco', 'tipica', { g: 'Estantes', niv: 5, cerrado: 1 }),
  panel: I('Panel ranurado (ganchos)', 'panel', 120, 10, 150, 'blanco', 'tipica', { g: 'Estantes', e: 90 }),
  repisa: I('Repisa de pared', 'repisa', 100, 25, 3, 'madera', 'tipica', { g: 'Estantes', e: 160 }),

  // Mostradores y vitrinas
  mostrador: I('Mostrador / counter', 'mostrador', 160, 60, 105, 'blanco', 'promart', { g: 'Mostradores', nota: 'Promart da el largo (160 cm); fondo y alto son típicos.' }),
  vitmost: I('Vitrina mostrador de vidrio', 'vitrina', 120, 50, 95, 'vidrio', 'tipica', { g: 'Mostradores' }),
  vitvert: I('Vitrina vertical de vidrio', 'vitrinav', 80, 40, 180, 'vidrio', 'tipica', { g: 'Mostradores' }),
  caja: I('Caja de cobro (checkout)', 'caja', 120, 60, 90, 'gris', 'tipica', { g: 'Mostradores' }),
  mesaexh: I('Mesa exhibidora', 'mesa', 120, 60, 80, 'madera', 'tipica', { g: 'Mostradores' }),

  // Frío
  visi290: I('Visicooler 1 puerta 290 L', 'refri', 53, 56, 197, 'frio', 'falpe', { g: 'Frío', nota: 'Ventus LG-290 LED: 197.1 × 53 × 56 cm.' }),
  congeladora: I('Congeladora horizontal 200 L', 'congeladora', 93, 56, 85, 'blanco', 'tipica', { g: 'Frío' }),
  frigobar: I('Frigobar', 'refrigeradora', 50, 50, 85, 'blanco', 'tipica', { g: 'Frío' }),
  vitpast: I('Vitrina pastelera refrigerada', 'vitrina', 90, 70, 130, 'vidrio', 'tipica', { g: 'Frío', frio: 1 }),

  // Cafetería
  barracafe: I('Barra con máquina espresso', 'barracafe', 180, 63, 154, 'madera', 'astoria', { g: 'Cafetería', nota: 'Barra típica 180×60×105; máquina Astoria AB200 de 2 grupos: 77 × 63.3 × 49 cm.' }),
  espresso: I('Máquina espresso 2 grupos', 'cafetera', 77, 63, 49, 'metal', 'astoria', { g: 'Cafetería', e: 105 }),
  mesa70: I('Mesa cuadrada de cafetería', 'mesa', 70, 70, 74, 'madera', 'easy', { g: 'Cafetería' }),
  mesa2s: I('Mesa 70×70 con 2 sillas', 'mesa2s', 70, 150, 85, 'madera', 'easy', { g: 'Cafetería', nota: 'Mesa 70×70×74 (Easy/Paris) y dos sillas típicas.' }),
  mesar2s: I('Mesa redonda Ø60 con 2 sillas', 'mesar2s', 60, 140, 85, 'madera', 'tipica', { g: 'Cafetería' }),

  // Barbería / peluquería
  puestob: I('Puesto de barbero (tocador + sillón)', 'puestob', 100, 135, 180, 'rosa', 'liverpool', { g: 'Barbería', nota: 'Sillón 51 × 65 × 81 cm (Liverpool); tocador con espejo típico 100×40×180.' }),
  sillonb: I('Sillón de barbero', 'sillonb', 51, 65, 81, 'tela', 'liverpool', { g: 'Barbería' }),
  tocador: I('Tocador con espejo', 'tocador', 100, 40, 180, 'rosa', 'tipica', { g: 'Barbería' }),
  lavacab: I('Lavacabezas', 'lavacab', 60, 120, 90, 'tela', 'tipica', { g: 'Barbería' }),
  espejo: I('Espejo de cuerpo entero', 'espejo', 50, 4, 160, 'vidrio', 'tipica', { g: 'Barbería', e: 20 }),

  // Ropa
  perchero: I('Perchero con ruedas', 'perchero', 120, 43, 171, 'metal', 'manomano', { g: 'Ropa' }),
  barrap: I('Barra de pared con ropa', 'barrap', 110, 30, 110, 'metal', 'manomano', { g: 'Ropa', e: 60, nota: 'Barra de 110 × 30 cm (ManoMano) a 1.70 m del piso, con la ropa colgada.' }),
  probador: I('Probador', 'probador', 100, 100, 210, 'lila', 'tipica', { g: 'Ropa' }),
  maniqui: I('Maniquí', 'maniqui', 45, 30, 180, 'blanco', 'tipica', { g: 'Ropa' }),

  // Salud
  mesavet: I('Mesa de exploración veterinaria', 'mesavet', 140, 70, 85, 'metal', 'holity', { g: 'Salud' }),
  jaula: I('Jaula veterinaria de acero', 'jaula', 51, 72, 60, 'metal', 'holity', { g: 'Salud' }),
  banera: I('Bañera para mascotas', 'banera', 120, 60, 90, 'metal', 'tipica', { g: 'Salud' }),
  camillam: I('Camilla médica', 'camilla', 180, 60, 75, 'azul', 'tipica', { g: 'Salud' }),
  camillas: I('Camilla de masajes', 'camilla', 185, 60, 87, 'melon', 'decathlon', { g: 'Salud', nota: 'HOMCOM 185 × 60 × 87 cm.' }),
  biombo: I('Biombo', 'biombo', 150, 4, 170, 'blanco', 'tipica', { g: 'Salud' }),
  carrito: I('Carrito auxiliar', 'carrito', 45, 40, 85, 'metal', 'tipica', { g: 'Salud' }),
  espaldera: I('Espaldera (barras de pared)', 'espaldera', 90, 15, 230, 'madera', 'tipica', { g: 'Salud' }),
  colchoneta: I('Colchoneta de terapia', 'colchoneta', 180, 60, 5, 'azul', 'tipica', { g: 'Salud' }),

  // Oficina y técnica
  escritorio: I('Escritorio', 'escritorio', 120, 53, 75, 'madera', 'sodpe', { g: 'Oficina' }),
  mesatec: I('Mesa de trabajo técnico', 'mesatec', 140, 60, 90, 'gris', 'firplak', { g: 'Oficina', nota: 'Firplak: mesón de trabajo 140×60; el alto es típico.' }),
  archivador: I('Archivador metálico 4 gavetas', 'archivador', 47, 62, 132, 'metal', 'tipica', { g: 'Oficina' }),
  reunion6: I('Mesa de reuniones con 6 sillas', 'reunion', 180, 190, 85, 'madera', 'tipica', { g: 'Oficina' }),
  fotocop: I('Fotocopiadora', 'fotocop', 60, 65, 110, 'gris', 'tipica', { g: 'Oficina' }),
  librero: I('Librero', 'estante', 80, 30, 200, 'madera', 'sodpe', { g: 'Oficina', niv: 5, cerrado: 1 }),

  // Frutas
  exhfrutas: I('Exhibidor de frutas escalonado', 'escalonado', 120, 80, 90, 'madera', 'tipica', { g: 'Frutas' }),
  jabas: I('Jabas apiladas (3)', 'jabas', 60, 40, 90, 'salvia', 'tipica', { g: 'Frutas' }),
  balanza: I('Mostrador con balanza', 'balanza', 100, 60, 110, 'blanco', 'tipica', { g: 'Frutas' }),

  // Casa
  cama2: I('Cama 2 plazas', 'cama', 140, 195, 100, 'tela', 'sodpe', { g: 'Casa', nota: 'Colchón de 2 plazas 135 × 190 (Sodimac Perú) con base y cabecera.' }),
  cama1: I('Cama 1.5 plazas', 'cama', 110, 195, 100, 'tela', 'sodpe', { g: 'Casa' }),
  velador: I('Velador', 'velador', 45, 40, 55, 'madera', 'tipica', { g: 'Casa' }),
  ropero: I('Ropero', 'ropero', 120, 55, 200, 'madera', 'tipica', { g: 'Casa' }),
  sofa3: I('Sofá 3 cuerpos', 'sofa', 205, 94, 83, 'tela', 'falpe', { g: 'Casa', nota: 'Sofá Reina 205 × 94 × 83 cm (Falabella / Sodimac Perú).' }),
  mesacentro: I('Mesa de centro', 'mesa', 90, 50, 45, 'madera', 'tipica', { g: 'Casa' }),
  racktv: I('Rack de TV', 'rack', 120, 40, 50, 'madera', 'tipica', { g: 'Casa' }),
  tv55: I('Televisor 55"', 'tv', 123, 7, 71, '#40454d', 'tipica', { g: 'Casa', e: 60 }),
  comedor4: I('Comedor con 4 sillas', 'comedor', 120, 150, 85, 'madera', 'tipica', { g: 'Casa', nota: 'Mesa 120×80 con las sillas metidas.' }),
  refrig: I('Refrigeradora', 'refrigeradora', 60, 65, 170, 'blanco', 'tipica', { g: 'Casa' }),
  cocina4: I('Cocina 4 hornillas', 'cocina', 55, 55, 85, 'blanco', 'tipica', { g: 'Casa' }),
  lavadero: I('Mueble de lavadero', 'lavadero', 100, 50, 90, 'blanco', 'tipica', { g: 'Casa' }),
  inodoro: I('Inodoro', 'inodoro', 37, 66, 71, 'blanco', 'trebol', { g: 'Casa' }),
  lavatorio: I('Lavatorio con pedestal', 'lavatorio', 51, 41, 83, 'blanco', 'trebol', { g: 'Casa' })
};

/* Negocios: cada uno con su propuesta. z = zona donde el acomodo automático lo pone:
   'pared' pegado a una pared, 'centro' en medio con pasillos, 'frente' paralelo al portón (AB). */
const P = (id, z = 'pared', n = 1) => ({ id, z, n });

export const NEGOCIOS = [
  { id: 'casa', n: 'Mi casa', ic: 'casa', items: [P('bano', 'bano'), P('cama2'), P('velador', 'pared', 2), P('ropero'), P('refrig'), P('cocina4'), P('lavadero'), P('sofa3'), P('racktv'), P('tv55'), P('comedor4', 'centro'), P('mesacentro', 'centro'), P('planta')] },
  { id: 'bodega', n: 'Bodega', ic: 'bodega', items: [P('bano', 'bano'), P('vitmost', 'frente', 2), P('estm90', 'pared', 3), P('estm120', 'pared', 2), P('visi290', 'pared', 2), P('congeladora'), P('estm90b'), P('jabas', 'pared', 3), P('taburete', 'centro'), P('tacho')] },
  { id: 'mini', n: 'Minimarket', ic: 'carrito', items: [P('bano', 'bano'), P('caja', 'frente'), P('gondola', 'centro', 3), P('gondolap', 'pared', 4), P('visi290', 'pared', 3), P('congeladora', 'pared', 2), P('estm90b'), P('tacho')] },
  { id: 'ferre', n: 'Ferretería', ic: 'llave', items: [P('bano', 'bano'), P('mostrador', 'frente', 2), P('estm120', 'pared', 2), P('estmm100', 'pared', 3), P('panel', 'pared', 3), P('estm90b', 'pared', 2), P('vitvert'), P('taburete', 'centro')] },
  { id: 'tecnico', n: 'Servicio técnico', ic: 'laptop', items: [P('bano', 'bano'), P('vitmost', 'frente', 2), P('mesatec', 'pared', 2), P('sillaofi', 'centro', 2), P('estm90b', 'pared', 2), P('panel', 'pared', 2), P('vitvert'), P('archivador'), P('banca3'), P('tacho')] },
  { id: 'ropa', n: 'Venta de ropa', ic: 'gancho', items: [P('bano', 'bano'), P('probador', 'pared', 2), P('barrap', 'pared', 4), P('espejo', 'pared', 2), P('mostrador'), P('perchero', 'centro', 3), P('mesaexh', 'centro'), P('maniqui', 'frente', 2), P('planta')] },
  { id: 'vet', n: 'Veterinaria', ic: 'huella', items: [P('bano', 'bano'), P('mostrador', 'frente'), P('mesavet', 'centro'), P('jaula', 'pared', 4), P('banera'), P('escritorio'), P('sillaofi', 'centro'), P('vitvert', 'pared', 2), P('estm90b'), P('banca3'), P('tacho')] },
  { id: 'vitaminas', n: 'Vitaminas y suplementos', ic: 'capsula', items: [P('bano', 'bano'), P('vitmost', 'frente', 2), P('estm90b', 'pared', 3), P('vitvert', 'pared', 2), P('visi290', 'pared', 2), P('gondola', 'centro'), P('taburete', 'centro'), P('planta')] },
  { id: 'cafe', n: 'Cafetería', ic: 'taza', items: [P('bano', 'bano'), P('barracafe'), P('vitpast'), P('visi290'), P('frigobar'), P('mesa2s', 'centro', 4), P('mesar2s', 'centro', 2), P('taburete', 'pared', 2), P('planta')] },
  { id: 'botica', n: 'Botica', ic: 'cruz', items: [P('bano', 'bano'), P('vitmost', 'frente', 3), P('estofi', 'pared', 5), P('frigobar'), P('vitvert', 'pared', 2), P('banca3'), P('dispensador'), P('taburete', 'centro')] },
  { id: 'barberia', n: 'Barbería / peluquería', ic: 'tijera', items: [P('bano', 'bano'), P('puestob', 'pared', 3), P('lavacab', 'pared', 2), P('sofa3'), P('mostrador', 'frente'), P('estofi'), P('espejo'), P('planta')] },
  { id: 'consultorio', n: 'Consultorio', ic: 'estetoscopio', items: [P('bano', 'bano'), P('escritorio'), P('sillaofi', 'centro'), P('silla', 'centro', 2), P('camillam'), P('biombo', 'centro'), P('archivador'), P('carrito'), P('banca3'), P('mostrador', 'frente'), P('planta')] },
  { id: 'oficina', n: 'Oficina', ic: 'maletin', items: [P('bano', 'bano'), P('escritorio', 'pared', 3), P('sillaofi', 'centro', 3), P('archivador', 'pared', 2), P('librero', 'pared', 2), P('fotocop'), P('dispensador'), P('reunion6', 'centro'), P('planta')] },
  { id: 'libreria', n: 'Librería / bazar', ic: 'libro', items: [P('bano', 'bano'), P('vitmost', 'frente', 2), P('librero', 'pared', 5), P('fotocop'), P('estm90b', 'pared', 2), P('gondola', 'centro'), P('mesaexh', 'centro'), P('taburete', 'centro')] },
  { id: 'masajes', n: 'Masajes / terapia física', ic: 'mano', items: [P('bano', 'bano'), P('camillas', 'centro', 2), P('biombo', 'centro', 2), P('espaldera', 'pared', 2), P('colchoneta', 'centro'), P('carrito', 'pared', 2), P('estofi'), P('escritorio'), P('sillaofi', 'centro'), P('banca3')] },
  { id: 'frutas', n: 'Venta de frutas', ic: 'fruta', items: [P('bano', 'bano'), P('balanza', 'frente'), P('exhfrutas', 'pared', 3), P('jabas', 'pared', 6), P('mesaexh', 'centro', 2), P('visi290'), P('congeladora')] }
];

/* ---------- Distribución propuesta para el terreno MBCN ----------
   Unos 2.31 m de ancho y 6.5 m de fondo. El baño va en el fondo, en la esquina C, y se deja un pasillo
   de al menos 0.8 m desde el portón hasta su puerta.
   u = distancia desde el portón medida a lo largo de la pared derecha BC (al centro del mueble);
   v = distancia desde la pared derecha (al centro); r = giro extra (90: de lado, -90: mirando al portón).
   R: espalda en la pared derecha · L: en la pared izquierda · F: en el fondo (t = distancia desde C) · X: libre */
const R = (id, u, o) => ({ id, m: 'BC', u, ...o });
const L = (id, u, o) => ({ id, m: 'DA', u, ...o });
const F = (id, t, o) => ({ id, m: 'CD', t, ...o });
const X = (id, u, v, r = 0) => ({ id, u, v, r });
// varios seguidos en una pared, desde u0 hacia el fondo
function fila(m, u0, ids, gap = 0.03, o = {}) {
  const out = []; let u = u0;
  for (const id of ids) { const c = CAT[id], largo = (Math.abs(o.r || 0) % 180 === 90 ? c.d : c.w) / 100; out.push({ id, m, u: +(u + largo / 2).toFixed(3), ...o }); u += largo + gap }
  return out;
}
const BANO = F('bano', 0.61);
const LAY = {
  casa: [BANO, ...fila('BC', 0.25, ['refrig', 'cocina4', 'lavadero']), R('tv55', 4.0), L('sofa3', 1.75), L('velador', 3.05), L('cama1', 4.25, { r: -90 }), L('ropero', 5.9)],
  bodega: [BANO, X('vitmost', 1.45, 0.62, -90), ...fila('BC', 1.85, ['estm90', 'estm90', 'congeladora']), ...fila('DA', 1.85, ['visi290', 'visi290', 'estm120', 'jabas']), F('estm90b', 1.8), X('taburete', 2.2, 1.1), L('tacho', 0.9)],
  mini: [BANO, R('caja', 0.95), ...fila('BC', 1.7, ['visi290', 'visi290', 'congeladora', 'gondolap']), ...fila('DA', 0.75, ['gondolap', 'gondolap', 'gondolap', 'gondolap', 'visi290', 'estm90b'])],
  ferre: [BANO, X('mostrador', 1.4, 0.82, -90), R('vitvert', 0.65), ...fila('BC', 1.85, ['estm120', 'estm120']), ...fila('DA', 1.85, ['estmm100', 'estmm100', 'estmm100']), L('panel', 5.6), X('taburete', 2.0, 1.15)],
  tecnico: [BANO, X('vitmost', 1.3, 0.62, -90), R('silla', 0.55), ...fila('BC', 1.75, ['mesatec', 'estm90b', 'archivador'], 0.05), L('estm90b', 2.2), L('mesatec', 4.0), X('sillaofi', 2.45, 0.95, 180), X('sillaofi', 4.0, 1.36, 0), L('tacho', 4.95)],
  ropa: [BANO, F('probador', 1.79), ...fila('BC', 0.35, ['barrap', 'barrap', 'barrap', 'espejo']), L('maniqui', 0.95), ...fila('DA', 1.25, ['barrap', 'barrap']), L('mostrador', 4.4), X('perchero', 2.0, 1.15, 90)],
  vet: [BANO, R('mostrador', 1.15), L('banca3', 1.6), R('mesavet', 3.05), ...fila('DA', 2.6, ['jaula', 'jaula', 'jaula']), L('banera', 4.9), R('vitvert', 4.25), F('tacho', 1.45)],
  vitaminas: [BANO, ...fila('BC', 0.3, ['vitvert', 'vitvert', 'visi290', 'estm90b']), ...fila('DA', 0.75, ['estm90b', 'estm90b', 'estm90b']), X('vitmost', 4.2, 1.7, -90), F('estm90b', 1.75), X('taburete', 5.2, 1.75)],
  cafe: [BANO, R('planta', 0.6), ...fila('BC', 2.0, ['vitpast', 'barracafe']), ...fila('DA', 0.8, ['mesa2s', 'mesa2s', 'mesar2s'], 0.1, { r: 90 }), F('frigobar', 1.5)],
  botica: [BANO, X('vitmost', 1.45, 0.62, -90), L('dispensador', 0.9), ...fila('BC', 1.85, ['estofi', 'estofi', 'estofi', 'frigobar']), ...fila('DA', 1.85, ['estofi', 'estofi', 'vitvert']), X('taburete', 2.0, 1.1)],
  barberia: [BANO, R('mostrador', 1.15), L('banca3', 1.55), ...fila('BC', 2.45, ['puestob', 'puestob'], 0.1), L('lavacab', 5.9, { r: 90 })],
  consultorio: [BANO, R('planta', 0.6), L('banca3', 1.55), R('archivador', 2.1), R('escritorio', 3.2), X('sillaofi', 3.2, 0.86, 180), L('silla', 3.0), L('silla', 3.5), X('biombo', 4.5, 1.55, 90), R('carrito', 4.85), L('camillam', 5.5)],
  oficina: [BANO, R('escritorio', 1.0), R('escritorio', 2.9), R('fotocop', 4.4), X('sillaofi', 1.0, 0.86, 180), X('sillaofi', 2.9, 0.86, 180), ...fila('DA', 0.8, ['librero', 'librero']), ...fila('DA', 3.4, ['archivador', 'archivador']), L('dispensador', 4.6)],
  libreria: [BANO, X('vitmost', 1.0, 0.95, 0), X('taburete', 1.0, 0.3), R('fotocop', 2.0), ...fila('BC', 2.4, ['librero', 'librero', 'librero']), ...fila('DA', 0.75, ['librero', 'librero', 'librero', 'estm90b', 'estm90b'])],
  masajes: [BANO, R('escritorio', 1.0), X('sillaofi', 1.0, 0.86, 180), L('banca3', 1.55), X('biombo', 2.65, 1.55, 90), R('camillas', 3.85), L('colchoneta', 3.9), F('espaldera', 1.85), L('carrito', 5.6)],
  frutas: [BANO, R('balanza', 0.95), ...fila('DA', 0.75, ['exhfrutas', 'exhfrutas', 'congeladora', 'jabas']), ...fila('BC', 1.6, ['jabas', 'jabas', 'jabas', 'jabas', 'visi290'])]
};
for (const d of NEGOCIOS) if (LAY[d.id]) d.lay = LAY[d.id];
