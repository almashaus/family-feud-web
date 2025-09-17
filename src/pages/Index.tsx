import { FamilyFeudGame } from "@/components/FamilyFeudGame";
import { GameQuestion } from "@/data/questions";
import { fetchQuestionsData } from "@/services/supabaseFunctions";
import { useEffect, useState } from "react";
import useSWRImmutable from "swr";

const Index = () => {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);

  const { data, error, isLoading } = useSWRImmutable(
    "questions",
    fetchQuestionsData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    }
  );

  useEffect(() => {
    if (data) {
      const sortedData = data.map((question) => ({
        ...question,
        answers: question.answers.sort((a, b) => b.points - a.points),
      })) as GameQuestion[];
      setQuestions(sortedData);
    }
  }, [data]);

  if (error)
    return (
      <div className="container bg-gradient-bg text-center">failed to load</div>
    );
  if (isLoading)
    return (
      <div className="container bg-gradient-bg text-center">loading...</div>
    );
  if (questions && questions.length > 0) {
    return <FamilyFeudGame gameQuestions={questions} />;
  }
};

export default Index;
