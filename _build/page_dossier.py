"""Corps HTML de l'étape Financement (dossier.html). Les champs « d-… » sont lus par assets/js/dossier.js."""
from layout import WHATSAPP_ICON

WA_IC = WHATSAPP_ICON.replace('aria-hidden="true"', 'class="ic" aria-hidden="true"')


def num(key, label, unit, step="1", hint="", mx=None):
    h = f'<small>{hint}</small>' if hint else ""
    return f'''<div class="x-fld"><label for="d-{key}">{label}</label>
      <div class="x-inp"><input id="d-{key}" name="d-{key}" type="number" step="{step}" min="0"{f' max="{mx}"' if mx else ""} inputmode="decimal"><span class="x-unit">{unit}</span></div>{h}</div>'''


DOSSIER = f'''<section class="tool-body"><div class="wrap dsim">
  <form id="dform" class="dsim-form no-print" novalidate>
    <div class="card d-status-card">
      <h2 class="x-h" style="margin-top:0">Données reprises de votre projet</h2>
      <div class="d-status" id="d-status"></div>
      <p class="alert alert--info" id="d-missing" hidden style="margin-top:12px"><span>Complétez l'étape <a href="exploitation.html">Rentabilité</a> pour que le dossier contienne votre prévisionnel.</span></p>
    </div>

    <fieldset class="x-card"><legend><span>1</span>Le porteur de projet</legend>
      <div class="x-grid">
        <div class="x-fld"><label for="d-nom">Nom et prénom</label><div class="x-inp"><input id="d-nom" name="d-nom" type="text" autocomplete="name"></div></div>
        <div class="x-fld"><label for="d-statut">Statut juridique envisagé</label><div class="x-inp"><select id="d-statut" name="d-statut">
          <option value="pp">Personne physique</option><option value="sarlau">SARL AU</option><option value="sarl">SARL</option><option value="ae">Auto-entrepreneur</option></select></div></div>
      </div>
      <div class="x-fld" style="margin-top:12px"><label for="d-experience">Votre expérience</label>
        <textarea id="d-experience" name="d-experience" rows="3" class="field" placeholder="Commerce, gestion d'équipe, connaissance du quartier… C'est un critère clé pour la banque."></textarea></div>
    </fieldset>

    <fieldset class="x-card"><legend><span>2</span>Montage financier</legend>
      <div class="x-grid">
        {num("apport", "Apport personnel", "%", "5", "Les banques attendent souvent 20 à 30 %", 100)}
        {num("rate", "Taux du crédit", "%", "0.1")}
        {num("years", "Durée du crédit", "ans", "1")}
      </div>
      <details class="x-adv"><summary>Autres ressources : crédit-bail, crédit fournisseur, aide, honoraires</summary><div class="x-grid">
        {num("leasing", "Froid et caisse en crédit-bail", "%", "10", "Part financée par crédit-bail", 100)}
        {num("fournisseur", "Stock payé à terme", "%", "10", "Crédit fournisseur", 100)}
        {num("subvention", "Subvention ou aide", "MAD", "1000")}
        {num("honoraires", "Honoraires d'accompagnement", "MAD", "1000", "À inclure dans le besoin")}
      </div></details>
    </fieldset>

    <div class="btn-row">
      <button type="button" id="d-print" class="btn btn--secondary btn--sm">Imprimer ou enregistrer en PDF</button>
    </div>
  </form>

  <article class="dossier-doc" id="dossier-doc" aria-label="Dossier de financement"></article>
</div></section>'''
