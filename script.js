
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
// VOICE LOADER (SAFE)
// ========================
function getVoicesSafe() {
  return new Promise(resolve => {
    let voices = speechSynthesis.getVoices();

    if (voices.length > 0) {
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

    if (!data.translation) {
      result.innerText = "Error: " + JSON.stringify(data);
      return;
    }

    const cleanText = data.translation.replace(/^"|"$/g, "");
    result.innerText = cleanText;

    result.dataset.detectedLang = data.detectedLang || targetLang.value;

    // IMPORTANT: force speak AFTER render + voice readiness
    setTimeout(() => {
      speakText();
    }, 50);

  } catch (err) {
    console.error(err);
    result.innerText = "Request failed";
  }
}

document.getElementById("translateBtn").addEventListener("click", translateAndSpeak);

// ========================
// SPEAK FUNCTION (FIXED RELIABILITY)
// ========================
async function speakText() {
  const text = result.innerText;
  if (!text) return;

  speechSynthesis.cancel();

  const voices = await getVoicesSafe();

  const speech = new SpeechSynthesisUtterance(text);

  // rate
  speech.rate = parseFloat(speedRange.value || 1);

  // language map
  const langMap = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    pt: "pt-BR"
  };

  const lang = targetLang.value;
  speech.lang = langMap[lang] || "en-US";

  // voice selection (best effort)
  let selectedVoice =
    voices.find(v => v.name === voiceSelect.value) ||
    voices.find(v => v.lang.toLowerCase().startsWith(lang));

  if (selectedVoice) {
    speech.voice = selectedVoice;
  }

  // IMPORTANT: small delay fixes mobile bug
  setTimeout(() => {
    speechSynthesis.speak(speech);
  }, 80);
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

// init
loadVoices();
