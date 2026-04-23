import { memo, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? true;
}

function getLowPowerMode() {
  const cores = navigator?.hardwareConcurrency || 4;
  const mem = navigator?.deviceMemory || 4;
  return cores <= 4 || mem <= 4;
}

const OrbField = memo(function OrbField({ lowPower }) {
  const settings = useMemo(() => {
    if (lowPower) return { distort: 0.16, speed: 1.0, count: 2 };
    return { distort: 0.28, speed: 1.6, count: 3 };
  }, [lowPower]);

  const orbs = Array.from({ length: settings.count }).map((_, i) => {
    const x = i === 0 ? -1.4 : i === 1 ? 1.3 : 0.2;
    const y = i === 0 ? 0.6 : i === 1 ? -0.7 : 1.05;
    const z = i === 0 ? -1.2 : i === 1 ? -1.6 : -2.0;
    const scale = i === 0 ? 1.1 : i === 1 ? 0.9 : 0.7;
    return { x, y, z, scale, key: i };
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 2, 2]} intensity={1.1} />
      <pointLight position={[-2, 1.5, -1]} intensity={1.4} color="#00e5ff" />
      <pointLight position={[2.2, -1.2, -1.6]} intensity={1.2} color="#00ffa8" />

      {orbs.map((o) => (
        <Float
          key={o.key}
          speed={settings.speed}
          rotationIntensity={0.7}
          floatIntensity={0.9}
        >
          <Sphere position={[o.x, o.y, o.z]} args={[1, 48, 48]} scale={o.scale}>
            <MeshDistortMaterial
              color={o.key === 1 ? "#00ffa8" : "#00e5ff"}
              emissive={o.key === 1 ? "#00ffa8" : "#00e5ff"}
              emissiveIntensity={0.35}
              roughness={0.15}
              metalness={0.55}
              distort={settings.distort}
              speed={settings.speed}
              transparent
              opacity={0.9}
            />
          </Sphere>
        </Float>
      ))}
    </>
  );
});

export default function AuthHeroScene() {
  const reduced = prefersReducedMotion();
  const lowPower = useMemo(() => getLowPowerMode(), []);
  if (reduced) return null;

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={lowPower ? [1, 1.2] : [1, 1.8]}
        gl={{ antialias: !lowPower, alpha: true, powerPreference: lowPower ? "low-power" : "high-performance" }}
        camera={{ position: [0, 0, 3.2], fov: 54 }}
      >
        <OrbField lowPower={lowPower} />
      </Canvas>
      {/* Soft mask / vignette for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream-50/20 via-transparent to-cream-50/55" />
    </div>
  );
}

