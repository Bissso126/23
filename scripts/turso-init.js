#!/usr/bin/env node
/* ============================================================
   PRÉPARATION DE LA BASE POUR TURSO CLOUD
   1. force un checkpoint WAL : toutes les écritures en attente
      passent dans data/ass.db (sinon elles resteraient dans le
      fichier -wal et seraient ignorées à l'import) ;
   2. vérifie l'intégrité du fichier ;
   3. affiche le nombre de lignes par table ;
   4. rappelle les commandes Turso CLI à exécuter.

   Usage :  node scripts/turso-init.js
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const DB_FILE = process.env.DB_FILE || path.join(DATA_DIR, 'ass.db');
const DB_NAME = process.env.TURSO_DB_NAME || 'ass-erp';

async function main() {
  if (!fs.existsSync(DB_FILE)) {
    console.error('Fichier introuvable : ' + DB_FILE);
    process.exitCode = 1;
    return;
  }

  const before = fs.statSync(DB_FILE).size;
  const client = createClient({ url: 'file:' + DB_FILE.replace(/\\/g, '/') });

  try {
    await client.execute('PRAGMA wal_checkpoint(TRUNCATE);');

    const integrity = await client.execute('PRAGMA integrity_check;');
    const verdict = integrity.rows[0] && integrity.rows[0].integrity_check;
    if (verdict !== 'ok') {
      console.error('Intégrité SQLite : ' + verdict);
      process.exitCode = 1;
      return;
    }

    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );

    console.log('Base prête pour Turso : ' + DB_FILE);
    console.log('  intégrité : ok');
    console.log('  taille    : ' + before + ' -> ' + fs.statSync(DB_FILE).size + ' octets');
    console.log('');
    console.log('  table                 lignes');
    console.log('  ----------------------------');
    for (const row of tables.rows) {
      const name = String(row.name).replace(/'/g, "''");
      const res = await client.execute('SELECT COUNT(*) AS n FROM "' + name + '"');
      const n = res.rows[0] ? res.rows[0].n : 0;
      console.log('  ' + name.padEnd(20) + '  ' + String(n).padStart(6));
    }
  } finally {
    await client.close();
  }

  const rel = path.relative(ROOT, DB_FILE).replace(/\\/g, '/');
  console.log('');
  console.log('--- Étapes suivantes (Turso CLI) ---');
  console.log('  turso auth login');
  console.log('  turso db create ' + DB_NAME + ' --from-file "' + rel + '"');
  console.log('  turso db show ' + DB_NAME + ' --url          # -> TURSO_DATABASE_URL');
  console.log('  turso db tokens create ' + DB_NAME + '         # -> TURSO_AUTH_TOKEN');
  console.log('');
  console.log('Variables à définir sur Render :');
  console.log('  TURSO_DATABASE_URL=libsql://' + DB_NAME + '-<compte>.turso.io');
  console.log('  TURSO_AUTH_TOKEN=<jeton>');
  console.log('  ADMIN_EMAIL=<email administrateur>');
  console.log('  ADMIN_PASSWORD=<mot de passe>');
}

main().catch((e) => {
  console.error(e && e.stack || e);
  process.exitCode = 1;
});
