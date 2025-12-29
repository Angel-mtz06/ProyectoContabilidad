"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [questionsLeft, setQuestionsLeft] = useState(3);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!input.trim()) return;
    if (questionsLeft <= 0) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const aiMessage: Message = {
      role: "assistant",
      content:
        "Esta es una respuesta simulada de la IA contable. Más adelante será una respuesta real basada en leyes fiscales de México.",
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInput("");
    setQuestionsLeft((prev) => prev - 1);
  }

  // Manejador para enviar con la tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && questionsLeft > 0) {
      sendMessage();
    }
  };

  const isLimitReached = questionsLeft === 0;

  return (
    <main className="min-h-screen flex flex-col bg-black text-white">
      
      {/* HEADER: */}
      <header className="border-b border-gray-800 p-4 flex justify-between items-center bg-black sticky top-0 z-10">
        <div>
          <h1 className="font-bold text-lg">Chat IA Contable</h1>
          <p className="text-xs text-gray-400">Asistente fiscal automatizado</p>
        </div>
        <div className={`text-sm px-3 py-1 rounded-full font-medium ${isLimitReached ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
          {isLimitReached ? "Límite alcanzado" : `Preguntas restantes: ${questionsLeft}`}
        </div>
      </header>

      {/* ÁREA DE MENSAJES */}
      <section className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <p className="text-sm">No hay mensajes aún.</p>
            </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-xl p-3 rounded-2xl ${
              msg.role === "user"
                ? "bg-gray-800 text-white ml-auto rounded-br-none" // Usuario: Gris oscuro
                : "bg-gray-900 text-gray-200 border border-gray-800 rounded-bl-none" // IA: Negro más suave con borde
            }`}
          >
            <p className="text-[10px] font-bold opacity-50 mb-1">
                {msg.role === "user" ? "TÚ" : "IA"}
            </p>
            {msg.content}
          </div>
        ))}
        {/* Elemento invisible para empujar el scroll */}
        <div ref={messagesEndRef} />
      </section>

      {/* FOOTER: Fondo negro y input oscuro */}
      <footer className="border-t border-gray-800 p-4 flex gap-2 bg-black">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLimitReached}
          placeholder={isLimitReached ? "Límite alcanzado" : "Escribe tu pregunta contable..."}
          // Input oscuro (bg-gray-900) con texto blanco para que resalte sobre el fondo negro
          className={`flex-1 px-4 py-2 rounded border focus:outline-none focus:ring-1 focus:ring-white transition-colors ${
            isLimitReached 
                ? "bg-gray-900 text-gray-500 border-gray-800 cursor-not-allowed" 
                : "bg-gray-900 text-white border-gray-700 placeholder-gray-500"
          }`}
        />
        <button
          onClick={sendMessage}
          disabled={isLimitReached || !input.trim()}
          className={`px-4 py-2 rounded font-medium transition-colors ${
             isLimitReached || !input.trim()
             ? "bg-gray-800 text-gray-500 cursor-not-allowed"
             : "bg-white text-black hover:bg-gray-200"
          }`}
        >
          Enviar
        </button>
      </footer>
    </main>
  );
}