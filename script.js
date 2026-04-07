// Translate text using the new API
async function translateText() {
  const text = document.getElementById("inputText").value;
  const targetLang = document.getElementById("targetLang").value;

  if (!text) {
    alert("Please enter text to translate!");
    return;
  }

  try {
    const url = `/api/test-key?text=${encodeURIComponent(text)}&targetLang=${targetLang}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.translation) {
      // Remove quotes if GPT wraps text in quotes
      const cleanText = data.translation.replace(/^"|"$/g, "");
      document.getElementById("result").innerText = cleanText;

      // Save detected language for speech
      document.getElementById("result").dataset.detectedLang = data.detectedLang || "en";
    } else {
      document.getElementById("result").innerText = "Error: " + JSON.stringify(data);
    }
  } catch (err) {
    document.getElementById("result").innerText = "Request failed";
    console.error("Translation error:", err);
  }
}

// Speak the translated text using browser TTS
function speakText() {
  const text = document.getElementById("result").innerText;

  if (!text) {
    alert("Nothing to speak yet!");
    return;
  }

  const langMap = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    pt: "pt-BR"
  };

  const detectedLang = document.getElementById("result").dataset.detectedLang || "en";
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = langMap[detectedLang] || "en-US";

  window.speechSynthesis.speak(speech);
}

// Optional: press Enter to translate
document.getElementById("inputText").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    translateText();
  }
});
