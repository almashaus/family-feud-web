import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, Save, ArrowLeft, PlusIcon } from "lucide-react";
import useSWR, { mutate } from "swr";
import { Link } from "react-router-dom";
import { deleteData, fetchQuestionsData } from "@/services/supabaseFunctions";
import { GameQuestion } from "@/data/questions";

interface Answer {
  text: string;
  points: number;
}

const ViewQuestions = () => {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);

  const { data, error, isLoading } = useSWR("questions", fetchQuestionsData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  });

  useEffect(() => {
    if (data) {
      const sortedQuestions = data.sort((a, b) => a.id - b.id);
      const sortedData = sortedQuestions.map((question) => ({
        ...question,
        answers: question.answers.sort((a, b) => b.points - a.points),
      })) as GameQuestion[];
      setQuestions(sortedData);
    }
  }, [data]);

  const handleDeleteQuestion = async (id: number) => {
    const isDeleted = await deleteData("questions", "question_number", id);
    if (isDeleted) {
      await mutate("questions");
    }
  };

  if (error) return <div className="container text-center">failed to load</div>;
  if (isLoading) return <div className="container text-center">loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-bg sparkle-bg relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Card className="mx-auto bg-gradient-board border-gold-border border-8 md:p-6 shadow-board max-w-2xl w-full">
          <CardHeader className="flex flex-row justify-between">
            <div className="mb-6">
              <Link to="/">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={4} />
                </Button>
              </Link>
            </div>
            <CardTitle className="text-3xl font-bold text-secondary">
              View Questions
            </CardTitle>
            {/* Add Button */}
            <div className="flex justify-center">
              <Link to="/host/add-question">
                <Button variant="gold" className="">
                  <PlusIcon className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="space-y-12">
            {questions?.map((item, index) => (
              <div key={index}>
                {/* Question */}
                <div className="flex flex-row justify-between bg-gradient-primary border-gold-border border-4 rounded-lg mb-4 p-4 space-x-1 shadow-board text-xl font-semibold">
                  <div className="flex">
                    <div className="bg-secondary flex flex-row justify-center rounded-full w-8 h-8 me-2 text-xl font-semibold">
                      {item.id}
                    </div>
                    <span style={{ whiteSpace: "pre-line" }}>
                      {item.question.replace(" - ", "\n")}{" "}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleDeleteQuestion(item.id)}
                    variant="strike"
                    size="sm"
                    className="border-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Answers */}
                <div className="bg-gradient-board border-gold-border border-8 rounded-3xl p-3 md:p-4 shadow-board">
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 md:grid-flow-col gap-4`}
                    style={{
                      gridTemplateRows: `repeat(${Math.ceil(
                        item.answers.length / 2
                      )}, minmax(0, 1fr))`,
                    }}
                  >
                    {(Array.isArray(item.answers) ? item.answers : []).map(
                      (answer, index) => (
                        <AnswerSlot
                          key={index}
                          number={index + 1}
                          answer={answer}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Button */}
            <div className="flex justify-center pt-4">
              <Link to="/host/add-question">
                <Button variant="gold" className="md:px-24 py-6 text-lg gap-2">
                  <PlusIcon className="w-5 h-5" />
                  Add New Question
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewQuestions;

const AnswerSlot = ({ number, answer }: { number: number; answer: Answer }) => {
  return (
    <div
      className="
        relative h-20 min-w-50 bg-gradient-primary shadow-glow-answer 
        border-4 border-primary-foreground rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between h-full px-2">
        <span
          className="game-board-font text-sm text-primary-foreground uppercase"
          style={{ whiteSpace: "pre-line" }}
        >
          {answer.text.replace(" - ", "\n")}
        </span>
        <div className="bg-gold-border text-secondary-foreground rounded-full w-8 h-8 flex items-center justify-center ms-2">
          <span className="game-board-font text-sm">{answer.points}</span>
        </div>
      </div>
    </div>
  );
};
