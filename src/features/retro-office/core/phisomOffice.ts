/**
 * PHISOM OFFICE LAYOUT (customização Phisom/Torque)
 *
 * Acrescenta à planta do escritório:
 *  - uma sala (com paredes + porta) por departamento;
 *  - uma secretária (desk_cubicle) por agente, com uid determinístico
 *    (`phi_desk_<agentId>`) para poder ser atribuída via deskAssignments;
 *  - a recepção, com a mesa da SARA.
 *
 * É aditivo e idempotente: se os itens já existirem, não faz nada.
 * Aplicado em `buildInitialFurnitureLayout` (RetroOffice3D).
 */
import { DOOR_LENGTH, DOOR_THICKNESS, WALL_THICKNESS } from "./constants";
import type { FurnitureItem, FurnitureSeed } from "./types";

export const PHISOM_DESK_UID_PREFIX = "phi_desk_";

export const resolvePhisomDeskUid = (agentId: string) =>
  `${PHISOM_DESK_UID_PREFIX}${agentId}`;

const ROOM_W = 380;
const ROOM_H = 400;
const COL_X = [40, 470, 900, 1330] as const;
const ROW_Y = [780, 1270] as const;
const DOOR_W = DOOR_LENGTH;
const WALL_T = WALL_THICKNESS;
const DOOR_T = DOOR_THICKNESS;

type PhisomRoom = {
  key: string;
  label: string;
  col: 0 | 1 | 2 | 3;
  row: 0 | 1;
  kind: "desks" | "reception";
  agents: string[];
};

export const PHISOM_ROOMS: readonly PhisomRoom[] = [
  { key: "recepcao", label: "Recepção", col: 0, row: 0, kind: "reception", agents: ["sara"] },
  { key: "direcao", label: "Direção & Coordenação", col: 1, row: 0, kind: "desks", agents: ["kai", "ari"] },
  { key: "tecnologia", label: "Tecnologia", col: 2, row: 0, kind: "desks", agents: ["takumi", "bob"] },
  { key: "criativo", label: "Criativo & Conteúdo", col: 3, row: 0, kind: "desks", agents: ["bungo", "eiga", "yuki"] },
  { key: "comercial", label: "Comercial & Estratégia", col: 0, row: 1, kind: "desks", agents: ["scott", "rei", "sam", "riku"] },
  { key: "financeiro", label: "Financeiro", col: 1, row: 1, kind: "desks", agents: ["yen", "fund"] },
  { key: "juridico", label: "Jurídico", col: 2, row: 1, kind: "desks", agents: ["lex"] },
  { key: "operacoes", label: "Operações & Suporte", col: 3, row: 1, kind: "desks", agents: ["hiro"] },
] as const;

/** Caixas (centro x/z em coordenadas do canvas) para as etiquetas das salas. */
export const PHISOM_ROOM_LABELS = PHISOM_ROOMS.map((room) => ({
  key: room.key,
  label: room.label,
  x: COL_X[room.col] + ROOM_W / 2,
  y: ROW_Y[room.row] + ROOM_H / 2,
}));

let seq = 0;
const seed = (item: FurnitureSeed): FurnitureSeed => item;
const withUid = (item: FurnitureSeed, uid?: string): FurnitureItem => ({
  ...item,
  _uid: uid ?? `phi_${Date.now()}_${seq++}`,
}) as FurnitureItem;

const deskCluster = (
  agentId: string,
  dx: number,
  dy: number,
): FurnitureItem[] => [
  withUid(
    seed({ type: "desk_cubicle", x: dx, y: dy, id: resolvePhisomDeskUid(agentId) }),
    resolvePhisomDeskUid(agentId),
  ),
  withUid(seed({ type: "chair", x: dx + 20, y: dy - 10, facing: 180 })),
  withUid(seed({ type: "computer", x: dx + 20, y: dy - 13 })),
  withUid(seed({ type: "keyboard", x: dx + 30, y: dy - 5 })),
  withUid(seed({ type: "mouse", x: dx + 52, y: dy - 5 })),
  withUid(seed({ type: "trash", x: dx + 74, y: dy - 8 })),
];

const roomWalls = (x0: number, y0: number): FurnitureItem[] => {
  const gapLeft = 170;
  const gapRight = gapLeft + DOOR_W;
  const rightSegW = ROOM_W - gapRight;
  return [
    withUid(seed({ type: "wall", x: x0, y: y0, w: gapLeft, h: WALL_T })),
    withUid(seed({ type: "wall", x: x0 + gapRight, y: y0, w: rightSegW, h: WALL_T })),
    withUid(seed({ type: "door", x: x0 + gapLeft, y: y0, w: DOOR_W, h: DOOR_T, facing: 0 })),
    withUid(seed({ type: "wall", x: x0, y: y0 + ROOM_H - WALL_T, w: ROOM_W, h: WALL_T })),
    withUid(seed({ type: "wall", x: x0, y: y0 + WALL_T, w: WALL_T, h: ROOM_H - WALL_T * 2 })),
    withUid(seed({ type: "wall", x: x0 + ROOM_W - WALL_T, y: y0 + WALL_T, w: WALL_T, h: ROOM_H - WALL_T * 2 })),
  ];
};

const RECEPTION_AGENT = "sara";

const buildRoom = (room: PhisomRoom): FurnitureItem[] => {
  const x0 = COL_X[room.col];
  const y0 = ROW_Y[room.row];
  const items: FurnitureItem[] = [...roomWalls(x0, y0)];

  if (room.kind === "reception") {
    // Balcão de recepção + mesa de trabalho da SARA + zona de espera.
    items.push(
      ...deskCluster(RECEPTION_AGENT, x0 + 40, y0 + 70),
      withUid(seed({ type: "executive_desk", x: x0 + 200, y: y0 + 60, facing: 0 })),
      withUid(seed({ type: "chair", x: x0 + 240, y: y0 + 40, facing: 0 })),
      withUid(seed({ type: "round_table", x: x0 + 250, y: y0 + 170, r: 42 })),
      withUid(seed({ type: "chair", x: x0 + 292, y: y0 + 170, facing: 0 })),
      withUid(seed({ type: "chair", x: x0 + 208, y: y0 + 170, facing: 180 })),
      withUid(seed({ type: "couch", x: x0 + 60, y: y0 + 300, w: 110, h: 40, facing: 0 })),
      withUid(seed({ type: "table_rect", x: x0 + 75, y: y0 + 250, w: 70, h: 30 })),
      withUid(seed({ type: "bookshelf", x: x0 + 320, y: y0 + 240, w: 40, h: 110 })),
      withUid(seed({ type: "clock", x: x0 + 190, y: y0 + 12 })),
      withUid(seed({ type: "printer", x: x0 + 300, y: y0 + 40 })),
      withUid(seed({ type: "water_cooler", x: x0 + 20, y: y0 + 180 })),
      withUid(seed({ type: "plant", x: x0 + 350, y: y0 + 360 })),
      withUid(seed({ type: "plant", x: x0 + 20, y: y0 + 20 })),
      withUid(seed({ type: "lamp", x: x0 + 180, y: y0 + 210 })),
    );
    return items;
  }

  const slots: Array<[number, number]> = [
    [x0 + 40, y0 + 70],
    [x0 + 210, y0 + 70],
    [x0 + 40, y0 + 230],
    [x0 + 210, y0 + 230],
  ];
  room.agents.forEach((agentId, index) => {
    const slot = slots[index];
    if (!slot) return;
    items.push(...deskCluster(agentId, slot[0], slot[1]));
  });

  items.push(
    withUid(seed({ type: "whiteboard", x: x0 + 14, y: y0 + 140, w: 10, h: 70 })),
    withUid(seed({ type: "plant", x: x0 + 350, y: y0 + 350 })),
    withUid(seed({ type: "lamp", x: x0 + 180, y: y0 + 340 })),
    withUid(seed({ type: "clock", x: x0 + 190, y: y0 + 12 })),
  );
  return items;
};

const buildPhisomAdditions = (): FurnitureItem[] =>
  PHISOM_ROOMS.flatMap((room) => buildRoom(room));

export const ensureOfficePhisomDepartments = (
  items: FurnitureItem[],
): FurnitureItem[] => {
  // Idempotente: basta existir a mesa da SARA.
  if (items.some((item) => item._uid === resolvePhisomDeskUid(RECEPTION_AGENT))) {
    return items;
  }
  return [...items, ...buildPhisomAdditions()];
};
