/** Sala Daily embutida. O Léo pode trocar pelo link real da reunião. */
export const PHISOM_MEETING_DAILY_URL =
  "https://partiuportugal.daily.co/escritorio";

/** Embed oficial do Google Calendar. Trocar `src` pelo ID do calendário. */
export const PHISOM_AGENDA_EMBED_URL =
  "https://calendar.google.com/calendar/embed?src=phisom&ctz=Europe/Lisbon";

/**
 * PHISOM OFFICE — Fase 2
 *
 * Acrescenta à planta, de forma aditiva e idempotente:
 *  - Sala de Jogos (mesa de bilhar) no canto leste, acima das salas da Fase 1.
 *  - Ecrãs de parede na zona de reunião (Daily + Agenda).
 *  - Aquário do Léo (vidro, sofá e mini-golfe), só dele.
 *
 * Os uids usam o prefixo `phi_`. Se o item sentinela já existir, não duplica.
 */
import { DOOR_LENGTH, DOOR_THICKNESS, WALL_THICKNESS } from "./constants";
import { isRemoteOfficeAgentId } from "./district";
import type { FurnitureItem, FurnitureSeed, RenderAgent } from "./types";

export const PHISOM_BILLIARD_UID = "phi_billiard";
export const PHISOM_SCREEN_DAILY_UID = "phi_screen_daily";
export const PHISOM_SCREEN_AGENDA_UID = "phi_screen_agenda";
export const PHISOM_AQUARIUM_UID = "phi_leo_couch";

export const BILLIARD_SESSION_MS = 22_000;
export const BILLIARD_COOLDOWN_MS = 70_000;
export const BILLIARD_APPROACH_SPEED = 0.48;
export const BILLIARD_TABLE_SURFACE_Y = 0.42;

const GAME_X = 1648;
const GAME_Y = 48;
const GAME_W = 140;
const GAME_H = 220;
const WALL_T = WALL_THICKNESS;
const DOOR_T = DOOR_THICKNESS;
const DOOR_W = DOOR_LENGTH;

export const PHISOM_GAME_ROOM_LABEL = {
  key: "jogos",
  label: "Sala de Jogos",
  x: GAME_X + GAME_W / 2,
  y: GAME_Y + GAME_H / 2,
};

let billiardCooldownUntil = 0;

export const billiardCooldownReady = (now: number) => now >= billiardCooldownUntil;

export const markBilliardCooldown = (now: number) => {
  billiardCooldownUntil = now + BILLIARD_COOLDOWN_MS;
};

const withUid = (item: FurnitureSeed, uid: string): FurnitureItem =>
  ({ ...item, _uid: uid }) as FurnitureItem;

const buildGameRoom = (): FurnitureItem[] => {
  const doorX = GAME_X + (GAME_W - DOOR_W) / 2;
  const southY = GAME_Y + GAME_H - WALL_T;
  const westSpan = doorX - GAME_X;
  const eastSpan = GAME_X + GAME_W - (doorX + DOOR_W);
  return [
    withUid(
      { type: "wall", x: GAME_X, y: GAME_Y, w: GAME_W, h: WALL_T },
      "phi_game_wall_n",
    ),
    withUid(
      { type: "wall", x: GAME_X, y: southY, w: westSpan, h: WALL_T },
      "phi_game_wall_s_w",
    ),
    withUid(
      {
        type: "door",
        x: doorX,
        y: southY,
        w: DOOR_W,
        h: DOOR_T,
        facing: 0,
      },
      "phi_game_door",
    ),
    withUid(
      { type: "wall", x: doorX + DOOR_W, y: southY, w: eastSpan, h: WALL_T },
      "phi_game_wall_s_e",
    ),
    withUid(
      {
        type: "wall",
        x: GAME_X,
        y: GAME_Y + WALL_T,
        w: WALL_T,
        h: GAME_H - WALL_T * 2,
      },
      "phi_game_wall_w",
    ),
    withUid(
      {
        type: "wall",
        x: GAME_X + GAME_W - WALL_T,
        y: GAME_Y + WALL_T,
        w: WALL_T,
        h: GAME_H - WALL_T * 2,
      },
      "phi_game_wall_e",
    ),
    withUid(
      {
        type: "floor_patch",
        x: GAME_X + WALL_T,
        y: GAME_Y + WALL_T,
        w: GAME_W - WALL_T * 2,
        h: GAME_H - WALL_T * 2,
        color: "#1c4a32",
      },
      "phi_game_floor",
    ),
    withUid(
      { type: "billiard", x: 1668, y: 100, w: 100, h: 58 },
      PHISOM_BILLIARD_UID,
    ),
    withUid({ type: "plant", x: 1660, y: 64 }, "phi_game_plant"),
  ];
};

export const ensureOfficePhisomGameRoom = (
  items: FurnitureItem[],
): FurnitureItem[] => {
  if (items.some((item) => item._uid === PHISOM_BILLIARD_UID)) return items;
  return [...items, ...buildGameRoom()];
};

const buildMeetingScreens = (): FurnitureItem[] => [
  withUid(
    { type: "wall_screen", x: 78, y: 10, w: 62, h: 8, facing: 0 },
    PHISOM_SCREEN_DAILY_UID,
  ),
  withUid(
    { type: "wall_screen", x: 152, y: 10, w: 62, h: 8, facing: 0 },
    PHISOM_SCREEN_AGENDA_UID,
  ),
];

export const ensureOfficePhisomMeetingScreens = (
  items: FurnitureItem[],
): FurnitureItem[] => {
  if (items.some((item) => item._uid === PHISOM_SCREEN_DAILY_UID)) return items;
  return [...items, ...buildMeetingScreens()];
};

const AQUA_X = 1648;
const AQUA_Y = 400;
const AQUA_W = 140;
const AQUA_H = 250;

export const PHISOM_AQUARIUM_LABEL = {
  key: "aquario",
  label: "Aquário do Léo",
  x: AQUA_X + AQUA_W / 2,
  y: AQUA_Y + AQUA_H / 2,
};

const buildAquarium = (): FurnitureItem[] => {
  const doorX = AQUA_X + (AQUA_W - DOOR_W) / 2;
  const southY = AQUA_Y + AQUA_H - WALL_T;
  const westSpan = doorX - AQUA_X;
  const eastSpan = AQUA_X + AQUA_W - (doorX + DOOR_W);
  return [
    withUid(
      { type: "glass_wall", x: AQUA_X, y: AQUA_Y, w: AQUA_W, h: WALL_T },
      "phi_aqua_wall_n",
    ),
    withUid(
      { type: "glass_wall", x: AQUA_X, y: southY, w: westSpan, h: WALL_T },
      "phi_aqua_wall_s_w",
    ),
    withUid(
      { type: "door", x: doorX, y: southY, w: DOOR_W, h: DOOR_T, facing: 0 },
      "phi_aqua_door",
    ),
    withUid(
      { type: "glass_wall", x: doorX + DOOR_W, y: southY, w: eastSpan, h: WALL_T },
      "phi_aqua_wall_s_e",
    ),
    withUid(
      {
        type: "glass_wall",
        x: AQUA_X,
        y: AQUA_Y + WALL_T,
        w: WALL_T,
        h: AQUA_H - WALL_T * 2,
      },
      "phi_aqua_wall_w",
    ),
    withUid(
      {
        type: "glass_wall",
        x: AQUA_X + AQUA_W - WALL_T,
        y: AQUA_Y + WALL_T,
        w: WALL_T,
        h: AQUA_H - WALL_T * 2,
      },
      "phi_aqua_wall_e",
    ),
    withUid(
      {
        type: "floor_patch",
        x: AQUA_X + WALL_T,
        y: AQUA_Y + WALL_T,
        w: AQUA_W - WALL_T * 2,
        h: AQUA_H - WALL_T * 2,
        color: "#7fd4e8",
      },
      "phi_aqua_floor",
    ),
    withUid(
      { type: "couch", x: 1664, y: 424, w: 100, h: 40, facing: 0 },
      PHISOM_AQUARIUM_UID,
    ),
    withUid(
      { type: "minigolf", x: 1676, y: 500, w: 96, h: 112 },
      "phi_minigolf",
    ),
    withUid({ type: "plant", x: 1748, y: 424 }, "phi_aqua_plant"),
  ];
};

export const ensureOfficePhisomAquarium = (
  items: FurnitureItem[],
): FurnitureItem[] => {
  if (items.some((item) => item._uid === PHISOM_AQUARIUM_UID)) return items;
  return [...items, ...buildAquarium()];
};

export type BilliardSide = 0 | 1 | 2;

export type BilliardAssignment = {
  id: string;
  patch: Partial<RenderAgent>;
};

const tableCenter = (table: FurnitureItem) => ({
  x: table.x + (table.w ?? 100) / 2,
  y: table.y + (table.h ?? 58) / 2,
});

export const resolveBilliardTargets = (
  table: FurnitureItem,
): Array<{ x: number; y: number; facing: number; side: BilliardSide }> => {
  const width = table.w ?? 100;
  const depth = table.h ?? 58;
  const centerX = Math.round((table.x + width / 2) / 10) * 10;
  return [
    { x: centerX, y: Math.round((table.y - 24) / 10) * 10, facing: 0, side: 0 },
    {
      x: centerX,
      y: Math.round((table.y + depth + 16) / 10) * 10,
      facing: Math.PI,
      side: 1,
    },
    {
      x: Math.round((table.x + 18) / 10) * 10,
      y: Math.round((table.y + depth + 28) / 10) * 10,
      facing: 0,
      side: 2,
    },
  ];
};

const isPlayableAgent = (agent: RenderAgent, now: number) => {
  if ("role" in agent && agent.role === "janitor") return false;
  if (isRemoteOfficeAgentId(agent.id)) return false;
  if (agent.status !== "idle") return false;
  if (agent.state === "sitting" || agent.state === "working_out") return false;
  if (agent.pingPongUntil !== undefined && agent.pingPongUntil > now) return false;
  if (agent.interactionTarget) return false;
  return true;
};

export const planBilliardAssignments = (
  agents: readonly RenderAgent[],
  table: FurnitureItem,
  now: number,
  planPath: (
    sx: number,
    sy: number,
    tx: number,
    ty: number,
  ) => { x: number; y: number }[],
): BilliardAssignment[] | null => {
  const targets = resolveBilliardTargets(table);
  const active = agents
    .filter(
      (agent) =>
        agent.billiardTableUid === table._uid &&
        (agent.billiardUntil ?? 0) > now,
    )
    .sort((left, right) => (left.billiardSide ?? 0) - (right.billiardSide ?? 0));
  const pool =
    active.length >= 2
      ? active.slice(0, 3)
      : agents
          .filter(
            (agent) =>
              isPlayableAgent(agent, now) &&
              (agent.billiardUntil === undefined || agent.billiardUntil <= now),
          )
          .sort((left, right) => {
            const center = tableCenter(table);
            const leftDistance = Math.hypot(left.x - center.x, left.y - center.y);
            const rightDistance = Math.hypot(right.x - center.x, right.y - center.y);
            return leftDistance - rightDistance;
          })
          .slice(0, 3);
  if (pool.length < 2) return null;

  const chosen = pool.slice(0, Math.min(3, targets.length));
  return chosen.map((agent, index) => {
    const target = targets[index];
    if (!target) {
      return { id: agent.id, patch: {} };
    }
    const partner = chosen[index === 0 ? 1 : 0];
    return {
      id: agent.id,
      patch: {
        targetX: target.x,
        targetY: target.y,
        path: planPath(agent.x, agent.y, target.x, target.y),
        facing: target.facing,
        state: "walking",
        walkSpeed: Math.max(agent.walkSpeed, BILLIARD_APPROACH_SPEED),
        billiardUntil: now + BILLIARD_SESSION_MS,
        billiardTargetX: target.x,
        billiardTargetY: target.y,
        billiardFacing: target.facing,
        billiardPartnerId: partner?.id,
        billiardTableUid: table._uid,
        billiardSide: target.side,
        billiardPreviousWalkSpeed:
          agent.billiardPreviousWalkSpeed ?? agent.walkSpeed,
      },
    };
  });
};

export const clearBilliardHold = (agent: RenderAgent): Partial<RenderAgent> => ({
  walkSpeed: agent.billiardPreviousWalkSpeed ?? agent.walkSpeed,
  billiardUntil: undefined,
  billiardTargetX: undefined,
  billiardTargetY: undefined,
  billiardFacing: undefined,
  billiardPartnerId: undefined,
  billiardTableUid: undefined,
  billiardSide: undefined,
  billiardPreviousWalkSpeed: undefined,
  targetX: agent.x,
  targetY: agent.y,
  path: [],
  state: "standing",
});

/** Tentativa espontânea, com cooldown. Devolve os agentes atualizados ou null. */
export const maybeStartBilliardSession = (
  agents: RenderAgent[],
  furniture: readonly FurnitureItem[],
  now: number,
  planPath: (
    sx: number,
    sy: number,
    tx: number,
    ty: number,
  ) => { x: number; y: number }[],
): RenderAgent[] | null => {
  if (!billiardCooldownReady(now)) return null;
  if (Math.random() >= 0.0008) return null;
  if (agents.some((agent) => (agent.billiardUntil ?? 0) > now)) return null;
  const table = furniture.find((item) => item._uid === PHISOM_BILLIARD_UID);
  if (!table) return null;
  const assignments = planBilliardAssignments(agents, table, now, planPath);
  if (!assignments) return null;
  markBilliardCooldown(now);
  const byId = new Map(assignments.map((entry) => [entry.id, entry.patch]));
  return agents.map((agent) => {
    const patch = byId.get(agent.id);
    return patch ? ({ ...agent, ...patch } as RenderAgent) : agent;
  });
};
