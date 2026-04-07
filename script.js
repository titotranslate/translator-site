async function translateText() {
  const text = document.getElementById("inputText").value;
  const targetLang = document.getElementById("targetLang").value;

  if (!text) {
    alert("Please enter text to translate!");
    return;
  }

  const url = `https://translator-site-x47w.vercel.app/api/test-key?text=${encodeURIComponent(text)}&targetLang=${targetLang}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.translation) {
      // Clean quotes from translation
      const cleanText = data.translation.replace(/^"|"$/g, "");
      document.getElementById("result").innerText = cleanText;
    } else {
      document.getElementById("result").innerText = "Error: " + JSON.stringify(data);
    }
  } catch (error) {
    document.getElementById("result").innerText = "Request failed";
    console.error("Translation error:", error);
  }
}

function speakText() {
  const text = document.getElementById("result").innerText;

  if (!text) {
    alert("Nothing to speak yet!");
    return;
  }

  const speech = new SpeechSynthesisUtterance(text);
  
  // Optional: set voice based on selected language
  const lang = document.getElementById("targetLang").value;
  speech.lang = lang;

  window.speechSynthesis.speak(speech);
}
