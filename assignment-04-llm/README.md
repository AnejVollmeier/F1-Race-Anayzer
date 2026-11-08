# Naloga 4 – Uporaba LLM

Preprosta spletna aplikacija primerja dva voznika sezone 2024. Node.js strežnik bere podatke neposredno iz `../assignment-02-parser/data/standings.json`; imen, ekip in točk ne podvajamo v kodi. Uporabljeni so HTML, CSS, JavaScript in vgrajeni Node.js moduli, brez dodatnih knjižnic.

## Zagon

Uporabi Node.js 24 (deluje tudi z Node.js 22.15 ali novejšim).

```bash
cd assignment-04-llm
npm install
```

Če datoteke `.env` še ni, kopiraj `.env.example` v `.env`. V lokalno datoteko vnesi svoj OpenRouter API ključ:

```text
OPENROUTER_API_KEY=tu_vnesi_svoj_kljuc
```

```bash
npm start
```

Odpri **http://localhost:3000**. Po spremembi ključa ponovno zaženi strežnik. `.env` in `node_modules` sta izključena iz Gita. Ključ uporablja samo strežnik; nikoli ga ne pošilja brskalniku ali izpisuje v terminal. Brez ključa se vozniki naložijo, analiza pa prikaže navodilo za nastavitev.

## Prompt in rezultat

Ob vsakem kliku na **Analyze** strežnik znova prebere podatke in sestavi prompt z imenoma, uvrstitvama, točkami, ekipama, izbrano vrsto analize in neobveznim lastnim vprašanjem (največ 1000 znakov). Brez vprašanja pripravi izbrano vrsto analize. Sprememba vprašanja spremeni prompt.

Ločeno sistemsko sporočilo zahteva kratko, razumljivo in slovnično pravilno knjižno slovenščino ter uporabo izrazov »uvrstitev«, »točke«, »voznik« in »ekipa«. Lastno vprašanje se pošlje kot vsebina, zapisana z `JSON.stringify()`, in ne sme spreminjati sistemskih pravil ali formata JSON. Model sme uporabljati le podane podatke in izračunane razlike. Primerjava ekip je omejena na navedene ekipe in dosežke izbranih voznikov. Če podatkov za odgovor ni (npr. za dejanski vzrok boljšega rezultata), mora to pojasniti v `summary` in `reason`, brez ugibanja.

Zahteva uporablja vgrajeni `fetch()`, endpoint `https://openrouter.ai/api/v1/chat/completions` in brezplačni usmerjevalnik **`openrouter/free`**. Ta izbira samo med razpoložljivimi brezplačnimi modeli s podporo za zahtevane funkcije, zato se dejanski model med zahtevami lahko spremeni. Plačljivih modelov in preklopa nanje ne uporabljamo. Če primernega brezplačnega modela ni na voljo, aplikacija prikaže napako. Prejšnji `qwen/qwen3.8-27b:free` je vrnil HTTP 404 s pojasnilom, da ni več na voljo brezplačno.

Ohranimo osnovni način JSON `response_format: { "type": "json_object" }`, opisan v [uradni dokumentaciji OpenRouter](https://openrouter.ai/docs/api/reference/overview#structured-outputs). [Brezplačni usmerjevalnik](https://openrouter.ai/openrouter/free) upošteva podporo za strukturirane odgovore pri izbiri modela. Zahtev ob napakah ne ponavljamo samodejno in ne odstranjujemo zahteve za JSON. Izvornih napak ponudnikov ne pošiljamo v brskalnik; uporabnik dobi razumljivo sporočilo glede na status HTTP.

Odgovor mora vsebovati štiri neprazna besedilna polja: `title`, `summary`, `betterDriver` in `reason`. Strežnik uporabi `JSON.parse()`, preveri polja in ustvari `new AnalysisResult(...)`. Preveri tudi, da je navedeni boljši voznik eden od izbranih, nato objekt vrne spletni strani. Neveljavnih ali nedokončanih odgovorov ne prikaže. Besedilo vstavi z `textContent`.

Parametra `reasoning: { "enabled": false }` ne pošiljamo: nekateri modeli imajo obvezno razmišljanje in z njim vrnejo HTTP 400 (`Reasoning is mandatory for this endpoint and cannot be disabled.`). `response_format` ostane nastavljen na `json_object`. Ob napaki strežnik v terminal izpiše status HTTP in sporočilo API-ja oziroma ponudnika, brez ključa ali glave Authorization. Brskalnik prejme samo razumljivo splošno sporočilo.

Omejitev `max_tokens` je 6000, ker v ta proračun pri nekaterih modelih šteje tudi razmišljanje. Pri prejšnji omejitvi 2000 smo prejeli nedokončan odgovor (`finish_reason: "length"`). Nedokončan odgovor se še vedno zavrne; terminal izpiše model in razlog zaključka. Zahteva ima še vedno časovno omejitev 60 sekund.

Napake pri branju podatkov, manjkajoč ključ, neveljavna izbira, zavrnjena API zahteva, nedosegljiv API in prekoračitev 60 sekund se prikažejo uporabniku. Samodejni testi niso vključeni.
