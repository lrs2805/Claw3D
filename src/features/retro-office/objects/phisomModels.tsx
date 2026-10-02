"use client";

import { Html, Text } from "@react-three/drei";
import { useState } from "react";
import { SCALE } from "@/features/retro-office/core/constants";
import { getItemRotationRadians, toWorld } from "@/features/retro-office/core/geometry";
import {
  PHISOM_AGENDA_EMBED_URL,
  PHISOM_MEETING_DAILY_URL,
  PHISOM_SCREEN_AGENDA_UID,
  PHISOM_SCREEN_DAILY_UID,
} from "@/features/retro-office/core/phisomFase2";
import type { InteractiveFurnitureModelProps } from "@/features/retro-office/objects/types";

export const isPhisomFurnitureType = (type: string) =>
  type === "billiard" ||
  type === "floor_patch" ||
  type === "wall_screen" ||
  type === "glass_wall" ||
  type === "minigolf";

const WALL_SCREENS: Record<string, { title: string; url: string; accent: string }> = {
  [PHISOM_SCREEN_DAILY_UID]: {
    title: "Daily",
    url: PHISOM_MEETING_DAILY_URL,
    accent: "#1d4ed8",
  },
  [PHISOM_SCREEN_AGENDA_UID]: {
    title: "Agenda",
    url: PHISOM_AGENDA_EMBED_URL,
    accent: "#0f766e",
  },
};

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

function ScreenFallback({ title, url }: { title: string; url: string }) {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-[#101820] p-3 text-left text-white">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
          Ecrã de parede
        </p>
        <p className="mt-1 text-sm font-semibold">{title}</p>
        <p className="mt-2 text-[11px] leading-snug text-white/70">
          O embed não abriu aqui (o site pode bloquear iframes). O escritório continua intacto.
        </p>
      </div>
      <p className="truncate text-[10px] text-sky-200/80">{url}</p>
    </div>
  );
}

function WallScreenEmbed({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [blocked, setBlocked] = useState(false);

  return (
    <div className="h-[168px] w-[280px] overflow-hidden rounded-md border border-white/15 bg-[#0b1118] shadow-lg">
      {blocked ? (
        <ScreenFallback title={title} url={url} />
      ) : (
        <iframe
          title={title}
          src={url}
          className="h-full w-full border-0 bg-[#0b1118]"
          referrerPolicy="no-referrer"
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          onError={() => setBlocked(true)}
          onLoad={(event) => {
            const frame = event.currentTarget;
            window.setTimeout(() => {
              try {
                const href = frame.contentWindow?.location.href ?? "";
                if (!href || href === "about:blank") setBlocked(true);
              } catch {
                // Documento cross-origin: o embed carregou.
              }
            }, 1200);
          }}
        />
      )}
    </div>
  );
}

export function WallScreenModel({
  item,
  isSelected,
  isHovered,
  editMode,
  onPointerDown,
  onPointerOver,
  onPointerOut,
  onClick,
}: InteractiveFurnitureModelProps) {
  const screen = WALL_SCREENS[item._uid] ?? {
    title: "Ecrã",
    url: PHISOM_MEETING_DAILY_URL,
    accent: "#334155",
  };
  const width = (item.w ?? 62) * SCALE;
  const depth = (item.h ?? 8) * SCALE;
  const [wx, , wz] = toWorld(item.x, item.y);
  const rotY = getItemRotationRadians(item);
  const highlight = isSelected ? "#fbbf24" : isHovered && editMode ? "#4a90d9" : "#000000";

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
        <mesh position={[0, 0.78, 0]}>
          <boxGeometry args={[width, 0.72, 0.04]} />
          <meshStandardMaterial color="#1c2430" roughness={0.55} emissive={highlight} emissiveIntensity={isSelected ? 0.25 : 0} />
        </mesh>
        <mesh position={[0, 0.78, 0.025]}>
          <boxGeometry args={[width * 0.9, 0.56, 0.01]} />
          <meshStandardMaterial color={screen.accent} emissive={screen.accent} emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[0.03, 0.28, 0.03]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
        <Html
          transform
          position={[0, 0.78, 0.04]}
          distanceFactor={1.15}
          zIndexRange={[40, 0]}
          style={{ pointerEvents: "auto" }}
        >
          <WallScreenEmbed title={screen.title} url={screen.url} />
        </Html>
      </group>
    </group>
  );
}

export function GlassWallModel({
  item,
}: {
  item: InteractiveFurnitureModelProps["item"];
}) {
  const width = (item.w ?? 80) * SCALE;
  const depth = Math.max((item.h ?? 8) * SCALE, 0.04);
  const [wx, , wz] = toWorld(item.x, item.y);
  const rotY = getItemRotationRadians(item);
  return (
    <group position={[wx + width / 2, 0, wz + depth / 2]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[width, 1, depth]} />
        <meshStandardMaterial
          color="#d9f7ff"
          transparent
          opacity={0.34}
          roughness={0.05}
          metalness={0.12}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.98, 0]}>
        <boxGeometry args={[width, 0.03, depth + 0.01]} />
        <meshStandardMaterial color="#8ec9d6" roughness={0.4} />
      </mesh>
    </group>
  );
}

export function MinigolfModel({
  item,
  isSelected,
  isHovered,
  editMode,
  onPointerDown,
  onPointerOver,
  onPointerOut,
  onClick,
}: InteractiveFurnitureModelProps) {
  const width = (item.w ?? 96) * SCALE;
  const depth = (item.h ?? 112) * SCALE;
  const [wx, , wz] = toWorld(item.x, item.y);
  const holes = [-0.32, 0, 0.32];
  const flags = ["#e11d48", "#facc15", "#2563eb"];

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
      <group position={[width / 2, 0, depth / 2]}>
        <mesh position={[0, 0.025, 0]} receiveShadow>
          <boxGeometry args={[width, 0.04, depth]} />
          <meshStandardMaterial
            color={isSelected ? "#86efac" : "#3f9d55"}
            roughness={0.86}
            emissive={isHovered && editMode ? "#4a90d9" : "#000000"}
            emissiveIntensity={isHovered && editMode ? 0.2 : 0}
          />
        </mesh>
        {holes.map((offset, index) => (
          <group key={offset} position={[offset * width, 0.05, (index - 1) * depth * 0.22]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.045, 16]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
            <mesh position={[0.03, 0.16, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.28, 8]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[0.07, 0.26, 0]}>
              <boxGeometry args={[0.08, 0.045, 0.008]} />
              <meshStandardMaterial color={flags[index] ?? "#e11d48"} />
            </mesh>
          </group>
        ))}
        <mesh position={[width * 0.28, 0.08, depth * 0.28]} rotation={[0.2, 0.4, 1.1]}>
          <cylinderGeometry args={[0.008, 0.01, 0.42, 8]} />
          <meshStandardMaterial color="#d6d3d1" metalness={0.45} roughness={0.35} />
        </mesh>
        <mesh position={[width * 0.36, 0.03, depth * 0.34]}>
          <boxGeometry args={[0.09, 0.015, 0.025]} />
          <meshStandardMaterial color="#e7e5e4" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[-width * 0.2, 0.04, depth * 0.1]}>
          <sphereGeometry args={[0.02, 12, 10]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <Text
          position={[0, 0.22, -depth * 0.42]}
          fontSize={0.07}
          color="#0f3a4a"
          anchorX="center"
          anchorY="middle"
        >
          SÓ DO LÉO
        </Text>
      </group>
    </group>
  );
}

export function PhisomFurnitureModel(props: InteractiveFurnitureModelProps) {
  if (props.item.type === "floor_patch") {
    return <FloorPatchModel item={props.item} />;
  }
  if (props.item.type === "billiard") {
    return <BilliardTableModel {...props} />;
  }
  if (props.item.type === "wall_screen") {
    return <WallScreenModel {...props} />;
  }
  if (props.item.type === "glass_wall") {
    return <GlassWallModel item={props.item} />;
  }
  if (props.item.type === "minigolf") {
    return <MinigolfModel {...props} />;
  }
  return null;
}
