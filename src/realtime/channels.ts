// Phase 5: Supabase Realtime channel setup
// Each game session gets an isolated channel keyed by session code.

import { supabase } from "@/services/supabase";

export const getGameChannel = (sessionCode: string) =>
  supabase.channel(`game:${sessionCode}`);
