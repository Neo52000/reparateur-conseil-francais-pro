
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TimeSlot {
  id: string;
  repairer_id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export const useTimeSlots = (repairerId?: string) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = async () => {
    if (!repairerId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("repairer_id", repairerId)
      .order("start_time", { ascending: true });
    if (!error && data) setSlots(data);
    setLoading(false);
  };

  const createSlot = async (start_time: string, end_time: string) => {
    if (!repairerId) return;
    const { data, error } = await supabase.from("time_slots").insert([{ repairer_id: repairerId, start_time, end_time }]).select();
    if (!error && data) setSlots((prev) => [...prev, data[0]]);
    return { data, error };
  };

  useEffect(() => { fetchSlots(); }, [repairerId]);

  return { slots, loading, refetch: fetchSlots, createSlot };
};
