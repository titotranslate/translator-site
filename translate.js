export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: "Missing text or language" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Translate "${text}" to ${targetLang}`
          }
        ]
      })
    });

    const data = await response.json();

    const translation = data.choices?.[0]?.message?.content;

    res.status(200).json({ translation });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}