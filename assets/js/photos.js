/* MAGMART — Photos de mon local (photos.html) : visite guidée en photos, stockées sur l'appareil (IndexedDB)
   jusqu'à l'envoi. Envoi, dans l'ordre de préférence :
   1. vers le point de collecte Magmart si PHOTOS_ENDPOINT est renseigné (script Google Apps Script → Google Drive) ;
   2. sinon, sur téléphone, par le menu de partage (WhatsApp, e-mail…) ;
   3. sinon, en dossier .zip à joindre sur WhatsApp Web ou par e-mail.
   Dépend de main.js (Projet, waLink, WHATSAPP). */

const PHOTOS_ENDPOINT = ""; // URL de l'application Web Apps Script (voir la procédure interne « Collecte des photos »)

(() => {
  const root = document.querySelector(".ph-layout");
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const META = "magmart-local";
  const MAX_SIDE = 2000, QUALITY = 0.82, MAX_TOTAL = 60;
  const slots = [...document.querySelectorAll(".ph-slot")];
  const urls = new Map();

  /* ---------------- Stockage : photos en IndexedDB, le reste en localStorage ---------------- */
  const db = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB indisponible"));
    const rq = indexedDB.open("magmart-photos", 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore("photos", { keyPath: "id" });
    rq.onsuccess = () => resolve(rq.result);
    rq.onerror = () => reject(rq.error);
  });
  const tx = (mode, fn) => db.then((d) => new Promise((resolve, reject) => {
    const t = d.transaction("photos", mode), st = t.objectStore("photos");
    const out = fn(st);
    t.oncomplete = () => resolve(out?.result ?? out);
    t.onerror = () => reject(t.error);
  }));
  const allPhotos = () => tx("readonly", (st) => st.getAll()).then((r) => (r || []).sort((a, b) => a.ts - b.ts));
  const putPhoto = (p) => tx("readwrite", (st) => st.put(p));
  const delPhoto = (id) => tx("readwrite", (st) => st.delete(id));
  const clearPhotos = () => tx("readwrite", (st) => st.clear());

  const meta = {
    get() { try { return JSON.parse(localStorage.getItem(META)) || {}; } catch { return {}; } },
    set(patch) { const m = { ...meta.get(), ...patch }; try { localStorage.setItem(META, JSON.stringify(m)); } catch { /* stockage plein ou bloqué */ } return m; },
  };

  /* ---------------- Compression : 2 000 px maximum, JPEG ; le réencodage retire les métadonnées (GPS) ---------------- */
  async function compress(file) {
    let src, w, h;
    try {
      src = await createImageBitmap(file, { imageOrientation: "from-image" });
      w = src.width; h = src.height;
    } catch {
      src = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("format"));
        img.src = URL.createObjectURL(file);
      });
      w = src.naturalWidth; h = src.naturalHeight;
    }
    const k = Math.min(1, MAX_SIDE / Math.max(w, h));
    const c = document.createElement("canvas");
    c.width = Math.round(w * k); c.height = Math.round(h * k);
    c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
    src.close?.();
    const blob = await new Promise((resolve) => c.toBlob(resolve, "image/jpeg", QUALITY));
    if (!blob) throw new Error("format");
    return { blob, w: c.width, h: c.height };
  }

  /* ---------------- Affichage ---------------- */
  let photos = [];
  const bySlot = (key) => photos.filter((p) => p.slot === key);

  function render() {
    urls.forEach((u) => URL.revokeObjectURL(u)); urls.clear();
    const notes = meta.get().notes || {};
    for (const el of slots) {
      const key = el.dataset.slot, list = bySlot(key), max = +el.dataset.max;
      el.classList.toggle("is-done", list.length > 0);
      el.querySelector(".ph-state").textContent = list.length ? `${list.length} ✓` : "";
      el.querySelector(".ph-thumbs").innerHTML = list.map((p, i) => {
        const u = URL.createObjectURL(p.blob); urls.set(p.id, u);
        return `<li><img src="${u}" alt="${el.dataset.title}, photo ${i + 1}" width="${p.w}" height="${p.h}" loading="lazy">
          <button type="button" class="ph-del" data-id="${p.id}" aria-label="Supprimer la photo ${i + 1} : ${el.dataset.title}">×</button></li>`;
      }).join("");
      el.querySelectorAll("input[type=file]").forEach((inp) => (inp.disabled = list.length >= max));
      el.querySelector(".ph-actions").classList.toggle("is-full", list.length >= max);
      const ta = el.querySelector("textarea");
      if (document.activeElement !== ta) ta.value = notes[key] || "";
      if (notes[key]) el.querySelector(".ph-note").open = true;
    }
    const ess = slots.filter((s) => "essential" in s.dataset);
    const essDone = ess.filter((s) => bySlot(s.dataset.slot).length).length;
    $("ph-progress").textContent = `${photos.length} photo${photos.length > 1 ? "s" : ""} · ${essDone} sur ${ess.length} essentielles`;
    $("ph-bar").style.width = `${(essDone / ess.length) * 100}%`;
    meta.set({ count: photos.length, essentials: essDone, essentialsTotal: ess.length });
    const sent = meta.get().envoi;
    if (sent && !$("ph-status").dataset.live) {
      showStatus(`Dossier envoyé le ${new Date(sent.date).toLocaleDateString("fr-FR")}${sent.ref ? ` (réf. ${sent.ref})` : ""}. Vous pouvez ajouter des photos et le renvoyer.`);
    }
    $("ph-zip").disabled = !photos.length;
  }

  async function add(el, files) {
    const key = el.dataset.slot, max = +el.dataset.max;
    let room = Math.min(max - bySlot(key).length, MAX_TOTAL - photos.length);
    const skipped = files.length - Math.max(0, room);
    el.classList.add("is-busy");
    for (const f of [...files].slice(0, Math.max(0, room))) {
      try {
        const { blob, w, h } = await compress(f);
        const p = { id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, slot: key, blob, w, h, ts: Date.now() };
        await putPhoto(p).catch(() => {}); // sans IndexedDB, la photo reste en mémoire le temps de la visite
        photos.push(p);
      } catch {
        error(`Une photo n'a pas pu être lue (${f.name || "format non reconnu"}). Essayez de la reprendre avec l'appareil photo.`);
      }
    }
    el.classList.remove("is-busy");
    if (skipped > 0) error(photos.length >= MAX_TOTAL ? `Limite de ${MAX_TOTAL} photos atteinte : supprimez-en avant d'en ajouter.` : `${max} photos au maximum pour « ${el.dataset.title} ».`);
    render();
  }

  slots.forEach((el) => {
    el.querySelectorAll("input[type=file]").forEach((inp) => inp.addEventListener("change", () => {
      if (inp.files?.length) add(el, inp.files);
      inp.value = "";
    }));
    el.querySelector(".ph-thumbs").addEventListener("click", async (e) => {
      const b = e.target.closest(".ph-del");
      if (!b) return;
      await delPhoto(b.dataset.id);
      photos = photos.filter((p) => p.id !== b.dataset.id);
      render();
    });
    el.querySelector("textarea").addEventListener("input", (e) => {
      meta.set({ notes: { ...(meta.get().notes || {}), [el.dataset.slot]: e.target.value } });
    });
  });

  /* ---------------- Mesures et contact : repris du projet et du plan, enregistrés à la saisie ---------------- */
  const form = $("ph-form"), contact = $("ph-contact");
  function fill() {
    const m = meta.get(), f = m.fields || {}, p = Projet.get();
    let plan = null;
    try { plan = JSON.parse(localStorage.getItem("magmart-plan")); } catch { /* rien */ }
    const defaults = {
      largeur: plan?.W, profondeur: plan?.D, hauteur: plan?.H, surface: p.surface,
      etat: { brut: "brut", renover: "renover", bon: "bon" }[p.etat] || "", adresse: p.ville || "",
    };
    for (const el of form.elements) if (el.name) el.value = f[el.name] ?? defaults[el.name] ?? "";
    $("ph-nom").value = m.nom || p.dossier?.nom || "";
    $("ph-tel").value = m.tel || "";
  }
  form.addEventListener("input", () => meta.set({ fields: Object.fromEntries([...form.elements].filter((e) => e.name).map((e) => [e.name, e.value])) }));
  contact.addEventListener("input", () => meta.set({ nom: $("ph-nom").value.trim(), tel: $("ph-tel").value.trim() }));

  /* ---------------- Dossier : fiche lisible, projet et plan pour la CAO ---------------- */
  const slug = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  function reference() {
    const m = meta.get();
    if (m.ref) return m.ref;
    const d = new Date(), pad = (n) => String(n).padStart(2, "0");
    const ref = `MM-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2, 6).padEnd(4, "0").toUpperCase()}`;
    meta.set({ ref });
    return ref;
  }
  function fileName(p) {
    const order = slots.findIndex((s) => s.dataset.slot === p.slot) + 1;
    const n = bySlot(p.slot).indexOf(p) + 1;
    return `${String(order).padStart(2, "0")}-${p.slot}-${n}.jpg`;
  }
  function documents() {
    const m = meta.get(), f = m.fields || {}, p = Projet.get(), notes = m.notes || {};
    let plan = null;
    try { plan = JSON.parse(localStorage.getItem("magmart-plan")); } catch { /* rien */ }
    const L = [
      `MAGMART — Dossier photos du local · réf. ${reference()}`,
      `Envoyé le ${new Date().toLocaleString("fr-FR")}`, "",
      `Contact : ${m.nom || "—"} · ${m.tel || "—"}`,
      `Local : ${f.adresse || p.ville || "adresse à préciser"}`,
      `Mesures : façade ${f.largeur || "?"} m · profondeur ${f.profondeur || "?"} m · HSP ${f.hauteur || "?"} m · ${f.surface || "?"} m²`,
      `État : ${f.etat ? form.querySelector(`option[value="${f.etat}"]`)?.textContent : "—"}`,
      f.notes ? `Remarques : ${f.notes}` : "", "",
      "PHOTOS",
      ...slots.map((s) => {
        const list = bySlot(s.dataset.slot);
        const line = `- ${s.dataset.title} : ${list.length ? list.map(fileName).join(", ") : "aucune photo"}`;
        return notes[s.dataset.slot] ? `${line}\n    remarque : ${notes[s.dataset.slot]}` : line;
      }), "",
      p.stade ? `Projet simulé : stade « ${p.stade} », format ${p.format || "?"}, ${p.surface || "?"} m², budget estimé ${p.budgetEstime ? Math.round(p.budgetEstime).toLocaleString("fr-FR") + " MAD" : "—"}` : "Pas de simulation de projet.",
      plan?.items?.length ? `Plan du Studio : ${plan.W} × ${plan.D} m, ${plan.items.length} meubles (fichier plan-cao.json, à traiter avec le kit CAO).` : "Pas de plan dessiné dans le Studio.",
    ];
    const docs = { "fiche.txt": "﻿" + L.join("\r\n"), "projet.json": JSON.stringify({ projet: p, local: { ...f, notes }, contact: { nom: m.nom, tel: m.tel } }, null, 1) };
    if (plan?.items?.length) {
      docs["plan-cao.json"] = JSON.stringify({ format: "magmart-cad", version: 1, genere: new Date().toISOString(),
        projet: { ville: p.ville || "", surface: p.surface || null, format: p.format || null, stade: p.stade || null, date: p.date || null }, plan }, null, 1);
    }
    return docs;
  }

  /* ---------------- ZIP sans compression (les JPEG sont déjà compressés) ---------------- */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (u8) => { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  async function zip(entries) {
    const enc = new TextEncoder(), parts = [], central = [];
    let offset = 0;
    const d = new Date();
    const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const dosDate = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    for (const [name, data] of entries) {
      const bytes = data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : enc.encode(data);
      const fn = enc.encode(name), crc = crc32(bytes);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, dosTime, true); h.setUint16(12, dosDate, true); h.setUint32(14, crc, true);
      h.setUint32(18, bytes.length, true); h.setUint32(22, bytes.length, true); h.setUint16(26, fn.length, true); h.setUint16(28, 0, true);
      parts.push(h.buffer, fn, bytes);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
      c.setUint16(12, dosTime, true); c.setUint16(14, dosDate, true); c.setUint32(16, crc, true);
      c.setUint32(20, bytes.length, true); c.setUint32(24, bytes.length, true); c.setUint16(28, fn.length, true);
      c.setUint32(42, offset, true);
      central.push(c.buffer, fn);
      offset += 30 + fn.length + bytes.length;
    }
    const size = central.reduce((s, b) => s + b.byteLength, 0);
    const e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, entries.length, true); e.setUint16(10, entries.length, true);
    e.setUint32(12, size, true); e.setUint32(16, offset, true);
    return new Blob([...parts, ...central, e.buffer], { type: "application/zip" });
  }
  async function zipBlob() {
    const docs = documents();
    return zip([...Object.entries(docs), ...photos.map((p) => [`photos/${fileName(p)}`, p.blob])]);
  }
  const zipName = () => `magmart-local-${slug(meta.get().fields?.adresse || Projet.get().ville) || "projet"}-${reference()}.zip`;
  function save(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }

  /* ---------------- Envoi ---------------- */
  const canShareFiles = () => {
    try { return !!navigator.canShare && navigator.canShare({ files: [new File([new Blob(["x"], { type: "image/jpeg" })], "t.jpg", { type: "image/jpeg" })] }); } catch { return false; }
  };
  const mode = PHOTOS_ENDPOINT ? "endpoint" : canShareFiles() ? "share" : "zip";
  $("ph-help").textContent = {
    endpoint: "Les photos sont transmises directement et en toute confidentialité à votre conseiller Magmart.",
    share: "Le bouton ouvre le menu de partage de votre téléphone : choisissez WhatsApp et la conversation Magmart.",
    zip: "Le bouton télécharge votre dossier (.zip), puis ouvre WhatsApp : joignez-y le fichier téléchargé.",
  }[mode];

  function error(msg) { const e = $("ph-error"); e.textContent = msg; e.hidden = !msg; }
  function showStatus(msg, live) {
    const s = $("ph-status"); s.innerHTML = msg; s.hidden = !msg;
    if (live) s.dataset.live = "1";
  }
  const summary = () => {
    const m = meta.get(), f = m.fields || {};
    return `Bonjour Magmart, voici les photos de mon local (réf. ${reference()}) : ${photos.length} photos, ${f.adresse || Projet.get().ville || "adresse à préciser"}. ${m.nom || ""} ${m.tel || ""}`.trim();
  };

  async function sendEndpoint() {
    const ref = reference(), m = meta.get();
    const post = (body) => fetch(PHOTOS_ENDPOINT, { method: "POST", body: JSON.stringify({ dossier: ref, ...body }) })
      .then((r) => r.json()).then((r) => { if (!r.ok) throw new Error(r.error || "refus"); return r; });
    const toB64 = (blob) => new Promise((resolve) => { const fr = new FileReader(); fr.onload = () => resolve(String(fr.result).split(",")[1]); fr.readAsDataURL(blob); });
    for (const [i, p] of photos.entries()) {
      showStatus(`Envoi des photos : ${i + 1} sur ${photos.length}…`, true);
      await post({ action: "photo", name: fileName(p), slot: p.slot, mime: "image/jpeg", data: await toB64(p.blob) });
    }
    showStatus("Envoi de la fiche…", true);
    await post({ action: "fiche", contact: { nom: m.nom, tel: m.tel }, files: documents() });
    return ref;
  }

  contact.addEventListener("submit", async (e) => {
    e.preventDefault();
    error("");
    if (!photos.length) return error("Ajoutez au moins une photo avant d'envoyer.");
    if (!$("ph-nom").value.trim() || !$("ph-tel").value.trim()) return error("Indiquez votre nom et un numéro pour que nous puissions vous rappeler.");
    if (!$("ph-consent").checked) return error("Cochez la case d'accord pour que nous puissions recevoir vos photos.");
    meta.set({ nom: $("ph-nom").value.trim(), tel: $("ph-tel").value.trim() });
    const btn = $("ph-send");
    btn.disabled = true;
    try {
      if (mode === "endpoint") {
        const ref = await sendEndpoint();
        meta.set({ envoi: { date: Date.now(), ref, mode } });
        showStatus(`<b>C'est envoyé.</b> Votre référence : ${ref}. Un conseiller vous rappelle sous 24 h ouvrées. <a href="${waLink(summary())}" target="_blank" rel="noopener">Prévenir sur WhatsApp</a>`, true);
      } else if (mode === "share") {
        const files = photos.map((p) => new File([p.blob], fileName(p), { type: "image/jpeg" }));
        await navigator.share({ files, title: "Photos de mon local", text: summary() });
        meta.set({ envoi: { date: Date.now(), ref: reference(), mode } });
        showStatus(`Photos partagées. Pour que votre conseiller ait aussi vos mesures et votre plan, <a href="#" id="ph-zip-link">téléchargez le dossier complet (.zip)</a> et joignez-le à la conversation.`, true);
      } else {
        save(await zipBlob(), zipName());
        meta.set({ envoi: { date: Date.now(), ref: reference(), mode } });
        window.open(waLink(summary() + "\nJe joins le dossier .zip téléchargé depuis le site."), "_blank", "noopener");
        showStatus(`Dossier téléchargé : <b>${zipName()}</b>. Joignez-le dans WhatsApp (trombone › Document) ou par e-mail à <a href="mailto:contact@magmart.ma?subject=${encodeURIComponent("Photos de mon local — réf. " + reference())}">contact@magmart.ma</a>.`, true);
      }
    } catch (err) {
      if (err?.name === "AbortError") showStatus("", false);
      else {
        error(mode === "endpoint" ? "L'envoi a été interrompu (connexion ?). Réessayez, ou téléchargez le dossier .zip ci-dessous." : "Le partage n'a pas abouti. Téléchargez le dossier .zip ci-dessous et envoyez-le sur WhatsApp.");
        showStatus("", false);
      }
    } finally {
      btn.disabled = false;
      render();
    }
  });
  $("ph-zip").addEventListener("click", async () => save(await zipBlob(), zipName()));
  $("ph-status").addEventListener("click", async (e) => {
    if (e.target.id !== "ph-zip-link") return;
    e.preventDefault();
    save(await zipBlob(), zipName());
  });

  $("ph-clear").addEventListener("click", async () => {
    if (!confirm("Effacer toutes les photos du local enregistrées sur cet appareil ?")) return;
    await clearPhotos().catch(() => {});
    photos = [];
    meta.set({ notes: {}, envoi: null, ref: null });
    $("ph-status").dataset.live = ""; showStatus("", false);
    render();
  });

  fill();
  allPhotos().then((r) => { photos = r; render(); }).catch(() => {
    render();
    error("Votre navigateur bloque l'enregistrement des photos (navigation privée ?). Vous pouvez quand même les ajouter, mais elles seront perdues si vous quittez la page.");
  });
})();
