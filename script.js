async function translateText() {
  const text = document.getElementById("inputText").value;
  const targetLang = document.getElementById("targetLang").value;

  if (!text) {
    alert("Please enter text");
    return;
  }

  const url = `https://translator-site-x47w.vercel.app/api/test-key?text=${encodeURIComponent(text)}&targetLang=${targetLang}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.translation) {
      document.getElementById("result").innerText = data.translation;
    } else {
      document.getElementById("result").innerText = "Error: " + JSON.stringify(data);
    }
  } catch (error) {
    document.getElementById("result").innerText = "Request failed";
  }
}
