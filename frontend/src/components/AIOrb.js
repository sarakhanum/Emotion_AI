import React from "react";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, useGLTF } from "@react-three/drei";

function FaceModel() {
  // simple built-in sphere-based "face style"
  return (
    <mesh>
      {/* head */}
      <sphereGeometry args={[1, 64, 64]} />

      <meshStandardMaterial
        color="#00c6ff"
        metalness={0.8}
        roughness={0.2}
        emissive="#00c6ff"
        emissiveIntensity={0.4}
      />

      {/* eyes (fake AI look) */}
      <mesh position={[-0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>

      <mesh position={[0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </mesh>
  );
}

export default function AIFace() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }}>
      <ambientLight intensity={0.8} />
      <pointLight position={[2, 2, 2]} intensity={2} />

      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <FaceModel />
      </Float>

      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}