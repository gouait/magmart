/* MAGMART — Simuler mon projet (projet.html) : avancement des 5 étapes, chiffres clés, envoi unique du dossier.
   Dépend de main.js (Projet, projectStatus, fmt, waLink) et de tarifs.js (TARIFS). */

(() => {
  const box = document.getElementById("hub-steps");
  if (!box) return;
  const $ = (id) => document.getElementById(id);
  const STADE = Object.fromEntries(TARIFS.STADES.map((s) => [s.key, s]));
  const FORMATS = { proxi: "Supérette de proximité", premium: "Supérette premium", super: "Supermarché" };

  function planInfo() {
    try {
      const plan = JSON.parse(localStorage.getItem("magmart-plan"));
      if (!plan?.items?.length) return null;
      const lanes = plan.items.filter((i) => i.type === "caisse").length;
      return `${plan.W} × ${plan.D} m · ${plan.items.length} meubles · ${lanes} caisse${lanes > 1 ? "s" : ""}`;
    } catch { return null; }
  }

  function photosInfo() {
    try {
      const m = JSON.parse(localStorage.getItem("magmart-local"));
      if (!m?.count) return null;
      const sent = m.envoi ? ` · envoyées le ${new Date(m.envoi.date).toLocaleDateString("fr-FR")}` : "";
      return `${m.count} photo${m.count > 1 ? "s" : ""} · ${m.essentials} sur ${m.essentialsTotal} essentielles${sent}`;
    } catch { return null; }
  }

  function render() {
    const p = Projet.get();
    const st = projectStatus();
    const ex = p.exploitation?.central;
    const pieces = Object.values(p.dossier?.pieces || {}).filter(Boolean).length;
    const steps = [
      { key: "profil", n: 1, href: "demarrer.html", title: "Profil", desc: "Votre stade, votre local et la formule recommandée.",
        info: st.profil ? `${STADE[p.stade]?.titre || "Projet"} · ${p.ville || "ville à préciser"} · ${p.surface} m²` : null },
      { key: "budget", n: 2, href: "simulateur.html", title: "Budget", desc: "Travaux, froid, rayons, caisse et stock, poste par poste.",
        info: st.budget ? `Estimé à ${fmt(p.budgetEstime)}` : null },
      { key: "plan", n: 3, href: "planificateur.html", title: "Plan & rayons", desc: "Dessinez le local, placez le mobilier, construisez les rayons.", optional: true,
        info: planInfo() },
      { key: "rentabilite", n: 4, href: "exploitation.html", title: "Rentabilité", desc: "Seuil de rentabilité, EBE et trésorerie sur 3 ans.",
        info: ex ? `CA année 2 : ${fmt(ex.years[1].ca)} · ${ex.seuilClients != null ? "seuil : " + ex.seuilClients + " clients/jour" : "seuil non atteint"}` : null },
      { key: "financement", n: 5, href: "dossier.html", title: "Financement", desc: "Plan de financement, remboursement, ratios et pièces pour la banque.",
        info: st.financement ? `${pieces} pièce${pieces > 1 ? "s" : ""} prête${pieces > 1 ? "s" : ""}${p.dossier?.nom ? " · " + p.dossier.nom : ""}` : null },
      { key: "photos", n: 6, href: "photos.html", title: "Photos du local", desc: "Vous avez un local ? Mur par mur, une première visite sans déplacement.", optional: true,
        info: photosInfo() },
    ];
    st.photos = !!photosInfo();
    const next = steps.find((s) => !st[s.key] && !s.optional) || steps.find((s) => !st[s.key]);

    box.innerHTML = steps.map((s) => `
      <a class="card card--link hub-step${st[s.key] ? " is-done" : ""}${next && next.key === s.key ? " is-next" : ""}" href="${s.href}">
        <span class="hub-n" aria-hidden="true">${st[s.key] ? "✓" : s.n}</span>
        <span class="hub-body">
          <b>${s.title}${s.optional ? ' <span class="badge badge--info">Facultatif</span>' : ""}</b>
          <span>${s.info || s.desc}</span>
        </span>
        <span class="hub-go">${st[s.key] ? "Modifier" : next && next.key === s.key ? "Commencer" : "Ouvrir"} →</span>
      </a>`).join("");

    const required = steps.filter((s) => !s.optional);
    const done = required.filter((s) => st[s.key]).length;
    const complete = done === required.length;
    $("hub-progress").textContent = complete ? "Les quatre étapes essentielles sont complètes (le plan et les photos sont facultatifs)." : `${done} étape${done > 1 ? "s" : ""} essentielle${done > 1 ? "s" : ""} sur ${required.length} complétée${done > 1 ? "s" : ""} (le plan et les photos sont facultatifs).`;
    // Une seule action principale : continuer tant que le dossier est incomplet, envoyer ensuite
    $("hub-next").hidden = complete || !next;
    if (next) { $("hub-next").href = next.href; $("hub-next").textContent = `${done ? "Continuer" : "Commencer"} : ${next.title}`; }
    $("hub-send").className = `btn ${complete ? "btn--primary" : "btn--ghost"} btn--block`;
    $("hub-send").textContent = complete ? "Envoyer mon dossier et réserver mon diagnostic" : "Envoyer dès maintenant et réserver mon diagnostic";
    $("hub-bar").style.width = `${(done / required.length) * 100}%`;

    const keys = [
      ["Projet", p.stade ? `${STADE[p.stade]?.titre}${p.mre ? " · depuis l'étranger" : ""}` : "—"],
      ["Magasin", p.surface ? `${FORMATS[p.format] || "Format à définir"}, ${p.surface} m²` : "—"],
      ["Budget d'ouverture", p.budgetEstime ? fmt(p.budgetEstime) : "—"],
      ["EBE année 2", ex ? fmt(ex.years[1].ebe) : "—"],
      ["Retour sur investissement", ex?.payback ? (ex.payback <= 120 ? `${(ex.payback / 12).toFixed(1).replace(".", ",")} ans` : "> 10 ans") : "—"],
    ];
    $("hub-keys").innerHTML = keys.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");

    $("hub-send").href = waLink([
      "Bonjour Magmart, voici mon dossier depuis « Simuler mon projet » :",
      p.stade ? `• Projet : ${STADE[p.stade]?.titre}${p.mre ? " (je vis à l'étranger)" : ""} · ${p.ville || "ville à préciser"} · ${p.surface} m²` : "• Profil à compléter",
      p.budgetEstime ? `• Budget d'ouverture estimé : ${fmt(p.budgetEstime)}` : "",
      planInfo() ? `• Plan : ${planInfo()}` : "",
      ex ? `• Rentabilité : CA année 2 ${fmt(ex.years[1].ca)}, EBE ${fmt(ex.years[1].ebe)}, ${ex.seuilClients != null ? "seuil " + ex.seuilClients + " clients/jour" : "seuil non atteint"}` : "",
      p.dossier?.nom ? `• Financement : dossier préparé au nom de ${p.dossier.nom}, ${pieces} pièce(s) prête(s)` : "",
      photosInfo() ? `• Photos du local : ${photosInfo()}${/envoyées/.test(photosInfo()) ? "" : " (je vous les envoie depuis la page Photos du local)"}` : "",
      "Je souhaite réserver mon diagnostic offert.",
    ].filter(Boolean).join("\n"));
  }

  $("hub-clear").addEventListener("click", () => {
    if (!confirm("Effacer toutes les données de votre projet enregistrées dans ce navigateur ?")) return;
    ["magmart-projet", "magmart-plan", "magmart-exploitation", "magmart-local"].forEach((k) => { try { localStorage.removeItem(k); } catch { /* rien */ } });
    try { indexedDB.deleteDatabase("magmart-photos"); } catch { /* rien */ }
    render();
  });
  render();
})();
