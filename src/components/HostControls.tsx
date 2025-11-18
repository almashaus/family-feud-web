import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { GameQuestion } from "@/data/questions";

interface HostControlsProps {
  onGameBegin: (isGameBegin: boolean, startId?: number, endId?: number) => void;
  questions: GameQuestion[]; // Add this prop for available questions
}

export const HostControls = ({ onGameBegin, questions }: HostControlsProps) => {
  const [dialogOpen, setDialogOpen] = useState(true);
  const [startId, setStartId] = useState<number | undefined>(undefined);
  const [endId, setEndId] = useState<number | undefined>(undefined);

  const handleDialogConfirm = () => {
    if (startId && endId && startId <= endId) {
      onGameBegin(true, startId, endId);
      setDialogOpen(false);
    }
  };

  return (
    <div>
      {/* --------- Alert Dialog -------- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold mb-2">
              Select Question Range
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-1">Start Question number</label>
              <Select
                value={startId !== undefined ? startId.toString() : ""}
                onValueChange={(v) => setStartId(Number(v))}
              >
                <SelectTrigger className="bg-gradient-primary font-semibold">
                  <SelectValue placeholder="Select start ID" />
                </SelectTrigger>
                <SelectContent>
                  {questions.map((q) => (
                    <SelectItem
                      key={q.id}
                      value={q.id.toString()}
                      className="font-semibold"
                    >
                      {q.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1">End Question number</label>
              <Select
                value={endId !== undefined ? endId.toString() : ""}
                onValueChange={(v) => setEndId(Number(v))}
              >
                <SelectTrigger className="bg-gradient-primary font-semibold">
                  <SelectValue placeholder="Select end ID" />
                </SelectTrigger>
                <SelectContent>
                  {questions.map((q) => (
                    <SelectItem
                      key={q.id}
                      value={q.id.toString()}
                      className={`${startId > q.id && "hidden"} font-semibold`}
                    >
                      {q.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="game"
              disabled={!startId || !endId || startId > endId}
              onClick={handleDialogConfirm}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
