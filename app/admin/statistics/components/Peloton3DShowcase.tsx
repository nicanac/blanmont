'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { TrophySquareIcon } from '@/app/components/ui/CyclingIcons';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface WeeklyStat {
  week: string;
  count: number;
  isoDate: string;
}

interface Peloton3DShowcaseProps {
  championName: string;
  maxRides: number;
  totalPossibleCarres: number;
  selectedYear: string;
  weeklyDistribution: WeeklyStat[];
}

type SceneMode = 'trophee' | 'relief';

export default function Peloton3DShowcase({
  championName,
  maxRides,
  totalPossibleCarres,
  selectedYear,
  weeklyDistribution,
}: Peloton3DShowcaseProps): React.ReactElement {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<SceneMode>('trophee');
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // References for Three.js animation loop & state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const trophyGroupRef = useRef<THREE.Group | null>(null);
  const reliefGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const spotlightRef = useRef<THREE.SpotLight | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  // Drag interaction coordinates
  const pointerDownRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.1, y: 0 });
  const targetRotationRef = useRef({ x: 0.1, y: 0 });

  // Confetti celebration trigger
  const handleCelebrate = useCallback(() => {
    setIsCelebrating(true);

    // Dynamic confetti in club colors (Brand Crimson #e03e3e, Gold #f59e0b, Peloton Emerald #10b981)
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#e03e3e', '#f59e0b', '#10b981', '#ffffff'],
        disableForReducedMotion: true,
      });
    } catch {
      // ignore
    }

    // Pulse 3D spotlight if available
    if (spotlightRef.current) {
      const originalIntensity = spotlightRef.current.intensity;
      spotlightRef.current.intensity = originalIntensity * 2.5;
      setTimeout(() => {
        if (spotlightRef.current) {
          spotlightRef.current.intensity = originalIntensity;
        }
        setIsCelebrating(false);
      }, 1000);
    } else {
      setTimeout(() => setIsCelebrating(false), 1000);
    }
  }, []);

  // Three.js Scene Setup and Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 7.5);
    camera.lookAt(0, 1.2, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xf59e0b, 3.5, 20, Math.PI / 4, 0.4);
    spotLight.position.set(-4, 7, 5);
    spotLight.target.position.set(0, 1.2, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);
    spotlightRef.current = spotLight;

    const emeraldPointLight = new THREE.PointLight(0x10b981, 2.5, 8);
    emeraldPointLight.position.set(0, 0.2, 2);
    scene.add(emeraldPointLight);

    // 4. Materials
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.22,
    });

    const polishedGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.92,
      roughness: 0.15,
    });

    const emeraldSquareMaterial = new THREE.MeshStandardMaterial({
      color: 0x059669,
      metalness: 0.35,
      roughness: 0.25,
    });

    const darkBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x161922,
      metalness: 0.7,
      roughness: 0.4,
    });

    // ----------------------------------------------------
    // BUILD 3D TROPHY GROUP ("Le Carré Vert 1978")
    // ----------------------------------------------------
    const trophyGroup = new THREE.Group();
    trophyGroupRef.current = trophyGroup;

    // A. The Green Pedestal ("Le Carré Vert")
    const squareBaseGeo = new THREE.BoxGeometry(2.4, 0.35, 2.4);
    const squareBaseMesh = new THREE.Mesh(squareBaseGeo, emeraldSquareMaterial);
    squareBaseMesh.position.y = 0.18;
    trophyGroup.add(squareBaseMesh);

    // B. Sub-pedestal tiered base
    const subBaseGeo = new THREE.CylinderGeometry(1.0, 1.25, 0.3, 32);
    const subBaseMesh = new THREE.Mesh(subBaseGeo, darkBaseMaterial);
    subBaseMesh.position.y = 0.5;
    trophyGroup.add(subBaseMesh);

    // C. Stem & Column in Gold
    const stemLowerGeo = new THREE.CylinderGeometry(0.3, 0.6, 0.4, 24);
    const stemLowerMesh = new THREE.Mesh(stemLowerGeo, goldMaterial);
    stemLowerMesh.position.y = 0.85;
    trophyGroup.add(stemLowerMesh);

    const stemRingGeo = new THREE.TorusGeometry(0.35, 0.08, 16, 32);
    const stemRingMesh = new THREE.Mesh(stemRingGeo, polishedGoldMaterial);
    stemRingMesh.rotation.x = Math.PI / 2;
    stemRingMesh.position.y = 1.05;
    trophyGroup.add(stemRingMesh);

    const stemUpperGeo = new THREE.CylinderGeometry(0.45, 0.25, 0.5, 24);
    const stemUpperMesh = new THREE.Mesh(stemUpperGeo, goldMaterial);
    stemUpperMesh.position.y = 1.35;
    trophyGroup.add(stemUpperMesh);

    // D. The Trophy Chalice / Cup
    const cupBaseGeo = new THREE.CylinderGeometry(0.85, 0.45, 0.6, 32);
    const cupBaseMesh = new THREE.Mesh(cupBaseGeo, polishedGoldMaterial);
    cupBaseMesh.position.y = 1.9;
    trophyGroup.add(cupBaseMesh);

    const cupMainGeo = new THREE.CylinderGeometry(1.15, 0.85, 0.8, 32, 1, true);
    const cupMainMesh = new THREE.Mesh(cupMainGeo, polishedGoldMaterial);
    cupMainMesh.position.y = 2.6;
    trophyGroup.add(cupMainMesh);

    const rimGeo = new THREE.TorusGeometry(1.15, 0.07, 16, 32);
    const rimMesh = new THREE.Mesh(rimGeo, goldMaterial);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 3.0;
    trophyGroup.add(rimMesh);

    // Inside cup bottom filler
    const innerBottomGeo = new THREE.CylinderGeometry(0.82, 0.82, 0.05, 32);
    const innerBottomMesh = new THREE.Mesh(innerBottomGeo, goldMaterial);
    innerBottomMesh.position.y = 2.22;
    trophyGroup.add(innerBottomMesh);

    // E. Handles (Left & Right)
    const handleGeo = new THREE.TorusGeometry(0.55, 0.08, 16, 24, Math.PI);

    const leftHandle = new THREE.Mesh(handleGeo, goldMaterial);
    leftHandle.rotation.z = Math.PI / 2;
    leftHandle.rotation.y = Math.PI / 2;
    leftHandle.position.set(-1.18, 2.5, 0);
    trophyGroup.add(leftHandle);

    const rightHandle = new THREE.Mesh(handleGeo, goldMaterial);
    rightHandle.rotation.z = -Math.PI / 2;
    rightHandle.rotation.y = Math.PI / 2;
    rightHandle.position.set(1.18, 2.5, 0);
    trophyGroup.add(rightHandle);

    // F. Golden Laurel Wreath / Star Emblem
    const starGeo = new THREE.OctahedronGeometry(0.28, 0);
    const starMesh = new THREE.Mesh(starGeo, polishedGoldMaterial);
    starMesh.position.y = 3.25;
    trophyGroup.add(starMesh);

    scene.add(trophyGroup);

    // ----------------------------------------------------
    // BUILD 3D TOPOGRAPHY RELIEF GROUP
    // ----------------------------------------------------
    const reliefGroup = new THREE.Group();
    reliefGroupRef.current = reliefGroup;

    // Ground plane grid
    const gridHelper = new THREE.GridHelper(7, 14, 0xe03e3e, 0x262b38);
    gridHelper.position.y = 0;
    reliefGroup.add(gridHelper);

    // Dynamic attendance elevation pillars
    const barMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.6,
      roughness: 0.3,
    });
    const peakBarMaterial = new THREE.MeshStandardMaterial({
      color: 0xe03e3e,
      metalness: 0.7,
      roughness: 0.25,
    });

    const recentWeeks = weeklyDistribution.slice(-16);
    const maxCount = Math.max(...recentWeeks.map((w) => w.count), 1);

    const colWidth = 0.28;
    const spacing = 0.38;
    const startX = -((recentWeeks.length - 1) * spacing) / 2;

    recentWeeks.forEach((item, index) => {
      const heightVal = Math.max((item.count / maxCount) * 2.8, 0.15);
      const isPeak = item.count === maxCount;

      const barGeo = new THREE.BoxGeometry(colWidth, heightVal, colWidth);
      const barMesh = new THREE.Mesh(barGeo, isPeak ? peakBarMaterial : barMaterial);
      barMesh.position.set(startX + index * spacing, heightVal / 2, 0);
      reliefGroup.add(barMesh);

      // Add a small light beacon atop the highest peak
      if (isPeak) {
        const beaconGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff4d4d });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.set(barMesh.position.x, heightVal + 0.15, 0);
        reliefGroup.add(beaconMesh);
      }
    });

    reliefGroup.position.set(0, 0.3, 0);
    reliefGroup.visible = false;
    scene.add(reliefGroup);

    // ----------------------------------------------------
    // AMBIENT GOLD & EMERALD PARTICLES
    // ----------------------------------------------------
    const particleCount = 100;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorGold = new THREE.Color(0xf59e0b);
    const colorEmerald = new THREE.Color(0x10b981);
    const colorCrimson = new THREE.Color(0xe03e3e);

    for (let i = 0; i < particleCount; i++) {
      // Cylinder distribution around trophy
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.4 + Math.random() * 2.2;
      const y = Math.random() * 4.2;

      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;

      const choice = Math.random();
      const col = choice > 0.6 ? colorGold : choice > 0.25 ? colorEmerald : colorCrimson;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particles;
    scene.add(particles);

    // ----------------------------------------------------
    // ANIMATION & RENDER LOOP
    // ----------------------------------------------------
    let clock = new THREE.Clock();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animate = (): void => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (!isVisibleRef.current) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation (lerp) toward target user rotation
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.06;
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.06;

      const activeGroup = mode === 'trophee' ? trophyGroupRef.current : reliefGroupRef.current;
      if (activeGroup) {
        if (!prefersReducedMotion) {
          // Subtle idle floating & spinning
          const autoSpin = elapsedTime * 0.35;
          activeGroup.rotation.y = rotationRef.current.y + autoSpin;
          activeGroup.rotation.x = rotationRef.current.x + Math.sin(elapsedTime * 0.8) * 0.05;
        } else {
          activeGroup.rotation.y = rotationRef.current.y;
          activeGroup.rotation.x = rotationRef.current.x;
        }
      }

      // Rotate particles slowly
      if (particlesRef.current && !prefersReducedMotion) {
        particlesRef.current.rotation.y = elapsedTime * 0.15;
      }

      renderer.render(scene, camera);
    };

    animate();

    // ----------------------------------------------------
    // INTERSECTION OBSERVER (Zero CPU when off-screen)
    // ----------------------------------------------------
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // ----------------------------------------------------
    // RESIZE OBSERVER
    // ----------------------------------------------------
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(newW, newH);
      }
    });
    resizeObserver.observe(container);

    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      observer.disconnect();
      resizeObserver.disconnect();

      // Dispose Three.js objects
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      container.replaceChildren();
    };
  }, [mode, weeklyDistribution]);

  // Update visibility on mode change
  useEffect(() => {
    if (trophyGroupRef.current) {
      trophyGroupRef.current.visible = mode === 'trophee';
    }
    if (reliefGroupRef.current) {
      reliefGroupRef.current.visible = mode === 'relief';
    }
  }, [mode]);

  // Pointer drag event handlers for 360° rotation
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    setIsDragging(true);
    pointerDownRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!isDragging) return;
    const deltaX = e.clientX - pointerDownRef.current.x;
    const deltaY = e.clientY - pointerDownRef.current.y;

    targetRotationRef.current.y += deltaX * 0.008;
    targetRotationRef.current.x = Math.max(
      Math.min(targetRotationRef.current.x + deltaY * 0.008, 0.6),
      -0.4
    );

    pointerDownRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleResetCamera = (): void => {
    targetRotationRef.current = { x: 0.1, y: 0 };
  };

  const attendancePercent =
    totalPossibleCarres > 0 ? Math.round((maxRides / totalPossibleCarres) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#262b38] bg-[#0a0c10] text-white shadow-md">
      {/* Background Ambience Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(224,62,62,0.12),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.09),transparent_60%)] pointer-events-none" />

      {/* Top Telemetry & Controls Toolbar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#262b38] bg-[#161922]/90 px-5 py-3.5 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/30">
            <TrophySquareIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-white">
                Trophée Carré Vert 3D &amp; Télémétrie
              </h2>
              <span className="rounded-full bg-[#10b981]/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#10b981] border border-[#10b981]/30">
                Saison {selectedYear}
              </span>
            </div>
            <p className="text-xs text-[#a7adbb]">
              Concours officiel de régularité du CC Saint-Martin Blanmont (depuis 1978)
            </p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Segmented Mode Control */}
          <div className="flex items-center rounded-md border border-[#262b38] bg-[#0a0c10] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMode('trophee')}
              className={`rounded-sm px-3 py-1 font-semibold uppercase tracking-wider transition-all ${
                mode === 'trophee'
                  ? 'bg-[#e03e3e] text-white shadow-xs'
                  : 'text-[#a7adbb] hover:text-white'
              }`}
            >
              Trophée d'Or
            </button>
            <button
              type="button"
              onClick={() => setMode('relief')}
              className={`rounded-sm px-3 py-1 font-semibold uppercase tracking-wider transition-all ${
                mode === 'relief'
                  ? 'bg-[#e03e3e] text-white shadow-xs'
                  : 'text-[#a7adbb] hover:text-white'
              }`}
            >
              Relief Affluence
            </button>
          </div>

          {/* Reset Camera Button */}
          <button
            type="button"
            onClick={handleResetCamera}
            title="Recentrer la vue 3D"
            className="flex h-8 w-8 md:h-8 md:w-8 items-center justify-center rounded-md border border-[#262b38] bg-[#161922] text-[#a7adbb] hover:bg-[#262b38] hover:text-white transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>

          {/* Celebrate Winner Action */}
          <button
            type="button"
            onClick={handleCelebrate}
            disabled={isCelebrating || championName === '-'}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#f59e0b] hover:bg-[#d97706] text-[#101216] px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-transform active:scale-95 disabled:opacity-50"
          >
            <SparklesIcon className="h-4 w-4" />
            <span>Célébrer</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area with Overlay HUD */}
      <div className="relative h-80 sm:h-96 w-full cursor-grab active:cursor-grabbing select-none">
        {/* Three.js Container */}
        <div
          ref={mountRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="h-full w-full touch-none"
        />

        {/* Live HUD Floating Card - Champion Telemetry */}
        <div className="absolute bottom-4 left-4 z-10 max-w-xs rounded-lg border border-[#262b38]/90 bg-[#161922]/95 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#10b981]">
              Leader au Classement
            </p>
          </div>
          <p className="mt-1 text-lg font-bold text-white tracking-tight truncate">
            {championName !== '-' ? championName : 'Aucun pointage'}
          </p>
          <div className="mt-2.5 flex items-center justify-between border-t border-[#262b38] pt-2 text-xs">
            <div>
              <span className="text-[#a7adbb]">Carrés validés:</span>{' '}
              <span className="font-bold text-white tabular-nums">{maxRides}</span>
            </div>
            <div>
              <span className="text-[#a7adbb]">Présence:</span>{' '}
              <span className="font-bold text-[#f59e0b] tabular-nums">{attendancePercent}%</span>
            </div>
          </div>
        </div>

        {/* Interaction Hint (Discreet bottom right) */}
        <div className="pointer-events-none absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-1.5 rounded-md border border-[#262b38]/60 bg-[#0a0c10]/80 px-2.5 py-1 text-xs font-medium text-[#a7adbb] backdrop-blur-xs">
          <span>Glisser pour pivoter à 360°</span>
        </div>
      </div>
    </div>
  );
}
