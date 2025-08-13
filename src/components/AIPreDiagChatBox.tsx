
import React, { useEffect, useRef, useState } from "react";
import { useAIPreDiagChat } from "@/hooks/useAIPreDiagChat";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useAIProvider } from "@/hooks/useAIProvider";
import { detectLanguageClient } from "@/utils/languageDetection";

const AIPreDiagChatBox = () => {
  const { user } = useAuth();
  const { chat, messages, loading, sendMessage, startChat } = useAIPreDiagChat(user?.id);
  const { loading: aiLoading, send } = useAIProvider();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use requestAnimationFrame for smoother scrolling without setTimeout
    requestAnimationFrame(() => {
      if (scrollRef.current)
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  }, [messages, aiLoading]);

  // Open on proactive event
  useEffect(() => {
    const onOpen = () => {
      (document.getElementById('ai-pre-diag-input') as HTMLInputElement | null)?.focus();
    };
    window.addEventListener('open-chatbot', onOpen);
    return () => window.removeEventListener('open-chatbot', onOpen);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !chat) return;
    setIsSending(true);
    const userText = input;
    await sendMessage(chat.id, "user", userText);
    setInput("");

    try {
      const lang = detectLanguageClient(userText);
      const res = await send(userText, { languageHint: lang, sessionId: chat.id });
      if (res?.response) {
        await sendMessage(chat.id, "ai", res.response);
      }
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!chat && user?.id) startChat();
  }, [chat, user, startChat]);

  return (
    <div className="border rounded p-3 max-w-md" role="region" aria-label="Chat IA pré-diagnostic">
      <h2 className="text-lg font-bold mb-2">Chat IA pré-diagnostic</h2>
      <div
        className="h-52 overflow-auto bg-gray-50 mb-2 p-2 rounded"
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
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
        {(aiLoading || isSending) && <div className="text-xs text-gray-500">L'IA rédige…</div>}
      </div>
      <div className="flex gap-2">
        <input
          id="ai-pre-diag-input"
          className="border px-2 py-1 rounded flex-1"
          placeholder="Votre question, symptôme…"
          value={input}
          onChange={e => setInput(e.target.value)}
          aria-label="Saisir votre message"
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
        />
        <Button type="button" disabled={!input.trim() || isSending || aiLoading} onClick={handleSend} aria-label="Envoyer le message">
          Envoyer
        </Button>
      </div>
    </div>
  );
};
export default AIPreDiagChatBox;
