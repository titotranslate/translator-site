// Get DOM elements
const inputText = document.getElementById("inputText"); // your text input
const result = document.getElementById("result");       // where translation appears
const targetLang = document.getElementById("targetLang"); // the language dropdownasync function translateAndSpeak() {
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
