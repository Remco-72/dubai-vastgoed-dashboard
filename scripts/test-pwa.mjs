import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const executablePath = process.env.BROWSER_PATH || "/usr/bin/chromium";
const profile = await mkdtemp(join(tmpdir(), "apex-pwa-"));
const manifest = JSON.parse(await readFile("out/manifest.webmanifest", "utf8"));
const port = 3105,
  url = `http://127.0.0.1:${port}${manifest.scope}`;
const server = spawn(process.execPath, ["scripts/serve-static.mjs"], {
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = "";
server.stdout.on("data", (c) => (logs += c));
server.stderr.on("data", (c) => (logs += c));
let context,
  moved = false;
const launch = () =>
  chromium.launchPersistentContext(profile, {
    executablePath,
    headless: true,
    args: ["--no-sandbox"],
    viewport: { width: 820, height: 1180 },
    hasTouch: true,
  });
try {
  for (let i = 0; i < 100; i++) {
    if (logs.includes("ready")) break;
    if (server.exitCode !== null) throw Error(logs);
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.match(logs, /ready/);
  context = await launch();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page.getByText("Offline beschikbaar", { exact: true }).waitFor();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const fetched = await page.evaluate(async () => {
    const link = document.querySelector("link[rel=manifest]");
    return (await fetch(link.href)).json();
  });
  assert.match(await page.locator("main").innerText(), /73\.950/);
  assert.equal(fetched.display, "standalone");
  assert.equal(fetched.scope, manifest.scope);
  assert.equal(fetched.icons.length, 3);
  await page.getByRole("button", { name: "Op je iPad installeren" }).click();
  assert.match(await page.locator("main").innerText(), /Zet op beginscherm/);
  await page
    .getByRole("button", { name: "Financiële gegevens aanpassen" })
    .click();
  await page.getByLabel("Geschatte marktwaarde").fill("1300000");
  await page.getByRole("button", { name: "Gereed" }).click();
  page.on("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Huuradministratie", exact: true })
    .click();
  assert.match(await page.locator("tbody tr").first().innerText(), /5\.950/);
  assert.match(await page.locator("tbody tr").nth(1).innerText(), /8\.500/);
  await page
    .getByLabel("Ontvangstdatum termijn 1", { exact: true })
    .fill(
      new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Amsterdam" }),
    );
  assert.equal(await page.getByText("Betaald", { exact: true }).count(), 1);
  await context.setOffline(true);
  await page.reload();
  await page
    .getByText("Offline · je kunt gewoon verder werken", { exact: true })
    .waitFor();
  assert.match(await page.locator("main").innerText(), /1\.300\.000/);
  await page
    .getByRole("button", { name: "Huuradministratie", exact: true })
    .click();
  assert.equal(await page.getByText("Betaald", { exact: true }).count(), 1);
  await page.getByRole("button", { name: "Marktmonitor", exact: true }).click();
  assert.equal(
    await page.locator("table").last().locator("tbody tr").count(),
    10,
  );
  assert.match(await page.locator("main").innerText(), /80\.000/);
  assert.match(
    await page.locator("main").innerText(),
    /niet rechtstreeks geverifieerd/,
  );
  await page.getByLabel("Marktcategorie").selectOption("rent-transaction");
  assert.equal(
    await page.locator("table").last().locator("tbody tr").count(),
    5,
  );
  await page.getByLabel("Marktcategorie").selectOption("sale-transaction");
  assert.equal(
    await page.locator("table").last().locator("tbody tr").count(),
    5,
  );
  await page
    .getByRole("button", { name: "Bayut · aanbod", exact: true })
    .click();
  assert.match(
    await page.locator("table").last().innerText(),
    /Nog geen brongegevens/,
  );
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 1180 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
  }
  await page
    .getByRole("button", { name: "Bayut-advertentie vastleggen", exact: true })
    .click();
  await page
    .locator("input[name=url]")
    .fill("https://www.bayut.com/property/details-ui-test.html");
  await page.locator("input[name=unit]").fill("UI-TEST");
  await page.locator("input[name=area]").fill("900");
  await page.locator("input[name=amount]").fill("1300000");
  await page
    .getByRole("button", { name: "Opslaan met bronvermelding", exact: true })
    .click();
  await page.getByLabel("Marktcategorie").selectOption("all");
  assert.match(await page.locator("table").last().innerText(), /UI-TEST/);
  await page.getByRole("button", { name: "Archiveren", exact: true }).click();
  assert.match(await page.locator("table").last().innerText(), /Gearchiveerd/);
  await page.getByRole("button", { name: "Verwijderen", exact: true }).click();
  await page
    .getByRole("button", { name: "Kosten en rendement", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Waardeontwikkeling", exact: true })
    .click();
  await page.getByLabel("Peildatum", { exact: true }).fill("2027-11-10");
  await page.getByLabel("Waarde in AED").fill("1320000");
  await page.getByRole("button", { name: "Waarde toevoegen" }).click();
  assert.match(await page.locator("main").innerText(), /10%/);
  assert.deepEqual(errors, []);
  await context.close();
  // A fresh browser process must restore the installed app and finances offline.
  context = await launch();
  await context.setOffline(true);
  const reopened = await context.newPage();
  await reopened.goto(url);
  await reopened
    .getByText("Offline · je kunt gewoon verder werken", { exact: true })
    .waitFor();
  assert.match(await reopened.locator("main").innerText(), /1\.300\.000/);
  await reopened
    .getByRole("button", { name: "Waardeontwikkeling", exact: true })
    .click();
  assert.match(await reopened.locator("main").innerText(), /10%/);
  await context.close();
  context = null;
  // A partial download must not claim offline readiness.
  await rename("out/icon-512.png", "out/icon-512.test-backup");
  moved = true;
  const failed = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox"],
  });
  try {
    const p = await failed.newPage();
    await p.goto(url);
    await p
      .getByText(
        "Offlinegebruik nog niet beschikbaar · open de website online opnieuw",
        { exact: true },
      )
      .waitFor();
    assert.equal(
      await p.getByText("Offline beschikbaar", { exact: true }).count(),
      0,
    );
  } finally {
    await failed.close();
  }
  console.log(
    `PASS PWA ${manifest.scope}: manifest, install instructions, complete precache, offline reload, paid rent and valuations retained, all pages offline, cold browser restart offline, partial-download failure.`,
  );
} finally {
  if (context) await context.close();
  if (moved) await rename("out/icon-512.test-backup", "out/icon-512.png");
  server.kill("SIGTERM");
  await rm(profile, { recursive: true, force: true });
}
