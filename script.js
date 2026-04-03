function translateText() {
  const text = document.getElementById("inputText").value;

  if (!text) {
    alert("Please type something!");
    return;
  }

  document.getElementById("output").innerText =
    "Translated: " + text;
}