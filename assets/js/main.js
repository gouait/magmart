/* MAGMART — socle commun du site : menu, apparitions, liens WhatsApp,
   calcul du budget d'ouverture, mémoire du projet, simulateur et formulaire de contact. */

// Les animations d'apparition ne masquent le contenu que si le script tourne
document.documentElement.classList.add("js");

// Numéro WhatsApp Business (format international sans +). À remplacer par le numéro réel.
const WHATSAPP = "212600000000";

const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
// Montants arrondis au millier (estimations) et montants exacts (prix catalogue)
const fmt = (n) => (n < 0 ? "\u2212" : "") + new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.abs(Math.round(n / 1000) * 1000)) + "\u00a0MAD";
const fmtX = (n) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n)) + "\u00a0MAD";
const monthFr = (ym) => (/^\d{4}-\d{2}$/.test(ym || "") ? new Date(ym + "-15").toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : null);

/* ------------------------------------------------------------------
   Mémoire du projet : partagée entre parcours guidé, simulateur et Studio 2D.
   Stockée dans le navigateur du visiteur uniquement.
   ------------------------------------------------------------------ */
const Projet = {
  KEY: "magmart-projet",
  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch { return {}; }
  },
  set(patch) {
    const next = { ...this.get(), ...patch };
    try { localStorage.setItem(this.KEY, JSON.stringify(next)); } catch { /* navigation privée */ }
    return next;
  },
};

/* ------------------------------------------------------------------
   Budget d'ouverture — ordres de grandeur indicatifs (MAD HT) issus de
   01_Recherche/01_Marche_Maroc.md, à recaler sur les devis réels après chaque projet.
   ------------------------------------------------------------------ */
const SIM = {
  formats: {
    proxi:   { label: "Supérette de proximité", fit: 1.0,  stock: 1300, ticket: 75,  salesM2: 26000 },
    premium: { label: "Supérette premium",      fit: 1.35, stock: 1600, ticket: 140, salesM2: 30000 },
    super:   { label: "Supermarché",            fit: 0.9,  stock: 1150, ticket: 160, salesM2: 22000 },
  },
  etats: { brut: "brut", renover: "à rénover", amenage: "déjà aménagé" },
  works: { brut: 2200, renover: 1300, amenage: 450 }, // travaux par m² selon l'état du local
  shelving: 750,       // rayonnage, gondoles, mobilier caisse — par m² de vente
  cold: 1250,          // froid positif/négatif — par m² de vente
  freshDept: 180000,   // option rayons métiers (boucherie / boulangerie)
  posPerLane: 28000,   // poste caisse complet (PC, scanner, imprimante, tiroir, TPE)
  m2PerLane: 110,
  erpSetup: 35000,     // paramétrage ERP, import catalogue, formation
  ecommerce: 45000,    // boutique synchronisée + parcours commande
  brand: [40000, 90],  // identité, façade, signalétique : base + par m²
  launch: [25000, 60], // lancement : base + par m²
  contingency: 0.08,
  salesRatio: 0.78,    // part de la surface en vente
};

function estimateBudget({ format = "proxi", surface = 200, etat = "renover", frais = false, ecom = true }) {
  const f = SIM.formats[format] || SIM.formats.proxi;
  const sales = surface * SIM.salesRatio;
  const lanes = Math.max(1, Math.ceil(surface / SIM.m2PerLane));
  const lines = [
    ["Travaux & aménagement", surface * SIM.works[etat] * f.fit],
    ["Rayonnage & mobilier", sales * SIM.shelving * f.fit],
    ["Froid commercial", sales * SIM.cold + (frais ? SIM.freshDept : 0)],
    ["Caisse, ERP & vente en ligne", lanes * SIM.posPerLane + SIM.erpSetup + (ecom ? SIM.ecommerce : 0)],
    ["Identité, façade & signalétique", (SIM.brand[0] + surface * SIM.brand[1]) * f.fit],
    ["Stock d'ouverture", sales * f.stock],
    ["Lancement & communication", SIM.launch[0] + surface * SIM.launch[1]],
  ];
  const sub = lines.reduce((s, l) => s + l[1], 0);
  lines.push(["Aléas & trésorerie de démarrage", sub * SIM.contingency + sales * f.stock * 0.25]);
  const total = lines.reduce((s, l) => s + l[1], 0);
  return { f, lines, total, lanes, ca: sales * f.salesM2, ticket: f.ticket };
}

document.addEventListener("DOMContentLoaded", () => {
  // Menu mobile
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", false); } });
  }

  // Liens WhatsApp avec message pré-rempli
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa || "Bonjour Magmart, je souhaite échanger sur mon projet de magasin.");
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Apparitions au défilement
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 }) : null;
  document.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

  initStepper();
  initSimulator();
  initForm();
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});

/* ------------------------------------------------------------------
   Simulateur : pré-rempli depuis le parcours guidé si le visiteur l'a fait.
   ------------------------------------------------------------------ */
function initSimulator() {
  const form = document.getElementById("sim");
  if (!form) return;
  const $ = (id) => document.getElementById(id);

  const p = Projet.get();
  if (p.surface) form.surface.value = Math.min(1500, Math.max(40, p.surface));
  if (p.format && SIM.formats[p.format]) form.querySelector(`[name=format][value=${p.format}]`).checked = true;
  if (p.etat && SIM.works[p.etat]) form.querySelector(`[name=etat][value=${p.etat}]`).checked = true;
  if (p.rayons) {
    form.frais.checked = p.rayons.includes("boucherie") || p.rayons.includes("boulangerie");
    form.ecom.checked = p.rayons.includes("ecom");
  }

  // L'étape n'est enregistrée qu'après une action du visiteur (réglage ou « étape suivante »)
  let touched = false;
  const update = () => {
    const d = new FormData(form);
    const params = { format: d.get("format"), surface: Number(d.get("surface")), etat: d.get("etat"), frais: !!d.get("frais"), ecom: !!d.get("ecom") };
    const r = estimateBudget(params);

    $("surface-out").textContent = `${params.surface} m²`;
    $("sim-total").textContent = fmt(r.total);
    $("sim-range").textContent = `Fourchette : ${fmt(r.total * 0.85)} – ${fmt(r.total * 1.2)}`;
    $("sim-lines").innerHTML = r.lines.map(([k, v]) => `<li><span>${k}</span><span>${fmt(v)}</span></li>`).join("");
    $("sim-kpis").innerHTML = `
      <div class="sim-kpi"><b>${r.lanes}</b><small>poste${r.lanes > 1 ? "s" : ""} de caisse</small></div>
      <div class="sim-kpi"><b>${fmt(r.total / params.surface)}</b><small>par m², tout compris</small></div>
      <div class="sim-kpi"><b>${fmt(r.ca)}</b><small>CA annuel de référence</small></div>
      <div class="sim-kpi"><b>${Math.round(r.ca / 360 / r.ticket)}</b><small>tickets par jour à ${r.ticket} MAD</small></div>`;

    form.dataset.summary = `${r.f.label}, ${params.surface} m², local ${SIM.etats[params.etat]}, budget estimé ${fmt(r.total)}`;
    if (touched) Projet.set({ surface: params.surface, format: params.format, etat: params.etat, budgetEstime: Math.round(r.total) });
  };

  form.addEventListener("input", () => { touched = true; update(); });
  document.querySelector("[data-next]")?.addEventListener("click", () => { touched = true; update(); });
  update();

  $("sim-send")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.open(waLink(`Bonjour Magmart, voici mon budget d'ouverture estimé : ${form.dataset.summary}. Je souhaite en parler avec un conseiller.`), "_blank", "noopener");
  });
}

/* ------------------------------------------------------------------
   Avancement de « Simuler mon projet » : partagé par la barre d'étapes et la page Simuler mon projet.
   ------------------------------------------------------------------ */
function projectStatus() {
  const p = Projet.get();
  let plan = null;
  try { plan = JSON.parse(localStorage.getItem("magmart-plan")); } catch { /* aucun plan */ }
  const pieces = Object.values(p.dossier?.pieces || {}).filter(Boolean).length;
  return {
    profil: !!p.wizardDone,
    budget: !!p.budgetEstime,
    plan: !!plan?.items?.length,
    rentabilite: !!p.exploitation?.central,
    financement: !!(p.dossier?.nom || pieces),
  };
}

function initStepper() {
  const nav = document.querySelector(".pstep");
  if (!nav) return;
  const st = projectStatus();
  nav.querySelectorAll("li[data-step]").forEach((li) => {
    const done = st[li.dataset.step];
    li.classList.toggle("done", done);
    const a = li.querySelector("a");
    if (done) a.setAttribute("title", "Étape complétée");
  });
}

/* ------------------------------------------------------------------
   Formulaire de contact : pré-rempli depuis « Simuler mon projet », envoyé sur WhatsApp.
   À brancher ensuite sur un CRM (Odoo CRM, HubSpot, Brevo) via webhook.
   ------------------------------------------------------------------ */
function initForm() {
  const form = document.getElementById("lead-form");
  if (!form) return;
  const STADES = { idee: "J'ai une idée, pas encore de local", local: "J'ai un local", moderniser: "Je modernise mon épicerie", ouvert: "Mon magasin est ouvert", multisite: "J'ouvre un autre magasin" };
  const PACKS = { decision: "Étude Décision", hanout: "Hanout+", superette: "Supérette clé en main", supermarche: "Supermarché & multi-sites", pilotage: "Abonnement de pilotage" };

  // Pré-remplissage : tout ce que le visiteur a déjà dit dans « Simuler mon projet »
  const p = Projet.get();
  const q = new URLSearchParams(location.search);
  let filled = false;
  const set = (name, v) => { if (v != null && v !== "" && form.elements[name] && !form.elements[name].value) { form.elements[name].value = v; filled = true; } };
  set("profil", q.get("stade") || p.stade);
  set("ville", p.ville);
  set("surface", p.surface);
  set("budget", p.budget);
  set("date", p.date);
  if (p.mre || q.get("mre")) { form.elements.mre.checked = true; filled = true; }
  if (q.get("pack") && PACKS[q.get("pack")]) set("message", `Formule qui m'intéresse : ${PACKS[q.get("pack")]}.`);
  if (filled) document.getElementById("lead-prefill").hidden = false;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = Object.fromEntries(new FormData(form));
    const budget = form.elements.budget.selectedOptions[0]?.textContent;
    const ex = p.exploitation?.central;
    const msg = [
      "Bonjour Magmart, je souhaite réserver mon diagnostic offert :",
      `• ${d.nom} · ${d.tel}`,
      `• Projet : ${STADES[d.profil] || d.profil}${d.mre ? " · je vis à l'étranger" : ""}`,
      `• ${d.ville}, ${d.surface ? d.surface + " m²" : "surface à préciser"}`,
      `• Budget envisagé : ${budget || "à définir"}${p.budgetEstime ? ` · estimé ${fmt(p.budgetEstime)}` : ""}`,
      monthFr(d.date) ? `• Date souhaitée : ${monthFr(d.date)}` : "",
      ex ? `• Rentabilité estimée : CA année 2 ${fmt(ex.years[1].ca)}, EBE ${fmt(ex.years[1].ebe)}` : "",
      d.message ? `• Précisions : ${d.message}` : "",
    ].filter(Boolean).join("\n");
    form.querySelector(".form-status").hidden = false;
    window.open(waLink(msg), "_blank", "noopener");
  });
}
