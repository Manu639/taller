# Imagen de Taller: caddy sirviendo los archivos de app/ en el puerto 80.
# VERSION es la versión de la release (sin la «v»); se escribe en APP_VERSION y en la caché del service worker.

FROM --platform=$BUILDPLATFORM alpine:3 AS version
ARG VERSION=dev
COPY app/ /srv/
RUN echo "$VERSION" | grep -Eq '^([0-9]+\.[0-9]+\.[0-9]+|dev)$' \
 && sed -i "s/^const APP_VERSION = 'dev';/const APP_VERSION = '$VERSION';/" /srv/app.js \
 && sed -i "s/^const CACHE = 'taller-dev';/const CACHE = 'taller-$VERSION';/" /srv/sw.js \
 && grep -q "^const APP_VERSION = '$VERSION';" /srv/app.js \
 && grep -q "^const CACHE = 'taller-$VERSION';" /srv/sw.js

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=version /srv/ /srv/
