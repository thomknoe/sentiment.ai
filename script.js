document.getElementById("analyzeButton").addEventListener("click", analyzeText);

async function analyzeText() {
  const text = document.getElementById("textInput").value;
  const outputDiv = document.getElementById("output");

  // Clear previous results
  outputDiv.innerHTML = "Analyzing...";

  try {
    const response = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Error: " + response.statusText);
    }

    const result = await response.json();

    // Display results
    outputDiv.innerHTML = `
      <h3>Sentiment</h3>
      <pre>${JSON.stringify(result.sentiment, null, 2)}</pre>
      <h3>Keywords</h3>
      <ul>${result.keywords
        .map((keyword) => `<li>${keyword}</li>`)
        .join("")}</ul>
    `;
  } catch (error) {
    outputDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
  }
}
