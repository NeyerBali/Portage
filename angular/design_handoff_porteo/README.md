# Handoff — Portéo · Système de design & application de portage salarial

> **Pour le développeur (Claude Code).** Ce dossier contient des **références de design réalisées en HTML/CSS/React** (prototypes montrant l'apparence et le comportement visés). Ce **ne sont pas** des fichiers de production à copier tels quels. Votre mission : **recréer fidèlement ces designs dans le codebase cible** — ici **Angular 16 + Angular Material + CDK** — en suivant les bonnes pratiques Angular (composants réutilisables, thème Material custom, SCSS tokens, table générique via CDK/MatTable). Le rendu doit être **pixel-perfect** (voir « Fidélité »).

---

## 1. Vue d'ensemble

**Portéo** est une plateforme web SaaS de **gestion de consultants et de missions en portage salarial**. Deux profils :
- **Administrateur** : gère tout (missions, clients, consultants, factures, dashboards globaux, paramètres).
- **Consultant** : accès restreint à **ses propres** missions, son CA, ses factures, son profil.

Le livrable couvre : zone d'authentification, layout applicatif (sidebar + topbar + breadcrumb), dashboards (admin & consultant), CRUD complet des missions, modules Clients / Consultants / Factures, profil & paramètres, une bibliothèque de composants transverses (boutons, champs, badges, popups, toasts, tableaux, états vides, skeletons), un système de **palettes de couleurs interchangeables**, un thème **clair / sombre**, et un **site vitrine** marketing.

---

## 2. Fidélité : **HAUTE FIDÉLITÉ (hi-fi)**

Couleurs, typographie, espacements, rayons, ombres et interactions sont **définitifs**. Reproduisez-les exactement. Tous les nombres ci-dessous sont des valeurs réelles à reporter dans le thème SCSS.

---

## 3. Direction artistique

**Fintech éditorial** : beaucoup de blanc, une **serif éditoriale** en titres, un **vert émeraude profond** comme couleur primaire, une **mint vive** comme accent. Sobre, premium, lisible.

- **Logo / wordmark** : « Portéo » en serif (Newsreader 600). Monogramme = un **P** dont la panse forme un arc ascendant + un point (rappel de l'accent aigu). Le glyphe utilise la couleur d'**accent** ; le fond de la pastille utilise la couleur **primaire**. Voir le SVG inline dans `design-reference/jsx/layout.jsx` (composant Sidebar) — `viewBox 0 0 24 24`, path `M6 19V7.5C6 6.4 6.9 5.5 8 5.5h5.2c3 0 5.3 2.2 5.3 5s-2.3 5-5.3 5H10` + cercle `cx9.6 cy18.6 r1.7`.

---

## 4. Design tokens

> Source de vérité : `design-reference/tokens.css`. À traduire en variables SCSS + thème Material. Reproduits ici intégralement.

### 4.1 Couleur de marque — échelle « Émeraude » (palette par défaut)
| Token | Hex | Usage |
|---|---|---|
| emerald-50 | `#EEFBF4` | fonds très clairs |
| emerald-100 | `#D4F5E3` | |
| emerald-200 | `#A8ECC9` | |
| emerald-300 | `#74DFAC` | bordure de marque (clair) |
| emerald-400 | `#3DDC97` | **accent vif / mint** |
| emerald-500 | `#23B584` | |
| emerald-600 | `#169070` | liens (dark), survols |
| emerald-700 | `#0E5C4A` | **PRIMAIRE** (boutons, liens en clair) |
| emerald-800 | `#0B4538` | primaire survol |
| emerald-900 | `#093528` | primaire actif |
| emerald-950 | `#06241C` | texte sur accent |

### 4.2 Neutres — échelle « Encre » (sous-ton vert très léger)
`ink-0 #FCFDFC` (papier) · `50 #F6F8F7` · `100 #EDF1EF` · `200 #DEE4E1` · `300 #C6CFCA` · `400 #9BA8A1` · `500 #76847C` · `600 #586860` · `700 #3C4843` · `800 #243029` · `900 #16201C` · `950 #0D1512`.

### 4.3 Couleurs sémantiques
| Rôle | 50 (fond) | 500 | 600 | 700 |
|---|---|---|---|---|
| Succès | `#E7F7EE` | `#15A66A` | `#0F8755` | `#0B6843` |
| Avertissement | `#FCF3E2` | `#E29215` | `#BD7708` | `#8F5A05` |
| Erreur | `#FBEBE9` | `#D8483B` | `#B5392E` | `#8E2C23` |
| Info | `#E8F0FE` | `#2D7FF9` | `#1E63D0` | `#1A4FA3` |

### 4.4 Hues de statut (badges)
`brouillon #64748B` · `en cours #2D7FF9` · `terminée #15A66A` · `facturée #8B5CF6` · `annulée #B0443A`.

### 4.5 Surfaces sémantiques — **CLAIR**
`bg-app #F6F8F7` · `bg-surface #FCFDFC` · `bg-surface-2 #FFFFFF` · `bg-sunken #EDF1EF` · `bg-inverse #0D1512` · `bg-brand-soft #EEFBF4`.
Texte : `text-strong #16201C` · `text-default #243029` · `text-muted #586860` · `text-subtle #76847C` · `text-onbrand #FCFDFC` · `text-onaccent #06241C`.
Bordures : `border-subtle #EDF1EF` · `border-default #DEE4E1` · `border-strong #C6CFCA` · `border-brand #74DFAC`.
Scrim modale : `rgba(13,21,18,0.46)`.

### 4.6 Surfaces sémantiques — **SOMBRE** (`[data-theme="dark"]`)
`bg-app #0B1310` · `bg-surface #111B17` · `bg-surface-2 #16231D` · `bg-sunken #0B1310` · `bg-inverse #EEFBF4` · `bg-brand-soft #0E2A21`.
Texte : `strong #F1F6F3` · `default #DDE7E1` · `muted #9BAEA4` · `subtle #758A7F`.
Bordures : `subtle #1B2A23` · `default #24362D` · `strong #324A3E` · `brand #169070`.
En sombre, **primaire = emerald-400**, survol = 300, actif = 200 (l'inverse du clair). Scrim : `rgba(0,0,0,0.6)`.

### 4.7 Typographie
- **Titres / chiffres-clés** : `Newsreader` (Google Fonts, serif éditoriale, axe optique 6–72), poids 400/500/600 + italique.
- **UI & texte** : `Hanken Grotesk` (Google Fonts), 400–800.
- **Données / montants / IDs** : `JetBrains Mono`, 400/500/600 (chiffres tabulaires).

Échelle (taille / interligne) : display 56/60 (Newsreader 500) · H1 42/48 (Newsreader 500) · H2 32/40 (Newsreader 500) · H3 25/32 (Hanken 600) · H4 20/28 (Hanken 600) · H5 17/24 · corps-lg 16/26 · corps 15/23 · sm 13.5/20 · caption 12.5/16 · overline 11.5/14 (mono, uppercase, letter-spacing 0.18em).
Titres : letter-spacing négatif (-0.02em à -0.01em).

### 4.8 Espacement (base 4) 
`sp-1 4` · `2 8` · `3 12` · `4 16` · `5 20` · `6 24` · `7 32` · `8 40` · `9 48` · `10 64` · `11 80` · `12 96` (px).

### 4.9 Rayons
`xs 4` · `sm 7` · `md 10` · `lg 14` · `xl 20` · `2xl 28` · `pill 999` (px).

### 4.10 Ombres (douces, jamais dures)
- xs `0 1px 2px rgba(13,21,18,.05)`
- sm `0 1px 3px rgba(13,21,18,.07), 0 1px 2px rgba(13,21,18,.04)`
- md `0 4px 12px rgba(13,21,18,.08), 0 2px 4px rgba(13,21,18,.04)`
- lg `0 12px 28px rgba(13,21,18,.12), 0 4px 10px rgba(13,21,18,.06)`
- xl `0 24px 56px rgba(13,21,18,.18), 0 8px 18px rgba(13,21,18,.08)`
- brand `0 8px 24px rgba(14,92,74,.22)`
(En sombre, ombres plus opaques sur noir — voir tokens.css.)

### 4.11 Transitions & focus
Easing `cubic-bezier(.22,.61,.36,1)` (standard) / `cubic-bezier(.16,1,.3,1)` (out). Durées : fast 130ms, base 200ms, slow 320ms.
**Anneau de focus** (accessibilité AA, à mettre sur tous les éléments focusables) : `box-shadow: 0 0 0 3px rgba(61,220,151,.45)` ; version erreur `0 0 0 3px rgba(216,72,59,.32)`.

### 4.12 Layout
Sidebar : 256px (repliée 76px). Topbar : 64px.

---

## 5. Système de palettes interchangeables (important)

Toute l'identité couleur dérive de **deux variables logiques** : l'échelle de marque (`emerald-*`) et l'**accent**. Changer de palette = redéfinir ces variables. Implémenté via un attribut `data-palette` sur la racine (voir blocs `[data-palette="…"]` dans `tokens.css`).

5 palettes (chaque entrée = **primaire (700)** / **accent**) :
| Clé | Nom | Primaire | Accent |
|---|---|---|---|
| emerald | Émeraude | `#0E5C4A` | `#3DDC97` |
| gold | Or & Blanc | `#5E430B` | `#F2B807` |
| azur | Bleu ciel & Jaune | `#134A8C` | `#F5C518` |
| violet | Améthyste | `#46199A` | `#8B5CF6` |
| coral | Corail | `#88271A` | `#FF8A3D` |

Chaque palette redéfinit l'échelle complète `emerald-50…950`, `--accent`, `--bg-brand-soft`, `--border-brand` et `--ring` (valeurs exactes dans `tokens.css`). Les couleurs **sémantiques** et de **statut** ne changent jamais (sens métier).

**Deux réglages distincts** persistés en `localStorage` :
- `porteo-palette` → palette de **l'application** (réglable par tout utilisateur dans Paramètres → Préférences).
- `porteo-vitrine-palette` → palette du **site vitrine** (réglable **uniquement par l'admin** dans Paramètres → Préférences → carte « Palette du site vitrine »).
- `porteo-theme` → `light` | `dark`.

**En Angular** : exposer un `ThemeService` qui pose `data-theme` et `data-palette` sur `<html>` et persiste en localStorage. Définir le thème Material avec des **CSS custom properties** (pas la palette SCSS figée) afin que le changement soit dynamique sans recompilation. Les composants Material (boutons, inputs, etc.) doivent piocher dans ces variables.

---

## 6. Modèle de données

> Données de démo réalistes dans `design-reference/jsx/data.jsx`. Relations : un **Client** a N **Missions** (1‑N) ; une **Mission** référence 1 Client + 1 Consultant ; une **Mission** a N **Factures**.

```
Consultant { id, name, role, email, phone, tjm:number, since:date, city, skills:string[], status:'active'|'paused' }
Client     { id, name, sector, siret, contact, email, city, since:date }
Mission    { id, title, client:ClientId, consultant:ConsultantId,
             status:'draft'|'progress'|'done'|'invoiced'|'canceled',
             start:date, end:date, tjm:number, days:number, amount:number }  // amount = tjm*days
Invoice    { id, mission:MissionId, client:ClientId, amount:number,
             issued:date, due:date, status:'draft'|'issued'|'paid'|'overdue' }
```

**Libellés FR des statuts mission** : draft=Brouillon, progress=En cours, done=Terminée, invoiced=Facturée, canceled=Annulée.
**Statuts facture** : draft=Brouillon, issued=Émise, paid=Payée, overdue=En retard.
Formats : montants `fr-FR` 2 décimales + ` €` (espace insécable) ; dates `fr-FR` jour/mois court/année ; IDs en mono (`MIS-2026-0142`, `FAC-2026-0231`, `CL-01`, `C-01`).

---

## 7. Bibliothèque de composants (référence : `Composants Portéo.html` + `jsx/ui.jsx`)

Recréez chacun comme composant Angular réutilisable. Mapping Material conseillé entre parenthèses.

- **Boutons** (`MatButton` custom) — variantes : `primary` (fond primaire, texte onbrand), `secondary` (fond surface, bordure default), `ghost` (transparent), `destructive` (fond erreur-500, texte blanc), `icon` (38×38). Tailles sm/normal/lg. Padding normal `11px 18px`, radius `sm (7px)`, poids 600. Focus = anneau. Désactivé = opacity .5.
- **Badges de statut** (chip) — pastille + libellé, couleur = hue de statut, fond = hue@10‑12%, bordure = hue@25‑28%, radius pill, poids 600, taille caption. Composant `StatusBadge(status)` et `InvoiceBadge(status)`.
- **Avatar** — initiales sur fond dérivé d'un hash du nom (palette de 8 couleurs, voir `avatarColor` dans data.jsx). Rond.
- **Champs** (`MatFormField` custom) — input/select/textarea : bordure default, radius sm, padding `10px 13px`, focus = bordure brand + anneau ; erreur = bordure erreur + anneau erreur + message sous le champ (icône alerte + texte erreur-600). Icône en tête optionnelle (padding-left 40). Select avec chevron SVG custom. **Toggle** (switch 42×24, ON = emerald-600). **Checkbox** (18×18, radius 5, ON = emerald-600 + check blanc). **Segmented control** (fond sunken, item actif = surface + ombre sm).
- **Tabs** — soulignement 2px sous l'onglet actif (couleur primaire), compteur mono optionnel.
- **Filter chips** — togglables ; état actif = fond brand-soft + bordure brand + texte primaire + check.
- **Tableau** (`MatTable` + `MatSort` + `MatPaginator`) — en-têtes uppercase caption text-subtle, **tri par colonne** (chevron, colonne triée = couleur primaire), lignes hover = fond sunken, **actions de ligne** (voir/éditer/supprimer) révélées au hover (opacity 0→1), cellules montant en mono alignées à droite, cellule « personne » = avatar + nom + sous-titre. **Pagination** : info « x–y sur N », boutons page (actif = fond primaire texte blanc), prev/next désactivés aux bornes.
- **Cartes** — surface, bordure default, radius lg, ombre sm ; en-tête optionnel (titre H5 + sous-titre + zone d'action).
- **Modale** (`MatDialog`) — scrim flou, carte radius xl, ombre xl, animation d'apparition (fade + translateY + scale, slow). En-tête = icône tonale (44–46px, fond sémantique@50) + titre Newsreader + sous-titre + bouton fermer. Pied à droite (Annuler ghost + action primaire). Tailles sm/normal/lg (max-width 440/560/720). Fermeture sur Échap + clic scrim.
- **Dialogue générique** `Dialog` — confirmation / suppression (destructive, icône corbeille tonale erreur) / générique (info) / erreur. Bouton de confirmation `primary` ou `destructive`.
- **Toasts** (service + `MatSnackBar` custom ou overlay maison) — 4 tonalités succès/info/avertissement/erreur, barre latérale colorée 4px, icône, titre + message, bouton fermer, auto‑dismiss ~4.8s, empilés en bas à droite, animation d'entrée (slide depuis la droite).
- **État vide** (`EmptyState`) — illustration = cercle brand-soft + cercle pointillé bordure brand + icône centrale ; titre Newsreader + message + action optionnelle.
- **Skeleton** — dégradé animé (shimmer 1.4s) ; utilisé pour lignes de tableau et cartes en chargement.
- **Timeline** — points reliés par une ligne verticale ; chaque item = pastille icône brand-soft + titre + description + meta.
- **Breadcrumb** — segments séparés par chevrons ; segments cliquables (hover primaire), dernier en gras.

---

## 8. Écrans

> Détail visuel précis dans les fichiers HTML. Recréez chaque écran comme route/feature Angular.

### Zone publique (auth) — `jsx/screens-auth.jsx`
Layout en 2 colonnes : à gauche un **panneau éditorial sombre** (`#0D1512`) avec dégradés radiaux mint, wordmark, slogan serif et 3 stats ; à droite le formulaire centré (max 400px). Le panneau gauche est masqué < 1080px.
1. **Login** — email + mot de passe (œil afficher/masquer), « Se souvenir », lien « Mot de passe oublié ». Validation (email requis+format, mdp requis). Sur succès → écran 2FA. Lien « Première connexion → Définir mon mot de passe ».
2. **2FA** — 6 cases OTP (auto-focus suivant, retour arrière intelligent), bouton Vérifier, renvoi de code (timer), retour. Sur validation → connecté.
3. **Mot de passe oublié** — saisie email → écran « vérifiez vos mails » (lien simulé → réinitialisation).
4. **Réinitialisation / Première connexion** — nouveau mdp + confirmation, **jauge de robustesse** (4 segments : Faible/Moyen/Bon/Robuste selon longueur, majuscule, chiffre, spécial), validation de correspondance.

### Layout applicatif — `jsx/layout.jsx`
- **Sidebar** (sticky, repliable) : marque, **carte de rôle** (avatar + nom + « Administrateur »/« Consultant »), navigation groupée par sections, item actif = fond brand-soft + barre latérale 3px + texte primaire, badge compteur (ex. Factures « 3 »), bouton « Replier le menu » (passe en 76px, libellés masqués). **Menu différent selon le rôle** (voir §9).
- **Topbar** (sticky, fond translucide flou) : barre de recherche (⌘K), **bascule de rôle** Admin/Consultant (segmented), bouton thème clair/sombre, cloche notifications (point rouge), menu utilisateur (avatar + nom + rôle → dropdown : Profil, Paramètres, Aide, Déconnexion).
- **Panneau notifications** : overlay sous la cloche, liste typée (erreur/info/succès/avertissement) avec icône colorée, titre, détail, horodatage.
- **Breadcrumb** en haut de chaque page.

### Dashboards — `jsx/screens-dashboard.jsx` + `jsx/charts.jsx`
- **Admin** : 4 **KPIs** (CA total, missions actives, consultants, factures impayées) avec icône tonale, valeur Newsreader, delta coloré (↑ succès / ↓ erreur) + mini **sparkline**. Puis : **courbe de CA** (aire, 12 mois, dégradé accent, tooltip au survol), **donut** missions par statut (segments = hues de statut, centre = total/segment au survol), **top 5 clients** (barres horizontales dégradé primaire), **dernières activités** (timeline).
- **Consultant** : bandeau d'alerte « CRA à compléter » (warning), 3 KPIs (missions en cours, mon CA, jours facturés), tableau « Mes missions ».

### CRUD Missions (cœur) — `jsx/screens-missions.jsx` + `jsx/screens-mission-detail.jsx`
- **Liste** : barre d'outils = recherche plein-texte + segmented de statut rapide + bouton « Filtres » (badge du nombre de filtres actifs). Panneau filtres dépliable : Statut, Client, Consultant, Démarrage après/avant (dates) + Réinitialiser. **Tri** sur Mission/Client/Consultant/Période/Statut/Montant. **Sélection multiple** (checkbox d'en-tête + barre d'actions groupées : Exporter, Supprimer). **Pagination** 8/page. **Skeleton** au chargement (~650ms simulé). **État vide** différencié (aucun résultat de filtre vs aucune donnée). Actions de ligne : voir / éditer / supprimer. Côté **consultant**, colonnes Client/Consultant et création masquées ; ne voit que ses missions.
- **Détail** : en-tête (ID mono + badge statut + titre + client·consultant + actions Modifier/Supprimer). Onglets **Informations** (liste descriptive), **Factures** (mini-tableau ou état vide), **Historique** (timeline). Colonne latérale : carte **Facturation** (barre de progression facturé/total), carte **Client** (cliquable → fiche), carte **Consultant** (cliquable → fiche).
- **Création / Édition** : **modale** (taille lg) — champs Intitulé*, Client* (select), Consultant* (select), Date début*, Date fin*, TJM* (number), Jours* (number), Statut ; **aperçu du montant total** calculé en direct (tjm×jours). Validation (voir §10). Toast succès à l'enregistrement.
- **Suppression** : dialogue destructif de confirmation (simple ou en lot). Si suppression depuis le détail → retour à la liste.

### Clients — `jsx/screens-clients.jsx`
- **Liste** : recherche, tableau (Client avec icône bâtiment + SIRET mono, Secteur, Ville, **pastille « N missions · M actives »**, CA cumulé). Bouton « Nouveau client ».
- **Fiche client** (visualise la relation **1‑N**) : en-tête (icône + nom + secteur·ville + Modifier + Nouvelle mission). 4 KPIs (missions totales, actives, CA cumulé, encours impayé). Colonne gauche = coordonnées (SIRET, contact, email, ville, depuis). Colonne droite = **« Missions du client »** avec **filtre segmented** (Toutes/En cours/Facturées/Terminées) et tableau des missions de ce client (→ détail mission). C'est la démonstration clé de la relation 1‑N.

### Consultants — `jsx/screens-consultants.jsx`
- **Liste** : recherche + **grille de cartes** (avatar, statut Actif/En pause, nom, métier·ville, chips compétences, TJM, « N missions · M actives »).
- **Fiche** : en-tête (avatar + nom + statut + métier·ville + Contacter[mailto] + Modifier). Colonne gauche = coordonnées + compétences + **taux d'occupation** (barre). Colonne droite = tableau « Missions assignées ».

### Factures — `jsx/screens-invoices.jsx`
- **Liste** : 3 KPIs (Encaissé / Émis en attente / En retard), recherche + segmented de statut, tableau (Facture mono, Mission, Client, Émise le, Échéance [rouge si en retard], statut, montant). Côté consultant : seulement ses factures, colonnes client/création masquées.
- **Détail** : en-tête (ID + badge + montant + client·échéance + PDF + « Marquer payée »). Tableau de prestation + **récap HT / TVA 20% / TTC**. Cartes latérales : Informations, Mission liée (→ détail), Client (→ fiche).

### Profil & Paramètres — `jsx/screens-settings.jsx`
Onglets **Profil** (photo + infos perso), **Préférences** (carte **Palette de couleurs** [app], carte **Palette du site vitrine** [admin only], carte **Apparence** [thème clair/sombre], carte **Notifications** [4 toggles]), **Sécurité** (mot de passe, 2FA toggle, zone sensible « Désactiver le compte » [admin]).

---

## 9. Rôles & permissions

`role ∈ {admin, consultant}`, basculable via la topbar (et déterminerait les droits réels côté back).
- **Admin** : menu = Tableau de bord, Missions, Clients, Consultants, Factures (badge 3), Paramètres. Accès création/édition/suppression partout. Voit toutes les données.
- **Consultant** : menu = Mon tableau de bord, Mes missions, Mes factures, Mon profil. **Filtré sur ses propres données** (dans la démo, consultant courant = `C-01` / Camille Rousseau). Pas de création de mission, pas de colonnes Client/Consultant, pas de gestion clients/consultants.

À l'implémentation : guards de routes + directives `*hasRole` + filtrage des requêtes côté API.

---

## 10. Validation des formulaires (règles exactes)

- **Mission** : Intitulé requis ; Client requis ; Consultant requis ; Début requis ; Fin requise et ≥ Début ; TJM number > 0 ; Jours number > 0. (Référence : `jsx/screens-missions.jsx`.)
- **Client** : Raison sociale requise ; Secteur requis ; Contact requis ; Email requis + format ; Ville requise ; SIRET optionnel. (`jsx/forms.jsx`)
- **Consultant** : Nom requis ; Métier requis ; Email requis + format ; TJM > 0 ; Ville requise ; Compétences = liste séparée par virgules ; Téléphone optionnel ; Statut. (`jsx/forms.jsx`)
- **Facture** : Mission requise (le client est déduit de la mission) ; Montant > 0 ; Date émission requise ; Échéance requise et ≥ émission ; Statut. (`jsx/forms.jsx`)
- **Login/2FA/Reset** : voir §8.

Messages d'erreur en FR sous le champ. Un toast d'erreur « Formulaire incomplet » accompagne les soumissions invalides sur la mission.

Recommandé : **Reactive Forms** Angular avec validators, et un composant `Field` enveloppant (label + requis + hint + erreur) reproduisant le style.

---

## 11. État & comportements

- Persistance localStorage : `porteo-theme`, `porteo-palette`, `porteo-vitrine-palette`, `porteo-authed`, `porteo-role`.
- Navigation interne par routeur (dans le proto, simple machine à états). En Angular → Angular Router avec routes `/auth/*`, `/dashboard`, `/missions`, `/missions/:id`, `/clients`, `/clients/:id`, `/consultants`, `/consultants/:id`, `/factures`, `/factures/:id`, `/parametres`.
- Création/édition/suppression mettent à jour les listes/fiches/dashboards en temps réel (dans le proto, mutation d'un store global + re-render — voir `FormsProvider` dans `jsx/forms.jsx`). En Angular → un **store** (services + RxJS `BehaviorSubject`, ou NgRx) par entité.
- Toasts via un **service** global.
- Modales via `MatDialog` ; une seule modale de formulaire ouverte à la fois.
- Animations d'entrée d'écran (fade + translate, ~320ms) ; **gardées derrière `prefers-reduced-motion`** et l'état de repos doit rester visible (ne jamais laisser un contenu bloqué en `opacity:0`).

---

## 12. Site vitrine — `Vitrine Portéo.html` + `vitrine.css`

Page marketing publique (responsive, nav collante, menu mobile burger). Sections : **hero** (titre serif + sous-texte + CTAs + fenêtre produit en perspective 3D avec cartes flottantes animées), barre de confiance (secteurs), **6 fonctionnalités**, double **aperçu produit** (table missions + dashboard donut), **3 étapes** de mise en route, **bande de stats** sombre à accents mint, **témoignage** éditorial, **3 formules tarifaires** (Essentiel/Croissance[populaire]/Entreprise), **CTA final** sombre, footer. CTAs → vers l'app. La palette suit `porteo-vitrine-palette` (lue dès le `<head>`, sans flash). Animations d'apparition au scroll via IntersectionObserver **avec filet de sécurité** (révèle tout après 2.5s si l'observer échoue) — à reproduire pour ne jamais masquer le contenu.

En Angular : page autonome (peut être un module à part, voire un projet/route publique) réutilisant le `ThemeService` pour `porteo-vitrine-palette`.

---

## 13. Accessibilité & responsive

- Contrastes visés **AA** ; **focus visibles** (anneau) sur tous les interactifs.
- `role`/`aria-*` sur switches, dialogues (`aria-modal`), groupes de boutons.
- Responsive : desktop prioritaire, mobile correct. Points de rupture clés : KPIs passent en 2 colonnes < 1080px ; auth mono-colonne < 1080px ; formulaires mono-colonne < 720px ; vitrine mono-colonne + burger < 980px.

---

## 14. Architecture Angular conseillée

```
src/app/
  core/            (services: theme, auth, toast, role guard, http)
  shared/
    ui/            (button, badge, field, input, select, toggle, checkbox,
                    segmented, tabs, card, modal, dialog, toast, empty-state,
                    skeleton, timeline, breadcrumb, status-badge, avatar)
    table/         (table générique CDK/MatTable: tri, filtres, pagination,
                    sélection, actions de ligne, slots de cellule)
    charts/        (revenue-area, donut, bar-list, sparkline — SVG ou ngx-charts)
  features/
    auth/          (login, two-fa, forgot, reset)
    dashboard/     (admin, consultant)
    missions/      (list, detail, form-dialog)
    clients/       (list, detail, form-dialog)
    consultants/   (list, detail, form-dialog)
    invoices/      (list, detail, form-dialog)
    settings/      (profil, prefs, securite)
  layout/          (sidebar, topbar, breadcrumb, notifications)
  styles/
    _tokens.scss   (traduire tokens.css en variables + CSS custom properties)
    _theme.scss    (thème Material custom basé sur les custom properties)
    _palettes.scss (les 5 palettes via [data-palette])
```
- **Thème Material** : construire un thème custom (mat.define-* ) mais router les couleurs vers des **CSS variables** pour permettre le switch palette/thème runtime.
- **Table générique** : un composant `<app-table [columns] [data] [sortable] [selectable]>` au-dessus de `MatTable`/`CdkTable` + `MatPaginator` + `MatSort`, avec templates de cellule projetés.
- **Polices** : importer Newsreader, Hanken Grotesk, JetBrains Mono (Google Fonts) ; mapper sur les rôles typographiques.

---

## 15. Fichiers de référence (dans `design-reference/`)

| Fichier | Contenu |
|---|---|
| `tokens.css` | **Tous les design tokens** (clair/sombre + 5 palettes). Source de vérité couleurs/typo/espacements/ombres. |
| `app.css` | Styles de tous les composants de l'app (boutons, champs, tableaux, modales, toasts, KPIs, sidebar, topbar, auth…). |
| `vitrine.css` | Styles du site vitrine. |
| `index.html` | Page d'accueil reliant les 4 livrables. |
| `Charte Portéo.html` | Présentation de la charte (logo, palette, typo, tokens) — utile pour voir les valeurs en contexte. |
| `Composants Portéo.html` | Bibliothèque vivante de tous les composants dans leurs états. |
| `App Portéo.html` | **L'application complète navigable** (point d'entrée ; charge les `jsx/*`). |
| `Vitrine Portéo.html` | Le site vitrine marketing. |
| `jsx/icons.jsx` | Jeu d'icônes (paths SVG 24px, stroke). |
| `jsx/data.jsx` | **Modèle de données + données de démo FR** + helpers de formatage. |
| `jsx/ui.jsx` | Primitives UI (Avatar, Btn, badges, Field, Input, Modal, Dialog, Toasts, EmptyState, Skeleton…). |
| `jsx/charts.jsx` | Graphiques SVG (courbe d'aire, donut, barres, sparkline). |
| `jsx/layout.jsx` | Sidebar, Topbar, Breadcrumb + menus par rôle. |
| `jsx/forms.jsx` | **Formulaires Client/Consultant/Facture** + provider de données + règles de validation. |
| `jsx/screens-*.jsx` | Chaque écran (auth, dashboard, missions, mission-detail, clients, consultants, invoices, settings). |
| `jsx/main.jsx` | Routeur/état global + branchements. |

### Comment lancer les références
Ouvrir `App Portéo.html` (ou `index.html`) dans un navigateur. Connexion : saisir n'importe quel email + mot de passe → 2FA : saisir 6 chiffres quelconques. La bascule de rôle est en haut à droite. Les palettes et thème sont dans Paramètres → Préférences.

---

## 16. Checklist d'implémentation
- [ ] Tokens SCSS + CSS custom properties (clair/sombre)
- [ ] 5 palettes via `data-palette` + ThemeService (persistance localStorage)
- [ ] Thème Material custom routé sur les variables
- [ ] Polices Google (Newsreader, Hanken Grotesk, JetBrains Mono)
- [ ] Bibliothèque de composants `shared/ui`
- [ ] Composant **table générique** (tri/filtres/pagination/sélection/actions)
- [ ] Graphiques (courbe, donut, barres, sparkline)
- [ ] Layout (sidebar repliable, topbar, breadcrumb, notifications, menus par rôle)
- [ ] Auth (login, 2FA, forgot, reset) + jauge de robustesse
- [ ] Dashboards admin & consultant
- [ ] CRUD Missions (liste avancée + détail + modale + suppression)
- [ ] Clients (liste + fiche 1‑N) / Consultants (liste + fiche) / Factures (liste + détail HT/TVA/TTC)
- [ ] Profil & Paramètres (palettes app + vitrine[admin] + thème + notifications + sécurité)
- [ ] Toasts (4 tonalités) + dialogues (confirmation/destructif/générique/erreur)
- [ ] États vides + skeletons
- [ ] Gestion des rôles (guards + filtrage données)
- [ ] Site vitrine
- [ ] Responsive + accessibilité AA + focus visibles
