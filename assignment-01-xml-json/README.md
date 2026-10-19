# TIDS – Naloga 1: XML in JSON

Preprosta terminalska aplikacija v JavaScriptu prebere XML, filtrira rezultate Formule 1 in jih izvozi v JSON ter XML. Podatki so demonstracijski; rezultati niso uradni.

## XML datoteke

- `data/drivers.xml`: 15 voznikov z ID-jem, imenom, priimkom, številko, državo, ekipo in datumom rojstva.
- `data/races.xml`: 15 dirk z ID-jem, nazivom, dirkališčem, državo, datumom, številom krogov in dolžino.
- `data/results.xml`: 45 rezultatov z uvrstitvijo, točkami, najhitrejšim krogom in statusom. Polji `driverId` in `raceId` povezujeta rezultate z ID-ji voznikov in dirk. Prazen najhitrejši krog pomeni manjkajoč podatek.

## Namestitev in zagon

Potrebuješ Node.js 24 ali novejši. Iz korena repozitorija zaženi:

```sh
cd assignment-01-xml-json
npm install
npm start
```

Če PowerShell blokira `npm.ps1`, uporabi `npm.cmd install` in `npm.cmd start`.

## Primer uporabe

Meni omogoča prikaz voznikov (1) in dirk (2), filtriranje po vozniku (3), dirki (4) in datumu dirke (5), izvoz (6) ter izhod (7).

Za rezultate Charlesa Leclerca izberi `3`, nato vnesi `5` iz stolpca `Number`. Za dirko izberi `4`, nato na primer `8` za Monaco. Vsak filter začne s celotnim naborom rezultatov; številke v meniju se interno povežejo s pravimi XML ID-ji.

Za filter po datumu izberi `5` in vnesi `2024-03-02`. Možnost `6` shrani trenutni izbor s povezanimi podatki voznikov in dirk v `filtrirano.json` in `filtrirano.xml` v mapi naloge ter prepiše prejšnji izvoz.
