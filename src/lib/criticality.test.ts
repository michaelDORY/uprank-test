import { describe, expect, it } from "vitest";

import {
  healthCriticality,
  rateCriticality,
  signedDeltaCriticality,
} from "@/lib/criticality";

describe("criticality bands", () => {
  it("bands health scores used on the call list", () => {
    expect(healthCriticality(90)).toBe("good");
    expect(healthCriticality(70)).toBe("ok");
    expect(healthCriticality(45)).toBe("warn");
    expect(healthCriticality(20)).toBe("bad");
  });

  it("bands retention rates and ads retention gaps", () => {
    expect(rateCriticality(0.85)).toBe("good");
    expect(rateCriticality(0.4)).toBe("bad");
    expect(signedDeltaCriticality(0.08)).toBe("good");
    expect(signedDeltaCriticality(0)).toBe("neutral");
    expect(signedDeltaCriticality(-0.1)).toBe("bad");
  });
});
