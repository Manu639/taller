# tools

Scripts para sacar de los manuales de taller las figuras que enseña la app. Se ejecutan a mano en el ordenador
donde están los manuales (por defecto en `/home/agents/manuales/streetfighter-1098`; si no, en la variable
`MANUALES`). La app no los necesita: solo usa lo que generan, que va al repo.

## Preparar

```sh
python3 -m venv ~/.venv-taller
~/.venv-taller/bin/pip install pymupdf pillow
sudo apt install librsvg2-bin   # solo para las vistas previas de despiece.py png
```

## Qué hay

- `build_media.py`: genera `app/figuras.js`, `app/manual/` (despieces, fotos y figuras) y `app/manual/medios.json`.
  Lee las figuras de cada par en `figuras/<moto>.*.json` y las que citan las guías en `app/guias/*.js`.
  Con `--comprobar` solo valida (pares y figuras que existen, posiciones dibujadas…).
- `despiece.py`: despieces de la Streetfighter S (catálogo de recambios de Ducati, carpeta `sp_s/`): lista de
  láminas, piezas de cada lámina y vista previa con posiciones marcadas.
- `mt07.py`: figuras del manual de servicio de la MT-07 (PDF): busca texto, detecta las figuras de cada página y sus
  etiquetas de par.
- `comun.py`: rutas y la referencia estable de cada par (`ref`), que se calcula igual que en `app/app.js`.

## Añadir o corregir la figura de un par

1. Busca la `ref` del par: es el nombre del componente en minúsculas, sin acentos y con guiones
   (`Tornillo de fijación de la pinza del freno delantero` → `tornillo-de-fijacion-de-la-pinza-del-freno-delantero`;
   si el nombre se repite en la misma moto, el segundo lleva `-2`).
2. Ducati: busca la lámina y la posición con `python3 -I tools/despiece.py lista` y `… ver BRB00270`, y compruébalo
   con `… png BRB00270 25 /tmp/x.png`. Añade a `figuras/ducati-streetfighter-1098.*.json`:
   `"<ref>": [{"fig": "sf:BRB00270", "pos": ["25"]}]`.
3. MT-07: busca la página con `~/.venv-taller/bin/python tools/mt07.py buscar "Front brake caliper bolt"` y mira sus
   figuras con `… pagina 4-35` (deja un PNG de cada una en `/tmp/mt07-figuras/` con las etiquetas de par numeradas).
   Añade a `figuras/yamaha-mt-07.*.json`: `"<ref>": [{"fig": "mt07:4-35.0", "par": [1]}]`.
4. `~/.venv-taller/bin/python tools/build_media.py` y prueba la app.

## Guías

Están en `app/guias/<moto>.js`, a mano. Cada paso puede citar un par con `[[ref]]` (la app pone el valor actual y se
puede tocar) y llevar figuras en `fig`: una foto del manual de la Ducati (`sf:Streetfighter_10_D_4_5_00.18.1.4`, el
nombre del archivo de `wsm/images/` sin extensión), un despiece (`sf:BRB00270`) o una figura de la MT-07
(`mt07:3-24.0`, o un recorte a mano en puntos de la página: `mt07:3-24@57,346,283,516`). Después de tocar las guías hay
que volver a ejecutar `build_media.py`, que genera las imágenes que citan.
