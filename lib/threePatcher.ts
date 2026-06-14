import * as THREE from "three";

if (typeof document !== "undefined") {
  const c = document.createElement("canvas");
  c.width = 2;
  c.height = 2;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 2, 2);
  }

  // Patch DEFAULT_IMAGE so new Texture() gets a valid canvas
  (THREE.Texture as unknown as Record<string, unknown>).DEFAULT_IMAGE = c;

  // Walk the THREE namespace to find any existing Textures with null image
  // and give them a valid 1x1 white pixel canvas
  function fixNullImages(obj: Record<string, unknown>, depth = 0, seen = new Set<unknown>()): void {
    if (depth > 5 || !obj || seen.has(obj)) return;
    seen.add(obj);
    try {
      for (const key of Object.keys(obj)) {
        const val = (obj as Record<string, unknown>)[key];
        if (val instanceof THREE.Texture && val.image === null) {
          const tiny = document.createElement("canvas");
          tiny.width = 1;
          tiny.height = 1;
          const tctx = tiny.getContext("2d");
          if (tctx) { tctx.fillStyle = "#ffffff"; tctx.fillRect(0, 0, 1, 1); }
          val.image = tiny;
          val.needsUpdate = true;
        } else if (typeof val === "object" && val !== null) {
          fixNullImages(val as Record<string, unknown>, depth + 1, seen);
        }
      }
    } catch {
      // skip un-traversable objects
    }
  }
  fixNullImages(THREE as unknown as Record<string, unknown>);
}

export default THREE;
