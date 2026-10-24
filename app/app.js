import { createSeed } from './seed.js';

// Al construir la imagen, el Dockerfile cambia 'dev' por la versión de la release (p. ej. '1.2.0').
const APP_VERSION = 'dev';
const RELEASES_URL = 'https://api.github.com/repos/Manu639/taller/releases/latest';
const UPDATE_KEY = 'taller.update';
const UPDATE_CHECK_MS = 6 * 60 * 60 * 1000;
const STORAGE_KEY = 'taller.v2';
const BIKE_KEY = 'taller.bike';
const FAV_FILTER = '__fav';
const DEFAULT_GROUP = 'Otros';

const THREADLOCK_SUGGESTIONS = [
  'Fijador de roscas medio (azul)',
  'Fijador de roscas fuerte (rojo)',
  'Rosca en seco',
  'Aceite de motor',
  'Grasa',
  'Pasta antigripante',
  'Sellador sólido en el tornillo',
];

const UNITS = [
  { id: 'nm', label: 'N·m', toNm: 1, decimals: 1 },
  { id: 'lbft', label: 'lb·ft', toNm: 1.3558179483, decimals: 1 },
  { id: 'kgfm', label: 'kgf·m', toNm: 9.80665, decimals: 2 },
  { id: 'lbin', label: 'lb·in', toNm: 0.112984829, decimals: 0 },
];

// Por encima de esto se pide confirmación: casi seguro que es un error al teclear.
const SUSPICIOUS_NM = 400;

const NUT_ICON = `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M12 2 20.66 7v10L12 22 3.34 17V7z" fill="var(--accent)"/><circle cx="12" cy="12" r="4" fill="var(--bg)"/></svg>`;

/* ---------- Utilidades ---------- */

// crypto.randomUUID solo existe en contextos seguros (HTTPS); en HTTP de pruebas usamos otra cosa.
const uid = () => globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Acepta coma o punto decimal (el teclado del iPad en español pone coma).
function parseNum(value) {
  const str = String(value ?? '').trim().replace(',', '.');
  if (str === '') return null;
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

const fmt = (n, decimals = 2) => n.toLocaleString('es-ES', { maximumFractionDigits: decimals });
const fmtInput = n => (n == null ? '' : String(n).replace('.', ','));
const unit = id => UNITS.find(u => u.id === id);
const fromNm = (nm, unitId) => fmt(nm / unit(unitId).toNm, unit(unitId).decimals);
const fold = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const positive = v => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);

const isStandalone = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;

/* ---------- Datos ---------- */

function normalizeTorque(t) {
  const nm = positive(t.nm);
  const valueText = String(t.valueText ?? '').trim();
  const stages = String(t.stages ?? '').trim();
  const qty = positive(t.qty);
  return {
    id: String(t.id || uid()),
    group: String(t.group ?? '').trim() || DEFAULT_GROUP,
    component: String(t.component ?? '').trim() || 'Sin nombre',
    thread: String(t.thread ?? '').trim(),
    qty: qty != null ? Math.round(qty) : null,
    nm,
    valueText,
    min: positive(t.min),
    max: positive(t.max),
    stages,
    threadlock: String(t.threadlock ?? ''),
    notes: String(t.notes ?? ''),
    source: String(t.source ?? ''),
    critical: !!t.critical,
    oneUse: !!t.oneUse,
    fav: !!t.fav,
    verified: !!t.verified && (nm != null || !!valueText || !!stages),
  };
}

function normalizeBike(b) {
  const km = parseNum(b.km);
  return {
    id: String(b.id || uid()),
    name: String(b.name ?? '').trim() || 'Moto',
    make: String(b.make ?? ''),
    model: String(b.model ?? ''),
    year: String(b.year ?? ''),
    variant: String(b.variant ?? ''),
    km: km != null && km >= 0 ? Math.round(km) : null,
    notes: String(b.notes ?? ''),
    torques: Array.isArray(b.torques) ? b.torques.map(normalizeTorque) : [],
  };
}

function normalizeData(d) {
  if (!d || !Array.isArray(d.bikes)) throw new Error('el archivo no es una copia de esta app.');
  return {
    version: 2,
    lastExport: typeof d.lastExport === 'string' ? d.lastExport : null,
    bikes: d.bikes.map(normalizeBike),
  };
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return normalizeData(JSON.parse(raw));
    } catch (err) {
      // No machacamos datos que no entendemos: se apartan por si hay que recuperarlos.
      console.error(err);
      localStorage.setItem(`${STORAGE_KEY}.corrupto.${Date.now()}`, raw);
    }
  }
  return normalizeData(createSeed(uid));
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    if (state.bikeId) localStorage.setItem(BIKE_KEY, state.bikeId);
  } catch (err) {
    alert(`No se han podido guardar los cambios: ${err.message}`);
  }
}

const state = {
  data: load(),
  bikeId: localStorage.getItem(BIKE_KEY),
  view: 'pares',
  query: '',
  group: null,
  conv: { value: '', unit: 'nm' },
  update: null, // { latest, url } si hay una release más nueva que la que está corriendo
};

const currentBike = () => state.data.bikes.find(b => b.id === state.bikeId) ?? state.data.bikes[0] ?? null;
const groupsOf = bike => [...new Set(bike.torques.map(t => t.group))];
const hasValue = t => t.nm != null || !!t.valueText || !!t.stages;

function torqueStatus(t) {
  if (t.verified) return { cls: 'ok', label: 'Comprobado por ti en el manual' };
  if (hasValue(t)) return { cls: 'amber', label: 'Sin comprobar' };
  return { cls: 'none', label: 'Pendiente de rellenar' };
}

// Versión corta del fijador para la lista: sin las explicaciones entre paréntesis.
function shortProduct(text) {
  const s = text.replace(/\s*\([^()]*(\([^()]*\)[^()]*)*\)/g, '').replace(/\s+—.*$/, '').trim();
  return s.length > 34 ? `${s.slice(0, 32)}…` : s;
}

/* ---------- Vistas ---------- */

const app = document.getElementById('app');
const dlg = document.getElementById('dlg');

const VIEWS = [
  ['pares', 'Pares', renderPares],
  ['conversor', 'Conversor', renderConversor],
  ['ajustes', 'Ajustes', renderAjustes],
];

function render() {
  const [, , renderView] = VIEWS.find(([id]) => id === state.view);
  app.innerHTML = `
    <header class="topbar">
      <div class="brand">${NUT_ICON}<span>Taller</span></div>
      <nav class="tabs">
        ${VIEWS.map(([id, label]) => `<button class="tab ${state.view === id ? 'active' : ''}" data-action="view" data-view="${id}">${label}</button>`).join('')}
      </nav>
    </header>
    ${renderUpdateBanner()}
    <main class="view">${renderView()}</main>`;
  if (state.view === 'ajustes') updateStorageStatus();
}

function renderPares() {
  const bike = currentBike();
  const bikeBar = `
    <div class="bike-bar">
      ${state.data.bikes.map(b => `
        <button class="bike-chip ${b === bike ? 'active' : ''}" data-action="select-bike" data-id="${esc(b.id)}">
          <span>${esc(b.name)}</span>
          <small>${esc([b.make, b.year].filter(Boolean).join(' · '))}</small>
        </button>`).join('')}
      <button class="bike-chip add" data-action="add-bike">+ Moto</button>
    </div>`;

  if (!bike) return `${bikeBar}<div class="card empty">Añade tu primera moto para empezar.</div>`;

  const total = bike.torques.length;
  const pending = bike.torques.filter(t => !hasValue(t)).length;
  const verified = bike.torques.filter(t => t.verified).length;
  const favs = bike.torques.filter(t => t.fav).length;
  const subtitle = [`${bike.make} ${bike.model}`.trim(), bike.year, bike.variant].filter(Boolean).join(' · ');
  const groups = groupsOf(bike);
  if (state.group === FAV_FILTER ? !favs : state.group && !groups.includes(state.group)) state.group = null;

  return `
    ${bikeBar}
    <section class="card bike-head">
      <div class="bike-title">
        <h1>${esc(bike.name)}</h1>
        <p class="muted">${esc(subtitle)}${bike.km != null ? ` · ${fmt(bike.km, 0)} km` : ''}</p>
        ${bike.notes ? `<p class="bike-notes">${esc(bike.notes)}</p>` : ''}
      </div>
      <div class="bike-stats">
        <div><strong>${total}</strong><span>pares</span></div>
        <div><strong>${verified}</strong><span>comprobados</span></div>
      </div>
      <button class="btn" data-action="edit-bike">Editar moto</button>
    </section>
    ${pending ? `<div class="notice">Faltan <strong>${pending}</strong> valores. Cópialos del <strong>manual de taller</strong> de tu modelo y año exactos.</div>` : ''}
    <div class="toolbar">
      <input id="search" type="search" placeholder="Buscar componente, rosca, producto…" value="${esc(state.query)}" autocomplete="off">
      <button class="btn primary" data-action="add-torque">+ Par</button>
    </div>
    <div class="chips">
      <button class="chip ${!state.group ? 'active' : ''}" data-action="group" data-group="">Todos</button>
      ${favs ? `<button class="chip fav ${state.group === FAV_FILTER ? 'active' : ''}" data-action="group" data-group="${FAV_FILTER}">★ Habituales</button>` : ''}
      ${groups.length > 1 ? groups.map(g => `<button class="chip ${state.group === g ? 'active' : ''}" data-action="group" data-group="${esc(g)}">${esc(g)}</button>`).join('') : ''}
    </div>
    <div id="list">${renderList(bike)}</div>`;
}

function renderList(bike) {
  const q = fold(state.query.trim());
  const items = bike.torques.filter(t =>
    (!state.group || (state.group === FAV_FILTER ? t.fav : t.group === state.group)) &&
    (!q || fold([t.component, t.group, t.thread, t.threadlock, t.notes, t.stages, t.source].join(' ')).includes(q)));

  if (!items.length) {
    return `<div class="empty">${bike.torques.length ? 'Nada coincide con la búsqueda.' : 'Esta moto aún no tiene pares. Pulsa «+ Par».'}</div>`;
  }

  return groupsOf(bike).map(g => {
    const rows = items.filter(t => t.group === g);
    if (!rows.length) return '';
    return `<section class="group"><h2>${esc(g)}</h2><div class="rows">${rows.map(renderRow).join('')}</div></section>`;
  }).join('');
}

function renderRow(t) {
  const status = torqueStatus(t);
  const tags = [
    t.critical && `<span class="tag danger">Crítico</span>`,
    t.oneUse && `<span class="tag danger">Un solo uso</span>`,
    t.stages && `<span class="tag accent">Por etapas</span>`,
    t.thread && `<span class="tag">${esc(t.thread)}${t.qty > 1 ? ` ×${t.qty}` : ''}</span>`,
    t.threadlock && `<span class="tag">${esc(shortProduct(t.threadlock))}</span>`,
  ].filter(Boolean).join('');

  let value;
  if (t.nm != null) value = `<span class="nm">${fmt(t.nm, 1)}<small>N·m</small></span><span class="alt">${fromNm(t.nm, 'lbft')} lb·ft</span>`;
  else if (t.valueText) value = `<span class="value-text">${esc(t.valueText)}</span>`;
  else value = `<span class="pending">Pendiente</span>`;

  return `
    <button class="row" data-action="open-torque" data-id="${esc(t.id)}">
      <span class="status-dot ${status.cls}" title="${status.label}"></span>
      <span class="row-main">
        <span class="comp">${t.fav ? '<span class="star">★</span> ' : ''}${esc(t.component)}</span>
        <span class="tags">${tags}</span>
      </span>
      <span class="row-val">${value}</span>
    </button>`;
}

function renderConversor() {
  return `
    <section class="card converter">
      <h1>Conversor de par</h1>
      <div class="conv-input">
        <input id="conv-value" inputmode="decimal" placeholder="0" value="${esc(state.conv.value)}" autocomplete="off" aria-label="Valor">
        <div class="seg">
          ${UNITS.map(u => `<button class="seg-btn ${u.id === state.conv.unit ? 'active' : ''}" data-action="conv-unit" data-unit="${u.id}">${u.label}</button>`).join('')}
        </div>
      </div>
      <div id="conv-out" class="conv-grid">${renderConvOut()}</div>
    </section>
    <p class="muted small center">1 lb·ft = 1,356 N·m · 1 kgf·m = 9,807 N·m · 1 lb·in = 0,113 N·m</p>`;
}

function renderConvOut() {
  const value = parseNum(state.conv.value);
  const from = unit(state.conv.unit);
  return UNITS.map(u => `
    <div class="conv-tile ${u.id === from.id ? 'from' : ''}">
      <strong>${value == null ? '—' : fmt(value * from.toNm / u.toNm, u.decimals + 1)}</strong>
      <span>${u.label}</span>
    </div>`).join('');
}

function renderAjustes() {
  const torques = state.data.bikes.reduce((n, b) => n + b.torques.length, 0);
  const lastExport = state.data.lastExport
    ? new Date(state.data.lastExport).toLocaleDateString('es-ES', { dateStyle: 'long' })
    : 'nunca';

  return `
    <section class="card">
      <h2>Copia de seguridad</h2>
      <p class="muted">Los datos se guardan solo en este iPad (${state.data.bikes.length} motos, ${torques} pares).
        Exporta una copia de vez en cuando y guárdala en Archivos o iCloud Drive.</p>
      <p>Última copia: <strong>${lastExport}</strong></p>
      <div class="btn-row">
        <button class="btn primary" data-action="export">Exportar copia</button>
        <button class="btn" data-action="import">Importar copia</button>
      </div>
      <input type="file" id="import-file" accept="application/json,.json" hidden>
    </section>
    <section class="card">
      <h2>Instalación</h2>
      ${isStandalone()
        ? `<p class="ok-text">✓ Instalada en la pantalla de inicio.</p>`
        : `<p class="warn-text">Estás usando la app desde Safari. Para que funcione sin conexión y el iPad no borre los datos:
             botón Compartir → «Añadir a pantalla de inicio».</p>`}
      <p class="muted" id="storage-status"></p>
    </section>
    <section class="card">
      <h2>Datos de los manuales</h2>
      <p class="muted">Vuelve a cargar las dos motos con los pares originales extraídos de los manuales de taller.
        Se pierde todo lo que hayas cambiado o añadido.</p>
      <div class="btn-row"><button class="btn danger" data-action="reset">Restaurar datos de los manuales</button></div>
    </section>
    <p class="muted small center">Taller v${APP_VERSION}</p>`;
}

/* ---------- Versión nueva ---------- */

function renderUpdateBanner() {
  if (!state.update) return '';
  return `
    <div class="update-banner" role="status">
      <strong>Hay una versión nueva publicada: v${esc(state.update.latest)}</strong> (tienes v${esc(APP_VERSION)}).
      <a href="${esc(state.update.url)}" target="_blank" rel="noopener">Novedades</a>
      <span class="muted small">Si ya has actualizado el homelab, cierra y vuelve a abrir la app.</span>
    </div>`;
}

// ¿La versión a (x.y.z) es posterior a b?
function isNewer(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] > pb[i];
  }
  return false;
}

// Consulta la última release en GitHub como mucho cada UPDATE_CHECK_MS y avisa si es más nueva.
async function checkForUpdate() {
  if (!/^\d+\.\d+\.\d+$/.test(APP_VERSION)) return; // copia local sin versión ('dev')
  let info = null;
  try {
    info = JSON.parse(localStorage.getItem(UPDATE_KEY));
  } catch { /* se vuelve a consultar */ }
  if (!info || Date.now() - info.checkedAt > UPDATE_CHECK_MS) {
    try {
      const res = await fetch(RELEASES_URL, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) return;
      const release = await res.json();
      info = { latest: release.tag_name.replace(/^v/, ''), url: release.html_url, checkedAt: Date.now() };
      localStorage.setItem(UPDATE_KEY, JSON.stringify(info));
    } catch {
      return; // sin conexión: se mirará la próxima vez
    }
  }
  if (!/^\d+\.\d+\.\d+$/.test(info.latest)) return;
  const update = isNewer(info.latest, APP_VERSION) ? { latest: info.latest, url: info.url } : null;
  if (update?.latest !== state.update?.latest) {
    state.update = update;
    render();
  }
}

async function updateStorageStatus() {
  const el = document.getElementById('storage-status');
  if (!el || !navigator.storage?.persisted) return;
  const persisted = await navigator.storage.persisted();
  el.textContent = persisted
    ? 'Almacenamiento persistente concedido.'
    : 'El navegador no garantiza que los datos se conserven: instala la app y exporta copias.';
}

/* ---------- Diálogos ---------- */

let onSubmit = null;

function openDialog(html, submitHandler = null) {
  dlg.innerHTML = html;
  onSubmit = submitHandler;
  if (!dlg.open) dlg.showModal();
  dlg.scrollTop = 0;
}

function closeDialog() {
  if (dlg.open) dlg.close();
}

function showFormError(message) {
  const el = dlg.querySelector('.form-error');
  el.textContent = message;
  el.scrollIntoView({ block: 'nearest' });
}

const rangeText = t => (t.min != null && t.max != null ? `Rango: ${fmt(t.min)}–${fmt(t.max)} N·m` : '');

function openTorqueDetail(id) {
  const bike = currentBike();
  const t = bike?.torques.find(x => x.id === id);
  if (!t) return;
  const status = torqueStatus(t);
  const details = [
    t.thread && `<dt>Rosca</dt><dd>${esc(t.thread)}${t.qty ? ` · ${t.qty} ${t.qty === 1 ? 'unidad' : 'unidades'}` : ''}</dd>`,
    t.threadlock && `<dt>Producto</dt><dd>${esc(t.threadlock)}</dd>`,
    t.notes && `<dt>Notas</dt><dd>${esc(t.notes)}</dd>`,
    t.source && `<dt>Fuente</dt><dd>${esc(t.source)}</dd>`,
  ].filter(Boolean).join('');

  let value;
  if (t.nm != null) {
    value = `
      <div class="big-value">${fmt(t.nm, 1)}<span>N·m</span></div>
      <div class="alt-values">
        ${['lbft', 'kgfm', 'lbin'].map(u => `<span><strong>${fromNm(t.nm, u)}</strong> ${unit(u).label}</span>`).join('')}
      </div>
      ${rangeText(t) ? `<p class="range">${rangeText(t)}</p>` : ''}`;
  } else if (t.valueText) {
    value = `<div class="big-value text-value">${esc(t.valueText)}</div>`;
  } else {
    value = `<div class="big-value empty-value">—</div><p class="muted center">Busca este par en el manual de taller y añádelo.</p>`;
  }

  openDialog(`
    <div class="sheet">
      <div class="sheet-head">
        <div><p class="eyebrow">${esc(bike.name)} · ${esc(t.group)}</p><h2>${esc(t.component)}</h2></div>
        <button class="icon-btn" data-action="close" aria-label="Cerrar">✕</button>
      </div>
      ${value}
      ${t.critical ? `<div class="alert danger">Punto crítico para la seguridad. Usa llave dinamométrica y respeta la tolerancia.</div>` : ''}
      ${t.oneUse ? `<div class="alert danger">Tornillo o tuerca de un solo uso: sustitúyelo por uno nuevo.</div>` : ''}
      ${t.stages ? `<div class="stages"><h3>Pasos de apriete</h3><p>${esc(t.stages)}</p></div>` : ''}
      <p class="status ${status.cls}">${status.label}</p>
      <dl class="details">${details}</dl>
      <div class="sheet-actions">
        <button class="btn danger" data-action="delete-torque" data-id="${esc(t.id)}">Eliminar</button>
        <span class="spacer"></span>
        <button class="btn ${t.fav ? 'fav-on' : ''}" data-action="toggle-fav" data-id="${esc(t.id)}">${t.fav ? '★ Habitual' : '☆ Marcar habitual'}</button>
        <button class="btn primary" data-action="edit-torque" data-id="${esc(t.id)}">${hasValue(t) ? 'Editar' : 'Añadir valor'}</button>
      </div>
    </div>`);
}

function openTorqueForm(existing) {
  const bike = currentBike();
  const defaultGroup = state.group && state.group !== FAV_FILTER ? state.group : groupsOf(bike)[0] ?? DEFAULT_GROUP;
  const t = existing ?? { ...normalizeTorque({ group: defaultGroup, fav: state.group === FAV_FILTER }), component: '' };
  const check = (name, label, on) => `<label class="check"><input type="checkbox" name="${name}" ${on ? 'checked' : ''}> ${label}</label>`;

  openDialog(`
    <form class="sheet form" novalidate data-original-nm="${t.nm ?? ''}">
      <div class="sheet-head">
        <div><p class="eyebrow">${esc(bike.name)}</p><h2>${existing ? 'Editar par' : 'Nuevo par'}</h2></div>
        <button type="button" class="icon-btn" data-action="close" aria-label="Cerrar">✕</button>
      </div>
      <label>Componente
        <input name="component" value="${esc(t.component)}" placeholder="p. ej. Tuerca eje trasero" autocomplete="off">
      </label>
      <div class="grid2">
        <label>Grupo
          <input name="group" list="group-list" value="${esc(t.group)}" autocomplete="off">
        </label>
        <label>Par (N·m)
          <input name="nm" inputmode="decimal" value="${fmtInput(t.nm)}" placeholder="—" autocomplete="off">
          <span class="hint" id="nm-hint">${nmHint(t.nm)}</span>
        </label>
        <label>Mínimo (N·m)<input name="min" inputmode="decimal" value="${fmtInput(t.min)}" autocomplete="off"></label>
        <label>Máximo (N·m)<input name="max" inputmode="decimal" value="${fmtInput(t.max)}" autocomplete="off"></label>
        <label>Rosca<input name="thread" value="${esc(t.thread)}" placeholder="p. ej. M8x1,25" autocomplete="off"></label>
        <label>Cantidad<input name="qty" inputmode="numeric" value="${t.qty ?? ''}" autocomplete="off"></label>
      </div>
      <datalist id="group-list">${groupsOf(bike).map(g => `<option value="${esc(g)}">`).join('')}</datalist>
      <label>Valor sin número (si no hay par fijo)
        <input name="valueText" value="${esc(t.valueText)}" placeholder="p. ej. Ver pasos, Hasta el tope…" autocomplete="off">
      </label>
      <label>Pasos de apriete
        <textarea name="stages" rows="3" placeholder="1) 20 N·m  2) 40 N·m  3) +90°…">${esc(t.stages)}</textarea>
      </label>
      <label>Fijador / lubricación de la rosca
        <input name="threadlock" list="threadlock-list" value="${esc(t.threadlock)}" placeholder="p. ej. fijador medio, grasa, en seco…" autocomplete="off">
      </label>
      <datalist id="threadlock-list">${THREADLOCK_SUGGESTIONS.map(s => `<option value="${esc(s)}">`).join('')}</datalist>
      <label>Notas
        <textarea name="notes" rows="2" placeholder="Secuencia en cruz, avisos…">${esc(t.notes)}</textarea>
      </label>
      <label>Fuente
        <input name="source" value="${esc(t.source)}" placeholder="Manual de taller, pág. …" autocomplete="off">
      </label>
      ${check('critical', 'Punto crítico para la seguridad', t.critical)}
      ${check('oneUse', 'Tornillo o tuerca de un solo uso', t.oneUse)}
      ${check('fav', 'Habitual (aparece en «★ Habituales»)', t.fav)}
      ${check('verified', 'Comprobado por mí en el manual de esta moto', t.verified)}
      <p class="form-error"></p>
      <div class="sheet-actions">
        <button type="button" class="btn" data-action="close">Cancelar</button>
        <button type="submit" class="btn primary">Guardar</button>
      </div>
    </form>`, fd => {
    const text = name => fd.get(name).trim();
    const nmRaw = text('nm');
    const values = {
      group: text('group') || DEFAULT_GROUP,
      component: text('component'),
      thread: text('thread'),
      qty: parseNum(text('qty')),
      nm: parseNum(nmRaw),
      min: parseNum(text('min')),
      max: parseNum(text('max')),
      valueText: text('valueText'),
      stages: text('stages'),
      threadlock: text('threadlock'),
      notes: text('notes'),
      source: text('source'),
      critical: fd.get('critical') === 'on',
      oneUse: fd.get('oneUse') === 'on',
      fav: fd.get('fav') === 'on',
      verified: fd.get('verified') === 'on',
    };
    const { nm, min, max } = values;

    if (!values.component) return showFormError('Escribe el nombre del componente.');
    if (nmRaw && (nm == null || nm <= 0)) return showFormError('El par tiene que ser un número mayor que 0.');
    if ((text('min') && min == null) || (text('max') && max == null)) return showFormError('El mínimo y el máximo tienen que ser números.');
    if (min != null && max != null && min > max) return showFormError('El mínimo no puede ser mayor que el máximo.');
    if (nm != null && ((min != null && nm < min) || (max != null && nm > max))) return showFormError('El par queda fuera del rango mínimo–máximo.');
    if (values.verified && !hasValue(values)) return showFormError('No se puede marcar como comprobado sin un valor.');
    if (values.verified && !values.source) return showFormError('Indica la fuente (p. ej. la página del manual) para marcarlo como comprobado.');
    if (nm > SUSPICIOUS_NM && !confirm(`${fmt(nm, 1)} N·m es un valor muy alto. ¿Seguro que es correcto?`)) return;

    const clean = normalizeTorque({ id: existing?.id, ...values });
    if (existing) Object.assign(existing, clean);
    else bike.torques.push(clean);
    save();
    render();
    if (existing) openTorqueDetail(existing.id);
    else closeDialog();
  });
}

function nmHint(nm) {
  return nm != null && nm > 0 ? `= ${fromNm(nm, 'lbft')} lb·ft · ${fromNm(nm, 'kgfm')} kgf·m` : '';
}

function openBikeForm(existing) {
  const b = existing ?? { ...normalizeBike({}), name: '' };

  openDialog(`
    <form class="sheet form" novalidate>
      <div class="sheet-head">
        <h2>${existing ? 'Editar moto' : 'Nueva moto'}</h2>
        <button type="button" class="icon-btn" data-action="close" aria-label="Cerrar">✕</button>
      </div>
      <label>Nombre corto<input name="name" value="${esc(b.name)}" placeholder="p. ej. MT-07" autocomplete="off"></label>
      <div class="grid2">
        <label>Marca<input name="make" value="${esc(b.make)}" autocomplete="off"></label>
        <label>Modelo<input name="model" value="${esc(b.model)}" autocomplete="off"></label>
        <label>Año<input name="year" inputmode="numeric" value="${esc(b.year)}" autocomplete="off"></label>
        <label>Kilómetros<input name="km" inputmode="numeric" value="${b.km ?? ''}" autocomplete="off"></label>
      </div>
      <label>Versión<input name="variant" value="${esc(b.variant)}" placeholder="p. ej. sin ABS, A2…" autocomplete="off"></label>
      <label>Notas<textarea name="notes" rows="3" placeholder="Kit A2 montado, modificaciones, neumáticos…">${esc(b.notes)}</textarea></label>
      <p class="form-error"></p>
      <div class="sheet-actions">
        ${existing ? `<button type="button" class="btn danger" data-action="delete-bike">Eliminar moto</button><span class="spacer"></span>` : ''}
        <button type="button" class="btn" data-action="close">Cancelar</button>
        <button type="submit" class="btn primary">Guardar</button>
      </div>
    </form>`, fd => {
    const kmRaw = fd.get('km').trim();
    const km = parseNum(kmRaw.replace(/\./g, ''));
    const values = {
      name: fd.get('name').trim(),
      make: fd.get('make').trim(),
      model: fd.get('model').trim(),
      year: fd.get('year').trim(),
      variant: fd.get('variant').trim(),
      km: km != null ? Math.round(km) : null,
      notes: fd.get('notes').trim(),
    };

    if (!values.name) return showFormError('Ponle un nombre a la moto.');
    if (kmRaw && (km == null || km < 0)) return showFormError('Los kilómetros tienen que ser un número.');

    if (existing) {
      Object.assign(existing, values);
    } else {
      const bike = { id: uid(), ...values, torques: [] };
      state.data.bikes.push(bike);
      state.bikeId = bike.id;
      state.group = null;
      state.query = '';
    }
    save();
    closeDialog();
    render();
  });
}

/* ---------- Copias de seguridad ---------- */

async function exportData() {
  const now = new Date();
  const name = `taller-motos-${now.toISOString().slice(0, 10)}.json`;
  const json = JSON.stringify({ app: 'taller', exportedAt: now.toISOString(), ...state.data }, null, 2);
  const file = new File([json], name, { type: 'application/json' });

  try {
    // En el iPad, la hoja de Compartir permite «Guardar en Archivos».
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: name });
    } else {
      const url = URL.createObjectURL(file);
      const a = Object.assign(document.createElement('a'), { href: url, download: name });
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    state.data.lastExport = now.toISOString();
    save();
    render();
  } catch (err) {
    if (err.name !== 'AbortError') alert(`No se ha podido exportar: ${err.message}`);
  }
}

async function importData(file) {
  try {
    const data = normalizeData(JSON.parse(await file.text()));
    const torques = data.bikes.reduce((n, b) => n + b.torques.length, 0);
    if (!confirm(`Se van a sustituir TODOS los datos actuales por la copia (${data.bikes.length} motos, ${torques} pares). ¿Continuar?`)) return;
    state.data = data;
    state.bikeId = data.bikes[0]?.id ?? null;
    state.group = null;
    state.query = '';
    save();
    render();
    alert('Copia importada.');
  } catch (err) {
    alert(`No se ha podido importar: ${err.message}`);
  }
}

/* ---------- Eventos ---------- */

function handleAction(e) {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const bike = currentBike();
  const torque = () => bike?.torques.find(t => t.id === el.dataset.id);

  switch (el.dataset.action) {
    case 'view':
      state.view = el.dataset.view;
      render();
      window.scrollTo(0, 0);
      break;
    case 'select-bike':
      state.bikeId = el.dataset.id;
      state.group = null;
      state.query = '';
      save();
      render();
      break;
    case 'group':
      state.group = el.dataset.group || null;
      render();
      break;
    case 'add-bike':
      openBikeForm(null);
      break;
    case 'edit-bike':
      openBikeForm(bike);
      break;
    case 'delete-bike':
      if (!confirm(`¿Eliminar «${bike.name}» y sus ${bike.torques.length} pares? No se puede deshacer.`)) return;
      state.data.bikes = state.data.bikes.filter(b => b !== bike);
      state.bikeId = state.data.bikes[0]?.id ?? null;
      save();
      closeDialog();
      render();
      break;
    case 'add-torque':
      openTorqueForm(null);
      break;
    case 'open-torque':
      openTorqueDetail(el.dataset.id);
      break;
    case 'edit-torque':
      openTorqueForm(torque());
      break;
    case 'toggle-fav': {
      const t = torque();
      if (!t) return;
      t.fav = !t.fav;
      save();
      render();
      openTorqueDetail(t.id);
      break;
    }
    case 'delete-torque': {
      const t = torque();
      if (!t || !confirm(`¿Eliminar «${t.component}»?`)) return;
      bike.torques = bike.torques.filter(x => x !== t);
      save();
      closeDialog();
      render();
      break;
    }
    case 'close':
      closeDialog();
      break;
    case 'conv-unit':
      state.conv.unit = el.dataset.unit;
      render();
      break;
    case 'export':
      exportData();
      break;
    case 'import':
      document.getElementById('import-file').click();
      break;
    case 'reset':
      if (!confirm('Se borrarán todos tus cambios y se cargarán de nuevo los pares de los manuales. ¿Seguro? Exporta antes una copia si la necesitas.')) return;
      state.data = normalizeData(createSeed(uid));
      state.bikeId = state.data.bikes[0].id;
      state.group = null;
      state.query = '';
      save();
      render();
      break;
  }
}

app.addEventListener('click', handleAction);

app.addEventListener('input', e => {
  if (e.target.id === 'search') {
    state.query = e.target.value;
    document.getElementById('list').innerHTML = renderList(currentBike());
  } else if (e.target.id === 'conv-value') {
    state.conv.value = e.target.value;
    document.getElementById('conv-out').innerHTML = renderConvOut();
  }
});

app.addEventListener('change', e => {
  if (e.target.id !== 'import-file') return;
  const [file] = e.target.files;
  e.target.value = '';
  if (file) importData(file);
});

dlg.addEventListener('click', e => {
  if (e.target === dlg) closeDialog(); // toque fuera del contenido
  else handleAction(e);
});

dlg.addEventListener('input', e => {
  if (e.target.name !== 'nm') return;
  document.getElementById('nm-hint').textContent = nmHint(parseNum(e.target.value));
  // Si cambia el valor de un par ya comprobado, hay que volver a comprobarlo.
  const form = e.target.form;
  if (form.verified.checked && parseNum(e.target.value) !== parseNum(form.dataset.originalNm)) {
    form.verified.checked = false;
  }
});

dlg.addEventListener('submit', e => {
  e.preventDefault();
  onSubmit?.(new FormData(e.target));
});

/* ---------- Arranque ---------- */

render();
checkForUpdate();
// En el iPad la app instalada sigue abierta en segundo plano: al volver a ella también se mira.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkForUpdate();
});
navigator.storage?.persist?.();
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('./sw.js');
}
