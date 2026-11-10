import { test, expect } from "@playwright/test";
test("switching map views retains one map canvas and accessible account controls", async ({
  page,
}) => {
  await page.route("**/*", (route) => {
    const u = new URL(route.request().url());
    if (u.hostname !== "127.0.0.1") return route.abort();
    if (u.pathname === "/api/auth/me")
      return route.fulfill({ json: { user: null, configured: true } });
    return route.continue();
  });
  await page.goto("/?case=alpha");
  await expect(page.locator('[data-map-ready="true"]')).toBeVisible();
  await expect(page.getByRole("link", { name: "GitHub 로그인" })).toBeVisible();
  await page.locator("canvas.maplibregl-canvas").evaluate((canvas) => {
    (window as any).__firstNvCanvas = canvas;
  });
  for (let i = 0; i < 2; i++) {
    await page.getByRole("link", { name: "지속 감시", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "현황", exact: true }),
    ).toBeVisible();
    await page.getByText("메뉴", { exact: true }).click();
    await page.getByRole("link", { name: "USGS Alpha", exact: true }).click();
    await expect(page.locator(".demo-label")).toContainText(
      "SOURCE-BACKED ALPHA",
    );
    expect(
      await page
        .locator("canvas.maplibregl-canvas")
        .evaluate((canvas) => canvas === (window as any).__firstNvCanvas),
    ).toBe(true);
    await expect(page.locator("canvas")).toHaveCount(1);
  }
});
