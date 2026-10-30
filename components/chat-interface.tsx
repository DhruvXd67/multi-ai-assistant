"use client";

import { FormEvent, useMemo, useState } from "react";

const providers = [
  { label: "OpenAI", value: "openai", models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"] },
  { label: "Gemini", value: "gemini", models: ["gemini-1.5-flash", "gemini-1.5-pro"] },
  { label: "Claude", value: "claude", models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"] },
] as const;

type ProviderValue = (typeof providers)[number]["value"];

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatInterface() {
  const [provider, setProvider] = useState<ProviderValue>("openai");
  const [model, setModel] = useState<string>(providers[0].models[0]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I can answer questions using OpenAI, Gemini, or Claude. Choose a provider and ask anything.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const activeModels = useMemo(
    () => providers.find((entry) => entry.value === provider)?.models ?? providers[0].models,
    [provider]
  );

  const handleProviderChange = (nextProvider: ProviderValue) => {
    const nextModel = providers.find((entry) => entry.value === nextProvider)?.models[0] ?? "gpt-4o-mini";
    setProvider(nextProvider);
    setModel(nextModel);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    const nextMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model, messages: nextMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMessages([...nextMessages, { role: "assistant", content: data.text }]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "Failed to get a response.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell">
      <div className="app-card">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI Workspace</p>
            <h1>Multi AI Assistant</h1>
          </div>
          <div className="toggle-row">
            <label>
              Provider
              <select value={provider} onChange={(e) => handleProviderChange(e.target.value as ProviderValue)}>
                {providers.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Model
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                {activeModels.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <section className="chat-panel">
          {messages.map((message, idx) => (
            <div key={`${message.role}-${idx}`} className={`bubble ${message.role}`}>
              <span className="role">{message.role === "assistant" ? "Assistant" : "You"}</span>
              <p>{message.content}</p>
            </div>
          ))}
          {loading && <div className="bubble assistant loading">Generating answer…</div>}
        </section>

        <form onSubmit={handleSubmit} className="composer">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            rows={4}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </main>
  );
}
