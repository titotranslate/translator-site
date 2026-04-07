export default function handler(req, res) {
  res.status(200).json({
    message: "Function is working!",
    apiKeyExists: !!process.env.OPENAI_API_KEY
  });
}
