"use client";

import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { getDecalCoords, getDecalPositionLabels } from "@/lib/garmentMap";
import { detectBaseGarmentType, getBaseModelUrl, isLegacyProductModelUrl } from "@/lib/baseModels";
import { SceneErrorBoundary } from "@/components/SceneErrorBoundary";

type TextureProjection = "front" | "wide-front" | "softshell" | "leg";

type TextureProfile = {
  projection: TextureProjection;
  textureAllMeshes: boolean;
  remapExistingUvs: boolean;
  mainThreshold: number;
  secondaryThreshold: number;
  trimThreshold: number;
};

const DEFAULT_TEXTURE_PROFILE: TextureProfile = {
  projection: "front",
  textureAllMeshes: false,
  remapExistingUvs: false,
  mainThreshold: 0.18,
  secondaryThreshold: 0.045,
  trimThreshold: 0.012,
};

function getTextureProfile(garmentType?: string, modelUrl?: string): TextureProfile {
  const key = `${garmentType || ""} ${modelUrl || ""}`.toLowerCase();

  if (/models\/products\/poleras|polera-base|t-shirt|polo/.test(key)) {
    return DEFAULT_TEXTURE_PROFILE;
  }

  if (/pantalon|cargo/.test(key)) {
    return {
      projection: "leg",
      textureAllMeshes: true,
      remapExistingUvs: true,
      mainThreshold: 0.1,
      secondaryThreshold: 0.025,
      trimThreshold: 0.008,
    };
  }

  if (/parka|softshell|micropolar/.test(key)) {
    return {
      projection: "softshell",
      textureAllMeshes: true,
      remapExistingUvs: true,
      mainThreshold: 0.12,
      secondaryThreshold: 0.03,
      trimThreshold: 0.01,
    };
  }

  if (/poleron|hoodie/.test(key)) {
    return {
      projection: "wide-front",
      textureAllMeshes: true,
      remapExistingUvs: true,
      mainThreshold: 0.12,
      secondaryThreshold: 0.03,
      trimThreshold: 0.01,
    };
  }

  if (/camisa|blusa/.test(key)) {
    return {
      projection: "wide-front",
      textureAllMeshes: true,
      remapExistingUvs: true,
      mainThreshold: 0.14,
      secondaryThreshold: 0.035,
      trimThreshold: 0.01,
    };
  }

  return DEFAULT_TEXTURE_PROFILE;
}

// ─── Product GLB ──────────────────────────────────────────────────────────────
// Loads the garment GLB and applies the selected color or product texture.

function ProductGLB({
  url,
  garmentType,
  color,
  fabricTexture,
  tintTextureWithColor = false,
  textureAllMeshes = false,
  scale = 1,
  positionY = 0,
  rotationY = 0,
  onMeshReady,
}: {
  url: string;
  garmentType?: string;
  color?: string;
  fabricTexture?: THREE.Texture | null;
  tintTextureWithColor?: boolean;
  textureAllMeshes?: boolean;
  scale?: number;
  positionY?: number;
  rotationY?: number;
  onMeshReady?: (m: THREE.Mesh) => void;
}) {
  const gltf = useGLTF(url);
  const invalidate = useThree((state) => state.invalidate);

  const textureProfile = useMemo(() => getTextureProfile(garmentType, url), [garmentType, url]);

  const pickPrimaryMesh = useCallback((root: THREE.Object3D) => {
    let bestMesh: THREE.Mesh | null = null;
    let bestScore = -Infinity;

    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const geometry = child.geometry as THREE.BufferGeometry | undefined;
      const position = geometry?.attributes.position;
      if (!geometry || !position) return;

      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      const size = box ? box.getSize(new THREE.Vector3()) : new THREE.Vector3();
      const vertexCount = position.count || 0;
      const score = vertexCount * Math.max(size.x, 0.01) * Math.max(size.y, 0.01);

      if (score > bestScore) {
        bestScore = score;
        bestMesh = child;
      }
    });

    return bestMesh;
  }, []);

  const pickTextureMeshes = useCallback((root: THREE.Object3D) => {
    const scored: Array<{ mesh: THREE.Mesh; score: number; size: THREE.Vector3 }> = [];
    let bestScore = -Infinity;

    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const geometry = child.geometry as THREE.BufferGeometry | undefined;
      const position = geometry?.attributes.position;
      if (!geometry || !position) return;

      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      const size = box ? box.getSize(new THREE.Vector3()) : new THREE.Vector3();
      const vertexCount = position.count || 0;
      const score = vertexCount * Math.max(size.x, 0.01) * Math.max(size.y, 0.01);

      scored.push({ mesh: child, score, size });
      bestScore = Math.max(bestScore, score);
    });

    const targets = new Set<THREE.Mesh>();
    for (const item of scored) {
      const isMainPanel = item.score >= bestScore * textureProfile.mainThreshold;
      const isSleeveLike =
        item.score >= bestScore * textureProfile.secondaryThreshold &&
        item.size.x >= 0.08 &&
        item.size.y >= 0.12;
      const isTrimLike =
        item.score >= bestScore * textureProfile.trimThreshold &&
        item.size.x >= 0.05 &&
        item.size.y >= 0.025;

      if (isMainPanel || isSleeveLike || isTrimLike) {
        targets.add(item.mesh);
      }
    }

    return targets;
  }, [textureProfile]);

  const mapGarmentTextureUv = useCallback((geometry: THREE.BufferGeometry) => {
    const position = geometry.attributes.position;
    if (!position) return;

    geometry.computeBoundingBox();
    geometry.computeVertexNormals();
    const box = geometry.boundingBox;
    if (!box) return;

    const normal = geometry.attributes.normal;
    const size = box.getSize(new THREE.Vector3());
    const rangeX = size.x || 1;
    const rangeY = size.y || 1;
    const rangeZ = size.z || 1;
    const uv: number[] = [];

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      const nx = normal ? normal.getX(i) : 0;
      const nz = normal ? normal.getZ(i) : 1;
      const sideSurface = Math.abs(nx) > Math.abs(nz) * 1.15;
      let u = sideSurface
        ? (z - box.min.z) / rangeZ
        : (x - box.min.x) / rangeX;
      let v = (y - box.min.y) / rangeY;

      if (textureProfile.projection === "leg") {
        const useDepth = rangeZ > rangeX * 0.62;
        u = useDepth ? (z - box.min.z) / rangeZ : (x - box.min.x) / rangeX;
      } else if (textureProfile.projection === "wide-front") {
        u = (x - box.min.x) / rangeX;
        v = (y - box.min.y) / rangeY;
      } else if (textureProfile.projection === "softshell") {
        const frontBias = Math.abs(nz) >= Math.abs(nx) * 0.82;
        u = frontBias ? (x - box.min.x) / rangeX : (z - box.min.z) / rangeZ;
      }

      uv.push(THREE.MathUtils.clamp(u, 0, 1), THREE.MathUtils.clamp(v, 0, 1));
    }

    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  }, [textureProfile]);

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    const shouldTextureAll = textureAllMeshes || textureProfile.textureAllMeshes;
    const textureTargets = fabricTexture && !shouldTextureAll ? pickTextureMeshes(cloned) : new Set<THREE.Mesh>();

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const sourceMaterial = (Array.isArray(child.material) ? child.material[0] : child.material) as
          | THREE.MeshStandardMaterial
          | undefined;
        const shouldTextureMesh = Boolean(
          fabricTexture &&
            (shouldTextureAll ||
              textureTargets.has(child))
        );
        const sourceGeometry = child.geometry;
        const geometry = shouldTextureMesh || sourceGeometry.attributes.color
          ? sourceGeometry.clone()
          : sourceGeometry;
        if (geometry.attributes.color) {
          geometry.deleteAttribute("color");
        }
        if (shouldTextureMesh && (textureProfile.remapExistingUvs || !geometry.attributes.uv)) {
          mapGarmentTextureUv(geometry);
        }
        child.geometry = geometry;
        const mat = new THREE.MeshStandardMaterial({
          color: sourceMaterial?.color || "#ffffff",
          roughness: 0.54,
          metalness: 0,
          envMapIntensity: 1.35,
          side: THREE.DoubleSide,
          map: sourceMaterial?.map || null,
          normalMap: sourceMaterial?.normalMap || null,
          roughnessMap: sourceMaterial?.roughnessMap || null,
          metalnessMap: sourceMaterial?.metalnessMap || null,
          aoMap: sourceMaterial?.aoMap || null,
          alphaMap: sourceMaterial?.alphaMap || null,
          normalScale: new THREE.Vector2(0.65, 0.65),
          transparent: sourceMaterial?.transparent || false,
          opacity: sourceMaterial?.opacity ?? 1,
          alphaTest: sourceMaterial?.alphaTest ?? 0,
        });
        mat.toneMapped = true;
        child.renderOrder = 1;

        if (shouldTextureMesh) {
          mat.map = fabricTexture ?? null;
          mat.color.set(0xffffff);
          mat.needsUpdate = true;
        } else if (sourceMaterial?.map) {
          mat.color.set(0xffffff);
          mat.needsUpdate = true;
        }

        child.material = mat;
      }
    });
    return cloned;
  }, [gltf, fabricTexture, textureAllMeshes, textureProfile, pickTextureMeshes, mapGarmentTextureUv]);

  useEffect(() => {
    const colorObj = color ? new THREE.Color(color) : null;

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];

      for (const material of materials) {
        if (!(material instanceof THREE.MeshStandardMaterial)) continue;

        if (fabricTexture && material.map === fabricTexture) {
          if (tintTextureWithColor && colorObj) {
            material.color.copy(colorObj);
          } else {
            material.color.set(0xffffff);
          }
        } else if (colorObj) {
          material.color.copy(colorObj);
          material.emissive.copy(colorObj).multiplyScalar(0.035);
        }
        material.needsUpdate = true;
      }
    });
    invalidate();
  }, [scene, color, fabricTexture, tintTextureWithColor, invalidate]);

  useEffect(() => {
    const primaryMesh = pickPrimaryMesh(scene);
    if (primaryMesh && onMeshReady) onMeshReady(primaryMesh);
    invalidate();
  }, [scene, onMeshReady, pickPrimaryMesh, invalidate]);

  return (
    <primitive
      object={scene}
      position={[0, positionY, 0]}
      rotation={[0, rotationY, 0]}
      scale={scale}
    />
  );
}

// ─── Logo Decal ───────────────────────────────────────────────────────────────

// ─── 3D Scene ─────────────────────────────────────────────────────────────────

function createLogoTextureSource(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const maxSide = 1024;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) return img;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = image.data;
  let edgeLightSamples = 0;
  let edgeSamples = 0;
  const edgeBand = Math.max(2, Math.round(Math.min(canvas.width, canvas.height) * 0.04));

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const isEdge =
        x < edgeBand ||
        y < edgeBand ||
        x >= canvas.width - edgeBand ||
        y >= canvas.height - edgeBand;
      if (!isEdge) continue;

      const i = (y * canvas.width + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      edgeSamples += 1;
      if (a < 24 || (max > 220 && max - min < 42)) edgeLightSamples += 1;
    }
  }

  const hasLightBackground = edgeSamples > 0 && edgeLightSamples / edgeSamples > 0.42;
  if (!hasLightBackground) return canvas;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    if (a < 8) {
      pixels[i + 3] = 0;
      continue;
    }

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = max;
    const neutral = max - min;
    const isBackground = lightness > 214 && neutral < 46;

    if (isBackground) {
      const fade = THREE.MathUtils.clamp((246 - lightness) / 32, 0, 0.18);
      pixels[i + 3] = Math.round(a * fade);
      continue;
    }

    const inkNoise = (((i / 4) % 11) - 5) * 0.012;
    const inkAlpha = THREE.MathUtils.clamp(0.82 + inkNoise, 0.74, 0.9);
    pixels[i] = THREE.MathUtils.clamp(r * 0.94, 0, 255);
    pixels[i + 1] = THREE.MathUtils.clamp(g * 0.94, 0, 255);
    pixels[i + 2] = THREE.MathUtils.clamp(b * 0.94, 0, 255);
    pixels[i + 3] = Math.round(a * inkAlpha);
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

function LogoSurfacePatch({
  logoSrc,
  position,
  rotation,
  scale,
}: {
  logoSrc: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  const invalidate = useThree((state) => state.invalidate);
  const [tex, setTex] = useState<{
    src: string;
    t: THREE.Texture | null;
    err: boolean;
  }>({ src: "", t: null, err: false });

  useEffect(() => {
    if (!logoSrc) return;
    let cancel = false;
    let texture: THREE.Texture | null = null;
    const img = new Image();
    if (/^https?:\/\//i.test(logoSrc)) img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancel) return;
      if (!img.naturalWidth || !img.naturalHeight) {
        setTex({ src: logoSrc, t: null, err: true });
        return;
      }
      const t = new THREE.Texture(createLogoTextureSource(img));
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      t.premultiplyAlpha = true;
      t.needsUpdate = true;
      t.userData.logoAspect = img.naturalWidth / Math.max(img.naturalHeight, 1);
      texture = t;
      setTex({ src: logoSrc, t, err: false });
      invalidate();
    };
    img.onerror = () => {
      if (!cancel) setTex({ src: logoSrc, t: null, err: true });
    };
    img.src = logoSrc;
    return () => {
      cancel = true;
      texture?.dispose();
    };
  }, [logoSrc, invalidate]);

  if (tex.src !== logoSrc || tex.err || !tex.t) return null;

  return (
    <mesh position={position} rotation={rotation} renderOrder={12}>
      <planeGeometry args={[scale[0], scale[1], 12, 12]} />
      <meshStandardMaterial
        map={tex.t}
        transparent
        alphaTest={0.04}
        opacity={0.82}
        roughness={1}
        metalness={0}
        envMapIntensity={0.12}
        polygonOffset
        polygonOffsetFactor={-8}
        polygonOffsetUnits={-8}
        depthTest
        depthWrite={false}
        side={THREE.FrontSide}
        toneMapped
      />
    </mesh>
  );
}

function getLogoPlacement(label: string) {
  const normalized = label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const back = normalized.includes("espalda") || normalized.includes("trasera");
  const leftSleeve = normalized.includes("manga izquierda");
  const rightSleeve = normalized.includes("manga derecha");
  const center = normalized.includes("centro");
  const rightChest = normalized.includes("pecho derecho");
  const leftChest = normalized.includes("pecho izquierdo");

  return {
    back,
    leftSleeve,
    rightSleeve,
    u: center ? 0.5 : rightChest ? 0.62 : leftChest ? 0.38 : 0.5,
    v: normalized.includes("baja") ? 0.42 : back ? 0.7 : 0.72,
    widthFactor: leftSleeve || rightSleeve ? 0.095 : center ? 0.15 : back ? 0.18 : 0.115,
  };
}

function fitDecalCoordsToMesh(
  coords: NonNullable<ReturnType<typeof getDecalCoords>>,
  mesh: THREE.Mesh,
  label: string,
  logoSize: number,
  logoAspect: number,
  container?: THREE.Object3D | null,
) {
  const geometry = mesh.geometry as THREE.BufferGeometry | undefined;
  if (!geometry?.attributes.position) return coords;

  mesh.updateWorldMatrix(true, false);
  container?.updateWorldMatrix(true, false);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return coords;

  const size = box.getSize(new THREE.Vector3());
  const placement = getLogoPlacement(label);
  const surfacePadding = THREE.MathUtils.clamp(Math.max(size.z, size.x) * 0.012, 0.006, 0.016);
  const y = box.min.y + THREE.MathUtils.clamp(placement.v, 0.12, 0.9) * size.y;
  const chestX = box.min.x + THREE.MathUtils.clamp(placement.u, 0.12, 0.88) * size.x;
  const positionAttr = geometry.attributes.position;
  const normalAttr = geometry.attributes.normal;
  let bestScore = Infinity;
  const surfacePoint = new THREE.Vector3(
    chestX,
    y,
    placement.back ? box.min.z : box.max.z,
  );
  const surfaceNormal = new THREE.Vector3(0, 0, placement.back ? -1 : 1);

  for (let i = 0; i < positionAttr.count; i += 1) {
    const x = positionAttr.getX(i);
    const vy = positionAttr.getY(i);
    const z = positionAttr.getZ(i);
    const nx = normalAttr ? normalAttr.getX(i) : 0;
    const ny = normalAttr ? normalAttr.getY(i) : 0;
    const nz = normalAttr ? normalAttr.getZ(i) : placement.back ? -1 : 1;
    let targetScore: number;

    if (placement.leftSleeve || placement.rightSleeve) {
      const targetX = placement.leftSleeve ? box.min.x : box.max.x;
      const sideBias = placement.leftSleeve ? x - box.min.x : box.max.x - x;
      targetScore =
        Math.abs(vy - y) / Math.max(size.y, 0.001) +
        sideBias / Math.max(size.x, 0.001) +
        Math.abs(z - (placement.back ? box.min.z : box.max.z)) / Math.max(size.z, 0.001) * 0.25 +
        Math.abs(x - targetX) / Math.max(size.x, 0.001) * 0.35;
    } else {
      const surfaceBias = placement.back ? z - box.min.z : box.max.z - z;
      targetScore =
        Math.abs(x - chestX) / Math.max(size.x, 0.001) +
        Math.abs(vy - y) / Math.max(size.y, 0.001) +
        surfaceBias / Math.max(size.z, 0.001) * 0.45;
    }

    if (targetScore < bestScore) {
      bestScore = targetScore;
      surfacePoint.set(x, vy, z);
      surfaceNormal.set(nx, ny, nz).normalize();
    }
  }

  const offsetPoint = surfacePoint.clone().addScaledVector(surfaceNormal, surfacePadding);
  if (!placement.leftSleeve && !placement.rightSleeve && bestScore > 0.32) {
    offsetPoint.set(
      chestX,
      y,
      placement.back ? box.min.z - surfacePadding : box.max.z + surfacePadding,
    );
  }
  const worldPoint = mesh.localToWorld(offsetPoint.clone());
  const localPoint = container ? container.worldToLocal(worldPoint) : offsetPoint;
  const position: [number, number, number] = [localPoint.x, localPoint.y, localPoint.z];
  let rotation = (placement.back ? [0, Math.PI, 0] : [0, 0, 0]) as [number, number, number];

  if (placement.leftSleeve || placement.rightSleeve) {
    rotation = [0, placement.leftSleeve ? -Math.PI / 2 : Math.PI / 2, 0];
  }

  const isHorizontal = logoAspect >= 1.45;
  const isBackCenter = placement.back && !label.toLowerCase().includes("alta") && !label.toLowerCase().includes("nuca");
  const isNeckBack = placement.back && (label.toLowerCase().includes("alta") || label.toLowerCase().includes("nuca"));
  const isChestCenter = !placement.back && !placement.leftSleeve && !placement.rightSleeve && label.toLowerCase().includes("centro");
  const requestedCm = logoSize * 100;
  let targetWidthCm: number;

  if (isBackCenter) {
    targetWidthCm = THREE.MathUtils.clamp(requestedCm || 28, 25, 30);
  } else if (isNeckBack) {
    targetWidthCm = THREE.MathUtils.clamp(requestedCm || 8, 6, 9);
  } else if (isHorizontal) {
    targetWidthCm = THREE.MathUtils.clamp(requestedCm || 9, 8, 10);
  } else {
    targetWidthCm = THREE.MathUtils.clamp(requestedCm || 7, 6, 7);
  }

  const referenceTorsoCm = 46;
  const targetRatio = targetWidthCm / referenceTorsoCm;
  const minRatio = placement.leftSleeve || placement.rightSleeve
    ? 0.1
    : isBackCenter
      ? 0.48
      : isNeckBack
        ? 0.13
        : isHorizontal
          ? (isChestCenter ? 0.2 : 0.16)
          : (isChestCenter ? 0.18 : 0.15);
  const maxRatio = placement.leftSleeve || placement.rightSleeve
    ? 0.18
    : isBackCenter
      ? 0.66
      : isNeckBack
        ? 0.22
        : isHorizontal
          ? (isChestCenter ? 0.32 : 0.24)
          : (isChestCenter ? 0.26 : 0.2);
  const width = size.x * THREE.MathUtils.clamp(targetRatio, minRatio, maxRatio);
  const height = THREE.MathUtils.clamp(
    width / THREE.MathUtils.clamp(logoAspect, 0.45, 3.8),
    isBackCenter ? size.y * 0.12 : size.y * (isChestCenter ? 0.07 : 0.05),
    isBackCenter ? size.y * 0.34 : size.y * (isChestCenter ? 0.22 : 0.17),
  );

  return {
    ...coords,
    rotation,
    position,
    scale: [width, height, 0.01] as [number, number, number],
  };
}

function useValidatedModelUrl(
  modelUrl: string | null | undefined,
  fallbackUrl: string | null | undefined
) {
  return useMemo(() => {
    if (!modelUrl) return fallbackUrl || null;
    if (isLegacyProductModelUrl(modelUrl)) return fallbackUrl || null;
    return modelUrl || fallbackUrl || null;
  }, [modelUrl, fallbackUrl]);
}

function getDefaultModelRotationY(garmentType?: string, modelUrl?: string | null) {
  void garmentType;
  void modelUrl;
  return 0;
}

function isTextureableLocalModelUrl(modelUrl: string | null | undefined) {
  if (!modelUrl) return false;
  try {
    const pathname = /^https?:\/\//i.test(modelUrl) ? new URL(modelUrl).pathname : modelUrl;
    return /(?:^|\/)models\/(?:base\/[^/]+|products\/[^/]+\/[^/]+)\.glb$/i.test(pathname);
  } catch {
    return /(?:^|\/)models\/(?:base\/[^/]+|products\/[^/]+\/[^/]+)\.glb$/i.test(modelUrl);
  }
}

const PHOTO_TEXTURE_CACHE = new Map<string, HTMLCanvasElement>();
const PHOTO_TEXTURE_SIZE = 448;

function usePhotoFabricTexture(src?: string, mode: "swatch" | "atlas" = "swatch") {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!src) {
      queueMicrotask(() => setTexture(null));
      return;
    }

    let cancelled = false;
    let generatedTexture: THREE.Texture | null = null;

    const cacheKey = `${mode}:${src}`;

    const setCanvasTexture = (canvas: HTMLCanvasElement) => {
      if (cancelled) return;
      const t = new THREE.CanvasTexture(canvas);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = mode === "atlas" ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
      t.wrapT = mode === "atlas" ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
      t.repeat.set(1, 1);
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      t.needsUpdate = true;
      generatedTexture = t;
      setTexture(t);
    };

    const cachedCanvas = PHOTO_TEXTURE_CACHE.get(cacheKey);
    if (cachedCanvas) {
      setCanvasTexture(cachedCanvas);
      return () => {
        cancelled = true;
        generatedTexture?.dispose();
      };
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled || !img.naturalWidth || !img.naturalHeight) return;

      const source = document.createElement("canvas");
      const longestSide = Math.max(img.naturalWidth, img.naturalHeight);
      const imageScale = Math.min(1, 512 / longestSide);
      source.width = Math.max(1, Math.round(img.naturalWidth * imageScale));
      source.height = Math.max(1, Math.round(img.naturalHeight * imageScale));
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      if (!sourceCtx) return;
      sourceCtx.drawImage(img, 0, 0, source.width, source.height);

      const sourceData = sourceCtx.getImageData(0, 0, source.width, source.height);
      const data = sourceData.data;
      let minX = source.width;
      let minY = source.height;
      let maxX = 0;
      let maxY = 0;
      let avgR = 0;
      let avgG = 0;
      let avgB = 0;
      let samples = 0;
      const scanStep = Math.max(1, Math.floor(Math.max(source.width, source.height) / 220));

      const isBackgroundPixel = (r: number, g: number, b: number, a: number) => {
        if (a < 18) return true;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        return max > 238 && max - min < 22;
      };

      for (let y = 0; y < source.height; y += scanStep) {
        for (let x = 0; x < source.width; x += scanStep) {
          const i = (y * source.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (isBackgroundPixel(r, g, b, a)) continue;

          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          avgR += r;
          avgG += g;
          avgB += b;
          samples += 1;
        }
      }

      if (!samples) {
        minX = 0;
        minY = 0;
        maxX = source.width;
        maxY = source.height;
        avgR = 210;
        avgG = 210;
        avgB = 210;
        samples = 1;
      }

      const fillR = Math.round(avgR / samples);
      const fillG = Math.round(avgG / samples);
      const fillB = Math.round(avgB / samples);
      const cropW = Math.max(1, maxX - minX + 1);
      const cropH = Math.max(1, maxY - minY + 1);

      if (mode === "atlas") {
        const canvas = document.createElement("canvas");
        canvas.width = PHOTO_TEXTURE_SIZE;
        canvas.height = PHOTO_TEXTURE_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = `rgb(${fillR}, ${fillG}, ${fillB})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const padding = PHOTO_TEXTURE_SIZE * 0.04;
        const fit = Math.min(
          (PHOTO_TEXTURE_SIZE - padding * 2) / cropW,
          (PHOTO_TEXTURE_SIZE - padding * 2) / cropH,
        );
        const drawW = cropW * fit;
        const drawH = cropH * fit;
        const drawX = (PHOTO_TEXTURE_SIZE - drawW) / 2;
        const drawY = (PHOTO_TEXTURE_SIZE - drawH) / 2;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(source, minX, minY, cropW, cropH, drawX, drawY, drawW, drawH);

        const atlasImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const atlasPixels = atlasImage.data;
        for (let i = 0; i < atlasPixels.length; i += 4) {
          const r = atlasPixels[i];
          const g = atlasPixels[i + 1];
          const b = atlasPixels[i + 2];
          const a = atlasPixels[i + 3];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const isAtlasBackground = a < 18 || (max > 224 && max - min < 36);

          if (!isAtlasBackground) {
            atlasPixels[i + 3] = 255;
            continue;
          }

          const noise = ((i / 4) % 17) - 8;
          atlasPixels[i] = THREE.MathUtils.clamp(fillR + noise, 0, 255);
          atlasPixels[i + 1] = THREE.MathUtils.clamp(fillG + noise, 0, 255);
          atlasPixels[i + 2] = THREE.MathUtils.clamp(fillB + noise, 0, 255);
          atlasPixels[i + 3] = 255;
        }
        ctx.putImageData(atlasImage, 0, 0);

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "rgba(255,255,255,0.06)");
        gradient.addColorStop(0.55, "rgba(255,255,255,0)");
        gradient.addColorStop(1, "rgba(0,0,0,0.05)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        PHOTO_TEXTURE_CACHE.set(cacheKey, canvas);
        setCanvasTexture(canvas);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = PHOTO_TEXTURE_SIZE;
      canvas.height = PHOTO_TEXTURE_SIZE;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.fillStyle = `rgb(${fillR}, ${fillG}, ${fillB})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const fabricImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const fabricPixels = fabricImage.data;
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const i = (y * canvas.width + x) * 4;
          const weave =
            ((x % 7) - 3) * 0.75 +
            ((y % 11) - 5) * 0.45 +
            (Math.sin(x * 0.42) + Math.cos(y * 0.36)) * 1.15;
          const softNoise = (((x * 13 + y * 17) % 23) - 11) * 0.35;
          const shade = weave + softNoise;

          fabricPixels[i] = THREE.MathUtils.clamp(fillR + shade, 0, 255);
          fabricPixels[i + 1] = THREE.MathUtils.clamp(fillG + shade, 0, 255);
          fabricPixels[i + 2] = THREE.MathUtils.clamp(fillB + shade, 0, 255);
          fabricPixels[i + 3] = 255;
        }
      }
      ctx.putImageData(fabricImage, 0, 0);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "rgba(255,255,255,0.10)");
      gradient.addColorStop(0.5, "rgba(255,255,255,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.08)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      PHOTO_TEXTURE_CACHE.set(cacheKey, canvas);
      setCanvasTexture(canvas);
    };

    img.onerror = () => {
      if (!cancelled) setTexture(null);
    };
    img.src = /^https?:\/\//i.test(src) ? `/api/image-proxy?url=${encodeURIComponent(src)}` : src;

    return () => {
      cancelled = true;
      generatedTexture?.dispose();
    };
  }, [src, mode]);

  return texture;
}

function useLogoAspect(src?: string | null) {
  const [aspect, setAspect] = useState(1);

  useEffect(() => {
    if (!src) {
      queueMicrotask(() => setAspect(1));
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setAspect(img.naturalWidth / Math.max(img.naturalHeight, 1));
    };
    img.onerror = () => {
      if (!cancelled) setAspect(1);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return aspect;
}

function Scene3D({
  colorHex,
  logoSrc,
  decalCoords,
  productImageUrl,
  usePhotoTexture = false,
  activePosition,
  logoSize,
  autoRotate = false,
  garmentType,
  modelUrl,
  modelScale,
  modelPositionY,
  modelRotationY,
}: {
  colorHex: string;
  logoSrc: string | null;
  decalCoords: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  } | null;
  productImageUrl?: string;
  usePhotoTexture?: boolean;
  activePosition: string;
  logoSize: number;
  autoRotate?: boolean;
  garmentType?: string;
  modelUrl?: string;
  modelScale?: number;
  modelPositionY?: number;
  modelRotationY?: number;
}) {
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const garmentRef = useRef<THREE.Mesh | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  const [meshDecalCoords, setMeshDecalCoords] = useState<typeof decalCoords>(null);
  const logoAspect = useLogoAspect(logoSrc);

  // Determinar URL del modelo base: usar modelUrl explícito o inferir del tipo
  const fallbackModelUrl = useMemo(() => {
    if (garmentType) return getBaseModelUrl(garmentType);
    return null;
  }, [garmentType]);

  const validatedModelUrl = useValidatedModelUrl(modelUrl || null, fallbackModelUrl);
  const baseModelUrl = validatedModelUrl || fallbackModelUrl;
  const effectiveModelScale = modelScale ?? 1;
  const effectiveModelPositionY = modelPositionY ?? 0;
  const effectiveModelRotationY =
    modelRotationY && Math.abs(modelRotationY) > 0.0001
      ? modelRotationY
      : getDefaultModelRotationY(garmentType, baseModelUrl);
  const positionViewRotation = /espalda/i.test(activePosition) ? Math.PI : 0;
  const canUsePhotoFabricTexture = Boolean(
    usePhotoTexture &&
      baseModelUrl &&
      isTextureableLocalModelUrl(baseModelUrl) &&
      productImageUrl
  );
  const photoFabricTexture = usePhotoFabricTexture(
    canUsePhotoFabricTexture ? productImageUrl : undefined,
    "swatch",
  );
  const modelTexture = photoFabricTexture;
  const tintModelTexture = false;

  const handleProductMeshReady = useCallback((mesh: THREE.Mesh) => {
    garmentRef.current = mesh;
    if (!logoSrc || !decalCoords) {
      setMeshDecalCoords(null);
      return;
    }
    setMeshDecalCoords(
      fitDecalCoordsToMesh(decalCoords, mesh, activePosition, logoSize, logoAspect, modelGroupRef.current),
    );
  }, [activePosition, decalCoords, logoAspect, logoSize, logoSrc]);

  useEffect(() => {
    if (!garmentRef.current) return;
    if (!logoSrc || !decalCoords) return;
    setMeshDecalCoords(
      fitDecalCoordsToMesh(decalCoords, garmentRef.current, activePosition, logoSize, logoAspect, modelGroupRef.current),
    );
  }, [activePosition, decalCoords, logoAspect, logoSize, logoSrc]);

  const effectiveDecalCoords = logoSrc
    ? baseModelUrl
      ? (meshDecalCoords || decalCoords)
      : decalCoords
    : null;

  useEffect(() => {
    const group = modelGroupRef.current;
    if (!group || autoRotate) return;
    group.rotation.y = effectiveModelRotationY + positionViewRotation;
    invalidate();
  }, [autoRotate, effectiveModelRotationY, positionViewRotation, invalidate]);

  useFrame((_, delta) => {
    const group = modelGroupRef.current;
    if (!group || !autoRotate) return;
    if (autoRotate) {
      group.rotation.y += delta * 0.75;
    }
  });

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[3.5, 5, 4]} intensity={1.65} />
      <directionalLight position={[-4, 2.5, 3]} intensity={0.9} color="#dff8fb" />
      <directionalLight position={[0, 1, -4]} intensity={0.45} color="#eaf3f5" />
      <hemisphereLight args={["#f8fcfd", "#b9dce2", 1.08]} />

      {baseModelUrl && (
        <group
          ref={modelGroupRef}
          position={[0, effectiveModelPositionY, 0]}
          rotation={[0, effectiveModelRotationY + positionViewRotation, 0]}
          scale={effectiveModelScale}
        >
          <ProductGLB
            key={baseModelUrl}
            url={baseModelUrl}
            garmentType={garmentType}
            color={modelTexture ? undefined : colorHex}
            fabricTexture={modelTexture}
            tintTextureWithColor={tintModelTexture}
            textureAllMeshes={false}
            scale={1}
            positionY={0}
            rotationY={0}
            onMeshReady={handleProductMeshReady}
          />
          {effectiveDecalCoords && logoSrc && (
            <LogoSurfacePatch
              logoSrc={logoSrc}
              position={effectiveDecalCoords.position}
              rotation={effectiveDecalCoords.rotation}
              scale={effectiveDecalCoords.scale}
            />
          )}
        </group>
      )}

      <mesh position={[0, -0.90, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshBasicMaterial
          transparent
          opacity={0.16}
          color="#46b9c8"
          depthWrite={false}
        />
      </mesh>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI * 0.35}
        maxPolarAngle={Math.PI * 0.65}
        enableDamping
        dampingFactor={0.15}
        rotateSpeed={0.6}
      />
    </>
  );
}

// ─── Logo Size Presets ────────────────────────────────────────────────────────

const LOGO_SIZES = [
  { label: "7 cm", value: 0.07 },
  { label: "8×8 cm", value: 0.08 },
  { label: "10 cm", value: 0.10 },
  { label: "28 cm", value: 0.28 },
] as const;

// ─── Main Component ───────────────────────────────────────────────────────────

type PositionGroupId = "pecho" | "mangas" | "espalda";

const POSITION_GROUPS: Array<{ id: PositionGroupId; label: string }> = [
  { id: "pecho", label: "Pecho" },
  { id: "mangas", label: "Mangas" },
  { id: "espalda", label: "Espalda" },
];

function getPositionGroup(label: string): PositionGroupId {
  const normalized = label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (normalized.includes("manga")) return "mangas";
  if (normalized.includes("espalda")) return "espalda";
  return "pecho";
}

function shortPositionLabel(label: string): string {
  const normalized = label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (normalized.includes("izquierd")) return "Izq.";
  if (normalized.includes("derech")) return "Der.";
  if (normalized.includes("centro")) return "Centro";
  if (normalized.includes("alta") || normalized.includes("arriba")) return "Alta";
  if (normalized.includes("baja")) return "Baja";
  return label.replace(/^Pecho\s+/i, "").replace(/^Manga\s+/i, "").replace(/^Espalda\s+/i, "");
}

function PositionGroupPicker({
  labels,
  activePosition,
  compact = false,
  onChange,
}: {
  labels: string[];
  activePosition: string;
  compact?: boolean;
  onChange: (label: string) => void;
}) {
  const [openGroup, setOpenGroup] = useState<PositionGroupId>(() => getPositionGroup(activePosition));

  const grouped = useMemo(() => {
    const map: Record<PositionGroupId, string[]> = {
      pecho: [],
      mangas: [],
      espalda: [],
    };

    for (const label of labels) {
      const group = getPositionGroup(label);
      if (!map[group].includes(label)) map[group].push(label);
    }

    return map;
  }, [labels]);

  const activeGroup = getPositionGroup(activePosition);
  const visibleGroup = grouped[openGroup].length ? openGroup : activeGroup;
  const visibleOptions = grouped[visibleGroup].length ? grouped[visibleGroup] : labels;

  return (
    <div className="min-w-0">
      <p className={`${compact ? "mb-1 text-[9px]" : "mb-1.5 text-[10px]"} font-bold uppercase tracking-[0.08em] text-accent-deep`}>
        {POSITION_GROUPS.find((group) => group.id === getPositionGroup(activePosition))?.label}: {shortPositionLabel(activePosition)}
      </p>
      <div className="grid grid-cols-3 gap-1">
        {POSITION_GROUPS.map((group) => {
          const hasOptions = grouped[group.id].length > 0;
          const active = getPositionGroup(activePosition) === group.id;
          return (
            <button
              key={group.id}
              type="button"
              disabled={!hasOptions}
              onMouseEnter={() => hasOptions && setOpenGroup(group.id)}
              onFocus={() => hasOptions && setOpenGroup(group.id)}
              onClick={() => {
                if (hasOptions) setOpenGroup(group.id);
              }}
              className={`${compact ? "h-7 text-[9px]" : "h-8 text-[10px]"} rounded-md border px-2 font-black transition ${
                active || visibleGroup === group.id
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-white text-muted hover:border-accent/50 hover:text-accent-deep"
              } ${hasOptions ? "" : "cursor-not-allowed opacity-35"}`}
            >
              {group.label}
            </button>
          );
        })}
      </div>

      <div className="mt-1.5 flex max-w-full gap-1 overflow-x-auto pb-1">
        {visibleOptions.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(label)}
            className={`${compact ? "h-7 px-2 text-[9px]" : "h-8 px-2.5 text-[10px]"} shrink-0 rounded-md border font-black transition ${
              activePosition === label
                ? "border-brand-dark bg-brand-dark text-white"
                : "border-border bg-white text-muted hover:border-accent/50 hover:text-accent-deep"
            }`}
          >
            {shortPositionLabel(label)}
          </button>
        ))}
      </div>
    </div>
  );
}

type Props = {
  productImageUrl: string;
  productName: string;
  productShortName: string;
  productCategory?: string;
  garmentColor?: string;
  logoSrc: string | null;
  activePosition: string;
  onPositionChange: (label: string) => void;
  logoSize: number;
  onSizeChange: (size: number) => void;
  onLogoUpload: (file: File) => void;
  onRemoveLogo: () => void;
  modelUrl?: string;
  modelScale?: number;
  modelPositionY?: number;
  modelRotationY?: number;
  displayMode?: "both" | "3d-only";
};

const FALLBACK_COLOR = "#2d3436";

function isThreeClockWarning(message?: unknown) {
  return typeof message === "string" && message.includes("THREE.Clock: This module has been deprecated");
}

export default function Visualizador3D({
  productName,
  productImageUrl,
  productShortName,
  productCategory,
  garmentColor,
  logoSrc,
  activePosition,
  onPositionChange,
  logoSize,
  onSizeChange,
  onLogoUpload,
  onRemoveLogo,
  modelUrl,
  modelScale,
  modelPositionY,
  modelRotationY,
  displayMode = "both",
}: Props) {
  const garmentType = useMemo(
    () => detectBaseGarmentType([productCategory, productShortName, productName]),
    [productCategory, productName, productShortName],
  );

  const colorHex = garmentColor || FALLBACK_COLOR;
  const positionLabels = useMemo(() => {
    const labels = getDecalPositionLabels(garmentType);
    return Array.from(new Set(["Pecho centro", ...labels]));
  }, [garmentType]);
  const decalCoords = useMemo(() => {
    const base = getDecalCoords(garmentType, activePosition);
    if (!base) return null;
    const scaleFactor = logoSize / 0.08;
    return {
      position: base.position,
      rotation: base.rotation,
      scale: [
        base.scale[0] * scaleFactor,
        base.scale[1] * scaleFactor,
        base.scale[2],
      ] as [number, number, number],
    };
  }, [garmentType, activePosition, logoSize]);

  const is3DOnly = displayMode === "3d-only";
  const [viewMode, setViewMode] = useState<"2d" | "3d">(is3DOnly ? "3d" : "2d");
  const [autoRotate, setAutoRotate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const effectiveViewMode = is3DOnly ? "3d" : viewMode;

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (isThreeClockWarning(args[0])) return;
      originalWarn(...args);
    };
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return (
    <div className="w-full">
      {!is3DOnly && (
        <div className="mb-3 flex w-fit items-center gap-1 rounded-xl bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => setViewMode("2d")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              viewMode === "2d"
                ? "bg-white text-text shadow-sm"
                : "text-muted hover:text-accent-deep"
            }`}
          >
            Ver en 2D
          </button>
          <button
            type="button"
            onClick={() => setViewMode("3d")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              viewMode === "3d"
                ? "bg-white text-text shadow-sm"
                : "text-muted hover:text-accent-deep"
            }`}
          >
            Ver en 3D
          </button>
        </div>
      )}

      {/* Layout */}
      <div className={`relative flex flex-col gap-3 ${is3DOnly ? "" : "sm:flex-row"}`}>
        {/* Canvas area */}
        <div
          className={`relative min-w-0 flex-1 select-none overflow-hidden overscroll-contain rounded-lg border shadow-lg ${
            is3DOnly
              ? "h-full min-h-[380px] border-border bg-gradient-to-b from-white via-accent-soft/45 to-surface-2 sm:min-h-[430px]"
              : "min-h-[400px] rounded-2xl border-border bg-gradient-to-b from-surface-2 via-white to-accent-soft/45"
          }`}
          style={{ touchAction: effectiveViewMode === "3d" ? "none" : "auto" }}
        >
          {/* 2D overlay — always mounted so Fabric canvas persists */}
          {!is3DOnly && (
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${
                effectiveViewMode === "2d" ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <FabricOverlay
                productImageUrl={productImageUrl}
                productName={productName}
                productShortName={productShortName}
                logoSrc={logoSrc}
                onLogoUpload={onLogoUpload}
                activePosition={activePosition}
                onPositionChange={() => {}}
                onActivePositionChange={onPositionChange}
                onCanvasReady={() => {}}
                onRemoveLogo={onRemoveLogo}
              />
            </div>
          )}

            {/* 3D scene */}
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${
                effectiveViewMode === "3d" ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <SceneErrorBoundary resetKey={`${modelUrl || garmentType || "fallback"}-${productName}`}>
                <Canvas
                  orthographic
                  camera={{ zoom: is3DOnly ? 176 : 230, position: [0, 0, 5], near: 0.1, far: 10 }}
                  frameloop={autoRotate ? "always" : "demand"}
                  gl={{ antialias: false, powerPreference: "high-performance" }}
                  dpr={1}
                  performance={{ min: 0.5 }}
                  onCreated={({ gl }) => {
                    gl.domElement.style.touchAction = "none";
                    gl.domElement.addEventListener("webglcontextlost", (event) => {
                      event.preventDefault();
                    });
                  }}
                >
                  <Suspense fallback={null}>
                    <Scene3D
                      colorHex={colorHex}
                      logoSrc={logoSrc}
                      decalCoords={decalCoords}
                      productImageUrl={productImageUrl}
                      usePhotoTexture
                      activePosition={activePosition}
                      logoSize={logoSize}
                      autoRotate={autoRotate}
                      garmentType={garmentType}
                      modelUrl={modelUrl}
                      modelScale={modelScale}
                      modelPositionY={modelPositionY}
                      modelRotationY={modelRotationY}
                    />
                  </Suspense>
                </Canvas>
              </SceneErrorBoundary>
            </div>
        </div>

        {logoSrc && is3DOnly && (
          <div className="absolute inset-x-3 bottom-16 z-10 rounded-lg border border-border bg-white/92 p-2 shadow-sm backdrop-blur-md sm:inset-x-auto sm:bottom-3 sm:left-3 sm:max-w-[calc(100%-7.5rem)]">
            <p className="mb-1 text-[9px] font-black uppercase tracking-[0.14em] text-accent-deep">Posicion</p>
            <PositionGroupPicker
              labels={positionLabels}
              activePosition={activePosition}
              compact
              onChange={(label) => {
                setAutoRotate(false);
                onPositionChange(label);
              }}
            />
          </div>
        )}

        {/* Sidebar */}
        <div className={`flex shrink-0 flex-col gap-3 ${is3DOnly ? "absolute bottom-3 right-3 z-20 w-auto max-w-[calc(100%-1.5rem)]" : "sm:w-52"}`}>
          {logoSrc && !is3DOnly && (
            <>
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-muted/70 mb-2">
                  Posición del logo
                </h4>
                <PositionGroupPicker
                  labels={positionLabels}
                  activePosition={activePosition}
                  onChange={(label) => {
                    setAutoRotate(false);
                    onPositionChange(label);
                  }}
                />
              </div>

              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-muted/70 mb-2">
                  Tamaño del logo
                </h4>
                <div className="flex gap-1.5">
                  {LOGO_SIZES.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => onSizeChange(preset.value)}
                      className={`flex-1 rounded-lg border px-2 py-2 text-[10px] font-bold transition-all ${
                        logoSize === preset.value
                          ? "border-accent bg-accent text-white shadow-sm"
                          : "border-border bg-white text-muted hover:border-accent hover:text-accent"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className={`border bg-white/92 p-2 shadow-sm backdrop-blur-md ${is3DOnly ? "rounded-lg border-border" : "rounded-2xl border-border p-4"}`}>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onLogoUpload(f);
              }}
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-[11px] font-black text-white shadow-sm transition-all hover:bg-accent-deep active:scale-95"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
                Logo
              </button>
              <button
                type="button"
                onClick={() => setAutoRotate((prev) => !prev)}
                className={`flex h-8 min-w-11 items-center justify-center rounded-lg border px-2 text-[10px] font-black transition ${
                  autoRotate
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-white text-muted hover:border-accent/50 hover:text-accent-deep"
                }`}
                title="Giro automatico 360 grados"
              >
                360°
              </button>
            </div>
            {logoSrc && (
              <button
                type="button"
                onClick={onRemoveLogo}
                className={`${is3DOnly ? "mt-1 h-7 px-2" : "mt-2 w-full px-3 py-2"} rounded-lg border border-red-200 bg-red-50 text-[10px] font-bold text-red-600 transition-all hover:bg-red-100`}
              >
                {is3DOnly ? "Quitar" : "Quitar logo"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lazy 2D Fabric Overlay ───────────────────────────────────────────────────

import dynamic from "next/dynamic";

const FabricOverlay = dynamic(() => import("./FabricOverlay"), { ssr: false });
