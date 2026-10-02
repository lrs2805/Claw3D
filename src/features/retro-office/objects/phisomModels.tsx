"use client";

import { SCALE } from "@/features/retro-office/core/constants";
import { getItemRotationRadians, toWorld } from "@/features/retro-office/core/geometry";
import type { InteractiveFurnitureModelProps } from "@/features/retro-office/objects/types";

export const isPhisomFurnitureType = (type: string) =>
  type === "billiard" || type === "floor_patch";

const pointerHandlers = (
  itemUid: string,
  handlers: Pick<
    InteractiveFurnitureModelProps,
    "onPointerDown" | "onPointerOver" | "onPointerOut" | "onClick"
  >,
) => ({
  onPointerDown: (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    handlers.onPointerDown(itemUid);
  },
  onPointerOver: (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    handlers.onPointerOver(itemUid);
  },
  onPointerOut: (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    handlers.onPointerOut();
  },
  onClick: (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    handlers.onClick?.(itemUid);
  },
});

export function BilliardTableModel({
  item,
  isSelected,
  isHovered,
  editMode,
  onPointerDown,
  onPointerOver,
  onPointerOut,
  onClick,
}: InteractiveFurnitureModelProps) {
  const width = (item.w ?? 100) * SCALE;
  const depth = (item.h ?? 58) * SCALE;
  const [wx, , wz] = toWorld(item.x, item.y);
  const rotY = getItemRotationRadians(item);
  const highlight = isSelected ? "#fbbf24" : isHovered && editMode ? "#4a90d9" : "#000000";
  const highlightIntensity = isSelected ? 0.35 : isHovered && editMode ? 0.22 : 0;
  const topY = 0.4;
  const pockets: Array<[number, number]> = [
    [-0.46, -0.46],
    [0.46, -0.46],
    [-0.46, 0.46],
    [0.46, 0.46],
    [0, -0.48],
    [0, 0.48],
  ];
  const balls: Array<[number, number, string]> = [
    [-0.12, 0.04, "#f8fafc"],
    [0.16, -0.06, "#e11d48"],
    [0.22, 0.08, "#facc15"],
    [0.1, 0.12, "#111827"],
    [0.28, 0.02, "#2563eb"],
  ];

  return (
    <group
      position={[wx, item.elevation ?? 0, wz]}
      {...pointerHandlers(item._uid, {
        onPointerDown,
        onPointerOver,
        onPointerOut,
        onClick,
      })}
    >
      <group position={[width / 2, 0, depth / 2]} rotation={[0, rotY, 0]}>
        <mesh position={[0, topY, 0]} receiveShadow>
          <boxGeometry args={[width, 0.05, depth]} />
          <meshStandardMaterial
            color="#1f7a45"
            roughness={0.55}
            metalness={0.04}
            emissive={highlight}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>
        <mesh position={[0, topY - 0.02, 0]}>
          <boxGeometry args={[width + 0.08, 0.06, depth + 0.08]} />
          <meshStandardMaterial color="#5c3317" roughness={0.62} />
        </mesh>
        {pockets.map(([px, pz]) => (
          <mesh
            key={`${px}:${pz}`}
            position={[px * width, topY + 0.02, pz * depth]}
          >
            <sphereGeometry args={[0.045, 12, 10]} />
            <meshStandardMaterial color="#0b0d10" roughness={0.4} />
          </mesh>
        ))}
        {balls.map(([bx, bz, color]) => (
          <mesh
            key={`${bx}:${bz}:${color}`}
            position={[bx * width, topY + 0.045, bz * depth]}
          >
            <sphereGeometry args={[0.028, 12, 10]} />
            <meshStandardMaterial color={color} roughness={0.35} />
          </mesh>
        ))}
        <mesh
          position={[width * 0.18, topY + 0.05, -depth * 0.18]}
          rotation={[0.15, 0.4, Math.PI / 2.4]}
        >
          <cylinderGeometry args={[0.008, 0.012, 0.42, 8]} />
          <meshStandardMaterial color="#c4a574" roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
}

export function FloorPatchModel({ item }: { item: InteractiveFurnitureModelProps["item"] }) {
  const width = (item.w ?? 80) * SCALE;
  const depth = (item.h ?? 80) * SCALE;
  const [wx, , wz] = toWorld(item.x, item.y);
  return (
    <mesh
      position={[wx + width / 2, 0.012, wz + depth / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial
        color={item.color ?? "#1c4a32"}
        roughness={0.92}
        metalness={0.02}
      />
    </mesh>
  );
}

export function PhisomFurnitureModel(props: InteractiveFurnitureModelProps) {
  if (props.item.type === "floor_patch") {
    return <FloorPatchModel item={props.item} />;
  }
  if (props.item.type === "billiard") {
    return <BilliardTableModel {...props} />;
  }
  return null;
}
