"""Corps HTML des étapes de « Simuler mon projet » : Profil (demarrer.html), Budget (simulateur.html), Plan & rayons (planificateur.html).
Les identifiants sont lus par onboarding.js, main.js et planner.js."""
from layout import icon, WHATSAPP_ICON
from tarifs import STADES

WA_IC = WHATSAPP_ICON.replace('aria-hidden="true"', 'class="ic" aria-hidden="true"')

# Mobilier du Studio 2D, couleurs dans les nuances de la charte — doit correspondre à CATALOG dans planner.js
CATALOG = [
    ("gondole", "Gondole centrale", "2,5 × 1,0 m · double face", "#15803d"),
    ("murale", "Gondole murale", "3,0 × 0,5 m", "#166534"),
    ("tete", "Tête de gondole", "1,0 × 0,5 m", "#ca8a04"),
    ("promo", "Îlot promotion", "1,2 × 0,8 m", "#a16207"),
    ("froid", "Froid mural", "2,5 × 0,9 m · frais", "#334155"),
    ("bahut", "Bahut surgelés", "2,0 × 0,9 m", "#475569"),
    ("boissons", "Armoire boissons", "1,4 × 0,75 m", "#64748b"),
    ("vitrine", "Vitrine service", "2,5 × 1,1 m · boucherie", "#92400e"),
    ("fl", "Étal F&L", "2,0 × 1,2 m", "#4d7c0f"),
    ("pain", "Présentoir pain", "1,5 × 0,6 m", "#b45309"),
    ("caisse", "Caisse", "1,8 × 0,9 m", "#1f2a37"),
    ("web", "Poste web", "2,0 × 0,8 m · préparation", "#0f766e"),
    ("chambre", "Chambre froide", "3,0 × 2,5 m", "#52525b"),
    ("rack", "Rack réserve", "2,7 × 1,0 m", "#a8a29e"),
]
ZONES = [
    ("vente", "Vente", "#15803d"), ("fl", "Fruits & légumes", "#4d7c0f"), ("frais", "Frais & crèmerie", "#334155"),
    ("surgeles", "Surgelés", "#475569"), ("boucherie", "Boucherie", "#92400e"), ("boulangerie", "Boulangerie", "#b45309"),
    ("caisses", "Caisses", "#1f2a37"), ("reserve", "Réserve", "#78716c"), ("reception", "Réception", "#a16207"),
    ("web", "Préparation web", "#0f766e"), ("bureau", "Bureau & sanitaires", "#94a3b8"),
]


def fld(id_, label, step="0.1", unit=True):
    inp = f'<input id="{id_}" type="number" step="{step}" min="0" inputmode="decimal">'
    return f'<div class="fld"><label for="{id_}">{label}</label>{"<div class=unit>" + inp + "</div>" if unit else inp}</div>'


# ============================================================ 1. PROFIL
stade_choices = "".join(f'''<label class="choice"><input type="radio" name="stade" value="{s["key"]}" required>
  <span><i class="ic-tile">{icon(s["key"])}</i><b>{s["titre"]}</b><small>{s["sous"]}</small></span></label>''' for s in STADES)

WIZARD = f'''<section class="tool-body"><div class="wrap wizard">
  <div class="resume" id="wz-resume" hidden>
    <span>Vous avez déjà commencé votre projet sur ce navigateur.</span>
    <span class="btn-row"><button type="button" class="btn btn--secondary btn--sm" id="wz-continue">Reprendre</button><button type="button" class="btn btn--ghost btn--sm" id="wz-restart">Recommencer</button></span>
  </div>
  <div class="wz-progress" id="wz-progress" aria-hidden="true"></div>
  <div class="wz-meta"><span id="wz-count"></span><span>Environ 3 minutes · sans inscription</span></div>

  <form class="wz-card" id="wizard" novalidate>
    <div class="wz-step" data-step="1">
      <h2>Où en est votre projet ?</h2>
      <p>Choisissez votre point de départ : la suite s'adapte à votre situation.</p>
      <fieldset class="choices choices--stades"><legend class="sr-only">Stade du projet</legend>{stade_choices}</fieldset>
      <label class="mre-toggle"><input type="checkbox" name="mre"> <span>{icon("plane")}Je vis à l'étranger et je suivrai le projet à distance</span></label>
    </div>

    <div class="wz-step" data-step="2" hidden>
      <h2>Le local</h2>
      <p>Pas encore de local ? Indiquez la surface visée : nous vous aiderons à le choisir.</p>
      <fieldset class="choices choices--compact" id="q-local"><legend>Où en êtes-vous avec le local ?</legend>
        <label class="choice"><input type="radio" name="local" value="recherche"><span><b>Je cherche</b><small>Pas encore de local</small></span></label>
        <label class="choice"><input type="radio" name="local" value="nego"><span><b>En vue</b><small>Un ou plusieurs locaux en négociation</small></span></label>
        <label class="choice"><input type="radio" name="local" value="signe"><span><b>Signé</b><small>Bail ou achat conclu</small></span></label>
      </fieldset>
      <div class="wz-fields">
        <div><label class="lbl" for="wz-ville">Ville</label><input class="field" type="text" id="wz-ville" name="ville" list="villes" placeholder="Ex. : Agadir" required autocomplete="address-level2">
          <datalist id="villes"><option>Casablanca</option><option>Rabat</option><option>Marrakech</option><option>Tanger</option><option>Fès</option><option>Agadir</option><option>Meknès</option><option>Oujda</option><option>Kénitra</option><option>Tétouan</option><option>El Jadida</option><option>Laâyoune</option><option>Mohammedia</option><option>Béni Mellal</option><option>Nador</option></datalist></div>
        <div><label class="lbl" for="wz-surface"><span id="lbl-surface-txt">Surface du magasin</span> <output id="wz-surface-out" for="wz-surface">200 m²</output></label><input type="range" id="wz-surface" name="surface" min="40" max="1500" step="10" value="200"></div>
      </div>
      <fieldset class="choices choices--compact" id="q-etat"><legend>État du local</legend>
        <label class="choice"><input type="radio" name="etat" value="brut"><span><b>Brut</b><small>Plateau nu</small></span></label>
        <label class="choice"><input type="radio" name="etat" value="renover"><span><b>À rénover</b><small>Ancien commerce</small></span></label>
        <label class="choice"><input type="radio" name="etat" value="amenage"><span><b>Déjà aménagé</b><small>Peu de travaux</small></span></label>
      </fieldset>
    </div>

    <div class="wz-step" data-step="3" hidden>
      <h2>Votre magasin</h2>
      <fieldset class="choices choices--compact"><legend>Format</legend>
        <label class="choice"><input type="radio" name="format" value="proxi" required><span><b>Proximité</b><small>Le quotidien du quartier</small></span></label>
        <label class="choice"><input type="radio" name="format" value="premium"><span><b>Premium</b><small>Qualité et service</small></span></label>
        <label class="choice"><input type="radio" name="format" value="super"><span><b>Supermarché</b><small>Courses complètes</small></span></label>
        <label class="choice"><input type="radio" name="format" value="conseil"><span><b>Je ne sais pas</b><small>Magmart me conseille</small></span></label>
      </fieldset>
      <fieldset class="choices choices--compact"><legend>Rayons et services souhaités <span class="muted">(facultatif)</span></legend>
        <label class="choice"><input type="checkbox" name="rayons" value="fl"><span><b>Fruits & légumes</b></span></label>
        <label class="choice"><input type="checkbox" name="rayons" value="boucherie"><span><b>Boucherie</b></span></label>
        <label class="choice"><input type="checkbox" name="rayons" value="boulangerie"><span><b>Boulangerie</b></span></label>
        <label class="choice"><input type="checkbox" name="rayons" value="ecom"><span><b>Vente en ligne</b></span></label>
      </fieldset>
      <div class="wz-fields">
        <div id="q-budget"><label class="lbl" for="wz-budget">Budget global envisagé</label><select class="field" id="wz-budget" name="budget">
          <option value="">Je ne sais pas encore</option><option value="&lt;500k">Moins de 500 000 MAD</option><option value="500k-1.5M">500 000 – 1 500 000 MAD</option><option value="1.5-4M">1,5 – 4 M MAD</option><option value="&gt;4M">Plus de 4 M MAD</option></select></div>
        <div><label class="lbl" for="wz-date" id="lbl-date">Ouverture souhaitée</label><input class="field" type="month" id="wz-date" name="date" pattern="[0-9]{4}-[0-9]{2}" placeholder="AAAA-MM"></div>
      </div>
    </div>

    <div class="wz-step" data-step="4" hidden>
      <span class="eyebrow">Votre recommandation</span>
      <h2 id="reco-title">Voici ce que nous vous proposons</h2>
      <div id="reco"></div>
      <div class="reco-actions">
        <a href="simulateur.html" class="btn btn--primary" id="reco-next"><span id="reco-next-label">Continuer : mon budget d'ouverture</span>{icon("arrow-r")}</a>
        <a href="contact.html" class="btn btn--ghost" id="reco-wa" target="_blank" rel="noopener">{WA_IC}Réserver mon diagnostic maintenant</a>
      </div>
      <p class="muted" style="font-size:var(--fs-xs);margin-top:16px">Estimation indicative et non contractuelle, confirmée par une proposition écrite, en général sous 72 h après le diagnostic.</p>
    </div>

    <p class="wz-error" id="wz-error" role="alert"></p>
    <div class="wz-nav">
      <button type="button" class="btn btn--ghost" id="wz-prev">{icon("arrow-l")}Retour</button>
      <button type="button" class="btn btn--primary" id="wz-next">Continuer</button>
    </div>
  </form>
</div></section>'''

# ============================================================ 2. BUDGET
SIMULATEUR = f'''<section class="tool-body"><div class="wrap tool-layout">
  <form class="card sim-form" id="sim" onsubmit="return false">
    <fieldset class="seg"><legend>Format visé</legend>
      <label><input type="radio" name="format" value="proxi" checked><span>Proximité</span></label>
      <label><input type="radio" name="format" value="premium"><span>Premium</span></label>
      <label><input type="radio" name="format" value="super"><span>Supermarché</span></label>
    </fieldset>
    <div class="range-field"><label class="lbl" for="surface">Surface totale du local <output id="surface-out" for="surface">200 m²</output></label>
      <input type="range" id="surface" name="surface" min="40" max="1500" step="10" value="200"></div>
    <fieldset class="seg"><legend>État du local</legend>
      <label><input type="radio" name="etat" value="brut"><span>Brut</span></label>
      <label><input type="radio" name="etat" value="renover" checked><span>À rénover</span></label>
      <label><input type="radio" name="etat" value="amenage"><span>Déjà aménagé</span></label>
    </fieldset>
    <fieldset class="seg"><legend>Options</legend>
      <label><input type="checkbox" name="frais" value="1"><span>Boucherie ou boulangerie</span></label>
      <label><input type="checkbox" name="ecom" value="1" checked><span>Vente en ligne</span></label>
    </fieldset>
    <p class="muted" style="font-size:var(--fs-xs);margin:0">Hors pas-de-porte, loyer et achat du local. Ordres de grandeur observés au Maroc, affinés sur devis lors du diagnostic.</p>
  </form>
  <div class="card tool-result">
    <span class="eyebrow">Budget d'ouverture estimé</span>
    <div class="sim-total" id="sim-total" aria-live="polite">—</div>
    <div class="sim-range" id="sim-range"></div>
    <ul class="sim-lines" id="sim-lines"></ul>
    <div class="kpis" id="sim-kpis"></div>
    <a href="projet.html" class="step-link">Enregistré · voir la synthèse de mon projet</a>
    <p class="muted" style="font-size:var(--fs-xs);margin:12px 0 0">Le chiffre d'affaires de référence est une hypothèse prudente de ventes au m², pas une prévision : l'étape Rentabilité l'affine.</p>
  </div>
</div></section>'''

# ============================================================ 3. PLAN & RAYONS
palette = "".join(f'<button type="button" data-add="{k}"><i style="background:{c}"></i><span>{l}<small>{d}</small></span></button>' for k, l, d, c in CATALOG)
zone_btns = "".join(f'<button type="button" data-zone="{k}" aria-pressed="false"><i style="background:{c}"></i>{l}</button>' for k, l, c in ZONES)

STUDIO = f'''<section class="studio"><div class="wrap">
  <p class="studio-mobile alert alert--info"><span>Le Studio 2D se manipule plus confortablement sur un ordinateur. Sur téléphone, utilisez « Générer une implantation type » puis ajustez.</span></p>
  <div class="studio-grid">
  <aside class="studio-panel" aria-label="Outils de conception">
    <div class="tabs" role="tablist">
      <button type="button" role="tab" id="tab-local" aria-controls="panel-local" data-tab="local" aria-selected="true"><span>1</span>Local</button>
      <button type="button" role="tab" id="tab-zones" aria-controls="panel-zones" data-tab="zones" aria-selected="false" tabindex="-1"><span>2</span>Zones</button>
      <button type="button" role="tab" id="tab-mobilier" aria-controls="panel-mobilier" data-tab="mobilier" aria-selected="false" tabindex="-1"><span>3</span>Mobilier</button>
      <button type="button" role="tab" id="tab-planogramme" aria-controls="panel-planogramme" data-tab="planogramme" aria-selected="false" tabindex="-1"><span>4</span>Rayons</button>
    </div>

    <div class="tab-panel" role="tabpanel" id="panel-local" aria-labelledby="tab-local" data-panel="local">
      <fieldset class="seg"><legend>Forme du local</legend>
        <label><input type="radio" name="shape" value="rect"><span>Rectangle</span></label>
        <label><input type="radio" name="shape" value="L"><span>En L</span></label>
      </fieldset>
      <div class="fields-2">{fld("in-W", "Largeur (façade)")}{fld("in-D", "Profondeur")}{fld("in-H", "Hauteur sous plafond")}</div>
      <div id="l-fields" class="fields-2" hidden>
        <p class="hint" style="grid-column:1/-1">Partie retirée en haut à droite du plan :</p>
        {fld("in-nW", "Retrait en largeur")}{fld("in-nD", "Retrait en profondeur")}
      </div>
      <div><h2 class="panel-h">Entrée</h2><div class="fields-2">{fld("in-doorX", "Depuis le mur gauche")}{fld("in-doorW", "Largeur de l'entrée")}</div></div>
      <button type="button" id="btn-template" class="btn btn--secondary btn--block">Générer une implantation type</button>
      <p class="hint">Réserve au fond, froid le long du mur, rayons en allées de 1,6 m, caisses près de l'entrée, planogramme de départ. Ajustez ensuite librement.</p>
    </div>

    <div class="tab-panel" role="tabpanel" id="panel-zones" aria-labelledby="tab-zones" data-panel="zones" hidden>
      <div><h2 class="panel-h">Délimiter les espaces</h2><p class="hint">Choisissez un type d'espace, puis faites glisser sur le plan pour le dessiner.</p></div>
      <div class="zone-btns">{zone_btns}</div>
      <div class="zone-hint" id="zone-hint" hidden>Mode dessin actif : cliquez-glissez sur le plan. Échap pour quitter.</div>
      <div><h2 class="panel-h">Espaces dessinés</h2><ul class="zone-list" id="zone-list"></ul></div>
    </div>

    <div class="tab-panel" role="tabpanel" id="panel-mobilier" aria-labelledby="tab-mobilier" data-panel="mobilier" hidden>
      <div><h2 class="panel-h">Ajouter du mobilier</h2><p class="hint">Cliquez pour poser l'élément au centre, puis déplacez-le sur le plan. Dimensions réelles, modifiables.</p></div>
      <div class="palette">{palette}</div>
      <p class="hint"><span class="kbd">R</span> pivoter · <span class="kbd">Ctrl</span>+<span class="kbd">D</span> dupliquer · <span class="kbd">Suppr</span> effacer · flèches : 10 cm</p>
    </div>

    <div class="tab-panel" role="tabpanel" id="panel-planogramme" aria-labelledby="tab-planogramme" data-panel="planogramme" hidden>
      <div><h2 class="panel-h">Du plan au planogramme</h2><p class="hint">Affectez une famille de produits à chaque tablette : la coupe projette le rayon tel que le client le verra.</p></div>
      <ol class="hint" style="padding-left:1.1em;display:grid;gap:6px;margin:0">
        <li>Placez la ligne de coupe (curseur « Position »).</li>
        <li>Cliquez sur un meuble, dans la coupe ou sur le plan.</li>
        <li>Peignez ses tablettes dans l'éditeur.</li>
      </ol>
      <a href="#pg-card" class="btn btn--secondary btn--block">Ouvrir l'éditeur de rayons</a>
    </div>

    <div class="sel-props" id="sel-props" hidden>
      <b id="sel-name"></b>
      <div id="sel-item-fields" class="fields-2">{fld("sel-w", "Longueur")}{fld("sel-d", "Profondeur")}</div>
      <small class="muted">Hauteur ou surface : <span id="sel-h"></span></small>
      <div class="sel-actions">
        <button type="button" id="sel-rotate" class="btn btn--ghost btn--sm">Pivoter</button>
        <button type="button" id="sel-dup" class="btn btn--ghost btn--sm">Dupliquer</button>
        <button type="button" id="sel-del" class="btn btn-danger btn--sm">Supprimer</button>
      </div>
    </div>
  </aside>

  <div class="studio-main">
    <div class="studio-card toolbar">
      <button type="button" id="btn-undo" class="btn btn--ghost btn--sm">Annuler</button>
      <button type="button" id="btn-reset" class="btn btn--ghost btn--sm">Recommencer</button>
      <span class="sep"></span>
      <details class="menu"><summary class="btn btn--ghost btn--sm">Exporter</summary>
        <div class="menu-list">
          <button type="button" id="btn-png">Plan en image (PNG)</button>
          <button type="button" id="btn-svg">Plan vectoriel (SVG)</button>
          <button type="button" id="cut-png">Coupe en image (PNG)</button>
          <button type="button" id="btn-print">Imprimer ou PDF</button>
          <button type="button" id="btn-cad">Dossier pour la CAO (JSON)</button>
        </div></details>
      <a href="projet.html" class="btn btn--ghost btn--sm">Voir la synthèse</a>
    </div>

    <div class="studio-card stats-row" aria-live="polite">
      <div><b id="st-surf">—</b><small>Surface du local</small></div>
      <div><b id="st-vente">—</b><small>Zones de vente</small></div>
      <div><b id="st-lin">—</b><small>Linéaire au sol</small></div>
      <div><b id="st-dev">—</b><small>Linéaire développé (longueur totale de tablettes)</small></div>
      <div><b id="st-froid">—</b><small>Linéaire froid</small></div>
      <div><b id="st-caisses">—</b><small>Caisses</small></div>
      <div><b id="st-occ">—</b><small>Surface occupée par le mobilier</small></div>
    </div>

    <div class="studio-card">
      <div class="view-head">
        <h2 class="sr-only">Vue du magasin</h2>
        <fieldset class="seg"><legend class="sr-only">Type de vue</legend>
          <label><input type="radio" name="viewmode" value="2d" checked><span>Plan 2D</span></label>
          <label><input type="radio" name="viewmode" value="3d"><span>Vue 3D</span></label>
        </fieldset>
      </div>
      <div class="plan-wrap"><svg id="plan" role="img" aria-label="Vue en plan du magasin"></svg></div>
      <div id="view3d" class="view3d" hidden>
        <div class="v3d-bar">
          <button type="button" id="v3d-orbit" class="btn btn--ghost btn--sm">Vue d'ensemble</button>
          <button type="button" id="v3d-walk" class="btn btn--secondary btn--sm">Visiter à hauteur d'homme</button>
          <span class="sep"></span>
          <button type="button" id="v3d-shot" class="btn btn--ghost btn--sm">Capture PNG</button>
        </div>
        <div class="v3d-stage">
          <div id="v3d-canvas" class="v3d-canvas" aria-label="Vue 3D interactive du magasin" role="img"></div>
          <p id="v3d-status" class="v3d-status" hidden>Chargement de la vue 3D…</p>
          <div id="v3d-walkpad" class="v3d-walkpad" hidden>
            <button type="button" id="v3d-fwd" aria-label="Avancer">▲</button>
            <button type="button" id="v3d-back" aria-label="Reculer">▼</button>
          </div>
        </div>
        <p class="studio-note v3d-help">Vue d'ensemble : faites glisser pour tourner, molette ou pincement pour zoomer, clic droit pour déplacer. Visite : faites glisser pour regarder, flèches ou Z/Q/S/D pour marcher. La 3D suit chaque modification du plan.</p>
      </div>
    </div>
    <script type="importmap">{{"imports": {{"three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js", "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}}}</script>

    <div class="studio-card">
      <div class="coupe-head">
        <h2>Vue en coupe et rayons projetés</h2>
        <fieldset class="seg"><legend class="sr-only">Sens de la coupe</legend>
          <label><input type="radio" name="cutdir" value="A"><span>A-A transversale</span></label>
          <label><input type="radio" name="cutdir" value="B"><span>B-B longitudinale</span></label>
        </fieldset>
        <label class="cut-pos"><span>Position</span><input type="range" id="cut-pos" min="0.02" max="0.98" step="0.01"></label>
        <label class="pg-toggle"><input type="checkbox" id="cut-pg" checked> Afficher les rayons</label>
      </div>
      <div class="plan-wrap coupe-scroll"><svg id="coupe" role="img" aria-label="Vue en coupe du magasin avec planogramme projeté"></svg></div>
      <p class="studio-note" style="padding:0 16px 14px">Les faces tournées vers vous sont projetées en élévation ; les meubles traversés montrent leur profil. Cliquez sur un meuble pour éditer ses rayons.</p>
    </div>

    <div class="studio-card" id="pg-card">
      <div class="pg-head">
        <h2>Éditeur de rayons (planogramme : ce qui se trouve sur chaque tablette)</h2>
        <span class="sep"></span>
        <button type="button" id="pg-auto" class="btn btn--secondary btn--sm">Planogramme type pour tout le magasin</button>
      </div>
      <p class="studio-note" id="pg-empty" style="padding:0 18px 18px">Ajoutez des gondoles, murales ou meubles froids (ou générez une implantation type) pour construire leurs rayons.</p>
      <div id="pg-body">
        <div class="pg-controls no-print">
          <div class="fld" style="min-width:240px;flex:1"><label for="pg-item">Meuble</label><select id="pg-item" class="field"></select></div>
          <fieldset class="seg"><legend>Face</legend><div id="pg-faces" style="display:contents"></div></fieldset>
          <div class="fld"><label for="pg-levels">Niveaux</label>
            <div class="stepper"><button type="button" id="pg-lv-minus" aria-label="Retirer un niveau">−</button><input id="pg-levels" type="number" min="1" max="10" inputmode="numeric"><button type="button" id="pg-lv-plus" aria-label="Ajouter un niveau">+</button></div></div>
          <button type="button" id="pg-flip" class="btn btn--ghost btn--sm">Retourner la face</button>
        </div>
        <div class="pg-controls no-print">
          <div style="flex:1;min-width:260px"><p class="lbl">Famille de produits</p><div class="pg-palette" id="pg-palette"></div></div>
        </div>
        <div class="pg-controls no-print">
          <fieldset class="seg"><legend>Pinceau</legend>
            <label><input type="radio" name="pgbrush" value="cell" checked><span>Case</span></label>
            <label><input type="radio" name="pgbrush" value="module"><span>Module entier</span></label>
            <label><input type="radio" name="pgbrush" value="level"><span>Niveau entier</span></label></fieldset>
          <div class="fld" style="flex:1;min-width:200px"><label for="pg-label">Libellé (facultatif : marque, produit)</label><input id="pg-label" type="text" class="field" placeholder="Ex. Huile 1 L"></div>
        </div>
        <div class="plan-wrap"><svg id="pg-svg" role="img" aria-label="Élévation du meuble avec son planogramme"></svg></div>
        <div class="pg-foot no-print">
          <button type="button" id="pg-clear" class="btn btn-danger btn--sm">Vider ce meuble</button>
          <span class="sep"></span>
          <button type="button" id="pg-png" class="btn btn--ghost btn--sm">Image PNG</button>
          <button type="button" id="pg-svgx" class="btn btn--ghost btn--sm">SVG</button>
        </div>
      </div>
      <div class="pg-stats-wrap">
        <h3>Linéaire développé par famille</h3>
        <ul class="pg-stats" id="pg-stats"></ul>
      </div>
    </div>

    <div class="studio-card" style="padding:16px 18px">
      <h2 class="panel-h">Contrôles automatiques</h2>
      <ul class="alerts" id="alerts"></ul>
      <p class="studio-note" style="margin-top:12px">Esquisse indicative. Le plan définitif est établi par Magmart après relevé du local et étude des contraintes techniques (électricité, froid, évacuations, sécurité incendie).</p>
    </div>
  </div>
  </div>
</div></section>'''
