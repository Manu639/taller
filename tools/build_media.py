"""Genera las figuras de la app a partir de los manuales:

- app/manual/…       despieces (SVG), fotos del manual de la Ducati (JPG) y figuras del manual de la MT-07 (PNG)
- app/manual/medios.json  lista de esos archivos, para que el service worker los guarde y funcionen sin conexión
- app/figuras.js     qué figura enseña cada par de apriete y dónde marcar el tornillo

Entradas (a mano): tools/figuras/<moto>.*.json (par → figura) y app/guias/*.js (las figuras que citan las guías).

Uso: python tools/build_media.py            (requiere PyMuPDF y Pillow; ver tools/README.md)
     python tools/build_media.py --comprobar (solo valida las entradas, sin escribir nada)
"""
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import despiece  # noqa: E402
from comun import APP, REPO, SF_FOTOS, seed_torques  # noqa: E402

MANUAL = APP / 'manual'
MT07_DPI = 180
SF_RADIO = 12

errores = []


def error(msg):
    errores.append(msg)


def cargar_guias():
    """{clave de moto: [guía, …]} leyendo los módulos de app/guias con node."""
    out = {}
    for path in sorted((APP / 'guias').glob('*.js')):
        js = f"import('{path.as_uri()}').then(m => console.log(JSON.stringify(m.default)))"
        res = subprocess.run(['node', '--input-type=module', '-e', js], capture_output=True, text=True)
        if res.returncode:
            error(f'{path.name}: no se puede cargar:\n{res.stderr}')
            continue
        out[path.stem] = json.loads(res.stdout)
    return out


def cargar_mapas(refs):
    """{clave de moto: {ref: [{fig, pos|par, nota}]}} desde tools/figuras/*.json"""
    out = {}
    for path in sorted((REPO / 'tools' / 'figuras').glob('*.json')):
        moto = path.name.split('.')[0]
        if moto not in refs:
            error(f'{path.name}: no hay ninguna moto «{moto}» en la semilla')
            continue
        for ref, figs in json.loads(path.read_text(encoding='utf-8')).items():
            if ref.startswith('_'):
                continue
            if ref not in refs[moto]:
                error(f'{path.name}: el par «{ref}» no existe')
                continue
            if figs:
                out.setdefault(moto, {}).setdefault(ref, []).extend(figs)
    return out


def figs_de_guia(guia):
    for paso in guia.get('pasos', []):
        fig = paso.get('fig')
        yield from ([fig] if isinstance(fig, str) else fig or [])


def refs_de_guia(guia):
    yield from guia.get('pares', [])
    for paso in guia.get('pasos', []):
        yield from re.findall(r'\[\[([^\]]+)\]\]', paso.get('texto', '') + ' ' + paso.get('aviso', ''))


def comprobar_guias(guias, refs):
    ids = set()
    for moto, lista in guias.items():
        if moto not in refs:
            error(f'guias/{moto}.js: no hay ninguna moto «{moto}» en la semilla')
            continue
        for g in lista:
            gid = g.get('id', '?')
            if gid in ids:
                error(f'guía repetida: {gid}')
            ids.add(gid)
            for campo in ('titulo', 'grupo', 'pasos'):
                if not g.get(campo):
                    error(f'{gid}: falta «{campo}»')
            for ref in refs_de_guia(g):
                if ref not in refs[moto]:
                    error(f'{gid}: el par «{ref}» no existe')
            for paso in g.get('pasos', []):
                if not paso.get('texto'):
                    error(f'{gid}: hay un paso sin texto')


def nombre_seguro(fig_id):
    return re.sub(r'[^A-Za-z0-9.\-]+', '_', fig_id.split(':', 1)[1])


def escribir(rel, data):
    """Escribe app/manual/<rel> con un hash del contenido en el nombre (así nunca se sirve una versión vieja)."""
    digest = hashlib.sha256(data).hexdigest()[:8]
    stem, ext = rel.rsplit('.', 1)
    rel = f'{stem}.{digest}.{ext}'
    path = MANUAL / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return f'manual/{rel}'


class Figuras:
    def __init__(self, generar):
        self.generar = generar
        self.meta = {}
        self._mt07 = None

    def mt07(self):
        if self._mt07 is None:
            import mt07
            self._mt07 = mt07
        return self._mt07

    def asegurar(self, fig_id):
        """Genera (si hace falta) la figura y devuelve sus metadatos, o None si no existe."""
        if fig_id in self.meta:
            return self.meta[fig_id]
        try:
            meta = self._generar(fig_id)
        except Exception as exc:  # noqa: BLE001
            error(f'{fig_id}: {exc}')
            meta = None
        self.meta[fig_id] = meta
        return meta

    def _generar(self, fig_id):
        kind, name = fig_id.split(':', 1)
        if kind == 'sf' and re.fullmatch(r'[A-Z]{3}\d{5}', name):
            laminas = despiece.laminas()
            if name not in laminas:
                raise ValueError('no es una lámina del catálogo de la Streetfighter S')
            w, h = despiece.tamano(name)
            meta = {'w': w, 'h': h, 'titulo': f"Despiece · {laminas[name]['nombre']}",
                    'fuente': f"Catálogo de recambios Streetfighter S, lámina {laminas[name]['num']}"}
            if self.generar:
                meta['src'] = escribir(f'sf/{name}.svg', despiece.svg_limpio(name).encode())
            return meta
        if kind == 'sf':
            src = next((p for p in (SF_FOTOS / f'{name}.jpg', SF_FOTOS / f'{name}.JPG') if p.exists()), None)
            if not src:
                raise ValueError('no existe la foto en wsm/images')
            from PIL import Image
            with Image.open(src) as img:
                w, h = img.size
            meta = {'w': w, 'h': h, 'titulo': '', 'fuente': 'Manual de taller Streetfighter (ed. 2010)'}
            if self.generar:
                # Los JPG del manual vienen con muy poca compresión: recomprimidos ocupan un tercio y se ven igual.
                import io
                buf = io.BytesIO()
                with Image.open(src) as img:
                    img.convert('RGB').save(buf, 'JPEG', quality=82, optimize=True, progressive=True)
                data = min(buf.getvalue(), src.read_bytes(), key=len)
                meta['src'] = escribir(f'sf/fotos/{name}.jpg', data)
            return meta
        if kind == 'mt07':
            mt07 = self.mt07()
            page, rect = mt07.recorte(fig_id)
            label = re.match(r'(\d+-\d+)', name).group(1)
            k = MT07_DPI / 72
            meta = {'w': round(rect.width * k), 'h': round(rect.height * k), 'titulo': '',
                    'fuente': f'Manual de servicio MT07A 2014, pág. {label}', '_page': page, '_rect': rect}
            if self.generar:
                import io
                from PIL import Image
                pix = page.get_pixmap(clip=rect, dpi=MT07_DPI, colorspace='gray')
                img = Image.frombytes('L', (pix.width, pix.height), pix.samples)
                buf = io.BytesIO()
                img.quantize(16).save(buf, format='PNG', optimize=True)
                meta['w'], meta['h'] = img.size
                meta['src'] = escribir(f'mt07/{nombre_seguro(fig_id)}.png', buf.getvalue())
            return meta
        raise ValueError('tipo de figura desconocido')

    def marcas(self, fig_id, entry):
        """Marcas de un par sobre la figura: círculos [x, y, r] (despieces) o rectángulos [x, y, w, h] (MT-07)."""
        meta = self.asegurar(fig_id)
        if meta is None:
            return None
        if fig_id.startswith('sf:'):
            code = fig_id[3:]
            pos = [str(p) for p in entry.get('pos', [])]
            calls = despiece.llamadas(code)
            marks = [[x, y, SF_RADIO] for label, x, y in calls if label in pos]
            for p in pos:
                if not any(label == p for label, _x, _y in calls):
                    error(f'{fig_id}: la posición {p} no está dibujada')
            piezas = [{'pos': p['pos'], 'codigo': p['codigo'], 'nombre': p['es'], 'cantidad': p['cantidad']}
                      for p in despiece.piezas(code) if p['pos'] in pos]
            return {'marcas': marks, 'piezas': piezas}
        page, rect = meta['_page'], meta['_rect']
        labels = self.mt07().etiquetas_par(page, rect)
        k = meta['w'] / rect.width
        marks = []
        for i in entry.get('par', []):
            if not 0 <= i < len(labels):
                error(f'{fig_id}: no hay etiqueta de par #{i}')
                continue
            r = labels[i][1] & rect
            marks.append([round((r.x0 - rect.x0) * k), round((r.y0 - rect.y0) * k), round(r.width * k), round(r.height * k)])
        return {'marcas': marks}


def main():
    generar = '--comprobar' not in sys.argv
    torques = seed_torques()
    refs = {moto: {ref for ref, _t in rows} for moto, rows in torques.items()}
    guias = cargar_guias()
    comprobar_guias(guias, refs)
    mapas = cargar_mapas(refs)

    if generar and MANUAL.exists():
        shutil.rmtree(MANUAL)
    figuras = Figuras(generar)

    pares = {}
    for moto, mapa in mapas.items():
        for ref, entries in mapa.items():
            for entry in entries:
                fig_id = entry.get('fig', '')
                marks = figuras.marcas(fig_id, entry)
                if marks is None:
                    continue
                item = {'fig': fig_id, **marks}
                if entry.get('nota'):
                    item['nota'] = entry['nota']
                pares.setdefault(moto, {}).setdefault(ref, []).append(item)
    for lista in guias.values():
        for g in lista:
            for fig_id in figs_de_guia(g):
                if figuras.asegurar(fig_id) is None:
                    error(f"{g.get('id')}: la figura «{fig_id}» no existe")

    if errores:
        print('\n'.join(f'✗ {e}' for e in errores), file=sys.stderr)
    n_pares = sum(len(m) for m in pares.values())
    print(f'{n_pares} pares con figura, {sum(len(g) for g in guias.values())} guías, '
          f'{sum(1 for m in figuras.meta.values() if m)} figuras')
    if not generar:
        sys.exit(1 if errores else 0)

    meta = {fid: {k: v for k, v in m.items() if not k.startswith('_')} for fid, m in sorted(figuras.meta.items()) if m}
    js = ('// GENERADO por tools/build_media.py a partir de los manuales. No editar a mano.\n'
          '// FIGURAS: imágenes del manual (w × h en unidades de la imagen). PARES: figuras de cada par y dónde marcarlo.\n\n'
          f'export const FIGURAS = {json.dumps(meta, ensure_ascii=False, indent=1)};\n\n'
          f'export const PARES = {json.dumps(pares, ensure_ascii=False, indent=1)};\n')
    (APP / 'figuras.js').write_text(js, encoding='utf-8')
    medios = sorted(m['src'] for m in meta.values())
    MANUAL.mkdir(exist_ok=True)
    (MANUAL / 'medios.json').write_text(json.dumps(medios, indent=0) + '\n', encoding='utf-8')
    size = sum((APP / m).stat().st_size for m in medios)
    print(f'app/figuras.js y {len(medios)} archivos en app/manual ({size / 1e6:.1f} MB)')
    sys.exit(1 if errores else 0)


if __name__ == '__main__':
    main()
