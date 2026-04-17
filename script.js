
// ========================
// STEP 1 — UNLOCK SPEECH
// ========================
function unlockSpeech() {
  const utter = new SpeechSynthesisUtterance(" ");
  utter.volume = 0;
  speechSynthesis.speak(utter);
  speechSynthesis.cancel();
}

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
// STEP 2 — TRANSLATE FUNCTION
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

    // STEP 3 — speak immediately (NO DELAYS, NO CANCEL CHAINS)
    speakText();

  } catch (err) {
    console.error(err);
    result.innerText = "Request failed";
  }
}

// ========================
// TRANSLATE BUTTON (STEP 2 FIX)
// ========================
document.getElementById("translateBtn").addEventListener("click", () => {
  unlockSpeech();          // MUST run first
  translateAndSpeak();     // then translate + speak
});

// ========================
// SPEAK FUNCTION (STABLE)
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
// VOICE SYSTEM (FILTERED)
// ========================
function loadVoices() {
  const voices = speechSynthesis.getVoices();

  voiceSelect.innerHTML = "";

  const lang = targetLang.value;

  const filtered = voices.filter(v => {
    const name = v.name.toLowerCase();
    const langMatch = v.lang.toLowerCase().startsWith(lang);

    const isBadVoice =
      name.includes("wobble") ||
      name.includes("bubbles") ||
      name.includes("organ") ||
      name.includes("whisper") ||
      name.includes("echo") ||
      name.includes("albert") ||
      name.includes("bad news") ||
      name.includes("bahh") ||
      name.includes("bells") ||
      name.includes("boing") ||
      name.includes("cellos") ||
      name.includes("good news") ||
      name.includes("jester") ||
      name.includes("superstar") ||
      name.includes("trinoids") ||
      name.includes("zarvox");

    return langMatch && !isBadVoice;
  });

  filtered.forEach(v => {
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

// INIT
loadVoices();
