// /api/test-key.js
import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        message: "API key NOT found!",
        apiKeyExists: false,
      });
    }

    // Get query parameters
    const { text, targetLang } = req.query;
    if (!text || !targetLang) {
      return res.status(400).json({ message: "Missing text or targetLang" });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Send request to GPT to translate and detect language
    const prompt = `
Detect the language of the following text and translate it to ${targetLang}. 
Return JSON only in this format: {"detectedLang": "xx", "translation": "Translated text"}
Text: """${text}"""
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const resultText = completion.choices[0].message.content;

    // Parse JSON safely
    let jsonResult;
    try {
      jsonResult = JSON.parse(resultText);
    } catch (err) {
      jsonResult = { detectedLang: "unknown", translation: resultText };
    }

    return res.status(200).json({ ...jsonResult, apiKeyExists: true });
  } catch (err) {
    console.error("Function error:", err);
    return res.status(500).json({
      message: "Server error occurred in translation function.",
      error: err.message,
    });
  }
}
