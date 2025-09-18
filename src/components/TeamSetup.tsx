import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FamilyFeudLogo from "/images/FF-logo.png";
import BonaLogo from "/images/BB-logo.png";
import LevelUpLogo from "/images/LVLUP-logo.png";
import Pattern from "/images/FF-pattern.png";
import { Link } from "react-router-dom";

interface TeamSetupProps {
  onEnterGame: (team1Name: string, team2Name: string) => void;
  onHostControls: (isHost: boolean) => void;
}

export const TeamSetup = ({ onEnterGame, onHostControls }: TeamSetupProps) => {
  const [team1Name, setTeam1Name] = useState("Heroes");
  const [team2Name, setTeam2Name] = useState("Champions");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (team1Name.trim() && team2Name.trim()) {
      onEnterGame(team1Name.trim(), team2Name.trim());
      onHostControls(true);
    }
  };

  const handleHost = (e: React.FormEvent) => {
    e.preventDefault();
    onEnterGame(team1Name.trim(), team2Name.trim());
    onHostControls(true);
  };

  return (
    <div className="min-h-screen bg-gradient-bg sparkle-bg flex items-center justify-center p-4">
      <Card className="bg-gradient-board border-gold-border border-8 px-12 pb-12 shadow-board max-w-2xl w-full">
        <div className="text-center space-y-8">
          <div className="relative flex justify-center items-center">
            {/* Pattern image as background */}
            <img
              src={Pattern}
              alt="Pattern"
              className="max-w-sm h-auto object-cover absolute top-0 left-1/2 -translate-x-1/2 z-0"
            />
            {/* Foreground images */}
            <div className="flex flex-col justify-center items-center space-y-4 mt-20 mb-8 z-10 relative">
              <img
                src={FamilyFeudLogo}
                alt="Family Feud Logo"
                className="min-w-sm md:max-w-sm h-auto object-cover"
              />

              <div className="flex flex-row justify-center items-center space-x-4">
                <img
                  src={LevelUpLogo}
                  alt="Level Up Logo"
                  className="w-36 object-cover mt-5"
                />
                <img
                  src={BonaLogo}
                  alt="Bona Banana Logo"
                  className="w-24 object-cover "
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex flex-col gap-4 pt-3">
              <div>
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full h-16 text-2xl pulse-glow"
                >
                  ENTER THE GAME!
                </Button>
              </div>
              <div>
                <Link to="/view-questions">
                  <Button className="text-lg" variant="game">
                    Host
                  </Button>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
