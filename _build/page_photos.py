"""Page « Photos de mon local » (photos.html) : visite guidée du local en photos, envoyée à Magmart avec le projet.
Les créneaux sont définis ici ; assets/js/photos.js lit les attributs data-* des cartes."""
import html, math
from layout import icon, WHATSAPP_ICON

# Schéma « où se placer » : local vu de dessus, façade en bas avec l'entrée ; caméra (x, y) et direction de visée en degrés
# (0 = vers la droite, 90 = vers le haut du schéma, c'est-à-dire vers le fond du local).
SLOTS = [
    ("Devant le local", "Prenez un peu de recul : nous voulons voir le local dans sa rue.", [
        ("facade", "Façade, vue de la rue", "Depuis le trottoir d'en face : toute la façade, enseigne et vitrine comprises.", True, (32, 60, 90), 3, True),
        ("rue-gauche", "La rue, côté gauche", "Devant l'entrée, tournez-vous vers la gauche : commerces voisins, stationnement, passage.", False, (32, 52, 180), 2, True),
        ("rue-droite", "La rue, côté droit", "Même chose vers la droite.", False, (32, 52, 0), 2, True),
    ]),
    ("À l'intérieur : chaque mur", "Dos au mur opposé, téléphone à l'horizontale, lumières allumées : le mur entier, du sol au plafond.", [
        ("mur-fond", "Mur du fond", "Placez-vous près de l'entrée et visez le fond du local.", True, (32, 40, 90), 3, False),
        ("mur-gauche", "Mur de gauche (en entrant)", "Dos au mur de droite, visez le mur de gauche.", True, (52, 26, 180), 3, False),
        ("mur-droit", "Mur de droite (en entrant)", "Dos au mur de gauche, visez le mur de droite.", True, (12, 26, 0), 3, False),
        ("mur-facade", "Mur de façade, vu de l'intérieur", "Depuis le fond, visez la vitrine et la porte.", True, (32, 12, 270), 3, False),
        ("vue-entree", "Vue d'ensemble depuis l'entrée", "Dans un angle près de la porte, en diagonale vers le fond.", False, (14, 40, 45), 2, False),
        ("vue-fond", "Vue d'ensemble depuis le fond", "Dans l'angle opposé, en diagonale vers l'entrée.", False, (50, 12, 225), 2, False),
    ]),
    ("Les points techniques", "Ce sont eux qui coûtent cher s'ils sont découverts tard.", [
        ("plafond", "Plafond", "Hauteur, poutres, faux plafond, état. Idéal : un mètre déplié du sol au plafond sur la photo.", True, None, 3, False),
        ("sol", "Sol", "Revêtement, état, marches ou différences de niveau.", False, None, 2, False),
        ("electricite", "Tableau électrique et compteur", "Capot ouvert si possible : nous lisons le calibre du disjoncteur général.", True, None, 3, False),
        ("eau", "Eau et évacuations", "Robinets, siphons de sol, sanitaires, regards.", False, None, 3, False),
        ("reserve", "Arrière-boutique, réserve, accès livraison", "Porte arrière, couloir, cour : par où arrivera la marchandise ?", False, None, 3, False),
        ("particularites", "Particularités", "Poteaux, escalier, mezzanine, fissures, humidité, climatisation existante…", False, None, 8, False),
    ]),
]


def diagram(cam, outside):
    """Mini-plan du local (SVG 64 × 64) avec la position du photographe et son champ de vision."""
    if not cam:
        return ""
    x, y, ang = cam
    a = math.radians(-ang)          # repère SVG : y vers le bas
    half = math.radians(28)
    r = 22
    p1 = (x + r * math.cos(a - half), y + r * math.sin(a - half))
    p2 = (x + r * math.cos(a + half), y + r * math.sin(a + half))
    room = '<path d="M8 6h48v40H38M26 46H8V6" class="ph-room"/><path d="M26 46h12" class="ph-door"/>'
    street = '<path d="M2 54h60" class="ph-street"/>' if outside else ""
    return (f'<svg class="ph-diag" viewBox="0 0 64 64" aria-hidden="true">{room}{street}'
            f'<path d="M{x:.1f} {y:.1f}L{p1[0]:.1f} {p1[1]:.1f}A{r} {r} 0 0 1 {p2[0]:.1f} {p2[1]:.1f}Z" class="ph-cone"/>'
            f'<circle cx="{x}" cy="{y}" r="3.2" class="ph-cam"/></svg>')


def slot_card(key, title, hint, essential, cam, maxn, outside):
    badge = '<span class="badge">Essentielle</span>' if essential else ""
    return f'''<article class="ph-slot" data-slot="{key}" data-title="{html.escape(title)}" data-max="{maxn}"{' data-essential' if essential else ''}>
      <div class="ph-head">{diagram(cam, outside) or f'<span class="ph-ic">{icon("camera")}</span>'}
        <div><h3>{title} {badge}</h3><p>{hint}</p></div>
        <span class="ph-state" aria-hidden="true"></span>
      </div>
      <ul class="ph-thumbs" aria-label="Photos : {html.escape(title)}"></ul>
      <div class="ph-actions">
        <label class="btn btn--secondary btn--sm ph-take">{icon("camera")}Prendre une photo<input type="file" accept="image/*" capture="environment" hidden></label>
        <label class="btn btn--ghost btn--sm">Choisir dans la galerie<input type="file" accept="image/*" multiple hidden></label>
      </div>
      <details class="ph-note"><summary>Ajouter une remarque</summary><textarea rows="2" class="field" aria-label="Remarque : {html.escape(title)}" placeholder="Ex. : fissure à droite, compteur partagé avec l'étage…"></textarea></details>
    </article>'''


def num(key, label, unit, step="0.1"):
    return f'''<div class="x-fld"><label for="pl-{key}">{label}</label>
      <div class="x-inp"><input id="pl-{key}" name="{key}" type="number" step="{step}" min="0" inputmode="decimal"><span class="x-unit">{unit}</span></div></div>'''


groups = []
for gi, (gtitle, glead, slots) in enumerate(SLOTS, 1):
    groups.append(f'''<section class="ph-group" aria-labelledby="ph-g{gi}">
    <h2 id="ph-g{gi}" class="ph-gtitle"><span class="x-num">{gi}</span>{gtitle}</h2><p class="ph-glead">{glead}</p>
    <div class="ph-grid">{"".join(slot_card(*s) for s in slots)}</div>
  </section>''')

WA_IC = WHATSAPP_ICON.replace('aria-hidden="true"', 'class="ic" aria-hidden="true"')

PHOTOS_HEAD = f'''<div class="tool-head"><div class="wrap">
  <a class="pstep-home" href="projet.html">{icon("arrow-l")}<span>Simuler mon projet</span></a>
  <div class="tool-title"><h1>Photos de mon local</h1><p>Une première visite des lieux, sans vous déplacer : une quinzaine de photos guidées et nous préparons le relevé, le plan et les points techniques avant de venir.</p></div>
</div></div>'''

PHOTOS = PHOTOS_HEAD + f'''<section class="tool-body"><div class="wrap ph-layout">
  <div class="ph-main">
    <div class="card ph-tips">
      <h2 class="x-h" style="margin-top:0">Avant de commencer</h2>
      <ul>
        <li><b>Téléphone à l'horizontale</b>, lumières allumées, local vide de personnes si possible.</li>
        <li><b>Un mur par photo</b>, pris depuis le côté opposé : le schéma de chaque carte montre où vous placer.</li>
        <li><b>Pas besoin d'être parfait.</b> Vous pouvez ajouter plusieurs photos par carte et une remarque.</li>
        <li><b>Vos photos restent sur cet appareil</b> jusqu'à l'envoi. Elles sont allégées et leur position GPS est retirée.</li>
      </ul>
    </div>
    {"".join(groups)}
    <section class="ph-group" aria-labelledby="ph-g4">
      <h2 id="ph-g4" class="ph-gtitle"><span class="x-num">4</span>Le local en quelques chiffres <span class="badge badge--info">Facultatif</span></h2>
      <p class="ph-glead">Des mesures prises au mètre, même approximatives, nous font gagner un aller-retour.</p>
      <form id="ph-form" class="x-card" novalidate>
        <div class="x-grid">
          {num("largeur", "Largeur de la façade", "m")}
          {num("profondeur", "Profondeur", "m")}
          {num("hauteur", "Hauteur sous plafond", "m", "0.05")}
          {num("surface", "Surface", "m²", "1")}
          <div class="x-fld"><label for="pl-etat">État du local</label><div class="x-inp"><select id="pl-etat" name="etat">
            <option value="">Choisir…</option><option value="brut">Brut ou à aménager</option><option value="renover">Ancien commerce, à rénover</option>
            <option value="actif">Commerce en activité</option><option value="bon">Bon état, prêt à équiper</option></select></div></div>
          <div class="x-fld"><label for="pl-adresse">Adresse ou quartier</label><div class="x-inp"><input id="pl-adresse" name="adresse" type="text" autocomplete="street-address"></div></div>
        </div>
        <div class="x-fld" style="margin-top:12px"><label for="pl-notes">Ce que nous devons savoir</label>
          <textarea id="pl-notes" name="notes" rows="3" class="field" placeholder="Loyer, bail, travaux déjà faits, contraintes du bailleur, horaires d'accès…"></textarea></div>
      </form>
    </section>
  </div>

  <aside class="ph-side">
    <div class="card ph-send" id="ph-send-card">
      <h2 style="font-size:var(--fs-lg);margin-top:0">Votre dossier photos</h2>
      <p id="ph-progress" class="muted"></p>
      <div class="hub-bar"><i id="ph-bar"></i></div>
      <form id="ph-contact" novalidate>
        <div class="x-fld"><label for="ph-nom">Nom et prénom</label><div class="x-inp"><input id="ph-nom" name="nom" type="text" required autocomplete="name"></div></div>
        <div class="x-fld"><label for="ph-tel">Téléphone ou WhatsApp</label><div class="x-inp"><input id="ph-tel" name="tel" type="tel" required autocomplete="tel" placeholder="+212 6…"></div></div>
        <label class="consent"><input type="checkbox" id="ph-consent" required><span>J'accepte que Magmart reçoive ces photos pour étudier mon projet (loi 09-08, <a href="mentions-legales.html#donnees">vos données</a>).</span></label>
        <p class="ph-error" id="ph-error" role="alert" hidden></p>
        <button type="submit" class="btn btn--primary btn--block" id="ph-send">Envoyer à Magmart</button>
      </form>
      <div class="ph-status" id="ph-status" role="status" aria-live="polite" hidden></div>
      <button type="button" class="btn btn--ghost btn--sm btn--block" id="ph-zip" style="margin-top:8px">Télécharger le dossier (.zip)</button>
      <p class="muted" style="font-size:var(--fs-xs);margin:12px 0 0" id="ph-help"></p>
    </div>
    <div class="card" style="margin-top:16px">
      <h2 style="font-size:var(--fs-md);margin-top:0">Ce que vous envoyez</h2>
      <p style="font-size:var(--fs-sm)">Les photos classées mur par mur, vos remarques et vos mesures, ainsi que votre simulation et votre plan s'ils existent. Un conseiller vous rappelle après lecture.</p>
      <button type="button" class="btn btn--ghost btn--sm" id="ph-clear">Effacer les photos de cet appareil</button>
    </div>
  </aside>
</div></section>'''
