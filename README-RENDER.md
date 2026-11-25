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
  la réplica puis télécharge un `.db` complet). Restauration :
  `turso db create <nom> --from-file <sauvegarde.db>`.

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
