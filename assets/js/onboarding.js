/* MAGMART — Simuler mon projet, étape 1 « Profil » (demarrer.html).
   4 écrans : stade d'avancement → local → magasin → recommandation.
   La recommandation dépend du stade (pas seulement de la surface) et respecte la grille de tarifs.
   Dépend de main.js (Projet, estimateBudget, fmt, waLink) et de tarifs.js (TARIFS, généré depuis _build/tarifs.py). */

(() => {
  const form = document.getElementById("wizard");
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const steps = [...form.querySelectorAll(".wz-step")];
  const TOTAL = steps.length;
  const { STADES, FORMULES, ABONNEMENTS } = TARIFS;
  let current = 1;
  let interacted = false; // rien n'est enregistré avant une action du visiteur

  const STADE = Object.fromEntries(STADES.map((s) => [s.key, s]));
  // Correspondance avec les profils utilisés par le formulaire de contact
  const PROFIL_OF = { idee: "creation", local: "creation", moderniser: "transformation", ouvert: "existant", multisite: "expansion" };
  const LOCAUX = { recherche: "local à trouver", nego: "local en négociation", signe: "local signé", existant: "magasin existant" };
  const RAYONS = { fl: "fruits & légumes", boucherie: "boucherie", boulangerie: "boulangerie", ecom: "vente en ligne" };
  const ETATS = { brut: "brut", renover: "à rénover", amenage: "déjà aménagé" };
  const FORMATS = { proxi: "Supérette de proximité", premium: "Supérette premium", super: "Supermarché" };
  const BUDGETS = { "<500k": [0, 500000], "500k-1.5M": [500000, 1500000], "1.5-4M": [1500000, 4000000], ">4M": [4000000, Infinity] };
  const round = (v) => Math.round(v / 1000) * 1000;
  const monthLabel = (d) => d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  /* ---------------- Lecture et mémoire ---------------- */
  const read = () => {
    const d = new FormData(form);
    return {
      stade: d.get("stade"), mre: !!d.get("mre"), local: d.get("local"), ville: (d.get("ville") || "").trim(), surface: Number(d.get("surface")),
      etat: d.get("etat"), format: d.get("format"), rayons: d.getAll("rayons"), budget: d.get("budget"), date: d.get("date"),
    };
  };
  const restore = (p) => {
    ["stade", "local", "ville", "surface", "etat", "budget", "date"].forEach((k) => {
      if (p[k] == null) return;
      form.querySelectorAll(`[name="${k}"]`).forEach((f) => { if (f.type === "radio") f.checked = f.value === p[k]; else f.value = p[k]; });
    });
    const fmtChoisi = p.formatChoisi || p.format;
    form.querySelectorAll("[name=format]").forEach((f) => (f.checked = f.value === fmtChoisi));
    form.mre.checked = !!p.mre;
    form.querySelectorAll("[name=rayons]").forEach((f) => (f.checked = (p.rayons || []).includes(f.value)));
    $("wz-surface-out").textContent = `${form.surface.value} m²`;
  };
  const formatOf = (a) => (a.format && a.format !== "conseil" ? a.format : a.surface > 350 ? "super" : "proxi");
  const persist = () => {
    const a = read();
    try { // une surface très différente invalide l'esquisse du Studio 2D
      const plan = JSON.parse(localStorage.getItem("magmart-plan"));
      if (plan && a.surface && Math.abs(plan.W * plan.D - a.surface) / a.surface > 0.15) localStorage.removeItem("magmart-plan");
    } catch { /* rien à invalider */ }
    Projet.set({ ...a, profil: a.mre ? "mre" : PROFIL_OF[a.stade] || null, format: formatOf(a), formatChoisi: a.format,
                 etat: a.stade === "ouvert" ? "amenage" : a.etat, wizardStep: current, wizardDone: Projet.get().wizardDone || current === TOTAL });
  };

  /* ---------------- Adaptation des questions au stade ---------------- */
  function adapt() {
    const s = read().stade;
    const opening = s !== "ouvert";
    $("q-local").hidden = s !== "local" && s !== "idee";
    $("q-etat").hidden = !opening;
    $("q-budget").hidden = !opening;
    $("lbl-surface-txt").textContent = s === "idee" ? "Surface visée" : "Surface du magasin";
    $("lbl-date").textContent = opening ? "Ouverture souhaitée" : "Démarrage souhaité";
    form.querySelectorAll("#q-local input").forEach((i) => (i.required = !$("q-local").hidden));
    form.querySelectorAll("#q-etat input").forEach((i) => (i.required = opening));
  }

  /* ---------------- Navigation ---------------- */
  function show(n) {
    current = n;
    adapt();
    steps.forEach((s) => (s.hidden = Number(s.dataset.step) !== n));
    $("wz-progress").innerHTML = steps.slice(0, TOTAL - 1).map((_, i) => `<span class="${i < n ? "done" : ""}"></span>`).join("");
    $("wz-count").textContent = n < TOTAL ? `Question ${n} sur ${TOTAL - 1}` : "Votre recommandation";
    $("wz-prev").style.visibility = n === 1 ? "hidden" : "visible";
    $("wz-next").hidden = n === TOTAL;
    $("wz-next").textContent = n === TOTAL - 1 ? "Voir ma recommandation →" : "Continuer →";
    $("wz-error").textContent = "";
    if (n === TOTAL) renderReco();
    if (interacted) persist();
    const h = steps[n - 1].querySelector("h2");
    h?.setAttribute("tabindex", "-1");
    h?.focus({ preventScroll: true });
    if (n > 1) form.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const MSG = { date: "Indiquez la date au format AAAA-MM, par exemple 2027-06.", stade: "Choisissez où en est votre projet.", local: "Indiquez où vous en êtes avec le local.", ville: "Indiquez la ville du projet.", etat: "Précisez l'état du local.", format: "Choisissez un format, ou « Je ne sais pas »." };
  function valid(n) {
    const step = steps[n - 1];
    const names = new Set([...step.querySelectorAll("input[required]")].filter((i) => !i.closest("[hidden]")).map((i) => i.name));
    if (n === 3 && form.date.value && !/^\d{4}-\d{2}$/.test(form.date.value)) { $("wz-error").textContent = MSG.date; form.date.focus(); return false; }
    for (const name of names) {
      const inputs = step.querySelectorAll(`[name="${name}"]`);
      const ok = inputs[0].type === "radio" ? [...inputs].some((i) => i.checked) : inputs[0].value.trim();
      if (!ok) { $("wz-error").textContent = MSG[name] || "Complétez cette question."; inputs[0].focus(); return false; }
    }
    return true;
  }
  $("wz-next").addEventListener("click", () => { interacted = true; if (valid(current)) show(current + 1); });
  $("wz-prev").addEventListener("click", () => show(Math.max(1, current - 1)));
  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && current < TOTAL) { e.preventDefault(); $("wz-next").click(); }
  });
  // Choisir son stade à la souris fait avancer ; au clavier, on valide avec « Continuer »
  form.querySelectorAll("[name=stade]").forEach((r) => r.addEventListener("click", (e) => { interacted = true; if (e.detail > 0) setTimeout(() => show(2), 160); }));
  form.surface.addEventListener("input", () => ($("wz-surface-out").textContent = `${form.surface.value} m²`));
  form.addEventListener("change", () => { interacted = true; adapt(); persist(); });

  /* ---------------- Recommandation ---------------- */
  function packKey(a) {
    if (a.stade === "ouvert") return "pilotage";
    if (a.stade === "idee") return "decision";
    if (a.stade === "moderniser") return a.surface <= 120 ? "hanout" : a.surface <= 400 ? "superette" : "supermarche";
    return a.surface <= 400 ? "superette" : "supermarche"; // idée, local ou nouveau site : une création, jamais Hanout+
  }
  // Honoraires : proportionnels à la surface, plafonnés à 8 % (6 % au-delà de 3 M) du budget, jamais sous le prix minimum
  function fees(key, surface, budget) {
    const F = FORMULES[key];
    const [s0, s1] = F.surface || [0, 1];
    const t = Math.min(1, Math.max(0, (surface - s0) / (s1 - s0)));
    const raw = F.prix_min + (F.prix_max - F.prix_min) * t;
    // 8 % jusqu'à 3 M, puis 6 % sur la part au-delà : le plafond ne baisse jamais quand le budget monte
    const cap = budget ? (budget <= 3e6 ? budget * 0.08 : 240000 + (budget - 3e6) * 0.06) : Infinity;
    return { value: round(Math.max(F.prix_min, Math.min(raw, cap))), capped: raw > cap && cap > F.prix_min, floor: cap < F.prix_min };
  }
  const subFor = (surface) => (surface <= 120 ? ABONNEMENTS[0] : surface <= 400 ? ABONNEMENTS[1] : ABONNEMENTS[2]);

  function renderReco() {
    const a = read();
    const S = STADE[a.stade] || STADES[1];
    const key = packKey(a);
    const format = formatOf(a);
    const opening = a.stade !== "ouvert";
    const est = estimateBudget({ format, surface: a.surface, etat: a.etat || "renover", frais: a.rayons.includes("boucherie") || a.rayons.includes("boulangerie"), ecom: a.rayons.includes("ecom") });
    const sub = subFor(a.surface);
    let head, incl, price, priceNote, weeks;

    if (!opening) {
      head = `Abonnement ${sub.nom}`;
      price = `${fmtX(sub.prix)} <small>HT / mois</small>`;
      priceNote = `Engagement ${sub.engagement}. ${sub.pour}. Modules à la carte selon le diagnostic : caisse et ERP, réimplantation, marque, fidélité.`;
      incl = ["Diagnostic de votre magasin : ventes, marges, ruptures, implantation", "Tableau de bord mensuel et support caisse", "Plan d'action chiffré et suivi", "Accès aux accords d'achat négociés par Magmart"];
      weeks = [["Diagnostic du magasin et des chiffres", 2], ["Plan d'action et premiers réglages (prix, rayons, caisse)", 4]];
    } else if (key === "decision") {
      // Projet sans local : on commence par l'Étude Décision ; la formule d'ouverture est donnée à titre indicatif
      const D = FORMULES.decision, nextKey = a.surface <= 400 ? "superette" : "supermarche", N = FORMULES[nextKey];
      const nfee = fees(nextKey, a.surface, est.total);
      head = D.nom;
      price = `${fmtX(D.prix_min)} – ${fmtX(D.prix_max)} <small>HT selon le site</small>`;
      priceNote = `${D.note}. Si le projet est validé : ${N.nom}, environ ${fmt(nfee.value)} HT d'honoraires (minimum ${fmtX(N.prix_min)}), choisi lors du diagnostic avec l'un des trois modes (Délégué, Accompagné ou Coaching).`;
      incl = [...D.inclus, "Aide à la recherche et à la validation du local"];
      weeks = [["Étude Décision et recherche du local", 6], ...N.semaines.slice(1)];
    } else {
      const F = FORMULES[key];
      const fee = fees(key, a.surface, est.total);
      head = F.nom;
      price = `${fmt(fee.value)} <small>HT d'honoraires</small>`;
      priceNote = `${fee.capped ? "Plafonné à " + (est.total > 3e6 ? "6" : "8") + " % de votre budget d'ouverture. " : ""}${fee.floor ? "Montant minimum de la formule. " : ""}Fourchette de la formule : ${fmt(F.prix_min)} – ${fmt(F.prix_max)}. Payable par étapes. Trois modes possibles (Délégué, Accompagné ou Coaching), choisis lors du diagnostic.`;
      incl = F.inclus;
      weeks = [...F.semaines];
    }

    // Budget déclaré contre budget estimé
    let budgetMsg = "";
    const B = BUDGETS[a.budget];
    if (opening && B) {
      if (est.total * 0.85 > B[1]) budgetMsg = `<p class="reco-alert bad">Votre budget envisagé paraît <strong>insuffisant</strong> pour ce projet (estimation ${fmt(est.total * 0.85)} – ${fmt(est.total * 1.2)}). Pistes : surface plus petite, local déjà aménagé, crédit-bail sur le froid, mode Accompagné.</p>`;
      else if (est.total * 1.2 < B[0]) budgetMsg = `<p class="reco-alert ok">Votre budget couvre largement l'estimation : une marge pour des rayons métiers ou une réserve de trésorerie plus confortable.</p>`;
      else budgetMsg = `<p class="reco-alert ok">Votre budget envisagé est cohérent avec l'estimation.</p>`;
    }

    // Calendrier construit à rebours depuis la date visée
    const totalW = weeks.reduce((s, [, w]) => s + w, 0);
    const today = new Date();
    let start, warn = "";
    const dateOk = /^\d{4}-\d{2}$/.test(a.date || "");
    if (dateOk) {
      const target = new Date(a.date + "-15");
      start = new Date(target); start.setDate(start.getDate() - totalW * 7);
      const minStart = new Date(today); minStart.setDate(minStart.getDate() + 10);
      if (start < minStart) { start = minStart; const earliest = new Date(minStart); earliest.setDate(earliest.getDate() + totalW * 7); warn = `La date visée est serrée : ouverture possible au plus tôt en ${monthLabel(earliest)}. Une ouverture express ou un léger décalage sécuriserait le projet.`; }
    } else { start = new Date(today); start.setDate(start.getDate() + 10); }
    const cursor = new Date(start);
    const tl = weeks.map(([label, w]) => { const from = new Date(cursor); cursor.setDate(cursor.getDate() + w * 7); return `<li><b>${monthLabel(from)}</b><span>${label} <span class="muted">· ${w} sem.</span></span></li>`; }).join("")
      + `<li class="${warn ? "warn" : ""}"><b>${monthLabel(cursor)}</b><span><strong>${opening ? "Ouverture de votre magasin" : "Premiers résultats mesurés"}</strong></span></li>`;

    $("reco-title").textContent = `${S.titre} · ${a.ville || "ville à préciser"} · ${a.surface} m²`;
    $("reco").innerHTML = `
      <div class="reco-head">
        <div class="reco-pack">
          <span class="eyebrow">Notre recommandation</span>
          <h3>${head}</h3>
          <div class="price">${price}</div>
          <p>${priceNote}</p>
        </div>
        ${opening ? `<div class="reco-budget">
          <span class="eyebrow">Budget d'ouverture estimé</span>
          <b>${fmt(est.total)}</b>
          <small>Fourchette ${fmt(est.total * 0.85)} – ${fmt(est.total * 1.2)} · ${FORMATS[format]}, local ${ETATS[a.etat] || "à rénover"}. Réglé directement à vos fournisseurs.</small>
        </div>` : `<div class="reco-budget"><span class="eyebrow">Votre magasin</span><b>${a.surface} m²</b><small>${FORMATS[format]}${a.ville ? " · " + a.ville : ""}. L'étape Rentabilité analyse vos chiffres actuels.</small></div>`}
      </div>
      ${budgetMsg}
      ${a.mre ? `<p class="reco-alert info">Vous vivez à l'étranger : l'option Suivi à distance (8 000 MAD HT) ajoute une visio hebdomadaire, des photos de chantier et la signature en ligne. <a href="mre.html">Comment ça marche</a></p>` : ""}
      <div class="reco-block"><h3>Ce que comprend l'accompagnement</h3><ul class="checklist">${incl.map((i) => `<li>${i}</li>`).join("")}</ul></div>
      <div class="reco-block"><h3>Votre calendrier ${dateOk ? "à partir de la date visée" : "indicatif"}</h3>${warn ? `<p class="reco-alert bad">${warn}</p>` : ""}<ol class="timeline">${tl}</ol></div>`;

    // Suite du parcours
    $("reco-next").href = opening ? "simulateur.html" : "exploitation.html";
    $("reco-next-label").textContent = opening ? "Continuer : mon budget d'ouverture" : "Continuer : analyser ma rentabilité";
    $("reco-wa").href = waLink([
      "Bonjour Magmart, voici mon projet (Simuler mon projet, étape Profil) :",
      `• Stade : ${S.titre}${a.mre ? " · je vis à l'étranger" : ""}`,
      `• ${a.ville || "Ville à préciser"}, ${a.surface} m²${a.local && !$("q-local").hidden ? ", " + LOCAUX[a.local] : ""}${opening && a.etat ? ", état " + ETATS[a.etat] : ""}`,
      `• Format : ${a.format === "conseil" ? "à définir avec Magmart" : FORMATS[format]}${a.rayons.length ? " · " + a.rayons.map((r) => RAYONS[r]).join(", ") : ""}`,
      opening ? `• Budget envisagé : ${$("wz-budget").selectedOptions[0].textContent} · estimé ${fmt(est.total)}` : "",
      monthFr(a.date) ? `• Date visée : ${monthFr(a.date)}` : "",
      `• Recommandation : ${head}`,
      "Je souhaite réserver mon diagnostic offert.",
    ].filter(Boolean).join("\n"));
  }

  /* ---------------- Démarrage ---------------- */
  const saved = Projet.get();
  const q = new URLSearchParams(location.search);
  const qStade = q.get("stade");
  if (Object.keys(saved).length) restore(saved);
  if (qStade && STADE[qStade]) {               // arrivée depuis une tuile de l'accueil : la question 1 est déjà répondue
    form.querySelector(`[name=stade][value=${qStade}]`).checked = true;
    if (q.get("mre")) form.mre.checked = true;
    show(2);
  } else if (saved.wizardStep > 1 && saved.stade) {
    $("wz-resume").hidden = false;
    $("wz-continue").addEventListener("click", () => { $("wz-resume").hidden = true; show(saved.wizardDone ? TOTAL : saved.wizardStep); });
    $("wz-restart").addEventListener("click", () => {
      form.reset(); $("wz-resume").hidden = true;
      Projet.set({ stade: null, mre: false, local: null, ville: "", etat: null, format: null, formatChoisi: null, rayons: [], budget: "", date: "", wizardStep: 1, wizardDone: false });
      $("wz-surface-out").textContent = `${form.surface.value} m²`;
      show(1);
    });
    show(1);
  } else {
    if (q.get("mre")) form.mre.checked = true;
    show(1);
  }
})();
