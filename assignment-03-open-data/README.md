# Naloga 3: Odprti podatki

Aplikacija **F1 Race Analyzer – Weather Statistics** prikazuje povprečne mesečne temperature v Sloveniji. Gre za demonstracijski modul vremenske analitike, ne za meritve na dirkališčih Formule 1.

Vir je [zbirka SURS na portalu OPSI](https://podatki.gov.si/dataset/surs0156101s), tabela **0156101S**. [Izvorna datoteka PC-Axis](https://pxweb.stat.si/SiStatData/Resources/PX/Databases/Data/0156101S.PX) je shranjena v `data/weather.px`. Izvor meritev je ARSO; licenca CC BY 4.0.

Uporabljene tehnologije: JavaScript, Node.js, HTML, CSS in Chart.js. Končna aplikacija je v tej mapi: uporablja njen namenski razčlenjevalnik PC-Axis ter strežnik in brskalniško skripto iz `assignment-03-simplified`, z ohranjenim videzom grafa.

## Namestitev in zagon

Potrebujete Node.js 18 ali novejši. Iz korena projekta zaženite:

```sh
cd assignment-03-open-data
npm install
npm start
```

Odprite naslov, ki ga izpiše terminal (privzeto `http://127.0.0.1:3000`). Strežnik ustavite s Ctrl+C. Če PowerShell blokira ukaz `npm`, uporabite `npm.cmd install` in `npm.cmd start`.

## Uporaba

Izberite meteorološko postajo in leto oziroma desetletno obdobje. Podatki se ob odprtju strani preberejo iz datoteke PC-Axis, ob spremembi izbire pa se graf, tabela in statistične kartice samodejno posodobijo.

Aplikacija izračuna povprečje razpoložljivih mesečnih temperatur ter prikaže najtoplejše in najhladnejše mesece. Manjkajoče podatke označi in izpusti iz izračunov. Izračunano povprečje se lahko razlikuje od objavljene letne meritve.
