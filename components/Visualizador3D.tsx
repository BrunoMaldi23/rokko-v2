"use client";

import THREE from "@/lib/threePatcher";

import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Decal,
  useGLTF,
} from "@react-three/drei";
import type { Canvas as FabricCanvas } from "fabric";
import { getDecalCoords, getDecalPositionLabels } from "@/lib/garmentMap";
import { detectBaseGarmentType, getBaseModelUrl, isLegacyProductModelUrl } from "@/lib/baseModels";
import { useFabricToThreeSync } from "@/hooks/useFabricToThreeSync";
import { useDebugFlags } from "@/lib/useDebugFlags";
import { SceneErrorBoundary } from "@/components/SceneErrorBoundary";

// ─── Mannequin ────────────────────────────────────────────────────────────────

function Mannequin({
  garmentColor,
  gender = "male",
  onMeshReady,
  hideGarment = false,
}: {
  garmentColor: string;
  gender?: "male" | "female";
  onMeshReady?: (m: THREE.Mesh) => void;
  hideGarment?: boolean;
}) {
  const gltf = useGLTF("/models/mannequin.glb");

  // Y ranges derived from actual GLB vertex analysis (new mannequin.glb):
  //   Full model: Y ≈0 (feet) to +1.708 (top of head)
  //   Legs:       Y  0.000 to  0.253
  //   Hips:       Y  0.253 to  0.510
  //   Waist:      Y  0.510 to  0.767
  //   Chest:      Y  0.767 to  1.160
  //   Shoulders:  Y  1.160 to  1.280
  //   Neck:       Y  1.280 to  1.400
  //   Head:       Y  1.400 to  1.708
  //
  // Garment = torso + shoulders (waist up to base of neck).
  // Waist at ~0.53, neck at ~1.17 — covers belly to below neck.
  const GARMENT_Y_MIN = 0.53;
  const GARMENT_Y_MAX = 1.17;
  const SKIN_HEX = "#d9b89a";

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);

    // FIX: Female scale is applied to the GROUP in the JSX (see below),
    // not to the cloned scene. This keeps shader Y coords in local/model space.
    // Do NOT call cloned.scale.set() here anymore.

    const effectiveGarment = hideGarment ? SKIN_HEX : garmentColor;
    const garmentColorObj = new THREE.Color(effectiveGarment);
    const skinColorObj = new THREE.Color(SKIN_HEX);

    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.78,
      metalness: 0,
      envMapIntensity: 0,
      side: THREE.DoubleSide,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uGarmentColor = { value: garmentColorObj };
      shader.uniforms.uSkinColor = { value: skinColorObj };
      shader.uniforms.uYMin = { value: GARMENT_Y_MIN };
      shader.uniforms.uYMax = { value: GARMENT_Y_MAX };

      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           varying float vLocalY;`
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           vLocalY = position.y;`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           varying float vLocalY;
           uniform vec3 uGarmentColor;
           uniform vec3 uSkinColor;
           uniform float uYMin;
           uniform float uYMax;`
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
           float isGarment = step(uYMin, vLocalY) * (1.0 - step(uYMax, vLocalY));
           vec3 finalTint = mix(uSkinColor, uGarmentColor, isGarment);
           diffuseColor.rgb *= finalTint;`
        );
    };

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = mat;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  // FIX: gender removed from deps — scale is now applied in JSX, not here.
  }, [gltf.scene, garmentColor, hideGarment]);

  // Female hair bun
  const hairBun = useMemo(() => {
    if (gender !== "female") return null;
    return new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 16, 16),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#3a2820"),
        roughness: 0.9,
        metalness: 0,
      })
    );
  }, [gender]);

  useEffect(() => {
    if (!hairBun) return;
    hairBun.position.set(0, 1.55, -0.12);
    hairBun.castShadow = true;
    scene.add(hairBun);
    return () => {
      scene.remove(hairBun);
    };
  }, [hairBun, scene]);

  useEffect(() => {
    let bodyMesh: THREE.Mesh | null = null;
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name.includes("body")) {
        bodyMesh = child;
      }
    });
    if (bodyMesh && onMeshReady) onMeshReady(bodyMesh);
  }, [scene, onMeshReady]);

  // FIX: female scale applied here at the group level so shader Y coords
  // remain in local (model) space and produce the correct garment region.
  const femaleScale: [number, number, number] = [0.92, 0.97, 0.94];
  const femaleOffset: [number, number, number] = [0, -0.01, 0];

  if (gender === "female") {
    return (
      <group scale={femaleScale} position={femaleOffset}>
        <primitive object={scene} />
      </group>
    );
  }

  return <primitive object={scene} />;
}

// ─── FittedGarment ────────────────────────────────────────────────────────────
// Extracts garment-shaped geometry from the mannequin and applies the product
// image as a texture using planar (XY) UV mapping.

const GARMENT_NORMAL_OFFSET = 0.06;

function FittedGarment({
  productImageUrl,
  yMin,
  yMax,
  onReady,
  fabricTexture,
  fallbackColor,
}: {
  productImageUrl?: string;
  yMin: number;
  yMax: number;
  onReady: (ready: boolean) => void;
  fabricTexture?: THREE.Texture | null;
  fallbackColor?: string;
}) {
  const gltf = useGLTF("/models/mannequin.glb");

  const geometry = useMemo(() => {
    let srcGeo: THREE.BufferGeometry | null = null;
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name.includes("body")) {
        srcGeo = child.geometry;
      }
    });
    if (!srcGeo) return null;
    const srcBuf = srcGeo as THREE.BufferGeometry;

    const pos = srcBuf.attributes.position;
    const idx = srcBuf.index;
    if (!idx) return null;

    const pArr = pos.array as Float32Array;
    const iArr = idx.array as Uint16Array | Uint32Array;
    const vCount = pArr.length / 3;

    const isGarment = new Uint8Array(vCount);
    let garmentVertexCount = 0;
    for (let i = 0; i < vCount; i++) {
      const y = pArr[i * 3 + 1];
      isGarment[i] = y >= yMin && y <= yMax ? 1 : 0;
      if (isGarment[i]) garmentVertexCount++;
    }
    if (garmentVertexCount === 0) return null;

    const newPos: number[] = [];
    const newNorm: number[] = [];
    const newIdx: number[] = [];
    const vMap = new Map<number, number>();
    const srcNorm = srcBuf.attributes.normal;
    const OFFSET = GARMENT_NORMAL_OFFSET;

    for (let i = 0; i < iArr.length; i += 3) {
      const a = iArr[i], b = iArr[i + 1], c = iArr[i + 2];
      if (!(isGarment[a] && isGarment[b] && isGarment[c])) continue;
      for (const v of [a, b, c]) {
        if (!vMap.has(v)) {
          const ni = newPos.length / 3;
          vMap.set(v, ni);
          const nx = srcNorm ? srcNorm.getX(v) : 0;
          const ny = srcNorm ? srcNorm.getY(v) : 0;
          const nz = srcNorm ? srcNorm.getZ(v) : 0;
          newPos.push(
            pArr[v * 3] + nx * OFFSET,
            pArr[v * 3 + 1] + ny * OFFSET,
            pArr[v * 3 + 2] + nz * OFFSET
          );
          if (srcNorm) {
            newNorm.push(nx, ny, nz);
          }
        }
      }
      newIdx.push(vMap.get(a)!, vMap.get(b)!, vMap.get(c)!);
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < newPos.length; i += 3) {
      const x = newPos[i], y = newPos[i + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const uvs: number[] = [];
    for (let i = 0; i < newPos.length; i += 3) {
      uvs.push(
        (newPos[i] - minX) / rangeX,
        (newPos[i + 1] - minY) / rangeY
      );
    }

    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.Float32BufferAttribute(newPos, 3));
    if (newNorm.length) {
      result.setAttribute("normal", new THREE.Float32BufferAttribute(newNorm, 3));
    } else {
      result.computeVertexNormals();
    }
    result.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    result.setIndex(newIdx);

    return result;
  }, [gltf.scene, yMin, yMax]);

  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (!productImageUrl) return;
    let cancel = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(productImageUrl)}`;
    img.onload = () => {
      if (cancel) return;
      if (!img.naturalWidth || !img.naturalHeight) {
        console.warn("FittedGarment: image has zero dimensions, skipping");
        setTex(null);
        onReadyRef.current(false);
        return;
      }
      const t = new THREE.Texture(img);
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
      setTex(t);
      onReadyRef.current(true);
    };
    img.onerror = () => { if (!cancel) { setTex(null); onReadyRef.current(false); } };
    img.src = proxyUrl;
    return () => { cancel = true; };
  }, [productImageUrl]);

  if (!geometry) return null;

  const hasTex = tex !== null;

  return (
    <mesh geometry={geometry} renderOrder={1}>
      <meshStandardMaterial
        map={hasTex ? tex : undefined}
        color={hasTex ? undefined : (fallbackColor || "#cccccc")}
        roughness={0.78}
        metalness={0}
        side={THREE.DoubleSide}
        transparent={false}
        depthWrite={true}
      />
    </mesh>
  );
}

// ─── Product GLB ──────────────────────────────────────────────────────────────
// Carga un modelo GLB del producto y permite sobreescribir su color/textura
// dinámicamente. Es el reemplazo moderno de FittedGarment.

function ProductGLB({
  url,
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
      const isMainPanel = item.score >= bestScore * 0.18;
      const isSleeveLike =
        item.score >= bestScore * 0.045 &&
        item.size.x >= 0.08 &&
        item.size.y >= 0.12;
      const isTrimLike =
        item.score >= bestScore * 0.012 &&
        item.size.x >= 0.05 &&
        item.size.y >= 0.025;

      if (isMainPanel || isSleeveLike || isTrimLike) {
        targets.add(item.mesh);
      }
    }

    return targets;
  }, []);

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
      const u = sideSurface
        ? (z - box.min.z) / rangeZ
        : (x - box.min.x) / rangeX;
      const v = (y - box.min.y) / rangeY;

      uv.push(THREE.MathUtils.clamp(u, 0, 1), THREE.MathUtils.clamp(v, 0, 1));
    }

    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  }, []);

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    const textureTargets = fabricTexture && !textureAllMeshes ? pickTextureMeshes(cloned) : new Set<THREE.Mesh>();

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const sourceMaterial = (Array.isArray(child.material) ? child.material[0] : child.material) as
          | THREE.MeshStandardMaterial
          | undefined;
        const geometry = child.geometry.clone();
        geometry.deleteAttribute("color");
        const shouldTextureMesh = Boolean(
          fabricTexture &&
            (textureAllMeshes ||
              textureTargets.has(child))
        );
        if (shouldTextureMesh) {
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
  }, [gltf, fabricTexture, textureAllMeshes, pickTextureMeshes, mapGarmentTextureUv]);

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
  }, [scene, color, fabricTexture, tintTextureWithColor]);

  useEffect(() => {
    const primaryMesh = pickPrimaryMesh(scene);
    if (primaryMesh && onMeshReady) onMeshReady(primaryMesh);
  }, [scene, onMeshReady, pickPrimaryMesh]);

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

function LogoDecal({
  logoSrc,
  position,
  rotation,
  scale,
  meshRef,
}: {
  logoSrc: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  meshRef: React.RefObject<THREE.Mesh | null>;
}) {
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
      t.needsUpdate = true;
      t.userData.logoAspect = img.naturalWidth / Math.max(img.naturalHeight, 1);
      texture = t;
      setTex({ src: logoSrc, t, err: false });
    };
    img.onerror = () => {
      if (!cancel) setTex({ src: logoSrc, t: null, err: true });
    };
    img.src = logoSrc;
    return () => {
      cancel = true;
      texture?.dispose();
    };
  }, [logoSrc]);

  if (!meshRef.current) return null;
  if (tex.src !== logoSrc || tex.err || !tex.t) return null;

  return (
    <Decal
      mesh={meshRef as React.RefObject<THREE.Mesh>}
      position={position}
      rotation={rotation}
      scale={scale}
      polygonOffsetFactor={-8}
      depthTest={false}
      renderOrder={14}
    >
      <meshStandardMaterial
        map={tex.t}
        transparent
        opacity={0.96}
        roughness={0.86}
        metalness={0}
        polygonOffset
        polygonOffsetFactor={-8}
        polygonOffsetUnits={-8}
        depthTest={false}
        depthWrite={false}
        alphaTest={0.001}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </Decal>
  );
}

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
      t.needsUpdate = true;
      t.userData.logoAspect = img.naturalWidth / Math.max(img.naturalHeight, 1);
      texture = t;
      setTex({ src: logoSrc, t, err: false });
    };
    img.onerror = () => {
      if (!cancel) setTex({ src: logoSrc, t: null, err: true });
    };
    img.src = logoSrc;
    return () => {
      cancel = true;
      texture?.dispose();
    };
  }, [logoSrc]);

  if (tex.src !== logoSrc || tex.err || !tex.t) return null;

  return (
    <mesh position={position} rotation={rotation} renderOrder={12}>
      <planeGeometry args={[scale[0], scale[1], 12, 12]} />
      <meshStandardMaterial
        map={tex.t}
        alphaMap={tex.t}
        bumpMap={tex.t}
        bumpScale={0.0025}
        transparent
        alphaTest={0.001}
        opacity={0.94}
        roughness={0.96}
        metalness={0}
        polygonOffset
        polygonOffsetFactor={-8}
        polygonOffsetUnits={-8}
        depthTest={false}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
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
  let position: [number, number, number] = [localPoint.x, localPoint.y, localPoint.z];
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
    return /(?:^|\/)models\/(base\/)?[^/]+\.glb$/i.test(pathname) && !/mannequin\.glb$/i.test(pathname);
  } catch {
    return /(?:^|\/)models\/(base\/)?[^/]+\.glb$/i.test(modelUrl) && !/mannequin\.glb$/i.test(modelUrl);
  }
}

const PHOTO_TEXTURE_CACHE = new Map<string, HTMLCanvasElement>();
const PHOTO_TEXTURE_SIZE = 640;

function usePhotoFabricTexture(src?: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!src) {
      setTexture(null);
      return;
    }

    let cancelled = false;
    let generatedTexture: THREE.Texture | null = null;

    const setCanvasTexture = (canvas: HTMLCanvasElement) => {
      if (cancelled) return;
      const t = new THREE.CanvasTexture(canvas);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1, 1);
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = true;
      t.needsUpdate = true;
      generatedTexture = t;
      setTexture(t);
    };

    const cachedCanvas = PHOTO_TEXTURE_CACHE.get(src);
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
      const imageScale = Math.min(1, 768 / longestSide);
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
      const scanStep = Math.max(1, Math.floor(Math.max(source.width, source.height) / 360));

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
      const patchSize = Math.max(72, Math.min(220, Math.floor(Math.min(cropW, cropH) * 0.32)));
      const patchX = Math.round(THREE.MathUtils.clamp(minX + cropW * 0.5 - patchSize / 2, minX, maxX - patchSize));
      const patchY = Math.round(THREE.MathUtils.clamp(minY + cropH * 0.45 - patchSize / 2, minY, maxY - patchSize));

      const patch = document.createElement("canvas");
      patch.width = patchSize;
      patch.height = patchSize;
      const patchCtx = patch.getContext("2d", { willReadFrequently: true });
      if (!patchCtx) return;

      patchCtx.fillStyle = `rgb(${fillR}, ${fillG}, ${fillB})`;
      patchCtx.fillRect(0, 0, patchSize, patchSize);
      patchCtx.drawImage(source, patchX, patchY, patchSize, patchSize, 0, 0, patchSize, patchSize);

      const patchImage = patchCtx.getImageData(0, 0, patch.width, patch.height);
      const pixels = patchImage.data;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        if (!isBackgroundPixel(r, g, b, a)) {
          pixels[i + 3] = 255;
          continue;
        }

        const noise = ((i / 4) % 13) - 6;
        pixels[i] = THREE.MathUtils.clamp(fillR + noise, 0, 255);
        pixels[i + 1] = THREE.MathUtils.clamp(fillG + noise, 0, 255);
        pixels[i + 2] = THREE.MathUtils.clamp(fillB + noise, 0, 255);
        pixels[i + 3] = 255;
      }
      patchCtx.putImageData(patchImage, 0, 0);

      const canvas = document.createElement("canvas");
      canvas.width = PHOTO_TEXTURE_SIZE;
      canvas.height = PHOTO_TEXTURE_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = `rgb(${fillR}, ${fillG}, ${fillB})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const pattern = ctx.createPattern(patch, "repeat");
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "rgba(255,255,255,0.10)");
      gradient.addColorStop(0.5, "rgba(255,255,255,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.08)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      PHOTO_TEXTURE_CACHE.set(src, canvas);
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
  }, [src]);

  return texture;
}

function useLogoAspect(src?: string | null) {
  const [aspect, setAspect] = useState(1);

  useEffect(() => {
    if (!src) {
      setAspect(1);
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
  fabricCanvas,
  productImageUrl,
  solidColorOnly = false,
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
  fabricCanvas: FabricCanvas | null;
  productImageUrl?: string;
  solidColorOnly?: boolean;
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
  const [meshReady, setMeshReady] = useState(false);
  const [meshDecalCoords, setMeshDecalCoords] = useState<typeof decalCoords>(null);
  const debug = useDebugFlags();
  const logoAspect = useLogoAspect(logoSrc);

  // Determinar URL del modelo base: usar modelUrl explícito o inferir del tipo
  const fallbackModelUrl = useMemo(() => {
    if (garmentType) return getBaseModelUrl(garmentType);
    return null;
  }, [garmentType]);

  const validatedModelUrl = useValidatedModelUrl(modelUrl || null, fallbackModelUrl);
  const baseModelUrl = solidColorOnly
    ? validatedModelUrl || fallbackModelUrl
    : validatedModelUrl;
  const effectiveModelScale = modelScale ?? 1;
  const effectiveModelPositionY = modelPositionY ?? 0;
  const effectiveModelRotationY =
    modelRotationY && Math.abs(modelRotationY) > 0.0001
      ? modelRotationY
      : getDefaultModelRotationY(garmentType, baseModelUrl);
  const positionViewRotation = /espalda/i.test(activePosition) ? Math.PI : 0;
  const canUsePhotoFabricTexture = Boolean(
    baseModelUrl &&
      isTextureableLocalModelUrl(baseModelUrl) &&
      productImageUrl
  );
  const photoFabricTexture = usePhotoFabricTexture(canUsePhotoFabricTexture ? productImageUrl : undefined);

  // Fabric → Three sync: genera un canvas oculto con el contenido del editor 2D
  const { canvasElement, ready: fabricSyncReady, version } = useFabricToThreeSync({
    fabricCanvas: debug.fabricSync ? fabricCanvas : null,
    fps: 30,
  });

  const fabricTexture = useMemo(() => {
    if (!canvasElement || !fabricSyncReady) return null;
    const t = new THREE.CanvasTexture(canvasElement);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [canvasElement, fabricSyncReady, version]);

  useEffect(() => {
    return () => {
      fabricTexture?.dispose();
    };
  }, [fabricTexture]);

  const hasFabricTexture =
    !baseModelUrl && !solidColorOnly && debug.fabricSync && fabricTexture !== null;
  const modelTexture = hasFabricTexture ? fabricTexture : photoFabricTexture;
  const tintModelTexture = false;

  useEffect(() => {
    setMeshReady(false);
    setMeshDecalCoords(null);
    garmentRef.current = null;
  }, [baseModelUrl]);

  const handleProductMeshReady = useCallback((mesh: THREE.Mesh) => {
    garmentRef.current = mesh;
    setMeshDecalCoords(
      decalCoords
        ? fitDecalCoordsToMesh(decalCoords, mesh, activePosition, logoSize, logoAspect, modelGroupRef.current)
        : null,
    );
    setMeshReady(true);
  }, [activePosition, decalCoords, logoAspect, logoSize]);

  useEffect(() => {
    if (!meshReady || !garmentRef.current) return;
    setMeshDecalCoords(
      decalCoords
        ? fitDecalCoordsToMesh(decalCoords, garmentRef.current, activePosition, logoSize, logoAspect, modelGroupRef.current)
        : null,
    );
  }, [activePosition, decalCoords, logoAspect, logoSize, meshReady]);

  const effectiveDecalCoords = baseModelUrl ? (meshDecalCoords || decalCoords) : decalCoords;

  useFrame((_, delta) => {
    const group = modelGroupRef.current;
    if (!group) return;
    const target = effectiveModelRotationY + positionViewRotation;
    if (autoRotate) {
      group.rotation.y += delta * 0.75;
      return;
    }
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, target, 8, delta);
  });

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[3.5, 5, 4]} intensity={1.6} />
      <directionalLight position={[-4, 2.5, 3]} intensity={0.9} />
      <directionalLight position={[0, 1, -4]} intensity={0.45} />
      <hemisphereLight args={["#fff8ee", "#b7afa7", 1.1]} />

      {baseModelUrl ? (
        <group
          ref={modelGroupRef}
          position={[0, effectiveModelPositionY, 0]}
          rotation={[0, effectiveModelRotationY + positionViewRotation, 0]}
          scale={effectiveModelScale}
        >
          <ProductGLB
            key={baseModelUrl}
            url={baseModelUrl}
            color={modelTexture ? undefined : colorHex}
            fabricTexture={modelTexture}
            tintTextureWithColor={tintModelTexture}
            textureAllMeshes={false}
            scale={1}
            positionY={0}
            rotationY={0}
            onMeshReady={handleProductMeshReady}
          />
          {!hasFabricTexture && effectiveDecalCoords && logoSrc && (
            <LogoSurfacePatch
              logoSrc={logoSrc}
              position={effectiveDecalCoords.position}
              rotation={effectiveDecalCoords.rotation}
              scale={effectiveDecalCoords.scale}
            />
          )}
        </group>
      ) : (
        debug.mannequin && (solidColorOnly || productImageUrl || hasFabricTexture) && (
          <FittedGarment
            productImageUrl={solidColorOnly ? undefined : productImageUrl}
            yMin={0.40}
            yMax={1.28}
            onReady={() => {}}
            fabricTexture={fabricTexture}
            fallbackColor={colorHex}
          />
        )
      )}

      {!baseModelUrl && !hasFabricTexture && debug.decal && effectiveDecalCoords && logoSrc && meshReady && garmentRef.current && (
        <LogoDecal
          logoSrc={logoSrc}
          position={effectiveDecalCoords.position}
          rotation={effectiveDecalCoords.rotation}
          scale={effectiveDecalCoords.scale}
          meshRef={garmentRef}
        />
      )}

      {debug.contactShadows && (
        <mesh position={[0, -0.90, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
          <planeGeometry args={[2.4, 2.4]} />
          <meshBasicMaterial
            transparent
            opacity={0.16}
            color="#7b746d"
            depthWrite={false}
          />
        </mesh>
      )}
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

  useEffect(() => {
    setOpenGroup(getPositionGroup(activePosition));
  }, [activePosition]);

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

  const visibleOptions = grouped[openGroup].length ? grouped[openGroup] : labels;

  return (
    <div className="min-w-0">
      <p className={`${compact ? "mb-1 text-[9px]" : "mb-1.5 text-[10px]"} font-bold uppercase tracking-[0.08em] text-[#8b5e3c]`}>
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
                active || openGroup === group.id
                  ? "border-[#c3654d] bg-[#c3654d] text-white"
                  : "border-black/10 bg-white text-[#655b50] hover:border-[#c3654d]/50"
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
                ? "border-[#181512] bg-[#181512] text-white"
                : "border-black/10 bg-white text-[#655b50] hover:border-[#c3654d]/50"
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
  imageAlreadyColorMatched?: boolean;
  logoSrc: string | null;
  activePosition: string;
  onPositionChange: (label: string) => void;
  logoSize: number;
  resetKey?: number;
  onSizeChange: (size: number) => void;
  onLogoUpload: (file: File) => void;
  onRemoveLogo: () => void;
  fabricCanvas: FabricCanvas | null;
  onFabricCanvasReady: (c: FabricCanvas) => void;
  modelUrl?: string;
  modelScale?: number;
  modelPositionY?: number;
  modelRotationY?: number;
  displayMode?: "both" | "3d-only";
};

const FALLBACK_COLOR = "#2d3436";

export default function Visualizador3D({
  productName,
  productImageUrl,
  productShortName,
  productCategory,
  garmentColor,
  imageAlreadyColorMatched = false,
  logoSrc,
  activePosition,
  onPositionChange,
  logoSize,
  resetKey,
  onSizeChange,
  onLogoUpload,
  onRemoveLogo,
  fabricCanvas,
  onFabricCanvasReady,
  modelUrl,
  modelScale,
  modelPositionY,
  modelRotationY,
  displayMode = "both",
}: Props) {
  const garmentType = useMemo(() => {
    return detectBaseGarmentType([productCategory, productShortName, productName]);

    const s = `${productShortName} ${productName}`.toLowerCase();
    const normalized = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (/pantalon|cargo/.test(normalized)) return "pantalon-cargo";
    if (/blusa/.test(normalized)) return "blusa";
    if (/camisa|shirt/.test(normalized)) return "camisa";
    if (/micropolar/.test(normalized) && /mujer/.test(normalized)) return "micropolar-mujer";
    if (/micropolar/.test(normalized)) return "micropolar-hombre";
    if (/softshell/.test(normalized) && /termic|termico|premium/.test(normalized) && /mujer/.test(normalized)) return "softshell-termico-mujer";
    if (/softshell/.test(normalized) && /termic|termico|premium/.test(normalized)) return "softshell-termico-hombre";
    if (/softshell/.test(normalized) && /mujer/.test(normalized)) return "softshell-basico-mujer";
    if (/softshell/.test(normalized)) return "softshell-basico-hombre";
    if (/parka/.test(normalized) && /sin gorro/.test(normalized)) return "parka-desmontable-sin-gorro";
    if (/parka/.test(normalized) && /desmontable|puno/.test(normalized)) return "parka-desmontable";
    if (/parka/.test(normalized)) return "parka-hombre";
    if (/poleron/.test(normalized) && /polo|unisex/.test(normalized)) return "poleron-polo-unisex";
    if (/poleron|hoodie|sudader/.test(normalized)) return "poleron-cuello-redondo";
    if (/bomber/.test(s)) return "bomber";
    if (/hoodie|poler[oó]n|sudader/.test(s)) return "hoodie";
    if (/polo/.test(s)) return "polo";
    if (/shirt|camisa/.test(s)) return "shirt";
    if (/manga larga/.test(s)) return "t-shirt manga larga";
    return "t-shirt";
  }, [productCategory, productName, productShortName]);

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

  useEffect(() => {
    if (is3DOnly) setViewMode("3d");
  }, [is3DOnly]);

  useEffect(() => {
    setAutoRotate(false);
    if (is3DOnly) setViewMode("3d");
  }, [resetKey, is3DOnly]);

  return (
    <div className="w-full">
      {!is3DOnly && (
        <div className="mb-3 flex w-fit items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setViewMode("2d")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              viewMode === "2d"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Ver en 2D
          </button>
          <button
            type="button"
            onClick={() => setViewMode("3d")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              viewMode === "3d"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
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
              ? "h-full min-h-[360px] border-black/10 bg-gradient-to-b from-white via-[#fbf7f0] to-[#e4d9ce] sm:min-h-[390px]"
              : "min-h-[400px] rounded-2xl border-slate-200 bg-gradient-to-b from-slate-100 via-white to-slate-200"
          }`}
          style={{ touchAction: viewMode === "3d" ? "none" : "auto" }}
        >
          {/* 2D overlay — always mounted so Fabric canvas persists */}
          {!is3DOnly && (
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${
                viewMode === "2d" ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <FabricOverlay
                productImageUrl={productImageUrl}
                productName={productName}
                productShortName={productShortName}
                logoSrc={logoSrc}
                garmentColor={colorHex}
                skipTint={imageAlreadyColorMatched}
                onLogoUpload={onLogoUpload}
                activePosition={activePosition}
                onPositionChange={() => {}}
                onActivePositionChange={onPositionChange}
                onCanvasReady={onFabricCanvasReady}
                onRemoveLogo={onRemoveLogo}
              />
            </div>
          )}

            {/* 3D scene */}
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${
                viewMode === "3d" ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <SceneErrorBoundary resetKey={`${modelUrl || garmentType || "fallback"}-${productName}`}>
                <Canvas
                  orthographic
                  camera={{ zoom: is3DOnly ? 176 : 230, position: [0, 0, 5], near: 0.1, far: 10 }}
                  gl={{ antialias: true, powerPreference: "high-performance" }}
                  dpr={[1, 1.25]}
                  onCreated={({ gl }) => {
                    gl.domElement.style.touchAction = "none";
                    gl.domElement.addEventListener("webglcontextlost", (event) => {
                      event.preventDefault();
                      console.warn("[Visualizador3D] WebGL context lost");
                    });
                  }}
                >
                  <Suspense fallback={null}>
                    <Scene3D
                      colorHex={colorHex}
                      logoSrc={logoSrc}
                      decalCoords={decalCoords}
                      fabricCanvas={is3DOnly ? null : fabricCanvas}
                      productImageUrl={productImageUrl}
                      solidColorOnly={is3DOnly}
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
          <div className="absolute inset-x-3 bottom-16 z-10 rounded-lg border border-black/10 bg-white/92 p-2 shadow-sm backdrop-blur-md sm:inset-x-auto sm:bottom-3 sm:left-3 sm:max-w-[calc(100%-7.5rem)]">
            <p className="mb-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#8b5e3c]">Posicion</p>
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
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
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

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
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
                          : "border-slate-200 bg-white text-slate-600 hover:border-accent hover:text-accent"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className={`border bg-white/92 p-2 shadow-sm backdrop-blur-md ${is3DOnly ? "rounded-lg border-black/10" : "rounded-2xl border-slate-200 p-4"}`}>
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
                className="flex items-center justify-center gap-2 rounded-lg bg-[#c3654d] px-3 py-2 text-[11px] font-black text-white shadow-sm transition-all hover:bg-[#ae563f] active:scale-95"
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
                    ? "border-[#c3654d] bg-[#c3654d] text-white"
                    : "border-black/10 bg-white text-[#655b50] hover:border-[#c3654d]/50"
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
