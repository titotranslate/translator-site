// ========================
// DOM ELEMENTS
// ========================
const inputText = document.getElementById("inputText");
const result = document.getElementById("result");
const targetLang = document.getElementById("targetLang");
const voiceSelect = document.getElementById("voiceSelect");
const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");

// ========================
// SPEED DISPLAY
// ========================
speedRange.addEventListener("input", () => {
  speedValue.innerText = speedRange.value;
});

// ========================
// TRANSLATE
// ========================
async function translateAndSpeak() {
  const text = inputText.value.trim();
  if (!text) return;

  try {
    const url = `/api/test-key?text=${encodeURIComponent(text)}&targetLang=${targetLang.value}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.translation) {
      result.innerText = "Error: " + JSON.stringify(data);
      return;
    }

    const cleanText = data.translation.replace(/^"|"$/g, "");
    result.innerText = cleanText;

    result.dataset.detectedLang = data.detectedLang || targetLang.value;

    // speak immediately (NO DELAYS, NO PROMISES)
    speakText();

  } catch (err) {
    console.error(err);
    result.innerText = "Request failed";
  }
}

document.getElementById("translateBtn").addEventListener("click", translateAndSpeak);

// ========================
// SPEAK (SIMPLE + STABLE)
// ========================
function speakText() {
  const text = result.innerText;
  if (!text) return;

  speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  const langMap = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    pt: "pt-BR"
  };

  const lang = targetLang.value;
  speech.lang = langMap[lang] || "en-US";

  speech.rate = parseFloat(speedRange.value || 1);

  const voices = speechSynthesis.getVoices();

  let selectedVoice =
    voices.find(v => v.name === voiceSelect.value) ||
    voices.find(v => v.lang.toLowerCase().startsWith(lang));

  if (selectedVoice) {
    speech.voice = selectedVoice;
  }

  speechSynthesis.speak(speech);
}

// ========================
// VOICES
// ========================
function loadVoices() {
  const voices = speechSynthesis.getVoices();

  voiceSelect.innerHTML = "";

  const filtered = voices.filter(v =>
    v.lang.toLowerCase().startsWith(targetLang.value)
  );

  const list = filtered.length ? filtered : voices;

  list.forEach(v => {
    const option = document.createElement("option");
    option.value = v.name;
    option.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(option);
  });
}

// ========================
// EVENTS
// ========================
speechSynthesis.onvoiceschanged = loadVoices;

targetLang.addEventListener("change", loadVoices);

document.getElementById("speakBtn").addEventListener("click", speakText);

// init
loadVoices();
