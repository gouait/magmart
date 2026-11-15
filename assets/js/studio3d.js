/* MAGMART — Studio 2D : vue 3D du magasin (Three.js, chargé à la demande).
   La scène est reconstruite depuis le plan (window.MagmartStudio, exposé par planner.js) :
   murs à la hauteur sous plafond, vitrine de façade, sol, mobilier à l'échelle, produits du planogramme.
   Repère : x (plan) → X, y (plan, vers la façade) → Z, hauteur → Y. Unités : mètres. */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/* ------------------------------------------------------------------ matériaux */
function tileTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#e9e6df"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(120,110,95,${Math.random() * 0.05})`; g.fillRect(Math.random() * 256, Math.random() * 256, 3, 3); }
  g.strokeStyle = "#c9c4b9"; g.lineWidth = 3; g.strokeRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function signTexture(label, color) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = color; g.fillRect(0, 0, 512, 128);
  g.fillStyle = "#ffffff"; g.font = "700 54px 'Plus Jakarta Sans', Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(label.toUpperCase(), 256, 66, 480);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const M = {
  wall: new THREE.MeshStandardMaterial({ color: 0xf3f1ec, roughness: 0.92 }),
  plinth: new THREE.MeshStandardMaterial({ color: 0x3b4249, roughness: 0.6, metalness: 0.3 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xe6e8ea, roughness: 0.42, metalness: 0.35 }),
  metalDark: new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.45, metalness: 0.5 }),
  rail: new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.5 }),
  cold: new THREE.MeshStandardMaterial({ color: 0x27313d, roughness: 0.35, metalness: 0.55 }),
  coldInside: new THREE.MeshStandardMaterial({ color: 0xf4f7fb, roughness: 0.6, emissive: 0xffffff, emissiveIntensity: 0.12 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xdff1ff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.16, depthWrite: false }),
  light: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.6 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xb98652, roughness: 0.75 }),
  woodDark: new THREE.MeshStandardMaterial({ color: 0x7c5532, roughness: 0.8 }),
  counter: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 }),
  belt: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 }),
  screen: new THREE.MeshStandardMaterial({ color: 0x111827, emissive: 0x2563eb, emissiveIntensity: 0.35 }),
  panel: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5, metalness: 0.1 }),
  rackUp: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5, metalness: 0.4 }),
  rackBeam: new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.5, metalness: 0.4 }),
  pallet: new THREE.MeshStandardMaterial({ color: 0xc8a06a, roughness: 0.85 }),
  carton: new THREE.MeshStandardMaterial({ color: 0xc69c6d, roughness: 0.9 }),
  frame: new THREE.MeshStandardMaterial({ color: 0x1f2a37, roughness: 0.4, metalness: 0.6 }),
};
const BOX = new THREE.BoxGeometry(1, 1, 1);
const SPHERE = new THREE.SphereGeometry(0.5, 12, 8);
const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);

/* ------------------------------------------------------------------ montage */
export function mount(container, api) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef3ef);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 400);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.minDistance = 2;

  const hemi = new THREE.HemisphereLight(0xffffff, 0xd9d4c9, 0.35);
  const sun = new THREE.DirectionalLight(0xfff6e8, 1.25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(hemi, sun, sun.target);

  let root = null;            // groupe reconstruit à chaque modification du plan
  let walls = [];             // murs masqués quand ils cachent la vue d'ensemble
  let ceiling = null;         // luminaires, visibles en visite
  let blockers = [];          // emprises du mobilier pour les collisions en visite
  let dims = { W: 10, D: 10, H: 3.5 };
  let mode = "orbit";
  const walk = { yaw: 0, pitch: -0.05, pos: new THREE.Vector3(), keys: new Set(), hold: 0 };

  /* ---------------- constructeurs ---------------- */
  // Boîte alignée sur les axes, définie dans le repère du plan (x, y) et en hauteur
  function aabb(parent, x0, x1, z0, z1, y0, y1, mat, shadow = true) {
    const m = new THREE.Mesh(BOX, mat);
    m.scale.set(Math.max(0.005, x1 - x0), Math.max(0.005, y1 - y0), Math.max(0.005, z1 - z0));
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.castShadow = shadow; m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  // Repère d'un meuble : grand axe (long) et axe transversal (cross), toujours alignés sur X ou Z
  function frame(it) {
    const b = api.box(it);
    const rot = !!it.rot;
    const L0 = rot ? b.y : b.x, C0 = rot ? b.x : b.y;
    return {
      L0, L1: L0 + it.w, C0, C1: C0 + it.d, Cm: C0 + it.d / 2,
      // boîte définie en (long, transversal, hauteur)
      box(parent, l0, l1, c0, c1, y0, y1, mat, shadow) {
        return rot ? aabb(parent, Math.min(c0, c1), Math.max(c0, c1), Math.min(l0, l1), Math.max(l0, l1), y0, y1, mat, shadow)
                   : aabb(parent, Math.min(l0, l1), Math.max(l0, l1), Math.min(c0, c1), Math.max(c0, c1), y0, y1, mat, shadow);
      },
      point(l, c, y) { return rot ? new THREE.Vector3(c, y, l) : new THREE.Vector3(l, y, c); },
      scaleVec(sl, sc, sy) { return rot ? new THREE.Vector3(sc, sy, sl) : new THREE.Vector3(sl, sy, sc); },
      sign(face) { const n = api.faceDir(it, face); return rot ? n[0] : n[1]; },
    };
  }

  // Produits : une seule InstancedMesh par forme, couleur par instance
  let P;
  function resetProducts() { P = { box: [], bottle: [], ball: [] }; }
  function pushProduct(kind, pos, scale, color) { P[kind].push({ pos, scale, color }); }
  function flushProducts(parent) {
    const geo = { box: BOX, bottle: CYL, ball: SPHERE };
    for (const kind of Object.keys(P)) {
      const list = P[kind];
      if (!list.length) continue;
      const mat = new THREE.MeshStandardMaterial({ roughness: kind === "bottle" ? 0.25 : 0.55, metalness: 0.05 });
      const mesh = new THREE.InstancedMesh(geo[kind], mat, list.length);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
      list.forEach((p, i) => { m4.compose(p.pos, q, p.scale); mesh.setMatrixAt(i, m4); mesh.setColorAt(i, col.set(p.color)); });
      mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
      mesh.castShadow = false; mesh.receiveShadow = true;
      parent.add(mesh);
    }
  }
  const rand = (seed) => { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const shade = (hex, r) => { const c = new THREE.Color(hex); const hsl = {}; c.getHSL(hsl); c.setHSL(hsl.h, Math.min(1, hsl.s * (0.85 + r * 0.3)), Math.min(0.85, Math.max(0.12, hsl.l * (0.8 + r * 0.45)))); return c.getHex(); };

  // Remplit une tablette d'un module avec des produits de la famille affectée
  function fillShelf(F, it, face, l0, l1, cBack, cFront, y0, yMax, rnd, kind = "box") {
    let l = l0 + 0.02;
    const depth = Math.abs(cFront - cBack) * 0.88;
    const cMid = (cBack + cFront) / 2;
    while (l < l1 - 0.06) {
      const w = kind === "bottle" ? 0.07 : 0.06 + rnd() * 0.07;
      if (l + w > l1 - 0.02) break;
      const h = Math.max(0.05, (yMax - y0) * (0.55 + rnd() * 0.35));
      const color = shade(F.color, rnd());
      if (kind === "bottle") {
        // rangée de bouteilles vue de face : une instance par bouteille de façade
        pushProduct("bottle", frameCache.f.point(l + w / 2, cFront - 0.06 * Math.sign(cFront - cBack), y0 + h / 2), frameCache.f.scaleVec(w * 0.9, w * 0.9, h), color);
      } else {
        pushProduct("box", frameCache.f.point(l + w / 2, cMid, y0 + h / 2), frameCache.f.scaleVec(w * 0.94, depth, h), color);
      }
      l += w + 0.004;
    }
  }
  const frameCache = { f: null };

  // Tablettes et produits d'une face, d'après le planogramme
  function shelves(f, it, face, cBack, cFront, opts = {}) {
    const pg = api.ensurePg(it);
    if (!pg) return;
    const n = api.nMods(it), mw = it.w / n;
    const rnd = rand(it.id.split("").reduce((s, ch) => s + ch.charCodeAt(0), 0) * (face === "A" ? 7 : 13));
    frameCache.f = f;
    for (let lv = 0; lv < pg.levels; lv++) {
      const [z0, z1] = api.levelBounds(it, lv);
      if (!opts.noShelf) f.box(root, f.L0 + 0.01, f.L1 - 0.01, cBack, cFront, z0 - 0.025, z0, opts.shelfMat || M.metal, false);
      if (!opts.noRail) f.box(root, f.L0 + 0.01, f.L1 - 0.01, cFront - 0.012 * Math.sign(cFront - cBack), cFront, z0 - 0.04, z0 + 0.012, M.rail, false); // porte-étiquettes
      for (let m = 0; m < n; m++) {
        const cell = pg[face]?.[lv]?.[m];
        const F = cell && api.FAMILLES[cell.f];
        if (!F) continue;
        fillShelf(F, it, face, f.L0 + m * mw, f.L0 + (m + 1) * mw, cBack, cFront, z0, z1 - 0.03, rnd, opts.kind);
      }
    }
  }

  const B = {
    gondole(it, f, h) {
      f.box(root, f.L0, f.L1, f.C0 + 0.05, f.C1 - 0.05, 0, 0.15, M.plinth);
      f.box(root, f.L0, f.L1, f.Cm - 0.02, f.Cm + 0.02, 0, h, M.metal);
      const n = api.nMods(it); for (let m = 0; m <= n; m++) { const l = f.L0 + (it.w * m) / n; f.box(root, l - 0.015, l + 0.015, f.Cm - 0.04, f.Cm + 0.04, 0, h, M.metalDark, false); }
      for (const face of api.facesOf(it)) { const s = f.sign(face); shelves(f, it, face, f.Cm + s * 0.03, f.Cm + s * (it.d / 2 - 0.02)); }
    },
    murale(it, f, h) {
      const s = f.sign("A"), back = s > 0 ? f.C0 : f.C1;
      f.box(root, f.L0, f.L1, back, back + s * 0.04, 0, h, M.metal);
      f.box(root, f.L0, f.L1, back, back + s * (it.d - 0.03), 0, 0.15, M.plinth);
      shelves(f, it, "A", back + s * 0.04, back + s * (it.d - 0.02));
    },
    tete(it, f, h) { B.murale(it, f, h); },
    promo(it, f, h) {
      f.box(root, f.L0, f.L1, f.C0, f.C1, 0, 0.14, M.pallet);
      const rnd = rand(it.x * 100 + it.y), color = api.FAMILLES.promo.color;
      for (let k = 0; k < 6; k++) { const l = f.L0 + 0.05 + (k % 3) * (it.w - 0.1) / 3, c = f.C0 + 0.05 + Math.floor(k / 3) * (it.d - 0.1) / 2; f.box(root, l, l + (it.w - 0.1) / 3 - 0.02, c, c + (it.d - 0.1) / 2 - 0.02, 0.14, 0.14 + (h - 0.3) * (0.6 + rnd() * 0.4), new THREE.MeshStandardMaterial({ color: shade(color, rnd()), roughness: 0.7 })); }
      const mid = (f.L0 + f.L1) / 2;
      f.box(root, mid - 0.02, mid + 0.02, f.Cm - 0.02, f.Cm + 0.02, 0, h + 0.5, M.frame);       // mât du kakémono promo
    },
    froid(it, f, h) { // meuble froid mural ouvert (multideck)
      const s = f.sign("A"), back = s > 0 ? f.C0 : f.C1, front = back + s * it.d;
      f.box(root, f.L0, f.L1, back, front - s * 0.1, 0, 0.35, M.cold);                 // soubassement
      f.box(root, f.L0, f.L1, back, back + s * 0.06, 0, h, M.cold);                      // dos
      f.box(root, f.L0, f.L1, back, front - s * 0.25, h - 0.22, h, M.cold);              // auvent
      f.box(root, f.L0, f.L1, front - s * 0.27, front - s * 0.25, h - 0.24, h - 0.2, M.light, false); // éclairage
      f.box(root, f.L0, f.L0 + 0.04, back, front - s * 0.1, 0, h, M.cold); f.box(root, f.L1 - 0.04, f.L1, back, front - s * 0.1, 0, h, M.cold);
      f.box(root, f.L0 + 0.04, f.L1 - 0.04, back + s * 0.06, back + s * 0.08, 0.35, h - 0.22, M.coldInside, false);
      shelves(f, it, "A", back + s * 0.08, front - s * 0.18, { shelfMat: M.coldInside });
    },
    boissons(it, f, h) { // armoire vitrée
      const s = f.sign("A"), back = s > 0 ? f.C0 : f.C1, front = back + s * it.d;
      f.box(root, f.L0, f.L1, back, front, 0, 0.12, M.cold);
      f.box(root, f.L0, f.L1, back, front, h - 0.18, h, M.cold);
      f.box(root, f.L0, f.L1, back, back + s * 0.04, 0.12, h - 0.18, M.coldInside, false);
      f.box(root, f.L0, f.L0 + 0.04, back, front, 0.12, h - 0.18, M.cold); f.box(root, f.L1 - 0.04, f.L1, back, front, 0.12, h - 0.18, M.cold);
      shelves(f, it, "A", back + s * 0.05, front - s * 0.06, { kind: "bottle", shelfMat: M.coldInside });
      f.box(root, f.L0 + 0.04, f.L1 - 0.04, front - s * 0.02, front, 0.12, h - 0.18, M.glass, false);
      f.box(root, (f.L0 + f.L1) / 2 - 0.015, (f.L0 + f.L1) / 2 + 0.015, front - s * 0.03, front, 0.12, h - 0.18, M.cold, false);
    },
    bahut(it, f, h) { // bahut surgelés : caisson ouvert, fond intérieur, couvercles vitrés
      const t = 0.06, floorY = h - 0.42;
      f.box(root, f.L0, f.L1, f.C0, f.C1, 0, floorY, M.panel);
      f.box(root, f.L0, f.L1, f.C0, f.C0 + t, floorY, h - 0.05, M.panel); f.box(root, f.L0, f.L1, f.C1 - t, f.C1, floorY, h - 0.05, M.panel);
      f.box(root, f.L0, f.L0 + t, f.C0, f.C1, floorY, h - 0.05, M.panel); f.box(root, f.L1 - t, f.L1, f.C0, f.C1, floorY, h - 0.05, M.panel);
      f.box(root, f.L0 + t, f.L1 - t, f.C0 + t, f.C1 - t, floorY, floorY + 0.01, M.coldInside, false);
      const pg = api.ensurePg(it), n = api.nMods(it), mw = it.w / n, rnd = rand(Math.round(it.x * 97 + it.y * 13));
      frameCache.f = f;
      for (let m = 0; m < n; m++) {
        const F = api.FAMILLES[pg?.A?.[0]?.[m]?.f];
        if (!F) continue;
        for (const [c0, c1] of [[f.C0 + t, f.Cm - 0.01], [f.Cm + 0.01, f.C1 - t]]) fillShelf(F, it, "A", f.L0 + m * mw + t, f.L0 + (m + 1) * mw - t, c0, c1, floorY + 0.01, h - 0.12, rnd);
      }
      f.box(root, f.L0, f.L1, f.C0, f.C1, h - 0.05, h - 0.03, M.glass, false);
    },
    vitrine(it, f, h) { // vitrine service boucherie
      const s = f.sign("A"), back = s > 0 ? f.C0 : f.C1, front = back + s * it.d;
      f.box(root, f.L0, f.L1, back, front, 0, 0.85, M.panel);
      f.box(root, f.L0 + 0.05, f.L1 - 0.05, back + s * 0.25, front - s * 0.08, 0.85, 0.9, M.coldInside, false);
      const rnd = rand(it.x * 31 + it.y * 7), color = api.FAMILLES.boucherie.color;
      for (let l = f.L0 + 0.1; l < f.L1 - 0.25; l += 0.22) pushProduct("box", f.point(l + 0.1, (back + front) / 2 + s * 0.08, 0.93), f.scaleVec(0.18, 0.3, 0.05), shade(color, rnd()));
      f.box(root, f.L0, f.L1, front - s * 0.04, front, 0.9, h, M.glass, false);
      f.box(root, f.L0, f.L1, back, back + s * 0.35, h - 0.04, h, M.glass, false);
    },
    fl(it, f, h) { // étal fruits et légumes en gradins
      f.box(root, f.L0, f.L1, f.C0, f.C1, 0, 0.55, M.wood);
      const rnd = rand(it.x * 17 + it.y * 3);
      const COLORS = [0xd62828, 0xf77f00, 0xfcbf49, 0x6a994e, 0x386641, 0x9d0208, 0xe9c46a, 0x8ab17d];
      const rows = 2, cols = Math.max(2, Math.round(it.w / 0.5));
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const l0 = f.L0 + 0.04 + c * (it.w - 0.08) / cols, l1 = l0 + (it.w - 0.08) / cols - 0.03;
        const c0 = f.C0 + 0.04 + r * (it.d - 0.08) / rows, c1 = c0 + (it.d - 0.08) / rows - 0.03;
        const y = 0.55 + r * 0.18;
        f.box(root, l0, l1, c0, c1, y, y + 0.12, M.woodDark);
        const col = COLORS[Math.floor(rnd() * COLORS.length)];
        frameCache.f = f;
        for (let k = 0; k < 14; k++) { const d = 0.07 + rnd() * 0.03; pushProduct("ball", f.point(l0 + 0.05 + rnd() * (l1 - l0 - 0.1), c0 + 0.05 + rnd() * (c1 - c0 - 0.1), y + 0.12 + d / 2), new THREE.Vector3(d, d, d), shade(col, rnd())); }
      }
    },
    pain(it, f, h) { B.murale(it, f, h); },
    caisse(it, f, h) {
      f.box(root, f.L0, f.L1, f.C0, f.C1, 0, 0.82, M.counter);
      f.box(root, f.L0 + 0.05, f.L0 + it.w * 0.62, f.C0 + 0.08, f.C1 - 0.08, 0.82, 0.86, M.belt);
      const p = f.L0 + it.w * 0.75;
      f.box(root, p, p + 0.05, f.Cm - 0.03, f.Cm + 0.03, 0.86, 1.15, M.frame);
      f.box(root, p - 0.02, p + 0.07, f.Cm - 0.17, f.Cm + 0.17, 1.15, 1.38, M.screen);
      f.box(root, f.L1 - 0.12, f.L1, f.C0, f.C1, 0.82, 1.7, M.frame, false);
      f.box(root, f.L1 - 0.12, f.L1, f.C0, f.C1, 1.7, 1.85, M.light, false);
    },
    web(it, f, h) {
      f.box(root, f.L0, f.L1, f.C0, f.C1, 0.86, 0.9, M.wood);
      for (const l of [f.L0 + 0.05, f.L1 - 0.09]) for (const c of [f.C0 + 0.05, f.C1 - 0.09]) f.box(root, l, l + 0.04, c, c + 0.04, 0, 0.86, M.metalDark);
      f.box(root, f.L0 + 0.2, f.L0 + 0.6, f.C0 + 0.15, f.C1 - 0.15, 0.9, 1.2, M.carton);
    },
    chambre(it, f, h) {
      f.box(root, f.L0, f.L1, f.C0, f.C1, 0, h, M.panel);
      const s = f.sign("A"), front = s > 0 ? f.C1 : f.C0;
      f.box(root, f.L0 + 0.3, f.L0 + 1.2, front, front + s * 0.03, 0, 2.0, M.metalDark);
    },
    rack(it, f, h) {
      for (const l of [f.L0, f.L1 - 0.08]) for (const c of [f.C0, f.C1 - 0.08]) f.box(root, l, l + 0.08, c, c + 0.08, 0, h, M.rackUp);
      const rnd = rand(it.x * 13 + it.y * 29);
      for (const y of [0.05, 1.2, 2.3]) {
        if (y > h - 0.2) continue;
        f.box(root, f.L0, f.L1, f.C0, f.C0 + 0.06, y + 0.1, y + 0.2, M.rackBeam); f.box(root, f.L0, f.L1, f.C1 - 0.06, f.C1, y + 0.1, y + 0.2, M.rackBeam);
        for (let k = 0; k < 2; k++) {
          const l = f.L0 + 0.15 + k * (it.w - 0.3) / 2;
          f.box(root, l, l + (it.w - 0.4) / 2, f.C0 + 0.05, f.C1 - 0.05, y + 0.2, y + 0.34, M.pallet);
          f.box(root, l + 0.05, l + (it.w - 0.4) / 2 - 0.05, f.C0 + 0.1, f.C1 - 0.1, y + 0.34, y + 0.34 + 0.5 + rnd() * 0.4, M.carton);
        }
      }
    },
  };

  /* ---------------- reconstruction de la scène ---------------- */
  function rebuild() {
    const S = api.state;
    if (root) { scene.remove(root); root.traverse((o) => { if (o.isInstancedMesh) { o.material.dispose(); o.dispose(); } }); }
    root = new THREE.Group();
    walls = []; blockers = [];
    resetProducts();
    dims = { W: S.W, D: S.D, H: S.H };
    const pts = api.outline();

    // Sol carrelé (carreaux de 60 cm)
    const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const floorGeo = new THREE.ShapeGeometry(shape);
    const uv = floorGeo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 0.6, uv.getY(i) / 0.6);
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ map: tileTexture(), roughness: 0.32, metalness: 0.02 }));
    floor.rotation.x = Math.PI / 2; floor.receiveShadow = true;
    root.add(floor);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(S.W + 40, S.D + 40), new THREE.MeshStandardMaterial({ color: 0xd8dcd6, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.set(S.W / 2, -0.01, S.D / 2); ground.receiveShadow = true;
    root.add(ground);

    // Murs : un panneau par segment du contour ; la façade (y = D) reçoit une vitrine et l'entrée
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cz = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    const t = 0.2;
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      const horiz = Math.abs(p[1] - q[1]) < 1e-6;
      const isFacade = horiz && Math.abs(p[1] - S.D) < 1e-6;
      const g = new THREE.Group();
      const mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2;
      const normal = horiz ? new THREE.Vector3(0, 0, mz > cz ? 1 : -1) : new THREE.Vector3(mx > cx ? 1 : -1, 0, 0);
      const seg = (a0, a1, y0, y1, mat) => (horiz ? aabb(g, Math.min(a0, a1), Math.max(a0, a1), mz - t / 2 + normal.z * t / 2, mz + t / 2 + normal.z * t / 2, y0, y1, mat)
                                                   : aabb(g, mx - t / 2 + normal.x * t / 2, mx + t / 2 + normal.x * t / 2, Math.min(a0, a1), Math.max(a0, a1), y0, y1, mat));
      if (isFacade) {
        const x0 = Math.min(p[0], q[0]), x1 = Math.max(p[0], q[0]);
        const d0 = S.doorX, d1 = S.doorX + S.doorW;
        for (const [a, b] of [[x0, d0], [d1, x1]]) {
          if (b - a < 0.05) continue;
          seg(a, b, 0, 0.45, M.wall);                              // allège
          seg(a, b, 0.45, 2.6, M.glass).castShadow = false;       // vitrine
          for (let k = a; k <= b + 1e-6; k += Math.max(1, (b - a) / Math.ceil((b - a) / 2.2))) seg(k - 0.03, k + 0.03, 0.45, 2.6, M.frame);
        }
        seg(x0, x1, 2.6, S.H, M.wall);                            // bandeau d'enseigne
        seg(d0 - 0.05, d0, 0, 2.6, M.frame); seg(d1, d1 + 0.05, 0, 2.6, M.frame);
      } else {
        seg(horiz ? p[0] : p[1], horiz ? q[0] : q[1], 0, S.H, M.wall);
      }
      g.userData = { normal, center: new THREE.Vector3(mx, S.H / 2, mz) };
      root.add(g); walls.push(g);
    });

    // Enseigne au-dessus de l'entrée
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(S.W * 0.5, 6), 0.55), new THREE.MeshStandardMaterial({ map: signTexture("Ma supérette", "#15803d"), emissive: 0xffffff, emissiveIntensity: 0.15 }));
    sign.position.set(S.doorX + S.doorW / 2, Math.min(S.H - 0.35, 3.1), S.D + 0.13);
    root.add(sign);

    // Mobilier
    for (const it of S.items) {
      const c = api.CATALOG[it.type];
      const builder = B[it.type];
      if (!builder) continue;
      builder(it, frame(it), c.h);
      const b = api.box(it); blockers.push(b);
    }
    flushProducts(root);

    // Cloison entre la réserve et la surface de vente, avec une porte de 1,2 m côté gauche
    for (const z of S.zones.filter((z) => z.type === "reserve")) {
      const zf = z.y + z.h;
      if (zf >= S.D - 0.5) continue;
      const doorFrom = z.x + 0.2, doorTo = z.x + 1.4;
      if (doorFrom > z.x + 0.05) aabb(root, z.x, doorFrom, zf - 0.05, zf + 0.05, 0, S.H, M.wall);
      aabb(root, doorTo, z.x + z.w, zf - 0.05, zf + 0.05, 0, S.H, M.wall);
      aabb(root, doorFrom, doorTo, zf - 0.05, zf + 0.05, 2.2, S.H, M.wall);
      aabb(root, doorFrom + 0.05, doorTo - 0.05, zf - 0.03, zf + 0.03, 0, 2.15, M.metalDark).material = new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.4, metalness: 0.5, transparent: true, opacity: 0.85 });
    }

    // Panneaux suspendus au-dessus des zones de vente
    for (const z of S.zones) {
      const Z = api.ZONES[z.type];
      if (!Z?.sales || z.type === "vente") continue;
      const w = Math.min(2.4, z.w * 0.8);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshStandardMaterial({ map: signTexture(Z.label, Z.color), side: THREE.DoubleSide }));
      m.position.set(z.x + z.w / 2, Math.min(S.H - 0.4, 2.75), z.y + z.h / 2);
      root.add(m);
    }

    // Luminaires (visibles en visite)
    ceiling = new THREE.Group();
    for (let z = 1.5; z < S.D - 0.5; z += 2.4) for (let x = 1.2; x < S.W - 0.8; x += 3) aabb(ceiling, x, x + 1.2, z, z + 0.2, S.H - 0.08, S.H - 0.04, M.light, false);
    const ceil = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color: 0xf7f7f4, roughness: 0.95, side: THREE.DoubleSide }));
    ceil.rotation.x = Math.PI / 2; ceil.position.y = S.H; ceiling.add(ceil);
    ceiling.visible = mode === "walk";
    root.add(ceiling);

    scene.add(root);

    // Lumière et ombres cadrées sur le magasin
    const span = Math.max(S.W, S.D);
    sun.position.set(S.W * 0.3, S.H + span, S.D * 0.8);
    sun.target.position.set(S.W / 2, 0, S.D / 2);
    Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 0.5, far: span * 4 });
    sun.shadow.camera.updateProjectionMatrix();
    if (!rebuild.done) { resetView(); rebuild.done = true; }
  }

  function resetView() {
    const { W, D, H } = dims;
    mode = "orbit"; controls.enabled = true; if (ceiling) ceiling.visible = false;
    controls.target.set(W / 2, 0.8, D / 2);
    const span = Math.max(W, D);
    camera.position.set(W * 0.22, span * 0.55 + H, D + span * 0.32);
    camera.fov = 50; camera.updateProjectionMatrix();
    controls.update();
  }
  function startWalk() {
    const S = api.state;
    mode = "walk"; controls.enabled = false; if (ceiling) ceiling.visible = true;
    walk.pos.set(S.doorX + S.doorW / 2, 1.6, S.D - 0.6);
    walk.yaw = 0; walk.pitch = -0.08;            // regard vers le fond du magasin (−Z)
    camera.fov = 68; camera.updateProjectionMatrix();
  }

  /* ---------------- visite à hauteur d'homme ---------------- */
  const free = (x, z) => {
    const S = api.state, r = 0.28;
    if (x < r || z < r || x > S.W - r || z > S.D - 0.15) return false;
    const n = api.notch?.(); if (n && x > n.x - r && z < n.y + n.h + r) return false;
    return !blockers.some((b) => x > b.x - r && x < b.x + b.w + r && z > b.y - r && z < b.y + b.h + r);
  };
  let drag = null;
  renderer.domElement.addEventListener("pointerdown", (e) => { if (mode === "walk") { drag = { x: e.clientX, y: e.clientY }; renderer.domElement.setPointerCapture(e.pointerId); } });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (!drag || mode !== "walk") return;
    walk.yaw -= (e.clientX - drag.x) * 0.005; walk.pitch = Math.max(-0.9, Math.min(0.6, walk.pitch - (e.clientY - drag.y) * 0.004));
    drag = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener("pointerup", () => (drag = null));
  const KEYS = { ArrowUp: "f", KeyW: "f", KeyZ: "f", ArrowDown: "b", KeyS: "b", ArrowLeft: "l", KeyA: "l", KeyQ: "l", ArrowRight: "r", KeyD: "r" };
  const onKey = (down) => (e) => {
    if (mode !== "walk" || e.target.closest?.("input, select, textarea")) return;
    const k = KEYS[e.code]; if (!k) return;
    e.preventDefault(); down ? walk.keys.add(k) : walk.keys.delete(k);
  };
  const kd = onKey(true), ku = onKey(false);
  window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);

  /* ---------------- boucle de rendu ---------------- */
  const clock = new THREE.Clock();
  let running = true;
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);
  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, clock.getDelta());
    if (mode === "walk") {
      const v = 1.6 * dt, fwd = new THREE.Vector3(-Math.sin(walk.yaw), 0, -Math.cos(walk.yaw)), right = new THREE.Vector3(-fwd.z, 0, fwd.x);
      const mv = new THREE.Vector3();
      if (walk.keys.has("f") || walk.hold > 0) mv.add(fwd); if (walk.keys.has("b") || walk.hold < 0) mv.sub(fwd);
      if (walk.keys.has("r")) mv.add(right); if (walk.keys.has("l")) mv.sub(right);
      if (mv.lengthSq()) {
        mv.normalize().multiplyScalar(v);
        if (free(walk.pos.x + mv.x, walk.pos.z)) walk.pos.x += mv.x;
        if (free(walk.pos.x, walk.pos.z + mv.z)) walk.pos.z += mv.z;
      }
      camera.position.copy(walk.pos);
      camera.lookAt(walk.pos.x - Math.sin(walk.yaw) * Math.cos(walk.pitch), walk.pos.y + Math.sin(walk.pitch), walk.pos.z - Math.cos(walk.yaw) * Math.cos(walk.pitch));
      walls.forEach((w) => (w.visible = true));
    } else {
      controls.update();
      // Les murs entre la caméra et le magasin sont masqués pour garder la vue dégagée
      walls.forEach((w) => { const d = camera.position.clone().sub(w.userData.center).dot(w.userData.normal); w.visible = d < 0.5; });
    }
    renderer.render(scene, camera);
  }

  rebuild(); resize(); tick();

  return {
    rebuild,
    resetView,
    startWalk,
    setHold(v) { walk.hold = v; },
    get mode() { return mode; },
    screenshot() { renderer.render(scene, camera); return renderer.domElement.toDataURL("image/png"); },
    pause() { running = false; },
    resume() { if (!running) { running = true; clock.getDelta(); tick(); } },
  };
}
