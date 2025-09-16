import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FamilyFeudLogo from "/family-feud-logo.png";
import { Link } from "react-router-dom";

interface TeamSetupProps {
  onEnterGame: (team1Name: string, team2Name: string) => void;
  onHostControls: (isHost: boolean) => void;
}

export const TeamSetup = ({ onEnterGame, onHostControls }: TeamSetupProps) => {
  const [team1Name, setTeam1Name] = useState("The Lightning Bolts");
  const [team2Name, setTeam2Name] = useState("The Thunder Hawks");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (team1Name.trim() && team2Name.trim()) {
      onEnterGame(team1Name.trim(), team2Name.trim());
    }
  };

  const handleHost = (e: React.FormEvent) => {
    e.preventDefault();
    onEnterGame(team1Name.trim(), team2Name.trim());
    onHostControls(true);
  };

  return (
    <div className="min-h-screen bg-gradient-bg sparkle-bg flex items-center justify-center p-4">
      <Card className="bg-gradient-board border-gold-border border-8 p-12 shadow-board max-w-2xl w-full">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <img
              src={FamilyFeudLogo}
              alt="Family Feud Logo"
              className="w-3/4 h-auto object-cover"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="team1"
                  className="text-xl text-primary-foreground"
                >
                  Team 1 Name
                </Label>
                <Input
                  id="team1"
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  className="h-12 text-lg bg-muted border-gold-border border-2"
                  placeholder="Enter team 1 name"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="team2"
                  className="text-xl text-primary-foreground"
                >
                  Team 2 Name
                </Label>
                <Input
                  id="team2"
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  className="h-12 text-lg bg-muted border-gold-border border-2"
                  placeholder="Enter team 2 name"
                  required
                />
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full h-16 text-2xl pulse-glow"
              >
                ENTER THE GAME!
              </Button>
            </div>
          </form>

          <div className="text-center text-muted-foreground space-x-3">
            <Button className="text-lg" variant="strike" onClick={handleHost}>
              Host
            </Button>

            <Link to="/add-question">
              <Button className="text-lg" variant="game">
                Add New Question
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
