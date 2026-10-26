import puppeteer from "puppeteer";
import { mkdir, writeFile } from "node:fs/promises";

const sourceUrl = "https://www.formula1.com/en/results/2024/drivers";
const dataDirectory = new URL("../data/", import.meta.url);
const outputFile = new URL("standings.json", dataDirectory);

async function main() {
  let browser;

  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const response = await page.goto(sourceUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    if (!response || !response.ok()) {
      throw new Error(
        `Stran ni dostopna (HTTP ${response?.status() ?? "neznan"}).`,
      );
    }

    await page.waitForSelector("table tbody tr td", { timeout: 30000 });

    const standings = await page.evaluate(() => {
      const expectedHeaders = ["Pos.", "Driver", "Nationality", "Team", "Pts."];
      // Tabelo prepoznamo po naslovih stolpcev, ne po spremenljivih CSS razredih.
      const table = Array.from(document.querySelectorAll("table")).find(
        (table) => {
          const headers = Array.from(
            table.querySelectorAll("thead th"),
            (cell) => cell.textContent.trim(),
          );
          return headers.join("|") === expectedHeaders.join("|");
        },
      );

      if (!table) {
        throw new Error(
          "Tabela voznikov z zahtevanimi stolpci ni bila najdena.",
        );
      }

      return Array.from(table.querySelectorAll("tbody tr"), (row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length !== 5) {
          throw new Error("Vrstica tabele nima petih stolpcev.");
        }

        // Prva dva notranja elementa vsebujeta ime in priimek, tretji pa kratico.
        const nameParts = cells[1].querySelectorAll("a > span > span");
        if (nameParts.length !== 3) {
          throw new Error("Struktura imena voznika se je spremenila.");
        }

        const positionText = cells[0].textContent.trim();
        const pointsText = cells[4].textContent.trim();
        return {
          position: positionText === "" ? NaN : Number(positionText),
          driver: `${nameParts[0].textContent} ${nameParts[1].textContent}`
            .replace(/\s+/g, " ")
            .trim(),
          nationality: cells[2].textContent.trim(),
          team: cells[3].textContent.trim(),
          points: pointsText === "" ? NaN : Number(pointsText),
        };
      });
    });

    if (standings.length === 0) {
      throw new Error(
        "Parser ni našel nobenega voznika. Obstoječa datoteka ostane ohranjena.",
      );
    }

    // Pred zapisovanjem preverimo vse vrstice, da ne shranimo nepopolnih podatkov.
    const valid = standings.every(
      (entry) =>
        Number.isInteger(entry.position) &&
        entry.position > 0 &&
        entry.driver &&
        entry.nationality &&
        entry.team &&
        Number.isFinite(entry.points) &&
        entry.points >= 0,
    );

    if (!valid) {
      throw new Error(
        "Pridobljeni podatki niso veljavni. Obstoječa datoteka ostane ohranjena.",
      );
    }

    console.table(standings);
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(
      outputFile,
      JSON.stringify(standings, null, 2) + "\n",
      "utf8",
    );
    console.log(
      `Shranjenih voznikov: ${standings.length}. Datoteka: data/standings.json`,
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main().catch((error) => {
  console.error(`Napaka parserja: ${error.message}`);
  process.exitCode = 1;
});
