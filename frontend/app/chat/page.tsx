"use client";
import { useEffect, useRef, useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/api/chat/stream");
    wsRef.current = ws;
    ws.onmessage = (ev) => setMessages((prev) => [...prev, ev.data]);
    ws.onclose = () => setMessages((prev) => [...prev, "🔌 Disconnected"]);
    return () => ws.close();
  }, []);

  const send = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && input.trim()) {
      wsRef.current.send(input);
      setInput("");
    }
  };

  return (
    <main style={{display: "flex", flexDirection: "column", height: "100vh", padding: 16, gap: 12}}>
      <h2>Чат (локальный MVP)</h2>
      <div style={{flex: 1, overflowY: "auto", border: "1px solid #ddd", padding: 8, borderRadius: 8}}>
        {messages.map((m, i) => <div key={i} style={{marginBottom: 6}}>{m}</div>)}
      </div>
      <div style={{display: "flex", gap: 8}}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{flex: 1, padding: 8, border: "1px solid #ddd", borderRadius: 6}}
          placeholder="Напиши сообщение..."
          onKeyDown={(e) => e.key === "Enter" ? send() : null}
        />
        <button onClick={send} style={{padding: "8px 12px"}}>Отправить</button>
      </div>
    </main>
  );
}
