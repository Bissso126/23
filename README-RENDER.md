# Déploiement Render — ERP Advanced Security Systems

Ce dossier est prêt à être publié sur **Render** en tant que *Web Service* Node.js.
Contrairement à Vercel, Render exécute un vrai serveur : `server.js` sert à la fois
l'interface (`public/`) et l'API (`/api/*`), et la base SQLite peut être conservée
sur un **disque persistant**.

## Contenu

| Fichier | Rôle |
| --- | --- |
| `server.js` | Serveur complet (API + fichiers statiques). Écoute sur `0.0.0.0:$PORT`. |
| `public/` | Interface ERP (HTML, CSS, JS, assets). |
| `config.json` | Identité de la société + clé Gemini. **Aucune donnée métier.** |
| `render.yaml` | Blueprint : service, disque `/var/data`, variables d'environnement. |
| `.node-version` | Node 24.22.1 (requis par `node:sqlite`). |
| `.gitignore` | Exclut la base locale, les journaux et `.env`. |

Aucune dépendance npm : `npm install` ne télécharge aucun paquet applicatif.

## 1. Mettre le dossier sur GitHub

Render déploie depuis un dépôt Git.

1. Créer un dépôt **privé** sur GitHub (ex. `ass-erp`).
2. Depuis ce dossier :

```bash
git init
git add .
git commit -m "ERP Advanced Security Systems — déploiement Render"
git branch -M main
git remote add origin https://github.com/<compte>/ass-erp.git
git push -u origin main
```

> `config.json` contient la clé Gemini : gardez le dépôt **privé**. Sinon, supprimez
> la clé du fichier et utilisez uniquement la variable `GOOGLE_API_KEY`.

## 2. Créer le service sur Render

**Méthode recommandée (blueprint, disque persistant inclus)**

1. Render → **New +** → **Blueprint**.
2. Choisir le dépôt, valider la détection de `render.yaml`.
3. Saisir les valeurs demandées :
   - `ADMIN_PASSWORD` : mot de passe administrateur fort (12+ caractères).
   - `GOOGLE_API_KEY` : clé Gemini (facultatif).
4. **Apply** : Render crée le service, monte le disque `/var/data` et déploie.

**Méthode manuelle (New + → Web Service)**

| Réglage | Valeur |
| --- | --- |
| Language / Runtime | Node |
| Root Directory | *(vide)* |
| Build Command | `npm install --omit=dev` |
| Start Command | `node server.js` |
| Health Check Path | `/api/public/config` |
| Disk → Mount Path / Size | `/var/data` / 1 GB |

Variables à ajouter (onglet *Environment*) :

| Variable | Valeur |
| --- | --- |
| `HOST` | `0.0.0.0` |
| `DATA_DIR` | `/var/data` |
| `SEED_DEMO` | `0` |
| `ADMIN_EMAIL` | `admin@ass.dz` (ou votre email) |
| `ADMIN_PASSWORD` | votre mot de passe (secret) |
| `GOOGLE_API_KEY` | clé Gemini (secret, facultatif) |

## 3. Connexion

Une fois le déploiement terminé (*Live*), ouvrir `https://<nom-du-service>.onrender.com`
et se connecter avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

La base démarre **vide** : uniquement le compte administrateur et les pôles de la
société. Les comptes de démonstration (`admin123`, `lina@ass.dz`, …) sont désactivés.

## 4. Conservation des données

- **Avec disque persistant** (offre Starter ou supérieure) : `data/ass.db` vit dans
  `/var/data` et survit aux redéploiements, redémarrages et mises en veille.
- **Sans disque** (offre Free) : le système de fichiers est éphémère, la base est
  perdue à chaque redéploiement/redémarrage, et le service s'endort après 15 min
  d'inactivité. Utilisable pour une démonstration seulement.
- Sauvegarde : **Paramètres → Sauvegarde** dans l'application (fichier `.db`), ou
  copie de `/var/data/ass.db`. Le dossier entreprise imprimable reste disponible
  dans **Paramètres**.

## 5. Vérifications après déploiement

1. `https://<service>.onrender.com/api/public/config` → JSON avec `"version":"2.0.0"`.
   Si cette URL renvoie une page HTML ou une 404, le service n'est pas sur le bon
   *start command*.
2. Connexion avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Dans les *Logs* Render : `[SÉCURITÉ] Compte administrateur initial créé : <email>`
   puis `http://0.0.0.0:10000` environ.
4. Créer un client, attendre un redéploiement manuel (**Manual Deploy → Deploy latest
   commit**), vérifier que le client est toujours là → disque persistant opérationnel.

## 6. Dépannage

| Symptôme | Cause probable | Correction |
| --- | --- | --- |
| `No open ports detected` | écoute sur `127.0.0.1` | `HOST=0.0.0.0` (déjà dans `render.yaml`) |
| Page 404 sur `/` | `Start Command` incorrect | `node server.js` |
| `Cannot find module 'node:sqlite'` | Node trop ancien | `.node-version` = `24.22.1` |
| `ADMIN_PASSWORD manquant` dans les logs | variable non définie | l'ajouter puis redéployer |
| Données perdues après déploiement | pas de disque persistant | ajouter un disque monté sur `/var/data` |
| `SQLITE_CANTOPEN` | disque non monté au chemin de `DATA_DIR` | aligner les deux sur `/var/data` |

## 7. Mode démonstration (facultatif)

Pour une présentation avec les données d'exemple, définir `SEED_DEMO=1` et
`DEMO_MODE=1` **avant le premier déploiement, sur une base vide**. Les comptes
`admin@ass.dz / admin123`, `youssef@ass.dz / tech123`, `lina@ass.dz / com123`,
`sami@ass.dz / tech123` redeviennent actifs. À ne jamais laisser sur une instance
contenant de vraies données.
