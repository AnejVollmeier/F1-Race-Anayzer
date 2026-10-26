# TIDS – Naloga 2: Parser

## Namen
Konzolni parser odpre spletno stran, prebere razpredelnico voznikov za sezono 2024 in rezultate izpiše s `console.table()`.

## Vir in podatki
Vir je [uradna stran Formule 1](https://www.formula1.com/en/results/2024/drivers). Iz dejanske HTML tabele pridobimo uvrstitev (`position`), ime in priimek (`driver`), narodnost (`nationality`), ekipo (`team`) in točke (`points`). Parser počaka na vrstice tabele in jo prepozna po naslovih stolpcev. Pri imenu izpusti ločeno kratico voznika.

## Tehnologije
JavaScript, Node.js 24 in Puppeteer 25.14.0 s pripadajočim brskalnikom Chrome.

## Namestitev in zagon
V terminalu izvedemo:

```sh
cd assignment-02-parser
npm install
npm start
```

Potrebujemo internetno povezavo; namestitev Puppeteerja prenese tudi brskalnik. Če PowerShell blokira `npm.ps1`, uporabimo `npm.cmd install` in `npm.cmd start`.

## Izhodna datoteka
`data/standings.json` vsebuje seznam objektov z vsemi petimi polji. Uvrstitev in točke sta števili. Datoteka se ob uspešnem zagonu posodobi ne glede na trenutno delovno mapo. Če parser ne najde voznikov ali pridobi neveljavne podatke, izpiše napako in obstoječe datoteke ne prepiše.
