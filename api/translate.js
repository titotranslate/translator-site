// api/translate.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // your API key is stored in environment variable
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { text, language } = req.body;

    if (!text || !language) {
      return res.status(400).json({ error: "Missing text or language" });
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "user", content: `Translate the following text to ${language}: "${text}"` }
        ]
      });

      const translation = response.choices[0].message.content;
      res.status(200).json({ translation });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Translation failed" });
    }

  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}