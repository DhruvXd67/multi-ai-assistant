import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { provider, model, messages } = await request.json();

    if (!provider || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const finalMessages = messages.filter((message: { content?: string }) => typeof message.content === "string");

    if (provider === "openai") {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "OpenAI API key is missing." }, { status: 500 });
      }

      const client = new OpenAI({ apiKey });
      const completion = await client.chat.completions.create({
        model: model || "gpt-4o-mini",
        messages: finalMessages.map((message: { role: string; content: string }) => ({
          role: message.role,
          content: message.content,
        })),
      });

      const text = completion.choices[0]?.message?.content || "No response returned.";
      return NextResponse.json({ text });
    }

    if (provider === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "Gemini API key is missing." }, { status: 500 });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({ model: model || "gemini-1.5-flash" });
      const prompt = finalMessages
        .map((message: { role: string; content: string }) => `${message.role}: ${message.content}`)
        .join("\n");

      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text() || "No response returned.";
      return NextResponse.json({ text });
    }

    if (provider === "claude") {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "Anthropic API key is missing." }, { status: 500 });
      }

      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.messages.create({
        model: model || "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: finalMessages.map((message: { role: string; content: string }) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: message.content,
        })),
      });

      const text = response.content.map((part) => (part.type === "text" ? part.text : "")).join("") || "No response returned.";
      return NextResponse.json({ text });
    }

    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
