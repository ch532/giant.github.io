import express from "express";
import cors from "cors";
import OpenAI from "openai";
import features from "./features.json" assert { type: "json" };
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // keep key secret
});

app.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question required" });

    const featureList = features.map(f => `${f.feature}: ${f.description}`).join("\n");

    const prompt = `
You are a chatbot for my app. Here are the app features:
${featureList}

Answer the user's question clearly and only about the app.
User question: ${question}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
