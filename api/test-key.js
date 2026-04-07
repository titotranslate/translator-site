import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "API key is missing in environment variables!",
        apiKeyExists: false,
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Get query parameters
    const text = req.query.text;
    const targetLang = req.query.targetLang;

    if (!text || !targetLang) {
      return res.status(400).json({
        message: "Missing query parameters. Please provide 'text' and 'targetLang'."
      });
    }

    // Make request to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Translate the following text to ${targetLang}: "${text}"`
        }
      ],
    });

    const translation = completion.choices[0]?.message?.content || "";

    return res.status(200).json({ translation });

  } catch (error) {
    console.error("Error in API function:", error.message);
    return res.status(500).json({
      message: "Server error occurred in translation function.",
      error: error.message,
    });
  }
}
