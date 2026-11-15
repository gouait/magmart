/* MAGMART — « Préparer mon dossier de financement » (dossier.html).
   Assemble un dossier bancaire à partir des étapes précédentes : projet (parcours guidé), budget d'ouverture,
   implantation (Studio 2D) et prévisionnel (simulateur d'exploitation). Imprimable en PDF.
   Dépend de main.js (Projet, estimateBudget, SIM, fmt, waLink). Montants en MAD HT. */

(() => {
  const form = document.getElementById("dform");
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const nf = (v, d = 0) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: d, minimumFractionDigits: d }).format(v);
  const mad = (v) => `${v < 0 ? "\u2212" : ""}${nf(Math.abs(Math.round(v / 100) * 100))}\u00a0MAD`;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const PROFILS = { creation: "Création d'un premier magasin", expansion: "Ouverture d'un nouveau point de vente", transformation: "Modernisation d'un magasin existant", existant: "Développement d'un magasin en activité", mre: "Investissement depuis l'étranger", promoteur: "Commerce en pied d'immeuble" };
  const RAYONS = { fl: "fruits et légumes", boucherie: "boucherie", boulangerie: "boulangerie", ecom: "vente en ligne et livraison" };
  const STATUTS = { pp: "Personne physique (commerçant)", sarlau: "SARL AU", sarl: "SARL", ae: "Auto-entrepreneur" };

  const PIECES = [
    ["Porteur de projet", [
      ["cin", "Copie de la CIN (et carte de séjour pour un MRE)"],
      ["cv", "CV et justificatifs d'expérience (commerce, gestion)"],
      ["releves", "Relevés bancaires des 6 derniers mois"],
      ["revenus", "Justificatifs de revenus ou avis d'imposition"],
      ["apport", "Justificatif de l'apport personnel (attestation de solde, épargne)"],
    ]],
    ["Entreprise", [
      ["statuts", "Statuts et attestation de dépôt du capital (société)"],
      ["rc", "Registre de commerce (modèle J), ICE et identifiant fiscal"],
      ["patente", "Inscription à la taxe professionnelle"],
    ]],
    ["Projet", [
      ["bail", "Bail commercial, promesse de bail ou titre du local"],
      ["devis", "Devis travaux, mobilier, froid et caisse (consultation comparée)"],
      ["plans", "Plan d'implantation du magasin (Studio 2D, puis plan Magmart)"],
      ["marche", "Étude de zone et de concurrence"],
      ["previsionnel", "Prévisionnel sur 3 ans et plan de financement (ce dossier)"],
      ["autorisations", "Autorisations : commune (Rokhas), enseigne, ONSSA si rayon métier"],
    ]],
    ["Garanties", [
      ["caution", "Caution personnelle du porteur"],
      ["nantissement", "Nantissement du fonds de commerce et du matériel"],
      ["garantie", "Garantie publique (Tamwilcom) à solliciter par la banque"],
    ]],
  ];

  /* ---------------- Données des étapes précédentes ---------------- */
  function context() {
    const p = Projet.get();
    const x = p.exploitation;
    const surface = x?.inputs?.surface || p.surface || 200;
    const format = (x?.inputs?.format && SIM.formats[x.inputs.format]) ? x.inputs.format : (SIM.formats[p.format] ? p.format : "proxi");
    const est = estimateBudget({ format, surface, etat: p.etat || "renover", frais: (p.rayons || []).some((r) => r === "boucherie" || r === "boulangerie"), ecom: (p.rayons || []).includes("ecom") });
    let plan = null;
    try { plan = JSON.parse(localStorage.getItem("magmart-plan")); } catch { /* aucun plan */ }
    return { p, x, surface, format, est, plan };
  }

  function defaults(c) {
    const d = c.p.dossier || {};
    return {
      nom: d.nom || "", statut: d.statut || (c.p.profil === "expansion" ? "sarlau" : "pp"), experience: d.experience || "",
      apport: d.apport ?? c.x?.inputs?.apport ?? 30, rate: d.rate ?? c.x?.inputs?.rate ?? 6.5, years: d.years ?? c.x?.inputs?.years ?? 7,
      leasing: d.leasing ?? 0, fournisseur: d.fournisseur ?? 0, honoraires: d.honoraires ?? 0, subvention: d.subvention ?? 0,
      pieces: d.pieces || {},
    };
  }

  function write(v) {
    ["nom", "statut", "experience", "apport", "rate", "years", "leasing", "fournisseur", "honoraires", "subvention"].forEach((k) => { if (form.elements["d-" + k]) form.elements["d-" + k].value = v[k]; });
  }
  function read() {
    const n = (k) => { const x = parseFloat(String(form.elements["d-" + k].value).replace(",", ".")); return isNaN(x) ? 0 : x; };
    return {
      nom: form.elements["d-nom"].value.trim(), statut: form.elements["d-statut"].value, experience: form.elements["d-experience"].value.trim(),
      apport: n("apport"), rate: n("rate"), years: n("years"), leasing: n("leasing"), fournisseur: n("fournisseur"), honoraires: n("honoraires"), subvention: n("subvention"),
    };
  }

  /* ---------------- Calculs ---------------- */
  function schedule(loan, rate, years) {
    const r = rate / 100 / 12, n = Math.max(1, Math.round(years * 12));
    const pay = loan > 0 ? (r > 0 ? (loan * r) / (1 - Math.pow(1 + r, -n)) : loan / n) : 0;
    let crd = loan; const rows = [];
    for (let y = 1; y <= Math.ceil(n / 12); y++) {
      let i = 0, k = 0;
      for (let m = 0; m < 12 && crd > 0.5; m++) { const it = crd * r; const pr = Math.min(crd, pay - it); i += it; k += pr; crd -= pr; }
      rows.push({ y, interest: i, principal: k, annuity: i + k, crd: Math.max(0, crd) });
    }
    return { pay, rows };
  }

  function compute(c, v) {
    // Besoins : lignes du budget d'ouverture, recalées sur l'investissement retenu dans le simulateur d'exploitation
    const invest = c.x?.inputs?.invest || c.p.budgetEstime || c.est.total;
    const k = invest / c.est.total;
    const needs = c.est.lines.map(([l, a]) => [l, a * k]);
    if (v.honoraires > 0) needs.push(["Honoraires d'accompagnement Magmart", v.honoraires]);
    const totalNeeds = needs.reduce((s, [, a]) => s + a, 0);
    const line = (start) => needs.find(([l]) => l.startsWith(start))?.[1] || 0;

    // Ressources plafonnées pour que leur total égale exactement les besoins :
    // l'apport passe en premier, puis le crédit-bail, le crédit fournisseur et l'aide ; le crédit bancaire complète
    const pct = (x) => Math.min(100, Math.max(0, x)) / 100;
    let reste = totalNeeds;
    const take = (x) => { const t = Math.min(Math.max(0, x), reste); reste -= t; return t; };
    const apport = take(totalNeeds * pct(v.apport));
    const leasing = take((line("Froid") + line("Caisse")) * pct(v.leasing));
    const fournisseur = take(line("Stock") * pct(v.fournisseur));
    const subvention = take(v.subvention);
    const credit = reste;
    const res = [["Apport personnel", apport], ["Crédit bancaire d'investissement", credit]];
    if (leasing > 0) res.push(["Crédit-bail (leasing) froid et caisse", leasing]);
    if (fournisseur > 0) res.push(["Crédit fournisseur sur le stock d'ouverture", fournisseur]);
    if (subvention > 0) res.push(["Subvention ou aide publique", subvention]);
    const sch = schedule(credit, v.rate, v.years);
    return { needs, totalNeeds, res, credit, apport, sch };
  }

  /* ---------------- Rendu du dossier ---------------- */
  const pc = (v) => `${nf(v * 100, 0)} %`;
  function ratio(ok, warn, label, value, note) {
    const lvl = ok ? "ok" : warn ? "warn" : "bad";
    return `<li class="${lvl}"><b>${label}</b><span>${value}</span><small>${note}</small></li>`;
  }

  function render() {
    const c = context();
    const v = read();
    const pieces = Projet.get().dossier?.pieces || {};
    Projet.set({ dossier: { ...v, pieces } });
    const f = compute(c, v);
    const x = c.x?.central, xp = c.x?.prudent;
    const p = c.p;
    const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const fmtLabel = SIM.formats[c.format].label.toLowerCase();

    // État des étapes sources
    $("d-status").innerHTML = [
      [!!p.wizardDone, "Profil", "demarrer.html"],
      [!!p.budgetEstime, "Budget d'ouverture", "simulateur.html"],
      [!!c.plan?.items?.length, "Plan & rayons", "planificateur.html"],
      [!!x, "Rentabilité", "exploitation.html"],
    ].map(([ok, l, href]) => `<a href="${href}" class="${ok ? "done" : "todo"}">${ok ? "✓" : "○"} ${l}</a>`).join("");
    $("d-missing").hidden = !!x;

    // 1. Projet
    const rayons = (p.rayons || []).map((r) => RAYONS[r]).filter(Boolean);
    const planTxt = c.plan?.items?.length ? ` L'implantation prévoit ${c.plan.items.filter((i) => i.type === "caisse").length} poste(s) de caisse et ${c.plan.items.length} éléments de mobilier.` : "";
    const projetTxt = `<strong>Objet :</strong> ${PROFILS[p.profil] || "Création d'un magasin"}.<br><strong>Format :</strong> ${SIM.formats[c.format].label}, ${nf(c.surface)}\u00a0m²${p.ville ? `, ${esc(p.ville)}` : ""}${rayons.length ? `, avec ${rayons.join(", ")}` : ""}.${planTxt}<br><strong>Ouverture visée :</strong> ${monthFr(p.date) || "date à confirmer"}.<br>Le magasin ouvrira sous l'enseigne propre du porteur de projet, avec l'accompagnement de Magmart pour la conception, la réalisation et la mise en exploitation.`;

    // 4. Prévisionnel
    const plRows = [["Chiffre d'affaires HT", "ca"], ["Marge brute", "mb"], ["Charges de personnel", "personnel"], ["Loyer", "loyer"], ["EBE", "ebe"], ["Amortissements", "amort"], ["Frais financiers", "interest"], ["Résultat net", "net"], ["Capacité d'autofinancement (CAF)", "caf"]];
    const prev = x ? `<table class="d-table"><thead><tr><th></th><th>Année 1</th><th>Année 2</th><th>Année 3</th></tr></thead><tbody>${plRows.map(([l, kk]) => `<tr class="${["ebe", "net", "caf"].includes(kk) ? "strong" : ""}"><td>${l}</td>${x.years.map((y) => `<td>${mad(y[kk])}</td>`).join("")}</tr>`).join("")}</tbody></table>
      <p class="d-note">Hypothèses du scénario central : ${nf(x.clients)} clients par jour, panier moyen ${nf(c.x.inputs.ticket)} MAD, ${nf(c.x.inputs.days)} jours d'ouverture, marge brute ${nf(x.tauxMB * 100, 1)} %, ${nf(c.x.inputs.staff)} employés. Montée en charge sur les premiers mois.</p>`
      : `<p class="d-warn">Prévisionnel à compléter : passez par l'étape <a href="exploitation.html">Rentabilité</a>.</p>`;

    // 6. Indicateurs bancaires
    const annuity2 = f.sch.rows[1]?.annuity || f.sch.rows[0]?.annuity || 0;
    const dscr = x && annuity2 > 0 ? x.years[1].caf / annuity2 : null;
    const apportPct = f.apport / f.totalNeeds;
    const safety = x ? 1 - x.seuilClients / Math.max(1, x.clients) : null;
    const ratios = [
      ratio(apportPct >= 0.3, apportPct >= 0.2, "Apport personnel", pc(apportPct), "Les banques attendent souvent 20 à 30 % du besoin total."),
      dscr != null ? ratio(dscr >= 1.5, dscr >= 1.2, "Couverture des échéances (année 2)", `${nf(dscr, 2)} ×`, "Capacité d'autofinancement (CAF) ÷ annuité du crédit. Au-dessus de 1,2 la dette est en général jugée soutenable, 1,5 est confortable.") : "",
      x && x.seuilClients != null ? ratio(safety >= 0.2, safety >= 0.08, "Marge de sécurité", pc(Math.max(0, safety)), `Seuil de rentabilité : ${nf(x.seuilClients)} clients/jour pour ${nf(x.clients)} prévus.`) : "",
      x ? ratio(x.payback && x.payback <= 72, x.payback && x.payback <= 108, "Délai de retour sur investissement", x.payback ? (x.payback <= 120 ? `${nf(x.payback / 12, 1)} ans` : "> 10 ans") : "non atteint", "Délai pour récupérer l'investissement avec les flux d'exploitation.") : "",
      xp ? ratio(xp.years[1].ebe > 0 && xp.minCash >= 0, xp.years[1].ebe > 0, "Test de résistance (scénario prudent)", `EBE an 2 : ${mad(xp.years[1].ebe)}`, "20 % de clients en moins et un point de marge en moins.") : "",
    ].join("");

    const sch = f.sch.rows.map((r) => `<tr><td>Année ${r.y}</td><td>${mad(r.annuity)}</td><td>${mad(r.interest)}</td><td>${mad(r.principal)}</td><td>${mad(r.crd)}</td></tr>`).join("");
    const piecesHtml = PIECES.filter(([g]) => g !== "Entreprise" || v.statut !== "pp").map(([g, list]) => `<div class="d-pieces-g"><h4>${g}</h4>${list.map(([key, l]) => `<label><input type="checkbox" data-piece="${key}" ${pieces[key] ? "checked" : ""}><span>${l}</span></label>`).join("")}</div>`).join("");
    const nbPieces = PIECES.filter(([g]) => g !== "Entreprise" || v.statut !== "pp").reduce((s, [, l]) => s + l.length, 0);
    const okPieces = PIECES.flatMap(([g, l]) => (g !== "Entreprise" || v.statut !== "pp") ? l.map(([kk]) => kk) : []).filter((kk) => pieces[kk]).length;

    $("dossier-doc").innerHTML = `
      <header class="d-cover">
        <span class="eyebrow">Dossier de financement</span>
        <h2>${SIM.formats[c.format].label} · ${nf(c.surface)} m²${p.ville ? ` · ${esc(p.ville)}` : ""}</h2>
        <p>${v.nom ? `Porteur de projet : <strong>${esc(v.nom)}</strong> · ` : ""}${STATUTS[v.statut]} · Préparé le ${today}</p>
        <div class="d-keys">
          <div><small>Besoin total</small><b>${mad(f.totalNeeds)}</b></div>
          <div><small>Crédit sollicité</small><b>${mad(f.credit)}</b></div>
          <div><small>Mensualité</small><b>${mad(f.sch.pay)}</b></div>
          <div><small>CA année 2</small><b>${x ? mad(x.years[1].ca) : "—"}</b></div>
        </div>
      </header>

      <section class="d-sec"><h3><span>1</span>Le projet</h3><p>${projetTxt}</p></section>

      <section class="d-sec"><h3><span>2</span>Le porteur de projet</h3>
        <p>${v.nom ? esc(v.nom) : "Nom à compléter"} · ${STATUTS[v.statut]}.</p>
        <p>${v.experience ? esc(v.experience) : "<em class='d-warn'>Décrivez votre expérience : commerce, gestion d'équipe, connaissance du quartier. C'est un critère clé pour la banque.</em>"}</p>
      </section>

      <section class="d-sec"><h3><span>3</span>Plan de financement initial</h3>
        <div class="d-2col">
          <table class="d-table"><thead><tr><th>Besoins</th><th>MAD HT</th></tr></thead><tbody>${f.needs.map(([l, a]) => `<tr><td>${l}</td><td>${mad(a)}</td></tr>`).join("")}<tr class="strong"><td>Total des besoins</td><td>${mad(f.totalNeeds)}</td></tr></tbody></table>
          <table class="d-table"><thead><tr><th>Ressources</th><th>MAD HT</th></tr></thead><tbody>${f.res.map(([l, a]) => `<tr><td>${l}</td><td>${mad(a)}</td></tr>`).join("")}<tr class="strong"><td>Total des ressources</td><td>${mad(f.res.reduce((s, [, a]) => s + a, 0))}</td></tr></tbody></table>
        </div>
      </section>

      <section class="d-sec"><h3><span>4</span>Compte de résultat prévisionnel</h3>${prev}</section>

      <section class="d-sec"><h3><span>5</span>Remboursement du crédit</h3>
        <p>Crédit de ${mad(f.credit)} sur ${nf(v.years)} ans au taux de ${nf(v.rate, 2)} % : mensualité de <strong>${mad(f.sch.pay)}</strong>.</p>
        <table class="d-table"><thead><tr><th></th><th>Annuité</th><th>Intérêts</th><th>Capital remboursé</th><th>Capital restant dû</th></tr></thead><tbody>${sch}</tbody></table>
      </section>

      <section class="d-sec"><h3><span>6</span>Indicateurs regardés par la banque</h3><ul class="d-ratios">${ratios}</ul></section>

      <section class="d-sec"><h3><span>7</span>Pièces à réunir <small class="d-count">${okPieces} / ${nbPieces} prêtes</small></h3><div class="d-pieces">${piecesHtml}</div></section>

      <section class="d-sec"><h3><span>8</span>Pistes de financement à étudier</h3>
        <ul class="d-list">
          <li><strong>Crédit d'investissement bancaire</strong>, souvent sur 5 à 7 ans, éventuellement adossé à une garantie publique que la banque sollicite.</li>
          <li><strong>Programmes publics d'appui</strong> aux très petites entreprises (par exemple Intelaka, garantie Tamwilcom) : éligibilité, taux et plafonds à vérifier auprès de votre banque.</li>
          <li><strong>Crédit-bail (leasing)</strong> pour le froid commercial et la caisse : préserve l'apport et la trésorerie.</li>
          <li><strong>Crédit fournisseur</strong> sur le stock d'ouverture, auprès des grossistes ou des plateformes B2B pour épiciers.</li>
          ${p.profil === "mre" ? "<li><strong>Offres bancaires dédiées aux MRE</strong> : prêts d'investissement au Maroc proposés par les banques ayant un réseau à l'étranger.</li>" : ""}
        </ul>
        <p class="d-note">Conditions indicatives, à vérifier auprès de chaque organisme. Magmart peut vous orienter vers des banques et des sociétés de crédit-bail ; l'aide au financement est incluse dans les formules Supérette et Supermarché.</p>
      </section>

      <footer class="d-foot">Dossier préparé avec les outils Magmart à partir de vos hypothèses. Estimations indicatives, à consolider avec les devis réels et un expert-comptable avant dépôt.</footer>`;

    // L'envoi se fait depuis « Simuler mon projet » (synthèse)
  }

  /* ---------------- Démarrage ---------------- */
  write(defaults(context()));
  form.addEventListener("input", render);
  form.addEventListener("submit", (e) => e.preventDefault());
  $("dossier-doc").addEventListener("change", (e) => {
    const k = e.target.dataset.piece; if (!k) return;
    const d = Projet.get().dossier || {};
    Projet.set({ dossier: { ...d, pieces: { ...(d.pieces || {}), [k]: e.target.checked } } });
    render();
  });
  $("d-print").addEventListener("click", () => window.print());
  render();
})();
