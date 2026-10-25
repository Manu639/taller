"""Utilidades compartidas por los scripts de tools/."""
import json
import os
import re
import unicodedata
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
APP = REPO / 'app'
MANUALES = Path(os.environ.get('MANUALES', '/home/agents/manuales/streetfighter-1098'))
MT07_PDF = MANUALES / 'Manual taller MT 07.pdf'
SF_DESPIECES = MANUALES / 'sp_s'          # catálogo de la Streetfighter S (no USA)
SF_FOTOS = MANUALES / 'wsm' / 'images'    # fotos del manual de taller


def slug(text):
    """Igual que slug() en app/app.js: minúsculas, sin acentos y con guiones."""
    text = unicodedata.normalize('NFD', text.lower())
    text = ''.join(c for c in text if not ('̀' <= c <= 'ͯ'))
    return re.sub(r'[^a-z0-9]+', '-', text).strip('-')


def bike_key(bike):
    return slug(f"{bike['make']} {bike['model']}")


def load_seed():
    src = (APP / 'seed.js').read_text(encoding='utf-8')
    return json.loads(src[src.index('{'):src.index('};') + 1])


def torque_refs(bike):
    """Referencia estable de cada par de la semilla (igual que seedRefs() en app/app.js)."""
    seen = {}
    refs = []
    for t in bike['torques']:
        base = slug(t['component'])
        seen[base] = seen.get(base, 0) + 1
        refs.append(base if seen[base] == 1 else f'{base}-{seen[base]}')
    return refs


def seed_torques():
    """{clave de moto: [(ref, par), ...]}"""
    return {bike_key(b): list(zip(torque_refs(b), b['torques'])) for b in load_seed()['bikes']}
