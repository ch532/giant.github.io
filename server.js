import express from "express";
import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";

const app = express();
const port = 3000;

// configure Genkit instance
const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});

// define AI flow
const helloFlow = ai.defineFlow("helloFlow", async (name) => {
  const { text } = await ai.generate(`Hello Gemini, my name is ${name}`);
  return text;
});

// route for frontend
app.get("/hello", async (req, res) => {
  const name = req.query.name || "Guest";
  const reply = await helloFlow(name);
  res.json({ reply });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
