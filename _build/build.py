"""Génère toutes les pages du site Magmart et assets/js/tarifs.js.
Usage (depuis 03_Site_Web) : python _build/build.py
Sources : layout.py (gabarits), tarifs.py (prix, source unique), pages_site.py (pages éditoriales),
pages_outils.py, page_exploitation.py, page_dossier.py (étapes de « Simuler mon projet »), services.py (détail des services)."""
import json, pathlib, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from layout import page, tool_head, tool_nav
import tarifs
from pages_site import INDEX, OFFRE, MRE, APROPOS, CONTACT, FRANCHISE, MENTIONS, PROJET
from pages_outils import WIZARD, SIMULATEUR, STUDIO
from page_exploitation import EXPLOITATION
from page_dossier import DOSSIER
from page_photos import PHOTOS

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Tarifs partagés avec le parcours « Mon projet »
(ROOT / "assets/js/tarifs.js").write_text(
    "/* Généré par _build/build.py depuis _build/tarifs.py — ne pas modifier à la main. */\n"
    "const TARIFS = " + json.dumps({"STADES": tarifs.STADES, "FORMULES": tarifs.FORMULES, "ABONNEMENTS": tarifs.ABONNEMENTS}, ensure_ascii=False, indent=1) + ";\n",
    encoding="utf-8")
print("écrit assets/js/tarifs.js")

# ---------------- Pages éditoriales ----------------
page(ROOT, "index.html", "Magmart — Votre supérette au Maroc, sous votre enseigne",
     "Magmart accompagne les commerçants au Maroc à chaque étape : idée, local, travaux, stock, caisse, lancement et pilotage. Sans droit d'entrée ni redevance.", INDEX)
page(ROOT, "offre.html", "Offre & tarifs — Magmart",
     "L'accompagnement Magmart selon l'avancement de votre projet : Étude Décision, Hanout+, Supérette clé en main, Supermarché & multi-sites, abonnements de suivi.", OFFRE)
page(ROOT, "mre.html", "Ouvrir une supérette au Maroc depuis l'étranger | Magmart",
     "MRE : ouvrez votre supérette au Maroc sans être sur place. Visio hebdomadaire, photos du chantier, validations en ligne, paiements directs aux fournisseurs.", MRE)
page(ROOT, "a-propos.html", "À propos — Magmart",
     "Magmart met les méthodes d'une chaîne au service des commerçants indépendants au Maroc : origine, valeurs, références internationales et réseau de partenaires.", APROPOS)
page(ROOT, "contact.html", "Contact et diagnostic offert — Magmart",
     "Réservez un diagnostic d'une heure, offert, pour votre projet de supérette ou de supermarché au Maroc. Réponse sous 24 h ouvrées.", CONTACT)
page(ROOT, "franchise-ou-enseigne.html", "Franchise ou enseigne propre pour sa supérette | Magmart",
     "Franchise de proximité ou enseigne propre ? Comparez nom, fournisseurs, coût, engagement et autonomie avant d'ouvrir votre supérette au Maroc.", FRANCHISE)
page(ROOT, "mentions-legales.html", "Mentions légales et confidentialité — Magmart",
     "Mentions légales du site Magmart, hébergement et traitement de vos données personnelles conformément à la loi marocaine 09-08.", MENTIONS)

# ---------------- Simuler mon projet ----------------
page(ROOT, "projet.html", "Simuler mon projet — Magmart",
     "Suivez les étapes de votre projet de magasin : profil, budget, plan et rayons, rentabilité, financement. Envoyez votre dossier complet en un clic.", PROJET,
     tool=True, scripts=("tarifs.js", "hub.js"))
page(ROOT, "demarrer.html", "Démarrer mon projet de supérette — Magmart",
     "Où en est votre projet ? En 3 minutes, obtenez la formule adaptée, une estimation de budget et un calendrier. Sans inscription.",
     tool_head("profil", "Démarrer mon projet", "Trois questions pour une recommandation personnalisée : formule, budget et calendrier.") + WIZARD,
     current="projet.html", tool=True, scripts=("tarifs.js", "onboarding.js"))
page(ROOT, "simulateur.html", "Budget d'ouverture d'une supérette au Maroc | Magmart",
     "Estimez gratuitement le budget d'ouverture de votre supérette ou supermarché au Maroc : travaux, froid, rayonnage, caisse, stock, lancement.",
     tool_head("budget", "Budget d'ouverture", "Format, surface et état du local : le budget se calcule poste par poste.") + SIMULATEUR + tool_nav("budget"),
     current="projet.html", tool=True)
page(ROOT, "planificateur.html", "Plan & rayons de votre supérette (Studio 2D) | Magmart",
     "Outil gratuit : dimensions du local, gondoles, froid et caisses à l'échelle, zones, vue en plan et en coupe, planogramme de chaque rayon.",
     tool_head("plan", "Plan & rayons", "Étape facultative : dessinez votre local, placez le mobilier et construisez vos rayons.") + STUDIO + tool_nav("plan"),
     current="projet.html", tool=True, scripts=("planner.js",))
page(ROOT, "exploitation.html", "Rentabilité de votre supérette : seuil, EBE, trésorerie | Magmart",
     "Compte de résultat et trésorerie sur 36 mois, seuil de rentabilité et retour sur investissement de votre supérette au Maroc, en trois scénarios.",
     tool_head("rentabilite", "Rentabilité", "Clients, panier, charges et crédit : votre magasin sera-t-il rentable, et quand ?") + EXPLOITATION + tool_nav("rentabilite"),
     current="projet.html", tool=True, scripts=("tarifs.js", "exploitation.js"))
page(ROOT, "dossier.html", "Préparer mon dossier de financement — Magmart",
     "Un dossier bancaire prêt à imprimer : plan de financement, prévisionnel sur 3 ans, remboursement, ratios et pièces à réunir pour financer votre supérette.",
     tool_head("financement", "Préparer mon dossier de financement", "Votre projet, vos chiffres et vos pièces, réunis dans un dossier à présenter à votre banque.") + DOSSIER + tool_nav("financement"),
     current="projet.html", tool=True, scripts=("dossier.js",))
page(ROOT, "photos.html", "Photos de mon local — Magmart",
     "Envoyez les photos de votre local, mur par mur : Magmart prépare le relevé, le plan et les points techniques avant la première visite.", PHOTOS,
     current="projet.html", tool=True, scripts=("photos.js",))
