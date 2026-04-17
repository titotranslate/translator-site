
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
// WAIT FOR VOICES (IMPORTANT FIX)
// ========================
function waitForVoices() {
  return new Promise(resolve => {
    let voices = speechSynthesis.getVoices();

    if (voices.length) {
      resolve(voices);
      return;
    }

    speechSynthesis.onvoiceschanged = () => {
      resolve(speechSynthesis.getVoices());
    };
  });
}

// ========================
// TRANSLATE FUNCTION
// ========================
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

      // store detected language
      result.dataset.detectedLang = data.detectedLang || targetLang.value;

      // auto speak (FIXED)
      speakText().catch(console.error);

    } else {
      result.innerText = "Error: " + JSON.stringify(data);
    }

  } catch (err) {
    console.error(err);
    result.innerText = "Request failed";
  }
}

document.getElementById("translateBtn").addEventListener("click", translateAndSpeak);

// ========================
// SPEAK FUNCTION (FIXED)
// ========================
async function speakText() {
  const text = result.innerText;
  if (!text) return;

  speechSynthesis.cancel();

  const voices = await waitForVoices();

  const speech = new SpeechSynthesisUtterance(text);

  // selected voice from dropdown
  let selectedVoice = voices.find(v => v.name === voiceSelect.value);

  // fallback by language
  if (!selectedVoice) {
    selectedVoice = voices.find(v =>
      v.lang.toLowerCase().startsWith(targetLang.value)
    );
  }

  if (selectedVoice) {
    speech.voice = selectedVoice;
  }

  speech.rate = parseFloat(speedRange.value || 1);

  const langMap = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    pt: "pt-BR"
  };

  speech.lang = langMap[targetLang.value] || "en-US";

  speechSynthesis.speak(speech);
}

// ========================
// VOICE SYSTEM
// ========================
function loadVoices() {
  const voices = speechSynthesis.getVoices();

  voiceSelect.innerHTML = "";

  const filteredVoices = voices.filter(voice =>
    voice.lang.toLowerCase().startsWith(targetLang.value)
  );

  const finalVoices = filteredVoices.length ? filteredVoices : voices;

  const cleanVoices = finalVoices.filter(voice => {
    const name = voice.name.toLowerCase();

    return !(
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
      name.includes("zarvox")
    );
  });

  cleanVoices.forEach(voice => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
}

// ========================
// EVENTS
// ========================
speechSynthesis.onvoiceschanged = loadVoices;

targetLang.addEventListener("change", loadVoices);

document.getElementById("speakBtn").addEventListener("click", speakText);

// initial load
loadVoices();
