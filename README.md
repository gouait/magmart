# Site web Magmart

Site statique (HTML, CSS, JS, sans dépendance). Toutes les pages sont **générées** par `_build/build.py`. Ne modifiez pas les fichiers `.html` à la main : modifiez les sources dans `_build/`, puis relancez le script.

```
python _build/build.py        (depuis le dossier 03_Site_Web)
```

L'audit, les principes de la refonte et le résultat des revues sont décrits dans [AUDIT_ET_REFONTE.md](AUDIT_ET_REFONTE.md).

## Architecture

| Page | Rôle |
|---|---|
| `index.html` | Accueil : promesse, « Où en êtes-vous ? » (5 stades), comment ça marche, Simuler mon projet, pourquoi Magmart, formules, FAQ |
| `offre.html` | Offre & tarifs par stade, formules, méthode et paiement, abonnements de suivi, options, modules, détail des 11 services |
| `mre.html` | Investir depuis l'étranger |
| `a-propos.html` | Origine, valeurs, modèles internationaux observés, réseau |
| `contact.html` | Diagnostic offert, pré-rempli depuis « Simuler mon projet », envoi sur WhatsApp |
| `franchise-ou-enseigne.html` | Comparatif pour le référencement |
| `mentions-legales.html` | Mentions et données personnelles (**à compléter**) |
| `projet.html` | **Simuler mon projet** : avancement des étapes, chiffres clés, envoi unique du dossier |
| `demarrer.html` | Étape 1 · Profil : stade, local, magasin, puis recommandation |
| `simulateur.html` | Étape 2 · Budget d'ouverture |
| `planificateur.html` | Étape 3 · Plan & rayons (Studio 2D, coupe, planogramme), facultative |
| `exploitation.html` | Étape 4 · Rentabilité sur 3 ans, 3 scénarios |
| `dossier.html` | Étape 5 · Dossier de financement imprimable |

Les étapes partagent les réponses du visiteur dans son navigateur (`localStorage` : `magmart-projet`, `magmart-plan`, `magmart-exploitation`). Une étape n'est enregistrée et cochée qu'après une action du visiteur. Le bouton « Effacer mes données » de « Simuler mon projet » vide ces clés.

## Sources (`_build/`)

| Fichier | Contenu |
|---|---|
| `tarifs.py` | **Source unique** des stades, formules, abonnements, modes, options et modules. Génère aussi `assets/js/tarifs.js` |
| `layout.py` | Gabarits : `<head>`, en-tête, pied de page, icônes SVG, barre d'étapes, navigation entre étapes, typographie française automatique (`typo`) |
| `pages_site.py` | Pages éditoriales et page Simuler mon projet |
| `pages_outils.py` | Profil, Budget, Plan & rayons |
| `page_exploitation.py`, `page_dossier.py` | Rentabilité, Financement |
| `services.py` | Détail des 11 services |

## Scripts (`assets/js/`)

| Fichier | Rôle |
|---|---|
| `main.js` | Commun : mémoire du projet, estimation du budget (`SIM`), barre d'étapes, simulateur, contact |
| `onboarding.js` | Recommandation selon le stade ; honoraires plafonnés à 8 % (6 % au-delà de 3 M), sans descendre sous le minimum |
| `planner.js` | Studio 2D : plan, zones, mobilier (`CATALOG`), coupe, planogramme (`FAMILLES`, `PG`, `autoPlanogram`) |
| `studio3d.js` | Vue 3D du Studio (Three.js 0.160 via CDN, chargé à la demande) : murs, façade, mobilier paramétrique, produits du planogramme, vue d'ensemble et visite à hauteur d'homme |
| `exploitation.js` | Prévisionnel sur 36 mois (`GROUPES`, `FORMAT_ADJ`, `SCENARIOS`) |
| `dossier.js` | Plan de financement équilibré, échéancier, ratios, pièces |
| `hub.js` | Simuler mon projet |

## Styles
- `assets/css/style.css` : système de design (jetons de couleurs, tailles et espacements, boutons, cartes, champs, tableaux) et pages éditoriales.
- `assets/css/outils.css` : Simuler mon projet.

Règle des couleurs : le corail est réservé à **une seule action principale par écran**.

## À compléter avant la mise en ligne
1. **Numéro WhatsApp Business** : constante `WHATSAPP` dans `assets/js/main.js` (actuellement fictif).
2. **Mentions légales** : raison sociale, capital, siège, RC, ICE, IF, directeur de la publication, hébergeur, déclaration CNDP (`_build/pages_site.py`, bloc `MENTIONS`).
3. **Preuves** : cas Korbi documenté, photos réelles et lumineuses, nom et photo du fondateur. Prévoir ensuite une page Réalisations.
4. **Domaine** : les balises `canonical` et `og:image` supposent `https://www.magmart.ma/`. À ajuster dans `_build/layout.py`.
5. **CRM** : brancher les envois sur un CRM (Odoo, HubSpot, Brevo) en plus de WhatsApp.
6. **Hypothèses chiffrées** : recaler `SIM` (main.js) et `GROUPES` (exploitation.js) sur les premiers projets réels.
