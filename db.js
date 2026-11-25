/* ============================================================
   COUCHE BASE DE DONNÉES — libSQL / Turso
   API synchrone « façon node:sqlite » au-dessus du client libSQL
   (asynchrone). Permet de conserver le code métier existant :
     await db.prepare(sql).get(...)
     await db.prepare(sql).all(...)
     await db.prepare(sql).run(...)
     await db.exec(sql)
   En local (aucune variable TURSO_*) : fichier SQLite classique.
   En production (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN) : réplica
   local synchronisé avec la base Turso distante.
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp/ass-data' : path.join(ROOT, 'data'));
const DB_FILE = process.env.DB_FILE || path.join(DATA_DIR, 'ass.db');
const REMOTE_URL = String(process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL || '').trim();
const AUTH_TOKEN = String(process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN || '').trim();

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

let client = null;
let initPromise = null;

/* node:sqlite accepte undefined/boolean/Date ; libSQL est plus strict. */
function normalizeArgs(params) {
  if (params.length === 1 && Array.isArray(params[0])) params = params[0];
  return params.map((v) => {
    if (v === undefined) return null;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (v instanceof Date) return v.toISOString();
    return v;
  });
}

class Statement {
  constructor(sql) { this.sql = sql; }

  async all(...params) {
    const res = await client.execute({ sql: this.sql, args: normalizeArgs(params) });
    return res.rows;
  }

  async get(...params) {
    const res = await client.execute({ sql: this.sql, args: normalizeArgs(params) });
    return res.rows[0];
  }

  async run(...params) {
    const res = await client.execute({ sql: this.sql, args: normalizeArgs(params) });
    return {
      changes: Number(res.rowsAffected || 0),
      lastInsertRowid: res.lastInsertRowid == null ? 0 : Number(res.lastInsertRowid),
    };
  }
}

const db = {
  prepare(sql) { return new Statement(sql); },
  async exec(sql) { await client.executeMultiple(sql); },
  /* Force une synchronisation avec le primaire Turso (no-op en local).
     Utile avant une sauvegarde : le fichier local est alors à jour. */
  async sync() {
    if (!REMOTE_URL || !client) return false;
    await client.sync();
    return true;
  },
  async close() { if (client) { try { await client.close(); } catch { /* déjà fermé */ } client = null; } },
  get file() { return DB_FILE; },
  get remote() { return !!REMOTE_URL; },
};

function initDb() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const localUrl = 'file:' + DB_FILE.replace(/\\/g, '/');
    if (REMOTE_URL) {
      if (!AUTH_TOKEN) {
        throw new Error('TURSO_AUTH_TOKEN manquant : impossible de se connecter à Turso');
      }
      /* Réplica intégrée : lectures locales rapides, écritures envoyées au
         primaire Turso. Le fichier local est reconstruit au démarrage. */
      client = createClient({
        url: localUrl,
        syncUrl: REMOTE_URL,
        authToken: AUTH_TOKEN,
        syncInterval: 60,
        readYourWrites: true,
      });
      await client.sync();
      console.log('[DB] Turso connecté : ' + REMOTE_URL);
    } else {
      client = createClient({ url: localUrl });
      console.log('[DB] SQLite locale : ' + DB_FILE);
    }
    return client;
  })();
  return initPromise;
}

module.exports = { db, initDb, DB_FILE, DATA_DIR };
