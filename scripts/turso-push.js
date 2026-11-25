#!/usr/bin/env node
/* ============================================================
   COPIE D'UNE BASE SQLITE LOCALE VERS TURSO CLOUD
   (alternative à « turso db create --from-file », utile sous
   Windows où la CLI Turso n'est plus distribuée)

   Usage :
     $env:TURSO_DATABASE_URL="libsql://....turso.io"
     $env:TURSO_AUTH_TOKEN="...."
     node scripts/turso-push.js [chemin\vers\ass.db]

   Le script :
     1. force le checkpoint WAL du fichier source ;
     2. recrée tables et index sur la base distante ;
     3. copie toutes les lignes par lots (INSERT OR REPLACE) ;
     4. compare le nombre de lignes table par table.
   À lancer sur une base Turso vide (ou après un import partiel).
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const SRC = process.argv[2] || process.env.DB_FILE || path.join(DATA_DIR, 'ass.db');
const URL = String(process.env.TURSO_DATABASE_URL || '').trim();
const TOKEN = String(process.env.TURSO_AUTH_TOKEN || '').trim();
const BATCH = 200;

function quoteIdent(name) {
  return '"' + String(name).replace(/"/g, '""') + '"';
}

function die(msg) {
  console.error(msg);
  process.exitCode = 1;
}

/* Ordonne les tables pour que les parents passent avant les enfants (FK). */
function sortByDependencies(tables, fks) {
  const remaining = new Set(tables);
  const ordered = [];
  while (remaining.size) {
    const ready = [...remaining].filter((t) =>
      (fks[t] || []).every((parent) => !remaining.has(parent) || parent === t)
    );
    if (!ready.length) {
      /* Cycle de clés étrangères : on termine dans l'ordre restant. */
      ordered.push(...remaining);
      break;
    }
    for (const t of ready) {
      ordered.push(t);
      remaining.delete(t);
    }
  }
  return ordered;
}

async function main() {
  if (!URL || !TOKEN) {
    return die('TURSO_DATABASE_URL et TURSO_AUTH_TOKEN doivent être définis.');
  }
  if (!fs.existsSync(SRC)) {
    return die('Fichier source introuvable : ' + SRC);
  }

  const local = createClient({ url: 'file:' + SRC.replace(/\\/g, '/') });
  const remote = createClient({ url: URL, authToken: TOKEN });

  try {
    try { await local.execute('PRAGMA wal_checkpoint(TRUNCATE);'); } catch { /* déjà propre */ }

    const objects = (await local.execute(
      "SELECT type, name, sql FROM sqlite_master " +
      "WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' " +
      "ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 ELSE 2 END"
    )).rows;

    const tables = objects.filter((o) => o.type === 'table').map((o) => o.name);
    const others = objects.filter((o) => o.type !== 'table');

    console.log('Source : ' + SRC);
    console.log('Cible  : ' + URL);
    console.log('Tables : ' + tables.length);

    /* --- 1. Structure --- */
    for (const obj of objects) {
      try {
        await remote.execute(obj.sql);
      } catch (e) {
        console.warn('  [structure] ' + obj.name + ' : ' + (e && e.message || e));
      }
    }

    /* --- 2. Dépendances --- */
    const fks = {};
    for (const t of tables) {
      const rows = (await local.execute('PRAGMA foreign_key_list(' + quoteIdent(t) + ')')).rows;
      fks[t] = [...new Set(rows.map((r) => r.table))].filter((p) => tables.includes(p));
    }
    const ordered = sortByDependencies(tables, fks);

    /* --- 3. Données --- */
    let total = 0;
    for (const table of ordered) {
      const cols = (await local.execute('PRAGMA table_info(' + quoteIdent(table) + ')')).rows.map((c) => c.name);
      const rows = (await local.execute('SELECT * FROM ' + quoteIdent(table))).rows;
      if (!rows.length) {
        console.log('  ' + table.padEnd(20) + '       0');
        continue;
      }
      const colList = cols.map(quoteIdent).join(',');
      const placeholders = cols.map(() => '?').join(',');
      const sql = 'INSERT OR REPLACE INTO ' + quoteIdent(table) + ' (' + colList + ') VALUES (' + placeholders + ')';

      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH).map((row) => ({
          sql,
          args: cols.map((c) => (row[c] === undefined ? null : row[c])),
        }));
        await remote.batch(batch, 'write');
      }
      total += rows.length;
      console.log('  ' + table.padEnd(20) + String(rows.length).padStart(7));
    }

    /* --- 4. Vérification --- */
    console.log('');
    let ok = true;
    for (const table of ordered) {
      const localCount = (await local.execute('SELECT COUNT(*) AS n FROM ' + quoteIdent(table))).rows[0].n;
      const remoteCount = (await remote.execute('SELECT COUNT(*) AS n FROM ' + quoteIdent(table))).rows[0].n;
      if (Number(localCount) !== Number(remoteCount)) {
        ok = false;
        console.error('  ÉCART ' + table + ' : local=' + localCount + ' distant=' + remoteCount);
      }
    }
    console.log(ok
      ? 'Terminé : ' + total + ' lignes copiées, comptages identiques.'
      : 'Terminé avec des écarts : vérifiez les lignes ci-dessus.');
    if (!ok) process.exitCode = 1;
  } finally {
    try { await local.close(); } catch { /* ignore */ }
    try { await remote.close(); } catch { /* ignore */ }
  }
}

main().catch((e) => {
  console.error(e && e.stack || e);
  process.exitCode = 1;
});
