# 🚀 Déploiement de Portéo (API sur Render + Front sur Firebase Hosting)

Firebase Hosting ne sert que des fichiers **statiques** (le front Angular). On déploie donc :
1. **l'API .NET + PostgreSQL** sur **Render** (gratuit) → on obtient une URL publique ;
2. **le front Angular** sur **Firebase Hosting**, configuré pour appeler cette URL.

> Tout le code est déjà « cloud-ready » (écoute la variable `PORT`, accepte une URL `postgres://…`, migrations + seed au démarrage, CORS ouvert). Il ne reste que les étapes liées à **tes comptes** (Render, GitHub, Google/Firebase), forcément interactives.

---

## PARTIE A — Backend sur Render

### A.1 Pousser le projet sur GitHub
Render déploie depuis un dépôt Git. Depuis `C:\source\Portage` :

```bash
git init
git add .
git commit -m "Portéo - app de portage salarial"
git branch -M main
git remote add origin https://github.com/TON_USER/TON_REPO.git
git push -u origin main
```
> Le `.gitignore` racine exclut déjà `bin/`, `obj/`, `node_modules/`, `dist/`.

### A.2 Créer les services sur Render (via le Blueprint fourni)
1. Va sur https://render.com → connecte-toi avec GitHub.
2. **New +** → **Blueprint** → sélectionne ton dépôt.
3. Render lit `render.yaml` (à la racine) et propose de créer :
   - une base **PostgreSQL** `porteo-db` (plan free) ;
   - un service web Docker `porteo-api` (plan free).
4. Clique **Apply**. Render build l'image Docker (`crossone.porteo.erp/Dockerfile`), branche la base, applique les migrations + le seed au 1er démarrage.

### A.3 Récupérer l'URL de l'API
Quand le service `porteo-api` est **Live**, son URL ressemble à :
```
https://porteo-api.onrender.com
```
Vérifie :
- API/Swagger : `https://porteo-api.onrender.com/swagger`
- Login : `POST https://porteo-api.onrender.com/api/auth/login`

> ⏱️ Sur le plan gratuit, le service « s'endort » après ~15 min d'inactivité ; la 1ʳᵉ requête suivante prend ~30–50 s (cold start). C'est normal.

---

## PARTIE B — Front sur Firebase Hosting

### B.1 Brancher le front sur l'API en ligne
Édite `crossone.porteo.web.manager/src/environments/environment.prod.ts` et remplace l'URL par la tienne (garde `/api/` à la fin) :

```ts
export const environment = {
  production: true,
  apiUrl: 'https://porteo-api.onrender.com/api/'
};
```

### B.2 Déployer (procédure adaptée de ton prof)

```bash
# 1) (si pas déjà fait) installer le CLI
npm install -g firebase-tools

# 2) se connecter à ton compte Google
firebase login

# 3) se placer dans le dossier du FRONT
cd C:\source\Portage\crossone.porteo.web.manager

# 4) (option) initialiser — OU utiliser les fichiers déjà fournis (voir B.3)
firebase init
#   - Hosting: Configure files for Firebase Hosting
#   - Use an existing project  -> choisis TON projet Firebase
#   - public directory          ->  dist/porteo-web/browser
#   - single-page app (rewrite) ->  Yes   (⚠️ OUI pour Angular : sinon /missions, /clients… renvoient 404)
#   - GitHub auto-deploys        ->  (au choix ; "No" suffit pour un déploiement manuel)

# 5) build de production
ng build --configuration production

# 6) déployer  ->  Firebase t'affiche le "Hosting URL" de l'app
firebase deploy
```

À la fin, Firebase affiche par ex. :
```
Hosting URL: https://ton-projet.web.app
```
Ouvre-la, connecte-toi avec `admin@porteo.dev` / `Porteo2026!` 🎉

### B.3 Raccourci : sans `firebase init`
Les fichiers `firebase.json` (public = `dist/porteo-web/browser`, réécriture SPA) et `.firebaserc` sont **déjà créés**. Il te suffit de :
1. mettre ton **Project ID** dans `crossone.porteo.web.manager/.firebaserc` (`"default": "ton-projet-id"`), ou faire `firebase use --add` ;
2. `ng build --configuration production` ;
3. `firebase deploy`.

---

## ⚠️ Différence avec l'exemple du prof
- **Dossier public** : `dist/porteo-web/browser` (Angular 17+ ajoute le sous-dossier `browser`), pas `dist/first-app`.
- **Réécriture SPA = OUI** : notre app utilise le routeur Angular (`/missions`, `/clients/:id`…). Sans la réécriture vers `index.html`, ces liens directs renverraient une 404. (Le prof a mis « No » sur un exemple sans routage profond.)
- `baseHref` est déjà fixé à `/` dans `angular.json`, et les budgets de build sont élargis.

## 🔧 Dépannage
- **Le front se charge mais le login échoue** → `apiUrl` dans `environment.prod.ts` est faux, ou l'API Render dort (réessaie après ~40 s), ou erreur CORS (l'API autorise déjà toutes les origines).
- **404 sur un lien direct** → la réécriture SPA n'est pas active (vérifie `firebase.json` → `rewrites`).
- **Render build échoue** → vérifie que `render.yaml` est bien à la racine du dépôt et que `crossone.porteo.erp/Dockerfile` est présent.
