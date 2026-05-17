/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { leakCounters, resetLeakDemoState } from "../state";
import { PromotionRibbon } from "./PromotionRibbon";

function mountOnceUnmount(): void {
  const shell = document.createElement("div");
  document.body.appendChild(shell);
  const root = createRoot(shell);

  act(() => {
    root.render(<PromotionRibbon campaignId="t-campaign" />);
  });

  act(() => {
    root.unmount();
  });

  shell.remove();
}

describe("PromotionRibbon guided scenario leak", () => {
  beforeEach(() => {
    resetLeakDemoState();
  });

  afterEach(() => {
    resetLeakDemoState();
  });

  test("each mount leaks one tracked listener, interval, and detached ref", () => {
    mountOnceUnmount();

    expect(leakCounters.eventListeners).toBe(1);
    expect(leakCounters.intervals).toBe(1);
    expect(leakCounters.detachedDomRegistered).toBe(1);
  });

  test("repeated mounts stack with UI open/close pattern", () => {
    const cycles = 7;
    for (let i = 0; i < cycles; i++) {
      mountOnceUnmount();
    }

    expect(leakCounters.eventListeners).toBe(cycles);
    expect(leakCounters.intervals).toBe(cycles);
    expect(leakCounters.detachedDomRegistered).toBe(cycles);
  });
});
