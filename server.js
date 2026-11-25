/* ============================================================
   ADVANCE SECURITY SYSTEM — BACKEND
   Node.js + SQLite (libSQL / Turso) — une dépendance : @libsql/client
   API REST + sessions + rôles
   ============================================================ */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { db, initDb } = require('./db');

let CONFIG = {};
try { CONFIG = require('./config.json'); } catch { CONFIG = {}; }
/* Valeurs de repli : le fichier config.json n'est jamais déployé (secrets). */
CONFIG.company = CONFIG.company || {
  name: 'SARL ADVANCED SECURITY SYSTEMS',
  shortName: 'Advanced Security Systems',
  address: 'LOC N°A RUE ABANE RAMDANE, CLASSE 75, TIZI OUZOU',
  rc: '22B0051898', ai: '15017178011', nif: '002215005189811', nis: '002215010027368',
  tin: '00015547', email: 'ads.services23@gmail.com', phone: '0661 66 68 48',
  currency: 'DA', vat: 19,
};
if (process.env.GOOGLE_API_KEY) CONFIG.googleApiKey = process.env.GOOGLE_API_KEY;
if (process.env.GEMINI_MODEL) CONFIG.geminiModel = process.env.GEMINI_MODEL;
/* Ancien alias « gemini-flash-latest » : Google le renvoie en 503 → modèle de référence */
if (!CONFIG.geminiModel || /latest/i.test(String(CONFIG.geminiModel))) CONFIG.geminiModel = 'gemini-3.5-flash';
if (process.env.DEMO_MODE != null) CONFIG.demoMode = process.env.DEMO_MODE === '1' || process.env.DEMO_MODE === 'true';
/* Hébergement public (Vercel, Render) : aucun compte ni donnée de démonstration
   par défaut. DEMO_MODE=1 permet de les réactiver explicitement. */
const SERVERLESS_HOST = !!process.env.VERCEL;
const PUBLIC_HOST = SERVERLESS_HOST || !!process.env.RENDER;
if (PUBLIC_HOST && process.env.DEMO_MODE == null) CONFIG.demoMode = false;

const PORT = Number(process.env.PORT || 3000);
/* Render exige une écoute sur 0.0.0.0 (le scanner de port est hors du conteneur). */
const HOST = process.env.HOST || (process.env.RENDER ? '0.0.0.0' : '127.0.0.1');
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
/* Vercel (serverless) : seul /tmp est inscriptible. Render : DATA_DIR pointe
   sur le disque persistant monté (ex. /var/data). */
const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp/ass-data' : path.join(ROOT, 'data'));
fs.mkdirSync(DATA_DIR, { recursive: true });

/* ---------------- SCHEMA ---------------- */
/* PRAGMA exécutés séparément : sur une réplica Turso, un PRAGMA refusé ne
   doit pas empêcher la création du schéma. */
const PRAGMAS = [
  'PRAGMA journal_mode = WAL;',
  'PRAGMA foreign_keys = ON;',
];
const SCHEMA = `

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, pass TEXT,
  role TEXT, phone TEXT, active INTEGER DEFAULT 1, created TEXT
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY, userId TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY, name TEXT, type TEXT, status TEXT, contact TEXT,
  email TEXT, phone TEXT, address TEXT, wilaya TEXT, nif TEXT, rc TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS devis (
  id TEXT PRIMARY KEY, num TEXT, clientId TEXT, titre TEXT, date TEXT,
  validite TEXT, status TEXT, tva REAL DEFAULT 19, created TEXT
);
CREATE TABLE IF NOT EXISTS devis_lignes (
  id TEXT PRIMARY KEY, devisId TEXT, description TEXT, qty REAL, pu REAL
);
CREATE TABLE IF NOT EXISTS factures (
  id TEXT PRIMARY KEY, num TEXT, clientId TEXT, devisId TEXT, date TEXT,
  due TEXT, montant REAL, paye REAL, status TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS projets (
  id TEXT PRIMARY KEY, nom TEXT, clientId TEXT, devisId TEXT, phase TEXT,
  progress REAL, chefId TEXT, deadline TEXT, description TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS interventions (
  id TEXT PRIMARY KEY, titre TEXT, clientId TEXT, projetId TEXT, techId TEXT,
  date TEXT, duree REAL, status TEXT, lieu TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS maintenance (
  id TEXT PRIMARY KEY, eq TEXT, lieu TEXT, clientId TEXT, type TEXT,
  next TEXT, status TEXT, techId TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS stock (
  id TEXT PRIMARY KEY, ref TEXT, nom TEXT, cat TEXT, qty REAL, minQty REAL,
  loc TEXT, prix REAL, fournisseur TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS pointages (
  id TEXT PRIMARY KEY, empId TEXT, emp TEXT, type TEXT, ts TEXT, gps TEXT, lieu TEXT,
  date TEXT, heuresSup REAL DEFAULT 0, deplacement INTEGER DEFAULT 0, montant REAL DEFAULT 0, note TEXT,
  horsWilaya INTEGER DEFAULT 0, mission TEXT
);
CREATE TABLE IF NOT EXISTS caisse (
  id TEXT PRIMARY KEY, date TEXT, type TEXT, libelle TEXT, empId TEXT, emp TEXT,
  montant REAL, modePaiement TEXT, reference TEXT, notes TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS contrats (
  id TEXT PRIMARY KEY, type TEXT, clientId TEXT, ref TEXT, objet TEXT,
  dateDep TEXT, dateFin TEXT, montant REAL, statut TEXT,
  periodicite TEXT, prochaineFacture TEXT, sla TEXT, sites TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS equipements (
  id TEXT PRIMARY KEY, clientId TEXT, site TEXT, cat TEXT, marque TEXT,
  modele TEXT, serial TEXT, qty REAL, dateInstall TEXT, garantie TEXT,
  nextCtrl TEXT, status TEXT, notes TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS solaire (
  id TEXT PRIMARY KEY, client TEXT, toiture REAL, conso REAL, kwc REAL,
  production REAL, rentabilite REAL, cout REAL, statut TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY, nom TEXT, cat TEXT, clientId TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS factures_achat (
  id TEXT PRIMARY KEY, num TEXT, fournisseur TEXT, fournisseurNif TEXT,
  date TEXT, echeance TEXT, modePaiement TEXT, objet TEXT,
  totalHT REAL, tva REAL, totalTTC REAL, statut TEXT,
  fichier TEXT, lignes TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS audit (
  id TEXT PRIMARY KEY, user TEXT, action TEXT, ts TEXT
);
CREATE TABLE IF NOT EXISTS assurances (
  id TEXT PRIMARY KEY, empId TEXT, type TEXT, assureur TEXT, numero TEXT,
  prime REAL, dateDebut TEXT, dateFin TEXT, statut TEXT, couverture TEXT,
  piece TEXT, notes TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS mouvements (
  id TEXT PRIMARY KEY, type TEXT, date TEXT, clientId TEXT, tiers TEXT,
  lignes TEXT, totalHT REAL, tva REAL, totalTTC REAL, statut TEXT,
  modePaiement TEXT, notes TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS depenses (
  id TEXT PRIMARY KEY, date TEXT, libelle TEXT, categorie TEXT, montant REAL,
  modePaiement TEXT, ref TEXT, notes TEXT, created TEXT
);
CREATE TABLE IF NOT EXISTS sequences (
  key TEXT PRIMARY KEY, value INTEGER
);
CREATE TABLE IF NOT EXISTS services (
  code TEXT PRIMARY KEY, nom TEXT, couleur TEXT, ordre INTEGER, actif INTEGER DEFAULT 1
);
/* Index sur les colonnes les plus filtrées / triées. */
CREATE INDEX IF NOT EXISTS idx_factures_date ON factures(date);
CREATE INDEX IF NOT EXISTS idx_factures_client ON factures(clientId);
CREATE INDEX IF NOT EXISTS idx_devis_date ON devis(date);
CREATE INDEX IF NOT EXISTS idx_mouvements_date ON mouvements(date);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit(ts);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(userId);
`;

/* ---------------- MIGRATIONS ---------------- */
async function ensureColumn(table, col, type) {
  try {
    const cols = (await db.prepare(`PRAGMA table_info(${table})`).all());
    if (!cols.some((c) => c.name === col)) (await db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`));
  } catch (e) {
    console.error('[MIGRATION]', table, col, e.message);
  }
}
const MIGRATIONS = [
  ['clients', 'nis', 'TEXT'],
  ['clients', 'tin', 'TEXT'],
  ['factures', 'objet', 'TEXT'],
  ['factures', 'modePaiement', 'TEXT'],
  ['contrats', 'periodicite', 'TEXT'],
  ['contrats', 'prochaineFacture', 'TEXT'],
  ['contrats', 'sla', 'TEXT'],
  ['contrats', 'sites', 'TEXT'],
  ['users', 'salaire', 'REAL'],
  ['users', 'perms', 'TEXT'],
  ['sessions', 'expires', 'TEXT'],
  ['sessions', 'agent', 'TEXT'],
  ['factures', 'lignes', 'TEXT'],
  ['factures', 'tva', 'REAL DEFAULT 19'],
  ['clients', 'notes', 'TEXT'],
  ['devis', 'remise', 'REAL DEFAULT 0'],
  ['pointages', 'date', 'TEXT'],
  ['pointages', 'heuresSup', 'REAL DEFAULT 0'],
  ['pointages', 'deplacement', 'INTEGER DEFAULT 0'],
  ['pointages', 'montant', 'REAL DEFAULT 0'],
  ['pointages', 'note', 'TEXT'],
  ['pointages', 'horsWilaya', 'INTEGER DEFAULT 0'],
  ['pointages', 'mission', 'TEXT'],
  ['stock', 'service', 'TEXT'],
  ['mouvements', 'service', 'TEXT'],
  ['devis', 'service', 'TEXT'],
  ['factures', 'service', 'TEXT'],
  ['factures_achat', 'service', 'TEXT'],
  ['projets', 'service', 'TEXT'],
  ['equipements', 'service', 'TEXT'],
  ['contrats', 'service', 'TEXT'],
  ['users', 'services', 'TEXT'],
];

/* ---------------- PÔLES / SERVICES (stock, ventes et achats séparés) ---------------- */
const SERVICES = [
  { code: 'CCTV', nom: 'Vidéosurveillance', couleur: '#3b82f6' },
  { code: 'ACC', nom: "Contrôle d'accès", couleur: '#8b5cf6' },
  { code: 'INC', nom: 'Détection & alarme incendie', couleur: '#ef4444' },
  { code: 'RIA', nom: 'Réseaux anti-incendie', couleur: '#f59e0b' },
  { code: 'PV', nom: 'Photovoltaïque', couleur: '#d9a23c' },
  { code: 'COMMUN', nom: 'Commun / Transversal', couleur: '#64748b' },
];
const SERVICE_CODES = SERVICES.map((s) => s.code);
const DEFAULT_SERVICE = 'COMMUN';
/* Collections rattachées à un pôle : un compte peut être limité à certains pôles */
const SERVICE_COLLECTIONS = ['stock', 'mouvements', 'devis', 'factures', 'factures_achat', 'projets', 'equipements', 'contrats'];

/* Catégorie produit historique → pôle (reprise des données existantes) */
const CAT_SERVICE = {
  'vidéosurveillance': 'CCTV', 'videosurveillance': 'CCTV',
  "contrôle d'accès": 'ACC', "controle d'acces": 'ACC',
  'détection incendie': 'INC', 'detection incendie': 'INC',
  'désenfumage': 'INC', 'desenfumage': 'INC',
  'anti-incendie ria': 'RIA', 'ria / anti-incendie': 'RIA', 'ria': 'RIA',
  'photovoltaïque': 'PV', 'photovoltaique': 'PV', 'solaire': 'PV',
};

function normalizeService(v) {
  const raw = String(v == null ? '' : v).trim();
  if (!raw) return null;
  const code = raw.toUpperCase();
  if (SERVICE_CODES.indexOf(code) !== -1) return code;
  return CAT_SERVICE[raw.toLowerCase()] || null;
}
function serviceOf(row) { return normalizeService(row && row.service) || DEFAULT_SERVICE; }
function serviceName(code) {
  const norm = normalizeService(code) || DEFAULT_SERVICE;
  const found = SERVICES.find((s) => s.code === norm);
  return found ? found.nom : norm;
}
/* null = tous les pôles (admin ou aucun cloisonnement) */
function userServices(u) {
  if (!u || isAdmin(u)) return null;
  if (!u.services) return null;
  try {
    const arr = JSON.parse(u.services);
    if (Array.isArray(arr) && arr.length) {
      const list = arr.map(normalizeService).filter(Boolean);
      if (list.length) return list;
    }
  } catch { /* JSON illisible → tous les pôles */ }
  return null;
}
function canService(u, code) {
  const list = userServices(u);
  if (list === null) return true;
  return list.indexOf(serviceOf({ service: code })) !== -1;
}
function filterByService(rows, u) {
  const list = userServices(u);
  if (list === null) return rows;
  return rows.filter((r) => list.indexOf(serviceOf(r)) !== -1);
}
/* Un mouvement et toutes ses lignes doivent appartenir au même pôle */
async function checkMvtService(m) {
  const svc = serviceOf(m);
  for (const l of parseLignesMvt(m.lignes)) {
    if (!l.stockId) continue;
    const s = (await db.prepare('SELECT nom, service FROM stock WHERE id = ?').get(l.stockId));
    if (!s) continue;
    if (serviceOf(s) !== svc) {
      return `L'article « ${s.nom || l.designation || 'article'} » appartient au pôle ${serviceName(serviceOf(s))} : il ne peut pas figurer sur un mouvement du pôle ${serviceName(svc)}`;
    }
  }
  return null;
}
async function serviceFromLignes(raw) {
  for (const l of parseLignesMvt(raw)) {
    if (!l.stockId) continue;
    const s = (await db.prepare('SELECT service FROM stock WHERE id = ?').get(l.stockId));
    if (s) return serviceOf(s);
  }
  return null;
}
/* Synthèse ventes / achats / stock / facturation par pôle */
async function servicesSynthese(mois, u) {
  const services = (await db.prepare('SELECT * FROM services WHERE COALESCE(actif,1) = 1 ORDER BY ordre').all());
  const inMois = (d) => !mois || String(d || '').slice(0, 7) === mois;
  const stock = filterByService((await db.prepare('SELECT * FROM stock').all()), u);
  const mvts = filterByService((await db.prepare('SELECT * FROM mouvements').all()), u);
  const factures = filterByService((await db.prepare('SELECT * FROM factures').all()), u);
  const achats = filterByService((await db.prepare('SELECT * FROM factures_achat').all()), u);
  const list = userServices(u);
  return services
    .filter((s) => !list || list.indexOf(s.code) !== -1)
    .map((s) => {
      const code = s.code;
      const st = stock.filter((r) => serviceOf(r) === code);
      const mv = mvts.filter((r) => serviceOf(r) === code && inMois(r.date));
      const fa = factures.filter((r) => serviceOf(r) === code && inMois(r.date));
      const ac = achats.filter((r) => serviceOf(r) === code && inMois(r.date));
      const ventes = mv.filter(isVente);
      const achatsProduits = mv.filter((m) => !isVente(m));
      const ventesHT = round2(ventes.reduce((t, m) => t + num(m.totalHT), 0));
      const achatsHT = round2(achatsProduits.reduce((t, m) => t + num(m.totalHT), 0));
      return {
        code, nom: s.nom, couleur: s.couleur,
        mouvements: mv.length,
        ventesHT, ventesTTC: round2(ventes.reduce((t, m) => t + num(m.totalTTC), 0)),
        achatsHT, achatsTTC: round2(achatsProduits.reduce((t, m) => t + num(m.totalTTC), 0)),
        marge: round2(ventesHT - achatsHT),
        caFacture: round2(fa.reduce((t, f) => t + num(f.montant), 0)),
        caEncaisse: round2(fa.reduce((t, f) => t + num(f.paye), 0)),
        achatsFournisseur: round2(ac.reduce((t, a) => t + num(a.totalTTC), 0)),
        stockValeur: round2(st.reduce((t, i) => t + num(i.qty) * num(i.prix), 0)),
        stockRefs: st.length,
        stockCritique: st.filter((i) => num(i.qty) <= num(i.minQty)).length,
      };
    });
}
async function seedServices() {
  const ins = db.prepare('INSERT OR IGNORE INTO services (code,nom,couleur,ordre,actif) VALUES (?,?,?,?,1)');
  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i];
    await ins.run(s.code, s.nom, s.couleur, i);
  }
}
/* Reprise des données existantes : pôle déduit de la catégorie ou des lignes */
async function backfillServices() {
  for (const s of (await db.prepare('SELECT id, cat, service FROM stock').all())) {
    if (normalizeService(s.service)) continue;
    await db.prepare('UPDATE stock SET service = ? WHERE id = ?').run(normalizeService(s.cat) || DEFAULT_SERVICE, s.id);
  }
  for (const e of (await db.prepare('SELECT id, cat, service FROM equipements').all())) {
    if (normalizeService(e.service)) continue;
    await db.prepare('UPDATE equipements SET service = ? WHERE id = ?').run(normalizeService(e.cat) || DEFAULT_SERVICE, e.id);
  }
  for (const m of (await db.prepare('SELECT id, lignes, service FROM mouvements').all())) {
    if (normalizeService(m.service)) continue;
    await db.prepare('UPDATE mouvements SET service = ? WHERE id = ?').run((await serviceFromLignes(m.lignes)) || DEFAULT_SERVICE, m.id);
  }
  for (const f of (await db.prepare('SELECT id, devisId, service FROM factures').all())) {
    if (normalizeService(f.service)) continue;
    const d = f.devisId ? (await db.prepare('SELECT service FROM devis WHERE id = ?').get(f.devisId)) : null;
    await db.prepare('UPDATE factures SET service = ? WHERE id = ?').run((d && normalizeService(d.service)) || DEFAULT_SERVICE, f.id);
  }
  for (const t of ['devis', 'factures_achat', 'projets', 'contrats']) {
    for (const r of (await db.prepare(`SELECT id, service FROM ${t}`).all())) {
      if (!normalizeService(r.service)) await db.prepare(`UPDATE ${t} SET service = ? WHERE id = ?`).run(DEFAULT_SERVICE, r.id);
    }
  }
  await db.exec("UPDATE pointages SET date = substr(ts,1,10) WHERE (date IS NULL OR date = '') AND ts IS NOT NULL AND ts <> ''");
}

/* ---------------- DOSSIER DE TRANSMISSION DE L'ENTREPRISE ---------------- */
function dossierTable(headers, rows) {
  if (!rows.length) return '<p class="empty">Aucune donnée enregistrée.</p>';
  return '<table><thead><tr>' + headers.map((x) => `<th>${h(x)}</th>`).join('') + '</tr></thead><tbody>' +
    rows.map((r) => '<tr>' + r.map((c) => `<td>${c == null || c === '' ? '—' : h(c)}</td>`).join('') + '</tr>').join('') +
    '</tbody></table>';
}
async function renderDossierHtml(req, me) {
  const co = CONFIG.company;
  const today = new Date();
  const dateFr = today.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const stamp = today.toISOString().slice(0, 10);
  const proto = String(req.headers['x-forwarded-proto'] || 'http').split(',')[0];
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000').split(',')[0];
  const appUrl = `${proto}://${host}`;

  const clients = (await db.prepare('SELECT * FROM clients ORDER BY name').all());
  const devis = await Promise.all((await db.prepare('SELECT * FROM devis ORDER BY date DESC').all()).map(getDevis));
  const factures = (await db.prepare('SELECT * FROM factures ORDER BY date DESC').all());
  const achats = (await db.prepare('SELECT * FROM factures_achat ORDER BY date DESC').all());
  const mouvements = (await db.prepare('SELECT * FROM mouvements ORDER BY date DESC').all());
  const stock = (await db.prepare('SELECT * FROM stock ORDER BY nom').all());
  const depenses = (await db.prepare('SELECT * FROM depenses ORDER BY date DESC').all());
  const contrats = (await db.prepare('SELECT * FROM contrats ORDER BY dateDep DESC').all());
  const users = (await db.prepare('SELECT id,name,email,role,phone,active,perms,services,created FROM users ORDER BY name').all());
  const clientName = (id) => (clients.find((c) => c.id === id) || {}).name || '—';
  const svc = (r) => serviceOf(r);

  const ca = round2(factures.reduce((s, f) => s + num(f.montant), 0));
  const encaisse = round2(factures.reduce((s, f) => s + num(f.paye), 0));
  const impayes = round2(ca - encaisse);
  const achatsTtc = round2(achats.reduce((s, a) => s + num(a.totalTTC), 0));
  const depTotal = round2(depenses.reduce((s, d) => s + num(d.montant), 0));
  const stockVal = round2(stock.reduce((s, i) => s + num(i.qty) * num(i.prix), 0));

  const accessRows = users.map((u) => [
    u.name, u.email, u.role,
    Number(u.active) === 0 ? 'Désactivé' : 'Actif',
    (userModules(u) || []).map((m) => (MODULES_LABELS[m] || m)).join(', ') || 'Tous les modules',
    (userServices(u) || []).map(serviceName).join(', ') || 'Tous les pôles',
    'À définir par l\'administrateur (réinitialisation sécurisée)',
  ]);

  const clientRows = clients.map((c) => [c.name, c.type, c.contact, c.email, c.phone, c.wilaya, c.nif, c.rc, c.nis]);
  const devisRows = devis.map((d) => [d.num, d.date, clientName(d.clientId), d.titre, svc(d), d.status, moneyFr(devisTotal(d).ttc) + ' DA']);
  const factRows = factures.map((f) => [f.num, f.date, clientName(f.clientId), f.objet, moneyFr(f.montant) + ' DA', moneyFr(f.paye) + ' DA', moneyFr(num(f.montant) - num(f.paye)) + ' DA', f.status]);
  const achatRows = achats.map((a) => [a.num, a.date, a.fournisseur, a.objet, moneyFr(a.totalHT) + ' DA', moneyFr(a.tva) + ' %', moneyFr(a.totalTTC) + ' DA', a.statut]);
  const mvtRows = mouvements.map((m) => [m.type, m.date, m.tiers || clientName(m.clientId), svc(m), moneyFr(m.totalHT) + ' DA', moneyFr(m.tva) + ' %', moneyFr(m.totalTTC) + ' DA', m.statut]);
  const stockRows = stock.map((s) => [s.ref, s.nom, svc(s), num(s.qty), num(s.minQty), moneyFr(s.prix) + ' DA', moneyFr(num(s.qty) * num(s.prix)) + ' DA']);
  const depRows = depenses.map((d) => [d.date, d.libelle, d.categorie, moneyFr(d.montant) + ' DA', d.modePaiement, d.ref]);
  const contratRows = contrats.map((c) => [c.ref, c.type, clientName(c.clientId), c.dateDep, c.dateFin, moneyFr(c.montant) + ' DA', c.periodicite, c.statut]);
  const userRows = users.map((u) => [u.name, u.email, u.role, u.phone, Number(u.active) === 0 ? 'Non' : 'Oui', (userModules(u) || []).length ? 'Droits personnalisés' : 'Selon le rôle', (userServices(u) || []).map(serviceName).join(', ') || 'Tous']);

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Dossier entreprise — ${h(co.name)}</title>
<style>
  @page { size: A4; margin: 12mm 11mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color:#111; font-size:10.5px; margin:0; }
  h1 { font-size:20px; margin:0 0 4px; color:#0f2b46; }
  h2 { font-size:14px; margin:26px 0 8px; color:#0f2b46; border-bottom:2px solid #0f2b46; padding-bottom:4px; }
  h3 { font-size:11.5px; margin:16px 0 6px; color:#334155; }
  .cover { display:flex; justify-content:space-between; gap:20px; border-bottom:3px solid #e11d1d; padding-bottom:12px; }
  .cover .brand img { height:82px; }
  .cover .co { text-align:right; line-height:1.5; font-size:10px; }
  .cover .co b { display:block; font-size:17px; color:#e11d1d; }
  .meta { display:flex; gap:22px; margin:14px 0 6px; font-size:10px; color:#444; }
  .kpis { display:flex; flex-wrap:wrap; gap:8px; margin:10px 0 4px; }
  .kpi { flex:1 1 145px; border:1px solid #dbe3ec; border-radius:5px; padding:8px 10px; background:#f8fafc; }
  .kpi .l { color:#64748b; font-size:8.5px; text-transform:uppercase; letter-spacing:.4px; }
  .kpi .v { font-size:13.5px; font-weight:800; margin-top:2px; color:#0f2b46; }
  table { width:100%; border-collapse:collapse; font-size:8.8px; margin:4px 0 12px; }
  th { background:#0f2b46; color:#fff; padding:5px 4px; text-align:left; font-size:8.2px; text-transform:uppercase; letter-spacing:.2px; }
  td { border:1px solid #dde5ee; padding:4px; vertical-align:top; }
  tbody tr:nth-child(even) td { background:#f8fafc; }
  .empty { color:#64748b; font-style:italic; font-size:9.5px; }
  .note { border-left:3px solid #f59e0b; background:#fffbeb; padding:8px 10px; font-size:9.5px; line-height:1.55; margin:8px 0; }
  .secure { border-left:3px solid #10b981; background:#ecfdf5; padding:8px 10px; font-size:9.5px; line-height:1.55; margin:8px 0; }
  .foot { margin-top:22px; border-top:1px solid #ccc; padding-top:6px; font-size:8.5px; color:#666; display:flex; justify-content:space-between; }
  .noprint { position:fixed; top:12px; right:12px; display:flex; gap:8px; }
  .noprint button { padding:9px 16px; border:0; border-radius:5px; background:#017E84; color:#fff; font-weight:700; cursor:pointer; }
  .noprint button.alt { background:#0f2b46; }
  @media print { .noprint { display:none; } }
</style></head><body>
  <div class="noprint"><button onclick="window.print()">Imprimer / PDF</button></div>
  <div class="cover">
    <div class="brand"><img src="/assets/logo-header.png" alt="Advanced Security Systems"></div>
    <div class="co"><b>${h(co.name)}</b>${h(co.address)}<br>RC ${h(co.rc)} · AI ${h(co.ai)}<br>NIF ${h(co.nif)} · NIS ${h(co.nis)}<br>${h(co.email)} · ${h(co.phone)}</div>
  </div>
  <h1 style="margin-top:16px">Dossier de transmission — ERP</h1>
  <div class="meta"><span><b>Date :</b> ${h(dateFr)}</span><span><b>Établi par :</b> ${h(me.name)} (${h(me.role)})</span><span><b>Document :</b> confidentiel</span></div>

  <h2>1. Accès à l'application</h2>
  <div class="kpis">
    <div class="kpi"><div class="l">Adresse de connexion</div><div class="v" style="font-size:11px">${h(appUrl)}</div></div>
    <div class="kpi"><div class="l">Comptes actifs</div><div class="v">${users.filter((u) => Number(u.active) !== 0).length} / ${users.length}</div></div>
    <div class="kpi"><div class="l">Sécurité mots de passe</div><div class="v" style="font-size:11px">scrypt + sel aléatoire</div></div>
  </div>
  <div class="secure"><b>Procédure de connexion :</b> ouvrez l'adresse ci-dessus, saisissez l'email professionnel et le mot de passe communiqué par l'administrateur. Chaque compte est limité à ses modules et à ses pôles. Un compte désactivé perd immédiatement ses sessions.<br><b>Mots de passe :</b> ils ne figurent jamais en clair dans ce dossier (stockage chiffré). L'administrateur les définit ou les réinitialise depuis <i>Paramètres → Comptes &amp; accès</i>. Exigez 8 caractères minimum et changez les comptes de démonstration avant la mise en service.</div>
  ${dossierTable(['Employé', 'Email de connexion', 'Rôle', 'Statut', 'Modules autorisés', 'Pôles autorisés', 'Mot de passe'], accessRows)}

  <h2>2. Synthèse financière</h2>
  <div class="kpis">
    <div class="kpi"><div class="l">CA facturé</div><div class="v">${moneyFr(ca)} DA</div></div>
    <div class="kpi"><div class="l">Encaissé</div><div class="v">${moneyFr(encaisse)} DA</div></div>
    <div class="kpi"><div class="l">Reste à encaisser</div><div class="v">${moneyFr(impayes)} DA</div></div>
    <div class="kpi"><div class="l">Achats fournisseurs</div><div class="v">${moneyFr(achatsTtc)} DA</div></div>
    <div class="kpi"><div class="l">Dépenses</div><div class="v">${moneyFr(depTotal)} DA</div></div>
    <div class="kpi"><div class="l">Valeur du stock</div><div class="v">${moneyFr(stockVal)} DA</div></div>
  </div>
  <p class="note">Ce dossier contient l'intégralité des données de gestion nécessaires à la reprise du dossier : clients, devis, factures, achats, mouvements de stock, dépenses, contrats et comptes. Il ne contient aucun mot de passe en clair.</p>

  <h2>3. Clients</h2>${dossierTable(['Société', 'Type', 'Contact', 'Email', 'Téléphone', 'Wilaya', 'NIF', 'RC', 'NIS'], clientRows)}
  <h2>4. Devis</h2>${dossierTable(['N°', 'Date', 'Client', 'Objet', 'Pôle', 'Statut', 'Total TTC'], devisRows)}
  <h2>5. Factures de vente</h2>${dossierTable(['N°', 'Date', 'Client', 'Objet', 'Montant TTC', 'Encaissé', 'Reste dû', 'Statut'], factRows)}
  <h2>6. Achats et factures fournisseurs</h2>${dossierTable(['N°', 'Date', 'Fournisseur', 'Objet', 'Total HT', 'TVA', 'Total TTC', 'Statut'], achatRows)}
  <h2>7. Ventes et achats de produits</h2>${dossierTable(['Type', 'Date', 'Tiers / client', 'Pôle', 'Total HT', 'TVA', 'Total TTC', 'Statut'], mvtRows)}
  <h2>8. Stock</h2>${dossierTable(['Réf.', 'Article', 'Pôle', 'Quantité', 'Seuil', 'Prix unitaire', 'Valeur'], stockRows)}
  <h2>9. Dépenses</h2>${dossierTable(['Date', 'Libellé', 'Catégorie', 'Montant', 'Mode', 'Référence'], depRows)}
  <h2>10. Contrats et conventions</h2>${dossierTable(['Réf.', 'Type', 'Client', 'Début', 'Fin', 'Montant', 'Périodicité', 'Statut'], contratRows)}
  <h2>11. Comptes employés</h2>${dossierTable(['Nom', 'Email', 'Rôle', 'Téléphone', 'Actif', 'Droits', 'Pôles'], userRows)}

  <div class="foot"><span>${h(co.name)} — dossier confidentiel</span><span>Généré le ${h(stamp)} · ${h(me.name)}</span></div>
</body></html>`;
}

/* ---------------- HELPERS ---------------- */
const uid = (p = 'id') => p + '_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
const now = () => new Date().toISOString();
const todayStr = () => new Date().toISOString().slice(0, 10);
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString(); };
const addMonths = (date, n) => { const d = new Date(date || Date.now()); d.setMonth(d.getMonth() + n); return d.toISOString(); };
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const num = (v) => Number(v || 0);

/* Durée de vie d'une session (jours) */
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 30);

/* ---------------- PARAMÈTRES DE PAIE (pointage manuel) ---------------- */
/* 2 000 DA / jour · 375 DA / heure supplémentaire · 2 000 DA / déplacement (véhicule)
   + 1 200 DA forfaitaires par mission hors wilaya (une seule fois par mission) */
const PAIE = { jour: 2000, heureSup: 375, deplacement: 2000, horsWilaya: 1200 };
const isArrivee = (p) => String((p && p.type) || '').toUpperCase() === 'ARRIVÉE';

/* Clé unique d'une mission : référence saisie, ou date du pointage à défaut.
   Sert à ne verser qu'une fois le forfait « hors wilaya » par mission. */
function missionKey(p) {
  const ref = String((p && p.mission) || '').trim().toLowerCase();
  return ref ? 'm:' + ref : 'd:' + String((p && (p.date || (p.ts || '').slice(0, 10))) || '');
}

/* Calcule la part quotidienne d'un pointage (une ARRIVÉE = une journée payée).
   Le forfait « hors wilaya » est ajouté une seule fois par mission lors de la
   feuille de salaire (voir salairesPointage), pas ici, pour éviter les doublons. */
function calculerMontantPointage(p) {
  const actif = isArrivee(p);
  const jours = actif ? 1 : 0;
  const heuresSup = actif ? Math.max(0, Number(p.heuresSup || 0)) : 0;
  const deplacements = actif && Number(p.deplacement) ? 1 : 0;
  const brutJours = round2(jours * PAIE.jour);
  const brutHS = round2(heuresSup * PAIE.heureSup);
  const brutDep = round2(deplacements * PAIE.deplacement);
  return {
    jours, heuresSup, deplacements,
    horsWilaya: actif && Number(p.horsWilaya) ? 1 : 0,
    mission: missionKey(p),
    brutJours, brutHS, brutDep,
    total: round2(brutJours + brutHS + brutDep),
  };
}

/* Solde de la caisse : entrées − sorties − avances versées. */
function soldeCaisse(rows) {
  const entrees = round2((rows || []).filter((r) => r.type === 'Entrée').reduce((s, r) => s + num(r.montant), 0));
  const sorties = round2((rows || []).filter((r) => r.type === 'Sortie').reduce((s, r) => s + num(r.montant), 0));
  const avances = round2((rows || []).filter((r) => r.type === 'Avance').reduce((s, r) => s + num(r.montant), 0));
  return { entrees, sorties, avances, solde: round2(entrees - sorties - avances) };
}

/* Feuille de salaire calculée depuis les pointages d'un mois (ou de toutes les périodes). */
async function salairesPointage(mois) {
  const users = (await db.prepare('SELECT id,name,role,active,salaire FROM users ORDER BY name').all());
  const pts = mois
    ? (await db.prepare("SELECT * FROM pointages WHERE substr(COALESCE(date, substr(ts,1,10)),1,7) = ?").all(mois))
    : (await db.prepare('SELECT * FROM pointages').all());
  const av = mois
    ? (await db.prepare("SELECT * FROM caisse WHERE type = 'Avance' AND substr(date,1,7) = ?").all(mois))
    : (await db.prepare("SELECT * FROM caisse WHERE type = 'Avance'").all());

  return users.map((u) => {
    let jours = 0, heuresSup = 0, deplacements = 0, brut = 0, nb = 0;
    const missionsHW = new Set();
    pts.forEach((p) => {
      if (p.empId !== u.id) return;
      const c = calculerMontantPointage(p);
      jours += c.jours; heuresSup += c.heuresSup; deplacements += c.deplacements;
      brut += c.total; nb += 1;
      /* Forfait hors wilaya : versé une seule fois par mission (référence ou date). */
      if (c.horsWilaya) missionsHW.add(c.mission);
    });
    const missionsHorsWilaya = missionsHW.size;
    const brutHW = round2(missionsHorsWilaya * PAIE.horsWilaya);
    const avances = round2(av.filter((a) => a.empId === u.id).reduce((s, a) => s + num(a.montant), 0));
    const brutTotal = round2(brut + brutHW);
    return {
      empId: u.id, emp: u.name, role: u.role, active: u.active, reference: num(u.salaire),
      mois: mois || '', jours, heuresSup, deplacements, pointages: nb,
      missionsHorsWilaya, brutHW,
      brutJours: round2(jours * PAIE.jour),
      brutHS: round2(heuresSup * PAIE.heureSup),
      brutDep: round2(deplacements * PAIE.deplacement),
      brut: brutTotal, avances, net: round2(brutTotal - avances),
    };
  });
}

/* ---------------- NUMÉROTATION (séquences sans doublon) ---------------- */
/* Compteur par préfixe + année : D-2026-001, F-2026-014, CTR-2026-003…
   Évite les doublons produits par un COUNT(*) après suppression d'un document. */
async function nextDocNumber(prefix, table, column = 'num', year) {
  const y = year || new Date().getFullYear();
  const key = `${prefix}-${y}`;
  let row = (await db.prepare('SELECT value FROM sequences WHERE key = ?').get(key));
  if (!row) {
    let max = 0;
    try {
      (await db.prepare(`SELECT ${column} AS v FROM ${table} WHERE ${column} LIKE ?`).all(`${prefix}-${y}-%`))
        .forEach((r) => { const m = String(r.v || '').match(/(\d+)\s*$/); if (m) max = Math.max(max, Number(m[1])); });
    } catch { /* table vide ou colonne absente */ }
    /* INSERT OR IGNORE : si une autre requête crée la clé en même temps, on
       reprend la sienne au lieu de repartir de zéro. */
    (await db.prepare('INSERT OR IGNORE INTO sequences (key,value) VALUES (?,?)').run(key, max));
  }
  /* Incrément atomique : SELECT puis UPDATE séparés pouvaient produire deux
     fois le même numéro lors de créations simultanées. */
  const updated = (await db.prepare('UPDATE sequences SET value = value + 1 WHERE key = ? RETURNING value').get(key));
  const next = Number(updated ? updated.value : 1);
  return `${prefix}-${y}-${String(next).padStart(3, '0')}`;
}

function hashPass(pass) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(String(pass), salt, 32).toString('hex');
}
function verifyPass(pass, stored) {
  if (!stored || stored.indexOf(':') === -1) return false;
  const [salt, h] = stored.split(':');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(crypto.scryptSync(String(pass), salt, 32).toString('hex')),
      Buffer.from(h)
    );
  } catch { return false; }
}

async function audit(user, action) {
  (await db.prepare('INSERT INTO audit (id,user,action,ts) VALUES (?,?,?,?)')
    .run(uid('a'), user || 'système', action, now()));
}

const MODULES_LABELS = {
  dashboard: 'Tableau de bord', clients: 'Clients', devis: 'Devis', factures: 'Factures',
  mouvements: 'Ventes', achats: 'Achats', projets: 'Projets', interventions: 'Missions',
  planning: 'Planning', maintenance: 'Incendie', parc: 'Parc', stock: 'Stock', pointage: 'Pointage',
  users: 'Employés', caisse: 'Caisse', depenses: 'Dépenses', solaire: 'Solaire', contrats: 'Contrats',
  rapports: 'Rapports', activite: 'Activité', parametres: 'Paramètres',
};

/* ---------------- HABILITATIONS ---------------- */
/* Modules autorisés par défaut selon le rôle. NULL = tous les modules. */
const ROLE_MODULES = {
  Manager: null,
  Commerciale: ['dashboard', 'clients', 'devis', 'factures', 'mouvements', 'achats', 'contrats', 'rapports', 'planning', 'activite', 'stock', 'caisse'],
  Technicien: ['dashboard', 'clients', 'interventions', 'planning', 'maintenance', 'parc', 'stock', 'pointage', 'contrats', 'activite'],
  'Technicien PV': ['dashboard', 'clients', 'interventions', 'planning', 'maintenance', 'parc', 'solaire', 'stock', 'pointage', 'contrats', 'activite'],
};
const isAdmin = (u) => !!u && String(u.role || '').toLowerCase() === 'admin';

/* Liste des modules autorisés pour un utilisateur (null = tous) */
function userModules(u) {
  if (!u) return [];
  if (isAdmin(u)) return null;
  const raw = u.perms;
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) return arr;
    } catch { /* perms illisible → rôle */ }
  }
  if (Object.prototype.hasOwnProperty.call(ROLE_MODULES, u.role)) return ROLE_MODULES[u.role];
  return null;
}
function canModule(u, mod) {
  if (!u) return false;
  if (mod === 'parametres' || mod === 'admin') return isAdmin(u);
  const list = userModules(u);
  if (list === null) return true;
  return list.indexOf(mod) !== -1;
}

/* ---------------- SEED ---------------- */
async function seedIfEmpty() {
  const count = (await db.prepare('SELECT COUNT(*) AS n FROM users').get()).n;
  if (count > 0) return;

  const insUser = db.prepare('INSERT INTO users (id,name,email,pass,role,phone,active,created) VALUES (?,?,?,?,?,?,?,?)');
  for (const [id, name, email, pass, role, phone] of [
    ['u1', 'Sofiane Seghir', 'admin@ass.dz', 'admin123', 'Admin', '+213 550 12 34 56'],
    ['u2', 'Youssef El Amrani', 'youssef@ass.dz', 'tech123', 'Technicien', '+213 661 98 76 54'],
    ['u3', 'Lina Belkacem', 'lina@ass.dz', 'com123', 'Commerciale', '+213 770 07 07 07'],
    ['u4', 'Sami Haddad', 'sami@ass.dz', 'tech123', 'Technicien PV', '+213 555 11 22 33'],
  ]) await insUser.run(id, name, email, hashPass(pass), role, phone, 1, now());

  const insClient = db.prepare('INSERT INTO clients (id,name,type,status,contact,email,phone,address,wilaya,nif,rc,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
  for (const [id, name, type, status, contact, email, phone, address, wilaya, nif, rc] of [
    ['c1', 'Hôtel El Aurassi', 'Immeuble', 'client', 'Mme Boudiaf', 'contact@elaurassi.dz', '+213 21 23 45 67', 'Bd Mohamed Khemisti, Alger Centre', 'Alger', '001234567890123', '16/00-1234567 B 12'],
    ['c2', 'Résidence Les Pins', 'Copropriété', 'client', 'Syndic El Djazaïr', 'syndic@lespins.dz', '+213 21 45 67 89', 'Lotissement Les Pins, Hydra', 'Alger', '009876543210987', '16/00-7654321 B 09'],
    ['c3', 'Villa Horizon', 'Villa', 'prospect', 'M. Zerrouki', 'zerrouki@horizon.dz', '+213 550 11 22 33', 'Chemin des Crêtes, Aïn Benian', 'Alger', '', ''],
    ['c4', 'Entrepôt Logistique Ouest', 'Entrepôt', 'client', 'M. Khelifi', 'contact@elog-ouest.dz', '+213 41 33 44 55', 'Zone industrielle Es Sénia', 'Oran', '003456789012345', '31/00-2345678 B 15'],
  ]) await insClient.run(id, name, type, status, contact, email, phone, address, wilaya, nif, rc, now());

  const insStock = db.prepare('INSERT INTO stock (id,ref,nom,cat,qty,minQty,loc,prix,fournisseur,created) VALUES (?,?,?,?,?,?,?,?,?,?)');
  for (const [id, ref, nom, cat, qty, minQty, loc, prix, fournisseur] of [
    ['s1', 'CAM-DH-IP-4MP', 'Caméra IP 4MP IR 30m', 'Vidéosurveillance', 12, 5, 'Magasin', 18000, 'Sarl Securelec Alger'],
    ['s2', 'ACC-PAP-2000', "Centrale contrôle d'accès 2 portes", "Contrôle d'accès", 3, 2, 'Magasin', 45000, 'Hikvision Algérie'],
    ['s3', 'INC-DET-OPT', 'Détecteur optique adressable', 'Détection incendie', 45, 10, 'Camion 1', 3800, 'Siemens Feu Algérie'],
    ['s4', 'PV-PAN-450W', 'Panneau photovoltaïque 450W', 'Photovoltaïque', 20, 10, 'Magasin', 21000, 'Sarl Solaris DZ'],
    ['s5', 'PV-OND-5K', 'Onduleur hybride 5kW', 'Photovoltaïque', 4, 2, 'Magasin', 149000, 'Condor Énergie'],
    ['s6', 'RIA-25-30', 'RIA 25/30 - Rouleau 30m + lance', 'Anti-incendie RIA', 8, 3, 'Magasin', 62000, 'Sarl Protection Incendie'],
    ['s7', 'NET-SW-24P', 'Switch PoE 24 ports', 'Réseaux', 6, 2, 'Magasin', 28000, 'TP-Link DZ'],
    ['s8', 'INC-CEN-2B', 'Centrale incendie 2 boucles', 'Détection incendie', 2, 2, 'Magasin', 89000, 'Siemens Feu Algérie'],
  ]) await insStock.run(id, ref, nom, cat, qty, minQty, loc, prix, fournisseur, now());

  const insDevis = db.prepare('INSERT INTO devis (id,num,clientId,titre,date,validite,status,tva,created) VALUES (?,?,?,?,?,?,?,?,?)');
  const insLigne = db.prepare('INSERT INTO devis_lignes (id,devisId,description,qty,pu) VALUES (?,?,?,?,?)');
  (await insDevis.run('d1', 'D-2026-001', 'c1', "Surveillance hôtel - 16 caméras + contrôle d'accès hall", addDays(-3), '30 jours', 'accepté', 19, now()));
  for (const [d, q, p] of [['Caméra IP 4MP IR x16', 16, 18000], ['NVR 16ch + 2x4To', 1, 89000], ["Centrale contrôle d'accès", 2, 45000], ['Pose + configuration + formation', 1, 240000]])
    await insLigne.run(uid('dl'), 'd1', d, q, p);
  (await insDevis.run('d2', 'D-2026-002', 'c3', 'Villa caméra + alarme + interphone', addDays(-1), '15 jours', 'envoyé', 19, now()));
  for (const [d, q, p] of [['Caméra IP x4', 4, 18000], ['Interphone vidéo', 1, 69000]]) await insLigne.run(uid('dl'), 'd2', d, q, p);
  (await insDevis.run('d3', 'D-2026-003', 'c4', 'Détection incendie entrepôt - 24 détecteurs', addDays(-6), '30 jours', 'accepté', 19, now()));
  for (const [d, q, p] of [['Détecteur optique adressable', 24, 3800], ['Centrale incendie 2 boucles', 1, 89000], ['Câblage + pose', 1, 310000]])
    await insLigne.run(uid('dl'), 'd3', d, q, p);

  const insFact = db.prepare('INSERT INTO factures (id,num,clientId,devisId,date,due,montant,paye,status,created) VALUES (?,?,?,?,?,?,?,?,?,?)');
  (await insFact.run('f1', 'F-2026-001', 'c1', 'd1', now(), addDays(14), 850000, 400000, 'partiel', now()));
  (await insFact.run('f2', 'F-2026-002', 'c2', null, now(), addDays(30), 220000, 220000, 'payée', now()));
  (await insFact.run('f3', 'F-2026-003', 'c4', 'd3', now(), addDays(-5), 610000, 0, 'envoyé', now()));

  const insProj = db.prepare('INSERT INTO projets (id,nom,clientId,devisId,phase,progress,chefId,deadline,description,created) VALUES (?,?,?,?,?,?,?,?,?,?)');
  (await insProj.run('p1', 'Hôtel El Aurassi - Surveillance', 'c1', 'd1', 'Installation', 65, 'u2', addDays(12), '16 caméras + 2 portes accès + NVR', now()));
  (await insProj.run('p2', 'Entrepôt Ouest - Détection incendie', 'c4', 'd3', 'Étude', 20, 'u2', addDays(40), '24 détecteurs + centrale', now()));

  const insInt = db.prepare('INSERT INTO interventions (id,titre,clientId,projetId,techId,date,duree,status,lieu,created) VALUES (?,?,?,?,?,?,?,?,?,?)');
  (await insInt.run('i1', 'Installation caméras aile B', 'c1', 'p1', 'u2', new Date().toISOString().slice(0, 16), 480, 'programmée', 'Hôtel El Aurassi', now()));
  (await insInt.run('i2', 'Relevé technique entrepôt', 'c4', 'p2', 'u4', addDays(2).slice(0, 16), 240, 'programmée', 'Entrepôt Ouest', now()));

  const insMnt = db.prepare('INSERT INTO maintenance (id,eq,lieu,clientId,type,next,status,techId,created) VALUES (?,?,?,?,?,?,?,?,?)');
  (await insMnt.run('m1', 'RIA RDC Hôtel', 'Hôtel El Aurassi - RDC', 'c1', 'RIA / Anti-incendie', addDays(8), 'À vérifier', 'u2', now()));
  (await insMnt.run('m2', 'Détecteurs fumées hall', 'Hôtel El Aurassi - Hall', 'c1', 'Détection incendie', addDays(45), 'OK', 'u2', now()));
  (await insMnt.run('m3', 'Désenfumage parking', 'Résidence Les Pins - P-1', 'c2', 'Désenfumage', addDays(-3), 'En retard', 'u2', now()));

  const insPtg = db.prepare('INSERT INTO pointages (id,empId,emp,type,ts,gps,lieu) VALUES (?,?,?,?,?,?,?)');
  (await insPtg.run('pt1', 'u2', 'Youssef El Amrani', 'ARRIVÉE', now(), '36.7538, 3.0588 (Alger)', 'Hôtel El Aurassi'));

  const insCon = db.prepare('INSERT INTO contrats (id,type,clientId,ref,objet,dateDep,dateFin,montant,statut,created) VALUES (?,?,?,?,?,?,?,?,?,?)');
  (await insCon.run('ct1', 'Contrat de maintenance', 'c1', 'CTR-2026-001', 'Surveillance + Détection incendie Hôtel El Aurassi', now(), addDays(365), 320000, 'signé', now()));
  (await insCon.run('ct2', 'Convention - Facture fournisseur', 'c2', 'CON-2026-014', 'RIA + Désenfumage Résidence Les Pins', now(), addDays(365), 180000, 'actif', now()));

  const insSol = db.prepare('INSERT INTO solaire (id,client,toiture,conso,kwc,production,rentabilite,cout,statut,created) VALUES (?,?,?,?,?,?,?,?,?,?)');
  (await insSol.run('so1', 'Villa Horizon - Aïn Benian', 85, 6500, 6, 7800, 6.2, 1450000, 'Étude', now()));
  (await insSol.run('so2', 'Entrepôt Ouest - Es Sénia', 400, 85000, 50, 62500, 5.8, 6800000, 'Chantier', now()));

  (await db.prepare('INSERT INTO documents (id,nom,cat,clientId,created) VALUES (?,?,?,?,?)')
    .run('dc1', 'Plan câblage RDC - Hôtel El Aurassi.pdf', 'Plan / Schéma', 'c1', now()));

  (await audit('système', 'Initialisation de la base de démonstration'));
}

/* ---------------- SEED PARC & CONTRATS (migration douce) ---------------- */
async function seedParc() {
  const n = (await db.prepare('SELECT COUNT(*) AS n FROM equipements').get()).n;
  if (n === 0) {
    const ins = db.prepare('INSERT INTO equipements (id,clientId,site,cat,marque,modele,serial,qty,dateInstall,garantie,nextCtrl,status,notes,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    for (const r of [
      ['eq1', 'c1', 'Hôtel El Aurassi — RDC', 'Vidéosurveillance', 'Hikvision', 'DS-7616NI-K2 (NVR 16ch)', 'HIK-NVR-229104', 1, addDays(-420), addDays(310), addDays(8), 'En service', 'NVR principal — 16 caméras, 2×4 To'],
      ['eq2', 'c1', 'Hôtel El Aurassi — Hall', 'Détection incendie', 'Siemens', 'FC726 — Centrale 2 boucles', 'SIE-FC726-88412', 1, addDays(-680), addDays(-20), addDays(45), 'En service', 'Supervision incendie hall + restaurants'],
      ['eq3', 'c1', 'Hôtel El Aurassi — RDC', 'RIA / Anti-incendie', 'Sarl Protection Incendie', 'RIA 25/30 — 30 m', 'RIA-2024-0451', 4, addDays(-500), addDays(230), addDays(8), 'Maintenance due', 'Vérification annuelle réglementaire'],
      ['eq4', 'c2', 'Résidence Les Pins — Parking P-1', 'Désenfumage', 'Somfy', 'Coffret désenfumage 8 zones', 'SOM-DS8-77120', 1, addDays(-900), addDays(-30), addDays(-3), 'Maintenance due', 'Contrôle en retard de 3 jours'],
      ['eq5', 'c2', 'Résidence Les Pins — Hall', "Contrôle d'accès", 'Hikvision', 'DS-K2602 — 2 portes', 'HIK-ACC-55108', 2, addDays(-300), addDays(430), addDays(75), 'En service', 'Badges résidents + interphone'],
      ['eq6', 'c4', 'Entrepôt Ouest — Zone A', 'Détection incendie', 'Siemens', 'FC1218 — 2 boucles', 'SIE-FC1218-33207', 1, addDays(-200), addDays(530), addDays(20), 'En service', 'Centrale incendie entrepôt'],
      ['eq7', 'c4', 'Entrepôt Ouest — Zone B', 'Détection incendie', 'Siemens', 'Détecteur optique adressable', 'SIE-DET-90112', 24, addDays(-200), addDays(530), addDays(20), 'En service', '24 détecteurs — câblage en boucle'],
      ['eq8', 'c1', 'Hôtel El Aurassi — Locaux techniques', 'Réseaux', 'TP-Link', 'Switch PoE 24 ports', 'TPL-SW24-11840', 1, addDays(-420), addDays(310), addDays(160), 'En service', 'Alimentation caméras + accès'],
      ['eq9', 'c3', 'Villa Horizon — Aïn Benian', 'Vidéosurveillance', 'Hikvision', 'Caméra IP 4MP IR 30m', 'HIK-CAM-77341', 4, addDays(-90), addDays(640), addDays(120), 'En service', 'Périmètre + entrée'],
      ['eq10', 'c2', 'Résidence Les Pins — Parking', 'Vidéosurveillance', 'Dahua', 'Caméra IP 2MP IR', 'DAH-CAM-40812', 2, addDays(-800), addDays(-90), addDays(-15), 'Hors service', 'Alimentation à remplacer — hors garantie'],
    ]) await ins.run(...r, now());
    (await audit('système', 'Initialisation du parc équipements'));
  }

  // Complète les contrats existants (colonnes ajoutées par migration)
  (await db.prepare("UPDATE contrats SET periodicite = COALESCE(NULLIF(periodicite,''), 'mensuel'), prochaineFacture = COALESCE(NULLIF(prochaineFacture,''), ?), sla = COALESCE(NULLIF(sla,''), '24h/7j'), sites = COALESCE(NULLIF(sites,''), 'Hôtel El Aurassi') WHERE ref = 'CTR-2026-001'").run(addDays(-2)));
  (await db.prepare("UPDATE contrats SET periodicite = COALESCE(NULLIF(periodicite,''), 'annuel'), prochaineFacture = COALESCE(NULLIF(prochaineFacture,''), ?), sla = COALESCE(NULLIF(sla,''), '48h ouvrées'), sites = COALESCE(NULLIF(sites,''), 'Résidence Les Pins') WHERE ref = 'CON-2026-014'").run(addDays(300)));
}

/* ---------------- SEED NOUVEAUX MODULES (migration douce) ---------------- */
async function seedNouveaux() {
  /* --- Salaires de démonstration (uniquement s'ils sont encore vides) --- */
  const salairesDemo = { u1: 180000, u2: 65000, u3: 58000, u4: 62000 };
  for (const id of Object.keys(salairesDemo)) {
    await db.prepare('UPDATE users SET salaire = ? WHERE id = ? AND (salaire IS NULL OR salaire = 0)').run(salairesDemo[id], id);
  }

  /* --- Assurances des employés (avec échéances pour les notifications) --- */
  if ((await db.prepare('SELECT COUNT(*) AS n FROM assurances').get()).n === 0) {
    const ins = db.prepare('INSERT INTO assurances (id,empId,type,assureur,numero,prime,dateDebut,dateFin,statut,couverture,notes,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
    for (const r of [
      ['as1', 'u2', 'Responsabilité civile professionnelle', 'Saham Assurance', 'RC-2026-00451', 4500, addDays(-300).slice(0, 10), addDays(20).slice(0, 10), 'active', 'RC décennale + dommages ouvrage', 'Renouvellement à négocier', now()],
      ['as2', 'u3', 'AMO / Assurance maladie', 'CAAR Assurances', 'AMO-2026-1187', 3200, addDays(-373).slice(0, 10), addDays(-8).slice(0, 10), 'active', 'Couverture soins + hospitalisation', 'Quittance impayée — à régulariser', now()],
      ['as3', 'u4', 'Assurance véhicule', 'Bharat Assurance', 'VEH-2026-7741', 2800, addDays(-165).slice(0, 10), addDays(200).slice(0, 10), 'active', 'Tous risques — utilitaire technique', '', now()],
      ['as4', 'u1', 'Assurance incendie des locaux', 'Saham Assurance', 'INC-2026-0912', 18500, addDays(-200).slice(0, 10), addDays(165).slice(0, 10), 'active', 'Locaux + matériel + stock', 'Local classe 75 — Tizi Ouzou', now()],
    ]) await ins.run(...r);
    (await audit('système', 'Initialisation des assurances employés'));
  }

  /* --- Dépenses de l'entreprise --- */
  if ((await db.prepare('SELECT COUNT(*) AS n FROM depenses').get()).n === 0) {
    const ins = db.prepare('INSERT INTO depenses (id,date,libelle,categorie,montant,modePaiement,ref,notes,created) VALUES (?,?,?,?,?,?,?,?,?)');
    for (const r of [
      ['dp1', addDays(-3).slice(0, 10), 'Loyer local commercial — classe 75', 'Loyer', 85000, 'virement', 'LOU-2026-11', 'Échéance mensuelle', now()],
      ['dp2', addDays(-6).slice(0, 10), 'Facture SONELGAZ — atelier + bureau', 'Énergie', 23400, 'chèque', 'EL-88213', '', now()],
      ['dp3', addDays(-9).slice(0, 10), 'Carburant camion technique n°1', 'Carburant', 15800, 'espèces', '', 'Déplacements chantiers', now()],
      ['dp4', addDays(-14).slice(0, 10), 'Fournitures bureau + consommables', 'Fournitures', 9750, 'espèces', '', '', now()],
      ['dp5', addDays(-18).slice(0, 10), 'Internet fibre + lignes téléphoniques', 'Télécom', 12600, 'prélèvement', 'TEL-2026', '', now()],
      ['dp6', addDays(-25).slice(0, 10), 'Entretien véhicule utilitaire', 'Entretien', 34500, 'chèque', '', 'Vidange + pneus', now()],
      ['dp7', addDays(-40).slice(0, 10), 'Loyer local commercial — classe 75', 'Loyer', 85000, 'virement', 'LOU-2026-10', '', now()],
    ]) await ins.run(...r);
    (await audit('système', 'Initialisation des dépenses'));
  }

  /* --- Ventes / achats de produits (stock mis à jour) --- */
  if ((await db.prepare('SELECT COUNT(*) AS n FROM mouvements').get()).n === 0) {
    const ins = db.prepare('INSERT INTO mouvements (id,type,date,clientId,tiers,lignes,totalHT,tva,totalTTC,statut,modePaiement,notes,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
    const lignes = [
      {
        id: 'mv1', type: 'vente', date: addDays(-4).slice(0, 10), clientId: 'c1', tiers: 'Hôtel El Aurassi',
        l: [
          { stockId: 's1', designation: 'Caméra IP 4MP IR 30m', qty: 4, pu: 18000 },
          { stockId: 's7', designation: 'Switch PoE 24 ports', qty: 1, pu: 28000 },
        ],
        statut: 'payé', mode: 'virement', notes: 'Aile B — extension surveillance',
      },
      {
        id: 'mv2', type: 'achat', date: addDays(-7).slice(0, 10), clientId: '', tiers: 'Siemens Feu Algérie',
        l: [
          { stockId: 's3', designation: 'Détecteur optique adressable', qty: 30, pu: 3800 },
        ],
        statut: 'payé', mode: 'virement', notes: 'Réapprovisionnement détection incendie',
      },
      {
        id: 'mv3', type: 'achat', date: addDays(-2).slice(0, 10), clientId: '', tiers: 'Sarl Solaris DZ',
        l: [
          { stockId: 's4', designation: 'Panneau photovoltaïque 450W', qty: 10, pu: 21000 },
        ],
        statut: 'confirmé', mode: 'chèque', notes: 'Commande chantier Es Sénia',
      },
    ];
    for (const m of lignes) {
      const ht = m.l.reduce((s, l) => s + l.qty * l.pu, 0);
      const ttc = ht * 1.19;
      await ins.run(m.id, m.type, m.date, m.clientId || null, m.tiers, JSON.stringify(m.l),
        Math.round(ht * 100) / 100, 19, Math.round(ttc * 100) / 100, m.statut, m.mode, m.notes, now());
      await applyStockMvt({ type: m.type, lignes: JSON.stringify(m.l) }, 1);
    }
    (await audit('système', 'Initialisation des ventes / achats de produits'));
  }
}

/* ---------------- SEED PAIE / CAISSE (migration douce) ---------------- */
async function seedPaie() {
  const ym = todayStr().slice(0, 7);

  /* Pointages de démonstration du mois en cours (jours, heures sup., déplacements).
     Idempotent : on ne crée que les jours qui n'ont pas déjà d'ARRIVÉE. */
  const ins = db.prepare('INSERT INTO pointages (id,empId,emp,type,ts,gps,lieu,date,heuresSup,deplacement,montant,note,horsWilaya,mission) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  const models = [
    { empId: 'u2', emp: 'Youssef El Amrani', gps: '36.7538, 3.0588 (Alger)', lieu: 'Hôtel El Aurassi' },
    { empId: 'u4', emp: 'Sami Haddad', gps: '36.7512, 3.0611 (Alger)', lieu: 'Entrepôt Ouest — Es Sénia' },
  ];
  let ajoutes = 0;
  for (const m of models) {
    for (let day = 2; day <= 9; day += 2) {
      const date = `${ym}-${String(day).padStart(2, '0')}`;
      const deja = (await db.prepare("SELECT COUNT(*) AS n FROM pointages WHERE empId = ? AND type = 'ARRIVÉE' AND substr(COALESCE(date, substr(ts,1,10)),1,10) = ?").get(m.empId, date)).n;
      if (deja) continue;
      const heuresSup = day === 6 ? 2 : (day === 8 ? 1.5 : 0);
      const deplacement = day === 8 ? 1 : 0;
      const horsWilaya = m.empId === 'u4' && day === 8 ? 1 : 0;
      const mission = horsWilaya ? 'M-ESSENIA-0' + day : '';
      const calc = calculerMontantPointage({ type: 'ARRIVÉE', heuresSup, deplacement, horsWilaya, mission });
      (await ins.run(uid('pt'), m.empId, m.emp, 'ARRIVÉE', date + 'T08:00:00', m.gps, m.lieu,
        date, heuresSup, deplacement, calc.total, 'Pointage manuel — paie calculée', horsWilaya, mission));
      ajoutes += 1;
    }
  }
  /* Illustre le forfait hors wilaya (une seule mission) sur les données de démo existantes */
  (await db.prepare("UPDATE pointages SET horsWilaya = 1, mission = ? WHERE empId = 'u4' AND type = 'ARRIVÉE' AND note = 'Pointage manuel — paie calculée' AND substr(COALESCE(date, substr(ts,1,10)),1,10) = ?")
    .run('M-ESSENIA-08', `${ym}-08`));
  if (ajoutes) (await audit('système', `Initialisation des pointages / paie du mois (${ajoutes} jours)`));

  /* Caisse : capital de départ + quelques avances */
  if ((await db.prepare('SELECT COUNT(*) AS n FROM caisse').get()).n === 0) {
    const ins = db.prepare('INSERT INTO caisse (id,date,type,libelle,empId,emp,montant,modePaiement,reference,notes,created) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
    const d = (n) => `${ym}-${String(n).padStart(2, '0')}`;
    (await ins.run(uid('ca'), d(1), 'Entrée', 'Capital de départ — caisse entreprise', null, null, 500000, 'virement', 'CAP-2026-001', 'Solde initial de la caisse', now()));
    (await ins.run(uid('ca'), d(4), 'Avance', 'Avance salaire — Youssef El Amrani', 'u2', 'Youssef El Amrani', 3500, 'espèces', '', 'Avance sur salaire du mois', now()));
    (await ins.run(uid('ca'), d(7), 'Avance', 'Avance salaire — Sami Haddad', 'u4', 'Sami Haddad', 2500, 'espèces', '', 'Avance carburant / déplacement', now()));
    (await ins.run(uid('ca'), d(9), 'Sortie', 'Fournitures de bureau — caisse', null, null, 3250, 'espèces', '', 'Achat consommables', now()));
    (await audit('système', 'Initialisation de la caisse'));
  }
  /* Ajustement des montants de la démo d'origine (anciennes valeurs) */
  (await db.prepare("UPDATE caisse SET montant = 3500 WHERE notes = 'Avance sur salaire du mois' AND montant = 15000").run());
  (await db.prepare("UPDATE caisse SET montant = 2500 WHERE notes = 'Avance carburant / déplacement' AND montant = 10000").run());
}

/* ---------------- COLLECTIONS ---------------- */
const COLLECTIONS = {
  clients: ['name', 'type', 'status', 'contact', 'email', 'phone', 'address', 'wilaya', 'nif', 'rc', 'nis', 'tin'],
  devis: ['num', 'clientId', 'titre', 'service', 'date', 'validite', 'status', 'tva', 'remise'],
  factures: ['num', 'clientId', 'devisId', 'service', 'date', 'due', 'montant', 'paye', 'status', 'objet', 'modePaiement', 'tva', 'lignes'],
  factures_achat: ['num', 'fournisseur', 'fournisseurNif', 'service', 'date', 'echeance', 'modePaiement', 'objet', 'totalHT', 'tva', 'totalTTC', 'statut', 'fichier', 'lignes'],
  projets: ['nom', 'clientId', 'devisId', 'service', 'phase', 'progress', 'chefId', 'deadline', 'description'],
  interventions: ['titre', 'clientId', 'projetId', 'techId', 'date', 'duree', 'status', 'lieu'],
  maintenance: ['eq', 'lieu', 'clientId', 'type', 'next', 'status', 'techId'],
  stock: ['ref', 'nom', 'cat', 'service', 'qty', 'minQty', 'loc', 'prix', 'fournisseur'],
  pointages: ['empId', 'emp', 'type', 'ts', 'gps', 'lieu', 'date', 'heuresSup', 'deplacement', 'montant', 'note', 'horsWilaya', 'mission'],
  contrats: ['type', 'clientId', 'ref', 'objet', 'service', 'dateDep', 'dateFin', 'montant', 'statut', 'periodicite', 'prochaineFacture', 'sla', 'sites'],
  equipements: ['clientId', 'site', 'cat', 'service', 'marque', 'modele', 'serial', 'qty', 'dateInstall', 'garantie', 'nextCtrl', 'status', 'notes'],
  solaire: ['client', 'toiture', 'conso', 'kwc', 'production', 'rentabilite', 'cout', 'statut'],
  documents: ['nom', 'cat', 'clientId'],
  users: ['name', 'email', 'role', 'phone', 'active', 'salaire', 'perms', 'services'],
  assurances: ['empId', 'type', 'assureur', 'numero', 'prime', 'dateDebut', 'dateFin', 'statut', 'couverture', 'piece', 'notes'],
  mouvements: ['type', 'service', 'date', 'clientId', 'tiers', 'lignes', 'totalHT', 'tva', 'totalTTC', 'statut', 'modePaiement', 'notes'],
  depenses: ['date', 'libelle', 'categorie', 'montant', 'modePaiement', 'ref', 'notes'],
  caisse: ['date', 'type', 'libelle', 'empId', 'emp', 'montant', 'modePaiement', 'reference', 'notes'],
};

/* Collection → module d'habilitation (voir ROLE_MODULES) */
const COL_MODULE = {
  clients: 'clients', devis: 'devis', factures: 'factures', factures_achat: 'achats',
  projets: 'projets', interventions: 'interventions', maintenance: 'maintenance',
  stock: 'stock', pointages: 'pointage', contrats: 'contrats', equipements: 'parc',
  solaire: 'solaire', documents: 'documents', users: 'users', assurances: 'users',
  mouvements: 'mouvements', depenses: 'depenses', caisse: 'caisse',
};

/* ---------------- HTTP HELPERS ---------------- */
function send(res, code, obj, headers = {}) {
  const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 12e6) { reject(new Error('Payload trop grand')); req.destroy(); } });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('JSON invalide')); } });
    req.on('error', reject);
  });
}
async function getUser(req) {
  const h = req.headers['authorization'] || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : (new URL(req.url, 'http://x').searchParams.get('token') || '');
  if (!token) return null;
  const s = (await db.prepare('SELECT * FROM sessions WHERE token = ?').get(token));
  if (!s) return null;
  if (s.expires && new Date(s.expires) < new Date()) {
    (await db.prepare('DELETE FROM sessions WHERE token = ?').run(token));
    return null;
  }
  const u = (await db.prepare('SELECT id,name,email,role,phone,active,perms,services,salaire FROM users WHERE id = ?').get(s.userId));
  if (!u || !u.active) return null; // compte désactivé → session invalidée
  return u;
}

/* Anti-force brute : 6 échecs maximum par (IP + email) sur 10 minutes */
const loginFails = new Map();
const LOGIN_MAX = 6;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || req.socket.remoteAddress || 'local';
}
function loginBlocked(key) {
  const rec = loginFails.get(key);
  if (!rec) return 0;
  if (Date.now() - rec.first > LOGIN_WINDOW_MS) { loginFails.delete(key); return 0; }
  if (rec.n < LOGIN_MAX) return 0;
  return Math.ceil((rec.first + LOGIN_WINDOW_MS - Date.now()) / 1000);
}
function loginFailed(key) {
  const rec = loginFails.get(key);
  if (!rec || Date.now() - rec.first > LOGIN_WINDOW_MS) loginFails.set(key, { n: 1, first: Date.now() });
  else rec.n += 1;
}

/* Nettoyage périodique des sessions expirées */
async function pruneSessions() {
  try { (await db.prepare('DELETE FROM sessions WHERE expires IS NOT NULL AND expires < ?').run(now())); } catch {}
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? '/index.html' : pathname;
  const file = path.join(PUBLIC, path.normalize(rel).replace(/^(\.\.[\/\\])+/, ''));
  if (!file.startsWith(PUBLIC)) return send(res, 403, { error: 'Accès refusé' });
  fs.readFile(file, (err, buf) => {
    if (err) {
      // Pas de repli HTML : un fichier absent doit renvoyer 404 (sinon un script cassé reste invisible)
      return send(res, 404, { error: 'Fichier introuvable' });
    }
    const ext = path.extname(file).toLowerCase();
    const isHtml = ext === '.html';
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': isHtml ? 'no-cache' : 'public, max-age=3600',
      'Last-Modified': new Date().toUTCString(),
    });
    res.end(buf);
  });
}

/* ---------------- DEVIS HELPERS ---------------- */
async function getDevis(id) {
  if (id && typeof id === 'object') id = id.id;
  const d = (await db.prepare('SELECT * FROM devis WHERE id = ?').get(id));
  if (!d) return null;
  d.lignes = (await db.prepare('SELECT * FROM devis_lignes WHERE devisId = ?').all(id));
  return d;
}
function devisTotal(d) {
  const brut = (d.lignes || []).reduce((s, l) => s + Number(l.qty || 0) * Number(l.pu || 0), 0);
  const remisePct = Math.max(0, Math.min(100, Number(d.remise || 0)));
  const remise = round2(brut * remisePct / 100);
  const ht = round2(brut - remise);
  const tvaPct = Number(d.tva != null ? d.tva : 19);
  const tvaMontant = round2(ht * tvaPct / 100);
  return { brut: round2(brut), remisePct, remise, ht, tva: tvaMontant, ttc: round2(ht + tvaMontant) };
}

/* ---------------- MOUVEMENTS PRODUITS (vente / achat) ---------------- */
function parseLignesMvt(raw) {
  if (Array.isArray(raw)) return raw;
  try { const v = JSON.parse(raw || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
function isVente(m) { return String((m && m.type) || '').toLowerCase().indexOf('vente') === 0; }

/* Vérifie que le stock couvre une vente (en tenant compte du mouvement remplacé) */
async function checkStockMvt(m, excludeId) {
  if (!isVente(m)) return null;
  for (const l of parseLignesMvt(m.lignes)) {
    if (!l.stockId) continue;
    const s = (await db.prepare('SELECT qty, nom FROM stock WHERE id = ?').get(l.stockId));
    if (!s) continue;
    let dispo = Number(s.qty || 0);
    if (excludeId) {
      const old = (await db.prepare('SELECT type, lignes FROM mouvements WHERE id = ?').get(excludeId));
      if (old && isVente(old)) {
        const ol = parseLignesMvt(old.lignes).find((x) => x.stockId === l.stockId);
        if (ol) dispo += Number(ol.qty || 0);
      }
    }
    if (Number(l.qty || 0) > dispo) {
      return `Stock insuffisant pour « ${s.nom || l.designation || 'article'} » : ${dispo} disponible(s), ${Number(l.qty || 0)} demandé(s)`;
    }
  }
  return null;
}

/* sign = 1 → applique le mouvement au stock, sign = -1 → annule le mouvement */
async function applyStockMvt(m, sign) {
  const sens = isVente(m) ? -1 : 1;
  for (const l of parseLignesMvt(m.lignes)) {
    if (!l.stockId) continue;
    const s = (await db.prepare('SELECT qty FROM stock WHERE id = ?').get(l.stockId));
    if (!s) continue;
    const q = Number(s.qty || 0) + sens * sign * Number(l.qty || 0);
    (await db.prepare('UPDATE stock SET qty = ? WHERE id = ?').run(q, l.stockId));
  }
}

/* Facture d'achat (scannée ou saisie) : chaque ligne de produit entre en stock.
   L'article existant est réapprovisionné (réf, puis désignation + pôle), sinon il est créé. */
async function stockFromAchatFacture(facture) {
  const lignes = parseLignesMvt(facture && facture.lignes);
  if (!lignes.length) return 0;
  const svc = normalizeService(facture.service) || DEFAULT_SERVICE;
  const fournisseur = String(facture.fournisseur || '').trim();
  let n = 0;
  for (const l of lignes) {
    const nom = String(l.designation || l.nom || '').trim();
    const qty = Number(l.quantite != null ? l.quantite : l.qty) || 0;
    if (!nom || qty <= 0) continue;
    const pu = round2(Number(l.prixUnitaireHT != null ? l.prixUnitaireHT : l.pu) || 0);
    const ref = String(l.ref || '').trim();
    let row = null;
    if (l.stockId) row = (await db.prepare('SELECT * FROM stock WHERE id = ?').get(l.stockId)) || null;
    if (!row && ref) row = (await db.prepare("SELECT * FROM stock WHERE lower(COALESCE(ref,'')) = lower(?)").get(ref)) || null;
    if (!row) {
      row = (await db.prepare('SELECT * FROM stock WHERE lower(nom) = lower(?) AND COALESCE(service, ?) = ?')
        .get(nom, DEFAULT_SERVICE, svc)) || null;
    }
    if (row) {
      (await db.prepare(`UPDATE stock SET qty = ?,
        prix = CASE WHEN ? > 0 THEN ? ELSE prix END,
        fournisseur = CASE WHEN ? <> '' THEN ? ELSE fournisseur END
        WHERE id = ?`)
        .run(Number(row.qty || 0) + qty, pu, pu, fournisseur, fournisseur, row.id));
    } else {
      (await db.prepare('INSERT INTO stock (id,ref,nom,cat,qty,minQty,loc,prix,fournisseur,service,created) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
        .run(uid('st'), ref || ('ACH-' + String(facture.num || Date.now())), nom,
          String(l.categorie || l.cat || 'Achat'), qty, 0, '', pu, fournisseur, svc, now()));
    }
    n++;
  }
  return n;
}

/* ---------------- MONTANT EN LETTRES (FR) ---------------- */
const FR_UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const FR_TENS = { 20: 'vingt', 30: 'trente', 40: 'quarante', 50: 'cinquante', 60: 'soixante', 80: 'quatre-vingt' };

function below100(n) {
  if (n < 20) return FR_UNITS[n];
  if (n < 70) {
    const t = Math.floor(n / 10) * 10, u = n % 10;
    if (u === 0) return FR_TENS[t];
    if (u === 1) return FR_TENS[t] + ' et un';
    return FR_TENS[t] + '-' + FR_UNITS[u];
  }
  if (n < 80) {
    if (n === 71) return 'soixante et onze';
    return 'soixante-' + below100(n - 60);
  }
  const u = n % 10;
  if (u === 0) return 'quatre-vingts';
  return 'quatre-vingt-' + below100(n - 80);
}
function below1000(n) {
  if (n < 100) return below100(n);
  const h = Math.floor(n / 100), r = n % 100;
  const head = h === 1 ? 'cent' : FR_UNITS[h] + ' cent';
  if (r === 0) return head + (h > 1 ? 's' : '');
  return head + ' ' + below100(r);
}
function numberToWordsFr(n) {
  n = Math.floor(Math.abs(Number(n) || 0));
  if (n === 0) return 'zéro';
  const parts = [];
  const milliards = Math.floor(n / 1e9);
  const millions = Math.floor((n % 1e9) / 1e6);
  const milliers = Math.floor((n % 1e6) / 1000);
  const reste = n % 1000;
  if (milliards) parts.push(below1000(milliards) + ' milliard' + (milliards > 1 ? 's' : ''));
  if (millions) parts.push(below1000(millions) + ' million' + (millions > 1 ? 's' : ''));
  if (milliers) parts.push(milliers === 1 ? 'mille' : below1000(milliers) + ' mille');
  if (reste) parts.push(below1000(reste));
  return parts.join(' ');
}
function montantEnLettres(n) {
  const val = Number(n) || 0;
  const entier = Math.floor(Math.abs(val));
  const centimes = Math.round((Math.abs(val) - entier) * 100);
  let s = numberToWordsFr(entier) + ' dinar' + (entier > 1 ? 's' : '');
  if (centimes > 0) s += ' et ' + numberToWordsFr(centimes) + ' centime' + (centimes > 1 ? 's' : '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---------------- NOTIFICATIONS MÉTIER ---------------- */
function moneyShort(n) {
  return Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' DA';
}
async function buildNotifications(me) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = (d) => Math.ceil((new Date(d) - today) / 86400000);
  const items = [];
  const add = (o) => { if (o && o.count > 0) items.push(o); };

  if (canModule(me, 'factures')) {
    const factures = filterByService((await db.prepare('SELECT * FROM factures').all()), me)
      .map((f) => ({ ...f, reste: round2(num(f.montant) - num(f.paye)) }));
    const late = factures.filter((f) => f.reste > 0.5 && f.due && new Date(f.due) < today);
    add({
      id: 'factures-retard', module: 'factures', severity: 'red', icon: 'receipt',
      title: 'Factures en retard', count: late.length,
      detail: `${late.length} facture(s) · ${moneyShort(late.reduce((s, f) => s + f.reste, 0))} à recouvrer`,
    });
    const week = factures.filter((f) => f.reste > 0.5 && f.due && days(f.due) >= 0 && days(f.due) <= 7);
    add({
      id: 'factures-echeance', module: 'factures', severity: 'amber', icon: 'clock',
      title: 'Échéances sous 7 jours', count: week.length,
      detail: `${week.length} facture(s) · ${moneyShort(week.reduce((s, f) => s + f.reste, 0))}`,
    });
  }
  if (canModule(me, 'achats')) {
    const achats = filterByService((await db.prepare('SELECT * FROM factures_achat').all()), me);
    const due = achats.filter((a) => String(a.statut || '').toLowerCase() === 'à payer');
    add({
      id: 'achats-a-payer', module: 'achats', severity: 'amber', icon: 'cart',
      title: 'Achats à payer', count: due.length,
      detail: `${due.length} facture(s) fournisseur · ${moneyShort(due.reduce((s, a) => s + num(a.totalTTC), 0))}`,
    });
  }
  if (canModule(me, 'stock')) {
    const stock = filterByService((await db.prepare('SELECT * FROM stock').all()), me)
      .filter((s) => Number(s.qty || 0) <= Number(s.minQty || 0));
    add({
      id: 'stock-critique', module: 'stock', severity: 'red', icon: 'box',
      title: 'Stock critique', count: stock.length,
      detail: stock.slice(0, 3).map((s) => s.nom || s.ref).join(', ') + (stock.length > 3 ? '…' : ''),
    });
  }
  if (canModule(me, 'contrats')) {
    const contrats = filterByService((await db.prepare('SELECT * FROM contrats').all()), me)
      .filter((c) => c.dateFin && days(c.dateFin) <= 60 && String(c.statut || '').toLowerCase() !== 'résiliée');
    add({
      id: 'contrats-renouveler', module: 'contrats', severity: 'amber', icon: 'file',
      title: 'Contrats à renouveler', count: contrats.length,
      detail: `${contrats.length} contrat(s) arrivent à échéance sous 60 jours`,
    });
  }
  if (canModule(me, 'maintenance')) {
    const maint = (await db.prepare('SELECT * FROM maintenance').all()).filter((m) => m.next && new Date(m.next) < today);
    add({
      id: 'maintenance-retard', module: 'maintenance', severity: 'red', icon: 'shield',
      title: 'Contrôles incendie en retard', count: maint.length,
      detail: `${maint.length} contrôle(s) à replanifier`,
    });
  }
  if (canModule(me, 'users')) {
    const ass = (await db.prepare('SELECT * FROM assurances').all())
      .filter((a) => a.dateFin && days(a.dateFin) <= 30 && String(a.statut || '').toLowerCase() !== 'résiliée');
    add({
      id: 'assurances-expirent', module: 'users', severity: 'amber', icon: 'alert',
      title: 'Assurances à renouveler', count: ass.length,
      detail: `${ass.length} assurance(s) arrivent à échéance sous 30 jours`,
    });
  }
  if (canModule(me, 'devis')) {
    const devis = filterByService((await db.prepare('SELECT * FROM devis').all()), me)
      .filter((d) => String(d.status || '').toLowerCase() === 'envoyé' && d.date && days(d.date) < -15);
    add({
      id: 'devis-sans-reponse', module: 'devis', severity: 'blue', icon: 'file-text',
      title: 'Devis sans réponse', count: devis.length,
      detail: `${devis.length} devis envoyé(s) depuis plus de 15 jours`,
    });
  }

  const rank = { red: 0, amber: 1, blue: 2 };
  items.sort((a, b) => (rank[a.severity] || 3) - (rank[b.severity] || 3));
  return { total: items.length, generated: now(), items };
}

/* ---------------- IA (GEMINI) ---------------- */
function parseJsonLoose(text) {
  let t = String(text || '').trim();
  t = t.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(t); } catch {}
  const ai = t.indexOf('['), oi = t.indexOf('{');
  let a = -1, b = -1;
  if (ai !== -1 && (oi === -1 || ai < oi)) { a = ai; b = t.lastIndexOf(']'); }
  else if (oi !== -1) { a = oi; b = t.lastIndexOf('}'); }
  if (a !== -1 && b > a) t = t.slice(a, b + 1);
  return JSON.parse(t);
}

async function callGemini(parts, opts = {}) {
  /* gemini-3.5-flash reste le modèle de référence. En cas de 503 (forte demande
     chez Google), on bascule sur les variantes « flash-lite » qui restent
     disponibles, afin que l'IA ne soit pas paralysée. */
  const models = [...new Set([
    'gemini-3.5-flash',
    CONFIG.geminiModel,
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
  ].filter(Boolean))];
  let lastErr = null;
  const errors = [];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const model of models) {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), opts.timeoutMs || 100000);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(CONFIG.googleApiKey)}`;
      const body = {
        contents: [{ parts }],
        generationConfig: {
          temperature: opts.temperature == null ? 0.15 : opts.temperature,
          maxOutputTokens: opts.maxOutputTokens || 4096,
          ...(opts.json ? { responseMimeType: 'application/json' } : {}),
          ...(opts.responseSchema ? { responseSchema: opts.responseSchema } : {}),
        },
      };
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ac.signal,
      });
      clearTimeout(to);
      const raw = await r.text();
      if (!r.ok) {
        errors.push(`${model}:${r.status}`);
        lastErr = new Error(`Gemini ${r.status} (${model})`);
        if (r.status === 429 || r.status >= 500) { await wait(900); continue; }
        throw lastErr;
      }
      const j = JSON.parse(raw);
      const text = (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts || [])
        .map((p) => p.text || '').join('').trim();
      if (!text) { errors.push(`${model}:vide`); lastErr = new Error('Réponse IA vide'); continue; }
      return { text, model };
    } catch (e) {
      clearTimeout(to);
      errors.push(`${model}:${e.name || e.message}`);
      lastErr = e;
      await wait(500);
    }
  }
  const err = lastErr || new Error('Service IA indisponible');
  err.message = `IA indisponible (${models[0]}) — ${errors.join(', ')}`;
  err.detail = errors.join(', ');
  throw err;
}

const AI_DOC_PROMPT = `Tu es un expert comptable, juridique et assurance algérien. Analyse ce document (facture d'achat, facture de vente, contrat, convention, autorisation ou attestation d'assurance) et renvoie UNIQUEMENT un objet JSON valide, sans aucun texte autour.

Structure attendue :
{
  "documentType": "devis" | "facture_achat" | "facture_vente" | "facture_proforma" | "bon_commande" | "bon_livraison" | "contrat" | "convention" | "autorisation" | "assurance" | "autre",
  "sens": "vente" | "achat" | "autre",
  "pole": "CCTV" | "ACC" | "INC" | "RIA" | "PV" | "COMMUN",
  "numero": "numéro du document",
  "date": "YYYY-MM-DD",
  "echeance": "YYYY-MM-DD",
  "emetteur": { "nom": "", "adresse": "", "rc": "", "nif": "", "ai": "", "nis": "", "tin": "", "email": "", "telephone": "" },
  "client": { "nom": "", "adresse": "", "rc": "", "nif": "", "nis": "", "tin": "" },
  "objet": "objet ou description générale",
  "modePaiement": "",
  "lignes": [
    { "designation": "", "unite": "U", "quantite": 1, "prixUnitaireHT": 0, "montantHT": 0, "tva": 19 }
  ],
  "totalHT": 0,
  "totalTVA": 0,
  "totalTTC": 0,
  "montantEnLettres": "",
  "contrat": { "objet": "", "dateDebut": "YYYY-MM-DD", "dateFin": "YYYY-MM-DD", "duree": "", "montant": 0, "typeContrat": "" },
  "assurance": { "type": "", "societe": "", "numero": "", "assure": "", "couverture": "", "prime": 0, "periodicite": "", "dateDebut": "YYYY-MM-DD", "dateFin": "YYYY-MM-DD" },
  "devise": "DA",
  "confiance": 0.0
}

Règles strictes :
- Montants en nombres sans espaces ni virgules (point décimal).
- TVA standard en Algérie : 19 %.
- Si une donnée est absente, mets "" ou 0, jamais null.
- Les désignations doivent être recopiées fidèlement.
- Pour une attestation d'assurance : remplis impérativement assurance.type (AMO, mutuelle, responsabilité civile, véhicule, incendie, vie…), assurance.societe, assurance.numero, assurance.prime, assurance.dateDebut et assurance.dateFin (fin de couverture / échéance).
- Ne renvoie rien d'autre que le JSON.`;

/* Identité réelle de l'entreprise : permet à l'IA de reconnaître ses propres
   documents (devis, factures, proformas, bons de livraison) et d'en déduire le sens. */
const AI_COMPANY_CONTEXT = `

IDENTITÉ DE L'ENTREPRISE UTILISATRICE DE L'ERP (documents qu'elle émet) :
- Raison sociale : ${CONFIG.company.name || ''}
- Adresse : ${CONFIG.company.address || ''}
- RC : ${CONFIG.company.rc || ''} · AI : ${CONFIG.company.ai || ''} · NIF : ${CONFIG.company.nif || ''} · NIS : ${CONFIG.company.nis || ''} · TIN : ${CONFIG.company.tin || ''}
- Email : ${CONFIG.company.email || ''} · Téléphone : ${CONFIG.company.phone || ''}
- Devise : ${CONFIG.company.currency || 'DA'} · TVA : ${CONFIG.company.vat || 19} %

Champs complémentaires à ajouter dans le JSON :
- "sens" : "vente" | "achat" | "autre" (voir les règles ci-dessous)
- "pole" : "CCTV" | "ACC" | "INC" | "RIA" | "PV" | "COMMUN"

Règles de reconnaissance automatique :
- Si l'émetteur (en-tête, cachet, NIF ou RC) est l'entreprise identifiée ci-dessus, le document est émis par elle : "sens" = "vente".
- Si le client ou le destinataire est cette entreprise, le document est reçu : "sens" = "achat" et "documentType" = "facture_achat".
- Si le document ne concerne pas cette entreprise, déduis le sens du contexte et mets "autre" en cas de doute.
- Types de documents émis par cette entreprise : "devis" (DEVIS, PROPOSITION, OFFRE DE PRIX), "facture_proforma" (FACTURE PROFORMA), "facture_vente" (FACTURE, NOTE DE DÉBIT), "bon_commande" (BON DE COMMANDE), "bon_livraison" (BON DE LIVRAISON).
- "pole" : CCTV pour caméras/NVR/XVR/vidéo, ACC pour contrôle d'accès/interphonie/badges, INC pour détection incendie/alarme/désenfumage, RIA pour RIA/poteaux/robinets incendie, PV pour photovoltaïque/solaire/onduleurs, COMMUN sinon.
- Reprends les désignations telles qu'elles figurent, avec unité, quantité, prix unitaire HT, montant HT et TVA.
- Les montants peuvent utiliser la virgule comme séparateur de milliers ou de décimales (ex. 1 108 050,00) : renvoie toujours un nombre JSON correct (1108050.00).
- Les totaux doivent être cohérents : totalHT = somme des montants HT, totalTVA = totalTTC - totalHT. Si le document est incohérent, garde les montants imprimés et baisse "confiance".
- Ne modifie jamais les numéros ni les montants imprimés.`;

function aiDocumentSens(d) {
  const norm = (v) => String(v || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/g, '');
  const em = d.emetteur || {};
  const cl = d.client || {};
  const companyName = norm(CONFIG.company.name);
  const companyShort = norm(CONFIG.company.shortName);
  const companyNif = norm(CONFIG.company.nif);
  const isCompany = (name, nif) => (nif && companyNif && nif === companyNif) ||
    (name && companyName && (name.indexOf(companyName) !== -1 || companyName.indexOf(name) !== -1)) ||
    (name && companyShort && name.indexOf(companyShort) !== -1);
  if (isCompany(norm(em.nom), norm(em.nif))) return 'vente';
  if (isCompany(norm(cl.nom), norm(cl.nif))) return 'achat';
  return null;
}

function aiNormalizeDocument(d) {
  if (!d || typeof d !== 'object') return {};
  d.emetteur = d.emetteur && typeof d.emetteur === 'object' ? d.emetteur : {};
  d.client = d.client && typeof d.client === 'object' ? d.client : {};
  const detected = aiDocumentSens(d);
  if (detected) d.sens = detected;
  d.sens = String(d.sens || '').toLowerCase();
  if (['vente', 'achat'].indexOf(d.sens) === -1) d.sens = 'autre';
  let pole = normalizeService(d.pole);
  if (!pole && Array.isArray(d.lignes)) {
    const low = d.lignes.map((l) => String((l && (l.designation || l.description)) || '')).join(' ').toLowerCase();
    if (/cam[eé]ra|nvr|xvr|vid[eé]o|d[oô]me|bullet|coaxial|bnc/.test(low)) pole = 'CCTV';
    else if (/acc[eè]s|interphone|badge|lecteur|g[aâ]che|portail/.test(low)) pole = 'ACC';
    else if (/incendie|d[eé]tecteur|alarme|d[eé]senfumage|centrale/.test(low)) pole = 'INC';
    else if (/\bria\b|poteau|robinet|tuyau/.test(low)) pole = 'RIA';
    else if (/solaire|photovolta|panneau|onduleur|batterie/.test(low)) pole = 'PV';
  }
  d.pole = pole || 'COMMUN';
  const type = String(d.documentType || '').toLowerCase();
  if (type === 'facture') d.documentType = d.sens === 'achat' ? 'facture_achat' : 'facture_vente';
  return d;
}

async function aiExtractDocument(base64, mimeType, kind) {
  const hints = {
    achat: "Il s'agit d'une facture ou d'un ticket d'achat fournisseur reçu par l'entreprise.",
    vente: "Il s'agit d'un document de vente émis par l'entreprise (facture, ticket, bon de livraison facturé).",
    devis: "Il s'agit d'un devis, d'une proposition commerciale, d'une offre de prix ou d'une facture proforma.",
    facture: "Il s'agit d'une facture de vente émise par l'entreprise (éventuellement à partir d'un devis signé).",
    contrat: "Il s'agit d'un contrat, d'une convention ou d'une autorisation.",
    assurance: "Il s'agit d'une attestation, police ou quittance d'assurance (entreprise ou employé).",
  };
  const hint = hints[kind] || "Détecte automatiquement le type de document et son sens (vente ou achat).";
  const parts = [
    { text: AI_DOC_PROMPT + AI_COMPANY_CONTEXT + '\n\nContexte : ' + hint },
    { inline_data: { mime_type: mimeType || 'image/jpeg', data: base64 } },
  ];
  const res = await callGemini(parts, { json: true, temperature: 0.1, maxOutputTokens: 4096 });
  return { data: aiNormalizeDocument(parseJsonLoose(res.text)), model: res.model };
}

async function aiGenerateLines(brief, tva) {
  const prompt = `Tu es un avant-vente expert en sécurité électronique en Algérie (vidéosurveillance, contrôle d'accès, détection incendie, RIA, désenfumage, réseaux, photovoltaïque).
À partir de la demande suivante, génère des lignes de devis/facture professionnelles et réalistes.
Demande : "${brief}"
TVA : ${tva || 19} %.
Renvoie un tableau JSON de 3 à 8 lignes, chaque ligne contenant exactement : designation (texte), unite (texte court), quantite (nombre), prixUnitaireHT (nombre).
Prix en dinars algériens (DA), cohérents avec le marché algérien.`;
  const schema = {
    type: 'ARRAY',
    items: {
      type: 'OBJECT',
      properties: {
        designation: { type: 'STRING' },
        unite: { type: 'STRING' },
        quantite: { type: 'NUMBER' },
        prixUnitaireHT: { type: 'NUMBER' },
      },
      required: ['designation', 'quantite', 'prixUnitaireHT'],
    },
  };
  const res = await callGemini([{ text: prompt }], { json: true, temperature: 0.4, maxOutputTokens: 4096, responseSchema: schema });
  let arr;
  try {
    arr = parseJsonLoose(res.text);
  } catch (e) {
    console.error('[AI lignes] Réponse illisible :', res.text.slice(0, 1200));
    throw new Error('Réponse IA illisible, veuillez réessayer');
  }
  if (!Array.isArray(arr)) arr = arr.lignes || arr.items || [];
  return { lignes: arr, model: res.model };
}

/* ---------------- IA : GARDE-FOU D'USAGE (coûts API) ---------------- */
const aiUsage = new Map();
const AI_WINDOW_MS = 10 * 60 * 1000;
const AI_MAX_CALLS = 30; // 30 appels IA max par compte et par tranche de 10 minutes
function aiThrottled(u) {
  const key = (u && u.id) || 'anonyme';
  const t = Date.now();
  const cur = aiUsage.get(key);
  if (!cur || t - cur.first > AI_WINDOW_MS) { aiUsage.set(key, { n: 1, first: t }); return 0; }
  if (cur.n >= AI_MAX_CALLS) return Math.ceil((cur.first + AI_WINDOW_MS - t) / 1000);
  cur.n += 1;
  return 0;
}

/* ---------------- IA : LECTURE D'UN JUSTIFICATIF DE DÉPENSE ---------------- */
async function aiExtractDepense(base64, mimeType) {
  const cats = ['Loyer', 'Énergie', 'Carburant', 'Fournitures', 'Télécom', 'Entretien', 'Salaires', 'Assurances', 'Transport', 'Impôts & taxes', 'Divers'];
  const prompt = `Tu es comptable dans une PME algérienne de sécurité électronique. Analyse ce justificatif (ticket de caisse, facture, reçu, facture d'énergie, carburant, télécom, loyer, etc.).
Renvoie UNIQUEMENT un objet JSON valide.
Règles :
- "libelle" : description courte et explicite de la dépense (émetteur + nature), en français.
- "categorie" : choisis EXACTEMENT une valeur parmi : ${cats.join(', ')}.
- "montant" : total TTC réellement payé, en dinars algériens, nombre sans espace ni virgule.
- "tva" : taux de TVA en pourcentage (19 par défaut si non indiqué).
- "date" : date du justificatif au format YYYY-MM-DD (vide si illisible).
- "modePaiement" : espèces, chèque, virement, carte ou prélèvement (vide si inconnu).
- "reference" : numéro de ticket/facture/référence si présent.
- "fournisseur" : nom de l'émetteur.
- "notes" : précisions utiles (articles, TVA, remise) en une phrase maximum.
- "confiance" : nombre entre 0 et 1.
Ne rien inventer : laisse vide ou 0 si l'information est absente.`;
  const schema = {
    type: 'OBJECT',
    properties: {
      libelle: { type: 'STRING' }, categorie: { type: 'STRING', enum: cats },
      montant: { type: 'NUMBER' }, tva: { type: 'NUMBER' }, date: { type: 'STRING' },
      modePaiement: { type: 'STRING' }, reference: { type: 'STRING' },
      fournisseur: { type: 'STRING' }, notes: { type: 'STRING' }, confiance: { type: 'NUMBER' },
    },
    required: ['libelle', 'categorie', 'montant'],
  };
  const res = await callGemini([
    { text: prompt },
    { inline_data: { mime_type: mimeType || 'image/jpeg', data: base64 } },
  ], { json: true, temperature: 0.1, maxOutputTokens: 2048, responseSchema: schema });
  return { data: parseJsonLoose(res.text), model: res.model };
}

/* ---------------- IA : INSTANTANÉ DE GESTION POUR L'ANALYSE ---------------- */
async function aiBusinessSnapshot(me) {
  const ym = new Date().toISOString().slice(0, 7);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const factures = filterByService((await db.prepare('SELECT * FROM factures').all()), me);
  const devis = await Promise.all(filterByService((await db.prepare('SELECT * FROM devis').all()), me).map(getDevis));
  const achats = filterByService((await db.prepare('SELECT * FROM factures_achat').all()), me);
  const stock = filterByService((await db.prepare('SELECT * FROM stock').all()), me);
  const contrats = filterByService((await db.prepare('SELECT * FROM contrats').all()), me);
  const clients = (await db.prepare('SELECT id,name FROM clients').all());
  const cName = (id) => (clients.find((c) => c.id === id) || {}).name || '—';
  const caFacture = round2(factures.reduce((s, f) => s + num(f.montant), 0));
  const caEncaisse = round2(factures.reduce((s, f) => s + num(f.paye), 0));
  const impayes = factures.map((f) => ({ ...f, reste: round2(Math.max(0, num(f.montant) - num(f.paye))) })).filter((f) => f.reste > 0.5);
  const retard = impayes.filter((f) => f.due && new Date(f.due) < today);
  const parClient = {};
  factures.forEach((f) => { const n = cName(f.clientId); parClient[n] = (parClient[n] || 0) + num(f.montant); });
  const topClients = Object.keys(parClient).map((n) => ({ client: n, ca: round2(parClient[n]) })).sort((a, b) => b.ca - a.ca).slice(0, 5);
  const devisAcceptes = devis.filter((d) => String(d.status || '') === 'accepté').length;
  const pipeline = round2(devis.filter((d) => ['brouillon', 'envoyé'].includes(String(d.status || '')))
    .reduce((s, d) => s + devisTotal(d).ttc, 0));
  const stockCrit = stock.filter((s) => Number(s.qty) <= Number(s.minQty));
  const depenses = (await db.prepare('SELECT * FROM depenses').all());
  const depMois = depenses.filter((d) => String(d.date || '').slice(0, 7) === ym);
  const depCats = {};
  depMois.forEach((d) => { const c = d.categorie || 'Divers'; depCats[c] = (depCats[c] || 0) + num(d.montant); });
  const contratsActifs = contrats.filter((c) => String(c.statut || '').toLowerCase() === 'actif').length;
  const contratsRenouveler = contrats.filter((c) => {
    if (!c.dateFin) return false;
    const j = Math.ceil((new Date(c.dateFin) - today) / 86400000);
    return j >= 0 && j <= 60;
  }).length;
  const maintenance = (await db.prepare('SELECT * FROM maintenance').all());
  const maintRetard = maintenance.filter((m) => m.next && new Date(m.next) < today).length;
  const achatsAPayer = round2(achats.filter((a) => String(a.statut || '').toLowerCase() === 'à payer').reduce((s, a) => s + num(a.totalTTC), 0));
  const achatsTotal = round2(achats.reduce((s, a) => s + num(a.totalTTC), 0));
  const depMoisTotal = round2(depMois.reduce((s, d) => s + num(d.montant), 0));
  return {
    mois: ym,
    caFacture, caEncaisse, soldeDu: round2(caFacture - caEncaisse),
    impayes: { count: impayes.length, montant: round2(impayes.reduce((s, f) => s + f.reste, 0)), enRetard: retard.length, retardMontant: round2(retard.reduce((s, f) => s + f.reste, 0)) },
    devis: { total: devis.length, acceptes: devisAcceptes, pipeline },
    achats: { total: achatsTotal, aPayer: achatsAPayer, count: achats.length },
    depensesMois: { total: depMoisTotal, parCategorie: Object.keys(depCats).map((k) => ({ categorie: k, montant: round2(depCats[k]) })).sort((a, b) => b.montant - a.montant) },
    stock: { refs: stock.length, valeur: round2(stock.reduce((s, i) => s + num(i.qty) * num(i.prix), 0)), critiques: stockCrit.length, articlesCritiques: stockCrit.slice(0, 6).map((s) => ({ article: s.nom, qty: num(s.qty), min: num(s.minQty) })) },
    contrats: { actifs: contratsActifs, aRenouveler60j: contratsRenouveler },
    maintenanceEnRetard: maintRetard,
    topClients,
    parPole: (await servicesSynthese(ym, me)),
    devise: 'DA',
  };
}

async function aiAnalyseGestion(me) {
  const snap = (await aiBusinessSnapshot(me));
  const schema = {
    type: 'OBJECT',
    properties: {
      resume: { type: 'STRING' },
      pointsForts: { type: 'ARRAY', items: { type: 'STRING' } },
      alertes: { type: 'ARRAY', items: { type: 'STRING' } },
      actions: { type: 'ARRAY', items: { type: 'STRING' } },
    },
    required: ['resume', 'pointsForts', 'alertes', 'actions'],
  };
  const prompt = `Tu es directeur financier d'une PME algérienne de sécurité électronique (vidéosurveillance, contrôle d'accès, incendie, RIA, photovoltaïque).
Voici les données consolidées de l'ERP pour le mois ${snap.mois} (montants en dinars algériens, DA) :
${JSON.stringify(snap, null, 1)}

Rédige une analyse de gestion professionnelle en français, factuelle et actionnable.
Règles strictes :
- "resume" : 3 à 4 phrases maximum, ton professionnel, sans emoji.
- "pointsForts" : 2 à 4 constats positifs chiffrés.
- "alertes" : 2 à 5 risques concrets (impayés, stock critique, trésorerie, maintenance, contrats).
- "actions" : 3 à 5 actions prioritaires classées par impact, formulées à l'impératif.
- Utilise uniquement les chiffres fournis, n'invente aucune donnée. Si une donnée est absente, ne la mentionne pas.
- Montants avec séparateur de milliers et suffixe DA.`;
  const res = await callGemini([{ text: prompt }], { json: true, temperature: 0.25, maxOutputTokens: 4096, responseSchema: schema });
  let data;
  try { data = parseJsonLoose(res.text); } catch {
    console.error('[AI analyse] Réponse illisible :', String(res.text || '').slice(0, 800));
    throw new Error('Réponse IA illisible, veuillez réessayer');
  }
  return { data, model: res.model, mois: snap.mois, genere: new Date().toISOString() };
}

/* ---------------- IMPRESSION FACTURE / DEVIS ---------------- */
function h(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function moneyFr(n) {
  return Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
async function factureDocData(f) {
  const client = (await db.prepare('SELECT * FROM clients WHERE id = ?').get(f.clientId)) || {};
  const tva = Number(f.tva || CONFIG.company.vat || 19);
  let lignes = [];
  let remise = 0;

  // 1. Instantané de la facture (immuable)
  const snap = parseLignesMvt(f.lignes);
  if (snap.length) {
    lignes = snap.map((l) => {
      const quantite = Number(l.quantite != null ? l.quantite : (l.qty || 0));
      const pu = Number(l.pu != null ? l.pu : (l.prixUnitaireHT || 0));
      return { designation: l.designation || l.description || '', unite: l.unite || 'U', quantite, pu, montant: round2(quantite * pu), tva: Number(l.tva != null ? l.tva : tva) };
    });
  } else if (f.devisId) {
    // 2. Repli : lignes du devis d'origine
    const d = (await getDevis(f.devisId));
    if (d) {
      lignes = (d.lignes || []).map((l) => ({
        designation: l.description, unite: 'U', quantite: Number(l.qty || 0),
        pu: Number(l.pu || 0), montant: round2(Number(l.qty || 0) * Number(l.pu || 0)), tva,
      }));
      const tot = devisTotal(d);
      remise = tot.remise;
      if (tot.remise > 0) {
        lignes.push({ designation: `Remise commerciale (${tot.remisePct} %)`, unite: 'U', quantite: 1, pu: -tot.remise, montant: -tot.remise, tva, isRemise: true });
      }
    }
  }

  if (!lignes.length) {
    const ttcRef = Number(f.montant || 0);
    const htRef = round2(ttcRef / (1 + tva / 100));
    lignes = [{ designation: f.objet || 'Prestation de services — sécurité électronique', unite: 'U', quantite: 1, pu: htRef, montant: htRef, tva }];
  }

  let ht = round2(lignes.reduce((s, l) => s + Number(l.montant || 0), 0));
  let ttc = round2(ht * (1 + tva / 100));
  // Le montant facturé est la référence comptable : on ajoute un ajustement si les lignes divergent
  const cible = round2(Number(f.montant || 0));
  if (cible > 0 && Math.abs(cible - ttc) > 0.5) {
    const ajust = round2(cible / (1 + tva / 100) - ht);
    lignes.push({ designation: 'Ajustement commercial', unite: 'U', quantite: 1, pu: ajust, montant: ajust, tva });
    ht = round2(ht + ajust);
    ttc = round2(cible);
  }
  const tvaMontant = round2(ttc - ht);
  return { client, lignes, ht, tvaMontant, ttc, tva, remise };
}

function renderInvoiceHtml(o) {
  const co = CONFIG.company;
  const isDevis = o.docType === 'DEVIS';
  const isBC = o.docType === 'BON DE COMMANDE';
  const docLabel = isBC ? 'BON DE COMMANDE' : (isDevis ? 'DEVIS' : 'FACTURE');
  const rows = o.lignes.map((l, i) => `
    <tr>
      <td class="c">${i + 1}</td>
      <td>${h(l.designation)}</td>
      <td class="c">${h(l.unite || 'U')}</td>
      <td class="r">${moneyFr(l.quantite)}</td>
      <td class="r">${moneyFr(l.pu)}</td>
      <td class="r">${moneyFr(l.montant)}</td>
      <td class="c">${h(l.tva)}</td>
    </tr>`).join('');
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${docLabel} ${h(o.numero)}</title>
<style>
  @page { size: A4; margin: 11mm 10mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color:#111; font-size:11.5px; margin:0; }
  .top { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
  .brand img { height:84px; }
  .co { text-align:right; line-height:1.45; font-size:10.5px; }
  .co .name { color:#e11d1d; font-size:19px; font-weight:800; letter-spacing:.3px; }
  .co .addr { margin:2px 0 3px; }
  hr.red { border:0; border-top:2px solid #e11d1d; margin:8px 0 0; }
  .meta { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1.5px solid #e11d1d; padding:8px 0 7px; }
  .meta .left b { font-size:16px; letter-spacing:.4px; }
  .meta .left .ids { font-size:10px; line-height:1.5; margin-top:3px; }
  .meta .right { text-align:right; font-weight:800; font-size:14px; }
  .client { font-size:10.5px; line-height:1.5; margin:7px 0 10px; }
  .client b { font-size:12px; }
  table { width:100%; border-collapse:collapse; }
  thead th { border:1px solid #111; background:#fff; font-size:10px; text-transform:uppercase; padding:5px 4px; }
  tbody td { border:1px solid #111; padding:6px 5px; vertical-align:top; }
  td.c, th.c { text-align:center; }
  td.r, th.r { text-align:right; }
  .totals { width:46%; margin-left:auto; margin-top:8px; border:1px solid #111; }
  .totals tr td { border:1px solid #111; padding:4px 8px; font-weight:700; }
  .totals tr td:last-child { text-align:right; }
  .lettres { margin-top:12px; font-size:11px; }
  .foot { margin-top:26px; border-top:1.5px solid #111; padding-top:5px; display:flex; justify-content:space-between; font-size:10.5px; font-weight:700; }
  .toolbar { position:fixed; top:10px; right:10px; }
  .toolbar button { background:#017E84; color:#fff; border:0; border-radius:5px; padding:9px 14px; font-weight:700; cursor:pointer; }
  @media print { .toolbar { display:none; } }
</style></head>
<body>
  <div class="toolbar"><button onclick="window.print()">Imprimer / PDF</button></div>
  <div class="top">
    <div class="brand"><img src="/assets/logo-header.png" alt="Advanced Security Systems"></div>
    <div class="co">
      <div class="name">${h(co.name)}</div>
      <div class="addr">${h(co.address)}</div>
      <div>RC : ${h(co.rc)}</div>
      <div>AI : ${h(co.ai)}</div>
      <div>NIF : ${h(co.nif)}</div>
      <div>NIS : ${h(co.nis)}</div>
    </div>
  </div>
  <hr class="red">
  <div class="meta">
    <div class="left">
      <b>${docLabel} N° : ${h(o.numero)}</b>
      <div class="ids">
        RC : ${h(co.rc)}<br>NIF : ${h(co.nif)}<br>NIS : ${h(co.nis)}<br>TIN : ${h(co.tin || '')}${o.refDevis ? '<br>Réf. devis : ' + h(o.refDevis) : ''}
      </div>
    </div>
    <div class="right">${h(o.date)}</div>
  </div>
  <div class="client">
    <b>CLIENT : ${h(o.client.name || '')}</b>
    ${o.client.address ? '<br>' + h(o.client.address) : ''}
    ${o.client.wilaya ? ' — ' + h(o.client.wilaya) : ''}
    <br>RC : ${h(o.client.rc || '')} &nbsp; NIF : ${h(o.client.nif || '')} &nbsp; NIS : ${h(o.client.nis || '')} &nbsp; TIN : ${h(o.client.tin || '')}
    ${o.objet ? '<br><b>Objet :</b> ' + h(o.objet) : ''}
  </div>
  <table>
    <thead><tr>
      <th class="c" style="width:4%">N°</th><th>DÉSIGNATION</th><th class="c" style="width:8%">UNITÉ</th>
      <th class="r" style="width:10%">QUANTITÉ</th><th class="r" style="width:14%">PU HT</th>
      <th class="r" style="width:15%">MONTANT HT</th><th class="c" style="width:7%">TVA</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <table class="totals">
    ${o.remise > 0 ? '<tr><td>TOTAL BRUT H.T</td><td>' + moneyFr(o.ht + o.remise) + '</td></tr><tr><td>REMISE</td><td>-' + moneyFr(o.remise) + '</td></tr>' : ''}
    <tr><td>TOTAL H.T</td><td>${moneyFr(o.ht)}</td></tr>
    <tr><td>TOTAL T.V.A</td><td>${moneyFr(o.tvaMontant)}</td></tr>
    <tr><td>TOTAL T.T.C</td><td>${moneyFr(o.ttc)}</td></tr>
    ${!isDevis && !isBC && o.paye > 0 ? '<tr><td>DÉJÀ RÉGLÉ</td><td>' + moneyFr(o.paye) + '</td></tr><tr><td>RESTE À PAYER</td><td>' + moneyFr(Math.max(0, o.ttc - o.paye)) + '</td></tr>' : ''}
  </table>
  <div class="lettres">
    Arrêtée la présente ${isBC ? 'commande' : (isDevis ? 'offre' : 'facture')} à la somme de :
    <b>${h(montantEnLettres(o.ttc))}</b>.
  </div>
  ${o.modePaiement ? '<div class="lettres">Mode de paiement : <b>' + h(o.modePaiement) + '</b></div>' : ''}
  ${!isBC && o.validite ? '<div class="lettres">Validité offre : <b>' + h(o.validite) + '</b></div>' : ''}
  ${!isDevis && !isBC && o.due ? '<div class="lettres">Échéance de règlement : <b>' + h(o.due) + '</b></div>' : ''}
  ${!isDevis && !isBC && !o.payee ? '<div class="lettres" style="margin-top:10px;font-size:10px;color:#444">Règlement par virement bancaire ou chèque à l\'ordre de ' + h(co.name) + (co.bank ? ' — ' + h(co.bank) : '') + '.</div>' : ''}
  ${isBC ? '<div style="display:flex;justify-content:space-between;gap:30px;margin-top:30px;font-size:10.5px"><div style="width:45%">Le client<br><span style="font-size:9.5px;color:#555">Nom, cachet et signature</span><div style="height:52px"></div><div style="border-top:1px solid #999"></div></div><div style="width:45%;text-align:right">Pour ' + h(co.name) + '<br><span style="font-size:9.5px;color:#555">Cachet et signature</span><div style="height:52px"></div><div style="border-top:1px solid #999"></div></div></div>' : ''}
  <div class="foot"><span>EMAIL : ${h(co.email)}</span><span>N° Tél : ${h(co.phone)}</span></div>
</body></html>`;
}

/* ---------------- ATTESTATION DE CONFORMITÉ (PARC) ---------------- */
function renderAttestationHtml(client, eqs) {
  const co = CONFIG.company;
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const d = (v) => (v ? new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—');
  const rows = eqs.map((e, i) => {
    const late = e.nextCtrl && new Date(e.nextCtrl) < new Date();
    return `<tr>
      <td class="c">${i + 1}</td>
      <td><b>${h(e.cat || '')}</b><br><span class="muted">${h(e.marque || '')} ${h(e.modele || '')}</span></td>
      <td>${h(e.site || '—')}</td>
      <td class="mono">${h(e.serial || '—')}</td>
      <td class="c">${Number(e.qty || 1)}</td>
      <td class="c">${d(e.dateInstall)}</td>
      <td class="c ${late ? 'late' : ''}">${d(e.nextCtrl)}</td>
      <td class="c">${h(e.status || '—')}</td>
    </tr>`;
  }).join('');
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Attestation de conformité — ${h(client.name)}</title>
<style>
  @page { size: A4; margin: 12mm 11mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color:#111; font-size:11px; margin:0; }
  .top { display:flex; justify-content:space-between; align-items:flex-start; gap:18px; }
  .brand img { height:80px; }
  .co { text-align:right; line-height:1.5; font-size:10px; }
  .co .name { color:#e11d1d; font-size:18px; font-weight:800; }
  hr.red { border:0; border-top:2px solid #e11d1d; margin:8px 0 0; }
  h1 { text-align:center; font-size:17px; letter-spacing:.4px; margin:20px 0 2px; text-transform:uppercase; }
  .sub { text-align:center; font-size:11px; color:#555; margin-bottom:16px; }
  .box { border:1px solid #d8d8d8; border-radius:3px; padding:10px 12px; margin-bottom:12px; }
  .box b { font-size:11px; }
  .grid { display:flex; gap:26px; }
  .grid > div { flex:1; line-height:1.6; }
  .lbl { color:#777; font-size:9.5px; text-transform:uppercase; letter-spacing:.3px; }
  p { line-height:1.65; text-align:justify; margin:9px 0; }
  table { width:100%; border-collapse:collapse; margin:10px 0 12px; font-size:9.8px; }
  th { background:#f4f4f4; border:1px solid #ddd; padding:6px 5px; text-align:left; font-size:9px; text-transform:uppercase; }
  td { border:1px solid #e3e3e3; padding:5px; vertical-align:top; }
  .c { text-align:center; } .mono { font-family:Consolas,monospace; font-size:9px; }
  .muted { color:#777; font-size:9px; } .late { color:#b91c1c; font-weight:700; }
  .sign { display:flex; justify-content:space-between; margin-top:30px; }
  .sign div { width:42%; border-top:1px solid #999; padding-top:6px; text-align:center; font-size:10px; color:#555; }
  .foot { position:fixed; bottom:0; left:0; right:0; border-top:1px solid #ddd; padding-top:5px; font-size:8.5px; color:#666; text-align:center; }
  .noprint { text-align:center; margin:14px 0; }
  .noprint button { padding:8px 18px; border:0; background:#111; color:#fff; border-radius:4px; cursor:pointer; }
  @media print { .noprint { display:none; } }
</style></head><body>
  <div class="top">
    <div class="brand"><img src="/assets/logo.png" alt="Advanced Security Systems"></div>
    <div class="co">
      <div class="name">${h(co.name)}</div>
      <div>${h(co.address)}</div>
      <div>Tél : ${h(co.phone)} · Email : ${h(co.email)}</div>
      <div>RC ${h(co.rc)} · NIF ${h(co.nif)} · AI ${h(co.ai)}</div>
    </div>
  </div>
  <hr class="red">
  <h1>Attestation de conformité</h1>
  <div class="sub">Suivi et maintenance des installations de sécurité incendie et de sûreté</div>

  <div class="box">
    <div class="grid">
      <div>
        <div class="lbl">Client</div><b>${h(client.name)}</b><br>
        ${h(client.address || '')}<br>${h(client.wilaya || '')}
      </div>
      <div>
        <div class="lbl">Identifiants</div>
        NIF : ${h(client.nif || '—')}<br>RC : ${h(client.rc || '—')}<br>
        Contact : ${h(client.contact || '—')} · ${h(client.phone || '')}
      </div>
      <div>
        <div class="lbl">Attestation n°</div>
        <b>ATT-${new Date().getFullYear()}-${String(client.id || '').slice(-4).toUpperCase()}</b><br>
        Émise le ${today}
      </div>
    </div>
  </div>

  <p>La société <b>${h(co.name)}</b> atteste assurer le suivi technique et la maintenance préventive des équipements de sécurité
  énumérés ci-dessous, installés sur le site de <b>${h(client.name)}</b>. Les interventions sont réalisées par des techniciens
  qualifiés et les vérifications périodiques sont planifiées conformément aux préconisations des constructeurs et aux règles
  de l'art applicables aux installations de sécurité incendie et de sûreté électronique.</p>

  <table>
    <thead><tr>
      <th class="c" style="width:4%">N°</th><th style="width:26%">Équipement</th><th style="width:19%">Site / localisation</th>
      <th style="width:14%">N° de série</th><th class="c" style="width:5%">Qté</th>
      <th class="c" style="width:10%">Installé le</th><th class="c" style="width:11%">Prochain contrôle</th><th class="c" style="width:11%">État</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="8" class="c">Aucun équipement enregistré pour ce client.</td></tr>'}</tbody>
  </table>

  <p>La présente attestation est délivrée pour servir et valoir ce que de droit. Elle ne constitue pas une certification
  de conformité au sens d'un organisme agréé ; elle documente le périmètre et le suivi de maintenance assurés par
  ${h(co.shortName || co.name)}.</p>

  <div class="sign">
    <div>Fait à Tizi Ouzou, le ${today}<br><br>Le client</div>
    <div>Cachet et signature<br><br>${h(co.shortName || co.name)}</div>
  </div>

  <div class="foot">${h(co.name)} · ${h(co.address)} · RC ${h(co.rc)} · NIF ${h(co.nif)} · AI ${h(co.ai)} · NIS ${h(co.nis)}</div>
  <div class="noprint"><button onclick="window.print()">Imprimer l'attestation</button></div>
</body></html>`;
}

/* ---------------- BALANCE ÂGÉE ---------------- */
function agingBuckets(factures) {
  const cols = [
    { key: 'nonEchu', label: 'Non échu', test: (j) => j <= 0 },
    { key: 'j30', label: '1 à 30 jours', test: (j) => j > 0 && j <= 30 },
    { key: 'j60', label: '31 à 60 jours', test: (j) => j > 30 && j <= 60 },
    { key: 'j90', label: '61 à 90 jours', test: (j) => j > 60 && j <= 90 },
    { key: 'plus90', label: '+ de 90 jours', test: (j) => j > 90 },
  ].map((c) => ({ ...c, montant: 0, count: 0 }));
  const today = new Date();
  factures.forEach((f) => {
    const reste = num(f.montant) - num(f.paye);
    if (reste <= 0.01) return;
    const ref = f.due || f.date;
    const days = ref ? Math.ceil((today - new Date(ref)) / 86400000) : 0;
    const bucket = cols.find((c) => c.test(days)) || cols[cols.length - 1];
    bucket.montant = round2(bucket.montant + reste);
    bucket.count += 1;
  });
  return cols.map(({ key, label, montant, count }) => ({ key, label, montant, count }));
}

/* ---------------- RELEVÉ DE COMPTE CLIENT ---------------- */
function renderReleveHtml(client, factures) {
  const co = CONFIG.company;
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const rows = factures.map((f) => ({
    ...f,
    reste: round2(num(f.montant) - num(f.paye)),
    late: f.due && new Date(f.due) < new Date() && num(f.montant) - num(f.paye) > 0.01,
  }));
  const totalFacture = round2(rows.reduce((s, f) => s + num(f.montant), 0));
  const totalPaye = round2(rows.reduce((s, f) => s + num(f.paye), 0));
  const solde = round2(totalFacture - totalPaye);
  const aging = agingBuckets(factures);
  const body = rows.length ? rows.map((f, i) => `
    <tr>
      <td class="c">${i + 1}</td>
      <td class="mono">${h(f.num)}</td>
      <td class="c">${h(f.date ? new Date(f.date).toLocaleDateString('fr-FR') : '—')}</td>
      <td class="c ${f.late ? 'late' : ''}">${h(f.due ? new Date(f.due).toLocaleDateString('fr-FR') : '—')}</td>
      <td>${h(f.objet || '—')}</td>
      <td class="r">${moneyFr(f.montant)}</td>
      <td class="r">${moneyFr(f.paye)}</td>
      <td class="r ${f.reste > 0 ? 'due' : ''}">${moneyFr(f.reste)}</td>
      <td class="c">${h(f.status || '—')}</td>
    </tr>`).join('') : '<tr><td colspan="9" class="c">Aucune facture enregistrée pour ce client.</td></tr>';

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Relevé de compte — ${h(client.name)}</title>
<style>
  @page { size: A4; margin: 12mm 11mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color:#111; font-size:11px; margin:0; }
  .top { display:flex; justify-content:space-between; align-items:flex-start; gap:18px; }
  .brand img { height:80px; }
  .co { text-align:right; line-height:1.5; font-size:10px; }
  .co .name { color:#e11d1d; font-size:18px; font-weight:800; }
  hr.red { border:0; border-top:2px solid #e11d1d; margin:8px 0 0; }
  h1 { text-align:center; font-size:16px; letter-spacing:.5px; margin:18px 0 2px; text-transform:uppercase; }
  .sub { text-align:center; font-size:10.5px; color:#555; margin-bottom:14px; }
  .box { border:1px solid #d8d8d8; border-radius:3px; padding:9px 12px; margin-bottom:10px; display:flex; gap:24px; }
  .box > div { flex:1; line-height:1.55; }
  .lbl { color:#777; font-size:9px; text-transform:uppercase; letter-spacing:.3px; }
  table { width:100%; border-collapse:collapse; font-size:9.8px; }
  th { background:#f4f4f4; border:1px solid #ddd; padding:6px 5px; text-align:left; font-size:9px; text-transform:uppercase; }
  td { border:1px solid #e6e6e6; padding:5px; vertical-align:top; }
  .c { text-align:center; } .r { text-align:right; } .mono { font-family:Consolas,monospace; font-size:9px; }
  .late { color:#b91c1c; font-weight:700; } .due { color:#b91c1c; font-weight:700; }
  .tot td { font-weight:800; background:#fafafa; }
  .aging { width:100%; margin-top:14px; }
  .sign { display:flex; justify-content:space-between; margin-top:26px; }
  .sign div { width:42%; border-top:1px solid #999; padding-top:6px; text-align:center; font-size:10px; color:#555; }
  .foot { position:fixed; bottom:0; left:0; right:0; border-top:1px solid #ddd; padding-top:5px; font-size:8.5px; color:#666; text-align:center; }
  .noprint { text-align:center; margin:14px 0; }
  .noprint button { padding:8px 18px; border:0; background:#111; color:#fff; border-radius:4px; cursor:pointer; }
  @media print { .noprint { display:none; } }
</style></head><body>
  <div class="top">
    <div class="brand"><img src="/assets/logo.png" alt="Advanced Security Systems"></div>
    <div class="co">
      <div class="name">${h(co.name)}</div>
      <div>${h(co.address)}</div>
      <div>Tél : ${h(co.phone)} · ${h(co.email)}</div>
      <div>RC ${h(co.rc)} · NIF ${h(co.nif)} · AI ${h(co.ai)}</div>
    </div>
  </div>
  <hr class="red">
  <h1>Relevé de compte client</h1>
  <div class="sub">Situation au ${today} — montants en dinars algériens (DA)</div>

  <div class="box">
    <div>
      <div class="lbl">Client</div><b>${h(client.name)}</b><br>
      ${h(client.address || '')}<br>${h(client.wilaya || '')}
    </div>
    <div>
      <div class="lbl">Identifiants</div>
      NIF : ${h(client.nif || '—')}<br>RC : ${h(client.rc || '—')}<br>
      Contact : ${h(client.contact || '—')} · ${h(client.phone || '')}
    </div>
    <div>
      <div class="lbl">Synthèse</div>
      Total facturé : <b>${moneyFr(totalFacture)}</b><br>
      Total encaissé : <b>${moneyFr(totalPaye)}</b><br>
      Solde dû : <b style="color:${solde > 0 ? '#b91c1c' : '#166534'}">${moneyFr(solde)}</b>
    </div>
  </div>

  <table>
    <thead><tr>
      <th class="c" style="width:4%">N°</th><th style="width:12%">Facture</th><th class="c" style="width:10%">Date</th>
      <th class="c" style="width:10%">Échéance</th><th>Objet</th><th class="r" style="width:12%">Montant TTC</th>
      <th class="r" style="width:12%">Encaissé</th><th class="r" style="width:12%">Reste dû</th><th class="c" style="width:9%">Statut</th>
    </tr></thead>
    <tbody>${body}</tbody>
    <tbody><tr class="tot">
      <td colspan="5" class="r">TOTAUX</td>
      <td class="r">${moneyFr(totalFacture)}</td><td class="r">${moneyFr(totalPaye)}</td><td class="r">${moneyFr(solde)}</td><td></td>
    </tr></tbody>
  </table>

  <table class="aging">
    <thead><tr><th>Balance âgée des créances</th>${aging.map((b) => `<th class="r">${h(b.label)}</th>`).join('')}</tr></thead>
    <tbody><tr><td>Montant restant dû</td>${aging.map((b) => `<td class="r">${moneyFr(b.montant)}</td>`).join('')}</tr></tbody>
  </table>

  <p style="margin-top:14px;line-height:1.6;font-size:10px;text-align:justify">
    Ce relevé récapitule l'ensemble des factures émises par ${h(co.name)} à l'attention de ${h(client.name)}.
    Les montants indiqués sont hors avoirs éventuels. Pour toute contestation, merci de nous contacter dans un délai de 15 jours.
  </p>

  <div class="sign">
    <div>Fait à Tizi Ouzou, le ${today}<br><br>Le client</div>
    <div>Cachet et signature<br><br>${h(co.shortName || co.name)}</div>
  </div>

  <div class="foot">${h(co.name)} · ${h(co.address)} · RC ${h(co.rc)} · NIF ${h(co.nif)} · AI ${h(co.ai)} · NIS ${h(co.nis)}</div>
  <div class="noprint"><button onclick="window.print()">Imprimer le relevé</button></div>
</body></html>`;
}

/* ---------------- ROUTER ---------------- */
async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  const method = req.method;
  const parts = pathname.split('/').filter(Boolean); // e.g. ['api','clients','c1']

  /* ---------- HEALTHCHECK (public, léger, sans session) ---------- */
  if (pathname === '/api/health') {
    try {
      await db.prepare('SELECT 1 AS ok').get();
      return send(res, 200, { ok: true, db: 'ok', model: CONFIG.geminiModel, version: '2.0.0', time: now() });
    } catch (e) {
      return send(res, 503, { ok: false, db: String(e && e.message || e) });
    }
  }

  /* ---------- AUTH ---------- */
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { email, password } = await readBody(req);
    const key = clientIp(req) + '|' + String(email || '').toLowerCase();
    const wait = loginBlocked(key);
    if (wait) return send(res, 429, { error: `Trop de tentatives. Réessayez dans ${Math.ceil(wait / 60)} minute(s).` });
    const u = (await db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(String(email || '')));
    if (!u || !verifyPass(password, u.pass)) {
      loginFailed(key);
      (await audit(String(email || 'inconnu'), 'Échec de connexion'));
      return send(res, 401, { error: 'Identifiants incorrects' });
    }
    if (!u.active) return send(res, 403, { error: 'Compte désactivé — contactez un administrateur' });
    loginFails.delete(key);
    const token = crypto.randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
    (await db.prepare('INSERT INTO sessions (token,userId,created,expires,agent) VALUES (?,?,?,?,?)')
      .run(token, u.id, now(), expires, String(req.headers['user-agent'] || '').slice(0, 180)));
    (await audit(u.name, 'Connexion'));
    return send(res, 200, {
      token, expires,
      user: { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, perms: u.perms, services: u.services, salaire: u.salaire, modules: userModules(u) },
    });
  }

  /* Configuration publique (page de connexion) */
  if (pathname === '/api/public/config' && method === 'GET') {
    return send(res, 200, {
      company: CONFIG.company && CONFIG.company.shortName || 'Advanced Security Systems',
      fullName: CONFIG.company && CONFIG.company.name || '',
      demoMode: !!CONFIG.demoMode,
      version: '2.0.0',
    });
  }

  /* Changement de mot de passe (utilisateur connecté) */
  if (pathname === '/api/auth/password' && method === 'POST') {
    const mePwd = (await getUser(req));
    if (!mePwd) return send(res, 401, { error: 'Non authentifié' });
    const body = await readBody(req);
    const current = String(body.current || '');
    const next = String(body.next || '');
    if (next.length < 8) return send(res, 400, { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
    const full = (await db.prepare('SELECT pass FROM users WHERE id = ?').get(mePwd.id));
    if (!full || !verifyPass(current, full.pass)) return send(res, 400, { error: 'Mot de passe actuel incorrect' });
    (await db.prepare('UPDATE users SET pass = ? WHERE id = ?').run(hashPass(next), mePwd.id));
    // Déconnecte les autres sessions (sécurité)
    const h = req.headers['authorization'] || '';
    const currentToken = h.startsWith('Bearer ') ? h.slice(7) : '';
    (await db.prepare('DELETE FROM sessions WHERE userId = ? AND token != ?').run(mePwd.id, currentToken || ''));
    (await audit(mePwd.name, 'Changement de mot de passe'));
    return send(res, 200, { ok: true });
  }

  if (pathname === '/api/auth/logout' && method === 'POST') {
    const h = req.headers['authorization'] || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (token) (await db.prepare('DELETE FROM sessions WHERE token = ?').run(token));
    return send(res, 200, { ok: true });
  }

  /* ---------- PROTECTED ---------- */
  const me = (await getUser(req));
  /* Un token dédié permet les sauvegardes automatisées (cron) sans stocker
     de session admin dans un dépôt ou un fichier. */
  const backupSecret = String(process.env.BACKUP_TOKEN || '');
  const sentBackupToken = String(req.headers['x-backup-token'] || '');
  const isBackupJob = pathname === '/api/backup' && method === 'GET'
    && !!backupSecret && sentBackupToken.length === backupSecret.length
    && crypto.timingSafeEqual(Buffer.from(sentBackupToken), Buffer.from(backupSecret));
  if (pathname.startsWith('/api/')) {
    if (!me && !isBackupJob) return send(res, 401, { error: 'Non authentifié' });
  }

  if (pathname === '/api/auth/me') return send(res, 200, { user: { ...me, modules: userModules(me) } });

  /* ---------- NOTIFICATIONS MÉTIER ---------- */
  if (pathname === '/api/notifications' && method === 'GET') {
    return send(res, 200, (await buildNotifications(me)));
  }

  /* ---------- PÔLES / SERVICES ---------- */
  if (pathname === '/api/services' && method === 'GET') {
    return send(res, 200, { services: SERVICES, allowed: userServices(me) });
  }
  if (pathname === '/api/services/synthese' && method === 'GET') {
    const mois = String(url.searchParams.get('mois') || '').slice(0, 7) || new Date().toISOString().slice(0, 7);
    const rows = (await servicesSynthese(mois, me));
    const totals = rows.reduce((t, s) => ({
      ventesHT: round2(t.ventesHT + s.ventesHT), achatsHT: round2(t.achatsHT + s.achatsHT),
      marge: round2(t.marge + s.marge), caFacture: round2(t.caFacture + s.caFacture),
      caEncaisse: round2(t.caEncaisse + s.caEncaisse), stockValeur: round2(t.stockValeur + s.stockValeur),
      achatsFournisseur: round2(t.achatsFournisseur + s.achatsFournisseur),
    }), { ventesHT: 0, achatsHT: 0, marge: 0, caFacture: 0, caEncaisse: 0, stockValeur: 0, achatsFournisseur: 0 });
    return send(res, 200, { mois, services: rows, totals });
  }

  /* ---------- DASHBOARD ---------- */
  if (pathname === '/api/dashboard' && method === 'GET') {
    /* Cloisonnement : un compte limité à certains pôles ne voit que leurs données */
    const factures = filterByService((await db.prepare('SELECT * FROM factures').all()), me);
    const devis = await Promise.all(filterByService((await db.prepare('SELECT * FROM devis').all()), me).map(getDevis));
    const maintenance = (await db.prepare('SELECT * FROM maintenance').all());
    const stock = filterByService((await db.prepare('SELECT * FROM stock').all()), me);
    const projets = filterByService((await db.prepare('SELECT * FROM projets').all()), me);
    const interventions = (await db.prepare('SELECT * FROM interventions').all());
    const pointages = (await db.prepare('SELECT * FROM pointages').all());
    const achats = filterByService((await db.prepare('SELECT * FROM factures_achat').all()), me);
    const auditRows = (await db.prepare('SELECT * FROM audit ORDER BY ts DESC LIMIT 8').all());
    const depenses = (await db.prepare('SELECT * FROM depenses').all());
    const assurances = (await db.prepare('SELECT * FROM assurances').all());
    const employes = (await db.prepare('SELECT * FROM users').all());
    const mouvements = filterByService((await db.prepare('SELECT * FROM mouvements').all()), me);
    const caisse = (await db.prepare('SELECT * FROM caisse').all());

    const today = new Date().toDateString();
    const dLeft = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);
    const ym = new Date().toISOString().slice(0, 7);
    const depMois = depenses.filter((d) => String(d.date || '').slice(0, 7) === ym);
    const mvtMois = mouvements.filter((m) => String(m.date || '').slice(0, 7) === ym);
    const isVenteM = (m) => String(m.type || '').toLowerCase().indexOf('vente') === 0;
    const userName = (id) => (employes.find((u) => u.id === id) || {}).name || '—';
    const alertesAssurance = assurances
      .filter((a) => a.dateFin && String(a.statut || '').toLowerCase() !== 'résiliée' && dLeft(a.dateFin) <= 30)
      .sort((a, b) => dLeft(a.dateFin) - dLeft(b.dateFin))
      .map((a) => ({
        id: a.id,
        employe: userName(a.empId),
        type: a.type, assureur: a.assureur, dateFin: a.dateFin,
        jours: dLeft(a.dateFin), expire: dLeft(a.dateFin) < 0,
      }));

    // Les indicateurs financiers ne sont renvoyés qu'aux profils habilités
    const okFin = canModule(me, 'factures');
    const okAchats = canModule(me, 'achats');
    const okDep = canModule(me, 'depenses');
    const okDevis = canModule(me, 'devis');
    const okUsers = canModule(me, 'users');
    const okStock = canModule(me, 'stock');
    const okMaint = canModule(me, 'maintenance');
    const okCaisse = canModule(me, 'caisse');

    /* La masse salariale est calculée depuis les pointages du mois (jours × 2000
       + heures sup. × 375 + déplacements × 2000 + missions hors wilaya × 1200 − avances de la caisse). */
    const salaires = okUsers ? (await salairesPointage(ym)).filter((s) => s.active) : [];
    const masseSalariale = round2(salaires.reduce((s, x) => s + x.net, 0));
    const caisseInfo = soldeCaisse(caisse);
    const avancesMois = round2(caisse.filter((a) => a.type === 'Avance' && String(a.date || '').slice(0, 7) === ym).reduce((s, a) => s + num(a.montant), 0));

    /* Série des 6 derniers mois pour les graphiques du tableau de bord */
    const serieMois = [];
    for (let i = 5; i >= 0; i--) {
      const dm = new Date();
      dm.setDate(1);
      dm.setMonth(dm.getMonth() - i);
      const key = dm.toISOString().slice(0, 7);
      const label = dm.toLocaleDateString('fr-FR', { month: 'short' });
      const fm = factures.filter((f) => String(f.date || '').slice(0, 7) === key);
      const dp = depenses.filter((x) => String(x.date || '').slice(0, 7) === key);
      const ac = achats.filter((x) => String(x.date || '').slice(0, 7) === key);
      serieMois.push({
        key, label,
        facture: okFin ? round2(fm.reduce((s, f) => s + num(f.montant), 0)) : 0,
        encaisse: okFin ? round2(fm.reduce((s, f) => s + num(f.paye), 0)) : 0,
        depenses: okDep ? round2(dp.reduce((s, x) => s + num(x.montant), 0)) : 0,
        achats: okAchats ? round2(ac.reduce((s, x) => s + num(x.totalTTC), 0)) : 0,
      });
    }

    const resteImpaye = factures.reduce((s, f) => s + Math.max(0, num(f.montant) - num(f.paye)), 0);

    return send(res, 200, {
      serieMois,
      impayes: okFin ? round2(resteImpaye) : null,
      stockValeur: okStock ? round2(stock.reduce((s, i) => s + num(i.qty) * num(i.prix), 0)) : null,
      stockCount: okStock ? stock.length : null,
      caEncaisse: okFin ? factures.reduce((s, f) => s + Number(f.paye || 0), 0) : null,
      caFacture: okFin ? factures.reduce((s, f) => s + Number(f.montant || 0), 0) : null,
      achatsTotal: okAchats ? achats.reduce((s, a) => s + Number(a.totalTTC || 0), 0) : null,
      achatsAPayer: okAchats ? achats.filter((a) => String(a.statut || '').toLowerCase() === 'à payer').reduce((s, a) => s + Number(a.totalTTC || 0), 0) : null,
      achatsCount: okAchats ? achats.length : null,
      depensesMois: okDep ? depMois.reduce((s, d) => s + Number(d.montant || 0), 0) : null,
      depensesCount: okDep ? depMois.length : null,
      depensesToutes: okDep ? depenses.length : null,
      masseSalariale: okUsers ? masseSalariale : null,
      salairesPointage: okUsers ? salaires : [],
      avancesMois: okCaisse ? avancesMois : null,
      caisse: okCaisse ? caisseInfo : null,
      employesActifs: okUsers ? employes.filter((u) => u.active).length : null,
      assurancesAlerte: okUsers ? alertesAssurance : [],
      assurancesTotal: okUsers ? assurances.length : null,
      ventesMois: okFin ? mvtMois.filter(isVenteM).reduce((s, m) => s + Number(m.totalTTC || 0), 0) : null,
      achatsProduitsMois: okAchats ? mvtMois.filter((m) => !isVenteM(m)).reduce((s, m) => s + Number(m.totalTTC || 0), 0) : null,
      devisTotal: okDevis ? devis.reduce((s, d) => s + devisTotal(d).ttc, 0) : null,
      devisCount: okDevis ? devis.length : null,
      devisAttente: okDevis ? devis.filter((d) => d.status === 'envoyé').length : null,
      maintenanceUrgente: okMaint ? maintenance.filter((m) => dLeft(m.next) <= 30) : [],
      stockCritique: okStock ? stock.filter((s) => Number(s.qty) <= Number(s.minQty)) : [],
      projetsActifs: canModule(me, 'projets') ? projets : [],
      interventionsJour: canModule(me, 'interventions') ? interventions.filter((i) => new Date(i.date).toDateString() === today) : [],
      pointagesJour: canModule(me, 'pointage') ? pointages.filter((p) => new Date(p.ts).toDateString() === today) : [],
      factures: okFin ? factures.slice(-5).reverse() : [],
      audit: auditRows,
      counts: {
        clients: canModule(me, 'clients') ? (await db.prepare('SELECT COUNT(*) AS n FROM clients').get()).n : null,
        projets: canModule(me, 'projets') ? projets.length : null,
        interventions: canModule(me, 'interventions') ? interventions.length : null,
        stock: okStock ? stock.length : null,
      },
    });
  }

  /* ---------- RAPPORTS & ANALYSE ---------- */
  if (pathname === '/api/reports' && method === 'GET') {
    /* Les rapports respectent le cloisonnement par pôle du compte */
    const factures = filterByService((await db.prepare('SELECT * FROM factures').all()), me);
    const devis = await Promise.all(filterByService((await db.prepare('SELECT * FROM devis').all()), me).map(getDevis));
    const clients = (await db.prepare('SELECT * FROM clients').all());
    const contrats = filterByService((await db.prepare('SELECT * FROM contrats').all()), me);
    const equipements = filterByService((await db.prepare('SELECT * FROM equipements').all()), me);
    const stock = filterByService((await db.prepare('SELECT * FROM stock').all()), me);
    const achats = filterByService((await db.prepare('SELECT * FROM factures_achat').all()), me);
    const mouvements = filterByService((await db.prepare('SELECT * FROM mouvements').all()), me);
    const interventions = (await db.prepare('SELECT * FROM interventions').all());
    const maintenance = (await db.prepare('SELECT * FROM maintenance').all());

    const num = (v) => Number(v || 0);
    const clientName = (id) => (clients.find((c) => c.id === id) || {}).name || '—';

    // CA facturé / encaissé / en attente
    const caFacture = factures.reduce((s, f) => s + num(f.montant), 0);
    const caEncaisse = factures.reduce((s, f) => s + num(f.paye), 0);
    const impayes = factures
      .filter((f) => num(f.paye) < num(f.montant))
      .map((f) => ({ id: f.id, num: f.num, client: clientName(f.clientId), montant: num(f.montant), paye: num(f.paye), reste: num(f.montant) - num(f.paye), due: f.due, status: f.status }))
      .sort((a, b) => b.reste - a.reste);

    // Évolution mensuelle (6 derniers mois)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });
      const fact = factures.filter((f) => String(f.date || '').slice(0, 7) === key);
      months.push({
        key, label,
        facture: fact.reduce((s, f) => s + num(f.montant), 0),
        encaisse: fact.reduce((s, f) => s + num(f.paye), 0),
        count: fact.length,
      });
    }

    // Conversion devis → facture
    const devisAcceptes = devis.filter((d) => ['accepté', 'accepte', 'gagné', 'gagne'].includes(String(d.status || '').toLowerCase())).length;
    const conversion = devis.length ? Math.round((devisAcceptes / devis.length) * 100) : 0;
    const pipeline = devis.filter((d) => ['envoyé', 'envoye', 'brouillon'].includes(String(d.status || '').toLowerCase()))
      .reduce((s, d) => s + devisTotal(d).ttc, 0);

    // Top clients par CA
    const byClient = {};
    factures.forEach((f) => {
      const id = f.clientId || '—';
      byClient[id] = byClient[id] || { client: clientName(id), ca: 0, encaisse: 0, factures: 0 };
      byClient[id].ca += num(f.montant);
      byClient[id].encaisse += num(f.paye);
      byClient[id].factures += 1;
    });
    const topClients = Object.values(byClient).sort((a, b) => b.ca - a.ca).slice(0, 6);

    // Conformité du parc / contrats
    const today = new Date();
    const parcTotal = equipements.length;
    const parcHorsService = equipements.filter((e) => String(e.status || '').toLowerCase().indexOf('hors') !== -1).length;
    const controlesRetard = equipements.filter((e) => e.nextCtrl && new Date(e.nextCtrl) < today).length;
    const controlesProches = equipements.filter((e) => {
      if (!e.nextCtrl) return false;
      const j = Math.ceil((new Date(e.nextCtrl) - today) / 86400000);
      return j >= 0 && j <= 30;
    }).length;
    const contratsActifs = contrats.filter((c) => String(c.statut || '').toLowerCase().indexOf('sign') !== -1).length;
    const contratsARenouveler = contrats.filter((c) => c.dateFin && Math.ceil((new Date(c.dateFin) - today) / 86400000) <= 60).length;
    const conformite = parcTotal ? Math.max(0, Math.round(((parcTotal - controlesRetard - parcHorsService) / parcTotal) * 100)) : 100;

    // Stock
    const stockValeur = stock.reduce((s, i) => s + num(i.qty) * num(i.prix), 0);
    const stockCritique = stock.filter((i) => num(i.qty) <= num(i.minQty));

    // Achats
    const achatsTTC = achats.reduce((s, a) => s + num(a.totalTTC), 0);
    const achatsAPayer = achats.filter((a) => String(a.statut || '').toLowerCase() === 'à payer').reduce((s, a) => s + num(a.totalTTC), 0);

    // Dépenses de l'entreprise
    const depenses = (await db.prepare('SELECT * FROM depenses').all());
    const ymNow = new Date().toISOString().slice(0, 7);
    const depMois = depenses.filter((d) => String(d.date || '').slice(0, 7) === ymNow);
    const depParCat = {};
    depenses.forEach((d) => { const c = d.categorie || 'Autre'; depParCat[c] = (depParCat[c] || 0) + num(d.montant); });
    /* Masse salariale = calcul issue des pointages du mois (plus les avances) */
    const salaires = (await salairesPointage(ymNow)).filter((s) => s.active);
    const masseSalariale = round2(salaires.reduce((s, x) => s + x.net, 0));
    const caisseInfo = soldeCaisse((await db.prepare('SELECT * FROM caisse').all()));

    // Charge opérationnelle
    const missionsTotal = interventions.length;
    const missionsTerminees = interventions.filter((i) => String(i.status || '').toLowerCase().indexOf('termin') !== -1).length;
    const maintenanceEnRetard = maintenance.filter((m) => m.next && new Date(m.next) < today).length;

    // Balance âgée des créances
    const aging = agingBuckets(factures);

    // Compte de résultat du mois en cours
    const factMois = factures.filter((f) => String(f.date || '').slice(0, 7) === ymNow).reduce((s, f) => s + num(f.montant), 0);
    const achatsMois = achats.filter((a) => String(a.date || '').slice(0, 7) === ymNow).reduce((s, a) => s + num(a.totalTTC), 0);
    const depMoisTotal = depMois.reduce((s, d) => s + num(d.montant), 0);
    const pl = {
      mois: ymNow,
      ca: round2(factMois),
      achats: round2(achatsMois),
      depenses: round2(depMoisTotal),
      salaires: round2(masseSalariale),
      resultat: round2(factMois - achatsMois - depMoisTotal - num(masseSalariale)),
    };

    return send(res, 200, {
      aging, pl,
      caFacture, caEncaisse, soldeDu: caFacture - caEncaisse,
      impayes, months, conversion, devisAcceptes, devisCount: devis.length, pipeline,
      topClients,
      parc: { total: parcTotal, horsService: parcHorsService, controlesRetard, controlesProches, conformite },
      contrats: { actifs: contratsActifs, total: contrats.length, aRenouveler: contratsARenouveler },
      stock: { valeur: stockValeur, critique: stockCritique.length, refs: stock.length },
      achats: { total: achatsTTC, aPayer: achatsAPayer, count: achats.length },
      depenses: {
        mois: depMois.reduce((s, d) => s + num(d.montant), 0),
        total: depenses.reduce((s, d) => s + num(d.montant), 0),
        count: depenses.length, countMois: depMois.length,
        parCategorie: Object.keys(depParCat).map((k) => ({ categorie: k, montant: depParCat[k] })).sort((a, b) => b.montant - a.montant),
      },
      masseSalariale,
      salaires,
      caisse: caisseInfo,
      missions: { total: missionsTotal, terminees: missionsTerminees, maintenanceEnRetard },
      margeBrute: round2(caFacture - achatsTTC),
      resultatEstime: pl.resultat,
      parService: (await servicesSynthese(ymNow, me)),
    });
  }

  /* ---------- PLANNING 7 JOURS ---------- */
  if (pathname === '/api/planning' && method === 'GET') {
    const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const parseDay = (v) => {
      if (!v) return null;
      const s = String(v).slice(0, 10);
      const d = new Date(s + 'T00:00:00');
      return isNaN(d.getTime()) ? null : d;
    };
    const startParam = url.searchParams.get('start');
    let start = parseDay(startParam);
    if (!start) {
      start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    }
    /* `days` permet au tableau de bord de charger plusieurs semaines (max 5) */
    const wanted = parseInt(url.searchParams.get('days') || '7', 10);
    const dayCount = Math.max(7, Math.min(35, isNaN(wanted) ? 7 : wanted));
    const days = [];
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push({ date: ymd(d), label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }), items: [] });
    }
    const clients = (await db.prepare('SELECT id,name FROM clients').all());
    const users = (await db.prepare('SELECT id,name FROM users').all());
    const cName = (id) => (clients.find((c) => c.id === id) || {}).name || '';
    const tName = (id) => (users.find((u) => u.id === id) || {}).name || '';
    const push = (dateStr, item) => {
      if (!dateStr) return;
      const d = parseDay(dateStr);
      if (!d) return;
      const day = days.find((x) => x.date === ymd(d));
      if (day) day.items.push(item);
    };
    (await db.prepare('SELECT * FROM interventions').all()).forEach((i) => {
      push(i.date, { kind: 'mission', id: i.id, title: i.titre, client: cName(i.clientId), tech: tName(i.techId), status: i.status, lieu: i.lieu, duree: i.duree });
    });
    (await db.prepare('SELECT * FROM maintenance').all()).forEach((m) => {
      push(m.next, { kind: 'controle', id: m.id, title: m.eq, client: cName(m.clientId), tech: tName(m.techId), status: m.status, lieu: m.lieu });
    });
    (await db.prepare('SELECT * FROM contrats').all()).forEach((c) => {
      push(c.prochaineFacture, { kind: 'facturation', id: c.id, title: 'Facturation ' + (c.ref || ''), client: cName(c.clientId), status: c.statut, montant: c.montant });
    });
    return send(res, 200, { start: ymd(start), days });
  }

  /* ---------- FACTURATION RÉCURRENTE D'UN CONTRAT ---------- */
  if (parts[0] === 'api' && parts[1] === 'contrats' && parts[3] === 'facturer' && method === 'POST') {
    if (!canModule(me, 'contrats')) return send(res, 403, { error: 'Accès non autorisé' });
    const c = (await db.prepare('SELECT * FROM contrats WHERE id = ?').get(parts[2]));
    if (!c) return send(res, 404, { error: 'Contrat introuvable' });
    const perYear = { mensuel: 12, trimestriel: 4, semestriel: 2, annuel: 1 };
    const period = perYear[String(c.periodicite || 'mensuel').toLowerCase()] || 12;
    const montant = round2(Number(c.montant || 0) / period);
    if (montant <= 0) return send(res, 400, { error: 'Montant du contrat invalide' });

    const tva = Number(CONFIG.company.vat || 19);
    const num = (await nextDocNumber('F', 'factures'));
    const id = uid('fa');
    const today = todayStr();
    const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const objet = `${c.type || 'Contrat'} ${c.ref || ''} — ${c.periodicite || 'mensuel'}`.trim();
    const ht = round2(montant / (1 + tva / 100));
    const lignes = [{ designation: objet, unite: 'Forfait', quantite: 1, pu: ht, tva }];
    (await db.prepare('INSERT INTO factures (id,num,clientId,devisId,date,due,montant,paye,status,objet,modePaiement,lignes,tva,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(id, num, c.clientId || null, null, today, due, montant, 0, 'envoyée', objet, 'virement', JSON.stringify(lignes), tva, now()));
    const next = addMonths(c.prochaineFacture || new Date(), 12 / period).slice(0, 10);
    (await db.prepare('UPDATE contrats SET prochaineFacture = ? WHERE id = ?').run(next, c.id));
    (await audit(me.name, `Facturation contrat ${c.ref} — ${num} (${montant} DA)`));
    return send(res, 201, { facture: (await db.prepare('SELECT * FROM factures WHERE id = ?').get(id)), prochaineFacture: next });
  }

  /* ---------- ATTESTATION DE CONFORMITÉ (PARC) ---------- */
  if (parts[0] === 'api' && parts[1] === 'parc' && parts[2] === 'attestation' && parts[3] && method === 'GET') {
    if (!canModule(me, 'parc')) return send(res, 403, { error: 'Accès non autorisé' });
    const client = (await db.prepare('SELECT * FROM clients WHERE id = ?').get(parts[3]));
    if (!client) return send(res, 404, { error: 'Client introuvable' });
    const eqs = (await db.prepare('SELECT * FROM equipements WHERE clientId = ? ORDER BY cat, site').all(parts[3]));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(renderAttestationHtml(client, eqs));
  }

  /* ---------- IMPORT / EXPORT ---------- */
  if (parts[0] === 'api' && parts[1] === 'export' && parts[2] && parts[2] !== 'dossier' && method === 'GET') {
    const col = parts[2];
    let rows;
    if (col === 'audit') {
      if (!isAdmin(me)) return send(res, 403, { error: 'Export du journal réservé aux administrateurs' });
      rows = (await db.prepare('SELECT * FROM audit ORDER BY ts DESC').all());
    } else {
      if (!COLLECTIONS[col]) return send(res, 404, { error: 'Collection inconnue' });
      if (col === 'users' && !isAdmin(me)) return send(res, 403, { error: 'Export réservé aux administrateurs' });
      const mvtAllowed = col === 'mouvements' ? (canModule(me, 'mouvements') || canModule(me, 'achats')) : canModule(me, COL_MODULE[col] || col);
      if (col !== 'users' && !mvtAllowed) return send(res, 403, { error: 'Accès non autorisé' });
      rows = (await db.prepare(`SELECT * FROM ${col}`).all());
      if (SERVICE_COLLECTIONS.includes(col)) rows = filterByService(rows, me);
      if (col === 'mouvements') {
        /* Cloisonnement ventes / achats selon les droits du compte */
        if (!canModule(me, 'mouvements')) rows = rows.filter((r) => !isVente(r));
        else if (!canModule(me, 'achats')) rows = rows.filter(isVente);
        const typeQ = String(url.searchParams.get('type') || '').toLowerCase();
        if (typeQ) rows = rows.filter((r) => (typeQ === 'vente' ? isVente(r) : !isVente(r)));
      }
    }
    if (!rows.length) return send(res, 200, '');
    // On n'exporte jamais les colonnes sensibles (empreinte de mot de passe…)
    const head = Object.keys(rows[0]).filter((k) => k !== 'pass');
    const csv = [head.join(';')].concat(
      rows.map((r) => head.map((k) => `"${String(r[k] == null ? '' : r[k]).replace(/"/g, '""')}"`).join(';'))
    ).join('\n');
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${col}.csv"`,
    });
    return res.end('\uFEFF' + csv);
  }

  /* ---------- CUSTOM ACTIONS ---------- */
  if (parts[0] === 'api' && parts[1] === 'factures' && parts[3] === 'pay' && method === 'POST') {
    if (!canModule(me, 'factures')) return send(res, 403, { error: 'Accès non autorisé' });
    const f = (await db.prepare('SELECT * FROM factures WHERE id = ?').get(parts[2]));
    if (!f) return send(res, 404, { error: 'Facture introuvable' });
    const { montant } = await readBody(req);
    const newPaye = Number(f.paye || 0) + Number(montant || 0);
    const paye = Math.min(Number(f.montant), newPaye);
    const status = paye >= Number(f.montant) ? 'payée' : 'partiel';
    (await db.prepare('UPDATE factures SET paye = ?, status = ? WHERE id = ?').run(paye, status, f.id));
    (await audit(me.name, `Encaissement ${f.num} : ${montant} DA`));
    return send(res, 200, (await db.prepare('SELECT * FROM factures WHERE id = ?').get(f.id)));
  }

  /* Pointage MANUEL : une ARRIVÉE = 1 jour payé (2000 DA) + heures sup. (375 DA/h)
     + frais de véhicule (2000 DA/déplacement) + 1200 DA forfaitaires / mission hors wilaya. */
  if (parts[0] === 'api' && parts[1] === 'pointages' && parts[2] === 'point' && method === 'POST') {
    if (!canModule(me, 'pointage')) return send(res, 403, { error: 'Accès non autorisé' });
    const { empId, type, lieu, gps, date, heuresSup, deplacement, note, horsWilaya, mission } = await readBody(req);
    const u = (await db.prepare('SELECT * FROM users WHERE id = ?').get(empId));
    if (!u) return send(res, 404, { error: 'Employé introuvable' });
    const day = String(date || todayStr()).slice(0, 10);
    const p = {
      type: type || 'ARRIVÉE', heuresSup: Number(heuresSup || 0),
      deplacement: Number(deplacement) ? 1 : 0,
      horsWilaya: Number(horsWilaya) ? 1 : 0, mission: mission || '',
    };
    const calc = calculerMontantPointage(p);
    const row = {
      id: uid('pt'), empId, emp: u.name, type: p.type,
      ts: day + 'T' + new Date().toTimeString().slice(0, 8),
      gps: gps || '—', lieu: lieu || '', date: day,
      heuresSup: calc.heuresSup, deplacement: calc.deplacements, montant: calc.total, note: note || '',
      horsWilaya: calc.horsWilaya, mission: String(mission || ''),
    };
    (await db.prepare('INSERT INTO pointages (id,empId,emp,type,ts,gps,lieu,date,heuresSup,deplacement,montant,note,horsWilaya,mission) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(row.id, row.empId, row.emp, row.type, row.ts, row.gps, row.lieu, row.date, row.heuresSup, row.deplacement, row.montant, row.note, row.horsWilaya, row.mission));
    (await audit(me.name, `Pointage manuel ${row.type} — ${row.emp} (${row.montant} DA)`));
    return send(res, 201, row);
  }

  /* Feuilles de salaire calculées depuis les pointages (periode : ?mois=AAAA-MM) */
  if (parts[0] === 'api' && parts[1] === 'pointages' && parts[2] === 'salaires' && method === 'GET') {
    if (!canModule(me, 'users')) return send(res, 403, { error: 'Accès non autorisé' });
    const mois = String(url.searchParams.get('mois') || '').slice(0, 7);
    return send(res, 200, { mois: mois || null, taux: PAIE, salaires: (await salairesPointage(mois)) });
  }

  /* Avance sur salaire → écrite dans la caisse (type « Avance ») */
  if (parts[0] === 'api' && parts[1] === 'caisse' && parts[2] === 'avance' && method === 'POST') {
    if (!canModule(me, 'caisse')) return send(res, 403, { error: 'Accès non autorisé' });
    const { empId, montant, date, motif, modePaiement } = await readBody(req);
    const u = (await db.prepare('SELECT name FROM users WHERE id = ?').get(empId));
    if (!u) return send(res, 404, { error: 'Employé introuvable' });
    const m = round2(Number(montant || 0));
    if (m <= 0) return send(res, 400, { error: 'Le montant de l\'avance doit être supérieur à zéro' });
    const row = {
      id: uid('ca'), date: String(date || todayStr()).slice(0, 10), type: 'Avance',
      libelle: 'Avance salaire — ' + u.name, empId, emp: u.name, montant: m,
      modePaiement: modePaiement || 'espèces', reference: '', notes: motif || '', created: now(),
    };
    (await db.prepare('INSERT INTO caisse (id,date,type,libelle,empId,emp,montant,modePaiement,reference,notes,created) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .run(row.id, row.date, row.type, row.libelle, row.empId, row.emp, row.montant, row.modePaiement, row.reference, row.notes, row.created));
    (await audit(me.name, `Avance caisse — ${row.emp} (${m} DA)`));
    return send(res, 201, row);
  }

  /* ---------- ENTREPRISE ---------- */
  if (pathname === '/api/company' && method === 'GET') {
    return send(res, 200, { ...CONFIG.company, aiConfigured: !!CONFIG.googleApiKey, model: CONFIG.geminiModel });
  }

  if (pathname === '/api/ai/status' && method === 'GET') {
    return send(res, 200, { configured: !!CONFIG.googleApiKey, model: CONFIG.geminiModel });
  }

  /* ---------- IA : LECTURE DE DOCUMENTS ---------- */
  if (pathname === '/api/ai/extract' && method === 'POST') {
    const aiWait = aiThrottled(me);
    if (aiWait) return send(res, 429, { error: `Limite d'usage IA atteinte. Réessayez dans ${Math.ceil(aiWait / 60)} minute(s).` });
    const body = await readBody(req);
    const base64 = String(body.base64 || body.image || '').replace(/^data:[^;]+;base64,/, '');
    if (!base64) return send(res, 400, { error: 'Aucune image ou fichier fourni' });
    if (base64.length > 11e6) return send(res, 413, { error: 'Fichier trop volumineux (max ~8 Mo)' });
    const mimeType = String(body.mimeType || 'image/jpeg');
    if (!/^image\//.test(mimeType) && mimeType !== 'application/pdf') return send(res, 415, { error: 'Format non pris en charge (image ou PDF)' });
    try {
      const out = await aiExtractDocument(base64, mimeType, body.kind || 'auto');
      (await audit(me.name, `IA lecture document (${out.data.documentType || body.kind || 'auto'}${out.data.sens && out.data.sens !== 'autre' ? ' · ' + out.data.sens : ''})`));
      return send(res, 200, { ok: true, data: out.data, model: out.model });
    } catch (err) {
      return send(res, 502, { error: 'IA indisponible : ' + err.message });
    }
  }

  /* ---------- IA : GÉNÉRATION DE LIGNES DE VENTE ---------- */
  if (pathname === '/api/ai/lignes' && method === 'POST') {
    const aiWait = aiThrottled(me);
    if (aiWait) return send(res, 429, { error: `Limite d'usage IA atteinte. Réessayez dans ${Math.ceil(aiWait / 60)} minute(s).` });
    const body = await readBody(req);
    const brief = String(body.brief || '').trim();
    if (brief.length < 3) return send(res, 400, { error: 'Décrivez le besoin (3 caractères minimum)' });
    if (brief.length > 1200) return send(res, 400, { error: 'Demande trop longue (1200 caractères maximum)' });
    try {
      const out = await aiGenerateLines(brief, Number(body.tva || 19));
      (await audit(me.name, 'IA génération de lignes de devis'));
      return send(res, 200, { ok: true, lignes: out.lignes, model: out.model });
    } catch (err) {
      return send(res, 502, { error: 'IA indisponible : ' + err.message });
    }
  }

  /* ---------- IA : JUSTIFICATIF DE DÉPENSE ---------- */
  if (pathname === '/api/ai/depense' && method === 'POST') {
    if (!canModule(me, 'depenses')) return send(res, 403, { error: 'Accès non autorisé au module Dépenses' });
    const aiWait = aiThrottled(me);
    if (aiWait) return send(res, 429, { error: `Limite d'usage IA atteinte. Réessayez dans ${Math.ceil(aiWait / 60)} minute(s).` });
    const body = await readBody(req);
    const base64 = String(body.base64 || body.image || '').replace(/^data:[^;]+;base64,/, '');
    if (!base64) return send(res, 400, { error: 'Aucun justificatif fourni' });
    if (base64.length > 11e6) return send(res, 413, { error: 'Fichier trop volumineux (max ~8 Mo)' });
    const mimeType = String(body.mimeType || 'image/jpeg');
    if (!/^image\//.test(mimeType) && mimeType !== 'application/pdf') return send(res, 415, { error: 'Format non pris en charge (image ou PDF)' });
    try {
      const out = await aiExtractDepense(base64, mimeType);
      (await audit(me.name, 'IA lecture justificatif de dépense'));
      return send(res, 200, { ok: true, data: out.data, model: out.model });
    } catch (err) {
      return send(res, 502, { error: 'IA indisponible : ' + err.message });
    }
  }

  /* ---------- IA : ANALYSE DE GESTION ---------- */
  if (pathname === '/api/ai/analyse' && method === 'POST') {
    if (!canModule(me, 'rapports')) return send(res, 403, { error: 'Accès non autorisé aux rapports' });
    const aiWait = aiThrottled(me);
    if (aiWait) return send(res, 429, { error: `Limite d'usage IA atteinte. Réessayez dans ${Math.ceil(aiWait / 60)} minute(s).` });
    try {
      const out = await aiAnalyseGestion(me);
      (await audit(me.name, 'IA analyse de gestion'));
      return send(res, 200, { ok: true, data: out.data, model: out.model, mois: out.mois, genere: out.genere });
    } catch (err) {
      return send(res, 502, { error: 'IA indisponible : ' + err.message });
    }
  }

  /* ---------- IMPRESSION FACTURE ---------- */
  if (parts[0] === 'api' && parts[1] === 'factures' && parts[3] === 'print' && method === 'GET') {
    if (!canModule(me, 'factures')) return send(res, 403, { error: 'Accès non autorisé' });
    const f = (await db.prepare('SELECT * FROM factures WHERE id = ?').get(parts[2]));
    if (!f) return send(res, 404, { error: 'Facture introuvable' });
    const data = (await factureDocData(f));
    const html = renderInvoiceHtml({
      docType: 'FACTURE', numero: f.num, date: f.date, client: data.client,
      lignes: data.lignes, ht: data.ht, tvaMontant: data.tvaMontant, ttc: data.ttc, remise: data.remise,
      objet: f.objet || '', modePaiement: f.modePaiement || '', validite: '', due: f.due,
      paye: Number(f.paye || 0), payee: String(f.status || '').toLowerCase() === 'payée',
    });
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(html);
  }

  /* ---------- IMPRESSION DEVIS ---------- */
  if (parts[0] === 'api' && parts[1] === 'devis' && parts[3] === 'print' && method === 'GET') {
    if (!canModule(me, 'devis')) return send(res, 403, { error: 'Accès non autorisé' });
    const d = (await getDevis(parts[2]));
    if (!d) return send(res, 404, { error: 'Devis introuvable' });
    const tot = devisTotal(d);
    const client = (await db.prepare('SELECT * FROM clients WHERE id = ?').get(d.clientId)) || {};
    const lignes = (d.lignes || []).map((l) => ({
      designation: l.description, unite: 'U', quantite: Number(l.qty || 0),
      pu: Number(l.pu || 0), montant: Number(l.qty || 0) * Number(l.pu || 0), tva: Number(d.tva || 19),
    }));
    const html = renderInvoiceHtml({
      docType: 'DEVIS', numero: d.num, date: d.date, client, lignes,
      ht: tot.ht, tvaMontant: tot.tva, ttc: tot.ttc, remise: tot.remise, objet: d.titre || '',
      modePaiement: '', validite: d.validite || '',
    });
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(html);
  }

  /* ---------- IMPRESSION BON DE COMMANDE (depuis un devis) ---------- */
  if (parts[0] === 'api' && parts[1] === 'devis' && parts[3] === 'bon-commande' && method === 'GET') {
    if (!canModule(me, 'devis')) return send(res, 403, { error: 'Accès non autorisé' });
    const d = (await getDevis(parts[2]));
    if (!d) return send(res, 404, { error: 'Devis introuvable' });
    const tot = devisTotal(d);
    const client = (await db.prepare('SELECT * FROM clients WHERE id = ?').get(d.clientId)) || {};
    const lignes = (d.lignes || []).map((l) => ({
      designation: l.description, unite: 'U', quantite: Number(l.qty || 0),
      pu: Number(l.pu || 0), montant: Number(l.qty || 0) * Number(l.pu || 0), tva: Number(d.tva || 19),
    }));
    const numero = 'BC-' + String(d.num || '').replace(/^D-/, '');
    const html = renderInvoiceHtml({
      docType: 'BON DE COMMANDE', numero, refDevis: d.num, date: d.date, client, lignes,
      ht: tot.ht, tvaMontant: tot.tva, ttc: tot.ttc, remise: tot.remise, objet: d.titre || '',
      modePaiement: '', validite: '',
    });
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(html);
  }

  /* ---------- DEVIS → FACTURE ---------- */
  if (parts[0] === 'api' && parts[1] === 'devis' && parts[3] === 'facture' && method === 'POST') {
    if (!canModule(me, 'factures')) return send(res, 403, { error: 'Accès non autorisé' });
    const d = (await getDevis(parts[2]));
    if (!d) return send(res, 404, { error: 'Devis introuvable' });
    const tot = devisTotal(d);
    const num = (await nextDocNumber('F', 'factures'));
    const id = uid('fa');
    const today = todayStr();
    const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    // Instantané des lignes : la facture reste conforme même si le devis change ensuite
    const lignes = (d.lignes || []).map((l) => ({
      designation: l.description || '', unite: 'U', quantite: Number(l.qty || 0), pu: Number(l.pu || 0), tva: Number(d.tva || 19),
    }));
    (await db.prepare('INSERT INTO factures (id,num,clientId,devisId,service,date,due,montant,paye,status,objet,modePaiement,lignes,tva,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(id, num, d.clientId, d.id, serviceOf(d), today, due, tot.ttc, 0, 'envoyée', d.titre || '', 'virement', JSON.stringify(lignes), Number(d.tva || 19), now()));
    (await db.prepare("UPDATE devis SET status = 'accepté' WHERE id = ?").run(d.id));
    (await audit(me.name, `Facture ${num} générée depuis ${d.num}`));
    return send(res, 201, (await db.prepare('SELECT * FROM factures WHERE id = ?').get(id)));
  }

  /* ---------- JOURNAL D'AUDIT (paginé) ---------- */
  if (pathname === '/api/audit' && method === 'GET') {
    const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit') || 100)));
    const offset = Math.max(0, Number(url.searchParams.get('offset') || 0));
    const q = String(url.searchParams.get('q') || '').trim().toLowerCase();
    let rows = (await db.prepare('SELECT * FROM audit ORDER BY ts DESC').all());
    if (!isAdmin(me)) rows = rows.filter((r) => String(r.user || '').toLowerCase() === String(me.name || '').toLowerCase());
    if (q) rows = rows.filter((r) => (String(r.user || '') + ' ' + String(r.action || '')).toLowerCase().indexOf(q) !== -1);
    return send(res, 200, { total: rows.length, offset, limit, rows: rows.slice(offset, offset + limit) });
  }

  /* ---------- PARAMÈTRES & ÉTAT DU SYSTÈME (admin) ---------- */
  if (pathname === '/api/settings' && method === 'GET') {
    if (!isAdmin(me)) return send(res, 403, { error: 'Réservé aux administrateurs' });
    let dbSize = 0;
    try { dbSize = fs.statSync(path.join(DATA_DIR, 'ass.db')).size; } catch {}
    const count = async (t) => { try { return (await db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get()).n; } catch { return 0; } };
    const [sessions, clients, devis, factures, achats, contrats, equipements, stock, users, auditCount] =
      await Promise.all(['sessions', 'clients', 'devis', 'factures', 'factures_achat', 'contrats', 'equipements', 'stock', 'users', 'audit'].map(count));
    return send(res, 200, {
      company: CONFIG.company,
      ai: { configured: !!CONFIG.googleApiKey, model: CONFIG.geminiModel },
      demoMode: !!CONFIG.demoMode,
      version: '2.0.0',
      node: process.version,
      uptime: Math.round(process.uptime()),
      dbSize,
      sessions,
      counts: { clients, devis, factures, achats, contrats, equipements, stock, users, audit: auditCount },
    });
  }

  /* ---------- DOSSIER DE TRANSMISSION (admin) ---------- */
  if (pathname === '/api/export/dossier' && method === 'GET') {
    if (!isAdmin(me)) return send(res, 403, { error: 'Dossier réservé aux administrateurs' });
    const html = (await renderDossierHtml(req, me));
    (await audit(me.name, 'Dossier entreprise généré'));
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="dossier-entreprise-${todayStr()}.html"`,
      'Cache-Control': 'no-store',
    });
    return res.end(html);
  }

  /* ---------- SAUVEGARDE DE LA BASE (admin) ---------- */
  if (pathname === '/api/backup' && method === 'GET') {
    if (!isBackupJob && !isAdmin(me)) return send(res, 403, { error: 'Réservé aux administrateurs' });
    try { await db.sync(); } catch (e) { console.warn('[DB] sync avant sauvegarde : ' + (e && e.message || e)); }
    try { (await db.exec('PRAGMA wal_checkpoint(TRUNCATE);')); } catch {}
    const file = path.join(DATA_DIR, 'ass.db');
    const buf = fs.readFileSync(file);
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    (await audit(isBackupJob ? 'sauvegarde-automatique' : me.name, 'Sauvegarde de la base téléchargée'));
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="ass-backup-${stamp}.db"`,
      'Content-Length': buf.length,
      'Cache-Control': 'no-store',
    });
    return res.end(buf);
  }

  /* ---------- RELEVÉ DE COMPTE CLIENT (A4) ---------- */
  if (parts[0] === 'api' && parts[1] === 'clients' && parts[2] && parts[3] === 'releve' && method === 'GET') {
    if (!canModule(me, 'clients')) return send(res, 403, { error: 'Accès non autorisé' });
    const client = (await db.prepare('SELECT * FROM clients WHERE id = ?').get(parts[2]));
    if (!client) return send(res, 404, { error: 'Client introuvable' });
    const factures = (await db.prepare('SELECT * FROM factures WHERE clientId = ? ORDER BY date').all(parts[2]));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(renderReleveHtml(client, factures));
  }

  /* ---------- GENERIC CRUD ---------- */
  if (parts[0] === 'api' && parts[1]) {
    const col = parts[1];
    const id = parts[2];
    const fields = COLLECTIONS[col];
    if (!fields) return send(res, 404, { error: 'Collection inconnue' });

    /* Habilitation : la gestion des comptes est réservée aux administrateurs */
    const isWrite = method !== 'GET';
    if (col === 'users') {
      if (isWrite && !isAdmin(me)) return send(res, 403, { error: "Seul un administrateur peut gérer les comptes" });
    } else if (col === 'mouvements') {
      if (!canModule(me, 'mouvements') && !canModule(me, 'achats')) return send(res, 403, { error: 'Accès non autorisé aux mouvements' });
    } else if (!canModule(me, COL_MODULE[col] || col)) {
      return send(res, 403, { error: `Accès non autorisé au module « ${COL_MODULE[col] || col} »` });
    }

    // LIST
    if (!id && method === 'GET') {
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      let rows = (await db.prepare(`SELECT * FROM ${col}`).all());
      if (col === 'devis') rows = await Promise.all(rows.map(getDevis));
      if (col === 'users') rows = rows.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, active: u.active, salaire: u.salaire, perms: u.perms, services: u.services, created: u.created }));
      if (q) {
        rows = rows.filter((r) => Object.values(r).some((v) => String(v == null ? '' : v).toLowerCase().includes(q)));
      }
      if (col === 'pointages') rows.sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
      /* Cloisonnement par pôle : le compte ne voit que ses services (+ filtre explicite) */
      if (SERVICE_COLLECTIONS.includes(col)) {
        rows = filterByService(rows, me);
        const svcQ = normalizeService(url.searchParams.get('service'));
        if (svcQ) rows = rows.filter((r) => serviceOf(r) === svcQ);
      }
      /* Cloisonnement ventes / achats : un compte limité ne voit que son type */
      if (col === 'mouvements') {
        if (!canModule(me, 'mouvements')) rows = rows.filter((r) => !isVente(r));
        else if (!canModule(me, 'achats')) rows = rows.filter(isVente);
        const typeQ = String(url.searchParams.get('type') || '').toLowerCase();
        if (typeQ) rows = rows.filter((r) => (typeQ === 'vente' ? isVente(r) : !isVente(r)));
      }
      return send(res, 200, rows);
    }

    // READ ONE
    if (id && method === 'GET') {
      if (col === 'devis') {
        const d = (await getDevis(id));
        return d ? send(res, 200, d) : send(res, 404, { error: 'Introuvable' });
      }
      const row = (await db.prepare(`SELECT * FROM ${col} WHERE id = ?`).get(id));
      if (!row) return send(res, 404, { error: 'Introuvable' });
      if (col === 'users') delete row.pass;
      if (SERVICE_COLLECTIONS.includes(col) && !canService(me, row.service)) {
        return send(res, 403, { error: 'Accès non autorisé à ce pôle' });
      }
      return send(res, 200, row);
    }

    // CREATE
    if (!id && method === 'POST') {
      const body = await readBody(req);

      if (col === 'devis') {
        const did = uid('d');
        const num = body.num || (await nextDocNumber('D', 'devis'));
        const svcDevis = normalizeService(body.service) || DEFAULT_SERVICE;
        if (!canService(me, svcDevis)) return send(res, 403, { error: `Accès non autorisé au pôle ${serviceName(svcDevis)}` });
        (await db.prepare('INSERT INTO devis (id,num,clientId,titre,date,validite,status,tva,remise,service,created) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
          .run(did, num, body.clientId || null, body.titre || '', String(body.date || todayStr()).slice(0, 10),
            body.validite || '30 jours', body.status || 'brouillon',
            Number(body.tva) > 0 ? Number(body.tva) : Number(CONFIG.company.vat || 19),
            Math.max(0, Math.min(100, Number(body.remise || 0))), svcDevis, now()));
        for (const l of (body.lignes || [])) {
          await db.prepare('INSERT INTO devis_lignes (id,devisId,description,qty,pu) VALUES (?,?,?,?,?)')
            .run(uid('dl'), did, l.description || '', Number(l.qty || 0), Number(l.pu || 0));
        }
        (await audit(me.name, `Devis créé ${num}`));
        return send(res, 201, (await getDevis(did)));
      }

      if (col === 'users') {
        if (!body.email) return send(res, 400, { error: 'Email requis' });
        const exists = (await db.prepare('SELECT id FROM users WHERE lower(email) = lower(?)').get(body.email));
        if (exists) return send(res, 409, { error: 'Email déjà utilisé' });
        if (body.perms != null && typeof body.perms !== 'string') body.perms = JSON.stringify(Array.isArray(body.perms) ? body.perms : []);
        if (body.services != null && typeof body.services !== 'string') body.services = JSON.stringify(Array.isArray(body.services) ? body.services : []);
        if (!body.pass || String(body.pass).length < 8) return send(res, 400, { error: 'Mot de passe : 8 caractères minimum' });
      }

      if (col === 'factures') {
        body.num = body.num || (await nextDocNumber('F', 'factures'));
        body.date = String(body.date || todayStr()).slice(0, 10);
        if (!body.due) body.due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
        body.tva = Number(body.tva) > 0 ? Number(body.tva) : Number(CONFIG.company.vat || 19);
        if (body.lignes != null && typeof body.lignes !== 'string') body.lignes = JSON.stringify(body.lignes);
        const m = Number(body.montant || 0), p = Math.min(Number(body.paye || 0), m);
        body.paye = p;
        body.status = p >= m && m > 0 ? 'payée' : (p > 0 ? 'partiel' : (body.status || 'envoyée'));
      }
      if (col === 'factures_achat') {
        body.date = String(body.date || todayStr()).slice(0, 10);
        body.statut = body.statut || 'à payer';
      }
      if (col === 'mouvements') {
        if (!canModule(me, isVente(body) ? 'mouvements' : 'achats')) return send(res, 403, { error: `Accès non autorisé aux ${isVente(body) ? 'ventes' : 'achats'}` });
        body.date = body.date || new Date().toISOString().slice(0, 10);
        body.statut = body.statut || 'confirmé';
        body.lignes = JSON.stringify(body.lignes || []);
        /* Pôle déduit des articles si l'utilisateur ne l'a pas choisi */
        if (!normalizeService(body.service)) body.service = (await serviceFromLignes(body.lignes)) || DEFAULT_SERVICE;
        const errStock = (await checkStockMvt(body, null));
        if (errStock) return send(res, 400, { error: errStock });
      }
      if (col === 'contrats') {
        body.ref = body.ref || (await nextDocNumber('CTR', 'contrats', 'ref'));
        body.statut = body.statut || 'actif';
        body.periodicite = body.periodicite || 'mensuel';
        body.dateDep = String(body.dateDep || todayStr()).slice(0, 10);
        if (!body.prochaineFacture) body.prochaineFacture = body.dateDep;
      }
      if (col === 'pointages' && body.empId && !body.emp) {
        const emp = (await db.prepare('SELECT name FROM users WHERE id = ?').get(body.empId));
        body.emp = emp ? emp.name : '—';
      }
      if (col === 'pointages') {
        body.date = String(body.date || todayStr()).slice(0, 10);
        body.ts = body.ts || (body.date + 'T' + new Date().toTimeString().slice(0, 8));
        body.montant = calculerMontantPointage(body).total;
      }
      if (col === 'caisse') {
        body.date = String(body.date || todayStr()).slice(0, 10);
        body.type = body.type || 'Sortie';
        if (!body.libelle) body.libelle = body.type === 'Avance' ? 'Avance salaire' : body.type;
        if (body.type === 'Avance' && body.empId && !body.emp) {
          const emp = (await db.prepare('SELECT name FROM users WHERE id = ?').get(body.empId));
          body.emp = emp ? emp.name : '—';
        }
      }

      /* Pôle : valeur par défaut, contrôle d'accès et cohérence des lignes */
      if (SERVICE_COLLECTIONS.includes(col)) {
        body.service = normalizeService(body.service) || DEFAULT_SERVICE;
        if (!canService(me, body.service)) {
          return send(res, 403, { error: `Accès non autorisé au pôle ${serviceName(body.service)}` });
        }
        if (col === 'mouvements') {
          const errSvc = (await checkMvtService(body));
          if (errSvc) return send(res, 400, { error: errSvc });
        }
      }

      /* Les produits d'une facture d'achat entrent en stock — une seule fois par facture */
      let achatDejaVu = false;
      if (col === 'factures_achat' && body.num) {
        achatDejaVu = !!(await db.prepare("SELECT id FROM factures_achat WHERE num = ? AND lower(COALESCE(fournisseur,'')) = lower(?)")
          .get(String(body.num), String(body.fournisseur || '')));
      }
      let stockAchat = 0;

      const newId = uid(col.slice(0, 2));
      const cols = ['id', ...fields, 'created'];
      if (col === 'users') cols.splice(cols.length - 1, 0, 'pass'); // le champ pass n'est pas générique
      const vals = [newId, ...fields.map((f) => {
        if (f === 'pass') return hashPass(body.pass || 'tech123');
        if (f === 'active') return body[f] == null || body[f] === '' ? 1 : (Number(body[f]) ? 1 : 0);
        if (['qty', 'minQty', 'prix', 'tva', 'montant', 'paye', 'progress', 'duree', 'toiture', 'conso', 'kwc', 'production', 'rentabilite', 'cout', 'totalHT', 'totalTTC', 'salaire', 'prime', 'heuresSup'].includes(f)) return Number(body[f] || 0);
        if (f === 'deplacement' || f === 'horsWilaya') return Number(body[f]) ? 1 : 0;
        return body[f] == null ? '' : body[f];
      }), now()];
      if (col === 'users') vals.splice(vals.length - 1, 0, hashPass(body.pass || 'tech123'));
      (await db.prepare(`INSERT INTO ${col} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).run(...vals));
      if (col === 'mouvements') (await applyStockMvt(body, 1));
      if (col === 'factures_achat' && !achatDejaVu) stockAchat = (await stockFromAchatFacture(body));
      (await audit(me.name, col === 'users' ? `Accès créé — ${body.name || newId} (${body.role || 'sans rôle'})` :
        `Création ${col}${col === 'mouvements' ? ' — ' + (body.type || '') + ' produits ' + body.totalTTC + ' DA' : ''}`));
      const row = (await db.prepare(`SELECT * FROM ${col} WHERE id = ?`).get(newId));
      if (row && row.pass) delete row.pass;
      if (row && col === 'factures_achat') row.stockMaj = stockAchat;
      return send(res, 201, row);
    }

    // UPDATE
    if (id && (method === 'PUT' || method === 'PATCH')) {
      const body = await readBody(req);
      const existing = (await db.prepare(`SELECT * FROM ${col} WHERE id = ?`).get(id));
      if (!existing) return send(res, 404, { error: 'Introuvable' });

      if (col === 'devis') {
        const svcDevis = normalizeService(body.service !== undefined ? body.service : existing.service) || serviceOf(existing);
        if (!canService(me, existing.service) || !canService(me, svcDevis)) {
          return send(res, 403, { error: `Accès non autorisé au pôle ${serviceName(svcDevis)}` });
        }
        (await db.prepare('UPDATE devis SET clientId=?, titre=?, date=?, validite=?, status=?, tva=?, remise=?, service=? WHERE id=?')
          .run(body.clientId !== undefined ? body.clientId : existing.clientId,
            body.titre !== undefined ? body.titre : existing.titre,
            body.date !== undefined ? body.date : existing.date,
            body.validite !== undefined ? body.validite : existing.validite,
            body.status !== undefined ? body.status : existing.status,
            Number(body.tva !== undefined ? body.tva : existing.tva),
            Math.max(0, Math.min(100, Number(body.remise !== undefined ? body.remise : existing.remise || 0))),
            svcDevis, id));
        if (Array.isArray(body.lignes)) {
          (await db.prepare('DELETE FROM devis_lignes WHERE devisId = ?').run(id));
          for (const l of body.lignes) {
            await db.prepare('INSERT INTO devis_lignes (id,devisId,description,qty,pu) VALUES (?,?,?,?,?)')
              .run(uid('dl'), id, l.description || '', Number(l.qty || 0), Number(l.pu || 0));
          }
        }
        (await audit(me.name, `Devis modifié ${existing.num}`));
        return send(res, 200, (await getDevis(id)));
      }

      if (col === 'mouvements') {
        const candType = body.type !== undefined ? body.type : existing.type;
        if (!canModule(me, String(candType || '').toLowerCase().indexOf('vente') === 0 ? 'mouvements' : 'achats')) return send(res, 403, { error: 'Accès non autorisé à ce type de mouvement' });
        if (body.lignes !== undefined) body.lignes = JSON.stringify(body.lignes || []);
      }
      if (col === 'pointages' && (body.type !== undefined || body.heuresSup !== undefined || body.deplacement !== undefined || body.horsWilaya !== undefined || body.mission !== undefined)) {
        body.montant = calculerMontantPointage({ ...existing, ...body }).total;
      }
      if (col === 'caisse' && body.type === 'Avance' && body.empId && !body.emp) {
        const emp = (await db.prepare('SELECT name FROM users WHERE id = ?').get(body.empId));
        body.emp = emp ? emp.name : existing.emp || '—';
      }
      if (col === 'factures') {
        if (body.lignes !== undefined && typeof body.lignes !== 'string') body.lignes = JSON.stringify(body.lignes || []);
        if (body.tva !== undefined && !(Number(body.tva) > 0)) body.tva = Number(existing.tva || CONFIG.company.vat || 19);
        const m = Number(body.montant !== undefined ? body.montant : existing.montant);
        const p = Math.min(Number(body.paye !== undefined ? body.paye : existing.paye), m);
        if (body.paye !== undefined || body.montant !== undefined) {
          body.paye = p;
          body.status = p >= m && m > 0 ? 'payée' : (p > 0 ? 'partiel' : 'envoyée');
        }
      }

      if (col === 'users') {
        if (body.email !== undefined && String(body.email || '').trim()) {
          const email = String(body.email).trim();
          const dup = (await db.prepare('SELECT id FROM users WHERE lower(email) = lower(?) AND id != ?').get(email, id));
          if (dup) return send(res, 409, { error: 'Email déjà utilisé' });
          body.email = email;
        }
        if (body.perms !== undefined && body.perms !== null && typeof body.perms !== 'string') {
          body.perms = JSON.stringify(Array.isArray(body.perms) ? body.perms : []);
        }
        if (body.services !== undefined && body.services !== null && typeof body.services !== 'string') {
          body.services = JSON.stringify(Array.isArray(body.services) ? body.services : []);
        }
        if (body.pass !== undefined && body.pass !== null && body.pass !== '') {
          if (String(body.pass).length < 8) return send(res, 400, { error: 'Mot de passe : 8 caractères minimum' });
          (await db.prepare('UPDATE users SET pass = ? WHERE id = ?').run(hashPass(String(body.pass)), id));
        } else if (body.pass !== undefined) {
          delete body.pass;
        }
        if (String(id) === String(me.id) && body.active !== undefined && !Number(body.active)) {
          return send(res, 400, { error: 'Impossible de désactiver votre propre compte' });
        }
        if (body.role !== undefined && String(existing.role || '').toLowerCase() === 'admin' && String(body.role).toLowerCase() !== 'admin') {
          const admins = (await db.prepare("SELECT COUNT(*) AS n FROM users WHERE lower(role) = 'admin' AND active = 1").get()).n;
          if (admins <= 1) return send(res, 400, { error: 'Impossible de retirer le rôle du dernier administrateur actif' });
        }
      }

      if (SERVICE_COLLECTIONS.includes(col)) {
        if (!canService(me, existing.service)) {
          return send(res, 403, { error: 'Accès non autorisé à ce pôle' });
        }
        if (body.service !== undefined) {
          body.service = normalizeService(body.service) || DEFAULT_SERVICE;
          if (!canService(me, body.service)) {
            return send(res, 403, { error: `Accès non autorisé au pôle ${serviceName(body.service)}` });
          }
        }
        if (col === 'mouvements') {
          const errSvc = (await checkMvtService({
            service: body.service !== undefined ? body.service : existing.service,
            lignes: body.lignes !== undefined ? body.lignes : existing.lignes,
          }));
          if (errSvc) return send(res, 400, { error: errSvc });
        }
      }

      const sets = [], vals = [];
      fields.forEach((f) => {
        if (body[f] === undefined) return;
        sets.push(`${f} = ?`);
        if (f === 'pass') vals.push(hashPass(body.pass));
        else if (f === 'deplacement' || f === 'horsWilaya') vals.push(Number(body[f]) ? 1 : 0);
        else if (['qty', 'minQty', 'prix', 'montant', 'paye', 'progress', 'duree', 'toiture', 'conso', 'kwc', 'production', 'rentabilite', 'cout', 'tva', 'totalHT', 'totalTTC', 'salaire', 'prime', 'heuresSup'].includes(f)) vals.push(Number(body[f] || 0));
        else vals.push(body[f]);
      });
      if (sets.length) {
        if (col === 'mouvements') {
          const cand = {
            type: body.type !== undefined ? body.type : existing.type,
            lignes: body.lignes !== undefined ? body.lignes : existing.lignes,
          };
          const errStock = (await checkStockMvt(cand, id));
          if (errStock) return send(res, 400, { error: errStock });
          (await applyStockMvt(existing, -1));
        }
        vals.push(id);
        (await db.prepare(`UPDATE ${col} SET ${sets.join(', ')} WHERE id = ?`).run(...vals));
        if (col === 'mouvements') (await applyStockMvt((await db.prepare(`SELECT * FROM ${col} WHERE id = ?`).get(id)), 1));
      }
      (await audit(me.name, col === 'users' ? `Accès modifié — ${existing.name || id}` : `Modification ${col}`));
      const row = (await db.prepare(`SELECT * FROM ${col} WHERE id = ?`).get(id));
      if (row && row.pass) delete row.pass;
      return send(res, 200, row);
    }

    // DELETE
    if (id && method === 'DELETE') {
      if (col === 'users' && String(id) === String(me.id)) return send(res, 400, { error: 'Impossible de supprimer votre propre compte' });
      if (col === 'users') {
        const admins = (await db.prepare("SELECT COUNT(*) AS n FROM users WHERE lower(role) = 'admin' AND active = 1").get()).n;
        const target = (await db.prepare('SELECT role, active FROM users WHERE id = ?').get(id));
        if (target && String(target.role).toLowerCase() === 'admin' && admins <= 1) {
          return send(res, 400, { error: 'Impossible de supprimer le dernier administrateur actif' });
        }
      }
      if (col === 'clients') {
        const linked = (await db.prepare('SELECT (SELECT COUNT(*) FROM factures WHERE clientId = ?) + (SELECT COUNT(*) FROM devis WHERE clientId = ?) + (SELECT COUNT(*) FROM contrats WHERE clientId = ?) AS n').get(id, id, id)).n;
        if (linked > 0) return send(res, 400, { error: `Ce client a ${linked} document(s) lié(s) — supprimez-les ou archivez la fiche` });
      }
      if (col === 'devis') (await db.prepare('DELETE FROM devis_lignes WHERE devisId = ?').run(id));
      if (col === 'mouvements') {
        const old = (await db.prepare('SELECT * FROM mouvements WHERE id = ?').get(id));
        if (old && !canModule(me, isVente(old) ? 'mouvements' : 'achats')) return send(res, 403, { error: 'Accès non autorisé à ce mouvement' });
        if (old) (await applyStockMvt(old, -1));
      }
      if (SERVICE_COLLECTIONS.includes(col)) {
        const rowSvc = (await db.prepare(`SELECT service FROM ${col} WHERE id = ?`).get(id));
        if (rowSvc && !canService(me, rowSvc.service)) {
          return send(res, 403, { error: 'Accès non autorisé à ce pôle' });
        }
      }
      (await db.prepare(`DELETE FROM ${col} WHERE id = ?`).run(id));
      (await audit(me.name, col === 'users' ? `Accès supprimé — ${id}` : `Suppression ${col}`));
      return send(res, 200, { ok: true });
    }
  }

  return send(res, 404, { error: 'Route inconnue' });
}

/* ---------------- COMPTE ADMINISTRATEUR INITIAL (hébergement sans démo) ---------------- */
async function seedAdminInitial() {
  if ((await db.prepare('SELECT COUNT(*) AS n FROM users').get()).n > 0) return;
  const email = String(process.env.ADMIN_EMAIL || 'admin@ass.dz').toLowerCase();
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) {
    console.error('[SÉCURITÉ] ADMIN_PASSWORD manquant : aucun compte créé.');
    return;
  }
  (await db.prepare('INSERT INTO users (id,name,email,pass,role,phone,active,created) VALUES (?,?,?,?,?,?,?,?)')
    .run('u1', 'Administrateur', email, hashPass(pass), 'Admin', '', 1, now()));
  (await audit('système', 'Création du compte administrateur initial'));
  console.log('[SÉCURITÉ] Compte administrateur initial créé : ' + email);
}

/* ---------------- SERVER ---------------- */
/* Démo locale par défaut ; sur un hébergement public (Vercel, Render) la base
   reste vide en dehors du compte administrateur et de la société, sauf
   SEED_DEMO=1 demandé explicitement. */
const SEED_DEMO = process.env.SEED_DEMO != null ? process.env.SEED_DEMO !== '0' : !PUBLIC_HOST;

/* Toute l'initialisation de la base est asynchrone (libSQL/Turso) : le serveur
   démarre tout de suite, mais chaque requête attend que la base soit prête. */
async function boot() {
  await initDb();
  for (const pragma of PRAGMAS) {
    try { await db.exec(pragma); } catch (e) {
      console.warn('[DB] ' + pragma + ' ignoré : ' + (e && e.message || e));
    }
  }
  await db.exec(SCHEMA);
  for (const [table, col, type] of MIGRATIONS) await ensureColumn(table, col, type);

  if (SEED_DEMO) {
    await seedIfEmpty();
    await seedParc();
    await seedNouveaux();
    await seedPaie();
  } else {
    await seedAdminInitial();
  }
  await seedServices();
  await backfillServices();
  await pruneSessions();

  /* ---------------- INITIALISATION HÉBERGEMENT (Vercel) ---------------- */
  /* Sur un hébergement public : pas de compte de démonstration actif et mot de
     passe administrateur imposé par variable d'environnement. */
  if (SERVERLESS_HOST) {
    const adminEmail = String(process.env.ADMIN_EMAIL || 'admin@ass.dz').toLowerCase();
    let admin = await db.prepare('SELECT id FROM users WHERE lower(email) = ?').get(adminEmail);
    if (!admin) admin = await db.prepare("SELECT id FROM users WHERE lower(role) = 'admin' ORDER BY created LIMIT 1").get();
    if (process.env.ADMIN_PASSWORD && admin) {
      await db.prepare('UPDATE users SET pass = ?, active = 1 WHERE id = ?').run(hashPass(process.env.ADMIN_PASSWORD), admin.id);
      console.log('[SÉCURITÉ] Mot de passe administrateur défini depuis ADMIN_PASSWORD.');
    } else {
      await db.prepare('UPDATE users SET active = 0').run();
      console.error('[SÉCURITÉ] ADMIN_PASSWORD manquant : tous les comptes sont désactivés. Définissez ADMIN_EMAIL et ADMIN_PASSWORD dans Vercel.');
    }
    await db.prepare("UPDATE users SET active = 0 WHERE lower(email) IN ('lina@ass.dz','youssef@ass.dz','sami@ass.dz')").run();
  }
}

const ready = boot();
ready.catch((err) => console.error('[DB] Initialisation impossible :', err && err.message || err));

setInterval(() => { pruneSessions().catch((e) => console.error('[SESSIONS]', e && e.message || e)); }, 6 * 3600 * 1000).unref();

async function appHandler(req, res) {
  /* En-têtes de sécurité communs (serveur local et Vercel) */
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(self), microphone=()');
  if (String(req.headers['x-forwarded-proto'] || '').split(',')[0] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  try {
    await ready;
  } catch (err) {
    return send(res, 503, { error: 'Base de données indisponible — réessayez dans un instant' });
  }

  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!urlPath.startsWith('/api/')) {
    /* Sur Vercel, les fichiers statiques sont servis par le CDN ; ce repli
       couvre l'exécution locale et les hébergements Node classiques. */
    return serveStatic(req, res, urlPath);
  }

  try {
    await handle(req, res);
  } catch (err) {
    console.error('[API]', err);
    if (!res.headersSent) send(res, 500, { error: err.message || 'Erreur serveur' });
  }
}

const server = http.createServer((req, res) => { appHandler(req, res); });

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════╗');
    console.log('  ║   ADVANCED SECURITY SYSTEMS — ERP Backend    ║');
    console.log('  ╠══════════════════════════════════════════════╣');
    console.log('  ║' + ('   http://' + HOST + ':' + PORT).padEnd(46) + '║');
    console.log('  ║   SQLite : ' + path.relative(ROOT, path.join(DATA_DIR, 'ass.db')).padEnd(33) + '║');
    console.log('  ╚══════════════════════════════════════════════╝');
    console.log('');
  });
  process.on('SIGINT', () => { try { db.close(); } catch {} process.exit(0); });
  /* On journalise sans tuer le processus : un incident isolé ne doit pas
     rendre tout l'ERP indisponible sur le plan gratuit. */
  process.on('uncaughtException', (err) => console.error('[FATAL] uncaughtException', err));
  process.on('unhandledRejection', (err) => console.error('[FATAL] unhandledRejection', err));
}

module.exports = { handler: appHandler, server, db };
