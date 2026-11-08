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
