import OpenAI from "openai";

export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: "API key missing!", apiKeyExists: false });
  }

  const openai = new OpenAI({ apiKey });

  const text = req.query.text;
  const targetLang = req.query.targetLang;

  if (!text || !targetLang) {
    return res.status(400).json({ message: "Please provide text and targetLang in query params." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Translate the following text to ${targetLang}: "${text}"`
        }
      ]
    });

    const translation = completion.choices[0].message.content;
    res.status(200).json({ translation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
