const form = document.querySelector("#comparison-form");
const selection = document.querySelector("#selection");
const firstSelect = document.querySelector("#first-driver");
const secondSelect = document.querySelector("#second-driver");
const typeSelect = document.querySelector("#analysis-type");
const questionInput = document.querySelector("#custom-question");
const button = document.querySelector("#analyze-button");
const status = document.querySelector("#status");
const result = document.querySelector("#result");

function updateOptions() {
  for (const option of firstSelect.options) {
    option.disabled = option.value === secondSelect.value;
  }
  for (const option of secondSelect.options) {
    option.disabled = option.value === firstSelect.value;
  }
  result.hidden = true;
  status.textContent = "";
  status.className = "";
}

async function loadDrivers() {
  try {
    const response = await fetch("/api/drivers");
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error);
    }
    for (const driver of data) {
      firstSelect.add(new Option(driver.driver, driver.driver));
      secondSelect.add(new Option(driver.driver, driver.driver));
    }
    secondSelect.selectedIndex = 1;
    updateOptions();
    selection.disabled = false;
  } catch (error) {
    status.textContent =
      error.message ||
      "Voznikov ni mogoče naložiti. Preveri povezavo s strežnikom.";
    status.className = "error";
  }
}

firstSelect.addEventListener("change", updateOptions);
secondSelect.addEventListener("change", updateOptions);
typeSelect.addEventListener("change", updateOptions);
questionInput.addEventListener("input", updateOptions);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  result.hidden = true;
  status.className = "";
  if (firstSelect.value === secondSelect.value) {
    status.textContent = "Izberi dva različna voznika.";
    status.className = "error";
    return;
  }

  selection.disabled = true;
  button.textContent = "Analiziram …";
  status.textContent = "Pripravljam AI analizo. Počakaj do 60 sekund …";
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstDriver: firstSelect.value,
        secondDriver: secondSelect.value,
        analysisType: typeSelect.value,
        customQuestion: questionInput.value.trim(),
      }),
      signal: AbortSignal.timeout(65000),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error);
    }

    // Besedilo modela vstavimo varno, brez izvajanja HTML-ja.
    document.querySelector("#result-title").textContent = data.title;
    document.querySelector("#result-summary").textContent = data.summary;
    document.querySelector("#result-driver").textContent = data.betterDriver;
    document.querySelector("#result-reason").textContent = data.reason;
    result.hidden = false;
    status.textContent = "Analiza je pripravljena.";
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      status.textContent = "Čas za odgovor je potekel. Poskusi pozneje.";
    } else if (error instanceof TypeError) {
      status.textContent =
        "Strežnik ni dosegljiv. Preveri, ali aplikacija še deluje.";
    } else {
      status.textContent = error.message || "Analize ni mogoče prikazati.";
    }
    status.className = "error";
  } finally {
    selection.disabled = false;
    button.textContent = "Analyze";
  }
});

loadDrivers();
