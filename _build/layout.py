"""Gabarits communs du site Magmart : <head>, en-tête, pied de page, icônes, barre d'étapes de « Simuler mon projet ».
Toutes les pages sont générées par build.py à partir de ces gabarits."""
import html, re

WHATSAPP_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.6 2.1 1.1 1 2 1.3 2.3 1.4.3.2.4.1.6 0l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>'

# Une seule famille d'icônes au trait (grille 24, trait 1,75)
ICONS = {
    "idee": '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
    "local": '<path d="M2 15.5a5.5 5.5 0 1 0 11 0 5.5 5.5 0 1 0-11 0M11.5 11.5 21 2M17 6l3 3M15 8l2 2"/>',
    "moderniser": '<path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L22 7H6M9 21h.01M18 21h.01"/>',
    "ouvert": '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    "multisite": '<path d="M3 9l2-5h14l2 5M4 9v11h16V9M3 9h18M9 20v-6h6v6"/>',
    "user": '<path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/>',
    "calc": '<path d="M5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h8"/>',
    "plan": '<path d="M3 3h18v18H3zM3 9h18M9 21V9M15 15h3"/>',
    "chart": '<path d="M3 3v18h18M7 15l4-4 3 3 5-6"/>',
    "bank": '<path d="M3 21h18M5 21V10M19 21V10M9.5 21V10M14.5 21V10M2 10l10-7 10 7z"/>',
    "file": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4"/>',
    "check": '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3"/>',
    "eye": '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>',
    "video": '<path d="M23 7l-7 5 7 5zM1 5h15v14H1z"/>',
    "camera": '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>',
    "pen": '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    "plane": '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    "users": '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    "box": '<path d="M21 16V8l-9-5-9 5v8l9 5 9-5zM3.3 7 12 12l8.7-5M12 22V12"/>',
    "arrow-r": '<path d="M5 12h14M13 5l7 7-7 7"/>',
    "arrow-l": '<path d="M19 12H5M11 19l-7-7 7-7"/>',
}


def icon(name, cls="ic"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>'


LOGO = ('<svg viewBox="0 0 26 26" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        '<path d="M3 24V9l10-6 10 6v15" stroke="{roof}"/><path d="M8 24v-9h4v9M14 24v-9h4v9" stroke="#ef432b"/></svg>')

NAV = [
    ("offre.html", "Offre & tarifs"),
    ("projet.html", "Simuler mon projet"),
    ("a-propos.html", "À propos"),
    ("contact.html", "Contact"),
]

# Étapes de « Simuler mon projet », dans l'ordre du parcours
STEPS = [
    ("profil", "demarrer.html", "Profil", "user"),
    ("budget", "simulateur.html", "Budget", "calc"),
    ("plan", "planificateur.html", "Plan & rayons", "plan"),
    ("rentabilite", "exploitation.html", "Rentabilité", "chart"),
    ("financement", "dossier.html", "Financement", "bank"),
]


def head(title, desc, canonical):
    return f'''<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(desc)}">
  <link rel="canonical" href="https://www.magmart.ma/{canonical}">
  <meta property="og:title" content="{html.escape(title)}">
  <meta property="og:description" content="{html.escape(desc)}">
  <meta property="og:image" content="https://www.magmart.ma/assets/img/hero-magasin.jpg">
  <meta property="og:locale" content="fr_MA">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@600;700;800&family=Readex+Pro:wght@300..700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/outils.css">
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
'''


def header(current, tool=False):
    links = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h == current else ""}>{l}</a>' for h, l in NAV)
    cta = ('<a href="#" data-wa class="btn btn--ghost">Parler à un conseiller</a>' if tool
           else '<a href="demarrer.html" class="btn btn--secondary">Démarrer mon projet</a>')
    return f'''<header class="site-header">
  <div class="wrap">
    <a class="logo" href="index.html" aria-label="Magmart, accueil">{LOGO.format(roof="#1e9e5a")}MAGMART</a>
    <button type="button" class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>
    <nav class="nav" id="menu" aria-label="Navigation principale">{links}{cta}</nav>
  </div>
</header>
'''


def footer(compact=False, scripts=()):
    tags = "".join(f'\n<script src="assets/js/{s}"></script>' for s in ("main.js",) + tuple(scripts))
    wa = f'<a class="wa-float" href="#" data-wa aria-label="Écrire à Magmart sur WhatsApp">{WHATSAPP_ICON}</a>'
    if compact:
        return f'''<footer class="site-footer site-footer--compact">
  <div class="wrap footer-bottom">
    <span>© <span data-year>2026</span> Magmart · Vos données de projet restent dans votre navigateur.</span>
    <span><a href="projet.html" style="display:inline">Simuler mon projet</a> · <a href="offre.html" style="display:inline">Offre & tarifs</a> · <a href="mentions-legales.html" style="display:inline">Mentions légales</a></span>
  </div>
</footer>
{wa}{tags}
</body>
</html>
'''
    return f'''<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="logo" href="index.html">{LOGO.format(roof="#ffc83d")}MAGMART</a>
        <p>Ouvrir, moderniser et faire tourner les supérettes et supermarchés indépendants au Maroc, sous l'enseigne du commerçant.</p>
      </div>
      <div><p class="f-title">Offre</p><a href="offre.html#stades">Selon votre projet</a><a href="offre.html#formules">Formules et prix</a><a href="offre.html#apres">Après l'ouverture</a><a href="franchise-ou-enseigne.html">Franchise ou enseigne propre ?</a></div>
      <div><p class="f-title">Simuler mon projet</p><a href="demarrer.html">Démarrer mon projet</a><a href="simulateur.html">Budget d'ouverture</a><a href="planificateur.html">Plan & rayons (Studio 2D)</a><a href="exploitation.html">Rentabilité</a><a href="dossier.html">Dossier de financement</a><a href="photos.html">Photos de mon local</a></div>
      <div><p class="f-title">Magmart</p><a href="a-propos.html">À propos</a><a href="mre.html">Investir depuis l'étranger</a><a href="contact.html">Contact & diagnostic offert</a><a href="#" data-wa>WhatsApp</a></div>
    </div>
    <div class="footer-bottom"><span>© <span data-year>2026</span> Magmart. Tous droits réservés.</span><a href="mentions-legales.html" style="display:inline">Mentions légales et confidentialité</a></div>
  </div>
</footer>
{wa}{tags}
</body>
</html>
'''


def tool_head(step, title, lead):
    """En-tête compact des pages outils : barre d'étapes de « Simuler mon projet » + titre."""
    items = []
    for i, (key, href, label, ic) in enumerate(STEPS, 1):
        cur = ' aria-current="step"' if key == step else ""
        opt = '<small>facultatif</small>' if key == "plan" else ""
        items.append(f'<li data-step="{key}"><a href="{href}"{cur}><span class="pstep-n">{i}</span><span class="pstep-l">{label}{opt}</span></a></li>')
    return f'''<div class="tool-head">
  <div class="wrap">
    <nav class="pstep" aria-label="Étapes de votre projet">
      <a class="pstep-home" href="projet.html">{icon("file")}<span>Simuler mon projet</span></a>
      <ol>{"".join(items)}</ol>
    </nav>
    <div class="tool-title"><h1>{title}</h1><p>{lead}</p></div>
  </div>
</div>'''


def tool_nav(step):
    """Navigation précédent / suivant en bas des pages outils."""
    keys = [s[0] for s in STEPS]
    i = keys.index(step)
    prev = STEPS[i - 1] if i > 0 else None
    nxt = STEPS[i + 1] if i + 1 < len(STEPS) else None
    left = (f'<a class="btn btn--ghost" href="{prev[1]}">{icon("arrow-l")}{prev[2]}</a>' if prev
            else '<a class="btn btn--ghost" href="projet.html">' + icon("arrow-l") + 'Simuler mon projet</a>')
    right = (f'<a class="btn btn--primary" href="{nxt[1]}" data-next>Étape suivante : {nxt[2]}{icon("arrow-r")}</a>' if nxt
             else f'<a class="btn btn--primary" href="projet.html" data-next>Voir la synthèse et envoyer{icon("arrow-r")}</a>')
    if nxt and nxt[0] == "plan":  # l'étape Plan & rayons est facultative : on peut la passer
        right = f'<span class="tool-nav-r"><a class="tool-skip" href="{STEPS[i + 2][1]}" data-next>Passer à {STEPS[i + 2][2]}</a>{right}</span>'
    return f'<nav class="tool-nav wrap no-print" aria-label="Navigation entre les étapes">{left}{right}</nav>'


def page_hero(eyebrow, h1, lead, extra=""):
    return f'''<section class="page-hero"><div class="wrap">
  <span class="eyebrow">{eyebrow}</span><h1>{h1}</h1><p class="lead">{lead}</p>{extra}
</div></section>'''


def cta_band(title, text, primary=("demarrer.html", "Démarrer mon projet")):
    return f'''<section class="section section--cta"><div class="wrap"><div class="cta-band">
  <div><h2>{title}</h2><p>{text}</p></div>
  <div class="btn-row"><a href="{primary[0]}" class="btn btn--primary">{primary[1]}</a><a href="#" data-wa class="btn btn--ghost">{WHATSAPP_ICON.replace('aria-hidden="true"', 'class="ic" aria-hidden="true"')}WhatsApp</a></div>
</div></div></section>'''


def typo(markup):
    """Typographie française sur le texte visible : espaces insécables, apostrophes, traits d'union insécables.
    Les balises, attributs, scripts et styles ne sont pas modifiés."""
    out, skip = [], False
    for part in re.split(r"(<[^>]+>)", markup):
        if part.startswith("<"):
            tag = re.match(r"</?\s*([a-zA-Z0-9]+)", part)
            name = tag.group(1).lower() if tag else ""
            if name in ("script", "style"):
                skip = not part.startswith("</")
            out.append(part)
            continue
        if skip or not part.strip():
            out.append(part)
            continue
        t = part.replace("'", "\u2019")
        t = re.sub(r" ([;!?])", "\u202f\\1", t)
        t = re.sub(r" :", "\u00a0:", t)
        t = t.replace("« ", "«\u00a0").replace(" »", "\u00a0»")
        t = re.sub(r"(\d) (?=(%|MAD|m²|h\b|ans\b|mois\b|jours?\b|sem\.|séances\b|questions\b|minutes\b))", "\\1\u00a0", t)
        t = re.sub(r"(\d) (?=\d{3}\b)", "\\1\u202f", t)
        t = t.replace("multi-sites", "multi\u2011sites").replace("libre-service", "libre\u2011service")
        out.append(t)
    return "".join(out)


def page(path, fname, title, desc, body, current=None, tool=False, scripts=()):
    out = head(title, desc, fname) + header(current or fname, tool=tool) + f'<main id="contenu">\n{typo(body)}\n</main>\n' + footer(compact=tool, scripts=scripts)
    (path / fname).write_text(out, encoding="utf-8")
    print("écrit", fname)
