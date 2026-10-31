// Namenski razčlenjevalnik za priloženo tabelo SURS 0156101S.
function readEntry(text, key) {
  const marker = "\n" + key + "=";
  const start = ("\n" + text).indexOf(marker);
  if (start === -1) throw new Error(`Manjka zapis ${key}.`);
  const content = ("\n" + text).slice(start + marker.length);
  return content.slice(0, content.indexOf(";")).trim();
}

function readLabels(text, key) {
  // Zapis lahko obsega več vrstic; oznake so med narekovaji.
  const entry = readEntry(text, key);
  return entry.match(/"[^"]*"/g).map((label) => label.slice(1, -1));
}

function parsePx(text) {
  const names = readLabels(text, "STUB").concat(readLabels(text, "HEADING"));
  const dimensions = names.map((name) => ({
    name,
    values: readLabels(text, `VALUES("${name}")`),
  }));

  const values = readEntry(text, "DATA")
    .split(/\s+/)
    .map((value) => {
      if (value === '"..."') return null;
      const number = Number(value);
      if (!Number.isFinite(number))
        throw new Error(`Neveljavna vrednost: ${value}`);
      return number;
    });

  // Vrstni red je postaja, obdobje, meritev; zadnja dimenzija se menja najhitreje.
  const expectedCount = dimensions.reduce(
    (count, dimension) => count * dimension.values.length,
    1,
  );
  if (values.length !== expectedCount)
    throw new Error("Število vrednosti se ne ujema z dimenzijami.");

  const metadata = {
    title: readLabels(text, "DESCRIPTION")[0],
    source: readLabels(text, "SOURCE")[0],
    units: readLabels(text, "UNITS")[0],
  };
  return { metadata, dimensions, values };
}

module.exports = { parsePx };
