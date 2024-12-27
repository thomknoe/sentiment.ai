const recordButton = document.getElementById("recordButton");
const inputText = document.getElementById("inputText");
const analyzeButton = document.getElementById("analyzeButton");
const sentimentResult = document.getElementById("sentimentResult");
const keywordsResult = document.getElementById("keywordsResult");
const designRelevanceResult = document.getElementById("designRelevanceResult");
const fullTextDisplay = document.getElementById("fullTextDisplay");
const tabsContainer = document.getElementById("tabs");
const resultsContainer = document.getElementById("resultsContainer");
let tabCounter = 0;
const noteInput = document.getElementById("noteInput");

let recognition;
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
} else {
  alert("Speech Recognition is not supported in your browser.");
}

let ellipsisInterval;
let ellipsisState = 0;

function startEllipsisAnimation() {
  ellipsisState = 0;
  ellipsisInterval = setInterval(() => {
    ellipsisState = (ellipsisState + 1) % 4;
    const ellipsis = ".".repeat(ellipsisState);
    inputText.value = `Recording in progress${ellipsis}`;
  }, 500);
}

function stopEllipsisAnimation() {
  clearInterval(ellipsisInterval);
  inputText.value = "";
}

recordButton.addEventListener("click", () => {
  if (recognition) {
    inputText.value = "Recording in progress.";
    startEllipsisAnimation();
    recognition.start();
  }
});

recognition.addEventListener("result", (event) => {
  stopEllipsisAnimation();
  const transcript = event.results[0][0].transcript;
  inputText.value = transcript;
});

function createNewTab(data, text, note) {
  tabCounter++;

  const tabButton = document.createElement("button");
  tabButton.textContent = `${note}`;
  tabButton.className = "tab-button";
  tabButton.dataset.tabId = `tab-${tabCounter}`;

  tabButton.addEventListener("click", () => {
    switchToTab(tabButton.dataset.tabId);
  });

  tabsContainer.appendChild(tabButton);

  const tabContent = document.createElement("div");
  tabContent.id = `tab-${tabCounter}`;
  tabContent.className = "tab-content";

  const emotions = data.emotions || {};
  const topEmotions = Object.entries(emotions)
    .sort(([, aScore], [, bScore]) => bScore - aScore)
    .slice(0, 5);

  const keywords = data.keywords || [];
  const highlightedText = highlightKeywords(text, keywords);

  const designRelevance = data.design_relevance || [];
  const topDesignRelevance = designRelevance
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 4);

  const designHtml = topDesignRelevance.length
    ? topDesignRelevance
        .map(
          ({ term, relevance }) => `
          <div class="design-card">
            <div class="design-card-content">
              <div class="relevance-score">${(relevance * 100).toFixed(
                0
              )}%</div>
              <div class="design-term">${term}</div>
            </div>
          </div>`
        )
        .join("")
    : "<p>No relevant design terms found</p>";

  tabContent.innerHTML = `
    <div class="full-text-container card">
    <span class="tooltip-icon" title="The KeyBERT model is used for keyword extraction. KeyBERT is based on BERT embeddings and is designed to extract keywords or keyphrases from the text using pre-trained BERT-based models.KeyBERT works by first embedding the input text into a high-dimensional vector space and then using this representation to identify key terms that are semantically important. The top n keyphrases are returned.">ⓘ</span>
      <h3>Original Text & Keywords:</h3>
      <p class="original-text">${text}</p>      
      <div class="keywords-container">
        <div class="keyword-pills">
          ${keywords
            .map(
              (keyword) =>
                `<span class="pill" data-keyword="${keyword}">${keyword}</span>`
            )
            .join("")}
        </div>
      </div>
    </div>
    <div class="sentiment-container card">
     <span class="tooltip-icon" title="The model used for emotion classification is RoBERTa (Robustly optimized BERT approach), fine-tuned for emotion detection. Specifically, it uses the model SamLowe/roberta-base-go_emotions, which is trained on the GoEmotions dataset. The model predicts the probability of the presence of 27 different emotions (like joy, anger, sadness, etc.) in the text. Each emotion has a score indicating its likelihood.">ⓘ</span>
      <h3>Sentiment Analysis:</h3>
      <div class="emotion-bars">
        ${topEmotions
          .map(
            ([emotion, score], index) =>
              `<div class="emotion-row">
                <span class="emotion-label">${capitalize(emotion)} ${Math.round(
                score * 100
              )}%</span>
                <div class="bar-container" style="background-color: black; width: 100%; height: 20px; position: relative;">
                  <div class="bar" style="width: ${Math.round(
                    score * 100
                  )}%; background-color: rgba(255,255,255,${
                1 - index * 0.2
              }); height: 100%;"></div>
                </div>
              </div>`
          )
          .join("")}
      </div>
    </div>
    <div class="design-relevance-container card">
     <span class="tooltip-icon" title="The SentenceTransformer model all-MiniLM-L6-v2 is used to obtain sentence-level embeddings for both the input text and a predefined vocabulary of design-related terms. Cosine similarity is a metric that calculates the cosine of the angle between two vectors in a vector space. A higher cosine similarity score indicates that the text and the design term are more similar.">ⓘ</span>
      <h3>Quality Scores:</h3>
      <div class="design-grid">${designHtml}</div>
    </div>
  `;

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.style.display = "none";
  });

  resultsContainer.appendChild(tabContent);
  switchToTab(tabContent.id);

  addHoverEffectToPills(keywords);
}

function switchToTab(tabId) {
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.style.display = content.id === tabId ? "block" : "none";
  });

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active-tab", button.dataset.tabId === tabId);
  });
}

function addHoverEffectToPills(keywords) {
  const pills = document.querySelectorAll(".pill");
  const originalTextElement = document.querySelector(".original-text");

  pills.forEach((pill) => {
    const keyword = pill.dataset.keyword.toLowerCase();

    pill.addEventListener("mouseover", () => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      originalTextElement.innerHTML = originalTextElement.textContent.replace(
        regex,
        (match) => `<span class="highlight">${match}</span>`
      );
    });

    pill.addEventListener("mouseout", () => {
      originalTextElement.innerHTML = originalTextElement.textContent;
    });
  });
}

analyzeButton.addEventListener("click", async () => {
  const text = inputText.value.trim();
  const note = noteInput.value.trim();
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
      createNewTab(data, text, note);
    }
  } catch (error) {
    console.error("Error during analysis:", error);
    alert("An error occurred while analyzing the text.");
  }
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function highlightKeywords(text, keywords) {
  let highlightedText = text;
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    highlightedText = highlightedText.replace(
      regex,
      `<span class="highlight">${keyword}</span>`
    );
  });
  return highlightedText;
}

function fadeInHighlights(keyword) {
  const highlights = document.querySelectorAll(".highlight");
  highlights.forEach((highlight) => {
    if (highlight.textContent.toLowerCase() === keyword.toLowerCase()) {
      highlight.style.transition = "background-color 0.3s ease";
      highlight.style.backgroundColor = "#1a73e8";
      setTimeout(() => {
        highlight.style.backgroundColor = "transparent";
      }, 600);
    }
  });
}
