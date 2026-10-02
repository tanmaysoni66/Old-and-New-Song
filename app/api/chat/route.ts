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
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Format messages for the Gemini API
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const systemPrompt = `You are "Apex AI Guru" (अपेक्स एआई गुरु) — an expert academic mentor, doubt solver, and education counselor for Apex Coaching & Academy.
Your core expertise:
1. Academic Mastery: Physics, Chemistry, Mathematics, and Biology for JEE (Main & Advanced), NEET-UG, CBSE Class 9-12, and Olympiads.
2. Conceptual Explanations: Break down complex science/math problems into clear, step-by-step solutions with formulas, real-world examples, and memory tricks.
3. Exam Strategies: Provide timetable guidance, revision roadmaps, mock test score improvement tips, and high-weightage topic breakdowns.
4. Institute Guidance: Provide friendly advice about Apex Academy's coaching batches (JEE Super 30, NEET Conqueror, Foundation X), digital study notes catalog with dynamic Anti-Piracy Watermarking, and online mock test series.
5. Language & Tone: You can fluently answer in English, Hindi (Devanagari), or Hinglish based on what the student uses. Be encouraging, patient, intellectually rigorous, and warmly pedagogical.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI response" }, { status: 500 });
  }
}
