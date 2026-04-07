// /api/test-key.js
export default function handler(req, res) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // If the key is missing, respond safely
      return res.status(200).json({
        message: "API key NOT found!",
        apiKeyExists: false,
      });
    }

    // If the key exists
    return res.status(200).json({
      message: "API key is available!",
      apiKeyExists: true,
    });

  } catch (err) {
    // Catch any unexpected errors and return safely
    console.error("Function error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}
