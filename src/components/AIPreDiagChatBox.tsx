
import React, { useEffect, useRef, useState } from "react";
import { useAIPreDiagChat } from "@/hooks/useAIPreDiagChat";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const AIPreDiagChatBox = () => {
  const { user } = useAuth();
  const { chat, messages, loading, sendMessage, startChat } = useAIPreDiagChat(user?.id);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current)
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 10);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chat) return;
    setIsSending(true);
    await sendMessage(chat.id, "user", input);
    setInput("");
    setIsSending(false);
  };

  useEffect(() => {
    if (!chat && user?.id) startChat();
  }, [chat, user]);

  return (
    <div className="border rounded p-3 max-w-md">
      <h2 className="text-lg font-bold mb-2">Chat IA pré-diagnostic</h2>
      <div className="h-52 overflow-auto bg-gray-50 mb-2 p-2 rounded" ref={scrollRef}>
        {loading ? (
          <div>Chargement…</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 text-sm ${msg.sender === "user" ? "text-right" : "text-blue-800"}`}
            >
              <span className={msg.sender === "user" ? 'bg-blue-50 px-2 py-1 rounded' : 'bg-gray-200 px-2 py-1 rounded'}>
                <b>{msg.sender === "user" ? "Moi" : "IA"}:</b> {msg.message}
              </span>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          className="border px-2 py-1 rounded flex-1"
          placeholder="Votre question, symptôme…"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <Button type="button" disabled={!input.trim() || isSending} onClick={handleSend}>
          Envoyer
        </Button>
      </div>
    </div>
  );
};
export default AIPreDiagChatBox;
