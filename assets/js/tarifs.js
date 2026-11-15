/* Généré par _build/build.py depuis _build/tarifs.py — ne pas modifier à la main. */
const TARIFS = {
 "STADES": [
  {
   "key": "idee",
   "titre": "J'ai une idée",
   "sous": "Pas encore de local",
   "icone": "💡",
   "besoin": "Valider le projet, le budget et le type de local à chercher.",
   "reponse": "Étude Décision",
   "pack": "decision"
  },
  {
   "key": "local",
   "titre": "J'ai un local",
   "sous": "En vue ou signé",
   "icone": "🔑",
   "besoin": "Concevoir le magasin, chiffrer les travaux et planifier l'ouverture.",
   "reponse": "Supérette clé en main ou Supermarché & multi-sites",
   "pack": "superette"
  },
  {
   "key": "moderniser",
   "titre": "Je modernise mon épicerie",
   "sous": "40 à 120 m², passage en libre-service",
   "icone": "🛒",
   "besoin": "Moderniser sans fermer longtemps : rayons, froid, caisse, enseigne.",
   "reponse": "Hanout+ · réouverture visée en 30 jours",
   "pack": "hanout"
  },
  {
   "key": "ouvert",
   "titre": "Mon magasin est ouvert",
   "sous": "Je veux mieux le gérer",
   "icone": "📈",
   "besoin": "Améliorer les marges, réduire les ruptures, fidéliser les clients.",
   "reponse": "Abonnement de suivi",
   "pack": "pilotage"
  },
  {
   "key": "multisite",
   "titre": "J'ouvre un autre magasin",
   "sous": "2e site ou petite enseigne",
   "icone": "🏬",
   "besoin": "Dupliquer ce qui marche et acheter mieux grâce au volume.",
   "reponse": "Supérette ou Supermarché & multi-sites, selon la surface",
   "pack": "supermarche"
  }
 ],
 "FORMULES": {
  "decision": {
   "nom": "Étude Décision",
   "pour": "Valider le projet avant d'engager l'investissement.",
   "prix_min": 12000,
   "prix_max": 25000,
   "note": "Intégralement déduite de la formule signée dans les 90 jours",
   "inclus": [
    "Zone, concurrence et relevé du local",
    "Prévisionnel en 3 scénarios",
    "Budget par poste, daté",
    "Dossier de financement pour la banque"
   ]
  },
  "hanout": {
   "nom": "Hanout+",
   "pour": "Votre épicerie de 40 à 120 m² passe en libre-service.",
   "prix_min": 19000,
   "prix_max": 35000,
   "surface": [
    40,
    120
   ],
   "semaines": [
    [
     "Diagnostic & plan type",
     1
    ],
    [
     "Commandes mobilier, froid et caisse",
     2
    ],
    [
     "Pose, mise en rayon, formation",
     1
    ]
   ],
   "note": "Réouverture visée 30 jours après validation du plan, sous réserve des livraisons · payable en 6 fois",
   "inclus": [
    "Plan type et mobilier standard",
    "Froid et caisse via partenaires",
    "Catalogue et commande WhatsApp",
    "Kit enseigne et kit d'ouverture",
    "Formation + 1 mois de suivi"
   ]
  },
  "superette": {
   "nom": "Supérette clé en main",
   "pour": "Création ou transformation de 120 à 400 m².",
   "prix_min": 65000,
   "prix_max": 150000,
   "surface": [
    120,
    400
   ],
   "semaines": [
    [
     "Étude Décision & budget",
     3
    ],
    [
     "Conception 2D/3D, identité, consultation",
     3
    ],
    [
     "Travaux & équipements",
     8
    ],
    [
     "Stock, caisse, formation, recette",
     3
    ]
   ],
   "note": "Plafonnés à 8 % du budget d'ouverture, sans descendre sous ce minimum",
   "inclus": [
    "Étude Décision et dossier bancaire",
    "Plans 2D et 3 vues 3D",
    "Consultation et pilotage des lots",
    "Assortiment, stock, caisse et ERP",
    "Identité, lancement, formation",
    "Recette + 3 mois d'abonnement Pilotage"
   ]
  },
  "supermarche": {
   "nom": "Supermarché & multi-sites",
   "pour": "400 à 1 200 m², deuxième magasin ou petite enseigne.",
   "prix_min": 150000,
   "prix_max": 380000,
   "surface": [
    400,
    1200
   ],
   "semaines": [
    [
     "Étude Décision & budget",
     4
    ],
    [
     "Conception, études techniques, consultation",
     4
    ],
    [
     "Travaux & équipements",
     12
    ],
    [
     "Stock, systèmes, formation, recette",
     4
    ]
   ],
   "note": "Plafonnés à 8 % du budget (6 % au-delà de 3 millions de MAD), sans descendre sous ce minimum",
   "inclus": [
    "Études coordonnées et optimisation du budget",
    "Planogrammes par famille",
    "Multi-caisses, balances, boutique en ligne",
    "Standards d'enseigne réutilisables",
    "Recette + 3 mois d'abonnement Performance"
   ]
  }
 },
 "ABONNEMENTS": [
  {
   "key": "essentiel",
   "nom": "Essentiel",
   "prix": 1290,
   "engagement": "12 mois",
   "pour": "Tableau de bord et support caisse"
  },
  {
   "key": "pilotage",
   "nom": "Pilotage",
   "prix": 3900,
   "engagement": "12 mois",
   "pour": "Revue mensuelle, prix, promotions, comparaison"
  },
  {
   "key": "performance",
   "nom": "Performance",
   "prix": 7900,
   "engagement": "24 mois",
   "pour": "Visites terrain, réimplantations, marketing local"
  }
 ]
};
