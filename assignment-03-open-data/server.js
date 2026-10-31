const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { parsePx } = require("./parser");

// Datoteke, ki jih brskalnik lahko zahteva od strežnika.
const files = {
  "/": "index.html",
  "/script.js": "script.js",
  "/style.css": "style.css",
  "/chart.js": "node_modules/chart.js/dist/chart.umd.js",
  "/data/weather.px": "data/weather.px",
};

const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".px": "application/octet-stream",
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.url === "/api/weather") {
      // Ob vsakem nalaganju ponovno preberemo izvorno datoteko .px.
      const file = await fs.readFile(path.join(__dirname, "data/weather.px"));
      const text = new TextDecoder("windows-1250").decode(file);
      const weather = parsePx(text);
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(JSON.stringify(weather));
      return;
    }

    const name = files[request.url];
    if (!name) {
      response.writeHead(404);
      response.end("Stran ne obstaja.");
      return;
    }

    const content = await fs.readFile(path.join(__dirname, name));
    response.writeHead(200, {
      "Content-Type": `${types[path.extname(name)]}; charset=utf-8`,
    });
    response.end(content);
  } catch (error) {
    console.error(error.message);
    response.writeHead(500);
    response.end("Napaka pri branju podatkov.");
  }
});

const port = Number(process.env.PORT || 3000);
server.on("error", (error) => console.error(error.message));
server.listen(port, "127.0.0.1", () => {
  console.log(`Odpri http://127.0.0.1:${port}`);
});
