"""Despieces de la Streetfighter S (catálogo de recambios de Ducati, `sp_s/` en la carpeta de manuales).

Uso:
  python3 -I tools/despiece.py lista                    # láminas del catálogo
  python3 -I tools/despiece.py ver BRB00270             # posiciones de una lámina, con código y descripción
  python3 -I tools/despiece.py png BRB00270 4,21 x.png  # vista previa con las posiciones marcadas
"""
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import SF_DESPIECES  # noqa: E402

SVG_NS = 'http://www.w3.org/2000/svg'


def _js_arrays(name):
    src = (SF_DESPIECES / 'tav_data.js').read_text(encoding='utf-8').replace('\r', '\n')
    for m in re.finditer(rf'^{name}\[\d+\] = new Array\((.*)\);\s*$', src, re.M):
        yield re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(1))


def laminas():
    """{código de lámina: {num, nombre, seccion}}; p. ej. 'BRB00270': {'num': '024', 'nombre': 'Freno delantero', ...}"""
    out = {}
    for row in _js_arrays('tavole'):
        num, _cat, code, _it, en, _fr, _de, es, link = row[:9]
        out[code] = {'num': num, 'nombre': es, 'nombre_en': en, 'seccion': link.lstrip('/')}
    return out


def piezas(code):
    """Lista de piezas de una lámina: [{pos, codigo, es, en, cantidad, nota}]"""
    num = laminas()[code]['num']
    out = []
    for row in _js_arrays('parti'):
        if row[0] != num:
            continue
        out.append({'pos': row[2], 'nota': row[1], 'codigo': row[3], 'en': row[5], 'es': row[8], 'cantidad': row[10]})
    return out


def _parse_svg(code):
    path = SF_DESPIECES / 'tavole' / f'{code}.svg'
    # expat expande las entidades internas (&st17;…) del DOCTYPE de Illustrator.
    parser = ET.XMLParser(encoding='iso-8859-1')
    return ET.parse(path, parser=parser).getroot()


def _local(tag):
    return tag.rsplit('}', 1)[-1]


def _matrix(transform):
    m = re.match(r'\s*matrix\(([^)]*)\)', transform or '')
    if not m:
        return (1, 0, 0, 1, 0, 0)
    return tuple(float(v) for v in m.group(1).split())


def llamadas(code):
    """Números de posición dibujados en la lámina: [(texto, x, y)] con (x, y) en el centro aproximado del número."""
    root = _parse_svg(code)
    out = []
    for text in root.iter():
        if _local(text.tag) != 'text':
            continue
        label = ''.join(text.itertext()).strip()
        if not label:
            continue
        a, _b, _c, d, e, f = _matrix(text.get('transform'))
        tspan = next((c for c in text if _local(c.tag) == 'tspan'), None)
        tx = float(tspan.get('x', 0)) if tspan is not None else 0
        ty = float(tspan.get('y', 0)) if tspan is not None else 0
        size = 11
        m = re.search(r'font-size:\s*([\d.]+)', text.get('style', ''))
        if m:
            size = float(m.group(1))
        x = e + a * tx
        y = f + d * ty
        width = 0.56 * size * len(label)
        out.append((label, round(x + width / 2, 1), round(y - 0.36 * size, 1)))
    return out


def tamano(code):
    root = _parse_svg(code)
    _x, _y, w, h = (float(v) for v in root.get('viewBox').split())
    return w, h


def svg_limpio(code):
    """SVG sin DOCTYPE, sin scripts del visor original y con las entidades ya expandidas."""
    root = _parse_svg(code)
    for attr in ('onload', 'onclick', 'onmouseover', 'onmouseout'):
        root.attrib.pop(attr, None)
    for el in root.iter():
        for attr in ('onload', 'onclick', 'onmouseover', 'onmouseout'):
            el.attrib.pop(attr, None)
    for parent in list(root.iter()):
        for child in list(parent):
            if _local(child.tag) in ('script', 'metadata'):
                parent.remove(child)
    # Los SVG de Illustrator 9 no declaran el espacio de nombres: sin él el navegador no los pinta.
    root.set('xmlns', SVG_NS)
    # Los estilos van repetidos en cada trazo: se pasan a clases para que el archivo pese mucho menos.
    classes = {}
    for el in list(root.iter()):
        for child in list(el):
            if _local(child.tag) == 'path' and not re.search(r'[LlHhVvCcSsQqTtAaZz]', child.get('d', '')):
                el.remove(child)  # trazos vacíos (solo un «moveto»)
        style = el.attrib.pop('style', None)
        if style:
            style = re.sub(r'\s*;\s*', ';', style.strip()).rstrip(';')
            el.set('class', classes.setdefault(style, f's{len(classes)}'))
    css = ''.join(f'.{c}{{{s}}}' for s, c in classes.items())
    style_el = ET.Element('style')
    style_el.text = css
    root.insert(0, style_el)
    xml = ET.tostring(root, encoding='unicode')
    # Illustrator deja muchos espacios y decimales de sobra.
    xml = re.sub(r'>\s+<', '><', xml)
    xml = re.sub(r'(\d+\.\d)\d+', r'\1', xml)
    return xml


def png(code, posiciones, out):
    """Vista previa PNG con un círculo rojo en cada llamada de las posiciones indicadas."""
    w, h = tamano(code)
    marks = ''.join(
        f'<circle cx="{x}" cy="{y}" r="11" fill="none" stroke="#e00" stroke-width="2.5"/>'
        for label, x, y in llamadas(code) if label in posiciones)
    svg = svg_limpio(code)
    svg = svg[:svg.rindex('</svg>')] + marks + '</svg>'
    subprocess.run(['rsvg-convert', '-w', str(int(w * 1.6)), '-b', 'white', '-o', out], input=svg.encode(), check=True)


def main(argv):
    if len(argv) >= 1 and argv[0] == 'lista':
        for code, l in laminas().items():
            print(f"{code}  {l['num']:5} {l['nombre']}  ({l['nombre_en']})  → {l['seccion']}")
    elif len(argv) == 2 and argv[0] == 'ver':
        code = argv[1]
        found = {}
        for label, _x, _y in llamadas(code):
            found[label] = found.get(label, 0) + 1
        print(f"{code}: {laminas()[code]['nombre']}")
        for p in piezas(code):
            n = found.get(p['pos'], 0)
            print(f"  {p['pos']:>4} ×{p['cantidad']:<3} {p['codigo']:<14} {p['es']}  |  {p['en']}"
                  f"{'  [' + p['nota'] + ']' if p['nota'] else ''}{'' if n else '  (sin llamada en el dibujo)'}")
    elif len(argv) == 4 and argv[0] == 'png':
        png(argv[1], set(argv[2].split(',')), argv[3])
        print(argv[3])
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == '__main__':
    main(sys.argv[1:])
