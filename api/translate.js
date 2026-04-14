const SITE_API_KEY = "my-secret-key-123";
let requestCounts = {};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { text, targetLang, apiKey } = req.body;

  // 🔒 API KEY CHECK
  if (apiKey !== SITE_API_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // ❌ Missing input
  if (!text || !targetLang) {
    return res.status(400).json({ message: "Missing text or targetLang" });
  }

  // 🚫 Limit text size
  if (text.length > 500) {
    return res.status(400).json({ message: "Text too long" });
  }

  // 🚦 Rate limit
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  requestCounts[ip] = (requestCounts[ip] || 0) + 1;

  if (requestCounts[ip] > 20) {
    return res.status(429).json({ message: "Too many requests" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Translate this text to ${targetLang}: ${text}`
      })
    });

    const data = await response.json();

    return res.status(200).json({
      translatedText: data.output[0].content[0].text
    });

  } catch (error) {
    return res.status(500).json({ message: "Translation failed" });
  }
}
