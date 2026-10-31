const stationSelect = document.getElementById("station");
const periodSelect = document.getElementById("period");
const statusText = document.getElementById("status");
let weather;
let chart;

function temperature(value) {
  return value === null
    ? "Ni podatka"
    : `${value.toFixed(1).replace(".", ",")} °C`;
}

// Iz izbrane postaje in obdobja preberemo 12 mesečnih temperatur.
function updateWeather() {
  const station = Number(stationSelect.value);
  const period = Number(periodSelect.value);
  const [stations, periods, measures] = weather.dimensions;
  const start =
    (station * periods.values.length + period) * measures.values.length;
  const months = measures.values.slice(1);
  const values = months.map((_, index) => weather.values[start + index + 1]);
  const available = values.filter((value) => value !== null);

  const average = available.length
    ? available.reduce((sum, value) => sum + value, 0) / available.length
    : null;
  const maximum = available.length ? Math.max(...available) : null;
  const minimum = available.length ? Math.min(...available) : null;

  document.getElementById("average").textContent = temperature(average);
  document.getElementById("coverage").textContent =
    `${available.length} od 12 mesecev`;

  // Prikažemo tudi več mesecev, če imajo enako najvišjo/najnižjo vrednost.
  const warmest = months.filter(
    (_, i) => maximum !== null && values[i] === maximum,
  );
  const coldest = months.filter(
    (_, i) => minimum !== null && values[i] === minimum,
  );
  document.getElementById("warmest").textContent =
    maximum === null
      ? "Ni podatka"
      : `${warmest.join(", ")} · ${temperature(maximum)}`;
  document.getElementById("coldest").textContent =
    minimum === null
      ? "Ni podatka"
      : `${coldest.join(", ")} · ${temperature(minimum)}`;

  const title = `${stations.values[station]} · ${periods.values[period]}`;
  document.getElementById("chart-title").textContent = title;
  const missing = months.filter((_, i) => values[i] === null);
  statusText.textContent = missing.length
    ? `Ni podatka: ${missing.join(", ")}.`
    : "Na voljo so podatki za vseh 12 mesecev.";

  const table = document.getElementById("monthly-values");
  table.innerHTML = "";
  months.forEach((month, index) => {
    const row = document.createElement("tr");
    const name = document.createElement("th");
    const value = document.createElement("td");
    name.scope = "row";
    name.textContent = month;
    value.textContent = temperature(values[index]);
    row.append(name, value);
    table.append(row);
  });

  chart.data.labels = months;
  chart.data.datasets[0].label = `${title} (°C)`;
  chart.data.datasets[0].data = values;
  chart.update();
}

async function loadWeather() {
  try {
    const response = await fetch("/api/weather");
    if (!response.ok) throw new Error("Podatkov ni mogoče naložiti.");
    weather = await response.json();

    chart = new Chart(document.getElementById("weather-chart"), {
      type: "bar",
      data: {
        labels: [],
        datasets: [{ data: [], backgroundColor: "#286caa", borderRadius: 3 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (context) => temperature(context.raw) },
          },
        },
        scales: {
          x: { title: { display: true, text: "Meseci" } },
          y: {
            title: { display: true, text: "Temperatura (°C)" },
            beginAtZero: true,
          },
        },
      },
    });

    // Napolnimo seznama z dejanskimi vrednostmi iz datoteke .px.
    weather.dimensions[0].values.forEach((name, index) =>
      stationSelect.add(new Option(name, index)),
    );
    weather.dimensions[1].values.forEach((name, index) =>
      periodSelect.add(new Option(name, index)),
    );
    stationSelect.disabled = false;
    periodSelect.disabled = false;
    stationSelect.addEventListener("change", updateWeather);
    periodSelect.addEventListener("change", updateWeather);
    updateWeather();
  } catch (error) {
    statusText.textContent = `Napaka: ${error.message}`;
  }
}

loadWeather();
