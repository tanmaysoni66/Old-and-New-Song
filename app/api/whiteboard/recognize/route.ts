import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: Request) {
  try {
    const { imageBase64, textInput, mode } = await req.json();

    // Mode 1: Text spelling correction and auto-complete
    if (mode === 'spellcheck' && textInput) {
      const prompt = `You are an intelligent spelling and math assistant for an interactive whiteboard.
Input text/word/formula: "${textInput}"
1. Detect any spelling mistakes or typos (in English or Hindi).
2. If it is a mathematical expression (e.g. "2+2", "sqrt(16)"), evaluate it cleanly.
3. Provide the clean, correctly spelled text or solved math result.

Respond in strict JSON:
{
  "correctedText": "clean spelling or math answer",
  "suggestions": ["alternative 1", "alternative 2", "alternative 3"],
  "type": "word" | "number" | "math" | "sentence"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      let raw = response.text || "";
      raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      try {
        const parsed = JSON.parse(raw);
        return NextResponse.json(parsed);
      } catch {
        return NextResponse.json({
          correctedText: textInput.trim(),
          suggestions: [textInput.trim()],
          type: "word"
        });
      }
    }

    // Mode 2: Handwriting / Drawing Recognition (OCR for Alphabets, Numbers, Words, Shapes)
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      
      const prompt = `Analyze this handwritten drawing on the whiteboard. 
Identify the alphabet (e.g. 'A', 'B', 'c'), number (e.g. '1', '7', '42'), word (e.g. 'Cat', 'School'), shape, or mathematical formula drawn.
Correct any minor stroke inaccuracies so it produces clean text.

Respond ONLY with valid JSON:
{
  "recognizedText": "the recognized alphabet, number, word, or math formula",
  "confidence": "high" | "medium",
  "type": "alphabet" | "number" | "word" | "math" | "shape",
  "shapeName": "circle" | "rectangle" | "triangle" | "arrow" | "star" | "none"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/png",
                  data: cleanBase64,
                }
              },
              {
                text: prompt
              }
            ]
          }
        ]
      });

      let raw = response.text || "";
      raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      try {
        const parsed = JSON.parse(raw);
        return NextResponse.json(parsed);
      } catch {
        return NextResponse.json({
          recognizedText: "Text",
          confidence: "medium",
          type: "word",
          shapeName: "none"
        });
      }
    }

    return NextResponse.json({ error: "Missing image or text input" }, { status: 400 });
  } catch (error: any) {
    console.error("Whiteboard AI recognize error:", error);
    return NextResponse.json({
      recognizedText: "",
      correctedText: "",
      suggestions: [],
      error: error.message || "Failed to recognize"
    });
  }
}
