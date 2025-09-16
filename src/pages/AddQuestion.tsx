import { useState } from "react";
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
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/services/supabase";

interface Answer {
  text: string;
  points: number;
}

const AddQuestion = () => {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([
    { text: "", points: 0 },
    { text: "", points: 0 },
    { text: "", points: 0 },
    { text: "", points: 0 },
  ]);
  const { toast } = useToast();

  const addAnswer = () => {
    if (answers.length < 8) {
      setAnswers([...answers, { text: "", points: 0 }]);
    }
  };

  const removeAnswer = (index: number) => {
    if (answers.length > 1) {
      setAnswers(answers.filter((_, i) => i !== index));
    }
  };

  const updateAnswer = (
    index: number,
    field: keyof Answer,
    value: string | number
  ) => {
    const updatedAnswers = answers.map((answer, i) =>
      i === index ? { ...answer, [field]: value } : answer
    );
    setAnswers(updatedAnswers);
  };

  const handleSave = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    const validAnswers = answers.filter(
      (answer) => answer.text.trim() && answer.points > 0
    );
    if (validAnswers.length < 1) {
      toast({
        title: "Error",
        description: "Please add at least one answer with points",
        variant: "destructive",
      });
      return;
    }

    const { data: questionData, error: questionError } = await supabase
      .from("questions")
      .insert({ question: question })
      .select();

    if (questionData) {
      // Sort answers by points in descending order
      const sortedAnswers = validAnswers
        .sort((a, b) => b.points - a.points)
        .map((answer) => ({
          text: answer.text.toUpperCase(),
          points: answer.points,
          revealed: false,
          question_id: questionData[0].id,
        }));

      const { data: answersData } = await supabase
        .from("answers")
        .insert(sortedAnswers)
        .select();

      if (answersData) {
        toast({
          title: "Success!",
          description: "Question added successfully",
        });
      }
    }
    // Reset form
    setQuestion("");
    setAnswers([
      { text: "", points: 0 },
      { text: "", points: 0 },
      { text: "", points: 0 },
      { text: "", points: 0 },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-bg sparkle-bg relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="mx-auto bg-gradient-board border-gold-border border-8 md:p-6 shadow-board max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Add New Question
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Question Input */}
            <div className="space-y-2">
              <Label htmlFor="question" className="text-lg font-semibold">
                Question
              </Label>
              <Input
                id="question"
                placeholder="Name something people do when they can't sleep..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="h-12 text-lg bg-muted border-gold-border border-2"
              />
            </div>

            {/* Answers Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Answers</Label>
              </div>

              <div className="grid gap-3">
                {answers.map((answer, index) => (
                  <div key={index} className="flex gap-2 md:gap-3 items-center">
                    <div className="flex-1">
                      <Input
                        placeholder={`Answer ${index + 1}`}
                        value={answer.text}
                        className="h-12 text-lg bg-muted border-gold-border border-2"
                        onChange={(e) =>
                          updateAnswer(index, "text", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="Points"
                        min="1"
                        max="100"
                        value={answer.points || ""}
                        className="h-12 text-lg bg-muted border-gold-border border-2"
                        onChange={(e) =>
                          updateAnswer(
                            index,
                            "points",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <Button
                      onClick={() => removeAnswer(index)}
                      disabled={answers.length <= 1}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                onClick={addAnswer}
                disabled={answers.length >= 8}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Answer
              </Button>
              <p className="text-sm text-muted-foreground">
                💡 Tip: Answers will be automatically sorted by points (highest
                first). Enter the most popular answers with higher point values.
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-4">
              <Button
                variant="gold"
                onClick={handleSave}
                className="px-24 py-6 text-lg gap-2"
              >
                <Save className="w-5 h-5" />
                Save Question
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddQuestion;
