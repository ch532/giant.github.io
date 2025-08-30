import express from "express";
import cors from "cors";
import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";

const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});

const app = express();
app.use(cors());
app.use(express.json());

// API endpoint for AI
app.post("/ask", async (req, res) => {
  const { name } = req.body;
  const { text } = await ai.generate(`Hello Gemini, my name is ${name}`);
  res.json({ reply: text });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
