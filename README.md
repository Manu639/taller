# Taller

Pares de apriete y guías de mantenimiento para mis motos. PWA estática (HTML, JS y CSS, sin build ni backend)
pensada para el iPad. Publicada en https://taller.manucastillo.dev.

- `app/`: la app.
  - `seed.js`: pares de apriete iniciales, sacados de los manuales.
  - `guias/`: guías paso a paso de cada moto, redactadas a partir de los manuales.
  - `figuras.js` y `manual/`: despieces y figuras de los manuales (qué tornillo es cada par y fotos de las guías).
    Los genera `tools/build_media.py`; ver `tools/README.md`.
- `tools/`: scripts para sacar las figuras de los manuales de taller.
- `Caddyfile` y `Dockerfile`: la imagen `ghcr.io/manu639/taller`, que sirve `app/` con caddy en el puerto 80.
- `.github/workflows/imagen.yml`: construye la imagen en cada PR y la publica al crear una release.

## Probar en local

```sh
python3 -m http.server 8000 --directory app
```

y abrir http://localhost:8000. En local la versión es `dev` y no se comprueba si hay versiones nuevas.

## Publicar una versión

1. Rama, PR y merge a `main`. Esto no publica nada.
2. Crear una release con etiqueta `vX.Y.Z`, desde la web de GitHub o con:

   ```sh
   gh release create v1.3.0 --generate-notes
   ```

   La Action construye `ghcr.io/manu639/taller:1.3.0` (y `1.3`). Al construirla escribe la versión en
   `APP_VERSION` (`app/app.js`) y en `CACHE` (`app/sw.js`), así que no hay que tocarlos a mano.
3. La app instalada avisa de que hay una versión nueva publicada (consulta la última release de GitHub
   como mucho cada 6 horas).

## Actualizar el homelab

En `/homelab/services/taller/docker-compose.yml`, cambiar la etiqueta de la imagen y:

```sh
docker compose pull && docker compose up -d
```

Solo se recrea el contenedor `taller`. En el iPad la versión nueva aparece al cerrar y volver a abrir
la app. Para volver atrás, poner la etiqueta anterior y repetir.
