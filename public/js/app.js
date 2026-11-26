/* ============================================================
   ADVANCE SECURITY SYSTEM — FRONTEND (SPA, thème Odoo)
   API REST + vues Liste / Kanban / Formulaire
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- THÈME : NEBULA (sombre par défaut, mode clair) ---------------- */
  var THEME = 'nebula';
  var MODE_KEY = 'ass_mode';
  function currentTheme() { return THEME; }
  function currentMode() {
    try { return localStorage.getItem(MODE_KEY) === 'light' ? 'light' : 'dark'; }
    catch (e) { return 'dark'; }
  }
  function applyTheme() {
    var root = document.documentElement;
    root.setAttribute('data-theme', THEME);
    root.setAttribute('data-mode', currentMode());
    try { localStorage.setItem('ass_theme', THEME); } catch (e) {}
  }
  applyTheme();

  /* ---------------- ICONS ---------------- */
  var ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/>',
    folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    file: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>',
    printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".6"/><circle cx="17.5" cy="10.5" r=".6"/><circle cx="8.5" cy="7.5" r=".6"/><circle cx="6.5" cy="12.5" r=".6"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.12a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C22 6.01 17.46 2 12 2z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
    alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    home: '<path d="M3 9.5 12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 13 15 13 15 22"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    pin: '<path d="M12 17v5"/><path d="M9.2 2.6h5.6l-.9 6 2.9 2.9v1.2H7.2v-1.2l2.9-2.9z"/>',
    maximize: '<path d="M8 3H3v5"/><path d="M16 3h5v5"/><path d="M21 16v5h-5"/><path d="M3 16v5h5"/>',
    minimize: '<line x1="5" y1="12" x2="19" y2="12"/>',
    panel: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>',
    chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
    chevronRight: '<polyline points="9 18 15 12 9 6"/>',
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    key: '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.file) + '</svg>';
  }

  /* Icônes d'applications — style Odoo : tuile blanche arrondie, formes
     plates multicolores, pictogramme blanc. Aucun asset externe. */
  var APP_ART = {
    dashboard:      ['#ffc24d','#f59e0b','#fff3c4'],
    clients:        ['#c084fc','#8b5cf6','#f3e8ff'],
    devis:          ['#5eead4','#0d9488','#ccfbf1'],
    factures:       ['#94a3b8','#475569','#e2e8f0'],
    mouvements:     ['#4ade80','#15803d','#dcfce7'],
    achats:         ['#60a5fa','#1d4ed8','#dbeafe'],
    projets:        ['#818cf8','#4338ca','#e0e7ff'],
    interventions:  ['#34d399','#047857','#d1fae5'],
    planning:       ['#38bdf8','#0369a1','#e0f2fe'],
    maintenance:    ['#fb7185','#b91c1c','#fee2e2'],
    parc:           ['#22d3ee','#0e7490','#cffafe'],
    stock:          ['#7dd3fc','#0284c7','#e0f2fe'],
    pointage:       ['#fcd34d','#b45309','#fef3c7'],
    users:          ['#2dd4bf','#0f766e','#ccfbf1'],
    caisse:         ['#fdba74','#c2410c','#ffedd5'],
    depenses:       ['#fda4af','#be123c','#ffe4e6'],
    solaire:        ['#fde047','#ca8a04','#fef9c3'],
    contrats:       ['#f9a8d4','#be185d','#fce7f3'],
    rapports:       ['#bef264','#4d7c0f','#ecfccb'],
    activite:       ['#d8b4fe','#7e22ce','#f3e8ff'],
    parametres:     ['#94a3b8','#334155','#e2e8f0'],
  };
  var APP_ROUND = { clients: 1, users: 1, interventions: 1, pointage: 1, activite: 1, rapports: 1, parametres: 1, solaire: 1 };
  function appArt(k, iconName) {
    var c = APP_ART[k] || ['#cbd5e1', '#475569', '#e2e8f0'];
    var glyph = ICONS[iconName] || ICONS.file;
    var round = !!APP_ROUND[k];
    var cid = 'ag_' + String(k).replace(/[^a-z0-9]/gi, '') + '_c';
    return '<svg class="app-art" viewBox="0 0 64 64" aria-hidden="true">' +
      '<defs><clipPath id="' + cid + '"><rect x="1" y="1" width="62" height="62" rx="14"/></clipPath></defs>' +
      '<rect x="1" y="1" width="62" height="62" rx="14" fill="#ffffff"/>' +
      '<g clip-path="url(#' + cid + ')">' +
        '<circle cx="51" cy="11" r="17" fill="' + c[0] + '" opacity=".20"/>' +
        '<rect x="12" y="16" width="34" height="34" rx="9" fill="' + c[0] + '" transform="rotate(-12 29 33)"/>' +
        (round
          ? '<circle cx="32" cy="32" r="18" fill="' + c[1] + '"/>'
          : '<rect x="14" y="14" width="36" height="36" rx="10" fill="' + c[1] + '"/>') +
        '<circle cx="15" cy="50" r="5" fill="' + c[1] + '" opacity=".35"/>' +
      '</g>' +
      '<rect x="1.5" y="1.5" width="61" height="61" rx="13.5" fill="none" stroke="#0f172a" stroke-opacity=".08"/>' +
      '<g transform="translate(20,20)" fill="none" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">' + glyph + '</g>' +
    '</svg>';
  }

  /* Bascule clair / sombre du thème NEBULA */
  var NEBULA_CLOCK_TIMER = null;
  function modeIcon() { return currentMode() === 'dark' ? 'sun' : 'moon'; }
  function toggleMode() {
    var next = currentMode() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(MODE_KEY, next); } catch (e) {}
    document.documentElement.setAttribute('data-mode', next);
    Array.prototype.forEach.call(document.querySelectorAll('[data-mode-toggle]'), function (b) {
      b.innerHTML = icon(modeIcon());
      b.title = next === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre';
    });
  }

  /* ---------------- API ---------------- */
  var TOKEN_KEY = 'ass_token';
  function token() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } }
  function setToken(t) { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {} }

  async function api(path, opts) {
    opts = opts || {};
    var headers = { 'Content-Type': 'application/json' };
    var t = token();
    if (t) headers['Authorization'] = 'Bearer ' + t;
    var res;
    try {
      res = await fetch(path, {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
    } catch (e) {
      throw new Error('Serveur injoignable — lancez server.js');
    }
    if (res.status === 401) { setToken(''); renderAuth(); throw new Error('Session expirée'); }
    var ct = res.headers.get('content-type') || '';
    var data = ct.indexOf('application/json') !== -1 ? await res.json() : await res.text();
    if (!res.ok) throw new Error((data && data.error) || 'Erreur ' + res.status);
    return data;
  }

  /* ---------------- STATE ---------------- */
  var S = {
    user: null,
    module: 'dashboard',
    view: 'list',
    data: {},
    refs: { clients: [], users: [] },
    search: '',
    appSearch: '',
    parcCat: '',
    weekStart: '',
    sort: { k: null, dir: 1 },
    selected: {},
    sideQ: '',
    sideTab: 'recent',
    appFilter: '',
    islandMin: false,
    fav: null,
    recent: null,
    publicCfg: null,
    audit: null,
    auditQ: '',
    paieMois: '',
    ptgMois: '',
    poleFilter: '',
    stockPole: '',
    notifs: null,
  };
  var NOTIF_TIMER = null;
  var NOTIF_DOC_BOUND = false;
  var NOTIF_TOGGLE_TS = 0;

  /* ---------------- FAVORIS / RÉCENTS (thème Private Bank) ---------------- */
  function lsGet(k, def) {
    try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; }
  }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function favs() {
    if (!S.fav) S.fav = lsGet('ass_fav', ['dashboard', 'factures', 'clients', 'planning']);
    return S.fav;
  }
  function isFav(k) { return favs().indexOf(k) !== -1; }
  function toggleFav(k) {
    var f = favs().slice();
    var i = f.indexOf(k);
    if (i >= 0) f.splice(i, 1); else f.push(k);
    S.fav = f; lsSet('ass_fav', f);
    return i < 0;
  }
  function recents() {
    if (!S.recent) S.recent = lsGet('ass_recent', []);
    return S.recent;
  }
  function pushRecent(k) {
    if (!k || k === 'apps') return;
    var r = recents().filter(function (x) { return x !== k; });
    r.unshift(k);
    if (r.length > 8) r.length = 8;
    S.recent = r; lsSet('ass_recent', r);
  }
  function appDef(k) { for (var i = 0; i < APPS.length; i++) if (APPS[i].k === k) return APPS[i]; return null; }

  /* ---------------- ACCÈS : rôles & modules autorisés ---------------- */
  var ROLES = ['Admin', 'Manager', 'Commerciale', 'Technicien', 'Technicien PV'];

  /* ---------------- PÔLES / SERVICES (stock, ventes et achats séparés) ---------------- */
  var POLES = [
    { code: 'CCTV', nom: 'Vidéosurveillance', couleur: '#3b82f6' },
    { code: 'ACC', nom: "Contrôle d'accès", couleur: '#8b5cf6' },
    { code: 'INC', nom: 'Détection & alarme incendie', couleur: '#ef4444' },
    { code: 'RIA', nom: 'Réseaux anti-incendie', couleur: '#f59e0b' },
    { code: 'PV', nom: 'Photovoltaïque', couleur: '#d9a23c' },
    { code: 'COMMUN', nom: 'Commun / Transversal', couleur: '#64748b' },
  ];
  var POLE_OPTS = POLES.map(function (p) { return { v: p.code, l: p.code + ' — ' + p.nom }; });
  function poleDef(code) { for (var i = 0; i < POLES.length; i++) if (POLES[i].code === code) return POLES[i]; return null; }
  function poleName(code) { var p = poleDef(code); return p ? p.nom : (code || '—'); }
  function poleBadge(code) {
    var p = poleDef(code);
    if (!p) return '<span class="o-badge gray">—</span>';
    return '<span class="o-badge" style="background:' + p.couleur + '22;color:' + p.couleur + ';border:1px solid ' + p.couleur + '55">' + esc(p.code) + '</span>';
  }
  function myPoles() {
    if (!S.user) return null;
    if (String(S.user.role || '').toLowerCase() === 'admin') return null;
    var raw = S.user.services;
    if (!raw) return null;
    var arr = raw;
    if (typeof raw === 'string') { try { arr = JSON.parse(raw); } catch (e) { return null; } }
    return (Array.isArray(arr) && arr.length) ? arr : null;
  }
  function canPole(code) { var l = myPoles(); return !l || l.indexOf(code) !== -1; }
  function visiblePoles() { return POLES.filter(function (p) { return canPole(p.code); }); }
  function isAdminUser() { return !!S.user && String(S.user.role || '').toLowerCase() === 'admin'; }
  function allowedMods() {
    if (!S.user) return [];
    if (S.user.modules !== undefined) return S.user.modules; // calculé par le serveur (rôle + perms)
    var p = S.user.perms;
    if (p == null || p === '') return null;
    if (Array.isArray(p)) return p;
    try { var a = JSON.parse(p); return Array.isArray(a) ? a : null; } catch (e) { return null; }
  }
  function canOpen(k) {
    if (!S.user) return false;
    if (k === 'apps') return true;
    if (k === 'parametres') return isAdminUser();
    var list = allowedMods();
    if (!list) return true;
    var def = moduleDef(k);
    return list.indexOf(k) !== -1 || (def && def.perm ? list.indexOf(def.perm) !== -1 : false);
  }
  function visibleApps() { return APPS.filter(function (a) { return canOpen(a.k); }); }

  /* ---------------- UTILS ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) {
    return Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' DA';
  }
  function money2(n) {
    return Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DA';
  }
  function num(n) { return Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 }); }
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function dFr(d) {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch (e) { return String(d); }
  }
  function dtFr(d) {
    if (!d) return '—';
    try { return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return String(d); }
  }
  function dLeft(d) {
    if (!d) return 9999;
    return Math.ceil((new Date(d) - new Date()) / 86400000);
  }
  function daysSinceWeek(d) { return d; }
  function refName(col, id) {
    var list = S.refs[col] || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].name || list[i].nom || list[i].ref || '—';
    return '';
  }
  function toast(msg, kind) {
    var root = document.getElementById('toast-root');
    var el = document.createElement('div');
    el.className = 'o-toast ' + (kind || 'info');
    el.innerHTML = '<span>' + esc(msg) + '</span>';
    root.appendChild(el);
    setTimeout(function () { el.style.opacity = '0'; el.style.transition = '.3s'; setTimeout(function () { el.remove(); }, 320); }, 3000);
  }

  var BADGE_MAP = {
    'accepté': 'green', 'payée': 'green', 'payé': 'green', 'signé': 'green', 'actif': 'green', 'OK': 'green',
    'active': 'green', 'terminée': 'green', 'client': 'green', 'Réception': 'green', 'reçue': 'green',
    'envoyé': 'amber', 'partiel': 'amber', 'brouillon': 'amber', 'À vérifier': 'amber',
    'Entrée': 'green', 'Sortie': 'red', 'Avance': 'amber',
    'prospect': 'amber', 'Chantier': 'amber', 'Commande': 'amber', 'Test': 'amber', 'à payer': 'amber',
    'à renouveler': 'amber', 'confirmé': 'blue',
    'refusé': 'red', 'En retard': 'red', 'expiré': 'red', 'inactif': 'red', 'litige': 'red', 'expirée': 'red',
    'programmée': 'blue', 'Étude': 'blue',
    'Installation': 'teal', 'résiliée': 'gray',
  };
  function badge(v) {
    if (v == null || v === '') return '<span class="o-badge gray">—</span>';
    var label = String(v);
    label = label.charAt(0).toUpperCase() + label.slice(1);
    return '<span class="o-badge ' + (BADGE_MAP[v] || 'purple') + '">' + esc(label) + '</span>';
  }

  /* ---------------- SCHEMA ---------------- */
  var MODULES = [
    { k: 'dashboard', l: 'Tableau', icon: 'dashboard' },
    { k: 'clients', l: 'Clients', icon: 'users' },
    { k: 'devis', l: 'Devis', icon: 'file-text' },
    { k: 'factures', l: 'Factures', icon: 'receipt' },
    { k: 'ventes', l: 'Ventes', icon: 'bag', col: 'mouvements', perm: 'mouvements' },
    { k: 'achats', l: 'Achats', icon: 'cart', col: 'factures_achat' },
    { k: 'projets', l: 'Projets', icon: 'folder', kanban: 'phase' },
    { k: 'interventions', l: 'Missions', icon: 'wrench', kanban: 'status' },
    { k: 'planning', l: 'Planning', icon: 'calendar' },
    { k: 'maintenance', l: 'Incendie', icon: 'shield' },
    { k: 'parc', l: 'Parc', icon: 'server', col: 'equipements' },
    { k: 'stock', l: 'Stock', icon: 'box' },
    { k: 'pointage', l: 'Pointage', icon: 'clock', col: 'pointages' },
    { k: 'users', l: 'Employés', icon: 'user' },
    { k: 'caisse', l: 'Caisse & Avances', icon: 'wallet', col: 'caisse' },
    { k: 'depenses', l: 'Dépenses', icon: 'wallet' },
    { k: 'solaire', l: 'Solaire', icon: 'sun' },
    { k: 'contrats', l: 'Contrats', icon: 'file' },
    { k: 'rapports', l: 'Rapports', icon: 'chart' },
    { k: 'activite', l: 'Activité', icon: 'activity' },
    { k: 'parametres', l: 'Paramètres', icon: 'settings' },
  ];

  /* Lanceur d'applications (écran d'accueil façon Odoo) */
  var APPS = [
    { k: 'dashboard', l: 'Tableau de bord', icon: 'dashboard', c: '#e0a03a' },
    { k: 'clients', l: 'Clients', icon: 'users', c: '#7a5b8d' },
    { k: 'devis', l: 'Devis', icon: 'file-text', c: '#2e8c86' },
    { k: 'factures', l: 'Factures', icon: 'receipt', c: '#6c7b86' },
    { k: 'ventes', l: 'Ventes', icon: 'bag', c: '#2f8f6b' },
    { k: 'achats', l: 'Achats', icon: 'cart', c: '#5187be' },
    { k: 'projets', l: 'Projets', icon: 'folder', c: '#5967b8' },
    { k: 'interventions', l: 'Missions', icon: 'wrench', c: '#4e9a63' },
    { k: 'planning', l: 'Planning', icon: 'calendar', c: '#5f7fbf' },
    { k: 'maintenance', l: 'Incendie', icon: 'shield', c: '#b4534e' },
    { k: 'parc', l: 'Parc & Équipements', icon: 'server', c: '#57708a' },
    { k: 'stock', l: 'Stock', icon: 'box', c: '#4b93b8' },
    { k: 'pointage', l: 'Pointage', icon: 'clock', c: '#c98f3b' },
    { k: 'users', l: 'Employés', icon: 'user', c: '#3f9c94' },
    { k: 'caisse', l: 'Caisse & Avances', icon: 'wallet', c: '#b0603f' },
    { k: 'depenses', l: 'Dépenses', icon: 'wallet', c: '#b0603f' },
    { k: 'solaire', l: 'Solaire', icon: 'sun', c: '#d9a23c' },
    { k: 'contrats', l: 'Contrats', icon: 'file', c: '#be5b78' },
    { k: 'rapports', l: 'Rapports', icon: 'chart', c: '#7d9c4a' },
    { k: 'activite', l: 'Activité récente', icon: 'activity', c: '#8a6d3b' },
    { k: 'parametres', l: 'Paramètres de l\'application', icon: 'settings', c: '#4a5b7a' },
  ];

  var SCHEMA = {
    clients: {
      title: 'Clients', singular: 'Client',
      fields: [
        { k: 'name', l: 'Société', req: true },
        { k: 'type', l: 'Type', t: 'select', opts: ['Entreprise', 'Immeuble', 'Villa', 'Copropriété', 'Entrepôt', 'Commerce', 'Industrie'] },
        { k: 'status', l: 'Statut', t: 'select', opts: ['client', 'prospect', 'inactif'] },
        { k: 'contact', l: 'Contact' },
        { k: 'email', l: 'Email', t: 'email' },
        { k: 'phone', l: 'Téléphone', placeholder: '+213 …' },
        { k: 'wilaya', l: 'Wilaya', t: 'select', opts: ['Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M’Sila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane'] },
        { k: 'nif', l: 'NIF', placeholder: '15 chiffres' },
        { k: 'rc', l: 'RC', placeholder: 'Registre de commerce' },
        { k: 'nis', l: 'NIS', placeholder: 'N° identification statistique' },
        { k: 'tin', l: 'TIN', placeholder: 'N° identification fiscale' },
        { k: 'address', l: 'Adresse', full: true },
      ],
      columns: [
        { k: 'name', main: true, sub: 'address' },
        { k: 'type' },
        { k: 'wilaya' },
        { k: 'phone' },
        { k: 'status', badge: true },
        { k: 'act', l: '', fn: function (r) {
          return '<button class="o-btn o-btn-default o-btn-sm" data-releve="' + esc(r.id) + '" title="Relevé de compte">' + icon('receipt') + ' Relevé</button>';
        } },
      ],
    },
    devis: {
      title: 'Devis', singular: 'Devis',
      fields: [
        { k: 'clientId', l: 'Client', t: 'rel', rel: 'clients', req: true },
        { k: 'titre', l: 'Objet', req: true, full: true },
        { k: 'service', l: 'Pôle / service', t: 'select', opts: POLE_OPTS, req: true },
        { k: 'validite', l: 'Validité', t: 'select', opts: ['15 jours', '30 jours', '45 jours', '60 jours', '90 jours'] },
        { k: 'modePaiement', l: 'Mode de paiement', t: 'select', opts: ['chèque', 'virement', 'espèces', 'traite'] },
        { k: 'tva', l: 'TVA %', t: 'number' },
        { k: 'status', l: 'Statut', t: 'select', opts: ['brouillon', 'envoyé', 'accepté', 'refusé'] },
      ],
      columns: [
        { k: 'num', l: 'N°', mono: true },
        { k: 'titre', main: true, sub: 'clientId', relSub: 'clients' },
        { k: 'service', l: 'Pôle', fn: function (r) { return poleBadge(r.service); } },
        { k: 'total', l: 'Total TTC', money: true, fn: function (r) { return devisTotals(r).ttc; } },
        { k: 'status', badge: true },
        { k: 'date', l: 'Date', date: true },
        { k: 'act', l: '', fn: function (r) {
          return '<button class="o-btn o-btn-default o-btn-sm" data-print-devis="' + esc(r.id) + '" title="Imprimer le devis">' + icon('printer') + '</button> ' +
            '<button class="o-btn o-btn-default o-btn-sm" data-bc-devis="' + esc(r.id) + '" title="Imprimer le bon de commande">' + icon('file') + ' BC</button> ' +
            '<button class="o-btn o-btn-default o-btn-sm" data-pf-devis="' + esc(r.id) + '" title="Imprimer la facture proforma">' + icon('file') + ' PF</button> ' +
            '<button class="o-btn o-btn-purple o-btn-sm" data-conv-devis="' + esc(r.id) + '">Facturer</button>';
        } },
      ],
    },
    factures: {
      title: 'Factures de vente', singular: 'Facture',
      fields: [
        { k: 'clientId', l: 'Client', t: 'rel', rel: 'clients', req: true },
        { k: 'objet', l: 'Objet', full: true },
        { k: 'service', l: 'Pôle / service', t: 'select', opts: POLE_OPTS, req: true },
        { k: 'montant', l: 'Montant TTC', t: 'number', req: true },
        { k: 'paye', l: 'Déjà payé', t: 'number' },
        { k: 'tva', l: 'TVA %', t: 'number', placeholder: '19' },
        { k: 'date', l: 'Date', t: 'date' },
        { k: 'due', l: 'Échéance', t: 'date' },
        { k: 'modePaiement', l: 'Mode de paiement', t: 'select', opts: ['virement', 'chèque', 'espèces', 'traite'] },
        { k: 'status', l: 'Statut', t: 'select', opts: ['envoyé', 'partiel', 'payée'] },
      ],
      columns: [
        { k: 'num', l: 'N°', mono: true },
        { k: 'clientId', l: 'Client', rel: 'clients', main: true },
        { k: 'objet' },
        { k: 'service', l: 'Pôle', fn: function (r) { return poleBadge(r.service); } },
        { k: 'montant', money: true },
        { k: 'reste', l: 'Reste dû', money: true, fn: function (r) { return Number(r.montant || 0) - Number(r.paye || 0); } },
        { k: 'status', badge: true },
        { k: 'act', l: '', fn: function (r) {
          var reste = Number(r.montant || 0) - Number(r.paye || 0);
          return '<button class="o-btn o-btn-default o-btn-sm" data-print-facture="' + esc(r.id) + '">' + icon('printer') + ' Imprimer</button>' +
            ' <button class="o-btn o-btn-default o-btn-sm" data-bl-facture="' + esc(r.id) + '" title="Imprimer le bon de livraison">' + icon('file') + ' BL</button>' +
            (reste > 0 ? ' <button class="o-btn o-btn-primary o-btn-sm" data-pay-facture="' + esc(r.id) + '">Encaisser</button>' : '');
        } },
      ],
    },
    factures_achat: {
      title: "Factures d'achat", singular: "Facture d'achat",
      fields: [
        { k: 'num', l: 'N° facture', req: true },
        { k: 'fournisseur', l: 'Fournisseur', req: true },
        { k: 'fournisseurNif', l: 'NIF fournisseur' },
        { k: 'service', l: 'Pôle / service', t: 'select', opts: POLE_OPTS, req: true },
        { k: 'date', l: 'Date', t: 'date' },
        { k: 'echeance', l: 'Échéance', t: 'date' },
        { k: 'modePaiement', l: 'Paiement', t: 'select', opts: ['virement', 'chèque', 'espèces', 'traite'] },
        { k: 'totalHT', l: 'Total HT', t: 'number' },
        { k: 'tva', l: 'TVA %', t: 'number' },
        { k: 'totalTTC', l: 'Total TTC', t: 'number' },
        { k: 'objet', l: 'Objet', full: true },
        { k: 'statut', l: 'Statut', t: 'select', opts: ['reçue', 'à payer', 'payée', 'litige'] },
      ],
      columns: [
        { k: 'num', l: 'N°', mono: true },
        { k: 'fournisseur', main: true, sub: 'objet' },
        { k: 'service', l: 'Pôle', fn: function (r) { return poleBadge(r.service); } },
        { k: 'date', date: true },
        { k: 'totalHT', l: 'Total HT', money: true },
        { k: 'tva', l: 'TVA', fn: function (r) { return num(r.tva) + ' %'; } },
        { k: 'totalTTC', l: 'Total TTC', money: true },
        { k: 'statut', badge: true },
      ],
    },
    projets: {
      title: 'Projets / Chantiers', singular: 'Projet', kanban: 'phase',
      fields: [
        { k: 'nom', l: 'Nom du projet', req: true, full: true },
        { k: 'clientId', l: 'Client', t: 'rel', rel: 'clients' },
        { k: 'service', l: 'Pôle / service', t: 'select', opts: POLE_OPTS, req: true },
        { k: 'chefId', l: 'Chef de projet', t: 'rel', rel: 'users' },
        { k: 'phase', l: 'Phase', t: 'select', opts: ['Étude', 'Commande', 'Installation', 'Test', 'Réception'] },
        { k: 'progress', l: 'Avancement %', t: 'number' },
        { k: 'deadline', l: 'Échéance', t: 'date' },
        { k: 'description', l: 'Description', t: 'textarea', full: true },
      ],
      columns: [
        { k: 'nom', main: true, sub: 'description' },
        { k: 'clientId', l: 'Client', rel: 'clients' },
        { k: 'service', l: 'Pôle', fn: function (r) { return poleBadge(r.service); } },
        { k: 'phase', badge: true },
        { k: 'progress', l: 'Avancement', bar: true },
        { k: 'deadline', l: 'Échéance', date: true },
      ],
    },
    interventions: {
      title: 'Missions / Interventions', singular: 'Intervention', kanban: 'status',
      fields: [
        { k: 'titre', l: 'Titre', req: true, full: true },
        { k: 'clientId', l: 'Client', t: 'rel', rel: 'clients' },
        { k: 'techId', l: 'Technicien', t: 'rel', rel: 'users' },
        { k: 'lieu', l: 'Lieu' },
        { k: 'date', l: 'Date', t: 'date' },
        { k: 'duree', l: 'Durée (min)', t: 'number' },
        { k: 'status', l: 'Statut', t: 'select', opts: ['programmée', 'terminée'] },
      ],
      columns: [
        { k: 'titre', main: true, sub: 'lieu' },
        { k: 'clientId', l: 'Client', rel: 'clients' },
        { k: 'techId', l: 'Technicien', rel: 'users' },
        { k: 'date', l: 'Date', date: true },
        { k: 'status', badge: true },
      ],
    },
    maintenance: {
      title: 'Maintenance Incendie', singular: 'Équipement',
      fields: [
        { k: 'eq', l: 'Équipement', req: true, full: true },
        { k: 'lieu', l: 'Lieu' },
        { k: 'clientId', l: 'Client', t: 'rel', rel: 'clients' },
        { k: 'type', l: 'Type', t: 'select', opts: ['RIA / Anti-incendie', 'Détection incendie', 'Désenfumage', 'Caméra', "Contrôle d'accès"] },
        { k: 'next', l: 'Prochaine visite', t: 'date' },
        { k: 'techId', l: 'Technicien', t: 'rel', rel: 'users' },
        { k: 'status', l: 'Statut', t: 'select', opts: ['OK', 'À vérifier', 'En retard'] },
      ],
      columns: [
        { k: 'eq', main: true, sub: 'lieu' },
        { k: 'type' },
        { k: 'next', l: 'Prochaine visite', date: true },
        { k: 'delai', l: 'Délai', fn: function (r) {
          var d = dLeft(r.next);
          var col = d < 0 ? 'red' : d <= 30 ? 'amber' : 'green';
          return '<span class="o-badge ' + col + '">' + (d < 0 ? Math.abs(d) + ' j de retard' : d + ' jours') + '</span>';
        } },
        { k: 'status', badge: true },
      ],
    },
    equipements: {
      title: 'Parc & Équipements', singular: 'Équipement',
      fields: [
        { k: 'cat', l: 'Catégorie', req: true, t: 'select', opts: ['Vidéosurveillance', 'Détection incendie', 'RIA / Anti-incendie', 'Désenfumage', "Contrôle d'accès", 'Réseaux', 'Photovoltaïque', 'Alarme intrusion'] },
        { k: 'clientId', l: 'Client', t: 'rel', rel: 'clients' },
        { k: 'service', l: 'Pôle / service', t: 'select', opts: POLE_OPTS, req: true },
        { k: 'site', l: 'Site / localisation', full: true },
        { k: 'marque', l: 'Marque' },
        { k: 'modele', l: 'Modèle' },
        { k: 'serial', l: 'N° de série' },
        { k: 'qty', l: 'Quantité', t: 'number' },
        { k: 'dateInstall', l: "Date d'installation", t: 'date' },
        { k: 'garantie', l: 'Fin de garantie', t: 'date' },
        { k: 'nextCtrl', l: 'Prochain contrôle', t: 'date' },
        { k: 'status', l: 'État', t: 'select', opts: ['En service', 'Maintenance due', 'Hors service', 'Déposé'] },
        { k: 'notes', l: 'Notes', full: true },
      ],
      columns: [
        { k: 'cat', main: true, sub: 'modele' },
        { k: 'service', l: 'Pôle', fn: function (r) { return poleBadge(r.service); } },
        { k: 'clientId', l: 'Client', rel: 'clients' },
        { k: 'site' },
        { k: 'serial', l: 'N° série', mono: true },
        { k: 'nextCtrl', l: 'Contrôle', date: true },
        { k: 'status', badge: true },
      ],
    },
    stock: {
      title: 'Stock & Matériel', singular: 'Matériel',
      fields: [
        { k: 'ref', l: 'Référence', req: true },
        { k: 'nom', l: 'Désignation', req: true },
        { k: 'cat', l: 'Catégorie', t: 'select', opts: ['Vidéosurveillance', "Contrôle d'accès", 'Détection incendie', 'Anti-incendie RIA', 'Photovoltaïque', 'Réseaux', 'Outils'] },
        { k: 'service', l: 'Pôle / service', t: 'select', opts: POLE_OPTS, req: true },
        { k: 'qty', l: 'Quantité', t: 'number' },
        { k: 'minQty', l: 'Seuil minimum', t: 'number' },
        { k: 'loc', l: 'Emplacement', t: 'select', opts: ['Magasin', 'Camion 1', 'Camion 2', 'Chantier', 'Réserve'] },
        { k: 'prix', l: 'Prix unit. HT', t: 'number' },
        { k: 'fournisseur', l: 'Fournisseur' },
      ],
      columns: [
        { k: 'ref', mono: true },
        { k: 'nom', main: true, sub: 'fournisseur' },
        { k: 'cat' },
        { k: 'service', l: 'Pôle', fn: function (r) { return poleBadge(r.service); } },
        { k: 'qty', l: 'Stock', fn: function (r) {
          var low = Number(r.qty) <= Number(r.minQty);
          return '<b style="color:' + (low ? 'var(--o-red)' : 'var(--o-text-strong)') + '">' + num(r.qty) + '</b><span style="color:#94a3b8"> / ' + num(r.minQty) + '</span>' + (low ? ' <span class="o-badge red">bas</span>' : '');
        } },
        { k: 'loc' },
        { k: 'prix', money: true },
      ],
    },
    pointages: {
      title: 'Pointage', singular: 'Pointage',
      fields: [
        { k: 'empId', l: 'Employé', t: 'rel', rel: 'users', req: true },
        { k: 'date', l: 'Date du jour', t: 'date', req: true },
        { k: 'type', l: 'Type', t: 'select', opts: ['ARRIVÉE', 'PAUSE', 'REPRISE', 'DÉPART'] },
        { k: 'heuresSup', l: 'Heures supplémentaires', t: 'number', placeholder: 'Ex : 2' },
        { k: 'deplacement', l: 'Déplacement — véhicule (2000 DA)', t: 'select', opts: ['0', '1'] },
        { k: 'mission', l: 'Mission (réf. / objet)' },
        { k: 'horsWilaya', l: 'Hors wilaya (1200 DA / mission)', t: 'select', opts: ['0', '1'] },
        { k: 'lieu', l: 'Lieu / chantier' },
        { k: 'note', l: 'Note', full: true },
      ],
      columns: [
        { k: 'emp', main: true, sub: 'lieu' },
        { k: 'type', badge: true },
        { k: 'date', l: 'Jour', fn: function (r) { return dFr(r.date || r.ts); } },
        { k: 'heuresSup', l: 'H. sup.', fn: function (r) { return num(r.heuresSup) + ' h'; } },
        { k: 'deplacement', l: 'Dépl.', fn: function (r) { return Number(r.deplacement) ? 'Oui' : '—'; } },
        { k: 'mission', l: 'Mission', fn: function (r) { return (r.mission || '—') + (Number(r.horsWilaya) ? ' (Hors wilaya)' : ''); } },
        { k: 'montant', l: 'Montant', money: true },
      ],
    },
    caisse: {
      title: 'Caisse & Avances', singular: 'Opération de caisse',
      fields: [
        { k: 'date', l: 'Date', t: 'date', req: true },
        { k: 'type', l: 'Type', t: 'select', opts: ['Entrée', 'Sortie', 'Avance'], req: true },
        { k: 'libelle', l: 'Libellé', req: true, full: true },
        { k: 'empId', l: 'Employé (pour une avance)', t: 'rel', rel: 'users' },
        { k: 'montant', l: 'Montant (DA)', t: 'number', req: true },
        { k: 'modePaiement', l: 'Mode de paiement', t: 'select', opts: ['espèces', 'virement', 'chèque'] },
        { k: 'reference', l: 'Référence' },
        { k: 'notes', l: 'Notes', full: true },
      ],
      columns: [
        { k: 'date', l: 'Date', date: true },
        { k: 'type', badge: true },
        { k: 'libelle', main: true, sub: 'emp' },
        { k: 'montant', money: true },
        { k: 'modePaiement' },
      ],
    },
    users: {
      title: 'Employés', singular: 'Employé',
      fields: [
        { k: 'name', l: 'Nom complet', req: true },
        { k: 'role', l: 'Rôle', t: 'select', opts: ['Admin', 'Manager', 'Commerciale', 'Technicien', 'Technicien PV'] },
        { k: 'email', l: 'Email', t: 'email', req: true },
        { k: 'active', l: 'Accès à l\'application', t: 'select', opts: [{ v: '1', l: 'Actif' }, { v: '0', l: 'Désactivé' }] },
        { k: 'phone', l: 'Téléphone' },
        { k: 'salaire', l: 'Salaire de référence (DA) — indicatif, le salaire payé est calculé depuis les pointages', t: 'number', placeholder: 'Ex : 65000' },
        { k: 'pass', l: 'Mot de passe', t: 'password', createOnly: true },
      ],
      columns: [
        { k: 'name', main: true, sub: 'email' },
        { k: 'role', badge: true },
        { k: 'salaire', l: 'Salaire', money: true },
        { k: 'phone' },
        { k: 'active', l: 'Actif', fn: function (r) { return r.active ? '<span class="o-badge green">actif</span>' : '<span class="o-badge red">inactif</span>'; } },
      ],
    },
    solaire: {
      title: 'Photovoltaïque', singular: 'Étude PV',
      fields: [
        { k: 'client', l: 'Client / Site', req: true, full: true },
        { k: 'toiture', l: 'Toiture (m²)', t: 'number' },
        { k: 'conso', l: 'Conso (kWh/an)', t: 'number' },
        { k: 'kwc', l: 'Puissance (kWc)', t: 'number' },
        { k: 'production', l: 'Production (kWh/an)', t: 'number' },
        { k: 'cout', l: 'Coût (DA)', t: 'number' },
        { k: 'rentabilite', l: 'Rentabilité (ans)', t: 'number' },
        { k: 'statut', l: 'Statut', t: 'select', opts: ['Étude', 'Commande', 'Chantier', 'Réception'] },
      ],
      columns: [
        { k: 'client', main: true },
        { k: 'kwc', l: 'Puissance', fn: function (r) { return '<b>' + num(r.kwc) + ' kWc</b>'; } },
        { k: 'production', l: 'Production', fn: function (r) { return num(r.production) + ' kWh'; } },
        { k: 'rentabilite', l: 'Rentabilité', fn: function (r) { return num(r.rentabilite) + ' ans'; } },
        { k: 'cout', money: true },
        { k: 'statut', badge: true },
      ],
    },
    contrats: {
      title: 'Contrats & Conventions', singular: 'Contrat',
      fields: [
        { k: 'type', l: 'Type', t: 'select', opts: ['Contrat de maintenance', 'Convention', 'Contrat caméra', 'Contrat photovoltaïque', 'Autorisation / JCP'] },
        { k: 'clientId', l: 'Client', t: 'rel', rel: 'clients' },
        { k: 'ref', l: 'Référence' },
        { k: 'service', l: 'Pôle / service', t: 'select', opts: POLE_OPTS, req: true },
        { k: 'objet', l: 'Objet', req: true, full: true },
        { k: 'dateDep', l: 'Date début', t: 'date' },
        { k: 'dateFin', l: 'Date fin', t: 'date' },
        { k: 'montant', l: 'Montant TTC', t: 'number' },
        { k: 'periodicite', l: 'Périodicité', t: 'select', opts: ['mensuel', 'trimestriel', 'semestriel', 'annuel'] },
        { k: 'prochaineFacture', l: 'Prochaine facture', t: 'date' },
        { k: 'sla', l: 'SLA / délai intervention' },
        { k: 'sites', l: 'Sites couverts', full: true },
        { k: 'statut', l: 'Statut', t: 'select', opts: ['actif', 'signé', 'expiré'] },
      ],
      columns: [
        { k: 'ref', mono: true },
        { k: 'objet', main: true, sub: 'type' },
        { k: 'service', l: 'Pôle', fn: function (r) { return poleBadge(r.service); } },
        { k: 'clientId', l: 'Client', rel: 'clients' },
        { k: 'dateFin', l: 'Fin', date: true },
        { k: 'montant', money: true },
        { k: 'statut', badge: true },
      ],
    },
    assurances: {
      title: 'Assurances employés', singular: 'Assurance',
      fields: [
        { k: 'empId', l: 'Employé', t: 'rel', rel: 'users', req: true },
        { k: 'type', l: "Type d'assurance", req: true, t: 'select', opts: ['AMO / Assurance maladie', 'Mutuelle', 'Assurance vie', 'Responsabilité civile professionnelle', 'Assurance véhicule', 'Assurance incendie des locaux', 'Assurance emprunteur', 'Autre'] },
        { k: 'assureur', l: "Société d'assurance", req: true },
        { k: 'numero', l: 'N° de police / attestation' },
        { k: 'prime', l: 'Prime mensuelle (DA)', t: 'number' },
        { k: 'dateDebut', l: 'Début de couverture', t: 'date' },
        { k: 'dateFin', l: 'Fin de couverture', t: 'date' },
        { k: 'statut', l: 'Statut', t: 'select', opts: ['active', 'à renouveler', 'expirée', 'résiliée'] },
        { k: 'couverture', l: 'Garanties / couverture', full: true },
        { k: 'notes', l: 'Notes', full: true },
      ],
      columns: [
        { k: 'empId', l: 'Employé', rel: 'users', main: true, sub: 'assureur' },
        { k: 'type' },
        { k: 'numero', l: 'N° police', mono: true },
        { k: 'prime', money: true },
        { k: 'dateFin', l: 'Fin de couverture', date: true },
        { k: 'statut', badge: true },
      ],
    },
    mouvements: {
      title: 'Ventes & Achats de produits', singular: 'Mouvement de produits',
      fields: [
        { k: 'type', l: 'Type', t: 'select', opts: ['vente', 'achat'], req: true },
        { k: 'service', l: 'Pôle / service', t: 'select', opts: POLE_OPTS, req: true },
        { k: 'date', l: 'Date', t: 'date' },
        { k: 'clientId', l: 'Client', t: 'rel', rel: 'clients' },
        { k: 'tiers', l: 'Client / Fournisseur' },
        { k: 'totalHT', l: 'Total HT', t: 'number' },
        { k: 'tva', l: 'TVA %', t: 'number' },
        { k: 'totalTTC', l: 'Total TTC', t: 'number' },
        { k: 'modePaiement', l: 'Paiement', t: 'select', opts: ['virement', 'chèque', 'espèces', 'traite'] },
        { k: 'statut', l: 'Statut', t: 'select', opts: ['brouillon', 'confirmé', 'payé'] },
        { k: 'notes', l: 'Notes', full: true },
      ],
      columns: [
        { k: 'date', l: 'Date', date: true },
        { k: 'type', l: 'Type', badge: true },
        { k: 'service', l: 'Pôle', fn: function (r) { return poleBadge(r.service); } },
        { k: 'tiers', main: true, sub: 'notes' },
        { k: 'totalHT', l: 'Total HT', money: true },
        { k: 'tva', l: 'TVA', fn: function (r) { return num(r.tva) + ' %'; } },
        { k: 'totalTTC', l: 'Total TTC', money: true },
        { k: 'statut', badge: true },
      ],
    },
    depenses: {
      title: 'Dépenses de l\'entreprise', singular: 'Dépense',
      fields: [
        { k: 'date', l: 'Date', t: 'date' },
        { k: 'libelle', l: 'Libellé', req: true, full: true },
        { k: 'categorie', l: 'Catégorie', t: 'select', opts: ['Loyer', 'Énergie', 'Carburant', 'Fournitures', 'Télécom', 'Entretien', 'Salaires', 'Assurances', 'Transport', 'Impôts & taxes', 'Divers'] },
        { k: 'montant', l: 'Montant (DA)', t: 'number', req: true },
        { k: 'modePaiement', l: 'Mode de paiement', t: 'select', opts: ['virement', 'chèque', 'espèces', 'prélèvement', 'carte'] },
        { k: 'ref', l: 'N° pièce / référence' },
        { k: 'notes', l: 'Notes', t: 'textarea', full: true },
      ],
      columns: [
        { k: 'date', l: 'Date', date: true },
        { k: 'libelle', main: true, sub: 'ref' },
        { k: 'categorie', badge: true },
        { k: 'montant', money: true },
        { k: 'modePaiement' },
      ],
    },
  };

  function moduleDef(k) { for (var i = 0; i < MODULES.length; i++) if (MODULES[i].k === k) return MODULES[i]; return null; }
  function colOf(k) { var m = moduleDef(k); return (m && m.col) || k; }
  function devisTotals(d) {
    var brut = (d.lignes || []).reduce(function (s, l) { return s + Number(l.qty || 0) * Number(l.pu || 0); }, 0);
    var remisePct = Math.max(0, Math.min(100, Number(d.remise || 0)));
    var remise = brut * remisePct / 100;
    var ht = brut - remise;
    var tva = Number(d.tva != null ? d.tva : 19);
    var ttc = ht * (1 + tva / 100);
    return { brut: brut, remisePct: remisePct, remise: remise, ht: ht, tva: ttc - ht, ttc: ttc };
  }

  /* ---------------- AUTH ---------------- */
  function renderAuth() {
    var root = document.getElementById('auth-root');
    var demo = !!(S.publicCfg && S.publicCfg.demoMode);
    root.hidden = false;
    document.getElementById('app').hidden = true;
    root.className = 'o-auth';
    root.innerHTML =
      '<div class="o-auth-left">' +
        '<div>' +
          '<div class="o-auth-logo"><div class="o-logo-card" role="img" aria-label="Advanced Security Systems"><div class="o-logo-3d"><span class="o-logo-face"><img src="/assets/logo.png" alt=""></span><span class="o-logo-face o-logo-face--back" aria-hidden="true"><img src="/assets/logo.png" alt=""></span></div></div><div><b>Advanced Security Systems</b><small>ERP Professionnel · Algérie</small></div></div>' +
          '<h1>Pilotez toute<br>l\'entreprise.<br><em>Sécurisez chaque site.</em></h1>' +
          '<p>Vidéosurveillance, contrôle d\'accès, détection incendie, RIA / désenfumage, réseaux et photovoltaïque — devis, chantiers, stock, maintenance et pointage dans une seule plateforme. Conçu pour les entreprises algériennes.</p>' +
          '<div class="o-auth-tags">' +
            '<span class="o-auth-tag">12 modules</span>' +
            '<span class="o-auth-tag">Conformité incendie</span>' +
            '<span class="o-auth-tag">Pointage manuel + paie</span>' +
            '<span class="o-auth-tag">IA documents</span>' +
            '<span class="o-auth-tag">TVA 19 % · DA</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="o-auth-right">' +
        '<h2>Connexion</h2>' +
        '<p class="sub">Accédez à votre espace de gestion</p>' +
        '<div class="o-field"><label>Email</label><input class="o-input" id="lg-email" autocomplete="username" placeholder="prenom.nom@societe.dz"></div>' +
        '<div class="o-field"><label>Mot de passe</label><input class="o-input" id="lg-pass" type="password" autocomplete="current-password" placeholder="••••••••"></div>' +
        '<div class="o-auth-err" id="lg-err"></div>' +
        '<button class="o-btn o-btn-primary" style="width:100%;height:36px" id="lg-btn">Se connecter</button>' +
        (demo ? '<div class="o-demo-grid">' +
          '<button class="o-demo" data-demo="admin@ass.dz|admin123"><b>Admin</b><small>admin@ass.dz · admin123</small></button>' +
          '<button class="o-demo" data-demo="youssef@ass.dz|tech123"><b>Technicien</b><small>youssef@ass.dz · tech123</small></button>' +
          '<button class="o-demo" data-demo="lina@ass.dz|com123"><b>Commerciale</b><small>lina@ass.dz · com123</small></button>' +
          '<button class="o-demo" data-demo="sami@ass.dz|tech123"><b>Tech PV</b><small>sami@ass.dz · tech123</small></button>' +
        '</div>' : '<p class="o-help" style="margin-top:16px;text-align:center">Identifiants fournis par votre administrateur.</p>') +
        '<p style="margin-top:18px;text-align:center;font-size:10.5px;color:#94a3b8">v' + esc((S.publicCfg && S.publicCfg.version) || '2.0.0') + ' · connexion sécurisée</p>' +
      '</div>';

    document.getElementById('lg-btn').onclick = doLogin;
    document.getElementById('lg-pass').onkeydown = function (e) { if (e.key === 'Enter') doLogin(); };
    document.getElementById('lg-email').onkeydown = function (e) { if (e.key === 'Enter') { var p = document.getElementById('lg-pass'); if (p) p.focus(); } };
    Array.prototype.forEach.call(root.querySelectorAll('[data-demo]'), function (b) {
      b.onclick = function () {
        var p = b.getAttribute('data-demo').split('|');
        document.getElementById('lg-email').value = p[0];
        document.getElementById('lg-pass').value = p[1];
      };
    });
  }

  async function doLogin() {
    var email = document.getElementById('lg-email').value.trim();
    var pass = document.getElementById('lg-pass').value;
    var err = document.getElementById('lg-err');
    var btn = document.getElementById('lg-btn');
    err.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Connexion…';
    try {
      var res = await api('/api/auth/login', { method: 'POST', body: { email: email, password: pass } });
      setToken(res.token);
      S.user = res.user;
      document.getElementById('auth-root').hidden = true;
      document.getElementById('auth-root').innerHTML = '';
      await boot();
      toast('Bienvenue ' + res.user.name, 'ok');
    } catch (e) {
      err.textContent = e.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Se connecter';
    }
  }

  async function logout() {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch (e) {}
    if (NOTIF_TIMER) { clearInterval(NOTIF_TIMER); NOTIF_TIMER = null; }
    S.notifs = null;
    setToken('');
    S.user = null;
    renderAuth();
  }

  /* ---------------- NOTIFICATIONS ---------------- */
  async function loadNotifications() {
    if (!S.user) return;
    try {
      S.notifs = await api('/api/notifications');
      renderNotifications();
    } catch (e) { /* silencieux : ne bloque jamais l'application */ }
  }
  function renderNotifications() {
    var badge = document.getElementById('o-notif-badge');
    var menu = document.getElementById('o-notif-menu');
    if (!badge || !menu) return;
    var d = S.notifs || { total: 0, items: [] };
    badge.hidden = !d.total;
    badge.textContent = d.total > 9 ? '9+' : String(d.total || 0);
    menu.innerHTML =
      '<div class="o-notif-head"><b>Notifications</b><button class="o-btn o-btn-default o-btn-sm" id="o-notif-refresh" title="Actualiser">' + icon('refresh') + '</button></div>' +
      ((d.items && d.items.length)
        ? '<div class="o-notif-list">' + d.items.map(function (n) {
            return '<button class="o-notif-item ' + esc(n.severity || 'blue') + '" data-notif-mod="' + esc(n.module || 'dashboard') + '">' +
              '<span class="o-notif-ico">' + icon(n.icon || 'bell') + '</span>' +
              '<span class="o-notif-txt"><b>' + esc(n.title) + '</b><span>' + esc(n.detail) + '</span></span>' +
              '<span class="o-notif-count">' + Number(n.count || 0) + '</span>' +
            '</button>';
          }).join('') + '</div>'
        : '<div class="o-notif-empty">' + icon('check') + 'Aucune alerte — tout est à jour.</div>') +
      '<div class="o-notif-foot">' + (d.generated ? 'Actualisé ' + dtFr(d.generated) : '') + '</div>';
    var rf = document.getElementById('o-notif-refresh');
    if (rf) rf.onclick = function (e) { e.stopPropagation(); loadNotifications(); };
    menu.onclick = function (e) {
      var b = e.target.closest('[data-notif-mod]');
      if (!b) return;
      hideNotif();
      navigate(b.getAttribute('data-notif-mod'));
    };
  }
  function toggleNotif() {
    var m = document.getElementById('o-notif-menu');
    if (!m) return;
    NOTIF_TOGGLE_TS = Date.now();
    var open = m.hidden;
    m.hidden = !open;
    if (open) loadNotifications();
  }
  function hideNotif() {
    var m = document.getElementById('o-notif-menu');
    if (m) m.hidden = true;
  }

  /* ---------------- SHELL ---------------- */
  /* ---------------- SIDEBAR (thème Private Bank) ---------------- */
  function sideAppsHtml() {
    var q = norm(S.sideQ).trim();
    var list = visibleApps().sort(function (a, b) {
      return (isFav(b.k) ? 1 : 0) - (isFav(a.k) ? 1 : 0);
    }).filter(function (a) { return !q || norm(a.l).indexOf(q) !== -1; });
    if (!list.length) return '<div class="side-empty">Aucune application</div>';
    return list.map(function (a) {
      var pin = isFav(a.k);
      return '<button class="s-app' + (pin ? ' pinned' : '') + (S.module === a.k ? ' active' : '') + '" data-side-mod="' + a.k + '">' +
        '<span class="s-ico">' + appArt(a.k, a.icon) + '</span>' +
        '<span class="s-lbl">' + esc(a.l) + '</span>' +
        '<span class="s-pin' + (pin ? ' on' : '') + '" data-side-pin="' + a.k + '" title="' + (pin ? 'Retirer des favoris' : 'Épingler') + '">' + icon('pin') + '</span>' +
      '</button>';
    }).join('');
  }

  function renderSide() {
    var side = document.getElementById('side');
    if (!side) return;
    side.innerHTML =
      '<div class="side-brand" data-side-home title="Accueil — applications">' +
        '<span class="o-brand-badge"><img src="/assets/logo-mark.png" alt="ASS"></span>' +
        '<b>Advanced<span>Security</span></b>' +
      '</div>' +
      '<div class="side-tools">' +
        '<button data-side-tool="home" title="Accueil">' + icon('home') + '</button>' +
        '<button data-side-tool="search" title="Rechercher">' + icon('search') + '</button>' +
        '<button data-side-tool="pin" title="Épingler l\'application courante">' + icon('bookmark') + '</button>' +
        '<button data-side-tool="theme" data-mode-toggle title="' + (currentMode() === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre') + '">' + icon(modeIcon()) + '</button>' +
        '<button data-side-tool="full" title="Plein écran">' + icon('maximize') + '</button>' +
      '</div>' +
      '<div class="side-search" hidden>' + icon('search') +
        '<input id="side-q" placeholder="Rechercher…" value="' + esc(S.sideQ) + '" autocomplete="off">' +
      '</div>' +
      '<div class="side-head"><span>APPLICATIONS</span>' +
        '<span class="side-head-btns">' +
          '<button data-side-tool="collapse" title="Réduire le panneau">' + icon('panel') + '</button>' +
          '<button data-side-tool="hide" title="Masquer complètement le menu">' + icon('chevronLeft') + '</button>' +
        '</span></div>' +
      '<div class="side-apps" id="side-apps">' + sideAppsHtml() + '</div>' +
      '<div class="side-foot">' +
        '<button class="sf-av" data-side-tool="account" title="Mon compte / mot de passe">' + esc((S.user.name || 'A')[0]) + '</button>' +
        '<button class="sf-who" data-side-tool="account" title="Mon compte / mot de passe"><b>' + esc(S.user.name) + '</b><small>' + esc(S.user.role) + '</small></button>' +
        '<button class="sf-out" data-side-tool="logout" title="Se déconnecter">' + icon('logout') + '</button>' +
      '</div>';

    var q = document.getElementById('side-q');
    if (q) {
      q.oninput = function () {
        S.sideQ = q.value;
        document.getElementById('side-apps').innerHTML = sideAppsHtml();
      };
      if (S.sideSearchOpen) { q.parentNode.hidden = false; q.focus(); }
    }

    side.onclick = function (e) {
      var pin = e.target.closest('[data-side-pin]');
      if (pin) {
        e.stopPropagation();
        var added = toggleFav(pin.getAttribute('data-side-pin'));
        renderSide(); renderIsland();
        toast(added ? 'Application épinglée aux favoris' : 'Application retirée des favoris', 'ok');
        return;
      }
      var tool = e.target.closest('[data-side-tool]');
      if (tool) { sideTool(tool.getAttribute('data-side-tool')); return; }
      if (e.target.closest('[data-side-home]')) { navigate('apps'); return; }
      var mod = e.target.closest('[data-side-mod]');
      if (mod) navigate(mod.getAttribute('data-side-mod'));
    };
  }

  function sideTool(t) {
    if (t === 'home') return navigate('apps');
    if (t === 'account') return openAccountModal();
    if (t === 'search') {
      S.sideSearchOpen = !S.sideSearchOpen;
      var box = document.querySelector('.side-search');
      if (box) {
        box.hidden = !S.sideSearchOpen;
        if (S.sideSearchOpen) { var i = document.getElementById('side-q'); if (i) i.focus(); }
        else { S.sideQ = ''; document.getElementById('side-apps').innerHTML = sideAppsHtml(); }
      }
      return;
    }
    if (t === 'pin') {
      if (S.module === 'apps') { toast('Ouvrez une application à épingler', 'info'); return; }
      var added = toggleFav(S.module);
      renderSide(); renderIsland();
      toast(added ? 'Application épinglée aux favoris' : 'Application retirée des favoris', 'ok');
      return;
    }
    if (t === 'full') {
      try {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
      } catch (e) { toast('Plein écran non disponible', 'err'); }
      return;
    }
    if (t === 'theme') { toggleMode(); return; }
    if (t === 'collapse') {
      document.body.classList.toggle('side-collapsed');
      try { localStorage.setItem('ass_side_collapsed', document.body.classList.contains('side-collapsed') ? '1' : '0'); } catch (e) {}
      return;
    }
    if (t === 'hide') {
      document.body.classList.add('side-hidden');
      var restore = document.getElementById('side-restore');
      if (!restore) {
        restore = document.createElement('button');
        restore.id = 'side-restore';
        restore.className = 'o-side-restore';
        restore.title = 'Afficher le menu';
        restore.innerHTML = icon('menu');
        restore.onclick = showSide;
        document.body.appendChild(restore);
      }
      restore.hidden = false;
      return;
    }
    if (t === 'logout') return logout();
  }

  function showSide() {
    document.body.classList.remove('side-hidden');
    var r = document.getElementById('side-restore');
    if (r) r.hidden = true;
  }

  function closeSideMobile() {
    document.body.classList.remove('side-open');
    var bd = document.getElementById('side-backdrop');
    if (bd) bd.hidden = true;
  }

  /* ---------------- ÎLOT DE FAVORIS : masqué (favoris/récents cachés) ---------------- */
  function renderIsland() {
    var isl = document.getElementById('island');
    if (!isl) return;
    isl.hidden = true;
    isl.innerHTML = '';
    isl.onclick = null;
    isl.className = 'o-island';
  }

  function renderShell() {
    document.getElementById('auth-root').hidden = true;
    document.getElementById('auth-root').innerHTML = '';
    document.getElementById('app').hidden = false;

    var nav = document.getElementById('navbar');
    nav.innerHTML =
      '<button class="o-side-toggle" id="o-side-toggle" title="Menu">' + icon('menu') + '</button>' +
      '<button class="o-launcher-btn" id="o-launcher-btn" title="Toutes les applications">' + icon('grid') + '</button>' +
      '<button class="o-mode-btn" id="o-mode-btn" data-mode-toggle title="' + (currentMode() === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre') + '">' + icon(modeIcon()) + '</button>' +
      '<button class="o-notif-btn" id="o-notif-btn" title="Notifications">' + icon('bell') + '<span class="o-notif-badge" id="o-notif-badge" hidden>0</span></button>' +
      '<div class="o-notif-menu" id="o-notif-menu" hidden></div>' +
      '<div class="o-brand" id="o-brand-home" title="Accueil — applications"><span class="o-brand-badge"><img src="/assets/logo-mark.png" alt="ASS"></span><span class="full">Advanced Security</span></div>' +
      '<div class="o-apps" id="o-apps">' +
      MODULES.map(function (m) {
        return '<button class="o-app" data-mod="' + m.k + '" title="' + esc(m.l) + '">' + icon(m.icon) + '<span>' + esc(m.l) + '</span></button>';
      }).join('') +
      '</div>' +
      '<div class="o-user" id="o-user">' +
        '<div class="who"><b>' + esc(S.user.name) + '</b><small>' + esc(S.user.role) + '</small></div>' +
        '<div class="o-avatar">' + esc((S.user.name || 'A')[0]) + '</div>' +
        '<div class="o-menu" id="o-menu">' +
          '<div style="padding:8px 10px"><b style="font-size:12.5px">' + esc(S.user.name) + '</b><br><span style="font-size:11px;color:#6b7280">' + esc(S.user.email) + '</span></div>' +
          '<div class="sep"></div>' +
          '<button data-act="logout">' + icon('logout') + ' Se déconnecter</button>' +
        '</div>' +
      '</div>';

    document.getElementById('o-apps').onclick = function (e) {
      var b = e.target.closest('[data-mod]');
      if (b) navigate(b.getAttribute('data-mod'));
    };
    document.getElementById('o-side-toggle').onclick = function () {
      var open = !document.body.classList.contains('side-open');
      document.body.classList.toggle('side-open', open);
      var bd = document.getElementById('side-backdrop');
      if (open) {
        if (!bd) {
          bd = document.createElement('div');
          bd.id = 'side-backdrop';
          bd.className = 'o-side-backdrop';
          bd.onclick = closeSideMobile;
          document.body.appendChild(bd);
        }
        bd.hidden = false;
      } else if (bd) bd.hidden = true;
    };
    document.getElementById('o-launcher-btn').onclick = function () { navigate('apps'); };
    document.getElementById('o-mode-btn').onclick = toggleMode;
    document.getElementById('o-notif-btn').onclick = function (e) { e.stopPropagation(); toggleNotif(); };
    document.getElementById('o-brand-home').onclick = function () { navigate('apps'); };
    document.getElementById('o-user').onclick = function (e) {
      if (e.target.closest('[data-act="logout"]')) return logout();
      document.getElementById('o-menu').classList.toggle('open');
    };

    renderSide();
    renderIsland();
    if (NOTIF_TIMER) clearInterval(NOTIF_TIMER);
    loadNotifications();
    NOTIF_TIMER = setInterval(loadNotifications, 120000);
  }

  /* Modules avec une vue sur mesure : pas de barre d'actions générique
     (chacun affiche ses propres boutons dans son en-tête). */
  var CUSTOM_VIEWS = {
    dashboard: 1, planning: 1, rapports: 1, activite: 1, pointage: 1,
    contrats: 1, users: 1, parc: 1, ventes: 1, achats: 1, parametres: 1, caisse: 1,
  };
  var SEARCHABLE_VIEWS = { parc: 1, users: 1 };

  function renderControl() {
    var m = moduleDef(S.module);
    var c = document.getElementById('control');
    if (S.module === 'apps') { c.hidden = true; c.innerHTML = ''; return; }
    c.hidden = false;
    var custom = !!CUSTOM_VIEWS[S.module];
    var searchable = !custom || !!SEARCHABLE_VIEWS[S.module];
    var canKanban = !custom && !!(m && m.kanban);
    c.innerHTML =
      '<div class="o-breadcrumb"><span class="crumb">Advanced Security</span><span class="sep">/</span><b>' + esc(m ? m.l : 'Tableau') + '</b></div>' +
      '<div class="spacer"></div>' +
      (searchable ? '<div class="o-search">' + icon('search') + '<input id="o-q" placeholder="Rechercher…" value="' + esc(S.search) + '"></div>' : '') +
      (canKanban ? '<div style="display:flex;gap:6px">' +
        '<button class="o-btn o-btn-default o-btn-sm' + (S.view === 'list' ? ' active' : '') + '" data-act="view-list" title="Vue liste">Liste</button>' +
        '<button class="o-btn o-btn-default o-btn-sm' + (S.view === 'kanban' ? ' active' : '') + '" data-act="view-kanban" title="Vue kanban">Kanban</button>' +
      '</div>' : '') +
      (!custom && S.module === 'achats' ? '<button class="o-btn o-btn-purple o-btn-sm" data-act="scan-achat">' + icon('scan') + ' Scanner un achat (IA)</button>' : '') +
      (!custom && (S.module === 'devis' || S.module === 'factures') ? '<button class="o-btn o-btn-purple o-btn-sm" data-act="scan-' + (S.module === 'devis' ? 'devis' : 'facture') + '">' + icon('scan') + ' Scanner (IA)</button>' : '') +
      (!custom && S.module === 'depenses' ? '<button class="o-btn o-btn-purple o-btn-sm" data-act="scan-depense">' + icon('camera') + ' Scanner un justificatif (IA)</button>' : '') +
      (!custom ? '<button class="o-btn o-btn-default o-btn-sm" data-act="export">' + icon('download') + ' CSV</button>' : '') +
      (!custom ? '<button class="o-btn o-btn-primary o-btn-sm" data-act="create">' + icon('plus') + ' Créer</button>' : '');

    var q = document.getElementById('o-q');
    if (q) {
      q.oninput = function () { S.search = q.value; renderView(); };
    }
  }

  function navigate(mod) {
    closeSideMobile();
    stopDashTimers();
    if (mod !== 'apps' && !canOpen(mod)) {
      toast('Accès non autorisé à cette application', 'err');
      return;
    }
    S.module = mod;
    S.view = 'list';
    S.search = '';
    S.appSearch = '';
    S.sort = { k: null, dir: 1 };
    Array.prototype.forEach.call(document.querySelectorAll('.o-app'), function (b) {
      b.classList.toggle('active', b.getAttribute('data-mod') === mod);
    });
    var lb = document.getElementById('o-launcher-btn');
    if (lb) lb.classList.toggle('active', mod === 'apps');
    document.body.classList.toggle('o-home-mode', mod === 'apps');
    pushRecent(mod);
    renderSide();
    renderIsland();
    renderControl();
    renderView();
  }

  /* ---------------- DATA LOADING ---------------- */
  async function loadRefs() {
    try {
      var r = await Promise.all([api('/api/clients'), api('/api/users')]);
      S.refs.clients = r[0];
      S.refs.users = r[1];
    } catch (e) { /* silencieux */ }
  }

  async function loadCol(col) {
    S.data[col] = await api('/api/' + col);
    return S.data[col];
  }

  /* ---------------- LANCEUR D'APPLICATIONS ---------------- */
  function greeting() {
    var h = new Date().getHours();
    var g = h < 18 ? 'Bonjour' : 'Bonsoir';
    var name = ((S.user && S.user.name) || '').split(' ')[0];
    return name ? g + ', ' + name : g;
  }

  function launcherList() {
    var needle = norm(S.appSearch).trim();
    var base = visibleApps();
    if (S.appFilter === 'fav') base = favs().map(appDef).filter(function (a) { return a && canOpen(a.k); });
    else if (S.appFilter === 'recent') base = recents().map(appDef).filter(function (a) { return a && canOpen(a.k); });
    return base.filter(function (a) { return !needle || norm(a.l).indexOf(needle) !== -1; });
  }

  function renderApps() {
    var list = launcherList();
    var grid =
      '<div class="o-launcher-grid" id="launcher-grid">' +
        list.map(function (a) {
          return '<button class="o-launcher-tile" data-mod="' + a.k + '" data-label="' + esc(norm(a.l)) + '">' +
            '<span class="tile-icon">' + appArt(a.k, a.icon) + '</span>' +
            '<span class="tile-label">' + esc(a.l) + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<div class="o-launcher-empty" id="launcher-empty"' + (list.length ? ' hidden' : '') + '>' +
        (S.appFilter === 'fav' ? 'Aucun favori — épinez des applications.' : 'Aucune application trouvée') +
      '</div>';

    var search =
      '<div class="o-launcher-search">' + icon('search') +
        '<input id="apps-q" type="search" placeholder="Rechercher une application…" value="' + esc(S.appSearch || '') + '" autocomplete="off">' +
      '</div>';

    var shortcuts =
      '<div class="home-shortcuts">' +
        '<button class="' + (S.appFilter === 'fav' ? 'active' : '') + '" data-home="fav">' + icon('bookmark') + '<span>Favoris</span></button>' +
        '<button class="' + (S.appFilter === 'recent' ? 'active' : '') + '" data-home="recent">' + icon('clock') + '<span>Récents</span></button>' +
        '<button data-home="focus">' + icon('search') + '<span>Recherche</span></button>' +
      '</div>';

    var filterBar = S.appFilter ? '<div class="home-filter">' +
      '<span>' + (S.appFilter === 'fav' ? 'Vos applications favorites' : 'Vos applications récentes') + '</span>' +
      '<button data-home="clear">' + icon('minimize') + ' Tout afficher</button>' +
    '</div>' : '';

    // Lanceur plein écran NEBULA : en-tête, salutation, recherche, filtres et grille.
    return '<div class="o-launcher nebula-home">' +
      '<div class="nebula-top">' +
        '<span class="nebula-top-tag">' + icon('sparkles') + ' Espace de travail</span>' +
        '<div class="nebula-top-right">' +
          '<span class="nebula-clock" id="nebula-clock"></span>' +
          '<button class="o-mode-btn" data-mode-toggle title="' + (currentMode() === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre') + '">' + icon(modeIcon()) + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="o-launcher-inner">' +
        '<h1 class="home-greet">' + esc(greeting()) + '</h1>' +
        '<p class="nebula-subtitle">Votre espace de travail, à portée de clic.</p>' +
        '<div class="home-card">' + search + shortcuts + '</div>' +
        filterBar +
        grid +
      '</div>' +
    '</div>';
  }

  function bindApps() {
    var grid = document.getElementById('launcher-grid');
    if (grid) {
      grid.onclick = function (e) {
        var b = e.target.closest('[data-mod]');
        if (b) navigate(b.getAttribute('data-mod'));
      };
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-mode-toggle]'), function (b) {
      b.onclick = toggleMode;
    });
    var clock = document.getElementById('nebula-clock');
    if (clock) {
      var tick = function () {
        var el = document.getElementById('nebula-clock');
        if (!el) { clearInterval(NEBULA_CLOCK_TIMER); return; }
        el.textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) +
          ' · ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      };
      tick();
      if (NEBULA_CLOCK_TIMER) clearInterval(NEBULA_CLOCK_TIMER);
      NEBULA_CLOCK_TIMER = setInterval(tick, 30000);
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-home]'), function (b) {
      b.onclick = function () {
        var a = b.getAttribute('data-home');
        if (a === 'focus') { var i = document.getElementById('apps-q'); if (i) { i.focus(); i.select(); } return; }
        if (a === 'clear') S.appFilter = '';
        else S.appFilter = (S.appFilter === a) ? '' : a;
        S.appSearch = '';
        renderView();
      };
    });
    var q = document.getElementById('apps-q');
    if (!q) return;
    q.oninput = function () {
      S.appSearch = q.value;
      var needle = norm(q.value).trim();
      var any = false;
      Array.prototype.forEach.call(document.querySelectorAll('.o-launcher-tile'), function (t) {
        var show = !needle || t.getAttribute('data-label').indexOf(needle) !== -1;
        t.hidden = !show;
        if (show) any = true;
      });
      var empty = document.getElementById('launcher-empty');
      if (empty) empty.hidden = any;
    };
  }

  /* ---------------- PARC & ÉQUIPEMENTS ---------------- */
  function renderParc() {
    var all = S.data.equipements || [];
    var today = new Date();
    var jours = function (d) { return Math.ceil((new Date(d) - today) / 86400000); };
    var enService = all.filter(function (e) { return norm(e.status) === 'en service'; }).length;
    var retard = all.filter(function (e) { return e.nextCtrl && new Date(e.nextCtrl) < today; }).length;
    var proche = all.filter(function (e) { var j = e.nextCtrl ? jours(e.nextCtrl) : 9999; return j >= 0 && j <= 30; }).length;
    var hors = all.filter(function (e) { return norm(e.status).indexOf('hors') !== -1; }).length;
    var conformite = all.length ? Math.max(0, Math.round(((all.length - retard - hors) / all.length) * 100)) : 100;

    var cats = [];
    all.forEach(function (e) { if (e.cat && cats.indexOf(e.cat) === -1) cats.push(e.cat); });
    cats.sort();

    var q = norm(S.search).trim();
    var rows = all.filter(function (e) {
      if (S.parcCat && e.cat !== S.parcCat) return false;
      if (!q) return true;
      return norm([e.cat, e.marque, e.modele, e.serial, e.site, e.status, refName('clients', e.clientId), e.notes].join(' ')).indexOf(q) !== -1;
    });

    var chips = '<button class="o-chip' + (!S.parcCat ? ' active' : '') + '" data-parc-cat="">Tous <span>' + all.length + '</span></button>' +
      cats.map(function (c) {
        var n = all.filter(function (e) { return e.cat === c; }).length;
        return '<button class="o-chip' + (S.parcCat === c ? ' active' : '') + '" data-parc-cat="' + esc(c) + '">' + esc(c) + ' <span>' + n + '</span></button>';
      }).join('');

    var body = rows.length ? rows.map(function (e) {
      var j = e.nextCtrl ? jours(e.nextCtrl) : 9999;
      var cls = j < 0 ? 'red' : j <= 30 ? 'amber' : 'green';
      var ctrl = e.nextCtrl
        ? '<div class="cell-main">' + esc(dFr(e.nextCtrl)) + '</div><div class="cell-sub"><span class="o-badge ' + cls + '">' + (j < 0 ? Math.abs(j) + ' j de retard' : 'dans ' + j + ' j') + '</span></div>'
        : '—';
      var gar = e.garantie ? (new Date(e.garantie) < today ? '<span class="o-badge red">expirée</span>' : '<span class="o-badge green">' + dFr(e.garantie) + '</span>') : '—';
      return '<tr data-row="' + esc(e.id) + '">' +
        '<td><div class="cell-main">' + esc(e.cat || '—') + '</div><div class="cell-sub">' + esc([e.marque, e.modele].filter(Boolean).join(' ') || '—') + '</div></td>' +
        '<td>' + esc(refName('clients', e.clientId) || '—') + '</td>' +
        '<td>' + esc(e.site || '—') + '</td>' +
        '<td><span class="o-mono">' + esc(e.serial || '—') + '</span>' + (Number(e.qty || 1) > 1 ? ' <span class="o-badge gray">×' + Number(e.qty) + '</span>' : '') + '</td>' +
        '<td>' + ctrl + '</td>' +
        '<td>' + gar + '</td>' +
        '<td>' + badge(e.status) + '</td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="7"><div class="o-empty"><div class="ico">▤</div>Aucun équipement' + (S.search || S.parcCat ? ' pour ce filtre' : '') + '</div></td></tr>';

    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">Parc & Équipements</h2><p class="o-view-sub">Registre des installations, garanties et contrôles réglementaires</p></div>' +
        '<div class="o-actions"><button class="o-btn o-btn-default" data-act="parc-attestation">' + icon('printer') + ' Attestation</button><button class="o-btn o-btn-primary" data-act="create">' + icon('plus') + ' Nouvel équipement</button></div></div>' +
      '<div class="o-kpis o-kpis-4">' +
        '<div class="o-kpi"><div class="lbl">Équipements suivis</div><div class="val">' + all.length + '</div><div class="sub">' + (all.reduce(function (s, e) { return s + Number(e.qty || 1); }, 0)) + ' unités installées</div></div>' +
        '<div class="o-kpi"><div class="lbl">Contrôles en retard</div><div class="val ' + (retard ? 'red' : '') + '">' + retard + '</div><div class="sub">' + proche + ' contrôle(s) sous 30 jours</div></div>' +
        '<div class="o-kpi"><div class="lbl">Hors service</div><div class="val ' + (hors ? 'red' : '') + '">' + hors + '</div><div class="sub">' + enService + ' en service</div></div>' +
        '<div class="o-kpi"><div class="lbl">Conformité du parc</div><div class="val">' + conformite + '%</div><div class="o-progress" style="margin-top:6px"><i style="width:' + conformite + '%"></i></div></div>' +
      '</div>' +
      '<div class="o-chips">' + chips + '</div>' +
      '<div class="o-list-wrap"><div class="o-table-scroll"><table class="o-list"><thead><tr>' +
        '<th>Équipement</th><th>Client</th><th>Site</th><th>N° série</th><th>Prochain contrôle</th><th>Garantie</th><th>État</th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div></div>' +
    '</div>';
  }

  function bindParc() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-parc-cat]'), function (b) {
      b.onclick = function () { S.parcCat = b.getAttribute('data-parc-cat'); renderView(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#content tr[data-row]'), function (tr) {
      tr.onclick = function () { openForm('equipements', tr.getAttribute('data-row')); };
    });
  }

  function openAttestationPicker() {
    var withEq = S.refs.clients.filter(function (c) {
      return (S.data.equipements || []).some(function (e) { return e.clientId === c.id; });
    });
    if (!withEq.length) { toast('Aucun équipement enregistré', 'err'); return; }
    var body = '<div class="o-field"><label>Client</label><select class="o-select" name="clientId">' +
      withEq.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join('') +
      '</select></div><div class="o-help" style="margin-top:8px">L\'attestation s\'ouvre dans un nouvel onglet, prête à imprimer.</div>';
    openModal('Attestation de conformité', body, function (data) {
      closeModal();
      window.open('/api/parc/attestation/' + encodeURIComponent(data.clientId) + '?token=' + encodeURIComponent(token()), '_blank');
    }, 'Générer l\'attestation');
  }

  /* ---------------- EMPLOYÉS · SALAIRE + ASSURANCES ---------------- */
  function assuranceStatut(a) {
    var j = a.dateFin ? dLeft(a.dateFin) : 9999;
    if (String(a.statut || '').toLowerCase() === 'résiliée') return { label: 'résiliée', cls: 'gray', j: j };
    if (j < 0) return { label: 'expirée', cls: 'red', j: j };
    if (j <= 30) return { label: 'à renouveler', cls: 'amber', j: j };
    return { label: 'à jour', cls: 'green', j: j };
  }
  function statutBadge(s) {
    var txt = s.label;
    if (s.j < 0) txt += ' · ' + Math.abs(s.j) + ' j';
    else if (s.j <= 30) txt += ' · ' + s.j + ' j';
    return '<span class="o-badge ' + s.cls + '">' + esc(txt) + '</span>';
  }
  function assuranceBadge(a) { return statutBadge(assuranceStatut(a)); }

  function renderEmployesView() {
    var emps = filtered('users', S.data.users || []);
    var assos = S.data.assurances || [];
    var tous = S.data.users || [];
    var actifs = tous.filter(function (u) { return u.active; });
    var salaries = S.data.salaires || [];
    var mois = S.paieMois || new Date().toISOString().slice(0, 7);
    var salaireOf = function (id) {
      for (var i = 0; i < salaries.length; i++) if (salaries[i].empId === id) return salaries[i];
      return null;
    };
    var actifIds = actifs.map(function (u) { return u.id; });
    var masse = salaries.filter(function (s) { return actifIds.indexOf(s.empId) !== -1; })
      .reduce(function (s, x) { return s + Number(x.net || 0); }, 0);
    var avancesMois = salaries.reduce(function (s, x) { return s + Number(x.avances || 0); }, 0);
    var primes = assos.reduce(function (s, a) { return s + Number(a.prime || 0); }, 0);
    var urgentes = assos.filter(function (a) { var s = assuranceStatut(a); return s.cls === 'amber' || s.cls === 'red'; });
    var expirees = assos.filter(function (a) { return assuranceStatut(a).cls === 'red'; });

    var empBody = emps.length ? emps.map(function (u) {
      var sal = salaireOf(u.id);
      var mesAssos = assos.filter(function (a) { return a.empId === u.id && String(a.statut || '').toLowerCase() !== 'résiliée'; });
      var worst = null;
      mesAssos.forEach(function (a) { var s = assuranceStatut(a); if (!worst || s.j < worst.j) worst = s; });
      var st = worst ? statutBadge(worst) : '<span class="o-badge gray">aucune assurance</span>';
      return '<tr data-emp="' + esc(u.id) + '">' +
        '<td><div class="cell-main">' + esc(u.name || '—') + '</div><div class="cell-sub">' + esc(u.email || '') + '</div></td>' +
        '<td>' + badge(u.role) + '</td>' +
        '<td class="r"><b>' + (sal ? num(sal.jours) : '0') + '</b> j</td>' +
        '<td>' + (sal ? num(sal.heuresSup) + ' h / ' + num(sal.deplacements) + ' dépl.' +
          (sal.missionsHorsWilaya ? '<div class="cell-sub">' + num(sal.missionsHorsWilaya) + ' mission(s) hors wilaya · ' + money(sal.brutHW) + '</div>' : '') : '—') + '</td>' +
        '<td class="r">' + (sal && sal.avances ? '<span style="color:var(--o-red)">' + money(sal.avances) + '</span>' : '—') + '</td>' +
        '<td class="r"><b style="color:#0f766e">' + money(sal ? sal.net : 0) + '</b>' +
          (sal ? '<div class="cell-sub">brut ' + money(sal.brut) + '</div>' : '') + '</td>' +
        '<td>' + st + '</td>' +
        '<td>' + esc(u.phone || '—') + '</td>' +
        '<td style="white-space:nowrap"><button class="o-btn o-btn-default o-btn-sm" data-avance="' + esc(u.id) + '">Avance</button></td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="9"><div class="o-empty"><div class="ico">◎</div>Aucun employé' + (S.search ? ' pour ce filtre' : '') + '</div></td></tr>';

    var assoBody = assos.length ? assos.slice().sort(function (a, b) { return dLeft(a.dateFin) - dLeft(b.dateFin); }).map(function (a) {
      return '<tr data-asso="' + esc(a.id) + '">' +
        '<td class="cell-main">' + esc(refName('users', a.empId) || '—') + '</td>' +
        '<td>' + esc(a.type || '—') + '<div class="cell-sub">' + esc(a.assureur || '') + '</div></td>' +
        '<td><span class="o-mono">' + esc(a.numero || '—') + '</span></td>' +
        '<td class="num">' + (Number(a.prime) ? money(a.prime) : '—') + '</td>' +
        '<td>' + esc(dFr(a.dateFin)) + '</td>' +
        '<td>' + assuranceBadge(a) + '</td>' +
        '<td style="white-space:nowrap">' +
          '<button class="o-btn o-btn-default o-btn-sm" data-edit-asso="' + esc(a.id) + '">Modifier</button> ' +
          '<button class="o-btn o-btn-danger o-btn-sm" data-del-asso="' + esc(a.id) + '">Supprimer</button>' +
        '</td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="7"><div class="o-empty">Aucune assurance enregistrée — scannez une attestation avec l\'IA</div></td></tr>';

    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">Employés — salaires & assurances</h2><p class="o-view-sub">Salaire calculé depuis les pointages · avances déduites · couvertures d\'assurance</p></div>' +
        '<div class="o-actions">' +
          '<div class="o-field" style="margin-right:6px"><label style="font-size:11px">Mois de paie</label><input class="o-input" type="month" id="paie-mois" value="' + esc(mois) + '" style="width:150px"></div>' +
          '<button class="o-btn o-btn-default" data-act="export">' + icon('download') + ' CSV</button>' +
          '<button class="o-btn o-btn-default" data-act="create-assurance">' + icon('shield') + ' Nouvelle assurance</button>' +
          '<button class="o-btn o-btn-purple" data-act="scan-assurance">' + icon('camera') + ' Scanner une attestation (IA)</button>' +
          '<button class="o-btn o-btn-primary" data-act="create">' + icon('plus') + ' Nouvel employé</button>' +
        '</div></div>' +

      '<div class="o-alert" style="margin-bottom:12px"><span>🧮</span><div><b>Salaire payé =</b> jours × 2 000 DA + heures supplémentaires × 375 DA + déplacements × 2 000 DA + missions hors wilaya × 1 200 DA <b>− avances de la caisse</b>. ' +
      'Source : pointage manuel du mois de <b>' + esc(mois) + '</b>. Le champ « salaire de référence » de la fiche employé est indicatif.</div></div>' +

      '<div class="o-kpis o-kpis-4">' +
        '<div class="o-kpi"><div class="lbl">Masse salariale (' + esc(mois) + ')</div><div class="val">' + money(masse) + '</div><div class="sub">' + actifs.length + ' salarié(s) actif(s) · net après avances</div></div>' +
        '<div class="o-kpi"><div class="lbl">Avances du mois</div><div class="val">' + money(avancesMois) + '</div><div class="sub">déduites du salaire</div></div>' +
        '<div class="o-kpi ' + (expirees.length ? 'red' : 'teal') + '"><div class="lbl">Assurances</div><div class="val">' + assos.length + '</div><div class="sub">' + money(primes) + ' de primes / mois</div></div>' +
        '<div class="o-kpi ' + (urgentes.length ? 'red' : 'green') + '"><div class="lbl">Échéances ≤ 30 jours</div><div class="val ' + (urgentes.length ? 'red' : '') + '">' + urgentes.length + '</div><div class="sub">' + (expirees.length ? expirees.length + ' expirée(s) — notification' : 'rien à renouveler') + '</div></div>' +
      '</div>' +

      (urgentes.length ? '<div class="o-alert' + (expirees.length ? ' red' : '') + '" style="margin-bottom:12px"><span>🔔</span><div><b>Notification assurances :</b> ' +
        urgentes.map(function (a) {
          var s = assuranceStatut(a);
          return esc(refName('users', a.empId) || '—') + ' — ' + esc(a.type || '') + ' (' + esc(a.assureur || '') + ') ' +
            (s.j < 0 ? '<b>expirée depuis ' + Math.abs(s.j) + ' jours</b>' : '<b>dans ' + s.j + ' jours</b>');
        }).join(' · ') + '</div></div>' : '') +

      '<div class="o-panel" style="margin-bottom:14px"><div class="o-panel-head">Employés <span class="o-badge purple">' + emps.length + '</span></div><div class="o-panel-body" style="padding:0">' +
        '<div class="o-table-scroll"><table class="o-list"><thead><tr><th>Employé</th><th>Rôle</th><th class="r">Jours</th><th>H. sup. / Dépl.</th><th class="r">Avances</th><th class="r">Salaire net</th><th>Assurance</th><th>Téléphone</th><th></th></tr></thead><tbody>' + empBody + '</tbody></table></div>' +
      '</div></div>' +

      '<div class="o-panel"><div class="o-panel-head">Assurances des employés <span class="o-badge purple">' + assos.length + '</span></div><div class="o-panel-body" style="padding:0">' +
        '<div class="o-table-scroll"><table class="o-list"><thead><tr><th>Employé</th><th>Type / assureur</th><th>N° police</th><th class="r">Prime</th><th>Fin de couverture</th><th>Statut</th><th></th></tr></thead><tbody>' + assoBody + '</tbody></table></div>' +
      '</div></div>' +
    '</div>';
  }

  function bindEmployes() {
    var pm = document.getElementById('paie-mois');
    if (pm) pm.onchange = function () { S.paieMois = pm.value; renderView(); };
    Array.prototype.forEach.call(document.querySelectorAll('[data-emp]'), function (tr) {
      tr.onclick = function (e) {
        if (e.target.closest('[data-edit-asso],[data-del-asso],[data-avance]')) return;
        openForm('users', tr.getAttribute('data-emp'));
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-avance]'), function (b) {
      b.onclick = function (e) { e.stopPropagation(); openAvanceModal(b.getAttribute('data-avance')); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-asso]'), function (tr) {
      tr.onclick = function (e) {
        if (e.target.closest('[data-edit-asso],[data-del-asso]')) return;
        openForm('assurances', tr.getAttribute('data-asso'));
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-edit-asso]'), function (b) {
      b.onclick = function (e) { e.stopPropagation(); openForm('assurances', b.getAttribute('data-edit-asso')); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-del-asso]'), function (b) {
      b.onclick = async function (e) {
        e.stopPropagation();
        if (!confirm('Supprimer cette assurance ?')) return;
        try {
          await api('/api/assurances/' + b.getAttribute('data-del-asso'), { method: 'DELETE' });
          toast('Assurance supprimée', 'ok');
          renderView();
        } catch (err) { toast(err.message, 'err'); }
      };
    });
  }

  /* --- Scan IA d'une attestation d'assurance --- */
  function openScanAssurance() {
    var body =
      '<div class="o-scan" id="sf-zone">' +
        '<div class="big" style="color:var(--o-teal)">' + icon('scan') + '</div>' +
        '<b>Photo ou PDF de l\'attestation / police d\'assurance</b>' +
        '<div class="o-help">Mutuelle, AMO, RC professionnelle, véhicule, incendie… L\'IA extrait la société, le n° de police, les garanties, la prime et les dates de couverture.</div>' +
        '<input type="file" id="sf-file" accept="image/*,application/pdf" hidden>' +
        '<div style="margin-top:10px"><button type="button" class="o-btn o-btn-default o-btn-sm" id="sf-pick">Choisir un fichier</button> <button type="button" class="o-btn o-btn-purple o-btn-sm" id="sf-camera">Prendre une photo</button></div>' +
        '<div id="sf-status" style="margin-top:10px"></div><div id="sf-preview"></div>' +
      '</div>' +
      '<div id="sf-result" style="margin-top:14px"></div>';

    openModal('Scanner une attestation d\'assurance — IA', body, async function (data) {
      if (!data.assureur && !data.numero) { toast('Analysez d\'abord une attestation', 'err'); return; }
      if (!data.empId) { toast('Sélectionnez l\'employé assuré', 'err'); return; }
      data.statut = data.statut || 'active';
      try {
        await api('/api/assurances', { method: 'POST', body: data });
        closeModal();
        toast('Assurance enregistrée', 'ok');
        renderView();
      } catch (e) { toast(e.message, 'err'); }
    }, 'Enregistrer l\'assurance');

    var file = document.getElementById('sf-file');
    var zone = document.getElementById('sf-zone');
    document.getElementById('sf-pick').onclick = function () { file.removeAttribute('capture'); file.click(); };
    document.getElementById('sf-camera').onclick = function () { file.setAttribute('capture', 'environment'); file.click(); };
    file.onchange = function () { if (file.files[0]) analyzeAssurance(file.files[0]); };
    zone.ondragover = function (e) { e.preventDefault(); zone.classList.add('drag'); };
    zone.ondragleave = function () { zone.classList.remove('drag'); };
    zone.ondrop = function (e) { e.preventDefault(); zone.classList.remove('drag'); if (e.dataTransfer.files[0]) analyzeAssurance(e.dataTransfer.files[0]); };
  }

  async function analyzeAssurance(file) {
    var status = document.getElementById('sf-status');
    var prev = document.getElementById('sf-preview');
    if (file.size > 8 * 1024 * 1024) {
      status.innerHTML = '<span style="color:var(--o-red);font-size:12px">Fichier trop volumineux (max 8 Mo)</span>';
      return;
    }
    prev.innerHTML = file.type === 'application/pdf'
      ? '<div class="o-help" style="margin-top:8px">📄 ' + esc(file.name) + '</div>'
      : '<img class="o-scan-img" src="' + URL.createObjectURL(file) + '">';
    status.innerHTML = '<div class="o-scanline"></div><b>Lecture de l\'attestation par l\'IA… (10 à 30 s)</b>';
    document.getElementById('sf-result').innerHTML = '';
    try {
      var base64 = await fileToBase64(file);
      var res = await api('/api/ai/extract', { method: 'POST', body: { base64: base64, mimeType: file.type || 'image/jpeg', kind: 'assurance' } });
      var d = res.data || {};
      status.innerHTML = '<span class="o-help">✅ Lecture terminée · confiance ' + Math.round(Number(d.confiance || 0) * 100) + '% · modèle ' + esc(res.model) + '</span>';
      fillAssuranceFields(d);
    } catch (err) {
      status.innerHTML = '<span style="color:var(--o-red);font-size:12px">' + esc(err.message) + '</span>';
    }
  }

  function fillAssuranceFields(p) {
    var a = p.assurance || {};
    var typeOpts = SCHEMA.assurances.fields.filter(function (f) { return f.k === 'type'; })[0].opts;
    var typeVal = '';
    var typed = norm(a.type || '');
    typeOpts.forEach(function (o) { if (!typeVal && typed && norm(o).indexOf(typed.slice(0, 6)) !== -1) typeVal = o; });
    if (!typeVal && typed) typeVal = norm(typed).indexOf('auto') !== -1 || norm(typed).indexOf('sant') !== -1 ? 'AMO / Assurance maladie' : 'Autre';

    var assure = String(a.assure || '');
    var empMatch = '';
    (S.refs.users || []).forEach(function (u) {
      if (!assure || empMatch) return;
      var n = String(u.name || '').toLowerCase();
      if (n.indexOf(assure.toLowerCase().slice(0, 8)) !== -1 || assure.toLowerCase().indexOf(n.slice(0, 8)) !== -1) empMatch = u.id;
    });

    document.getElementById('sf-result').innerHTML =
      '<b style="font-size:12.5px">✅ Champs détectés par l\'IA — vérifiez puis enregistrez</b>' +
      '<div class="o-form-grid" style="margin-top:8px">' +
        fieldHTML({ k: 'empId', l: 'Employé assuré', t: 'rel', rel: 'users', req: true }, empMatch) +
        fieldHTML({ k: 'type', l: 'Type d\'assurance', t: 'select', opts: typeOpts }, typeVal) +
        fieldHTML({ k: 'assureur', l: 'Société d\'assurance', req: true }, a.societe || (p.emetteur && p.emetteur.nom) || '') +
        fieldHTML({ k: 'numero', l: 'N° de police' }, a.numero || p.numero || '') +
        fieldHTML({ k: 'prime', l: 'Prime (DA)', t: 'number' }, a.prime ? String(a.prime).replace(',', '.') : '') +
        fieldHTML({ k: 'dateDebut', l: 'Début de couverture', t: 'date' }, String(a.dateDebut || p.date || '').slice(0, 10)) +
        fieldHTML({ k: 'dateFin', l: 'Fin de couverture', t: 'date' }, String(a.dateFin || p.echeance || '').slice(0, 10)) +
        fieldHTML({ k: 'statut', l: 'Statut', t: 'select', opts: ['active', 'à renouveler', 'expirée', 'résiliée'] }, 'active') +
        '<div class="full">' + fieldHTML({ k: 'couverture', l: 'Garanties / couverture' }, a.couverture || a.periodicite || '') + '</div>' +
        (assure ? '<div class="full o-help">Personne assurée détectée : ' + esc(assure) + '</div>' : '') +
        (p.objet ? '<div class="full o-help">Objet du document : ' + esc(p.objet) + '</div>' : '') +
      '</div>';
  }

  /* ---------------- VENTES & ACHATS DE PRODUITS ---------------- */
  function mvtLines(raw) {
    if (Array.isArray(raw)) return raw;
    try { var v = JSON.parse(raw || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }
  function isVenteMvt(m) { return String((m && m.type) || '').toLowerCase().indexOf('vente') === 0; }

  function renderVentesView() {
    var all = (S.data.mouvements || []).filter(isVenteMvt);
    var pole = S.poleFilter || '';
    var scoped = pole ? all.filter(function (m) { return (m.service || 'COMMUN') === pole; }) : all;
    var ym = new Date().toISOString().slice(0, 7);
    var mois = scoped.filter(function (m) { return String(m.date || '').slice(0, 7) === ym; });
    var ttcMois = mois.reduce(function (s, m) { return s + Number(m.totalTTC || 0); }, 0);
    var htMois = mois.reduce(function (s, m) { return s + Number(m.totalHT || 0); }, 0);
    var articles = mois.reduce(function (s, m) { return s + mvtLines(m.lignes).length; }, 0);
    var panier = mois.length ? ttcMois / mois.length : 0;
    var rows = scoped.slice().sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });

    var poleChips = '<button class="o-chip' + (!pole ? ' active' : '') + '" data-pole="">Tous les pôles <span>' + all.length + '</span></button>' +
      visiblePoles().map(function (p) {
        var n = all.filter(function (m) { return (m.service || 'COMMUN') === p.code; }).length;
        return '<button class="o-chip' + (pole === p.code ? ' active' : '') + '" data-pole="' + p.code + '" style="border-color:' + p.couleur + '55">' + esc(p.code) + ' — ' + esc(p.nom) + ' <span>' + n + '</span></button>';
      }).join('');

    var body = rows.length ? rows.map(function (m) {
      var n = mvtLines(m.lignes).length;
      return '<tr data-mvt-row="' + esc(m.id) + '">' +
        '<td>' + esc(dFr(m.date)) + '</td>' +
        '<td>' + poleBadge(m.service) + '</td>' +
        '<td><div class="cell-main">' + esc(m.tiers || refName('clients', m.clientId) || '—') + '</div><div class="cell-sub">' + n + ' article(s) · ' + esc(m.modePaiement || '—') + '</div></td>' +
        '<td class="num">' + money(m.totalHT) + '</td>' +
        '<td class="num">' + num(m.tva) + ' %</td>' +
        '<td class="num"><b>' + money(m.totalTTC) + '</b></td>' +
        '<td>' + badge(m.statut) + '</td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="7"><div class="o-empty"><div class="ico">◫</div>Aucune vente' + (pole ? ' pour ce pôle' : '') + '</div></td></tr>';

    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">Ventes de produits</h2><p class="o-view-sub">Ventes uniquement — le stock des articles vendus est mis à jour automatiquement</p></div>' +
        '<div class="o-actions"><button class="o-btn o-btn-purple" data-act="scan-vente">' + icon('scan') + ' Scanner un document (IA)</button><button class="o-btn o-btn-default" data-act="export">' + icon('download') + ' CSV</button><button class="o-btn o-btn-primary" data-act="create">' + icon('plus') + ' Nouvelle vente</button></div></div>' +

      '<div class="o-kpis o-kpis-4">' +
        '<div class="o-kpi green"><div class="lbl">Ventes du mois</div><div class="val">' + money(ttcMois) + '</div><div class="sub">' + mois.length + ' vente(s) TTC</div></div>' +
        '<div class="o-kpi teal"><div class="lbl">Ventes HT du mois</div><div class="val">' + money(htMois) + '</div><div class="sub">hors TVA</div></div>' +
        '<div class="o-kpi"><div class="lbl">Articles vendus</div><div class="val">' + articles + '</div><div class="sub">lignes de vente ce mois</div></div>' +
        '<div class="o-kpi"><div class="lbl">Panier moyen</div><div class="val">' + money(panier) + '</div><div class="sub">TTC par vente</div></div>' +
      '</div>' +

      '<div class="o-chips">' + poleChips + '</div>' +

      '<div class="o-panel"><div class="o-panel-head">Ventes <span class="o-badge purple">' + rows.length + '</span></div><div class="o-panel-body" style="padding:0">' +
        '<div class="o-table-scroll"><table class="o-list"><thead><tr><th>Date</th><th>Pôle</th><th>Client</th><th class="r">Total HT</th><th class="r">TVA</th><th class="r">Total TTC</th><th>Statut</th></tr></thead><tbody>' + body + '</tbody></table></div>' +
      '</div></div>' +
    '</div>';
  }

  function renderAchatsView() {
    var pole = S.poleFilter || '';
    var mvts = (S.data.mouvements || []).filter(function (m) { return !isVenteMvt(m); });
    var facs = S.data.factures_achat || [];
    var scopedMvt = pole ? mvts.filter(function (m) { return (m.service || 'COMMUN') === pole; }) : mvts;
    var scopedFac = pole ? facs.filter(function (f) { return (f.service || 'COMMUN') === pole; }) : facs;
    var ym = new Date().toISOString().slice(0, 7);
    var mois = scopedMvt.filter(function (m) { return String(m.date || '').slice(0, 7) === ym; });
    var ttcMois = mois.reduce(function (s, m) { return s + Number(m.totalTTC || 0); }, 0);
    var htMois = mois.reduce(function (s, m) { return s + Number(m.totalHT || 0); }, 0);
    var facTotal = scopedFac.reduce(function (s, f) { return s + Number(f.totalTTC || 0); }, 0);
    var facAPayer = scopedFac.filter(function (f) { return String(f.statut || '').toLowerCase() !== 'payée'; }).reduce(function (s, f) { return s + Number(f.totalTTC || 0); }, 0);
    var rows = scopedMvt.slice().sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    var facRows = scopedFac.slice().sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });

    var poleChips = '<button class="o-chip' + (!pole ? ' active' : '') + '" data-pole="">Tous les pôles <span>' + (mvts.length + facs.length) + '</span></button>' +
      visiblePoles().map(function (p) {
        var n = mvts.filter(function (m) { return (m.service || 'COMMUN') === p.code; }).length + facs.filter(function (f) { return (f.service || 'COMMUN') === p.code; }).length;
        return '<button class="o-chip' + (pole === p.code ? ' active' : '') + '" data-pole="' + p.code + '" style="border-color:' + p.couleur + '55">' + esc(p.code) + ' — ' + esc(p.nom) + ' <span>' + n + '</span></button>';
      }).join('');

    var body = rows.length ? rows.map(function (m) {
      var n = mvtLines(m.lignes).length;
      return '<tr data-mvt-row="' + esc(m.id) + '">' +
        '<td>' + esc(dFr(m.date)) + '</td>' +
        '<td>' + poleBadge(m.service) + '</td>' +
        '<td><div class="cell-main">' + esc(m.tiers || '—') + '</div><div class="cell-sub">' + n + ' article(s) · ' + esc(m.modePaiement || '—') + '</div></td>' +
        '<td class="num">' + money(m.totalHT) + '</td>' +
        '<td class="num">' + num(m.tva) + ' %</td>' +
        '<td class="num"><b>' + money(m.totalTTC) + '</b></td>' +
        '<td>' + badge(m.statut) + '</td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="7"><div class="o-empty">Aucun achat de produits' + (pole ? ' pour ce pôle' : '') + '</div></td></tr>';

    var facBody = facRows.length ? facRows.map(function (f) {
      return '<tr data-achat-row="' + esc(f.id) + '">' +
        '<td><span class="o-mono">' + esc(f.num || '—') + '</span></td>' +
        '<td><div class="cell-main">' + esc(f.fournisseur || '—') + '</div><div class="cell-sub">' + esc(f.objet || '') + '</div></td>' +
        '<td>' + poleBadge(f.service) + '</td>' +
        '<td>' + esc(dFr(f.date)) + '</td>' +
        '<td>' + esc(dFr(f.echeance)) + '</td>' +
        '<td class="num"><b>' + money(f.totalTTC) + '</b></td>' +
        '<td>' + badge(f.statut) + '</td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="7"><div class="o-empty">Aucune facture fournisseur' + (pole ? ' pour ce pôle' : '') + '</div></td></tr>';

    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">Achats</h2><p class="o-view-sub">Achats de produits et factures fournisseurs — séparés des ventes</p></div>' +
        '<div class="o-actions">' +
          '<button class="o-btn o-btn-purple" data-act="scan-achat">' + icon('scan') + ' Scanner un achat (IA)</button>' +
          '<button class="o-btn o-btn-default" data-act="export">' + icon('download') + ' CSV</button>' +
          '<button class="o-btn o-btn-default" data-act="create-achat-mvt">' + icon('plus') + ' Achat de produits</button>' +
          '<button class="o-btn o-btn-primary" data-act="create">' + icon('plus') + ' Facture fournisseur</button>' +
        '</div></div>' +

      '<div class="o-kpis o-kpis-4">' +
        '<div class="o-kpi amber"><div class="lbl">Achats produits du mois</div><div class="val">' + money(ttcMois) + '</div><div class="sub">' + mois.length + ' achat(s) TTC</div></div>' +
        '<div class="o-kpi"><div class="lbl">Achats produits HT</div><div class="val">' + money(htMois) + '</div><div class="sub">hors TVA ce mois</div></div>' +
        '<div class="o-kpi purple"><div class="lbl">Factures fournisseurs</div><div class="val">' + money(facTotal) + '</div><div class="sub">' + scopedFac.length + ' facture(s)</div></div>' +
        '<div class="o-kpi ' + (facAPayer > 0 ? 'red' : 'green') + '"><div class="lbl">Reste à payer</div><div class="val">' + money(facAPayer) + '</div><div class="sub">fournisseurs</div></div>' +
      '</div>' +

      '<div class="o-chips">' + poleChips + '</div>' +

      '<div class="o-panel" style="margin-bottom:14px"><div class="o-panel-head">Achats de produits <span class="o-badge purple">' + rows.length + '</span></div><div class="o-panel-body" style="padding:0">' +
        '<div class="o-table-scroll"><table class="o-list"><thead><tr><th>Date</th><th>Pôle</th><th>Fournisseur</th><th class="r">Total HT</th><th class="r">TVA</th><th class="r">Total TTC</th><th>Statut</th></tr></thead><tbody>' + body + '</tbody></table></div>' +
      '</div></div>' +

      '<div class="o-panel"><div class="o-panel-head">Factures fournisseurs <span class="o-badge purple">' + facRows.length + '</span></div><div class="o-panel-body" style="padding:0">' +
        '<div class="o-table-scroll"><table class="o-list"><thead><tr><th>N°</th><th>Fournisseur</th><th>Pôle</th><th>Date</th><th>Échéance</th><th class="r">Total TTC</th><th>Statut</th></tr></thead><tbody>' + facBody + '</tbody></table></div>' +
      '</div></div>' +
    '</div>';
  }

  function bindMouvements() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-pole]'), function (b) {
      b.onclick = function () { S.poleFilter = b.getAttribute('data-pole'); renderView(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#content tr[data-mvt-row]'), function (tr) {
      tr.onclick = function () { openForm('mouvements', tr.getAttribute('data-mvt-row')); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#content tr[data-achat-row]'), function (tr) {
      tr.onclick = function () { openForm('factures_achat', tr.getAttribute('data-achat-row')); };
    });
  }

  function mvtLineHTML(l, svc) {
    var stock = (S.data.stock || []).filter(function (s) { return !svc || (s.service || 'COMMUN') === svc; });
    return '<div class="o-line-row">' +
      '<div><select data-f="stockId"><option value="">— Choisir un article —</option>' +
        stock.map(function (s) {
          return '<option value="' + esc(s.id) + '"' + (String(s.id) === String(l.stockId || '') ? ' selected' : '') + '>' +
            esc(s.ref + ' — ' + s.nom) + ' (' + num(s.qty) + ' en stock)</option>';
        }).join('') +
      '</select></div>' +
      '<div><input data-f="qty" type="number" step="any" min="0" value="' + Number(l.qty || 0) + '"></div>' +
      '<div><input data-f="pu" type="number" step="any" min="0" value="' + Number(l.pu || 0) + '"></div>' +
      '<div class="o-line-total" data-total>0</div>' +
      '<div><button type="button" class="o-btn o-btn-danger o-btn-sm" data-rm style="height:24px;padding:0 7px">✕</button></div>' +
    '</div>';
  }

  function openMouvementForm(row, id) {
    row = row || {};
    var lignes = mvtLines(row.lignes);
    if (!lignes.length) lignes = [{ stockId: '', qty: 1, pu: 0 }];
    var isV = isVenteMvt(row) || (!id && row.type !== 'achat');
    var svc = row.service || (S.poleFilter || '') || 'COMMUN';

    var body =
      '<div class="o-form-grid">' +
        fieldHTML({ k: 'type', l: 'Type de mouvement', t: 'select', opts: ['vente', 'achat'], req: true }, row.type || (isV ? 'vente' : 'achat')) +
        fieldHTML({ k: 'service', l: 'Pôle / service', t: 'select', opts: POLE_OPTS, req: true }, svc) +
        fieldHTML({ k: 'date', l: 'Date', t: 'date' }, row.date ? String(row.date).slice(0, 10) : new Date().toISOString().slice(0, 10)) +
        fieldHTML({ k: 'clientId', l: 'Client (pour une vente)', t: 'rel', rel: 'clients' }, row.clientId || '') +
        fieldHTML({ k: 'tiers', l: 'Fournisseur (pour un achat)' }, row.tiers || '') +
        fieldHTML({ k: 'tva', l: 'TVA %', t: 'number' }, row.tva != null ? row.tva : 19) +
        fieldHTML({ k: 'modePaiement', l: 'Mode de paiement', t: 'select', opts: ['virement', 'chèque', 'espèces', 'traite'] }, row.modePaiement || '') +
        fieldHTML({ k: 'statut', l: 'Statut', t: 'select', opts: ['brouillon', 'confirmé', 'payé'] }, row.statut || 'confirmé') +
        '<div class="full">' + fieldHTML({ k: 'notes', l: 'Notes / objet' }, row.notes || '') + '</div>' +
      '</div>' +
      '<div style="margin-top:14px"><label style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b">Articles</label>' +
        '<div class="o-lines"><div class="o-lines-head"><div>Article (stock)</div><div>Qté</div><div>P.U. HT</div><div>Total</div><div></div></div><div id="mv-lines">' +
          lignes.map(function (l) { return mvtLineHTML(l, svc); }).join('') +
        '</div><div class="o-totals" id="mv-totals"></div></div>' +
        '<button class="o-btn o-btn-default o-btn-sm" id="mv-add" style="margin-top:8px">+ Ajouter un article</button>' +
        '<div class="o-help" style="margin-top:8px">Une <b>vente</b> retire les quantités du stock, un <b>achat</b> les ajoute. Seuls les articles du pôle sélectionné sont proposés ; le contrôle de stock se fait à l\'enregistrement.</div>' +
      '</div>';

    openModal((id ? 'Mouvement · ' + (row.tiers || '') : 'Nouveau mouvement de produits'), body, async function (data) {
      var lines = [];
      Array.prototype.forEach.call(document.querySelectorAll('#mv-lines .o-line-row'), function (r) {
        var stockId = r.querySelector('[data-f="stockId"]').value;
        if (!stockId) return;
        lines.push({
          stockId: stockId,
          qty: Number(r.querySelector('[data-f="qty"]').value || 0),
          pu: Number(r.querySelector('[data-f="pu"]').value || 0),
        });
      });
      if (!lines.length) { toast('Ajoutez au moins un article', 'err'); return; }
      data.lignes = lines;
      var ht = lines.reduce(function (s, l) { return s + l.qty * l.pu; }, 0);
      var tva = Number(data.tva || 19);
      data.totalHT = Math.round(ht * 100) / 100;
      data.totalTTC = Math.round(ht * (1 + tva / 100) * 100) / 100;
      try {
        if (id) await api('/api/mouvements/' + id, { method: 'PUT', body: data });
        else await api('/api/mouvements', { method: 'POST', body: data });
        closeModal();
        toast(id ? 'Mouvement modifié — stock à jour' : 'Mouvement enregistré — stock à jour', 'ok');
        renderView();
      } catch (e) { toast(e.message, 'err'); }
    }, id ? 'Enregistrer' : 'Créer le mouvement');

    if (id) {
      var foot = document.querySelector('#modal-root .o-modal-foot');
      var delBtn = document.createElement('button');
      delBtn.className = 'o-btn o-btn-danger';
      delBtn.textContent = 'Supprimer';
      delBtn.onclick = async function () {
        if (!confirm('Supprimer ce mouvement ? Le stock sera réajusté.')) return;
        try {
          await api('/api/mouvements/' + id, { method: 'DELETE' });
          closeModal();
          toast('Mouvement supprimé — stock réajusté', 'ok');
          renderView();
        } catch (err) { toast(err.message, 'err'); }
      };
      foot.insertBefore(delBtn, foot.firstChild);
    }

    document.getElementById('mv-add').onclick = function () {
      document.getElementById('mv-lines').insertAdjacentHTML('beforeend', mvtLineHTML({ stockId: '', qty: 1, pu: 0 }, svc));
      bindMvtLines();
      recalcMvt();
    };
    var svcSel = document.querySelector('.o-modal [name="service"]');
    if (svcSel) svcSel.onchange = function () {
      svc = svcSel.value;
      document.getElementById('mv-lines').innerHTML = mvtLineHTML({ stockId: '', qty: 1, pu: 0 }, svc);
      bindMvtLines();
      recalcMvt();
    };
    bindMvtLines();
    recalcMvt();
  }

  function bindMvtLines() {
    Array.prototype.forEach.call(document.querySelectorAll('#mv-lines [data-rm]'), function (b) {
      b.onclick = function () { b.closest('.o-line-row').remove(); recalcMvt(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#mv-lines input'), function (i) {
      i.oninput = recalcMvt;
    });
    Array.prototype.forEach.call(document.querySelectorAll('#mv-lines select'), function (sel) {
      sel.onchange = function () {
        var s = null;
        (S.data.stock || []).forEach(function (x) { if (x.id === sel.value) s = x; });
        var row = sel.closest('.o-line-row');
        if (s) {
          row.querySelector('[data-f="pu"]').value = Number(s.prix || 0);
          if (!Number(row.querySelector('[data-f="qty"]').value)) row.querySelector('[data-f="qty"]').value = 1;
        }
        recalcMvt();
      };
    });
  }

  function recalcMvt() {
    var ht = 0;
    Array.prototype.forEach.call(document.querySelectorAll('#mv-lines .o-line-row'), function (r) {
      var q = Number(r.querySelector('[data-f="qty"]').value || 0);
      var p = Number(r.querySelector('[data-f="pu"]').value || 0);
      var t = q * p;
      ht += t;
      r.querySelector('[data-total]').textContent = money(t);
    });
    var tvaEl = document.querySelector('.o-modal [name="tva"]');
    var tva = Number(tvaEl ? tvaEl.value : 19) || 0;
    var ttc = ht * (1 + tva / 100);
    var tot = document.getElementById('mv-totals');
    if (!tot) return;
    tot.innerHTML =
      '<div><span>Total HT</span><b>' + money(ht) + '</b></div>' +
      '<div><span>TVA ' + tva + '%</span><b>' + money(ttc - ht) + '</b></div>' +
      '<div class="grand"><span>Total TTC</span><b>' + money(ttc) + '</b></div>';
    if (tvaEl) tvaEl.oninput = recalcMvt;
  }

  /* ---------------- PLANNING HEBDOMADAIRE ---------------- */
  async function renderPlanningView() {
    var url = '/api/planning' + (S.weekStart ? '?start=' + encodeURIComponent(S.weekStart) : '');
    var d = await api(url);
    S.weekStart = d.start;
    var total = d.days.reduce(function (s, day) { return s + day.items.length; }, 0);
    var kindLabel = { mission: 'Mission', controle: 'Contrôle', facturation: 'Facturation' };
    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">Planning des missions</h2><p class="o-view-sub">Semaine du ' + esc(dFr(d.start)) + ' · ' + total + ' événement' + (total > 1 ? 's' : '') + '</p></div>' +
        '<div class="o-actions">' +
          '<button class="o-btn o-btn-default o-btn-sm" data-week="-7">‹ Semaine</button>' +
          '<button class="o-btn o-btn-default o-btn-sm" data-week="0">Aujourd\'hui</button>' +
          '<button class="o-btn o-btn-default o-btn-sm" data-week="7">Semaine ›</button>' +
        '</div></div>' +
      '<div class="o-week">' +
        d.days.map(function (day) {
          return '<div class="o-week-day">' +
            '<header><b>' + esc(day.label) + '</b><span class="count">' + day.items.length + '</span></header>' +
            '<div class="o-week-body">' +
              (day.items.length ? day.items.map(function (it) {
                return '<button class="o-week-item ' + esc(it.kind) + '" data-plan-kind="' + esc(it.kind) + '" data-plan-id="' + esc(it.id) + '">' +
                  '<span class="tag">' + esc(kindLabel[it.kind] || it.kind) + '</span>' +
                  '<b>' + esc(it.title || '—') + '</b>' +
                  (it.client ? '<small>' + esc(it.client) + (it.tech ? ' · ' + esc(it.tech) : '') + '</small>' : '') +
                  (it.lieu ? '<small>' + esc(it.lieu) + '</small>' : '') +
                  (it.status ? '<span class="st">' + esc(it.status) + '</span>' : '') +
                '</button>';
              }).join('') : '<div class="o-week-empty">—</div>') +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
      '<div class="o-legend"><span><i class="dot mission"></i> Mission</span><span><i class="dot controle"></i> Contrôle incendie</span><span><i class="dot facturation"></i> Facturation contrat</span></div>' +
    '</div>';
  }

  function bindPlanning() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-week]'), function (b) {
      b.onclick = function () {
        var delta = Number(b.getAttribute('data-week'));
        if (!delta) { S.weekStart = ''; renderView(); return; }
        var d = new Date((S.weekStart || new Date().toISOString().slice(0, 10)) + 'T00:00:00');
        d.setDate(d.getDate() + delta);
        S.weekStart = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
        renderView();
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-plan-kind]'), function (b) {
      b.onclick = function () {
        var kind = b.getAttribute('data-plan-kind');
        var id = b.getAttribute('data-plan-id');
        if (kind === 'mission') openForm('interventions', id);
        else if (kind === 'controle') openForm('maintenance', id);
        else navigate('contrats');
      };
    });
  }

  /* ---------------- RAPPORTS ---------------- */
  async function renderRapportsView() {
    var r = await api('/api/reports');
    var maxM = Math.max.apply(null, r.months.map(function (m) { return Math.max(m.facture, m.encaisse); }).concat([1]));
    var bars = r.months.map(function (m) {
      return '<div class="o-bar-col">' +
        '<div class="o-bar-wrap">' +
          '<div class="o-bar fact" style="height:' + Math.round((m.facture / maxM) * 100) + '%" title="Facturé ' + money(m.facture) + '"></div>' +
          '<div class="o-bar enc" style="height:' + Math.round((m.encaisse / maxM) * 100) + '%" title="Encaissé ' + money(m.encaisse) + '"></div>' +
        '</div>' +
        '<span class="o-bar-lbl">' + esc(m.label) + '</span>' +
      '</div>';
    }).join('');

    var top = r.topClients.length ? r.topClients.map(function (c) {
      return '<tr><td><div class="cell-main">' + esc(c.client) + '</div><div class="cell-sub">' + c.factures + ' facture(s)</div></td>' +
        '<td class="r"><span class="num">' + money(c.ca) + '</span></td>' +
        '<td class="r"><span class="num">' + money(c.encaisse) + '</span></td>' +
        '<td style="width:30%"><div class="o-progress"><i style="width:' + (c.ca ? Math.round((c.encaisse / c.ca) * 100) : 0) + '%"></i></div></td></tr>';
    }).join('') : '<tr><td colspan="4"><div class="o-empty">Aucune facture</div></td></tr>';

    var impayes = r.impayes.length ? r.impayes.slice(0, 6).map(function (f) {
      return '<tr><td><span class="o-mono">' + esc(f.num) + '</span></td><td>' + esc(f.client) + '</td>' +
        '<td class="r"><span class="num">' + money(f.reste) + '</span></td>' +
        '<td>' + esc(dFr(f.due)) + '</td>' +
        '<td><button class="o-btn o-btn-default o-btn-sm" data-pay-facture="' + esc(f.id) + '">Encaisser</button></td></tr>';
    }).join('') : '<tr><td colspan="5"><div class="o-empty">Aucun impayé — bravo !</div></td></tr>';

    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">Rapports & Pilotage</h2><p class="o-view-sub">Analyse commerciale, conformité du parc et trésorerie</p></div>' +
        '<div class="o-actions"><button class="o-btn o-btn-purple o-btn-sm" data-act="ai-analyse">' + icon('sparkles') + ' Analyse IA</button><button class="o-btn o-btn-default o-btn-sm" data-act="view-reports-refresh">' + icon('refresh') + ' Actualiser</button></div></div>' +

      '<div id="ai-analyse"></div>' +

      '<div class="o-kpis">' +
        '<div class="o-kpi"><div class="lbl">CA facturé</div><div class="val">' + money(r.caFacture) + '</div><div class="sub">' + r.months[r.months.length - 1].count + ' facture(s) ce mois</div></div>' +
        '<div class="o-kpi"><div class="lbl">CA encaissé</div><div class="val green">' + money(r.caEncaisse) + '</div><div class="sub">' + (r.caFacture ? Math.round((r.caEncaisse / r.caFacture) * 100) : 0) + '% du facturé</div></div>' +
        '<div class="o-kpi"><div class="lbl">Solde à recouvrer</div><div class="val ' + (r.soldeDu > 0 ? 'red' : '') + '">' + money(r.soldeDu) + '</div><div class="sub">' + r.impayes.length + ' facture(s) ouverte(s)</div></div>' +
        '<div class="o-kpi"><div class="lbl">Marge brute estimée</div><div class="val">' + money(r.margeBrute) + '</div><div class="sub">CA − achats fournisseurs</div></div>' +
        '<div class="o-kpi ' + (r.resultatEstime < 0 ? 'red' : 'green') + '"><div class="lbl">Résultat estimé</div><div class="val ' + (r.resultatEstime < 0 ? 'red' : '') + '">' + money(r.resultatEstime || 0) + '</div><div class="sub">marge − dépenses − salaires</div></div>' +
      '</div>' +

      '<div class="o-panel" style="margin-bottom:14px"><div class="o-panel-head">Résultat par pôle / service <span class="o-badge purple">' + (r.parService || []).length + '</span></div><div class="o-panel-body" style="padding:0">' +
        '<div class="o-table-scroll"><table class="o-list"><thead><tr><th>Pôle</th><th class="r">Ventes produits HT</th><th class="r">Achats produits HT</th><th class="r">Marge</th><th class="r">CA facturé</th><th class="r">Encaissé</th><th class="r">Stock</th><th class="r">Critiques</th></tr></thead><tbody>' +
          ((r.parService || []).map(function (s) {
            return '<tr><td>' + poleBadge(s.code) + ' <span style="font-size:12px;color:var(--o-muted)">' + esc(s.nom) + '</span></td>' +
              '<td class="num">' + money(s.ventesHT) + '</td>' +
              '<td class="num">' + money(s.achatsHT) + '</td>' +
              '<td class="num"><b class="' + (s.marge < 0 ? 'red' : 'green') + '">' + money(s.marge) + '</b></td>' +
              '<td class="num">' + money(s.caFacture) + '</td>' +
              '<td class="num">' + money(s.caEncaisse) + '</td>' +
              '<td class="num">' + money(s.stockValeur) + '</td>' +
              '<td class="num">' + s.stockCritique + '</td></tr>';
          }).join('') || '<tr><td colspan="8"><div class="o-empty">Aucun pôle</div></td></tr>') +
        '</tbody></table></div>' +
      '</div></div>' +

      '<div class="o-report-grid">' +
        '<div class="o-panel"><div class="o-panel-head">Évolution du chiffre d\'affaires <span class="o-badge gray">6 mois</span></div><div class="o-panel-body">' +
          '<div class="o-bars">' + bars + '</div>' +
          '<div class="o-legend"><span><i class="dot fact"></i> Facturé</span><span><i class="dot enc"></i> Encaissé</span></div>' +
        '</div></div>' +
        '<div class="o-panel"><div class="o-panel-head">Performance commerciale</div><div class="o-panel-body">' +
          '<div class="o-gauge"><div class="o-gauge-val">' + r.conversion + '%</div><div class="o-gauge-lbl">Taux de conversion devis → accepté</div>' +
            '<div class="o-progress" style="margin-top:10px"><i style="width:' + r.conversion + '%"></i></div></div>' +
          '<div class="o-report-lines">' +
            '<div><span>Devis acceptés</span><b>' + r.devisAcceptes + ' / ' + r.devisCount + '</b></div>' +
            '<div><span>Pipeline en cours</span><b>' + money(r.pipeline) + '</b></div>' +
            '<div><span>Contrats actifs</span><b>' + r.contrats.actifs + ' / ' + r.contrats.total + '</b></div>' +
            '<div><span>À renouveler (60 j)</span><b>' + r.contrats.aRenouveler + '</b></div>' +
            '<div><span>Missions terminées</span><b>' + r.missions.terminees + ' / ' + r.missions.total + '</b></div>' +
            '<div><span>Maintenance en retard</span><b class="' + (r.missions.maintenanceEnRetard ? 'red' : '') + '">' + r.missions.maintenanceEnRetard + '</b></div>' +
            '<div><span>Dépenses du mois</span><b class="' + ((r.depenses && r.depenses.mois) ? 'red' : '') + '">' + money(r.depenses ? r.depenses.mois : 0) + '</b></div>' +
            '<div><span>Masse salariale (pointages)</span><b>' + money(r.masseSalariale || 0) + '</b></div>' +
            (r.caisse ? '<div><span>Solde de caisse</span><b>' + money(r.caisse.solde) + '</b></div>' +
              '<div><span>Avances versées</span><b>' + money(r.caisse.avances) + '</b></div>' : '') +
          '</div>' +
        '</div></div>' +
      '</div>' +

      '<div class="o-report-grid">' +
        '<div class="o-panel"><div class="o-panel-head">Meilleurs clients</div><div class="o-panel-body" style="padding:0">' +
          '<div class="o-table-scroll"><table class="o-list"><thead><tr><th>Client</th><th class="r">CA</th><th class="r">Encaissé</th><th>Recouvrement</th></tr></thead><tbody>' + top + '</tbody></table></div>' +
        '</div></div>' +
        '<div class="o-panel"><div class="o-panel-head">Conformité & opérations</div><div class="o-panel-body">' +
          '<div class="o-compliance">' +
            '<div class="ring" style="--p:' + r.parc.conformite + '"><span>' + r.parc.conformite + '%</span></div>' +
            '<div class="o-report-lines" style="flex:1">' +
              '<div><span>Équipements suivis</span><b>' + r.parc.total + '</b></div>' +
              '<div><span>Contrôles en retard</span><b class="' + (r.parc.controlesRetard ? 'red' : '') + '">' + r.parc.controlesRetard + '</b></div>' +
              '<div><span>Contrôles sous 30 j</span><b>' + r.parc.controlesProches + '</b></div>' +
              '<div><span>Hors service</span><b class="' + (r.parc.horsService ? 'red' : '') + '">' + r.parc.horsService + '</b></div>' +
              '<div><span>Valeur du stock</span><b>' + money(r.stock.valeur) + '</b></div>' +
              '<div><span>Références critiques</span><b class="' + (r.stock.critique ? 'red' : '') + '">' + r.stock.critique + '</b></div>' +
            '</div>' +
          '</div>' +
        '</div></div>' +
      '</div>' +

      '<div class="o-report-grid">' +
        '<div class="o-panel"><div class="o-panel-head">Balance âgée des créances</div><div class="o-panel-body" style="padding:0">' +
          '<div class="o-table-scroll"><table class="o-list"><thead><tr><th>Antériorité</th><th class="r">Montant dû</th><th class="r">Factures</th></tr></thead><tbody>' +
            (r.aging || []).map(function (b) {
              return '<tr><td>' + esc(b.label) + '</td><td class="num ' + (b.key === 'plus90' && b.montant > 0 ? 'red' : '') + '">' + money(b.montant) + '</td><td class="num">' + b.count + '</td></tr>';
            }).join('') +
          '</tbody></table></div>' +
        '</div></div>' +
        '<div class="o-panel"><div class="o-panel-head">Compte de résultat — mois en cours</div><div class="o-panel-body">' +
          '<div class="o-report-lines">' +
            '<div><span>Chiffre d\'affaires facturé</span><b>' + money(r.pl ? r.pl.ca : 0) + '</b></div>' +
            '<div><span>Achats fournisseurs</span><b class="red">−' + money(r.pl ? r.pl.achats : 0) + '</b></div>' +
            '<div><span>Dépenses d\'exploitation</span><b class="red">−' + money(r.pl ? r.pl.depenses : 0) + '</b></div>' +
            '<div><span>Masse salariale</span><b class="red">−' + money(r.pl ? r.pl.salaires : 0) + '</b></div>' +
            '<div style="border-top:1px solid var(--o-line);margin-top:6px;padding-top:6px"><span><b>Résultat du mois</b></span><b class="' + ((r.pl && r.pl.resultat < 0) ? 'red' : 'green') + '">' + money(r.pl ? r.pl.resultat : 0) + '</b></div>' +
          '</div>' +
        '</div></div>' +
      '</div>' +

      '<div class="o-panel"><div class="o-panel-head">Factures à recouvrer <span class="o-badge red">' + r.impayes.length + '</span></div><div class="o-panel-body" style="padding:0">' +
        '<div class="o-table-scroll"><table class="o-list"><thead><tr><th>N°</th><th>Client</th><th class="r">Reste dû</th><th>Échéance</th><th></th></tr></thead><tbody>' + impayes + '</tbody></table></div>' +
      '</div></div>' +
    '</div>';
  }

  function bindRapports() {
    var b = document.querySelector('[data-act="view-reports-refresh"]');
    if (b) b.onclick = function () { renderView(); };
  }

  /* ---------------- ANALYSE IA DE GESTION (RAPPORTS) ---------------- */
  async function runAiAnalyse() {
    var box = document.getElementById('ai-analyse');
    if (!box) return;
    box.innerHTML = '<div class="o-panel" style="margin-bottom:14px"><div class="o-panel-body"><div class="o-scanline"></div><b>Analyse IA de la gestion en cours… (10 à 30 s)</b><div class="o-help">Lecture des ventes, achats, stock, impayés, dépenses et contrats.</div></div></div>';
    try {
      var r = await api('/api/ai/analyse', { method: 'POST', body: {} });
      renderAiAnalyse(r);
    } catch (e) {
      box.innerHTML = '<div class="o-alert red" style="margin-bottom:14px"><b>Analyse IA indisponible</b><div>' + esc(e.message) + '</div></div>';
    }
  }

  function renderAiAnalyse(r) {
    var box = document.getElementById('ai-analyse');
    if (!box) return;
    var d = r.data || {};
    var block = function (titre, arr, tone, ico) {
      if (!arr || !arr.length) return '';
      return '<div style="margin-top:12px"><div style="display:flex;align-items:center;gap:7px;font-weight:700;font-size:12.5px;color:var(--o-text-strong)">' + icon(ico) + ' ' + esc(titre) + '</div>' +
        '<ul style="margin:6px 0 0 18px;padding:0;font-size:12.5px;line-height:1.6">' +
          arr.map(function (x) { return '<li class="' + tone + '">' + esc(x) + '</li>'; }).join('') +
        '</ul></div>';
    };
    box.innerHTML = '<div class="o-panel" style="margin-bottom:14px"><div class="o-panel-head" style="display:flex;align-items:center;gap:8px">' + icon('sparkles') + ' Analyse IA de la gestion <span class="o-badge purple">' + esc(r.mois || '') + '</span><span class="o-help" style="margin-left:auto">' + esc(r.model || '') + ' · ' + esc(dtFr(r.genere)) + '</span></div><div class="o-panel-body">' +
      '<p style="font-size:13px;line-height:1.65;margin:0">' + esc(d.resume || '') + '</p>' +
      block('Points forts', d.pointsForts, 'green', 'check') +
      block('Alertes', d.alertes, 'red', 'alert') +
      block('Actions prioritaires', d.actions, '', 'activity') +
      '<div class="o-help" style="margin-top:12px">Analyse générée automatiquement à partir des données de l\'ERP — à valider par la direction avant décision.</div>' +
    '</div></div>';
  }

  /* ---------------- RELEVÉ DE COMPTE CLIENT ---------------- */
  function openRelevePicker() {
    var clients = S.refs.clients || [];
    if (!clients.length) { toast('Aucun client enregistré', 'err'); return; }
    var body = '<div class="o-field"><label>Client</label><select class="o-select" name="clientId">' +
      clients.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join('') +
      '</select></div><div class="o-help" style="margin-top:8px">Le relevé récapitule les factures, les encaissements et la balance âgée du client. Il s\'ouvre prêt à imprimer.</div>';
    openModal('Relevé de compte client', body, function (data) {
      closeModal();
      window.open('/api/clients/' + encodeURIComponent(data.clientId) + '/releve?token=' + encodeURIComponent(token()), '_blank');
    }, 'Générer le relevé');
  }

  /* ---------------- MON COMPTE / MOT DE PASSE ---------------- */
  function openAccountModal() {
    if (!S.user) return;
    var body =
      '<div class="o-form-grid">' +
        '<div class="o-field"><label>Nom</label><input class="o-input" value="' + esc(S.user.name || '') + '" disabled></div>' +
        '<div class="o-field"><label>Rôle</label><input class="o-input" value="' + esc(S.user.role || '') + '" disabled></div>' +
        '<div class="o-field full"><label>Email</label><input class="o-input" value="' + esc(S.user.email || '') + '" disabled></div>' +
      '</div>' +
      '<div style="margin-top:16px;border-top:1px solid var(--o-line);padding-top:12px">' +
        '<b style="font-size:12.5px">Changer mon mot de passe</b>' +
        '<div class="o-form-grid" style="margin-top:8px">' +
          fieldHTML({ k: 'current', l: 'Mot de passe actuel', t: 'password' }) +
          fieldHTML({ k: 'next', l: 'Nouveau mot de passe (8 car. min.)', t: 'password' }) +
          fieldHTML({ k: 'confirm', l: 'Confirmer le nouveau', t: 'password' }) +
        '</div>' +
        '<div class="o-help" style="margin-top:6px">Modifier le mot de passe déconnecte vos autres sessions.</div>' +
      '</div>';
    openModal('Mon compte', body, async function (data) {
      if (!data.next || String(data.next).length < 8) { toast('8 caractères minimum', 'err'); return; }
      if (data.next !== data.confirm) { toast('Les deux mots de passe ne correspondent pas', 'err'); return; }
      try {
        await api('/api/auth/password', { method: 'POST', body: { current: data.current, next: data.next } });
        closeModal();
        toast('Mot de passe mis à jour', 'ok');
      } catch (e) { toast(e.message, 'err'); }
    }, 'Mettre à jour');
  }

  /* ---------------- PARAMÈTRES & SYSTÈME ---------------- */
  function bytes(n) {
    n = Number(n || 0);
    if (n > 1048576) return (n / 1048576).toFixed(1) + ' Mo';
    if (n > 1024) return (n / 1024).toFixed(0) + ' Ko';
    return n + ' o';
  }
  function uptime(sec) {
    sec = Number(sec || 0);
    var j = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60);
    if (j) return j + ' j ' + h + ' h';
    if (h) return h + ' h ' + m + ' min';
    return m + ' min';
  }
  async function renderParametresView() {
    var s, users;
    try {
      var res = await Promise.all([api('/api/settings'), api('/api/users').catch(function () { return []; })]);
      s = res[0]; users = res[1] || [];
    }
    catch (e) {
      return '<div class="o-sheet"><div class="o-view-head"><div><h2 class="o-view-title">Paramètres</h2></div></div><div class="o-alert red">' + esc(e.message) + '</div></div>';
    }
    var co = s.company || {};
    var line = function (k, v) { return '<div><span>' + esc(k) + '</span><b>' + esc(v == null || v === '' ? '—' : v) + '</b></div>'; };
    var polesLabel = function (u) {
      if (String(u.role || '').toLowerCase() === 'admin') return 'Tous les pôles';
      if (u.services) { try { var a = JSON.parse(u.services); if (Array.isArray(a) && a.length) return a.join(', '); } catch (e) {} }
      return 'Tous les pôles';
    };
    var modsLabel = function (u) {
      if (String(u.role || '').toLowerCase() === 'admin') return 'Tous les modules';
      if (u.perms) { try { var a = JSON.parse(u.perms); if (Array.isArray(a) && a.length) return a.length + ' module(s) autorisé(s)'; } catch (e) {} }
      return 'Selon le rôle';
    };
    var userRows = users.length ? users.map(function (u) {
      var actif = Number(u.active) !== 0;
      return '<tr>' +
        '<td><div class="cell-main">' + esc(u.name) + '</div><div class="cell-sub">' + esc(u.email) + '</div></td>' +
        '<td>' + badge(u.role) + '</td>' +
        '<td>' + (actif ? '<span class="o-badge green">actif</span>' : '<span class="o-badge red">désactivé</span>') + '</td>' +
        '<td>' + esc(polesLabel(u)) + '</td>' +
        '<td>' + esc(modsLabel(u)) + '</td>' +
        '<td style="text-align:right"><button class="o-btn o-btn-default o-btn-sm" data-act="edit-user" data-id="' + esc(u.id) + '">' + icon('key') + ' Accès & droits</button></td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="6"><div class="o-empty">Aucun compte</div></td></tr>';
    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">Paramètres & administration</h2><p class="o-view-sub">Identité de la société, système, sauvegardes et sécurité</p></div>' +
        '<div class="o-actions">' +
          '<button class="o-btn o-btn-default" data-act="account">' + icon('key') + ' Mon compte</button>' +
          '<button class="o-btn o-btn-default" data-act="dossier">' + icon('file') + ' Dossier entreprise</button>' +
          '<button class="o-btn o-btn-primary" data-act="backup">' + icon('download') + ' Sauvegarder la base</button>' +
        '</div></div>' +

      '<div class="o-report-grid">' +
        '<div class="o-panel"><div class="o-panel-head">Identité de la société</div><div class="o-panel-body">' +
          '<div class="o-report-lines">' +
            line('Raison sociale', co.name) + line('Adresse', co.address) +
            line('RC', co.rc) + line('NIF', co.nif) + line('AI', co.ai) + line('NIS', co.nis) + line('TIN', co.tin) +
            line('Téléphone', co.phone) + line('Email', co.email) +
            line('Monnaie / TVA', (co.currency || 'DA') + ' · ' + (co.vat || 19) + ' %') +
          '</div>' +
          '<div class="o-help" style="margin-top:10px">Ces informations figurent sur les devis, factures, attestations et relevés. Elles se modifient dans <b>config.json</b> (côté serveur).</div>' +
        '</div></div>' +
        '<div class="o-panel"><div class="o-panel-head">Système</div><div class="o-panel-body">' +
          '<div class="o-report-lines">' +
            line('Version applicative', s.version) + line('Node.js', s.node) + line('Base SQLite', bytes(s.dbSize)) +
            line('Sessions actives', s.sessions) + line('Démarré depuis', uptime(s.uptime)) +
            line('Intelligence artificielle', s.ai && s.ai.configured ? 'opérationnelle · ' + (s.ai.model || '') : 'non configurée') +
            line('Mode démonstration', s.demoMode ? 'activé (identifiants affichés)' : 'désactivé') +
          '</div>' +
        '</div></div>' +
      '</div>' +

      '<div class="o-panel" style="margin-top:14px"><div class="o-panel-head" style="display:flex;align-items:center;gap:10px"><span>Comptes & accès à l\'application <span class="o-badge purple">' + users.length + '</span></span><button class="o-btn o-btn-primary o-btn-sm" style="margin-left:auto" data-act="new-user">' + icon('plus') + ' Ajouter un employé</button></div><div class="o-panel-body" style="padding:0">' +
        '<div class="o-table-scroll"><table class="o-list"><thead><tr><th>Employé</th><th>Rôle</th><th>Statut</th><th>Pôles autorisés</th><th>Modules</th><th></th></tr></thead><tbody>' + userRows + '</tbody></table></div>' +
        '<div class="o-help" style="padding:10px 14px">Ajoutez un compte avec un email et un mot de passe (8 caractères minimum), activez ou désactivez son accès, puis cochez ses modules et ses pôles dans « Accès & droits ». Un compte désactivé ne peut plus se connecter.</div>' +
      '</div></div>' +

      '<div class="o-panel" style="margin-top:14px"><div class="o-panel-head">Données de l\'ERP</div><div class="o-panel-body" style="padding:0">' +
        '<div class="o-table-scroll"><table class="o-list"><thead><tr><th>Clients</th><th>Devis</th><th>Factures</th><th>Achats</th><th>Contrats</th><th>Équipements</th><th>Stock</th><th>Comptes</th><th>Journal</th></tr></thead><tbody><tr>' +
          '<td>' + s.counts.clients + '</td><td>' + s.counts.devis + '</td><td>' + s.counts.factures + '</td><td>' + s.counts.achats + '</td>' +
          '<td>' + s.counts.contrats + '</td><td>' + s.counts.equipements + '</td><td>' + s.counts.stock + '</td><td>' + s.counts.users + '</td><td>' + s.counts.audit + '</td>' +
        '</tr></tbody></table></div>' +
      '</div></div>' +

      '<div class="o-alert" style="margin-top:14px">' +
        '<b>Bonnes pratiques :</b> sauvegardez la base chaque jour (le fichier <code>data/ass.db</code> peut être copié à chaud), ' +
        'activez HTTPS derrière un reverse proxy, et désactivez le mode démonstration avant la mise en production.' +
      '</div>' +
    '</div>';
  }

  /* ---------------- JOURNAL D'ACTIVITÉ (audit paginé) ---------------- */
  async function renderActiviteView() {
    var q = S.auditQ ? '&q=' + encodeURIComponent(S.auditQ) : '';
    var d = await api('/api/audit?limit=200' + q);
    var rows = d.rows || [];
    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">Journal d\'activité</h2>' +
      '<p class="o-view-sub">Traçabilité des actions — ' + d.total + ' événement(s)' + (isAdminUser() ? ' · tous les utilisateurs' : ' · vos actions') + '</p></div>' +
      '<div class="o-actions"><button class="o-btn o-btn-default" data-act="export">' + icon('download') + ' CSV</button>' +
      '<button class="o-btn o-btn-default" data-act="refresh">' + icon('refresh') + ' Actualiser</button></div></div>' +
      '<div class="o-panel"><div class="o-panel-head">' + icon('activity') + ' Événements <span class="o-badge gray">' + rows.length + ' affiché(s)</span></div>' +
      '<div class="o-panel-body"><div class="o-activity">' +
        (rows.length ? rows.map(function (a) {
          return '<div class="o-activity-item"><div class="o-activity-dot"></div><div><div class="txt">' + esc(a.action) + '</div>' +
            '<div class="when">' + esc(a.user) + ' · ' + dtFr(a.ts) + '</div></div></div>';
        }).join('') : '<div class="o-empty">Aucune activité enregistrée</div>') +
      '</div></div></div>' +
    '</div>';
  }

  /* ---------------- RENDER VIEW ---------------- */
  async function renderView() {
    var content = document.getElementById('content');
    var col = colOf(S.module);

    if (S.module === 'apps') {
      content.innerHTML = renderApps();
      bindApps();
      return;
    }

    if (S.module === 'dashboard') {
      content.innerHTML = '<div class="o-sheet"><div class="o-skeleton" style="height:90px;margin-bottom:14px"></div><div class="o-skeleton" style="height:320px"></div></div>';
      try {
        var dashJobs = [api('/api/dashboard')];
        if (canOpen('planning')) {
          var planUrl = '/api/planning?days=35' + (S.weekStart ? '&start=' + encodeURIComponent(S.weekStart) : '');
          dashJobs.push(api(planUrl).catch(function () { return null; }));
        }
        var dashData = await Promise.all(dashJobs);
        content.innerHTML = renderDashboard(dashData[0], dashData[1]);
        bindDashboard(dashData[0], dashData[1]);
      } catch (e) {
        content.innerHTML = '<div class="o-sheet"><div class="o-alert red">' + esc(e.message) + '</div></div>';
      }
      return;
    }

    content.innerHTML = '<div class="o-sheet"><div class="o-skeleton" style="height:44px;margin-bottom:12px"></div><div class="o-skeleton" style="height:300px"></div></div>';
    try {
      if (S.module === 'pointage') {
        content.innerHTML = await renderPointageView();
        bindPointage();
        return;
      }
      if (S.module === 'caisse') {
        await loadCol('caisse');
        try { S.data.salaires = (await api('/api/pointages/salaires?mois=' + encodeURIComponent(new Date().toISOString().slice(0, 7)))).salaires || []; }
        catch (e) { S.data.salaires = []; }
        content.innerHTML = await renderCaisseView();
        bindCaisse();
        return;
      }
      if (S.module === 'contrats') {
        content.innerHTML = await renderContratsView();
        bindContrats();
        return;
      }
      if (S.module === 'users') {
        await Promise.all([loadCol('users'), loadCol('assurances')]);
        var moisPaie = S.paieMois || new Date().toISOString().slice(0, 7);
        try { S.data.salaires = (await api('/api/pointages/salaires?mois=' + encodeURIComponent(moisPaie))).salaires || []; }
        catch (e) { S.data.salaires = []; }
        content.innerHTML = renderEmployesView();
        bindEmployes();
        return;
      }
      if (S.module === 'ventes') {
        await Promise.all([loadCol('mouvements'), loadCol('stock')]);
        content.innerHTML = renderVentesView();
        bindMouvements();
        return;
      }
      if (S.module === 'achats') {
        await Promise.all([loadCol('mouvements'), loadCol('factures_achat')]);
        content.innerHTML = renderAchatsView();
        bindMouvements();
        return;
      }
      if (S.module === 'parc') {
        await loadCol('equipements');
        content.innerHTML = renderParc();
        bindParc();
        return;
      }
      if (S.module === 'planning') {
        content.innerHTML = await renderPlanningView();
        bindPlanning();
        return;
      }
      if (S.module === 'rapports') {
        content.innerHTML = await renderRapportsView();
        bindRapports();
        return;
      }
      if (S.module === 'activite') {
        content.innerHTML = await renderActiviteView();
        return;
      }
      if (S.module === 'parametres') {
        content.innerHTML = await renderParametresView();
        return;
      }
      await loadCol(col);
      content.innerHTML = S.view === 'kanban' && moduleDef(S.module).kanban
        ? renderKanban(S.module, col)
        : renderList(S.module, col);
      bindList();
    } catch (e) {
      content.innerHTML = '<div class="o-sheet"><div class="o-alert red">' + esc(e.message) + '</div></div>';
    }
  }

  /* ---------------- DASHBOARD ---------------- */
  var DASH_REFRESH_TIMER = null;
  var DASH_CLOCK_TIMER = null;

  function dashPct(a, b) {
    b = Number(b || 0);
    if (!b) return 0;
    return Math.max(0, Math.min(100, Math.round((Number(a || 0) / b) * 100)));
  }
  function dashShort(n) {
    n = Number(n || 0);
    var a = Math.abs(n);
    if (a >= 1000000) return (n / 1000000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + 'M';
    if (a >= 1000) return Math.round(n / 1000).toLocaleString('fr-FR') + 'k';
    return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  }
  function dashKpi(o) {
    var fmt = o.fmt === 'int' ? 'int' : 'money';
    return '<button class="dash-kpi t-' + (o.tone || 'accent') + '"' +
      (o.mod ? ' data-dash="' + o.mod + '"' : '') + ' title="' + esc(o.hint || o.label) + '">' +
      '<span class="dash-kpi-top"><span class="dash-kpi-ico">' + icon(o.icon || 'chart') + '</span>' +
        (o.tag ? '<span class="dash-kpi-tag">' + esc(o.tag) + '</span>' : '') + '</span>' +
      '<span class="dash-kpi-lbl">' + esc(o.label) + '</span>' +
      '<span class="dash-kpi-val" data-dash-val="' + Number(o.value || 0) + '" data-dash-fmt="' + fmt + '">' +
        (fmt === 'int' ? String(Math.round(Number(o.value || 0))) : money(o.value || 0)) + '</span>' +
      '<span class="dash-kpi-hint">' + esc(o.hint || '') + '</span>' +
      (o.pct != null ? '<span class="dash-kpi-bar"><i style="width:' + Math.max(0, Math.min(100, o.pct)) + '%"></i></span>' : '') +
    '</button>';
  }

  function dashChart(serie) {
    var W = 640, H = 220, PX = 12, PT = 18, PB = 34;
    var plotW = W - PX * 2, plotH = H - PT - PB;
    var max = 1;
    serie.forEach(function (s) { max = Math.max(max, Number(s.facture || 0), Number(s.encaisse || 0)); });
    var step = Math.pow(10, Math.floor(Math.log(max) / Math.LN10)) / 2;
    max = Math.ceil(max / step) * step;
    var n = Math.max(1, serie.length);
    var group = plotW / n;
    var bw = Math.min(15, Math.max(6, group * 0.2));
    var grid = '';
    for (var g = 0; g <= 4; g++) {
      var y = PT + plotH - (plotH * g / 4);
      grid += '<line x1="' + PX + '" y1="' + y.toFixed(1) + '" x2="' + (W - PX) + '" y2="' + y.toFixed(1) + '" class="dash-gl"/>';
      if (g > 0) grid += '<text x="' + (PX + 2) + '" y="' + (y - 5).toFixed(1) + '" class="dash-axis">' + dashShort(max * g / 4) + '</text>';
    }
    var bars = '';
    serie.forEach(function (s, i) {
      var cx = PX + group * i + group / 2;
      var hf = Math.max(0, (Number(s.facture || 0) / max) * plotH);
      var he = Math.max(0, (Number(s.encaisse || 0) / max) * plotH);
      var xf = cx - bw - 2, xe = cx + 2;
      bars += '<rect class="dash-bar b-fact" x="' + xf.toFixed(1) + '" y="' + (PT + plotH - hf).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(hf, 1).toFixed(1) + '" rx="3" style="animation-delay:' + (i * 65) + 'ms"><title>' + esc(s.label) + ' · Facturé ' + money(s.facture) + '</title></rect>';
      bars += '<rect class="dash-bar b-enc" x="' + xe.toFixed(1) + '" y="' + (PT + plotH - he).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(he, 1).toFixed(1) + '" rx="3" style="animation-delay:' + (i * 65 + 40) + 'ms"><title>' + esc(s.label) + ' · Encaissé ' + money(s.encaisse) + '</title></rect>';
      bars += '<text x="' + cx.toFixed(1) + '" y="' + (H - 12) + '" class="dash-axis lab" text-anchor="middle">' + esc(s.label) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="dash-chart-svg" role="img" aria-label="Évolution du chiffre d\'affaires sur 6 mois">' + grid + bars + '</svg>';
  }

  function dashDonut(pct, center, sub) {
    var r = 54, c = 2 * Math.PI * r;
    var on = (Math.max(0, Math.min(100, pct)) / 100) * c;
    return '<div class="dash-donut">' +
      '<svg viewBox="0 0 140 140" role="img" aria-label="Taux d\'encaissement ' + pct + '%">' +
        '<circle cx="70" cy="70" r="' + r + '" class="dash-donut-bg"/>' +
        '<circle cx="70" cy="70" r="' + r + '" class="dash-donut-fg" stroke-dasharray="' + on.toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 70 70)"/>' +
      '</svg>' +
      '<div class="dash-donut-c"><b>' + esc(center) + '</b><span>' + esc(sub) + '</span></div>' +
    '</div>';
  }

  function dashBullet(label, value, tone, mod) {
    return '<button class="dash-bullet" ' + (mod ? 'data-dash="' + mod + '"' : '') + '>' +
      '<span class="dash-bullet-lbl">' + esc(label) + '</span>' +
      '<b class="' + (tone || '') + '">' + esc(value) + '</b></button>';
  }

  function renderDashboard(d, plan) {
    var ca = Number(d.caEncaisse || 0);
    var facture = Number(d.caFacture || 0);
    var attente = d.maintenanceUrgente || [];
    var crit = d.stockCritique || [];
    var assur = d.assurancesAlerte || [];
    var projets = d.projetsActifs || [];
    var serie = d.serieMois || [];
    var canFin = d.caEncaisse != null;
    var canDep = d.depensesMois != null;
    var canDev = d.devisTotal != null;
    var canAch = d.achatsTotal != null;
    var canMaint = canOpen('maintenance');
    var canStock = canOpen('stock');
    var firstName = (S.user && S.user.name ? String(S.user.name).trim().split(/\s+/)[0] : 'vous');
    var today = new Date();
    var dateTxt = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    /* --- indicateurs --- */
    var kpis = [];
    if (canFin) {
      kpis.push(dashKpi({ label: 'CA encaissé', value: ca, icon: 'wallet', tone: 'green', mod: 'factures',
        tag: dashPct(ca, facture) + '%', hint: 'sur ' + money(facture) + ' facturés', pct: dashPct(ca, facture) }));
      kpis.push(dashKpi({ label: 'Reste à encaisser', value: d.impayes || 0, icon: 'receipt', tone: (d.impayes > 0 ? 'red' : 'green'), mod: 'factures',
        tag: (d.impayes > 0 ? 'à relancer' : 'à jour'), hint: 'créances clients en cours', pct: dashPct(d.impayes || 0, facture) }));
    }
    if (canDep) {
      kpis.push(dashKpi({ label: 'Dépenses du mois', value: d.depensesMois || 0, icon: 'activity', tone: 'amber', mod: 'depenses',
        tag: (d.depensesCount || 0) + ' poste(s)', hint: (d.masseSalariale != null ? money(d.masseSalariale) + ' de salaires' : 'charges du mois') }));
    }
    if (canDev) {
      kpis.push(dashKpi({ label: 'Devis en cours', value: d.devisTotal || 0, icon: 'file-text', tone: 'teal', mod: 'devis',
        tag: (d.devisCount || 0) + ' devis', hint: (d.devisAttente || 0) + ' en attente de réponse' }));
    }
    if (d.caisse) {
      kpis.push(dashKpi({ label: 'Solde de caisse', value: d.caisse.solde || 0, icon: 'wallet', tone: (d.caisse.solde >= 0 ? 'accent' : 'red'), mod: 'caisse',
        tag: 'trésorerie', hint: money(d.avancesMois || 0) + ' d\'avances ce mois' }));
    }
    if (canAch) {
      kpis.push(dashKpi({ label: 'Achats à payer', value: d.achatsAPayer || 0, icon: 'cart', tone: (d.achatsAPayer > 0 ? 'purple' : 'green'), mod: 'achats',
        tag: (d.achatsCount || 0) + ' factures', hint: 'total fournisseurs ' + money(d.achatsTotal || 0) }));
    }
    if (canMaint) {
      kpis.push(dashKpi({ label: 'Maintenance ≤ 30 j', value: attente.length, fmt: 'int', icon: 'shield', tone: (attente.length ? 'red' : 'green'), mod: 'maintenance',
        tag: attente.length ? 'action' : 'à jour', hint: attente.length ? 'interventions à planifier' : 'aucune échéance proche' }));
    }
    if (canStock) {
      kpis.push(dashKpi({ label: 'Stock critique', value: crit.length, fmt: 'int', icon: 'box', tone: (crit.length ? 'amber' : 'green'), mod: 'stock',
        tag: (d.stockCount || 0) + ' réf.', hint: (d.stockValeur != null ? money(d.stockValeur) + ' de stock' : 'niveaux de stock') }));
    }

    /* --- graphique : 6 derniers mois --- */
    var totalFact = 0, totalEnc = 0;
    serie.forEach(function (s) { totalFact += Number(s.facture || 0); totalEnc += Number(s.encaisse || 0); });
    var chartPanel = canFin ? '<section class="dash-card">' +
      '<header class="dash-card-head"><div><h3>Évolution du chiffre d\'affaires</h3><p>Facturé et encaissé sur les 6 derniers mois</p></div>' +
        '<div class="dash-legend"><span class="lg"><i class="sw fact"></i>Facturé</span><span class="lg"><i class="sw enc"></i>Encaissé</span></div></header>' +
      '<div class="dash-chart">' + (serie.length ? dashChart(serie) : '<div class="o-empty">Aucune donnée sur la période</div>') + '</div>' +
      '<footer class="dash-chart-foot">' +
        '<span>Cumul 6 mois</span>' +
        '<b>' + money(totalFact) + '</b>' +
        '<em class="ok">' + money(totalEnc) + ' encaissés</em>' +
      '</footer>' +
    '</section>' : '';

    /* --- taux d'encaissement + aujourd'hui --- */
    var rate = dashPct(ca, facture);
    var sidePanel = '<section class="dash-card dash-side">' +
      (canFin ? '<header class="dash-card-head"><div><h3>Taux d\'encaissement</h3><p>Part du facturé déjà recouvrée</p></div></header>' +
        '<div class="dash-donut-wrap">' + dashDonut(rate, rate + '%', 'recouvré') + '</div>' +
        '<div class="dash-stats">' +
          '<div class="dash-stat"><span>Facturé</span><b>' + money(facture) + '</b></div>' +
          '<div class="dash-stat"><span>Encaissé</span><b class="ok">' + money(ca) + '</b></div>' +
          '<div class="dash-stat"><span>Reste</span><b class="warn">' + money(d.impayes || 0) + '</b></div>' +
        '</div>' : '') +
      '<div class="dash-today">' +
        '<div class="dash-today-head">Aujourd\'hui <span class="dash-live"><i></i><b data-dash-clock>--:--</b></span></div>' +
        (canOpen('interventions') ? dashBullet('Missions du jour', String((d.interventionsJour || []).length), '', 'interventions') : '') +
        (canOpen('pointage') ? dashBullet('Pointages', String((d.pointagesJour || []).length), '', 'pointage') : '') +
        (d.employesActifs != null ? dashBullet('Employés actifs', String(d.employesActifs), '', 'users') : '') +
        (d.counts && d.counts.projets != null ? dashBullet('Projets suivis', String(d.counts.projets), '', 'projets') : '') +
        (d.counts && d.counts.clients != null ? dashBullet('Clients', String(d.counts.clients), '', 'clients') : '') +
      '</div>' +
    '</section>';

    /* --- projets --- */
    var projPanel = (canOpen('projets') || projets.length) ? '<section class="dash-card">' +
      '<header class="dash-card-head"><div><h3>Projets actifs</h3><p>Avancement et échéances</p></div>' +
        '<button class="dash-link" data-dash="projets">Tout voir</button></header>' +
      '<div class="dash-list">' +
        (projets.length ? projets.slice(0, 6).map(function (p) {
          var pr = Math.max(0, Math.min(100, Number(p.progress || 0)));
          var late = p.deadline ? dLeft(p.deadline) < 0 : false;
          return '<div class="dash-proj">' +
            '<div class="dash-proj-top"><b>' + esc(p.nom) + '</b>' + badge(p.phase) + '</div>' +
            '<div class="dash-progress"><i style="width:' + pr + '%"></i></div>' +
            '<div class="dash-proj-meta"><span>' + esc(refName('clients', p.clientId) || '—') + '</span>' +
              '<span>' + pr + '% · <em class="' + (late ? 'warn' : '') + '">' + (late ? 'en retard' : 'échéance ' + dFr(p.deadline)) + '</em></span></div>' +
          '</div>';
        }).join('') : '<div class="o-empty">Aucun projet en cours</div>') +
      '</div></section>' : '';

    /* --- alertes --- */
    var alerts = [];
    assur.forEach(function (a) {
      alerts.push({ tone: a.expire ? 'red' : 'amber', icon: 'shield', mod: 'users', title: 'Assurance ' + (a.type || ''),
        text: (a.employe || '—') + ' · ' + (a.assureur || '—') + ' — ' + (a.expire ? 'expirée depuis ' + Math.abs(a.jours) + ' j' : 'expire dans ' + a.jours + ' j') });
    });
    attente.forEach(function (m) {
      alerts.push({ tone: 'red', icon: 'bell', mod: 'maintenance', title: m.eq || 'Maintenance',
        text: (m.lieu || '—') + ' · visite dans ' + dLeft(m.next) + ' j' });
    });
    crit.forEach(function (s) {
      alerts.push({ tone: 'amber', icon: 'box', mod: 'stock', title: s.nom || 'Stock',
        text: num(s.qty) + ' restant · seuil ' + num(s.minQty) });
    });
    if (d.impayes) {
      alerts.push({ tone: 'red', icon: 'receipt', mod: 'factures', title: 'Créances clients',
        text: money(d.impayes) + ' à recouvrer' });
    }
    if (d.achatsAPayer) {
      alerts.push({ tone: 'purple', icon: 'cart', mod: 'achats', title: 'Achats à payer',
        text: money(d.achatsAPayer) + ' · ' + (d.achatsCount || 0) + ' facture(s)' });
    }
    if (d.devisAttente) {
      alerts.push({ tone: 'teal', icon: 'file-text', mod: 'devis', title: 'Devis en attente',
        text: d.devisAttente + ' devis à relancer' });
    }
    var alertPanel = '<section class="dash-card">' +
      '<header class="dash-card-head"><div><h3>Alertes & vigilance</h3><p>' + (alerts.length ? alerts.length + ' point(s) à surveiller' : 'Tout est à jour') + '</p></div>' +
        '<span class="dash-count ' + (alerts.length ? 'hot' : 'ok') + '">' + alerts.length + '</span></header>' +
      '<div class="dash-alerts">' +
        (alerts.length ? alerts.map(function (a) {
          return '<button class="dash-alert ' + a.tone + '" data-dash="' + a.mod + '">' +
            '<span class="dash-alert-ico">' + icon(a.icon) + '</span>' +
            '<span class="dash-alert-body"><b>' + esc(a.title) + '</b><small>' + esc(a.text) + '</small></span>' +
            '<span class="dash-alert-go">›</span></button>';
        }).join('') : '<div class="dash-ok">' + icon('check') + '<span>Aucune alerte — tout est à jour.</span></div>') +
      '</div></section>';

    /* --- factures récentes --- */
    var factPanel = canFin ? '<section class="dash-card">' +
      '<header class="dash-card-head"><div><h3>Factures récentes</h3><p>Dernières pièces émises</p></div>' +
        '<button class="dash-link" data-dash="factures">Tout voir</button></header>' +
      '<div class="dash-table">' +
        '<table class="o-list"><thead><tr><th>N°</th><th>Client</th><th>Montant</th><th>Reste</th><th>Statut</th></tr></thead><tbody>' +
        ((d.factures || []).length ? d.factures.map(function (f) {
          var reste = Math.max(0, Number(f.montant || 0) - Number(f.paye || 0));
          return '<tr><td class="o-mono">' + esc(f.num) + '</td><td>' + esc(refName('clients', f.clientId)) + '</td>' +
            '<td class="num">' + money(f.montant) + '</td><td class="num' + (reste > 0 ? ' warn' : '') + '">' + money(reste) + '</td><td>' + badge(f.status) + '</td></tr>';
        }).join('') : '<tr><td colspan="5"><div class="o-empty">Aucune facture</div></td></tr>') +
        '</tbody></table>' +
      '</div></section>' : '';

    /* --- activité récente --- */
    var audit = d.audit || [];
    var actPanel = '<section class="dash-card">' +
      '<header class="dash-card-head"><div><h3>Activité récente</h3><p>Journal des dernières actions</p></div>' +
        '<button class="dash-link" data-dash="activite">Tout voir</button></header>' +
      '<div class="dash-timeline">' +
        (audit.length ? audit.slice(0, 6).map(function (a) {
          return '<div class="dash-tl-item"><span class="dash-tl-dot"></span><div><b>' + esc(a.action) + '</b>' +
            '<small>' + esc(a.user) + ' · ' + dtFr(a.ts) + '</small></div></div>';
        }).join('') : '<div class="o-empty">Aucune activité enregistrée</div>') +
      '</div></section>';

    /* --- planning de la semaine --- */
    var planPanel = '';
    if (plan && plan.days && plan.days.length) {
      var ymdOf = function (dt) {
        return dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2);
      };
      var todayKey = ymdOf(today);
      var week = plan.days.slice(0, 7);
      var weekCount = week.reduce(function (s, day) { return s + day.items.length; }, 0);
      var nextEv = [];
      plan.days.slice(7).forEach(function (day) {
        day.items.forEach(function (it) { nextEv.push({ date: day.date, it: it }); });
      });
      var kindLbl = { mission: 'Mission', controle: 'Contrôle', facturation: 'Facturation' };
      var evBtn = function (it) {
        var k = kindLbl[it.kind] ? it.kind : 'mission';
        var meta = [it.client, it.tech].filter(Boolean).join(' · ');
        if (!meta && it.montant != null) meta = money(it.montant);
        return '<button class="dash-ev ' + k + '" data-plan-kind="' + k + '" data-plan-id="' + esc(it.id || '') + '" title="' + esc(kindLbl[k] + ' · ' + (it.title || '')) + '">' +
          '<span class="dash-ev-t">' + esc(it.title || kindLbl[k]) + '</span>' +
          (meta ? '<span class="dash-ev-m">' + esc(meta) + '</span>' : '') +
        '</button>';
      };
      var dayCells = week.map(function (day) {
        var dd = new Date(day.date + 'T00:00:00');
        var wd = isNaN(dd.getTime()) ? day.date : dd.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
        var dn = isNaN(dd.getTime()) ? '' : dd.getDate();
        var isToday = day.date === todayKey;
        return '<div class="dash-day' + (isToday ? ' today' : '') + '">' +
          '<div class="dash-day-head"><span class="dash-day-name">' + esc(wd) + '</span>' +
            '<b class="dash-day-num">' + esc(String(dn)) + '</b></div>' +
          '<div class="dash-day-body">' +
            (day.items.length ? day.items.map(function (it) { return evBtn(it); }).join('') : '<span class="dash-day-empty">—</span>') +
          '</div>' +
        '</div>';
      }).join('');
      var nextRow = nextEv.length ? '<div class="dash-plan-next">' +
        '<span class="dash-plan-next-lbl">' + icon('calendar') + 'Prochains rendez-vous</span>' +
        nextEv.slice(0, 4).map(function (e) {
          var k = kindLbl[e.it.kind] ? e.it.kind : 'mission';
          var dd = new Date(e.date + 'T00:00:00');
          var short = isNaN(dd.getTime()) ? e.date : dd.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
          return '<button class="dash-next-chip ' + k + '" data-plan-kind="' + k + '" data-plan-id="' + esc(e.it.id || '') + '">' +
            '<b>' + esc(short) + '</b><span>' + esc(e.it.title || kindLbl[k]) + '</span><i class="dot"></i></button>';
        }).join('') +
      '</div>' : '';
      var lastDay = week[week.length - 1];
      planPanel = '<section class="dash-card dash-plan">' +
        '<header class="dash-card-head"><div><h3>Planning de la semaine</h3>' +
          '<p>Du ' + esc(dFr(plan.start)) + ' au ' + esc(dFr(lastDay.date)) + ' · ' + weekCount + ' événement' + (weekCount > 1 ? 's' : '') + '</p></div>' +
          '<div class="dash-plan-nav">' +
            '<button class="dash-plan-btn" data-dash-week="-7" title="Semaine précédente" aria-label="Semaine précédente">‹</button>' +
            '<button class="dash-plan-btn now" data-dash-week="0">Cette semaine</button>' +
            '<button class="dash-plan-btn" data-dash-week="7" title="Semaine suivante" aria-label="Semaine suivante">›</button>' +
            '<button class="dash-link" data-dash="planning">Ouvrir le planning</button>' +
          '</div></header>' +
        '<div class="dash-week">' + dayCells + '</div>' +
        nextRow +
        '<footer class="dash-plan-legend">' +
          '<span><i class="dot mission"></i>Mission</span>' +
          '<span><i class="dot controle"></i>Contrôle</span>' +
          '<span><i class="dot facturation"></i>Facturation</span>' +
          '<em>' + (weekCount ? 'Cliquez sur un événement pour l\'ouvrir' : 'Aucun événement cette semaine — voir les prochains rendez-vous') + '</em>' +
        '</footer>' +
      '</section>';
    }

    function dashGrid(parts) {
      var items = parts.filter(Boolean);
      if (!items.length) return '';
      return '<div class="dash-grid' + (items.length === 1 ? ' solo' : '') + '">' + items.join('') + '</div>';
    }

    return '<div class="o-sheet dash">' +
      '<div class="dash-hero">' +
        '<div class="dash-hero-glow"></div>' +
        '<div class="dash-hero-copy">' +
          '<span class="dash-eyebrow"><i></i> Centre de pilotage</span>' +
          '<h2 class="dash-title">Bonjour, <span class="dash-grad">' + esc(firstName) + '</span></h2>' +
          '<p class="dash-sub">Synthèse de votre activité — ' + esc(dateTxt) + '</p>' +
        '</div>' +
        '<div class="dash-hero-side">' +
          '<div class="dash-hero-clock"><b data-dash-clock>--:--</b><span>heure locale</span></div>' +
          '<button class="dash-refresh" data-dash-refresh title="Actualiser les données">' + icon('refresh') + '<span>Actualiser</span></button>' +
        '</div>' +
      '</div>' +

      (kpis.length ? '<div class="dash-kpis">' + kpis.join('') + '</div>' : '') +
      dashGrid([chartPanel, sidePanel]) +
      dashGrid([planPanel]) +
      dashGrid([projPanel, alertPanel]) +
      dashGrid([factPanel, actPanel]) +
    '</div>';
  }

  /* ACTIVITÉ — case à part (plus dans le tableau de bord) */
  function renderActivite(d) {
    var list = d.audit || [];
    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">Activité récente</h2>' +
      '<p class="o-view-sub">Journal des actions effectuées dans l\'ERP — ' + list.length + ' événement(s)</p></div>' +
      '<div class="o-actions"><button class="o-btn o-btn-default o-btn-sm" data-dash="dashboard">Tableau de bord</button></div></div>' +
      '<div class="o-panel"><div class="o-panel-head">Journal<span class="o-badge gray">' + list.length + '</span></div>' +
      '<div class="o-panel-body"><div class="o-activity">' +
        (list.length ? list.map(function (a) {
          return '<div class="o-activity-item"><div class="o-activity-dot"></div><div><div class="txt">' + esc(a.action) + '</div>' +
            '<div class="when">' + esc(a.user) + ' · ' + dtFr(a.ts) + '</div></div></div>';
        }).join('') : '<div class="o-empty">Aucune activité enregistrée</div>') +
      '</div></div></div>' +
    '</div>';
  }
  function kpi(lbl, val, hint, tone) {
    return '<div class="o-kpi ' + (tone || '') + '"><div class="lbl">' + esc(lbl) + '</div><div class="val">' + esc(val) + '</div><div class="hint ' + (tone === 'red' ? 'warn' : tone === 'green' ? 'ok' : '') + '">' + esc(hint) + '</div></div>';
  }
  function stopDashTimers() {
    if (DASH_REFRESH_TIMER) { clearInterval(DASH_REFRESH_TIMER); DASH_REFRESH_TIMER = null; }
    if (DASH_CLOCK_TIMER) { clearInterval(DASH_CLOCK_TIMER); DASH_CLOCK_TIMER = null; }
  }

  function bindDashboard(d, plan) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-dash]'), function (b) {
      b.onclick = function () { navigate(b.getAttribute('data-dash')); };
    });

    /* Navigation semaine / événements du planning intégré */
    var weekBase = S.weekStart || (plan && plan.start) || '';
    Array.prototype.forEach.call(document.querySelectorAll('[data-dash-week]'), function (b) {
      b.onclick = function () {
        var delta = Number(b.getAttribute('data-dash-week'));
        if (!delta) { S.weekStart = ''; renderView(); return; }
        var base = weekBase || new Date().toISOString().slice(0, 10);
        var dd = new Date(base + 'T00:00:00');
        dd.setDate(dd.getDate() + delta);
        S.weekStart = dd.getFullYear() + '-' + ('0' + (dd.getMonth() + 1)).slice(-2) + '-' + ('0' + dd.getDate()).slice(-2);
        renderView();
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-plan-kind]'), function (b) {
      b.onclick = function () {
        var kind = b.getAttribute('data-plan-kind');
        var id = b.getAttribute('data-plan-id');
        if (kind === 'mission') openForm('interventions', id);
        else if (kind === 'controle') openForm('maintenance', id);
        else navigate('contrats');
      };
    });

    /* Compteurs animés (respect de `prefers-reduced-motion`) */
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll('[data-dash-val]'), function (el) {
      var target = Number(el.getAttribute('data-dash-val') || 0);
      var fmt = el.getAttribute('data-dash-fmt');
      var write = function (v) { el.textContent = fmt === 'int' ? String(Math.round(v)) : money(v); };
      if (reduce || !window.requestAnimationFrame || !isFinite(target)) { write(target); return; }
      var start = null, dur = 760;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        write(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    });

    /* Horloge live de l'en-tête */
    if (DASH_CLOCK_TIMER) clearInterval(DASH_CLOCK_TIMER);
    var clockTick = function () {
      var els = document.querySelectorAll('[data-dash-clock]');
      if (!els.length) { clearInterval(DASH_CLOCK_TIMER); DASH_CLOCK_TIMER = null; return; }
      var txt = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      Array.prototype.forEach.call(els, function (el) { el.textContent = txt; });
    };
    if (document.querySelector('[data-dash-clock]')) { clockTick(); DASH_CLOCK_TIMER = setInterval(clockTick, 20000); }

    /* Actualiser */
    var refresh = document.querySelector('[data-dash-refresh]');
    if (refresh) refresh.onclick = function () {
      refresh.classList.add('spin');
      renderView().then(function () { toast('Tableau de bord actualisé'); });
    };

    /* Rafraîchissement automatique (90 s) */
    if (DASH_REFRESH_TIMER) clearInterval(DASH_REFRESH_TIMER);
    DASH_REFRESH_TIMER = setInterval(function () {
      if (S.module !== 'dashboard') { stopDashTimers(); return; }
      renderView();
    }, 90000);
  }

  /* ---------------- LIST ---------------- */
  function filtered(col, rows) {
    if (!S.search) return rows;
    var q = S.search.toLowerCase();
    return rows.filter(function (r) {
      var hay = Object.keys(r).map(function (k) {
        if (k === 'clientId') return refName('clients', r[k]);
        if (k === 'techId' || k === 'chefId' || k === 'empId') return refName('users', r[k]);
        return r[k];
      }).join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function renderList(mod, col) {
    var sch = SCHEMA[col];
    var rows = filtered(col, S.data[col] || []);
    if (S.sort.k) {
      var k = S.sort.k, dir = S.sort.dir;
      rows = rows.slice().sort(function (a, b) {
        var va = a[k], vb = b[k];
        if (typeof va === 'number' || typeof vb === 'number') return (Number(va) - Number(vb)) * dir;
        return String(va == null ? '' : va).localeCompare(String(vb == null ? '' : vb)) * dir;
      });
    }
    if (col === 'stock' && S.stockPole) {
      rows = rows.filter(function (r) { return (r.service || 'COMMUN') === S.stockPole; });
    }
    var cols = sch.columns;
    var head = '<th class="col-check"><input type="checkbox" id="check-all"></th>' + cols.map(function (c) {
      var label = c.l !== undefined ? c.l : fieldLabel(col, c.k);
      var sortable = c.k !== 'act';
      return '<th' + (sortable ? ' class="sortable" data-sort="' + c.k + '"' : '') + '>' + esc(label) +
        (S.sort.k === c.k ? (S.sort.dir > 0 ? ' ▲' : ' ▼') : '') + '</th>';
    }).join('');

    var body = rows.length ? rows.map(function (r) {
      var tds = '<td class="col-check"><input type="checkbox" data-check="' + esc(r.id) + '"></td>';
      tds += cols.map(function (c) { return '<td>' + renderCell(col, c, r) + '</td>'; }).join('');
      return '<tr data-row="' + esc(r.id) + '">' + tds + '</tr>';
    }).join('') : '<tr><td colspan="' + (cols.length + 1) + '"><div class="o-empty"><div class="ico">◫</div>Aucun enregistrement' + (S.search ? ' pour « ' + esc(S.search) + ' »' : '') + '</div></td></tr>';

    var stockPoleChips = '';
    if (col === 'stock') {
      stockPoleChips = '<div class="o-chips">' +
        '<button class="o-chip' + (!S.stockPole ? ' active' : '') + '" data-stockpole="">Tous les pôles <span>' + (S.data.stock || []).length + '</span></button>' +
        visiblePoles().map(function (p) {
          var n = (S.data.stock || []).filter(function (r) { return (r.service || 'COMMUN') === p.code; }).length;
          return '<button class="o-chip' + (S.stockPole === p.code ? ' active' : '') + '" data-stockpole="' + p.code + '">' + esc(p.code) + ' — ' + esc(p.nom) + ' <span>' + n + '</span></button>';
        }).join('') + '</div>';
    }
    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">' + esc(sch.title) + '</h2><p class="o-view-sub">' + rows.length + ' enregistrement' + (rows.length > 1 ? 's' : '') + '</p></div>' +
      '<div class="o-actions"><button class="o-btn o-btn-primary" data-act="create">' + icon('plus') + ' Nouveau</button></div></div>' +
      stockPoleChips +
      '<div class="o-list-wrap"><div class="o-table-scroll"><table class="o-list"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div></div>' +
    '</div>';
  }

  function fieldLabel(col, k) {
    var sch = SCHEMA[col];
    for (var i = 0; i < sch.fields.length; i++) if (sch.fields[i].k === k) return sch.fields[i].l;
    return k;
  }

  function renderCell(col, c, r) {
    var val = c.fn ? c.fn(r) : r[c.k];
    if (c.badge) return badge(val);
    if (c.money) return '<span class="num">' + money(c.fn ? val : r[c.k]) + '</span>';
    if (c.date) return esc(dFr(val));
    if (c.mono) return '<span class="o-mono">' + esc(val == null ? '—' : val) + '</span>';
    if (c.rel) return esc(val ? refName(c.rel, val) : '—');
    if (c.bar) return '<div style="display:flex;align-items:center;gap:8px;min-width:120px"><div class="o-progress" style="flex:1"><i style="width:' + Number(val || 0) + '%"></i></div><span style="font-size:11px;color:var(--o-muted)">' + Number(val || 0) + '%</span></div>';
    if (c.fn) return val;
    if (c.main) {
      var sub = c.sub ? (c.relSub ? refName(c.relSub, r[c.sub]) : r[c.sub]) : '';
      return '<div class="cell-main">' + esc(val == null || val === '' ? '—' : val) + '</div>' + (sub ? '<div class="cell-sub">' + esc(sub) + '</div>' : '');
    }
    return esc(val == null || val === '' ? '—' : val);
  }

  function bindList() {
    var content = document.getElementById('content');
    Array.prototype.forEach.call(content.querySelectorAll('[data-stockpole]'), function (b) {
      b.onclick = function () { S.stockPole = b.getAttribute('data-stockpole'); renderView(); };
    });
    // row click -> edit
    Array.prototype.forEach.call(content.querySelectorAll('tr[data-row]'), function (tr) {
      tr.onclick = function (e) {
        if (e.target.type === 'checkbox') return;
        if (e.target.closest('[data-print-facture],[data-print-devis],[data-bc-devis],[data-conv-devis],[data-pay-facture],[data-releve]')) return;
        openForm(colOf(S.module), tr.getAttribute('data-row'));
      };
    });
    // sort
    Array.prototype.forEach.call(content.querySelectorAll('th[data-sort]'), function (th) {
      th.onclick = function () {
        var k = th.getAttribute('data-sort');
        if (S.sort.k === k) S.sort.dir = -S.sort.dir;
        else S.sort = { k: k, dir: 1 };
        renderView();
      };
    });
    // checkboxes
    var all = content.querySelector('#check-all');
    if (all) all.onclick = function () {
      Array.prototype.forEach.call(content.querySelectorAll('[data-check]'), function (cb) { cb.checked = all.checked; });
    };
  }

  /* ---------------- KANBAN ---------------- */
  function renderKanban(mod, col) {
    var sch = SCHEMA[col];
    var groupKey = sch.kanban;
    var rows = filtered(col, S.data[col] || []);
    var stages = [];
    (sch.fields.find(function (f) { return f.k === groupKey; }) || {}).opts || ['—'];
    var fdef = sch.fields.find(function (f) { return f.k === groupKey; });
    stages = (fdef && fdef.opts) ? fdef.opts : ['—'];
    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">' + esc(sch.title) + '</h2><p class="o-view-sub">' + rows.length + ' enregistrement' + (rows.length > 1 ? 's' : '') + '</p></div>' +
      '<div class="o-actions"><button class="o-btn o-btn-primary" data-act="create">' + icon('plus') + ' Nouveau</button></div></div>' +
      '<div class="o-kanban">' +
        stages.map(function (st) {
          var items = rows.filter(function (r) { return String(r[groupKey] || '') === st; });
          return '<div class="o-kanban-col"><header><span>' + esc(st) + '</span><span class="count">' + items.length + '</span></header><div class="o-kanban-body">' +
            (items.map(function (r) {
              var title = r.nom || r.titre || r.eq || r.ref || r.num || '—';
              var meta = [];
              if (r.clientId) meta.push(refName('clients', r.clientId));
              if (r.techId) meta.push(refName('users', r.techId));
              if (r.deadline) meta.push('échéance ' + dFr(r.deadline));
              if (r.date) meta.push(dFr(r.date));
              return '<div class="o-card" data-row="' + esc(r.id) + '"><b>' + esc(title) + '</b>' +
                (meta.length ? '<div class="meta">' + esc(meta.join(' · ')) + '</div>' : '') +
                (r.progress != null ? '<div class="o-progress"><i style="width:' + Number(r.progress || 0) + '%"></i></div>' : '') +
                (r.status ? '<div style="margin-top:7px">' + badge(r.status) + '</div>' : '') +
              '</div>';
            }).join('') || '<div style="padding:12px;text-align:center;color:#94a3b8;font-size:12px">Vide</div>') +
          '</div></div>';
        }).join('') +
      '</div></div>';
  }

  /* ---------------- POINTAGE MANUEL + PAIE ---------------- */
  /* Tarifs (identiques au backend) : 2 000 DA / jour, 375 DA / h supplémentaire,
     2 000 DA / déplacement (véhicule), 1 200 DA forfaitaires / mission hors wilaya.
     Une ARRIVÉE = une journée payée. */
  var TARIFS = { jour: 2000, heureSup: 375, deplacement: 2000, horsWilaya: 1200 };
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function montantPointage(p) {
    if (String(p.type || '').toUpperCase() !== 'ARRIVÉE') return 0;
    var h = Math.max(0, Number(p.heuresSup || 0));
    var dep = Number(p.deplacement) ? 1 : 0;
    return Math.round((TARIFS.jour + h * TARIFS.heureSup + dep * TARIFS.deplacement) * 100) / 100;
  }
  function missionKey(p) {
    var ref = String(p.mission || '').trim().toLowerCase();
    return ref ? 'm:' + ref : 'd:' + pointDate(p);
  }
  /* Le forfait hors wilaya est versé une seule fois par mission. */
  function missionsHorsWilaya(rows) {
    var seen = {};
    (rows || []).forEach(function (p) {
      if (String(p.type || '').toUpperCase() === 'ARRIVÉE' && Number(p.horsWilaya)) seen[missionKey(p)] = 1;
    });
    return Object.keys(seen).length;
  }
  function pointDate(p) { return String(p.date || p.ts || '').slice(0, 10); }

  async function renderPointageView() {
    var rows = await api('/api/pointages');
    var users = S.refs.users;
    var tk = todayKey();
    var ym = tk.slice(0, 7);
    var moisSel = S.ptgMois || ym;
    var todays = rows.filter(function (p) { return pointDate(p) === tk; });
    var moisRows = rows.filter(function (p) { return pointDate(p).slice(0, 7) === moisSel; });
    var present = {}; todays.forEach(function (p) { if (isArrivee(p)) present[p.empId] = 1; });
    var totalJour = todays.reduce(function (s, p) { return s + montantPointage(p); }, 0);
    var totalMois = moisRows.reduce(function (s, p) { return s + montantPointage(p); }, 0);
    var hsMois = moisRows.reduce(function (s, p) { return s + (isArrivee(p) ? Number(p.heuresSup || 0) : 0); }, 0);
    var depMois = moisRows.reduce(function (s, p) { return s + (isArrivee(p) && Number(p.deplacement) ? 1 : 0); }, 0);
    var nbHW = missionsHorsWilaya(moisRows);
    var totalHW = nbHW * TARIFS.horsWilaya;
    var totalMoisCalcule = totalMois + totalHW;
    var list = moisRows.slice().sort(function (a, b) { return pointDate(b).localeCompare(pointDate(a)) || String(b.ts || '').localeCompare(String(a.ts || '')); });

    /* Feuille de salaire du mois choisi : chaque employé, brut, avances, net à payer. */
    var salaires = null;
    if (canOpen('users')) {
      try { salaires = (await api('/api/pointages/salaires?mois=' + encodeURIComponent(moisSel))).salaires || []; }
      catch (e) { salaires = null; }
    }
    var salVis = (salaires || []).filter(function (s) { return s.active || s.jours || s.avances || s.pointages; });
    var totJours = 0, totHS = 0, totDep = 0, totBrut = 0, totAv = 0, totNet = 0;
    salVis.forEach(function (s) {
      totJours += Number(s.jours || 0); totHS += Number(s.heuresSup || 0); totDep += Number(s.deplacements || 0);
      totBrut += Number(s.brut || 0); totAv += Number(s.avances || 0); totNet += Number(s.net || 0);
    });
    var netMois = salaires ? totNet : totalMoisCalcule;
    var salBody = salVis.length ? salVis.map(function (s) {
      return '<tr>' +
        '<td class="cell-main">' + esc(s.emp || '—') + '<div class="cell-sub">' + esc(s.role || '') + '</div></td>' +
        '<td class="r"><b>' + num(s.jours) + '</b> j</td>' +
        '<td class="r">' + (Number(s.heuresSup) ? num(s.heuresSup) + ' h' : '—') + '</td>' +
        '<td class="r">' + (Number(s.deplacements) ? num(s.deplacements) : '—') + '</td>' +
        '<td class="r">' + (Number(s.missionsHorsWilaya) ? num(s.missionsHorsWilaya) + ' · ' + money(s.brutHW) : '—') + '</td>' +
        '<td class="r">' + money(s.brut) + '</td>' +
        '<td class="r">' + (Number(s.avances) ? '<span style="color:var(--o-red)">' + money(s.avances) + '</span>' : '—') + '</td>' +
        '<td class="r"><b style="color:#0f766e">' + money(s.net) + '</b></td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="8"><div class="o-empty"><div class="ico">◎</div>Aucun pointage pour ' + esc(moisSel) + ' — les salaires apparaîtront ici</div></td></tr>';

    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">Pointage manuel</h2>' +
      '<p class="o-view-sub">Saisie manuelle · 2 000 DA/jour · 375 DA/h sup. · 2 000 DA/déplacement · 1 200 DA/mission hors wilaya</p></div>' +
      '<div class="o-actions">' +
        '<div class="o-field" style="margin-right:6px"><label style="font-size:11px">Mois de paie</label><input class="o-input" type="month" id="ptg-mois" value="' + esc(moisSel) + '" style="width:150px"></div>' +
        '<button class="o-btn o-btn-default" data-act="export-ptg">' + icon('download') + ' CSV</button>' +
        (canOpen('users') ? '<button class="o-btn o-btn-default" data-act="salaires">' + icon('receipt') + ' Feuille de salaire</button>' : '') +
        '<button class="o-btn o-btn-primary" data-act="point">' + icon('plus') + ' Pointer un jour</button>' +
      '</div></div>' +
      '<div class="o-kpis">' +
        kpi('Présents aujourd\'hui', Object.keys(present).length + '/' + users.length, '', 'teal') +
        kpi('Salaire du jour', money(totalJour), 'pointages saisis', 'green') +
        kpi('Salaires nets du mois', money(netMois), moisSel + ' · brut ' + money(salaires ? totBrut : totalMoisCalcule), 'purple') +
        kpi('H. sup. / Déplacements', num(hsMois) + ' h / ' + depMois, moisSel, 'amber') +
      '</div>' +
      '<div class="o-alert" style="margin-bottom:12px"><span>🧮</span><div><b>Calcul automatique :</b> chaque <b>ARRIVÉE</b> vaut 2 000 DA, chaque heure supplémentaire 375 DA, chaque déplacement 2 000 DA (frais de véhicule), et <b>1 200 DA forfaitaires par mission hors wilaya</b> (une seule fois, même si la mission dure plusieurs jours). ' +
      'Le montant est repris dans la feuille de salaire, avances de la caisse déduites.</div></div>' +
      (canOpen('users') ? '<div class="o-panel" style="margin-bottom:14px"><div class="o-panel-head">Salaires du mois — ' + esc(moisSel) + ' <span class="o-badge purple">' + salVis.length + '</span></div><div class="o-panel-body" style="padding:0">' +
        '<div class="o-table-scroll"><table class="o-list"><thead><tr><th>Employé</th><th class="r">Jours payés</th><th class="r">H. sup.</th><th class="r">Déplacements</th><th class="r">Missions HW</th><th class="r">Brut</th><th class="r">Avances</th><th class="r">Net à payer</th></tr></thead><tbody>' +
        salBody +
        '<tr style="background:var(--o-bg-soft,#f6f7f9);font-weight:700"><td>Total ' + salVis.length + ' employé(s)</td>' +
          '<td class="r">' + num(totJours) + ' j</td><td class="r">' + num(totHS) + ' h</td><td class="r">' + num(totDep) + '</td><td></td>' +
          '<td class="r">' + money(totBrut) + '</td><td class="r">' + money(totAv) + '</td><td class="r" style="color:#0f766e">' + money(totNet) + '</td></tr>' +
        '</tbody></table></div></div></div>' : '') +
            '<div class="o-list-wrap"><div class="o-table-scroll"><table class="o-list">' +
      '<thead><tr><th>Employé</th><th>Date</th><th>Type</th><th class="r">H. sup.</th><th>Déplacement</th><th>Mission</th><th>Lieu</th><th class="r">Montant</th></tr></thead><tbody>' +
        (list.length ? list.map(function (p) {
          return '<tr><td class="cell-main">' + esc(p.emp) + '</td><td>' + esc(dFr(p.date || p.ts)) + '</td><td>' + badge(p.type) + '</td>' +
            '<td class="r">' + (isArrivee(p) ? num(p.heuresSup) + ' h' : '—') + '</td>' +
            '<td>' + (isArrivee(p) && Number(p.deplacement) ? '<span class="o-badge amber">oui</span>' : '—') + '</td>' +
            '<td>' + (p.mission ? esc(p.mission) : '—') + (Number(p.horsWilaya) ? ' <span class="o-badge purple">Hors wilaya +1 200</span>' : '') + '</td>' +
            '<td>' + esc(p.lieu || '—') + '</td>' +
            '<td class="r"><b>' + (montantPointage(p) ? money(montantPointage(p)) : '<span style="color:#94a3b8">—</span>') + '</b></td></tr>';
        }).join('') : '<tr><td colspan="8"><div class="o-empty"><div class="ico">◎</div>Aucun pointage ce mois — cliquez sur « Pointer un jour »</div></td></tr>') +
      '</tbody></table></div></div>' +
    '</div>';
  }
  function isArrivee(p) { return String(p.type || '').toUpperCase() === 'ARRIVÉE'; }

  function bindPointage() {
    var b = document.querySelector('[data-act="point"]');
    if (b) b.onclick = openPointModal;
    var e = document.querySelector('[data-act="export-ptg"]');
    if (e) e.onclick = function () { downloadExport('pointages'); };
    var pm = document.getElementById('ptg-mois');
    if (pm) pm.onchange = function () { S.ptgMois = pm.value || todayKey().slice(0, 7); renderView(); };
    var s = document.querySelector('[data-act="salaires"]');
    if (s) s.onclick = function () { navigate('users'); };
  }
  function openPointModal(empId) {
    openModal('Pointer une journée de travail',
      '<div class="o-form-grid">' +
        fieldHTML({ k: 'empId', l: 'Employé', t: 'rel', rel: 'users', req: true }, empId || '') +
        fieldHTML({ k: 'date', l: 'Date du jour', t: 'date', req: true }, todayKey()) +
        fieldHTML({ k: 'type', l: 'Type', t: 'select', opts: ['ARRIVÉE', 'PAUSE', 'REPRISE', 'DÉPART'] }, 'ARRIVÉE') +
        fieldHTML({ k: 'heuresSup', l: 'Heures supplémentaires (375 DA/h)', t: 'number', placeholder: 'Ex : 2' }, 0) +
        fieldHTML({ k: 'deplacement', l: 'Déplacement — frais de véhicule (+2 000 DA)', t: 'select', opts: ['Non', 'Oui'] }, 'Non') +
        fieldHTML({ k: 'mission', l: 'Mission (réf. / objet)', placeholder: 'Ex : M-ESSENIA-08' }, '') +
        fieldHTML({ k: 'horsWilaya', l: 'Mission hors wilaya (+1 200 DA forfaitaires)', t: 'select', opts: ['Non', 'Oui'] }, 'Non') +
        fieldHTML({ k: 'lieu', l: 'Lieu / chantier' }, S.lastPointLieu || '') +
        fieldHTML({ k: 'note', l: 'Note (facultatif)', full: true }, '') +
        '<div class="full o-help">Seule une <b>ARRIVÉE</b> déclenche le paiement de la journée. Le forfait hors wilaya (1 200 DA) est versé <b>une seule fois par mission</b> (même référence). La position GPS est facultative.</div>' +
      '</div>',
      async function (data) {
        var gps = '—';
        if (navigator.geolocation) {
          gps = await new Promise(function (resolve) {
            navigator.geolocation.getCurrentPosition(function (pos) {
              resolve(pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4));
            }, function () { resolve('GPS non disponible'); }, { timeout: 3000 });
          });
        }
        try {
          await api('/api/pointages/point', { method: 'POST', body: {
            empId: data.empId, type: data.type, date: data.date, lieu: data.lieu,
            heuresSup: Number(data.heuresSup || 0),
            deplacement: data.deplacement === 'Oui' ? 1 : 0,
            horsWilaya: data.horsWilaya === 'Oui' ? 1 : 0,
            mission: data.mission,
            note: data.note, gps: gps,
          } });
          S.lastPointLieu = data.lieu;
          closeModal();
          toast('Pointage enregistré — montant calculé automatiquement', 'ok');
          renderView();
        } catch (err) { toast(err.message, 'err'); }
      }, 'Enregistrer le pointage');
  }

  /* ---------------- CAISSE & AVANCES ---------------- */
  function soldeCaisseLocal(rows) {
    var e = 0, s = 0, a = 0;
    (rows || []).forEach(function (r) {
      var m = Number(r.montant || 0);
      if (r.type === 'Entrée') e += m;
      else if (r.type === 'Sortie') s += m;
      else if (r.type === 'Avance') a += m;
    });
    return {
      entrees: Math.round(e * 100) / 100, sorties: Math.round(s * 100) / 100,
      avances: Math.round(a * 100) / 100, solde: Math.round((e - s - a) * 100) / 100,
    };
  }

  async function renderCaisseView() {
    var rows = await api('/api/caisse');
    var ym = todayKey().slice(0, 7);
    var info = soldeCaisseLocal(rows);
    var avancesMois = rows.filter(function (r) { return r.type === 'Avance' && String(r.date || '').slice(0, 7) === ym; })
      .reduce(function (s, r) { return s + Number(r.montant || 0); }, 0);
    var list = rows.slice().sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });

    var byEmp = {};
    rows.filter(function (r) { return r.type === 'Avance'; }).forEach(function (r) {
      byEmp[r.empId || r.emp || '—'] = (byEmp[r.empId || r.emp || '—'] || 0) + Number(r.montant || 0);
    });
    var avBody = Object.keys(byEmp).length ? Object.keys(byEmp).map(function (id) {
      return '<tr><td class="cell-main">' + esc(refName('users', id) || id) + '</td><td class="r"><b>' + money(byEmp[id]) + '</b></td>' +
        '<td>' + (S.data.salaires || []).filter(function (x) { return x.empId === id; }).map(function (x) {
          return '<span class="cell-sub">net ' + money(x.net) + ' · brut ' + money(x.brut) + '</span>';
        }).join('') + '</td></tr>';
    }).join('') : '<tr><td colspan="3"><div class="o-empty">Aucune avance enregistrée</div></td></tr>';

    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">Caisse & Avances</h2>' +
      '<p class="o-view-sub">Entrées, sorties et avances sur salaire · solde = entrées − sorties − avances</p></div>' +
      '<div class="o-actions">' +
        '<button class="o-btn o-btn-default" data-act="export-caisse">' + icon('download') + ' CSV</button>' +
        '<button class="o-btn o-btn-default" data-act="caisse-add">' + icon('plus') + ' Opération</button>' +
        '<button class="o-btn o-btn-primary" data-act="caisse-avance">' + icon('wallet') + ' Avance à un employé</button>' +
      '</div></div>' +
      '<div class="o-kpis">' +
        kpi('Solde de la caisse', money(info.solde), 'disponible', info.solde >= 0 ? 'green' : 'red') +
        kpi('Entrées', money(info.entrees), 'total', 'teal') +
        kpi('Sorties', money(info.sorties), 'total', 'amber') +
        kpi('Avances du mois', money(avancesMois), ym, 'purple') +
      '</div>' +
      '<div class="o-cols-2">' +
        '<div class="o-panel"><div class="o-panel-head">Journal de caisse <span class="o-badge purple">' + rows.length + '</span></div>' +
        '<div class="o-panel-body" style="padding:0;max-height:440px;overflow:auto"><div class="o-table-scroll"><table class="o-list">' +
        '<thead><tr><th>Date</th><th>Type</th><th>Libellé</th><th class="r">Montant</th><th>Mode</th></tr></thead><tbody>' +
          (list.length ? list.map(function (r) {
            return '<tr data-caisse-row="' + esc(r.id) + '" style="cursor:pointer"><td>' + esc(dFr(r.date)) + '</td><td>' + badge(r.type) + '</td>' +
              '<td class="cell-main">' + esc(r.libelle || '—') + (r.emp ? '<div class="cell-sub">' + esc(r.emp) + '</div>' : '') + '</td>' +
              '<td class="r"><b>' + money(r.montant) + '</b></td><td>' + esc(r.modePaiement || '—') + '</td></tr>';
          }).join('') : '<tr><td colspan="5"><div class="o-empty">Aucune opération de caisse</div></td></tr>') +
        '</tbody></table></div></div></div>' +
        '<div class="o-panel"><div class="o-panel-head">Avances par employé <span class="o-badge amber">' + money(info.avances) + '</span></div>' +
        '<div class="o-panel-body" style="padding:0;max-height:440px;overflow:auto"><div class="o-table-scroll"><table class="o-list">' +
        '<thead><tr><th>Employé</th><th class="r">Total avancé</th><th>Situation salaire</th></tr></thead><tbody>' + avBody + '</tbody></table></div></div></div>' +
      '</div>' +
    '</div>';
  }

  function bindCaisse() {
    var add = document.querySelector('[data-act="caisse-add"]');
    if (add) add.onclick = function () { openForm('caisse'); };
    var av = document.querySelector('[data-act="caisse-avance"]');
    if (av) av.onclick = function () { openAvanceModal(); };
    var ex = document.querySelector('[data-act="export-caisse"]');
    if (ex) ex.onclick = function () { downloadExport('caisse'); };
    Array.prototype.forEach.call(document.querySelectorAll('[data-caisse-row]'), function (tr) {
      tr.onclick = function () { openForm('caisse', tr.getAttribute('data-caisse-row')); };
    });
  }

  function openAvanceModal(empId) {
    openModal('Avance sur salaire',
      '<div class="o-form-grid">' +
        fieldHTML({ k: 'empId', l: 'Employé', t: 'rel', rel: 'users', req: true }, empId || '') +
        fieldHTML({ k: 'montant', l: 'Montant (DA)', t: 'number', req: true }, '') +
        fieldHTML({ k: 'date', l: 'Date', t: 'date', req: true }, todayKey()) +
        fieldHTML({ k: 'modePaiement', l: 'Mode de paiement', t: 'select', opts: ['espèces', 'virement', 'chèque'] }, 'espèces') +
        fieldHTML({ k: 'motif', l: 'Motif', full: true, placeholder: 'Ex : avance sur salaire, carburant…' }, '') +
        '<div class="full o-help">L\'avance est inscrite dans la caisse (type « Avance ») et déduite du salaire calculé dans le module Employés.</div>' +
      '</div>',
      async function (data) {
        try {
          await api('/api/caisse/avance', { method: 'POST', body: data });
          closeModal();
          toast('Avance versée et déduite du salaire', 'ok');
          renderView();
        } catch (err) { toast(err.message, 'err'); }
      }, 'Verser l\'avance');
  }

  /* ---------------- CONTRATS + OCR ---------------- */
  async function renderContratsView() {
    var rows = await api('/api/contrats');
    return '<div class="o-sheet">' +
      '<div class="o-view-head"><div><h2 class="o-view-title">Contrats & Conventions</h2><p class="o-view-sub">Photo facture, contrat ou JCP → lecture automatique par IA (Gemini)</p></div>' +
      '<div class="o-actions"><button class="o-btn o-btn-default" data-act="export">' + icon('download') + ' CSV</button><button class="o-btn o-btn-primary" data-act="create">' + icon('plus') + ' Nouveau contrat</button></div></div>' +
      '<div class="o-cols-2">' +
        '<div class="o-panel"><div class="o-panel-head">📸 Scanner avec l\'IA</div><div class="o-panel-body">' +
          '<div class="o-field" style="margin-bottom:10px"><label>Type de document</label><select class="o-select" id="ocr-type"><option value="facture">Facture fournisseur</option><option value="contrat">Contrat / Convention</option><option value="autorisation">Autorisation / JCP</option></select></div>' +
          '<div class="o-scan" id="scan-zone"><div class="big" style="color:var(--o-teal)">' + icon('scan') + '</div><b>Glissez une photo ou un PDF ici</b><div class="o-help">ou cliquez pour choisir / prendre une photo — l\'IA remplit les champs</div>' +
            '<input type="file" id="scan-file" accept="image/*,application/pdf" hidden>' +
            '<div style="margin-top:10px"><button class="o-btn o-btn-default o-btn-sm" id="scan-pick">Choisir une photo</button> <button class="o-btn o-btn-purple o-btn-sm" id="scan-demo">Démo sans photo</button></div>' +
            '<div id="scan-status" style="margin-top:10px"></div><div id="scan-preview"></div></div>' +
          '<div id="ocr-fields" style="margin-top:12px"></div>' +
          '<div style="display:flex;gap:8px;margin-top:10px"><button class="o-btn o-btn-primary o-btn-sm" id="ocr-save" disabled>Enregistrer le contrat</button><button class="o-btn o-btn-default o-btn-sm" id="ocr-clear">Effacer</button></div>' +
        '</div></div>' +
        '<div class="o-panel"><div class="o-panel-head">Contrats<span class="o-badge purple">' + rows.length + '</span></div><div class="o-panel-body" style="max-height:520px;overflow:auto">' +
          (rows.length ? rows.map(function (c) {
            return '<div style="border:1px solid var(--o-line);border-radius:6px;padding:10px 11px;margin-bottom:9px">' +
              '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><b style="font-size:12.5px">' + esc(c.objet) + '</b>' + badge(c.statut) + '</div>' +
              '<div style="font-size:11.5px;color:var(--o-muted);margin-top:4px">' + esc(c.type) + ' · ' + esc(c.ref || '') + ' · ' + esc(refName('clients', c.clientId) || '') + '</div>' +
              '<div style="font-size:11.5px;color:var(--o-muted);margin-top:3px">' + dFr(c.dateDep) + ' → ' + dFr(c.dateFin) + ' · <b>' + money(c.montant) + '</b></div>' +
              '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;font-size:10.5px">' +
                '<span class="o-badge blue">' + esc(c.periodicite || 'mensuel') + '</span>' +
                (c.sla ? '<span class="o-badge gray">SLA ' + esc(c.sla) + '</span>' : '') +
                (c.prochaineFacture ? '<span class="o-badge amber">Facture ' + dFr(c.prochaineFacture) + '</span>' : '') +
              '</div>' +
              '<div style="margin-top:7px;display:flex;gap:6px;flex-wrap:wrap">' +
                '<button class="o-btn o-btn-primary o-btn-sm" data-fact-contrat="' + esc(c.id) + '">' + icon('receipt') + ' Facturer</button>' +
                '<button class="o-btn o-btn-default o-btn-sm" data-edit-contrat="' + esc(c.id) + '">Modifier</button>' +
                '<button class="o-btn o-btn-danger o-btn-sm" data-del-contrat="' + esc(c.id) + '">Supprimer</button>' +
              '</div>' +
            '</div>';
          }).join('') : '<div class="o-empty">Aucun contrat</div>') +
        '</div></div>' +
      '</div>' +
    '</div>';
  }
  function bindContrats() {
    var file = document.getElementById('scan-file');
    var zone = document.getElementById('scan-zone');
    document.getElementById('scan-pick').onclick = function () { file.click(); };
    file.onchange = function () { if (file.files[0]) processScan(file.files[0]); };
    zone.ondragover = function (e) { e.preventDefault(); zone.classList.add('drag'); };
    zone.ondragleave = function () { zone.classList.remove('drag'); };
    zone.ondrop = function (e) { e.preventDefault(); if (e.dataTransfer.files[0]) processScan(e.dataTransfer.files[0]); };
    document.getElementById('scan-demo').onclick = function () {
      document.getElementById('scan-status').innerHTML = '<b>Extraction simulée…</b>';
      setTimeout(function () {
        document.getElementById('scan-status').innerHTML = '<span class="o-help">Confiance 98% · champs détectés</span>';
        fillOcrFields(demoParse(document.getElementById('ocr-type').value));
      }, 500);
    };
    document.getElementById('ocr-clear').onclick = function () {
      document.getElementById('ocr-fields').innerHTML = '';
      document.getElementById('scan-preview').innerHTML = '';
      document.getElementById('scan-status').innerHTML = '';
      document.getElementById('ocr-save').disabled = true;
    };
    document.getElementById('ocr-save').onclick = saveOcr;
    Array.prototype.forEach.call(document.querySelectorAll('[data-edit-contrat]'), function (b) {
      b.onclick = function () { openForm('contrats', b.getAttribute('data-edit-contrat')); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-fact-contrat]'), function (b) {
      b.onclick = async function () {
        b.disabled = true;
        try {
          var r = await api('/api/contrats/' + b.getAttribute('data-fact-contrat') + '/facturer', { method: 'POST' });
          toast('Facture ' + r.facture.num + ' créée · prochaine le ' + dFr(r.prochaineFacture), 'ok');
          renderView();
        } catch (err) {
          toast(err.message, 'err');
          b.disabled = false;
        }
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-del-contrat]'), function (b) {
      b.onclick = async function () {
        if (!confirm('Supprimer ce contrat ?')) return;
        await api('/api/contrats/' + b.getAttribute('data-del-contrat'), { method: 'DELETE' });
        toast('Contrat supprimé', 'ok');
        renderView();
      };
    });
  }
  async function processScan(file) {
    var status = document.getElementById('scan-status');
    var prev = document.getElementById('scan-preview');
    if (file.size > 8 * 1024 * 1024) {
      status.innerHTML = '<span style="color:var(--o-red);font-size:12px">Fichier trop volumineux (max 8 Mo)</span>';
      return;
    }
    prev.innerHTML = file.type === 'application/pdf'
      ? '<div class="o-help" style="margin-top:8px">📄 ' + esc(file.name) + '</div>'
      : '<img class="o-scan-img" src="' + URL.createObjectURL(file) + '">';
    status.innerHTML = '<div class="o-scanline"></div><b>Lecture du document par l\'IA… (10 à 30 s)</b>';
    var type = document.getElementById('ocr-type').value;
    try {
      var base64 = await fileToBase64(file);
      var res = await api('/api/ai/extract', {
        method: 'POST',
        body: { base64: base64, mimeType: file.type || 'image/jpeg', kind: type === 'facture' ? 'achat' : 'contrat' },
      });
      var d = res.data || {};
      status.innerHTML = '<span class="o-help">Confiance ' + Math.round(Number(d.confiance || 0) * 100) + '% · modèle ' + esc(res.model) + ' · ' + esc(d.documentType || 'document') + '</span>';
      fillOcrFields(d);
    } catch (err) {
      status.innerHTML = '<span style="color:var(--o-red);font-size:12px">' + esc(err.message) + '</span><br><button class="o-btn o-btn-default o-btn-sm" id="scan-fallback">Utiliser la démo</button>';
      var fb = document.getElementById('scan-fallback');
      if (fb) fb.onclick = function () { fillOcrFields(demoParse(type)); };
    }
  }
  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result).replace(/^data:[^;]+;base64,/, '')); };
      r.onerror = function () { reject(new Error('Lecture du fichier impossible')); };
      r.readAsDataURL(file);
    });
  }
  function demoParse(type) {
    return type === 'facture'
      ? { num: 'F-2026-102', fournisseur: 'Sarl Securelec Alger', client: 'Hôtel El Aurassi', date: '05/11/2026', due: '19/11/2026', ht: '1245000,00', ttc: '1481550,00', nif: '001234567890123', objet: 'Facture caméras + pose' }
      : { numero: 'CTR-2026-102', objet: 'Contrat maintenance détection incendie + RIA Hôtel El Aurassi', date: '2026-11-05', echeance: '2027-11-05', totalTTC: 320000, client: { nom: 'Hôtel El Aurassi' }, documentType: 'contrat' };
  }
  function fillOcrFields(p) {
    var c = p.client || {};
    var ct = p.contrat || {};
    var montant = p.totalTTC || ct.montant || p.ttc || 0;
    var nom = c.nom || (typeof p.client === 'string' ? p.client : '');
    var ref = p.numero || p.num || ('IA-' + Date.now());
    var objet = p.objet || ct.objet || '';
    var dateDep = p.date || '';
    var dateFin = p.echeance || ct.dateFin || p.dateFin || '';
    var match = '';
    (S.refs.clients || []).forEach(function (x) {
      if (!nom) return;
      var a = String(x.name || '').toLowerCase(), b = String(nom).toLowerCase();
      if (a.indexOf(b.slice(0, 10)) !== -1 || b.indexOf(a.slice(0, 10)) !== -1) match = x.id;
    });
    var typeVal = p.documentType === 'autorisation' ? 'Autorisation / JCP'
      : (p.documentType === 'contrat' ? 'Contrat de maintenance' : 'Convention');
    document.getElementById('ocr-fields').innerHTML =
      '<b style="font-size:12.5px">✅ Champs détectés par l\'IA — vérifiez puis enregistrez</b>' +
      '<div class="o-form-grid" style="margin-top:8px">' +
        fieldHTML({ k: 'ref', l: 'N° / Référence' }, ref) +
        fieldHTML({ k: 'clientId', l: 'Client', t: 'rel', rel: 'clients' }, match) +
        fieldHTML({ k: 'dateDep', l: 'Date début / document', t: 'date' }, dateDep) +
        fieldHTML({ k: 'dateFin', l: 'Date fin / échéance', t: 'date' }, dateFin) +
        fieldHTML({ k: 'montant', l: 'Montant TTC', t: 'number' }, String(montant).replace(',', '.')) +
        fieldHTML({ k: 'type', l: 'Type', t: 'select', opts: ['Contrat de maintenance', 'Convention', 'Contrat caméra', 'Contrat photovoltaïque', 'Autorisation / JCP'] }, typeVal) +
        '<div class="full">' + fieldHTML({ k: 'objet', l: 'Objet' }, objet) + '</div>' +
        (p.emetteur && p.emetteur.nom ? '<div class="full o-help">Émetteur détecté : ' + esc(p.emetteur.nom) + (p.emetteur.nif ? ' · NIF ' + esc(p.emetteur.nif) : '') + '</div>' : '') +
      '</div>';
    document.getElementById('ocr-save').disabled = false;
  }
  async function saveOcr() {
    var get = function (k) { var el = document.querySelector('#ocr-fields [name="' + k + '"]'); return el ? el.value : ''; };
    var montant = Number(String(get('montant')).replace(',', '.')) || 0;
    var body = {
      type: get('type') || 'Convention',
      clientId: get('clientId') || null,
      ref: get('ref') || ('IA-' + Date.now()),
      objet: get('objet') || 'Document scanné',
      dateDep: get('dateDep') || new Date().toISOString().slice(0, 10),
      dateFin: get('dateFin') || null,
      montant: montant,
      statut: 'actif',
    };
    await api('/api/contrats', { method: 'POST', body: body });
    toast('Contrat enregistré', 'ok');
    renderView();
  }

  /* ---------------- SCAN FACTURE D'ACHAT (IA) ---------------- */
  function openScanAchat() {
    var body =
      '<div class="o-scan" id="sa-zone">' +
        '<div class="big" style="color:var(--o-teal)">' + icon('scan') + '</div>' +
        '<b>Photo ou PDF de la facture fournisseur</b>' +
        '<div class="o-help">Glissez-déposez, choisissez un fichier ou prenez une photo. L\'IA extrait fournisseur, NIF, dates, montants, TVA et lignes.</div>' +
        '<input type="file" id="sa-file" accept="image/*,application/pdf" hidden>' +
        '<div style="margin-top:10px"><button type="button" class="o-btn o-btn-default o-btn-sm" id="sa-pick">Choisir un fichier</button> <button type="button" class="o-btn o-btn-purple o-btn-sm" id="sa-camera">Prendre une photo</button></div>' +
        '<div id="sa-status" style="margin-top:10px"></div>' +
        '<div id="sa-preview"></div>' +
      '</div>' +
      '<div id="sa-result" style="margin-top:14px"></div>';

    window.__scanAchatLines = [];
    openModal('Scanner une facture d\'achat — IA', body, async function (data) {
      if (!data.fournisseur && !data.num) { toast('Analysez d\'abord une facture', 'err'); return; }
      data.lignes = JSON.stringify(window.__scanAchatLines || []);
      data.statut = data.statut || 'à payer';
      try {
        var saved = await api('/api/factures_achat', { method: 'POST', body: data });
        closeModal();
        var nStock = Number((saved && saved.stockMaj) || 0);
        toast(nStock ? ('Facture enregistrée · ' + nStock + ' article(s) ajouté(s) au stock') : 'Facture d\'achat enregistrée', 'ok');
        navigate('achats');
      } catch (e) { toast(e.message, 'err'); }
    }, 'Enregistrer la facture');

    var file = document.getElementById('sa-file');
    var zone = document.getElementById('sa-zone');
    document.getElementById('sa-pick').onclick = function () { file.removeAttribute('capture'); file.setAttribute('accept', 'image/*,application/pdf'); file.click(); };
    document.getElementById('sa-camera').onclick = function () { file.setAttribute('capture', 'environment'); file.setAttribute('accept', 'image/*'); file.click(); };
    file.onchange = function () { if (file.files[0]) analyzeAchat(file.files[0]); };
    zone.ondragover = function (e) { e.preventDefault(); zone.classList.add('drag'); };
    zone.ondragleave = function () { zone.classList.remove('drag'); };
    zone.ondrop = function (e) { e.preventDefault(); zone.classList.remove('drag'); if (e.dataTransfer.files[0]) analyzeAchat(e.dataTransfer.files[0]); };
  }

  async function analyzeAchat(file) {
    var status = document.getElementById('sa-status');
    var prev = document.getElementById('sa-preview');
    if (file.size > 8 * 1024 * 1024) {
      status.innerHTML = '<span style="color:var(--o-red);font-size:12px">Fichier trop volumineux (max 8 Mo)</span>';
      return;
    }
    prev.innerHTML = file.type === 'application/pdf'
      ? '<div class="o-help" style="margin-top:8px">📄 ' + esc(file.name) + '</div>'
      : '<img class="o-scan-img" src="' + URL.createObjectURL(file) + '">';
    status.innerHTML = '<div class="o-scanline"></div><b>Analyse IA en cours… (10 à 30 s)</b>';
    document.getElementById('sa-result').innerHTML = '';
    try {
      var base64 = await fileToBase64(file);
      var res = await api('/api/ai/extract', { method: 'POST', body: { base64: base64, mimeType: file.type || 'image/jpeg', kind: 'achat' } });
      var d = res.data || {};
      status.innerHTML = '<span class="o-help">✅ Lecture terminée · confiance ' + Math.round(Number(d.confiance || 0) * 100) + '% · ' + esc(res.model) + '</span>';
      renderScanAchat(d);
    } catch (err) {
      status.innerHTML = '<span style="color:var(--o-red);font-size:12px">' + esc(err.message) + '</span>';
    }
  }

  function renderScanAchat(d) {
    var em = d.emetteur || {};
    var lignes = d.lignes || [];
    window.__scanAchatLines = lignes;
    var tva = 19;
    if (lignes.length && lignes[0].tva != null) tva = Number(lignes[0].tva) || 19;
    var ht = Number(d.totalHT || 0);
    var ttc = Number(d.totalTTC || 0);
    if (!ht && ttc) ht = ttc / (1 + tva / 100);
    if (!ttc && ht) ttc = ht * (1 + tva / 100);
    var lignesHtml = lignes.length
      ? ('<div class="o-table-scroll" style="margin-top:8px"><table class="o-list"><thead><tr><th>Désignation</th><th>Qté</th><th>P.U. HT</th><th>Montant</th><th>TVA</th></tr></thead><tbody>' +
        lignes.map(function (l) {
          return '<tr><td>' + esc(l.designation) + '</td><td class="num">' + num(l.quantite) + '</td><td class="num">' + money(l.prixUnitaireHT) + '</td><td class="num">' + money(l.montantHT || (Number(l.quantite || 0) * Number(l.prixUnitaireHT || 0))) + '</td><td class="num">' + num(l.tva) + ' %</td></tr>';
        }).join('') + '</tbody></table></div>')
      : '<div class="o-help">Aucune ligne détectée — vous pourrez compléter après enregistrement.</div>';
    document.getElementById('sa-result').innerHTML =
      '<b style="font-size:12.5px">✅ Champs extraits — vérifiez puis enregistrez</b>' +
      '<div class="o-form-grid" style="margin-top:8px">' +
        fieldHTML({ k: 'num', l: 'N° facture' }, d.numero || '') +
        fieldHTML({ k: 'fournisseur', l: 'Fournisseur', req: true }, em.nom || '') +
        fieldHTML({ k: 'fournisseurNif', l: 'NIF fournisseur' }, em.nif || '') +
        fieldHTML({ k: 'service', l: 'Pôle / service', t: 'select', opts: POLE_OPTS }, d.pole || 'COMMUN') +
        fieldHTML({ k: 'date', l: 'Date', t: 'date' }, d.date || '') +
        fieldHTML({ k: 'echeance', l: 'Échéance', t: 'date' }, d.echeance || '') +
        fieldHTML({ k: 'modePaiement', l: 'Mode de paiement', t: 'select', opts: ['virement', 'chèque', 'espèces', 'traite'] }, String(d.modePaiement || '').toLowerCase() === 'cheque' ? 'chèque' : (d.modePaiement || '')) +
        fieldHTML({ k: 'totalHT', l: 'Total HT', t: 'number' }, ht ? ht.toFixed(2) : '') +
        fieldHTML({ k: 'tva', l: 'TVA %', t: 'number' }, tva) +
        fieldHTML({ k: 'totalTTC', l: 'Total TTC', t: 'number' }, ttc ? ttc.toFixed(2) : '') +
        fieldHTML({ k: 'statut', l: 'Statut', t: 'select', opts: ['reçue', 'à payer', 'payée', 'litige'] }, 'à payer') +
        '<div class="full">' + fieldHTML({ k: 'objet', l: 'Objet' }, d.objet || '') + '</div>' +
      '</div>' +
      lignesHtml;
  }

  /* ---------------- SCAN JUSTIFICATIF DE DÉPENSE (IA) ---------------- */
  function openScanDepense() {
    var body =
      '<div class="o-scan" id="sd-zone">' +
        '<div class="big" style="color:var(--o-teal)">' + icon('scan') + '</div>' +
        '<b>Photo ou PDF du justificatif</b>' +
        '<div class="o-help">Ticket de caisse, facture d\'énergie, carburant, télécom, loyer… L\'IA extrait la date, le montant TTC, la TVA et le fournisseur, puis propose une catégorie.</div>' +
        '<input type="file" id="sd-file" accept="image/*,application/pdf" hidden>' +
        '<div style="margin-top:10px"><button type="button" class="o-btn o-btn-default o-btn-sm" id="sd-pick">Choisir un fichier</button> <button type="button" class="o-btn o-btn-purple o-btn-sm" id="sd-camera">Prendre une photo</button></div>' +
        '<div id="sd-status" style="margin-top:10px"></div>' +
        '<div id="sd-preview"></div>' +
      '</div>' +
      '<div id="sd-result" style="margin-top:14px"></div>';

    openModal('Scanner un justificatif de dépense — IA', body, async function (data) {
      if (!data.libelle || !Number(data.montant)) { toast('Analysez d\'abord un justificatif', 'err'); return; }
      try {
        await api('/api/depenses', { method: 'POST', body: data });
        closeModal();
        toast('Dépense enregistrée', 'ok');
        navigate('depenses');
      } catch (e) { toast(e.message, 'err'); }
    }, 'Enregistrer la dépense');

    var file = document.getElementById('sd-file');
    var zone = document.getElementById('sd-zone');
    document.getElementById('sd-pick').onclick = function () { file.removeAttribute('capture'); file.setAttribute('accept', 'image/*,application/pdf'); file.click(); };
    document.getElementById('sd-camera').onclick = function () { file.setAttribute('capture', 'environment'); file.setAttribute('accept', 'image/*'); file.click(); };
    file.onchange = function () { if (file.files[0]) analyzeDepense(file.files[0]); };
    zone.ondragover = function (e) { e.preventDefault(); zone.classList.add('drag'); };
    zone.ondragleave = function () { zone.classList.remove('drag'); };
    zone.ondrop = function (e) { e.preventDefault(); zone.classList.remove('drag'); if (e.dataTransfer.files[0]) analyzeDepense(e.dataTransfer.files[0]); };
  }

  async function analyzeDepense(file) {
    var status = document.getElementById('sd-status');
    var prev = document.getElementById('sd-preview');
    if (file.size > 8 * 1024 * 1024) {
      status.innerHTML = '<span style="color:var(--o-red);font-size:12px">Fichier trop volumineux (max 8 Mo)</span>';
      return;
    }
    prev.innerHTML = file.type === 'application/pdf'
      ? '<div class="o-help" style="margin-top:8px">📄 ' + esc(file.name) + '</div>'
      : '<img class="o-scan-img" src="' + URL.createObjectURL(file) + '">';
    status.innerHTML = '<div class="o-scanline"></div><b>Lecture du justificatif par l\'IA… (10 à 30 s)</b>';
    document.getElementById('sd-result').innerHTML = '';
    try {
      var base64 = await fileToBase64(file);
      var res = await api('/api/ai/depense', { method: 'POST', body: { base64: base64, mimeType: file.type || 'image/jpeg' } });
      var d = res.data || {};
      status.innerHTML = '<span class="o-help">✅ Lecture terminée · confiance ' + Math.round(Number(d.confiance || 0) * 100) + '% · ' + esc(res.model) + '</span>';
      renderScanDepense(d);
    } catch (err) {
      status.innerHTML = '<span style="color:var(--o-red);font-size:12px">' + esc(err.message) + '</span>';
    }
  }

  function renderScanDepense(d) {
    var cats = ['Loyer', 'Énergie', 'Carburant', 'Fournitures', 'Télécom', 'Entretien', 'Salaires', 'Assurances', 'Transport', 'Impôts & taxes', 'Divers'];
    var cat = cats.indexOf(d.categorie) !== -1 ? d.categorie : 'Divers';
    var today = new Date().toISOString().slice(0, 10);
    var mode = String(d.modePaiement || '').toLowerCase();
    document.getElementById('sd-result').innerHTML =
      '<b style="font-size:12.5px">✅ Champs détectés par l\'IA — vérifiez puis enregistrez</b>' +
      '<div class="o-form-grid" style="margin-top:8px">' +
        fieldHTML({ k: 'date', l: 'Date', t: 'date' }, String(d.date || '').slice(0, 10) || today) +
        fieldHTML({ k: 'categorie', l: 'Catégorie', t: 'select', opts: cats }, cat) +
        '<div class="full">' + fieldHTML({ k: 'libelle', l: 'Libellé', req: true }, d.libelle || (d.fournisseur ? 'Dépense ' + d.fournisseur : '')) + '</div>' +
        fieldHTML({ k: 'montant', l: 'Montant TTC (DA)', t: 'number', req: true }, Number(d.montant || 0) ? String(d.montant) : '') +
        fieldHTML({ k: 'modePaiement', l: 'Mode de paiement', t: 'select', opts: ['espèces', 'chèque', 'virement', 'carte', 'prélèvement'] }, ['espèces', 'chèque', 'virement', 'carte', 'prélèvement'].indexOf(mode) !== -1 ? mode : '') +
        fieldHTML({ k: 'ref', l: 'N° pièce / référence' }, d.reference || '') +
        '<div class="full">' + fieldHTML({ k: 'notes', l: 'Notes', t: 'textarea' }, d.notes || '') + '</div>' +
        (d.fournisseur ? '<div class="full o-help">Émetteur détecté : ' + esc(d.fournisseur) + (Number(d.tva) ? ' · TVA ' + num(d.tva) + ' %' : '') + '</div>' : '') +
      '</div>';
  }

  /* ---------------- SCAN DOCUMENT → VENTE / DEVIS / FACTURE (IA) ---------------- */
  var SCAN_DOC = {
    vente: {
      title: 'Scanner un document de vente — IA',
      intro: "Facture de vente, ticket, bon de livraison ou document émis par l'entreprise. L'IA lit les articles, le client, le pôle et les montants.",
    },
    devis: {
      title: 'Scanner un devis — IA',
      intro: "Devis, proposition, offre de prix ou facture proforma. L'IA reconstruit le client, l'objet et les lignes chiffrées.",
    },
    facture: {
      title: 'Scanner une facture de vente — IA',
      intro: "Facture ou bon de livraison émis par l'entreprise. L'IA prépare la facture avec le client, les lignes et la TVA.",
    },
  };
  var SCAN_DOC_LABELS = {
    devis: 'Devis', facture_vente: 'Facture de vente', facture_achat: "Facture d'achat",
    facture_proforma: 'Facture proforma', bon_commande: 'Bon de commande', bon_livraison: 'Bon de livraison',
    contrat: 'Contrat', convention: 'Convention', autorisation: 'Autorisation', assurance: 'Assurance', autre: 'Document',
  };

  function scanClientMatch(nom, nif) {
    var n = String(nom || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    var f = String(nif || '').replace(/\D/g, '');
    var out = '';
    (S.refs.clients || []).forEach(function (c) {
      var cn = String(c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      var cf = String(c.nif || '').replace(/\D/g, '');
      if (!out && f && cf && f === cf) out = c.id;
      else if (!out && n && cn && (cn.indexOf(n) !== -1 || n.indexOf(cn) !== -1)) out = c.id;
    });
    return out;
  }

  function scanStockMatch(designation, svc) {
    var norm = function (v) {
      return String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    };
    var needle = norm(designation);
    if (needle.length < 4) return '';
    var best = '', bestScore = 0;
    (S.data.stock || []).forEach(function (s) {
      if (svc && (s.service || 'COMMUN') !== svc) return;
      var hay = norm(s.nom + ' ' + (s.ref || ''));
      if (!hay) return;
      var score = hay.indexOf(needle) !== -1 || needle.indexOf(hay) !== -1 ? 100 : 0;
      if (!score) {
        var words = needle.split(' ').filter(function (w) { return w.length > 3; });
        score = words.filter(function (w) { return hay.indexOf(w) !== -1; }).length;
      }
      if (score > bestScore) { bestScore = score; best = s.id; }
    });
    return bestScore >= 2 ? best : '';
  }

  function openScanDocument(kind) {
    var cfg = SCAN_DOC[kind];
    if (!cfg) return;
    window.__scanDoc = { kind: kind, data: null };
    var body =
      '<div class="o-scan" id="sdoc-zone">' +
        '<div class="big" style="color:var(--o-teal)">' + icon('scan') + '</div>' +
        '<b>' + esc(cfg.title.replace(' — IA', '')) + '</b>' +
        '<div class="o-help">' + esc(cfg.intro) + '<br>Glissez-déposez, choisissez un fichier ou prenez une photo (JPG, PNG, PDF — 8 Mo max).</div>' +
        '<input type="file" id="sdoc-file" accept="image/*,application/pdf" hidden>' +
        '<div style="margin-top:10px"><button type="button" class="o-btn o-btn-default o-btn-sm" id="sdoc-pick">' + icon('upload') + ' Choisir un fichier</button> <button type="button" class="o-btn o-btn-purple o-btn-sm" id="sdoc-camera">' + icon('camera') + ' Prendre une photo</button></div>' +
        '<div id="sdoc-status" style="margin-top:10px"></div>' +
        '<div id="sdoc-preview"></div>' +
      '</div>' +
      '<div id="sdoc-result" style="margin-top:14px"></div>';

    openModal(cfg.title, body, function (data) { saveScanDocument(data); }, 'Enregistrer');

    var file = document.getElementById('sdoc-file');
    var zone = document.getElementById('sdoc-zone');
    document.getElementById('sdoc-pick').onclick = function () { file.removeAttribute('capture'); file.setAttribute('accept', 'image/*,application/pdf'); file.click(); };
    document.getElementById('sdoc-camera').onclick = function () { file.setAttribute('capture', 'environment'); file.setAttribute('accept', 'image/*'); file.click(); };
    file.onchange = function () { if (file.files[0]) analyzeScanDocument(file.files[0]); };
    zone.ondragover = function (e) { e.preventDefault(); zone.classList.add('drag'); };
    zone.ondragleave = function () { zone.classList.remove('drag'); };
    zone.ondrop = function (e) { e.preventDefault(); zone.classList.remove('drag'); if (e.dataTransfer.files[0]) analyzeScanDocument(e.dataTransfer.files[0]); };
  }

  async function analyzeScanDocument(file) {
    var st = window.__scanDoc || {};
    var status = document.getElementById('sdoc-status');
    var prev = document.getElementById('sdoc-preview');
    if (file.size > 8 * 1024 * 1024) {
      status.innerHTML = '<span style="color:var(--o-red);font-size:12px">Fichier trop volumineux (max 8 Mo)</span>';
      return;
    }
    if (!/^image\//.test(file.type) && file.type !== 'application/pdf') {
      status.innerHTML = '<span style="color:var(--o-red);font-size:12px">Format non pris en charge (image ou PDF)</span>';
      return;
    }
    prev.innerHTML = file.type === 'application/pdf'
      ? '<div class="o-help" style="margin-top:8px">' + icon('file') + ' ' + esc(file.name) + '</div>'
      : '<img class="o-scan-img" src="' + URL.createObjectURL(file) + '">';
    status.innerHTML = '<div class="o-scanline"></div><b>Lecture du document par l\'IA… (10 à 30 s)</b>';
    document.getElementById('sdoc-result').innerHTML = '';
    try {
      var base64 = await fileToBase64(file);
      var res = await api('/api/ai/extract', { method: 'POST', body: { base64: base64, mimeType: file.type || 'image/jpeg', kind: st.kind } });
      var d = res.data || {};
      st.data = d;
      status.innerHTML = '<span class="o-help">✅ Lecture terminée · confiance ' + Math.round(Number(d.confiance || 0) * 100) + '% · modèle ' + esc(res.model) + '</span>';
      renderScanDocument(d, res.model);
    } catch (err) {
      status.innerHTML = '<span style="color:var(--o-red);font-size:12px">' + esc(err.message) + '</span>';
    }
  }

  function scanDocLineHTML(kind, l, i, svc) {
    var stockSel = '';
    if (kind === 'vente') {
      stockSel = '<div><select class="o-select" data-f="stockId"><option value="">— Hors stock —</option>' +
        (S.data.stock || []).filter(function (s) { return !svc || (s.service || 'COMMUN') === svc; }).map(function (s) {
          return '<option value="' + esc(s.id) + '"' + (s.id === l.stockId ? ' selected' : '') + '>' + esc(s.ref + ' — ' + s.nom) + '</option>';
        }).join('') + '</select></div>';
    }
    var cols = kind === 'vente' ? '1.05fr 1.25fr .5fr .7fr .75fr 28px' : '1.7fr .5fr .7fr .75fr 28px';
    return '<div class="sdoc-line" data-line="' + i + '" style="display:grid;grid-template-columns:' + cols + ';gap:6px;align-items:center;margin-bottom:6px">' +
      stockSel +
      '<div><input class="o-input" data-f="desc" placeholder="Désignation" value="' + esc(l.designation || '') + '"></div>' +
      '<div><input class="o-input" data-f="qty" type="number" step="any" min="0" value="' + Number(l.qty || 0) + '"></div>' +
      '<div><input class="o-input" data-f="pu" type="number" step="any" min="0" value="' + Number(l.pu || 0) + '"></div>' +
      '<div class="o-line-total" data-total style="text-align:right;font-size:12px">0</div>' +
      '<div><button type="button" class="o-btn o-btn-danger o-btn-sm" data-rm style="height:24px;padding:0 7px">✕</button></div>' +
    '</div>';
  }

  function renderScanDocument(d, model) {
    var st = window.__scanDoc || {};
    var kind = st.kind;
    var em = d.emetteur || {};
    var cl = d.client || {};
    var svc = d.pole || 'COMMUN';
    var tva = 19;
    var lignes = Array.isArray(d.lignes) ? d.lignes : [];
    if (lignes.length && lignes[0].tva != null && Number(lignes[0].tva) > 0) tva = Number(lignes[0].tva);
    var match = scanClientMatch(cl.nom, cl.nif);
    var today = new Date().toISOString().slice(0, 10);
    var date = String(d.date || '').slice(0, 10) || today;
    var due = String(d.echeance || '').slice(0, 10);
    var lignesUi = lignes.map(function (l) {
      var designation = String(l.designation || l.description || '');
      return {
        designation: designation,
        qty: Number(l.quantite || l.qty || 1),
        pu: Number(l.prixUnitaireHT != null ? l.prixUnitaireHT : (l.pu || 0)),
        stockId: kind === 'vente' ? scanStockMatch(designation, svc) : '',
      };
    });

    var clientField = '<div class="o-field"><label>Client</label><select class="o-select" name="clientId">' +
      '<option value="">— Aucun client sélectionné —</option>' +
      (S.refs.clients || []).map(function (c) {
        return '<option value="' + esc(c.id) + '"' + (c.id === match ? ' selected' : '') + '>' + esc(c.name) + '</option>';
      }).join('') + '</select></div>';
    var clientInfo = '';
    if (cl.nom && !match) {
      clientInfo = '<div class="full o-help" style="border:1px dashed var(--o-line);border-radius:6px;padding:7px 9px">' +
        '<b>Client détecté : ' + esc(cl.nom) + '</b>' +
        (cl.nif ? ' · NIF ' + esc(cl.nif) : '') + (cl.rc ? ' · RC ' + esc(cl.rc) : '') +
        '<label style="display:flex;align-items:center;gap:7px;margin-top:5px;cursor:pointer"><input type="checkbox" name="newClient" checked> Créer automatiquement ce client dans l\'ERP</label>' +
        (cl.adresse ? '<div>' + esc(cl.adresse) + '</div>' : '') +
        '</div>';
    }
    var objetValue = d.objet || d.titre || ((SCAN_DOC_LABELS[d.documentType] || 'Document') + (d.numero ? ' ' + d.numero : ''));
    var commonFields =
      clientField + clientInfo +
      fieldHTML({ k: 'service', l: 'Pôle / service', t: 'select', opts: POLE_OPTS, req: true }, svc) +
      fieldHTML({ k: 'tva', l: 'TVA %', t: 'number' }, tva) +
      fieldHTML({ k: 'date', l: 'Date', t: 'date' }, date) +
      fieldHTML({ k: 'modePaiement', l: 'Mode de paiement', t: 'select', opts: ['virement', 'chèque', 'espèces', 'traite'] },
        ['virement', 'chèque', 'espèces', 'traite'].indexOf(String(d.modePaiement || '').toLowerCase()) !== -1 ? String(d.modePaiement || '').toLowerCase() : '');
    var specific = '';
    if (kind === 'devis') {
      specific = '<div class="full">' + fieldHTML({ k: 'titre', l: 'Objet', req: true }, objetValue) + '</div>' +
        fieldHTML({ k: 'validite', l: 'Validité', t: 'select', opts: ['15 jours', '30 jours', '45 jours', '60 jours', '90 jours'] }, '30 jours') +
        fieldHTML({ k: 'remise', l: 'Remise (%)', t: 'number' }, 0) +
        '<div class="full">' + fieldHTML({ k: 'reference', l: 'N° du document (référence)' }, d.numero || '') + '</div>';
    } else if (kind === 'facture') {
      specific = '<div class="full">' + fieldHTML({ k: 'objet', l: 'Objet' }, objetValue) + '</div>' +
        fieldHTML({ k: 'echeance', l: 'Échéance', t: 'date' }, due || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)) +
        '<div class="full">' + fieldHTML({ k: 'reference', l: 'N° de facture (référence)' }, d.numero || '') + '</div>';
    } else {
      specific = '<div class="full">' + fieldHTML({ k: 'notes', l: 'Notes / référence' }, (d.numero ? 'N° ' + d.numero + ' · ' : '') + objetValue) + '</div>' +
        (cl.nom ? '<div class="full">' + fieldHTML({ k: 'tiers', l: 'Client affiché sur la vente' }, cl.nom) + '</div>' : '');
    }
    var linesHtml = '<div class="sdoc-lines">' + (lignesUi.length
      ? lignesUi.map(function (l, i) { return scanDocLineHTML(kind, l, i, svc); }).join('')
      : '') + '</div>';
    var warning = '';
    if (d.sens === 'achat' && kind !== 'achat') {
      warning = '<div class="o-alert amber" style="margin-bottom:10px"><b>Document détecté comme un achat</b><div>L\'émetteur est le fournisseur. Vous pouvez l\'enregistrer ici ou le scanner depuis le module Achats.</div></div>';
    }
    document.getElementById('sdoc-result').innerHTML =
      warning +
      '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">' +
        '<b style="font-size:13px">✅ Champs extraits — vérifiez puis enregistrez</b>' +
        '<span class="o-badge purple">' + esc(SCAN_DOC_LABELS[d.documentType] || 'Document') + '</span>' +
        (d.numero ? '<span class="o-badge gray">N° ' + esc(d.numero) + '</span>' : '') +
        '<span class="o-help" style="margin-left:auto">' + esc(em.nom || '') + (model ? ' · ' + esc(model) : '') + '</span>' +
      '</div>' +
      '<div class="o-form-grid">' + commonFields + specific + '</div>' +
      '<div style="margin-top:12px"><label style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b">Lignes extraites</label>' +
        '<div style="margin-top:6px">' + linesHtml + '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin-top:8px">' +
          '<button type="button" class="o-btn o-btn-default o-btn-sm" id="sdoc-add">+ Ajouter une ligne</button>' +
          '<div id="sdoc-totals" style="text-align:right;font-size:12.5px"></div>' +
        '</div>' +
        (d.totalTTC ? '<div class="o-help" style="margin-top:6px">Total TTC imprimé sur le document : <b>' + money(d.totalTTC) + '</b></div>' : '') +
      '</div>';
    bindScanDocLines();
    var add = document.getElementById('sdoc-add');
    if (add) add.onclick = function () {
      var host = document.querySelector('#sdoc-result .sdoc-lines');
      var svcEl = document.querySelector('#sdoc-result [name="service"]');
      if (!host) return;
      host.insertAdjacentHTML('beforeend', scanDocLineHTML(kind, { designation: '', qty: 1, pu: 0, stockId: '' }, host.children.length, svcEl ? svcEl.value : svc));
      bindScanDocLines();
    };
  }

  function bindScanDocLines() {
    Array.prototype.forEach.call(document.querySelectorAll('#sdoc-result .sdoc-line'), function (row) {
      Array.prototype.forEach.call(row.querySelectorAll('input,select'), function (el) {
        el.oninput = recalcScanDoc;
        el.onchange = recalcScanDoc;
      });
      var rm = row.querySelector('[data-rm]');
      if (rm) rm.onclick = function () { row.remove(); recalcScanDoc(); };
    });
    recalcScanDoc();
  }

  function recalcScanDoc() {
    var ht = 0;
    Array.prototype.forEach.call(document.querySelectorAll('#sdoc-result .sdoc-line'), function (row) {
      var q = Number((row.querySelector('[data-f="qty"]') || {}).value || 0);
      var p = Number((row.querySelector('[data-f="pu"]') || {}).value || 0);
      var t = q * p;
      ht += t;
      var cell = row.querySelector('[data-total]');
      if (cell) cell.textContent = money(t);
    });
    var tvaEl = document.querySelector('#sdoc-result [name="tva"]');
    var tva = Number(tvaEl ? tvaEl.value : 19) || 0;
    var remEl = document.querySelector('#sdoc-result [name="remise"]');
    var rem = Math.max(0, Math.min(100, Number(remEl ? remEl.value : 0) || 0));
    var net = ht - ht * rem / 100;
    var ttc = net * (1 + tva / 100);
    var box = document.getElementById('sdoc-totals');
    if (box) box.innerHTML = 'Total HT <b>' + money(net) + '</b><br>TVA ' + tva + ' % <b>' + money(ttc - net) + '</b><br><b style="font-size:14px">TTC ' + money(ttc) + '</b>';
    if (tvaEl) tvaEl.oninput = recalcScanDoc;
    if (remEl) remEl.oninput = recalcScanDoc;
  }

  function collectScanDocLines() {
    var out = [];
    Array.prototype.forEach.call(document.querySelectorAll('#sdoc-result .sdoc-line'), function (row) {
      var descEl = row.querySelector('[data-f="desc"]');
      var desc = descEl ? descEl.value.trim() : '';
      if (!desc) return;
      var stockEl = row.querySelector('[data-f="stockId"]');
      out.push({
        designation: desc,
        stockId: stockEl ? stockEl.value : '',
        qty: Number((row.querySelector('[data-f="qty"]') || {}).value || 0),
        pu: Number((row.querySelector('[data-f="pu"]') || {}).value || 0),
      });
    });
    return out;
  }

  async function saveScanDocument(data) {
    var st = window.__scanDoc || {};
    var kind = st.kind;
    var d = st.data || {};
    var lines = collectScanDocLines();
    if (!lines.length) { toast('Ajoutez au moins une ligne', 'err'); return; }
    var tva = Number(data.tva || 19) || 19;
    var ht = lines.reduce(function (s, l) { return s + l.qty * l.pu; }, 0);
    var totalHT = Math.round(ht * 100) / 100;
    var totalTTC = Math.round(ht * (1 + tva / 100) * 100) / 100;
    var clientId = data.clientId || '';
    if (!clientId && data.newClient && d.client && d.client.nom) {
      clientId = (await createScanClient(d.client)) || '';
    }
    var service = data.service || d.pole || 'COMMUN';
    try {
      if (kind === 'vente') {
        var vente = {
          type: 'vente', service: service, date: data.date || new Date().toISOString().slice(0, 10),
          clientId: clientId || null, tiers: data.tiers || (d.client && d.client.nom) || '',
          tva: tva, modePaiement: data.modePaiement || '', statut: 'confirmé',
          notes: data.notes || '', totalHT: totalHT, totalTTC: totalTTC,
          lignes: lines.map(function (l) { return { stockId: l.stockId || '', designation: l.designation, qty: l.qty, pu: l.pu }; }),
        };
        await api('/api/mouvements', { method: 'POST', body: vente });
        closeModal();
        toast('Vente enregistrée' + (clientId ? '' : ' — client non lié'), 'ok');
        navigate('ventes');
      } else if (kind === 'devis') {
        await api('/api/devis', { method: 'POST', body: {
          clientId: clientId || null, service: service, titre: data.titre || 'Devis importé',
          date: data.date || new Date().toISOString().slice(0, 10), validite: data.validite || '30 jours',
          status: 'brouillon', tva: tva, remise: Number(data.remise || 0),
          lignes: lines.map(function (l) { return { description: l.designation, qty: l.qty, pu: l.pu }; }),
        } });
        closeModal();
        toast('Devis créé depuis le scan', 'ok');
        navigate('devis');
      } else {
        await api('/api/factures', { method: 'POST', body: {
          clientId: clientId || null, service: service, objet: data.objet || 'Facture importée',
          montant: totalTTC, paye: 0, tva: tva, date: data.date || new Date().toISOString().slice(0, 10),
          due: data.echeance || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          modePaiement: data.modePaiement || '', status: 'envoyée',
          lignes: lines.map(function (l) { return { designation: l.designation, unite: 'U', quantite: l.qty, pu: l.pu, tva: tva }; }),
        } });
        closeModal();
        toast('Facture créée depuis le scan', 'ok');
        navigate('factures');
      }
    } catch (e) { toast(e.message, 'err'); }
  }

  async function createScanClient(c) {
    try {
      var row = await api('/api/clients', { method: 'POST', body: {
        name: c.nom, type: 'Entreprise', status: 'client', nif: c.nif || '', rc: c.rc || '',
        nis: c.nis || '', tin: c.tin || '', address: c.adresse || '', phone: c.telephone || '', email: c.email || '',
      } });
      S.refs.clients = S.refs.clients || [];
      S.refs.clients.push(row);
      toast('Client « ' + row.name + ' » créé', 'ok');
      return row.id;
    } catch (e) {
      toast('Client non créé : ' + e.message, 'err');
      return '';
    }
  }

  /* ---------------- ENCAISSEMENT ---------------- */
  async function openPayModal(id) {
    var rows = S.data['factures'] || [];
    var f = null;
    for (var i = 0; i < rows.length; i++) if (rows[i].id === id) f = rows[i];
    if (!f) {
      try { f = await api('/api/factures/' + encodeURIComponent(id)); }
      catch (e) { toast('Facture introuvable', 'err'); return; }
    }
    var reste = Number(f.montant || 0) - Number(f.paye || 0);
    openModal('Encaisser · ' + (f.num || ''),
      '<div class="o-form-grid">' +
        fieldHTML({ k: 'montant', l: 'Montant encaissé (DA)', t: 'number', req: true }, reste.toFixed(2)) +
        '<div class="full o-help">Reste dû : <b>' + money(reste) + '</b> · Total facture : ' + money(f.montant) + ' · Déjà payé : ' + money(f.paye) + '</div>' +
      '</div>',
      async function (data) {
        if (!Number(data.montant)) { toast('Saisissez un montant', 'err'); return; }
        try {
          await api('/api/factures/' + encodeURIComponent(id) + '/pay', { method: 'POST', body: { montant: Number(data.montant) } });
          closeModal();
          toast('Encaissement enregistré', 'ok');
          renderView();
        } catch (e) { toast(e.message, 'err'); }
      }, 'Encaisser');
  }

  /* ---------------- FORM ---------------- */
  function fieldHTML(f, value) {
    var id = 'f_' + f.k;
    var req = f.req ? ' <span class="req">*</span>' : '';
    var input;
    if (f.t === 'select') {
      var opts = f.opts || [];
      input = '<select class="o-select" name="' + f.k + '" id="' + id + '">' +
        '<option value="">—</option>' +
        opts.map(function (o) {
          var ov = (o && typeof o === 'object') ? o.v : o;
          var ol = (o && typeof o === 'object') ? (o.l || o.v) : o;
          return '<option value="' + esc(ov) + '"' + (String(ov) === String(value) ? ' selected' : '') + '>' + esc(ol) + '</option>';
        }).join('') +
        '</select>';
    } else if (f.t === 'rel') {
      var list = S.refs[f.rel] || [];
      input = '<select class="o-select" name="' + f.k + '" id="' + id + '">' +
        '<option value="">—</option>' +
        list.map(function (r) { return '<option value="' + esc(r.id) + '"' + (String(r.id) === String(value) ? ' selected' : '') + '>' + esc(r.name || r.nom || r.ref || r.id) + '</option>'; }).join('') +
        '</select>';
    } else if (f.t === 'textarea') {
      input = '<textarea class="o-textarea" name="' + f.k + '" id="' + id + '">' + esc(value || '') + '</textarea>';
    } else if (f.t === 'date') {
      var v = value ? String(value).slice(0, 10) : '';
      input = '<input class="o-input" type="date" name="' + f.k + '" id="' + id + '" value="' + esc(v) + '">';
    } else {
      input = '<input class="o-input" type="' + (f.t || 'text') + '" name="' + f.k + '" id="' + id + '" value="' + esc(value == null ? '' : value) + '"' + (f.t === 'number' ? ' step="any"' : '') + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>';
    }
    return '<div class="o-field' + (f.full ? ' full' : '') + '"><label>' + esc(f.l) + req + '</label>' + input + '</div>';
  }

  async function openForm(col, id) {
    var sch = SCHEMA[col];
    var row = {};
    if (id) {
      row = await api('/api/' + col + '/' + id);
    }
    if (col === 'devis') return openDevisForm(row, id);
    if (col === 'mouvements') return openMouvementForm(row, id);

    var fields = sch.fields.filter(function (f) { return !(f.createOnly && id); });
    var body = '<div class="o-form-grid">' + fields.map(function (f) {
      return fieldHTML(f, row[f.k] != null ? row[f.k] : (f.k === 'status' || f.k === 'statut' || f.k === 'phase' ? (f.opts || [])[0] : (f.k === 'active' ? '1' : '')));
    }).join('') + '</div>';

    if (col === 'users') {
      if (id) {
        body += '<div style="margin-top:14px;border-top:1px solid var(--o-line);padding-top:12px">' +
          fieldHTML({ k: 'pass', l: 'Réinitialiser le mot de passe (laisser vide pour conserver)', t: 'password' }) + '</div>';
      }
      body += permsFieldHTML(row.perms);
      body += servicesFieldHTML(row.services);
    }

    openModal((id ? 'Modifier · ' : 'Nouveau · ') + sch.singular, body, async function (data) {
      var permBoxes = document.querySelectorAll('#perms-box [data-perm]');
      if (permBoxes.length) {
        data.perms = Array.prototype.filter.call(permBoxes, function (b) { return b.checked; })
          .map(function (b) { return b.getAttribute('data-perm'); });
      }
      var svcBoxes = document.querySelectorAll('#services-box [data-svc]');
      if (svcBoxes.length) {
        data.services = Array.prototype.filter.call(svcBoxes, function (b) { return b.checked; })
          .map(function (b) { return b.getAttribute('data-svc'); });
      }
      try {
        if (id) await api('/api/' + col + '/' + id, { method: 'PUT', body: data });
        else await api('/api/' + col, { method: 'POST', body: data });
        closeModal();
        toast(id ? 'Modifié' : 'Créé', 'ok');
        await loadRefs();
        renderView();
      } catch (e) { toast(e.message, 'err'); }
    }, id ? 'Enregistrer' : 'Créer');

    if (id) addDeleteButton(col, id, sch.singular);
  }

  /* Suppression depuis le formulaire (l'API DELETE existait sans interface) */
  function addDeleteButton(col, id, label) {
    var foot = document.querySelector('#modal-root .o-modal-foot');
    if (!foot) return;
    var btn = document.createElement('button');
    btn.className = 'o-btn o-btn-danger';
    btn.textContent = 'Supprimer';
    btn.onclick = async function () {
      if (!confirm('Supprimer définitivement ce ' + String(label || 'élément').toLowerCase() + ' ?')) return;
      btn.disabled = true;
      try {
        await api('/api/' + col + '/' + id, { method: 'DELETE' });
        closeModal();
        toast('Supprimé', 'ok');
        await loadRefs();
        renderView();
      } catch (e) { toast(e.message, 'err'); btn.disabled = false; }
    };
    foot.insertBefore(btn, foot.firstChild);
  }

  /* Habilitation aux modules (permissions fines, en plus du rôle) */
  function permsFieldHTML(current) {
    var list = null;
    if (current) {
      try { var a = JSON.parse(current); if (Array.isArray(a) && a.length) list = a; } catch (e) {}
    }
    var mods = MODULES.filter(function (m) { return m.k !== 'apps' && m.k !== 'parametres'; });
    return '<div style="margin-top:14px;border-top:1px solid var(--o-line);padding-top:12px" id="perms-box">' +
      '<b style="font-size:12.5px">Accès aux modules</b>' +
      '<div class="o-help" style="margin:4px 0 8px">' +
        (list ? 'Droits personnalisés pour ce compte.' : 'Par défaut, les modules autorisés dépendent du rôle. Cochez pour personnaliser.') +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:6px 12px;font-size:12.5px">' +
        mods.map(function (m) {
          var pk = m.perm || m.k;
          var on = list ? list.indexOf(pk) !== -1 : false;
          return '<label style="display:flex;align-items:center;gap:7px;cursor:pointer">' +
            '<input type="checkbox" data-perm="' + esc(pk) + '"' + (on ? ' checked' : '') + '> ' + esc(m.l) + '</label>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  /* Pôles autorisés du compte (null/aucune case = tous les pôles) */
  function servicesFieldHTML(current) {
    var list = null;
    if (current) {
      try { var a = JSON.parse(current); if (Array.isArray(a) && a.length) list = a; } catch (e) {}
    }
    return '<div style="margin-top:14px;border-top:1px solid var(--o-line);padding-top:12px" id="services-box">' +
      '<b style="font-size:12.5px">Pôles autorisés</b>' +
      '<div class="o-help" style="margin:4px 0 8px">' +
        (list ? 'Ce compte ne voit que les pôles cochés (stock, ventes, achats, devis, factures, projets).' : 'Tous les pôles. Cochez pour limiter ce compte à une ou plusieurs activités.') +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:6px 12px;font-size:12.5px">' +
        POLES.map(function (p) {
          var on = list ? list.indexOf(p.code) !== -1 : false;
          return '<label style="display:flex;align-items:center;gap:7px;cursor:pointer">' +
            '<input type="checkbox" data-svc="' + esc(p.code) + '"' + (on ? ' checked' : '') + '> ' + esc(p.code + ' — ' + p.nom) + '</label>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function openDevisForm(row, id) {
    var lignes = row.lignes && row.lignes.length ? row.lignes : [{ description: '', qty: 1, pu: 0 }];
    var body =
      (id ? '<div style="margin-bottom:10px"><button type="button" class="o-btn o-btn-default o-btn-sm" id="dl-print">' + icon('printer') + ' Imprimer le devis</button> <button type="button" class="o-btn o-btn-default o-btn-sm" id="dl-bc">' + icon('file') + ' Bon de commande</button> <button type="button" class="o-btn o-btn-default o-btn-sm" id="dl-pf">' + icon('file') + ' Facture proforma</button></div>' : '') +
      '<div class="o-form-grid">' +
        fieldHTML({ k: 'clientId', l: 'Client', t: 'rel', rel: 'clients', req: true }, row.clientId || '') +
        fieldHTML({ k: 'service', l: 'Pôle / service', t: 'select', opts: POLE_OPTS, req: true }, row.service || (S.poleFilter || '') || 'COMMUN') +
        fieldHTML({ k: 'tva', l: 'TVA %', t: 'number' }, row.tva != null ? row.tva : 19) +
        '<div class="full">' + fieldHTML({ k: 'titre', l: 'Objet', req: true }, row.titre || '') + '</div>' +
        fieldHTML({ k: 'validite', l: 'Validité', t: 'select', opts: ['15 jours', '30 jours', '45 jours', '60 jours', '90 jours'] }, row.validite || '30 jours') +
        fieldHTML({ k: 'modePaiement', l: 'Mode de paiement', t: 'select', opts: ['chèque', 'virement', 'espèces', 'traite'] }, row.modePaiement || 'chèque') +
        fieldHTML({ k: 'status', l: 'Statut', t: 'select', opts: ['brouillon', 'envoyé', 'accepté', 'refusé'] }, row.status || 'brouillon') +
        fieldHTML({ k: 'remise', l: 'Remise commerciale (%)', t: 'number' }, row.remise != null ? row.remise : 0) +
      '</div>' +
      '<div style="margin-top:14px"><label style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b">Lignes</label>' +
        '<div class="o-lines"><div class="o-lines-head"><div>Description</div><div>Qté</div><div>P.U. HT</div><div>Total</div><div></div></div><div id="dl-lines">' +
          lignes.map(function (l) { return devisLineHTML(l); }).join('') +
        '</div><div class="o-totals" id="dl-totals"></div></div>' +
        '<button class="o-btn o-btn-default o-btn-sm" id="dl-add" style="margin-top:8px">+ Ajouter une ligne</button>' +
        '<div class="o-ai-box">' +
          '<div class="o-ai-title">' + icon('sparkles') + ' Générer les lignes avec l\'IA</div>' +
          '<div class="o-help">Décrivez le besoin en français : l\'IA propose désignations, quantités et prix réalistes en DA.</div>' +
          '<div style="display:flex;gap:8px;margin-top:8px"><input class="o-input" id="dl-brief" placeholder="Ex : 12 caméras IP 4MP + NVR 16 canaux + pose pour un hôtel à Alger"><button type="button" class="o-btn o-btn-purple" id="dl-ai">' + icon('sparkles') + ' Générer</button></div>' +
          '<div class="o-help" id="dl-ai-status" style="margin-top:6px"></div>' +
        '</div>' +
      '</div>';

    openModal((id ? 'Devis · ' + (row.num || '') : 'Nouveau devis'), body, async function (data) {
      var lines = [];
      Array.prototype.forEach.call(document.querySelectorAll('#dl-lines .o-line-row'), function (r) {
        var desc = r.querySelector('[data-f="description"]').value;
        if (!desc.trim()) return;
        lines.push({ description: desc, qty: Number(r.querySelector('[data-f="qty"]').value || 0), pu: Number(r.querySelector('[data-f="pu"]').value || 0) });
      });
      data.lignes = lines;
      try {
        if (id) await api('/api/devis/' + id, { method: 'PUT', body: data });
        else await api('/api/devis', { method: 'POST', body: data });
        closeModal();
        toast(id ? 'Devis modifié' : 'Devis créé', 'ok');
        renderView();
      } catch (e) { toast(e.message, 'err'); }
    }, id ? 'Enregistrer' : 'Créer');

    document.getElementById('dl-add').onclick = function () {
      document.getElementById('dl-lines').insertAdjacentHTML('beforeend', devisLineHTML({ description: '', qty: 1, pu: 0 }));
      bindDevisLines();
      recalcDevis();
    };
    var printBtn = document.getElementById('dl-print');
    if (printBtn) {
      printBtn.onclick = function () {
        previewDoc('/api/devis/' + encodeURIComponent(id) + '/print?token=' + encodeURIComponent(token()), 'Devis ' + (row.num || ''));
      };
    }
    var bcBtn = document.getElementById('dl-bc');
    if (bcBtn) {
      bcBtn.onclick = function () {
        previewDoc('/api/devis/' + encodeURIComponent(id) + '/bon-commande?token=' + encodeURIComponent(token()), 'Bon de commande');
      };
    }
    var pfBtn = document.getElementById('dl-pf');
    if (pfBtn) {
      pfBtn.onclick = function () {
        previewDoc('/api/devis/' + encodeURIComponent(id) + '/proforma?token=' + encodeURIComponent(token()), 'Facture proforma');
      };
    }
    document.getElementById('dl-ai').onclick = async function () {
      var brief = document.getElementById('dl-brief').value.trim();
      var st = document.getElementById('dl-ai-status');
      if (brief.length < 3) { toast('Décrivez le besoin', 'err'); return; }
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'Génération…';
      st.innerHTML = 'Appel de l\'IA en cours (10 à 30 s)…';
      try {
        var tvaEl = document.querySelector('[name="tva"]');
        var res = await api('/api/ai/lignes', { method: 'POST', body: { brief: brief, tva: Number(tvaEl ? tvaEl.value : 19) || 19 } });
        var list = res.lignes || [];
        if (!list.length) throw new Error('Aucune ligne proposée');
        document.getElementById('dl-lines').innerHTML = list.map(function (l) {
          return devisLineHTML({ description: l.designation || l.description || '', qty: l.quantite || l.qty || 1, pu: l.prixUnitaireHT || l.pu || 0 });
        }).join('');
        bindDevisLines();
        recalcDevis();
        st.innerHTML = '✅ ' + list.length + ' lignes générées · modèle ' + esc(res.model);
        toast('Lignes générées par IA', 'ok');
      } catch (e) {
        st.innerHTML = '<span style="color:var(--o-red)">' + esc(e.message) + '</span>';
      } finally {
        btn.disabled = false;
        btn.innerHTML = icon('sparkles') + ' Générer';
      }
    };
    bindDevisLines();
    recalcDevis();
  }
  function devisLineHTML(l) {
    return '<div class="o-line-row">' +
      '<div><input data-f="description" placeholder="Désignation" value="' + esc(l.description || '') + '"></div>' +
      '<div><input data-f="qty" type="number" step="any" value="' + Number(l.qty || 0) + '"></div>' +
      '<div><input data-f="pu" type="number" step="any" value="' + Number(l.pu || 0) + '"></div>' +
      '<div class="o-line-total" data-total>0</div>' +
      '<div><button type="button" class="o-btn o-btn-danger o-btn-sm" data-rm style="height:24px;padding:0 7px">✕</button></div>' +
    '</div>';
  }
  function bindDevisLines() {
    Array.prototype.forEach.call(document.querySelectorAll('#dl-lines [data-rm]'), function (b) {
      b.onclick = function () { b.closest('.o-line-row').remove(); recalcDevis(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#dl-lines input'), function (i) {
      i.oninput = recalcDevis;
    });
  }
  function recalcDevis() {
    var ht = 0;
    Array.prototype.forEach.call(document.querySelectorAll('#dl-lines .o-line-row'), function (r) {
      var q = Number(r.querySelector('[data-f="qty"]').value || 0);
      var p = Number(r.querySelector('[data-f="pu"]').value || 0);
      var t = q * p;
      ht += t;
      r.querySelector('[data-total]').textContent = money(t);
    });
    var tvaEl = document.querySelector('[name="tva"]');
    var remEl = document.querySelector('[name="remise"]');
    var tva = Number(tvaEl ? tvaEl.value : 19) || 0;
    var remisePct = Math.max(0, Math.min(100, Number(remEl ? remEl.value : 0) || 0));
    var remise = ht * remisePct / 100;
    var net = ht - remise;
    var ttc = net * (1 + tva / 100);
    document.getElementById('dl-totals').innerHTML =
      (remise > 0 ? '<div><span>Total brut HT</span><b>' + money(ht) + '</b></div>' +
        '<div><span>Remise ' + remisePct + ' %</span><b>-' + money(remise) + '</b></div>' : '') +
      '<div><span>Total HT</span><b>' + money(net) + '</b></div>' +
      '<div><span>TVA ' + tva + '%</span><b>' + money(ttc - net) + '</b></div>' +
      '<div class="grand"><span>Total TTC</span><b>' + money(ttc) + '</b></div>';
    if (tvaEl) tvaEl.oninput = recalcDevis;
    if (remEl) remEl.oninput = recalcDevis;
  }

  /* ---------------- MODAL ---------------- */
  function openModal(title, body, onSave, okLabel) {
    var root = document.getElementById('modal-root');
    root.innerHTML =
      '<div class="o-modal-bg"><div class="o-modal">' +
        '<div class="o-modal-head"><b>' + esc(title) + '</b><button class="o-btn o-btn-default o-btn-sm" data-x>✕</button></div>' +
        '<div class="o-modal-body">' + body + '</div>' +
        '<div class="o-modal-foot"><button class="o-btn o-btn-default" data-x>Annuler</button><button class="o-btn o-btn-primary" id="m-save">' + esc(okLabel || 'Enregistrer') + '</button></div>' +
      '</div></div>';
    Array.prototype.forEach.call(root.querySelectorAll('[data-x]'), function (b) { b.onclick = closeModal; });
    root.querySelector('.o-modal-bg').onclick = function (e) { if (e.target.classList.contains('o-modal-bg')) closeModal(); };
    document.getElementById('m-save').onclick = function () {
      var data = {};
      Array.prototype.forEach.call(root.querySelectorAll('[name]'), function (el) {
        data[el.name] = el.type === 'number' ? Number(el.value) : el.value;
      });
      onSave(data);
    };
    setTimeout(function () { var f = root.querySelector('input,select,textarea'); if (f) f.focus(); }, 40);
  }
  function closeModal() { document.getElementById('modal-root').innerHTML = ''; }

  /* Aperçu d'un document dans l'application avant impression / téléchargement */
  function previewDoc(url, title) {
    var root = document.getElementById('modal-root');
    var embedUrl = url + (url.indexOf('?') === -1 ? '?' : '&') + 'embed=1';
    root.innerHTML =
      '<div class="o-preview-bg">' +
        '<div class="o-preview">' +
          '<div class="o-preview-head"><b>' + esc(title) + '</b>' +
            '<div class="o-preview-actions">' +
              '<button class="o-btn o-btn-default o-btn-sm" data-preview-download>' + icon('download') + ' Imprimer / PDF</button>' +
              '<button class="o-btn o-btn-primary o-btn-sm" data-preview-close>Fermer</button>' +
            '</div>' +
          '</div>' +
          '<iframe class="o-preview-frame" src="' + esc(embedUrl) + '" title="' + esc(title) + '"></iframe>' +
        '</div>' +
      '</div>';
    root.querySelector('[data-preview-close]').onclick = closeModal;
    root.querySelector('[data-preview-download]').onclick = function () { window.open(url, '_blank'); };
    root.querySelector('.o-preview-bg').onclick = function (e) {
      if (e.target.classList.contains('o-preview-bg')) closeModal();
    };
  }

  /* ---------------- GLOBAL ACTIONS ---------------- */
  document.addEventListener('click', async function (e) {
    var pf = e.target.closest('[data-print-facture]');
    if (pf) {
      e.preventDefault();
      previewDoc('/api/factures/' + encodeURIComponent(pf.getAttribute('data-print-facture')) + '/print?token=' + encodeURIComponent(token()), 'Facture');
      return;
    }
    var bl = e.target.closest('[data-bl-facture]');
    if (bl) {
      e.preventDefault();
      previewDoc('/api/factures/' + encodeURIComponent(bl.getAttribute('data-bl-facture')) + '/bon-livraison?token=' + encodeURIComponent(token()), 'Bon de livraison');
      return;
    }
    var pd = e.target.closest('[data-print-devis]');
    if (pd) {
      e.preventDefault();
      previewDoc('/api/devis/' + encodeURIComponent(pd.getAttribute('data-print-devis')) + '/print?token=' + encodeURIComponent(token()), 'Devis');
      return;
    }
    var bc = e.target.closest('[data-bc-devis]');
    if (bc) {
      e.preventDefault();
      previewDoc('/api/devis/' + encodeURIComponent(bc.getAttribute('data-bc-devis')) + '/bon-commande?token=' + encodeURIComponent(token()), 'Bon de commande');
      return;
    }
    var pf2 = e.target.closest('[data-pf-devis]');
    if (pf2) {
      e.preventDefault();
      previewDoc('/api/devis/' + encodeURIComponent(pf2.getAttribute('data-pf-devis')) + '/proforma?token=' + encodeURIComponent(token()), 'Facture proforma');
      return;
    }
    var cd = e.target.closest('[data-conv-devis]');
    if (cd) {
      e.preventDefault();
      if (!confirm('Générer une facture de vente à partir de ce devis ?')) return;
      try {
        var f = await api('/api/devis/' + encodeURIComponent(cd.getAttribute('data-conv-devis')) + '/facture', { method: 'POST' });
        toast('Facture ' + f.num + ' générée', 'ok');
        navigate('factures');
      } catch (err) { toast(err.message, 'err'); }
      return;
    }
    var pay = e.target.closest('[data-pay-facture]');
    if (pay) {
      e.preventDefault();
      openPayModal(pay.getAttribute('data-pay-facture'));
      return;
    }
    var rel = e.target.closest('[data-releve]');
    if (rel) {
      e.preventDefault();
      window.open('/api/clients/' + encodeURIComponent(rel.getAttribute('data-releve')) + '/releve?token=' + encodeURIComponent(token()), '_blank');
      return;
    }

    var el = e.target.closest('[data-act]');
    if (!el) {
      var rowEl = e.target.closest('[data-row]');
      if (rowEl && e.target.closest('.o-card')) {
        openForm(colOf(S.module), rowEl.getAttribute('data-row'));
      }
      return;
    }
    var act = el.getAttribute('data-act');
    var col = colOf(S.module);

    if (act === 'view-list') { S.view = 'list'; renderView(); }
    else if (act === 'view-kanban') { S.view = 'kanban'; renderView(); }
    else if (act === 'create') { openForm(col, null); }
    else if (act === 'create-achat-mvt') { openMouvementForm({ type: 'achat' }, null); }
    else if (act === 'new-user') { openForm('users', null); }
    else if (act === 'edit-user') { openForm('users', el.getAttribute('data-id')); }
    else if (act === 'scan-achat') { openScanAchat(); }
    else if (act === 'scan-vente') { openScanDocument('vente'); }
    else if (act === 'scan-devis') { openScanDocument('devis'); }
    else if (act === 'scan-facture') { openScanDocument('facture'); }
    else if (act === 'scan-depense') { openScanDepense(); }
    else if (act === 'ai-analyse') { runAiAnalyse(); }
    else if (act === 'scan-assurance') { openScanAssurance(); }
    else if (act === 'create-assurance') { openForm('assurances', null); }
    else if (act === 'parc-attestation') { openAttestationPicker(); }
    else if (act === 'releve-client') { openRelevePicker(); }
    else if (act === 'export') { downloadExport(col); }
    else if (act === 'backup') { downloadBackup(); }
    else if (act === 'dossier') { downloadAuthFile('/api/export/dossier', 'dossier-entreprise.html'); }
    else if (act === 'account') { openAccountModal(); }
    else if (act === 'refresh') { renderView(); }
    else if (act === 'logout') { logout(); }
  });

  /* Téléchargement authentifié (le jeton ne doit pas transiter en clair dans l'URL) */
  async function downloadAuthFile(path, fallbackName) {
    try {
      var headers = {};
      if (token()) headers['Authorization'] = 'Bearer ' + token();
      var res = await fetch(path, { headers: headers });
      if (!res.ok) {
        var msg = 'Téléchargement impossible';
        try { var j = await res.json(); if (j && j.error) msg = j.error; } catch (e) {}
        toast(msg, 'err');
        return;
      }
      var disp = res.headers.get('content-disposition') || '';
      var m = disp.match(/filename="([^"]+)"/i);
      var name = m ? m[1] : fallbackName;
      var blob = await res.blob();
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
      toast('Fichier téléchargé', 'ok');
    } catch (e) { toast(e.message, 'err'); }
  }
  function downloadExport(col) {
    var target = col === 'activite' ? 'audit' : col;
    var qs = col === 'mouvements' ? (S.module === 'ventes' ? '?type=vente' : '?type=achat') : '';
    return downloadAuthFile('/api/export/' + encodeURIComponent(target) + qs, target + '.csv');
  }
  function downloadBackup() { return downloadAuthFile('/api/backup', 'ass-backup.db'); }

  /* ---------------- BOOT ---------------- */
  async function boot() {
    if (!S.user) {
      try { var me = await api('/api/auth/me'); S.user = me.user; }
      catch (e) { renderAuth(); return; }
    }
    try { if (localStorage.getItem('ass_side_collapsed') === '1') document.body.classList.add('side-collapsed'); } catch (e) {}
    await loadRefs();
    renderShell();
    navigate('apps');
  }

  async function loadPublicConfig() {
    try {
      var r = await fetch('/api/public/config');
      S.publicCfg = r.ok ? await r.json() : {};
    } catch (e) { S.publicCfg = {}; }
  }

  async function start() {
    await loadPublicConfig();
    if (!token()) { renderAuth(); return; }
    try {
      var me = await api('/api/auth/me');
      S.user = me.user;
      await boot();
    } catch (e) {
      renderAuth();
    }
  }

  start();
})();
