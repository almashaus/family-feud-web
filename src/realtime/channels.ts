import { supabase } from "@/services/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Each game session gets an isolated realtime channel.
// Supabase deduplicates channels by name — safe to call multiple times.
export function getGameChannel(sessionCode: string): RealtimeChannel {
  return supabase.channel(`game:${sessionCode}`);
}
