const inputText = document.getElementById("inputText");
const targetLang = document.getElementById("targetLang");
const result = document.getElementById("result");

// Live translation as you type
let typingTimer;
const typingDelay = 700; // milliseconds

inputText.addEventListener("input", () => {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(translateAndSpeak, typingDelay);
});

// Translate on Enter key or button click
inputText.addEventListener("keypress", e => {
  if (e.key === "Enter") translateAndSpeak();
});
document.getElementById("translateBtn").addEventListener("click", translateAndSpeak);
document.getElementById("speakBtn").addEventListener("click", speakText);

async function translateAndSpeak() {
  const text = inputText.value.trim();
  if (!text) return;

  try {
    const url = `/api/test-key?text=${encodeURIComponent(text)}&targetLang=${targetLang.value}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.translation) {
      const cleanText = data.translation.replace(/^"|"$/g, "");
      result.innerText = cleanText;
      result.dataset.detectedLang = data.detectedLang || "en";

      // Auto speak
      speakText();
    } else {
      result.innerText = "Error: " + JSON.stringify(data);
    }
  } catch (err) {
    result.innerText = "Request failed";
    console.error("Translation error:", err);
  }
}

function speakText() {
  const text = result.innerText;
  if (!text) return;

  const langMap = { en: "en-US", es: "es-ES", fr: "fr-FR", pt: "pt-BR" };
  const detectedLang = result.dataset.detectedLang || "en";

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = langMap[detectedLang] || "en-US";
  window.speechSynthesis.speak(speech);
}
