"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { BILLIARD_TABLE_SURFACE_Y } from "@/features/retro-office/core/phisomFase2";
import { toWorld } from "@/features/retro-office/core/geometry";
import type { RenderAgent } from "@/features/retro-office/core/types";

const CYCLE_MS = 3600;

export function BilliardPlayFx({
  agentsRef,
}: {
  agentsRef: RefObject<RenderAgent[]>;
}) {
  const cueBallRef = useRef<THREE.Mesh>(null);
  const paperPlaneRef = useRef<THREE.Group>(null);
  const paperBallRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const cueBall = cueBallRef.current;
    const paperPlane = paperPlaneRef.current;
    const paperBall = paperBallRef.current;
    if (!cueBall || !paperPlane || !paperBall) return;

    const players = (agentsRef.current ?? [])
      .filter(
        (agent) =>
          agent.billiardUntil !== undefined &&
          agent.billiardSide !== undefined &&
          agent.state !== "walking",
      )
      .sort((left, right) => (left.billiardSide ?? 0) - (right.billiardSide ?? 0));
    const striker = players[0];
    const receiver = players[1];
    if (!striker || !receiver) {
      cueBall.visible = false;
      paperPlane.visible = false;
      paperBall.visible = false;
      return;
    }

    const [fromX, , fromZ] = toWorld(striker.x, striker.y);
    const [toX, , toZ] = toWorld(receiver.x, receiver.y);
    const phase = (Date.now() % CYCLE_MS) / CYCLE_MS;
    const shooting = phase < 0.55;

    if (shooting) {
      const t = phase / 0.55;
      const hop = Math.sin(t * Math.PI) * 0.06;
      cueBall.visible = true;
      cueBall.position.set(
        THREE.MathUtils.lerp(fromX, toX, t),
        BILLIARD_TABLE_SURFACE_Y + 0.03 + hop,
        THREE.MathUtils.lerp(fromZ, toZ, t),
      );
      paperPlane.visible = false;
      paperBall.visible = false;
      return;
    }

    cueBall.visible = false;
    const throwT = (phase - 0.55) / 0.45;
    const arc = Math.sin(throwT * Math.PI) * 0.55;
    const x = THREE.MathUtils.lerp(fromX, toX, throwT);
    const z = THREE.MathUtils.lerp(fromZ, toZ, throwT);
    const y = 0.85 + arc;
    const crumpled = throwT > 0.5;
    paperPlane.visible = !crumpled;
    paperBall.visible = crumpled;
    paperPlane.position.set(x, y, z);
    paperPlane.rotation.set(0.2, throwT * 4, 0.5);
    paperBall.position.set(x, y - arc * 0.35, z);
  });

  return (
    <group>
      <mesh ref={cueBallRef} visible={false}>
        <sphereGeometry args={[0.032, 14, 12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.28} />
      </mesh>
      <group ref={paperPlaneRef} visible={false}>
        <mesh rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.16, 0.006, 0.05]} />
          <meshStandardMaterial color="#f4efe4" roughness={0.8} />
        </mesh>
        <mesh position={[0.02, 0, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.14, 0.006, 0.045]} />
          <meshStandardMaterial color="#fffaf0" roughness={0.8} />
        </mesh>
      </group>
      <mesh ref={paperBallRef} visible={false}>
        <sphereGeometry args={[0.028, 10, 8]} />
        <meshStandardMaterial color="#f7f3ea" roughness={0.9} />
      </mesh>
    </group>
  );
}
