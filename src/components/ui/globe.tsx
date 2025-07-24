"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { Mesh } from "three";

export function Globe() {
  return (
    <div className="w-full h-96">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Sphere args={[2, 32, 32]}>
          <meshStandardMaterial color="#3b82f6" />
        </Sphere>
        <OrbitControls enableZoom={false} autoRotate />
      </Canvas>
    </div>
  );
}

// Simplified exports for compatibility
export const World = Globe;
export const WebGLRendererConfig = () => null;
export const hexToRgb = () => ({ r: 0, g: 0, b: 0 });
export const genRandomNumbers = () => [];
