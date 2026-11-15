/* MAGMART — Studio 2D : esquisse d'implantation d'un magasin.
   Toutes les coordonnées sont en mètres. Origine en haut à gauche du local ;
   x vers la droite (largeur), y vers la façade (profondeur). L'entrée est sur la façade (y = D).
   Dépend de main.js (Projet, waLink). */

(() => {
  const plan = document.getElementById("plan");
  if (!plan) return;
  const coupe = document.getElementById("coupe");
  const NS = "http://www.w3.org/2000/svg";
  const STORE = "magmart-plan";

  /* ---------------- Catalogue (dimensions courantes du marché) ---------------- */
  const CATALOG = {
    gondole:  { label: "Gondole centrale double face", short: "Gondole", w: 2.5, d: 1.0, h: 1.6, color: "#15803d", lin: 2, cat: "rayon" },
    murale:   { label: "Gondole murale", short: "Murale", w: 3.0, d: 0.5, h: 2.0, color: "#166534", lin: 1, cat: "rayon" },
    tete:     { label: "Tête de gondole", short: "TG", w: 1.0, d: 0.5, h: 1.6, color: "#ca8a04", lin: 1, cat: "rayon" },
    promo:    { label: "Îlot promotion", short: "Promo", w: 1.2, d: 0.8, h: 1.2, color: "#a16207", cat: "rayon" },
    froid:    { label: "Meuble froid mural (frais)", short: "Froid +", w: 2.5, d: 0.9, h: 2.0, color: "#334155", cold: 1, cat: "froid" },
    bahut:    { label: "Bahut surgelés", short: "Surgelés", w: 2.0, d: 0.9, h: 0.9, color: "#475569", cold: 1, cat: "froid" },
    boissons: { label: "Armoire boissons vitrée", short: "Boissons", w: 1.4, d: 0.75, h: 2.0, color: "#64748b", cold: 1, cat: "froid" },
    vitrine:  { label: "Vitrine service (boucherie, fromage)", short: "Vitrine", w: 2.5, d: 1.1, h: 1.3, color: "#92400e", cold: 1, cat: "froid" },
    fl:       { label: "Étal fruits & légumes", short: "F&L", w: 2.0, d: 1.2, h: 0.9, color: "#4d7c0f", cat: "frais" },
    pain:     { label: "Présentoir pain & viennoiserie", short: "Pain", w: 1.5, d: 0.6, h: 1.6, color: "#b45309", cat: "frais" },
    caisse:   { label: "Comptoir de caisse", short: "Caisse", w: 1.8, d: 0.9, h: 1.0, color: "#1f2a37", cat: "caisse" },
    web:      { label: "Poste de préparation des commandes web", short: "Web", w: 2.0, d: 0.8, h: 0.9, color: "#0f766e", cat: "service" },
    chambre:  { label: "Chambre froide", short: "Ch. froide", w: 3.0, d: 2.5, h: 2.4, color: "#52525b", cat: "reserve" },
    rack:     { label: "Rack de réserve", short: "Rack", w: 2.7, d: 1.0, h: 2.5, color: "#a8a29e", cat: "reserve" },
  };
  const ZONES = {
    vente:       { label: "Surface de vente", color: "#15803d", sales: 1 },
    fl:          { label: "Fruits & légumes", color: "#4d7c0f", sales: 1 },
    frais:       { label: "Frais & crèmerie", color: "#334155", sales: 1 },
    surgeles:    { label: "Surgelés", color: "#475569", sales: 1 },
    boucherie:   { label: "Boucherie", color: "#92400e", sales: 1 },
    boulangerie: { label: "Boulangerie", color: "#b45309", sales: 1 },
    caisses:     { label: "Caisses & sortie", color: "#1f2a37", sales: 1 },
    reserve:     { label: "Réserve", color: "#78716c" },
    reception:   { label: "Réception", color: "#a16207" },
    web:         { label: "Préparation web", color: "#0f766e" },
    bureau:      { label: "Bureau & sanitaires", color: "#94a3b8" },
  };
  /* Planogramme : niveaux par défaut, largeur de module et nombre de faces par type de meuble */
  const PG = {
    gondole:  { levels: 5, mod: 1.25, faces: 2 },
    murale:   { levels: 6, mod: 1.25, faces: 1 },
    tete:     { levels: 5, mod: 1.0, faces: 1 },
    promo:    { levels: 3, mod: 1.2, faces: 1 },
    froid:    { levels: 5, mod: 1.25, faces: 1 },
    boissons: { levels: 5, mod: 0.7, faces: 1 },
    bahut:    { levels: 1, mod: 1.0, faces: 1 },
    vitrine:  { levels: 2, mod: 1.25, faces: 1 },
    fl:       { levels: 3, mod: 1.0, faces: 1 },
    pain:     { levels: 4, mod: 0.75, faces: 1 },
  };
  const FAMILLES = {
    pates:     { label: "Pâtes, riz & légumineuses", short: "Pâtes·riz", color: "#d97706" },
    conserves: { label: "Conserves & sauces", short: "Conserves", color: "#b45309" },
    huiles:    { label: "Huiles & condiments", short: "Huiles", color: "#ca8a04" },
    sale:      { label: "Épicerie salée & apéritif", short: "Salé", color: "#f59e0b" },
    petitdej:  { label: "Petit-déjeuner, café & thé", short: "P'tit déj", color: "#92400e" },
    sucre:     { label: "Biscuits & confiserie", short: "Sucré", color: "#ec4899" },
    boissons:  { label: "Eaux, sodas & jus", short: "Boissons", color: "#0284c7" },
    cremerie:  { label: "Crèmerie & produits laitiers", short: "Crèmerie", color: "#60a5fa" },
    charcut:   { label: "Charcuterie & traiteur", short: "Traiteur", color: "#f87171" },
    surgeles:  { label: "Surgelés", short: "Surgelés", color: "#22d3ee" },
    boucherie: { label: "Boucherie & volaille", short: "Boucherie", color: "#dc2626" },
    fl:        { label: "Fruits & légumes", short: "F&L", color: "#65a30d" },
    pain:      { label: "Boulangerie & viennoiserie", short: "Pain", color: "#d4a373" },
    hygiene:   { label: "Hygiène & beauté", short: "Hygiène", color: "#a78bfa" },
    entretien: { label: "Entretien & droguerie", short: "Entretien", color: "#7c3aed" },
    bebe:      { label: "Bébé", short: "Bébé", color: "#f9a8d4" },
    promo:     { label: "Promotions & saisonnier", short: "Promo", color: "#fb7185" },
  };
  const AISLE_MIN = 1.2;
  const SNAP = 0.1;

  /* ---------------- État ---------------- */
  const r1 = (v) => Math.round(v * 10) / 10;
  const snap = (v) => Math.round(v / SNAP) * SNAP;
  const uid = () => Math.random().toString(36).slice(2, 9);
  const num = (v) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(v);

  function defaultState() {
    const surf = (typeof Projet !== "undefined" && Projet.get().surface) || 200;
    const W = Math.max(6, Math.round(Math.sqrt(surf * 1.3) * 2) / 2);
    const D = Math.max(5, Math.round((surf / W) * 2) / 2);
    return { shape: "rect", W, D, H: 3.5, nW: Math.round(W / 3), nD: Math.round(D / 3), doorX: r1(W / 2 - 1), doorW: 2,
             zones: [], items: [], cut: { dir: "A", pos: 0.55 } };
  }
  let S;
  try { S = JSON.parse(localStorage.getItem(STORE)) || defaultState(); } catch { S = defaultState(); }

  let selected = null;     // { kind: "item" | "zone", id }
  let zoneTool = null;     // type de zone en cours de dessin
  const history = [];
  const pushHistory = () => { history.push(JSON.stringify(S)); if (history.length > 60) history.shift(); };
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch { /* navigation privée */ } };

  /* ---------------- Géométrie ---------------- */
  const notch = () => (S.shape === "L" ? { x: S.W - S.nW, y: 0, w: S.nW, h: S.nD } : null);
  const area = () => S.W * S.D - (S.shape === "L" ? S.nW * S.nD : 0);
  const box = (it) => (it.rot ? { x: it.x, y: it.y, w: it.d, h: it.w } : { x: it.x, y: it.y, w: it.w, h: it.d });
  const hit = (a, b) => a.x < b.x + b.w - 1e-3 && b.x < a.x + a.w - 1e-3 && a.y < b.y + b.h - 1e-3 && b.y < a.y + a.h - 1e-3;
  const insideLocal = (r) => {
    const n = notch();
    return r.x >= -1e-3 && r.y >= -1e-3 && r.x + r.w <= S.W + 1e-3 && r.y + r.h <= S.D + 1e-3 && !(n && hit(r, n));
  };
  const outline = () => {
    const { W, D } = S;
    if (S.shape !== "L") return [[0, 0], [W, 0], [W, D], [0, D]];
    return [[0, 0], [W - S.nW, 0], [W - S.nW, S.nD], [W, S.nD], [W, D], [0, D]];
  };
  const clampItem = (it) => {
    const b = box(it);
    it.x = Math.min(Math.max(0, it.x), Math.max(0, S.W - b.w));
    it.y = Math.min(Math.max(0, it.y), Math.max(0, S.D - b.h));
  };

  /* ---------------- Contrôles (alertes) ---------------- */
  function analyse() {
    const issues = [];
    const bad = new Set();
    const boxes = S.items.map((it) => ({ it, b: box(it), c: CATALOG[it.type] }));
    boxes.forEach(({ it, b, c }) => { if (!insideLocal(b)) { bad.add(it.id); issues.push(`${c.short} hors des murs`); } });
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const A = boxes[i], B = boxes[j];
        if (hit(A.b, B.b)) { bad.add(A.it.id); bad.add(B.it.id); issues.push(`${A.c.short} et ${B.c.short} se chevauchent`); continue; }
        // Les allées ne concernent que la surface de vente ; la réserve et le poste web sont séparés par une cloison
        if (["reserve", "service"].includes(A.c.cat) || ["reserve", "service"].includes(B.c.cat)) continue;
        const ox = Math.min(A.b.x + A.b.w, B.b.x + B.b.w) - Math.max(A.b.x, B.b.x);
        const oy = Math.min(A.b.y + A.b.h, B.b.y + B.b.h) - Math.max(A.b.y, B.b.y);
        const gy = Math.max(B.b.y - (A.b.y + A.b.h), A.b.y - (B.b.y + B.b.h));
        const gx = Math.max(B.b.x - (A.b.x + A.b.w), A.b.x - (B.b.x + B.b.w));
        // Un écart de moins de 30 cm est un jointoiement, pas une allée
        const narrow = (ox > 0.3 && gy >= 0.3 && gy < AISLE_MIN - 0.01) ? gy : (oy > 0.3 && gx >= 0.3 && gx < AISLE_MIN - 0.01) ? gx : null;
        if (narrow !== null) issues.push(`Allée de ${num(narrow)} m entre ${A.c.short} et ${B.c.short} (min. ${num(AISLE_MIN)} m)`);
      }
    }
    const door = { x: S.doorX, y: S.D - 1.5, w: S.doorW, h: 1.5 };
    if (boxes.some(({ b }) => hit(b, door))) issues.push("L'entrée est encombrée (1,5 m à dégager)");
    if (S.items.length && !S.items.some((it) => it.type === "caisse")) issues.push("Aucune caisse placée");
    return { issues: [...new Set(issues)], bad };
  }

  function metrics() {
    const surf = area();
    // Les sous-zones dessinées à l'intérieur d'une zone « vente » ne sont pas comptées deux fois
    const ventes = S.zones.filter((z) => z.type === "vente");
    const within = (a, b) => a.x >= b.x - 1e-3 && a.y >= b.y - 1e-3 && a.x + a.w <= b.x + b.w + 1e-3 && a.y + a.h <= b.y + b.h + 1e-3;
    const zSales = S.zones.filter((z) => ZONES[z.type].sales && (z.type === "vente" || !ventes.some((v) => within(z, v))))
      .reduce((s, z) => s + z.w * z.h, 0);
    let lin = 0, cold = 0, foot = 0, lanes = 0;
    S.items.forEach((it) => {
      const c = CATALOG[it.type];
      lin += (c.lin || 0) * it.w;
      if (c.cold) cold += it.w;
      foot += it.w * it.d;
      if (it.type === "caisse") lanes++;
    });
    return { surf, zSales, lin, dev: lin * 5, cold, occ: surf ? foot / surf : 0, lanes };
  }

  /* ---------------- Rendu SVG ---------------- */
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  };
  const text = (parent, x, y, str, attrs = {}) => { const t = el("text", { x, y, ...attrs }, parent); t.textContent = str; return t; };

  function dimLine(g, x1, y1, x2, y2, label, vertical) {
    el("line", { x1, y1, x2, y2, class: "dim" }, g);
    const t = 0.18;
    if (vertical) { el("line", { x1: x1 - t, y1, x2: x1 + t, y2: y1, class: "dim" }, g); el("line", { x1: x2 - t, y1: y2, x2: x2 + t, y2, class: "dim" }, g); }
    else { el("line", { x1, y1: y1 - t, x2: x1, y2: y1 + t, class: "dim" }, g); el("line", { x1: x2, y1: y2 - t, x2, y2: y2 + t, class: "dim" }, g); }
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const tx = vertical ? mx - 0.15 : mx, ty = vertical ? my : my - 0.15;
    text(g, tx, ty, label, { class: "dim-txt", transform: vertical ? `rotate(-90 ${tx} ${ty})` : "" });
  }

  function renderPlan() {
    const { W, D } = S;
    const pad = 1.6;
    plan.setAttribute("viewBox", `${-pad} ${-pad} ${W + pad * 2} ${D + pad * 2 + 0.6}`);
    plan.style.aspectRatio = `${W + pad * 2} / ${D + pad * 2 + 0.6}`;
    plan.innerHTML = "";
    const defs = el("defs", {}, plan);
    const pat = el("pattern", { id: "grid", width: 1, height: 1, patternUnits: "userSpaceOnUse" }, defs);
    el("path", { d: "M1 0H0V1", fill: "none", stroke: "#dfe7e1", "stroke-width": 0.02 }, pat);
    el("path", { d: "M.5 0V1M0 .5H1", fill: "none", stroke: "#eef2ef", "stroke-width": 0.012 }, pat);

    const pts = outline().map((p) => p.join(",")).join(" ");
    el("polygon", { points: pts, fill: "#ffffff" }, plan);
    el("polygon", { points: pts, fill: "url(#grid)" }, plan);

    const { issues, bad } = analyse();

    // Zones
    const gz = el("g", {}, plan);
    S.zones.forEach((z) => {
      const Z = ZONES[z.type];
      const g = el("g", { "data-kind": "zone", "data-id": z.id, class: "zone" + (selected?.id === z.id ? " is-sel" : "") }, gz);
      el("rect", { x: z.x, y: z.y, width: z.w, height: z.h, fill: Z.color, "fill-opacity": 0.12, stroke: Z.color, "stroke-width": 0.05, "stroke-dasharray": "0.25 0.15" }, g);
      text(g, z.x + 0.15, z.y + 0.42, Z.label, { class: "zone-txt", fill: Z.color });
      text(g, z.x + 0.15, z.y + 0.78, `${num(z.w * z.h)} m²`, { class: "zone-sub", fill: Z.color });
    });

    // Murs
    el("polygon", { points: pts, fill: "none", stroke: "#1f2a37", "stroke-width": 0.22, "stroke-linejoin": "miter" }, plan);
    // Entrée
    el("rect", { x: S.doorX, y: D - 0.2, width: S.doorW, height: 0.4, fill: "#ffffff" }, plan);
    el("path", { d: `M${S.doorX} ${D} a${S.doorW / 2} ${S.doorW / 2} 0 0 1 ${S.doorW / 2} ${-S.doorW / 2}`, fill: "none", stroke: "#9ca3af", "stroke-width": 0.03 }, plan);
    el("path", { d: `M${S.doorX + S.doorW} ${D} a${S.doorW / 2} ${S.doorW / 2} 0 0 0 ${-S.doorW / 2} ${-S.doorW / 2}`, fill: "none", stroke: "#9ca3af", "stroke-width": 0.03 }, plan);
    text(plan, S.doorX + S.doorW / 2, D + 0.75, "▲ ENTRÉE", { class: "door-txt" });

    // Mobilier
    const gi = el("g", {}, plan);
    S.items.forEach((it) => {
      const c = CATALOG[it.type];
      const b = box(it);
      const g = el("g", { "data-kind": "item", "data-id": it.id, class: "item" + (selected?.id === it.id ? " is-sel" : "") + (bad.has(it.id) ? " is-bad" : "") }, gi);
      el("title", {}, g).textContent = `${c.label} — ${num(it.w)} × ${num(it.d)} m, h ${num(c.h)} m`;
      el("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 0.06, fill: c.color, "fill-opacity": 0.88, stroke: "#ffffff", "stroke-width": 0.04 }, g);
      if (c.lin === 2) { // séparation des deux faces d'une gondole
        const mid = it.rot ? { x1: b.x + b.w / 2, y1: b.y + 0.1, x2: b.x + b.w / 2, y2: b.y + b.h - 0.1 } : { x1: b.x + 0.1, y1: b.y + b.h / 2, x2: b.x + b.w - 0.1, y2: b.y + b.h / 2 };
        el("line", { ...mid, stroke: "#ffffff", "stroke-width": 0.03, "stroke-opacity": 0.7 }, g);
      }
      const vertical = b.h > b.w;
      const fs = Math.min(0.32, (vertical ? b.w : b.h) * 0.55);
      if (fs >= 0.16) {
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        text(g, cx, cy, c.short, { class: "item-txt", "font-size": fs, transform: vertical ? `rotate(-90 ${cx} ${cy})` : "" });
      }
    });

    // Ligne de coupe
    const pos = S.cut.pos;
    const gc = el("g", { class: "cutline" }, plan);
    if (S.cut.dir === "A") {
      const y = pos * D;
      el("line", { x1: -0.9, y1: y, x2: W + 0.9, y2: y }, gc);
      text(gc, -1.15, y + 0.15, "A", { class: "cut-txt" }); text(gc, W + 1.15, y + 0.15, "A", { class: "cut-txt" });
    } else {
      const x = pos * W;
      el("line", { x1: x, y1: -0.9, x2: x, y2: D + 0.9 }, gc);
      text(gc, x, -1.05, "B", { class: "cut-txt" }); text(gc, x, D + 1.35, "B", { class: "cut-txt" });
    }

    // Cotes
    const gd = el("g", {}, plan);
    if (S.shape === "L") {
      dimLine(gd, 0, -0.75, W - S.nW, -0.75, `${num(W - S.nW)} m`);
      dimLine(gd, W + 0.75, S.nD, W + 0.75, D, `${num(D - S.nD)} m`, true);
      dimLine(gd, W - S.nW, S.nD - 0.5, W, S.nD - 0.5, `${num(S.nW)} m`);
    }
    dimLine(gd, 0, S.shape === "L" ? -1.25 : -0.75, W, S.shape === "L" ? -1.25 : -0.75, `${num(W)} m`);
    dimLine(gd, -0.75, 0, -0.75, D, `${num(D)} m`, true);

    // Local vide : on indique quoi faire
    if (!S.items.length && !S.zones.length) text(plan, W / 2, D / 2, "Onglet Local : « Générer une implantation type »", { class: "plan-empty" });

    // Dessin de zone en cours
    if (drag?.kind === "draw") {
      const r = normRect(drag.x0, drag.y0, drag.x1, drag.y1);
      el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, fill: ZONES[zoneTool].color, "fill-opacity": 0.2, stroke: ZONES[zoneTool].color, "stroke-width": 0.05 }, plan);
    }

    renderPanel(issues);
  }

  /* ---------------- Planogramme : modèle ----------------
     it.pg = { levels, A: grille, B: grille } ; grille[niveau][module] = { f: famille, t: libellé } | null
     Niveau 0 = tablette du bas. Face A d'une gondole : côté +y (rot 0) ou +x (rot 1). */
  const pgItems = () => S.items.filter((it) => PG[it.type]);
  const facesOf = (it) => (PG[it.type]?.faces === 2 ? ["A", "B"] : ["A"]);
  const nMods = (it) => Math.max(1, Math.round(it.w / PG[it.type].mod));
  function ensurePg(it) {
    const def = PG[it.type];
    if (!def) return null;
    if (!it.pg) it.pg = { levels: def.levels };
    const n = nMods(it);
    facesOf(it).forEach((f) => {
      const old = it.pg[f] || [];
      it.pg[f] = Array.from({ length: it.pg.levels }, (_, l) => Array.from({ length: n }, (_, m) => old[l]?.[m] ?? null));
    });
    return it.pg;
  }
  // Normale de la face (direction vers laquelle regardent les produits)
  function faceDir(it, face) {
    if (PG[it.type]?.faces === 2) { const s = face === "A" ? 1 : -1; return it.rot ? [s, 0] : [0, s]; }
    const b = box(it);
    let d = it.rot ? [b.x + b.w / 2 < S.W / 2 ? 1 : -1, 0] : [0, b.y + b.h / 2 < S.D / 2 ? 1 : -1]; // dos au mur le plus proche
    if (it.flip) d = [-d[0], -d[1]];
    return d;
  }
  const FACE_LABEL = { "0,1": "vers l'entrée", "0,-1": "vers le fond", "1,0": "vers la droite", "-1,0": "vers la gauche" };
  const faceLabel = (it, f) => FACE_LABEL[faceDir(it, f).join(",")];
  // Vu de face, le module 0 est-il à droite ? (on regarde à l'opposé de la normale)
  function isMirror(it, face) {
    const n = faceDir(it, face), v = [-n[0], -n[1]], left = [v[1], -v[0]], axis = it.rot ? [0, 1] : [1, 0];
    return axis[0] * left[0] + axis[1] * left[1] > 0;
  }
  function levelBounds(it, l) {
    const c = CATALOG[it.type], n = it.pg.levels;
    const base = n === 1 ? 0.1 : 0.15, top = c.h - (n === 1 ? 0.05 : 0.08);
    const hh = (top - base) / n;
    return [base + l * hh, base + (l + 1) * hh];
  }
  // Texte foncé sur les couleurs claires
  const inkOn = (hex) => { const v = parseInt(hex.slice(1), 16); const L = (0.299 * (v >> 16) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255)) / 255; return L > 0.62 ? "#1f2a37" : "#ffffff"; };

  // Élévation d'une face : modules × niveaux, posée à partir de a0 sur l'axe horizontal (z vers le haut = -y)
  function drawElevation(g, it, face, a0, opts = {}) {
    const c = CATALOG[it.type], pg = ensurePg(it), grid = pg[face], n = grid[0].length, mw = it.w / n;
    el("rect", { x: a0, y: -c.h, width: it.w, height: c.h, fill: "#eef2f0", stroke: "#94a3b8", "stroke-width": 0.02 }, g);
    for (let l = 0; l < pg.levels; l++) {
      const [z0, z1] = levelBounds(it, l);
      for (let m = 0; m < n; m++) {
        const cell = grid[l][m], F = cell && FAMILLES[cell.f];
        const x = a0 + (opts.mirror ? n - 1 - m : m) * mw;
        const r = el("rect", { x: x + 0.02, y: -z1 + 0.025, width: mw - 0.04, height: z1 - z0 - 0.045, rx: 0.02, fill: F ? F.color : "#ffffff", "fill-opacity": F ? 1 : 0.8, ...(opts.cells ? { "data-cell": `${l},${m}`, class: "pg-cell" } : {}) }, g);
        el("title", {}, r).textContent = F ? F.label + (cell.t ? " · " + cell.t : "") : "Emplacement libre";
        if (opts.labels && F && mw >= 0.45 && z1 - z0 >= 0.16) {
          const fs = Math.min(opts.fs || 0.13, (z1 - z0) * 0.45);
          text(g, x + mw / 2, -(z0 + z1) / 2, cell.t || F.short, { class: "pg-txt", "font-size": fs, fill: inkOn(F.color) });
        }
      }
      el("line", { x1: a0, y1: -z0, x2: a0 + it.w, y2: -z0, stroke: "#475569", "stroke-width": 0.025 }, g); // tablette
    }
    for (let m = 1; m < n; m++) el("line", { x1: a0 + m * mw, y1: -c.h, x2: a0 + m * mw, y2: 0, stroke: "#475569", "stroke-width": 0.02 }, g); // montants
    const plinth = levelBounds(it, 0)[0];
    el("rect", { x: a0, y: -plinth, width: it.w, height: plinth, fill: "#475569" }, g);
  }

  // Profil d'un meuble coupé perpendiculairement : tablettes et produits de chaque face au droit de la coupe
  function drawProfile(g, it, a0, a1, pos, A) {
    const c = CATALOG[it.type], pg = ensurePg(it);
    const longStart = it.rot ? it.y : it.x;
    const n = nMods(it), mw = it.w / n;
    const m = Math.min(n - 1, Math.max(0, Math.floor((pos - longStart) / mw)));
    const double = PG[it.type].faces === 2, mid = (a0 + a1) / 2;
    const upright = double ? mid : null;
    facesOf(it).forEach((f) => {
      const nd = faceDir(it, f), s = A ? nd[0] : nd[1];   // +1 : la face regarde vers la droite de la coupe
      const back = double ? mid : (s > 0 ? a0 : a1);       // dos du meuble
      const front = s > 0 ? a1 : a0;
      if (!double) el("rect", { x: Math.min(back, back - s * 0.04), y: -c.h, width: 0.04, height: c.h, fill: "#475569" }, g);
      for (let l = 0; l < pg.levels; l++) {
        const [z0, z1] = levelBounds(it, l);
        const cell = pg[f][l][m], F = cell && FAMILLES[cell.f];
        const x0 = Math.min(back, front), w = Math.abs(front - back);
        if (F) el("rect", { x: x0 + 0.03, y: -z0 - (z1 - z0) * 0.72, width: w - 0.06, height: (z1 - z0) * 0.72, rx: 0.02, fill: F.color }, g);
        el("line", { x1: back, y1: -z0, x2: front, y2: -z0 + 0.03, stroke: "#334155", "stroke-width": 0.03 }, g); // tablette inclinée
      }
    });
    if (upright !== null) el("rect", { x: upright - 0.03, y: -c.h, width: 0.06, height: c.h, fill: "#334155" }, g);
    el("rect", { x: a0, y: -0.15, width: a1 - a0, height: 0.15, fill: "#475569" }, g);
  }

  function renderCoupe() {
    if (!coupe) return;
    const A = S.cut.dir === "A";
    const L = A ? S.W : S.D;
    const pos = A ? S.cut.pos * S.D : S.cut.pos * S.W;
    const H = S.H;
    coupe.setAttribute("viewBox", `-1.4 ${-H - 0.9} ${L + 2.8} ${H + 1.7}`);
    coupe.style.aspectRatio = `${L + 2.8} / ${H + 1.7}`;
    coupe.style.minWidth = `${Math.round((L + 2.8) * 58)}px`; // échelle lisible : la coupe défile horizontalement si besoin
    coupe.innerHTML = "";
    const n = notch();
    // Limites du local sur l'axe de coupe
    let start = 0, end = L;
    if (n) {
      if (A && pos < S.nD) end = S.W - S.nW;
      if (!A && pos > S.W - S.nW) start = S.nD;
    }
    el("rect", { x: start, y: -H, width: end - start, height: H, fill: "#f4f9f4" }, coupe);
    el("line", { x1: start - 0.25, y1: 0, x2: end + 0.25, y2: 0, stroke: "#1f2a37", "stroke-width": 0.08 }, coupe);
    el("line", { x1: start, y1: -H, x2: end, y2: -H, stroke: "#9ca3af", "stroke-width": 0.03, "stroke-dasharray": "0.2 0.12" }, coupe);
    el("rect", { x: start - 0.22, y: -H - 0.1, width: 0.22, height: H + 0.1, fill: "#1f2a37" }, coupe);
    if (!(!A && end === S.D)) el("rect", { x: end, y: -H - 0.1, width: 0.22, height: H + 0.1, fill: "#1f2a37" }, coupe);
    else { // façade : vitrine et porte
      el("rect", { x: end, y: -H - 0.1, width: 0.22, height: 0.9, fill: "#1f2a37" }, coupe);
      el("rect", { x: end + 0.05, y: -H + 0.8, width: 0.12, height: H - 0.8, fill: "#bfdbfe" }, coupe);
    }
    text(coupe, (start + end) / 2, -H - 0.3, `Hauteur sous plafond ${num(H)} m`, { class: "dim-txt" });

    // Mobilier coupé et mobilier vu en arrière-plan. Avec le planogramme projeté :
    // - les faces tournées vers l'observateur sont dessinées en élévation (modules × niveaux × familles) ;
    // - les meubles coupés en travers montrent leur profil, tablettes et produits des deux faces.
    const showPg = $("cut-pg") ? $("cut-pg").checked : true;
    const towards = A ? [0, 1] : [-1, 0];   // normale des faces vues depuis la coupe
    const rows = S.items.map((it) => {
      const b = box(it), c = CATALOG[it.type];
      const a0 = A ? b.x : b.y, a1 = A ? b.x + b.w : b.y + b.h;
      const p0 = A ? b.y : b.x, p1 = A ? b.y + b.h : b.x + b.w;
      const cutHere = pos >= p0 && pos <= p1;
      const behind = A ? p1 <= pos : p0 >= pos;
      const endOn = A ? !!it.rot : !it.rot;  // grand axe perpendiculaire au plan de coupe : vu par le bout
      return { it, c, a0, a1, cutHere, behind, endOn, depth: A ? pos - p1 : p0 - pos };
    }).filter((r) => r.cutHere || r.behind);
    // arrière-plan d'abord (du plus lointain au plus proche), puis le mobilier coupé
    rows.sort((a, b) => a.cutHere - b.cutHere || b.depth - a.depth).forEach((r) => {
      const g = el("g", {}, coupe);
      const pgOk = showPg && PG[r.it.type];
      const face = pgOk && !r.endOn && facesOf(r.it).find((f) => faceDir(r.it, f).join() === towards.join());
      if (pgOk && r.endOn && r.cutHere) {
        drawProfile(g, r.it, r.a0, r.a1, pos, A);
        g.setAttribute("data-pg-id", r.it.id); g.setAttribute("data-face", "A");
      } else if (face) {
        drawElevation(g, r.it, face, r.a0, { labels: true, fs: 0.11 });
        if (!r.cutHere) el("rect", { x: r.a0, y: -r.c.h, width: r.a1 - r.a0, height: r.c.h, fill: "#ffffff", "fill-opacity": Math.min(0.45, r.depth * 0.04) }, g); // profondeur
        g.setAttribute("data-pg-id", r.it.id); g.setAttribute("data-face", face);
      } else {
        el("rect", { x: r.a0, y: -r.c.h, width: r.a1 - r.a0, height: r.c.h, rx: 0.04, fill: r.c.color, "fill-opacity": r.cutHere ? 0.9 : 0.18, stroke: r.cutHere ? "#ffffff" : "none", "stroke-width": 0.03 }, g);
        if (r.cutHere && r.a1 - r.a0 > 0.7) text(g, (r.a0 + r.a1) / 2, -r.c.h / 2, r.c.short, { class: "item-txt", "font-size": 0.24 });
      }
      if (selected?.id === r.it.id) el("rect", { x: r.a0 - 0.04, y: -r.c.h - 0.04, width: r.a1 - r.a0 + 0.08, height: r.c.h + 0.04, fill: "none", stroke: "#c93c1a", "stroke-width": 0.04, "stroke-dasharray": "0.15 0.08" }, g);
    });

    // Silhouette 1,75 m dans le premier espace libre
    const cuts = rows.filter((r) => r.cutHere).map((r) => [r.a0, r.a1]);
    let px = null;
    for (let x = start + 0.6; x < end - 0.6; x += 0.1) if (!cuts.some(([a, b]) => x > a - 0.45 && x < b + 0.45)) { px = x; break; }
    if (px !== null) {
      const g = el("g", { fill: "#1f2a37", "fill-opacity": 0.75 }, coupe);
      el("circle", { cx: px, cy: -1.62, r: 0.12 }, g);
      el("path", { d: `M${px - 0.2} -1.45h0.4l0.05 0.75h-0.12l-0.05 0.7h-0.08l-0.02-0.7h-0.02l-0.02 0.7h-0.08l-0.05-0.7h-0.12z` }, g);
      text(coupe, px, 0.45, "1,75 m", { class: "dim-txt" });
    }
    dimLine(coupe, start - 0.85, 0, start - 0.85, -H, `${num(H)} m`, true);
    text(coupe, (start + end) / 2, 0.7, A ? `Coupe A-A · à ${num(pos)} m du fond` : `Coupe B-B · à ${num(pos)} m du mur gauche`, { class: "cut-cap" });
  }

  /* ---------------- Panneau latéral ---------------- */
  const $ = (id) => document.getElementById(id);
  function renderPanel(issues) {
    const m = metrics();
    $("st-surf").textContent = `${num(m.surf)} m²`;
    $("st-vente").textContent = m.zSales ? `${num(m.zSales)} m²` : "—";
    $("st-lin").textContent = `${num(m.lin)} m`;
    $("st-dev").textContent = `${Math.round(m.dev)} m`;
    $("st-froid").textContent = `${num(m.cold)} m`;
    $("st-caisses").textContent = m.lanes;
    $("st-occ").textContent = `${Math.round(m.occ * 100)} %`;
    const ul = $("alerts");
    ul.innerHTML = issues.length ? issues.slice(0, 8).map((i) => `<li>${i}</li>`).join("") + (issues.length > 8 ? `<li>+ ${issues.length - 8} autres</li>` : "")
      : `<li class="ok">${S.items.length ? "Aucune alerte : circulation et dégagements corrects." : "Ajoutez du mobilier ou générez une implantation type."}</li>`;

    // Liste des zones
    $("zone-list").innerHTML = S.zones.map((z) => `<li><span style="background:${ZONES[z.type].color}"></span>${ZONES[z.type].label} · ${num(z.w * z.h)} m²<button type="button" data-del-zone="${z.id}" aria-label="Supprimer la zone">×</button></li>`).join("") || "<li class='empty'>Aucune zone dessinée.</li>";

    // Propriétés de la sélection
    const box_ = $("sel-props");
    const it = selected?.kind === "item" ? S.items.find((i) => i.id === selected.id) : null;
    const z = selected?.kind === "zone" ? S.zones.find((i) => i.id === selected.id) : null;
    box_.hidden = !it && !z;
    if (it) {
      const c = CATALOG[it.type];
      $("sel-name").textContent = c.label;
      $("sel-w").value = it.w; $("sel-d").value = it.d; $("sel-h").textContent = `${num(c.h)} m`;
      $("sel-item-fields").hidden = false;
    } else if (z) {
      $("sel-name").textContent = ZONES[z.type].label;
      $("sel-w").value = r1(z.w); $("sel-d").value = r1(z.h); $("sel-h").textContent = `${num(z.w * z.h)} m²`;
      $("sel-item-fields").hidden = false;
    }
    $("sel-rotate").hidden = !it;
    $("sel-dup").hidden = !it;
  }

  function syncInputs() {
    document.querySelectorAll("[name=shape]").forEach((r) => (r.checked = r.value === S.shape));
    $("in-W").value = S.W; $("in-D").value = S.D; $("in-H").value = S.H;
    $("in-nW").value = S.nW; $("in-nD").value = S.nD;
    $("in-doorX").value = S.doorX; $("in-doorW").value = S.doorW;
    $("l-fields").hidden = S.shape !== "L";
    document.querySelectorAll("[name=cutdir]").forEach((r) => (r.checked = r.value === S.cut.dir));
    $("cut-pos").value = S.cut.pos;
  }

  /* ---------------- Éditeur de planogramme ---------------- */
  let pgSel = null;          // { id, face }
  let pgFam = "pates";       // famille active du pinceau ("" = gomme)
  let pgBrush = "cell";      // cell | module | level
  const pgSvg = document.getElementById("pg-svg");

  function renderPg() {
    if (!pgSvg) return;
    const list = pgItems();
    if (!pgSel || !list.some((i) => i.id === pgSel.id)) pgSel = list[0] ? { id: list[0].id, face: "A" } : null;
    $("pg-empty").hidden = !!pgSel;
    $("pg-body").hidden = !pgSel;
    renderPgStats();
    if (!pgSel) return;

    const count = {};
    $("pg-item").innerHTML = list.map((it) => {
      count[it.type] = (count[it.type] || 0) + 1;
      return `<option value="${it.id}">${CATALOG[it.type].label} n° ${count[it.type]} · ${num(it.w)} m</option>`;
    }).join("");
    $("pg-item").value = pgSel.id;
    const it = list.find((i) => i.id === pgSel.id);
    const pg = ensurePg(it);
    if (!facesOf(it).includes(pgSel.face)) pgSel.face = "A";
    $("pg-faces").innerHTML = facesOf(it).map((f) => `<label><input type="radio" name="pgface" value="${f}" ${f === pgSel.face ? "checked" : ""}><span>Face ${f} · ${faceLabel(it, f)}</span></label>`).join("");
    $("pg-flip").hidden = facesOf(it).length > 1;
    $("pg-levels").value = pg.levels;

    const c = CATALOG[it.type], w = it.w, h = c.h;
    pgSvg.setAttribute("viewBox", `-1.1 ${-h - 0.55} ${w + 3.1} ${h + 1.15}`);
    pgSvg.style.aspectRatio = `${w + 3.1} / ${h + 1.15}`;
    pgSvg.innerHTML = "";
    el("rect", { x: -0.25, y: -1.6, width: w + 0.5, height: 0.4, fill: "#ffc83d", "fill-opacity": 0.22 }, pgSvg); // zone chaude
    el("line", { x1: -0.4, y1: 0, x2: w + 1.3, y2: 0, stroke: "#1f2a37", "stroke-width": 0.04 }, pgSvg);
    drawElevation(pgSvg, it, pgSel.face, 0, { cells: true, labels: true, fs: Math.min(0.16, w / 14 + 0.06), mirror: isMirror(it, pgSel.face) });
    text(pgSvg, w + 0.75, -1.45, "Zone chaude", { class: "pg-note", "text-anchor": "start" });
    text(pgSvg, w + 0.75, -1.3, "1,20 – 1,60 m", { class: "pg-note", "text-anchor": "start" });
    const hx = w + 0.45;
    const hg = el("g", { fill: "#1f2a37", "fill-opacity": 0.55 }, pgSvg);
    el("circle", { cx: hx, cy: -1.62, r: 0.12 }, hg);
    el("path", { d: `M${hx - 0.2} -1.45h0.4l0.05 0.75h-0.12l-0.05 0.7h-0.08l-0.02-0.7h-0.02l-0.02 0.7h-0.08l-0.05-0.7h-0.12z` }, hg);
    for (let l = 0; l < pg.levels; l++) { const [z0, z1] = levelBounds(it, l); text(pgSvg, -0.25, -(z0 + z1) / 2, `N${l + 1}`, { class: "pg-note", "text-anchor": "end" }); }
    dimLine(pgSvg, 0, 0.25, w, 0.25, `${num(w)} m · ${nMods(it)} module${nMods(it) > 1 ? "s" : ""}`);
    dimLine(pgSvg, -0.7, 0, -0.7, -h, `${num(h)} m`, true);
  }

  function pgStats() {
    const tot = {};
    pgItems().forEach((it) => {
      if (!it.pg) return;
      const mw = it.w / nMods(it);
      facesOf(it).forEach((f) => (it.pg[f] || []).forEach((row) => row.forEach((cell) => { if (cell && FAMILLES[cell.f]) tot[cell.f] = (tot[cell.f] || 0) + mw; })));
    });
    return Object.entries(tot).sort((a, b) => b[1] - a[1]);
  }
  function renderPgStats() {
    const box_ = $("pg-stats");
    if (!box_) return;
    const rows = pgStats();
    const total = rows.reduce((s, [, v]) => s + v, 0);
    box_.innerHTML = rows.length ? rows.map(([f, v]) => `<li><span class="pg-dot" style="background:${FAMILLES[f].color}"></span><span>${FAMILLES[f].label}</span><span class="pg-bar"><i style="width:${(v / rows[0][1]) * 100}%;background:${FAMILLES[f].color}"></i></span><b>${num(v)} m</b><small>${Math.round((v / total) * 100)} %</small></li>`).join("")
      + `<li class="pg-total"><span></span><span>Linéaire développé planogrammé</span><span></span><b>${num(total)} m</b><small>100 %</small></li>`
      : `<li class="empty">Aucune famille placée. Utilisez « Planogramme type » ou peignez les tablettes.</li>`;
  }

  function paintCell(cellEl) {
    const it = S.items.find((i) => i.id === pgSel?.id);
    if (!it) return;
    const [l, m] = cellEl.dataset.cell.split(",").map(Number);
    const grid = it.pg[pgSel.face];
    const label = $("pg-label").value.trim();
    const val = pgFam ? { f: pgFam, ...(label ? { t: label } : {}) } : null;
    const targets = pgBrush === "module" ? grid.map((_, ll) => [ll, m]) : pgBrush === "level" ? grid[l].map((_, mm) => [l, mm]) : [[l, m]];
    targets.forEach(([ll, mm]) => {
      grid[ll][mm] = val ? { ...val } : null;
      const r = pgSvg.querySelector(`[data-cell="${ll},${mm}"]`);
      if (r) { r.setAttribute("fill", val ? FAMILLES[val.f].color : "#ffffff"); r.setAttribute("fill-opacity", val ? 1 : 0.8); }
    });
  }

  /* Planogramme type : règles de merchandising courantes en proximité */
  function autoPlanogram(overwrite = true) {
    const items = pgItems();
    items.forEach(ensurePg);
    const setFace = (it, f, famAt) => it.pg[f].forEach((row, l) => row.forEach((cell, m) => { if (overwrite || !cell) row[m] = { f: famAt(m, l) }; }));
    const FIXED = { boissons: "boissons", bahut: "surgeles", vitrine: "boucherie", fl: "fl", pain: "pain", promo: "promo", tete: "promo" };
    items.filter((i) => FIXED[i.type]).forEach((it) => facesOf(it).forEach((f) => setFace(it, f, () => FIXED[it.type])));
    // Froid mural : crèmerie puis charcuterie-traiteur le long du mur
    const froids = items.filter((i) => i.type === "froid").sort((a, b) => a.x - b.x || a.y - b.y);
    const nf = froids.reduce((s, i) => s + nMods(i), 0);
    let k = 0;
    froids.forEach((it) => { const start = k; setFace(it, "A", (m) => (start + m < nf * 0.6 ? "cremerie" : "charcut")); k += nMods(it); });
    // Murales : boissons (lourdes) côté gauche, hygiène puis entretien côté droit
    items.filter((i) => i.type === "murale").forEach((it) => {
      const b = box(it), n = nMods(it);
      const leftSide = it.rot ? b.x + b.w / 2 < S.W / 2 : b.y + b.h / 2 < S.D / 2;
      setFace(it, "A", (m) => (leftSide ? "boissons" : m < n / 2 ? "hygiene" : "entretien"));
    });
    // Gondoles : chemin logique de l'épicerie, du salé vers le sucré puis le non-alimentaire
    const SEQ = [["pates", 2], ["conserves", 2], ["huiles", 1], ["sale", 2], ["petitdej", 2], ["sucre", 2], ["bebe", 1], ["hygiene", 1], ["entretien", 1]];
    const faces = [];
    items.filter((i) => i.type === "gondole")
      .sort((a, b) => (a.rot ? a.x - b.x : a.y - b.y) || (a.rot ? a.y - b.y : a.x - b.x))
      .forEach((it) => facesOf(it).forEach((f) => faces.push([it, f])));
    const total = faces.reduce((s, [it]) => s + nMods(it), 0);
    const wsum = SEQ.reduce((s, [, w]) => s + w, 0);
    const famAt = (i) => { const t = (i / Math.max(1, total)) * wsum; let acc = 0; for (const [f, w] of SEQ) { acc += w; if (t < acc) return f; } return SEQ[SEQ.length - 1][0]; };
    let idx = 0;
    faces.forEach(([it, f]) => { const start = idx; setFace(it, f, (m) => famAt(start + m)); idx += nMods(it); });
  }

  // Export d'un SVG (plan, coupe ou planogramme) en fichier
  function exportNode(node, name, png) {
    const svgText = svgString(node);
    if (!png) { download(new Blob([svgText], { type: "image/svg+xml" }), name + ".svg"); return; }
    const img = new Image();
    const src = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml" }));
    img.onload = () => {
      const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height;
      const ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(img, 0, 0);
      cv.toBlob((b) => download(b, name + ".png")); URL.revokeObjectURL(src);
    };
    img.src = src;
  }

  function render() { renderPlan(); renderCoupe(); renderPg(); save(); window.dispatchEvent(new Event("magmart:plan")); }

  // Données et fonctions partagées avec la vue 3D (studio3d.js, chargé à la demande)
  window.MagmartStudio = { get state() { return S; }, CATALOG, ZONES, FAMILLES, PG, box, outline, notch, faceDir, facesOf, nMods, levelBounds, ensurePg };

  /* ---------------- Interaction souris / tactile ---------------- */
  let drag = null;
  const toLocal = (e) => {
    const p = plan.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(plan.getScreenCTM().inverse());
    return { x: q.x, y: q.y };
  };
  const normRect = (x0, y0, x1, y1) => ({ x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) });

  plan.addEventListener("pointerdown", (e) => {
    const p = toLocal(e);
    if (zoneTool) {
      drag = { kind: "draw", x0: snap(p.x), y0: snap(p.y), x1: snap(p.x), y1: snap(p.y) };
      plan.setPointerCapture(e.pointerId);
      return;
    }
    const g = e.target.closest("[data-id]");
    if (!g) { selected = null; render(); return; }
    const kind = g.dataset.kind, id = g.dataset.id;
    const obj = (kind === "item" ? S.items : S.zones).find((o) => o.id === id);
    selected = { kind, id };
    if (kind === "item" && PG[obj.type] && pgSel?.id !== id) pgSel = { id, face: "A" }; // le planogramme suit la sélection
    pushHistory();
    drag = { kind: "move", obj, dx: p.x - obj.x, dy: p.y - obj.y, moved: false };
    plan.setPointerCapture(e.pointerId);
    render();
  });
  plan.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const p = toLocal(e);
    if (drag.kind === "draw") { drag.x1 = snap(Math.min(Math.max(p.x, 0), S.W)); drag.y1 = snap(Math.min(Math.max(p.y, 0), S.D)); renderPlan(); return; }
    const o = drag.obj;
    o.x = snap(p.x - drag.dx); o.y = snap(p.y - drag.dy);
    if (selected.kind === "item") clampItem(o);
    else { o.x = Math.min(Math.max(0, o.x), S.W - o.w); o.y = Math.min(Math.max(0, o.y), S.D - o.h); }
    drag.moved = true;
    render();
  });
  const endDrag = () => {
    if (drag?.kind === "draw") {
      const r = normRect(drag.x0, drag.y0, drag.x1, drag.y1);
      if (r.w >= 0.5 && r.h >= 0.5) {
        pushHistory();
        const z = { id: uid(), type: zoneTool, ...r };
        S.zones.push(z);
        selected = { kind: "zone", id: z.id };
      }
    } else if (drag && !drag.moved) history.pop();
    drag = null;
    render();
  };
  plan.addEventListener("pointerup", endDrag);
  plan.addEventListener("pointercancel", endDrag);

  /* ---------------- Actions ---------------- */
  function addItem(type, x, y, rot = 0) {
    const c = CATALOG[type];
    const it = { id: uid(), type, w: c.w, d: c.d, rot, x: 0, y: 0 };
    const b = box(it);
    it.x = snap(x ?? (S.W - b.w) / 2); it.y = snap(y ?? (S.D - b.h) / 2);
    return it;
  }
  function removeSelected() {
    if (!selected) return;
    pushHistory();
    if (selected.kind === "item") S.items = S.items.filter((i) => i.id !== selected.id);
    else S.zones = S.zones.filter((z) => z.id !== selected.id);
    selected = null; render();
  }
  function rotateSelected() {
    const it = selected?.kind === "item" && S.items.find((i) => i.id === selected.id);
    if (!it) return;
    pushHistory();
    const b = box(it), cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    it.rot = it.rot ? 0 : 1;
    const nb = box(it);
    it.x = snap(cx - nb.w / 2); it.y = snap(cy - nb.h / 2); clampItem(it);
    render();
  }
  function duplicateSelected() {
    const it = selected?.kind === "item" && S.items.find((i) => i.id === selected.id);
    if (!it) return;
    pushHistory();
    const b = box(it);
    const copy = { ...JSON.parse(JSON.stringify(it)), id: uid() };  // copie profonde : le planogramme n'est pas partagé
    if (b.w >= b.h) copy.x = it.x + b.w; else copy.y = it.y + b.h;  // accolé, pour enchaîner les modules
    clampItem(copy);
    S.items.push(copy); selected = { kind: "item", id: copy.id }; render();
  }
  function undo() { if (!history.length) return; S = JSON.parse(history.pop()); selected = null; syncInputs(); render(); }

  /* Implantation type générée selon les dimensions du local */
  function generateTemplate() {
    pushHistory();
    const items = [], zones = [];
    const surf = area();
    const W = S.W, D = S.D;
    let sy0 = 0, res = null;
    if (S.shape === "L") { res = { x: 0, y: 0, w: W - S.nW, h: S.nD }; sy0 = S.nD; }
    else if (surf >= 150 && D >= 11) { const rd = Math.min(6, Math.max(2.5, Math.round(D * 0.18 * 2) / 2)); res = { x: 0, y: 0, w: W, h: rd }; sy0 = rd; }

    if (res) {
      zones.push({ id: uid(), type: "reserve", ...res });
      let x = 0.2;
      if (surf >= 150 && res.h >= 2.7 && res.w >= 7) { items.push(addItem("chambre", res.x + res.w - 3.2, res.y + 0.1)); }
      while (x + 2.7 <= res.x + res.w - (surf >= 150 ? 3.6 : 0.2) && items.length < 8) { items.push(addItem("rack", x, res.y + 0.1)); x += 2.9; }
      // Poste web à droite de la porte de la réserve (0,20 à 1,40 m), jamais devant elle
      const webX = res.x + 1.8, webEnd = res.x + res.w - (items.some((i) => i.type === "chambre") ? 3.4 : 0.2);
      if (surf >= 150 && res.h >= 3 && webX + 2.0 <= webEnd) items.push(addItem("web", webX, res.y + res.h - 1.0));
    }
    zones.push({ id: uid(), type: "vente", x: 0, y: sy0, w: W, h: D - sy0 });

    // Mur du fond : froid positif (accès réserve laissé à gauche)
    const backY = sy0;
    let x = res ? 1.6 : 0.2;
    const fresh = surf >= 300;
    const backEnd = W - 0.2 - (fresh ? 2.5 : 0);
    while (x + 2.5 <= backEnd) { items.push(addItem("froid", x, backY)); x += 2.5; }
    if (fresh) items.push(addItem("vitrine", x, backY)); // accolée au dernier meuble froid
    zones.push({ id: uid(), type: "frais", x: res ? 1.4 : 0, y: backY, w: W - (res ? 1.4 : 0), h: 2.3 });

    // Murs latéraux : surgelés puis gondole murale sur toute la longueur disponible
    const front = surf < 120 ? 4.0 : 4.8;  // profondeur réservée aux caisses et au F&L
    const sideY0 = backY + 1.0, sideY1 = D - 3.6;  // les murales partent de l'angle du froid
    const fillWall = (x, nBahuts) => {
      let y = sideY0;
      for (let k = 0; k < nBahuts && y + 2 <= sideY1; k++) { items.push(addItem("bahut", x, y, 1)); y += 2; }
      const rest = Math.floor((sideY1 - y) / 0.5) * 0.5;
      if (rest >= 1) { const it = addItem("murale", x, y, 1); it.w = rest; items.push(it); }
    };
    fillWall(0, surf >= 120 ? 2 : 1);
    fillWall(W - 0.5, 0);

    // Gondoles centrales : on compare les rangées perpendiculaires et parallèles à la façade
    // et on garde l'orientation qui offre le plus de linéaire
    const gx0 = 0.9 + 1.4, gx1 = W - 0.5 - 1.4;  // dégagement de 1,4 m devant les bahuts et murales
    const gy0 = backY + 0.9 + 1.5, gy1 = D - front;
    const step = 1.0 + 1.6;                       // gondole de 1,0 m + allée de 1,6 m
    const mod = (v) => Math.floor(v / 1.25) * 1.25;  // longueurs en modules de 1,25 m
    const vRows = Math.max(0, Math.floor((gx1 - gx0 + 1.6) / step));
    const vLen = mod(gy1 - gy0 - 0.5);
    const hRows = Math.max(0, Math.floor((gy1 - gy0 + 1.6) / step));
    const hSpan = gx1 - gx0;
    const hSplit = hSpan > 11;                    // allée transversale au-delà de 11 m
    const hSeg = mod(hSplit ? (hSpan - 1.6) / 2 - 0.5 : hSpan - 0.5);
    const vTotal = vLen >= 1.25 ? vRows * vLen : 0;
    const hTotal = hSeg >= 1.25 ? hRows * hSeg * (hSplit ? 2 : 1) : 0;
    if (vTotal > 0 && vTotal >= hTotal) {
      const used = vRows * step - 1.6;
      const sx = gx0 + (gx1 - gx0 - used) / 2;
      for (let r = 0; r < vRows; r++) {
        const gxr = snap(sx + r * step);
        const it = addItem("gondole", gxr, gy0, 1); it.w = vLen; items.push(it);
        items.push(addItem("tete", gxr, gy0 + vLen)); // tête côté entrée : 1,0 m = profondeur de la gondole
      }
    } else if (hTotal > 0) {
      const n = hSplit ? 2 : 1;
      const usedX = n * (hSeg + 0.5) + (n - 1) * 1.6, usedY = hRows * step - 1.6;
      const sx = gx0 + (hSpan - usedX) / 2, sy = gy0 + (gy1 - gy0 - usedY) / 2;
      for (let r = 0; r < hRows; r++) {
        let gxr = sx;
        const gyr = snap(sy + r * step);
        for (let k = 0; k < n; k++) {
          const it = addItem("gondole", gxr, gyr, 0); it.w = hSeg; items.push(it);
          items.push(addItem("tete", gxr + hSeg, gyr, 1));
          gxr += hSeg + 0.5 + 1.6;
        }
      }
    }

    // Avant de magasin : caisses à côté de l'entrée, F&L de l'autre côté
    const lanes = Math.min(6, Math.max(1, Math.ceil(surf / 110)));
    const doorMid = S.doorX + S.doorW / 2;
    const left = doorMid > W / 2;
    const cy = surf < 120 ? D - 2.2 : D - 2.9;
    for (let k = 0; k < lanes; k++) {
      const cx = left ? S.doorX - 1.4 - k * 2.1 : S.doorX + S.doorW + 0.5 + k * 2.1;  // passage caisse de 1,2 m
      items.push(addItem("caisse", cx, cy, 1));
    }
    const cz = left ? { x: Math.max(0, S.doorX - 1.6 - lanes * 2.1), w: lanes * 2.1 + 0.2 } : { x: S.doorX + S.doorW + 0.3, w: lanes * 2.1 + 0.2 };
    zones.push({ id: uid(), type: "caisses", x: cz.x, y: D - 3.2, w: Math.min(cz.w, W - cz.x), h: 3.2 });
    const flx = left ? S.doorX + S.doorW + 0.8 : Math.max(0.6, S.doorX - 2.8);
    const fly = surf < 120 ? D - 2.6 : D - 3.4;
    items.push(addItem("fl", flx, fly));
    if (surf >= 160) items.push(addItem("fl", left ? flx + 3.3 : flx - 3.3, fly));
    if (fresh) items.push(addItem("pain", left ? flx + 6.6 : flx - 5.1, D - 3.2));
    zones.push({ id: uid(), type: "fl", x: Math.max(0, (left ? flx : flx - 3.3) - 0.3), y: D - 3.8, w: surf >= 160 ? 5.9 : 2.6, h: 2.6 });

    // On ne garde que ce qui tient dans le local sans chevauchement
    const kept = [];
    items.forEach((it) => {
      clampItem(it);
      const b = box(it);
      if (insideLocal(b) && !kept.some((k) => hit(box(k), b))) kept.push(it);
    });
    S.items = kept;
    S.zones = zones.filter((z) => z.w > 0.5 && z.h > 0.5).map((z) => ({ ...z, x: r1(z.x), y: r1(z.y), w: r1(Math.min(z.w, W - z.x)), h: r1(Math.min(z.h, D - z.y)) }));
    autoPlanogram();  // la coupe montre aussitôt le planogramme projeté
    selected = null; zoneTool = null; pgSel = null; updateZoneButtons();
    render();
  }

  /* ---------------- Exports ---------------- */
  function svgString(node) {
    const clone = node.cloneNode(true);
    clone.setAttribute("xmlns", NS);
    const vb = node.viewBox.baseVal;
    clone.setAttribute("width", Math.round(vb.width * 60)); clone.setAttribute("height", Math.round(vb.height * 60));
    const style = document.createElementNS(NS, "style");
    style.textContent = STUDIO_SVG_CSS;
    const bg = el("rect", { x: vb.x, y: vb.y, width: vb.width, height: vb.height, fill: "#ffffff" });
    clone.insertBefore(bg, clone.firstChild);
    clone.insertBefore(style, clone.firstChild);
    return new XMLSerializer().serializeToString(clone);
  }
  const STUDIO_SVG_CSS = `text{font-family:Arial,sans-serif}.dim{stroke:#6b7280;stroke-width:.03}.dim-txt{font-size:.3px;fill:#4b5563;text-anchor:middle}.zone-txt{font-size:.3px;font-weight:700}.zone-sub{font-size:.24px}.item-txt{fill:#fff;font-weight:700;text-anchor:middle;dominant-baseline:central}.door-txt{font-size:.3px;fill:#1f2a37;font-weight:700;text-anchor:middle}.cutline line{stroke:#c93c1a;stroke-width:.05;stroke-dasharray:.3 .15}.cut-txt{font-size:.45px;font-weight:800;fill:#c93c1a;text-anchor:middle}.cut-cap{font-size:.3px;fill:#1f2a37;font-weight:700;text-anchor:middle}.pg-txt{font-weight:700;text-anchor:middle;dominant-baseline:central}.pg-note{font-size:.13px;fill:#4b5563;dominant-baseline:central}`;
  const download = (blob, name) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
  function summary() {
    const pgRows = pgStats();
    const pgTotal = pgRows.reduce((s, [, v]) => s + v, 0);
    const m = metrics();
    const count = {};
    S.items.forEach((it) => { const l = CATALOG[it.type].label; count[l] = (count[l] || 0) + 1; });
    const zones = S.zones.map((z) => `${ZONES[z.type].label} ${num(z.w * z.h)} m²`).join(", ");
    return [
      "Bonjour Magmart, voici l'esquisse de mon magasin faite avec le Studio 2D :",
      `• Local ${S.shape === "L" ? "en L" : "rectangulaire"} : ${num(S.W)} × ${num(S.D)} m, ${num(m.surf)} m², hauteur ${num(S.H)} m`,
      zones ? `• Zones : ${zones}` : "",
      `• Linéaire de rayonnage : ${num(m.lin)} m (≈ ${Math.round(m.dev)} m développés) · froid : ${num(m.cold)} m · caisses : ${m.lanes}`,
      Object.keys(count).length ? `• Mobilier : ${Object.entries(count).map(([k, v]) => `${v} × ${k}`).join(", ")}` : "",
      pgRows.length ? `• Planogramme (${num(pgTotal)} m développés) : ${pgRows.slice(0, 8).map(([f, v]) => `${FAMILLES[f].short} ${Math.round((v / pgTotal) * 100)} %`).join(", ")}` : "",
      "Je souhaite en discuter lors d'un diagnostic.",
    ].filter(Boolean).join("\n");
  }

  /* ---------------- Branchements de l'interface ---------------- */
  const onNum = (id, fn) => $(id).addEventListener("change", (e) => { const v = parseFloat(String(e.target.value).replace(",", ".")); if (!isNaN(v)) { pushHistory(); fn(v); syncInputs(); render(); } });
  document.querySelectorAll("[name=shape]").forEach((r) => r.addEventListener("change", () => { pushHistory(); S.shape = r.value; syncInputs(); render(); }));
  onNum("in-W", (v) => { S.W = Math.min(80, Math.max(3, v)); S.nW = Math.min(S.nW, S.W - 1); S.doorX = Math.min(S.doorX, S.W - S.doorW); S.items.forEach(clampItem); });
  onNum("in-D", (v) => { S.D = Math.min(80, Math.max(3, v)); S.nD = Math.min(S.nD, S.D - 1); S.items.forEach(clampItem); });
  onNum("in-H", (v) => { S.H = Math.min(10, Math.max(2.4, v)); });
  onNum("in-nW", (v) => { S.nW = Math.min(S.W - 1, Math.max(0.5, v)); });
  onNum("in-nD", (v) => { S.nD = Math.min(S.D - 1, Math.max(0.5, v)); });
  onNum("in-doorX", (v) => { S.doorX = Math.min(S.W - S.doorW, Math.max(0, v)); });
  onNum("in-doorW", (v) => { S.doorW = Math.min(S.W, Math.max(0.9, v)); S.doorX = Math.min(S.doorX, S.W - S.doorW); });

  document.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => {
    pushHistory();
    const it = addItem(b.dataset.add);
    S.items.push(it); selected = { kind: "item", id: it.id }; zoneTool = null; updateZoneButtons(); render();
  }));
  function updateZoneButtons() {
    document.querySelectorAll("[data-zone]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.zone === zoneTool));
    plan.classList.toggle("is-drawing", !!zoneTool);
    $("zone-hint").hidden = !zoneTool;
  }
  document.querySelectorAll("[data-zone]").forEach((b) => b.addEventListener("click", () => {
    zoneTool = zoneTool === b.dataset.zone ? null : b.dataset.zone; selected = null; updateZoneButtons(); render();
  }));
  $("zone-list").addEventListener("click", (e) => {
    const id = e.target.dataset.delZone; if (!id) return;
    pushHistory(); S.zones = S.zones.filter((z) => z.id !== id); render();
  });

  ["sel-w", "sel-d"].forEach((id) => $(id).addEventListener("change", (e) => {
    const v = parseFloat(String(e.target.value).replace(",", ".")); if (isNaN(v) || v < 0.3) return;
    pushHistory();
    const it = selected.kind === "item" ? S.items.find((i) => i.id === selected.id) : null;
    const z = selected.kind === "zone" ? S.zones.find((i) => i.id === selected.id) : null;
    if (it) { it[id === "sel-w" ? "w" : "d"] = r1(v); clampItem(it); }
    if (z) { z[id === "sel-w" ? "w" : "h"] = r1(v); }
    render();
  }));
  $("sel-rotate").addEventListener("click", rotateSelected);
  $("sel-dup").addEventListener("click", duplicateSelected);
  $("sel-del").addEventListener("click", removeSelected);

  $("btn-template").addEventListener("click", generateTemplate);
  $("btn-undo").addEventListener("click", undo);
  $("btn-reset").addEventListener("click", () => {
    if (!confirm("Effacer le plan et repartir d'un local vide ?")) return;
    pushHistory(); const d = defaultState(); S = d; selected = null; syncInputs(); render();
  });
  $("btn-svg").addEventListener("click", () => exportNode(plan, "magmart-implantation"));
  $("btn-png").addEventListener("click", () => exportNode(plan, "magmart-implantation", true));

  // Planogramme : coupe cliquable, choix du meuble et de la face, pinceau, niveaux, actions
  $("cut-pg").addEventListener("change", renderCoupe);
  coupe.addEventListener("pointerdown", (e) => {
    const g = e.target.closest("[data-pg-id]");
    if (!g) return;
    pgSel = { id: g.dataset.pgId, face: g.dataset.face };
    selected = { kind: "item", id: g.dataset.pgId };
    render();
    $("pg-card").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("pg-item").addEventListener("change", (e) => { pgSel = { id: e.target.value, face: "A" }; selected = { kind: "item", id: e.target.value }; render(); });
  $("pg-faces").addEventListener("change", (e) => { pgSel.face = e.target.value; renderPg(); });
  $("pg-palette").innerHTML = Object.entries(FAMILLES).map(([k, F]) => `<button type="button" data-fam="${k}" style="--c:${F.color}" title="${F.label}"><i></i>${F.short}</button>`).join("")
    + `<button type="button" data-fam="" title="Effacer"><i class="erase"></i>Gomme</button>`;
  const markFam = () => $("pg-palette").querySelectorAll("[data-fam]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.fam === pgFam));
  $("pg-palette").addEventListener("click", (e) => { const b = e.target.closest("[data-fam]"); if (b) { pgFam = b.dataset.fam; markFam(); } });
  markFam();
  document.querySelectorAll("[name=pgbrush]").forEach((r) => r.addEventListener("change", () => (pgBrush = r.value)));
  let painting = false;
  pgSvg.addEventListener("pointerdown", (e) => {
    const cell = e.target.closest("[data-cell]");
    if (!cell) return;
    e.preventDefault();
    pushHistory(); painting = true; paintCell(cell);
  });
  window.addEventListener("pointermove", (e) => {
    if (!painting) return;
    const cell = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-cell]");
    if (cell && pgSvg.contains(cell)) paintCell(cell);
  });
  window.addEventListener("pointerup", () => { if (painting) { painting = false; render(); } });
  $("pg-levels").addEventListener("change", (e) => {
    const it = S.items.find((i) => i.id === pgSel?.id); if (!it) return;
    pushHistory(); it.pg.levels = Math.min(10, Math.max(1, Math.round(Number(e.target.value) || 1))); render();
  });
  $("pg-lv-minus").addEventListener("click", () => { $("pg-levels").value = Number($("pg-levels").value) - 1; $("pg-levels").dispatchEvent(new Event("change")); });
  $("pg-lv-plus").addEventListener("click", () => { $("pg-levels").value = Number($("pg-levels").value) + 1; $("pg-levels").dispatchEvent(new Event("change")); });
  $("pg-flip").addEventListener("click", () => { const it = S.items.find((i) => i.id === pgSel?.id); if (!it) return; pushHistory(); it.flip = !it.flip; render(); });
  $("pg-auto").addEventListener("click", () => {
    if (pgStats().length && !confirm("Remplacer tout le planogramme du magasin par le planogramme type ?")) return;
    pushHistory(); autoPlanogram(true); render();
  });
  $("pg-clear").addEventListener("click", () => {
    const it = S.items.find((i) => i.id === pgSel?.id); if (!it) return;
    pushHistory(); facesOf(it).forEach((f) => it.pg[f].forEach((row) => row.fill(null))); render();
  });
  $("pg-png").addEventListener("click", () => exportNode(pgSvg, "magmart-planogramme", true));
  $("pg-svgx").addEventListener("click", () => exportNode(pgSvg, "magmart-planogramme"));
  $("cut-png").addEventListener("click", () => exportNode(coupe, "magmart-coupe-planogramme", true));
  $("btn-print").addEventListener("click", () => window.print());
  // Dossier d'échange pour la production des plans DWG / IFC (kit CAO Magmart)
  $("btn-cad").addEventListener("click", () => {
    S.items.forEach((it) => PG[it.type] && ensurePg(it));
    const projet = typeof Projet !== "undefined" ? Projet.get() : {};
    const dossier = {
      format: "magmart-cad", version: 1, genere: new Date().toISOString(),
      projet: { ville: projet.ville || "", surface: projet.surface || null, format: projet.format || null, stade: projet.stade || null, date: projet.date || null },
      plan: JSON.parse(JSON.stringify(S)),
      catalogue: Object.fromEntries(Object.entries(CATALOG).map(([k, c]) => [k, { label: c.label, h: c.h, cat: c.cat, froid: !!c.cold, faces: PG[k]?.faces || 0 }])),
      zones: Object.fromEntries(Object.entries(ZONES).map(([k, z]) => [k, { label: z.label, vente: !!z.sales }])),
      familles: Object.fromEntries(Object.entries(FAMILLES).map(([k, f]) => [k, f.label])),
    };
    download(new Blob([JSON.stringify(dossier, null, 1)], { type: "application/json" }), `magmart-dossier-cao-${(projet.ville || "projet").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`);
  });
  // L'envoi se fait depuis « Simuler mon projet », qui reprend le résumé du plan

  document.querySelectorAll("[name=cutdir]").forEach((r) => r.addEventListener("change", () => { S.cut.dir = r.value; render(); }));
  $("cut-pos").addEventListener("input", (e) => { S.cut.pos = Number(e.target.value); render(); });

  // Onglets du panneau
  const tabs = [...document.querySelectorAll("[data-tab]")];
  tabs.forEach((t, i) => t.addEventListener("keydown", (e) => { // flèches gauche/droite entre onglets
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!k) return;
    e.preventDefault();
    const n = tabs[(i + k + tabs.length) % tabs.length];
    n.focus(); n.click();
  }));
  document.querySelectorAll("[data-tab]").forEach((t) => t.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach((x) => { x.setAttribute("aria-selected", x === t); x.tabIndex = x === t ? 0 : -1; });
    document.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== t.dataset.tab));
    if (t.dataset.tab !== "zones") { zoneTool = null; updateZoneButtons(); }
  }));

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, select, textarea")) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d" && selected?.kind === "item") { e.preventDefault(); duplicateSelected(); return; }
    if (e.key === "Escape") { selected = null; zoneTool = null; updateZoneButtons(); render(); return; }
    if (!selected) return;
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); removeSelected(); return; }
    if (e.key.toLowerCase() === "r") { rotateSelected(); return; }
    const step = e.shiftKey ? 0.5 : 0.1;
    const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (mv) {
      e.preventDefault();
      const o = (selected.kind === "item" ? S.items : S.zones).find((i) => i.id === selected.id);
      o.x = r1(o.x + mv[0]); o.y = r1(o.y + mv[1]);
      if (selected.kind === "item") clampItem(o);
      render();
    }
  });

  // Premier affichage : un local vide invite à générer l'implantation type
  /* ---------------- Vue 3D ---------------- */
  let view3d = null, loading3d = null, pending = false;
  const wrap3d = $("view3d");
  async function open3d() {
    if (!view3d) {
      $("v3d-status").hidden = false;
      try {
        loading3d = loading3d || import("./studio3d.js");
        const mod = await loading3d;
        view3d = mod.mount($("v3d-canvas"), window.MagmartStudio);
      } catch (err) {
        $("v3d-status").textContent = "La vue 3D n'a pas pu se charger (connexion internet requise pour la bibliothèque 3D).";
        return;
      }
      $("v3d-status").hidden = true;
    } else { view3d.rebuild(); view3d.resume(); }
  }
  document.querySelectorAll("[name=viewmode]").forEach((r) => r.addEventListener("change", () => {
    const is3d = r.value === "3d" && r.checked;
    if (r.value !== "3d" && r.checked) { plan.parentElement.hidden = false; wrap3d.hidden = true; view3d?.pause(); return; }
    if (is3d) { plan.parentElement.hidden = true; wrap3d.hidden = false; open3d(); }
  }));
  // Le plan modifié est reconstruit en 3D au plus une fois par image
  window.addEventListener("magmart:plan", () => {
    if (!view3d || wrap3d.hidden || pending) return;
    pending = true; requestAnimationFrame(() => { pending = false; view3d.rebuild(); });
  });
  $("v3d-orbit").addEventListener("click", () => view3d?.resetView());
  $("v3d-walk").addEventListener("click", () => { view3d?.startWalk(); $("v3d-walkpad").hidden = false; });
  $("v3d-orbit").addEventListener("click", () => ($("v3d-walkpad").hidden = true));
  $("v3d-shot").addEventListener("click", () => { if (!view3d) return; const a = document.createElement("a"); a.href = view3d.screenshot(); a.download = "magmart-vue-3d.png"; a.click(); });
  [["v3d-fwd", 1], ["v3d-back", -1]].forEach(([id, v]) => {
    const b = $(id);
    b.addEventListener("pointerdown", () => view3d?.setHold(v));
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, () => view3d?.setHold(0)));
  });

  syncInputs();
  updateZoneButtons();
  render();
})();
