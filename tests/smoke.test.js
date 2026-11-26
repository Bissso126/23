/* Tests de fumée : démarrage réel du serveur sur une base SQLite locale.
   Aucune dépendance, aucun réseau externe (node:test intégré). */
'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ass-erp-test-'));
process.env.DATA_DIR = DATA_DIR;
process.env.ADMIN_PASSWORD = 'TestPass123!';
process.env.DEMO_MODE = '0';
process.env.SEED_DEMO = '0';
process.env.BACKUP_TOKEN = 'test-backup-token';
delete process.env.TURSO_DATABASE_URL;
delete process.env.TURSO_AUTH_TOKEN;
/* Clé factice : le test vérifie seulement l'état de configuration, sans appel réseau. */
process.env.GOOGLE_API_KEY = 'test-key-not-used';

const { server, db } = require('../server');

let base;
let token;

before(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(base + '/api/health');
      if (r.ok) return;
    } catch { /* pas encore prêt */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Le serveur ne répond pas au healthcheck');
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  try { await db.close(); } catch { /* déjà fermé */ }
  try { fs.rmSync(DATA_DIR, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 }); }
  catch { /* locked by the OS on Windows — dossier temporaire sans importance */ }
});

async function api(p, opts = {}) {
  const r = await fetch(base + p, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(opts.headers || {}) },
  });
  const ct = r.headers.get('content-type') || '';
  return { status: r.status, body: ct.includes('json') ? await r.json() : Buffer.from(await r.arrayBuffer()) };
}

test('healthcheck et configuration publique', async () => {
  const h = await api('/api/health');
  assert.equal(h.status, 200);
  assert.equal(h.body.ok, true);
  assert.equal(h.body.db, 'ok');
  const c = await api('/api/public/config');
  assert.equal(c.status, 200);
  assert.equal(c.body.demoMode, false);
});

test('authentification', async () => {
  const no = await api('/api/clients');
  assert.equal(no.status, 401);
  const r = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@ass.dz', password: 'TestPass123!' }),
  });
  assert.equal(r.status, 200);
  token = r.body.token;
  assert.ok(token);
  const me = await api('/api/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.body.user.role, 'Admin');
});

test('création, lecture et suppression d’un client', async () => {
  const created = await api('/api/clients', {
    method: 'POST',
    body: JSON.stringify({ name: 'CLIENT TEST', type: 'Villa', status: 'prospect' }),
  });
  assert.equal(created.status, 201);
  const id = created.body.id;
  const list = await api('/api/clients');
  assert.equal(list.status, 200);
  assert.ok(list.body.some((c) => c.id === id));
  const del = await api('/api/clients/' + id, { method: 'DELETE' });
  assert.equal(del.status, 200);
});

test('numérotation atomique : deux devis simultanés ont des numéros différents', async () => {
  const [a, b] = await Promise.all([
    api('/api/devis', { method: 'POST', body: JSON.stringify({ titre: 'Devis A' }) }),
    api('/api/devis', { method: 'POST', body: JSON.stringify({ titre: 'Devis B' }) }),
  ]);
  assert.equal(a.status, 201);
  assert.equal(b.status, 201);
  assert.notEqual(a.body.num, b.body.num);
});

test('les 4 documents commerciaux sont imprimables et numérotés une seule fois', async () => {
  const html = (r) => (Buffer.isBuffer(r.body) ? r.body.toString('utf8') : String(r.body));
  const d = await api('/api/devis', {
    method: 'POST',
    body: JSON.stringify({
      titre: 'Détection incendie', service: 'INC', tva: 19, validite: '2 jours',
      lignes: [
        { description: 'Coffret de relayage', qty: 2, pu: 150000 },
        { description: 'Bouton arrêt pompiers', qty: 2, pu: 6500 },
      ],
    }),
  });
  assert.equal(d.status, 201);

  const bc1 = await api('/api/devis/' + d.body.id + '/bon-commande');
  const bc2 = await api('/api/devis/' + d.body.id + '/bon-commande');
  assert.equal(bc1.status, 200);
  assert.match(html(bc1), /BON DE COMMANDE N° : BC-\d{4}-\d{3}/);
  const bcNum = html(bc1).match(/BON DE COMMANDE N° : (BC-[0-9-]+)/)[1];
  assert.ok(html(bc2).includes(bcNum), 'le numéro du bon de commande doit rester stable');

  const pf1 = await api('/api/devis/' + d.body.id + '/proforma');
  const pf2 = await api('/api/devis/' + d.body.id + '/proforma');
  assert.equal(pf1.status, 200);
  assert.match(html(pf1), /FACTURE PROFORMA N° : PF-\d{4}-\d{3}/);
  const pfNum = html(pf1).match(/FACTURE PROFORMA N° : (PF-[0-9-]+)/)[1];
  assert.ok(html(pf2).includes(pfNum), 'le numéro de la proforma doit rester stable');
  assert.ok(html(pf1).includes('A4 landscape'), 'la proforma reprend le format paysage du modèle');

  const f = await api('/api/devis/' + d.body.id + '/facture', { method: 'POST' });
  assert.equal(f.status, 201);
  const fp = await api('/api/factures/' + f.body.id + '/print');
  assert.equal(fp.status, 200);
  assert.ok(html(fp).includes('Facture N° :'));

  const bl1 = await api('/api/factures/' + f.body.id + '/bon-livraison');
  const bl2 = await api('/api/factures/' + f.body.id + '/bon-livraison');
  assert.equal(bl1.status, 200);
  assert.match(html(bl1), /Bon de livraison N° : BL-\d{4}-\d{3}/);
  const blNum = html(bl1).match(/Bon de livraison N° : (BL-[0-9-]+)/)[1];
  assert.ok(html(bl2).includes(blNum), 'le numéro du bon de livraison doit rester stable');

  const embed = await api('/api/factures/' + f.body.id + '/print?embed=1');
  assert.equal(embed.status, 200);
  assert.ok(!html(embed).includes('Imprimer / PDF'), 'le mode aperçu masque la barre d’impression');
});

test('tarif journalier par employé, saisi par l’administrateur', async () => {
  const updated = await api('/api/users/u1', { method: 'PUT', body: JSON.stringify({ tauxJournalier: 3500 }) });
  assert.equal(updated.status, 200);

  const avecTaux = await api('/api/pointages/point', {
    method: 'POST',
    body: JSON.stringify({ empId: 'u1', type: 'ARRIVÉE', date: '2026-11-26', tauxJournalier: 3500 }),
  });
  assert.equal(avecTaux.status, 201);
  assert.equal(avecTaux.body.montant, 3500);

  const sansSaisie = await api('/api/pointages/point', {
    method: 'POST',
    body: JSON.stringify({ empId: 'u1', type: 'ARRIVÉE', date: '2026-11-27' }),
  });
  assert.equal(sansSaisie.status, 201);
  assert.equal(sansSaisie.body.montant, 3500, 'le tarif de l’employé est repris automatiquement');

  const salaires = await api('/api/pointages/salaires?mois=2026-11');
  assert.equal(salaires.status, 200);
  const emp = salaires.body.salaires.find((s) => s.empId === 'u1');
  assert.ok(emp);
  assert.equal(emp.brutJours, 7000);
  assert.equal(emp.jours, 2);
});

test('sauvegarde : réservée à l’admin ou au token dédié', async () => {
  const denied = await fetch(base + '/api/backup');
  assert.equal(denied.status, 401);
  const byToken = await fetch(base + '/api/backup', { headers: { 'x-backup-token': 'test-backup-token' } });
  assert.equal(byToken.status, 200);
  const buf = Buffer.from(await byToken.arrayBuffer());
  assert.ok(buf.length > 1000);
  assert.equal(buf.subarray(0, 15).toString('ascii'), 'SQLite format 3');
  const byAdmin = await api('/api/backup');
  assert.equal(byAdmin.status, 200);
});

test('statut IA (sans appel réseau externe)', async () => {
  const s = await api('/api/ai/status');
  assert.equal(s.status, 200);
  assert.equal(s.body.configured, true);
});
