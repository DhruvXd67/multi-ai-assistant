# Multi AI Assistant

A Next.js app that lets you chat with OpenAI, Gemini, and Claude from a single interface.

## Features

- Switch between providers
- Choose a model per provider
- Ask questions in a single chat UI
- API keys kept server-side in environment variables

## Setup

1. Install dependencies:
   npm install

2. Copy the environment file:
   cp .env.example .env.local

3. Add your API keys:
   OPENAI_API_KEY=your-key
   GEMINI_API_KEY=your-key
   ANTHROPIC_API_KEY=your-key

4. Start the app:
   npm run dev

5. Open http://localhost:3000

## Notes

- The app expects keys to be set in `.env.local`.
- If a provider key is missing, the app will return a clear error message.
