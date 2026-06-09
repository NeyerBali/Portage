# Portéo — Plateforme de gestion de portage salarial

Application full-stack **Angular 19 + ASP.NET Core 8 (architecture N-tiers) + PostgreSQL**, reproduisant fidèlement l'architecture des projets de référence `crossone.portage.web.manager` (front) et `crossone.portage.erp` (back), pour un domaine restreint et 100 % fonctionnel : **consultants, clients, missions, factures**.

> Projet d'examen Angular avec vraie API REST sécurisée (JWT), base persistante et déploiement Docker.

---

## 🚀 Démarrage rapide (Docker)

Prérequis : **Docker Desktop** (avec Compose v2).

```bash
cd C:\source\Portage
docker compose up --build
```

Au démarrage, l'API applique automatiquement les **migrations EF Core** puis insère un **jeu de données de démonstration** (5 consultants, 5 clients, 10 missions, 7 factures, 2 comptes).

### URLs

| Service | URL |
|---|---|
| **Front (Portéo)** | http://localhost:8090 |
| **API REST** | http://localhost:5080/api |
| **Swagger** | http://localhost:5080/swagger |

> Le front (Nginx) proxifie `/api` vers l'API : la SPA fonctionne donc aussi en appelant `http://localhost:8090/api/...` (même origine, pas de souci CORS).

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| **Administrateur** | `admin@porteo.dev` | `Porteo2026!` |
| **Consultant** (Camille Rousseau) | `consultant@porteo.dev` | `Porteo2026!` |

Arrêt : `docker compose down` · Réinitialiser la base : `docker compose down -v`.

---

## 🏗️ Architecture

### Backend — `crossone.porteo.erp` (solution `.NET 8`, N-tiers, 9 projets)

```
Porteo.Api          → Controllers (Auth, Missions, Clients, Consultants, Factures, Dashboard),
                       Program.cs (DI, JWT, Swagger, Serilog, Quartz), Filters (DataOwnership),
                       Helpers (claims), Data (DbInitializer/seed), Migrations
Porteo.Services     → IGenericService + services par domaine + IServices (façade) + Auth (JWT, hash)
Porteo.Repositories → IGenericRepository, PorteoDbContext (EF Core), UnitOfWork, repos par domaine
Porteo.Dapper       → IQuery + requêtes SQL de lecture (agrégats du dashboard : CA/mois, statuts…)
Porteo.Models       → entités EF par domaine
Porteo.ModelViews   → DTOs (entrée/sortie) par domaine
Porteo.Mappers      → profils AutoMapper Models ↔ ModelViews
Porteo.Scheduler    → job Quartz réel : SchedulerJobInvoiceRelance (relance factures impayées)
Porteo.Tests        → tests xUnit (service Missions — 5 tests)
```

### Frontend — `crossone.porteo.web.manager` (Angular 19, modulaire)

```
src/app/
  core/      auth.service, guards (auth/login/role), interceptors (jwt + error),
             services (token, theme), bootstrap NgRx
  public/    module lazy : login (Reactive Forms, 2 colonnes éditorial)
  private/   module lazy :
    http/      ApiService (façade) + 1 service API par domaine
    store/     NgRx feature « missions » (actions, reducer entity, effects, selectors)
    components/ layout (sidebar role-aware + topbar), dashboard-index,
                missions (list + popup modale), clients (list + fiche 1‑N + popup),
                consultants (list + fiche + popup), factures (list + popup), settings
  shared/    shared.module, models, validators, components (status-badge, empty-state,
             confirm-dialog, charts SVG : donut / bar-list / area)
  styles/    _tokens.scss (palette émeraude + 5 palettes + dark), _base.scss (thème/composants)
```

### Stack technique
- **Back** : ASP.NET Core 8, EF Core (écriture) + Dapper (lectures dashboard), AutoMapper, JWT Bearer, Swagger, Serilog, Quartz, PostgreSQL (Npgsql).
- **Front** : Angular 19 + Angular Material/CDK (MatDialog), NgRx (store/effects/entity), ngx-toastr, jwt-decode, graphiques SVG maison.

---

## ✅ Mapping « exigence de l'énoncé → où c'est implémenté »

| Exigence | Implémentation |
|---|---|
| **Architecture Angular modulaire** | `core/` · `public/` (lazy) · `private/` (lazy) · `shared/` — modules, composants, services (1 dossier/composant) |
| **Communication Front/Back REST** | `private/http/*` (Angular `HttpClient`) ↔ Controllers `Porteo.Api/Controllers/*` |
| **Utilisateurs + rôles + contrôle d'accès** | JWT (`AuthController`, `UserService.CreateToken`) ; rôles `Admin`/`User` ; **guards** `auth/login/role.guard.ts` ; **filtres** `[Authorize(Roles=…)]` + `DataOwnershipProtectionFilter` |
| **≥ 1 CRUD complet** | **Missions** : `GET/POST/PUT/DELETE /api/missions` ↔ `missions-list` + `mission-popup` (NgRx) |
| **Relation entre 2 tables visualisée** | **Client (1) — (N) Mission** : `ClientsController.GetById` (avec missions) ↔ **fiche client** `client-detail` (tableau « Missions du client » + filtre) |
| **Formulaires + modale** | `mission-popup` (et client/consultant/facture) : **MatDialog** + **Reactive Forms** + validations + messages FR + toast « Formulaire incomplet » |
| **Dashboards de visualisation** | `DashboardController` (Dapper) ↔ `dashboard-index` : KPIs, courbe CA/mois (area SVG), donut missions/statut, top 5 clients (barres), timeline |
| **Déploiement fonctionnel (Docker)** | `docker-compose.yml` : `postgres` (volume `porteo-pgdata`) + `api` + `web` (Nginx, proxy `/api`) |
| **Filtre d'appartenance (un consultant ne voit que ses missions)** | `ClaimsPrincipalExtensions.OwnerConsultantId` → filtré dans `MissionService.GetPaged/GetDto/...` (vérifié : consultant = 2 missions, admin = 10) |
| **Job Quartz réel** | `Porteo.Scheduler/SchedulerJobInvoiceRelance` (relance factures `emise` échues) — planifié dans `Program.cs` |
| **Migrations + seed** | `DbInitializer.SeedAsync` (au démarrage) + `Porteo.Api/Migrations` |
| **Tests** | `Porteo.Tests/MissionServiceTests` (5 tests : pagination, ownership, filtre statut, création/montant, validation dates) |
| **Design system** | `tokens.css` traduit en `_tokens.scss` (palette émeraude exacte, 5 palettes, dark mode, typo Newsreader/Hanken Grotesk/JetBrains Mono) ; badges de statut, tableaux, modales, états vides, skeletons |

---

## 🧩 Endpoints REST

| Domaine | Endpoints |
|---|---|
| Auth | `POST /api/auth/login` · `GET /api/auth/me` |
| Missions | `GET /api/missions` (paginé + filtres + tri) · `GET/POST/PUT/DELETE /api/missions/{id}` |
| Clients | `GET /api/clients` · `GET /api/clients/{id}` (avec ses missions) · `POST/PUT/DELETE` |
| Consultants | `GET /api/consultants` · `GET /api/consultants/{id}` · `POST/PUT/DELETE` |
| Factures | `GET /api/factures` · `GET/POST/PUT/DELETE/{id}` · `POST /api/factures/{id}/mark-paid` |
| Dashboard | `GET /api/dashboard` (adapté au rôle) · `GET /api/dashboard/admin` |

Sécurité : `[Authorize]` partout ; gestion clients/consultants réservée `Admin` ; le consultant n'accède qu'à ses missions/factures.

---

## 🛠️ Développement local (sans Docker)

**Backend** (PostgreSQL local requis — `Host=localhost;Port=5432;Database=porteo;Username=postgres;Password=root`) :
```bash
cd crossone.porteo.erp
dotnet run --project Porteo.Api          # http://localhost:5080 (+ /swagger)
dotnet test                              # 5 tests
```

**Frontend** :
```bash
cd crossone.porteo.web.manager
npm install
npm start                                # http://localhost:4200 (proxy vers http://localhost:5080/api)
```
> En dev, `src/environments/environment.ts` pointe sur `http://localhost:5080/api/`. En build de prod, `environment.prod.ts` utilise `/api/` (servi par Nginx).

---

## ⚙️ Choix d'arbitrage signalés
- **.NET 8** (la référence vise .NET 6/8) et **Angular 19 en mode NgModule** (toolchain locale Node 22 / CLI 19) — l'architecture modulaire de la référence est conservée à l'identique.
- **Graphiques SVG maison** (donut/area/barres) plutôt qu'une dépendance lourde — le README de design autorise « SVG ou ngx-charts ».
- **Base dédiée `porteo`** (au lieu de `beenext_files`).
- Le port front hôte est **8090** (le 4200 peut être occupé par un autre serveur de dev).
