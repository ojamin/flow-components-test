import { describe, expect, it, vi } from "vitest";

import { createVizStaleAsyncSetupGuard } from "@flow-builder/components/sdk/three-d";

describe("SDK Three-d stale async setup guard", () => {
  it("disposes superseded async setup results instead of accepting stale work", () => {
    const guard = createVizStaleAsyncSetupGuard();
    const firstToken = guard.begin();
    const secondToken = guard.begin();
    const staleController = { dispose: vi.fn(), id: "stale" };
    const accepted: string[] = [];

    const acceptedStale = guard.accept(firstToken, staleController, (controller) => {
      accepted.push(controller.id);
    });
    const acceptedFresh = guard.accept(
      secondToken,
      { dispose: vi.fn(), id: "fresh" },
      (controller) => {
        accepted.push(controller.id);
      },
    );

    expect(acceptedStale).toBe(false);
    expect(staleController.dispose).toHaveBeenCalledOnce();
    expect(acceptedFresh).toBe(true);
    expect(accepted).toEqual(["fresh"]);
  });

  it("invalidates the active token so late setup results cannot overwrite teardown state", () => {
    const guard = createVizStaleAsyncSetupGuard();
    const token = guard.begin();
    const controller = { dispose: vi.fn(), id: "late" };
    const accepted = vi.fn();

    expect(guard.isCurrent(token)).toBe(true);
    guard.invalidate(token);

    expect(guard.isCurrent(token)).toBe(false);
    expect(guard.accept(token, controller, accepted)).toBe(false);
    expect(controller.dispose).toHaveBeenCalledOnce();
    expect(accepted).not.toHaveBeenCalled();
  });
});
