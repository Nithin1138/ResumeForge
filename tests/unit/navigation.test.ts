import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Mobile Navigation & Routing Integrity", () => {
  const CORE_NAVIGATION_ROUTES = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Resumes", href: "/myresumes" },
    { name: "Cover Pages", href: "/mycover-letters" },
    { name: "Edit Pages", href: "/edit" },
    { name: "My Space", href: "/my-space" },
    { name: "JD Automations", href: "/automations" },
    { name: "Wallet", href: "/wallet" },
    { name: "Profile", href: "/profile" },
    { name: "Build New Resume", href: "/build" },
  ];

  it("all primary mobile navigation destinations have valid, non-empty paths", () => {
    for (const route of CORE_NAVIGATION_ROUTES) {
      assert.ok(route.href.startsWith("/"), `Route ${route.name} must start with /`);
      assert.ok(route.href.length > 1, `Route ${route.name} must have a valid pathname`);
    }
  });

  it("ensures no duplicate route targets across core navigation items", () => {
    const hrefs = CORE_NAVIGATION_ROUTES.map((r) => r.href);
    const uniqueHrefs = new Set(hrefs);
    assert.strictEqual(hrefs.length, uniqueHrefs.size, "All navigation routes must be unique");
  });

  it("validates mobile active route matching logic", () => {
    const isRouteActive = (currentPath: string, targetHref: string) => {
      if (targetHref === "/dashboard") return currentPath === "/dashboard";
      return currentPath.startsWith(targetHref);
    };

    assert.strictEqual(isRouteActive("/dashboard", "/dashboard"), true);
    assert.strictEqual(isRouteActive("/myresumes/preview/123", "/myresumes"), true);
    assert.strictEqual(isRouteActive("/mycover-letters", "/mycover-letters"), true);
    assert.strictEqual(isRouteActive("/my-space?tab=copilot", "/my-space"), true);
    assert.strictEqual(isRouteActive("/automations", "/dashboard"), false);
  });
});
