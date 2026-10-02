import { describe, expect, it } from "vitest";
import type { RenderAgent } from "@/features/retro-office/core/types";
import {
  ensureOfficePhisomAquarium,
  ensureOfficePhisomGameRoom,
  ensureOfficePhisomMeetingScreens,
  PHISOM_AGENDA_EMBED_URL,
  PHISOM_MEETING_DAILY_URL,
  planBilliardAssignments,
} from "@/features/retro-office/core/phisomFase2";

const apply = <T extends { _uid: string }>(items: T[]) =>
  ensureOfficePhisomAquarium(
    ensureOfficePhisomMeetingScreens(ensureOfficePhisomGameRoom(items as never)),
  );

describe("phisom fase 2 layout", () => {
  it("adds the game room, screens, and aquarium once", () => {
    const first = apply([]);
    const second = apply(first);
    expect(second).toHaveLength(first.length);
    expect(first.some((item) => item.type === "billiard")).toBe(true);
    expect(first.filter((item) => item.type === "wall_screen")).toHaveLength(2);
    expect(first.some((item) => item.type === "glass_wall")).toBe(true);
    expect(first.some((item) => item.type === "couch" && item._uid === "phi_leo_couch")).toBe(true);
    expect(first.some((item) => item.type === "minigolf")).toBe(true);
    expect(PHISOM_MEETING_DAILY_URL).toContain("daily.co");
    expect(PHISOM_AGENDA_EMBED_URL).toContain("calendar.google.com");
  });

  it("sends idle agents to the billiard table and leaves working agents", () => {
    const table = apply([]).find((item) => item.type === "billiard");
    expect(table).toBeTruthy();
    const idle = (id: string, status: RenderAgent["status"]): RenderAgent =>
      ({
        id,
        name: id,
        status,
        color: "#fff",
        item: "x",
        x: 20,
        y: 20,
        targetX: 20,
        targetY: 20,
        path: [],
        facing: 0,
        frame: 0,
        walkSpeed: 0.3,
        phaseOffset: 0,
        state: status === "working" ? "sitting" : "standing",
      }) as RenderAgent;
    const plan = planBilliardAssignments(
      [idle("kai", "idle"), idle("ari", "idle"), idle("sara", "working")],
      table!,
      Date.now(),
      () => [],
    );
    expect(plan?.map((entry) => entry.id)).toEqual(["kai", "ari"]);
  });
});
