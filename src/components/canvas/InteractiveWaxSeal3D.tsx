import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { VintageWaxSeal } from '../ornaments/EditorialFrames';

interface InteractiveWaxSeal3DProps {
  monogram: string;
  dateText?: string;
  size?: number;
  colorHex?: number; // e.g. 0xB8860B (Dark Gold) or 0x800020 (Burgundy)
  onOpen?: () => void;
  className?: string;
}

/**
 * InteractiveWaxSeal3D (Stempel Segel Lilin 3D Interaktif Three.js)
 * Menghadirkan stempel lilin nyata dengan pencahayaan dinamis yang berkilau
 * saat kursor atau jari bergerak di atasnya.
 */
export const InteractiveWaxSeal3D: React.FC<InteractiveWaxSeal3DProps> = ({
  monogram,
  dateText,
  size = 130,
  colorHex = 0xC5A880, // Gold Champagne
  onOpen,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasWebGLSupport, setHasWebGLSupport] = useState(true);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Cek ketersediaan WebGL
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGLSupport(false);
        return;
      }
    } catch {
      setHasWebGLSupport(false);
      return;
    }

    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setHasWebGLSupport(false);
      return;
    }

    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Geometry: Seal Disc + Monogram Texture
    const sealGroup = new THREE.Group();
    scene.add(sealGroup);

    // Dynamic Monogram Canvas Texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Background base
    ctx.fillStyle = '#C5A880';
    ctx.fillRect(0, 0, 512, 512);

    // Embossed concentric rings
    ctx.strokeStyle = '#E8D5B5';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(256, 256, 220, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#8E734E';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(256, 256, 195, 0, Math.PI * 2);
    ctx.stroke();

    // Monogram text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 150px "Cinzel", "Playfair Display", "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillText(monogram, 256, 240);

    if (dateText) {
      ctx.font = '500 36px monospace';
      ctx.fillStyle = '#F5ECE0';
      ctx.fillText(dateText, 256, 340);
    }

    const sealTexture = new THREE.CanvasTexture(canvas);
    sealTexture.needsUpdate = true;

    // Main Wax Disc
    const discGeo = new THREE.CylinderGeometry(1.4, 1.45, 0.22, 48);
    const discMat = new THREE.MeshPhysicalMaterial({
      color: colorHex,
      metalness: 0.15,
      roughness: 0.28,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      map: sealTexture,
      bumpMap: sealTexture,
      bumpScale: 0.05,
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.rotation.x = Math.PI / 2;
    sealGroup.add(discMesh);

    // Organic Wavy Melted Rim
    const rimPoints: THREE.Vector2[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const r = 1.48 + Math.sin(angle * 5) * 0.06;
      rimPoints.push(new THREE.Vector2(r, 0.1));
    }
    const rimGeo = new THREE.TorusGeometry(1.44, 0.14, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.35,
      metalness: 0.2,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    sealGroup.add(rimMesh);

    // 3. Dynamic Lighting (Gleam highlight)
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xFFF0D0, 3.5, 10);
    pointLight.position.set(1.5, 2, 3);
    scene.add(pointLight);

    const rimLight = new THREE.DirectionalLight(0xFFE5B4, 1.8);
    rimLight.position.set(-2, -2, 2);
    scene.add(rimLight);

    // 4. Mouse / Touch Parallax Interaction
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      targetRotY = normX * 0.35;
      targetRotX = -normY * 0.35;

      // Update point light to reflect gleam
      pointLight.position.x = normX * 3;
      pointLight.position.y = normY * 3;
    };

    const handlePointerLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
      pointLight.position.set(1.5, 2, 3);
    };

    window.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mouseleave', handlePointerLeave);

    // 5. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth Lerp Rotation
      sealGroup.rotation.x += (targetRotX - sealGroup.rotation.x) * 0.1;
      sealGroup.rotation.y += (targetRotY - sealGroup.rotation.y) * 0.1;

      // Subtle idle breathing pulse
      const t = Date.now() * 0.0015;
      sealGroup.position.z = Math.sin(t) * 0.04;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);
      discGeo.dispose();
      discMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      sealTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [monogram, dateText, size, colorHex]);

  const handleSealClick = () => {
    if (isOpening) return;
    setIsOpening(true);

    // GSAP Pop & Lift Animation
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        scale: 1.25,
        rotation: 12,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.65,
        ease: 'power2.in',
        onComplete: () => {
          if (onOpen) onOpen();
        },
      });
    } else if (onOpen) {
      onOpen();
    }
  };

  if (!hasWebGLSupport) {
    return (
      <VintageWaxSeal
        monogram={monogram}
        dateText={dateText}
        size={size}
        variant="gold"
        onClick={onOpen}
        className={className}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={handleSealClick}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none group ${className}`}
      style={{ width: size, height: size }}
      title="Sentuh untuk Membuka Undangan"
    >
      {/* Subtle Glowing Aura */}
      <div className="absolute inset-2 rounded-full bg-[#C5A880]/20 blur-md group-hover:bg-[#C5A880]/40 transition-all pointer-events-none" />
    </div>
  );
};
