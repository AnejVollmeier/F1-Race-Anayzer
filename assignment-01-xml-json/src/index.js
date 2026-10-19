import { readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";

// Poti so vezane na program, zato niso odvisne od mape zagona.
const assignmentFolder = new URL("../", import.meta.url);
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});
const builder = new XMLBuilder({ format: true });

function readRecords(fileName, rootName, recordName) {
  const xml = readFileSync(
    new URL(`data/${fileName}`, assignmentFolder),
    "utf8",
  );
  if (XMLValidator.validate(xml) !== true)
    throw new Error(`Invalid XML in ${fileName}.`);
  const document = parser.parse(xml);
  if (!document[rootName] || !document[rootName][recordName]) {
    throw new Error(`Missing records in ${fileName}.`);
  }
  let records = document[rootName][recordName];
  if (!Array.isArray(records)) records = [records];

  // Atribut id postane navadna lastnost; preverimo še podvojene ID-je.
  const ids = [];
  for (const record of records) {
    if (!record.id || ids.includes(record.id)) {
      throw new Error(`Missing or duplicate ID in ${fileName}: ${record.id}`);
    }
    ids.push(record.id);
  }
  return records;
}

function showDrivers(drivers) {
  console.table(
    drivers.map((driver, index) => ({
      Number: index + 1,
      Driver: `${driver.firstName} ${driver.lastName}`,
      Team: driver.team,
      Country: driver.country,
      Car: driver.carNumber,
      BirthDate: driver.birthDate,
    })),
  );
}

function showRaces(races) {
  console.table(
    races.map((race, index) => ({
      Number: index + 1,
      Race: race.name,
      Circuit: race.circuit,
      Country: race.country,
      Date: race.date,
      Laps: race.laps,
      LengthKm: race.circuitLengthKm,
    })),
  );
}

function showResults(results) {
  console.log(`${results.length} result(s)`);
  console.table(
    results.map((result) => ({
      Driver: `${result.driver.firstName} ${result.driver.lastName}`,
      Race: result.race.name,
      Date: result.race.date,
      Position: result.position,
      Points: result.points,
    })),
  );
}

function exportResults(results) {
  // Oba formata dobita iste podatke, vključno s povezanim voznikom in dirko.
  const json = { demonstration: true, count: results.length, results };
  const xml = {
    filteredResults: {
      demonstration: true,
      count: results.length,
      results: { result: results },
    },
  };
  writeFileSync(
    new URL("filtrirano.json", assignmentFolder),
    JSON.stringify(json, null, 2) + "\n",
  );
  writeFileSync(
    new URL("filtrirano.xml", assignmentFolder),
    '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build(xml),
  );
  console.log(
    `Exported ${results.length} result(s) to filtrirano.json and filtrirano.xml.`,
  );
}

async function main() {
  // Razčlenjevalnik pretvori številska polja v števila; prazna ostanejo ''.
  const drivers = readRecords("drivers.xml", "drivers", "driver");
  const races = readRecords("races.xml", "races", "race");
  const results = readRecords("results.xml", "results", "result");

  // Zapise povežemo prek XML ID-jev, ne prek številk v meniju.
  for (const result of results) {
    result.driver = drivers.find((driver) => driver.id === result.driverId);
    result.race = races.find((race) => race.id === result.raceId);
    if (!result.driver)
      throw new Error(
        `Result ${result.id}: unknown driver ID ${result.driverId}.`,
      );
    if (!result.race)
      throw new Error(`Result ${result.id}: unknown race ID ${result.raceId}.`);
  }
  let filteredResults = results;
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log("F1 Race Analyzer - demonstration data (not official results)");
  try {
    while (true) {
      console.log(
        "\n1. All drivers\n2. All races\n3. Results by driver\n4. Results by race\n5. Results by race date\n6. Export current results\n0. Exit",
      );
      // question počaka na odgovor; trim odstrani presledke na robovih.
      const choice = (await rl.question("Choice: ")).trim();
      if (choice === "0") break;
      if (choice === "1") {
        showDrivers(drivers);
      } else if (choice === "2") {
        showRaces(races);
      } else if (choice === "3" || choice === "4") {
        let records;
        if (choice === "3") {
          showDrivers(drivers);
          records = drivers;
        } else {
          showRaces(races);
          records = races;
        }
        const answer = (
          await rl.question("Enter the number from the Number column: ")
        ).trim();
        const number = Number(answer);
        if (
          !Number.isInteger(number) ||
          number < 1 ||
          number > records.length
        ) {
          console.log(`Enter a whole number from 1 to ${records.length}.`);
          continue;
        }
        // Izbira 1 pomeni prvi zapis; pri filtru uporabimo njegov pravi ID.
        const selected = records[number - 1];
        if (choice === "3") {
          filteredResults = results.filter(
            (result) => result.driverId === selected.id,
          );
        } else {
          filteredResults = results.filter(
            (result) => result.raceId === selected.id,
          );
        }
        showResults(filteredResults);
      } else if (choice === "5") {
        const answer = (await rl.question("Race date (YYYY-MM-DD): ")).trim();
        const date = new Date(answer);
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(answer) ||
          Number.isNaN(date.getTime()) ||
          date.toISOString().slice(0, 10) !== answer
        ) {
          console.log("Enter a valid date in YYYY-MM-DD format.");
          continue;
        }
        filteredResults = results.filter(
          (result) => result.race.date === answer,
        );
        showResults(filteredResults);
      } else if (choice === "6") {
        try {
          exportResults(filteredResults);
        } catch (error) {
          console.error(`Export failed: ${error.message}`);
        }
      } else {
        console.log("Choose an option from 1 to 7.");
      }
    }
  } catch (error) {
    // Zaprt vhod ali Ctrl+C pomeni konec programa brez izpisa napake.
    if (error.code !== "ERR_USE_AFTER_CLOSE" && error.code !== "ABORT_ERR")
      throw error;
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
