# Déploiement Render — ERP Advanced Security Systems

Ce dossier est prêt à être publié sur **Render** en tant que *Web Service* Node.js,
sur le **plan gratuit**, avec la base de données hébergée sur **Turso Cloud**
(SQLite distribué, gratuit, 5 Go, sans expiration).

Render exécute un vrai serveur : `server.js` sert à la fois l'interface
(`public/`) et l'API (`/api/*`). Le disque de Render étant éphémère, la base est
une **réplica locale** synchronisée avec Turso : les lectures sont locales et
rapides, les écritures partent vers le primaire Turso, et la réplica est
reconstruite à chaque démarrage.

> Plus besoin de disque persistant payant (`/var/data`) : la base ne dépend plus
> du disque de la machine.

## Contenu

| Fichier | Rôle |
| --- | --- |
| `server.js` | Serveur complet (API + fichiers statiques). Écoute sur `0.0.0.0:$PORT`. |
| `db.js` | Couche base de données : fichier SQLite local en dev, réplica Turso en prod. |
| `scripts/turso-init.js` | Checkpoint WAL + contrôle d'intégrité + préparation de l'import Turso. |
| `public/` | Interface ERP (HTML, CSS, JS, assets). |
| `config.json` | Identité de la société (aucune donnée métier, aucune clé). |
| `render.yaml` | Blueprint : service **gratuit**, variables d'environnement, sans disque. |
| `.node-version` | Node 24.22.1. |
| `.gitignore` | Exclut la base locale, les journaux et `.env`. |

Une seule dépendance npm : `@libsql/client` (client SQLite/Turso). Le fichier
`package-lock.json` doit être versionné (Render construit avec `npm ci`).

## 1. Mettre le dossier sur GitHub

Render déploie depuis un dépôt Git.

1. Créer un dépôt **privé** sur GitHub (ex. `ass-erp`).
2. Depuis ce dossier :

```bash
git add .
git commit -m "Base Turso + déploiement Render gratuit"
git branch -M main
git remote add origin https://github.com/<compte>/ass-erp.git
git push -u origin main
```

> `config.json` ne contient pas de clé : la clé Gemini se met dans la variable
> `GOOGLE_API_KEY` (jamais dans le dépôt). Gardez malgré tout le dépôt **privé**.

## 2. Créer la base Turso (gratuite)

```bash
# 1) installer la CLI une fois : https://docs.turso.tech/cli
turso auth login

# 2a) base vide (nouveau départ)
turso db create ass-erp

# 2b) OU en repartant des données locales (recommandé) :
npm install
npm run db:init                      # checkpoint WAL + contrôle d'intégrité
turso db create ass-erp --from-file data/ass.db

# 3) URL + jeton (dans les deux cas)
turso db show ass-erp --url          # -> TURSO_DATABASE_URL
turso db tokens create ass-erp       # -> TURSO_AUTH_TOKEN
```

`npm run db:init` est important : les données encore dans le fichier `-wal`
seraient ignorées par un simple import du `.db`. Le script force le checkpoint,
vérifie l'intégrité et affiche le nombre de lignes par table.

## 3. Créer le service sur Render

**Méthode recommandée (blueprint)**

1. Render → **New +** → **Blueprint**.
2. Choisir le dépôt, valider la détection de `render.yaml`.
3. Saisir les valeurs demandées :
   - `TURSO_DATABASE_URL` : URL `libsql://…turso.io`
   - `TURSO_AUTH_TOKEN` : jeton Turso (secret)
   - `ADMIN_PASSWORD` : mot de passe administrateur fort (12+ caractères)
   - `GOOGLE_API_KEY` : clé Gemini (facultatif, sinon l'IA est désactivée)
4. **Apply** : Render crée le service en plan **Free** et déploie.

**Méthode manuelle (New + → Web Service)**

| Réglage | Valeur |
| --- | --- |
| Language / Runtime | Node |
| Root Directory | *(vide)* |
| Build Command | `npm ci` |
| Start Command | `node server.js` |
| Plan | Free |
| Disk | *(aucun)* |

Variables à ajouter (onglet *Environment*) :

| Variable | Valeur |
| --- | --- |
| `HOST` | `0.0.0.0` |
| `SEED_DEMO` | `0` |
| `ADMIN_EMAIL` | `admin@ass.dz` (ou votre email) |
| `ADMIN_PASSWORD` | votre mot de passe (secret) |
| `GOOGLE_API_KEY` | clé Gemini (secret, facultatif) |
| `TURSO_DATABASE_URL` | URL Turso (secret) |
| `TURSO_AUTH_TOKEN` | jeton Turso (secret) |

> Sans `TURSO_DATABASE_URL`, le serveur utilise un simple fichier local
> (`data/ass.db`) : pratique en développement, mais **perdu** à chaque
> redéploiement sur Render.

> **Service déjà déployé avec un disque ?** Supprimez la variable `DATA_DIR`
> (ex. `/var/data`) dans *Environment*, puis détachez le disque dans le tableau
> de bord Render. Avec Turso, le disque est inutile ; un `DATA_DIR` pointant vers
> un chemin non monté empêcherait le démarrage.

## 4. Connexion

Une fois le déploiement terminé (*Live*), ouvrir `https://<nom-du-service>.onrender.com`
et se connecter avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Si la base Turso a été importée depuis `data/ass.db`, les comptes existants sont
conservés. Sur une base vide, seul le compte administrateur et les pôles de la
société sont créés : les comptes de démonstration (`admin123`, `lina@ass.dz`, …)
sont désactivés.

## 5. Conservation des données

- **Avec Turso** : les données survivent aux redéploiements, redémarrages et
  mises en veille. La réplica locale est jetable.
- **Plan gratuit Render** : le service s'endort après **15 min** d'inactivité ;
  la première requête suivante prend ~30 s (réveil + synchronisation Turso).
  La base Turso, elle, reste disponible en permanence.
- **Sauvegarde** : **Paramètres → Sauvegarder la base** (le serveur synchronise
  la réplica puis télécharge un `.db` complet). Une sauvegarde automatique
  quotidienne est aussi prévue (voir §9). Restauration : voir §9.

## 6. Vérifications après déploiement

1. `https://<service>.onrender.com/api/public/config` → JSON avec `"version":"2.0.0"`.
   Une page HTML ou une 404 indique un mauvais *start command*.
2. Connexion avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Dans les *Logs* Render : `[DB] Turso connecté : libsql://…` puis
   `http://0.0.0.0:10000`.
4. Créer un client, lancer **Manual Deploy → Deploy latest commit**, vérifier
   que le client est toujours là → Turso opérationnel.

## 7. Dépannage

| Symptôme | Cause probable | Correction |
| --- | --- | --- |
| `No open ports detected` | écoute sur `127.0.0.1` | `HOST=0.0.0.0` (déjà dans `render.yaml`) |
| Page 404 sur `/` | `Start Command` incorrect | `node server.js` |
| `TURSO_AUTH_TOKEN manquant` | jeton absent | créer un jeton et le définir sur Render |
| `Replication(PrimaryHandshakeTimeout)` | URL/jeton Turso invalides ou base suspendue | vérifier `TURSO_DATABASE_URL`, régénérer le jeton |
| API en `503 Base de données indisponible` | initialisation impossible (voir Logs) | corriger les variables Turso puis redéployer |
| Données perdues après déploiement | `TURSO_DATABASE_URL` absente | configurer Turso (la base locale est éphémère) |
| `npm ci` échoue | `package-lock.json` absent du dépôt | le committer |
| `Cannot find module '@libsql/client'` | `npm install` non exécuté | build command `npm ci` |

## 8. Mode démonstration (facultatif)

Pour une présentation avec les données d'exemple, définir `SEED_DEMO=1` et
`DEMO_MODE=1` **avant le premier déploiement, sur une base vide**. Les comptes
`admin@ass.dz / admin123`, `youssef@ass.dz / tech123`, `lina@ass.dz / com123`,
`sami@ass.dz / tech123` redeviennent actifs. À ne jamais laisser sur une instance
contenant de vraies données.

## 9. Fiabilité, sauvegardes et tests

### Healthcheck

`GET /api/health` (public, aucune session requise) répond :

```json
{"ok":true,"db":"ok","model":"gemini-3.5-flash","version":"2.0.0","time":"..."}
```

`503` signifie que la base n'est pas joignable. Brancher un monitor externe
(UptimeRobot, Better Stack…) sur cette URL permet d'être alerté et de réveiller
le service Render en cas de mise en veille.

### Tests automatisés

```bash
npm test
```

`node --test tests` démarre un vrai serveur sur une base SQLite temporaire :
healthcheck, login, CRUD client, numérotation atomique de deux devis
simultanés, sauvegarde (admin **et** token dédié), statut IA. La CI GitHub
(`.github/workflows/ci.yml`) exécute ces tests à chaque push sur `main`.

### Sauvegarde automatique

`.github/workflows/backup.yml` exporte la base Turso **tous les jours à 03:17 UTC**
(secret GitHub `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN`) :

- artifact GitHub conservé **90 jours**, accessible uniquement aux personnes
  autorisées (le dépôt `23` est public : **ne jamais y committer le `.db`**) ;
- vérification des comptages table par table avant validation.

Pour conserver une sauvegarde plus de 90 jours, télécharger l'artifact et le
déposer dans un stockage privé (S3, R2, Google Drive) ou un dépôt **privé**
dédié. Le fichier contient les hash des mots de passe et les jetons de session.

Lancement manuel : onglet **Actions → Sauvegarde Turso → Run workflow**.

Sauvegarde locale équivalente :

```bash
node scripts/backup-export.js backups/ass-2026-11-25.db
```

### Restauration

Le fichier `.db` exporté est un SQLite standard. Deux options :

1. **Nouvelle base Turso** (la plus simple) :
   `turso db create ass-erp-restore --from-file backups/ass-2026-11-25.db`
   puis mettre à jour `TURSO_DATABASE_URL` sur Render.
2. **Base existante** : point `DATA_DIR` sur le dossier contenant le fichier
   (renommé `ass.db`) et pousse vers Turso :
   `DATA_DIR=./backups node scripts/turso-push.js`

⚠️ La restauration **remplace** les données actuelles : à faire sur une base de
test d'abord.

### Token de sauvegarde (optionnel)

`BACKUP_TOKEN` permet à un cron externe de télécharger `/api/backup` sans
session admin :

```bash
curl -H "x-backup-token: $BACKUP_TOKEN" https://<service>.onrender.com/api/backup -o ass.db
```

Sans ce token, l'endpoint reste réservé aux administrateurs connectés.

### IA : bascule automatique

`gemini-3.5-flash` est essayé en premier. En cas de `503` (forte demande chez
Google), le serveur essaie successivement `gemini-3.6-flash`,
`gemini-3.5-flash-lite` et `gemini-3.1-flash-lite`. Le modèle réellement utilisé
est renvoyé dans le champ `model` de la réponse ; `/api/ai/status` affiche le
modèle visé.
