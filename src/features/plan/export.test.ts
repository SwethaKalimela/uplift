import { describe, expect, it } from "vitest";
import { toInstallCommand, toMarkdown } from "./export";

describe("plan export", () => {
  const items = [
    { name: "react", target: "19.3.1", note: "needed", status: "todo" },
    { name: "lodash", target: "4.17.21", status: "skipped" },
    { name: "zod", target: "4.6.7", status: "upgraded" },
  ];

  it("builds an install command that skips skipped packages", () => {
    expect(toInstallCommand(items)).toBe("npm install react@19.3.1 zod@4.6.7");
  });

  it("renders a checklist", () => {
    const markdown = toMarkdown("Shop upgrades", items);
    expect(markdown).toContain("# Shop upgrades");
    expect(markdown).toContain("- [ ] `react@19.3.1` — needed");
    expect(markdown).toContain("- [x] `zod@4.6.7`");
  });
});
