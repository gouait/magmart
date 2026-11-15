"""Contenu des pages éditoriales : accueil, offre & tarifs, MRE, à propos, contact, franchise, mentions, Simuler mon projet."""
from layout import icon, page_hero, cta_band, WHATSAPP_ICON
from tarifs import STADES, FORMULES, ABONNEMENTS, MODES, OPTIONS, MODULES
from services import PHASES


def num(v):
    return f"{v:,}".replace(",", " ")


def mad(v):
    return num(v) + " MAD"


WA_IC = WHATSAPP_ICON.replace('aria-hidden="true"', 'class="ic" aria-hidden="true"')

# Ce que fait Magmart à chaque stade (page Offre & tarifs)
STADE_DETAIL = {
    "idee": ["Lecture de la zone, de la concurrence et des flux", "Format recommandé et critères du local à chercher", "Budget d'ouverture daté poste par poste", "Prévisionnel sur 3 ans et dossier pour la banque", "Avis argumenté : on y va, on ajuste, ou on renonce"],
    "local": ["Relevé du local et plan d'implantation 2D/3D", "Consultation des entreprises et devis comparés", "Pilotage des travaux, du froid et du mobilier", "Assortiment, stock d'ouverture, caisse et vente en ligne", "Identité de l'enseigne, lancement, formation et recette"],
    "moderniser": ["Plan type pour passer en libre-service", "Mobilier, froid et caisse standard via partenaires", "Catalogue et commande WhatsApp pour le quartier", "Nouvelle enseigne et kit d'ouverture", "Fermeture la plus courte possible : 30 jours après validation du plan"],
    "ouvert": ["Diagnostic des ventes, marges, ruptures et pertes", "Tableau de bord mensuel et support caisse", "Prix, promotions et réimplantation des rayons", "Accès aux accords d'achat Magmart", "Modules à la carte : caisse et ERP, marque, fidélité"],
    "multisite": ["Standards d'enseigne réutilisables d'un site à l'autre", "Études coordonnées et optimisation du budget", "Planogrammes par famille et assortiment commun", "Caisse multi-sites et tableaux de bord consolidés", "Achats groupés grâce au volume"],
}

FAQ = [
    ("Est-ce une franchise ?", "Non. Votre magasin ouvre sous votre propre enseigne. Il n'y a ni droit d'entrée ni redevance sur votre chiffre d'affaires : Magmart est rémunéré en honoraires par étape, plafonnés à 8 % du budget d'ouverture, avec un minimum par formule. <a href=\"franchise-ou-enseigne.html\">Comparer franchise et enseigne propre</a>."),
    ("Qui paie les travaux, les équipements et le stock ?", "Vous, directement à vos fournisseurs, sur la base de devis que Magmart compare pour vous. Vous gardez les garanties et la relation avec chaque entreprise. Aucune marge cachée."),
    ("Combien de temps faut-il pour ouvrir ?", "En général 3 à 6 mois entre la validation du projet et l'ouverture, selon l'état du local et les autorisations. Pour une épicerie qui passe en libre-service, la réouverture est visée 30 jours après validation du plan. Le calendrier est construit à rebours depuis votre date cible."),
    ("Pouvez-vous m'aider à financer le projet ?", "Oui. L'étape Financement de « Simuler mon projet » prépare un dossier bancaire : plan de financement, prévisionnel, remboursement et pièces à réunir. Magmart peut ensuite vous orienter vers des banques et des sociétés de crédit-bail. Magmart ne prête pas lui-même."),
    ("Je vis à l'étranger. Pouvez-vous suivre mon projet à distance ?", "Oui, avec l'option Suivi à distance : visio hebdomadaire, photos du chantier en général sous 48 h, validations et signatures en ligne. <a href=\"mre.html\">Voir comment nous travaillons avec les investisseurs MRE</a>."),
]


def faq_html(items):
    return '<div class="faq">' + "".join(f"<details><summary>{q}</summary><div><p>{a}</p></div></details>" for q, a in items) + "</div>"


def pack_card(key, featured=False, cta=None):
    F = FORMULES[key]
    badge = '<span class="badge badge--accent">Notre formule phare</span>' if featured else ""
    href = cta or f"offre.html#f-{key}"
    return f'''<article class="card pack{" card--featured" if featured else ""}">
  {badge}<h3>{F["nom"]}</h3><p class="for">{F["pour"]}</p>
  <div class="price">dès {mad(F["prix_min"])} <small>HT</small></div>
  <p class="price-note">{F["note"]}</p>
  <ul class="checklist">{"".join(f"<li>{i}</li>" for i in F["inclus"][:4])}</ul>
  <a href="{href}" class="btn btn--ghost btn--block">Voir le détail</a>
</article>'''


STUDIO_MOCK = '''<svg viewBox="-1 -1 16 12.2" role="img" aria-label="Exemple de plan d'implantation réalisé avec le Studio 2D">
  <rect x="0" y="0" width="14" height="10" fill="#fff"/>
  <rect x="0" y="0" width="14" height="2.4" fill="#a8a29e" fill-opacity=".15"/>
  <rect x=".2" y=".1" width="2.7" height="1" rx=".06" fill="#a8a29e"/><rect x="3.1" y=".1" width="2.7" height="1" rx=".06" fill="#a8a29e"/>
  <rect x="10.8" y=".1" width="3" height="2.2" rx=".06" fill="#475569"/>
  <rect x="1.6" y="2.4" width="2.5" height=".9" rx=".06" fill="#334155"/><rect x="4.1" y="2.4" width="2.5" height=".9" rx=".06" fill="#334155"/><rect x="6.6" y="2.4" width="2.5" height=".9" rx=".06" fill="#334155"/><rect x="9.1" y="2.4" width="2.5" height=".9" rx=".06" fill="#334155"/><rect x="11.6" y="2.4" width="2.2" height="1.1" rx=".06" fill="#92400e"/>
  <rect x="0" y="4.7" width=".9" height="2" rx=".06" fill="#64748b"/><rect x="13.5" y="4.7" width=".5" height="2.4" rx=".06" fill="#166534"/>
  <rect x="2.4" y="4.9" width="1" height="2.5" rx=".06" fill="#15803d"/><rect x="5" y="4.9" width="1" height="2.5" rx=".06" fill="#15803d"/><rect x="7.6" y="4.9" width="1" height="2.5" rx=".06" fill="#15803d"/><rect x="10.2" y="4.9" width="1" height="2.5" rx=".06" fill="#15803d"/>
  <rect x="2.4" y="7.4" width="1" height=".5" fill="#ca8a04"/><rect x="5" y="7.4" width="1" height=".5" fill="#ca8a04"/><rect x="7.6" y="7.4" width="1" height=".5" fill="#ca8a04"/><rect x="10.2" y="7.4" width="1" height=".5" fill="#ca8a04"/>
  <rect x="1" y="8.3" width="2" height="1.2" rx=".06" fill="#4d7c0f"/>
  <rect x="9.6" y="8.3" width=".9" height="1.6" rx=".06" fill="#1f2a37"/><rect x="11.6" y="8.3" width=".9" height="1.6" rx=".06" fill="#1f2a37"/>
  <polygon points="0,0 14,0 14,10 0,10" fill="none" stroke="#1f2a37" stroke-width=".2"/>
  <rect x="6" y="9.8" width="2" height=".4" fill="#fff"/>
  <text x="7" y="10.8" font-size=".36" font-weight="800" text-anchor="middle" fill="#1f2a37" font-family="Plus Jakarta Sans, sans-serif">ENTRÉE</text>
  <text x="7" y="-.4" font-size=".34" text-anchor="middle" fill="#4b5563" font-family="Plus Jakarta Sans, sans-serif">14,0 m</text>
</svg>'''

# ===================================================================== ACCUEIL
stages_html = "".join(f'''<a class="card card--link stage" href="demarrer.html?stade={s["key"]}">
  <span class="ic-tile">{icon(s["key"])}</span><h3>{s["titre"]}</h3><span class="sub">{s["sous"]}</span>
  <p>{s["besoin"]}</p><span class="to">{s["reponse"]} →</span></a>''' for s in STADES)

INDEX = f'''
<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <span class="eyebrow">Supérettes & supermarchés · Maroc</span>
      <h1>Ouvrez ou modernisez votre magasin, sous <span class="hl">votre</span> enseigne.</h1>
      <p class="lead">Magmart vous accompagne de l'idée au magasin qui tourne : étude, plans, travaux, stock, caisse, lancement et pilotage. Un seul interlocuteur, et des décisions qui restent les vôtres.</p>
      <div class="btn-row">
        <a href="demarrer.html" class="btn btn--primary">Démarrer mon projet</a>
        <a href="#" data-wa class="btn btn--ghost">{WA_IC}Parler à un conseiller</a>
      </div>
      <p class="hero-sub">Gratuit, sans inscription : une première recommandation en 3 minutes.</p>
    </div>
    <div class="hero-media">
      <img src="assets/img/hero-magasin.jpg" alt="Allée d'une supérette moderne avec un étal de fruits et légumes et un gérant souriant" width="674" height="848">
      <div class="hero-note"><b>0 MAD</b>de droit d'entrée ni de redevance sur votre chiffre d'affaires</div>
    </div>
  </div>
</section>

<section class="section" id="stades">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Où en êtes-vous ?</span><h2>Choisissez votre point de départ.</h2>
      <p>Que vous ayez une idée, un local ou un magasin déjà ouvert, l'accompagnement s'adapte à l'avancement de votre projet.</p></div>
    <div class="stages">{stages_html}</div>
    <p class="muted" style="margin-top:24px">Vous vivez à l'étranger ? Nous suivons votre projet à distance. <a href="mre.html" class="link-arrow">Voir comment</a></p>
  </div>
</section>

<section class="section section--mint">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Comment ça marche</span><h2>Trois temps, aucune surprise.</h2></div>
    <div class="steps">
      <div class="step"><h3>Vous vous projetez en ligne</h3><p>Avec « Simuler mon projet » : recommandation, budget d'ouverture, plan du magasin, rentabilité et dossier de financement. Gratuit.</p></div>
      <div class="step"><h3>Diagnostic offert (1 h)</h3><p>Sur place ou en visio, un expert relit votre projet et vous donne un avis argumenté. Proposition écrite en général sous 72 h.</p></div>
      <div class="step"><h3>Nous réalisons, étape par étape</h3><p>Vous validez chaque jalon et payez au rythme des preuves. Le magasin est testé avant le premier client.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div>
      <span class="eyebrow">Simuler mon projet</span>
      <h2>Voyez votre magasin, et ses chiffres, avant de signer.</h2>
      <ol class="toollist">
        <li><span class="n">1</span><div><b>Profil</b><span>Votre stade, votre local, la formule recommandée.</span></div></li>
        <li><span class="n">2</span><div><b>Budget d'ouverture</b><span>Travaux, froid, rayons, caisse, stock : poste par poste.</span></div></li>
        <li><span class="n">3</span><div><b>Plan & rayons</b><span>Dessinez le local, placez le mobilier, construisez le planogramme.</span></div></li>
        <li><span class="n">4</span><div><b>Rentabilité</b><span>Chiffre d'affaires, seuil de rentabilité, trésorerie sur 3 ans.</span></div></li>
        <li><span class="n">5</span><div><b>Financement</b><span>Un dossier prêt à présenter à votre banque.</span></div></li>
      </ol>
      <div class="btn-row"><a href="projet.html" class="btn btn--secondary">Simuler mon projet</a></div>
    </div>
    <div class="mock">{STUDIO_MOCK}</div>
  </div>
</section>

<section class="section section--mint">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Pourquoi Magmart</span><h2>Les outils d'une chaîne, sans perdre votre enseigne.</h2></div>
    <div class="grid grid-4">
      <div class="card"><span class="ic-tile">{icon("shield")}</span><h3 style="margin-top:16px">Votre enseigne reste la vôtre</h3><p>Ni droit d'entrée, ni redevance, ni fournisseur imposé. Vous gardez la valeur de votre fonds.</p></div>
      <div class="card"><span class="ic-tile">{icon("eye")}</span><h3 style="margin-top:16px">Achats transparents</h3><p>Devis comparés et signés à votre nom. Toute remise d'un partenaire est déclarée et vous revient.</p></div>
      <div class="card"><span class="ic-tile">{icon("check")}</span><h3 style="margin-top:16px">Ouverture testée</h3><p>Vente, retour, clôture de caisse et commande en ligne essayés en situation avant le premier client.</p></div>
      <div class="card"><span class="ic-tile">{icon("calc")}</span><h3 style="margin-top:16px">Honoraires plafonnés</h3><p>8 % du budget d'ouverture au maximum, avec un minimum par formule. Payés par étapes, au rythme des livrables.</p></div>
    </div>
  </div>
</section>

<section class="section" id="formules">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Formules</span><h2>Des prix clairs, payés par étapes.</h2>
      <p>Honoraires hors travaux, équipements et stock, que vous réglez directement à vos fournisseurs.</p></div>
    <div class="grid grid-4">{pack_card("decision")}{pack_card("hanout")}{pack_card("superette", True)}{pack_card("supermarche")}</div>
    <p class="muted" style="margin-top:24px">Magasin déjà ouvert ? Abonnements de suivi dès {mad(ABONNEMENTS[0]["prix"])} HT par mois. <a href="offre.html">Voir toute l'offre et les tarifs</a></p>
  </div>
</section>

<section class="section section--mint">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Questions fréquentes</span><h2>Avant de nous écrire.</h2></div>
    {faq_html(FAQ)}
  </div>
</section>
''' + cta_band("Votre projet mérite une réponse précise.", "Trois minutes pour une première recommandation, puis un diagnostic offert (1 h) avec un expert.")

# ============================================================= OFFRE & TARIFS
def stage_row(s):
    k = s["pack"]
    if k == "pilotage":
        offer = f'''<div class="card"><span class="badge">Recommandé</span><h3 style="margin-top:12px">Abonnement de suivi</h3>
          <div class="price">dès {mad(ABONNEMENTS[0]["prix"])} <small>HT / mois</small></div><p class="price-note">Essentiel, Pilotage ou Performance selon votre magasin.</p>
          <a class="btn btn--secondary btn--block" href="demarrer.html?stade={s["key"]}">Faire le point sur mon magasin</a></div>'''
    else:
        F = FORMULES[k]
        offer = f'''<div class="card"><span class="badge">Recommandé</span><h3 style="margin-top:12px">{F["nom"]}</h3>
          <div class="price">dès {mad(F["prix_min"])} <small>HT</small></div><p class="price-note">{F["note"]}</p>
          <a class="btn btn--secondary btn--block" href="demarrer.html?stade={s["key"]}">Commencer à ce stade</a></div>'''
    return f'''<div class="stage-row" id="s-{s["key"]}">
  <aside><span class="ic-tile">{icon(s["key"])}</span><h3>{s["titre"]}</h3><p><strong>{s["sous"]}.</strong> {s["besoin"]}</p></aside>
  <div class="stage-offer">
    <div class="card"><h3>Ce que fait Magmart</h3><ul class="checklist">{"".join(f"<li>{i}</li>" for i in STADE_DETAIL[s["key"]])}</ul></div>
    {offer}
  </div>
</div>'''


def pack_full(key, featured=False):
    F = FORMULES[key]
    return f'''<article class="card pack{" card--featured" if featured else ""}" id="f-{key}">
  {'<span class="badge badge--accent">Notre formule phare</span>' if featured else ""}<h3>{F["nom"]}</h3><p class="for">{F["pour"]}</p>
  <div class="price"><span class="nw">{num(F["prix_min"])}</span> – <span class="nw">{mad(F["prix_max"])}</span> <small>HT</small></div>
  <p class="price-note">{F["note"]}</p>
  <ul class="checklist">{"".join(f"<li>{i}</li>" for i in F["inclus"])}</ul>
  <a href="demarrer.html" class="btn btn--ghost btn--block">Démarrer mon projet</a>
</article>'''


services_acc = ""
n = 0
for pid, pname, pdesc, svcs in PHASES:
    items = ""
    for title, promise, cols, crit in svcs:
        n += 1
        cols_html = "".join(f'<div><p class="lbl">{h}</p><ul class="checklist">{"".join(f"<li>{x}</li>" for x in pts)}</ul></div>' for h, pts in cols)
        items += f'''<details class="acc"><summary><span>{n:02d}. {title}<small>{promise}</small></span></summary>
          <div class="acc-body"><div class="grid grid-2">{cols_html}</div><p class="alert" style="margin-top:8px"><span><strong>Critère de validation :</strong> {crit}</span></p></div></details>'''
    services_acc += f'<h3 id="{pid}" style="margin-top:32px">{pname} <small class="muted" style="font-weight:500">· {pdesc}</small></h3>{items}'

OFFRE = page_hero("Offre & tarifs", "Un accompagnement adapté à l'avancement de votre projet.",
                  "Choisissez votre point de départ : chaque stade a sa réponse, son prix et ses livrables. Les montants sont des honoraires ; travaux, équipements et stock sont réglés directement à vos fournisseurs.",
                  '<nav class="anchors" aria-label="Sections de la page"><a href="#stades">Selon votre projet</a><a href="#formules">Formules</a><a href="#methode">Comment nous travaillons</a><a href="#apres">Après l\'ouverture</a><a href="#details">Détail des services</a></nav>') + f'''
<section class="section" id="stades"><div class="wrap">
  <div class="section-head"><span class="eyebrow">Selon votre projet</span><h2>Cinq points de départ, cinq réponses.</h2></div>
  {"".join(stage_row(s) for s in STADES)}
</div></section>

<section class="section section--mint" id="formules"><div class="wrap">
  <div class="section-head"><span class="eyebrow">Formules d'ouverture</span><h2>Ce qui est inclus, et à quel prix.</h2>
    <p>Le montant exact dépend de la surface et du périmètre. Il est plafonné à 8 % du budget d'ouverture (6 % au-delà de 3 millions de MAD), sans descendre sous le minimum de la formule.</p></div>
  <div class="grid grid-4">{pack_full("decision")}{pack_full("hanout")}{pack_full("superette", True)}{pack_full("supermarche")}</div>
</div></section>

<section class="section" id="methode"><div class="wrap">
  <div class="section-head"><span class="eyebrow">Comment nous travaillons</span><h2>Vous décidez à chaque jalon. Vous payez sur preuves.</h2></div>
  <div class="grid grid-2" style="align-items:start">
    <div class="card"><h3>Cinq jalons, cinq décisions</h3>
      <ol class="toollist" style="margin-top:16px">
        <li><span class="n">1</span><div><b>Projet engagé</b><span>Faisabilité, budget et conditions à lever validés.</span></div></li>
        <li><span class="n">2</span><div><b>Conception figée</b><span>Plans, équipements, identité et devis approuvés.</span></div></li>
        <li><span class="n">3</span><div><b>Site prêt à recevoir</b><span>Installations testées, réserve et caisse prêtes.</span></div></li>
        <li><span class="n">4</span><div><b>Préouverture</b><span>Essais caisse et web, stock rapproché, équipe formée.</span></div></li>
        <li><span class="n">5</span><div><b>Passage à l'exploitation</b><span>Accès, manuels, garanties et responsabilités remis.</span></div></li>
      </ol></div>
    <div class="grid" style="gap:16px">
      <div class="card"><h3>Paiement</h3><ul class="checklist" style="margin:12px 0 0">
        <li>30 % à la signature · 30 % à la conception figée · 30 % quand le site est prêt · 10 % à la remise</li>
        <li>En 6 mensualités sans frais pour Hanout+ et le Coaching</li>
        <li>Arrêt possible à chaque étape : vous gardez les livrables</li></ul></div>
      <div class="card"><h3>Trois modes d'accompagnement</h3><p style="margin-bottom:12px">Le mode est choisi ensemble lors du diagnostic et reste modifiable à chaque jalon.</p>
        <table><tbody>{"".join(f"<tr><td><strong>{m['nom']}</strong><br><span class='muted'>{m['phrase']}</span></td><td class='price-cell'>{m['prix']}</td></tr>" for m in MODES)}</tbody></table></div>
    </div>
  </div>
</div></section>

<section class="section section--mint" id="apres"><div class="wrap">
  <div class="section-head"><span class="eyebrow">Après l'ouverture</span><h2>Un magasin se gagne aussi après l'inauguration.</h2></div>
  <div class="grid grid-3">{"".join(f'''<div class="card{" card--featured" if a["key"] == "pilotage" else ""}"><h3>{a["nom"]}</h3><div class="price">{mad(a["prix"])} <small>HT / mois</small></div><p class="price-note">Engagement {a["engagement"]}</p><p>{a["pour"]}.</p></div>''' for a in ABONNEMENTS)}</div>
  <p class="muted" style="margin-top:16px">Tous les abonnements donnent accès aux accords d'achat négociés par Magmart, selon les fournisseurs de votre région.</p>
</div></section>

<section class="section" id="details"><div class="wrap">
  <div class="section-head"><span class="eyebrow">Détails</span><h2>Options, modules et services.</h2></div>
  <details class="acc"><summary><span>Options à ajouter à une formule<small>Suivi à distance, financement, démarches, 3D, express, inauguration</small></span></summary>
    <div class="acc-body"><table><tbody>{"".join(f"<tr><td>{a}</td><td class='price-cell'>{b}</td></tr>" for a, b in OPTIONS)}</tbody></table></div></details>
  <details class="acc"><summary><span>Modules à la carte<small>Pour les projets déjà avancés ou les magasins ouverts</small></span></summary>
    <div class="acc-body"><table><tbody>{"".join(f"<tr><td>{a}</td><td class='price-cell'>{b}</td></tr>" for a, b in MODULES)}</tbody></table></div></details>
  {services_acc}
</div></section>
''' + cta_band("Par où commencer ?", "Indiquez où en est votre projet : vous obtenez la formule adaptée, un budget et un calendrier, puis un diagnostic offert.")

# ======================================================================== MRE
MRE = page_hero("Investir depuis l'étranger", "Ouvrez votre magasin au Maroc, sans être sur place.",
                "Vous vivez en France, en Belgique, en Espagne ou ailleurs ? Magmart pilote votre projet sur place et vous tient informé comme si vous y étiez.") + f'''
<section class="section"><div class="wrap">
  <div class="section-head"><span class="eyebrow">Ce qui change pour vous</span><h2>La distance ne doit pas coûter de contrôle.</h2></div>
  <div class="grid grid-3">
    <div class="card"><span class="ic-tile">{icon("video")}</span><h3 style="margin-top:16px">Une visio chaque semaine</h3><p>Décisions à prendre, budget, planning : un point fixe à l'heure qui vous arrange.</p></div>
    <div class="card"><span class="ic-tile">{icon("camera")}</span><h3 style="margin-top:16px">Photos et vidéos du chantier</h3><p>Après chaque visite, un compte rendu illustré, en général sous 48 h.</p></div>
    <div class="card"><span class="ic-tile">{icon("pen")}</span><h3 style="margin-top:16px">Validations en ligne</h3><p>Plans, devis et jalons validés et signés à distance quand c'est possible.</p></div>
    <div class="card"><span class="ic-tile">{icon("shield")}</span><h3 style="margin-top:16px">Le budget du chantier ne transite pas par nous</h3><p>Vous payez directement chaque fournisseur, sur devis comparé et selon l'échéancier de chaque devis.</p></div>
    <div class="card"><span class="ic-tile">{icon("chart")}</span><h3 style="margin-top:16px">Budget suivi en continu</h3><p>Approuvé, engagé, payé, reste à payer : chaque écart est signalé avec son impact.</p></div>
    <div class="card"><span class="ic-tile">{icon("users")}</span><h3 style="margin-top:16px">Un gérant formé</h3><p>Nous vous aidons à recruter, puis nous formons l'équipe. L'abonnement de suivi vous donne ensuite les chiffres chaque mois.</p></div>
  </div>
</div></section>

<section class="section section--mint"><div class="wrap">
  <div class="section-head"><span class="eyebrow">Déroulement</span><h2>Votre projet, de votre canapé à l'inauguration.</h2></div>
  <div class="steps">
    <div class="step"><h3>Vous préparez en ligne</h3><p>Avec « Simuler mon projet » : profil, budget, plan, rentabilité et dossier de financement, depuis chez vous.</p></div>
    <div class="step"><h3>Diagnostic en visio</h3><p>Une heure avec un expert, puis visite du local par vidéo ou pendant votre prochain séjour.</p></div>
    <div class="step"><h3>Chantier suivi à distance</h3><p>Visio hebdomadaire, photos, validations en ligne. Vous venez pour les décisions clés et l'ouverture.</p></div>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head"><span class="eyebrow">Questions des investisseurs MRE</span><h2>Ce que l'on nous demande le plus.</h2></div>
  {faq_html([
    ("Dois-je être présent au Maroc ?", "Pour l'essentiel, non. Certaines démarches, comme la signature du bail, l'immatriculation de la société ou l'ouverture d'un compte, peuvent demander votre présence ou une procuration : nous les regroupons pour les faire coïncider avec un séjour."),
    ("Quand lancer le projet ?", "Idéalement quelques mois avant l'été : le diagnostic et les plans se font à distance, et votre séjour sert à visiter le local et à signer."),
    ("Qui gérera le magasin au quotidien ?", "Un gérant que nous aidons à recruter et à former. L'abonnement de suivi vous donne ensuite un tableau de bord mensuel et une revue de gestion."),
    ("Comment financer depuis l'étranger ?", "Plusieurs banques proposent des offres dédiées aux Marocains du monde. L'étape Financement de « Simuler mon projet » prépare le dossier à leur présenter."),
  ])}
</div></section>
''' + cta_band("Préparez votre projet depuis chez vous.", "Commencez par votre profil d'investisseur à distance : recommandation, budget et calendrier en quelques minutes.", ("demarrer.html?mre=1", "Démarrer mon projet à distance"))

# =================================================================== À PROPOS
from_benchmark = [
    ("Agenceurs clé en main", "Émirats arabes unis", "Conception et équipement de magasins", "Montrer le plan avant de vendre"),
    ("Réseaux d'affiliation de proximité", "France", "Enseigne et approvisionnement", "Accompagner sans droit d'entrée"),
    ("Grossistes à services", "États-Unis", "Approvisionnement et services aux détaillants", "Rester présent après l'ouverture"),
    ("Groupements d'indépendants", "Royaume-Uni", "Achats groupés et marque commune facultative", "L'indépendant garde son enseigne et achète mieux"),
    ("Services professionnels aux détaillants", "États-Unis", "Conseil et outils de gestion", "Suivi par paliers, comparaison entre magasins"),
    ("Programmes de modernisation des épiceries", "Inde", "Transformation des commerces de quartier", "Transformation rapide et standardisée"),
]
APROPOS = page_hero("À propos", "Les méthodes d'une chaîne au service des indépendants.",
                    "Magmart est né d'un constat : au Maroc, un commerçant indépendant qui veut ouvrir ou moderniser une supérette doit choisir entre se débrouiller seul et renoncer à son enseigne. Nous proposons une troisième voie.") + f'''
<section class="section"><div class="wrap split" style="align-items:start">
  <div class="prose">
    <span class="eyebrow">Notre origine</span>
    <h2 style="margin-top:0">Le terrain avant les présentations.</h2>
    <p>Magmart s'appuie sur l'expérience de son fondateur dans quatre métiers qu'une ouverture de magasin fait se rencontrer : le <strong>génie civil</strong>, la <strong>distribution de fruits et légumes</strong> pour la restauration, le <strong>développement de solutions numériques</strong>, et l'<strong>ouverture et l'exploitation de supermarchés</strong>.</p>
    <p>Cette expérience éclaire les arbitrages qui font la différence : un froid bien dimensionné, un stock d'ouverture ni trop lourd ni trop maigre, une caisse paramétrée avant l'arrivée des marchandises, une équipe qui sait ce qu'elle doit faire le premier jour.</p>
  </div>
  <div class="grid" style="gap:16px">
    <div class="card"><span class="ic-tile">{icon("shield")}</span><h3 style="margin-top:16px">Indépendance</h3><p>Votre enseigne, vos contrats, vos fournisseurs. Nous sommes rémunérés en honoraires, jamais par une redevance.</p></div>
    <div class="card"><span class="ic-tile">{icon("eye")}</span><h3 style="margin-top:16px">Transparence</h3><p>Devis comparés, remises déclarées, budget suivi chaque semaine.</p></div>
    <div class="card"><span class="ic-tile">{icon("check")}</span><h3 style="margin-top:16px">Honnêteté</h3><p>Le diagnostic peut conclure qu'il ne faut pas ouvrir, ou que la franchise vous convient mieux.</p></div>
  </div>
</div></section>

<section class="section section--mint"><div class="wrap">
  <div class="section-head"><span class="eyebrow">Ce qui nous inspire</span><h2>Le meilleur des modèles internationaux, adapté au Maroc.</h2>
    <p>Nous avons étudié les acteurs qui accompagnent les commerçants indépendants dans le monde. Magmart reprend leurs bonnes pratiques, sans imposer d'enseigne.</p></div>
  <div class="table-wrap"><table><thead><tr><th>Type d'acteur</th><th>Pays</th><th>Modèle</th><th>Ce que nous en retenons</th></tr></thead>
    <tbody>{"".join(f"<tr><td><strong>{a}</strong></td><td>{b}</td><td>{c}</td><td>{d}</td></tr>" for a, b, c, d in from_benchmark)}</tbody></table></div>
  <p class="muted" style="margin-top:12px;font-size:var(--fs-xs)">Modèles observés sur ces marchés lors de notre étude ; il ne s'agit pas de partenaires de Magmart.</p>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head"><span class="eyebrow">Notre réseau</span><h2>Des partenaires qualifiés, métier par métier.</h2>
    <p>Magmart coordonne ; les entreprises spécialisées réalisent, sous contrat direct avec vous.</p></div>
  <div class="grid grid-4">
    <div class="card"><h3>Agencement et froid</h3><p>Rayonnage, gondoles, froid positif et négatif, chambres froides.</p></div>
    <div class="card"><h3>Caisse et logiciels</h3><p>Éditeurs de caisse et d'ERP, terminaux de paiement.</p></div>
    <div class="card"><h3>Approvisionnement</h3><p>Grossistes, producteurs et plateformes pour épiciers.</p></div>
    <div class="card"><h3>Financement</h3><p>Banques et sociétés de crédit-bail, aide pour solliciter les garanties publiques.</p></div>
  </div>
</div></section>
''' + cta_band("Parlons de votre magasin.", "Un diagnostic offert (1 h) pour savoir si votre projet tient et comment le réussir.")

# ==================================================================== CONTACT
CONTACT = page_hero("Contact", "Réservez votre diagnostic offert.",
                    "Une heure, sur place ou en visio, pour relire votre projet et vous donner un avis argumenté. Réponse en général sous 24 h ouvrées.") + '''
<section class="section"><div class="wrap contact-grid">
  <form class="form" id="lead-form" novalidate>
    <p class="full alert" id="lead-prefill" hidden><span>Nous avons repris les informations de votre simulation. Vérifiez-les, puis envoyez.</span></p>
    <fieldset><legend>Vous</legend>
      <div><label for="nom">Nom et prénom</label><input id="nom" name="nom" required autocomplete="name"></div>
      <div><label for="tel">Téléphone ou WhatsApp</label><input id="tel" name="tel" type="tel" required autocomplete="tel" placeholder="+212 6…"></div>
    </fieldset>
    <fieldset><legend>Votre projet</legend>
      <div><label for="profil">Où en êtes-vous ?</label><select id="profil" name="profil" required>
        <option value="">Choisir…</option>
        <option value="idee">J'ai une idée, pas encore de local</option>
        <option value="local">J'ai un local, en vue ou signé</option>
        <option value="moderniser">Je modernise mon épicerie</option>
        <option value="ouvert">Mon magasin est ouvert, je veux mieux le gérer</option>
        <option value="multisite">J'ouvre un autre magasin</option></select></div>
      <div><label for="ville">Ville</label><input id="ville" name="ville" required placeholder="Casablanca, Agadir…" autocomplete="address-level2"></div>
      <div><label for="surface">Surface (m²)</label><input id="surface" name="surface" type="number" min="20" inputmode="numeric"></div>
      <div><label for="budget">Budget envisagé</label><select id="budget" name="budget">
        <option value="">Je ne sais pas encore</option><option value="<500k">Moins de 500 000 MAD</option><option value="500k-1.5M">500 000 – 1 500 000 MAD</option><option value="1.5-4M">1,5 – 4 M MAD</option><option value=">4M">Plus de 4 M MAD</option></select></div>
      <div><label for="date">Date souhaitée</label><input id="date" name="date" type="month"></div>
      <div><label for="mre" class="mre-check"><input type="checkbox" id="mre" name="mre">Je vis à l'étranger</label></div>
      <div class="full"><label for="message">Précisions</label><textarea id="message" name="message" rows="4" placeholder="Local, plans ou photos disponibles, questions…"></textarea></div>
    </fieldset>
    <label class="consent full"><input type="checkbox" required><span>J'accepte que Magmart utilise ces informations pour me recontacter au sujet de mon projet (loi 09-08, <a href="mentions-legales.html#donnees">en savoir plus sur vos données</a>).</span></label>
    <div class="full"><button class="btn btn--primary" type="submit">Envoyer ma demande sur WhatsApp</button></div>
    <div class="form-status" role="status" aria-live="polite" hidden>Merci. WhatsApp s'ouvre avec votre message pré-rempli : il vous reste à l'envoyer.</div>
  </form>
  <aside class="contact-aside">
    <h2 style="font-size:var(--fs-lg)">Comment se passe le diagnostic ?</h2>
    <ol>
      <li><strong>Une heure d'échange</strong>, sur place ou en visio : votre projet, votre local, vos contraintes.</li>
      <li><strong>Lecture de la zone</strong> : concurrence, accès, flux, enseignes proches.</li>
      <li><strong>Restitution</strong> : format recommandé, fourchette d'investissement, risques et prochaines étapes.</li>
    </ol>
    <p class="muted" style="font-size:var(--fs-sm)">Pour gagner du temps, préparez l'adresse du local, sa surface, un plan ou des photos.</p>
    <a href="#" data-wa class="btn btn--ghost btn--block">''' + WA_IC + '''Écrire directement sur WhatsApp</a>
    <p class="muted" style="font-size:var(--fs-xs);margin-top:16px">Vous préférez préparer d'abord ? <a href="demarrer.html">Simulez votre projet</a> : votre dossier nous arrivera complet.</p>
  </aside>
</div></section>'''

# ================================================================== FRANCHISE
FRANCHISE = page_hero("Franchise ou enseigne propre ?", "Ouvrir une supérette sans renoncer à votre enseigne.",
                      "La franchise apporte une marque et une centrale d'achat, en échange de règles et d'une sélection. L'enseigne propre laisse libre, mais il faut réunir seul dix métiers. Magmart apporte ces métiers sans prendre votre enseigne.") + '''
<section class="section"><div class="wrap">
  <div class="table-wrap"><table>
    <thead><tr><th>Critère</th><th>Franchise de proximité</th><th>Enseigne propre, seul</th><th class="col-us">Enseigne propre avec Magmart</th></tr></thead>
    <tbody>
      <tr><td>Nom et identité</td><td>Imposés par le réseau</td><td>Libres, souvent improvisés</td><td class="yes col-us">Libres, conçus par des professionnels</td></tr>
      <tr><td>Accès</td><td>Sélection des candidats</td><td>Ouvert</td><td class="yes col-us">Ouvert, avec une étude honnête</td></tr>
      <tr><td>Fournisseurs</td><td>Centrale du réseau</td><td>Libres, sans pouvoir de négociation</td><td class="yes col-us">Libres + accords Magmart facultatifs</td></tr>
      <tr><td>Conception, travaux, équipements</td><td>Standards du réseau</td><td>À coordonner soi-même</td><td class="yes col-us">Pilotés, devis comparés</td></tr>
      <tr><td>Caisse, stock, vente en ligne</td><td>Outils du réseau</td><td>À choisir et paramétrer</td><td class="yes col-us">Paramétrés et testés</td></tr>
      <tr><td>Coût de l'accompagnement</td><td>Propre à chaque contrat</td><td>Aucun, mais des erreurs coûteuses</td><td class="yes col-us">Honoraires plafonnés à 8 % du budget, avec un minimum par formule</td></tr>
      <tr><td>Engagement</td><td>Contrat pluriannuel</td><td>Aucun</td><td class="yes col-us">Par étape ; abonnement facultatif</td></tr>
      <tr><td>Revente du fonds</td><td>Soumise aux clauses du contrat</td><td>Libre</td><td class="yes col-us">Libre</td></tr>
    </tbody></table></div>
  <p class="muted" style="margin-top:12px;font-size:var(--fs-xs)">Comparatif général. Les conditions de chaque franchise sont fixées par son contrat : renseignez-vous auprès de chaque réseau.</p>
  <div class="grid grid-2" style="margin-top:48px">
    <div class="card"><h2 style="font-size:var(--fs-lg)">La franchise vous convient si…</h2><ul class="checklist"><li>vous voulez une marque connue dès le premier jour ;</li><li>vous acceptez les règles d'assortiment, de prix et d'approvisionnement du réseau ;</li><li>vous correspondez à ses critères de sélection.</li></ul></div>
    <div class="card card--featured"><h2 style="font-size:var(--fs-lg)">Magmart vous convient si…</h2><ul class="checklist"><li>vous voulez construire <strong>votre</strong> marque et garder la valeur de votre fonds ;</li><li>vous voulez choisir vos fournisseurs et adapter l'assortiment à votre quartier ;</li><li>vous voulez quand même les méthodes, les outils et des conditions d'achat négociées.</li></ul></div>
  </div>
</div></section>''' + cta_band("Vous hésitez encore ?", "Le diagnostic (1 h) est offert, et il peut conclure que la franchise est le meilleur choix pour vous.")

# =================================================================== MENTIONS
MENTIONS = page_hero("Informations légales", "Mentions légales et confidentialité.", "Qui édite ce site, et ce que nous faisons de vos données.") + '''
<section class="section"><div class="wrap"><div class="prose">
  <h2>Éditeur du site</h2>
  <p>Magmart, <span class="todo">forme juridique et capital à compléter</span>. Siège : <span class="todo">adresse à compléter</span>. RC : <span class="todo">à compléter</span> · ICE : <span class="todo">à compléter</span> · IF : <span class="todo">à compléter</span>.</p>
  <p>Contact : <a href="mailto:contact@magmart.ma">contact@magmart.ma</a>. Directeur de la publication : <span class="todo">nom à compléter</span>.</p>
  <h2>Hébergement</h2>
  <p><span class="todo">Nom et adresse de l'hébergeur à compléter</span>.</p>
  <h2 id="donnees">Données personnelles (loi 09-08)</h2>
  <p>Les outils de « Simuler mon projet » (profil, budget, plan, rentabilité, financement) fonctionnent dans votre navigateur : vos réponses y sont enregistrées localement et <strong>ne nous sont pas transmises</strong> tant que vous ne nous les envoyez pas vous-même, par exemple sur WhatsApp. Le site charge sa police depuis Google Fonts ; un message envoyé par WhatsApp relève des conditions d'utilisation de WhatsApp (Meta).</p>
  <p>Lorsque vous nous contactez, nous utilisons vos informations uniquement pour répondre à votre demande et suivre votre projet. Elles ne sont ni vendues ni cédées. Vous pouvez demander leur accès, leur rectification ou leur suppression à <a href="mailto:contact@magmart.ma">contact@magmart.ma</a>. <span class="todo">Numéro de déclaration ou d'autorisation CNDP à compléter</span>.</p>
  <p>Pour effacer les données enregistrées dans votre navigateur, utilisez le bouton « Effacer mes données » de la page <a href="projet.html">Simuler mon projet</a>.</p>
  <h2>Estimations</h2>
  <p>Les budgets, prévisionnels et plans produits par les outils sont des estimations indicatives, sans valeur contractuelle, comptable ni fiscale. Ils sont confirmés par une proposition écrite et par les devis des entreprises.</p>
</div></div></section>'''

# ============================================================== ESPACE PROJET
PROJET = '''<div class="tool-head"><div class="wrap">
  <div class="tool-title" style="padding-top:8px"><h1>Simuler mon projet</h1><p>Cinq étapes pour vous projeter, puis un seul envoi : votre dossier complet arrive chez un conseiller Magmart.</p></div>
</div></div>
<section class="section" style="padding-top:32px"><div class="wrap hub">
  <div class="hub-steps" id="hub-steps"></div>
  <aside class="hub-side">
    <div class="card">
      <h2 style="font-size:var(--fs-lg)">Votre dossier</h2>
      <p id="hub-progress" class="muted"></p>
      <div class="hub-bar"><i id="hub-bar"></i></div>
      <dl class="hub-keys" id="hub-keys"></dl>
      <div class="hub-cta">
        <a href="demarrer.html" id="hub-next" class="btn btn--primary btn--block">Commencer : Profil</a>
        <a href="contact.html" id="hub-send" class="btn btn--ghost btn--block" target="_blank" rel="noopener">Envoyer mon dossier et réserver mon diagnostic</a>
      </div>
      <p class="muted" style="font-size:var(--fs-xs);margin:12px 0 0">Le message WhatsApp reprend toutes vos étapes. Rien n'est transmis sans votre action.</p>
    </div>
    <div class="card" style="margin-top:16px">
      <h2 style="font-size:var(--fs-md)">Vos données</h2>
      <p style="font-size:var(--fs-sm)">Elles restent dans ce navigateur. Sur un ordinateur partagé, pensez à les effacer.</p>
      <button type="button" class="btn btn--ghost btn--sm" id="hub-clear">Effacer mes données</button>
    </div>
  </aside>
</div></section>'''
