"""Figuras del manual de servicio de la MT-07 (PDF vectorial de Yamaha).

Cada figura se identifica como «mt07:<página>.<n>», p. ej. «mt07:4-35.0» es la primera figura de la página 4-35
(las figuras se numeran de arriba abajo y de izquierda a derecha). Si la detección automática no encuadra bien una
figura, se puede dar el recorte a mano en puntos de la página: «mt07:4-42@56,90,280,219».

Uso (requiere PyMuPDF; ver tools/README.md):
  python tools/mt07.py buscar "REPLACING THE FRONT BRAKE PADS"   # páginas donde aparece un texto
  python tools/mt07.py texto 4-42                                 # texto de una página
  python tools/mt07.py pagina 4-35 [carpeta]                      # figuras de la página, sus etiquetas de par y
                                                                  # una vista previa PNG de cada una
"""
import re
import sys
from functools import lru_cache
from pathlib import Path

import pymupdf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import MT07_PDF  # noqa: E402

HEADER_Y = 88   # por encima: cabecera con el título del capítulo
FOOTER_Y = 790  # por debajo: número de página


@lru_cache(maxsize=1)
def doc():
    return pymupdf.open(MT07_PDF)


@lru_cache(maxsize=1)
def paginas():
    """{'4-35': índice de página en el PDF (desde 0)}"""
    out = {}
    for i, page in enumerate(doc()):
        words = [w for w in page.get_text('words') if w[1] > FOOTER_Y]
        for w in words:
            if re.fullmatch(r'\d{1,2}-\d{1,3}', w[4]):
                out.setdefault(w[4], i)
    return out


def pagina(label):
    return doc()[paginas()[label]]


def _corte_tabla(page):
    """Y donde empieza la tabla «Order / Job/Parts to remove», si la hay."""
    words = page.get_text('words')
    for w in words:
        if w[4] == 'Order' and any(o[4].startswith('Job/Part') and abs(o[1] - w[1]) < 3 for o in words):
            return w[1] - 2
    return FOOTER_Y


def figuras(page, gap=8, minsize=45):
    """Recuadros de las figuras de la página, agrupando los trazos vectoriales que se tocan."""
    bottom = min(FOOTER_Y, _corte_tabla(page))
    rects = []
    for d in page.get_drawings():
        r = pymupdf.Rect(d['rect'])
        if r.y0 < HEADER_Y or r.y1 > bottom:
            continue
        if (r.height < 1.5 and r.width > 150) or (r.width < 1.5 and r.height > 300):
            continue  # líneas de separación de columnas y de texto
        rects.append(r)
    groups = []
    for r in rects:
        r = pymupdf.Rect(r)
        merged = True
        while merged:
            merged = False
            for g in groups:
                if pymupdf.Rect(g.x0 - gap, g.y0 - gap, g.x1 + gap, g.y1 + gap).intersects(r):
                    r |= g
                    groups.remove(g)
                    merged = True
                    break
        groups.append(r)
    groups = [g for g in groups if g.width > minsize and g.height > minsize]
    # Las llamadas («1», «a») son texto: se amplía el recuadro para incluir las que quedan en el borde. Solo
    # palabras sueltas, para no comerse el texto de los pasos que hay junto a la figura («• Brake pad spring “3”»).
    words = page.get_text('words')

    def llamada(w):
        if not re.fullmatch(r'\d{1,2}|[a-zA-Z]', w[4]):
            return False
        return not any(o is not w and abs(o[1] - w[1]) < 3 and (0 <= o[0] - w[2] < 12 or 0 <= w[0] - o[2] < 12)
                       for o in words)

    for g in groups:
        for w in words:
            wr = pymupdf.Rect(w[:4])
            if pymupdf.Rect(g.x0 - 14, g.y0 - 10, g.x1 + 14, g.y1 + 10).contains(wr) and llamada(w):
                g |= wr
    return sorted(groups, key=lambda g: (round(g.y0 / 40), g.x0))


def recorte(fig_id):
    """'mt07:4-35.0' o 'mt07:4-42@x0,y0,x1,y1' → (página, Rect)"""
    m = re.fullmatch(r'mt07:(\d{1,2}-\d{1,3})(?:\.(\d+)|@([\d.]+),([\d.]+),([\d.]+),([\d.]+))', fig_id)
    if not m:
        raise ValueError(f'Figura mal escrita: {fig_id}')
    page = pagina(m.group(1))
    if m.group(2) is not None:
        figs = figuras(page)
        n = int(m.group(2))
        if n >= len(figs):
            raise ValueError(f'{fig_id}: la página solo tiene {len(figs)} figuras')
        rect = figs[n]
    else:
        rect = pymupdf.Rect(*(float(m.group(i)) for i in range(3, 7)))
    return page, rect + (-6, -6, 6, 6)


def etiquetas_par(page, rect=None):
    """Etiquetas «40 Nm (4.0 m-kgf, 29 ft-lbf)» de la página (o de un recorte): [(texto, Rect)], en orden de lectura."""
    words = page.get_text('words')
    out = []
    for i, w in enumerate(words):
        if w[4] != 'Nm' or i == 0 or not re.fullmatch(r'\d+(\.\d+)?', words[i - 1][4]):
            continue
        num = words[i - 1]
        line = [o for o in words if abs(o[1] - num[1]) < 2 and o[0] >= num[0] and o[0] - num[0] < 150]
        line.sort(key=lambda o: o[0])
        end = next((k for k, o in enumerate(line) if o[4].endswith(')')), None)
        line = line[:end + 1] if end is not None else line[:2]
        r = pymupdf.Rect(num[:4])
        for o in line:
            r |= pymupdf.Rect(o[:4])
        r = r + (-15, -2, 3, 2)  # incluye el icono de la llave dinamométrica
        if rect is None or rect.intersects(r):
            out.append((' '.join(o[4] for o in line), r))
    out.sort(key=lambda e: (round(e[1].y0), e[1].x0))
    return out


def png(page, rect, out, dpi=110, marcas=None, numerar=False):
    """Recorte a PNG. marcas: lista de Rect a recuadrar en rojo; numerar: escribe el índice de cada etiqueta de par."""
    pix = page.get_pixmap(clip=rect, dpi=dpi)
    if marcas or numerar:
        from PIL import Image, ImageDraw
        img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        draw = ImageDraw.Draw(img)
        k = dpi / 72
        tx = lambda r: [(r.x0 - rect.x0) * k, (r.y0 - rect.y0) * k, (r.x1 - rect.x0) * k, (r.y1 - rect.y0) * k]  # noqa: E731
        for r in marcas or []:
            draw.rectangle(tx(r), outline=(220, 0, 0), width=3)
        if numerar:
            for i, (_t, r) in enumerate(etiquetas_par(page, rect)):
                box = tx(r)
                draw.rectangle(box, outline=(220, 0, 0), width=2)
                draw.text((box[0] - 14, box[1]), f'#{i}', fill=(220, 0, 0))
        img.save(out)
    else:
        pix.save(out)


def main(argv):
    if len(argv) == 2 and argv[0] == 'buscar':
        needle = argv[1].lower()
        inv = {v: k for k, v in paginas().items()}
        for i, page in enumerate(doc()):
            if needle in page.get_text().lower():
                print(inv.get(i, f'pdf#{i + 1}'))
    elif len(argv) == 2 and argv[0] == 'texto':
        print(pagina(argv[1]).get_text())
    elif len(argv) in (2, 3) and argv[0] == 'pagina':
        label = argv[1]
        outdir = Path(argv[2] if len(argv) == 3 else '/tmp/mt07-figuras')
        outdir.mkdir(parents=True, exist_ok=True)
        page = pagina(label)
        for n, g in enumerate(figuras(page)):
            fig_id = f'mt07:{label}.{n}'
            _p, rect = recorte(fig_id)
            out = outdir / f'{label}.{n}.png'
            png(page, rect, out, numerar=True)
            print(f'{fig_id}  recuadro {[round(v) for v in g]}  → {out}')
            for i, (text, _r) in enumerate(etiquetas_par(page, rect)):
                print(f'    par #{i}: {text}')
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == '__main__':
    main(sys.argv[1:])
