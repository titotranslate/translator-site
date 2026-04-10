// Get DOM elements
const inputText = document.getElementById("inputText");
const result = document.getElementById("result");
const targetLang = document.getElementById("targetLang");
const voiceSelect = document.getElementById("voiceSelect");
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

      // Store detected language for speech
      result.dataset.detectedLang = data.detectedLang || targetLang.value;

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
document.getElementById("translateBtn").addEventListener("click", translateAndSpeak);
function speakText() {
  const text = result.innerText;
  if (!text) return;

  const langMap = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    pt: "pt-BR"
  };

  const detectedLang = result.dataset.detectedLang || targetLang.value;

  const speech = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  const selectedVoice =
  voices.find(v => v.lang.toLowerCase().includes(langMap[detectedLang])) ||
  voices[0];
  
  if (selectedVoice) {
  speech.voice = selectedVoice;
}
  speech.lang = langMap[detectedLang] || "en-US";

  window.speechSynthesis.speak(speech);
}
document.getElementById("speakBtn").addEventListener("click", speakText);
function loadVoices() {
    const voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = "";

    voices.forEach((voice, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

window.speechSynthesis.onvoiceschanged = () => {
  loadVoices();
};
