const recordButton = document.getElementById("recordButton");
const inputText = document.getElementById("inputText");
const analyzeButton = document.getElementById("analyzeButton");
const sentimentResult = document.getElementById("sentimentResult");
const keywordsResult = document.getElementById("keywordsResult");
const designRelevanceResult = document.getElementById("designRelevanceResult");

// Speech recognition setup
let recognition;
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-US"; // Set the language
  recognition.interimResults = false; // Only final results
} else {
  alert("Speech Recognition is not supported in your browser.");
}

// Start recording
recordButton.addEventListener("click", () => {
  if (recognition) {
    recognition.start();
    recordButton.textContent = "🎙️ Recording... Click again to stop.";
  }
});

// Stop recording and process speech
recognition?.addEventListener("result", (event) => {
  const transcript = event.results[0][0].transcript;
  inputText.value += transcript; // Append the spoken text to the textarea
  recordButton.textContent = "🎙️ Record";
});

recognition?.addEventListener("end", () => {
  recordButton.textContent = "🎙️ Record"; // Reset button text when recording stops
});

// Analyze text
analyzeButton.addEventListener("click", async () => {
  const text = inputText.value.trim();
  if (!text) {
    alert("Please enter or record text to analyze.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (data.error) {
      alert(`Error: ${data.error}`);
    } else {
      // Extract emotions
      const emotions = data.emotions || {};
      console.log("Emotions:", emotions);
      const topEmotions = Object.entries(emotions)
        .sort(([, aScore], [, bScore]) => bScore - aScore)
        .slice(0, 5);

      const emotionHtml = topEmotions.length
        ? topEmotions
            .map(
              ([emotion, score]) =>
                `<li>${emotion}: ${(score * 100).toFixed(2)}%</li>`
            )
            .join("")
        : "<li>No emotions detected</li>";

      sentimentResult.innerHTML = `<strong>Top 5 Emotions:</strong> <ul>${emotionHtml}</ul>`;

      // Extract keywords
      keywordsResult.innerHTML = `<strong>Keywords:</strong> ${
        data.keywords.length > 0
          ? data.keywords.join(", ")
          : "No keywords found."
      }`;

      // Extract design relevance
      const designRelevance = data.design_relevance || [];
      console.log(designRelevance);

      // Sort by relevance score in descending order and slice the top 4 terms
      const topDesignRelevance = designRelevance
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 4);

      // Generate HTML for the top 4 relevant terms
      const designHtml = topDesignRelevance.length
        ? topDesignRelevance
            .map(
              ({ term, relevance }) =>
                `<li>${term}: ${(relevance * 100).toFixed(2)}%</li>`
            )
            .join("")
        : "<li>No relevant design terms found</li>";

      designRelevanceResult.innerHTML = `<strong>Top 4 Design Relevance:</strong> <ul>${designHtml}</ul>`;
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred while analyzing the text.");
  }
});
