
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AIDiagChat {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string | null;
  status: string;
}
export interface AIDiagMessage {
  id: string;
  chat_id: string;
  sender: string;
  message: string;
  timestamp: string;
}

export const useAIPreDiagChat = (userId?: string) => {
  // Returns existing or creates new chat for user
  const [chat, setChat] = useState<AIDiagChat | null>(null);
  const [messages, setMessages] = useState<AIDiagMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const startChat = async () => {
    if (!userId) return;
    const { data: existing } = await supabase
      .from("ai_pre_diagnostic_chats")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    if (existing) {
      setChat(existing);
      fetchMessages(existing.id);
      setLoading(false);
      return existing;
    } else {
      const { data, error } = await supabase
        .from("ai_pre_diagnostic_chats")
        .insert([{ user_id: userId }]).select().maybeSingle();
      if (!error && data) {
        setChat(data);
        setMessages([]);
      }
      setLoading(false);
      return data;
    }
  };

  const fetchMessages = async (chatId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_pre_diagnostic_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("timestamp", { ascending: true });
    if (!error && data) setMessages(data);
    setLoading(false);
  };

  const sendMessage = async (chatId: string, sender: "user" | "ai", content: string) => {
    const { data, error } = await supabase
      .from("ai_pre_diagnostic_messages")
      .insert([{ chat_id: chatId, sender, message: content }])
      .select();
    if (!error && data) setMessages((prev) => [...prev, data[0]]);
    return { data, error };
  };

  useEffect(() => {
    if (!userId) return;
    startChat();
  }, [userId]);

  return { chat, messages, loading, sendMessage, startChat, fetchMessages };
}
