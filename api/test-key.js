export default async function handler(req, res) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ message: "API key NOT found!", apiKeyExists: false });
    }

    const { text, targetLang } = req.query;

    if (!text || !targetLang) {
      return res.status(400).json({ message: "Missing text or targetLang" });
    }

    // Call OpenAI API for translation & auto-detect
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey });

    const prompt = `
      Detect the language of the following text, then translate it to ${targetLang}.
      Respond in JSON format: { "detectedLang": "<detected_language_code>", "translation": "<translated_text>" }
      Text: "${text}"
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    let rawText = response.choices[0].message.content;

// Remove ```json and ``` if they exist
rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

let json;
try {
  json = JSON.parse(rawText);
} catch (err) {
  // fallback if parsing fails
  json = {
    detectedLang: "unknown",
    translation: rawText
  };
}
    return res.status(200).json({ ...json, apiKeyExists: true });

  } catch (err) {
    console.error("Translation error:", err);
    return res.status(500).json({ message: "Server error occurred in translation function.", error: err.message });
  }
}
