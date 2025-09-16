import { FamilyFeudGame } from "@/components/FamilyFeudGame";
import { GameQuestion } from "@/data/questions";
import { useQuestionsStore } from "@/lib/stores/questionsStore";
import { supabase } from "@/services/supabase";
import { fetchData, fetchQuestionsData } from "@/services/supabaseFunctions";
import { useEffect, useState } from "react";
import useSWR from "swr";

interface Setting {
  id: string;
  is_game_begin: boolean;
}
const Index = () => {
  const { data, error, isLoading } = useSWR("questions", fetchQuestionsData);

  const [isGameBegin, setIsGameBegin] = useState(false);

  useEffect(() => {
    console.log("0");
    // 1️⃣ Fetch the initial value of is_game_begin
    const fetchInitialValue = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("is_game_begin")
        .eq("id", 1)
        .single();

      if (!error && data) {
        setIsGameBegin(data.is_game_begin);
      }
    };

    fetchInitialValue();

    // 2️⃣ Subscribe to changes in the settings table
    const channel = supabase
      .channel("settings-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "settings",
        },
        (payload) => {
          console.log("payload", payload.new);
          if (payload.new) {
            setIsGameBegin(payload.new.is_game_begin);
          }
        }
      )
      .subscribe((status) => {
        console.log("Channel status:", status);
      });

    // 3️⃣ Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  // Always render the game, passing the latest isGameBegin
  return <FamilyFeudGame gameQuestions={data} gameStarted={isGameBegin} />;
};

export default Index;
