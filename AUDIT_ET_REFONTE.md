# Audit critique et refonte du site Magmart

*Novembre 2026. Deux audits indépendants ont été menés : l'un sur l'UX et l'architecture de l'information, l'autre sur l'UI et l'accessibilité (WCAG 2.2 AA). Ce document en fait la synthèse et décrit la refonte qui en découle.*

## 1. Diagnostic

> Le site ressemblait à une plaquette commerciale complète flanquée de quatre outils autonomes, et non à un parcours de conversion. Chaque composant était propre, mais rien ne les reliait.

### Bloquant
| # | Constat | Preuve |
|---|---|---|
| B1 | **Aucune entrée selon le stade du projet** (idée → local → modernisation → magasin ouvert → multi-sites) | 3 profils sur l'accueil, 5 dans le parcours, 5 autres dans le contact. Aucun parcours pour « mon magasin est déjà ouvert ». |
| B2 | **La recommandation contredisait les tarifs** | Hanout+ était proposé pour une création sur un local brut. Des honoraires de 49 000 MAD s'affichaient alors que l'offre annonçait « dès 65 000 ». |
| B3 | **Aucune preuve** | Pas de réalisation, pas de photo réelle, pas d'équipe ni d'adresse. Numéro WhatsApp fictif. |

### Majeur
- **Surcharge tarifaire avant tout contact** : 4 formules, 3 modes, 6 options, 3 abonnements, 11 modules, plus une option performance.
- **Incohérences** :
  - « 13 services » annoncés pour 11 décrits ;
  - prix d'options différents entre l'offre et le parcours ;
  - un même outil sous 3 ou 4 noms différents.
- **4 outils en concurrence** au lieu d'un entonnoir. Chacun envoyait son propre message WhatsApp.
- **Contexte perdu au contact** : le paramètre `?pack=` était ignoré et le formulaire n'était pas pré-rempli.
- **Accueil de 13 à 14 sections, environ 10 500 px**, avec trois blocs redondants (phases, jalons, engagements).
- **Pages outils** : en-tête de 400 px, l'outil commençait sous la ligne de flottaison.
- **Système visuel absent** :
  - 37 tailles de police, 7 variantes de cartes ;
  - le corail servait à la fois au bouton d'action, au décor et aux erreurs ;
  - des couleurs hors charte (bleu, violet, cyan) ;
  - 3 familles d'icônes (emojis, SVG, caractères).

### Accessibilité
| Problème | Mesure | Correction |
|---|---|---|
| Focus jaune sur blanc | 1,55:1 | Double anneau blanc + vert 700 |
| Bordure des champs | 1,23:1 | Bordure #8f9a94 (3:1) |
| Texte blanc sur vert #1e9e5a | 3,45:1 | Texte sur vert 700 uniquement (5,02:1) |
| Texte blanc sur le vert WhatsApp | 3,49:1 | Boutons WhatsApp en vert 700 |
| Saut de niveau H1 → H3 dans les outils, groupes de choix sans `fieldset` | — | Hiérarchie de titres corrigée, `fieldset`/`legend` partout |

## 2. Principes de la refonte

1. **Une question d'entrée : « Où en êtes-vous ? »** Cinq stades, la même question sur l'accueil et dans le parcours.
2. **Un seul parcours d'outils, l'Espace projet.**
   - Les étapes s'enchaînent : Profil → Budget → Plan & rayons (facultatif) → Rentabilité → Financement → Synthèse.
   - Une barre d'étapes commune affiche la progression.
   - Un **seul envoi** du dossier complet.
3. **Un seul bouton d'action par écran.** Le corail est réservé à cette action ; le reste est en vert ou neutre.
4. **Une seule source pour les prix** (`_build/tarifs.py`), qui alimente à la fois les pages et le parcours.
5. **Les pages éditoriales vendent, les pages outils travaillent.** Les premières ont un hero ; les secondes un en-tête compact de type application.
6. **Ne rien inventer.** Les preuves réelles (cas Korbi, photos, équipe) restent à fournir.

## 3. Nouvelle architecture

```
Accueil ─────────────┬─ Offre & tarifs (par stade, formules, modes, abonnements, détails dépliables)
                     ├─ Espace projet (synthèse et reprise)
                     │    1 Profil · 2 Budget · 3 Plan & rayons · 4 Rentabilité · 5 Financement
                     ├─ Investir depuis l'étranger (MRE)
                     ├─ À propos (fondateur, méthode, engagements, références internationales)
                     └─ Contact / diagnostic offert (pré-rempli)
Pied de page : Franchise ou enseigne propre · Mentions légales et confidentialité
```

**Menu** : Offre & tarifs · Espace projet · Investir depuis l'étranger · À propos · Contact · **[Démarrer mon projet]**

**Accueil, réduit à 7 sections** :
1. Hero avec un visuel unique
2. « Où en êtes-vous ? »
3. Comment ça marche, en 3 temps
4. L'Espace projet
5. Pourquoi Magmart
6. Formules
7. FAQ et appel final

## 4. Système de design

| Élément | Règle |
|---|---|
| **Typographie** | 7 tailles, de 13 à 56 px, rapport 1,25. Lignes de 66 caractères au plus. Chiffres tabulaires. |
| **Espacements** | Base 8. Sections de 56 à 88 px. |
| **Boutons** | 3 variantes : primary (corail, un seul par écran), secondary (vert 700), ghost (bordure 3:1). Hauteur 48 px, jamais sur deux lignes. |
| **Carte** | Un modèle unique : fond blanc, bordure 1 px, rayon 12 px, padding 24 px, ombre au survol si elle est cliquable. |
| **Champs** | Hauteur 44 px, bordure 3:1, unité intégrée, `fieldset` pour les groupes. |
| **Couleurs** | 70 % blanc et menthe, 20 % encre, 8 % vert, 2 % corail. Le corail ne signale jamais une erreur : l'erreur est #b42318. |
| **Studio 2D** | Mobilier dans les nuances de la palette : verts pour le sec, ardoise pour le froid, sable pour la réserve. |
| **Icônes** | Une seule famille SVG au trait, à la place des emojis. |

## 5. Restant à fournir par Magmart
- Le vrai numéro WhatsApp, l'adresse et l'e-mail.
- Les mentions légales : raison sociale, RC, ICE, siège.
- Le cas Korbi documenté et des photos réelles lumineuses, pour une page Réalisations.
- Le nom et la photo du fondateur pour la page À propos.

## 6. Revues après refonte et corrections apportées

Trois revues indépendantes ont été menées par des agents : revue de conception visuelle, QA technique et relecture des textes. Toutes leurs remarques bloquantes et majeures ont été corrigées.

| Revue | Principales corrections |
|---|---|
| Conception | Bouton d'en-tête des outils invisible ; hauteur de l'image d'accueil ; mise en page des tuiles et des étapes ; un seul bouton corail par écran ; envoi unique depuis l'Espace projet (boutons WhatsApp retirés des outils) ; case de consentement ; cartes de prix ; panneaux collants limités à la hauteur d'écran ; montants négatifs signés (−) ; étape facultative contournable (« Passer à Rentabilité ») ; plan vide qui indique quoi faire |
| QA technique | Prix d'abonnement arrondis à tort ; plafond d'honoraires au-delà de 3 M ; données écrasées entre étapes ; étapes cochées sur simple visite ; recommandation « idée » alignée sur l'Étude Décision ; plan de financement toujours équilibré ; avancée au clavier ; dates invalides ; hypothèses de rentabilité recalculées quand le projet change ; ratios sans objet ; titres et descriptions SEO ; `og:image` absolue |
| Relecture | Suppression de la facturation au % du CA (contraire au « 0 redevance ») ; plafond de 8 % précisé (minimum par formule) ; délais nuancés (« en général ») ; pas de « banques partenaires » ni de marques tierces citées ; suivi à distance présenté comme une option ; vocabulaire unifié (Espace projet, abonnements de suivi, mode Délégué, diagnostic offert (1 h)) ; typographie française automatique |

**Vérifications finales**
- Parcours complet de l'accueil jusqu'au contact pré-rempli.
- 13 pages × 5 largeurs (320 à 1 440 px) sans débordement.
- Contrôles automatiques sans erreur : liens, identifiants HTML ↔ JS, accessibilité, SEO, validité.
- Règle des honoraires testée sur toute la plage de budgets.
