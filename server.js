import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Оновлена модель: gemini-pro → gemini-1.5-flash (gemini-pro застарів і не працює)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{
                text: `Ти LUMI — дружелюбний AI-помічник з догляду за шкірою. Відповідай українською мовою, коротко та по суті. Питання: ${userMessage}`
              }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(502).json({ error: "Gemini error", details: data });
    }

    res.json({
      reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "Я трошки задумалась 🌸"
    });

  } catch (e) {
    console.error("Server error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3001, () =>
  console.log("✅ Backend running on http://localhost:3001")
);