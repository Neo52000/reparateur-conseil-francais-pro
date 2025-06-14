
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Part {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  part_number: string | null;
  description: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
}

export const usePartsCatalog = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParts = async () => {
    const { data, error } = await supabase.from("parts_catalog").select("*").order("created_at", { ascending: false });
    if (!error && data) setParts(data);
    setLoading(false);
  };

  const createPart = async (payload: Omit<Part, "id" | "created_at">) => {
    const { data, error } = await supabase.from("parts_catalog").insert([{ ...payload }]).select();
    if (!error && data) setParts((prev) => [data[0], ...prev]);
    return { data, error };
  };

  useEffect(() => { fetchParts(); }, []);

  return { parts, loading, createPart, refetch: fetchParts };
};
