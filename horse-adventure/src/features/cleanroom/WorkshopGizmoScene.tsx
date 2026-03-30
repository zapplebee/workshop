import { Quaternion } from "three";

export function WorkshopGizmoScene({ quaternion }: { quaternion: [number, number, number, number] }) {
  return (
    <>
      <color attach="background" args={["#12233d"]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <group quaternion={new Quaternion(...quaternion)}>
        <mesh>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshStandardMaterial color="#d7e4f5" roughness={0.9} flatShading wireframe />
        </mesh>
        <mesh position={[0.95, 0, 0]}>
          <boxGeometry args={[1, 0.08, 0.08]} />
          <meshStandardMaterial color="#ff7a7a" roughness={1} flatShading />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[0.08, 1, 0.08]} />
          <meshStandardMaterial color="#7dff9a" roughness={1} flatShading />
        </mesh>
        <mesh position={[0, 0, 0.95]}>
          <boxGeometry args={[0.08, 0.08, 1]} />
          <meshStandardMaterial color="#82b7ff" roughness={1} flatShading />
        </mesh>
      </group>
    </>
  );
}
