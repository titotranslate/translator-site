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

    // OpenAI setup
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey });

    // 🔥 Improved prompt (forces clean JSON)
    const prompt = `
Detect the language and translate to ${targetLang}.

Respond ONLY with valid JSON.
No explanations.
No backticks.

Format:
{"detectedLang":"xx","translation":"text"}

Text: "${text}"
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    // 🛡️ BULLETPROOF PARSING
    let rawText = response.choices[0].message.content || "";

    // Clean formatting
    rawText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/\n/g, " ")
      .trim();

    let json;
    try {
      const match = rawText.match(/\{.*\}/);
      if (match) {
        json = JSON.parse(match[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (err) {
      // fallback (never crashes)
      json = {
        detectedLang: "unknown",
        translation: rawText
      };
    }

    return res.status(200).json({ ...json, apiKeyExists: true });

  } catch (err) {
    console.error("Translation error:", err);
    return res.status(500).json({
      message: "Server error occurred in translation function.",
      error: err.message
    });
  }
}
