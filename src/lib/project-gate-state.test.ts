import { describe, expect, it } from "vitest";
import { initialIdentity, projectGateState, type GateAuth, type ProjectGateRoute } from "./project-gate-state";
const memory = { projectId: "a", identity: "user:org" };
const input = (auth: GateAuth, route?: ProjectGateRoute, identity: string | null = memory.identity, projectId = "a") => ({ auth, route, identity, projectId });
describe("project gate refresh retention", () => {
  it("never opens an unverified project on first load", () => {
    expect(projectGateState(null, input("loading")).show).toBe(false);
    expect(projectGateState(null, input("authenticated")).show).toBe(false);
  });
  it("remembers only a successful authenticated access check", () => {
    expect(projectGateState(null, input("authenticated", { status: "ready", projectId: "a" }))).toEqual({ memory, show: true });
  });
  it("keeps the same authorized page mounted during token and query refresh", () => {
    expect(projectGateState(memory, input("loading"))).toEqual({ memory, show: true });
    expect(projectGateState(memory, input("authenticated"))).toEqual({ memory, show: true });
  });
  for (const auth of ["unauthenticated", "error"] as const) it(`clears on ${auth}`, () => {
    expect(projectGateState(memory, input(auth))).toEqual({ memory: null, show: false });
  });
  for (const status of ["not_found", "no_projects", "unauthenticated"] as const) it(`clears explicit ${status}`, () => {
    expect(projectGateState(memory, input("loading", { status, projectId: null }))).toEqual({ memory: null, show: false });
  });
  it("clears on logout, account/org switch, project switch and mismatched ready response", () => {
    for (const value of [input("loading", undefined, null), input("loading", undefined, "another:org"), input("loading", undefined, "user:another"), input("loading", undefined, memory.identity, "b"), input("authenticated", { status: "ready", projectId: "b" })]) expect(projectGateState(memory, value)).toEqual({ memory: null, show: false });
  });
  it("does not restore a prior grant after logout", () => {
    const revoked = projectGateState(memory, input("unauthenticated")).memory;
    expect(projectGateState(revoked, input("loading")).show).toBe(false);
  });
  it("reads initial subject only as a UI cache key, rejects malformed claims", () => {
    expect(initialIdentity(`x.${btoa(JSON.stringify({ sub: "user", org_id: "org" }))}.x`)).toBe("user:org");
    expect(initialIdentity("broken")).toBeNull();
    expect(initialIdentity(`x.${btoa('{}')}.x`)).toBeNull();
  });
});
