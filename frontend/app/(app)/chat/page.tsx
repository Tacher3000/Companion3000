'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';

// Хук для WebSocket
function useChatSocket(url: string) {
  const [messages, setMessages] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // TODO: Добавить Bearer токен в query-параметр
    // const { accessToken } = useAuthStore.getState();
    // const socketUrl = `${url}?token=${accessToken}`;
    const socketUrl = url; // Пока без auth

    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = () => console.log('WebSocket connected');
    ws.current.onclose = () => console.log('WebSocket disconnected');

    ws.current.onmessage = (event) => {
      // Это очень упрощенная логика
      // Нам нужно парсить "AI: ..." и "User: ..."
      // и обновлять последнее сообщение AI, а не добавлять новое
      setMessages((prev) => [...prev, event.data]);
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  const sendMessage = (message: string) => {
    ws.current?.send(message);
  };

  return { messages, sendMessage };
}

export default function ChatPage() {
  const wsUrl = (process.env.NEXT_PUBLIC_API_URL || 'ws://localhost:8000')
    .replace('http', 'ws') + '/api/v1/chat/stream';

  const { messages, sendMessage } = useChatSocket(wsUrl);
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <h1 className="mb-4 text-3xl font-bold">Chat</h1>

      {/* Окно чата */}
      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 p-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-2 rounded ${msg.startsWith('AI:') ? 'text-blue-300' : 'text-green-300'}`}>
            {msg}
          </div>
        ))}
      </div>

      {/* Форма ввода */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2.5 text-center font-medium text-primaryForeground hover:bg-primary/90"
        >
          Send
        </button>
      </form>
    </div>
  );
}