import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";

export type PresenceRole = "host" | "board";

interface PresenceInfo {
  boardCount: number;
  hostOnline: boolean;
}

// Tracks live presence on a dedicated channel (separate from the postgres_changes channel).
// Each client announces its role; all clients receive join/leave/sync updates.
export function usePresence(
  sessionCode: string | null,
  role: PresenceRole
): PresenceInfo {
  const [info, setInfo] = useState<PresenceInfo>({
    boardCount: 0,
    hostOnline: false,
  });

  useEffect(() => {
    if (!sessionCode) return;

    const channel = supabase.channel(`presence:${sessionCode}`, {
      config: { presence: { key: crypto.randomUUID() } },
    });

    const sync = () => {
      const state = channel.presenceState<{ role: PresenceRole }>();
      const all = Object.values(state).flat();
      setInfo({
        boardCount: all.filter((p) => p.role === "board").length,
        hostOnline: all.some((p) => p.role === "host"),
      });
    };

    channel
      .on("presence", { event: "sync" }, sync)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ role });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionCode, role]);

  return info;
}
