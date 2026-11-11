/* Exporta el plano a DXF (AutoCAD R12, unidades en metros). AutoCAD lo abre y lo puede guardar como DWG. */
import { anilloMuros, esquinas, ETQ } from './plano.js?v=1.2.3';

const txt = s => String(s).replace(/ñ/g, 'n').replace(/Ñ/g, 'N').replace(/×/g, 'x').replace(/Ø/g, 'D').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, '');
const n = v => (Math.round(v * 10000) / 10000).toString();

export function generarDXF(g, plano, items, titulo) {
  const E = [];
  const Y = y => -y; // en AutoCAD el eje Y sube
  const linea = (a, b, capa) => E.push('0', 'LINE', '8', capa, '10', n(a[0]), '20', n(Y(a[1])), '30', '0', '11', n(b[0]), '21', n(Y(b[1])), '31', '0');
  const poli = (pts, capa) => pts.forEach((p, i) => linea(p, pts[(i + 1) % pts.length], capa));
  const texto = (p, alto, s, capa, giro = 0, centrar = true) => {
    E.push('0', 'TEXT', '8', capa, '10', n(p[0]), '20', n(Y(p[1])), '30', '0', '40', n(alto), '1', txt(s), '50', n(-giro));
    if (centrar) E.push('72', '1', '73', '2', '11', n(p[0]), '21', n(Y(p[1])), '31', '0');
  };

  // muros y portón
  poli(anilloMuros(g, plano.muro), 'MUROS');
  linea(g.A, g.B, 'PORTON');
  for (const mu of g.muros) {
    const m = [(mu.p[0] + mu.q[0]) / 2 + mu.out[0] * (plano.muro + 0.3), (mu.p[1] + mu.q[1]) / 2 + mu.out[1] * (plano.muro + 0.3)];
    let a = Math.atan2(mu.u[1], mu.u[0]) * 180 / Math.PI; if (a > 90 || a < -90) a += 180;
    texto(m, 0.14, `${mu.et} = ${mu.L.toFixed(2)} m${mu.abierto ? ' (porton)' : ''}`, 'COTAS', a);
  }
  for (const [k, p] of Object.entries({ A: g.A, B: g.B, C: g.C, D: g.D })) {
    const v = [p[0] - g.centro[0], p[1] - g.centro[1]], L = Math.hypot(...v);
    texto([p[0] + v[0] / L * 0.45, p[1] + v[1] / L * 0.45], 0.2, ETQ[k], 'COTAS');
    texto([p[0] - v[0] / L * 0.5, p[1] - v[1] / L * 0.5], 0.09, g.ang[k].toFixed(2) + '%%d', 'COTAS');
  }
  linea(g.A, g.C, 'DIAGONAL');

  // muebles
  for (const o of items) {
    if (o.x == null) continue;
    const capa = o.k === 'bano' ? 'BANO' : (o.e > 0.3 ? 'MUEBLES_COLGADOS' : 'MUEBLES');
    poli(esquinas(o), capa);
    if (o.k === 'bano') {
      const t = 0.1;
      const inner = esquinas(Object.assign({}, o, { w: o.w - 2 * t, d: o.d - 2 * t }));
      poli(inner, 'BANO');
    }
    let a = ((o.rot || 0) % 360 + 360) % 360; if (a > 90 && a <= 270) a -= 180;
    const h = Math.max(0.03, Math.min(0.1, o.d / 4, o.w / (o.n.length * 0.62)));
    const r = a * Math.PI / 180, ox = -Math.sin(r), oy = Math.cos(r);
    texto([o.x - ox * h * 0.65, o.y - oy * h * 0.65], h, o.n, 'TEXTOS', a);
    texto([o.x + ox * h * 0.75, o.y + oy * h * 0.75], h * 0.8, `${Math.round(o.w * 100)} x ${Math.round(o.d * 100)} x ${Math.round(o.h * 100)} cm`, 'TEXTOS', a);
  }
  texto([g.caja.x0, g.caja.y1 + 0.9], 0.18, titulo, 'TEXTOS', 0, false);
  texto([g.caja.x0, g.caja.y1 + 1.2], 0.1, `Area interior ${g.area.toFixed(2)} m2 - unidades en metros - muros de ${Math.round(plano.muro * 100)} cm`, 'TEXTOS', 0, false);

  const capas = [['MUROS', 7], ['PORTON', 1], ['DIAGONAL', 9], ['COTAS', 5], ['BANO', 4], ['MUEBLES', 3], ['MUEBLES_COLGADOS', 6], ['TEXTOS', 7]];
  const H = ['0', 'SECTION', '2', 'HEADER', '9', '$ACADVER', '1', 'AC1009', '9', '$INSBASE', '10', '0', '20', '0', '30', '0',
    '9', '$EXTMIN', '10', n(g.caja.x0 - 1), '20', n(-g.caja.y1 - 1.5), '30', '0', '9', '$EXTMAX', '10', n(g.caja.x1 + 1), '20', n(-g.caja.y0 + 1), '30', '0', '0', 'ENDSEC',
    '0', 'SECTION', '2', 'TABLES',
    '0', 'TABLE', '2', 'LTYPE', '70', '1', '0', 'LTYPE', '2', 'CONTINUOUS', '70', '0', '3', 'Solid line', '72', '65', '73', '0', '40', '0.0', '0', 'ENDTAB',
    '0', 'TABLE', '2', 'LAYER', '70', String(capas.length)];
  for (const [c, col] of capas) H.push('0', 'LAYER', '2', c, '70', '0', '62', String(col), '6', 'CONTINUOUS');
  H.push('0', 'ENDTAB', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES');
  return H.concat(E, ['0', 'ENDSEC', '0', 'EOF']).join('\r\n') + '\r\n';
}
