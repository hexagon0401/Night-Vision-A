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

test("Trace scenes, language, pause and Explore preserve the selected case", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('[data-map-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Trace", exact: true }).click();
  const dock = page.getByRole("region", { name: "Trace 재생" });
  await expect(dock).toBeVisible();
  await page.getByRole("button", { name: "재생 전환" }).click();
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: "재생 전환" }).click();
  const progress = await dock.getAttribute("data-progress");
  await page.waitForTimeout(250);
  expect(await dock.getAttribute("data-progress")).toBe(progress);
  await page.getByRole("button", { name: "다음 장면" }).click();
  await expect(dock).toHaveAttribute("data-step", "1");
  await page.getByRole("button", { name: "다음 장면" }).click();
  await expect(dock).toHaveAttribute("data-step", "2");
  await page.getByRole("button", { name: "이전 장면" }).click();
  await expect(dock).toHaveAttribute("data-step", "1");
  await page.getByRole("button", { name: "KO / EN" }).click();
  await expect(page.locator(".trace-subtitle")).toContainText("uncalibrated");
  await page.getByRole("button", { name: "Evidence", exact: true }).click();
  await expect(page.locator(".source-record")).not.toHaveCount(0);
  await page.keyboard.press("Escape");
  await dock.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(dock).toBeHidden();
  await expect(page.locator(".evidence")).toBeVisible();
});

test("Foundry export defaults to observed scope and downloads a real ZIP", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('[data-map-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const link = page.getByRole("link", { name: "Download Foundry CSV ZIP" });
  await expect(link).toHaveAttribute("href", "/exports/synthetic-observed.zip");
  const response = await page.request.get("/exports/synthetic-observed.zip");
  expect(response.ok()).toBe(true);
  expect((await response.body()).subarray(0, 2).toString()).toBe("PK");
  await page.getByLabel("추론·시나리오 포함").check();
  await expect(link).toHaveAttribute("href", "/exports/synthetic-all.zip");
});

test("real source-backed Alpha can be explored, traced and exported", async ({
  page,
}) => {
  await page.goto("/?case=alpha");
  await expect(page.locator('[data-map-ready="true"]')).toBeVisible();
  await expect(page.locator(".demo-label")).toContainText(
    "SOURCE-BACKED ALPHA",
  );
  await page.getByRole("button", { name: "Cases", exact: true }).click();
  expect(await page.locator(".candidate-row").count()).toBeGreaterThan(0);
  await page.locator(".candidate-row").first().click();
  await expect(page.locator(".evidence")).toBeVisible();
  await page.locator(".source-record").first().locator("summary").click();
  await expect(
    page.getByRole("link", { name: "원문 열기" }).first(),
  ).toHaveAttribute("href", /^https:\/\/earthquake.usgs.gov\//);
  await page.getByRole("button", { name: "Trace", exact: true }).click();
  await expect(page.locator(".trace-dock")).toBeVisible();
  await page
    .locator(".trace-dock")
    .getByRole("button", { name: "Explore", exact: true })
    .click();
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Download Foundry CSV ZIP" }),
  ).toHaveAttribute("href", "/exports/alpha-observed.zip");
  await page.getByText("실험실", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "사례 선택" })
    .selectOption("synthetic");
  await expect(page.locator(".demo-label")).toContainText("SYNTHETIC DATA");
});
