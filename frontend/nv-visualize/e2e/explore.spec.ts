import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`offline Explore and evidence interactions ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/*", (route) =>
      new URL(route.request().url()).hostname === "127.0.0.1"
        ? route.continue()
        : route.abort(),
    );
    await page.goto("/");
    await expect(page.locator('[data-map-ready="true"]')).toBeVisible();
    await expect(page.locator(".demo-label")).toContainText("SYNTHETIC DATA");
    await expect(page.getByRole("region", { name: "후보 증거" })).toBeHidden();
    await expect(page.getByRole("region", { name: "탐색 도구" })).toBeHidden();
    expect(await page.locator("canvas").count()).toBeGreaterThanOrEqual(2);
    const bounds = await page
      .getByRole("region", { name: "지정학 지도" })
      .boundingBox();
    expect(bounds!.height).toBeGreaterThan(viewport.height * 0.9);
    await page.getByRole("button", { name: "Cases", exact: true }).click();
    await expect(page.locator(".candidate-row")).toHaveCount(3);
    await page.locator(".candidate-row").first().click();
    await expect(page.getByRole("region", { name: "후보 증거" })).toBeVisible();
    await expect(page.getByRole("region", { name: "후보 증거" })).toContainText(
      "INFERRED",
    );
    await page.getByRole("button", { name: "증거 고정 전환" }).click();
    await expect(page.locator(".evidence.pinned")).toBeVisible();
    const card = await page.locator(".evidence").boundingBox();
    expect(card!.x).toBeGreaterThanOrEqual(0);
    expect(card!.x + card!.width).toBeLessThanOrEqual(viewport.width);
    await page.getByRole("button", { name: "증거 고정 전환" }).click();
    await page.keyboard.press("Escape");
    await expect(page.locator(".evidence")).toBeHidden();
    await page.getByRole("button", { name: "Layers", exact: true }).click();
    await page.getByLabel("후보 관계 · INFERRED").check();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Sources", exact: true }).click();
    await expect(page.locator(".source-record")).toHaveCount(3);
    await page.keyboard.press("Escape");
    await page.getByRole("searchbox", { name: "후보 검색" }).fill("cusum");
    await page.getByRole("button", { name: "Cases", exact: true }).click();
    await expect(page.locator(".candidate-row")).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}

test("real deck cluster picking opens choices and sourced marker evidence", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('[data-map-ready="true"]')).toBeVisible();
  const bounds = await page
    .getByRole("region", { name: "지정학 지도" })
    .boundingBox();
  await page.mouse.click(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2,
  );
  await expect(page.locator(".candidate-row")).toHaveCount(3);
  await page.locator(".candidate-row").first().click();
  await expect(page.locator(".evidence")).toBeVisible();
  await page.waitForTimeout(800);
  await page.keyboard.press("Escape");
  await page.mouse.click(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2,
  );
  await expect(page.locator(".evidence")).toBeVisible();
});
