#!/usr/bin/env node
/* ============================================================
   EXPORT D'UNE BASE TURSO VERS UN FICHIER SQLITE LOCAL
   (sauvegarde hors hébergement, restorable avec turso-push.js)

   Usage :
     TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... \
       node scripts/backup-export.js [chemin/ass-AAAA-MM-JJ.db]

   Le fichier produit est un SQLite standard (même schéma, mêmes données).
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

const ROOT = path.resolve(__dirname, '..');
const url = String(process.env.TURSO_DATABASE_URL || '').trim();
const token = String(process.env.TURSO_AUTH_TOKEN || '').trim();
const stamp = new Date().toISOString().slice(0, 10);
const out = path.resolve(process.argv[2] || path.join(ROOT, 'backups', `ass-${stamp}.db`));
const BATCH = 200;

function quoteIdent(name) {
  return '"' + String(name).replace(/"/g, '""') + '"';
}

async function main() {
  if (!url || !token) {
    throw new Error('TURSO_DATABASE_URL et TURSO_AUTH_TOKEN sont requis.');
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const remote = createClient({ url, authToken: token });
  const local = createClient({ url: 'file:' + out.replace(/\\/g, '/') });
  try {
    const objects = (await remote.execute(
      "SELECT type, name, sql FROM sqlite_master " +
      "WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' " +
      "ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 ELSE 2 END"
    )).rows;
    const tables = objects.filter((o) => o.type === 'table').map((o) => o.name);
    console.log(`Export de ${url}`);
    console.log(`Tables : ${tables.length}`);

    /* Schéma (tables puis index) */
    for (const obj of objects) {
      try { await local.execute(obj.sql); }
      catch (e) { console.warn('  [schéma] ' + obj.name + ' : ' + (e && e.message || e)); }
    }

    /* Données */
    let total = 0;
    for (const table of tables) {
      const cols = (await remote.execute('PRAGMA table_info(' + quoteIdent(table) + ')')).rows.map((c) => c.name);
      const rows = (await remote.execute('SELECT * FROM ' + quoteIdent(table))).rows;
      if (rows.length) {
        const sql = 'INSERT OR REPLACE INTO ' + quoteIdent(table) + ' (' + cols.map(quoteIdent).join(',') + ') VALUES ('
          + cols.map(() => '?').join(',') + ')';
        for (let i = 0; i < rows.length; i += BATCH) {
          await local.batch(rows.slice(i, i + BATCH).map((row) => ({
            sql,
            args: cols.map((c) => (row[c] === undefined ? null : row[c])),
          })), 'write');
        }
      }
      total += rows.length;
      console.log('  ' + table.padEnd(20) + String(rows.length).padStart(7));
    }

    /* Vérification */
    let ok = true;
    for (const table of tables) {
      const a = (await remote.execute('SELECT COUNT(*) AS n FROM ' + quoteIdent(table))).rows[0].n;
      const b = (await local.execute('SELECT COUNT(*) AS n FROM ' + quoteIdent(table))).rows[0].n;
      if (Number(a) !== Number(b)) { ok = false; console.error(`  ÉCART ${table} : distant=${a} export=${b}`); }
    }
    if (!ok) throw new Error('Comptages différents : export incomplet.');
    const size = fs.statSync(out).size;
    console.log(`\nExport terminé : ${out} (${total} lignes, ${size} octets)`);
  } finally {
    try { await remote.close(); } catch { /* ignore */ }
    try { await local.close(); } catch { /* ignore */ }
  }
}

main().catch((e) => { console.error(e && e.stack || e); process.exitCode = 1; });
