import { describe, it, expect } from "vitest";
import { buildGridBackground } from "../grid-background";

describe("buildGridBackground", () => {
  it("returns backgroundImage with two repeating-linear-gradient layers", () => {
    const result = buildGridBackground({ hourWidth: 128 });

    const gradientCount = (result.backgroundImage.match(/repeating-linear-gradient/g) ?? []).length;
    expect(gradientCount).toBe(2);
  });

  it("uses hourWidth as the gradient repeat interval", () => {
    const result = buildGridBackground({ hourWidth: 128 });

    expect(result.backgroundImage).toContain("128px");
  });

  it("places half-hour line at hourWidth / 2 offset", () => {
    const result = buildGridBackground({ hourWidth: 128 });

    expect(result.backgroundImage).toContain("64px");
  });

  it("uses custom colors when provided", () => {
    const result = buildGridBackground({
      hourWidth: 100,
      hourLineColor: "red",
      halfHourLineColor: "blue",
    });

    expect(result.backgroundImage).toContain("red");
    expect(result.backgroundImage).toContain("blue");
  });

  it("returns backgroundSize of 100% 100%", () => {
    const result = buildGridBackground({ hourWidth: 128 });

    expect(result.backgroundSize).toBe("100% 100%");
  });
});
