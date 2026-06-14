"use client";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const GLB_INDEX = new Map<string, string[]>();

function buildIndex() {
  if (GLB_INDEX.size > 0) return;
  const GLB_PATHS = [
    "/models/productos/micropolar_micropolar mujer  azul marino.glb",
    "/models/productos/micropolar_micropolar mujer  azul rey.glb",
    "/models/productos/micropolar_micropolar mujer  azul royal.glb",
    "/models/productos/micropolar_micropolar mujer  negro.glb",
    "/models/productos/micropolar_micropolar mujer  rojo.glb",
    "/models/productos/micropolar_micropolar mujer  verde pino.glb",
    "/models/productos/micropolar_micropolar mujer gris oscuro.glb",
    "/models/productos/parkas_chaqueta parka premium softshell.glb",
    "/models/productos/parkas_softshell Basico hombre azul.glb",
    "/models/productos/parkas_softshell Basico hombre negro.glb",
    "/models/productos/parkas_softshell Basico mujer azul.glb",
    "/models/productos/parkas_softshell Basico mujer negro.glb",
    "/models/productos/parkas_softshell termico premium hombre azul.glb",
    "/models/productos/parkas_softshell termico premium hombre negro.glb",
    "/models/productos/parkas_softshell- termico premium interior termico mujer.glb",
    "/models/productos/parkas_softshell- termico premium interior termico.glb",
    "/models/productos/parkas_softshell- termico premium mujer azul.glb",
    "/models/productos/parkas_softshell- termico premium mujer negro.glb",
    "/models/productos/polera_polera azul mairno.glb",
    "/models/productos/polera_polera azul rey.glb",
    "/models/productos/polera_polera blanca.glb",
    "/models/productos/polera_polera gris.glb",
    "/models/productos/polera_polera negra.glb",
    "/models/productos/polera_polera roja.glb",
    "/models/productos/poleron cuello redondo_poleron cuello redondo polo azul rey.glb",
    "/models/productos/poleron cuello redondo_poleron cuello redondo polo blanco.glb",
    "/models/productos/poleron cuello redondo_poleron cuello redondo polo gris.glb",
    "/models/productos/poleron cuello redondo_poleron cuello redondo polo NEGRO.glb",
    "/models/productos/poleron cuello redondo_poleron cuello redondo polo rojo.glb",
    "/models/productos/poleron cuello redondo_poleron cuello redondo polo.glb",
    "/models/productos/poleron POLO unisex_poleron POLO unisex marino.glb",
    "/models/productos/poleron POLO unisex_poleron POLO unisex rojo.glb",
    "/models/productos/poleron POLO unisex_poleron POLO unisex-Amarillo.glb",
    "/models/productos/poleron POLO unisex_poleron POLO unisex-arena.glb",
    "/models/productos/poleron POLO unisex_poleron POLO unisex-blanco.glb",
    "/models/productos/poleron POLO unisex_poleron POLO unisex-granate.glb",
    "/models/productos/poleron POLO unisex_poleron POLO unisex-gris vigore.glb",
    "/models/productos/poleron POLO unisex_poleron POLO unisex-naranjo.glb",
    "/models/productos/poleron POLO unisex_poleron POLO unisex-negro.glb",
    "/models/productos/poleron POLO unisex_poleron POLO unisex-plomo.glb",
    "/models/productos/poleron POLO unisex_poleron POLO unisex-rosa claro.glb",
    "/models/productos/poleron POLO unisex_poleron POLO unisex-verde aceituna.glb",
    "/models/productos/poleron POLO unisex_poleron POLO unisex-verde mist.glb",
    "/models/productos/parkas_chaqueta premium gorro desmontable termica parka softshell con puno hombre  (1).glb",
    "/models/productos/parkas_chaqueta premium gorro desmontable termica parka softshell con puno hombre  (2).glb",
    "/models/productos/parkas_chaqueta premium gorro desmontable termica parka softshell con puno hombre  (3).glb",
    "/models/productos/parkas_chaqueta premium gorro desmontable termica parka softshell con puno hombre  (4).glb",
    "/models/productos/parkas_chaqueta premium gorro desmontable termica parka softshell con puno hombre  (5).glb",
    "/models/productos/parkas_chaqueta premium gorro desmontable termica parka softshell con puno hombre  (6).glb",
    "/models/productos/parkas_chaqueta premium gorro desmontable termica parka softshell con puno hombre  interior hombre.glb",
    "/models/productos/parkas_chaqueta premium gorro desmontable termica parka softshell con puno hombre  interior.glb",
  ];

  const seen = new Set<string>();
  for (const path of GLB_PATHS) {
    const base = path.split("/").pop()!.replace(/\.glb$/, "");
    const norm = normalize(base);
    const keywords = norm.split(/\s+/).filter((k) => k.length > 1);
    for (const kw of keywords) {
      if (!GLB_INDEX.has(kw)) GLB_INDEX.set(kw, []);
      if (!seen.has(path)) {
        GLB_INDEX.get(kw)!.push(path);
      }
    }
    seen.add(path);
  }
}

function scoreMatch(productName: string, glbPath: string): number {
  const pNorm = normalize(productName);
  const gNorm = normalize(glbPath.split("/").pop()!.replace(/\.glb$/, ""));
  const pWords = new Set(pNorm.split(/\s+/).filter((w) => w.length > 1));
  const gWords = new Set(gNorm.split(/\s+/).filter((w) => w.length > 1));
  let score = 0;
  for (const pw of pWords) {
    if (gWords.has(pw)) score++;
  }
  return score;
}

export function findRealGLB(
  category: string,
  shortName: string,
  name: string,
  colors: string[]
): string | null {
  buildIndex();
  const queryTerms = [category, shortName, name, ...colors]
    .map(normalize)
    .filter(Boolean);

  const candidates = new Map<string, number>();
  for (const term of queryTerms) {
    const words = term.split(/\s+/).filter((w) => w.length > 1);
    for (const w of words) {
      const paths = GLB_INDEX.get(w);
      if (paths) {
        for (const p of paths) {
          candidates.set(p, (candidates.get(p) || 0) + 1);
        }
      }
    }
  }

  if (candidates.size === 0) return null;

  const searchSpace = `${category} ${shortName} ${name} ${colors.join(" ")}`;

  let bestPath: string | null = null;
  let bestScore = -1;
  for (const [path, freq] of candidates) {
    const matchScore = scoreMatch(searchSpace, path);
    const total = freq + matchScore * 3;
    if (total > bestScore) {
      bestScore = total;
      bestPath = path;
    }
  }

  return bestPath;
}
